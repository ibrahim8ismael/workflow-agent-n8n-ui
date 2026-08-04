# Woops Client — Backend API Integration

How this frontend talks to the **Woops Agent Engine** backend (NestJS, `woops-agent-engine`).

Full backend endpoint reference lives in the Obsidian vault:

- `11-api-reference-core.md` — auth, users, agents, skills, conversations, knowledge, memory, channels, integrations, runs
- `12-api-reference-billing.md` — subscriptions, wallet, invoices, coupons, usage, top-up
- `13-api-reference-admin.md` — admin endpoints
- `10-api-integration.md` — conventions, auth, error shapes, gotchas

This document covers what the client has integrated and how.

---

## 1. Connection

| Setting | Value |
|---|---|
| Base URL | `NEXT_PUBLIC_API_URL` (`.env.local`, defaults to `http://localhost:3000/api/v1`) |
| Transport | Direct browser `fetch` with `credentials: "include"` (CORS is enabled on the backend in dev) |
| Auth | OTP → JWT (Bearer) + httpOnly refresh cookie (`woops_refresh`) |

### Local dev stack

Backend runs via docker compose in `woops-agent-engine`:

```bash
cd ../woops-agent-engine
docker compose up -d --build   # app on :3000, Mailpit on :8025 (OTP emails)
```

OTP codes are readable at `http://localhost:8025` (Mailpit web UI / API).

---

## 2. Client layer — `src/lib/api/`

| File | Purpose |
|---|---|
| `client.ts` | Fetch wrapper: Bearer injection, refresh-on-401, error normalization, query builder, `ApiError` |
| `types.ts` | TS types + enums for every entity (Agent, Skill, KnowledgeDocument, Memory, Integration, User, …) |
| `auth.ts` | `requestOtp`, `verifyOtp`, `refreshSession`, `logout`, `fetchMe` |
| `agents.ts` | Agent CRUD + publish/archive + attach/detach skills |
| `knowledge.ts` | List / ingest / search knowledge |
| `integrations.ts` | List org integrations |
| `memory.ts` | List agent memory |

### How the client handles the API's quirks

- **No response envelope** — only auth endpoints wrap responses in `{ success, data }`. Non-auth endpoints return raw entities/bare arrays. Pass `envelope: true` per call for auth endpoints.
- **Errors** — backend returns `{ statusCode, message, timestamp }` (GlobalExceptionFilter), except `POST /auth/refresh` without a cookie → `{ success: false, error: { code, message } }`. `client.ts` normalizes both into `ApiError` (`statusCode`, `message`, `code`).
- **401 → refresh → retry** — any 401 triggers a single-flight `POST /auth/refresh` (cookie is sent automatically via `credentials: "include"`), then retries the original request once. If refresh fails, the session is dead: the client dispatches `woops:auth-expired` on `window` and the `AuthProvider` redirects to `/signin`.
- **BigInt as string** — credits/usage fields arrive as strings; treat with `BigInt()`/`Number()` before arithmetic.
- **Pagination** — core endpoints use `skip`/`take` (no response metadata — clients can't know totals). `buildQuery()` skips `undefined`/`null`/empty values.

### Auth flow (implemented end-to-end)

```
/signin        POST /auth/otp/request  { email }            → redirect /otp-verify?email=…
/otp-verify    POST /auth/otp/verify   { email, otp }       → accessToken + refresh cookie
               GET  /users/me          (Bearer)             → full profile → signIn
AuthProvider   POST /auth/refresh      (cookie)             → restore session on reload
/logout        POST /auth/logout                            → 204, clear local state
```

- `src/stores/auth-store.ts` — zustand store (`user`, `status`, `signIn`/`clearSession`). The access token lives **in memory only** (module-level in `client.ts`); the durable session is the httpOnly cookie.
- `src/components/providers/auth-provider.tsx` — bootstraps the session on mount (token → `/users/me`, else cookie refresh), listens for `woops:auth-expired`, redirects authed users away from `/signin`/`/otp-verify`.
- `src/components/providers/auth-gate.tsx` — wraps `(dashboard)` layout; shows a loader until bootstrapped, redirects to `/signin` when unauthenticated.

---

## 3. Integrated pages

### `/agents` — real data (list/create/publish/archive/delete)

| Action | Endpoint |
|---|---|
| Load list | `GET /agents` |
| Create | `POST /agents` `{ name, description?, instructions? }` |
| Publish / Archive | `POST /agents/:id/publish` · `POST /agents/:id/archive` |
| Delete (soft) | `DELETE /agents/:id` |

UI notes:
- Status display maps the DB enum (`PUBLISHED → "Active"`, `DRAFT → "Draft"`, `ARCHIVED`, `ERROR`).
- Avatar/color are derived from the agent name (the API has no avatar field).
- "Role" line shows `model` (the API has no role field).

### `/agent/[id]` — detail + related resources

| Tab | Endpoint |
|---|---|
| Header / prompts | `GET /agents/:id` (404 → "Employee Not Found") |
| Memory | `GET /memory/agent/:agentId` |
| Skills | `GET /agents/:id/skills` + `DELETE /agents/:id/skills/:skillId` (detach) |
| Integrations | `GET /integrations/organization/:organizationId` (only if the agent has an org) |
| Knowledge | `GET /knowledge?organizationId=…` (org-scoped; empty without an org) |

Related-resource fetches fail silently to `[]` so a broken tab never blocks the page.

---

## 4. Not yet integrated (planned follow-ups)

- `/new` chat — still a **local mock LLM** (`useLocalRuntime`). Real wiring: `POST /runs` (202) + poll `GET /runs/:id` (no push events yet on the backend).
- Dashboard stats / billing — still mock data. Real sources: `GET /wallet`, `GET /usage`, `GET /subscriptions/current`.
- `/knowledge` upload page — still simulated locally; `POST /knowledge/ingest` is ready in `src/lib/api/knowledge.ts`.
- `/integrations` page — still mock; `src/lib/api/integrations.ts` is ready.
- Organizations — backend has no routes yet.

---

## 5. Gotchas when extending

- **Agent status trap:** the backend DTO accepts `ACTIVE`/`PAUSED` but the DB enum is only `DRAFT | PUBLISHED | ARCHIVED | ERROR` — always send the DB values.
- **`/knowledge/search`** validates `limit`/`offset` as **numbers** — don't send strings.
- **`/auth/refresh` returns 401 `{success:false, error:{code:"NO_REFRESH_TOKEN"}}`** when the cookie is missing — expect this on first visit.
- **Logout is 204**, `DELETE /agents/:id` is 200 with an empty body — `client.ts` handles both (204 → `null`, empty-body 200 → `null`).
- Rate limit: 100 req/15 min per IP globally; 5 OTP requests/email/hour — expect 429s during bursty dev testing.
