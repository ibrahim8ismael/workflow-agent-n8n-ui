# AI Employees (Agents) APIs

> Module: `AgentsModule` · Controller Path: `/agents` · Base URL Prefix: `/api/v1`

---

## Overview

In Woops, an **Agent** represents a digital AI Employee (such as a Support Specialist, Sales Representative, Recruiter, or Ops Coordinator).

Each AI Employee has:
- **Profile & Persona**: Name, description, system prompt instructions, personality tone, LLM model.
- **Status Lifecycle**: `DRAFT` ➔ `PUBLISHED` / `ACTIVE` ➔ `PAUSED` ➔ `ARCHIVED`.
- **Attached Skills**: Tools and workflows the employee is permitted to execute.
- **Knowledge & Memory**: Tied into pgvector semantic search and long-term memory.

---

## 1. Create AI Employee (Agent)

Creates a new AI Employee record. Can be created directly via API or finalized from an employee design onboarding run.

- **Method**: `POST`
- **Path**: `/agents`
- **Authentication**: `Bearer <accessToken>` (`JwtAuthGuard` + `TenantAccessGuard`)

### Request Body
| Field | Type | Required | Default | Validation / Values |
|---|---|---|---|---|
| `name` | `string` | **Yes** | — | Min 1, Max 255 chars (e.g. "Layla - Support Lead") |
| `description` | `string` | No | `null` | Summary of the employee's role and duties |
| `instructions` | `string` | No | `null` | System prompt instructions and SOP guidance |
| `personality` | `string` | No | `null` | Tone of voice (e.g. "Professional, empathetic, concise") |
| `model` | `string` | No | `"gpt-4o"` | LLM model identifier (e.g. `"gpt-4o"`, `"claude-3-5-sonnet"`) |
| `status` | `string` | No | `"DRAFT"` | `"DRAFT"`, `"PUBLISHED"`, `"ACTIVE"`, `"PAUSED"`, `"ARCHIVED"`, `"ERROR"` |

```json
{
  "name": "Layla - Customer Support Specialist",
  "description": "Handles inbound billing questions, product FAQs, and ticket escalations in English and Arabic.",
  "instructions": "You are Layla, a helpful and empathetic support agent. Always verify order numbers and escalate billing disputes over $500.",
  "personality": "Friendly, professional, patient, and bilingual.",
  "model": "gpt-4o",
  "status": "DRAFT"
}
```

### Response Body (`201 Created`)
```json
{
  "id": "ag_89f02b14-c321-4def-91a2-3f4e5a6b7c8d",
  "name": "Layla - Customer Support Specialist",
  "description": "Handles inbound billing questions, product FAQs, and ticket escalations in English and Arabic.",
  "instructions": "You are Layla, a helpful and empathetic support agent. Always verify order numbers and escalate billing disputes over $500.",
  "personality": "Friendly, professional, patient, and bilingual.",
  "model": "gpt-4o",
  "status": "DRAFT",
  "userId": "c1f7a40b-7128-4444-9351-a90d98fa6a8b",
  "organizationId": null,
  "createdAt": "2026-08-16T12:30:00.000Z",
  "updatedAt": "2026-08-16T12:30:00.000Z",
  "deletedAt": null
}
```

---

## 2. List AI Employees

Lists all AI employees belonging to the current user or active organization context.

- **Method**: `GET`
- **Path**: `/agents`
- **Authentication**: `Bearer <accessToken>` (`JwtAuthGuard` + `TenantAccessGuard`)

### Query Parameters
| Parameter | Type | Required | Description |
|---|---|---|---|
| `status` | `string` | No | Filter by status: `DRAFT`, `PUBLISHED`, `ACTIVE`, `ARCHIVED` |
| `skip` | `number` | No | Offset for pagination (default `0`) |
| `take` | `number` | No | Number of items to return (default `20`, max `100`) |
| `organizationId` | `string` | No | Filter by organization ID |

### Response Body (`200 OK`)
```json
[
  {
    "id": "ag_89f02b14-c321-4def-91a2-3f4e5a6b7c8d",
    "name": "Layla - Customer Support Specialist",
    "description": "Handles inbound billing questions and FAQs.",
    "instructions": "You are Layla...",
    "personality": "Friendly and professional",
    "model": "gpt-4o",
    "status": "PUBLISHED",
    "userId": "c1f7a40b-7128-4444-9351-a90d98fa6a8b",
    "organizationId": null,
    "createdAt": "2026-08-10T09:00:00.000Z",
    "updatedAt": "2026-08-16T12:00:00.000Z",
    "deletedAt": null
  }
]
```

---

## 3. Get AI Employee by ID

Retrieves full details of a specific AI employee including its relations.

- **Method**: `GET`
- **Path**: `/agents/:id`
- **Authentication**: `Bearer <accessToken>` (`JwtAuthGuard` + `TenantAccessGuard`)

### URL Parameters
| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | **Yes** | ID of the agent |

### Response Body (`200 OK`)
```json
{
  "id": "ag_89f02b14-c321-4def-91a2-3f4e5a6b7c8d",
  "name": "Layla - Customer Support Specialist",
  "description": "Handles inbound billing questions and FAQs.",
  "instructions": "You are Layla...",
  "personality": "Friendly and professional",
  "model": "gpt-4o",
  "status": "PUBLISHED",
  "userId": "c1f7a40b-7128-4444-9351-a90d98fa6a8b",
  "organizationId": null,
  "createdAt": "2026-08-10T09:00:00.000Z",
  "updatedAt": "2026-08-16T12:00:00.000Z",
  "deletedAt": null
}
```

---

## 4. Update AI Employee

Modifies properties of an existing AI Employee.

- **Method**: `PATCH`
- **Path**: `/agents/:id`
- **Authentication**: `Bearer <accessToken>` (`JwtAuthGuard` + `TenantAccessGuard`)

### Request Body
| Field | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | No | Updated display name |
| `description` | `string` | No | Updated description |
| `instructions` | `string` | No | Updated system prompt |
| `personality` | `string` | No | Updated tone of voice |
| `model` | `string` | No | Updated LLM model |
| `status` | `string` | No | Updated status enum |

```json
{
  "personality": "Calm, concise, highly analytical.",
  "model": "gpt-4o"
}
```

### Response Body (`200 OK`)
```json
{
  "id": "ag_89f02b14-c321-4def-91a2-3f4e5a6b7c8d",
  "name": "Layla - Customer Support Specialist",
  "personality": "Calm, concise, highly analytical.",
  "model": "gpt-4o",
  "status": "PUBLISHED",
  "updatedAt": "2026-08-16T12:40:00.000Z"
}
```

---

## 5. Publish / Deploy Employee

Transitions an AI Employee from `DRAFT` or `PAUSED` into `PUBLISHED` status so it can be deployed on live channels.

- **Method**: `POST`
- **Path**: `/agents/:id/publish`
- **Authentication**: `Bearer <accessToken>` (`JwtAuthGuard` + `TenantAccessGuard`)

### Response Body (`200 OK`)
```json
{
  "id": "ag_89f02b14-c321-4def-91a2-3f4e5a6b7c8d",
  "status": "PUBLISHED",
  "updatedAt": "2026-08-16T12:41:00.000Z"
}
```

---

## 6. Archive Employee

Transitions an AI Employee into `ARCHIVED` status (deactivating active channel hooks without losing history).

- **Method**: `POST`
- **Path**: `/agents/:id/archive`
- **Authentication**: `Bearer <accessToken>` (`JwtAuthGuard` + `TenantAccessGuard`)

### Response Body (`200 OK`)
```json
{
  "id": "ag_89f02b14-c321-4def-91a2-3f4e5a6b7c8d",
  "status": "ARCHIVED",
  "updatedAt": "2026-08-16T12:42:00.000Z"
}
```

---

## 7. Delete AI Employee (Soft Delete)

Soft deletes the AI Employee record.

- **Method**: `DELETE`
- **Path**: `/agents/:id`
- **Authentication**: `Bearer <accessToken>` (`JwtAuthGuard` + `TenantAccessGuard`)

### Response Body (`200 OK`)
```json
{
  "id": "ag_89f02b14-c321-4def-91a2-3f4e5a6b7c8d",
  "deletedAt": "2026-08-16T12:43:00.000Z"
}
```

---

## 8. Skills Management for AI Employees

### 8.1 List Attached Skills
- **Method**: `GET`
- **Path**: `/agents/:id/skills`
- **Response**: Array of `AgentSkill` objects with the underlying `Skill` entity details.

### 8.2 Attach Skill to Agent
- **Method**: `POST`
- **Path**: `/agents/:id/skills/:skillId`
- **Response**: `200 OK` / `201 Created`

### 8.3 Detach Skill from Agent
- **Method**: `DELETE`
- **Path**: `/agents/:id/skills/:skillId`
- **Response**: `200 OK`

---

## 9. Frontend Integration Snippet (TypeScript)

```typescript
import { api, buildQuery } from "@/lib/api/client";
import type { Agent, CreateAgentInput, UpdateAgentInput } from "@/lib/api/types";

// List agents
export async function getAgents(params?: { status?: string; skip?: number; take?: number }): Promise<Agent[]> {
  const qs = buildQuery(params);
  return api.get<Agent[]>(`/agents${qs}`);
}

// Get agent by ID
export async function getAgent(id: string): Promise<Agent> {
  return api.get<Agent>(`/agents/${id}`);
}

// Create agent
export async function createAgent(data: CreateAgentInput): Promise<Agent> {
  return api.post<Agent>("/agents", data);
}

// Update agent
export async function updateAgent(id: string, data: UpdateAgentInput): Promise<Agent> {
  return api.patch<Agent>(`/agents/${id}`, data);
}

// Publish agent
export async function publishAgent(id: string): Promise<Agent> {
  return api.post<Agent>(`/agents/${id}/publish`);
}

// Archive agent
export async function archiveAgent(id: string): Promise<Agent> {
  return api.post<Agent>(`/agents/${id}/archive`);
}

// Delete agent
export async function deleteAgent(id: string): Promise<Agent> {
  return api.delete<Agent>(`/agents/${id}`);
}
```
