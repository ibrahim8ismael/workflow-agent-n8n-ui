import { api, buildQuery } from "@/lib/api/client";
import type {
  AdminArpuData,
  AdminAuditLog,
  AdminChurnData,
  AdminCoupon,
  AdminCreditsBurnData,
  AdminDashboardStats,
  AdminFeatureFlag,
  AdminImpersonationLog,
  AdminMrrData,
  AdminOrganizationListItem,
  AdminOrganizationStats,
  AdminUserListItem,
  AdminUserStats,
  AdminWalletDeductInput,
  AdminWalletTopUpInput,
  CreateCouponInput,
  CreateFeatureFlagInput,
  CreatePlanInput,
  FeatureFlagOverride,
  SetFeatureFlagOverrideInput,
  SubscriptionPlan,
  UpdatePlanInput,
  User,
  Wallet,
} from "@/lib/api/types";

// ======================================================================
// 1. Platform Analytics & KPIs (/admin/analytics)
// ======================================================================

export async function getAdminDashboardOverview(): Promise<AdminDashboardStats> {
  return api.get<AdminDashboardStats>("/admin/analytics/dashboard");
}

export async function getAdminMrr(): Promise<AdminMrrData> {
  return api.get<AdminMrrData>("/admin/analytics/mrr");
}

export async function getAdminChurn(): Promise<AdminChurnData> {
  return api.get<AdminChurnData>("/admin/analytics/churn");
}

export async function getAdminCreditsBurnRate(
  days = 30,
): Promise<AdminCreditsBurnData> {
  return api.get<AdminCreditsBurnData>(
    `/admin/analytics/credits-burn-rate${buildQuery({ days })}`,
  );
}

export async function getAdminArpu(): Promise<AdminArpuData> {
  return api.get<AdminArpuData>("/admin/analytics/arpu");
}

// ======================================================================
// 2. User Administration (/admin/users)
// ======================================================================

export async function listAdminUsers(
  params: {
    limit?: number;
    offset?: number;
    search?: string;
    role?: string;
    status?: string;
  } = {},
): Promise<AdminUserListItem[]> {
  return api.get<AdminUserListItem[]>(`/admin/users${buildQuery(params)}`);
}

export async function getAdminUserStats(): Promise<AdminUserStats> {
  return api.get<AdminUserStats>("/admin/users/stats");
}

export async function getAdminUserById(id: string): Promise<AdminUserListItem | User> {
  return api.get<AdminUserListItem | User>(`/admin/users/${id}`);
}

export async function suspendAdminUser(
  id: string,
  reason: string,
): Promise<{ success: boolean; message?: string }> {
  return api.post<{ success: boolean; message?: string }>(
    `/admin/users/${id}/suspend`,
    { reason },
  );
}

export async function reactivateAdminUser(
  id: string,
  reason: string,
): Promise<{ success: boolean; message?: string }> {
  return api.post<{ success: boolean; message?: string }>(
    `/admin/users/${id}/reactivate`,
    { reason },
  );
}

export async function impersonateAdminUser(
  id: string,
  reason: string,
): Promise<{ accessToken: string; impersonatedUserId: string }> {
  return api.post<{ accessToken: string; impersonatedUserId: string }>(
    `/admin/users/${id}/impersonate`,
    { reason },
  );
}

// ======================================================================
// 3. Organization Administration (/admin/organizations)
// ======================================================================

export async function listAdminOrganizations(
  params: {
    limit?: number;
    offset?: number;
    search?: string;
  } = {},
): Promise<AdminOrganizationListItem[]> {
  return api.get<AdminOrganizationListItem[]>(
    `/admin/organizations${buildQuery(params)}`,
  );
}

export async function getAdminOrganizationStats(): Promise<AdminOrganizationStats> {
  return api.get<AdminOrganizationStats>("/admin/organizations/stats");
}

export async function getAdminOrganizationById(
  id: string,
): Promise<AdminOrganizationListItem> {
  return api.get<AdminOrganizationListItem>(`/admin/organizations/${id}`);
}

export async function suspendAdminOrganization(
  id: string,
  reason: string,
): Promise<{ success: boolean; message?: string }> {
  return api.post<{ success: boolean; message?: string }>(
    `/admin/organizations/${id}/suspend`,
    { reason },
  );
}

// ======================================================================
// 4. Subscription Plans Management (/admin/plans)
// ======================================================================

export async function listAdminPlans(): Promise<SubscriptionPlan[]> {
  return api.get<SubscriptionPlan[]>("/admin/plans");
}

export async function createAdminPlan(
  input: CreatePlanInput,
): Promise<SubscriptionPlan> {
  return api.post<SubscriptionPlan>("/admin/plans", input);
}

export async function updateAdminPlan(
  id: string,
  input: UpdatePlanInput,
): Promise<SubscriptionPlan> {
  return api.patch<SubscriptionPlan>(`/admin/plans/${id}`, input);
}

// ======================================================================
// 5. Wallet & Credits Admin (/admin/wallets)
// ======================================================================

export async function topUpAdminWallet(
  walletId: string,
  input: AdminWalletTopUpInput,
): Promise<{ success: boolean; wallet?: Wallet }> {
  return api.post<{ success: boolean; wallet?: Wallet }>(
    `/admin/wallets/${walletId}/top-up`,
    input,
  );
}

export async function deductAdminWallet(
  walletId: string,
  input: AdminWalletDeductInput,
): Promise<{ success: boolean; wallet?: Wallet }> {
  return api.post<{ success: boolean; wallet?: Wallet }>(
    `/admin/wallets/${walletId}/deduct`,
    input,
  );
}

export async function freezeAdminWallet(
  walletId: string,
): Promise<{ success: boolean; wallet?: Wallet }> {
  return api.post<{ success: boolean; wallet?: Wallet }>(
    `/admin/wallets/${walletId}/freeze`,
  );
}

export async function unfreezeAdminWallet(
  walletId: string,
): Promise<{ success: boolean; wallet?: Wallet }> {
  return api.post<{ success: boolean; wallet?: Wallet }>(
    `/admin/wallets/${walletId}/unfreeze`,
  );
}

// ======================================================================
// 6. Coupon Management (/admin/coupons)
// ======================================================================

export async function listAdminCoupons(
  params: { limit?: number; offset?: number } = {},
): Promise<AdminCoupon[]> {
  return api.get<AdminCoupon[]>(`/admin/coupons${buildQuery(params)}`);
}

export async function createAdminCoupon(
  input: CreateCouponInput,
): Promise<AdminCoupon> {
  return api.post<AdminCoupon>("/admin/coupons", input);
}

// ======================================================================
// 7. Feature Flags (/admin/feature-flags)
// ======================================================================

export async function listAdminFeatureFlags(): Promise<AdminFeatureFlag[]> {
  return api.get<AdminFeatureFlag[]>("/admin/feature-flags");
}

export async function createAdminFeatureFlag(
  input: CreateFeatureFlagInput,
): Promise<AdminFeatureFlag> {
  return api.post<AdminFeatureFlag>("/admin/feature-flags", input);
}

export async function setAdminFeatureFlagOverride(
  key: string,
  input: SetFeatureFlagOverrideInput,
): Promise<FeatureFlagOverride> {
  return api.post<FeatureFlagOverride>(
    `/admin/feature-flags/${key}/overrides`,
    input,
  );
}

// ======================================================================
// 8. Audit Logs (/admin/audit-logs)
// ======================================================================

export async function queryAdminAuditLogs(
  params: {
    limit?: number;
    offset?: number;
    action?: string;
    userId?: string;
    entityType?: string;
  } = {},
): Promise<AdminAuditLog[]> {
  return api.get<AdminAuditLog[]>(`/admin/audit-logs${buildQuery(params)}`);
}

export async function queryAdminImpersonationLogs(
  params: { limit?: number; offset?: number } = {},
): Promise<AdminImpersonationLog[]> {
  return api.get<AdminImpersonationLog[]>(
    `/admin/audit-logs/impersonations${buildQuery(params)}`,
  );
}
