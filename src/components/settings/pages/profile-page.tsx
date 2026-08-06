"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  SettingsSection,
  SettingsField,
  SettingsDivider,
} from "@/components/settings/settings-primitives";
import { useAuthStore } from "@/stores/auth-store";
import { updateMe } from "@/lib/api/users";
import { ApiError } from "@/lib/api/client";
import { CameraIcon, Loader2Icon } from "lucide-react";
import { useTranslation } from "react-i18next";

export function ProfilePage() {
  const { t } = useTranslation(["settings", "common"]);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const name = user?.name || user?.email?.split("@")[0] || "Woops User";
  const nameParts = name.split(" ");
  const firstNameInitial = nameParts[0] ?? "";
  const lastNameInitial = nameParts.slice(1).join(" ");

  const [firstName, setFirstName] = React.useState(firstNameInitial);
  const [lastName, setLastName] = React.useState(lastNameInitial);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFirstName(firstNameInitial);
    setLastName(lastNameInitial);
  }, [firstNameInitial, lastNameInitial]);

  const isDirty =
    firstName !== firstNameInitial || lastName !== lastNameInitial;

  const handleSave = async () => {
    if (!isDirty || saving) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const fullName = [firstName, lastName].filter(Boolean).join(" ");
      const updated = await updateMe({ name: fullName || undefined });
      setUser(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not save changes. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFirstName(firstNameInitial);
    setLastName(lastNameInitial);
    setError(null);
    setSuccess(false);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[680px] space-y-6 px-10 py-8">

          <SettingsSection
            title={t("personalInformation", { defaultValue: "Personal Information" })}
            description={t("personalInfoDesc", { defaultValue: "Your public profile details visible to teammates in your workspace." })}
          >
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
                <button
                  className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full border border-border bg-background shadow-sm text-muted-foreground cursor-not-allowed"
                  title={t("avatarComingSoon", { defaultValue: "Avatar upload coming soon" })}
                  disabled
                >
                  <CameraIcon className="size-3" />
                </button>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium">{t("profilePhoto", { defaultValue: "Profile Photo" })}</p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  {t("profilePhotoHint", { defaultValue: "JPG, PNG or GIF · Maximum 1 MB" })}
                </p>
                <p className="mt-2 text-[11px] text-muted-foreground italic">
                  {t("avatarComingSoon", { defaultValue: "Avatar upload coming soon" })}
                </p>
              </div>
            </div>

            <SettingsDivider />

            <div className="grid grid-cols-2 gap-4">
              <SettingsField label={t("firstName", { defaultValue: "First Name" })} htmlFor="first-name">
                <Input
                  id="first-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="h-9"
                />
              </SettingsField>
              <SettingsField label={t("lastName", { defaultValue: "Last Name" })} htmlFor="last-name">
                <Input
                  id="last-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-9"
                />
              </SettingsField>
            </div>

            <SettingsField label={t("emailAddress", { defaultValue: "Email Address" })} htmlFor="email">
              <Input
                id="email"
                type="email"
                value={user?.email ?? ""}
                readOnly
                className="h-9 opacity-60 cursor-not-allowed"
              />
            </SettingsField>
          </SettingsSection>

          <SettingsSection
            title={t("preferences", { defaultValue: "Preferences" })}
            description={t("preferencesDesc", { defaultValue: "Customize your personal experience inside Woops." })}
          >
            <SettingsField label={t("displayLanguage", { defaultValue: "Display Language" })} htmlFor="language">
              <Input
                id="language"
                defaultValue="English (US)"
                readOnly
                className="h-9 opacity-60 cursor-not-allowed"
              />
            </SettingsField>

            <SettingsField
              label={t("theme", { defaultValue: "Theme" })}
              hint={t("themeHint", { defaultValue: "Controls the visual appearance of the interface." })}
              htmlFor="theme"
            >
              <Input
                id="theme"
                defaultValue="System Default"
                readOnly
                className="h-9 opacity-60 cursor-not-allowed"
              />
            </SettingsField>
          </SettingsSection>

          <div className="h-4" />
        </div>
      </div>

      <div className="shrink-0 border-t border-border/50 bg-background/95 px-10 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[680px] items-center justify-between">
          <div className="flex items-center gap-3">
            <p className="text-[12px] text-muted-foreground">
              {t("changesApplyPersonal", { defaultValue: "Changes apply to your personal account only." })}
            </p>
            {success && (
              <span className="text-[12px] text-emerald-600 font-medium">
                {t("saved", { defaultValue: "Saved!" })}
              </span>
            )}
            {error && (
              <span role="alert" className="text-[12px] text-destructive font-medium">
                {error}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={!isDirty || saving}
            >
              {t("common:cancel", { defaultValue: "Cancel" })}
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!isDirty || saving}
            >
              {saving && <Loader2Icon className="size-3.5 animate-spin mr-1.5" />}
              {saving ? t("saving", { defaultValue: "Saving…" }) : t("common:saveChanges", { defaultValue: "Save Changes" })}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
