export interface AdminNavItem {
  titleKey: string;
  defaultTitle: string;
  href: string;
  iconName:
    | "dashboard"
    | "users"
    | "organizations"
    | "plans"
    | "wallets"
    | "coupons"
    | "featureFlags"
    | "auditLogs";
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    titleKey: "nav.dashboard",
    defaultTitle: "Overview & Analytics",
    href: "/admin",
    iconName: "dashboard",
  },
  {
    titleKey: "nav.users",
    defaultTitle: "User Accounts",
    href: "/admin/users",
    iconName: "users",
  },
  {
    titleKey: "nav.organizations",
    defaultTitle: "Organizations",
    href: "/admin/organizations",
    iconName: "organizations",
  },
  {
    titleKey: "nav.plans",
    defaultTitle: "Subscription Plans",
    href: "/admin/plans",
    iconName: "plans",
  },
  {
    titleKey: "nav.wallets",
    defaultTitle: "Wallets & Credits",
    href: "/admin/wallets",
    iconName: "wallets",
  },
  {
    titleKey: "nav.coupons",
    defaultTitle: "Coupons & Promos",
    href: "/admin/coupons",
    iconName: "coupons",
  },
  {
    titleKey: "nav.featureFlags",
    defaultTitle: "Feature Flags",
    href: "/admin/feature-flags",
    iconName: "featureFlags",
  },
  {
    titleKey: "nav.auditLogs",
    defaultTitle: "Audit Logs",
    href: "/admin/audit-logs",
    iconName: "auditLogs",
  },
];
