"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchIcon, PlugIcon, CheckCircle2Icon, AppWindowIcon } from "lucide-react";
import CustomButton from "@/components/shared/Button";
import { ArrowUpRightIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

const MOCK_APPS = [
	{
		id: "1",
		name: "Notion",
		author: "notion",
		installs: "1,245,210",
		type: "TOOL",
		description: "Read documents and write notes into your Notion workspace.",
		tags: ["PRODUCTIVITY", "KNOWLEDGE"],
		iconUrl: "https://svgl.app/library/notion.svg",
		connected: true,
	},
	{
		id: "2",
		name: "Stripe",
		author: "stripe",
		installs: "842,109",
		type: "TOOL",
		description: "Fetch subscription data, manage invoices, and issue refunds securely.",
		tags: ["FINANCE", "PAYMENTS"],
		iconUrl: "https://svgl.app/library/stripe.svg",
		connected: true,
	},
	{
		id: "3",
		name: "OpenAI",
		author: "openai",
		installs: "3,402,156",
		type: "MODEL",
		description: "Access GPT-4 and other OpenAI language, embedding, and vision models.",
		tags: ["AI", "LLM"],
		iconUrl: "https://svgl.app/library/openai_dark.svg",
		connected: false,
	},
	{
		id: "4",
		name: "Anthropic",
		author: "anthropic",
		installs: "2,101,402",
		type: "MODEL",
		description: "Integrate with Claude models for advanced reasoning and long-context processing.",
		tags: ["AI", "LLM"],
		iconUrl: "https://svgl.app/library/anthropic_white.svg",
		connected: false,
	},
	{
		id: "5",
		name: "Slack",
		author: "slack",
		installs: "4,102,990",
		type: "TOOL",
		description: "Send messages, read channels, and manage Slack notifications.",
		tags: ["COMMUNICATION", "TEAM"],
		iconUrl: "https://svgl.app/library/slack.svg",
		connected: false,
	},
	{
		id: "6",
		name: "Linear",
		author: "linear",
		installs: "654,120",
		type: "TOOL",
		description: "Manage issues, projects, and sprints directly from your AI agent.",
		tags: ["PRODUCTIVITY", "ENGINEERING"],
		iconUrl: "https://svgl.app/library/linear.svg",
		connected: false,
	},
	{
		id: "7",
		name: "Figma",
		author: "figma",
		installs: "1,829,401",
		type: "TOOL",
		description: "Read design files, extract assets, and inspect components.",
		tags: ["DESIGN", "PRODUCTIVITY"],
		iconUrl: "https://svgl.app/library/figma.svg",
		connected: false,
	},
	{
		id: "8",
		name: "GitHub",
		author: "github",
		installs: "5,102,884",
		type: "TOOL",
		description: "Manage repositories, pull requests, issues, and GitHub actions.",
		tags: ["ENGINEERING", "VCS"],
		iconUrl: "https://svgl.app/library/github_dark.svg",
		connected: false,
	},
];

export default function IntegrationsPage() {
	const { t } = useTranslation("integrations");

	return (
		<div className="flex flex-col gap-6">
			{/* Page Header */}
			<div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">{t("integrationsDirectory", { defaultValue: "Integrations Directory" })}</h1>
					<p className="text-muted-foreground mt-1">{t("integrationsDesc", { defaultValue: "Connect the tools your AI employees need to do their jobs." })}</p>
				</div>
				<div className="relative w-full md:w-[300px]">
					<SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
					<Input placeholder={t("searchIntegrations", { defaultValue: "Search integrations..." })} className="pl-9 h-10 rounded-xl bg-background text-left" />
				</div>
			</div>

			{/* Integrations Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" dir="ltr">
				{MOCK_APPS.map((app) => (
					<Card key={app.id} className="group relative overflow-hidden border-border/50 bg-card/40 hover:bg-card hover:shadow-md transition-all duration-300 flex flex-col">
						{/* Type badge */}
						<div className="absolute top-3 right-3 text-[10px] font-bold text-muted-foreground tracking-widest">
							{app.type}
						</div>

						{/* Header */}
						<CardHeader className="flex flex-row items-start gap-3 p-4 pb-3">
							<div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm bg-card shrink-0 border border-border/40 overflow-hidden p-1.5`}>
								<img src={app.iconUrl} alt={app.name} className="w-full h-full object-contain" />
							</div>
							<div className="flex flex-col min-w-0 flex-1">
								<div className="flex items-center gap-1.5 pr-8">
									<CardTitle className="text-sm font-semibold text-foreground truncate leading-tight">{app.name}</CardTitle>
									{app.connected && <CheckCircle2Icon className="w-3.5 h-3.5 text-orange-500 shrink-0" />}
								</div>
								<div className="text-[11px] text-muted-foreground mt-0.5">
									by {app.author} <span className="mx-1 opacity-40">·</span> {app.installs} installs
								</div>
							</div>
						</CardHeader>

						{/* Description */}
						<CardContent className="px-4 pb-4 pt-0 flex-1">
							<p className="text-[12.5px] text-muted-foreground leading-relaxed line-clamp-3">
								{app.description}
							</p>
						</CardContent>

						{/* Footer: tags always visible */}
						<div className="px-4 pb-4 flex items-center gap-2 flex-wrap">
							{app.tags.map((tag, idx) => (
								<div key={idx} className="flex items-center gap-1 px-2 py-0.5 rounded border border-border/50 text-[10px] font-medium text-muted-foreground">
									<AppWindowIcon className="w-2.5 h-2.5 opacity-60" />
									{tag}
								</div>
							))}
						</div>

						{/* Hover overlay - slides up from bottom */}
						<div className="absolute inset-x-0 bottom-0 bg-card/95 backdrop-blur-sm border-t border-border/40 p-3 flex gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-200 ease-out">
							<CustomButton size="sm" showArrow={false} className="flex-1 h-9 rounded-2xl text-xs">
								{t("install", { defaultValue: "Install" })}
							</CustomButton>
							<Button variant="outline" className="flex-1 h-9 rounded-2xl text-xs font-semibold border-border/60">
								{t("details", { defaultValue: "Details" })} <ArrowUpRightIcon className="w-3 h-3 ml-1" />
							</Button>
						</div>
					</Card>
				))}

				{/* Custom API Integration */}
				<Card className="border-dashed border-2 border-border/50 bg-transparent hover:bg-muted/20 hover:border-border transition-all duration-300 flex flex-col items-center justify-center min-h-[220px] cursor-pointer group">
					<div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
						<PlugIcon className="w-5 h-5 text-muted-foreground" />
					</div>
					<h3 className="mt-3 text-sm font-semibold text-foreground">{t("customIntegration", { defaultValue: "Custom Integration" })}</h3>
					<p className="text-xs text-muted-foreground mt-1 text-center px-6">{t("customIntegrationDesc", { defaultValue: "Build a custom API connection for your internal tools." })}</p>
				</Card>
			</div>
		</div>
	);
}

// Add missing icon
import { Settings2Icon } from "lucide-react";
