// Integration endpoints — /api/v1/integrations (currently public)

import { api } from "@/lib/api/client";
import type { Integration, IntegrationCategory } from "@/lib/api/types";

export interface CreateIntegrationInput {
  name: string;
  category: IntegrationCategory;
  provider: string;
  config?: Record<string, unknown>;
  organizationId?: string;
}

/** GET /integrations/organization/:organizationId — list for an org. */
export async function listOrganizationIntegrations(
  organizationId: string,
): Promise<Integration[]> {
  return api.get<Integration[]>(`/integrations/organization/${organizationId}`);
}

/** POST /integrations */
export async function createIntegration(
  input: CreateIntegrationInput,
): Promise<Integration> {
  return api.post<Integration>("/integrations", input);
}

/** DELETE /integrations/:id — soft delete. */
export async function deleteIntegration(id: string): Promise<void> {
  return api.delete<void>(`/integrations/${id}`);
}
