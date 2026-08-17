"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  ArrowLeftIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { getAdminDashboardOverview } from "@/lib/api/admin";

export function AdminHeader() {
  const { t } = useTranslation("admin");
  const [healthStatus, setHealthStatus] = useState<string>("HEALTHY");

  useEffect(() => {
    let cancelled = false;
    getAdminDashboardOverview()
      .then((data) => {
        if (!cancelled && data?.systemHealth) {
          setHealthStatus(data.systemHealth);
        }
      })
      .catch(() => {
        // Fallback default
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const getHealthBadge = () => {
    const isHealthy = healthStatus.toUpperCase() === "HEALTHY";
    const isDegraded = healthStatus.toUpperCase() === "DEGRADED";

    return (
      <Badge
        variant="outline"
        className={`gap-1.5 py-1 px-2.5 text-xs font-medium border ${
          isHealthy
            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            : isDegraded
            ? "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"
            : "border-destructive/20 bg-destructive/10 text-destructive"
        }`}
      >
        <span
          className={`h-2 w-2 rounded-full ${
            isHealthy
              ? "bg-emerald-500 animate-pulse"
              : isDegraded
              ? "bg-amber-500"
              : "bg-destructive animate-ping"
          }`}
        />
        {t(`systemHealth.${healthStatus}`, { defaultValue: healthStatus })}
      </Badge>
    );
  };

  return (
    <header className="mb-6 flex items-center justify-between gap-3 px-4 md:px-2">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          render={<Link href="/" />}
          className="gap-2 text-xs font-medium"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">
            {t("backToWorkspace", { defaultValue: "Back to Workspace" })}
          </span>
        </Button>

        <Separator orientation="vertical" className="h-4 hidden sm:block" />

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
          <ShieldCheckIcon className="h-4 w-4 text-primary" />
          <span>Admin Suite</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {getHealthBadge()}

        <Separator orientation="vertical" className="h-4 hidden sm:block" />

        <LanguageSwitcher variant="ghost" size="sm" />
      </div>
    </header>
  );
}
