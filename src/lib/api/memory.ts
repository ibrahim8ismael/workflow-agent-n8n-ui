// Memory endpoints — /api/v1/memory (currently public)

import { api, buildQuery } from "@/lib/api/client";
import type { 
  Memory, 
  MemoryType, 
  PaginationParams,
  CreateMemoryInput,
  UpdateMemoryInput
} from "@/lib/api/types";

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

/** POST /memory — create a new memory entry. */
export async function createMemory(input: CreateMemoryInput): Promise<Memory> {
  return api.post<Memory>("/memory", input);
}

/** GET /memory/:id — get a specific memory entry. */
export async function getMemory(id: string): Promise<Memory> {
  return api.get<Memory>(`/memory/${id}`);
}

/** GET /memory/agent/:agentId/search — search memory for an agent. */
export async function searchAgentMemory(
  agentId: string,
  query: string,
  params: { type?: MemoryType; take?: number } = {}
): Promise<Memory[]> {
  const { type, take } = params;
  return api.get<Memory[]>(
    `/memory/agent/${agentId}/search${buildQuery({ query, type, take })}`
  );
}

/** PATCH /memory/:id — update a specific memory entry. */
export async function updateMemory(
  id: string,
  input: UpdateMemoryInput
): Promise<Memory> {
  return api.patch<Memory>(`/memory/${id}`, input);
}

/** DELETE /memory/:id — delete a specific memory entry. */
export async function deleteMemory(id: string): Promise<void> {
  return api.delete<void>(`/memory/${id}`);
}
