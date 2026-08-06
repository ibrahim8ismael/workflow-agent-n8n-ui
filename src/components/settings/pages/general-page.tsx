"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SettingsSection,
  SettingsField,
  SettingsDivider,
} from "@/components/settings/settings-primitives";
import { useLanguage } from "@/components/providers/language-provider";
import { SUPPORTED_LANGUAGES, LanguageCode } from "@/i18n/language";
import { useTranslation } from "react-i18next";

export function GeneralPage() {
  const { t } = useTranslation(["settings", "common"]);
  const { language, changeLanguage } = useLanguage();

  return (
    // Page root: full height, flex column so sticky footer works
    <div className="flex h-full flex-col">

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        {/* Inner content — constrained width + padding */}
        <div className="mx-auto max-w-[680px] space-y-6 px-10 py-8">

          {/* ── Workspace section ── */}
          <SettingsSection
            title={t("workspace")}
            description={t("workspaceDesc", { defaultValue: "Manage your workspace name, logo, and public slug used across the platform." })}
          >
            <SettingsField label={t("workspaceName")} htmlFor="workspace-name">
              <Input
                id="workspace-name"
                defaultValue="Woops HQ"
                className="h-9"
              />
            </SettingsField>

            <SettingsField
              label={t("workspaceSlug")}
              hint={t("workspaceSlugHint", { defaultValue: "Used in URLs and @mentions. Lowercase letters, numbers, and hyphens only." })}
              htmlFor="workspace-slug"
            >
              <div className="flex items-center rounded-lg border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <span className="select-none border-r border-border/60 px-3 py-2 text-[13px] text-muted-foreground bg-muted/50 rounded-l-lg rtl:border-r-0 rtl:border-l rtl:rounded-l-none rtl:rounded-r-lg">
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
              label={t("workspaceLogo")}
              hint={t("workspaceLogoHint", { defaultValue: "JPG, PNG or GIF · Maximum 1 MB" })}
            >
              <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-muted/30 p-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-sm">
                  W
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium">Woops HQ</p>
                  <p className="text-[12px] text-muted-foreground">
                    {t("noCustomLogo", { defaultValue: "No custom logo uploaded" })}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="shrink-0">
                  {t("uploadLogo")}
                </Button>
              </div>
            </SettingsField>
          </SettingsSection>

          {/* ── Localization section ── */}
          <SettingsSection
            title={t("localization")}
            description={t("localizationDesc")}
          >
            <SettingsField
              label={t("timezone")}
              hint={t("timezoneHint", { defaultValue: "Used for scheduling, timestamps, and notifications." })}
              htmlFor="timezone"
            >
              <Input
                id="timezone"
                defaultValue="Africa/Cairo (GMT+2)"
                className="h-9"
              />
            </SettingsField>

            <SettingsField label={t("language")} htmlFor="language">
              <div className="grid grid-cols-2 gap-3">
                {Object.values(SUPPORTED_LANGUAGES).map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => changeLanguage(lang.code as LanguageCode)}
                    className={`flex items-center justify-between p-3 rounded-lg border text-start text-xs font-medium transition-all ${
                      language === lang.code
                        ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                        : "border-border bg-background hover:bg-muted/50 text-foreground"
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-sm">{lang.nativeName}</div>
                      <div className="text-muted-foreground text-[11px]">{lang.name}</div>
                    </div>
                    <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-muted">
                      {lang.code}
                    </span>
                  </button>
                ))}
              </div>
            </SettingsField>
          </SettingsSection>

          {/* ── Danger zone ── */}
          <SettingsSection
            title={t("dangerZone")}
            description={t("dangerZoneDesc", { defaultValue: "Irreversible actions. Proceed with caution." })}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[13px] font-medium">{t("deleteWorkspace")}</p>
                <p className="text-[12px] text-muted-foreground">
                  {t("deleteWorkspaceDesc")}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 border-destructive/40 text-destructive hover:bg-destructive/5 hover:border-destructive"
              >
                {t("deleteWorkspace")}
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
            {t("common:changesSaved")}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              {t("common:cancel")}
            </Button>
            <Button size="sm">{t("common:saveChanges")}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

