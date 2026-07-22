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
import type { SidebarNavGroup } from "@/components/shared/app-shared";
import { ChevronRightIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function NavGroup({ label, items }: SidebarNavGroup) {
	const pathname = usePathname();

	return (
		<SidebarGroup className={label === "Chat History" ? "flex-1 overflow-hidden flex flex-col group-data-[collapsible=icon]:hidden" : ""}>
			{label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
			<SidebarMenu className={label === "Chat History" ? "flex-1 overflow-y-auto" : ""}>
				{items.map((item) => {
					const isActive = item.path === pathname || (item.path !== "/" && pathname?.startsWith(item.path || "___"));
					
					return (
					<Collapsible className="group/collapsible" defaultOpen={
                    							isActive ||
                    							item.subItems?.some((i) => pathname === i.path)
                    						} key={item.title} render={<SidebarMenuItem />}>{item.subItems?.length ? (
                    								<>
                    									<CollapsibleTrigger render={<SidebarMenuButton isActive={isActive} />}>{item.icon}<span>{item.title}</span><ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" /></CollapsibleTrigger>
                    									<CollapsibleContent>
                    										<SidebarMenuSub>
                    											{item.subItems?.map((subItem) => (
                    												<SidebarMenuSubItem key={subItem.title}>
                    													<SidebarMenuSubButton isActive={pathname === subItem.path} render={<Link href={subItem.path || "#"} />}>{subItem.icon}<span>{subItem.title}</span></SidebarMenuSubButton>
                    												</SidebarMenuSubItem>
                    											))}
                    										</SidebarMenuSub>
                    									</CollapsibleContent>
                    								</>
                    							) : (
                    								<SidebarMenuButton isActive={isActive} render={<Link href={item.path || "#"} />}>{item.icon}<span>{item.title}</span></SidebarMenuButton>
                    							)}</Collapsible>
				)})}
			</SidebarMenu>
		</SidebarGroup>
	);
}
