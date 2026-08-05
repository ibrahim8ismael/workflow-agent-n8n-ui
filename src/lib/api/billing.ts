import { api } from "@/lib/api/client";
import type {
  Invoice,
  Subscription,
  Wallet,
  Usage,
} from "@/lib/api/types";

export async function getCurrentSubscription(): Promise<Subscription | null> {
  return api.get<Subscription | null>("/subscriptions/current");
}

export async function cancelSubscription(
  subscriptionId: string,
): Promise<Subscription> {
  return api.delete<Subscription>(`/subscriptions/${subscriptionId}`);
}

export async function getInvoices(): Promise<Invoice[]> {
  return api.get<Invoice[]>("/invoices");
}

export async function getWallet(): Promise<Wallet | null> {
  return api.get<Wallet | null>("/wallet");
}

export async function getUsage(): Promise<Usage> {
  return api.get<Usage>("/usage");
}
