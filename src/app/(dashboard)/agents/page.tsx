"use client";
import { useState } from "react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import CustomButton from "@/components/shared/Button";


import Link from "next/link";
import { MOCK_AGENTS } from "@/lib/mock-data";

export default function AgentsPage() {
	const [agents] = useState(MOCK_AGENTS);
	return (
		<div className="flex flex-col gap-6">
			{/* Page Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Your Workforce</h1>
					<p className="text-muted-foreground mt-1">Manage and assign tasks to your AI employees.</p>
				</div>
			</div>

			{/* Agents Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-2">
				{agents.map((agent) => (
					<Card key={agent.id} className="overflow-hidden border-border/50 bg-card/40 hover:bg-card hover:shadow-sm transition-all duration-300 flex flex-col group">
						{/* Clickable Area */}
						<Link href={`/agent/${agent.id}`} className="p-5 flex-1 flex flex-col">
							<div className="flex items-start justify-between mb-4">
								<Avatar className="h-12 w-12 border border-border shadow-sm">
									<AvatarFallback className={`text-white text-lg font-semibold ${agent.color}`}>
										{agent.avatar}
									</AvatarFallback>
								</Avatar>
								<Badge variant={agent.status === "Active" ? "default" : "secondary"} className={`font-medium ${agent.status === "Active" ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-transparent" : "bg-muted text-muted-foreground hover:bg-muted/80 border-transparent"}`}>
									{agent.status}
								</Badge>
							</div>
							
							<div className="flex flex-col mb-2">
								<span className="font-semibold text-lg text-foreground truncate">{agent.name}</span>
								<span className="text-sm font-medium text-primary truncate mb-3">{agent.role}</span>
								<p className="text-sm text-muted-foreground line-clamp-3">{agent.description}</p>
							</div>

							<div className="mt-auto pt-4 flex items-center text-xs text-muted-foreground">
								<span className="truncate">{agent.stats}</span>
							</div>
						</Link>

						<div className="bg-muted/30 px-5 py-3 border-t border-border/40 flex items-center">
							<CustomButton href={`/agent/${agent.id}`} size="sm" className="w-full justify-center py-1.5 text-xs shadow-sm" showArrow={false}>
								View
							</CustomButton>
						</div>
					</Card>
				))}
			</div>
		</div>
	);
}
