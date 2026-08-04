"use client";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function BillingPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            You are on the Pro Plan with billing monthly.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center justify-between rounded-xl border p-4">
            <div>
              <p className="text-sm font-semibold">Pro Plan</p>
              <p className="text-xs text-muted-foreground">$49/month</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-600 dark:text-green-400">
                Active
              </span>
              <Button variant="outline" size="sm">Manage</Button>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl border p-4">
            <div>
              <p className="text-sm font-medium">Next billing date</p>
              <p className="text-xs text-muted-foreground">September 15, 2025</p>
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
        <CardContent className="grid gap-4">
          <div className="flex items-center justify-between rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-12 items-center justify-center rounded bg-muted text-xs font-medium">
                VISA
              </div>
              <div>
                <p className="text-sm font-medium">•••• •••• •••• 4242</p>
                <p className="text-xs text-muted-foreground">Expires 12/26</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">Edit</Button>
          </div>
          <Button variant="outline" size="sm">Add Payment Method</Button>
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
              className="flex items-center justify-between rounded-xl border p-3"
            >
              <div>
                <p className="text-sm font-medium">{invoice.date}</p>
                <p className="text-xs text-muted-foreground">{invoice.amount}</p>
              </div>
              <span className="text-xs text-muted-foreground">{invoice.status}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
