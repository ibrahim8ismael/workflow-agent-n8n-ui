"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  SearchIcon,
  WorkflowIcon,
  Loader2Icon,
  PlusIcon,
  EyeIcon,
  CheckCircle2Icon,
  AlertTriangleIcon,
  ClockIcon,
  Trash2Icon,
  RefreshCwIcon,
  PlugIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  approveAutomation,
  deleteAutomation,
  listAutomations,
  reprovisionAutomation,
} from "@/lib/api/automations";
import { listN8nConnections } from "@/lib/api/n8n-connections";
import type { Automation } from "@/lib/api/types";
import { ApiError } from "@/lib/api/client";
import { AutomationBlueprintViewer } from "@/components/automations/automation-blueprint-viewer";

function statusBadge(status: string) {
  switch (status) {
    case "ACTIVE":
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 border-transparent gap-1">
          <CheckCircle2Icon className="w-3 h-3" /> Active
        </Badge>
      );
    case "PENDING_APPROVAL":
      return (
        <Badge className="bg-amber-500/10 text-amber-600 border-amber-200 gap-1">
          <ClockIcon className="w-3 h-3" /> Needs Approval
        </Badge>
      );
    case "FAILED":
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangleIcon className="w-3 h-3" /> Failed
        </Badge>
      );
    case "SUSPENDED":
      return <Badge variant="outline">Suspended</Badge>;
    case "PROVISIONING":
      return (
        <Badge variant="outline" className="gap-1">
          <Loader2Icon className="w-3 h-3 animate-spin" /> Provisioning
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

type StatusFilter = "ALL" | "PENDING_APPROVAL" | "ACTIVE" | "FAILED" | "SUSPENDED" | "PROVISIONING";

export default function AutomationsPage() {
  const { t } = useTranslation("automations");
  const [automations, setAutomations] = React.useState<Automation[]>([]);
  const [, setConnections] = React.useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("ALL");
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [viewTarget, setViewTarget] = React.useState<Automation | null>(null);
  const [deleting, setDeleting] = React.useState<Automation | null>(null);
  const [hasActiveConnection, setHasActiveConnection] = React.useState<boolean | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [autos, conns] = await Promise.all([
        listAutomations(),
        listN8nConnections().catch(() => [] as unknown as Automation[]),
      ]);
      setAutomations(Array.isArray(autos) ? autos : []);
      if (Array.isArray(conns)) {
        setConnections(conns as unknown as { id: string; name: string }[]);
        setHasActiveConnection((conns as unknown as { status: string }[]).some((c) => c.status === "ACTIVE"));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const filtered = automations.filter((a) => {
    if (statusFilter !== "ALL" && a.status !== statusFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return a.name.toLowerCase().includes(q) || (a.description ?? "").toLowerCase().includes(q);
  });

  const handleApprove = async (a: Automation) => {
    setBusyId(a.id);
    try {
      await approveAutomation(a.id);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t("approveError"));
    } finally {
      setBusyId(null);
    }
  };

  const handleReprovision = async (a: Automation) => {
    setBusyId(a.id);
    try {
      await reprovisionAutomation(a.id);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t("approveError"));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setBusyId(deleting.id);
    try {
      await deleteAutomation(deleting.id);
      setDeleting(null);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t("deleteError"));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2.5">
            <WorkflowIcon className="w-7 h-7 text-primary" />
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
        </div>
        <Link href="/new">
          <Button size="sm" className="gap-1.5 rounded-xl">
            <PlusIcon className="w-4 h-4" />
            {t("createAutomation")}
          </Button>
        </Link>
      </div>

      {hasActiveConnection === false && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-3 flex items-center justify-between gap-3">
          <span className="text-sm text-amber-800 dark:text-amber-200 flex items-center gap-2">
            <PlugIcon className="w-4 h-4" />
            {t("noConnection")}
          </span>
          <Link href="/integrations">
            <Button size="xs" variant="outline" className="rounded-full">
              {t("connectN8n")}
            </Button>
          </Link>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive flex items-center justify-between">
          <span>{error}</span>
          <Button variant="ghost" size="xs" onClick={load}>
            Retry
          </Button>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {(["ALL", "PENDING_APPROVAL", "ACTIVE", "FAILED", "SUSPENDED"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${statusFilter === s ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/70"}`}
            >
              {s === "ALL" ? "All" : s === "PENDING_APPROVAL" ? t("statusPendingApproval") : s === "ACTIVE" ? t("statusActive") : s === "FAILED" ? t("statusFailed") : t("statusSuspended")}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-72">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("searchPlaceholder")} className="pl-9 h-9 text-sm bg-card/60 rounded-xl" />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="rounded-2xl p-6 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/2 mb-3" />
              <div className="h-3 bg-muted rounded w-full" />
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="rounded-2xl border-dashed p-10 text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
            <WorkflowIcon className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold">{t("noAutomationsYet")}</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">{t("noAutomationsDesc")}</p>
          <Link href="/new">
            <Button size="sm" className="mt-4 rounded-xl">
              {t("askJaafar")}
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((a) => (
            <Card key={a.id} className="rounded-2xl border-border/50 bg-card/40 flex flex-col p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-base leading-tight line-clamp-2 flex-1">{a.name}</CardTitle>
                {statusBadge(a.status)}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-2 flex-1">{a.description ?? (a.blueprint as { goal?: string })?.goal ?? ""}</p>

              <CardContent className="p-0 pt-3 space-y-1 text-xs">
                {a.blueprintRevision && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("revision")}</span>
                    <span className="font-mono">{a.blueprintRevision}</span>
                  </div>
                )}
                {a.webhookPath && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("webhookPath")}</span>
                    <span className="font-mono truncate max-w-[55%]">{a.webhookPath}</span>
                  </div>
                )}
                {a.lastError && <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2 text-destructive text-xs mt-2">{a.lastError}</div>}
              </CardContent>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/40 flex-wrap">
                <Button variant="ghost" size="xs" className="h-7 text-xs gap-1" onClick={() => setViewTarget(a)}>
                  <EyeIcon className="w-3.5 h-3.5" /> {t("view")}
                </Button>
                <Link href={`/automations/${a.id}`}>
                  <Button variant="outline" size="xs" className="h-7 text-xs">
                    Open
                  </Button>
                </Link>
                {a.status === "PENDING_APPROVAL" && (
                  <Button
                    size="xs"
                    className="h-7 text-xs gap-1 ml-auto"
                    disabled={busyId === a.id}
                    onClick={() => handleApprove(a)}
                  >
                    {busyId === a.id ? <Loader2Icon className="w-3 h-3 animate-spin" /> : <CheckCircle2Icon className="w-3 h-3" />}
                    {t("approve")}
                  </Button>
                )}
                {(a.status === "ACTIVE" || a.status === "FAILED") && (
                  <Button variant="outline" size="xs" className="h-7 text-xs gap-1 ml-auto" disabled={busyId === a.id} onClick={() => handleReprovision(a)}>
                    {busyId === a.id ? <Loader2Icon className="w-3 h-3 animate-spin" /> : <RefreshCwIcon className="w-3 h-3" />}
                    {t("reprovision")}
                  </Button>
                )}
                <Button variant="ghost" size="xs" className="h-7 text-xs text-destructive hover:text-destructive ml-auto md:ml-0" onClick={() => setDeleting(a)}>
                  <Trash2Icon className="w-3 h-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AutomationBlueprintViewer automation={viewTarget} open={Boolean(viewTarget)} onOpenChange={(o) => !o && setViewTarget(null)} />

      <AlertDialog open={Boolean(deleting)} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteAutomation")}</AlertDialogTitle>
            <AlertDialogDescription>{t("deleteConfirm")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
