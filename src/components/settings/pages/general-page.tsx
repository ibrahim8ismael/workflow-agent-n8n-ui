"use client";

import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function GeneralPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Workspace</CardTitle>
          <CardDescription>
            This is your workspace name and logo shown across the platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="workspace-name">
              Workspace Name
            </label>
            <Input id="workspace-name" defaultValue="Woops HQ" className="max-w-sm" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="workspace-slug">
              Workspace Slug
            </label>
            <Input id="workspace-slug" defaultValue="woops-hq" className="max-w-sm" />
          </div>
          <div className="flex items-center justify-between rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 font-heading text-sm font-semibold text-white">
                W
              </div>
              <div>
                <p className="text-sm font-medium">Logo</p>
                <p className="text-xs text-muted-foreground">JPG, PNG or GIF, 1MB max</p>
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
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="timezone">
              Timezone
            </label>
            <Input id="timezone" defaultValue="Africa/Cairo (GMT+2)" className="max-w-sm" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}
