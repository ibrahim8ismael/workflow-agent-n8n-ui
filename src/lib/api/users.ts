import { api } from "@/lib/api/client";
import type { User, UserSession } from "@/lib/api/types";

export interface UpdateUserInput {
  name?: string;
  avatarUrl?: string;
}

export async function getMe(): Promise<User> {
  return api.get<User>("/users/me");
}

export async function updateMe(input: UpdateUserInput): Promise<User> {
  return api.patch<User>("/users/me", input);
}

export async function deactivateMe(): Promise<void> {
  return api.delete<void>("/users/me");
}

export async function getMySessions(): Promise<UserSession[]> {
  return api.get<UserSession[]>("/users/me/sessions");
}

export async function revokeSession(sessionId: string): Promise<void> {
  return api.delete<void>(`/users/me/sessions/${sessionId}`);
}

export async function getUserById(id: string): Promise<User> {
  return api.get<User>(`/users/${id}`);
}


