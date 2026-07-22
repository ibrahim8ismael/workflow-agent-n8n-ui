import type { ReactNode } from "react";
import { LayoutGridIcon, UsersIcon, GitMergeIcon, FileTextIcon, PlugIcon, MessageSquareIcon, SettingsIcon, HelpCircleIcon, ActivityIcon } from "lucide-react";

export type SidebarNavItem = {
	title: string;
	path?: string;
	icon?: ReactNode;
	isActive?: boolean;
	subItems?: SidebarNavItem[];
};

export type SidebarNavGroup = {
	label: string;
	items: SidebarNavItem[];
};

export const navGroups: SidebarNavGroup[] = [
	{
		label: "",
		items: [
			{
				title: "Dashboard",
				path: "/",
				icon: <LayoutGridIcon />,
				isActive: true,
			},
			{
				title: "Agents",
				path: "/agents",
				icon: <UsersIcon />,
			},
			{
				title: "Apps",
				path: "/apps",
				icon: <PlugIcon />,
			},
			{
				title: "Knowledge",
				path: "/knowledge",
				icon: <FileTextIcon />,
			},
		],
	},
	{
		label: "Chat History",
		items: Array.from({ length: 15 }).map((_, i) => ({
			title: `Chat Session ${i + 1}`,
			path: `#/chat/${i + 1}`,
		})),
	},
];

export const footerNavLinks: SidebarNavItem[] = [
	{
		title: "Seller help",
		path: "#/seller-help",
		icon: (
			<HelpCircleIcon
			/>
		),
	},
	{
		title: "Platform status",
		path: "#/status",
		icon: (
			<ActivityIcon
			/>
		),
	},
];

export const navLinks: SidebarNavItem[] = [
	...navGroups.flatMap((group) =>
		group.items.flatMap((item) =>
			item.subItems?.length ? [item, ...item.subItems] : [item]
		)
	),
	...footerNavLinks,
];
