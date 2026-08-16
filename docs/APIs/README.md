# Woops Agent Engine — Frontend API Documentation

Welcome to the official API documentation for connecting `woops-client` with `woops-agent-engine`.

## Quick Links

- [00. API Architecture & Overview](./00-overview.md)
- [01. Authentication & Sessions (`/auth`)](./01-auth.md)
- [02. User Profile & Sessions (`/users`)](./02-users.md)
- [03. AI Employees & Agents (`/agents`)](./03-agents.md)
- [04. Execution Runtime & Token Streaming (`/runs`)](./04-runs-and-runtime.md)
- [05. Conversations & Messages (`/conversations`)](./05-conversations.md)
- [06. Skills & Capability Tools (`/skills`)](./06-skills.md)
- [07. Knowledge Base & Vector RAG (`/knowledge`)](./07-knowledge.md)
- [08. Persistent Agent Memory (`/memory`)](./08-memory.md)
- [09. Channels & Integrations (`/channels`, `/integrations`)](./09-channels-and-integrations.md)
- [10. Billing, Wallets, Top-Ups & Usage (`/subscriptions`, `/wallet`, etc.)](./10-billing.md)
- [11. System Administration (`/admin/*`)](./11-admin.md)
- [12. Realtime WebSockets & Health Probes (`/ws`, `/health`)](./12-realtime-and-health.md)

---

## Key Conventions for Frontend Developers

1. **Base URL**: `http://localhost:3000/api/v1` (in local development).
2. **Authentication**: Passwordless OTP. Access token kept **in memory**, refresh token kept in HttpOnly cookie `woops_refresh`.
3. **Always send credentials**: Add `credentials: "include"` (or `withCredentials: true`) to fetch requests.
4. **Token Refresh Interceptor**: If any request fails with `401 Unauthorized`, trigger `POST /auth/refresh` once and retry the request automatically.
5. **Streaming**: Connect to `POST /runs/stream` with `Accept: text/event-stream` for real-time AI typewriter streaming, node transitions, and tool logs.
