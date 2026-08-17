"use client";

import * as React from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Skill } from "@/lib/api/types";
import {
	CheckCircle2Icon,
	Code2Icon,
	CopyIcon,
	CpuIcon,
	ExternalLinkIcon,
	LayersIcon,
	LockIcon,
	PlayIcon,
	RefreshCwIcon,
	ShieldCheckIcon,
	WorkflowIcon,
	ZapIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowViewerDialogProps {
	skill: Skill | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

type TabMode = "flow" | "schemas" | "execution";

export function WorkflowViewerDialog({
	skill,
	open,
	onOpenChange,
}: WorkflowViewerDialogProps) {
	const [activeTab, setActiveTab] = React.useState<TabMode>("flow");
	const [copiedSchema, setCopiedSchema] = React.useState<string | null>(null);

	if (!skill) return null;

	const metadata = (skill.metadata ?? {}) as Record<string, unknown>;
	const requiredIntegrations = Array.isArray(metadata.requiredIntegrations)
		? (metadata.requiredIntegrations as string[])
		: [];
	const retryPolicy = (skill.retryPolicy ?? {}) as Record<string, unknown>;
	const maxAttempts = Number(retryPolicy.maxAttempts ?? 1);
	const isWorkflow = skill.executionMode === "N8N_WORKFLOW";

	const copyToClipboard = (text: string, label: string) => {
		navigator.clipboard.writeText(text);
		setCopiedSchema(label);
		setTimeout(() => setCopiedSchema(null), 2000);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl max-h-[88vh] overflow-hidden flex flex-col p-0 bg-card border-border/60 shadow-2xl">
				{/* Dialog Header */}
				<div className="p-6 border-b border-border/40 bg-muted/15">
					<div className="flex items-start justify-between gap-4">
						<div className="flex items-center gap-3.5">
							<div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center p-2 text-primary shrink-0">
								<WorkflowIcon className="w-6 h-6" />
							</div>
							<div>
								<div className="flex items-center gap-2.5 flex-wrap">
									<h2 className="text-xl font-bold text-foreground tracking-tight">
										{skill.name}
									</h2>
									<Badge
										variant={isWorkflow ? "default" : "secondary"}
										className="text-xs font-semibold uppercase tracking-wider"
									>
										{skill.executionMode === "N8N_WORKFLOW" ? "Workflow Automation" : skill.executionMode}
									</Badge>
									<span className="text-xs text-muted-foreground font-mono bg-muted/40 px-2 py-0.5 rounded border border-border/30">
										v{Number(metadata.version ?? 1)}
									</span>
								</div>
								<p className="text-sm text-muted-foreground mt-1">
									{skill.description || "Business capability workflow definition."}
								</p>
							</div>
						</div>
					</div>

					{/* Navigation Tabs */}
					<div className="flex items-center gap-2 mt-6 border-b border-border/30 -mb-6">
						{[
							{ id: "flow", label: "Workflow Pipeline", icon: LayersIcon },
							{ id: "schemas", label: "I/O Schemas", icon: Code2Icon },
							{ id: "execution", label: "Execution Policy", icon: ShieldCheckIcon },
						].map((tab) => {
							const Icon = tab.icon;
							return (
								<button
									key={tab.id}
									onClick={() => setActiveTab(tab.id as TabMode)}
									className={cn(
										"flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors relative",
										activeTab === tab.id
											? "text-foreground font-semibold"
											: "text-muted-foreground hover:text-foreground"
									)}
								>
									<Icon className="w-4 h-4" />
									{tab.label}
									{activeTab === tab.id && (
										<span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary rounded-t-full" />
									)}
								</button>
							);
						})}
					</div>
				</div>

				{/* Dialog Body */}
				<div className="p-6 overflow-y-auto flex-1 space-y-6">
					{/* Flowchart Tab */}
					{activeTab === "flow" && (
						<div className="space-y-6 animate-in fade-in duration-200">
							<div className="bg-muted/10 border border-border/50 rounded-2xl p-6">
								<div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center justify-between">
									<span>Execution Pipeline (Agent Engine ↔ Workflow Engine)</span>
									<span className="text-[11px] text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium">
										Deterministic & Idempotent
									</span>
								</div>

								{/* Visual Pipeline Nodes */}
								<div className="relative flex flex-col md:flex-row items-stretch gap-4 justify-between">
									{/* Step 1: Trigger & Planner */}
									<div className="flex-1 rounded-xl border border-border/60 bg-card p-4 shadow-sm flex flex-col relative group hover:border-primary/50 transition-colors">
										<div className="flex items-center gap-2 text-xs font-semibold text-primary mb-2">
											<PlayIcon className="w-4 h-4 text-primary" />
											<span>1. Intent & Input</span>
										</div>
										<p className="text-xs text-foreground font-medium">
											Planner Action: <code className="text-primary font-mono">{skill.slug}</code>
										</p>
										<p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
											Extracted from user intent & conversation context.
										</p>
									</div>

									{/* Step 2: Inter-Service Wire */}
									<div className="flex-1 rounded-xl border border-border/60 bg-card p-4 shadow-sm flex flex-col relative group hover:border-primary/50 transition-colors">
										<div className="flex items-center gap-2 text-xs font-semibold text-amber-500 mb-2">
											<LockIcon className="w-4 h-4 text-amber-500" />
											<span>2. Secure Handshake</span>
										</div>
										<p className="text-xs text-foreground font-medium">
											HMAC-SHA256 Signed
										</p>
										<p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
											Header <code className="font-mono text-[10px]">X-Woops-Signature</code> + Replay Window.
										</p>
									</div>

									{/* Step 3: Workflow Automation Engine */}
									<div className="flex-1 rounded-xl border border-border/60 bg-card p-4 shadow-sm flex flex-col relative group hover:border-primary/50 transition-colors">
										<div className="flex items-center gap-2 text-xs font-semibold text-rose-500 mb-2">
											<ZapIcon className="w-4 h-4 text-rose-500" />
											<span>3. Workflow Engine</span>
										</div>
										<p className="text-xs text-foreground font-medium">
											Automation Engine Node
										</p>
										<p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
											{requiredIntegrations.length > 0
												? `Connects to: ${requiredIntegrations.join(", ")}`
												: "Executes deterministic integration workflow."}
										</p>
									</div>

									{/* Step 4: Context Injection */}
									<div className="flex-1 rounded-xl border border-border/60 bg-card p-4 shadow-sm flex flex-col relative group hover:border-primary/50 transition-colors">
										<div className="flex items-center gap-2 text-xs font-semibold text-emerald-500 mb-2">
											<CpuIcon className="w-4 h-4 text-emerald-500" />
											<span>4. Context Return</span>
										</div>
										<p className="text-xs text-foreground font-medium">
											Structured Output
										</p>
										<p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
											Unwrapped & injected into Run Context for Agent reasoning.
										</p>
									</div>
								</div>
							</div>

							{/* Instructions & Prompt Policy */}
							{skill.instructions && (
								<div className="rounded-xl border border-border/40 bg-muted/10 p-5">
									<h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">
										Skill Instructions / Prompt Behavior
									</h4>
									<p className="text-xs text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed bg-background/50 p-3 rounded-lg border border-border/30">
										{skill.instructions}
									</p>
								</div>
							)}
						</div>
					)}

					{/* Schemas Tab */}
					{activeTab === "schemas" && (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-200">
							{/* Input Schema */}
							<div className="rounded-xl border border-border/50 bg-card p-4 flex flex-col shadow-sm">
								<div className="flex items-center justify-between pb-3 border-b border-border/30 mb-3">
									<div className="flex items-center gap-2">
										<Code2Icon className="w-4 h-4 text-primary" />
										<h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
											Input Schema (JSON Schema)
										</h4>
									</div>
									<Button
										variant="ghost"
										size="xs"
										className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
										onClick={() =>
											copyToClipboard(
												JSON.stringify(skill.inputSchema ?? {}, null, 2),
												"input"
											)
										}
									>
										{copiedSchema === "input" ? (
											<CheckCircle2Icon className="w-3.5 h-3.5 text-emerald-500" />
										) : (
											<CopyIcon className="w-3.5 h-3.5" />
										)}
										{copiedSchema === "input" ? "Copied" : "Copy"}
									</Button>
								</div>
								<pre className="text-xs font-mono bg-muted/20 p-3 rounded-lg border border-border/30 overflow-x-auto text-foreground flex-1 min-h-[220px]">
									{JSON.stringify(skill.inputSchema ?? { type: "object" }, null, 2)}
								</pre>
							</div>

							{/* Output Schema */}
							<div className="rounded-xl border border-border/50 bg-card p-4 flex flex-col shadow-sm">
								<div className="flex items-center justify-between pb-3 border-b border-border/30 mb-3">
									<div className="flex items-center gap-2">
										<Code2Icon className="w-4 h-4 text-emerald-500" />
										<h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
											Output Schema (Expected Result)
										</h4>
									</div>
									<Button
										variant="ghost"
										size="xs"
										className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
										onClick={() =>
											copyToClipboard(
												JSON.stringify(skill.outputSchema ?? {}, null, 2),
												"output"
											)
										}
									>
										{copiedSchema === "output" ? (
											<CheckCircle2Icon className="w-3.5 h-3.5 text-emerald-500" />
										) : (
											<CopyIcon className="w-3.5 h-3.5" />
										)}
										{copiedSchema === "output" ? "Copied" : "Copy"}
									</Button>
								</div>
								<pre className="text-xs font-mono bg-muted/20 p-3 rounded-lg border border-border/30 overflow-x-auto text-foreground flex-1 min-h-[220px]">
									{JSON.stringify(skill.outputSchema ?? { type: "object" }, null, 2)}
								</pre>
							</div>
						</div>
					)}

					{/* Execution Policy Tab */}
					{activeTab === "execution" && (
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-200">
							<div className="rounded-xl border border-border/50 bg-card p-4 shadow-sm">
								<div className="text-xs text-muted-foreground font-medium mb-1 flex items-center gap-1.5">
									<RefreshCwIcon className="w-3.5 h-3.5 text-primary" />
									<span>Retry Policy</span>
								</div>
								<div className="text-lg font-bold text-foreground">
									{maxAttempts} {maxAttempts === 1 ? "Attempt" : "Attempts"}
								</div>
								<p className="text-[11px] text-muted-foreground mt-1">
									Exponential backoff with jitter on network/5xx codes.
								</p>
							</div>

							<div className="rounded-xl border border-border/50 bg-card p-4 shadow-sm">
								<div className="text-xs text-muted-foreground font-medium mb-1 flex items-center gap-1.5">
									<ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-500" />
									<span>Execution Timeout</span>
								</div>
								<div className="text-lg font-bold text-foreground">
									{(skill.timeout ?? 30000) / 1000}s
								</div>
								<p className="text-[11px] text-muted-foreground mt-1">
									AbortSignal cancellation trigger boundary.
								</p>
							</div>

							<div className="rounded-xl border border-border/50 bg-card p-4 shadow-sm">
								<div className="text-xs text-muted-foreground font-medium mb-1 flex items-center gap-1.5">
									<LockIcon className="w-3.5 h-3.5 text-amber-500" />
									<span>Required Integrations</span>
								</div>
								<div className="text-lg font-bold text-foreground capitalize">
									{requiredIntegrations.length > 0
										? requiredIntegrations.join(", ")
										: "None (Autonomous)"}
								</div>
								<p className="text-[11px] text-muted-foreground mt-1">
									Readiness is asserted before plan dispatch.
								</p>
							</div>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
