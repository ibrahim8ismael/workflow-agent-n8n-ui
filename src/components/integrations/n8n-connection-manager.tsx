"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import * as React from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
  PlugIcon,
  Loader2Icon,
  CheckCircle2Icon,
  AlertTriangleIcon,
  ShieldCheckIcon,
  RefreshCwIcon,
  PlusIcon,
  Trash2Icon,
  PencilIcon,
  ExternalLinkIcon,
  PauseIcon,
  PlayIcon,
  KeyRoundIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  createN8nConnection,
  deleteN8nConnection,
  listN8nConnections,
  updateN8nConnection,
  verifyN8nConnection,
} from "@/lib/api/n8n-connections";
import type { N8nConnection } from "@/lib/api/types";
import { ApiError } from "@/lib/api/client";

const isLocalHost = (hostname: string) =>
  ["localhost", "127.0.0.1", "::1"].some((h) => hostname.includes(h)) ||
  hostname.endsWith(".localhost");

function statusBadge(status: string, t: (key: string) => string) {
  switch (status) {
    case "ACTIVE":
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 border-transparent gap-1.5">
          <CheckCircle2Icon className="w-3 h-3" />
          {t("n8nConnection.statusActive")}
        </Badge>
      );
    case "INVALID":
      return (
        <Badge variant="destructive" className="gap-1.5">
          <AlertTriangleIcon className="w-3 h-3" />
          {t("n8nConnection.statusInvalid")}
        </Badge>
      );
    case "SUSPENDED":
      return (
        <Badge variant="outline" className="gap-1.5">
          {t("n8nConnection.statusSuspended")}
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-200 gap-1.5">
          <Loader2Icon className="w-3 h-3 animate-spin" />
          {t("n8nConnection.statusPending")}
        </Badge>
      );
  }
}

export function N8nConnectionManager() {
  const { t } = useTranslation("integrations");
  const [connections, setConnections] = React.useState<N8nConnection[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<N8nConnection | null>(null);
  const [deleting, setDeleting] = React.useState<N8nConnection | null>(null);
  const [suspending, setSuspending] = React.useState<N8nConnection | null>(null);
  const [verifyingId, setVerifyingId] = React.useState<string | null>(null);
  const [statusBusyId, setStatusBusyId] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [form, setForm] = React.useState({ name: "", baseUrl: "", apiKey: "" });
  const [formError, setFormError] = React.useState<string | null>(null);
  // Verification outcome for the open create/edit dialog: the connection is
  // saved, but not ACTIVE — keep the dialog open with a retry affordance.
  const [dialogResult, setDialogResult] = React.useState<{
    connectionId: string;
    error: string | null;
  } | null>(null);
  const [dialogSuccess, setDialogSuccess] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listN8nConnections();
      setConnections(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("n8nConnection.listError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  React.useEffect(() => {
    void load();
  }, [load]);

  // Auto-close the dialog after a verified connection, once the user has
  // seen the inline success line.
  React.useEffect(() => {
    if (!dialogSuccess) return;
    const timer = setTimeout(() => {
      setDialogSuccess(false);
      setCreateOpen(false);
      setEditing(null);
      setDialogResult(null);
    }, 1400);
    return () => clearTimeout(timer);
  }, [dialogSuccess]);

  const openCreate = () => {
    setForm({ name: "", baseUrl: "", apiKey: "" });
    setFormError(null);
    setDialogResult(null);
    setDialogSuccess(false);
    setCreateOpen(true);
  };

  const openEdit = (c: N8nConnection) => {
    setForm({ name: c.name, baseUrl: c.baseUrl, apiKey: "" });
    setFormError(null);
    setDialogResult(null);
    setDialogSuccess(false);
    setEditing(c);
  };

  const validateForm = (isEdit: boolean) => {
    if (!form.name.trim() || form.name.length > 120) return t("n8nConnection.validateName");
    try {
      new URL(form.baseUrl);
    } catch {
      return t("n8nConnection.validateUrl");
    }
    if (!isEdit && (!form.apiKey || form.apiKey.length < 8)) return t("n8nConnection.validateKey");
    if (isEdit && form.apiKey && form.apiKey.length < 8) return t("n8nConnection.validateKeyEdit");
    return null;
  };

  /** Maps a backend verification failure to user-facing guidance. */
  const describeVerifyError = (message: string | null): string => {
    const m = (message ?? "").toLowerCase();
    if (!m) return t("n8nConnection.errorMap.generic");
    if (m.includes("key rejected") || m.includes("401") || m.includes("403"))
      return t("n8nConnection.errorMap.keyRejected");
    if (m.includes("cannot resolve")) return t("n8nConnection.errorMap.dns");
    if (m.includes("unreachable")) return t("n8nConnection.errorMap.unreachable");
    if (m.includes("blocked") || m.includes("plain http") || m.includes("private network"))
      return t("n8nConnection.errorMap.blocked");
    if (m.includes("api returned")) return t("n8nConnection.errorMap.apiError");
    return t("n8nConnection.errorMap.generic");
  };

  const httpWarning = React.useMemo(() => {
    try {
      const u = new URL(form.baseUrl);
      return u.protocol === "http:" && !isLocalHost(u.hostname);
    } catch {
      return false;
    }
  }, [form.baseUrl]);

  const n8nSettingsUrl = React.useMemo(() => {
    try {
      return `${new URL(form.baseUrl).origin}/settings/api`;
    } catch {
      return null;
    }
  }, [form.baseUrl]);

  const applyVerified = (connection: N8nConnection) => {
    if (connection.status === "ACTIVE") {
      setDialogResult(null);
      setDialogSuccess(true);
      void load();
      return true;
    }
    setDialogResult({
      connectionId: connection.id,
      error: describeVerifyError(connection.lastError),
    });
    return false;
  };

  const handleCreate = async () => {
    const v = validateForm(false);
    if (v) {
      setFormError(v);
      return;
    }
    setBusy(true);
    setFormError(null);
    try {
      const connection = await createN8nConnection({
        name: form.name.trim(),
        baseUrl: form.baseUrl.trim().replace(/\/+$/, ""),
        apiKey: form.apiKey,
      });
      applyVerified(connection);
    } catch (e) {
      setFormError(
        e instanceof ApiError ? e.message : e instanceof Error ? e.message : t("n8nConnection.createFailed"),
      );
    } finally {
      setBusy(false);
    }
  };

  const handleUpdate = async () => {
    if (!editing) return;
    const v = validateForm(true);
    if (v) {
      setFormError(v);
      return;
    }
    setBusy(true);
    setFormError(null);
    try {
      const payload: Record<string, string> = {};
      if (form.name.trim() !== editing.name) payload.name = form.name.trim();
      if (form.baseUrl.trim().replace(/\/+$/, "") !== editing.baseUrl)
        payload.baseUrl = form.baseUrl.trim().replace(/\/+$/, "");
      if (form.apiKey) payload.apiKey = form.apiKey;
      if (Object.keys(payload).length === 0) {
        setEditing(null);
        return;
      }
      const connection = await updateN8nConnection(editing.id, payload);
      applyVerified(connection);
    } catch (e) {
      setFormError(
        e instanceof ApiError ? e.message : e instanceof Error ? e.message : t("n8nConnection.updateFailed"),
      );
    } finally {
      setBusy(false);
    }
  };

  const handleDialogRetry = async () => {
    if (!dialogResult) return;
    setBusy(true);
    setFormError(null);
    try {
      const connection = await verifyN8nConnection(dialogResult.connectionId);
      applyVerified(connection);
    } catch (e) {
      setDialogResult({
        connectionId: dialogResult.connectionId,
        error: e instanceof ApiError ? e.message : t("n8nConnection.verifyFailed"),
      });
    } finally {
      setBusy(false);
    }
  };

  const handleVerify = async (id: string) => {
    setVerifyingId(id);
    try {
      await verifyN8nConnection(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("n8nConnection.verifyFailed"));
    } finally {
      setVerifyingId(null);
    }
  };

  const handleSuspend = async () => {
    if (!suspending) return;
    setStatusBusyId(suspending.id);
    try {
      await updateN8nConnection(suspending.id, { status: "SUSPENDED" });
      setSuspending(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("n8nConnection.updateFailed"));
    } finally {
      setStatusBusyId(null);
    }
  };

  const handleResume = async (id: string) => {
    setStatusBusyId(id);
    try {
      await updateN8nConnection(id, { status: "ACTIVE" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("n8nConnection.updateFailed"));
    } finally {
      setStatusBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await deleteN8nConnection(deleting.id);
      setDeleting(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("n8nConnection.deleteFailed"));
    } finally {
      setBusy(false);
    }
  };

  const dialogVerifyFailed = Boolean(dialogResult);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <PlugIcon className="w-5 h-5 text-primary" />
            {t("n8nConnection.title")}
          </h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{t("n8nConnection.subtitle")}</p>
        </div>
        <Button onClick={openCreate} size="sm" className="gap-1.5 rounded-xl">
          <PlusIcon className="w-4 h-4" />
          {t("n8nConnection.connect")}
        </Button>
      </div>

      <div className="rounded-xl border border-border/40 bg-primary/5 p-3 flex items-start gap-2.5 text-xs leading-relaxed">
        <ShieldCheckIcon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <span className="text-muted-foreground">{t("n8nConnection.howItWorks")}</span>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive flex items-center justify-between">
          <span>{error}</span>
          <Button variant="ghost" size="xs" onClick={load}>
            {t("n8nConnection.retry")}
          </Button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0, 1].map((i) => (
            <Card key={i} className="rounded-2xl border-border/50 bg-card/40 p-6 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/3 mb-3" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </Card>
          ))}
        </div>
      ) : connections.length === 0 ? (
        <Card className="rounded-2xl border-dashed border-border/60 bg-card/30 p-10 text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
            <PlugIcon className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold">{t("n8nConnection.emptyTitle")}</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">{t("n8nConnection.emptyDesc")}</p>
          <Button onClick={openCreate} size="sm" className="mt-4 gap-1.5 rounded-xl">
            <PlusIcon className="w-4 h-4" /> {t("n8nConnection.connectYourN8n")}
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {connections.map((c) => (
            <Card key={c.id} className="rounded-2xl border-border/50 bg-card/40 flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle className="text-base truncate">{c.name}</CardTitle>
                  <a
                    href={c.baseUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 truncate"
                  >
                    {c.baseUrl} <ExternalLinkIcon className="w-3 h-3 shrink-0" />
                  </a>
                </div>
                {statusBadge(c.status, t)}
              </div>

              <CardContent className="p-0 pt-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("n8nConnection.key")}</span>
                  <span className="font-mono">{c.keyPreview ?? "—"}</span>
                </div>
                {c.lastVerifiedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("n8nConnection.verified")}</span>
                    <span>{new Date(c.lastVerifiedAt).toLocaleString()}</span>
                  </div>
                )}
                {c.lastError && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2 text-destructive text-xs">
                    {describeVerifyError(c.lastError)}
                  </div>
                )}
              </CardContent>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/40 flex-wrap">
                <Button
                  variant="outline"
                  size="xs"
                  className="h-7 text-xs gap-1"
                  disabled={verifyingId === c.id}
                  onClick={() => handleVerify(c.id)}
                >
                  {verifyingId === c.id ? <Loader2Icon className="w-3 h-3 animate-spin" /> : <RefreshCwIcon className="w-3 h-3" />}
                  {t("n8nConnection.verify")}
                </Button>
                <Button variant="ghost" size="xs" className="h-7 text-xs gap-1" onClick={() => openEdit(c)}>
                  <PencilIcon className="w-3 h-3" /> {t("n8nConnection.edit")}
                </Button>
                {c.status === "SUSPENDED" ? (
                  <Button
                    variant="ghost"
                    size="xs"
                    className="h-7 text-xs gap-1"
                    disabled={statusBusyId === c.id}
                    onClick={() => handleResume(c.id)}
                  >
                    {statusBusyId === c.id ? <Loader2Icon className="w-3 h-3 animate-spin" /> : <PlayIcon className="w-3 h-3" />}
                    {t("n8nConnection.resume")}
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="xs"
                    className="h-7 text-xs gap-1"
                    disabled={statusBusyId === c.id || c.status === "INVALID"}
                    onClick={() => setSuspending(c)}
                  >
                    <PauseIcon className="w-3 h-3" />
                    {t("n8nConnection.suspend")}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="xs"
                  className="h-7 text-xs gap-1 text-destructive hover:text-destructive"
                  onClick={() => setDeleting(c)}
                >
                  <Trash2Icon className="w-3 h-3" /> {t("n8nConnection.remove")}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>{t("n8nConnection.connectTitle")}</DialogTitle>
            <DialogDescription className="text-xs">{t("n8nConnection.connectDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {dialogSuccess ? (
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm text-emerald-600 flex items-center gap-2">
                <CheckCircle2Icon className="w-4 h-4" />
                {t("n8nConnection.connected")}
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="n8n-name" className="text-xs">{t("n8nConnection.name")}</Label>
                  <Input
                    id="n8n-name"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder={t("n8nConnection.namePlaceholder")}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="n8n-url" className="text-xs">{t("n8nConnection.baseUrl")}</Label>
                  <Input
                    id="n8n-url"
                    value={form.baseUrl}
                    onChange={(e) => setForm((p) => ({ ...p, baseUrl: e.target.value }))}
                    placeholder={t("n8nConnection.baseUrlPlaceholder")}
                    className="h-9"
                  />
                  <p className="text-[11px] text-muted-foreground">{t("n8nConnection.baseUrlHint")}</p>
                  {httpWarning && (
                    <p className="text-[11px] text-amber-600 flex items-center gap-1">
                      <AlertTriangleIcon className="w-3 h-3 shrink-0" />
                      {t("n8nConnection.httpWarning")}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="n8n-key" className="text-xs flex items-center gap-1">
                    <KeyRoundIcon className="w-3 h-3" />
                    {t("n8nConnection.apiKey")}
                  </Label>
                  <Input
                    id="n8n-key"
                    type="password"
                    value={form.apiKey}
                    onChange={(e) => setForm((p) => ({ ...p, apiKey: e.target.value }))}
                    placeholder="X-N8N-API-KEY"
                    className="h-9"
                  />
                  <p className="text-[11px] text-muted-foreground">{t("n8nConnection.apiKeyHint")}</p>
                  {n8nSettingsUrl && (
                    <a
                      href={n8nSettingsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-primary hover:underline inline-flex items-center gap-1"
                    >
                      {t("n8nConnection.openN8nSettings")} <ExternalLinkIcon className="w-3 h-3" />
                    </a>
                  )}
                </div>
                {dialogVerifyFailed && dialogResult && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive space-y-1">
                    <p className="font-medium">{t("n8nConnection.savedButFailed")}</p>
                    <p>{dialogResult.error}</p>
                  </div>
                )}
                {formError && <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2 text-xs text-destructive">{formError}</div>}
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={busy}>
              {t("n8nConnection.cancel")}
            </Button>
            {dialogVerifyFailed && !dialogSuccess ? (
              <Button onClick={handleDialogRetry} disabled={busy} className="gap-1.5">
                {busy ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <RefreshCwIcon className="w-4 h-4" />}
                {t("n8nConnection.retryVerify")}
              </Button>
            ) : (
              <Button onClick={handleCreate} disabled={busy || dialogSuccess} className="gap-1.5">
                {busy && <Loader2Icon className="w-4 h-4 animate-spin" />} {t("n8nConnection.connect")}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={Boolean(editing)} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>{t("n8nConnection.editTitle")}</DialogTitle>
            <DialogDescription className="text-xs">{t("n8nConnection.editDesc")}</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="space-y-4 py-2">
              {dialogSuccess ? (
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm text-emerald-600 flex items-center gap-2">
                  <CheckCircle2Icon className="w-4 h-4" />
                  {t("n8nConnection.connected")}
                </div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t("n8nConnection.name")}</Label>
                    <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t("n8nConnection.baseUrl")}</Label>
                    <Input value={form.baseUrl} onChange={(e) => setForm((p) => ({ ...p, baseUrl: e.target.value }))} className="h-9" />
                    {httpWarning && (
                      <p className="text-[11px] text-amber-600 flex items-center gap-1">
                        <AlertTriangleIcon className="w-3 h-3 shrink-0" />
                        {t("n8nConnection.httpWarning")}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t("n8nConnection.rotateKey")}</Label>
                    <Input
                      type="password"
                      value={form.apiKey}
                      onChange={(e) => setForm((p) => ({ ...p, apiKey: e.target.value }))}
                      placeholder={t("n8nConnection.rotateKeyPlaceholder")}
                      className="h-9"
                    />
                    <p className="text-[11px] text-muted-foreground">{t("n8nConnection.apiKeyHint")}</p>
                    {n8nSettingsUrl && (
                      <a
                        href={n8nSettingsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-primary hover:underline inline-flex items-center gap-1"
                      >
                        {t("n8nConnection.openN8nSettings")} <ExternalLinkIcon className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  {dialogVerifyFailed && dialogResult && (
                    <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive space-y-1">
                      <p className="font-medium">{t("n8nConnection.savedButFailed")}</p>
                      <p>{dialogResult.error}</p>
                    </div>
                  )}
                  {formError && <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2 text-xs text-destructive">{formError}</div>}
                </>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)} disabled={busy}>
              {t("n8nConnection.cancel")}
            </Button>
            {dialogVerifyFailed && !dialogSuccess ? (
              <Button onClick={handleDialogRetry} disabled={busy} className="gap-1.5">
                {busy ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <RefreshCwIcon className="w-4 h-4" />}
                {t("n8nConnection.retryVerify")}
              </Button>
            ) : (
              <Button onClick={handleUpdate} disabled={busy || dialogSuccess} className="gap-1.5">
                {busy && <Loader2Icon className="w-4 h-4 animate-spin" />} {t("n8nConnection.save")}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend confirm */}
      <AlertDialog open={Boolean(suspending)} onOpenChange={(o) => !o && setSuspending(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("n8nConnection.suspendTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("n8nConnection.suspendDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={statusBusyId !== null}>{t("n8nConnection.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSuspend}
              disabled={statusBusyId !== null}
              className="bg-amber-600 text-white hover:bg-amber-600/90"
            >
              {statusBusyId ? <Loader2Icon className="w-4 h-4 animate-spin mr-1.5" /> : null}
              {t("n8nConnection.suspend")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={Boolean(deleting)} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("n8nConnection.removeTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("n8nConnection.removeDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>{t("n8nConnection.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={busy} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {busy ? <Loader2Icon className="w-4 h-4 animate-spin mr-1.5" /> : null} {t("n8nConnection.remove")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
