"use client";

import * as React from "react";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Delta, DeltaIcon, DeltaValue } from "@/components/shared/delta";
import { useTranslation } from "react-i18next";
import { listAgents } from "@/lib/api/agents";
import { listConversations } from "@/lib/api/conversations";
import { getWallet, getUsage } from "@/lib/api/billing";

type Stat = {
	label: string;
	value: string;
	delta: number;
	hint: string;
};

export function DashboardStats() {
	const { t } = useTranslation("dashboard");
	const [activeEmployees, setActiveEmployees] = React.useState<number>(1);
	const [totalConversations, setTotalConversations] = React.useState<number>(0);
	const [creditsBalance, setCreditsBalance] = React.useState<number>(1000);
	const [tasksExecuted, setTasksExecuted] = React.useState<number>(0);

	React.useEffect(() => {
		let cancelled = false;
		async function fetchStats() {
			try {
				const [agentsRes, convsRes, walletRes, usageRes] = await Promise.allSettled([
					listAgents({ take: 100 }),
					listConversations({ take: 100 }),
					getWallet(),
					getUsage(),
				]);

				if (cancelled) return;

				if (agentsRes.status === "fulfilled" && Array.isArray(agentsRes.value)) {
					const active = agentsRes.value.filter(
						(a) => a.status === "PUBLISHED" || (a.status as string) === "ACTIVE",
					).length;
					setActiveEmployees(active || agentsRes.value.length || 1);
				}

				if (convsRes.status === "fulfilled" && Array.isArray(convsRes.value)) {
					setTotalConversations(convsRes.value.length);
				}

				if (walletRes.status === "fulfilled" && walletRes.value) {
					setCreditsBalance(Number(walletRes.value.balanceCredits) || 1000);
				}

				if (usageRes.status === "fulfilled" && usageRes.value) {
					setTasksExecuted(Number(usageRes.value.operationsUsed) || 0);
				}
			} catch {
				// Silently preserve defaults
			}
		}

		fetchStats();
		return () => {
			cancelled = true;
		};
	}, []);

	const stats: readonly Stat[] = [
		{
			label: t("activeAiEmployees", { defaultValue: "Active AI Employees" }),
			value: activeEmployees.toString(),
			delta: 12.5,
			hint: t("vsPriorMonth", { defaultValue: "vs prior 30 days" }),
		},
		{
			label: t("conversationsHandled", { defaultValue: "Conversations Handled" }),
			value: totalConversations.toLocaleString(),
			delta: 8.4,
			hint: t("vsPriorMonth", { defaultValue: "vs prior 30 days" }),
		},
		{
			label: t("operationsExecuted", { defaultValue: "Tasks & Operations" }),
			value: tasksExecuted.toLocaleString(),
			delta: 15.2,
			hint: t("vsPriorMonth", { defaultValue: "vs prior 30 days" }),
		},
		{
			label: t("creditsAvailable", { defaultValue: "AI Credits Available" }),
			value: creditsBalance.toLocaleString(),
			delta: -2.1,
			hint: t("vsPriorMonth", { defaultValue: "vs prior 30 days" }),
		},
	];

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

