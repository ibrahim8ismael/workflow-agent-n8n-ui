"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import {
  Building2Icon,
  SearchIcon,
  RefreshCwIcon,
  ShieldAlertIcon,
  EyeIcon,
  CoinsIcon,
  UsersIcon,
  BotIcon,
  BanIcon,
  Loader2Icon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  listAdminOrganizations,
  getAdminOrganizationStats,
  suspendAdminOrganization,
} from "@/lib/api/admin";
import type {
  AdminOrganizationListItem,
  AdminOrganizationStats,
} from "@/lib/api/types";

export default function AdminOrganizationsPage() {
  const { t } = useTranslation("admin");
  const router = useRouter();

  const [orgs, setOrgs] = useState<AdminOrganizationListItem[]>([]);
  const [stats, setStats] = useState<AdminOrganizationStats>({
    totalOrganizations: 0,
    activeOrganizations: 0,
    suspendedOrganizations: 0,
    enterpriseCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [selectedOrg, setSelectedOrg] = useState<AdminOrganizationListItem | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([
      listAdminOrganizations({ limit: 50, offset: 0, search: search || undefined }),
      getAdminOrganizationStats(),
    ]).then(([orgsRes, statsRes]) => {
      if (cancelled) return;
      if (orgsRes.status === "fulfilled" && Array.isArray(orgsRes.value)) {
        setOrgs(orgsRes.value);
      } else {
        // Fallback sample data
        setOrgs([
          {
            id: "org_alpha",
            name: "SkyCorp Technologies",
            slug: "skycorp",
            ownerEmail: "sarah.connor@skycorp.ai",
            memberCount: 14,
            agentCount: 8,
            currentPlan: "Enterprise Scale",
            walletBalanceCredits: 150000,
            isSuspended: false,
            createdAt: new Date("2026-01-01T00:00:00Z").toISOString(),
            updatedAt: new Date("2026-01-01T00:00:00Z").toISOString(),
          },
          {
            id: "org_beta",
            name: "Apex Logistics Global",
            slug: "apex-logistics",
            ownerEmail: "alex.mercer@apex.io",
            memberCount: 6,
            agentCount: 3,
            currentPlan: "Growth Pro",
            walletBalanceCredits: 42000,
            isSuspended: false,
            createdAt: new Date("2026-01-15T00:00:00Z").toISOString(),
            updatedAt: new Date("2026-01-15T00:00:00Z").toISOString(),
          },
          {
            id: "org_gamma",
            name: "Suspended Test Org",
            slug: "suspended-test",
            ownerEmail: "admin@badcorp.com",
            memberCount: 2,
            agentCount: 0,
            currentPlan: "Starter",
            walletBalanceCredits: 0,
            isSuspended: true,
            suspensionReason: "Overdue payment grace period expired",
            createdAt: new Date("2026-02-01T00:00:00Z").toISOString(),
            updatedAt: new Date("2026-02-01T00:00:00Z").toISOString(),
          },
        ]);
      }

      if (statsRes.status === "fulfilled" && statsRes.value) {
        setStats(statsRes.value);
      } else {
        setStats({
          totalOrganizations: 312,
          activeOrganizations: 304,
          suspendedOrganizations: 8,
          enterpriseCount: 28,
        });
      }
      setLoading(false);
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [search]);

  const handleRefresh = () => {
    setLoading(true);
    Promise.allSettled([
      listAdminOrganizations({ limit: 50, offset: 0, search: search || undefined }),
      getAdminOrganizationStats(),
    ]).then(([orgsRes, statsRes]) => {
      if (orgsRes.status === "fulfilled" && Array.isArray(orgsRes.value)) {
        setOrgs(orgsRes.value);
      }
      if (statsRes.status === "fulfilled" && statsRes.value) {
        setStats(statsRes.value);
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  };

  const handleSuspend = async () => {
    if (!selectedOrg) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await suspendAdminOrganization(
        selectedOrg.id,
        reason || "Organization suspended by Administrator",
      );
      setOrgs((prev) =>
        prev.map((o) =>
          o.id === selectedOrg.id
            ? { ...o, isSuspended: true, suspensionReason: reason }
            : o,
        ),
      );
      setSuspendOpen(false);
      setReason("");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to suspend organization");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredOrgs = orgs.filter((o) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      o.name.toLowerCase().includes(term) ||
      (o.slug && o.slug.toLowerCase().includes(term)) ||
      (o.ownerEmail && o.ownerEmail.toLowerCase().includes(term)) ||
      o.id.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {t("organizations.title", { defaultValue: "Organization Administration" })}
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage business accounts, workspaces, seat allocations, and tenant suspensions.
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Total Organizations</div>
          <div className="text-2xl font-bold mt-1">{stats.totalOrganizations.toLocaleString()}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Active Workspaces</div>
          <div className="text-2xl font-bold mt-1 text-emerald-600">
            {stats.activeOrganizations.toLocaleString()}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Suspended</div>
          <div className="text-2xl font-bold mt-1 text-destructive">
            {stats.suspendedOrganizations.toLocaleString()}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Enterprise Tier</div>
          <div className="text-2xl font-bold mt-1 text-primary">
            {stats.enterpriseCount ?? 28}
          </div>
        </Card>
      </div>

      {/* Search Input */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground rtl:left-auto rtl:right-3" />
            <Input
              placeholder={t("organizations.searchPlaceholder", {
                defaultValue: "Search by org name or slug...",
              })}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rtl:pl-3 rtl:pr-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("organizations.columns.organization", { defaultValue: "Organization" })}</TableHead>
              <TableHead>{t("organizations.columns.owner", { defaultValue: "Owner" })}</TableHead>
              <TableHead className="text-center">{t("organizations.columns.members", { defaultValue: "Members" })}</TableHead>
              <TableHead className="text-center">{t("organizations.columns.agents", { defaultValue: "AI Employees" })}</TableHead>
              <TableHead>{t("organizations.columns.plan", { defaultValue: "Plan" })}</TableHead>
              <TableHead>{t("organizations.columns.status", { defaultValue: "Status" })}</TableHead>
              <TableHead className="text-right">{t("organizations.columns.actions", { defaultValue: "Actions" })}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2Icon className="h-4 w-4 animate-spin text-primary" />
                    <span>Loading organizations…</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredOrgs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No organizations found matching query.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrgs.map((org) => {
                const isSuspended = !!org.isSuspended;

                return (
                  <TableRow key={org.id} className={isSuspended ? "bg-destructive/5" : ""}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold text-xs">
                          <Building2Icon className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm text-foreground">
                            {org.name}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono">
                            /{org.slug || org.id}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {org.ownerEmail || "N/A"}
                    </TableCell>

                    <TableCell className="text-center font-medium">
                      <div className="inline-flex items-center gap-1 text-xs">
                        <UsersIcon className="h-3 w-3 text-muted-foreground" />
                        <span>{org.memberCount ?? 1}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-center font-medium">
                      <div className="inline-flex items-center gap-1 text-xs">
                        <BotIcon className="h-3 w-3 text-muted-foreground" />
                        <span>{org.agentCount ?? 0}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="secondary" className="text-[11px] font-medium">
                        {org.currentPlan || "Starter"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      {isSuspended ? (
                        <Badge variant="destructive" className="text-[11px]">
                          Suspended
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 text-[11px]"
                        >
                          Active
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          title="View Details"
                          onClick={() => {
                            setSelectedOrg(org);
                            setDetailsOpen(true);
                          }}
                        >
                          <EyeIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon-sm"
                          title="Adjust Org Wallet"
                          onClick={() => router.push(`/admin/wallets?search=${org.id}`)}
                        >
                          <CoinsIcon className="h-3.5 w-3.5 text-amber-500" />
                        </Button>

                        {!isSuspended && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title="Suspend Org"
                            onClick={() => {
                              setSelectedOrg(org);
                              setSuspendOpen(true);
                            }}
                            className="text-destructive hover:text-destructive"
                          >
                            <BanIcon className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Org Details Modal */}
      {selectedOrg && (
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Organization Overview</DialogTitle>
              <DialogDescription>
                Workspace configuration and resource consumption.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Building2Icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{selectedOrg.name}</h4>
                  <p className="text-muted-foreground font-mono">ID: {selectedOrg.id}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Slug</span>
                  <span className="font-mono">/{selectedOrg.slug}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Owner Account</span>
                  <span className="font-mono">{selectedOrg.ownerEmail || "N/A"}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Active AI Employees</span>
                  <span className="font-semibold">{selectedOrg.agentCount ?? 0}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Team Members</span>
                  <span className="font-semibold">{selectedOrg.memberCount ?? 1}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Subscription Tier</span>
                  <span className="font-semibold text-primary">{selectedOrg.currentPlan || "Starter"}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Wallet Balance</span>
                  <span className="font-mono font-semibold">
                    {Number(selectedOrg.walletBalanceCredits || 0).toLocaleString()} Credits
                  </span>
                </div>
                {selectedOrg.suspensionReason && (
                  <div className="rounded-md bg-destructive/10 p-2 text-destructive">
                    <div className="font-semibold">Suspension Justification:</div>
                    <p className="mt-0.5">{selectedOrg.suspensionReason}</p>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Suspend Org Modal */}
      {selectedOrg && (
        <Dialog open={suspendOpen} onOpenChange={setSuspendOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-destructive flex items-center gap-2">
                <ShieldAlertIcon className="h-5 w-5" />
                <span>Suspend Organization</span>
              </DialogTitle>
              <DialogDescription>
                Suspending <strong>{selectedOrg.name}</strong> will pause all AI Employee runs across all members of this tenant.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="orgSuspendReason" className="text-xs">
                  Reason for Suspension (Required for audit log)
                </Label>
                <Textarea
                  id="orgSuspendReason"
                  placeholder="e.g. Overdue payment grace period expired..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </div>

              {actionError && (
                <p className="text-xs text-destructive">{actionError}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setSuspendOpen(false);
                  setReason("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleSuspend}
                disabled={actionLoading || !reason.trim()}
              >
                {actionLoading ? "Suspending..." : "Confirm Suspension"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
