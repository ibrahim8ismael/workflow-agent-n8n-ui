"use client";

import { AssistantRuntimeProvider, useLocalRuntime } from "@assistant-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Thread } from "@/components/assistant-ui/thread";
import { ChatContext, type EffortLevel } from "@/lib/chat-context";
import { getJaafarAgent } from "@/lib/api/agents";
import { createConversation, getConversation, listConversationMessages } from "@/lib/api/conversations";
import { confirmAutomationDesign, createRun, streamRun } from "@/lib/api/runs";
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

function getPendingApprovalFromConversation(conv: Conversation | null, defaultRunId?: string): PendingApproval | null {
	if (!conv || !conv.metadata || typeof conv.metadata !== "object") return null;
	const meta = conv.metadata as Record<string, unknown>;
	// Prefer automationDesign, fallback to employeeDesign for back-compat
	const design = (meta.automationDesign as Record<string, unknown> | undefined) ?? (meta.employeeDesign as Record<string, unknown> | undefined);
	if (!design || typeof design !== "object") return null;

	const status = design.status as string | undefined;
	const approvalStatus = design.approvalStatus as string | undefined;
	if (status !== "READY_FOR_REVIEW" && approvalStatus !== "READY" && !design.blueprint) return null;

	const bp = (design.blueprint as Record<string, unknown> | undefined) ?? {};
	const runId = (design.sourceDesignRunId as string | undefined) ?? (design.runId as string | undefined) ?? defaultRunId ?? conv.id;

	const name = typeof bp.name === "string" ? bp.name : "New Automation";
	const summary = typeof bp.summary === "string" ? bp.summary : typeof bp.goal === "string" ? bp.goal : typeof bp.description === "string" ? bp.description : "";
	const goal = typeof bp.goal === "string" ? bp.goal : undefined;
	const triggerType = (bp.trigger as { type?: string } | undefined)?.type;
	const stepCount = Array.isArray(bp.steps) ? bp.steps.length : undefined;
	const blueprintRevision = typeof design.blueprintRevision === "string" ? design.blueprintRevision : typeof bp.blueprintRevision === "string" ? bp.blueprintRevision : undefined;

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

function getPendingApprovalFromMessages(messages: Message[], fallbackRunId?: string): PendingApproval | null {
	if (!messages || messages.length === 0) return null;
	const recentAssistant = [...messages].reverse().find((m) => m.role === "assistant" && (
		m.content.includes("blueprint is complete") ||
		m.content.includes("The blueprint is complete") ||
		m.content.includes("blueprint is ready") ||
		m.content.includes("automation is ready") ||
		m.content.includes("Automation blueprint") ||
		m.content.includes("Start Process") ||
		m.content.includes("Approve & Provision") ||
		(m.content.includes("Goal:") && m.content.includes("Trigger:"))
	));

	if (!recentAssistant) return null;
	const text = recentAssistant.content;

	const nameMatch = text.match(/\*\*([A-Za-z0-9_\-\s]+)\*\*\s*(?:—|-|\n)/) || text.match(/blueprint(?:\s+is\s+complete)?[:\s]+(?:\*\*)?([A-Za-z0-9_\-]+)/i) || text.match(/(?:automation|employee|name)[:\s]+\*\*?([A-Za-z0-9_\-]+)\*?/i);
	const name = nameMatch ? nameMatch[1].trim() : "New Automation";

	const goalMatch = text.match(/(?:Goal)[:\s]+\*?([^\n\*\-]+)/i);
	const goal = goalMatch ? goalMatch[1].trim() : "Automation ready for your n8n";

	return {
		runId: fallbackRunId || recentAssistant.id,
		name,
		summary: `${name} — ${goal}`,
		goal,
		status: "READY_FOR_REVIEW",
	};
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
					const pending =
						getPendingApprovalFromConversation(loadedConversation) ||
						getPendingApprovalFromMessages(loadedMessages, loadedConversation.id);
					if (pending) setPendingApproval(pending);
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
			const pending =
				getPendingApprovalFromConversation(updatedConv, lastRunId) ||
				getPendingApprovalFromMessages(updatedMessages, lastRunId || convId);
			setPendingApproval(pending);
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
						}
					}
					// Check if conversation now has an approved/ready blueprint
					if (activeConversationId) {
						await checkConversationApproval(activeConversationId);
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
		setIsConfirming(true);
		setError(null);
		try {
			const idToConfirm = pendingApproval.runId || conversationIdRef.current || "";
			const result = await confirmAutomationDesign(idToConfirm, {
				confirm: true,
				...(pendingApproval.blueprintRevision ? { blueprintRevision: pendingApproval.blueprintRevision } : {}),
			});
			if (result.status === "COMPLETED" || (result as unknown as { status?: string }).status === "COMPLETED") {
				setPendingApproval(null);
				setCreatedSuccess(`🎉 ${pendingApproval.name} is now ACTIVE in your n8n — ready to run.`);
				if (conversationIdRef.current) {
					await checkConversationApproval(conversationIdRef.current);
				}
			} else {
				setError(result.response || "Could not provision the automation.");
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not confirm the automation.");
		} finally {
			setIsConfirming(false);
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
