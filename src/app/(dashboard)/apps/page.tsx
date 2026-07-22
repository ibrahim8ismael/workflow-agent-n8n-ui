"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchIcon, PlugIcon, CheckCircle2Icon, AppWindowIcon } from "lucide-react";

const MOCK_APPS = [
	{
		id: "1",
		name: "Slack",
		category: "Communication",
		description: "Send messages, read channels, and manage Slack notifications.",
		icon: "S",
		color: "bg-[#4A154B]",
		connected: true,
	},
	{
		id: "2",
		name: "Gmail",
		category: "Email",
		description: "Read, draft, and send emails directly from your workspace.",
		icon: "G",
		color: "bg-[#EA4335]",
		connected: true,
	},
	{
		id: "3",
		name: "Salesforce",
		category: "CRM",
		description: "Update records, fetch lead data, and manage pipelines.",
		icon: "SF",
		color: "bg-[#00A1E0]",
		connected: false,
	},
	{
		id: "4",
		name: "Notion",
		category: "Knowledge",
		description: "Read documents and write notes into your Notion workspace.",
		icon: "N",
		color: "bg-zinc-800",
		connected: false,
	},
	{
		id: "5",
		name: "Stripe",
		category: "Finance",
		description: "Fetch subscription data, manage invoices, and issue refunds.",
		icon: "St",
		color: "bg-[#635BFF]",
		connected: false,
	},
	{
		id: "6",
		name: "Zendesk",
		category: "Support",
		description: "Read and reply to support tickets on behalf of the team.",
		icon: "Z",
		color: "bg-[#03363D]",
		connected: false,
	},
];

export default function AppsPage() {
	return (
		<div className="flex flex-col gap-6">
			{/* Page Header */}
			<div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">App Directory</h1>
					<p className="text-muted-foreground mt-1">Connect the tools your AI employees need to do their jobs.</p>
				</div>
				<div className="relative w-full md:w-[300px]">
					<SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
					<Input placeholder="Search apps..." className="pl-9 h-10 rounded-xl bg-background" />
				</div>
			</div>

			{/* Apps Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
				{MOCK_APPS.map((app) => (
					<Card key={app.id} className="group overflow-hidden border-border/50 bg-card/40 hover:bg-card hover:shadow-sm transition-all duration-300">
						<CardHeader className="flex flex-row items-start gap-4 pb-4">
							<div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm ${app.color} shrink-0`}>
								{app.icon}
							</div>
							<div className="flex flex-col flex-1">
								<div className="flex items-start justify-between">
									<CardTitle className="text-lg">{app.name}</CardTitle>
									{app.connected && (
										<Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20 flex items-center gap-1 pl-1.5 pr-2">
											<CheckCircle2Icon className="w-3 h-3" />
											Connected
										</Badge>
									)}
								</div>
								<CardDescription className="text-xs font-medium text-muted-foreground/80 mt-0.5">{app.category}</CardDescription>
							</div>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground line-clamp-2">
								{app.description}
							</p>
						</CardContent>
						<CardFooter className="pt-4 border-t border-border/40 flex items-center justify-between">
							<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
								<AppWindowIcon className="w-3.5 h-3.5" />
								Native App
							</div>
							{app.connected ? (
								<Button variant="outline" size="sm" className="h-8 px-3 rounded-lg text-xs font-medium border-border/60">
									<Settings2Icon className="w-3.5 h-3.5 mr-1.5" />
									Configure
								</Button>
							) : (
								<Button size="sm" className="h-8 px-4 rounded-lg text-xs font-medium">
									Connect
								</Button>
							)}
						</CardFooter>
					</Card>
				))}
				
				{/* Custom API Integration */}
				<Card className="border-dashed border-2 border-border/60 bg-transparent hover:bg-muted/30 hover:border-border transition-all duration-300 flex flex-col items-center justify-center min-h-[200px] cursor-pointer group">
					<div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
						<PlugIcon className="w-6 h-6 text-muted-foreground" />
					</div>
					<h3 className="mt-4 font-semibold text-foreground">Custom Integration</h3>
					<p className="text-sm text-muted-foreground mt-1 max-w-[220px] text-center">Build a custom API connection for your internal tools.</p>
				</Card>
			</div>
		</div>
	);
}

// Add missing icon
import { Settings2Icon } from "lucide-react";
