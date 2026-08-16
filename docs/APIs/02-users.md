# User Profile & Sessions APIs

> Module: `UsersModule` · Controller Path: `/users` · Base URL Prefix: `/api/v1`

---

## Overview

The Users module handles authenticated user profile retrieval, profile updates (name, avatar), session management across multiple devices/browsers, and account deactivation.

---

## 1. Get Current User Profile

Retrieves the currently authenticated user's profile information based on their JWT Access Token.

- **Method**: `GET`
- **Path**: `/users/me`
- **Authentication**: `Bearer <accessToken>` (`JwtAuthGuard`)

### Request Headers
```http
Authorization: Bearer <accessToken>
```

### Response Body (`200 OK`)
```json
{
  "id": "c1f7a40b-7128-4444-9351-a90d98fa6a8b",
  "email": "founder@acme.inc",
  "phone": "+1 (555) 019-2834",
  "name": "Sarah Connor",
  "avatarUrl": "https://cdn.woops.ai/avatars/user-123.webp",
  "emailVerifiedAt": "2026-08-01T10:15:30.000Z",
  "role": "USER",
  "isActive": true,
  "createdAt": "2026-08-01T10:15:30.000Z",
  "updatedAt": "2026-08-16T11:45:00.000Z"
}
```

---

## 2. Update Profile

Updates user profile fields like display name and avatar URL.

- **Method**: `PATCH`
- **Path**: `/users/me`
- **Authentication**: `Bearer <accessToken>` (`JwtAuthGuard`)

### Request Body
| Field | Type | Required | Validation | Description |
|---|---|---|---|---|
| `name` | `string` | No | Min 1, Max 255 chars | User's full display name |
| `avatarUrl` | `string` | No | Valid URL | Public HTTPS URL to user avatar image |

```json
{
  "name": "Sarah Connor",
  "avatarUrl": "https://images.unsplash.com/photo-1494790108377-be9c29b29330"
}
```

### Response Body (`200 OK`)
```json
{
  "id": "c1f7a40b-7128-4444-9351-a90d98fa6a8b",
  "email": "founder@acme.inc",
  "name": "Sarah Connor",
  "avatarUrl": "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
  "role": "USER",
  "isActive": true,
  "createdAt": "2026-08-01T10:15:30.000Z",
  "updatedAt": "2026-08-16T12:30:00.000Z"
}
```

---

## 3. Deactivate Account

Deactivates the user's account and revokes active sessions.

- **Method**: `DELETE`
- **Path**: `/users/me`
- **Authentication**: `Bearer <accessToken>` (`JwtAuthGuard`)

### Response (`204 No Content`)
*Empty response body.*

---

## 4. List Active Sessions

Returns all active logged-in sessions for the current user across different devices, browsers, and IPs.

- **Method**: `GET`
- **Path**: `/users/me/sessions`
- **Authentication**: `Bearer <accessToken>` (`JwtAuthGuard`)

### Response Body (`200 OK`)
```json
[
  {
    "id": "ses_4bb48bf2-2b6b-4e12-b258-29bf8b5d3f2a",
    "device": "MacBook Pro",
    "browser": "Chrome 127.0",
    "ip": "192.168.1.100",
    "lastUsedAt": "2026-08-16T12:20:00.000Z",
    "expiresAt": "2026-09-15T12:00:00.000Z",
    "createdAt": "2026-08-16T12:00:00.000Z"
  },
  {
    "id": "ses_9e2f41bc-1234-4567-89ab-cdef01234567",
    "device": "iPhone 15 Pro",
    "browser": "Mobile Safari 17.5",
    "ip": "172.56.21.89",
    "lastUsedAt": "2026-08-15T18:30:00.000Z",
    "expiresAt": "2026-09-14T18:30:00.000Z",
    "createdAt": "2026-08-14T18:30:00.000Z"
  }
]
```

---

## 5. Revoke Specific Session

Terminates a specific session device by session ID.

- **Method**: `DELETE`
- **Path**: `/users/me/sessions/:sessionId`
- **Authentication**: `Bearer <accessToken>` (`JwtAuthGuard`)

### URL Parameters
| Parameter | Type | Required | Description |
|---|---|---|---|
| `sessionId` | `string` | **Yes** | ID of the session to terminate |

### Response (`204 No Content`)
*Empty response body.*

---

## 6. Get User by ID

Looks up user details by user ID. Guarded by `UserOwnerGuard` (only the user themselves or system administrators can view the user record).

- **Method**: `GET`
- **Path**: `/users/:id`
- **Authentication**: `Bearer <accessToken>` (`JwtAuthGuard` + `UserOwnerGuard`)

### Response Body (`200 OK`)
```json
{
  "id": "c1f7a40b-7128-4444-9351-a90d98fa6a8b",
  "email": "founder@acme.inc",
  "name": "Sarah Connor",
  "avatarUrl": "https://cdn.woops.ai/avatars/user-123.webp",
  "role": "USER",
  "isActive": true,
  "createdAt": "2026-08-01T10:15:30.000Z",
  "updatedAt": "2026-08-16T12:30:00.000Z"
}
```

---

## 7. Frontend Integration Snippet (TypeScript)

```typescript
import { api } from "@/lib/api/client";
import type { User, UserSession } from "@/lib/api/types";

// Get current profile
export async function getProfile(): Promise<User> {
  return api.get<User>("/users/me");
}

// Update profile
export async function updateProfile(data: { name?: string; avatarUrl?: string }): Promise<User> {
  return api.patch<User>("/users/me", data);
}

// Get active login sessions
export async function getSessions(): Promise<UserSession[]> {
  return api.get<UserSession[]>("/users/me/sessions");
}

// Revoke a remote session
export async function revokeSession(sessionId: string): Promise<void> {
  return api.delete<void>(`/users/me/sessions/${sessionId}`);
}
```
