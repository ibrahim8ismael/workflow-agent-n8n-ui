# Realtime WebSockets & Health Check APIs

> Modules: `RealtimeModule`, `HealthModule` · Namespace: `/ws` · Path: `/health` · Base URL Prefix: `/api/v1`

---

## 1. Realtime WebSockets Gateway (`/ws`)

The Woops Agent Engine includes a Socket.IO WebSocket gateway for pushing asynchronous state changes, agent status updates, live run events, and collaborative workspace updates to connected clients.

### Connection Details
- **Protocol**: Socket.IO (v4+)
- **Transport**: `websocket`, `polling` fallback
- **Namespace**: `/ws`
- **CORS**: Origin `*` (Configurable via `CORS_ORIGIN`)

| Environment | Socket URL | Namespace |
|---|---|---|
| **Local Dev** | `http://localhost:3000` | `/ws` |
| **Production** | `https://api.woops.ai` | `/ws` |

### Client Connection Example (Socket.IO Client)

```typescript
import { io, Socket } from "socket.io-client";
import { getAccessToken } from "@/lib/api/client";

export function createRealtimeSocket(): Socket {
  const token = getAccessToken();

  const socket = io("http://localhost:3000/ws", {
    transports: ["websocket"],
    auth: {
      token: token ? `Bearer ${token}` : undefined,
    },
    withCredentials: true,
  });

  socket.on("connect", () => {
    console.log("[Realtime] Connected with socket ID:", socket.id);
  });

  socket.on("run:status", (data) => {
    console.log("[Realtime] Run status changed:", data);
  });

  socket.on("agent:status", (data) => {
    console.log("[Realtime] Agent status updated:", data);
  });

  socket.on("disconnect", (reason) => {
    console.log("[Realtime] Disconnected:", reason);
  });

  return socket;
}
```

---

## 2. Infrastructure Health Check (`/health`)

Provides an automated readiness and liveness probe for load balancers, Kubernetes, Docker, and frontend status bars.

- **Method**: `GET`
- **Path**: `/health`
- **Authentication**: None (Public)

### Monitored Subsystems
1. **PostgreSQL Database** (`PrismaHealthIndicator`): Verifies active DB connection and query response.
2. **Redis Cache & Queues** (`RedisHealthIndicator`): Verifies Redis connection for session storage and job queues.

### Healthy Response Body (`200 OK`)
```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    },
    "redis": {
      "status": "up"
    }
  },
  "error": {},
  "details": {
    "database": {
      "status": "up"
    },
    "redis": {
      "status": "up"
    }
  }
}
```

### Unhealthy Response Body (`503 Service Unavailable`)
Returned when either the Database or Redis is unreachable:
```json
{
  "status": "error",
  "info": {
    "database": {
      "status": "up"
    }
  },
  "error": {
    "redis": {
      "status": "down",
      "message": "Redis connection refused"
    }
  },
  "details": {
    "database": {
      "status": "up"
    },
    "redis": {
      "status": "down",
      "message": "Redis connection refused"
    }
  }
}
```

---

## 3. Frontend Integration Snippet (TypeScript)

```typescript
import { api } from "@/lib/api/client";

export interface HealthCheckResponse {
  status: "ok" | "error";
  details: {
    database: { status: "up" | "down" };
    redis: { status: "up" | "down" };
  };
}

export async function checkSystemHealth(): Promise<HealthCheckResponse> {
  return api.get<HealthCheckResponse>("/health", { skipAuthRetry: true });
}
```
