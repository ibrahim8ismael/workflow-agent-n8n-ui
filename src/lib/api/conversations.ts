import { api, buildQuery } from "@/lib/api/client";
import type {
  Conversation,
  CreateConversationInput,
  Message,
} from "@/lib/api/types";

export async function createConversation(
  input: CreateConversationInput,
): Promise<Conversation> {
  return api.post<Conversation>("/conversations", input);
}

export async function listConversations(params: {
  agentId?: string;
  userId?: string;
  organizationId?: string;
  status?: string;
  skip?: number;
  take?: number;
} = {}): Promise<Conversation[]> {
  return api.get<Conversation[]>(`/conversations${buildQuery(params)}`);
}

export async function getConversation(conversationId: string): Promise<Conversation> {
  return api.get<Conversation>(`/conversations/${conversationId}`);
}

export async function listConversationMessages(
  conversationId: string,
  params: { skip?: number; take?: number } = {},
): Promise<Message[]> {
  return api.get<Message[]>(
    `/conversations/${conversationId}/messages${buildQuery(params)}`,
  );
}

export async function updateConversationTitle(
  conversationId: string,
  title: string,
): Promise<Conversation> {
  return api.patch<Conversation>(`/conversations/${conversationId}`, { title });
}
