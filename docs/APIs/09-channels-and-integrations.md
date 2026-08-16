# Channels & Integrations APIs

> Modules: `ChannelsModule`, `IntegrationsModule` · Controllers: `/channels`, `/integrations` · Base URL Prefix: `/api/v1`

---

## Overview

- **Channels** define **where** an AI Employee communicates (e.g. Website Chat Widget, WhatsApp, Telegram, Slack, Email).
- **Integrations** define **what third-party tools and services** are connected (e.g. Stripe, HubSpot, Google Calendar, Zendesk, Postgres).

---

## Part 1: Channels APIs

### Channel Types (`ChannelType`)
`WIDGET` · `WHATSAPP` · `MESSENGER` · `INSTAGRAM` · `TELEGRAM` · `EMAIL` · `SLACK` · `DISCORD` · `API`

---

### 1. Connect Channel to Agent

Connects a communication channel to an AI Employee.

- **Method**: `POST`
- **Path**: `/channels`
- **Authentication**: `Bearer <accessToken>`

#### Request Body
| Field | Type | Required | Description |
|---|---|---|---|
| `agentId` | `string` | **Yes** | Target AI Employee ID |
| `type` | `string` | **Yes** | Channel enum (e.g. `"WIDGET"`, `"WHATSAPP"`, `"TELEGRAM"`) |
| `name` | `string` | No | Optional channel label |

```json
{
  "agentId": "ag_89f02b14-c321-4def-91a2-3f4e5a6b7c8d",
  "type": "WHATSAPP",
  "name": "Customer Care Line"
}
```

#### Response Body (`201 Created`)
```json
{
  "id": "chn_12a34b56-78c9-40de-f123-456789abcdef",
  "agentId": "ag_89f02b14-c321-4def-91a2-3f4e5a6b7c8d",
  "type": "WHATSAPP",
  "name": "Customer Care Line",
  "status": "ACTIVE",
  "createdAt": "2026-08-16T12:00:00.000Z",
  "updatedAt": "2026-08-16T12:00:00.000Z",
  "deletedAt": null
}
```

---

### 2. List Channels for an Agent

- **Method**: `GET`
- **Path**: `/channels/agent/:agentId`
- **Authentication**: `Bearer <accessToken>`

#### Response Body (`200 OK`)
```json
[
  {
    "id": "chn_12a34b56-78c9-40de-f123-456789abcdef",
    "agentId": "ag_89f02b14-c321-4def-91a2-3f4e5a6b7c8d",
    "type": "WHATSAPP",
    "name": "Customer Care Line",
    "status": "ACTIVE",
    "createdAt": "2026-08-16T12:00:00.000Z"
  }
]
```

---

### 3. Check Channel Availability

Checks whether a channel type is already connected or available for configuration.

- **Method**: `GET`
- **Path**: `/channels/:agentId/check/:type`
- **Authentication**: `Bearer <accessToken>`

#### Response Body (`200 OK`)
```json
{
  "available": true
}
```

---

### 4. Disconnect Channel

- **Method**: `DELETE`
- **Path**: `/channels/:id`
- **Authentication**: `Bearer <accessToken>`

---

## Part 2: Integrations APIs

### Integration Categories (`IntegrationCategory`)
`AI` · `COMMUNICATION` · `CRM` · `PAYMENT` · `ANALYTICS` · `STORAGE` · `OTHER`

---

### 1. Connect Integration

Connects an external service for an organization.

- **Method**: `POST`
- **Path**: `/integrations`
- **Authentication**: `Bearer <accessToken>`

#### Request Body
| Field | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | **Yes** | Integration display name |
| `category` | `string` | **Yes** | `CRM`, `PAYMENT`, `COMMUNICATION`, etc. |
| `provider` | `string` | **Yes** | Provider slug (e.g. `stripe`, `hubspot`, `gmail`) |
| `config` | `object` | No | Public configuration parameters |
| `organizationId` | `string` | No | Owning organization ID |

```json
{
  "name": "Company Stripe Account",
  "category": "PAYMENT",
  "provider": "stripe",
  "config": {
    "currency": "USD",
    "webhookEnabled": true
  }
}
```

#### Response Body (`201 Created`)
```json
{
  "id": "int_778899aa-bbcc-ddee-ff00-112233445566",
  "name": "Company Stripe Account",
  "category": "PAYMENT",
  "provider": "stripe",
  "status": "CONNECTED",
  "config": { "currency": "USD", "webhookEnabled": true },
  "userId": "c1f7a40b-7128-4444-9351-a90d98fa6a8b",
  "organizationId": null,
  "createdAt": "2026-08-16T12:00:00.000Z",
  "updatedAt": "2026-08-16T12:00:00.000Z",
  "deletedAt": null
}
```

---

### 2. List Integrations by Organization

- **Method**: `GET`
- **Path**: `/integrations/organization/:organizationId`
- **Authentication**: `Bearer <accessToken>`

#### Response Body (`200 OK`)
```json
[
  {
    "id": "int_778899aa-bbcc-ddee-ff00-112233445566",
    "name": "Company Stripe Account",
    "category": "PAYMENT",
    "provider": "stripe",
    "status": "CONNECTED",
    "createdAt": "2026-08-16T12:00:00.000Z"
  }
]
```

---

### 3. Check Provider Connection Status

Checks if a specific provider is connected and active for an organization.

- **Method**: `GET`
- **Path**: `/integrations/:organizationId/check/:provider`
- **Authentication**: `Bearer <accessToken>`

#### Response Body (`200 OK`)
```json
{
  "connected": true
}
```

---

### 4. Disconnect Integration

- **Method**: `DELETE`
- **Path**: `/integrations/:id`
- **Authentication**: `Bearer <accessToken>`

---

## 3. Frontend Integration Snippet (TypeScript)

```typescript
import { api } from "@/lib/api/client";
import type { Channel, ChannelType, Integration } from "@/lib/api/types";

// Channels
export async function getChannels(agentId: string): Promise<Channel[]> {
  return api.get<Channel[]>(`/channels/agent/${agentId}`);
}

export async function createChannel(agentId: string, type: ChannelType, name?: string): Promise<Channel> {
  return api.post<Channel>("/channels", { agentId, type, name });
}

export async function deleteChannel(id: string): Promise<Channel> {
  return api.delete<Channel>(`/channels/${id}`);
}

// Integrations
export async function getIntegrations(organizationId: string): Promise<Integration[]> {
  return api.get<Integration[]>(`/integrations/organization/${organizationId}`);
}

export async function checkIntegrationConnected(organizationId: string, provider: string): Promise<boolean> {
  const res = await api.get<{ connected: boolean }>(`/integrations/${organizationId}/check/${provider}`);
  return res.connected;
}

export async function deleteIntegration(id: string): Promise<Integration> {
  return api.delete<Integration>(`/integrations/${id}`);
}
```
