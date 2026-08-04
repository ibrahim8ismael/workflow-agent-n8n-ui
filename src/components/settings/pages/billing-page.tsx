"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  SettingsSection,
} from "@/components/settings/settings-primitives";
import {
  getCurrentSubscription,
  getInvoices,
  getWallet,
  getUsage,
  cancelSubscription,
} from "@/lib/api/billing";
import type { Subscription, Invoice, Wallet, Usage } from "@/lib/api/types";
import { ApiError } from "@/lib/api/client";
import {
  CheckIcon,
  ZapIcon,
  ShieldCheckIcon,
  UsersIcon,
  Loader2Icon,
  RefreshCwIcon,
  CreditCardIcon,
  ExternalLinkIcon,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const PLAN_FEATURES_DISPLAY = [
  { icon: ZapIcon, text: "Up to 25 AI Employees" },
  { icon: UsersIcon, text: "10 team members" },
  { icon: ShieldCheckIcon, text: "Priority support" },
];

function StatusBadge({
  label,
  variant = "default",
}: {
  label: string;
  variant?: "success" | "warning" | "default" | "danger";
}) {
  const styles = {
    success:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20",
    warning:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20",
    danger:
      "bg-destructive/10 text-destructive ring-destructive/20",
    default: "bg-muted text-muted-foreground ring-border/60",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${styles[variant]}`}
    >
      {variant === "success" && <CheckIcon className="size-2.5" />}
      {label}
    </span>
  );
}

function BillingSkeleton() {
  return (
    <div className="mx-auto max-w-[680px] space-y-6 px-10 py-8">
      <SettingsSection
        title="Current Plan"
        description="Your active subscription and included features."
      >
        <div className="rounded-xl border border-border/60 bg-muted/30 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-32" />
            ))}
          </div>
          <div className="mt-4 border-t border-border/40 pt-4">
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Credits & Usage"
        description="Your current credits balance and usage this billing period."
      >
        <div className="space-y-3">
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
      </SettingsSection>

      <SettingsSection
        title="Payment Method"
        description="The default card charged on your next billing date."
      >
        <Skeleton className="h-16 w-full rounded-xl" />
      </SettingsSection>

      <SettingsSection
        title="Billing History"
        description="Your past invoices. Click the download icon to get a PDF."
      >
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      </SettingsSection>
    </div>
  );
}

export function BillingPage() {
  const [subscription, setSubscription] = React.useState<Subscription | null>(null);
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [wallet, setWallet] = React.useState<Wallet | null>(null);
  const [usage, setUsage] = React.useState<Usage | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [canceling, setCanceling] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [sub, inv, wal, usg] = await Promise.all([
        getCurrentSubscription().catch(() => null),
        getInvoices().catch(() => []),
        getWallet().catch(() => null),
        getUsage().catch(() => null),
      ]);
      setSubscription(sub);
      setInvoices(inv);
      setWallet(wal);
      setUsage(usg);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : "Could not load billing data.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const handleCancelSubscription = async () => {
    if (!subscription || canceling) return;
    if (!confirm("Are you sure you want to cancel your subscription? You will lose access at the end of the billing period.")) return;
    setCanceling(true);
    try {
      const updated = await cancelSubscription(subscription.id);
      setSubscription(updated);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Could not cancel subscription.");
    } finally {
      setCanceling(false);
    }
  };

  const formatCredits = (val: string) => {
    const num = Number(val);
    if (isNaN(num)) return val;
    return num.toLocaleString();
  };

  const formatCurrency = (amount: number, currency: string) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(amount / 100);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  if (loading) return <BillingSkeleton />;

  if (loadError) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-sm text-destructive">{loadError}</p>
          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCwIcon className="size-3.5 mr-1.5" /> Retry
          </Button>
        </div>
      </div>
    );
  }

  const plan = subscription?.plan;
  const nextBillingDate = subscription?.currentPeriodEnd
    ? formatDate(subscription.currentPeriodEnd)
    : null;
  const isCanceled = subscription?.status === "CANCELED" || !!subscription?.canceledAt;

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[680px] space-y-6 px-10 py-8">

          <SettingsSection
            title="Current Plan"
            description="Your active subscription and included features."
          >
            {subscription && plan ? (
              <div className="rounded-xl border border-border/60 bg-muted/30 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <p className="text-[16px] font-bold">{plan.name}</p>
                      <StatusBadge
                        label={isCanceled ? "Canceled" : subscription.status === "ACTIVE" ? "Active" : subscription.status}
                        variant={
                          isCanceled
                            ? "danger"
                            : subscription.status === "ACTIVE"
                            ? "success"
                            : "warning"
                        }
                      />
                    </div>
                    <p className="mt-1 text-[13px] text-muted-foreground">
                      {formatCurrency(plan.price, plan.currency)} / {plan.interval} ·{" "}
                      {isCanceled ? `Canceled · Access until ${nextBillingDate}` : "billed monthly"}
                    </p>
                  </div>
                  {!isCanceled && (
                    <a
                      href="https://billing.stripe.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-7 items-center gap-1 rounded-[min(var(--radius-md),12px)] border border-border bg-background px-2.5 text-[0.8rem] font-medium text-muted-foreground hover:bg-muted hover:text-foreground shrink-0"
                    >
                      <ExternalLinkIcon className="size-3.5 mr-1.5" />
                      Manage Plan
                    </a>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {PLAN_FEATURES_DISPLAY.map(({ icon: Icon, text }) => (
                    <div
                      key={text}
                      className="flex items-center gap-2 text-[12px] text-muted-foreground"
                    >
                      <Icon className="size-3.5 shrink-0 text-primary/70" />
                      {text}
                    </div>
                  ))}
                </div>

                {nextBillingDate && !isCanceled && (
                  <div className="mt-4 border-t border-border/40 pt-4">
                    <p className="text-[12px] text-muted-foreground">
                      Next billing date:{" "}
                      <span className="font-semibold text-foreground">
                        {nextBillingDate}
                      </span>
                    </p>
                  </div>
                )}

                {!isCanceled && (
                  <div className="mt-4 border-t border-border/40 pt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={handleCancelSubscription}
                      disabled={canceling}
                    >
                      {canceling && <Loader2Icon className="size-3.5 animate-spin mr-1.5" />}
                      {canceling ? "Canceling…" : "Cancel Subscription"}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-8 text-center">
                <p className="text-[13px] text-muted-foreground">
                  No active subscription found.
                </p>
              </div>
            )}
          </SettingsSection>

          {wallet && (
            <SettingsSection
              title="Credits & Usage"
              description="Your current credits balance and usage this billing period."
            >
              <div className="rounded-xl border border-border/60 bg-muted/30 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-muted-foreground">Balance</span>
                  <span className="text-[15px] font-semibold">
                    {formatCredits(wallet.balanceCredits)} credits
                  </span>
                </div>
                {wallet.balanceCreditsUsd && (
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-muted-foreground">Balance (USD)</span>
                    <span className="text-[13px]">
                      {formatCurrency(Number(wallet.balanceCreditsUsd) * 100, wallet.currency)}
                    </span>
                  </div>
                )}
                {usage && (
                  <>
                    <div className="border-t border-border/40 pt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] text-muted-foreground">AI Credits Used</span>
                        <span className="text-[12px] font-medium">
                          {formatCredits(usage.aiCreditsUsed)} / {formatCredits(usage.aiCreditsLimit)}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary/60"
                          style={{
                            width: `${Math.min(100, (Number(usage.aiCreditsUsed) / Number(usage.aiCreditsLimit)) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </SettingsSection>
          )}

          <SettingsSection
            title="Payment Method"
            description="The default card charged on your next billing date."
          >
            <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-muted/30 p-4">
              <div className="flex h-9 w-14 shrink-0 items-center justify-center rounded-md border border-border/60 bg-background text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <CreditCardIcon className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium">Payment method</p>
                <p className="text-[12px] text-muted-foreground">
                  Managed via Stripe
                </p>
              </div>
              <a
                href="https://billing.stripe.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-7 items-center gap-1 rounded-[min(var(--radius-md),12px)] border border-border bg-background px-2.5 text-[0.8rem] font-medium text-muted-foreground hover:bg-muted hover:text-foreground shrink-0"
              >
                Edit
              </a>
            </div>
          </SettingsSection>

          <SettingsSection
            title="Billing History"
            description="Your past invoices."
          >
            {invoices.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-border/60">
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 border-b border-border/50 bg-muted/40 px-5 py-2.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Period
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Amount
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </span>
                  <span className="w-6" />
                </div>
                {invoices.map((invoice, i) => (
                  <div
                    key={invoice.id}
                    className={[
                      "grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-5 py-3.5",
                      i < invoices.length - 1 ? "border-b border-border/40" : "",
                    ].join(" ")}
                  >
                    <div>
                      <p className="text-[13px] font-medium">
                        {formatDate(invoice.createdAt)}
                      </p>
                    </div>
                    <p className="text-[13px] font-medium">
                      {formatCurrency(invoice.amount, invoice.currency)}
                    </p>
                    <StatusBadge
                      label={invoice.status === "PAID" ? "Paid" : invoice.status}
                      variant={invoice.status === "PAID" ? "success" : "default"}
                    />
                    <span className="w-6" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-muted-foreground">No invoices yet.</p>
            )}
          </SettingsSection>

          <div className="h-4" />
        </div>
      </div>

      <div className="shrink-0 border-t border-border/50 bg-background/95 px-10 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[680px] items-center justify-between">
          <p className="text-[12px] text-muted-foreground">
            Payments are processed securely via Stripe.
          </p>
          <a
            href="mailto:billing@woops.ai"
            className="inline-flex h-7 items-center gap-1 rounded-[min(var(--radius-md),12px)] border border-border bg-background px-2.5 text-[0.8rem] font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Contact Billing Support
          </a>
        </div>
      </div>
    </div>
  );
}
