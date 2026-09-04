"use client";

import * as React from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { SearchInput } from "@/components/ui/search-input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import {
  useSettingsData,
  type SettingsPageId,
} from "@/components/settings/settings-data";
import { GeneralPage } from "@/components/settings/pages/general-page";
import { ProfilePage } from "@/components/settings/pages/profile-page";
import { BillingPage } from "@/components/settings/pages/billing-page";
import { SecurityPage } from "@/components/settings/pages/security-page";
import { IntegrationsPage } from "@/components/settings/pages/integrations-page";
import { useAuthStore } from "@/stores/auth-store";
import { useTranslation } from "react-i18next";

// ---------------------------------------------------------------------------
// Page registry
// ---------------------------------------------------------------------------
const PAGE_COMPONENTS: Record<SettingsPageId, React.ComponentType> = {
  general: GeneralPage,
  profile: ProfilePage,
  billing: BillingPage,
  security: SecurityPage,
  notifications: GeneralPage,
  members: GeneralPage,
  integrations: IntegrationsPage,
  channels: GeneralPage,
};

// ---------------------------------------------------------------------------
// Sidebar navigation
// ---------------------------------------------------------------------------
function SidebarNav({
  activePage,
  onSelect,
  searchQuery,
}: {
  activePage: SettingsPageId;
  onSelect: (id: SettingsPageId) => void;
  searchQuery: string;
}) {
  const { SETTINGS_NAV, PAGE_META } = useSettingsData();
  const q = searchQuery.toLowerCase();

  return (
    <nav className="flex flex-col gap-5 px-3 py-3">
      {SETTINGS_NAV.map((group) => {
        const filtered = group.items.filter(
          (item) =>
            !q ||
            item.label.toLowerCase().includes(q) ||
            PAGE_META[item.id].description.toLowerCase().includes(q)
        );
        if (filtered.length === 0) return null;

        return (
          <div key={group.id} className="flex flex-col gap-0.5">
            <span className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
              {group.label}
            </span>

            {filtered.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === activePage;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  className={[
                    "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-150 cursor-pointer select-none",
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                  ].join(" ")}
                >
                  {/* Left Edge Indicator */}
                  <span
                    className={[
                      "absolute left-0 top-1/2 h-4 w-1 -translate-y-1/2 rounded-r-full bg-primary transition-opacity duration-150",
                      isActive ? "opacity-100" : "opacity-0",
                    ].join(" ")}
                  />

                  <Icon
                    className={[
                      "size-[16px] shrink-0 transition-colors duration-150",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground/70 group-hover:text-foreground",
                    ].join(" ")}
                  />

                  <span className="flex-1 text-left">{item.label}</span>

                  {item.badge && (
                    <span
                      className={[
                        "rounded-full px-1.5 py-0.5 text-[10px] font-semibold transition-colors duration-150",
                        isActive
                          ? "bg-primary/15 text-primary"
                          : "bg-muted text-muted-foreground",
                      ].join(" ")}
                    >
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

// ---------------------------------------------------------------------------
// Sidebar user footer
// ---------------------------------------------------------------------------
function SidebarUserFooter() {
  const user = useAuthStore((s) => s.user);
  const name = user?.name || user?.email?.split("@")[0] || "Woops User";
  const email = user?.email || "";

  return (
    <div className="shrink-0 border-t border-border/50 p-3 bg-muted/10">
      <div className="flex items-center gap-3 rounded-lg px-2.5 py-2.5">
        <Avatar className="size-8 rounded-lg shrink-0">
          {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={name} />}
          <AvatarFallback className="rounded-lg bg-primary/10 text-[12px] font-semibold text-primary">
            {name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold leading-tight">
            {name}
          </p>
          <p className="truncate text-[11px] leading-tight text-muted-foreground">
            {email}
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Settings View (Full Page Layout with Smooth Page Open/Close)
// ---------------------------------------------------------------------------
export function SettingsView({ defaultTab }: { defaultTab?: SettingsPageId }) {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const paramTab = (params?.tab as SettingsPageId) || (searchParams?.get("tab") as SettingsPageId);
  const [activeTab, setActiveTab] = React.useState<SettingsPageId>(
    paramTab || defaultTab || "general"
  );
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isExiting, setIsExiting] = React.useState(false);
  const { PAGE_META } = useSettingsData();
  const { t } = useTranslation("settings");

  React.useEffect(() => {
    if (paramTab && paramTab !== activeTab) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTab(paramTab);
    }
  }, [paramTab, activeTab]);

  const handleSelectTab = (id: SettingsPageId) => {
    setActiveTab(id);
    router.push(`/settings/${id}`, { scroll: false });
  };

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      router.push("/");
    }, 180);
  };

  const meta = PAGE_META[activeTab] || PAGE_META.general;
  const PageComponent = PAGE_COMPONENTS[activeTab] || GeneralPage;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.99 }}
      animate={isExiting ? { opacity: 0, scale: 0.99 } : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="flex h-screen w-screen overflow-hidden bg-background"
    >
      {/* ------------------------------------------------------------------ */}
      {/* Sidebar — 280px fixed width, full height, pinned footer             */}
      {/* ------------------------------------------------------------------ */}
      <aside className="flex w-[280px] shrink-0 flex-col border-r border-border/50 bg-muted/20">
        {/* Sidebar Header with Back Button */}
        <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-border/50 px-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
              onClick={handleClose}
              title={t("backToDashboard", { defaultValue: "Back to Dashboard" })}
            >
              <ArrowLeftIcon className="size-4 rtl:rotate-180" />
            </Button>
            <h2 className="text-[15px] font-semibold tracking-tight">{t("settings", { defaultValue: "Settings" })}</h2>
          </div>
        </div>

        {/* Search Bar */}
        <div className="border-b border-border/50 px-4 py-3">
          <SearchInput
            placeholder={t("searchSettings", { defaultValue: "Search settings..." })}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 text-[13px]"
          />
        </div>

        {/* Nav Area — Scrolls vertically */}
        <div className="flex-1 overflow-y-auto">
          <SidebarNav
            activePage={activeTab}
            onSelect={handleSelectTab}
            searchQuery={searchQuery}
          />
        </div>

        {/* User Footer — Pinned at bottom */}
        <SidebarUserFooter />
      </aside>

      {/* ------------------------------------------------------------------ */}
      {/* Content Area — Occupies remaining full width                       */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Page Header */}
        <div className="flex h-[60px] shrink-0 items-center border-b border-border/50 px-10">
          <div>
            <h3 className="text-[16px] font-semibold leading-tight">
              {meta.title}
            </h3>
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              {meta.description}
            </p>
          </div>
        </div>

        {/* Page Body Component */}
        <div className="flex-1 overflow-y-auto">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="h-full"
          >
            <PageComponent />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
