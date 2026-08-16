# System Administration APIs

> Module: `AdminModule` · Controllers: `/admin/*` · Base URL Prefix: `/api/v1`
> Security Guard: `JwtAuthGuard` + `SystemAdminGuard` (Requires user role `SYSTEM_ADMINISTRATOR`)

---

## Overview

The **Admin API Suite** empowers platform administrators to monitor system performance, manage user accounts and organizations, configure subscription tiers, perform wallet adjustments, manage feature flags, and review audit trails.

---

## 1. Platform Analytics & KPIs (`/admin/analytics`)

### 1.1 Analytics Dashboard Overview
- **Method**: `GET`
- **Path**: `/admin/analytics/dashboard`
- **Authentication**: `Bearer <adminToken>`

```json
{
  "totalUsers": 1284,
  "activeOrganizations": 312,
  "totalRunsToday": 8920,
  "mrrUsd": 41250.00,
  "systemHealth": "HEALTHY"
}
```

### 1.2 Monthly Recurring Revenue (MRR)
- **Method**: `GET`
- **Path**: `/admin/analytics/mrr`

### 1.3 Churn Rate
- **Method**: `GET`
- **Path**: `/admin/analytics/churn`

### 1.4 AI Credits Burn Rate
- **Method**: `GET`
- **Path**: `/admin/analytics/credits-burn-rate?days=30`

### 1.5 Average Revenue Per User (ARPU)
- **Method**: `GET`
- **Path**: `/admin/analytics/arpu`

---

## 2. User Administration (`/admin/users`)

### 2.1 List Users
- **Method**: `GET`
- **Path**: `/admin/users?limit=50&offset=0`

### 2.2 User Stats
- **Method**: `GET`
- **Path**: `/admin/users/stats`

### 2.3 Get User by ID
- **Method**: `GET`
- **Path**: `/admin/users/:id`

### 2.4 Suspend User Account
- **Method**: `POST`
- **Path**: `/admin/users/:id/suspend`
- **Request Body**: `{ "reason": "Violated terms of service (abuse of LLM tokens)" }`

### 2.5 Reactivate User Account
- **Method**: `POST`
- **Path**: `/admin/users/:id/reactivate`
- **Request Body**: `{ "reason": "Account cleared by compliance" }`

### 2.6 Impersonate User Session
Generates a temporary access token for the admin to view the platform as the target user.
- **Method**: `POST`
- **Path**: `/admin/users/:id/impersonate`
- **Request Body**: `{ "reason": "Troubleshooting billing sync issue" }`
- **Response**: `{ "accessToken": "<impersonation_jwt>", "impersonatedUserId": "..." }`

---

## 3. Organization Administration (`/admin/organizations`)

### 3.1 List Organizations
- **Method**: `GET`
- **Path**: `/admin/organizations?limit=50&offset=0`

### 3.2 Organization Stats
- **Method**: `GET`
- **Path**: `/admin/organizations/stats`

### 3.3 Get Organization by ID
- **Method**: `GET`
- **Path**: `/admin/organizations/:id`

### 3.4 Suspend Organization
- **Method**: `POST`
- **Path**: `/admin/organizations/:id/suspend`
- **Request Body**: `{ "reason": "Overdue payment grace period expired" }`

---

## 4. Subscription Plans Management (`/admin/plans`)

### 4.1 List All Plans
- **Method**: `GET`
- **Path**: `/admin/plans`

### 4.2 Create New Subscription Plan
- **Method**: `POST`
- **Path**: `/admin/plans`
- **Request Body**:
```json
{
  "name": "Enterprise Scale",
  "description": "Unlimited agents with high-concurrency execution",
  "price": 299.00,
  "currency": "USD",
  "interval": "month",
  "features": { "maxEmployees": 50, "prioritySupport": true }
}
```

### 4.3 Update Plan
- **Method**: `PATCH`
- **Path**: `/admin/plans/:id`

---

## 5. Wallet & Credits Admin (`/admin/wallets`)

### 5.1 Admin Credit Top-Up (Manual Credit Grant)
- **Method**: `POST`
- **Path**: `/admin/wallets/:id/top-up`
- **Request Body**:
```json
{
  "credits": "50000",
  "description": "Courtesy goodwill credit adjustment by Support"
}
```

### 5.2 Admin Credit Deduction
- **Method**: `POST`
- **Path**: `/admin/wallets/:id/deduct`
- **Request Body**:
```json
{
  "credits": "10000",
  "description": "Clawback for disputed charge"
}
```

### 5.3 Freeze Wallet
- **Method**: `POST`
- **Path**: `/admin/wallets/:id/freeze`

### 5.4 Unfreeze Wallet
- **Method**: `POST`
- **Path**: `/admin/wallets/:id/unfreeze`

---

## 6. Coupon Management (`/admin/coupons`)

### 6.1 List Coupons
- **Method**: `GET`
- **Path**: `/admin/coupons?limit=50&offset=0`

### 6.2 Create Coupon
- **Method**: `POST`
- **Path**: `/admin/coupons`
- **Request Body**:
```json
{
  "code": "SUMMER50",
  "type": "FREE_CREDITS",
  "value": 50000,
  "maxRedemptions": 100,
  "expiresAt": "2026-09-01T00:00:00.000Z"
}
```

---

## 7. Feature Flags (`/admin/feature-flags`)

### 7.1 List All Flags
- **Method**: `GET`
- **Path**: `/admin/feature-flags`

### 7.2 Create Feature Flag
- **Method**: `POST`
- **Path**: `/admin/feature-flags`
- **Request Body**:
```json
{
  "key": "enable_gpt5_preview",
  "name": "GPT-5 Preview Model",
  "description": "Enables GPT-5 model selection in agent configuration",
  "enabled": false
}
```

### 7.3 Set Targeted Override
- **Method**: `POST`
- **Path**: `/admin/feature-flags/:key/overrides`
- **Request Body**:
```json
{
  "entityType": "ORGANIZATION",
  "entityId": "org_12345",
  "enabled": true,
  "reason": "Early access pilot"
}
```

---

## 8. Audit Logs (`/admin/audit-logs`)

### 8.1 Query Platform Audit Logs
- **Method**: `GET`
- **Path**: `/admin/audit-logs`
- **Query Parameters**: `limit`, `offset`, `action`, `userId`, `entityType`

### 8.2 Query Impersonation Trail
- **Method**: `GET`
- **Path**: `/admin/audit-logs/impersonations?limit=100&offset=0`
