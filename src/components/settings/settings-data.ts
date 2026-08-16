import { type LucideIcon } from "lucide-react";
import {
  UserIcon,
  BuildingIcon,
  CreditCardIcon,
  BellIcon,
  ShieldCheckIcon,
  UsersIcon,
  PlugIcon,
  MessageCircleIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export type SettingsPageId =
  | "general"
  | "profile"
  | "billing"
  | "security"
  | "notifications"
  | "members"
  | "integrations"
  | "channels";

export interface SettingsNavItem {
  id: SettingsPageId;
  label: string;
  icon: LucideIcon;
  badge?: string;
}

export interface SettingsNavGroup {
  id: string;
  label: string;
  items: SettingsNavItem[];
}

export function useSettingsData() {
  const { t } = useTranslation(["settings"]);

  const SETTINGS_NAV: SettingsNavGroup[] = [
    {
      id: "workspace",
      label: t("workspace", { defaultValue: "Workspace" }),
      items: [
        { id: "general", label: t("general", { defaultValue: "General" }), icon: BuildingIcon },
        { id: "members", label: t("members", { defaultValue: "Members" }), icon: UsersIcon, badge: "3" },
        { id: "integrations", label: t("integrations", { defaultValue: "Integrations" }), icon: PlugIcon },
        { id: "channels", label: t("channels", { defaultValue: "Channels" }), icon: MessageCircleIcon },
      ],
    },
    {
      id: "account",
      label: t("account", { defaultValue: "Account" }),
      items: [
        { id: "profile", label: t("profile", { defaultValue: "Profile" }), icon: UserIcon },
        { id: "security", label: t("security", { defaultValue: "Security" }), icon: ShieldCheckIcon },
        { id: "notifications", label: t("notifications", { defaultValue: "Notifications" }), icon: BellIcon },
      ],
    },
    {
      id: "billing",
      label: t("billing", { defaultValue: "Billing" }),
      items: [
        { id: "billing", label: t("billing", { defaultValue: "Billing" }), icon: CreditCardIcon },
      ],
    },
  ];

  const PAGE_META: Record<
    SettingsPageId,
    { title: string; description: string }
  > = {
    general: {
      title: t("general", { defaultValue: "General" }),
      description: t("workspaceDesc", { defaultValue: "Manage your workspace name, logo, and timezone." }),
    },
    profile: {
      title: t("profile", { defaultValue: "Profile" }),
      description: t("personalInfoDesc", { defaultValue: "Update your personal information and preferences." }),
    },
    billing: {
      title: t("billing", { defaultValue: "Billing" }),
      description: t("billingDesc", { defaultValue: "Manage your subscription, payment methods, and invoices." }),
    },
    security: {
      title: t("security", { defaultValue: "Security" }),
      description: t("securityDesc", { defaultValue: "Manage your password, two-factor authentication, and active sessions." }),
    },
    notifications: {
      title: t("notifications", { defaultValue: "Notifications" }),
      description: t("notificationsDesc", { defaultValue: "Configure how and when you receive notifications." }),
    },
    members: {
      title: t("members", { defaultValue: "Members" }),
      description: t("membersDesc", { defaultValue: "Manage team members and their roles." }),
    },
    integrations: {
      title: t("integrations", { defaultValue: "Integrations" }),
      description: t("integrationsDesc", { defaultValue: "Connect third-party apps and services." }),
    },
    channels: {
      title: t("channels", { defaultValue: "Channels" }),
      description: t("channelsDesc", { defaultValue: "Configure communication channels for your employees." }),
    },
  };

  return { SETTINGS_NAV, PAGE_META };
}
