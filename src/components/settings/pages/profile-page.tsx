"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  SettingsSection,
  SettingsField,
  SettingsDivider,
} from "@/components/settings/settings-primitives";
import { useAuthStore } from "@/stores/auth-store";
import { CameraIcon } from "lucide-react";

export function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const name = user?.name || user?.email?.split("@")[0] || "Woops User";
  const email = user?.email || "";
  const nameParts = name.split(" ");
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ") ?? "";

  return (
    <div className="flex h-full flex-col">

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[680px] space-y-6 px-10 py-8">

          {/* ── Personal information ── */}
          <SettingsSection
            title="Personal Information"
            description="Your public profile details visible to teammates in your workspace."
          >
            {/* Avatar upload row */}
            <div className="flex items-center gap-5">
              <div className="relative shrink-0">
                <Avatar className="size-16 rounded-xl">
                  {user?.avatarUrl && (
                    <AvatarImage src={user.avatarUrl} alt={name} />
                  )}
                  <AvatarFallback className="rounded-xl bg-primary/10 text-xl font-semibold text-primary">
                    {name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full border border-border bg-background shadow-sm hover:bg-muted transition-colors">
                  <CameraIcon className="size-3 text-muted-foreground" />
                </button>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium">Profile Photo</p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  JPG, PNG or GIF · Maximum 1 MB
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2.5 h-7 text-[12px]"
                >
                  Upload Photo
                </Button>
              </div>
            </div>

            <SettingsDivider />

            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
              <SettingsField label="First Name" htmlFor="first-name">
                <Input
                  id="first-name"
                  defaultValue={firstName}
                  className="h-9"
                />
              </SettingsField>
              <SettingsField label="Last Name" htmlFor="last-name">
                <Input
                  id="last-name"
                  defaultValue={lastName}
                  className="h-9"
                />
              </SettingsField>
            </div>

            <SettingsField label="Email Address" htmlFor="email">
              <Input
                id="email"
                type="email"
                defaultValue={email}
                className="h-9"
              />
            </SettingsField>

            <SettingsField
              label="Job Title"
              htmlFor="job-title"
              hint="Visible to teammates and in AI Employee activity logs."
            >
              <Input
                id="job-title"
                placeholder="e.g. Head of Operations"
                className="h-9"
              />
            </SettingsField>
          </SettingsSection>

          {/* ── Preferences ── */}
          <SettingsSection
            title="Preferences"
            description="Customize your personal experience inside Woops."
          >
            <SettingsField label="Display Language" htmlFor="language">
              <Input
                id="language"
                defaultValue="English (US)"
                className="h-9"
              />
            </SettingsField>

            <SettingsField
              label="Theme"
              hint="Controls the visual appearance of the interface."
              htmlFor="theme"
            >
              <Input id="theme" defaultValue="System Default" className="h-9" />
            </SettingsField>
          </SettingsSection>

          <div className="h-4" />
        </div>
      </div>

      {/* ── Sticky action bar ── */}
      <div className="shrink-0 border-t border-border/50 bg-background/95 px-10 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[680px] items-center justify-between">
          <p className="text-[12px] text-muted-foreground">
            Changes apply to your personal account only.
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
