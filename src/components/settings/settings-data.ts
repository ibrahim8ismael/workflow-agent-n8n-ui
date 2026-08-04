import { type LucideIcon } from "lucide-react";
import {
  UserIcon,
  BuildingIcon,
  CreditCardIcon,
  BellIcon,
  ShieldCheckIcon,
  UsersIcon,
  PlugIcon,
  DatabaseIcon,
  MessageCircleIcon,
} from "lucide-react";

export type SettingsPageId =
  | "general"
  | "profile"
  | "billing"
  | "security"
  | "notifications"
  | "members"
  | "integrations"
  | "knowledge"
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

export const SETTINGS_NAV: SettingsNavGroup[] = [
  {
    id: "workspace",
    label: "Workspace",
    items: [
      { id: "general", label: "General", icon: BuildingIcon },
      { id: "members", label: "Members", icon: UsersIcon, badge: "3" },
      { id: "integrations", label: "Integrations", icon: PlugIcon },
      { id: "knowledge", label: "Knowledge", icon: DatabaseIcon },
      { id: "channels", label: "Channels", icon: MessageCircleIcon },
    ],
  },
  {
    id: "account",
    label: "Account",
    items: [
      { id: "profile", label: "Profile", icon: UserIcon },
      { id: "security", label: "Security", icon: ShieldCheckIcon },
      { id: "notifications", label: "Notifications", icon: BellIcon },
    ],
  },
  {
    id: "billing",
    label: "Billing",
    items: [
      { id: "billing", label: "Billing", icon: CreditCardIcon },
    ],
  },
];

export const PAGE_META: Record<
  SettingsPageId,
  { title: string; description: string }
> = {
  general: {
    title: "General",
    description: "Manage your workspace name, logo, and timezone.",
  },
  profile: {
    title: "Profile",
    description: "Update your personal information and preferences.",
  },
  billing: {
    title: "Billing",
    description: "Manage your subscription, payment methods, and invoices.",
  },
  security: {
    title: "Security",
    description: "Manage your password, two-factor authentication, and active sessions.",
  },
  notifications: {
    title: "Notifications",
    description: "Configure how and when you receive notifications.",
  },
  members: {
    title: "Members",
    description: "Manage team members and their roles.",
  },
  integrations: {
    title: "Integrations",
    description: "Connect third-party apps and services.",
  },
  knowledge: {
    title: "Knowledge",
    description: "Manage documents, FAQs, and knowledge bases.",
  },
  channels: {
    title: "Channels",
    description: "Configure communication channels for your employees.",
  },
};
