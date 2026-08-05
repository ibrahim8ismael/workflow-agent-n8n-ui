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
import { useTranslation } from "react-i18next";

function getItemTitle(t: (key: string) => string, title: string) {
  const key = title.toLowerCase().replace(/\s+/g, "");
  const translated = t(key);
  return translated !== key ? translated : title;
}

function NavGroupItem({ item, pathname }: { item: SidebarNavItem; pathname: string }) {
	const { t } = useTranslation("sidebar");
	const isActive = item.path === pathname || (item.path !== "/" && pathname?.startsWith(item.path || "___"));
	const shouldBeOpen = isActive || item.subItems?.some((i) => pathname === i.path);
	const [open, setOpen] = useState(shouldBeOpen);

	const [prevPath, setPrevPath] = useState(pathname);
	if (pathname !== prevPath) {
		setPrevPath(pathname);
		if (shouldBeOpen) setOpen(true);
	}

	const title = getItemTitle(t, item.title);

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
						<span>{title}</span>
						<ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 rtl:rotate-180 rtl:group-data-[state=open]/collapsible:rotate-90" />
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
										<span>{getItemTitle(t, subItem.title)}</span>
									</SidebarMenuSubButton>
								</SidebarMenuSubItem>
							))}
						</SidebarMenuSub>
					</CollapsibleContent>
				</>
			) : (
				<SidebarMenuButton isActive={isActive} render={<Link href={item.path || "#"} />}>
					{item.icon}
					<span>{title}</span>
				</SidebarMenuButton>
			)}
		</Collapsible>
	);
}

export function NavGroup({ label, items }: SidebarNavGroup) {
	const pathname = usePathname();
	const { t } = useTranslation(["sidebar", "conversations"]);

	const groupLabel = label ? (t(`sidebar:${label.toLowerCase().replace(/\s+/g, "")}`, { defaultValue: t(`conversations:${label.toLowerCase().replace(/\s+/g, "")}`, { defaultValue: label }) })) : "";

	return (
		<SidebarGroup className={label === "Chat History" ? "flex-1 overflow-hidden flex flex-col group-data-[collapsible=icon]:hidden" : ""}>
			{groupLabel && <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>}
			<SidebarMenu className={label === "Chat History" ? "flex-1 overflow-y-auto" : ""}>
				{items.map((item) => (
					<NavGroupItem key={item.title} item={item} pathname={pathname} />
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}

