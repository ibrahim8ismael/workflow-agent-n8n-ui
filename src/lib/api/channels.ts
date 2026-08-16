import { api } from "@/lib/api/client";
import type { Channel, ChannelType } from "@/lib/api/types";

export interface CreateChannelInput {
  agentId: string;
  type: ChannelType;
  name?: string;
}

export async function createChannel(
  input: CreateChannelInput,
): Promise<Channel> {
  return api.post<Channel>("/channels", input);
}

export async function listAgentChannels(agentId: string): Promise<Channel[]> {
  return api.get<Channel[]>(`/channels/agent/${agentId}`);
}

export async function getAgentChannels(agentId: string): Promise<Channel[]> {
  return listAgentChannels(agentId);
}

export async function getChannel(id: string): Promise<Channel> {
  return api.get<Channel>(`/channels/${id}`);
}

export async function checkChannelAvailability(
  agentId: string,
  type: ChannelType,
): Promise<{ available: boolean }> {
  return api.get<{ available: boolean }>(`/channels/${agentId}/check/${type}`);
}

export async function deleteChannel(id: string): Promise<Channel> {
  return api.delete<Channel>(`/channels/${id}`);
}

