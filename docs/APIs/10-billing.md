# Billing, Wallets, Top-Ups & Metered Usage APIs

> Module: `BillingModule` · Controllers: `/subscriptions`, `/wallet`, `/top-up`, `/coupons`, `/invoices`, `/usage` · Base URL Prefix: `/api/v1`

---

## Overview

Woops operates a **Dual Billing Engine**:
1. **Subscription Tiers & Quotas**: Monthly recurring tiers (`FREE`, `PRO`, `BUSINESS`, `ENTERPRISE`) providing monthly allowances of AI Credits and Operations.
2. **Prepaid Credit Wallet**: Balance of credits consumed on a pay-as-you-go basis for runs, tokens, and tool executions. Users can top up their wallet anytime with one-time credit packages.

```
┌──────────────────────────────────────────────────────────────┐
│                    Billing Account Architecture              │
├──────────────────────────────┬───────────────────────────────┤
│    Monthly Subscription      │         Prepaid Wallet        │
│   • Active Plan & Quota      │   • Real-Time Credit Balance  │
│   • Monthly Reset Cycle      │   • Top-Up Packages           │
│   • Invoices via Stripe      │   • Ledger Transactions Log   │
└──────────────────────────────┴───────────────────────────────┘
```

---

## 1. Subscriptions (`/subscriptions`)

### 1.1 Get Current Subscription
Retrieves the user or organization's active subscription tier, cycle dates, and plan features.

- **Method**: `GET`
- **Path**: `/subscriptions/current`
- **Authentication**: `Bearer <accessToken>` (`JwtAuthGuard`)

#### Response Body (`200 OK`)
```json
{
  "id": "sub_1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
  "planId": "plan_pro_monthly",
  "status": "ACTIVE",
  "currentPeriodStart": "2026-08-01T00:00:00.000Z",
  "currentPeriodEnd": "2026-09-01T00:00:00.000Z",
  "provider": "stripe",
  "providerSubscriptionId": "sub_1Q2w3e4r5t6y7u8i",
  "trialEndsAt": null,
  "canceledAt": null,
  "plan": {
    "id": "plan_pro_monthly",
    "name": "Pro Plan",
    "description": "For growing businesses deploying up to 5 AI Employees.",
    "price": 49.00,
    "currency": "USD",
    "interval": "month",
    "features": {
      "maxEmployees": 5,
      "aiCreditsPerMonth": 50000,
      "operationsPerMonth": 10000
    }
  }
}
```

---

### 1.2 Subscribe to Plan
- **Method**: `POST`
- **Path**: `/subscriptions`
- **Authentication**: `Bearer <accessToken>`

#### Request Body
```json
{
  "planId": "plan_pro_monthly"
}
```

---

### 1.3 Upgrade Subscription Plan
- **Method**: `PATCH`
- **Path**: `/subscriptions/:id/upgrade`
- **Authentication**: `Bearer <accessToken>`

#### Request Body
```json
{
  "planId": "plan_business_monthly"
}
```

---

### 1.4 Cancel Subscription
- **Method**: `DELETE`
- **Path**: `/subscriptions/:id`
- **Authentication**: `Bearer <accessToken>`

---

## 2. Wallet Balance & Ledger (`/wallet`)

### 2.1 Get Wallet Balance
Returns real-time credit balances, USD equivalent value, lifetime metrics, and spending limit status.

- **Method**: `GET`
- **Path**: `/wallet`
- **Authentication**: `Bearer <accessToken>`

#### Response Body (`200 OK`)
```json
{
  "id": "wal_99a88b77-66c5-44d3-e2f1-001122334455",
  "balanceCredits": "142500",
  "balanceCreditsUsd": "142.50",
  "lifetimeCredits": "500000",
  "lifetimeSpendUsd": "357.50",
  "currency": "USD",
  "softLimit": "5000",
  "hardLimit": "0",
  "gracePeriodEnd": null,
  "isFrozen": false,
  "version": 42
}
```

---

### 2.2 List Wallet Ledger Transactions
Returns paginated debit and credit ledger transactions for auditing.

- **Method**: `GET`
- **Path**: `/wallet/transactions`
- **Authentication**: `Bearer <accessToken>`

#### Query Parameters
| Parameter | Type | Required | Description |
|---|---|---|---|
| `limit` | `number` | No | Number of records (default `50`) |
| `offset` | `number` | No | Offset pagination (default `0`) |

#### Response Body (`200 OK`)
```json
[
  {
    "id": "tx_01j4k9...",
    "walletId": "wal_99a88b77-66c5-44d3-e2f1-001122334455",
    "type": "CONSUMPTION",
    "amountCredits": "-150",
    "amountUsd": "-0.15",
    "currency": "USD",
    "balanceBefore": "142650",
    "balanceAfter": "142500",
    "description": "Agent run execution #run_01j4k9m3n8",
    "referenceType": "RUN",
    "referenceId": "run_01j4k9m3n8",
    "createdAt": "2026-08-16T12:00:02.000Z"
  }
]
```

---

## 3. Top-Up Credit Packages (`/top-up`)

### 3.1 List Available Top-Up Packages
- **Method**: `GET`
- **Path**: `/top-up/packages`
- **Authentication**: `Bearer <accessToken>`

#### Response Body (`200 OK`)
```json
[
  {
    "id": "pkg_credits_10k",
    "name": "10,000 AI Credits",
    "credits": 10000,
    "price": 10.00,
    "currency": "USD",
    "bonusCredits": 1000,
    "isActive": true
  },
  {
    "id": "pkg_credits_50k",
    "name": "50,000 AI Credits",
    "credits": 50000,
    "price": 45.00,
    "currency": "USD",
    "bonusCredits": 10000,
    "isActive": true
  }
]
```

---

### 3.2 Purchase Top-Up Package
- **Method**: `POST`
- **Path**: `/top-up/purchase`
- **Authentication**: `Bearer <accessToken>`

#### Request Body
```json
{
  "packageId": "pkg_credits_50k"
}
```

#### Response Body (`201 Created`)
```json
{
  "id": "pur_01j4k11...",
  "packageId": "pkg_credits_50k",
  "credits": 60000,
  "amountPaid": 45.00,
  "currency": "USD",
  "status": "COMPLETED",
  "createdAt": "2026-08-16T12:15:00.000Z"
}
```

---

### 3.3 List Top-Up Purchases
- **Method**: `GET`
- **Path**: `/top-up/purchases`
- **Authentication**: `Bearer <accessToken>`

---

## 4. Coupons & Promo Codes (`/coupons`)

### 4.1 Redeem Coupon Code
Redeems a promotional credit grant or discount code.

- **Method**: `POST`
- **Path**: `/coupons/redeem`
- **Authentication**: `Bearer <accessToken>`

#### Request Body
```json
{
  "code": "LAUNCH2026"
}
```

#### Response Body (`200 OK`)
```json
{
  "success": true,
  "message": "Coupon LAUNCH2026 redeemed successfully. 5,000 credits added to your wallet.",
  "creditsGranted": 5000
}
```

---

## 5. Invoices (`/invoices`)

### 5.1 List Subscription Invoices
- **Method**: `GET`
- **Path**: `/invoices`
- **Authentication**: `Bearer <accessToken>`

#### Response Body (`200 OK`)
```json
[
  {
    "id": "inv_01j4k9...",
    "subscriptionId": "sub_1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
    "amount": 49.00,
    "currency": "USD",
    "status": "PAID",
    "providerInvoiceId": "in_1Q2w3e4r5t6y7u8i",
    "paidAt": "2026-08-01T00:00:05.000Z",
    "dueDate": "2026-08-01T00:00:00.000Z",
    "createdAt": "2026-08-01T00:00:00.000Z"
  }
]
```

---

## 6. Metered Quota Usage (`/usage`)

### 6.1 Get Current Quota Usage
Returns consumed AI Credits and operations against the monthly tier quota.

- **Method**: `GET`
- **Path**: `/usage`
- **Authentication**: `Bearer <accessToken>`

#### Response Body (`200 OK`)
```json
{
  "aiCreditsUsed": 12450,
  "aiCreditsLimit": 50000,
  "operationsUsed": 2180,
  "operationsLimit": 10000,
  "resetAt": "2026-09-01T00:00:00.000Z"
}
```

---

## 7. Frontend Integration Snippet (TypeScript)

```typescript
import { api, buildQuery } from "@/lib/api/client";
import type { Invoice, Subscription, Usage, Wallet, WalletTransaction } from "@/lib/api/types";

// Subscription
export async function getCurrentSubscription(): Promise<Subscription | null> {
  return api.get<Subscription | null>("/subscriptions/current");
}

export async function upgradeSubscription(id: string, planId: string): Promise<Subscription> {
  return api.patch<Subscription>(`/subscriptions/${id}/upgrade`, { planId });
}

// Wallet & Ledger
export async function getWallet(): Promise<Wallet> {
  return api.get<Wallet>("/wallet");
}

export async function getWalletTransactions(params?: { limit?: number; offset?: number }): Promise<WalletTransaction[]> {
  const qs = buildQuery(params);
  return api.get<WalletTransaction[]>(`/wallet/transactions${qs}`);
}

// Top-ups
export async function getTopUpPackages() {
  return api.get("/top-up/packages");
}

export async function purchaseTopUp(packageId: string) {
  return api.post("/top-up/purchase", { packageId });
}

// Coupon
export async function redeemCoupon(code: string) {
  return api.post("/coupons/redeem", { code });
}

// Metered Usage
export async function getMeteredUsage(): Promise<Usage> {
  return api.get<Usage>("/usage");
}
```
