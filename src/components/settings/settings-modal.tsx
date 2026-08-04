"use client";

import * as React from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

function SettingsContent() {
  const { activePage, openSettings, closeSettings } = useSettings();
  const [searchQuery, setSearchQuery] = React.useState("");

  const meta = PAGE_META[activePage];
  const PageComponent = PAGE_COMPONENTS[activePage];

  return (
    <div className="flex h-[85vh] max-h-[85vh] w-[800px] max-w-[90vw] flex-col overflow-hidden rounded-2xl bg-background shadow-2xl ring-1 ring-foreground/10">
      <div className="flex h-full max-h-full overflow-hidden">
        <div className="flex w-[280px] shrink-0 flex-col border-r bg-muted/20">
          <div className="border-b px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold">Settings</h2>
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

        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="border-b px-6 py-4">
            <h3 className="text-lg font-semibold">{meta.title}</h3>
            <p className="text-sm text-muted-foreground">{meta.description}</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            <PageComponent />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SettingsModal() {
  const { isOpen, closeSettings } = useSettings();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeSettings()}>
      <DialogContent showCloseButton={false} className="p-0">
        <SettingsContent />
      </DialogContent>
    </Dialog>
  );
}
