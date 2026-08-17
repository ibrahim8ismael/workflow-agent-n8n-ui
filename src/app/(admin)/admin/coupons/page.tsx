"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  PlusIcon,
  RefreshCwIcon,
  GiftIcon,
  PercentIcon,
  DollarSignIcon,
  CopyIcon,
  CheckIcon,
  Loader2Icon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
import { listAdminCoupons, createAdminCoupon } from "@/lib/api/admin";
import type { AdminCoupon, CreateCouponInput, CouponType } from "@/lib/api/types";

export default function AdminCouponsPage() {
  const { t } = useTranslation("admin");

  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Create Modal
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateCouponInput>({
    code: "",
    type: "FREE_CREDITS",
    value: 50000,
    maxRedemptions: 100,
    expiresAt: "2026-09-01",
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listAdminCoupons()
      .then((res) => {
        if (cancelled) return;
        if (Array.isArray(res) && res.length > 0) {
          setCoupons(res);
        } else {
          // Fallback demo coupons
          setCoupons([
            {
              id: "cpn_01",
              code: "SUMMER50",
              type: "FREE_CREDITS",
              value: 50000,
              maxRedemptions: 100,
              redemptionCount: 42,
              expiresAt: new Date("2026-09-01T00:00:00Z").toISOString(),
              isActive: true,
              createdAt: new Date("2026-01-01T00:00:00Z").toISOString(),
            },
            {
              id: "cpn_02",
              code: "WELCOME10K",
              type: "FREE_CREDITS",
              value: 10000,
              maxRedemptions: 500,
              redemptionCount: 289,
              expiresAt: new Date("2026-12-31T00:00:00Z").toISOString(),
              isActive: true,
              createdAt: new Date("2026-01-01T00:00:00Z").toISOString(),
            },
            {
              id: "cpn_03",
              code: "EARLYBIRD20",
              type: "PERCENTAGE_DISCOUNT",
              value: 20,
              maxRedemptions: 50,
              redemptionCount: 50,
              expiresAt: new Date("2026-01-01T00:00:00Z").toISOString(),
              isActive: false,
              createdAt: new Date("2025-12-01T00:00:00Z").toISOString(),
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
    listAdminCoupons()
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) {
          setCoupons(res);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError(null);
    try {
      const newCoupon = await createAdminCoupon({
        ...createForm,
        code: createForm.code.toUpperCase().trim(),
        expiresAt: createForm.expiresAt ? new Date(createForm.expiresAt).toISOString() : undefined,
      });

      setCoupons((prev) => [newCoupon, ...prev]);
      setCreateOpen(false);
      setCreateForm({
        code: "",
        type: "FREE_CREDITS",
        value: 50000,
        maxRedemptions: 100,
        expiresAt: "2026-09-01",
      });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to create coupon");
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const generateRandomCode = () => {
    const prefix = "WOOPS_";
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    setCreateForm((p) => ({ ...p, code: `${prefix}${random}` }));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {t("coupons.title", { defaultValue: "Coupon & Promo Management" })}
          </h1>
          <p className="text-sm text-muted-foreground">
            Create and monitor promotional codes, credit grants, and redemption quotas.
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
            <span>{t("coupons.createNew", { defaultValue: "Create Coupon" })}</span>
          </Button>
        </div>
      </div>

      {/* Coupons Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("coupons.columns.code", { defaultValue: "Promo Code" })}</TableHead>
              <TableHead>{t("coupons.columns.type", { defaultValue: "Type" })}</TableHead>
              <TableHead>{t("coupons.columns.value", { defaultValue: "Value" })}</TableHead>
              <TableHead className="text-center">{t("coupons.columns.redemptions", { defaultValue: "Redemptions" })}</TableHead>
              <TableHead>{t("coupons.columns.expiresAt", { defaultValue: "Expires" })}</TableHead>
              <TableHead>{t("coupons.columns.status", { defaultValue: "Status" })}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2Icon className="h-4 w-4 animate-spin text-primary" />
                    <span>Loading coupon catalog…</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : coupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No promotional coupons created yet.
                </TableCell>
              </TableRow>
            ) : (
              coupons.map((coupon) => {
                const isExpired = coupon.expiresAt ? coupon.expiresAt < "2026-08-01T00:00:00Z" : false;
                const isMaxedOut = coupon.maxRedemptions && (coupon.redemptionCount || 0) >= coupon.maxRedemptions;
                const isUsable = !isExpired && !isMaxedOut && coupon.isActive !== false;

                return (
                  <TableRow key={coupon.id || coupon.code}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm tracking-wider text-primary">
                          {coupon.code}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          title="Copy Code"
                          onClick={() => copyToClipboard(coupon.code)}
                        >
                          {copiedCode === coupon.code ? (
                            <CheckIcon className="h-3 w-3 text-emerald-600" />
                          ) : (
                            <CopyIcon className="h-3 w-3 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="text-[11px] gap-1">
                        {coupon.type === "FREE_CREDITS" && <GiftIcon className="h-3 w-3 text-amber-500" />}
                        {coupon.type === "PERCENTAGE_DISCOUNT" && <PercentIcon className="h-3 w-3 text-blue-500" />}
                        {coupon.type === "FIXED_DISCOUNT" && <DollarSignIcon className="h-3 w-3 text-emerald-500" />}
                        <span>
                          {t(`coupons.types.${coupon.type}`, { defaultValue: coupon.type.replace("_", " ") })}
                        </span>
                      </Badge>
                    </TableCell>

                    <TableCell className="font-semibold text-sm">
                      {coupon.type === "FREE_CREDITS"
                        ? `${coupon.value.toLocaleString()} Credits`
                        : coupon.type === "PERCENTAGE_DISCOUNT"
                        ? `${coupon.value}% Off`
                        : `$${coupon.value} Off`}
                    </TableCell>

                    <TableCell className="text-center font-mono text-xs">
                      {coupon.redemptionCount ?? 0} / {coupon.maxRedemptions ?? "∞"}
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : "Never"}
                    </TableCell>

                    <TableCell>
                      {isUsable ? (
                        <Badge
                          variant="outline"
                          className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 text-[11px]"
                        >
                          Active
                        </Badge>
                      ) : isExpired ? (
                        <Badge variant="secondary" className="text-[11px] text-muted-foreground">
                          Expired
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[11px] text-muted-foreground">
                          Redeemed
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Create Coupon Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreateCoupon}>
            <DialogHeader>
              <DialogTitle>Create Coupon Code</DialogTitle>
              <DialogDescription>
                Define promotional discounts or free credit vouchers.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3 text-xs">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="couponCode">Coupon Code</Label>
                  <button
                    type="button"
                    onClick={generateRandomCode}
                    className="text-[11px] text-primary hover:underline"
                  >
                    Generate Random
                  </button>
                </div>
                <Input
                  id="couponCode"
                  placeholder="e.g. SUMMER50"
                  value={createForm.code}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="couponType">Coupon Type</Label>
                  <select
                    id="couponType"
                    value={createForm.type}
                    onChange={(e) =>
                      setCreateForm((p) => ({ ...p, type: e.target.value as CouponType }))
                    }
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="FREE_CREDITS">Free Credits</option>
                    <option value="PERCENTAGE_DISCOUNT">Percentage (%)</option>
                    <option value="FIXED_DISCOUNT">Fixed ($)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="couponValue">
                    {createForm.type === "FREE_CREDITS"
                      ? "Credits Amount"
                      : createForm.type === "PERCENTAGE_DISCOUNT"
                      ? "Discount %"
                      : "Discount $"}
                  </Label>
                  <Input
                    id="couponValue"
                    type="number"
                    min="1"
                    value={createForm.value}
                    onChange={(e) =>
                      setCreateForm((p) => ({
                        ...p,
                        value: parseFloat(e.target.value) || 0,
                      }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="maxRedemptions">Max Redemptions</Label>
                  <Input
                    id="maxRedemptions"
                    type="number"
                    min="1"
                    value={createForm.maxRedemptions || 100}
                    onChange={(e) =>
                      setCreateForm((p) => ({
                        ...p,
                        maxRedemptions: parseInt(e.target.value, 10) || 1,
                      }))
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="expiresAt">Expiration Date</Label>
                  <Input
                    id="expiresAt"
                    type="date"
                    value={createForm.expiresAt || ""}
                    onChange={(e) =>
                      setCreateForm((p) => ({ ...p, expiresAt: e.target.value }))
                    }
                  />
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
              <Button type="submit" disabled={actionLoading || !createForm.code.trim()}>
                {actionLoading ? "Creating..." : "Create Coupon"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
