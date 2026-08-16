# Conversations & Chat History APIs

> Module: `ConversationsModule` · Controller Path: `/conversations` · Base URL Prefix: `/api/v1`

---

## Overview

The **Conversations** module provides persistent thread state, chat history storage, title updates, resolution workflows, and message retrieval for all interactions between users and AI Employees.

---

## 1. Create Conversation Thread

Explicitly initializes a new conversation thread with an AI Employee.
*(Note: If a run is executed without passing a `conversationId`, the runtime automatically provisions a new conversation titled "New chat").*

- **Method**: `POST`
- **Path**: `/conversations`
- **Authentication**: `Bearer <accessToken>`

### Request Body
| Field | Type | Required | Description |
|---|---|---|---|
| `agentId` | `string` | **Yes** | AI Employee ID to chat with |
| `title` | `string` | No | Initial conversation title (e.g. "Order #1042 Refund") |
| `metadata` | `object` | No | Custom JSON metadata |

```json
{
  "agentId": "ag_89f02b14-c321-4def-91a2-3f4e5a6b7c8d",
  "title": "Inbound Invoicing Inquiry",
  "metadata": { "channel": "dashboard" }
}
```

### Response Body (`201 Created`)
```json
{
  "id": "conv_9a8b7c6d-1234-4567-89ab-cdef01234567",
  "title": "Inbound Invoicing Inquiry",
  "status": "ACTIVE",
  "metadata": { "channel": "dashboard" },
  "agentId": "ag_89f02b14-c321-4def-91a2-3f4e5a6b7c8d",
  "userId": "c1f7a40b-7128-4444-9351-a90d98fa6a8b",
  "organizationId": null,
  "createdAt": "2026-08-16T12:00:00.000Z",
  "updatedAt": "2026-08-16T12:00:00.000Z",
  "deletedAt": null
}
```

---

## 2. List Conversations

Lists conversations filtered by agent, user, or status.

- **Method**: `GET`
- **Path**: `/conversations`
- **Authentication**: `Bearer <accessToken>`

### Query Parameters
| Parameter | Type | Required | Description |
|---|---|---|---|
| `agentId` | `string` | No | Filter by specific AI Employee |
| `status` | `string` | No | `ACTIVE`, `RESOLVED`, `ARCHIVED` |
| `skip` | `number` | No | Offset for pagination (default `0`) |
| `take` | `number` | No | Number of threads to return (default `20`) |

### Response Body (`200 OK`)
```json
[
  {
    "id": "conv_9a8b7c6d-1234-4567-89ab-cdef01234567",
    "title": "Inbound Invoicing Inquiry",
    "status": "ACTIVE",
    "metadata": { "channel": "dashboard" },
    "agentId": "ag_89f02b14-c321-4def-91a2-3f4e5a6b7c8d",
    "userId": "c1f7a40b-7128-4444-9351-a90d98fa6a8b",
    "organizationId": null,
    "createdAt": "2026-08-16T12:00:00.000Z",
    "updatedAt": "2026-08-16T12:05:00.000Z",
    "deletedAt": null
  }
]
```

---

## 3. Get Conversation Details

Retrieves conversation metadata by ID.

- **Method**: `GET`
- **Path**: `/conversations/:id`
- **Authentication**: `Bearer <accessToken>`

### Response Body (`200 OK`)
```json
{
  "id": "conv_9a8b7c6d-1234-4567-89ab-cdef01234567",
  "title": "Inbound Invoicing Inquiry",
  "status": "ACTIVE",
  "agentId": "ag_89f02b14-c321-4def-91a2-3f4e5a6b7c8d",
  "userId": "c1f7a40b-7128-4444-9351-a90d98fa6a8b",
  "organizationId": null,
  "createdAt": "2026-08-16T12:00:00.000Z",
  "updatedAt": "2026-08-16T12:05:00.000Z",
  "deletedAt": null
}
```

---

## 4. Get Conversation Messages

Fetches the chronological message history for a specific conversation thread.

- **Method**: `GET`
- **Path**: `/conversations/:id/messages`
- **Authentication**: `Bearer <accessToken>`

### Query Parameters
| Parameter | Type | Required | Description |
|---|---|---|---|
| `skip` | `number` | No | Offset for pagination |
| `take` | `number` | No | Number of messages to return |

### Response Body (`200 OK`)
```json
[
  {
    "id": "msg_01j4k8...",
    "conversationId": "conv_9a8b7c6d-1234-4567-89ab-cdef01234567",
    "role": "user",
    "content": "Can you check invoice #INV-9281?",
    "metadata": null,
    "createdAt": "2026-08-16T12:00:01.000Z",
    "updatedAt": "2026-08-16T12:00:01.000Z",
    "deletedAt": null
  },
  {
    "id": "msg_01j4k9...",
    "conversationId": "conv_9a8b7c6d-1234-4567-89ab-cdef01234567",
    "role": "assistant",
    "content": "I looked up invoice #INV-9281. It was paid on Aug 12 via Stripe.",
    "metadata": { "model": "gpt-4o", "tokens": 92 },
    "createdAt": "2026-08-16T12:00:03.000Z",
    "updatedAt": "2026-08-16T12:00:03.000Z",
    "deletedAt": null
  }
]
```

---

## 5. Append Message to Thread

Appends a new message directly to the conversation history.

- **Method**: `POST`
- **Path**: `/conversations/:id/messages`
- **Authentication**: `Bearer <accessToken>`

### Request Body
| Field | Type | Required | Description |
|---|---|---|---|
| `role` | `string` | **Yes** | `"user"` \| `"assistant"` \| `"system"` |
| `content` | `string` | **Yes** | Message text |
| `metadata` | `object` | No | Additional custom metadata |

```json
{
  "role": "user",
  "content": "Thank you for the quick help!"
}
```

### Response Body (`201 Created`)
```json
{
  "id": "msg_01j4k99...",
  "conversationId": "conv_9a8b7c6d-1234-4567-89ab-cdef01234567",
  "role": "user",
  "content": "Thank you for the quick help!",
  "metadata": null,
  "createdAt": "2026-08-16T12:05:00.000Z",
  "updatedAt": "2026-08-16T12:05:00.000Z",
  "deletedAt": null
}
```

---

## 6. Update Conversation Title

Renames a conversation thread.

- **Method**: `PATCH`
- **Path**: `/conversations/:id`
- **Authentication**: `Bearer <accessToken>`

### Request Body
```json
{
  "title": "Refund verification for Jane"
}
```

### Response Body (`200 OK`)
```json
{
  "id": "conv_9a8b7c6d-1234-4567-89ab-cdef01234567",
  "title": "Refund verification for Jane",
  "updatedAt": "2026-08-16T12:06:00.000Z"
}
```

---

## 7. Resolve Conversation

Marks a conversation thread as `RESOLVED`.

- **Method**: `POST`
- **Path**: `/conversations/:id/resolve`
- **Authentication**: `Bearer <accessToken>`

### Response Body (`200 OK`)
```json
{
  "id": "conv_9a8b7c6d-1234-4567-89ab-cdef01234567",
  "status": "RESOLVED",
  "updatedAt": "2026-08-16T12:07:00.000Z"
}
```

---

## 8. Archive Conversation

Marks a conversation thread as `ARCHIVED`.

- **Method**: `POST`
- **Path**: `/conversations/:id/archive`
- **Authentication**: `Bearer <accessToken>`

### Response Body (`200 OK`)
```json
{
  "id": "conv_9a8b7c6d-1234-4567-89ab-cdef01234567",
  "status": "ARCHIVED",
  "updatedAt": "2026-08-16T12:08:00.000Z"
}
```

---

## 9. Delete Conversation (Soft Delete)

Soft deletes a conversation thread.

- **Method**: `DELETE`
- **Path**: `/conversations/:id`
- **Authentication**: `Bearer <accessToken>`

### Response Body (`200 OK`)
```json
{
  "id": "conv_9a8b7c6d-1234-4567-89ab-cdef01234567",
  "deletedAt": "2026-08-16T12:09:00.000Z"
}
```

---

## 10. Frontend Integration Snippet (TypeScript)

```typescript
import { api, buildQuery } from "@/lib/api/client";
import type { Conversation, CreateConversationInput, Message } from "@/lib/api/types";

// List conversations for an agent
export async function getConversations(params?: { agentId?: string; status?: string; skip?: number; take?: number }): Promise<Conversation[]> {
  const qs = buildQuery(params);
  return api.get<Conversation[]>(`/conversations${qs}`);
}

// Get message history
export async function getMessages(conversationId: string, params?: { skip?: number; take?: number }): Promise<Message[]> {
  const qs = buildQuery(params);
  return api.get<Message[]>(`/conversations/${conversationId}/messages${qs}`);
}

// Create new thread
export async function createConversation(data: CreateConversationInput): Promise<Conversation> {
  return api.post<Conversation>("/conversations", data);
}

// Rename thread
export async function updateConversationTitle(id: string, title: string): Promise<Conversation> {
  return api.patch<Conversation>(`/conversations/${id}`, { title });
}

// Resolve thread
export async function resolveConversation(id: string): Promise<Conversation> {
  return api.post<Conversation>(`/conversations/${id}/resolve`);
}
```
