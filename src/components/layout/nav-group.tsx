import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import type { SidebarNavGroup, SidebarNavItem } from "@/components/shared/app-shared";
import { ChevronRightIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

function NavGroupItem({ item, pathname }: { item: SidebarNavItem; pathname: string }) {
	const isActive = item.path === pathname || (item.path !== "/" && pathname?.startsWith(item.path || "___"));
	const shouldBeOpen = isActive || item.subItems?.some((i) => pathname === i.path);
	const [open, setOpen] = useState(shouldBeOpen);

	// Instead of a useEffect, derive state safely during render or just keep it simple.
	// We can update state when shouldBeOpen changes if necessary, but typical pattern is
	// tracking the old value. For now, since Next.js router navigations remount or keep state,
	// if we need to sync, it's safer to just let the user toggle. 
	// If it must open on path change:
	const [prevPath, setPrevPath] = useState(pathname);
	if (pathname !== prevPath) {
		setPrevPath(pathname);
		if (shouldBeOpen) setOpen(true);
	}

	return (
		<Collapsible
			className="group/collapsible"
			open={open}
			onOpenChange={setOpen}
			key={item.title}
			render={<SidebarMenuItem />}
		>
			{item.subItems?.length ? (
				<>
					<CollapsibleTrigger render={<SidebarMenuButton isActive={isActive} />}>
						{item.icon}
						<span>{item.title}</span>
						<ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
					</CollapsibleTrigger>
					<CollapsibleContent>
						<SidebarMenuSub>
							{item.subItems?.map((subItem) => (
								<SidebarMenuSubItem key={subItem.title}>
									<SidebarMenuSubButton
										isActive={pathname === subItem.path}
										render={<Link href={subItem.path || "#"} />}
									>
										{subItem.icon}
										<span>{subItem.title}</span>
									</SidebarMenuSubButton>
								</SidebarMenuSubItem>
							))}
						</SidebarMenuSub>
					</CollapsibleContent>
				</>
			) : (
				<SidebarMenuButton isActive={isActive} render={<Link href={item.path || "#"} />}>
					{item.icon}
					<span>{item.title}</span>
				</SidebarMenuButton>
			)}
		</Collapsible>
	);
}

export function NavGroup({ label, items }: SidebarNavGroup) {
	const pathname = usePathname();

	return (
		<SidebarGroup className={label === "Chat History" ? "flex-1 overflow-hidden flex flex-col group-data-[collapsible=icon]:hidden" : ""}>
			{label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
			<SidebarMenu className={label === "Chat History" ? "flex-1 overflow-y-auto" : ""}>
				{items.map((item) => (
					<NavGroupItem key={item.title} item={item} pathname={pathname} />
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}
