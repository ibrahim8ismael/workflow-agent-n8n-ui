"use client";

import React, { useState, useContext } from "react";
import { useLocalRuntime, AssistantRuntimeProvider } from "@assistant-ui/react";
import { Thread } from "@/components/assistant-ui/thread";
import { ChatContext, type ChatMode, type EffortLevel } from "@/lib/chat-context";

export default function NewChatPage() {
	const [activeMode, setActiveMode] = useState<ChatMode>("Plan");
	const [effortLevel, setEffortLevel] = useState<EffortLevel>("Medium");

	const runtime = useLocalRuntime({
		async *run({ messages }) {
			const lastMessage = messages[messages.length - 1];
			const prompt = lastMessage.content[0]?.type === "text" ? lastMessage.content[0].text : "";

			yield {
				content: [{ type: "text", text: "..." }],
			};

			// Simulate processing delay
			await new Promise((resolve) => setTimeout(resolve, 800));

			let aiResponse = "";
			if (activeMode === "Ask") {
				aiResponse = `Great question about **"${prompt}"**.\n\nWoops AI Employees are autonomous digital workers that can:\n- Handle customer communications across channels (WhatsApp, Email, Slack)\n- Access company knowledge bases to answer accurately\n- Escalate intelligently when human intervention is needed\n- Learn from interactions via persistent memory\n\nWould you like me to plan a specific employee for your use case?`;
			} else if (activeMode === "Plan") {
				aiResponse = `### Blueprint: ${prompt}\n\n**Role Overview**\nA fully autonomous AI employee configured to handle your described use case end-to-end.\n\n**Core Responsibilities**\n- Receive and respond to inbound requests across configured channels\n- Query knowledge base and CRM for relevant context\n- Escalate edge cases based on defined rules\n- Log all interactions to memory for continuous improvement\n\n**Required Integrations**\n- Communication: WhatsApp Business, Email (Gmail/Outlook)\n- Data: CRM (HubSpot / Salesforce), Internal KB\n- Notifications: Slack (internal alerts)\n\n**Estimated Setup Time**: ~15 minutes\n\nReady to proceed to implementation?`;
			} else {
				aiResponse = `### Build Started ⚡\n\n**Task**: ${prompt}\n\n**Steps Initialized**\n- Provisioning AI Employee runtime environment...\n- Configuring channel connectors...\n- Injecting knowledge sources and memory store...\n- Setting escalation and fallback rules...\n\n**Status**: Awaiting your approval to go live.\n\nAll configurations can be reviewed and modified in the Employee Dashboard before activation.`;
			}

			// Simulate token streaming
			let streamed = "";
			const words = aiResponse.split(" ");
			for (const word of words) {
				streamed += word + " ";
				yield {
					content: [{ type: "text", text: streamed }],
				};
				await new Promise((resolve) => setTimeout(resolve, 40));
			}
		},
	});

	return (
		<div dir="ltr" className="flex flex-col h-[calc(100vh-theme(spacing.14))] md:h-[calc(100vh-theme(spacing.16))] w-full overflow-hidden bg-background">
			<ChatContext.Provider value={{ activeMode, setActiveMode, effortLevel, setEffortLevel }}>
				<AssistantRuntimeProvider runtime={runtime}>
					<Thread />
				</AssistantRuntimeProvider>
			</ChatContext.Provider>
		</div>
	);
}
