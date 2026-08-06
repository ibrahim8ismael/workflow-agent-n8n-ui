"use client";

import { AssistantRuntimeProvider, useLocalRuntime } from "@assistant-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Thread } from "@/components/assistant-ui/thread";
import { ChatContext, type EffortLevel } from "@/lib/chat-context";
import { getConversation, listConversationMessages } from "@/lib/api/conversations";
import { streamRun } from "@/lib/api/runs";
import type { Conversation, Message } from "@/lib/api/types";

function toInitialMessage(message: Message) {
	return {
		id: message.id,
		role: message.role === "assistant" ? "assistant" as const : "user" as const,
		content: [{ type: "text" as const, text: message.content }],
	};
}

export function ChatPage({ conversationId }: { conversationId: string }) {
	const [conversation, setConversation] = useState<Conversation | null>(null);
	const [messages, setMessages] = useState<Message[]>([]);
	const [effortLevel, setEffortLevel] = useState<EffortLevel>("Medium");
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const [loadedConversation, loadedMessages] = await Promise.all([
					getConversation(conversationId),
					listConversationMessages(conversationId, { take: 100 }),
				]);
				if (!cancelled) {
					setConversation(loadedConversation);
					setMessages(loadedMessages);
				}
			} catch (err) {
				if (!cancelled) setError(err instanceof Error ? err.message : "Could not load this chat.");
			}
		})();
		return () => { cancelled = true; };
	}, [conversationId]);

	const initialMessages = useMemo(() => messages.map(toInitialMessage), [messages]);
	const effortRef = useRef(effortLevel);
	useEffect(() => {
		effortRef.current = effortLevel;
	}, [effortLevel]);

	const runtime = useLocalRuntime({
		async *run({ messages: threadMessages, abortSignal }) {
			const lastMessage = threadMessages[threadMessages.length - 1];
			const prompt = lastMessage?.content[0]?.type === "text" ? lastMessage.content[0].text : "";
			let responseText = "";
			for await (const event of streamRun({
				agentId: conversation?.agentId ?? "",
				conversationId,
				userMessage: prompt,
				mode: "conversation",
				effort: effortRef.current === "Low" ? "low" : effortRef.current === "Max Effort" ? "high" : "medium",
			}, { signal: abortSignal })) {
				if (event.type === "token") {
					responseText += event.content;
					yield { content: [{ type: "text", text: responseText }] };
				} else if (event.type === "run.completed" && event.response !== responseText) {
					yield { content: [{ type: "text", text: event.response }] };
				} else if (event.type === "run.failed") {
					throw new Error(event.message);
				}
			}
		},
	}, { initialMessages });

	if (error) return <div className="flex h-full items-center justify-center p-6 text-sm text-destructive">{error}</div>;
	if (!conversation) return <div className="flex h-full items-center justify-center p-6 text-sm text-muted-foreground">Loading chat...</div>;

	return (
		<div dir="ltr" className="flex h-full w-full flex-col overflow-hidden bg-background">
			<ChatContext.Provider value={{ effortLevel, setEffortLevel }}>
				<AssistantRuntimeProvider runtime={runtime}><Thread /></AssistantRuntimeProvider>
			</ChatContext.Provider>
		</div>
	);
}
