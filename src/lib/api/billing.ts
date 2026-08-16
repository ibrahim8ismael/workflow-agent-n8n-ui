import { api, buildQuery } from "@/lib/api/client";
import type {
  CouponRedemption,
  Invoice,
  Subscription,
  TopUpPackage,
  TopUpPurchase,
  Usage,
  Wallet,
  WalletTransaction,
} from "@/lib/api/types";

// ----------------------------------------------------------------------
// Subscriptions
// ----------------------------------------------------------------------

export async function getCurrentSubscription(): Promise<Subscription | null> {
  return api.get<Subscription | null>("/subscriptions/current");
}

export async function subscribeToPlan(planId: string): Promise<Subscription> {
  return api.post<Subscription>("/subscriptions", { planId });
}

export async function upgradeSubscription(
  subscriptionId: string,
  planId: string,
): Promise<Subscription> {
  return api.patch<Subscription>(`/subscriptions/${subscriptionId}/upgrade`, {
    planId,
  });
}

export async function cancelSubscription(
  subscriptionId: string,
): Promise<Subscription> {
  return api.delete<Subscription>(`/subscriptions/${subscriptionId}`);
}

// ----------------------------------------------------------------------
// Wallet & Ledger
// ----------------------------------------------------------------------

export async function getWallet(): Promise<Wallet | null> {
  return api.get<Wallet | null>("/wallet");
}

export async function getWalletTransactions(
  params: { limit?: number; offset?: number } = {},
): Promise<WalletTransaction[]> {
  return api.get<WalletTransaction[]>(`/wallet/transactions${buildQuery(params)}`);
}

// ----------------------------------------------------------------------
// Top-Up Packages
// ----------------------------------------------------------------------

export async function getTopUpPackages(): Promise<TopUpPackage[]> {
  return api.get<TopUpPackage[]>("/top-up/packages");
}

export async function purchaseTopUp(
  packageId: string,
): Promise<TopUpPurchase> {
  return api.post<TopUpPurchase>("/top-up/purchase", { packageId });
}

export async function listTopUpPurchases(): Promise<TopUpPurchase[]> {
  return api.get<TopUpPurchase[]>("/top-up/purchases");
}

// ----------------------------------------------------------------------
// Coupons
// ----------------------------------------------------------------------

export async function redeemCoupon(code: string): Promise<CouponRedemption> {
  return api.post<CouponRedemption>("/coupons/redeem", { code });
}

// ----------------------------------------------------------------------
// Invoices & Metered Usage
// ----------------------------------------------------------------------

export async function getInvoices(): Promise<Invoice[]> {
  return api.get<Invoice[]>("/invoices");
}

export async function getUsage(): Promise<Usage> {
  return api.get<Usage>("/usage");
}

