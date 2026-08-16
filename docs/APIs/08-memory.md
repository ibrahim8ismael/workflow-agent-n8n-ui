# Persistent Agent Memory APIs

> Module: `MemoryModule` · Controller Path: `/memory` · Base URL Prefix: `/api/v1`

---

## Overview

The **Memory** module gives AI Employees durable, cross-session recall. While conversation history stores the verbatim chat messages, memory stores extracted key-value facts, user preferences, account traits, and behavioral heuristics.

### Memory Types (`MemoryType`)

| Type | Target Scope | Example Usage |
|---|---|---|
| `USER` | Specific customer or team member | "Customer prefers communication in Arabic", "Prefers Stripe invoices over PayPal" |
| `CONVERSATION` | Specific discussion thread | "Customer was promised a $50 credit for delayed shipping" |
| `AGENT` | Global employee heuristics | "Always verify enterprise license tier before scheduling VIP demo" |

---

## 1. Create Memory Entry

Stores an explicit memory item for an AI Employee.

- **Method**: `POST`
- **Path**: `/memory`
- **Authentication**: `Bearer <accessToken>`

### Request Body
| Field | Type | Required | Description |
|---|---|---|---|
| `agentId` | `string` | **Yes** | AI Employee ID |
| `type` | `string` | **Yes** | `"CONVERSATION"` \| `"USER"` \| `"AGENT"` |
| `key` | `string` | **Yes** | Unique memory lookup key (e.g. `preferred_language`) |
| `content` | `string` | **Yes** | Fact or rule content |
| `metadata` | `object` | No | Additional structured data |
| `expiresAt` | `string` | No | Optional ISO date for temporary recall |

```json
{
  "agentId": "ag_89f02b14-c321-4def-91a2-3f4e5a6b7c8d",
  "type": "USER",
  "key": "customer_shipping_preference",
  "content": "Customer always requests FedEx Priority Overnight.",
  "metadata": { "confidence": 0.95 }
}
```

### Response Body (`201 Created`)
```json
{
  "id": "mem_12a34b56-78c9-40de-f123-456789abcdef",
  "agentId": "ag_89f02b14-c321-4def-91a2-3f4e5a6b7c8d",
  "type": "USER",
  "key": "customer_shipping_preference",
  "content": "Customer always requests FedEx Priority Overnight.",
  "metadata": { "confidence": 0.95 },
  "userId": "c1f7a40b-7128-4444-9351-a90d98fa6a8b",
  "organizationId": null,
  "expiresAt": null,
  "createdAt": "2026-08-16T12:00:00.000Z",
  "updatedAt": "2026-08-16T12:00:00.000Z",
  "deletedAt": null
}
```

---

## 2. List Memories for an Agent

Lists all stored memory entries for a given AI Employee.

- **Method**: `GET`
- **Path**: `/memory/agent/:agentId`
- **Authentication**: `Bearer <accessToken>`

### Query Parameters
| Parameter | Type | Required | Description |
|---|---|---|---|
| `type` | `string` | No | Filter by type: `CONVERSATION`, `USER`, `AGENT` |
| `userId` | `string` | No | Filter by specific user ID |
| `skip` | `number` | No | Offset pagination |
| `take` | `number` | No | Items count |

### Response Body (`200 OK`)
```json
[
  {
    "id": "mem_12a34b56-78c9-40de-f123-456789abcdef",
    "agentId": "ag_89f02b14-c321-4def-91a2-3f4e5a6b7c8d",
    "type": "USER",
    "key": "customer_shipping_preference",
    "content": "Customer always requests FedEx Priority Overnight.",
    "createdAt": "2026-08-16T12:00:00.000Z"
  }
]
```

---

## 3. Search Agent Memories

Full-text search over memory keys and contents for an agent.

- **Method**: `GET`
- **Path**: `/memory/agent/:agentId/search`
- **Authentication**: `Bearer <accessToken>`

### Query Parameters
| Parameter | Type | Required | Description |
|---|---|---|---|
| `q` | `string` | **Yes** | Search keyword / phrase |
| `type` | `string` | No | Filter by type |
| `limit` | `number` | No | Max results |

### Example Request
```http
GET /api/v1/memory/agent/ag_89f02b14-c321-4def-91a2-3f4e5a6b7c8d/search?q=FedEx
Authorization: Bearer <accessToken>
```

### Response Body (`200 OK`)
```json
[
  {
    "id": "mem_12a34b56-78c9-40de-f123-456789abcdef",
    "agentId": "ag_89f02b14-c321-4def-91a2-3f4e5a6b7c8d",
    "type": "USER",
    "key": "customer_shipping_preference",
    "content": "Customer always requests FedEx Priority Overnight."
  }
]
```

---

## 4. Get Memory by ID

- **Method**: `GET`
- **Path**: `/memory/:id`
- **Authentication**: `Bearer <accessToken>`

---

## 5. Update Memory Entry

- **Method**: `PATCH`
- **Path**: `/memory/:id`
- **Authentication**: `Bearer <accessToken>`

### Request Body
```json
{
  "content": "Customer now prefers DHL Express International."
}
```

---

## 6. Delete Memory (Soft Delete)

- **Method**: `DELETE`
- **Path**: `/memory/:id`
- **Authentication**: `Bearer <accessToken>`

---

## 7. Frontend Integration Snippet (TypeScript)

```typescript
import { api, buildQuery } from "@/lib/api/client";
import type { CreateMemoryInput, Memory, UpdateMemoryInput } from "@/lib/api/types";

export async function getMemories(agentId: string, params?: { type?: string; skip?: number; take?: number }): Promise<Memory[]> {
  const qs = buildQuery(params);
  return api.get<Memory[]>(`/memory/agent/${agentId}${qs}`);
}

export async function searchMemories(agentId: string, query: string, type?: string): Promise<Memory[]> {
  const qs = buildQuery({ q: query, type });
  return api.get<Memory[]>(`/memory/agent/${agentId}/search${qs}`);
}

export async function createMemory(data: CreateMemoryInput): Promise<Memory> {
  return api.post<Memory>("/memory", data);
}

export async function updateMemory(id: string, data: UpdateMemoryInput): Promise<Memory> {
  return api.patch<Memory>(`/memory/${id}`, data);
}

export async function deleteMemory(id: string): Promise<Memory> {
  return api.delete<Memory>(`/memory/${id}`);
}
```
