import { api, buildQuery } from "@/lib/api/client";
import type {
  CreateSkillInput,
  PaginationParams,
  Skill,
  UpdateSkillInput,
} from "@/lib/api/types";

export interface ListSkillsParams extends PaginationParams {
  category?: string;
  status?: string;
}

/** GET /skills — list available skills. */
export async function listSkills(
  params: ListSkillsParams = {},
): Promise<Skill[]> {
  return api.get<Skill[]>(`/skills${buildQuery(params)}`);
}

/** GET /skills/:id — get skill by ID. */
export async function getSkill(id: string): Promise<Skill> {
  return api.get<Skill>(`/skills/${id}`);
}

/** POST /skills — create a new skill definition. */
export async function createSkill(input: CreateSkillInput): Promise<Skill> {
  return api.post<Skill>("/skills", input);
}

/** PATCH /skills/:id — update a skill definition. */
export async function updateSkill(
  id: string,
  input: UpdateSkillInput,
): Promise<Skill> {
  return api.patch<Skill>(`/skills/${id}`, input);
}

/** POST /skills/:id/publish — publish a skill. */
export async function publishSkill(id: string): Promise<Skill> {
  return api.post<Skill>(`/skills/${id}/publish`);
}

/** POST /skills/:id/archive — archive a skill. */
export async function archiveSkill(id: string): Promise<Skill> {
  return api.post<Skill>(`/skills/${id}/archive`);
}

/** DELETE /skills/:id — soft delete a skill. */
export async function deleteSkill(id: string): Promise<Skill> {
  return api.delete<Skill>(`/skills/${id}`);
}
