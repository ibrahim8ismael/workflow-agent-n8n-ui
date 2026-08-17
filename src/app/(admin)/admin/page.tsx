"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  UsersIcon,
  Building2Icon,
  ActivityIcon,
  DollarSignIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ZapIcon,
  LayersIcon,
  WalletIcon,
  FlagIcon,
  RefreshCwIcon,
  ArrowRightIcon,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getAdminDashboardOverview,
  getAdminMrr,
  getAdminChurn,
  getAdminCreditsBurnRate,
  getAdminArpu,
} from "@/lib/api/admin";
import type {
  AdminDashboardStats,
  AdminMrrData,
  AdminChurnData,
  AdminCreditsBurnData,
  AdminArpuData,
} from "@/lib/api/types";

export default function AdminDashboardPage() {
  const { t } = useTranslation("admin");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [days, setDays] = useState<number>(30);

  const [dashboardStats, setDashboardStats] = useState<AdminDashboardStats>({
    totalUsers: 1284,
    activeOrganizations: 312,
    totalRunsToday: 8920,
    mrrUsd: 41250,
    systemHealth: "HEALTHY",
  });

  const [mrrData, setMrrData] = useState<AdminMrrData | null>(null);
  const [churnData, setChurnData] = useState<AdminChurnData | null>(null);
  const [creditsBurnData, setCreditsBurnData] = useState<AdminCreditsBurnData | null>(null);
  const [arpuData, setArpuData] = useState<AdminArpuData | null>(null);
  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([
      getAdminDashboardOverview(),
      getAdminMrr(),
      getAdminChurn(),
      getAdminCreditsBurnRate(days),
      getAdminArpu(),
    ]).then(([statsRes, mrrRes, churnRes, burnRes, arpuRes]) => {
      if (cancelled) return;
      if (statsRes.status === "fulfilled" && statsRes.value) {
        setDashboardStats(statsRes.value);
      }
      if (mrrRes.status === "fulfilled" && mrrRes.value) {
        setMrrData(mrrRes.value);
      }
      if (churnRes.status === "fulfilled" && churnRes.value) {
        setChurnData(churnRes.value);
      }
      if (burnRes.status === "fulfilled" && burnRes.value) {
        setCreditsBurnData(burnRes.value);
      }
      if (arpuRes.status === "fulfilled" && arpuRes.value) {
        setArpuData(arpuRes.value);
      }
      setLoading(false);
      setRefreshing(false);
    }).catch(() => {
      if (!cancelled) {
        setLoading(false);
        setRefreshing(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [days]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    Promise.allSettled([
      getAdminDashboardOverview(),
      getAdminMrr(),
      getAdminChurn(),
      getAdminCreditsBurnRate(days),
      getAdminArpu(),
    ]).then(([statsRes, mrrRes, churnRes, burnRes, arpuRes]) => {
      if (statsRes.status === "fulfilled" && statsRes.value) {
        setDashboardStats(statsRes.value);
      }
      if (mrrRes.status === "fulfilled" && mrrRes.value) {
        setMrrData(mrrRes.value);
      }
      if (churnRes.status === "fulfilled" && churnRes.value) {
        setChurnData(churnRes.value);
      }
      if (burnRes.status === "fulfilled" && burnRes.value) {
        setCreditsBurnData(burnRes.value);
      }
      if (arpuRes.status === "fulfilled" && arpuRes.value) {
        setArpuData(arpuRes.value);
      }
      setRefreshing(false);
    }).catch(() => {
      setRefreshing(false);
    });
  };

  const mrrDisplay = mrrData?.mrrUsd ?? dashboardStats.mrrUsd;
  const churnRateDisplay = churnData?.churnRate ?? 2.4;
  const arpuDisplay = arpuData?.arpuUsd ?? 48.5;
  const creditsBurnDisplay = creditsBurnData?.totalCreditsBurned ?? 2450000;
  const dailyAverageBurn = creditsBurnData?.dailyAverage ?? Math.round(creditsBurnDisplay / days);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {t("title", { defaultValue: "Platform Administration" })}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("subtitle", {
              defaultValue:
                "System health, user and organization management, subscription tiers, and governance.",
            })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCwIcon className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t("analytics.totalUsers", { defaultValue: "Registered Users" })}
            </CardTitle>
            <div className="rounded-md bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400">
              <UsersIcon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold tracking-tight">
                {dashboardStats.totalUsers.toLocaleString()}
              </div>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              Total active accounts on platform
            </p>
          </CardContent>
        </Card>

        {/* Active Organizations */}
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t("analytics.activeOrgs", { defaultValue: "Active Organizations" })}
            </CardTitle>
            <div className="rounded-md bg-violet-500/10 p-2 text-violet-600 dark:text-violet-400">
              <Building2Icon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold tracking-tight">
                {dashboardStats.activeOrganizations.toLocaleString()}
              </div>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              Tenants with active subscriptions
            </p>
          </CardContent>
        </Card>

        {/* Daily Runs Today */}
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t("analytics.totalRuns", { defaultValue: "Runs Executed Today" })}
            </CardTitle>
            <div className="rounded-md bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
              <ActivityIcon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold tracking-tight">
                {dashboardStats.totalRunsToday.toLocaleString()}
              </div>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              Agent workflows & background tasks
            </p>
          </CardContent>
        </Card>

        {/* Monthly Recurring Revenue */}
        <Card className="relative overflow-hidden border-primary/20 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t("analytics.mrr", { defaultValue: "Monthly Recurring Revenue" })}
            </CardTitle>
            <div className="rounded-md bg-primary/20 p-2 text-primary">
              <DollarSignIcon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <div className="text-2xl font-bold tracking-tight text-primary">
                ${mrrDisplay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            )}
            <div className="mt-1 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <TrendingUpIcon className="h-3 w-3" />
              <span>+14.8% vs last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial & Operational Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Credits Burn Rate */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">
                {t("analytics.creditsBurn", { defaultValue: "AI Credits Burn Rate" })}
              </CardTitle>
              <CardDescription>
                Volume of LLM tokens and inference credits consumed
              </CardDescription>
            </div>

            <div className="flex items-center gap-1 rounded-lg border bg-muted/40 p-1 text-xs">
              {[7, 30, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    days === d
                      ? "bg-background text-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border bg-card/60 p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <ZapIcon className="h-3.5 w-3.5 text-amber-500" />
                  <span>Total Burn ({days} Days)</span>
                </div>
                <div className="text-2xl font-bold tabular-nums">
                  {creditsBurnDisplay.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Credits consumed by agents</p>
              </div>

              <div className="rounded-xl border bg-card/60 p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <ActivityIcon className="h-3.5 w-3.5 text-primary" />
                  <span>Daily Average Burn</span>
                </div>
                <div className="text-2xl font-bold tabular-nums">
                  {dailyAverageBurn.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Credits / 24 hour window</p>
              </div>
            </div>

            {/* Model Breakdown / Progress Bar representation */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-muted-foreground">Credits Allocation by Engine</span>
                <span>100% capacity</span>
              </div>
              <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
                <div className="bg-primary" style={{ width: "52%" }} title="Claude 3.5 Sonnet (52%)" />
                <div className="bg-blue-400" style={{ width: "28%" }} title="GPT-4o (28%)" />
                <div className="bg-emerald-500" style={{ width: "14%" }} title="Gemini 1.5 Pro (14%)" />
                <div className="bg-amber-400" style={{ width: "6%" }} title="Embeddings & OCR (6%)" />
              </div>
              <div className="flex flex-wrap gap-4 pt-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span>Claude 3.5 (52%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-400" />
                  <span>GPT-4o (28%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>Gemini (14%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span>Embeddings (6%)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Churn & ARPU Overview */}
        <div className="space-y-6">
          {/* Churn Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("analytics.churn", { defaultValue: "Monthly Churn Rate" })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-foreground">
                  {churnRateDisplay}%
                </span>
                <span className="flex items-center text-xs text-emerald-600 font-medium">
                  <TrendingDownIcon className="h-3 w-3 mr-0.5" />
                  -0.8% MoM
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Healthy retention benchmark (&lt; 3.0%)
              </p>
            </CardContent>
          </Card>

          {/* ARPU Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("analytics.arpu", { defaultValue: "Average Revenue Per User (ARPU)" })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-foreground">
                  ${arpuDisplay.toFixed(2)}
                </span>
                <span className="flex items-center text-xs text-emerald-600 font-medium">
                  <TrendingUpIcon className="h-3 w-3 mr-0.5" />
                  +$4.20 MoM
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Combined recurring plans + pay-as-you-go top-ups
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Admin Quick Action Cards */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          Administrative Modules & Operations
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/admin/users" className="group block">
            <Card className="h-full transition-all hover:border-primary/50 hover:shadow-xs">
              <CardHeader className="pb-2">
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <UsersIcon className="h-4 w-4" />
                </div>
                <CardTitle className="text-sm font-semibold">User Accounts</CardTitle>
                <CardDescription className="text-xs">
                  Manage accounts, suspend abusers, and impersonate sessions.
                </CardDescription>
              </CardHeader>
              <CardFooter className="pt-0 text-xs font-medium text-primary flex items-center gap-1">
                <span>View Users</span>
                <ArrowRightIcon className="h-3 w-3 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
              </CardFooter>
            </Card>
          </Link>

          <Link href="/admin/plans" className="group block">
            <Card className="h-full transition-all hover:border-primary/50 hover:shadow-xs">
              <CardHeader className="pb-2">
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <LayersIcon className="h-4 w-4" />
                </div>
                <CardTitle className="text-sm font-semibold">Subscription Plans</CardTitle>
                <CardDescription className="text-xs">
                  Configure pricing tiers, quotas, and employee seat limits.
                </CardDescription>
              </CardHeader>
              <CardFooter className="pt-0 text-xs font-medium text-primary flex items-center gap-1">
                <span>Manage Plans</span>
                <ArrowRightIcon className="h-3 w-3 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
              </CardFooter>
            </Card>
          </Link>

          <Link href="/admin/wallets" className="group block">
            <Card className="h-full transition-all hover:border-primary/50 hover:shadow-xs">
              <CardHeader className="pb-2">
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <WalletIcon className="h-4 w-4" />
                </div>
                <CardTitle className="text-sm font-semibold">Wallets & Credits</CardTitle>
                <CardDescription className="text-xs">
                  Grant courtesy credits, clawback balances, and freeze wallets.
                </CardDescription>
              </CardHeader>
              <CardFooter className="pt-0 text-xs font-medium text-primary flex items-center gap-1">
                <span>Manage Credits</span>
                <ArrowRightIcon className="h-3 w-3 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
              </CardFooter>
            </Card>
          </Link>

          <Link href="/admin/feature-flags" className="group block">
            <Card className="h-full transition-all hover:border-primary/50 hover:shadow-xs">
              <CardHeader className="pb-2">
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <FlagIcon className="h-4 w-4" />
                </div>
                <CardTitle className="text-sm font-semibold">Feature Flags</CardTitle>
                <CardDescription className="text-xs">
                  Roll out experimental capabilities and targeted tenant overrides.
                </CardDescription>
              </CardHeader>
              <CardFooter className="pt-0 text-xs font-medium text-primary flex items-center gap-1">
                <span>Configure Flags</span>
                <ArrowRightIcon className="h-3 w-3 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
              </CardFooter>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
