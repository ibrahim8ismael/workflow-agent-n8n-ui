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
import { footerNavLinks, navGroups } from "@/components/shared/app-shared";
import { LatestChange } from "@/components/dashboard/latest-change";
import CustomButton from "@/components/shared/Button";
import { PlusIcon } from "lucide-react";

import { NavUser } from "@/components/layout/nav-user";

export function AppSidebar() {
	return (
		<Sidebar collapsible="icon" variant="floating">
			<SidebarHeader className="h-16 flex flex-row items-center justify-between px-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
				<a href="#link" className="flex justify-start items-center overflow-hidden group-data-[collapsible=icon]:hidden">
					<LogoIcon className="w-6 h-6 object-contain shrink-0 transition-all" />
					<span className="font-bold text-xl tracking-tight ml-2">woops</span>
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
								New chat
							</span>
							<PlusIcon className="hidden w-4 h-4 group-data-[collapsible=icon]:block" />
						</CustomButton>
					</SidebarMenuItem>
				</SidebarGroup>
				{navGroups.map((group, index) => {
					if (group.label === "Chat History") {
						return (
							<div key={`sidebar-group-${index}`} className="mt-12 flex-1 overflow-hidden flex flex-col">
								<NavGroup {...group} />
							</div>
						);
					}
					return <NavGroup key={`sidebar-group-${index}`} {...group} />;
				})}
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
