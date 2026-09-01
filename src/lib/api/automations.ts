import { api, buildQuery } from "@/lib/api/client";
import type { Automation, AutomationBlueprint, PaginationParams } from "@/lib/api/types";

export interface CreateAutomationInput {
  name: string;
  description?: string;
  blueprint: AutomationBlueprint | Record<string, unknown>;
  connectionId?: string;
}

export interface ListAutomationsParams extends PaginationParams {
  status?: string;
}

export async function listAutomations(
  params: ListAutomationsParams = {},
): Promise<Automation[]> {
  return api.get<Automation[]>(`/automations${buildQuery(params as Record<string, unknown>)}`);
}

export async function getAutomation(id: string): Promise<Automation> {
  return api.get<Automation>(`/automations/${id}`);
}

export async function createAutomation(
  input: CreateAutomationInput,
): Promise<Automation> {
  return api.post<Automation>("/automations", input);
}

export async function approveAutomation(id: string): Promise<Automation> {
  return api.post<Automation>(`/automations/${id}/approve`);
}

export async function reprovisionAutomation(id: string): Promise<Automation> {
  return api.post<Automation>(`/automations/${id}/reprovision`);
}

export async function deleteAutomation(id: string): Promise<Automation> {
  return api.delete<Automation>(`/automations/${id}`);
}
