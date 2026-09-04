"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  SearchIcon,
  PlusCircleIcon,
  MinusCircleIcon,
  SnowflakeIcon,
  SunMediumIcon,
  ShieldAlertIcon,
  CheckCircle2Icon,
  AlertTriangleIcon,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  topUpAdminWallet,
  deductAdminWallet,
  freezeAdminWallet,
  unfreezeAdminWallet,
} from "@/lib/api/admin";
import type { Wallet } from "@/lib/api/types";

export default function AdminWalletsPage() {
  const { t } = useTranslation("admin");

  const [walletId, setWalletId] = useState("wlt_skycorp_01");
  const [wallet, setWallet] = useState<Wallet | null>({
    id: "wlt_skycorp_01",
    userId: "usr_101",
    organizationId: "org_alpha",
    balanceCredits: "150000",
    balanceCreditsUsd: "150.00",
    lifetimeCredits: "450000",
    lifetimeSpendUsd: "450.00",
    currency: "USD",
    isFrozen: false,
    version: 3,
    createdAt: new Date("2026-01-01T00:00:00Z").toISOString(),
    updatedAt: new Date("2026-01-01T00:00:00Z").toISOString(),
  });

  const [topUpOpen, setTopUpOpen] = useState(false);
  const [deductOpen, setDeductOpen] = useState(false);
  const [freezeOpen, setFreezeOpen] = useState(false);
  const [unfreezeOpen, setUnfreezeOpen] = useState(false);

  const [amountCredits, setAmountCredits] = useState("50000");
  const [description, setDescription] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet) return;
    setActionLoading(true);
    setActionMessage(null);
    try {
      await topUpAdminWallet(wallet.id, {
        credits: amountCredits,
        description: description || "Courtesy goodwill credit adjustment by Support",
      });

      const newBalance = (Number(wallet.balanceCredits) + Number(amountCredits)).toString();
      setWallet((prev) => (prev ? { ...prev, balanceCredits: newBalance } : prev));
      setActionMessage({ type: "success", text: `Successfully granted ${Number(amountCredits).toLocaleString()} credits!` });
      setTopUpOpen(false);
      setDescription("");
    } catch (err) {
      setActionMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to top up wallet" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet) return;
    setActionLoading(true);
    setActionMessage(null);
    try {
      await deductAdminWallet(wallet.id, {
        credits: amountCredits,
        description: description || "Clawback for disputed charge",
      });

      const newBalance = Math.max(0, Number(wallet.balanceCredits) - Number(amountCredits)).toString();
      setWallet((prev) => (prev ? { ...prev, balanceCredits: newBalance } : prev));
      setActionMessage({ type: "success", text: `Successfully deducted ${Number(amountCredits).toLocaleString()} credits.` });
      setDeductOpen(false);
      setDescription("");
    } catch (err) {
      setActionMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to deduct credits" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleFreeze = async () => {
    if (!wallet) return;
    setActionLoading(true);
    setActionMessage(null);
    try {
      await freezeAdminWallet(wallet.id);
      setWallet((prev) => (prev ? { ...prev, isFrozen: true } : prev));
      setActionMessage({ type: "success", text: "Wallet frozen. Agent executions paused." });
      setFreezeOpen(false);
    } catch (err) {
      setActionMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to freeze wallet" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnfreeze = async () => {
    if (!wallet) return;
    setActionLoading(true);
    setActionMessage(null);
    try {
      await unfreezeAdminWallet(wallet.id);
      setWallet((prev) => (prev ? { ...prev, isFrozen: false } : prev));
      setActionMessage({ type: "success", text: "Wallet unfrozen. Execution capabilities restored." });
      setUnfreezeOpen(false);
    } catch (err) {
      setActionMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to unfreeze wallet" });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t("wallets.title", { defaultValue: "Wallets & Credit Adjustments" })}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("wallets.subtitle", {
            defaultValue:
              "Grant courtesy credits, claw back disputed balances, and freeze suspicious wallets.",
          })}
        </p>
      </div>

      {actionMessage && (
        <div
          className={`rounded-lg p-3 text-xs flex items-center gap-2 border ${
            actionMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              : "bg-destructive/10 border-destructive/20 text-destructive"
          }`}
        >
          {actionMessage.type === "success" ? (
            <CheckCircle2Icon className="h-4 w-4 shrink-0" />
          ) : (
            <AlertTriangleIcon className="h-4 w-4 shrink-0" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Wallet Lookup Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground rtl:left-auto rtl:right-3" />
              <Input
                placeholder="Enter Wallet ID (e.g. wlt_skycorp_01) or Organization ID..."
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                className="pl-9 rtl:pl-3 rtl:pr-9"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActionMessage({ type: "success", text: `Loaded wallet ${walletId}` });
              }}
            >
              Search Wallet
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Summary Card */}
      {wallet && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Balance Card */}
          <Card className="lg:col-span-2 relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg font-bold">Wallet ID: {wallet.id}</CardTitle>
                  {wallet.isFrozen ? (
                    <Badge variant="destructive" className="text-[10px] gap-1">
                      <SnowflakeIcon className="h-3 w-3" />
                      Frozen
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 text-[10px] gap-1"
                    >
                      <CheckCircle2Icon className="h-3 w-3" />
                      Operational
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs font-mono mt-0.5">
                  Tenant: {wallet.organizationId || "Individual User"} | Owner: {wallet.userId}
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                {wallet.isFrozen ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setUnfreezeOpen(true)}
                    className="text-emerald-600 border-emerald-500/30 gap-1.5 text-xs"
                  >
                    <SunMediumIcon className="h-3.5 w-3.5" />
                    <span>Unfreeze</span>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setFreezeOpen(true)}
                    className="text-destructive border-destructive/30 gap-1.5 text-xs"
                  >
                    <SnowflakeIcon className="h-3.5 w-3.5" />
                    <span>Freeze Wallet</span>
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border bg-primary/5 p-4">
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    Available AI Credits
                  </div>
                  <div className="text-3xl font-extrabold text-primary tabular-nums mt-1">
                    {Number(wallet.balanceCredits).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    ≈ ${(Number(wallet.balanceCredits) * 0.001).toFixed(2)} USD
                  </p>
                </div>

                <div className="rounded-xl border bg-muted/40 p-4">
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    Lifetime Consumed
                  </div>
                  <div className="text-3xl font-extrabold tabular-nums mt-1">
                    {Number(wallet.lifetimeCredits).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    All-time cumulative agent spend
                  </p>
                </div>
              </div>

              {/* Quick Adjustment Actions */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  onClick={() => {
                    setAmountCredits("50000");
                    setDescription("Courtesy goodwill credit adjustment by Support");
                    setTopUpOpen(true);
                  }}
                  className="gap-2"
                >
                  <PlusCircleIcon className="h-4 w-4" />
                  <span>Grant Credit Top-Up</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    setAmountCredits("10000");
                    setDescription("Clawback for disputed charge");
                    setDeductOpen(true);
                  }}
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  <MinusCircleIcon className="h-4 w-4" />
                  <span>Deduct / Clawback</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Ledger Guidelines / Safeguards */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ShieldAlertIcon className="h-4 w-4 text-primary" />
                <span>Administrative Ledger Policy</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-muted-foreground">
              <p>
                1. <strong>Audit Trail:</strong> Every manual top-up and deduction writes an immutable ledger entry stamped with your Administrator ID.
              </p>
              <p>
                2. <strong>Suspicious Activity:</strong> If abuse or abnormal LLM token flooding is detected, freeze the wallet immediately to halt agent execution.
              </p>
              <p>
                3. <strong>Unfreezing:</strong> Restores token spend capacity instantly without requiring user re-authentication.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top-Up Dialog */}
      <Dialog open={topUpOpen} onOpenChange={setTopUpOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleTopUp}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-primary">
                <PlusCircleIcon className="h-5 w-5" />
                <span>Manual Credit Grant</span>
              </DialogTitle>
              <DialogDescription>
                Grant courtesy or promotional credits directly to this wallet.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="topUpCredits">Credits Amount</Label>
                <Input
                  id="topUpCredits"
                  type="number"
                  min="1"
                  step="1000"
                  value={amountCredits}
                  onChange={(e) => setAmountCredits(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="topUpDesc">Audit Note / Reason (Required)</Label>
                <Textarea
                  id="topUpDesc"
                  placeholder="e.g. Courtesy goodwill credit adjustment by Support"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setTopUpOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={actionLoading}>
                {actionLoading ? "Granting..." : "Confirm Credit Grant"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Deduct Dialog */}
      <Dialog open={deductOpen} onOpenChange={setDeductOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleDeduct}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <MinusCircleIcon className="h-5 w-5" />
                <span>Credit Deduction / Clawback</span>
              </DialogTitle>
              <DialogDescription>
                Deduct balance from this wallet for chargebacks or reversals.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="deductCredits">Credits Amount to Deduct</Label>
                <Input
                  id="deductCredits"
                  type="number"
                  min="1"
                  step="1000"
                  value={amountCredits}
                  onChange={(e) => setAmountCredits(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="deductDesc">Audit Note / Reason (Required)</Label>
                <Textarea
                  id="deductDesc"
                  placeholder="e.g. Clawback for disputed charge"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeductOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={actionLoading}>
                {actionLoading ? "Deducting..." : "Confirm Deduction"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Freeze Dialog */}
      <Dialog open={freezeOpen} onOpenChange={setFreezeOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <SnowflakeIcon className="h-5 w-5" />
              <span>Freeze Wallet</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to freeze this wallet? All active agent runs belonging to this wallet will fail immediately.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFreezeOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleFreeze} disabled={actionLoading}>
              {actionLoading ? "Freezing..." : "Freeze Wallet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unfreeze Dialog */}
      <Dialog open={unfreezeOpen} onOpenChange={setUnfreezeOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600">
              <SunMediumIcon className="h-5 w-5" />
              <span>Unfreeze Wallet</span>
            </DialogTitle>
            <DialogDescription>
              Restore immediate execution and credit spending capabilities for this wallet.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setUnfreezeOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUnfreeze}
              disabled={actionLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {actionLoading ? "Unfreezing..." : "Unfreeze Wallet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
