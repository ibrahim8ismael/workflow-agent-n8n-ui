import { api } from "@/lib/api/client";
import type { HealthCheckResponse } from "@/lib/api/types";

/** GET /health — probe database and redis subsystems health. */
export async function checkSystemHealth(): Promise<HealthCheckResponse> {
  return api.get<HealthCheckResponse>("/health", { skipAuthRetry: true });
}
