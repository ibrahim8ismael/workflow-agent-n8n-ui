// Agent endpoints — /api/v1/agents
// Note: currently public on the backend (no auth guard yet).

import { api, buildQuery } from "@/lib/api/client";
import type {
  Agent,
  AgentStatus,
  CreateAgentInput,
  PaginationParams,
  Skill,
  UpdateAgentInput,
} from "@/lib/api/types";

export interface ListAgentsParams extends PaginationParams {
  organizationId?: string;
  status?: AgentStatus;
}

/** GET /agents — list agents (bare array). */
export async function listAgents(params: ListAgentsParams = {}): Promise<Agent[]> {
  const { organizationId, status, skip, take } = params;
  return api.get<Agent[]>(
    `/agents${buildQuery({ organizationId, status, skip, take })}`,
  );
}

/** GET /agents/:id */
export async function getAgent(id: string): Promise<Agent> {
  return api.get<Agent>(`/agents/${id}`);
}

/** GET /agents/platform/jaafar — the shared employee-design guide. */
export async function getJaafarAgent(): Promise<Agent> {
  try {
    return await api.get<Agent>("/agents/platform/jaafar");
  } catch {
    return {
      id: "00000000-0000-4000-8000-000000000001",
      name: "Jaafar",
      description: "The Woops AI guide who designs digital employees with business owners.",
      instructions: "You are Jaafar, the AI guide inside Woops. Help business owners design digital employees. Never claim an employee was created without backend confirmation.",
      status: "PUBLISHED",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

/** POST /agents */
export async function createAgent(input: CreateAgentInput): Promise<Agent> {
  return api.post<Agent>("/agents", input);
}

/** PATCH /agents/:id */
export async function updateAgent(
  id: string,
  input: UpdateAgentInput,
): Promise<Agent> {
  return api.patch<Agent>(`/agents/${id}`, input);
}

/** DELETE /agents/:id — soft delete. */
export async function deleteAgent(id: string): Promise<void> {
  return api.delete<void>(`/agents/${id}`);
}

/** POST /agents/:id/publish */
export async function publishAgent(id: string): Promise<Agent> {
  return api.post<Agent>(`/agents/${id}/publish`);
}

/** POST /agents/:id/archive */
export async function archiveAgent(id: string): Promise<Agent> {
  return api.post<Agent>(`/agents/${id}/archive`);
}

/** GET /agents/:id/skills — skills attached to an agent. */
export async function listAgentSkills(agentId: string): Promise<Skill[]> {
  return api.get<Skill[]>(`/agents/${agentId}/skills`);
}

/** POST /agents/:id/skills/:skillId — attach a skill. */
export async function attachSkill(
  agentId: string,
  skillId: string,
): Promise<void> {
  return api.post<void>(`/agents/${agentId}/skills/${skillId}`);
}

/** DELETE /agents/:id/skills/:skillId — detach a skill. */
export async function detachSkill(
  agentId: string,
  skillId: string,
): Promise<void> {
  return api.delete<void>(`/agents/${agentId}/skills/${skillId}`);
}
