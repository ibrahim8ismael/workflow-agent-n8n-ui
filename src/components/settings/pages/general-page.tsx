"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SettingsSection,
  SettingsField,
  SettingsDivider,
} from "@/components/settings/settings-primitives";

export function GeneralPage() {
  return (
    // Page root: full height, flex column so sticky footer works
    <div className="flex h-full flex-col">

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        {/* Inner content — constrained width + padding */}
        <div className="mx-auto max-w-[680px] space-y-6 px-10 py-8">

          {/* ── Workspace section ── */}
          <SettingsSection
            title="Workspace"
            description="Manage your workspace name, logo, and public slug used across the platform."
          >
            <SettingsField label="Workspace Name" htmlFor="workspace-name">
              <Input
                id="workspace-name"
                defaultValue="Woops HQ"
                className="h-9"
              />
            </SettingsField>

            <SettingsField
              label="Workspace Slug"
              hint="Used in URLs and @mentions. Lowercase letters, numbers, and hyphens only."
              htmlFor="workspace-slug"
            >
              <div className="flex items-center rounded-lg border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <span className="select-none border-r border-border/60 px-3 py-2 text-[13px] text-muted-foreground bg-muted/50 rounded-l-lg">
                  woops.ai/
                </span>
                <input
                  id="workspace-slug"
                  defaultValue="woops-hq"
                  className="flex-1 bg-transparent px-3 py-2 text-[13px] outline-none placeholder:text-muted-foreground"
                />
              </div>
            </SettingsField>

            <SettingsDivider />

            <SettingsField
              label="Workspace Logo"
              hint="JPG, PNG or GIF · Maximum 1 MB"
            >
              <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-muted/30 p-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-sm">
                  W
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium">Woops HQ</p>
                  <p className="text-[12px] text-muted-foreground">
                    No custom logo uploaded
                  </p>
                </div>
                <Button variant="outline" size="sm" className="shrink-0">
                  Upload Logo
                </Button>
              </div>
            </SettingsField>
          </SettingsSection>

          {/* ── Localization section ── */}
          <SettingsSection
            title="Localization"
            description="Configure timezone, language, and region for your workspace."
          >
            <SettingsField
              label="Timezone"
              hint="Used for scheduling, timestamps, and notifications."
              htmlFor="timezone"
            >
              <Input
                id="timezone"
                defaultValue="Africa/Cairo (GMT+2)"
                className="h-9"
              />
            </SettingsField>

            <SettingsField label="Language" htmlFor="language">
              <Input
                id="language"
                defaultValue="English (US)"
                className="h-9"
              />
            </SettingsField>
          </SettingsSection>

          {/* ── Danger zone ── */}
          <SettingsSection
            title="Danger Zone"
            description="Irreversible actions. Proceed with caution."
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[13px] font-medium">Delete Workspace</p>
                <p className="text-[12px] text-muted-foreground">
                  Permanently delete this workspace and all its data.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 border-destructive/40 text-destructive hover:bg-destructive/5 hover:border-destructive"
              >
                Delete Workspace
              </Button>
            </div>
          </SettingsSection>

          {/* Bottom padding so content clears sticky footer */}
          <div className="h-4" />
        </div>
      </div>

      {/* ── Sticky action bar ── */}
      <div className="shrink-0 border-t border-border/50 bg-background/95 px-10 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[680px] items-center justify-between">
          <p className="text-[12px] text-muted-foreground">
            Changes are saved to your workspace.
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Cancel
            </Button>
            <Button size="sm">Save Changes</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
