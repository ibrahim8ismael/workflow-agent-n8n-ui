"use client";

import * as React from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSettings } from "@/components/settings/settings-provider";
import { SETTINGS_NAV, PAGE_META, type SettingsPageId } from "@/components/settings/settings-data";
import { GeneralPage } from "@/components/settings/pages/general-page";
import { ProfilePage } from "@/components/settings/pages/profile-page";
import { BillingPage } from "@/components/settings/pages/billing-page";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";

const PAGE_COMPONENTS: Record<SettingsPageId, React.ComponentType> = {
  general: GeneralPage,
  profile: ProfilePage,
  billing: BillingPage,
  security: GeneralPage,
  notifications: GeneralPage,
  members: GeneralPage,
  integrations: GeneralPage,
  knowledge: GeneralPage,
  channels: GeneralPage,
};

function SidebarNav({
  activePage,
  onSelect,
  searchQuery,
}: {
  activePage: SettingsPageId;
  onSelect: (id: SettingsPageId) => void;
  searchQuery: string;
}) {
  const q = searchQuery.toLowerCase();

  return (
    <nav className="flex flex-col gap-6 overflow-y-auto px-3 py-4">
      {SETTINGS_NAV.map((group) => {
        const filtered = group.items.filter(
          (item) =>
            !q ||
            item.label.toLowerCase().includes(q) ||
            PAGE_META[item.id].description.toLowerCase().includes(q)
        );

        if (filtered.length === 0) return null;

        return (
          <div key={group.id} className="flex flex-col gap-1">
            <span className="px-2 py-1 text-xs font-medium text-muted-foreground">
              {group.label}
            </span>
            {filtered.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === activePage;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  className={`flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}

function SidebarFooter() {
  return (
    <div className="border-t p-3">
      <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-semibold text-white">
          A
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium">Ahmed Hassan</p>
          <p className="truncate text-xs text-muted-foreground">ahmed@woops.ai</p>
        </div>
      </div>
    </div>
  );
}

function WorkspaceHeader() {
  return (
    <div className="flex items-center gap-3 px-4 py-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 font-heading text-sm font-semibold text-white">
        W
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-semibold">Woops HQ</p>
        <p className="truncate text-xs text-muted-foreground">Pro Plan</p>
      </div>
    </div>
  );
}

export function SettingsModal() {
  const { isOpen, activePage, openSettings, closeSettings } = useSettings();
  const [searchQuery, setSearchQuery] = React.useState("");

  const meta = PAGE_META[activePage];
  const PageComponent = PAGE_COMPONENTS[activePage];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeSettings()}>
      <DialogPortal>
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <div className="fixed inset-[50%_auto_50%_50%] left-1/2 top-1/2 z-50 grid w-full max-w-3xl max-h-[85vh] -translate-x-1/2 -translate-y-1/2 grid-cols-[280px_1fr] overflow-hidden rounded-2xl bg-background shadow-2xl ring-1 ring-foreground/10 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] duration-200 dark:-translate-x-1/2 dark:-translate-y-1/2">
          <div className="flex h-[85vh] flex-col border-r bg-muted/20">
            <div className="border-b px-4 py-3">
              <div className="flex items-center justify-between mb-3">
                <DialogTitle className="text-base font-semibold">
                  Settings
                </DialogTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 rounded-lg"
                  onClick={closeSettings}
                >
                  <X className="size-4" />
                </Button>
              </div>
              <SearchInput
                placeholder="Search settings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8"
              />
            </div>

            <WorkspaceHeader />

            <SidebarNav
              activePage={activePage}
              onSelect={openSettings}
              searchQuery={searchQuery}
            />

            <div className="mt-auto">
              <SidebarFooter />
            </div>
          </div>

          <div className="flex h-[85vh] flex-col overflow-hidden">
            <div className="border-b px-6 py-4">
              <DialogTitle className="text-lg font-semibold">{meta.title}</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {meta.description}
              </DialogDescription>
            </div>
            <div className="flex-1 overflow-y-auto">
              <PageComponent />
            </div>
          </div>
        </div>
      </DialogPortal>
    </Dialog>
  );
}
