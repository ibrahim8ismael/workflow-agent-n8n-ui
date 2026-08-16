import type { ReactNode } from "react";
import { LayoutGridIcon, UsersIcon, PlugIcon, SettingsIcon, HelpCircleIcon, ActivityIcon } from "lucide-react";

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
		title: "Seller help",
		path: "/settings",
		icon: (
			<HelpCircleIcon
			/>
		),
	},
	{
		title: "Platform status",
		path: "/settings",
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
