"use client";
import { useState, useRef } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CustomButton from "@/components/shared/Button";
import { SearchIcon, UploadCloudIcon, FileTextIcon, LinkIcon, MoreHorizontalIcon, UsersIcon, GlobeIcon, FolderIcon, Loader2Icon, EyeIcon, PencilIcon, Trash2Icon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const INITIAL_KNOWLEDGE = [
	{
		id: "1",
		name: "Customer Service SOP 2024.pdf",
		type: "PDF Document",
		size: "2.4 MB",
		agents: 2,
		status: "Synced",
		icon: "/3d-icons/3dicons-folder-dynamic-color.png",
		date: "Oct 12, 2024",
	},
	{
		id: "2",
		name: "Company Leave Policy",
		type: "Text Note",
		size: "12 KB",
		agents: 1,
		status: "Synced",
		icon: "/3d-icons/3dicons-folder-dynamic-color.png",
		date: "Oct 10, 2024",
	},
	{
		id: "3",
		name: "https://efferd.com/pricing",
		type: "Website Crawl",
		size: "14 Pages",
		agents: 3,
		status: "Syncing...",
		icon: "/3d-icons/3dicons-folder-dynamic-color.png",
		date: "Today, 10:42 AM",
	},
	{
		id: "4",
		name: "Product Catalog Q3",
		type: "CSV Database",
		size: "840 KB",
		agents: 1,
		status: "Synced",
		icon: "/3d-icons/3dicons-folder-dynamic-color.png",
		date: "Sep 28, 2024",
	},
];

export default function KnowledgePage() {
	const [knowledge, setKnowledge] = useState(INITIAL_KNOWLEDGE);
	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (files && files.length > 0) {
			const file = files[0];
			
			// Enforce 5MB file size limit
			if (file.size > 5 * 1024 * 1024) {
				alert("File is too large. Maximum size is 5MB.");
				if (fileInputRef.current) fileInputRef.current.value = "";
				return;
			}
			
			setIsUploading(true);
			
			// Simulate network upload delay
			setTimeout(() => {
				const newDoc = {
					id: Date.now().toString(),
					name: file.name,
					type: "Document",
					size: (file.size / 1024 / 1024).toFixed(1) + " MB",
					agents: 0,
					status: "Synced",
					icon: "/3d-icons/3dicons-folder-dynamic-color.png",
					date: "Just now",
				};
				setKnowledge([newDoc, ...knowledge]);
				setIsUploading(false);
				if (fileInputRef.current) fileInputRef.current.value = "";
			}, 2000);
		}
	};

	return (
		<div className="flex flex-col gap-8">
			{/* Page Header */}
			<div className="flex flex-col justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
					<p className="text-muted-foreground mt-1 max-w-xl">Upload documents, import URLs, or write notes. Your AI employees will use this information to answer questions and complete tasks.</p>
				</div>
			</div>

			{/* Drag & Drop Zone */}
			<input 
				type="file" 
				ref={fileInputRef} 
				onChange={handleFileChange} 
				className="hidden" 
				multiple 
				accept=".pdf,.docx,.csv,.txt,.xlsx"
			/>
			<div 
				onClick={handleFileClick}
				className={`border-2 border-dashed rounded-2xl bg-muted/20 transition-colors duration-200 p-10 flex flex-col items-center justify-center text-center cursor-pointer ${isUploading ? 'border-primary/50' : 'border-border/60 hover:bg-muted/40'}`}
			>
				<div className="w-14 h-14 rounded-full bg-background border border-border shadow-sm flex items-center justify-center mb-4">
					{isUploading ? (
						<Loader2Icon className="w-6 h-6 text-primary animate-spin" />
					) : (
						<UploadCloudIcon className="w-6 h-6 text-primary" />
					)}
				</div>
				<h3 className="font-semibold text-lg text-foreground">
					{isUploading ? "Uploading file..." : "Click or drag files to upload"}
				</h3>
				<p className="text-sm text-muted-foreground mt-1 max-w-sm">
					{isUploading ? "Please wait while we process your document." : "Supports PDF, DOCX, CSV, TXT, and Excel files up to 5MB each."}
				</p>
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

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{knowledge.map((item) => (
						<Card key={item.id} className="overflow-hidden border-border/50 bg-card/40 hover:bg-card hover:shadow-sm transition-all duration-300 flex flex-col">
							<div className="p-5 flex-1 flex flex-col">
								<div className="flex items-start justify-between mb-4">
									<div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center shadow-sm shrink-0 overflow-hidden p-1.5">
										<img src={item.icon} alt={item.type} className="w-full h-full object-contain" />
									</div>
									<div className="flex items-center gap-1 -mt-2 -mr-2">
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger render={
													<Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
														<EyeIcon className="w-4 h-4" />
													</Button>
												} />
												<TooltipContent side="top">
													<p>View Source</p>
												</TooltipContent>
											</Tooltip>
											<Tooltip>
												<TooltipTrigger render={
													<Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
														<PencilIcon className="w-4 h-4" />
													</Button>
												} />
												<TooltipContent side="top">
													<p>Edit Metadata</p>
												</TooltipContent>
											</Tooltip>
											<Tooltip>
												<TooltipTrigger render={
													<Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
														<Trash2Icon className="w-4 h-4" />
													</Button>
												} />
												<TooltipContent side="top">
													<p>Delete</p>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									</div>
								</div>
								
								<div className="flex flex-col mb-1">
									<span className="font-semibold text-base text-foreground line-clamp-1">{item.name}</span>
								</div>
								
								<div className="flex items-center gap-2 mt-auto pt-4">
									<Badge variant={item.status === "Synced" ? "secondary" : "outline"} className={`font-medium text-[10px] ${item.status === "Synced" ? "bg-emerald-500/10 text-emerald-600 border-transparent" : "text-amber-600 border-amber-500/30 bg-amber-500/5"}`}>
										{item.status}
									</Badge>
									<span className="text-[11px] text-muted-foreground">{item.type}</span>
									<span className="text-[11px] text-muted-foreground/50 mx-0.5">•</span>
									<span className="text-[11px] text-muted-foreground">{item.size}</span>
								</div>
							</div>
							
							<div className="bg-muted/30 px-5 py-3 border-t border-border/40 flex items-center justify-between">
								<div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
									<UsersIcon className="w-3.5 h-3.5" />
									{item.agents} Agent{item.agents !== 1 ? "s" : ""}
								</div>
								<span className="text-[11px] text-muted-foreground">{item.date}</span>
							</div>
						</Card>
					))}
				</div>
			</div>
		</div>
	);
}
