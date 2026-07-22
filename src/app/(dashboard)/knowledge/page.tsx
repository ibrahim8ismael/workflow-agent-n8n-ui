"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CustomButton from "@/components/shared/Button";
import { SearchIcon, UploadCloudIcon, FileTextIcon, LinkIcon, MoreHorizontalIcon, UsersIcon, GlobeIcon, FolderIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const MOCK_KNOWLEDGE = [
	{
		id: "1",
		name: "Customer Service SOP 2024.pdf",
		type: "PDF Document",
		size: "2.4 MB",
		agents: 2,
		status: "Synced",
		icon: FileTextIcon,
		date: "Oct 12, 2024",
	},
	{
		id: "2",
		name: "Company Leave Policy",
		type: "Text Note",
		size: "12 KB",
		agents: 1,
		status: "Synced",
		icon: FileTextIcon,
		date: "Oct 10, 2024",
	},
	{
		id: "3",
		name: "https://efferd.com/pricing",
		type: "Website Crawl",
		size: "14 Pages",
		agents: 3,
		status: "Syncing...",
		icon: GlobeIcon,
		date: "Today, 10:42 AM",
	},
	{
		id: "4",
		name: "Product Catalog Q3",
		type: "CSV Database",
		size: "840 KB",
		agents: 1,
		status: "Synced",
		icon: FolderIcon,
		date: "Sep 28, 2024",
	},
];

export default function KnowledgePage() {
	return (
		<div className="flex flex-col gap-8">
			{/* Page Header */}
			<div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
					<p className="text-muted-foreground mt-1 max-w-xl">Upload documents, import URLs, or write notes. Your AI employees will use this information to answer questions and complete tasks.</p>
				</div>
				<div className="flex items-center gap-3">
					<Button variant="outline" className="h-10 bg-background">
						<LinkIcon className="w-4 h-4 mr-2" />
						Sync Website
					</Button>
					<CustomButton size="md" showArrow={false}>
						<UploadCloudIcon className="w-4 h-4 mr-2" />
						Upload Files
					</CustomButton>
				</div>
			</div>

			{/* Drag & Drop Zone */}
			<div className="border-2 border-dashed border-border/60 rounded-2xl bg-muted/20 hover:bg-muted/40 transition-colors duration-200 p-10 flex flex-col items-center justify-center text-center cursor-pointer">
				<div className="w-14 h-14 rounded-full bg-background border border-border shadow-sm flex items-center justify-center mb-4">
					<UploadCloudIcon className="w-6 h-6 text-primary" />
				</div>
				<h3 className="font-semibold text-lg text-foreground">Click or drag files to upload</h3>
				<p className="text-sm text-muted-foreground mt-1 max-w-sm">Supports PDF, DOCX, CSV, TXT, and Excel files up to 50MB each.</p>
			</div>

			{/* Documents List */}
			<div className="flex flex-col gap-4">
				<div className="flex items-center justify-between">
					<h2 className="text-xl font-semibold tracking-tight">Active Knowledge Sources</h2>
					<div className="relative w-[250px]">
						<SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
						<Input placeholder="Search sources..." className="pl-9 h-9 rounded-lg bg-background" />
					</div>
				</div>

				<div className="rounded-xl border border-border bg-card overflow-hidden">
					<div className="grid grid-cols-12 gap-4 p-4 border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground">
						<div className="col-span-5 sm:col-span-6">Name</div>
						<div className="col-span-3 sm:col-span-2 hidden sm:block">Size</div>
						<div className="col-span-4 sm:col-span-2">Access</div>
						<div className="col-span-3 sm:col-span-2 text-right">Status</div>
					</div>
					
					<div className="divide-y divide-border">
						{MOCK_KNOWLEDGE.map((item) => (
							<div key={item.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/20 transition-colors">
								<div className="col-span-5 sm:col-span-6 flex items-center gap-3">
									<div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center shrink-0 shadow-sm">
										<item.icon className="w-5 h-5 text-muted-foreground" />
									</div>
									<div className="flex flex-col min-w-0">
										<span className="font-medium text-sm text-foreground truncate">{item.name}</span>
										<span className="text-xs text-muted-foreground truncate">{item.type} • {item.date}</span>
									</div>
								</div>
								<div className="col-span-3 sm:col-span-2 hidden sm:flex text-sm text-muted-foreground">
									{item.size}
								</div>
								<div className="col-span-4 sm:col-span-2 flex items-center gap-1.5 text-sm text-muted-foreground">
									<UsersIcon className="w-3.5 h-3.5" />
									{item.agents} Agent{item.agents > 1 ? "s" : ""}
								</div>
								<div className="col-span-3 sm:col-span-2 flex items-center justify-end gap-3">
									<Badge variant={item.status === "Synced" ? "secondary" : "outline"} className={`font-medium ${item.status === "Synced" ? "bg-emerald-500/10 text-emerald-600 border-transparent hover:bg-emerald-500/20" : "text-amber-600 border-amber-500/30 bg-amber-500/5"}`}>
										{item.status}
									</Badge>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground">
												<MoreHorizontalIcon className="w-4 h-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem>View Source</DropdownMenuItem>
											<DropdownMenuItem>Manage Access</DropdownMenuItem>
											<DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
