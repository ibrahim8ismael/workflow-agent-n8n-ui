"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MOCK_AGENTS } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import CustomButton from "@/components/shared/Button";
import { Button } from "@/components/ui/button";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeftIcon, BrainCircuitIcon, CodeIcon, Settings2Icon, PencilIcon, LinkIcon, Trash2Icon, PlusIcon, ActivityIcon, EyeIcon, LibraryIcon, FileTextIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type TabType = "prompts" | "skills" | "integrations" | "knowledge";

export default function AgentDetailPage() {
	const params = useParams();
	const router = useRouter();
	const id = params?.id as string;
	
	const agent = MOCK_AGENTS.find((a) => a.id === id);
	const [activeTab, setActiveTab] = useState<TabType>("prompts");

	if (!agent) {
		return (
			<div className="flex flex-col items-center justify-center h-[50vh] gap-4">
				<h2 className="text-2xl font-bold">Employee Not Found</h2>
				<Button onClick={() => router.push("/agents")} variant="outline" size="sm">
					<ArrowLeftIcon className="w-4 h-4 mr-2" />
					Back to Workforce
				</Button>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-10">
			{/* Back Navigation */}
			<div>
				<Button onClick={() => router.push("/agents")} variant="ghost" size="sm" className="-ml-2 text-muted-foreground hover:text-foreground">
					<ArrowLeftIcon className="w-4 h-4 mr-2" />
					Back to Workforce
				</Button>
			</div>
			
			{/* Page Header (Persistent) */}
			<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-border/40 pb-6">
				<div className="flex items-center gap-4">
					<Avatar className="h-20 w-20 border-2 border-border shadow-md">
						<AvatarFallback className={`text-white text-3xl font-bold ${agent.color}`}>
							{agent.avatar}
						</AvatarFallback>
					</Avatar>
					<div className="flex flex-col gap-1">
						<div className="flex items-center gap-3">
							<h1 className="text-3xl font-bold tracking-tight">{agent.name}</h1>
							<Badge variant={agent.status === "Active" ? "default" : "secondary"} className={`font-medium ${agent.status === "Active" ? "bg-emerald-500/10 text-emerald-600 border-transparent" : "bg-muted text-muted-foreground border-transparent"}`}>
								{agent.status}
							</Badge>
						</div>
						<p className="text-lg font-medium text-primary">{agent.role}</p>
					</div>
				</div>
			</div>

			{/* Custom Tabs Navigation */}
			<div className="flex items-center gap-2 border-b border-border/40">
				<button
					onClick={() => setActiveTab("prompts")}
					className={cn(
						"px-4 py-2.5 text-sm font-medium transition-colors relative",
						activeTab === "prompts" ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-t-lg"
					)}
				>
					Prompts
					{activeTab === "prompts" && (
						<span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-primary rounded-t-full" />
					)}
				</button>
				<button
					onClick={() => setActiveTab("skills")}
					className={cn(
						"px-4 py-2.5 text-sm font-medium transition-colors relative",
						activeTab === "skills" ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-t-lg"
					)}
				>
					Skills
					{activeTab === "skills" && (
						<span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-primary rounded-t-full" />
					)}
				</button>
				<button
					onClick={() => setActiveTab("integrations")}
					className={cn(
						"px-4 py-2.5 text-sm font-medium transition-colors relative",
						activeTab === "integrations" ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-t-lg"
					)}
				>
					Integrations
					{activeTab === "integrations" && (
						<span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-primary rounded-t-full" />
					)}
				</button>
				<button
					onClick={() => setActiveTab("knowledge")}
					className={cn(
						"px-4 py-2.5 text-sm font-medium transition-colors relative",
						activeTab === "knowledge" ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-t-lg"
					)}
				>
					Knowledge
					{activeTab === "knowledge" && (
						<span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-primary rounded-t-full" />
					)}
				</button>
			</div>

			{/* Tab Content Areas */}
			<div className="mt-2 min-h-[400px]">
				
				{/* Prompts Tab */}
				{activeTab === "prompts" && (
					<div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
						{/* System Prompt */}
						<Card className="overflow-hidden border-border/50 bg-card/40 flex flex-col shadow-sm">
							<div className="bg-muted/30 px-5 py-3 border-b border-border/40 flex items-center gap-2">
								<img src="/3d-icons/3dicons-bookmark-fav-dynamic-color.png" alt="System Prompt" className="w-5 h-5 object-contain" />
								<h3 className="font-semibold text-sm">System Prompt</h3>
							</div>
							<div className="p-5">
								<p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap font-mono bg-muted/20 p-4 rounded-lg border border-border/30">
									{agent.systemPrompt}
								</p>
							</div>
						</Card>

						{/* Memory Context */}
						<Card className="overflow-hidden border-border/50 bg-card/40 flex flex-col shadow-sm">
							<div className="bg-muted/30 px-5 py-3 border-b border-border/40 flex items-center gap-2">
								<img src="/3d-icons/3dicons-notebook-dynamic-color.png" alt="Active Memory" className="w-5 h-5 object-contain" />
								<h3 className="font-semibold text-sm">Active Memory</h3>
							</div>
							<div className="p-5">
								<p className="text-sm text-muted-foreground leading-relaxed">
									{agent.memory}
								</p>
							</div>
						</Card>
					</div>
				)}

				{/* Skills Tab */}
				{activeTab === "skills" && (
					<div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
						<div className="flex items-center justify-between mb-6">
							<div className="flex items-center gap-2">
								<Settings2Icon className="w-5 h-5 text-amber-500" />
								<h3 className="font-semibold text-lg">Active Skills</h3>
							</div>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{agent.skills?.map((skill: { id: string; name: string; description: string }) => (
								<Card key={skill.id} className="group relative overflow-hidden border-border/50 bg-card/40 hover:bg-card hover:shadow-md transition-all duration-300 flex flex-col p-6 min-h-[180px]">
									<div className="flex items-start gap-4 mb-3">
										<div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center shadow-sm p-2 shrink-0">
											<img src="/3d-icons/3dicons-flash-dynamic-color.png" alt="Skill" className="w-full h-full object-contain" />
										</div>
										<h4 className="font-semibold text-foreground text-lg mt-1">{skill.name}</h4>
									</div>
									<p className="text-sm text-muted-foreground leading-relaxed flex-1">
										{skill.description}
									</p>
									
									<div className="absolute inset-x-0 bottom-0 bg-card/95 backdrop-blur-sm border-t border-border/40 p-4 flex gap-3 translate-y-full group-hover:translate-y-0 transition-transform duration-200 ease-out">
										<CustomButton variant="primary" showArrow={false} className="flex-1 h-9 rounded-xl text-sm font-semibold">
											<EyeIcon className="w-4 h-4 mr-2" /> View
										</CustomButton>
										
										<AlertDialog>
											<AlertDialogTrigger render={
												<CustomButton variant="danger" showArrow={false} className="flex-1 h-9 rounded-xl text-sm font-semibold">
													<Trash2Icon className="w-4 h-4 mr-2" /> Delete
												</CustomButton>
											} />
											<AlertDialogContent>
												<AlertDialogHeader>
													<AlertDialogTitle>Delete Skill?</AlertDialogTitle>
													<AlertDialogDescription>
														Are you sure you want to permanently delete the <strong>{skill.name}</strong> skill from this agent? This action cannot be undone.
													</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel>Cancel</AlertDialogCancel>
													<AlertDialogAction render={
														<CustomButton variant="danger" size="xs" showArrow={false}>Confirm Delete</CustomButton>
													} className="p-0 border-0 bg-transparent hover:bg-transparent shadow-none ring-0" />
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									</div>
								</Card>
							))}
						</div>
					</div>
				)}

				{/* Integrations Tab */}
				{activeTab === "integrations" && (
					<div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
						<div className="flex items-center justify-between mb-6">
							<div className="flex items-center gap-2">
								<img src="/3d-icons/3dicons-link-dynamic-color.png" alt="Integrations" className="w-6 h-6 object-contain" />
								<h3 className="font-semibold text-lg">Connected Apps</h3>
							</div>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
							{agent.integrations?.map((app: string) => (
								<Card key={app} className="group relative overflow-hidden border-border/50 bg-card/40 hover:bg-card hover:shadow-md transition-all duration-300 flex flex-col p-5 items-center justify-center text-center min-h-[160px]">
									<div className="w-16 h-16 rounded-2xl bg-background border border-border flex items-center justify-center shadow-sm p-3 mb-3 group-hover:scale-110 transition-transform">
										<img src="/3d-icons/3dicons-link-dynamic-color.png" alt={app} className="w-full h-full object-contain" />
									</div>
									<h4 className="font-semibold text-foreground capitalize">{app.replace("_", " ")}</h4>
									
									<div className="absolute inset-x-0 bottom-0 bg-card/95 backdrop-blur-sm border-t border-border/40 p-3 flex gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-200 ease-out">
										<CustomButton variant="primary" showArrow={false} className="flex-1 h-8 rounded-xl text-xs font-semibold">
											<EyeIcon className="w-3.5 h-3.5 mr-1" /> View
										</CustomButton>
										
										<AlertDialog>
											<AlertDialogTrigger render={
												<CustomButton variant="danger" showArrow={false} className="flex-1 h-8 rounded-xl text-xs font-semibold">
													Remove
												</CustomButton>
											} />
											<AlertDialogContent>
												<AlertDialogHeader>
													<AlertDialogTitle>Disconnect App?</AlertDialogTitle>
													<AlertDialogDescription>
														Are you sure you want to disconnect this app? The agent will no longer be able to use this integration.
													</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel>Cancel</AlertDialogCancel>
													<AlertDialogAction render={
														<CustomButton variant="danger" size="xs" showArrow={false}>Confirm Disconnect</CustomButton>
													} className="p-0 border-0 bg-transparent hover:bg-transparent shadow-none ring-0" />
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									</div>
								</Card>
							))}
						</div>
					</div>
				)}

				{/* Knowledge Tab */}
				{activeTab === "knowledge" && (
					<div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
						<div className="flex items-center justify-between mb-6">
							<div className="flex items-center gap-2">
								<LibraryIcon className="w-5 h-5 text-indigo-500" />
								<h3 className="font-semibold text-lg">Knowledge Bases</h3>
							</div>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{agent.knowledge?.map((kb: { id: string; name: string; type: string; size: string }) => (
								<Card key={kb.id} className="group relative overflow-hidden border-border/50 bg-card/40 hover:bg-card hover:shadow-md transition-all duration-300 flex flex-col p-6 min-h-[140px]">
									<div className="flex items-start gap-4 mb-3">
										<div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center shadow-sm p-2 shrink-0">
											<img src="/3d-icons/3dicons-folder-dynamic-color.png" alt="Knowledge Base" className="w-full h-full object-contain" />
										</div>
										<div>
											<h4 className="font-semibold text-foreground text-lg mt-1">{kb.name}</h4>
											<div className="flex gap-2 text-xs text-muted-foreground mt-1">
												<Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-medium">{kb.type}</Badge>
												<span className="flex items-center">{kb.size}</span>
											</div>
										</div>
									</div>
									
									<div className="absolute inset-x-0 bottom-0 bg-card/95 backdrop-blur-sm border-t border-border/40 p-4 flex gap-3 translate-y-full group-hover:translate-y-0 transition-transform duration-200 ease-out">
										<CustomButton variant="primary" showArrow={false} className="flex-1 h-9 rounded-xl text-sm font-semibold">
											<EyeIcon className="w-4 h-4 mr-2" /> View
										</CustomButton>
										
										<AlertDialog>
											<AlertDialogTrigger render={
												<CustomButton variant="danger" showArrow={false} className="flex-1 h-9 rounded-xl text-sm font-semibold">
													<Trash2Icon className="w-4 h-4 mr-2" /> Remove
												</CustomButton>
											} />
											<AlertDialogContent>
												<AlertDialogHeader>
													<AlertDialogTitle>Remove Knowledge Base?</AlertDialogTitle>
													<AlertDialogDescription>
														Are you sure you want to remove <strong>{kb.name}</strong> from this agent's knowledge?
													</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel>Cancel</AlertDialogCancel>
													<AlertDialogAction render={
														<CustomButton variant="danger" size="xs" showArrow={false}>Confirm Remove</CustomButton>
													} className="p-0 border-0 bg-transparent hover:bg-transparent shadow-none ring-0" />
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									</div>
								</Card>
							))}
						</div>
					</div>
				)}

			</div>
		</div>
	);
}
