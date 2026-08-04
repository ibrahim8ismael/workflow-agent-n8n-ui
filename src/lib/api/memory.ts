// Memory endpoints — /api/v1/memory (currently public)

import { api, buildQuery } from "@/lib/api/client";
import type { Memory, MemoryType, PaginationParams } from "@/lib/api/types";

/** GET /memory/agent/:agentId — list memory for an agent. */
export async function listAgentMemory(
  agentId: string,
  params: PaginationParams & { type?: MemoryType; userId?: string } = {},
): Promise<Memory[]> {
  const { type, userId, skip, take } = params;
  return api.get<Memory[]>(
    `/memory/agent/${agentId}${buildQuery({ type, userId, skip, take })}`,
  );
}
