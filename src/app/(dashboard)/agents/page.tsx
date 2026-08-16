"use client";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
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
import { Skeleton } from "@/components/ui/skeleton";
import CustomButton from "@/components/shared/Button";
import { ApiError } from "@/lib/api/client";
import {
	archiveAgent,
	createAgent,
	deleteAgent,
	listAgents,
	publishAgent,
} from "@/lib/api/agents";
import type { Agent, AgentStatus } from "@/lib/api/types";
import {
	Loader2Icon,
	PlusIcon,
	RocketIcon,
	ArchiveIcon,
	Trash2Icon,
	RefreshCwIcon,
} from "lucide-react";

import Link from "next/link";

const STATUS_META: Record<
	AgentStatus,
	{ label: string; className: string }
> = {
	PUBLISHED: {
		label: "statusActive",
		className: "bg-emerald-500/10 text-emerald-600 border-transparent",
	},
	DRAFT: {
		label: "statusDraft",
		className: "bg-muted text-muted-foreground border-transparent",
	},
	ARCHIVED: {
		label: "statusArchived",
		className: "bg-amber-500/10 text-amber-600 border-transparent",
	},
	ERROR: {
		label: "statusError",
		className: "bg-destructive/10 text-destructive border-transparent",
	},
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

export default function AgentsPage() {
	const { t } = useTranslation("agents");
	const [agents, setAgents] = useState<Agent[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [createOpen, setCreateOpen] = useState(false);
	const [creating, setCreating] = useState(false);
	const [createError, setCreateError] = useState<string | null>(null);
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [instructions, setInstructions] = useState("");

	const [busyId, setBusyId] = useState<string | null>(null);

	useEffect(() => {
		const controller = new AbortController();
		(async () => {
			try {
				setAgents(await listAgents());
				setError(null);
			} catch (err) {
				if (err instanceof ApiError) {
					setError(err.message);
				} else {
					setError(t("loadError", { defaultValue: "Could not load your workforce. Please try again." }));
				}
			} finally {
				setLoading(false);
			}
		})();
		return () => controller.abort();
	}, []);

	const retry = async () => {
		setLoading(true);
		setError(null);
		try {
			setAgents(await listAgents());
			setError(null);
		} catch (err) {
			if (err instanceof ApiError) {
				setError(err.message);
			} else {
				setError(t("loadError", { defaultValue: "Could not load your workforce. Please try again." }));
			}
		} finally {
			setLoading(false);
		}
	};

	const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!name.trim() || creating) return;
		setCreating(true);
		setCreateError(null);
		try {
			const agent = await createAgent({
				name: name.trim(),
				description: description.trim() || undefined,
				instructions: instructions.trim() || undefined,
			});
			setAgents((prev) => [agent, ...prev]);
			setCreateOpen(false);
			setName("");
			setDescription("");
			setInstructions("");
		} catch (err) {
			if (err instanceof ApiError) {
				setCreateError(err.message);
			} else {
				setCreateError(t("createError", { defaultValue: "Could not create the employee. Please try again." }));
			}
		} finally {
			setCreating(false);
		}
	};

	const handleToggleStatus = async (agent: Agent) => {
		if (busyId) return;
		setBusyId(agent.id);
		try {
			const updated =
				agent.status === "PUBLISHED"
					? await archiveAgent(agent.id)
					: await publishAgent(agent.id);
			setAgents((prev) => prev.map((a) => (a.id === agent.id ? updated : a)));
		} catch (err) {
			if (err instanceof ApiError) {
				setError(err.message);
			} else {
				setError(t("updateError", { defaultValue: "Could not update the employee. Please try again." }));
			}
		} finally {
			setBusyId(null);
		}
	};

	const handleDelete = async (agent: Agent) => {
		if (busyId) return;
		setBusyId(agent.id);
		try {
			await deleteAgent(agent.id);
			setAgents((prev) => prev.filter((a) => a.id !== agent.id));
		} catch (err) {
			if (err instanceof ApiError) {
				setError(err.message);
			} else {
				setError(t("deleteErrorMsg", { defaultValue: "Could not delete the employee. Please try again." }));
			}
		} finally {
			setBusyId(null);
		}
	};

	return (
		<div className="flex flex-col gap-6">
			{/* Page Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">{t("yourWorkforce", { defaultValue: "Your Workforce" })}</h1>
					<p className="text-muted-foreground mt-1">{t("manageTasks", { defaultValue: "Manage and assign tasks to your AI employees." })}</p>
				</div>
				<Dialog open={createOpen} onOpenChange={setCreateOpen}>
					<DialogTrigger render={<CustomButton size="sm"><PlusIcon className="w-4 h-4 me-2" /> {t("createEmployee", { defaultValue: "Create Employee" })}</CustomButton>} />
					<DialogContent>
						<form onSubmit={handleCreate}>
							<DialogHeader>
								<DialogTitle>{t("createEmployee", { defaultValue: "Create Employee" })}</DialogTitle>
								<DialogDescription>
									{t("createEmployeeDesc", { defaultValue: "Give your new AI employee a name and a short description." })}
								</DialogDescription>
							</DialogHeader>
							<div className="flex flex-col gap-4 py-2">
								<div className="flex flex-col gap-1.5">
									<Label htmlFor="agent-name">{t("name", { defaultValue: "Name" })}</Label>
									<Input
										id="agent-name"
										placeholder={t("namePlaceholder", { defaultValue: "e.g. Copilot" })}
										required
										maxLength={255}
										value={name}
										onChange={(e) => setName(e.target.value)}
									/>
								</div>
								<div className="flex flex-col gap-1.5">
									<Label htmlFor="agent-description">{t("description", { defaultValue: "Description" })}</Label>
									<Textarea
										id="agent-description"
										placeholder={t("descriptionPlaceholder", { defaultValue: "What does this employee do?" })}
										rows={3}
										value={description}
										onChange={(e) => setDescription(e.target.value)}
									/>
								</div>
								<div className="flex flex-col gap-1.5">
									<Label htmlFor="agent-instructions">{t("instructions", { defaultValue: "Instructions" })}</Label>
									<Textarea
										id="agent-instructions"
										placeholder={t("instructionsPlaceholder", { defaultValue: "System prompt / behavior guidelines" })}
										rows={3}
										value={instructions}
										onChange={(e) => setInstructions(e.target.value)}
									/>
								</div>
								{createError && (
									<p role="alert" className="text-sm text-destructive">{createError}</p>
								)}
							</div>
							<DialogFooter>
								<Button type="submit" disabled={creating || !name.trim()}>
									{creating && <Loader2Icon className="w-4 h-4 animate-spin" />}
									{creating ? t("creating", { defaultValue: "Creating…" }) : t("create", { defaultValue: "Create" })}
								</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			{error && (
				<div className="flex items-center justify-between rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
					<span>{error}</span>
					<Button variant="ghost" size="sm" onClick={retry}>
						<RefreshCwIcon className="w-4 h-4 me-1.5" /> {t("retry", { defaultValue: "Retry" })}
					</Button>
				</div>
			)}

			{/* Agents Grid */}
			{loading ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-2">
					{[...Array(4)].map((_, i) => (
						<Card key={i} className="border-border/50 p-5 flex flex-col gap-4">
							<div className="flex items-start justify-between">
								<Skeleton className="h-12 w-12 rounded-full" />
								<Skeleton className="h-5 w-16" />
							</div>
							<Skeleton className="h-5 w-2/3" />
							<Skeleton className="h-3 w-full" />
							<Skeleton className="h-3 w-4/5" />
							<Skeleton className="h-9 w-full mt-2" />
						</Card>
					))}
				</div>
			) : agents.length === 0 && !error ? (
				<div className="border-2 border-dashed border-border/60 rounded-2xl bg-muted/20 p-12 flex flex-col items-center justify-center text-center">
					<h3 className="font-semibold text-lg text-foreground">{t("noEmployeesYet", { defaultValue: "No employees yet" })}</h3>
					<p className="text-sm text-muted-foreground mt-1 max-w-sm">
						{t("createFirstEmployee", { defaultValue: "Create your first AI employee to start building your workforce." })}
					</p>
					<CustomButton size="sm" className="mt-5" onClick={() => setCreateOpen(true)}>
						<PlusIcon className="w-4 h-4 me-2" /> {t("createEmployee", { defaultValue: "Create Employee" })}
					</CustomButton>
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-2">
					{agents.map((agent) => {
						const statusMeta = STATUS_META[agent.status] ?? STATUS_META.DRAFT;
						const isPublished = agent.status === "PUBLISHED";
						return (
							<Card key={agent.id} className="overflow-hidden border-border/50 bg-card/40 hover:bg-card hover:shadow-sm transition-all duration-300 flex flex-col group">
								{/* Clickable Area */}
								<Link href={`/agent/${agent.id}`} className="p-5 flex-1 flex flex-col">
									<div className="flex items-start justify-between mb-4">
										<Avatar className="h-12 w-12 border border-border shadow-sm">
											<AvatarFallback className={`text-white text-lg font-semibold ${avatarColor(agent.name)}`}>
												{initials(agent.name)}
											</AvatarFallback>
										</Avatar>
										<Badge variant={isPublished ? "default" : "secondary"} className={`font-medium ${statusMeta.className}`}>
											{t(statusMeta.label)}
										</Badge>
									</div>

									<div className="flex flex-col mb-2">
										<span className="font-semibold text-lg text-foreground truncate">{agent.name}</span>
										<span className="text-sm font-medium text-primary truncate mb-3">{agent.model}</span>
										<p className="text-sm text-muted-foreground line-clamp-3">
											{agent.description || t("noDescription", { defaultValue: "No description yet." })}
										</p>
									</div>

									<div className="mt-auto pt-4 flex items-center text-xs text-muted-foreground">
										<span className="truncate">
											{t("created", { defaultValue: "Created" })} {new Date(agent.createdAt).toLocaleDateString()}
										</span>
									</div>
								</Link>

								<div className="bg-muted/30 px-5 py-3 border-t border-border/40 flex items-center gap-2">
									<CustomButton href={`/agent/${agent.id}`} size="sm" className="flex-1 justify-center py-1.5 text-xs shadow-sm" showArrow={false}>
										{t("view", { defaultValue: "View" })}
									</CustomButton>
									<CustomButton
										variant="secondary"
										size="sm"
										className="justify-center py-1.5 text-xs shadow-sm"
										showArrow={false}
										disabled={busyId === agent.id}
										onClick={() => handleToggleStatus(agent)}
									>
										{busyId === agent.id ? (
											<Loader2Icon className="w-3.5 h-3.5 animate-spin" />
										) : isPublished ? (
											<ArchiveIcon className="w-3.5 h-3.5" />
										) : (
											<RocketIcon className="w-3.5 h-3.5" />
										)}
									</CustomButton>
									<AlertDialog>
										<AlertDialogTrigger render={
											<CustomButton variant="danger" size="sm" className="justify-center py-1.5 text-xs shadow-sm" showArrow={false} disabled={busyId === agent.id}>
												<Trash2Icon className="w-3.5 h-3.5" />
											</CustomButton>
										} />
										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle>{t("deleteEmployeeQ", { defaultValue: "Delete Employee?" })}</AlertDialogTitle>
												<AlertDialogDescription>
													{t("deleteConfirmText", { defaultValue: "Are you sure you want to delete " })}<strong>{agent.name}</strong>{t("deleteUndone", { defaultValue: "? This cannot be undone." })}
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel>{t("cancel", { defaultValue: "Cancel" })}</AlertDialogCancel>
												<AlertDialogAction render={
													<CustomButton variant="danger" size="xs" showArrow={false} onClick={() => handleDelete(agent)}>{t("confirmDelete", { defaultValue: "Confirm Delete" })}</CustomButton>
												} className="p-0 border-0 bg-transparent hover:bg-transparent shadow-none ring-0" />
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								</div>
							</Card>
						);
					})}
				</div>
			)}
		</div>
	);
}
