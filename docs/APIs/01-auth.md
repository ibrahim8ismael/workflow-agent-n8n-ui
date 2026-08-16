# Authentication & Session APIs

> Module: `AuthModule` · Controller Path: `/auth` · Base URL Prefix: `/api/v1`

---

## Overview

Woops provides a modern, passwordless authentication flow using email One-Time Passwords (OTP).
- **No passwords required** — registration and login share the identical flow. If an email is new, the backend automatically provisions a user account and an individual workspace.
- **Short-Lived Access Tokens (JWT)**: Valid for 15 minutes, stored **strictly in JavaScript memory** in the frontend client.
- **Long-Lived Refresh Tokens**: Valid for 30 days, stored in an **HttpOnly, SameSite=Lax** cookie named `woops_refresh` scoped to `/api/v1/auth`.
- **Token Rotation**: Every call to `/auth/refresh` rotates the refresh token, invalidating previous tokens and maintaining session security against replay attacks.

---

## 1. Request Login / Signup OTP

Initiates the authentication process by generating a 6-digit code sent to the specified email address via email (or Mailpit in local development).

- **Method**: `POST`
- **Path**: `/auth/otp/request`
- **Authentication**: None (Public)
- **Rate Limits**: 5 requests/hour per email · 20 requests/hour per client IP

### Request Headers
```http
Content-Type: application/json
```

### Request Body
| Field | Type | Required | Validation | Description |
|---|---|---|---|---|
| `email` | `string` | **Yes** | Valid RFC email address | User's work or personal email address |

```json
{
  "email": "founder@acme.inc"
}
```

### Response (`200 OK`)
```json
{
  "success": true,
  "message": "OTP sent to email"
}
```

### Error Responses
- **`400 Bad Request`**: Malformed email or validation failure.
  ```json
  { "statusCode": 400, "message": "Validation error", "timestamp": "2026-08-16T12:00:00.000Z" }
  ```
- **`429 Too Many Requests`**: Rate limit exceeded for email or IP.
  ```json
  { "statusCode": 429, "message": "Too Many Requests", "timestamp": "2026-08-16T12:00:00.000Z" }
  ```

---

## 2. Verify OTP & Establish Session

Verifies the 6-digit code. If valid, issues an Access Token in the response body and sets the secure `woops_refresh` HttpOnly cookie.

- **Method**: `POST`
- **Path**: `/auth/otp/verify`
- **Authentication**: None (Public)
- **Rate Limits**: Max 5 verification attempts per OTP (expires in 5 minutes)

### Request Headers
```http
Content-Type: application/json
```

### Request Body
| Field | Type | Required | Validation | Description |
|---|---|---|---|---|
| `email` | `string` | **Yes** | Valid RFC email address | User email address |
| `otp` | `string` | **Yes** | 6 numeric digits | OTP code received by email |

```json
{
  "email": "founder@acme.inc",
  "otp": "491823"
}
```

### Response Headers (Set-Cookie)
```http
Set-Cookie: woops_refresh=<jwt_refresh_token>; Path=/api/v1/auth; HttpOnly; SameSite=Lax; Max-Age=2592000
```
*(In production, `Secure` is automatically appended).*

### Response Body (`200 OK`)
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "sessionId": "4bb48bf2-2b6b-4e12-b258-29bf8b5d3f2a",
    "user": {
      "id": "c1f7a40b-7128-4444-9351-a90d98fa6a8b",
      "email": "founder@acme.inc",
      "name": null,
      "role": "USER"
    }
  }
}
```

### User Roles
- `USER`: Standard organization member or individual founder.
- `SYSTEM_ADMINISTRATOR`: Super administrator with access to `/admin/*` operations.

---

## 3. Silent Token Refresh

Exchanges the durable HttpOnly refresh cookie for a newly minted short-lived Access Token and rotated Refresh Cookie.

- **Method**: `POST`
- **Path**: `/auth/refresh`
- **Authentication**: HttpOnly Cookie (`woops_refresh`) — Requires `credentials: "include"`

### Request Headers
```http
Content-Type: application/json
```

### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Error Response (`401 Unauthorized`)
Triggered when cookie is missing or invalid:
```json
{
  "success": false,
  "error": {
    "code": "NO_REFRESH_TOKEN",
    "message": "Refresh token not found"
  }
}
```
*Frontend Action*: Clear stored auth state and redirect to `/login`.

---

## 4. Logout (Current Session)

Revokes the current active session in the database and clears the `woops_refresh` cookie.

- **Method**: `POST`
- **Path**: `/auth/logout`
- **Authentication**: `Bearer <accessToken>` + `credentials: "include"`

### Request Headers
```http
Authorization: Bearer <accessToken>
```

### Response (`204 No Content`)
*Empty response body. `Set-Cookie` header clears `woops_refresh`.*

---

## 5. Logout All Devices / Sessions

Revokes all active sessions across all devices for the authenticated user, increments the internal `tokenVersion`, and clears cookies.

- **Method**: `POST`
- **Path**: `/auth/logout-all`
- **Authentication**: `Bearer <accessToken>` + `credentials: "include"`

### Request Headers
```http
Authorization: Bearer <accessToken>
```

### Response (`204 No Content`)
*Empty response body.*

---

## 6. Switch Organization Context

Switches the active tenant context for the user without requiring a full re-login. Issues an updated Access Token containing the active `organizationId`.

- **Method**: `POST`
- **Path**: `/auth/switch-organization`
- **Authentication**: `Bearer <accessToken>`

### Request Body
| Field | Type | Required | Description |
|---|---|---|---|
| `organizationId` | `string` | **Yes** | ID of the organization the user belongs to |

```json
{
  "organizationId": "a90b4412-1f3c-42e1-88dc-9134591a56f2"
}
```

### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 7. Frontend Integration Snippet (TypeScript)

```typescript
import { api, setAccessToken } from "@/lib/api/client";

// Step 1: Request OTP
export async function requestOtp(email: string) {
  return api.post<{ success: boolean; message: string }>("/auth/otp/request", { email });
}

// Step 2: Verify OTP & Save Token
export async function verifyOtp(email: string, otp: string) {
  const result = await api.post<{
    success: boolean;
    data: { accessToken: string; sessionId: string; user: { id: string; email: string; name?: string; role: string } };
  }>("/auth/otp/verify", { email, otp }, { envelope: true });

  setAccessToken(result.accessToken);
  return result;
}

// Step 3: Switch Workspace Context
export async function switchOrganization(organizationId: string) {
  const result = await api.post<{
    success: boolean;
    data: { accessToken: string };
  }>("/auth/switch-organization", { organizationId }, { envelope: true });

  setAccessToken(result.accessToken);
  return result;
}
```
