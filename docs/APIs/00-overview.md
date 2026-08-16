# Woops API Reference — Frontend Integration Guide

> Complete, production-grade documentation of all REST & Realtime APIs exposed by `woops-agent-engine`.
> Designed for `woops-client` developers to wire frontend components, state stores, and services directly to the backend engine.

---

## 1. API Architecture & Core Principles

The Woops Platform Backend (`woops-agent-engine`) is the authoritative **Control Plane** for managing AI digital employees, user accounts, organizations, knowledge bases, agent memory, tool integrations, billing wallets, and runtime execution orchestration.

```
┌─────────────────────────────────────────────────────────────┐
│                 Woops Client (Next.js 15)                   │
│   src/lib/api/client.ts · zustand stores · React components │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / SSE / WebSocket
                               ▼
┌─────────────────────────────────────────────────────────────┐
│            Woops Agent Engine (NestJS Control Plane)         │
│               Base URL: /api/v1  (Port: 3000)                │
├──────────────────────────────┬──────────────────────────────┤
│  • Auth & Identity           │  • Knowledge Vector RAG      │
│  • Agents / AI Employees     │  • Long-Term Memory          │
│  • Jaafar Execution Runtime  │  • Channels & Integrations   │
│  • Chat Conversations        │  • Billing, Wallets & Quotas │
│  • Skills & Tool Blueprints  │  • System Admin & Analytics  │
└──────────────────────────────┴──────────────────────────────┘
```

### Environment URLs

| Environment | Base URL | Swagger UI | WebSocket (`/ws`) |
|---|---|---|---|
| **Local Dev** | `http://localhost:3000/api/v1` | `http://localhost:3000/api/docs` | `ws://localhost:3000/ws` |
| **Staging** | `https://staging-api.woops.ai/api/v1` | `https://staging-api.woops.ai/api/docs` | `wss://staging-api.woops.ai/ws` |
| **Production** | `https://api.woops.ai/api/v1` | `https://api.woops.ai/api/docs` | `wss://api.woops.ai/ws` |

---

## 2. Authentication & Session Model

Woops uses a **passwordless OTP (One-Time Password)** system with high-security JWT token rotation:

```
                  ┌──────────────────────────────┐
                  │ 1. Request OTP (POST /auth/otp/request) │
                  └──────────────┬───────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │ 2. Verify OTP (POST /auth/otp/verify)   │
                  └──────────────┬───────────────┘
                                 │
     ┌───────────────────────────┴───────────────────────────┐
     ▼                                                       ▼
[Access Token (JWT)]                                    [Refresh Token]
- Lifetime: 15 minutes                                  - Lifetime: 30 days
- Stored: IN-MEMORY ONLY (JS variable)                  - Stored: HttpOnly Cookie (`woops_refresh`)
- Sent: `Authorization: Bearer <token>`                - Sent: Automatically with `credentials: "include"`
- Scope: userId, sessionId, activeContext, orgId        - Scope: Path `/api/v1/auth`, SameSite=Lax
```

### Frontend Token Storage Rules
1. **Never store Access Tokens in `localStorage` or `sessionStorage`** (prevents XSS credential theft).
2. **Always pass `credentials: "include"`** on all `fetch()` / `axios` requests so the browser includes the `woops_refresh` cookie.
3. When any API returns `401 Unauthorized`:
   - Intercept the 401 response.
   - Execute a single silent refresh via `POST /api/v1/auth/refresh`.
   - Update in-memory Access Token and retry the failed request.
   - If `/auth/refresh` also fails with 401 (`NO_REFRESH_TOKEN` or expired), clear in-memory state and trigger a redirect to `/login`.

---

## 3. Request & Response Envelopes

### Success Envelopes
To keep payload overhead low:
- **Auth Endpoints** return wrapped envelopes: `{ success: true, data: { ... } }`.
- **Domain Resource Endpoints** (Agents, Skills, Runs, Knowledge, Billing, etc.) return **raw entities or arrays directly** (e.g. `{ id: "...", name: "..." }` or `[...]`).

### Error Envelope (Global Format)
All non-2xx exceptions are transformed uniformly by `GlobalExceptionFilter`:

```json
{
  "statusCode": 400,
  "message": "Validation error",
  "timestamp": "2026-08-16T12:00:00.000Z"
}
```

### Common HTTP Status Codes

| Status Code | Description | Meaning |
|---|---|---|
| `200 OK` | Standard success | Resource retrieved, updated, or action completed. |
| `201 Created` | Resource created | Entity created successfully. |
| `202 Accepted` | Async action started | Run execution, streaming, or approval initiated. |
| `204 No Content` | Success with empty body | Delete action, logout, or session revocation. |
| `400 Bad Request` | Validation / Prisma error | Invalid payload fields, schema mismatch, constraint error. |
| `401 Unauthorized` | Missing or invalid auth | Token expired, missing bearer header, missing refresh cookie. |
| `403 Forbidden` | Access denied | User lacks tenant or admin permission for the resource. |
| `404 Not Found` | Resource missing | Requested ID does not exist or has been soft-deleted. |
| `429 Too Many Requests` | Rate limit exceeded | Global IP limit (100 req/15min) or OTP limit reached. |
| `500 Internal Server Error` | Server defect | Unhandled error (captured in Sentry). |
| `503 Service Unavailable` | Infra degradation | Redis or Database health check failed. |

---

## 4. Pagination, Filtering & Sorting Standard

### List Query Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `skip` | `number` | `0` | Offset-based pagination skip count (used by Core domain). |
| `take` | `number` | `20` | Offset-based pagination limit count (max 100). |
| `limit` | `number` | `50` | Limit for Admin and Billing pagination. |
| `offset` | `number` | `0` | Offset for Admin and Billing pagination. |
| `status` | `string` | — | Filter by entity status (e.g., `DRAFT`, `PUBLISHED`, `ACTIVE`). |
| `organizationId` | `string` | — | Filter resources by organization ownership. |
| `q` / `query` | `string` | — | Search query string for full-text / semantic search. |

---

## 5. Documentation Directory Sitemap

The detailed documentation for each service module is divided into separate, modular files:

| # | Document File | Topic / Modules Covered |
|---|---|---|
| 01 | [`01-auth.md`](file:///Users/ceo/woops/woops-client/docs/apis/01-auth.md) | Passwordless OTP login, verification, refresh token rotation, logout, org switcher |
| 02 | [`02-users.md`](file:///Users/ceo/woops/woops-client/docs/apis/02-users.md) | User profile retrieval, profile updates, active session devices, account deactivation |
| 03 | [`03-agents.md`](file:///Users/ceo/woops/woops-client/docs/apis/03-agents.md) | AI Employee lifecycle: create, update, publish, archive, attach/detach skills |
| 04 | [`04-runs-and-runtime.md`](file:///Users/ceo/woops/woops-client/docs/apis/04-runs-and-runtime.md) | Jaafar Engine runs, SSE token streaming, human approvals, employee design blueprint confirmation |
| 05 | [`05-conversations.md`](file:///Users/ceo/woops/woops-client/docs/apis/05-conversations.md) | Chat threads, message history, conversation resolution, title updates |
| 06 | [`06-skills.md`](file:///Users/ceo/woops/woops-client/docs/apis/06-skills.md) | Capabilities & tools: n8n workflow, AI prompt, knowledge/memory retrieval, human approval |
| 07 | [`07-knowledge.md`](file:///Users/ceo/woops/woops-client/docs/apis/07-knowledge.md) | Document upload (.md), text ingestion, pgvector semantic search, chunk inspection |
| 08 | [`08-memory.md`](file:///Users/ceo/woops/woops-client/docs/apis/08-memory.md) | Long-term memory store: conversation facts, user preferences, agent heuristics |
| 09 | [`09-channels-and-integrations.md`](file:///Users/ceo/woops/woops-client/docs/apis/09-channels-and-integrations.md) | Channels (WhatsApp, Telegram, Widget) & third-party integrations (CRM, Gmail, Slack) |
| 10 | [`10-billing.md`](file:///Users/ceo/woops/woops-client/docs/apis/10-billing.md) | Subscriptions, credit wallets, ledger transactions, top-up packages, coupons, invoices, metered quotas |
| 11 | [`11-admin.md`](file:///Users/ceo/woops/woops-client/docs/apis/11-admin.md) | System Admin: analytics dashboard, MRR, user suspensions, impersonation, feature flags, audit logs |
| 12 | [`12-realtime-and-health.md`](file:///Users/ceo/woops/woops-client/docs/apis/12-realtime-and-health.md) | WebSocket Gateway (`/ws`) connection, events, Redis & DB health check (`/health`) |
