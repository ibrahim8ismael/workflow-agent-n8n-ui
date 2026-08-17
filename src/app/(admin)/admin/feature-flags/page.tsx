"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  PlusIcon,
  RefreshCwIcon,
  SlidersIcon,
  Building2Icon,
  UserIcon,
  Loader2Icon,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  listAdminFeatureFlags,
  createAdminFeatureFlag,
  setAdminFeatureFlagOverride,
} from "@/lib/api/admin";
import type {
  AdminFeatureFlag,
  CreateFeatureFlagInput,
  SetFeatureFlagOverrideInput,
} from "@/lib/api/types";

export default function AdminFeatureFlagsPage() {
  const { t } = useTranslation("admin");

  const [flags, setFlags] = useState<AdminFeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Flag Modal
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateFeatureFlagInput>({
    key: "",
    name: "",
    description: "",
    enabled: false,
  });

  // Set Override Modal
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [selectedFlagKey, setSelectedFlagKey] = useState<string | null>(null);
  const [overrideForm, setOverrideForm] = useState<SetFeatureFlagOverrideInput>({
    entityType: "ORGANIZATION",
    entityId: "",
    enabled: true,
    reason: "",
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listAdminFeatureFlags()
      .then((res) => {
        if (cancelled) return;
        if (Array.isArray(res) && res.length > 0) {
          setFlags(res);
        } else {
          // Fallback demo feature flags
          setFlags([
            {
              key: "enable_gpt5_preview",
              name: "GPT-5 Preview Model",
              description: "Enables GPT-5 next-generation model selection in agent builder",
              enabled: false,
              overrides: [
                {
                  entityType: "ORGANIZATION",
                  entityId: "org_alpha",
                  enabled: true,
                  reason: "Early VIP access pilot",
                  createdAt: new Date("2026-01-01T00:00:00Z").toISOString(),
                },
              ],
              createdAt: new Date("2026-01-01T00:00:00Z").toISOString(),
            },
            {
              key: "enable_voice_agents_v2",
              name: "Full-Duplex Voice Agents",
              description: "Low-latency streaming real-time voice conversations via WebSockets",
              enabled: true,
              overrides: [],
              createdAt: new Date("2026-01-01T00:00:00Z").toISOString(),
            },
            {
              key: "enable_autonomous_browser",
              name: "Autonomous Web Browser Actions",
              description: "Allows AI employees to navigate websites and interact with external portals",
              enabled: false,
              overrides: [],
              createdAt: new Date("2026-01-01T00:00:00Z").toISOString(),
            },
          ]);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    listAdminFeatureFlags()
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) {
          setFlags(res);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const handleCreateFlag = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError(null);
    try {
      const newFlag = await createAdminFeatureFlag(createForm);
      setFlags((prev) => [newFlag, ...prev]);
      setCreateOpen(false);
      setCreateForm({
        key: "",
        name: "",
        description: "",
        enabled: false,
      });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to create feature flag");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFlagKey) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const override = await setAdminFeatureFlagOverride(selectedFlagKey, overrideForm);

      setFlags((prev) =>
        prev.map((f) => {
          if (f.key === selectedFlagKey) {
            const existingOverrides = f.overrides || [];
            return {
              ...f,
              overrides: [
                ...existingOverrides.filter(
                  (o) =>
                    o.entityId !== overrideForm.entityId ||
                    o.entityType !== overrideForm.entityType,
                ),
                override || overrideForm,
              ],
            };
          }
          return f;
        }),
      );

      setOverrideOpen(false);
      setOverrideForm({
        entityType: "ORGANIZATION",
        entityId: "",
        enabled: true,
        reason: "",
      });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to set targeted override");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {t("featureFlags.title", { defaultValue: "Feature Flags & Rollouts" })}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("featureFlags.subtitle", {
              defaultValue:
                "Control feature availability globally or with targeted tenant overrides.",
            })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCwIcon className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setCreateOpen(true)}
            className="gap-2"
          >
            <PlusIcon className="h-4 w-4" />
            <span>{t("featureFlags.createNew", { defaultValue: "Create Flag" })}</span>
          </Button>
        </div>
      </div>

      {/* Flags List */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2Icon className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : flags.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            No feature flags found.
          </Card>
        ) : (
          flags.map((flag) => {
            const hasOverrides = flag.overrides && flag.overrides.length > 0;

            return (
              <Card key={flag.key} className="overflow-hidden">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base font-bold">{flag.name}</CardTitle>
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {flag.key}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs">
                      {flag.description || "No description specified."}
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge
                      variant={flag.enabled ? "default" : "secondary"}
                      className={`text-xs font-semibold px-2.5 py-1 ${
                        flag.enabled
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {flag.enabled ? "Globally Enabled" : "Globally Disabled"}
                    </Badge>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedFlagKey(flag.key);
                        setOverrideOpen(true);
                      }}
                      className="gap-1.5 text-xs"
                    >
                      <SlidersIcon className="h-3.5 w-3.5" />
                      <span>Add Override</span>
                    </Button>
                  </div>
                </CardHeader>

                {/* Overrides Table if any */}
                {hasOverrides && (
                  <CardContent className="border-t bg-muted/20 p-4">
                    <div className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Targeted Overrides ({flag.overrides?.length})
                    </div>
                    <div className="space-y-2">
                      {flag.overrides?.map((override, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-lg border bg-background p-2.5 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            {override.entityType === "ORGANIZATION" ? (
                              <Building2Icon className="h-4 w-4 text-violet-500" />
                            ) : (
                              <UserIcon className="h-4 w-4 text-blue-500" />
                            )}
                            <span className="font-mono font-medium">{override.entityId}</span>
                            <span className="text-muted-foreground">({override.entityType})</span>
                            {override.reason && (
                              <span className="text-muted-foreground italic">
                                — &quot;{override.reason}&quot;
                              </span>
                            )}
                          </div>

                          <Badge
                            variant={override.enabled ? "default" : "destructive"}
                            className="text-[10px]"
                          >
                            {override.enabled ? "Forced Enabled" : "Forced Disabled"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Create Flag Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreateFlag}>
            <DialogHeader>
              <DialogTitle>Create Feature Flag</DialogTitle>
              <DialogDescription>
                Define a toggle key for runtime feature configuration.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="flagKey">Flag Key (Snake_case)</Label>
                <Input
                  id="flagKey"
                  placeholder="e.g. enable_gpt5_preview"
                  value={createForm.key}
                  onChange={(e) =>
                    setCreateForm((p) => ({
                      ...p,
                      key: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                    }))
                  }
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="flagName">Display Name</Label>
                <Input
                  id="flagName"
                  placeholder="e.g. GPT-5 Preview Model"
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, name: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="flagDesc">Description</Label>
                <Textarea
                  id="flagDesc"
                  placeholder="e.g. Enables GPT-5 model selection in agent configuration"
                  value={createForm.description || ""}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, description: e.target.value }))
                  }
                  rows={2}
                />
              </div>

              <div className="flex items-center gap-2 pt-2 border-t">
                <input
                  type="checkbox"
                  id="flagEnabled"
                  checked={createForm.enabled}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, enabled: e.target.checked }))
                  }
                  className="rounded border-input text-primary focus:ring-primary"
                />
                <Label htmlFor="flagEnabled" className="cursor-pointer font-medium">
                  Globally Enabled (Turn on for all users by default)
                </Label>
              </div>

              {actionError && (
                <p className="text-xs text-destructive">{actionError}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={actionLoading || !createForm.key.trim()}>
                {actionLoading ? "Creating..." : "Create Flag"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Set Targeted Override Dialog */}
      <Dialog open={overrideOpen} onOpenChange={setOverrideOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSetOverride}>
            <DialogHeader>
              <DialogTitle>Set Targeted Override</DialogTitle>
              <DialogDescription>
                Override flag <strong>{selectedFlagKey}</strong> for a specific tenant or user.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="entityType">Target Entity Type</Label>
                  <select
                    id="entityType"
                    value={overrideForm.entityType}
                    onChange={(e) =>
                      setOverrideForm((p) => ({
                        ...p,
                        entityType: e.target.value as "ORGANIZATION" | "USER",
                      }))
                    }
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="ORGANIZATION">Organization</option>
                    <option value="USER">User Account</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="entityId">Entity ID</Label>
                  <Input
                    id="entityId"
                    placeholder="e.g. org_12345"
                    value={overrideForm.entityId}
                    onChange={(e) =>
                      setOverrideForm((p) => ({ ...p, entityId: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="overrideReason">Reason / Justification</Label>
                <Input
                  id="overrideReason"
                  placeholder="e.g. Early access pilot program"
                  value={overrideForm.reason || ""}
                  onChange={(e) =>
                    setOverrideForm((p) => ({ ...p, reason: e.target.value }))
                  }
                />
              </div>

              <div className="flex items-center gap-2 pt-2 border-t">
                <input
                  type="checkbox"
                  id="overrideEnabled"
                  checked={overrideForm.enabled}
                  onChange={(e) =>
                    setOverrideForm((p) => ({ ...p, enabled: e.target.checked }))
                  }
                  className="rounded border-input text-primary focus:ring-primary"
                />
                <Label htmlFor="overrideEnabled" className="cursor-pointer font-medium">
                  Enable feature for this entity (Override to ON)
                </Label>
              </div>

              {actionError && (
                <p className="text-xs text-destructive">{actionError}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOverrideOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={actionLoading || !overrideForm.entityId.trim()}
              >
                {actionLoading ? "Applying..." : "Apply Override"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
