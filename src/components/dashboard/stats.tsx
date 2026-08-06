"use client";

import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Delta, DeltaIcon, DeltaValue } from "@/components/shared/delta";
import { useTranslation } from "react-i18next";

type Stat = {
	label: string;
	value: string;
	delta: number;
	hint: string;
};

export function DashboardStats() {
	const { t } = useTranslation("dashboard");

	const stats: readonly Stat[] = [
		{
			label: t("totalRevenue", { defaultValue: "Total revenue" }),
			value: "$284,920",
			delta: 8.2,
			hint: t("vsPrior30Days", { defaultValue: "vs prior 30 days" }),
		},
		{
			label: t("orders", { defaultValue: "Orders" }),
			value: "1,842",
			delta: 4.1,
			hint: t("vsPrior30Days", { defaultValue: "vs prior 30 days" }),
		},
		{
			label: t("averageOrderValue", { defaultValue: "Average order value" }),
			value: "$154.60",
			delta: -1.3,
			hint: t("vsPrior30Days", { defaultValue: "vs prior 30 days" }),
		},
		{
			label: t("storeConversion", { defaultValue: "Store conversion" }),
			value: "3.06%",
			delta: 0.6,
			hint: t("vsPrior30Days", { defaultValue: "vs prior 30 days" }),
		},
	] as const;

	return (
		<>
			{stats.map((s) => (
				<StatCard key={s.label} stat={s} />
			))}
		</>
	);
}

function StatCard({ stat }: { stat: Stat }) {
	const { label, value, delta, hint } = stat;
	return (
		<Card>
			<CardHeader>
				<CardTitle className="font-normal text-muted-foreground text-xs">
					{label}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<p className="text-balance font-semibold text-2xl tabular-nums tracking-tight">
					{value}
				</p>
			</CardContent>
			<CardFooter className="gap-1.5 text-xs">
				<Delta value={delta} variant="default">
					<DeltaIcon />
					<DeltaValue />
				</Delta>
				<span className="text-pretty text-muted-foreground">{hint}</span>
			</CardFooter>
		</Card>
	);
}
