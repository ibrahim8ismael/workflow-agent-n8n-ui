# Skills & Capabilities APIs

> Module: `SkillsModule` · Controller Path: `/skills` · Base URL Prefix: `/api/v1`

---

## Overview

In Woops, **Skills** represent modular capabilities, tools, and workflows that can be assigned to AI Employees. Without skills, an employee can only chat; with skills, an employee can query databases, create tickets, execute n8n workflows, trigger webhooks, search vector knowledge, and ask for human approval.

### Execution Modes (`SkillExecutionMode`)

| Execution Mode | Description |
|---|---|
| `AI_ONLY` | Pure LLM reasoning with custom system instructions. |
| `N8N_WORKFLOW` | Triggers an n8n or external workflow webhook with input parameters. |
| `KNOWLEDGE_RETRIEVAL` | Queries pgvector knowledge base chunks. |
| `MEMORY_RETRIEVAL` | Queries the long-term memory store. |
| `HYBRID` | Combination of workflow execution and AI synthesis. |
| `HUMAN_APPROVAL` | High-risk skill that pauses execution and requires human confirmation. |

---

## 1. Create Skill

Defines a new skill capability.

- **Method**: `POST`
- **Path**: `/skills`
- **Authentication**: `Bearer <accessToken>` (`JwtAuthGuard` + `TenantAccessGuard`)

### Request Body
| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `name` | `string` | **Yes** | — | Display name (e.g. "Stripe Refund Processor") |
| `slug` | `string` | **Yes** | — | Unique identifier slug (e.g. `stripe-refund-processor`) |
| `description` | `string` | No | `null` | Summary of what the skill does |
| `category` | `string` | No | `null` | Category (e.g. `PAYMENT`, `CRM`, `COMMUNICATION`) |
| `executionMode` | `string` | No | `"AI_ONLY"` | `AI_ONLY`, `N8N_WORKFLOW`, `KNOWLEDGE_RETRIEVAL`, `MEMORY_RETRIEVAL`, `HYBRID`, `HUMAN_APPROVAL` |
| `inputSchema` | `object` | No | `null` | JSON Schema for skill input parameters |
| `outputSchema` | `object` | No | `null` | JSON Schema for skill output parameters |
| `instructions` | `string` | No | `null` | Prompt guidance for the LLM when invoking this skill |
| `timeout` | `number` | No | `null` | Execution timeout in milliseconds |
| `retryPolicy` | `object` | No | `null` | Retry strategy configuration |
| `successCriteria`| `object` | No | `null` | Criteria validation definition |
| `metadata` | `object` | No | `null` | Extra metadata |

```json
{
  "name": "Refund Customer via Stripe",
  "slug": "stripe-refund-customer",
  "description": "Issues a full or partial refund to a customer in Stripe.",
  "category": "PAYMENT",
  "executionMode": "N8N_WORKFLOW",
  "inputSchema": {
    "type": "object",
    "required": ["chargeId", "amountUsd"],
    "properties": {
      "chargeId": { "type": "string", "description": "Stripe charge ID (ch_...)" },
      "amountUsd": { "type": "number", "description": "Amount in USD" }
    }
  },
  "timeout": 15000
}
```

### Response Body (`201 Created`)
```json
{
  "id": "sk_4fa912bc-9012-4def-b123-abcdef012345",
  "name": "Refund Customer via Stripe",
  "slug": "stripe-refund-customer",
  "description": "Issues a full or partial refund to a customer in Stripe.",
  "category": "PAYMENT",
  "version": 1,
  "executionMode": "N8N_WORKFLOW",
  "status": "DRAFT",
  "visibility": "PRIVATE",
  "inputSchema": {
    "type": "object",
    "required": ["chargeId", "amountUsd"],
    "properties": {
      "chargeId": { "type": "string" },
      "amountUsd": { "type": "number" }
    }
  },
  "outputSchema": null,
  "instructions": null,
  "timeout": 15000,
  "retryPolicy": null,
  "successCriteria": null,
  "metadata": null,
  "userId": "c1f7a40b-7128-4444-9351-a90d98fa6a8b",
  "organizationId": null,
  "createdAt": "2026-08-16T12:00:00.000Z",
  "updatedAt": "2026-08-16T12:00:00.000Z",
  "deletedAt": null
}
```

---

## 2. List Skills

Lists skills available to the current user or active organization.

- **Method**: `GET`
- **Path**: `/skills`
- **Authentication**: `Bearer <accessToken>` (`JwtAuthGuard` + `TenantAccessGuard`)

### Query Parameters
| Parameter | Type | Required | Description |
|---|---|---|---|
| `skip` | `number` | No | Offset for pagination |
| `take` | `number` | No | Number of skills to return |

### Response Body (`200 OK`)
```json
[
  {
    "id": "sk_4fa912bc-9012-4def-b123-abcdef012345",
    "name": "Refund Customer via Stripe",
    "slug": "stripe-refund-customer",
    "category": "PAYMENT",
    "executionMode": "N8N_WORKFLOW",
    "status": "PUBLISHED",
    "visibility": "PRIVATE",
    "createdAt": "2026-08-16T12:00:00.000Z",
    "updatedAt": "2026-08-16T12:00:00.000Z"
  }
]
```

---

## 3. Get Skill by ID

- **Method**: `GET`
- **Path**: `/skills/:id`
- **Authentication**: `Bearer <accessToken>` (`JwtAuthGuard` + `TenantAccessGuard`)

### Response Body (`200 OK`)
```json
{
  "id": "sk_4fa912bc-9012-4def-b123-abcdef012345",
  "name": "Refund Customer via Stripe",
  "slug": "stripe-refund-customer",
  "description": "Issues a full or partial refund to a customer in Stripe.",
  "category": "PAYMENT",
  "executionMode": "N8N_WORKFLOW",
  "status": "PUBLISHED",
  "inputSchema": { "type": "object" },
  "createdAt": "2026-08-16T12:00:00.000Z",
  "updatedAt": "2026-08-16T12:00:00.000Z"
}
```

---

## 4. Update Skill

- **Method**: `PATCH`
- **Path**: `/skills/:id`
- **Authentication**: `Bearer <accessToken>` (`JwtAuthGuard` + `TenantAccessGuard`)

### Request Body
```json
{
  "timeout": 30000,
  "description": "Updated refund processor with 30s timeout"
}
```

### Response Body (`200 OK`)
```json
{
  "id": "sk_4fa912bc-9012-4def-b123-abcdef012345",
  "timeout": 30000,
  "description": "Updated refund processor with 30s timeout",
  "updatedAt": "2026-08-16T12:10:00.000Z"
}
```

---

## 5. Publish Skill

Transitions skill status to `PUBLISHED`.

- **Method**: `POST`
- **Path**: `/skills/:id/publish`
- **Authentication**: `Bearer <accessToken>` (`JwtAuthGuard` + `TenantAccessGuard`)

---

## 6. Archive Skill

Transitions skill status to `ARCHIVED`.

- **Method**: `POST`
- **Path**: `/skills/:id/archive`
- **Authentication**: `Bearer <accessToken>` (`JwtAuthGuard` + `TenantAccessGuard`)

---

## 7. Delete Skill (Soft Delete)

- **Method**: `DELETE`
- **Path**: `/skills/:id`
- **Authentication**: `Bearer <accessToken>` (`JwtAuthGuard` + `TenantAccessGuard`)

---

## 8. Frontend Integration Snippet (TypeScript)

```typescript
import { api, buildQuery } from "@/lib/api/client";
import type { Skill } from "@/lib/api/types";

export async function getSkills(params?: { skip?: number; take?: number }): Promise<Skill[]> {
  const qs = buildQuery(params);
  return api.get<Skill[]>(`/skills${qs}`);
}

export async function getSkill(id: string): Promise<Skill> {
  return api.get<Skill>(`/skills/${id}`);
}

export async function createSkill(data: Partial<Skill>): Promise<Skill> {
  return api.post<Skill>("/skills", data);
}

export async function updateSkill(id: string, data: Partial<Skill>): Promise<Skill> {
  return api.patch<Skill>(`/skills/${id}`, data);
}

export async function deleteSkill(id: string): Promise<Skill> {
  return api.delete<Skill>(`/skills/${id}`);
}
```
