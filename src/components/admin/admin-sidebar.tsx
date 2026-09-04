"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  BarChart3Icon,
  UsersIcon,
  Building2Icon,
  LayersIcon,
  WalletIcon,
  TagIcon,
  FlagIcon,
  ShieldAlertIcon,
  ArrowLeftIcon,
  ActivityIcon,
} from "lucide-react";
import { LogoIcon } from "@/components/shared/logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { CustomSidebarTrigger } from "@/components/layout/custom-sidebar-trigger";
import { useLanguage } from "@/components/providers/language-provider";
import { ADMIN_NAV_ITEMS } from "@/components/admin/admin-nav-items";
import { NavUser } from "@/components/layout/nav-user";

const ICON_MAP = {
  dashboard: BarChart3Icon,
  users: UsersIcon,
  organizations: Building2Icon,
  plans: LayersIcon,
  wallets: WalletIcon,
  coupons: TagIcon,
  featureFlags: FlagIcon,
  auditLogs: ShieldAlertIcon,
};

export function AdminSidebar() {
  const { t } = useTranslation("admin");
  const pathname = usePathname();
  const { isRTL } = useLanguage();

  return (
    <Sidebar
      collapsible="icon"
      variant="floating"
      side={isRTL ? "right" : "left"}
    >
      <SidebarHeader className="h-16 flex flex-row items-center justify-between px-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
        <Link
          href="/admin"
          className="flex justify-start items-center overflow-hidden group-data-[collapsible=icon]:hidden gap-2"
        >
          <LogoIcon className="w-6 h-6 object-contain shrink-0 transition-all text-primary" />
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight leading-tight">
              woops
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
              Admin Suite
            </span>
          </div>
        </Link>
        <CustomSidebarTrigger />
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-medium tracking-wider uppercase text-muted-foreground/70">
            {t("title", { defaultValue: "System Administration" })}
          </SidebarGroupLabel>
          <SidebarMenu>
            {ADMIN_NAV_ITEMS.map((item) => {
              const Icon = ICON_MAP[item.iconName] || ActivityIcon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin" || pathname === "/admin/analytics"
                  : pathname?.startsWith(item.href);

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={isActive}
                    tooltip={t(item.titleKey, { defaultValue: item.defaultTitle })}
                    render={<Link href={item.href} />}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>
                      {t(item.titleKey, { defaultValue: item.defaultTitle })}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                render={<Link href="/" />}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeftIcon className="h-4 w-4 shrink-0" />
                <span>
                  {t("backToWorkspace", { defaultValue: "Back to Workspace" })}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <NavUser />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
