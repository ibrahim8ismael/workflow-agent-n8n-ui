"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  PlusIcon,
  RefreshCwIcon,
  Edit2Icon,
  UsersIcon,
  ZapIcon,
  Loader2Icon,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
  listAdminPlans,
  createAdminPlan,
  updateAdminPlan,
} from "@/lib/api/admin";
import type { SubscriptionPlan, CreatePlanInput } from "@/lib/api/types";

export default function AdminPlansPage() {
  const { t } = useTranslation("admin");

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Modal State
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreatePlanInput>({
    name: "",
    description: "",
    price: 49,
    currency: "USD",
    interval: "month",
    features: { maxEmployees: 5, prioritySupport: false },
    isActive: true,
  });

  // Edit Modal State
  const [editOpen, setEditOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    description: string;
    price: number;
    interval: string;
    maxEmployees: number;
    prioritySupport: boolean;
    isActive: boolean;
  }>({
    name: "",
    description: "",
    price: 0,
    interval: "month",
    maxEmployees: 1,
    prioritySupport: false,
    isActive: true,
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listAdminPlans()
      .then((res) => {
        if (cancelled) return;
        if (Array.isArray(res) && res.length > 0) {
          setPlans(res);
        } else {
          // Fallback standard plans
          setPlans([
            {
              id: "plan_starter",
              name: "Starter",
              description: "Essential AI teammates for solopreneurs & small teams",
              price: 29,
              currency: "USD",
              interval: "month",
              features: { maxEmployees: 3, prioritySupport: false },
              isActive: true,
              createdAt: new Date("2026-01-01T00:00:00Z").toISOString(),
              updatedAt: new Date("2026-01-01T00:00:00Z").toISOString(),
            },
            {
              id: "plan_growth",
              name: "Growth Pro",
              description: "High-throughput AI workforce with automated team collaboration",
              price: 99,
              currency: "USD",
              interval: "month",
              features: { maxEmployees: 10, prioritySupport: true },
              isActive: true,
              createdAt: new Date("2026-01-01T00:00:00Z").toISOString(),
              updatedAt: new Date("2026-01-01T00:00:00Z").toISOString(),
            },
            {
              id: "plan_enterprise",
              name: "Enterprise Scale",
              description: "Unlimited agents with high-concurrency execution & custom models",
              price: 299,
              currency: "USD",
              interval: "month",
              features: { maxEmployees: 50, prioritySupport: true },
              isActive: true,
              createdAt: new Date("2026-01-01T00:00:00Z").toISOString(),
              updatedAt: new Date("2026-01-01T00:00:00Z").toISOString(),
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
    listAdminPlans()
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) {
          setPlans(res);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError(null);
    try {
      const newPlan = await createAdminPlan(createForm);
      setPlans((prev) => [...prev, newPlan]);
      setCreateOpen(false);
      setCreateForm({
        name: "",
        description: "",
        price: 49,
        currency: "USD",
        interval: "month",
        features: { maxEmployees: 5, prioritySupport: false },
        isActive: true,
      });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to create plan");
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    const features = (plan.features || {}) as Record<string, unknown>;
    setEditForm({
      name: plan.name,
      description: plan.description || "",
      price: plan.price,
      interval: plan.interval || "month",
      maxEmployees: Number(features.maxEmployees) || 5,
      prioritySupport: !!features.prioritySupport,
      isActive: plan.isActive,
    });
    setEditOpen(true);
  };

  const handleUpdatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const updated = await updateAdminPlan(editingPlan.id, {
        name: editForm.name,
        description: editForm.description,
        price: editForm.price,
        interval: editForm.interval,
        features: {
          maxEmployees: editForm.maxEmployees,
          prioritySupport: editForm.prioritySupport,
        },
        isActive: editForm.isActive,
      });

      setPlans((prev) =>
        prev.map((p) => (p.id === editingPlan.id ? { ...p, ...updated } : p)),
      );
      setEditOpen(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to update plan");
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
            {t("plans.title", { defaultValue: "Subscription Plans Management" })}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("plans.subtitle", {
              defaultValue: "Configure pricing tiers, employee quotas, and feature allocations.",
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
            <span>{t("plans.createNew", { defaultValue: "Create New Plan" })}</span>
          </Button>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {loading ? (
          <div className="col-span-3 flex h-48 items-center justify-center">
            <Loader2Icon className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          plans.map((plan) => {
            const features = (plan.features || {}) as Record<string, unknown>;
            const maxEmployees = Number(features.maxEmployees) || 1;
            const prioritySupport = !!features.prioritySupport;

            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col justify-between transition-all ${
                  plan.isActive
                    ? "border-border shadow-xs hover:border-primary/50"
                    : "opacity-60 bg-muted/30 border-dashed"
                }`}
              >
                <div>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold">{plan.name}</CardTitle>
                      <Badge
                        variant={plan.isActive ? "default" : "secondary"}
                        className="text-[10px]"
                      >
                        {plan.isActive ? "Active" : "Archived"}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs min-h-[36px]">
                      {plan.description || "No description provided"}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold tracking-tight">
                        ${plan.price}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        /{plan.interval || "month"}
                      </span>
                    </div>

                    <div className="space-y-2 border-t pt-3 text-xs">
                      <div className="flex items-center gap-2">
                        <UsersIcon className="h-3.5 w-3.5 text-primary" />
                        <span>Up to <strong>{maxEmployees} AI Employees</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ZapIcon className="h-3.5 w-3.5 text-amber-500" />
                        <span>
                          {prioritySupport ? "Priority SLA Support" : "Standard Community Support"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </div>

                <CardFooter className="border-t pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 text-xs"
                    onClick={() => handleOpenEdit(plan)}
                  >
                    <Edit2Icon className="h-3.5 w-3.5" />
                    <span>Edit Plan</span>
                  </Button>
                </CardFooter>
              </Card>
            );
          })
        )}
      </div>

      {/* Create Plan Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreatePlan}>
            <DialogHeader>
              <DialogTitle>Create Subscription Plan</DialogTitle>
              <DialogDescription>
                Publish a new tier to the billing catalog.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="planName">Plan Name</Label>
                <Input
                  id="planName"
                  placeholder="e.g. Enterprise Scale"
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, name: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="planDesc">Description</Label>
                <Textarea
                  id="planDesc"
                  placeholder="e.g. Unlimited agents with high-concurrency execution"
                  value={createForm.description || ""}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, description: e.target.value }))
                  }
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="planPrice">Price (USD)</Label>
                  <Input
                    id="planPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={createForm.price}
                    onChange={(e) =>
                      setCreateForm((p) => ({
                        ...p,
                        price: parseFloat(e.target.value) || 0,
                      }))
                    }
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="planInterval">Billing Interval</Label>
                  <select
                    id="planInterval"
                    value={createForm.interval}
                    onChange={(e) =>
                      setCreateForm((p) => ({ ...p, interval: e.target.value }))
                    }
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="month">Monthly</option>
                    <option value="year">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="maxEmployees">Max AI Employees</Label>
                  <Input
                    id="maxEmployees"
                    type="number"
                    min="1"
                    value={
                      Number(
                        (createForm.features as Record<string, unknown>)
                          ?.maxEmployees,
                      ) || 5
                    }
                    onChange={(e) =>
                      setCreateForm((p) => ({
                        ...p,
                        features: {
                          ...p.features,
                          maxEmployees: parseInt(e.target.value, 10) || 1,
                        },
                      }))
                    }
                  />
                </div>

                <div className="flex flex-col justify-end space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="prioritySupport"
                      checked={
                        !!(createForm.features as Record<string, unknown>)
                          ?.prioritySupport
                      }
                      onChange={(e) =>
                        setCreateForm((p) => ({
                          ...p,
                          features: {
                            ...p.features,
                            prioritySupport: e.target.checked,
                          },
                        }))
                      }
                      className="rounded border-input text-primary focus:ring-primary"
                    />
                    <Label htmlFor="prioritySupport" className="cursor-pointer">
                      Priority Support
                    </Label>
                  </div>
                </div>
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
              <Button type="submit" disabled={actionLoading}>
                {actionLoading ? "Creating..." : "Create Plan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Plan Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleUpdatePlan}>
            <DialogHeader>
              <DialogTitle>Edit Subscription Plan</DialogTitle>
              <DialogDescription>
                Update pricing, limits, and visibility.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="editPlanName">Plan Name</Label>
                <Input
                  id="editPlanName"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, name: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="editPlanDesc">Description</Label>
                <Textarea
                  id="editPlanDesc"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, description: e.target.value }))
                  }
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="editPlanPrice">Price (USD)</Label>
                  <Input
                    id="editPlanPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editForm.price}
                    onChange={(e) =>
                      setEditForm((p) => ({
                        ...p,
                        price: parseFloat(e.target.value) || 0,
                      }))
                    }
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="editPlanInterval">Billing Interval</Label>
                  <select
                    id="editPlanInterval"
                    value={editForm.interval}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, interval: e.target.value }))
                    }
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="month">Monthly</option>
                    <option value="year">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="editMaxEmployees">Max AI Employees</Label>
                  <Input
                    id="editMaxEmployees"
                    type="number"
                    min="1"
                    value={editForm.maxEmployees}
                    onChange={(e) =>
                      setEditForm((p) => ({
                        ...p,
                        maxEmployees: parseInt(e.target.value, 10) || 1,
                      }))
                    }
                  />
                </div>

                <div className="flex flex-col justify-end space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="editPrioritySupport"
                      checked={editForm.prioritySupport}
                      onChange={(e) =>
                        setEditForm((p) => ({
                          ...p,
                          prioritySupport: e.target.checked,
                        }))
                      }
                      className="rounded border-input text-primary focus:ring-primary"
                    />
                    <Label htmlFor="editPrioritySupport" className="cursor-pointer">
                      Priority Support
                    </Label>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={editForm.isActive}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, isActive: e.target.checked }))
                  }
                  className="rounded border-input text-primary focus:ring-primary"
                />
                <Label htmlFor="editIsActive" className="cursor-pointer font-medium">
                  Active (Available for new subscribers)
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
                onClick={() => setEditOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={actionLoading}>
                {actionLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
