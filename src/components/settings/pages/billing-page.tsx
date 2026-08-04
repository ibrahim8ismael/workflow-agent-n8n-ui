"use client";

import { Button } from "@/components/ui/button";
import {
  SettingsSection,
  SettingsDivider,
} from "@/components/settings/settings-primitives";
import {
  CheckIcon,
  DownloadIcon,
  ZapIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Local helpers
// ---------------------------------------------------------------------------
function StatusBadge({
  label,
  variant = "default",
}: {
  label: string;
  variant?: "success" | "warning" | "default";
}) {
  const styles = {
    success:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20",
    warning:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20",
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

const PLAN_FEATURES = [
  { icon: ZapIcon, text: "Up to 25 AI Employees" },
  { icon: UsersIcon, text: "10 team members" },
  { icon: ShieldCheckIcon, text: "Priority support" },
];

const INVOICES = [
  { date: "Aug 15, 2025", period: "August 2025", amount: "$49.00", status: "Paid" as const },
  { date: "Jul 15, 2025", period: "July 2025", amount: "$49.00", status: "Paid" as const },
  { date: "Jun 15, 2025", period: "June 2025", amount: "$49.00", status: "Paid" as const },
];

export function BillingPage() {
  return (
    <div className="flex h-full flex-col">

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[680px] space-y-6 px-10 py-8">

          {/* ── Current Plan ── */}
          <SettingsSection
            title="Current Plan"
            description="Your active subscription and included features."
          >
            {/* Plan card */}
            <div className="rounded-xl border border-border/60 bg-muted/30 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <p className="text-[16px] font-bold">Pro Plan</p>
                    <StatusBadge label="Active" variant="success" />
                  </div>
                  <p className="mt-1 text-[13px] text-muted-foreground">
                    $49.00 / month · billed monthly
                  </p>
                </div>
                <Button variant="outline" size="sm" className="shrink-0">
                  Manage Plan
                </Button>
              </div>

              {/* Feature list */}
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {PLAN_FEATURES.map(({ icon: Icon, text }) => (
                  <div
                    key={text}
                    className="flex items-center gap-2 text-[12px] text-muted-foreground"
                  >
                    <Icon className="size-3.5 shrink-0 text-primary/70" />
                    {text}
                  </div>
                ))}
              </div>

              {/* Next billing */}
              <div className="mt-4 border-t border-border/40 pt-4">
                <p className="text-[12px] text-muted-foreground">
                  Next billing date:{" "}
                  <span className="font-semibold text-foreground">
                    September 15, 2025
                  </span>
                </p>
              </div>
            </div>
          </SettingsSection>

          {/* ── Payment Method ── */}
          <SettingsSection
            title="Payment Method"
            description="The default card charged on your next billing date."
          >
            {/* Card row */}
            <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-muted/30 p-4">
              <div className="flex h-9 w-14 shrink-0 items-center justify-center rounded-md border border-border/60 bg-background text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Visa
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium">•••• •••• •••• 4242</p>
                <p className="text-[12px] text-muted-foreground">
                  Expires 12/26
                </p>
              </div>
              <Button variant="ghost" size="sm" className="shrink-0">
                Edit
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-fit text-[13px]"
            >
              + Add Payment Method
            </Button>
          </SettingsSection>

          {/* ── Billing History ── */}
          <SettingsSection
            title="Billing History"
            description="Your past invoices. Click the download icon to get a PDF."
          >
            <div className="overflow-hidden rounded-xl border border-border/60">
              {/* Table header */}
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

              {/* Invoice rows */}
              {INVOICES.map((invoice, i) => (
                <div
                  key={invoice.date}
                  className={[
                    "grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-5 py-3.5",
                    i < INVOICES.length - 1 ? "border-b border-border/40" : "",
                  ].join(" ")}
                >
                  <div>
                    <p className="text-[13px] font-medium">{invoice.period}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {invoice.date}
                    </p>
                  </div>
                  <p className="text-[13px] font-medium">{invoice.amount}</p>
                  <StatusBadge label={invoice.status} variant="success" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-foreground"
                  >
                    <DownloadIcon className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </SettingsSection>

          <div className="h-4" />
        </div>
      </div>

      {/* Billing page has no save action — just an informational footer */}
      <div className="shrink-0 border-t border-border/50 bg-background/95 px-10 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[680px] items-center justify-between">
          <p className="text-[12px] text-muted-foreground">
            Payments are processed securely via Stripe.
          </p>
          <Button variant="outline" size="sm">
            Contact Billing Support
          </Button>
        </div>
      </div>
    </div>
  );
}
