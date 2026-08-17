"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { ShieldAlertIcon, ArrowLeftIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import Link from "next/link";

export function AdminGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, status } = useAuthStore();
  const { t } = useTranslation("admin");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Verifying administrative access…
          </p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  const isSystemAdmin = user?.role === "SYSTEM_ADMINISTRATOR";

  if (!isSystemAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive shadow-xs">
            <ShieldAlertIcon className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {t("accessDenied", { defaultValue: "Access Restricted" })}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("accessDeniedDesc", {
              defaultValue:
                "You must have the SYSTEM_ADMINISTRATOR role to access the Admin Suite.",
            })}
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button render={<Link href="/" />}>
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              {t("backToWorkspace", { defaultValue: "Back to Workspace" })}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
