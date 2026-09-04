import type { ReactNode } from "react";
import { LayoutGridIcon, UsersIcon, PlugIcon, SettingsIcon, HelpCircleIcon, ActivityIcon, WorkflowIcon } from "lucide-react";

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
				title: "Automations",
				path: "/automations",
				icon: <WorkflowIcon />,
			},
			{
				title: "Integrations",
				path: "/integrations",
				icon: <PlugIcon />,
			},
			{
				title: "Settings",
				path: "/settings",
				icon: <SettingsIcon />,
			},
		],
	},
];

export const footerNavLinks: SidebarNavItem[] = [
	{
		title: "Help & Docs",
		path: "/settings",
		icon: <HelpCircleIcon />,
	},
	{
		title: "Platform Status",
		path: "/settings",
		icon: <ActivityIcon />,
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
