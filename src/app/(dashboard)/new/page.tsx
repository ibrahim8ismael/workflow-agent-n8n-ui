"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { listAgents } from "@/lib/api/agents";
import { createConversation } from "@/lib/api/conversations";
import { useAuthStore } from "@/stores/auth-store";

export default function NewChatPage() {
	const router = useRouter();
	const user = useAuthStore((state) => state.user);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const configuredAgentId = process.env.NEXT_PUBLIC_CHAT_AGENT_ID;
				const agentId = configuredAgentId ?? (await listAgents({ take: 50 })).find((agent) => agent.status !== "ARCHIVED")?.id;
				if (!agentId) throw new Error("Create or configure an agent before starting a chat.");
				const conversation = await createConversation({ agentId, title: "New chat", userId: user?.id });
				if (!cancelled) router.replace(`/new/${conversation.id}`);
			} catch (err) {
				if (!cancelled) setError(err instanceof Error ? err.message : "Could not start a new chat.");
			}
		})();
		return () => { cancelled = true; };
	}, [router, user?.id]);

	return <div className="flex h-full items-center justify-center p-6 text-sm text-muted-foreground">{error ?? "Starting a new chat..."}</div>;
}
