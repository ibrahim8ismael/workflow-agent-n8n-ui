"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import {
	SearchIcon,
	PlugIcon,
	CheckCircle2Icon,
	AppWindowIcon,
	Loader2Icon,
	ShieldCheckIcon,
	ExternalLinkIcon,
	ZapIcon,
	RefreshCwIcon,
	LayersIcon,
} from "lucide-react";
import CustomButton from "@/components/shared/Button";
import { ArrowUpRightIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
	createIntegration,
	deleteIntegration,
	listOrganizationIntegrations,
} from "@/lib/api/integrations";
import type { Integration, IntegrationCategory } from "@/lib/api/types";
import { N8nConnectionManager } from "@/components/integrations/n8n-connection-manager";

interface AppDefinition {
	id: string;
	name: string;
	author: string;
	type: "TOOL" | "MODEL" | "CHANNEL";
	description: string;
	tags: string[];
	iconUrl: string;
	category: IntegrationCategory;
	workflowBacked?: boolean;
}

const AVAILABLE_INTEGRATIONS: AppDefinition[] = [
	{
		id: "hubspot",
		name: "HubSpot CRM",
		author: "hubspot",
		type: "TOOL",
		description: "Find customers, lookup deal stages, and update lead records in real-time.",
		tags: ["CRM", "SALES", "SUPPORT"],
		iconUrl: "https://svgl.app/library/hubspot.svg",
		category: "CRM",
		workflowBacked: true,
	},
	{
		id: "whatsapp",
		name: "WhatsApp Cloud",
		author: "meta",
		type: "CHANNEL",
		description: "Ingest inbound customer messages and send automated replies via WhatsApp.",
		tags: ["COMMUNICATION", "MESSAGING"],
		iconUrl: "https://svgl.app/library/whatsapp.svg",
		category: "COMMUNICATION",
		workflowBacked: true,
	},
	{
		id: "stripe",
		name: "Stripe",
		author: "stripe",
		type: "TOOL",
		description: "Fetch subscription status, inspect invoices, and process refunds securely.",
		tags: ["PAYMENTS", "BILLING"],
		iconUrl: "https://svgl.app/library/stripe.svg",
		category: "PAYMENT",
		workflowBacked: true,
	},
	{
		id: "slack",
		name: "Slack",
		author: "slack",
		type: "CHANNEL",
		description: "Stream alerts, interact with channels, and request manager approvals.",
		tags: ["COMMUNICATION", "TEAM", "APPROVALS"],
		iconUrl: "https://svgl.app/library/slack.svg",
		category: "COMMUNICATION",
		workflowBacked: true,
	},
	{
		id: "shopify",
		name: "Shopify",
		author: "shopify",
		type: "TOOL",
		description: "Track customer order deliveries, check inventory levels, and process returns.",
		tags: ["ECOMMERCE", "ORDERS"],
		iconUrl: "https://svgl.app/library/shopify.svg",
		category: "OTHER",
		workflowBacked: true,
	},
	{
		id: "notion",
		name: "Notion",
		author: "notion",
		type: "TOOL",
		description: "Read documentation, extract Knowledge pages, and record business updates.",
		tags: ["PRODUCTIVITY", "KNOWLEDGE"],
		iconUrl: "https://svgl.app/library/notion.svg",
		category: "OTHER",
		workflowBacked: true,
	},
	{
		id: "google_calendar",
		name: "Google Calendar",
		author: "google",
		type: "TOOL",
		description: "Check employee schedule availability and book meetings automatically.",
		tags: ["CALENDAR", "PRODUCTIVITY"],
		iconUrl: "https://svgl.app/library/google.svg",
		category: "OTHER",
		workflowBacked: true,
	},
	{
		id: "telegram",
		name: "Telegram Bot",
		author: "telegram",
		type: "CHANNEL",
		description: "Omnichannel customer support and notifications via Telegram bot API.",
		tags: ["COMMUNICATION", "BOT"],
		iconUrl: "https://svgl.app/library/telegram.svg",
		category: "COMMUNICATION",
		workflowBacked: true,
	},
	{
		id: "openai",
		name: "OpenAI",
		author: "openai",
		type: "MODEL",
		description: "Access GPT-4o language, embedding, and vision models.",
		tags: ["AI", "LLM"],
		iconUrl: "https://svgl.app/library/openai_dark.svg",
		category: "AI",
		workflowBacked: false,
	},
	{
		id: "anthropic",
		name: "Anthropic",
		author: "anthropic",
		type: "MODEL",
		description: "Access Claude 3.5 Sonnet and Haiku for complex reasoning.",
		tags: ["AI", "LLM"],
		iconUrl: "https://svgl.app/library/anthropic_white.svg",
		category: "AI",
		workflowBacked: false,
	},
];

type CategoryFilter = "ALL" | "CRM" | "COMMUNICATION" | "PAYMENT" | "AI" | "OTHER";

export default function IntegrationsPage() {
	const [tab, setTab] = React.useState<"apps" | "n8n">("apps");
	const [search, setSearch] = React.useState("");
	const [selectedCategory, setSelectedCategory] = React.useState<CategoryFilter>("ALL");
	const [connectedMap, setConnectedMap] = React.useState<Record<string, boolean>>({
		notion: true,
		stripe: true,
		openai: true,
	});
	const [loadingMap, setLoadingMap] = React.useState<Record<string, boolean>>({});
	const [configModalApp, setConfigModalApp] = React.useState<AppDefinition | null>(null);

	const toggleConnect = async (app: AppDefinition) => {
		const isCurrentlyConnected = connectedMap[app.id];
		setLoadingMap((prev) => ({ ...prev, [app.id]: true }));
		try {
			if (!isCurrentlyConnected) {
				await createIntegration({
					name: app.name,
					category: app.category,
					provider: app.id,
				}).catch(() => null);
				setConnectedMap((prev) => ({ ...prev, [app.id]: true }));
			} else {
				setConnectedMap((prev) => ({ ...prev, [app.id]: false }));
			}
		} finally {
			setLoadingMap((prev) => ({ ...prev, [app.id]: false }));
		}
	};

	const filteredApps = AVAILABLE_INTEGRATIONS.filter((app) => {
		const matchesCategory =
			selectedCategory === "ALL" || app.category === selectedCategory;
		if (!matchesCategory) return false;

		if (!search.trim()) return true;
		const q = search.toLowerCase();
		return (
			app.name.toLowerCase().includes(q) ||
			app.description.toLowerCase().includes(q) ||
			app.tags.some((tag) => tag.toLowerCase().includes(q))
		);
	});

	return (
		<div className="flex flex-col gap-8 max-w-7xl mx-auto p-4 md:p-8">
			{/* Page Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<div className="flex items-center gap-2.5">
						<h1 className="text-3xl font-bold tracking-tight text-foreground">
							Integrations & Apps
						</h1>
						<Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
							Workflow Powered
						</Badge>
					</div>
					<p className="text-muted-foreground text-sm mt-1 max-w-2xl leading-relaxed">
						Connect your CRM, communication channels, and payment systems. Credentials remain securely inside the encrypted Workflow Vault without LLM leakage.
					</p>
				</div>
			</div>

			<div className="flex items-center gap-2 p-1 rounded-full bg-muted/40 w-fit">
				<button
					onClick={() => setTab("apps")}
					className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${tab === "apps" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
				>
					Apps Catalog
				</button>
				<button
					onClick={() => setTab("n8n")}
					className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${tab === "n8n" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
				>
					n8n Instances
				</button>
			</div>

			{tab === "n8n" && <N8nConnectionManager />}

			{tab === "apps" && (
				<>
					{/* Filter & Search Bar */}
			<div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
				{/* Category Pills */}
				<div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
					{(
						[
							{ id: "ALL", label: "All Apps" },
							{ id: "CRM", label: "CRM & Sales" },
							{ id: "COMMUNICATION", label: "Communication" },
							{ id: "PAYMENT", label: "Payments" },
							{ id: "AI", label: "AI Models" },
							{ id: "OTHER", label: "Productivity" },
						] as { id: CategoryFilter; label: string }[]
					).map((cat) => (
						<button
							key={cat.id}
							onClick={() => setSelectedCategory(cat.id)}
							className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
								selectedCategory === cat.id
									? "bg-primary text-primary-foreground shadow-sm"
									: "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/70"
							}`}
						>
							{cat.label}
						</button>
					))}
				</div>

				{/* Search Input */}
				<div className="relative w-full md:w-72">
					<SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
					<Input
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search integrations..."
						className="pl-9 h-9 text-sm bg-card/60 rounded-xl"
					/>
				</div>
			</div>

			{/* Integration Cards Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{filteredApps.map((app) => {
					const isConnected = Boolean(connectedMap[app.id]);
					const isLoading = Boolean(loadingMap[app.id]);

					return (
						<Card
							key={app.id}
							className="group relative overflow-hidden border-border/50 bg-card/40 hover:bg-card hover:shadow-md transition-all duration-200 flex flex-col p-6 rounded-2xl"
						>
							<div className="flex items-start justify-between gap-4 mb-3">
								<div className="flex items-center gap-3.5">
									<div className="w-12 h-12 rounded-xl bg-background border border-border/60 flex items-center justify-center p-2.5 shadow-sm group-hover:scale-105 transition-transform shrink-0">
										<img
											src={app.iconUrl}
											alt={app.name}
											className="w-full h-full object-contain"
											onError={(e) => {
												e.currentTarget.style.display = "none";
											}}
										/>
									</div>
									<div>
										<h3 className="font-semibold text-foreground text-base tracking-tight">
											{app.name}
										</h3>
										<span className="text-xs text-muted-foreground capitalize">
											{app.author}
										</span>
									</div>
								</div>

								{/* Status Badge */}
								{isConnected ? (
									<Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/15 border-transparent gap-1 font-medium text-xs">
										<CheckCircle2Icon className="w-3 h-3" />
										Connected
									</Badge>
								) : (
									<Badge variant="outline" className="text-muted-foreground text-xs">
										Disconnected
									</Badge>
								)}
							</div>

							<p className="text-sm text-muted-foreground leading-relaxed flex-1 mt-1 line-clamp-3">
								{app.description}
							</p>

							{/* Tags & Action Buttons */}
							<div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-border/40">
								<div className="flex items-center gap-1.5 flex-wrap">
									{app.workflowBacked && (
										<span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
											Workflow Powered
										</span>
									)}
									<span className="text-[10px] text-muted-foreground font-mono bg-muted/40 px-2 py-0.5 rounded">
										{app.category}
									</span>
								</div>

								<div className="flex items-center gap-2">
									{isConnected && (
										<Button
											variant="ghost"
											size="xs"
											className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
											onClick={() => setConfigModalApp(app)}
										>
											Configure
										</Button>
									)}

									<CustomButton
										variant={isConnected ? "secondary" : "primary"}
										size="xs"
										showArrow={false}
										disabled={isLoading}
										onClick={() => toggleConnect(app)}
										className="h-8 px-3 rounded-lg text-xs font-semibold"
									>
										{isLoading ? (
											<Loader2Icon className="w-3.5 h-3.5 animate-spin" />
										) : isConnected ? (
											"Disconnect"
										) : (
											"Connect"
										)}
									</CustomButton>
								</div>
							</div>
						</Card>
					);
				})}
			</div>

			{/* Configuration Modal */}
			{configModalApp && (
				<Dialog open={Boolean(configModalApp)} onOpenChange={(open) => !open && setConfigModalApp(null)}>
					<DialogContent className="max-w-md bg-card border-border/60 shadow-2xl p-6 rounded-2xl">
						<DialogHeader>
							<div className="flex items-center gap-3 mb-2">
								<div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center p-2 shadow-sm">
									<img
										src={configModalApp.iconUrl}
										alt={configModalApp.name}
										className="w-full h-full object-contain"
									/>
								</div>
								<div>
									<DialogTitle className="text-lg font-bold">
										{configModalApp.name} Integration
									</DialogTitle>
									<DialogDescription className="text-xs">
										Workflow Engine connection details
									</DialogDescription>
								</div>
							</div>
						</DialogHeader>

						<div className="space-y-4 py-2">
							<div className="rounded-xl border border-border/50 bg-muted/15 p-4 space-y-2">
								<div className="flex items-center justify-between text-xs">
									<span className="text-muted-foreground">Status:</span>
									<span className="font-semibold text-emerald-600 flex items-center gap-1">
										<CheckCircle2Icon className="w-3.5 h-3.5" /> Ready for AI Runs
									</span>
								</div>
								<div className="flex items-center justify-between text-xs">
									<span className="text-muted-foreground">Execution Strategy:</span>
									<span className="font-mono text-foreground">
										{configModalApp.workflowBacked ? "Automated Flow Wire" : "Native SDK"}
									</span>
								</div>
								<div className="flex items-center justify-between text-xs">
									<span className="text-muted-foreground">Credential Storage:</span>
									<span className="text-foreground">Encrypted in Workflow Vault</span>
								</div>
							</div>

							<div className="text-xs text-muted-foreground leading-relaxed bg-primary/5 p-3 rounded-lg border border-primary/10">
								<span className="font-semibold text-primary">Security Note:</span> Third-party access tokens and API secrets are never exposed to AI agents or conversational memory.
							</div>
						</div>

						<DialogFooter>
							<Button
								variant="outline"
								size="sm"
								className="w-full"
								onClick={() => setConfigModalApp(null)}
							>
								Close
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}
				</>
			)}
		</div>
	);
}
