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
import { TruckIcon, SettingsIcon, DownloadIcon, ChevronRightIcon, MessageSquarePlusIcon } from "lucide-react";
import Button from "@/components/shared/Button";
import { useTranslation } from "react-i18next";

export function QuickActions() {
	const { t } = useTranslation("dashboard");

	const actions = [
		{
			title: t("reviewUnfulfilled", { defaultValue: "Review unfulfilled" }),
			description: t("ordersWaitingToShip", { defaultValue: "Orders waiting to ship." }),
			href: "#",
			icon: (
				<TruckIcon aria-hidden="true" />
			),
		},
		{
			title: t("storeSettings", { defaultValue: "Store settings" }),
			description: t("paymentsCheckouts", { defaultValue: "Payments, checkouts etc." }),
			href: "#",
			icon: (
				<SettingsIcon aria-hidden="true" />
			),
		},
		{
			title: t("exportSales", { defaultValue: "Export sales" }),
			description: t("csvForAccountings", { defaultValue: "CSV for accountings." }),
			href: "#",
			icon: (
				<DownloadIcon aria-hidden="true" />
			),
		},
	] as const;

	return (
		<Card className="flex flex-col">
			<CardHeader>
				<CardTitle>{t("quickActions", { defaultValue: "Quick actions" })}</CardTitle>
				<CardDescription>{t("quickActionsDesc", { defaultValue: "Shortcuts to same destinations." })}</CardDescription>
			</CardHeader>
			<CardContent className="flex-1 flex flex-col gap-4">
				<Button className="w-full justify-between" size="md" href="/new">
					<span className="flex items-center gap-2">
						<MessageSquarePlusIcon className="w-4 h-4" />
						{t("newChat", { defaultValue: "New chat" })}
					</span>
				</Button>
				<ItemGroup className="gap-0">
					{actions.map((a) => (
						<Item key={a.title} size="sm" render={<a href={a.href} />}><ItemMedia variant="icon">{a.icon}</ItemMedia><ItemContent>
                        									<ItemTitle>{a.title}</ItemTitle>
                        									<ItemDescription className="line-clamp-1">
                        										{a.description}
                        									</ItemDescription>
                        								</ItemContent><ItemActions>
                        									<ChevronRightIcon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                        								</ItemActions></Item>
					))}
				</ItemGroup>
			</CardContent>
		</Card>
	);
}
