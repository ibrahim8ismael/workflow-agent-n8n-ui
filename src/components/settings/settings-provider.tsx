"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { type SettingsPageId } from "@/components/settings/settings-data";

interface SettingsContextValue {
  activePage: SettingsPageId;
  openSettings: (page?: SettingsPageId) => void;
  closeSettings: () => void;
}

const SettingsContext = React.createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [activePage, setActivePage] = React.useState<SettingsPageId>("general");

  const openSettings = React.useCallback(
    (page?: SettingsPageId) => {
      const target = page ?? "general";
      setActivePage(target);
      router.push(`/settings/${target}`);
    },
    [router]
  );

  const closeSettings = React.useCallback(() => {
    router.push("/");
  }, [router]);

  return (
    <SettingsContext.Provider value={{ activePage, openSettings, closeSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = React.useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return ctx;
}
