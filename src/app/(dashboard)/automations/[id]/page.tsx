"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { ArrowLeftIcon, CheckCircle2Icon, Loader2Icon, RefreshCwIcon, Trash2Icon, WorkflowIcon, PlugIcon } from "lucide-react";
import { approveAutomation, deleteAutomation, getAutomation, reprovisionAutomation } from "@/lib/api/automations";
import type { Automation } from "@/lib/api/types";
import { ApiError } from "@/lib/api/client";
import { InlineBlueprint } from "@/components/automations/automation-blueprint-viewer";

function statusBadge(status: string) {
  if (status === "ACTIVE") return <Badge className="bg-emerald-500/10 text-emerald-600 border-transparent">Active</Badge>;
  if (status === "PENDING_APPROVAL") return <Badge className="bg-amber-500/10 text-amber-600 border-amber-200">Needs Approval</Badge>;
  if (status === "FAILED") return <Badge variant="destructive">Failed</Badge>;
  if (status === "SUSPENDED") return <Badge variant="outline">Suspended</Badge>;
  if (status === "PROVISIONING") return <Badge variant="outline">Provisioning…</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

export default function AutomationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [automation, setAutomation] = React.useState<Automation | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [tab, setTab] = React.useState<"blueprint" | "execution">("blueprint");

  const load = React.useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getAutomation(id as string);
      setAutomation(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load automation");
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const handleApprove = async () => {
    if (!automation) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await approveAutomation(automation.id);
      setAutomation(updated);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Approve failed");
    } finally {
      setBusy(false);
    }
  };

  const handleReprovision = async () => {
    if (!automation) return;
    setBusy(true);
    try {
      const updated = await reprovisionAutomation(automation.id);
      setAutomation(updated);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Reprovision failed");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!automation) return;
    setBusy(true);
    try {
      await deleteAutomation(automation.id);
      router.push("/automations");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto p-8 text-sm text-muted-foreground flex items-center gap-2"><Loader2Icon className="w-4 h-4 animate-spin" /> Loading…</div>;
  }
  if (error && !automation) {
    return (
      <div className="max-w-4xl mx-auto p-8 space-y-4">
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
        <Link href="/automations"><Button variant="outline" size="sm"><ArrowLeftIcon className="w-4 h-4 mr-1" /> Back</Button></Link>
      </div>
    );
  }
  if (!automation) return null;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto p-4 md:p-8">
      <Link href="/automations" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground w-fit">
        <ArrowLeftIcon className="w-4 h-4" /> Back to Automations
      </Link>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 flex-wrap">
            <WorkflowIcon className="w-6 h-6 text-primary shrink-0" />
            <span className="truncate">{automation.name}</span>
            {statusBadge(automation.status)}
          </h1>
          {automation.description && <p className="text-sm text-muted-foreground mt-1">{automation.description}</p>}
          {automation.blueprintRevision && <div className="text-xs font-mono text-muted-foreground mt-1">Revision {automation.blueprintRevision}</div>}
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {automation.status === "PENDING_APPROVAL" && (
            <Button onClick={handleApprove} disabled={busy} size="sm" className="gap-1.5 rounded-xl">
              {busy ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <CheckCircle2Icon className="w-4 h-4" />} Approve & Provision
            </Button>
          )}
          {(automation.status === "ACTIVE" || automation.status === "FAILED") && (
            <Button variant="outline" onClick={handleReprovision} disabled={busy} size="sm" className="gap-1.5 rounded-xl">
              {busy ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <RefreshCwIcon className="w-4 h-4" />} Reprovision
            </Button>
          )}
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeleting(true)} disabled={busy}>
            <Trash2Icon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {error && <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
      {automation.lastError && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm">
          <div className="font-semibold text-destructive">Last error</div>
          <div className="text-muted-foreground mt-1 whitespace-pre-wrap">{automation.lastError}</div>
        </div>
      )}

      <div className="flex items-center gap-2 p-1 rounded-full bg-muted/40 w-fit">
        <button onClick={() => setTab("blueprint")} className={`px-4 py-1.5 rounded-full text-xs font-semibold ${tab === "blueprint" ? "bg-background shadow" : "text-muted-foreground"}`}>Blueprint</button>
        <button onClick={() => setTab("execution")} className={`px-4 py-1.5 rounded-full text-xs font-semibold ${tab === "execution" ? "bg-background shadow" : "text-muted-foreground"}`}>Execution</button>
      </div>

      {tab === "blueprint" && (
        <Card className="rounded-2xl">
          <CardContent className="pt-6">
            <InlineBlueprint automation={automation} />
          </CardContent>
        </Card>
      )}

      {tab === "execution" && (
        <Card className="rounded-2xl">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><PlugIcon className="w-4 h-4" /> Execution</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="font-medium">{automation.status}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Connection</span><span className="font-mono text-xs">{automation.connectionId}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Webhook</span><span className="font-mono text-xs truncate max-w-[60%]">{automation.webhookPath ?? "—"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Workflow ID</span><span className="font-mono text-xs">{automation.externalWorkflowId ?? "—"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Last Synced</span><span className="text-xs">{automation.lastSyncedAt ? new Date(automation.lastSyncedAt).toLocaleString() : "—"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Revision</span><span className="font-mono text-xs">{automation.blueprintRevision ?? "—"}</span></div>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={deleting} onOpenChange={(o) => !o && setDeleting(false)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader><AlertDialogTitle>Delete automation?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
