"use client";

import * as React from "react";
import {
  type SettingsPageId,
} from "@/components/settings/settings-data";

interface SettingsContextValue {
  isOpen: boolean;
  activePage: SettingsPageId;
  openSettings: (page?: SettingsPageId) => void;
  closeSettings: () => void;
}

const SettingsContext = React.createContext<SettingsContextValue | null>(null);

function SettingsProviderInner({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [activePage, setActivePage] = React.useState<SettingsPageId>("general");

  const openSettings = React.useCallback((page?: SettingsPageId) => {
    setActivePage(page ?? "general");
    setIsOpen(true);
  }, []);

  const closeSettings = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <SettingsContext.Provider value={{ isOpen, activePage, openSettings, closeSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProviderInner>{children}</SettingsProviderInner>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = React.useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return ctx;
}
