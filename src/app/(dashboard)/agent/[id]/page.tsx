"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import CustomButton from "@/components/shared/Button";
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
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
	ArrowLeftIcon,
	Settings2Icon,
	Trash2Icon,
	EyeIcon,
	Loader2Icon,
	RefreshCwIcon,
	Edit2Icon,
	PlusIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api/client";
import { archiveAgent, detachSkill, getAgent, listAgentSkills, updateAgent } from "@/lib/api/agents";
import { listAgentMemory, createMemory, deleteMemory } from "@/lib/api/memory";
import { listOrganizationIntegrations } from "@/lib/api/integrations";
import type { Agent, AgentStatus, Integration, Memory, Skill } from "@/lib/api/types";
import { WorkflowViewerDialog } from "@/components/dashboard/WorkflowViewerDialog";

type TabType = "prompts" | "skills" | "integrations";

const STATUS_META: Record<AgentStatus, { label: string; className: string }> = {
	PUBLISHED: { label: "Active", className: "bg-emerald-500/10 text-emerald-600 border-transparent" },
	DRAFT: { label: "Draft", className: "bg-muted text-muted-foreground border-transparent" },
	ARCHIVED: { label: "Archived", className: "bg-amber-500/10 text-amber-600 border-transparent" },
	ERROR: { label: "Error", className: "bg-destructive/10 text-destructive border-transparent" },
};

const AVATAR_COLORS = [
	"bg-blue-600",
	"bg-violet-600",
	"bg-emerald-600",
	"bg-rose-600",
	"bg-amber-600",
	"bg-cyan-600",
];

function avatarColor(name: string): string {
	let hash = 0;
	for (let i = 0; i < name.length; i++) {
		hash = (hash * 31 + name.charCodeAt(i)) | 0;
	}
	return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(name: string): string {
	return name
		.split(/\s+/)
		.map((part) => part[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();
}

export default function AgentDetailPage() {
	const params = useParams();
	const router = useRouter();
	const id = params?.id as string;

	const [agent, setAgent] = useState<Agent | null>(null);
	const [skills, setSkills] = useState<Skill[]>([]);
	const [memory, setMemory] = useState<Memory[]>([]);
	const [integrations, setIntegrations] = useState<Integration[]>([]);
	const [loading, setLoading] = useState(true);
	const [notFound, setNotFound] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [busySkillId, setBusySkillId] = useState<string | null>(null);
	const [selectedSkillForViewer, setSelectedSkillForViewer] = useState<Skill | null>(null);
	const [activeTab, setActiveTab] = useState<TabType>("prompts");

	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [editAgentData, setEditAgentData] = useState<Partial<Agent>>({});
	const [isSavingAgent, setIsSavingAgent] = useState(false);

	const [isAddMemoryDialogOpen, setIsAddMemoryDialogOpen] = useState(false);
	const [newMemory, setNewMemory] = useState({ type: "AGENT" as const, key: "", content: "" });
	const [isSavingMemory, setIsSavingMemory] = useState(false);

	useEffect(() => {
		const controller = new AbortController();
		(async () => {
			try {
				const agentData = await getAgent(id);
				if (controller.signal.aborted) return;
				setAgent(agentData);
				setNotFound(false);
				setError(null);

				const [skillsData, memoryData] = await Promise.all([
					listAgentSkills(id).catch(() => [] as Skill[]),
					listAgentMemory(id).catch(() => [] as Memory[]),
				]);
				if (controller.signal.aborted) return;
				setSkills(skillsData);
				setMemory(memoryData);

				if (agentData.organizationId) {
					const integrationsData = await listOrganizationIntegrations(agentData.organizationId).catch(() => [] as Integration[]);
					if (!controller.signal.aborted) setIntegrations(integrationsData);
				} else {
					setIntegrations([]);
				}
			} catch (err) {
				if (controller.signal.aborted) return;
				if (err instanceof ApiError && err.statusCode === 404) {
					setNotFound(true);
				} else if (err instanceof ApiError) {
					setError(err.message);
				} else {
					setError("Could not load this employee. Please try again.");
				}
			} finally {
				if (!controller.signal.aborted) setLoading(false);
			}
		})();
		return () => controller.abort();
	}, [id]);

	const retry = async () => {
		setLoading(true);
		setError(null);
		try {
			const agentData = await getAgent(id);
			setAgent(agentData);
			setNotFound(false);
			setError(null);

			const [skillsData, memoryData] = await Promise.all([
				listAgentSkills(id).catch(() => [] as Skill[]),
				listAgentMemory(id).catch(() => [] as Memory[]),
			]);
			setSkills(skillsData);
			setMemory(memoryData);

			if (agentData.organizationId) {
				const integrationsData = await listOrganizationIntegrations(agentData.organizationId).catch(() => [] as Integration[]);
				setIntegrations(integrationsData);
			} else {
				setIntegrations([]);
			}
		} catch (err) {
			if (err instanceof ApiError && err.statusCode === 404) {
				setNotFound(true);
			} else if (err instanceof ApiError) {
				setError(err.message);
			} else {
				setError("Could not load this employee. Please try again.");
			}
		} finally {
			setLoading(false);
		}
	};

	const handleDetachSkill = async (skillId: string) => {
		if (busySkillId) return;
		setBusySkillId(skillId);
		try {
			await detachSkill(id, skillId);
			setSkills((prev) => prev.filter((s) => s.id !== skillId));
		} catch (err) {
			if (err instanceof ApiError) {
				setError(err.message);
			} else {
				setError("Could not detach the skill. Please try again.");
			}
		} finally {
			setBusySkillId(null);
		}
	};

	const handleToggleStatus = async () => {
		if (!agent || loading) return;
		setError(null);
		try {
			const updated = await archiveAgent(agent.id);
			setAgent(updated);
		} catch (err) {
			if (err instanceof ApiError) {
				setError(err.message);
			} else {
				setError("Could not update the employee. Please try again.");
			}
		}
	};

	const handleSaveAgent = async () => {
		if (!agent) return;
		setIsSavingAgent(true);
		try {
			const updated = await updateAgent(agent.id, {
				name: editAgentData.name,
				instructions: editAgentData.instructions ?? undefined,
				personality: editAgentData.personality ?? undefined,
			});
			setAgent(updated);
			setIsEditDialogOpen(false);
		} catch (err) {
			if (err instanceof ApiError) setError(err.message);
			else setError("Could not update employee.");
		} finally {
			setIsSavingAgent(false);
		}
	};

	const handleAddMemory = async () => {
		if (!agent) return;
		setIsSavingMemory(true);
		try {
			const added = await createMemory({
				agentId: agent.id,
				type: newMemory.type,
				key: newMemory.key,
				content: newMemory.content,
			});
			setMemory([added, ...memory]);
			setIsAddMemoryDialogOpen(false);
			setNewMemory({ type: "AGENT", key: "", content: "" });
		} catch (err) {
			if (err instanceof ApiError) setError(err.message);
			else setError("Could not add memory.");
		} finally {
			setIsSavingMemory(false);
		}
	};

	const handleDeleteMemory = async (memoryId: string) => {
		try {
			await deleteMemory(memoryId);
			setMemory(memory.filter(m => m.id !== memoryId));
		} catch (err) {
			if (err instanceof ApiError) setError(err.message);
			else setError("Could not delete memory.");
		}
	};

	if (loading) {
		return (
			<div className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-10">
				<Skeleton className="h-4 w-32" />
				<div className="flex items-center gap-4">
					<Skeleton className="h-20 w-20 rounded-full" />
					<div className="flex flex-col gap-2">
						<Skeleton className="h-8 w-48" />
						<Skeleton className="h-4 w-24" />
					</div>
				</div>
				<Skeleton className="h-10 w-full" />
			</div>
		);
	}

	if (notFound || !agent) {
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

	const statusMeta = STATUS_META[agent.status] ?? STATUS_META.DRAFT;

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
						<AvatarFallback className={`text-white text-3xl font-bold ${avatarColor(agent.name)}`}>
							{initials(agent.name)}
						</AvatarFallback>
					</Avatar>
					<div className="flex flex-col gap-1">
						<div className="flex items-center gap-3">
							<h1 className="text-3xl font-bold tracking-tight">{agent.name}</h1>
							<Badge variant={agent.status === "PUBLISHED" ? "default" : "secondary"} className={`font-medium ${statusMeta.className}`}>
								{statusMeta.label}
							</Badge>
						</div>
						<p className="text-lg font-medium text-primary">{agent.model}</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<CustomButton 
						variant="secondary" 
						size="sm" 
						showArrow={false} 
						onClick={() => {
							setEditAgentData({
								name: agent.name,
								instructions: agent.instructions || "",
								personality: agent.personality || "",
							});
							setIsEditDialogOpen(true);
						}}
					>
						<Edit2Icon className="w-4 h-4 mr-2" />
						Edit
					</CustomButton>
					{agent.status !== "ARCHIVED" && (
						<CustomButton variant="secondary" size="sm" showArrow={false} onClick={handleToggleStatus}>
							Archive
						</CustomButton>
					)}
				</div>
			</div>

			{error && (
				<div className="flex items-center justify-between rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
					<span>{error}</span>
					<Button variant="ghost" size="sm" onClick={retry}>
						<RefreshCwIcon className="w-4 h-4 mr-1.5" /> Retry
					</Button>
				</div>
			)}

			{/* Custom Tabs Navigation */}
			<div className="flex items-center gap-2 border-b border-border/40">
				{(["prompts", "skills", "integrations"] as TabType[]).map((tab) => (
					<button
						key={tab}
						onClick={() => setActiveTab(tab)}
						className={cn(
							"px-4 py-2.5 text-sm font-medium transition-colors relative capitalize",
							activeTab === tab ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-t-lg"
						)}
					>
						{tab}
						{activeTab === tab && (
							<span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-primary rounded-t-full" />
						)}
					</button>
				))}
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
								{agent.instructions ? (
									<p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap font-mono bg-muted/20 p-4 rounded-lg border border-border/30">
										{agent.instructions}
									</p>
								) : (
									<p className="text-sm text-muted-foreground">No instructions set.</p>
								)}
								{agent.personality && (
									<p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap mt-4">
										<strong className="font-semibold">Personality: </strong>
										{agent.personality}
									</p>
								)}
							</div>
						</Card>

						{/* Memory Context */}
						<Card className="overflow-hidden border-border/50 bg-card/40 flex flex-col shadow-sm">
							<div className="bg-muted/30 px-5 py-3 border-b border-border/40 flex items-center justify-between">
								<div className="flex items-center gap-2">
									<img src="/3d-icons/3dicons-notebook-dynamic-color.png" alt="Active Memory" className="w-5 h-5 object-contain" />
									<h3 className="font-semibold text-sm">Active Memory</h3>
								</div>
								<Button variant="ghost" size="sm" className="h-8 text-xs font-medium" onClick={() => setIsAddMemoryDialogOpen(true)}>
									<PlusIcon className="w-3.5 h-3.5 mr-1" /> Add Entry
								</Button>
							</div>
							<div className="p-5">
								{memory.length === 0 ? (
									<p className="text-sm text-muted-foreground">No memory entries yet.</p>
								) : (
									<div className="flex flex-col gap-3">
										{memory.map((entry) => (
											<div key={entry.id} className="group rounded-lg border border-border/40 bg-muted/20 p-4 relative">
												<div className="flex items-center justify-between mb-1">
													<span className="text-xs font-semibold text-foreground uppercase tracking-wide">{entry.type}</span>
													<div className="flex items-center gap-3">
														<span className="text-xs text-muted-foreground font-mono">{entry.key}</span>
														<Button 
															variant="ghost" 
															size="icon" 
															className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
															onClick={() => handleDeleteMemory(entry.id)}
														>
															<Trash2Icon className="h-3 w-3" />
														</Button>
													</div>
												</div>
												<p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap pr-8">{entry.content}</p>
											</div>
										))}
									</div>
								)}
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
						{skills.length === 0 ? (
							<div className="border-2 border-dashed border-border/60 rounded-2xl bg-muted/20 p-10 flex flex-col items-center justify-center text-center">
								<h3 className="font-semibold text-foreground">No skills attached</h3>
								<p className="text-sm text-muted-foreground mt-1 max-w-sm">Attach skills from the skills library to give this employee new capabilities.</p>
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{skills.map((skill) => (
									<Card key={skill.id} className="group relative overflow-hidden border-border/50 bg-card/40 hover:bg-card hover:shadow-md transition-all duration-300 flex flex-col p-6 min-h-[180px]">
										<div className="flex items-start gap-4 mb-3">
											<div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center shadow-sm p-2 shrink-0">
												<img src="/3d-icons/3dicons-flash-dynamic-color.png" alt="Skill" className="w-full h-full object-contain" />
											</div>
											<div className="min-w-0">
												<h4 className="font-semibold text-foreground text-lg mt-1 truncate">{skill.name}</h4>
												<span className="text-xs text-muted-foreground font-mono">{skill.slug}</span>
											</div>
										</div>
										<p className="text-sm text-muted-foreground leading-relaxed flex-1 line-clamp-3">
											{skill.description || "No description."}
										</p>
										<div className="flex items-center gap-2 mt-4">
											<Badge variant="secondary" className="font-medium text-[10px]">{skill.executionMode}</Badge>
										</div>

										<div className="absolute inset-x-0 bottom-0 bg-card/95 backdrop-blur-sm border-t border-border/40 p-4 flex gap-3 translate-y-full group-hover:translate-y-0 transition-transform duration-200 ease-out">
											<CustomButton
												variant="primary"
												showArrow={false}
												className="flex-1 h-9 rounded-xl text-sm font-semibold"
												disabled={busySkillId === skill.id}
												onClick={() => setSelectedSkillForViewer(skill)}
											>
												<EyeIcon className="w-4 h-4 mr-2" /> View
											</CustomButton>

											<AlertDialog>
												<AlertDialogTrigger render={
													<CustomButton variant="danger" showArrow={false} className="flex-1 h-9 rounded-xl text-sm font-semibold" disabled={busySkillId === skill.id}>
														{busySkillId === skill.id ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <Trash2Icon className="w-4 h-4 mr-2" />} Remove
													</CustomButton>
												} />
												<AlertDialogContent>
													<AlertDialogHeader>
														<AlertDialogTitle>Remove Skill?</AlertDialogTitle>
														<AlertDialogDescription>
															Are you sure you want to remove <strong>{skill.name}</strong> from this agent? This action cannot be undone.
														</AlertDialogDescription>
													</AlertDialogHeader>
													<AlertDialogFooter>
														<AlertDialogCancel>Cancel</AlertDialogCancel>
														<AlertDialogAction render={
															<CustomButton variant="danger" size="xs" showArrow={false} onClick={() => handleDetachSkill(skill.id)}>Confirm Remove</CustomButton>
														} className="p-0 border-0 bg-transparent hover:bg-transparent shadow-none ring-0" />
													</AlertDialogFooter>
												</AlertDialogContent>
											</AlertDialog>
										</div>
									</Card>
								))}
							</div>
						)}
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
						{integrations.length === 0 ? (
							<div className="border-2 border-dashed border-border/60 rounded-2xl bg-muted/20 p-10 flex flex-col items-center justify-center text-center">
								<h3 className="font-semibold text-foreground">No integrations connected</h3>
								<p className="text-sm text-muted-foreground mt-1 max-w-sm">Connect apps like Gmail or WhatsApp to let this employee use them.</p>
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
								{integrations.map((app) => (
									<Card key={app.id} className="group relative overflow-hidden border-border/50 bg-card/40 hover:bg-card hover:shadow-md transition-all duration-300 flex flex-col p-5 items-center justify-center text-center min-h-[160px]">
										<div className="w-16 h-16 rounded-2xl bg-background border border-border flex items-center justify-center shadow-sm p-3 mb-3 group-hover:scale-110 transition-transform">
											<img src="/3d-icons/3dicons-link-dynamic-color.png" alt={app.name} className="w-full h-full object-contain" />
										</div>
										<h4 className="font-semibold text-foreground capitalize">{app.name}</h4>
										<span className="text-xs text-muted-foreground mt-0.5">{app.provider}</span>
									</Card>
								))}
							</div>
						)}
					</div>
				)}

			</div>

			{/* Edit Agent Dialog */}
			<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>Edit Employee</DialogTitle>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="name">Name</Label>
							<Input 
								id="name" 
								value={editAgentData.name || ""} 
								onChange={(e) => setEditAgentData({ ...editAgentData, name: e.target.value })} 
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="instructions">System Prompt / Instructions</Label>
							<Textarea 
								id="instructions" 
								className="min-h-[120px]"
								value={editAgentData.instructions || ""} 
								onChange={(e) => setEditAgentData({ ...editAgentData, instructions: e.target.value })} 
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="personality">Personality</Label>
							<Input 
								id="personality" 
								value={editAgentData.personality || ""} 
								onChange={(e) => setEditAgentData({ ...editAgentData, personality: e.target.value })} 
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSavingAgent}>
							Cancel
						</Button>
						<Button onClick={handleSaveAgent} disabled={isSavingAgent}>
							{isSavingAgent && <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />}
							Save Changes
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Add Memory Dialog */}
			<Dialog open={isAddMemoryDialogOpen} onOpenChange={setIsAddMemoryDialogOpen}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>Add Memory Entry</DialogTitle>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="memory-key">Key / Topic</Label>
							<Input 
								id="memory-key" 
								placeholder="e.g. user_preference_language"
								value={newMemory.key} 
								onChange={(e) => setNewMemory({ ...newMemory, key: e.target.value })} 
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="memory-content">Content</Label>
							<Textarea 
								id="memory-content" 
								placeholder="The user prefers communication in Arabic."
								className="min-h-[100px]"
								value={newMemory.content} 
								onChange={(e) => setNewMemory({ ...newMemory, content: e.target.value })} 
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsAddMemoryDialogOpen(false)} disabled={isSavingMemory}>
							Cancel
						</Button>
						<Button onClick={handleAddMemory} disabled={isSavingMemory || !newMemory.key || !newMemory.content}>
							{isSavingMemory && <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />}
							Save Memory
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Visual Workflow Viewer Modal */}
			<WorkflowViewerDialog
				skill={selectedSkillForViewer}
				open={Boolean(selectedSkillForViewer)}
				onOpenChange={(open) => !open && setSelectedSkillForViewer(null)}
			/>
		</div>
	);
}
