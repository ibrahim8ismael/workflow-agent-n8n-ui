"use client";

import { AssistantRuntimeProvider, useLocalRuntime } from "@assistant-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Thread } from "@/components/assistant-ui/thread";
import { ChatContext, type EffortLevel } from "@/lib/chat-context";
import { getJaafarAgent } from "@/lib/api/agents";
import { createConversation, getConversation, listConversationMessages } from "@/lib/api/conversations";
import { approveRun, createRun, streamRun } from "@/lib/api/runs";
import { useAuthStore } from "@/stores/auth-store";
import type { Conversation, Message } from "@/lib/api/types";
import { Button } from "@/components/ui/button";

type PendingApproval = {
	runId: string;
	blueprintRevision?: string;
	name: string;
	summary: string;
	status?: string;
	goal?: string;
	triggerType?: string;
	stepCount?: number;
};

function getPendingApprovalFromPlan(runId: string, plan: unknown): PendingApproval | null {
	if (!plan || typeof plan !== "object") return null;
	const p = plan as Record<string, unknown>;
	// Blueprint-shaped plan (automation)
	const bp = (p.blueprint as Record<string, unknown> | undefined) ?? p;
	const name = typeof bp.name === "string" ? bp.name : typeof p.name === "string" ? p.name : "New Automation";
	const summary = typeof bp.summary === "string" ? bp.summary : typeof bp.goal === "string" ? bp.goal : typeof p.summary === "string" ? p.summary : typeof p.description === "string" ? p.description : "";
	const goal = typeof bp.goal === "string" ? bp.goal : undefined;
	const blueprintRevision = typeof p.blueprintRevision === "string" ? p.blueprintRevision : typeof bp.blueprintRevision === "string" ? bp.blueprintRevision : undefined;
	const triggerType = (bp.trigger as { type?: string } | undefined)?.type;
	const stepCount = Array.isArray(bp.steps) ? bp.steps.length : undefined;
	const isReady = p.ready === true || bp.ready === true || p.status === "READY_FOR_REVIEW" || p.approvalStatus === "READY" || bp.status === "READY_FOR_REVIEW";

	if (isReady && runId) {
		return {
			runId,
			blueprintRevision,
			name,
			summary: summary || goal || "Ready to provision in your n8n.",
			status: "READY_FOR_REVIEW",
			goal,
			triggerType,
			stepCount,
		};
	}
	return null;
}

/** Backend confirm rejections that mean the card itself is stale. */
function isUnconfirmableMessage(message: string): boolean {
	return (
		message.includes("no longer waiting") ||
		message.includes("not an automation design") ||
		message.includes("cannot be confirmed") ||
		message.includes("already being processed") ||
		message.includes("already finished")
	);
}

function toInitialMessage(message: Message) {
	return {
		id: message.id,
		role: message.role === "assistant" ? "assistant" as const : "user" as const,
		content: [{ type: "text" as const, text: message.content }],
	};
}

export function ChatPage({ conversationId: initialConversationId }: { conversationId?: string }) {
	const router = useRouter();
	const user = useAuthStore((state) => state.user);
	const [conversation, setConversation] = useState<Conversation | null>(null);
	const [agentId, setAgentId] = useState<string | null>(null);
	const [messages, setMessages] = useState<Message[]>([]);
	const [effortLevel, setEffortLevel] = useState<EffortLevel>("Medium");
	const [error, setError] = useState<string | null>(null);
	const [pendingApproval, setPendingApproval] = useState<PendingApproval | null>(null);
	const [isConfirming, setIsConfirming] = useState(false);
	const [createdSuccess, setCreatedSuccess] = useState<string | null>(null);
	const conversationIdRef = useRef(initialConversationId ?? null);

	useEffect(() => {
		conversationIdRef.current = initialConversationId ?? null;
	}, [initialConversationId]);

	useEffect(() => {
		if (!initialConversationId) return;
		let cancelled = false;
		(async () => {
			try {
				const [loadedConversation, loadedMessages] = await Promise.all([
					getConversation(initialConversationId),
					listConversationMessages(initialConversationId, { take: 100 }),
				]);
				if (!cancelled) {
					setConversation(loadedConversation);
					setAgentId(loadedConversation.agentId);
					setMessages(loadedMessages);
					// Approval cards are event-driven (approval.required carries
					// the card fields) — legacy design-session metadata and
					// prose scraping are retired and can never fire. A reload
					// mid-approval shows no card, but a decisive chat reply
					// ("ok") still resumes the parked run backend-side.
				}
			} catch (err) {
				if (!cancelled) setError(err instanceof Error ? err.message : "Could not load this chat.");
			}
		})();
		return () => { cancelled = true; };
	}, [initialConversationId]);

	const initialMessages = useMemo(() => messages.map(toInitialMessage), [messages]);
	const effortRef = useRef(effortLevel);
	const agentIdRef = useRef(agentId);
	useEffect(() => {
		effortRef.current = effortLevel;
	}, [effortLevel]);
	useEffect(() => {
		agentIdRef.current = agentId;
	}, [agentId]);

	const checkConversationApproval = async (convId: string, lastRunId?: string) => {
		try {
			const [updatedConv, updatedMessages] = await Promise.all([
				getConversation(convId),
				listConversationMessages(convId, { take: 100 }),
			]);
			setConversation(updatedConv);
			setMessages(updatedMessages);
			// Event-driven cards only (see approval.required branch below):
			// never derive approvals from conversation metadata or prose —
			// those legacy paths fabricated cards for runs that could never
			// be confirmed. lastRunId is kept for future run-scoped refresh.
			void lastRunId;
		} catch {
			// ignore polling error
		}
	};

	const runtime = useLocalRuntime({
		async *run({ messages: threadMessages, abortSignal }) {
			const lastMessage = threadMessages[threadMessages.length - 1];
			const prompt = lastMessage?.content[0]?.type === "text" ? lastMessage.content[0].text : "";
			let createdConversationId: string | null = null;
			try {
				let activeAgentId = agentIdRef.current;
				if (!activeAgentId) {
					const jaafar = await getJaafarAgent();
					activeAgentId = jaafar.id;
					agentIdRef.current = activeAgentId;
					setAgentId(activeAgentId);
				}
				let activeConversationId = conversationIdRef.current;
				if (!activeConversationId) {
					const createdConversation = await createConversation({
						agentId: activeAgentId,
						title: prompt.slice(0, 100) || "New chat",
						userId: user?.id,
					});
					activeConversationId = createdConversation.id;
					createdConversationId = activeConversationId;
					conversationIdRef.current = activeConversationId;
					setConversation(createdConversation);
				}
				const effort = effortRef.current === "Low" ? "low" : effortRef.current === "Max Effort" ? "high" : "medium";

				let streamedTokens = "";
				let receivedAnyToken = false;
				let lastRunId: string | null = null;

				try {
					for await (const event of streamRun({
						agentId: activeAgentId,
						conversationId: activeConversationId,
						userMessage: prompt,
						mode: "conversation",
						effort,
					}, { signal: abortSignal })) {
						if (abortSignal.aborted) return;
						if (event.runId) lastRunId = event.runId;

						if (event.type === "token") {
							const chunk = event.content ?? event.payload?.content ?? "";
							streamedTokens += chunk;
							receivedAnyToken = true;
							yield { content: [{ type: "text", text: streamedTokens }] };
						} else if (event.type === "run.completed") {
							const finalResponse = event.response ?? event.payload?.response ?? streamedTokens;
							if (finalResponse) {
								yield { content: [{ type: "text", text: finalResponse }] };
							}
						} else if (event.type === "run.failed") {
							// The backend surfaces design-stage failures as run.failed
							// with a humanized message. Surface it — otherwise a
							// failed run leaves a partial/empty bubble with no error.
							const failureMessage = event.message ?? event.payload?.error?.message;
							if (failureMessage) {
								yield { content: [{ type: "text", text: failureMessage }] };
							}
						} else if (event.type === "approval.required") {
							// Event-driven approval card: the backend carries the
							// blueprint card fields on this event, so the button
							// appears mid-stream with no metadata scraping.
							const payload = event.payload;
							if (event.runId && payload) {
								setPendingApproval({
									runId: event.runId,
									blueprintRevision: payload.blueprintRevision,
									name: payload.blueprintName ?? "New Automation",
									summary: payload.summary ?? payload.blueprintGoal ?? "Ready to provision in your n8n.",
									status: "READY_FOR_REVIEW",
									goal: payload.blueprintGoal,
									triggerType: payload.triggerType,
									stepCount: payload.stepCount,
								});
							}
							if (activeConversationId) {
								await checkConversationApproval(activeConversationId, lastRunId ?? undefined);
							}
						} else if (event.type === "run.waiting") {
							if (activeConversationId) {
								await checkConversationApproval(activeConversationId, lastRunId ?? undefined);
							}
						}
					}
				// Check if conversation now has an approved/ready blueprint
				if (activeConversationId) {
					await checkConversationApproval(activeConversationId, lastRunId ?? undefined);
				}
				} catch {
					// If streaming encountered an issue or is unsupported, fallback to createRun
					if (!receivedAnyToken) {
						const result = await createRun({
							agentId: activeAgentId,
							conversationId: activeConversationId,
							userMessage: prompt,
							mode: "conversation",
							effort,
						});
						if (abortSignal.aborted) return;
						const pending = getPendingApprovalFromPlan(result.runId, result.plan);
						if (pending) setPendingApproval(pending);
						else if (activeConversationId) await checkConversationApproval(activeConversationId);
						yield { content: [{ type: "text", text: result.response }] };
					}
				}
			} catch (err) {
				yield { content: [{ type: "text", text: err instanceof Error ? err.message : "Could not send this message." }] };
			}
			if (createdConversationId) router.replace(`/new/${createdConversationId}`);
		},
	}, { initialMessages });

	const handleConfirm = async () => {
		if (!pendingApproval) return;
		if (!pendingApproval.runId) {
			setError("No design session to confirm — describe the automation again and Jaafar will prepare a design.");
			return;
		}
		setIsConfirming(true);
		setError(null);
		try {
			const idToConfirm = pendingApproval.runId;
			// Approvals go through the live approve endpoint (the legacy
			// design-confirm endpoint was retired backend-side).
			const result = await approveRun(idToConfirm);
			if (result.status === "COMPLETED") {
				setPendingApproval(null);
				setCreatedSuccess(`🎉 ${pendingApproval.name} is now ACTIVE in your n8n — ready to run.`);
				if (conversationIdRef.current) {
					await checkConversationApproval(conversationIdRef.current);
				}
			} else {
				const message = result.response || "Could not provision the automation.";
				setError(message);
				// The backend rejected the confirm (stale/not-approvable design).
				// Drop the card and re-sync from the conversation so a stale
				// approval doesn't keep inviting clicks that can never succeed.
				await refreshApprovalState();
			}
		} catch (err) {
			const message = err instanceof Error ? err.message : "Could not confirm the automation.";
			setError(message);
			if (isUnconfirmableMessage(message)) {
				await refreshApprovalState();
			}
		} finally {
			setIsConfirming(false);
		}
	};

	/** Re-pulls conversation state; clears a stale card only when the run resolved. */
	const refreshApprovalState = async () => {
		const convId = conversationIdRef.current;
		if (!convId) return;
		try {
			const [updatedConv, updatedMessages] = await Promise.all([
				getConversation(convId),
				listConversationMessages(convId, { take: 100 }),
			]);
			setConversation(updatedConv);
			setMessages(updatedMessages);
			// No metadata/prose approval derivation (retired): a stale card is
			// cleared only by an explicit confirm result or a fresh event.
		} catch {
			// keep the current card on refresh failure
		}
	};

	if (error) return <div className="flex h-full items-center justify-center p-6 text-sm text-destructive">{error}</div>;
	if (initialConversationId && !conversation) return <div className="flex h-full items-center justify-center p-6 text-sm text-muted-foreground">Loading chat...</div>;

	return (
		<div className="flex h-full w-full flex-col overflow-hidden bg-background">
			<ChatContext.Provider
				value={{
					effortLevel,
					setEffortLevel,
					pendingApproval,
					isConfirming,
					onConfirmApproval: handleConfirm,
					createdSuccess,
					onDismissSuccess: () => setCreatedSuccess(null),
				}}
			>
				<AssistantRuntimeProvider runtime={runtime}>
					<Thread />
				</AssistantRuntimeProvider>
			</ChatContext.Provider>
		</div>
	);
}
