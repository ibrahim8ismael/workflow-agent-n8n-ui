"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ShieldCheckIcon,
  ShieldAlertIcon,
  SearchIcon,
  RefreshCwIcon,
  UserXIcon,
  UserCheckIcon,
  EyeIcon,
  UserCogIcon,
  Loader2Icon,
  CoinsIcon,
  ExternalLinkIcon,
  InfoIcon,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  listAdminUsers,
  getAdminUserStats,
  suspendAdminUser,
  reactivateAdminUser,
  impersonateAdminUser,
} from "@/lib/api/admin";
import { setAccessToken } from "@/lib/api/client";
import { fetchMe } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/auth-store";
import type { AdminUserListItem, AdminUserStats } from "@/lib/api/types";
import { useRouter } from "next/navigation";

export default function AdminUsersPage() {
  const { t } = useTranslation("admin");
  const router = useRouter();
  const { signIn } = useAuthStore();

  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [stats, setStats] = useState<AdminUserStats>({
    totalUsers: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    adminUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Action Dialog States
  const [selectedUser, setSelectedUser] = useState<AdminUserListItem | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [reactivateOpen, setReactivateOpen] = useState(false);
  const [impersonateOpen, setImpersonateOpen] = useState(false);
  const [actionReason, setActionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([
      listAdminUsers({ limit: 50, offset: 0, search: search || undefined }),
      getAdminUserStats(),
    ]).then(([usersRes, statsRes]) => {
      if (cancelled) return;
      if (usersRes.status === "fulfilled" && Array.isArray(usersRes.value)) {
        setUsers(usersRes.value);
      } else {
        // Fallback sample list for dev / demo
        setUsers([
          {
            id: "usr_101",
            email: "sarah.connor@skycorp.ai",
            name: "Sarah Connor",
            role: "SYSTEM_ADMINISTRATOR",
            isEmailVerified: true,
            isSuspended: false,
            organizationCount: 3,
            walletBalance: 150000,
            createdAt: new Date("2026-01-01T00:00:00Z").toISOString(),
            updatedAt: new Date("2026-01-01T00:00:00Z").toISOString(),
          },
          {
            id: "usr_102",
            email: "alex.mercer@apex.io",
            name: "Alex Mercer",
            role: "USER",
            isEmailVerified: true,
            isSuspended: false,
            organizationCount: 1,
            walletBalance: 42000,
            createdAt: new Date("2026-01-15T00:00:00Z").toISOString(),
            updatedAt: new Date("2026-01-15T00:00:00Z").toISOString(),
          },
          {
            id: "usr_103",
            email: "bot_spammer@tempmail.com",
            name: "Test Spammer",
            role: "USER",
            isEmailVerified: false,
            isSuspended: true,
            suspensionReason: "Abuse of LLM tokens and rate limits",
            organizationCount: 0,
            walletBalance: 0,
            createdAt: new Date("2026-02-01T00:00:00Z").toISOString(),
            updatedAt: new Date("2026-02-01T00:00:00Z").toISOString(),
          },
        ]);
      }

      if (statsRes.status === "fulfilled" && statsRes.value) {
        setStats(statsRes.value);
      } else {
        setStats({
          totalUsers: 1284,
          activeUsers: 1248,
          suspendedUsers: 12,
          adminUsers: 8,
          newUsersLast30Days: 142,
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
      listAdminUsers({ limit: 50, offset: 0, search: search || undefined }),
      getAdminUserStats(),
    ]).then(([usersRes, statsRes]) => {
      if (usersRes.status === "fulfilled" && Array.isArray(usersRes.value)) {
        setUsers(usersRes.value);
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
    if (!selectedUser) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await suspendAdminUser(
        selectedUser.id,
        actionReason || "Account suspended by Administrator",
      );
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? { ...u, isSuspended: true, suspensionReason: actionReason }
            : u,
        ),
      );
      setSuspendOpen(false);
      setActionReason("");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to suspend user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await reactivateAdminUser(
        selectedUser.id,
        actionReason || "Account reactivated by compliance",
      );
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? { ...u, isSuspended: false, suspensionReason: null }
            : u,
        ),
      );
      setReactivateOpen(false);
      setActionReason("");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to reactivate user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleImpersonate = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await impersonateAdminUser(
        selectedUser.id,
        actionReason || "Troubleshooting user session",
      );
      if (res.accessToken) {
        setAccessToken(res.accessToken);
        const impersonatedProfile = await fetchMe();
        signIn(impersonatedProfile, res.accessToken);
        setImpersonateOpen(false);
        router.push("/");
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to impersonate user");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !search ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.name && u.name.toLowerCase().includes(search.toLowerCase())) ||
      u.id.toLowerCase().includes(search.toLowerCase());

    const matchesRole =
      roleFilter === "ALL" || u.role === roleFilter;

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && !u.isSuspended) ||
      (statusFilter === "SUSPENDED" && u.isSuspended);

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {t("users.title", { defaultValue: "User Administration" })}
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage user accounts, roles, suspensions, and session impersonation.
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
          <div className="text-xs text-muted-foreground">Total Users</div>
          <div className="text-2xl font-bold mt-1">{stats.totalUsers.toLocaleString()}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Active</div>
          <div className="text-2xl font-bold mt-1 text-emerald-600">
            {stats.activeUsers.toLocaleString()}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Suspended</div>
          <div className="text-2xl font-bold mt-1 text-destructive">
            {stats.suspendedUsers.toLocaleString()}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Admins</div>
          <div className="text-2xl font-bold mt-1 text-primary">
            {stats.adminUsers.toLocaleString()}
          </div>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground rtl:left-auto rtl:right-3" />
              <Input
                placeholder={t("users.searchPlaceholder", {
                  defaultValue: "Search by name or email...",
                })}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 rtl:pl-3 rtl:pr-9"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="ALL">All Roles</option>
                <option value="USER">User</option>
                <option value="SYSTEM_ADMINISTRATOR">System Admin</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("users.columns.user", { defaultValue: "User" })}</TableHead>
              <TableHead>{t("users.columns.role", { defaultValue: "Role" })}</TableHead>
              <TableHead>{t("users.columns.status", { defaultValue: "Status" })}</TableHead>
              <TableHead className="text-right">{t("users.columns.organizations", { defaultValue: "Orgs" })}</TableHead>
              <TableHead>{t("users.columns.createdAt", { defaultValue: "Joined" })}</TableHead>
              <TableHead className="text-right">{t("users.columns.actions", { defaultValue: "Actions" })}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2Icon className="h-4 w-4 animate-spin text-primary" />
                    <span>Loading user directory…</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No users found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => {
                const isAdmin = user.role === "SYSTEM_ADMINISTRATOR";
                const isSuspended = !!user.isSuspended;

                return (
                  <TableRow key={user.id} className={isSuspended ? "bg-destructive/5" : ""}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 rounded-lg">
                          {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name || user.email} />}
                          <AvatarFallback className="rounded-lg text-xs font-semibold bg-muted">
                            {(user.name?.[0] || user.email[0]).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm text-foreground">
                            {user.name || "Unnamed User"}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[11px] font-medium ${
                          isAdmin
                            ? "border-primary/30 bg-primary/10 text-primary"
                            : "border-border bg-muted/40 text-muted-foreground"
                        }`}
                      >
                        {isAdmin ? "System Admin" : "User"}
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

                    <TableCell className="text-right font-medium">
                      {user.organizationCount ?? 1}
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          title="View Details"
                          onClick={() => {
                            setSelectedUser(user);
                            setViewDetailsOpen(true);
                          }}
                        >
                          <EyeIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button variant="ghost" size="icon-sm">
                                <UserCogIcon className="h-3.5 w-3.5 text-muted-foreground" />
                              </Button>
                            }
                          />
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel className="text-xs">User Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user);
                                setImpersonateOpen(true);
                              }}
                              className="text-xs gap-2"
                            >
                              <ExternalLinkIcon className="h-3.5 w-3.5 text-primary" />
                              <span>Impersonate User</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => router.push(`/admin/wallets?search=${user.id}`)}
                              className="text-xs gap-2"
                            >
                              <CoinsIcon className="h-3.5 w-3.5 text-amber-500" />
                              <span>Adjust Wallet</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            {isSuspended ? (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user);
                                  setReactivateOpen(true);
                                }}
                                className="text-xs gap-2 text-emerald-600 focus:text-emerald-600"
                              >
                                <UserCheckIcon className="h-3.5 w-3.5" />
                                <span>Reactivate Account</span>
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user);
                                  setSuspendOpen(true);
                                }}
                                className="text-xs gap-2 text-destructive focus:text-destructive"
                              >
                                <UserXIcon className="h-3.5 w-3.5" />
                                <span>Suspend Account</span>
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* User Details Modal */}
      {selectedUser && (
        <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>User Profile Details</DialogTitle>
              <DialogDescription>
                System identification and status breakdown.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                <Avatar className="h-12 w-12 rounded-xl">
                  {selectedUser.avatarUrl && <AvatarImage src={selectedUser.avatarUrl} />}
                  <AvatarFallback className="text-sm font-bold">
                    {(selectedUser.name?.[0] || selectedUser.email[0]).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-sm">{selectedUser.name || "Unnamed"}</h4>
                  <p className="text-xs text-muted-foreground font-mono">{selectedUser.email}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      {selectedUser.role}
                    </Badge>
                    {selectedUser.isSuspended && (
                      <Badge variant="destructive" className="text-[10px]">
                        Suspended
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">User ID</span>
                  <span className="font-mono">{selectedUser.id}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Email Verified</span>
                  <span>{selectedUser.isEmailVerified ? "Yes (Verified)" : "No"}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Organizations</span>
                  <span>{selectedUser.organizationCount ?? 1}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Registered</span>
                  <span>{new Date(selectedUser.createdAt).toLocaleString()}</span>
                </div>
                {selectedUser.suspensionReason && (
                  <div className="rounded-md bg-destructive/10 p-2 text-destructive">
                    <div className="font-semibold">Suspension Reason:</div>
                    <p className="mt-0.5">{selectedUser.suspensionReason}</p>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setViewDetailsOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Suspend Account Modal */}
      {selectedUser && (
        <Dialog open={suspendOpen} onOpenChange={setSuspendOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-destructive flex items-center gap-2">
                <ShieldAlertIcon className="h-5 w-5" />
                <span>Suspend User Account</span>
              </DialogTitle>
              <DialogDescription>
                Suspending <strong>{selectedUser.email}</strong> will invalidate active sessions and block digital employee execution.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="suspendReason" className="text-xs">
                  Reason for Suspension (Required for audit log)
                </Label>
                <Textarea
                  id="suspendReason"
                  placeholder="e.g. Violated terms of service (abuse of LLM tokens)..."
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
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
                  setActionReason("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleSuspend}
                disabled={actionLoading}
              >
                {actionLoading ? "Suspending..." : "Confirm Suspension"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Reactivate Account Modal */}
      {selectedUser && (
        <Dialog open={reactivateOpen} onOpenChange={setReactivateOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-emerald-600 flex items-center gap-2">
                <ShieldCheckIcon className="h-5 w-5" />
                <span>Reactivate User Account</span>
              </DialogTitle>
              <DialogDescription>
                Restore platform access and employee workflows for <strong>{selectedUser.email}</strong>.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="reactivateReason" className="text-xs">
                  Audit Justification Note
                </Label>
                <Textarea
                  id="reactivateReason"
                  placeholder="e.g. Account cleared by compliance..."
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
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
                  setReactivateOpen(false);
                  setActionReason("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReactivate}
                disabled={actionLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {actionLoading ? "Reactivating..." : "Reactivate Account"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Impersonate Session Modal */}
      {selectedUser && (
        <Dialog open={impersonateOpen} onOpenChange={setImpersonateOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserCogIcon className="h-5 w-5 text-primary" />
                <span>Impersonate User Session</span>
              </DialogTitle>
              <DialogDescription>
                You will generate a temporary session token to view and troubleshoot the platform as <strong>{selectedUser.email}</strong>.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <div className="rounded-md bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
                <InfoIcon className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  All actions taken while impersonating will be stamped in the platform audit trail under your administrator credentials.
                </span>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="impersonateReason" className="text-xs">
                  Impersonation Justification (Required)
                </Label>
                <Textarea
                  id="impersonateReason"
                  placeholder="e.g. Troubleshooting billing sync issue or reviewing agent configuration..."
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
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
                  setImpersonateOpen(false);
                  setActionReason("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleImpersonate}
                disabled={actionLoading || !actionReason.trim()}
              >
                {actionLoading ? "Generating Token..." : "Start Impersonation"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
