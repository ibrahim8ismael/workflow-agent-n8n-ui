"use client";

import React, { useEffect, useRef, useState } from "react";
import { useLocalRuntime, AssistantRuntimeProvider } from "@assistant-ui/react";
import { Thread } from "@/components/assistant-ui/thread";
import { ChatContext, type EffortLevel } from "@/lib/chat-context";
import { createAgent } from "@/lib/api/agents";
import { streamRun } from "@/lib/api/runs";
import { createConversation } from "@/lib/api/conversations";

export default function NewChatPage() {
	const [effortLevel, setEffortLevel] = useState<EffortLevel>("Medium");
	const effortLevelRef = useRef<EffortLevel>(effortLevel);
	const agentIdRef = useRef<string | null>(null);
	const conversationIdRef = useRef<string | null>(null);

	useEffect(() => {
		effortLevelRef.current = effortLevel;
	}, [effortLevel]);

	const runtime = useLocalRuntime({
		async *run({ messages, abortSignal }) {
			const lastMessage = messages[messages.length - 1];
			const prompt = lastMessage.content[0]?.type === "text" ? lastMessage.content[0].text : "";

			yield {
				content: [{ type: "text", text: "..." }],
			};

			try {
				const currentEffort = effortLevelRef.current;
				const contextPrompt = `[Effort: ${currentEffort}]\n\n${prompt}`;
				if (!agentIdRef.current) {
					const agent = await createAgent({
						name: "New Employee",
						description: prompt,
						instructions: contextPrompt,
					});
					agentIdRef.current = agent.id;
					const conversation = await createConversation({
						agentId: agent.id,
						title: prompt.slice(0, 100),
					});
					conversationIdRef.current = conversation.id;
				}
				const agentId = agentIdRef.current;
				if (!agentId) throw new Error("Failed to create employee");

				let responseText = "";
				for await (const event of streamRun({
					agentId,
					userMessage: contextPrompt,
					mode: "conversation",
					conversationId: conversationIdRef.current ?? undefined,
					effort:
						currentEffort === "Low"
							? "low"
							: currentEffort === "Max Effort"
								? "high"
								: "medium",
				}, { signal: abortSignal })) {
					if (event.type === "token") {
						responseText += event.content;
						yield { content: [{ type: "text", text: responseText }] };
					} else if (event.type === "run.completed") {
						if (event.response !== responseText) {
							yield { content: [{ type: "text", text: event.response }] };
						}
					} else if (event.type === "run.failed") {
						throw new Error(event.message);
					}
				}
			} catch (error) {
				console.error("Failed to execute run:", error);
				yield {
					content: [{ type: "text", text: "Sorry, there was an error communicating with the backend. Please ensure the backend is running." }],
				};
			}
		},
	});

	return (
		<div dir="ltr" className="flex flex-col h-[calc(100vh-theme(spacing.14))] md:h-[calc(100vh-theme(spacing.16))] w-full overflow-hidden bg-background">
			<ChatContext.Provider value={{ effortLevel, setEffortLevel }}>
				<AssistantRuntimeProvider runtime={runtime}>
					<Thread />
				</AssistantRuntimeProvider>
			</ChatContext.Provider>
		</div>
	);
}
