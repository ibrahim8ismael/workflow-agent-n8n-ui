import { api } from "@/lib/api/client";
import type { User } from "@/lib/api/types";

export interface UpdateUserInput {
  name?: string;
  avatarUrl?: string;
}

export async function updateMe(input: UpdateUserInput): Promise<User> {
  return api.patch<User>("/users/me", input);
}

export interface UserSession {
  id: string;
  device: string | null;
  browser: string | null;
  ip: string | null;
  lastUsedAt: string;
  expiresAt: string;
  createdAt: string;
}

export async function getMySessions(): Promise<UserSession[]> {
  return api.get<UserSession[]>("/users/me/sessions");
}

export async function revokeSession(sessionId: string): Promise<void> {
  return api.delete<void>(`/users/me/sessions/${sessionId}`);
}

export async function logoutAll(): Promise<void> {
  return api.post<void>("/auth/logout-all");
}
