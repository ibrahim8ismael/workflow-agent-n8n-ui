"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function Field({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <label className="text-[13px] font-medium leading-tight">{label}</label>
      {description && (
        <p className="text-[12px] text-muted-foreground leading-relaxed">{description}</p>
      )}
      {children}
    </div>
  );
}

export function GeneralPage() {
  return (
    <div className="flex flex-col gap-5 p-8">
      <Card>
        <CardHeader>
          <CardTitle>Workspace</CardTitle>
          <CardDescription>
            This is your workspace name and logo shown across the platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <Field label="Workspace Name">
            <Input id="workspace-name" defaultValue="Woops HQ" className="max-w-sm" />
          </Field>
          <Field label="Workspace Slug">
            <Input id="workspace-slug" defaultValue="woops-hq" className="max-w-sm" />
          </Field>
          <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
                W
              </div>
              <div>
                <p className="text-[13px] font-medium">Logo</p>
                <p className="text-[11px] text-muted-foreground">JPG, PNG or GIF, 1MB max</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Change</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Timezone</CardTitle>
          <CardDescription>
            Used for scheduling and displaying timestamps.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Field label="Timezone">
            <Input id="timezone" defaultValue="Africa/Cairo (GMT+2)" className="max-w-sm" />
          </Field>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-2">
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}
