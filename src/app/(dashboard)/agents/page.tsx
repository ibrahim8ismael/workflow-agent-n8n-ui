"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import CustomButton from "@/components/shared/Button";
import { PlusIcon, Settings2Icon, ActivityIcon, MoreHorizontalIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

const MOCK_AGENTS = [
	{
		id: "1",
		name: "Alex",
		role: "Customer Support Agent",
		status: "Active",
		description: "Answers customer queries, processes refunds, and escalates angry customers.",
		avatar: "A",
		stats: "1,240 tickets resolved",
		color: "bg-blue-500",
	},
	{
		id: "2",
		name: "Sarah",
		role: "Sales Development Rep",
		status: "Training",
		description: "Outbound lead generation, email outreach, and initial qualification.",
		avatar: "S",
		stats: "Learning from 52 PDFs",
		color: "bg-violet-500",
	},
	{
		id: "3",
		name: "Marcus",
		role: "HR Assistant",
		status: "Draft",
		description: "Onboarding automation and internal policy Q&A for employees.",
		avatar: "M",
		stats: "Needs tool configuration",
		color: "bg-amber-500",
	},
];

export default function AgentsPage() {
	return (
		<div className="flex flex-col gap-6">
			{/* Page Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Your Workforce</h1>
					<p className="text-muted-foreground mt-1">Manage and assign tasks to your AI employees.</p>
				</div>
				<CustomButton href="/new" size="md">
					<PlusIcon className="w-4 h-4 mr-2" />
					Hire Employee
				</CustomButton>
			</div>

			{/* Agents Table */}
			<div className="rounded-lg border bg-card mt-2">
				<Table>
					<TableHeader>
						<TableRow className="border-b hover:bg-transparent">
							<TableHead className="h-12 px-4 font-medium">Employee</TableHead>
							<TableHead className="h-12 px-4 font-medium hidden sm:table-cell">Description</TableHead>
							<TableHead className="h-12 px-4 font-medium">Status</TableHead>
							<TableHead className="h-12 px-4 font-medium text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{MOCK_AGENTS.map((agent) => (
							<TableRow key={agent.id} className="hover:bg-muted/50">
								<TableCell className="px-4 py-3">
									<div className="flex items-center gap-3">
										<Avatar className="h-10 w-10 border border-border shadow-sm">
											<AvatarFallback className={`text-white text-xs font-semibold ${agent.color}`}>
												{agent.avatar}
											</AvatarFallback>
										</Avatar>
										<div className="flex flex-col min-w-0">
											<span className="font-semibold text-sm text-foreground truncate">{agent.name}</span>
											<span className="text-xs font-medium text-muted-foreground truncate">{agent.role}</span>
										</div>
									</div>
								</TableCell>
								<TableCell className="px-4 py-3 hidden sm:table-cell">
									<div className="flex flex-col gap-1 max-w-[300px]">
										<span className="text-sm text-muted-foreground truncate">{agent.description}</span>
										<div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/80 font-medium">
											<ActivityIcon className="w-3 h-3" />
											{agent.stats}
										</div>
									</div>
								</TableCell>
								<TableCell className="px-4 py-3">
									<Badge variant={agent.status === "Active" ? "default" : agent.status === "Training" ? "secondary" : "outline"} className={`font-medium ${agent.status === "Active" ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-transparent" : agent.status === "Training" ? "bg-violet-500/10 text-violet-600 hover:bg-violet-500/20 border-transparent" : "text-muted-foreground"}`}>
										{agent.status}
									</Badge>
								</TableCell>
								<TableCell className="px-4 py-3">
									<div className="flex items-center justify-end gap-2">
										<Button variant="ghost" size="sm" className="h-8 px-2 hidden lg:flex text-xs font-medium">
											<Settings2Icon className="w-3.5 h-3.5 mr-1.5" />
											Manage
										</Button>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
													<MoreHorizontalIcon className="w-4 h-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem>Edit Blueprint</DropdownMenuItem>
												<DropdownMenuItem>Assign Task</DropdownMenuItem>
												<DropdownMenuItem className="text-destructive">Terminate</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
