"use client";

import { AssistantRuntimeProvider, useLocalRuntime } from "@assistant-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Thread } from "@/components/assistant-ui/thread";
import { ChatContext, type EffortLevel } from "@/lib/chat-context";
import { getJaafarAgent } from "@/lib/api/agents";
import { createConversation, getConversation, listConversationMessages } from "@/lib/api/conversations";
import { confirmEmployeeDesign, createRun, streamRun } from "@/lib/api/runs";
import { useAuthStore } from "@/stores/auth-store";
import type { Conversation, Message } from "@/lib/api/types";
import { Button } from "@/components/ui/button";

type PendingApproval = {
	runId: string;
	blueprintRevision: string;
	name: string;
	summary: string;
};

function getPendingApproval(run: { runId: string; plan?: unknown }): PendingApproval | null {
	if (!run.plan || typeof run.plan !== "object") return null;
	const plan = run.plan as Record<string, unknown>;
	if (plan.ready !== true || typeof plan.blueprintRevision !== "string") return null;
	if (typeof plan.name !== "string" || typeof plan.summary !== "string") return null;
	return {
		runId: run.runId,
		blueprintRevision: plan.blueprintRevision,
		name: plan.name,
		summary: plan.summary,
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
				try {
					for await (const event of streamRun({
						agentId: activeAgentId,
						conversationId: activeConversationId,
						userMessage: prompt,
						mode: "conversation",
						effort,
					}, { signal: abortSignal })) {
						if (abortSignal.aborted) return;
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
						setPendingApproval(getPendingApproval(result));
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
		try {
			const result = await confirmEmployeeDesign(pendingApproval.runId, {
				confirm: true,
				blueprintRevision: pendingApproval.blueprintRevision,
			});
			if (result.status === "COMPLETED") setPendingApproval(null);
			else setError(result.response || "Could not create the employee draft.");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not confirm the employee draft.");
		} finally {
			setIsConfirming(false);
		}
	};

	if (error) return <div className="flex h-full items-center justify-center p-6 text-sm text-destructive">{error}</div>;
	if (initialConversationId && !conversation) return <div className="flex h-full items-center justify-center p-6 text-sm text-muted-foreground">Loading chat...</div>;

	return (
		<div className="flex h-full w-full flex-col overflow-hidden bg-background">
			{pendingApproval && (
				<div className="border-b bg-muted/30 px-4 py-3">
					<div className="mx-auto flex max-w-(--thread-max-width) items-center justify-between gap-4">
						<div className="min-w-0">
							<p className="text-sm font-semibold">Review {pendingApproval.name}</p>
							<p className="truncate text-sm text-muted-foreground">{pendingApproval.summary}</p>
						</div>
						<Button onClick={handleConfirm} disabled={isConfirming} size="sm">
							{isConfirming ? "Creating..." : "Approve and create draft"}
						</Button>
					</div>
				</div>
			)}
			<ChatContext.Provider value={{ effortLevel, setEffortLevel }}>
				<AssistantRuntimeProvider runtime={runtime}><Thread /></AssistantRuntimeProvider>
			</ChatContext.Provider>
		</div>
	);
}
