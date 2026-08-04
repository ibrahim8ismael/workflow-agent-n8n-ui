"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function StatusBadge({ label, variant = "default" }: { label: string; variant?: "success" | "default" }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
      variant === "success"
        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        : "bg-muted text-muted-foreground"
    }`}>
      {label}
    </span>
  );
}

export function BillingPage() {
  return (
    <div className="flex flex-col gap-5 p-8">
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            You are on the Pro Plan billed monthly.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 p-4">
            <div>
              <p className="text-[14px] font-semibold">Pro Plan</p>
              <p className="text-[12px] text-muted-foreground">$49/month</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge label="Active" variant="success" />
              <Button variant="outline" size="sm">Manage</Button>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 p-4">
            <div>
              <p className="text-[13px] font-medium">Next billing date</p>
              <p className="text-[12px] text-muted-foreground">September 15, 2025</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>
            Your default payment method for subscriptions.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-12 items-center justify-center rounded bg-muted text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Visa
              </div>
              <div>
                <p className="text-[13px] font-medium">•••• •••• •••• 4242</p>
                <p className="text-[11px] text-muted-foreground">Expires 12/26</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">Edit</Button>
          </div>
          <Button variant="outline" size="sm" className="w-fit">Add Payment Method</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            Your recent invoices.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2">
          {[
            { date: "Aug 15, 2025", amount: "$49.00", status: "Paid" },
            { date: "Jul 15, 2025", amount: "$49.00", status: "Paid" },
            { date: "Jun 15, 2025", amount: "$49.00", status: "Paid" },
          ].map((invoice) => (
            <div
              key={invoice.date}
              className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 p-3.5"
            >
              <div>
                <p className="text-[13px] font-medium">{invoice.date}</p>
                <p className="text-[11px] text-muted-foreground">{invoice.amount}</p>
              </div>
              <StatusBadge label={invoice.status} variant="success" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
