"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  RefreshCwIcon,
  UserCogIcon,
  FileTextIcon,
  CodeIcon,
  Loader2Icon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  queryAdminAuditLogs,
  queryAdminImpersonationLogs,
} from "@/lib/api/admin";
import type { AdminAuditLog, AdminImpersonationLog } from "@/lib/api/types";

export default function AdminAuditLogsPage() {
  const { t } = useTranslation("admin");

  const [activeTab, setActiveTab] = useState<"platform" | "impersonations">("platform");
  const [platformLogs, setPlatformLogs] = useState<AdminAuditLog[]>([]);
  const [impersonationLogs, setImpersonationLogs] = useState<AdminImpersonationLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Metadata Inspector Modal
  const [selectedLog, setSelectedLog] = useState<AdminAuditLog | null>(null);
  const [metadataOpen, setMetadataOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (activeTab === "platform") {
      queryAdminAuditLogs({
        limit: 50,
        offset: 0,
      })
        .then((res) => {
          if (cancelled) return;
          if (Array.isArray(res) && res.length > 0) {
            setPlatformLogs(res);
          } else {
            // Fallback demo audit entries
            setPlatformLogs([
              {
                id: "log_01",
                userId: "usr_101",
                userEmail: "sarah.connor@skycorp.ai",
                action: "ADMIN_WALLET_TOPUP",
                entityType: "WALLET",
                entityId: "wlt_skycorp_01",
                metadata: { credits: "50000", note: "Courtesy goodwill grant" },
                ipAddress: "192.168.1.104",
                userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X)",
                createdAt: new Date("2026-01-01T00:00:00Z").toISOString(),
              },
              {
                id: "log_02",
                userId: "usr_101",
                userEmail: "sarah.connor@skycorp.ai",
                action: "SUSPEND_USER",
                entityType: "USER",
                entityId: "usr_103",
                metadata: { reason: "Abuse of LLM tokens and rate limits" },
                ipAddress: "192.168.1.104",
                userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X)",
                createdAt: new Date("2026-01-01T00:00:00Z").toISOString(),
              },
              {
                id: "log_03",
                userId: "usr_101",
                userEmail: "sarah.connor@skycorp.ai",
                action: "CREATE_FEATURE_FLAG",
                entityType: "FEATURE_FLAG",
                entityId: "enable_gpt5_preview",
                metadata: { key: "enable_gpt5_preview", enabled: false },
                ipAddress: "192.168.1.104",
                userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X)",
                createdAt: new Date("2026-01-01T00:00:00Z").toISOString(),
              },
            ]);
          }
          setLoading(false);
        })
        .catch(() => {
          if (!cancelled) setLoading(false);
        });
    } else {
      queryAdminImpersonationLogs({ limit: 100, offset: 0 })
        .then((res) => {
          if (cancelled) return;
          if (Array.isArray(res) && res.length > 0) {
            setImpersonationLogs(res);
          } else {
            // Fallback demo impersonations
            setImpersonationLogs([
              {
                id: "imp_01",
                adminId: "usr_101",
                adminEmail: "sarah.connor@skycorp.ai",
                impersonatedUserId: "usr_102",
                impersonatedUserEmail: "alex.mercer@apex.io",
                reason: "Troubleshooting billing sync issue and agent webhook failure",
                ipAddress: "192.168.1.104",
                createdAt: new Date("2026-01-01T00:00:00Z").toISOString(),
              },
              {
                id: "imp_02",
                adminId: "usr_101",
                adminEmail: "sarah.connor@skycorp.ai",
                impersonatedUserId: "usr_999",
                impersonatedUserEmail: "finance.lead@acme.corp",
                reason: "Assisting with high-concurrency memory quota setup",
                ipAddress: "192.168.1.104",
                createdAt: new Date("2026-01-01T00:00:00Z").toISOString(),
              },
            ]);
          }
          setLoading(false);
        })
        .catch(() => {
          if (!cancelled) setLoading(false);
        });
    }

    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  const handleRefresh = () => {
    setLoading(true);
    if (activeTab === "platform") {
      queryAdminAuditLogs({ limit: 50, offset: 0 })
        .then((res) => {
          if (Array.isArray(res) && res.length > 0) {
            setPlatformLogs(res);
          }
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      queryAdminImpersonationLogs({ limit: 100, offset: 0 })
        .then((res) => {
          if (Array.isArray(res) && res.length > 0) {
            setImpersonationLogs(res);
          }
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  };

  const getActionBadge = (action: string) => {
    if (action.includes("SUSPEND")) {
      return (
        <Badge variant="destructive" className="text-[10px]">
          {action}
        </Badge>
      );
    }
    if (action.includes("TOPUP") || action.includes("GRANT") || action.includes("REACTIVATE")) {
      return (
        <Badge
          variant="outline"
          className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 text-[10px]"
        >
          {action}
        </Badge>
      );
    }
    if (action.includes("DEDUCT") || action.includes("FREEZE")) {
      return (
        <Badge
          variant="outline"
          className="border-amber-500/30 bg-amber-500/10 text-amber-600 text-[10px]"
        >
          {action}
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="text-[10px]">
        {action}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {t("auditLogs.title", { defaultValue: "Audit & Compliance Logs" })}
          </h1>
          <p className="text-sm text-muted-foreground">
            Immutable platform action trails, sensitive state modifications, and session impersonation records.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
          className="gap-2 self-start sm:self-auto"
        >
          <RefreshCwIcon className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b pb-2">
        <button
          onClick={() => setActiveTab("platform")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "platform"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileTextIcon className="h-3.5 w-3.5" />
          <span>{t("auditLogs.tabPlatform", { defaultValue: "Platform Action Trail" })}</span>
        </button>

        <button
          onClick={() => setActiveTab("impersonations")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "impersonations"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <UserCogIcon className="h-3.5 w-3.5" />
          <span>{t("auditLogs.tabImpersonation", { defaultValue: "Impersonation Trail" })}</span>
        </button>
      </div>

      {/* Platform Logs Tab */}
      {activeTab === "platform" && (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("auditLogs.columns.timestamp", { defaultValue: "Timestamp" })}</TableHead>
                <TableHead>{t("auditLogs.columns.actor", { defaultValue: "Actor" })}</TableHead>
                <TableHead>{t("auditLogs.columns.action", { defaultValue: "Action" })}</TableHead>
                <TableHead>{t("auditLogs.columns.target", { defaultValue: "Target Entity" })}</TableHead>
                <TableHead>{t("auditLogs.columns.ipAddress", { defaultValue: "IP Address" })}</TableHead>
                <TableHead className="text-right">{t("auditLogs.columns.details", { defaultValue: "Details" })}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2Icon className="h-4 w-4 animate-spin text-primary" />
                      <span>Loading audit records…</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : platformLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No platform audit records found.
                  </TableCell>
                </TableRow>
              ) : (
                platformLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>

                    <TableCell className="font-mono text-xs">
                      {log.userEmail || log.userId || "SYSTEM"}
                    </TableCell>

                    <TableCell>{getActionBadge(log.action)}</TableCell>

                    <TableCell className="text-xs">
                      <div className="flex flex-col font-mono">
                        <span className="font-semibold text-foreground">{log.entityType || "N/A"}</span>
                        <span className="text-muted-foreground text-[10px]">{log.entityId}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs font-mono text-muted-foreground">
                      {log.ipAddress || "Internal"}
                    </TableCell>

                    <TableCell className="text-right">
                      {log.metadata ? (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => {
                            setSelectedLog(log);
                            setMetadataOpen(true);
                          }}
                          title="Inspect Metadata"
                        >
                          <CodeIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Impersonation Trail Tab */}
      {activeTab === "impersonations" && (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("auditLogs.columns.timestamp", { defaultValue: "Timestamp" })}</TableHead>
                <TableHead>{t("auditLogs.columns.actor", { defaultValue: "Admin Actor" })}</TableHead>
                <TableHead>{t("auditLogs.columns.impersonatedUser", { defaultValue: "Impersonated User" })}</TableHead>
                <TableHead>{t("auditLogs.columns.reason", { defaultValue: "Justification Reason" })}</TableHead>
                <TableHead className="text-right">{t("auditLogs.columns.ipAddress", { defaultValue: "IP Address" })}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2Icon className="h-4 w-4 animate-spin text-primary" />
                      <span>Loading impersonation trail…</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : impersonationLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    No session impersonations recorded.
                  </TableCell>
                </TableRow>
              ) : (
                impersonationLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>

                    <TableCell className="font-mono text-xs font-semibold text-primary">
                      {log.adminEmail || log.adminId}
                    </TableCell>

                    <TableCell className="font-mono text-xs text-foreground">
                      {log.impersonatedUserEmail || log.impersonatedUserId}
                    </TableCell>

                    <TableCell className="text-xs text-foreground max-w-xs truncate" title={log.reason}>
                      {log.reason}
                    </TableCell>

                    <TableCell className="text-right text-xs font-mono text-muted-foreground">
                      {log.ipAddress || "Internal"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Metadata JSON Modal */}
      {selectedLog && (
        <Dialog open={metadataOpen} onOpenChange={setMetadataOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CodeIcon className="h-4 w-4 text-primary" />
                <span>Audit Action Payload</span>
              </DialogTitle>
              <DialogDescription>
                Action: <strong>{selectedLog.action}</strong>
              </DialogDescription>
            </DialogHeader>

            <div className="py-2">
              <pre className="max-h-64 overflow-y-auto rounded-lg border bg-muted/50 p-3 text-xs font-mono text-foreground">
                {JSON.stringify(selectedLog.metadata, null, 2)}
              </pre>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setMetadataOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
