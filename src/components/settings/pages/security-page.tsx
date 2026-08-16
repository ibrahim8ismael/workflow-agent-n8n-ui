"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  SettingsSection,
} from "@/components/settings/settings-primitives";
import { getMySessions, revokeSession } from "@/lib/api/users";
import { logoutAll } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import {
  LaptopIcon,
  MonitorIcon,
  SmartphoneIcon,
  GlobeIcon,
  Loader2Icon,
  RefreshCwIcon,
  Trash2Icon,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

type Session = Awaited<ReturnType<typeof getMySessions>>[number];

function sessionIcon(device?: string | null) {
  if (!device) return <GlobeIcon className="size-4" />;
  const d = device.toLowerCase();
  if (d.includes("mobile") || d.includes("iphone") || d.includes("android"))
    return <SmartphoneIcon className="size-4" />;
  if (d.includes("tablet") || d.includes("ipad")) return <MonitorIcon className="size-4" />;
  return <LaptopIcon className="size-4" />;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function SecuritySkeleton() {
  return (
    <div className="mx-auto max-w-[680px] space-y-6 px-10 py-8">
      <SettingsSection
        title="Active Sessions"
        description="Devices currently signed in to your account."
      >
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-2">
            <Skeleton className="size-10 rounded-lg" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </SettingsSection>
    </div>
  );
}

export function SecurityPage() {
  const [sessions, setSessions] = React.useState<Session[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [revokingId, setRevokingId] = React.useState<string | null>(null);
  const [loggingOutAll, setLoggingOutAll] = React.useState(false);
  const { t } = useTranslation(["settings", "common"]);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSessions(await getMySessions());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load sessions.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const handleRevoke = async (sessionId: string) => {
    if (revokingId) return;
    setRevokingId(sessionId);
    try {
      await revokeSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Could not revoke session.");
    } finally {
      setRevokingId(null);
    }
  };

  const handleLogoutAll = async () => {
    if (loggingOutAll) return;
    if (!confirm("This will sign out all devices except the current one. Continue?")) return;
    setLoggingOutAll(true);
    try {
      await logoutAll();
      await load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Could not sign out all devices.");
    } finally {
      setLoggingOutAll(false);
    }
  };

  if (loading) return <SecuritySkeleton />;

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[680px] space-y-6 px-10 py-8">

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 flex items-center justify-between">
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="ghost" size="sm" onClick={load}>
                <RefreshCwIcon className="size-3.5 mr-1.5" /> Retry
              </Button>
            </div>
          )}

          <SettingsSection
            title={t("activeSessions", { defaultValue: "Active Sessions" })}
            description={t("activeSessionsDesc", { defaultValue: "Devices currently signed in to your account." })}
          >
            {sessions.length === 0 && !error ? (
              <p className="text-[13px] text-muted-foreground py-2">
                {t("noActiveSessions", { defaultValue: "No active sessions found." })}
              </p>
            ) : (
              <div className="space-y-1">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      {sessionIcon(session.device)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium truncate">
                        {session.device ?? t("unknownDevice", { defaultValue: "Unknown device" })}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {session.browser && (
                          <span className="text-[11px] text-muted-foreground truncate">
                            {session.browser}
                          </span>
                        )}
                        {session.ip && (
                          <span className="text-[11px] text-muted-foreground truncate">
                            {session.ip}
                          </span>
                        )}
                      </div>
                      {session.lastUsedAt && (
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {t("lastUsed", { defaultValue: "Last used" })} {formatDate(session.lastUsedAt)}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRevoke(session.id)}
                      disabled={revokingId === session.id}
                    >
                      {revokingId === session.id ? (
                        <Loader2Icon className="size-3.5 animate-spin" />
                      ) : (
                        <Trash2Icon className="size-3.5" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </SettingsSection>

          <SettingsSection
            title={t("signOutDevices", { defaultValue: "Sign Out Devices" })}
            description={t("signOutDevicesDesc", { defaultValue: "Immediately sign out of all devices except this one." })}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[13px] font-medium">{t("signOutAllOtherDevices", { defaultValue: "Sign out all other devices" })}</p>
                <p className="text-[12px] text-muted-foreground">
                  {t("signOutAllOtherDevicesDesc", { defaultValue: "This will end all active sessions on other devices." })}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={handleLogoutAll}
                disabled={loggingOutAll}
              >
                {loggingOutAll && (
                  <Loader2Icon className="size-3.5 animate-spin mr-1.5" />
                )}
                {loggingOutAll ? t("signingOut", { defaultValue: "Signing out…" }) : t("signOutAll", { defaultValue: "Sign out all" })}
              </Button>
            </div>
          </SettingsSection>

          <SettingsSection
            title={t("twoFactorAuth", { defaultValue: "Two-Factor Authentication" })}
            description={t("twoFactorAuthDesc", { defaultValue: "Add an extra layer of security to your account." })}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[13px] font-medium">{t("twoFactorAuthNotEnabled", { defaultValue: "2FA not enabled" })}</p>
                <p className="text-[12px] text-muted-foreground">
                  {t("twoFactorAuthInfo", { defaultValue: "Two-factor authentication adds an extra layer of security." })}
                </p>
              </div>
              <p className="text-[12px] text-muted-foreground italic shrink-0">
                {t("comingSoon", { defaultValue: "Coming soon" })}
              </p>
            </div>
          </SettingsSection>

          <div className="h-4" />
        </div>
      </div>
    </div>
  );
}
