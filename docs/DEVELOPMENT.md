# Woops Client — Development

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Start the Next.js dev server (`localhost:3001`) |
| `npm run lint` | ESLint (config: `eslint.config.mjs`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run build` | Production build (`next build`; use `-- --webpack` only if Turbopack native bindings are missing) |
| `npm run start` | Serve the production build |

## CI

`.github/workflows/ci.yml` — GitHub Actions, runs on push to `main` and all PRs:

```
npm ci → npm run lint → npm run typecheck → npm run build
```

Node 22, npm cache enabled. No env vars are required for CI (the build falls back to `http://localhost:3000/api/v1`).

## Environment

`.env.example` — copy to `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

## Local backend

The API is served by `woops-agent-engine` (sibling repo). Run it with docker compose:

```bash
cd ../woops-agent-engine
docker compose up -d --build
```

- API: `http://localhost:3000/api/v1`
- Health: `http://localhost:3000/api/v1/health`
- Mailpit (OTP emails): `http://localhost:8025`

See `docs/API-INTEGRATION.md` for how the client consumes the API.
