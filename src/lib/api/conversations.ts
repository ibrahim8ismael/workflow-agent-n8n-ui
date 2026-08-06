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

export async function listConversationMessages(
  conversationId: string,
  params: { skip?: number; take?: number } = {},
): Promise<Message[]> {
  return api.get<Message[]>(
    `/conversations/${conversationId}/messages${buildQuery(params)}`,
  );
}
