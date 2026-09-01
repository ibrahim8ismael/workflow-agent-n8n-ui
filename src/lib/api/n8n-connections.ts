import { api } from "@/lib/api/client";
import type { N8nConnection } from "@/lib/api/types";

export interface CreateN8nConnectionInput {
  name: string;
  baseUrl: string;
  apiKey: string;
  organizationId?: string;
}

export interface UpdateN8nConnectionInput {
  name?: string;
  baseUrl?: string;
  apiKey?: string;
  status?: string;
}

export async function listN8nConnections(): Promise<N8nConnection[]> {
  return api.get<N8nConnection[]>("/integrations/n8n");
}

export async function getN8nConnection(id: string): Promise<N8nConnection> {
  return api.get<N8nConnection>(`/integrations/n8n/${id}`);
}

export async function createN8nConnection(
  input: CreateN8nConnectionInput,
): Promise<N8nConnection> {
  return api.post<N8nConnection>("/integrations/n8n", input);
}

export async function updateN8nConnection(
  id: string,
  input: UpdateN8nConnectionInput,
): Promise<N8nConnection> {
  return api.patch<N8nConnection>(`/integrations/n8n/${id}`, input);
}

export async function verifyN8nConnection(
  id: string,
): Promise<N8nConnection> {
  return api.post<N8nConnection>(`/integrations/n8n/${id}/verify`);
}

export async function deleteN8nConnection(id: string): Promise<N8nConnection> {
  return api.delete<N8nConnection>(`/integrations/n8n/${id}`);
}
