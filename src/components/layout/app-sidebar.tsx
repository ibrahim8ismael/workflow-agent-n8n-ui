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
import { listConversationMessages, listConversations } from "@/lib/api/conversations";
import type { Conversation } from "@/lib/api/types";
import { SidebarGroupLabel } from "@/components/ui/sidebar";
import { useTranslation } from "react-i18next";

function ChatHistory() {
	const pathname = usePathname();
	const [conversations, setConversations] = useState<Conversation[]>([]);
	const { t } = useTranslation("sidebar");

	useEffect(() => {
		let cancelled = false;
		listConversations({ status: "ACTIVE", take: 50 })
			.then(async (items) => {
				const titled = items.filter((c) => c.title !== "New chat");
				const untitled = items.filter((c) => c.title === "New chat").slice(0, 5);
				const toCheck = [...titled, ...untitled];
				const visibleItems = await Promise.all(toCheck.map(async (conversation) => {
					if (conversation.title !== "New chat") return conversation;
					try {
						const messages = await listConversationMessages(conversation.id, { take: 1 });
						return messages.length > 0 ? conversation : null;
					} catch {
						return null;
					}
				}));
				if (!cancelled) setConversations(visibleItems.filter((conversation): conversation is Conversation => conversation !== null));
			})
			.catch(() => { if (!cancelled) setConversations([]); });
		return () => { cancelled = true; };
	}, [pathname]);

	return (
		<SidebarGroup className="mt-12 flex-1 overflow-hidden group-data-[collapsible=icon]:hidden">
			<SidebarGroupLabel>{t("chatHistory")}</SidebarGroupLabel>
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
import { useLanguage } from "@/components/providers/language-provider";

export function AppSidebar() {
	const { t } = useTranslation("sidebar");
	const { isRTL } = useLanguage();
	
	return (
		<Sidebar collapsible="icon" variant="floating" side={isRTL ? "right" : "left"}>
			<SidebarHeader className="h-16 flex flex-row items-center justify-between px-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
				<Link href="/" className="flex justify-start items-center overflow-hidden group-data-[collapsible=icon]:hidden">
					<LogoIcon className="w-6 h-6 object-contain shrink-0 transition-all" />
					<span className="font-bold text-xl tracking-tight ms-2">woops</span>
				</Link>
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
