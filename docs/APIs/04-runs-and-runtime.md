# Execution Runtime & Streaming APIs (Jaafar Engine)

> Module: `RuntimeModule` · Controller Path: `/runs` · Base URL Prefix: `/api/v1`

---

## Overview

The **Jaafar Runtime Engine** orchestrates conversational reasoning, employee blueprint generation, tool execution, LangGraph workflows, human-in-the-loop approvals, and token streaming.

### Execution Modes
1. **`conversation`**: General and agent-grounded conversation with knowledge retrieval and memory awareness. Supports real-time token streaming.
2. **`employee_design`**: Interactive onboarding mode where Jaafar analyzes the user's business description and generates a complete digital employee blueprint (roles, SOP instructions, tools, channels).
3. **`execution`**: Autonomous task execution with tool calling, workflow triggers, and approval checkpoints.

### Effort Levels
- `"low"`: Fast, concise responses using lighter reasoning.
- `"medium"` (Default): Balanced reasoning and tool verification.
- `"high"`: Deep multi-step reasoning, extensive planning, and strict verification.

---

## 1. Execute Run (Synchronous / Polling)

Executes a prompt against an agent and returns the complete result once finished.

- **Method**: `POST`
- **Path**: `/runs`
- **Authentication**: `Bearer <accessToken>` (`JwtAuthGuard` + `TenantAccessGuard`)

### Request Body
| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `agentId` | `string` | **Yes** | — | ID of the agent to execute against |
| `userMessage` | `string` | **Yes** | — | User prompt or instructions |
| `mode` | `string` | No | `"conversation"` | `"conversation"`, `"employee_design"`, `"execution"` |
| `conversationId` | `string` | No | Auto-generated | Existing thread ID (if omitted, creates new "New chat") |
| `effort` | `string` | No | `"medium"` | `"low"`, `"medium"`, `"high"` |

```json
{
  "agentId": "ag_89f02b14-c321-4def-91a2-3f4e5a6b7c8d",
  "userMessage": "Summarize our refund policy for customer tickets.",
  "mode": "conversation",
  "effort": "medium"
}
```

### Response Body (`202 Accepted`)
```json
{
  "runId": "run_01j4k9m3n8...",
  "conversationId": "conv_9a8b7c6d-1234-4567-89ab-cdef01234567",
  "mode": "conversation",
  "status": "COMPLETED",
  "response": "Our refund policy allows full refunds within 30 days of purchase for unused subscriptions...",
  "usage": {
    "promptTokens": 142,
    "completionTokens": 58,
    "totalTokens": 200,
    "estimatedCost": 0.0004
  }
}
```

---

## 2. Stream Run via Server-Sent Events (SSE)

Streams the execution lifecycle in real-time over an SSE connection (`text/event-stream`), delivering token chunks, graph node progression, tool executions, and completion metadata.

- **Method**: `POST`
- **Path**: `/runs/stream`
- **Authentication**: `Bearer <accessToken>` (`JwtAuthGuard` + `TenantAccessGuard`)
- **Supported Modes**: `conversation`, `execution`

### Request Headers
```http
Accept: text/event-stream
Content-Type: application/json
Authorization: Bearer <accessToken>
```

### Request Body
*Identical to `POST /runs`.*

### Response Headers
```http
HTTP/1.1 200 OK
Content-Type: text/event-stream; charset=utf-8
Cache-Control: no-cache, no-transform
Connection: keep-alive
```

### SSE Event Stream Protocol

Each frame is emitted in the standard SSE format:
```http
event: <eventType>
data: <JSON string>

```

#### Stream Event Types

| Event Type | Payload Fields | Description |
|---|---|---|
| `run.started` | `{ status: "CREATED" }` | Run instance created and initialized |
| `graph.node.started` | `{ node: string }` | Execution entered graph node (e.g. `classify`, `retrieve`, `generate`) |
| `graph.node.completed` | `{ node: string, durationMs: number }` | Graph node finished execution |
| `plan.created` | `{ stepCount: number, requiresApproval: boolean }` | Multi-step execution plan synthesized |
| `token` | `{ content: string }` | Streamed text token chunk for real-time typewriter UI |
| `tool.started` | `{ callId: string, toolName: string }` | Tool execution initiated (e.g. `pgvector_search`, `n8n_trigger`) |
| `tool.completed` | `{ callId: string, toolName: string, durationMs: number }` | Tool returned data |
| `tool.failed` | `{ callId: string, toolName: string, error: RuntimeError }` | Tool execution encountered an error |
| `approval.required` | `{ reason: string }` | Execution paused waiting for human approval |
| `run.waiting` | `{ reason: "clarification" \| "approval" }` | Run paused waiting for user clarification or approval |
| `run.completed` | `{ response: string, usage: RuntimeUsage }` | Execution successfully completed |
| `run.failed` | `{ error: { code: string, message: string, retryable: boolean } }` | Execution encountered terminal failure |
| `run.cancelled` | `{ reason?: string }` | Run cancelled (client disconnected or aborted) |

#### Example SSE Stream Frame
```http
event: token
data: {"type":"token","runId":"run_01j4k9m3n8","occurredAt":"2026-08-16T12:00:01.120Z","payload":{"content":"Refunds "}}

event: token
data: {"type":"token","runId":"run_01j4k9m3n8","occurredAt":"2026-08-16T12:00:01.150Z","payload":{"content":"are processed "}}

event: run.completed
data: {"type":"run.completed","runId":"run_01j4k9m3n8","occurredAt":"2026-08-16T12:00:02.000Z","payload":{"response":"Refunds are processed within 3-5 business days.","usage":{"promptTokens":120,"completionTokens":15,"totalTokens":135}}}
```

### Cancellation on Disconnect
If the user closes the browser tab or aborts the `fetch()` via `AbortController`, the server automatically catches the socket termination and cancels the in-flight run.

---

## 3. Get Run Details by ID

Polls or retrieves the persisted status, token usage, logs, and outputs of any run.

- **Method**: `GET`
- **Path**: `/runs/:id`
- **Authentication**: `Bearer <accessToken>` (`JwtAuthGuard` + `TenantAccessGuard`)

### Response Body (`200 OK`)
```json
{
  "id": "run_01j4k9m3n8...",
  "agentId": "ag_89f02b14-c321-4def-91a2-3f4e5a6b7c8d",
  "conversationId": "conv_9a8b7c6d-1234-4567-89ab-cdef01234567",
  "userId": "c1f7a40b-7128-4444-9351-a90d98fa6a8b",
  "organizationId": null,
  "status": "COMPLETED",
  "plan": null,
  "result": "Refunds are processed within 3-5 business days.",
  "error": null,
  "metadata": {
    "runtimeMode": "conversation",
    "userMessage": "Summarize our refund policy for customer tickets."
  },
  "startedAt": "2026-08-16T12:00:00.000Z",
  "completedAt": "2026-08-16T12:00:02.000Z",
  "promptTokens": 120,
  "completionTokens": 15,
  "totalTokens": 135,
  "estimatedCost": "0.00027",
  "durationMs": 2000,
  "createdAt": "2026-08-16T12:00:00.000Z",
  "updatedAt": "2026-08-16T12:00:02.000Z"
}
```

---

## 4. Approve Paused Execution Step

Resumes an execution that paused in `WAITING` / `approval.required` status.

- **Method**: `POST`
- **Path**: `/runs/:id/approve`
- **Authentication**: `Bearer <accessToken>` (`JwtAuthGuard` + `TenantAccessGuard`)

### Response Body (`202 Accepted`)
```json
{
  "runId": "run_01j4k9m3n8...",
  "status": "EXECUTING"
}
```

---

## 5. Reject Paused Execution Step

Rejects an execution step, preventing the tool or action from executing.

- **Method**: `POST`
- **Path**: `/runs/:id/reject`
- **Authentication**: `Bearer <accessToken>` (`JwtAuthGuard` + `TenantAccessGuard`)

### Request Body
```json
{
  "reason": "Operation not authorized by manager"
}
```

### Response Body (`202 Accepted`)
```json
{
  "runId": "run_01j4k9m3n8...",
  "status": "CANCELLED"
}
```

---

## 6. Confirm Employee Design Blueprint

Finalizes the AI Employee design generated during an interactive onboarding session and provisions the employee in `DRAFT` status.

- **Method**: `POST`
- **Path**: `/runs/:id/confirm`
- **Authentication**: `Bearer <accessToken>` (`JwtAuthGuard` + `TenantAccessGuard`)

### Request Body
| Field | Type | Required | Validation | Description |
|---|---|---|---|---|
| `confirm` | `boolean` | **Yes** | Must be `true` | Explicit user confirmation flag |
| `blueprintRevision` | `string` | **Yes** | 64-char SHA-256 Hex | Blueprint revision hash from run result |

```json
{
  "confirm": true,
  "blueprintRevision": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}
```

### Response Body (`202 Accepted`)
```json
{
  "agentId": "ag_89f02b14-c321-4def-91a2-3f4e5a6b7c8d",
  "status": "DRAFT",
  "name": "Customer Support Employee"
}
```

---

## 7. Frontend Integration Snippet (TypeScript)

```typescript
import { api } from "@/lib/api/client";
import type { CreateRunInput, RunResponse, RunStreamEvent } from "@/lib/api/runs";

// 1. Synchronous execution
export async function createRun(input: CreateRunInput): Promise<RunResponse> {
  return api.post<RunResponse>("/runs", input);
}

// 2. Real-time token streaming with async generator
export async function* streamRun(
  input: CreateRunInput,
  options: { signal?: AbortSignal } = {}
): AsyncGenerator<RunStreamEvent> {
  const response = await api.stream("/runs/stream", input, { signal: options.signal });
  if (!response.body) throw new Error("Backend returned an empty stream");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      buffer = buffer.replaceAll("\r\n", "\n");

      let boundary = buffer.indexOf("\n\n");
      while (boundary !== -1) {
        const frame = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        
        const lines = frame.split("\n");
        const data = lines
          .filter((line) => line.startsWith("data:"))
          .map((line) => line.slice(5).trimStart())
          .join("\n");
        
        if (data) yield JSON.parse(data) as RunStreamEvent;
        boundary = buffer.indexOf("\n\n");
      }

      if (done) break;
    }
  } finally {
    reader.releaseLock();
  }
}
```
