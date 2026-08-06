"use client";

import { LogoIcon } from "@/components/shared/logo";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { CustomSidebarTrigger } from "@/components/layout/custom-sidebar-trigger";
import { NavGroup } from "@/components/layout/nav-group";
import { navGroups } from "@/components/shared/app-shared";
import CustomButton from "@/components/shared/Button";
import { PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { listConversations } from "@/lib/api/conversations";
import type { Conversation } from "@/lib/api/types";
import { SidebarGroupLabel } from "@/components/ui/sidebar";

function ChatHistory() {
	const pathname = usePathname();
	const [conversations, setConversations] = useState<Conversation[]>([]);

	useEffect(() => {
		let cancelled = false;
		// Include legacy chats created before conversation ownership was sent by the client.
		listConversations({ status: "ACTIVE", take: 50 })
			.then((items) => { if (!cancelled) setConversations(items); })
			.catch(() => { if (!cancelled) setConversations([]); });
		return () => { cancelled = true; };
	}, [pathname]);

	return (
		<SidebarGroup className="mt-12 flex-1 overflow-hidden group-data-[collapsible=icon]:hidden">
			<SidebarGroupLabel>Chat History</SidebarGroupLabel>
			<SidebarMenu className="flex-1 overflow-y-auto">
				{conversations.map((conversation) => (
					<SidebarMenuItem key={conversation.id}>
						<SidebarMenuButton render={<Link href={`/new/${conversation.id}`} />}>
							<span className="truncate">{conversation.title || "New chat"}</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}

import { NavUser } from "@/components/layout/nav-user";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/providers/language-provider";

export function AppSidebar() {
	const { t } = useTranslation("sidebar");
	const { isRTL } = useLanguage();
	
	return (
		<Sidebar collapsible="icon" variant="floating" side={isRTL ? "right" : "left"}>
			<SidebarHeader className="h-16 flex flex-row items-center justify-between px-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
				<a href="#link" className="flex justify-start items-center overflow-hidden group-data-[collapsible=icon]:hidden">
					<LogoIcon className="w-6 h-6 object-contain shrink-0 transition-all" />
					<span className="font-bold text-xl tracking-tight ms-2">woops</span>
				</a>
				<CustomSidebarTrigger />
			</SidebarHeader>
			<SidebarContent className="overflow-hidden">
				<SidebarGroup>
					<SidebarMenuItem className="flex items-center gap-2">
						<CustomButton
							className="w-full justify-start px-3 py-1.5 group-data-[collapsible=icon]:!w-8 group-data-[collapsible=icon]:!h-8 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center [&>span>svg]:shrink-0"
							size="sm"
							showArrow={false}
							href="/new"
						>
							<span className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
								<PlusIcon className="w-4 h-4" />
								{t("newChat", { defaultValue: "New chat" })}
							</span>
							<PlusIcon className="hidden w-4 h-4 group-data-[collapsible=icon]:block" />
						</CustomButton>
					</SidebarMenuItem>
				</SidebarGroup>
				{navGroups.map((group, index) => <NavGroup key={`sidebar-group-${index}`} {...group} />)}
				<ChatHistory />
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<NavUser />
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
