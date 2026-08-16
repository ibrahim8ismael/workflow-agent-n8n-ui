"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemMedia,
	ItemTitle,
} from "@/components/ui/item";
import { UsersIcon, PlugIcon, CreditCardIcon, ChevronRightIcon, UserPlusIcon } from "lucide-react";
import Button from "@/components/shared/Button";
import { useTranslation } from "react-i18next";

export function QuickActions() {
	const { t } = useTranslation("dashboard");

	const actions = [
		{
			title: t("manageWorkforce", { defaultValue: "Manage Workforce" }),
			description: t("viewAiEmployees", { defaultValue: "View and edit your AI employees." }),
			href: "/agents",
			icon: <UsersIcon aria-hidden="true" className="w-4 h-4 text-blue-500" />,
		},
		{
			title: t("connectIntegrations", { defaultValue: "Integrations & Tools" }),
			description: t("connectWorkspaceTools", { defaultValue: "Slack, Notion, Stripe, and CRM." }),
			href: "/integrations",
			icon: <PlugIcon aria-hidden="true" className="w-4 h-4 text-emerald-500" />,
		},
		{
			title: t("creditWalletUsage", { defaultValue: "Wallet & Metered Usage" }),
			description: t("manageCreditsPlan", { defaultValue: "Check balances and top-up packages." }),
			href: "/settings",
			icon: <CreditCardIcon aria-hidden="true" className="w-4 h-4 text-amber-500" />,
		},
	] as const;

	return (
		<Card className="flex flex-col">
			<CardHeader>
				<CardTitle>{t("quickActions", { defaultValue: "Quick actions" })}</CardTitle>
				<CardDescription>{t("quickActionsDesc", { defaultValue: "Common workforce shortcuts & destinations." })}</CardDescription>
			</CardHeader>
			<CardContent className="flex-1 flex flex-col gap-4">
				<Button className="w-full justify-between" size="md" href="/new">
					<span className="flex items-center gap-2">
						<UserPlusIcon className="w-4 h-4" />
						{t("hireEmployee", { defaultValue: "Create / Hire Employee" })}
					</span>
				</Button>
				<ItemGroup className="gap-0">
					{actions.map((a) => (
						<Item key={a.title} size="sm" render={<a href={a.href} />}>
							<ItemMedia variant="icon">{a.icon}</ItemMedia>
							<ItemContent>
								<ItemTitle>{a.title}</ItemTitle>
								<ItemDescription className="line-clamp-1">
									{a.description}
								</ItemDescription>
							</ItemContent>
							<ItemActions>
								<ChevronRightIcon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
							</ItemActions>
						</Item>
					))}
				</ItemGroup>
			</CardContent>
		</Card>
	);
}

