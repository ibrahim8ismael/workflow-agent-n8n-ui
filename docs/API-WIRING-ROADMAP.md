# API Wiring Roadmap

This document tracks which Woops frontend APIs are already connected and which product areas still need backend wiring.

## Current API Base

- Base URL: `NEXT_PUBLIC_API_URL`
- Default: `http://localhost:3000/api/v1`
- Authentication: in-memory access token plus an HttpOnly refresh cookie
- Requests include `credentials: "include"`

## Already Wired

### Authentication

- `POST /auth/otp/request`
- `POST /auth/otp/verify`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /users/me`

### Employees

- `GET /agents`
- `POST /agents`
- `GET /agents/:id`
- `PATCH /agents/:id` client method exists, but employee detail editing is not wired in the UI
- `DELETE /agents/:id`
- `POST /agents/:id/publish`
- `POST /agents/:id/archive`
- `GET /agents/:id/skills`
- `DELETE /agents/:id/skills/:skillId`

### Employee Related Data

- `GET /memory/agent/:agentId`
- `GET /integrations/organization/:organizationId`
- `GET /knowledge?organizationId=...`

### User Settings

- `PATCH /users/me`
- `GET /users/me/sessions`
- `DELETE /users/me/sessions/:sessionId`
- `POST /auth/logout-all`

### Billing Reads

- `GET /subscriptions/current`
- `GET /invoices`
- `GET /wallet`
- `GET /usage`
- `DELETE /subscriptions/:id`

## Priority 1: Employee Creation

The `/new` page uses `useLocalRuntime` as a client-side adapter and streams requests to `POST /runs/stream` with `mode: "conversation"`. It creates and reuses a conversation so the backend can load history and persist messages.

### Existing APIs

- `POST /runs` with explicit `mode`: `conversation`, `employee_design`, or `execution`
- `GET /runs/:id`
- `POST /conversations`
- `GET /conversations/:id/messages`
- `POST /conversations/:id/messages`

### Contract Issue

`POST /runs` currently requires an existing `agentId`, but the product flow is supposed to create an employee from a natural-language description before an employee exists.

Choose one of these approaches before wiring the UI:

1. Add a backend employee-generation or blueprint endpoint. This is the recommended approach.
2. Create a draft employee first, then execute the prompt against that employee.
3. Extend `POST /runs` to support blueprint generation without an `agentId`.

The synchronous `POST /runs` endpoint remains available for non-streaming callers. The `/new` chat consumes SSE events from `POST /runs/stream` and uses `run.completed` as the final response boundary. Polling `GET /runs/:id` is not needed for the streamed conversation path.

### Runtime separation

The frontend defaults `/new` to `mode: "conversation"`. The backend should route runtime modes behind a single API boundary while keeping orchestration separate:

- Conversation mode must not invoke the planner, load execution skills, construct tools, request approval, or perform side effects.
- Employee design mode may generate structured blueprints but must not execute them.
- Execution mode owns planning, approval handling, skill loading, tool execution, and result verification.

Shared context, conversation persistence, memory, knowledge, usage tracking, and error handling should remain reusable services rather than being duplicated across runtimes.

## Priority 2: Knowledge Base

The `/knowledge` page now loads live documents and uploads Markdown files through the backend.

### APIs To Wire

- `GET /knowledge`
- `POST /knowledge/ingest`
- `POST /knowledge/upload` (Markdown files only, maximum 5 MB)
- `GET /knowledge/search`
- `GET /knowledge/:id`
- `PATCH /knowledge/:id`
- `DELETE /knowledge/:id`
- `GET /knowledge/:id/chunks`

### Upload Limitation

The backend supports UTF-8 Markdown content and a multipart Markdown upload:

```json
{
  "title": "Customer Service SOP",
  "content": "Document text...",
  "contentType": "markdown"
}
```

The frontend currently filters the loaded document list locally. Backend search returns matching chunks and still needs a grouped search-results UI. PDF, DOCX, CSV, TXT, and XLSX uploads are not currently supported by the backend. To make that support real, either:

- Extract text in the browser before calling `/knowledge/ingest`.
- Add a backend file-upload and document-extraction endpoint.

## Priority 3: Integrations

The `/integrations` page currently renders mock applications. The Install and Details actions are not connected.

### Existing APIs

- `GET /integrations/organization/:organizationId`
- `POST /integrations`
- `GET /integrations/:organizationId/check/:provider`
- `DELETE /integrations/:id`

### Missing Provider Flow

The backend currently has no integration catalog endpoint and no OAuth or provider connection flow. A real directory needs APIs similar to:

- `GET /integration-catalog`
- `GET /integrations/:provider/connect`
- OAuth callback endpoint
- Integration credentials/configuration endpoint

Organizations are also not implemented yet, so organization-scoped integrations cannot be completed until workspace APIs exist.

## Priority 4: Employee Channels

Channel API methods exist in `src/lib/api/channels.ts`, but no UI currently uses them.

### APIs To Wire

- `GET /channels/agent/:agentId`
- `POST /channels`
- `GET /channels/:agentId/check/:type`
- `DELETE /channels/:id`

This should become a Channels section on the employee detail page for Website Chat, WhatsApp, Email, Slack, and other supported channel types.

## Priority 5: Skills

The employee detail page can display and remove skills, but users cannot browse or attach skills.

### APIs To Add To The Client

- `GET /skills`
- `GET /skills/:id`
- `POST /skills`
- `PATCH /skills/:id`
- `DELETE /skills/:id`
- `POST /skills/:id/publish`
- `POST /skills/:id/archive`
- `POST /agents/:agentId/skills/:skillId`

The Skills tab needs a skills library and an attach flow.

## Priority 6: Memory Editing

The employee detail page currently only reads memory entries through `GET /memory/agent/:agentId`.

### APIs To Add To The Client

- `POST /memory`
- `GET /memory/:id`
- `GET /memory/agent/:agentId/search`
- `PATCH /memory/:id`
- `DELETE /memory/:id`

## Priority 7: Billing Actions

Billing read data and subscription cancellation are already wired in the settings page.

### APIs Still Needed

- `POST /subscriptions`
- `PATCH /subscriptions/:id/upgrade`
- `GET /top-up/packages`
- `POST /top-up/purchase`
- `GET /top-up/purchases`
- `POST /coupons/redeem`

The current Manage Plan and payment method links point to a hard-coded Stripe URL. They should be replaced with a backend checkout or customer portal flow.

## Priority 8: Dashboard

The dashboard currently displays ecommerce demo data:

- Revenue
- Orders
- Average order value
- Store conversion
- Return rate
- Revenue by category

These metrics do not represent Woops workforce activity and should not be connected directly to billing data.

### Temporary Data Sources

- `GET /agents`
- `GET /usage`
- `GET /wallet`
- `GET /runs/:id`

### Recommended Backend Analytics APIs

- `GET /analytics/overview`
- `GET /analytics/runs`
- `GET /analytics/agents/:id`
- `GET /runs?agentId=...`

The backend currently exposes run lookup by ID but not a user-facing run list, which limits dashboard activity and performance reporting.

## Workspace And Organization APIs

The General settings page is still local/mock data. The backend organization controller is currently empty.

Required APIs include:

- `GET /organizations`
- `POST /organizations`
- `GET /organizations/:id`
- `PATCH /organizations/:id`
- `DELETE /organizations/:id`
- `POST /auth/switch-organization`
- Workspace member and invitation endpoints

`POST /auth/switch-organization` already exists on the backend, but the frontend does not yet have a client method or organization selector.

## Backend Blockers

Before exposing more workspace data in the UI:

- Add `JwtAuthGuard` to core domain controllers where required.
- Enforce user and organization tenant scoping.
- Implement organizations before relying on organization-scoped knowledge and integrations.
- Implement provider OAuth/configuration before making integration installation functional.
- Add an employee-generation contract that matches the natural-language creation flow.
- Add run listing and analytics endpoints for the dashboard.

## Recommended Implementation Order

1. Resolve the employee blueprint/creation API contract.
2. Replace the `/new` local runtime with real employee creation and runs.
3. Wire the Knowledge Base page.
4. Add employee channels and integration configuration.
5. Add skills library and attachment management.
6. Add memory editing.
7. Complete billing actions and top-ups.
8. Replace the ecommerce dashboard with workforce analytics.
