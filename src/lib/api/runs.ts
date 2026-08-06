import { api } from "@/lib/api/client";

export interface CreateRunInput {
  agentId: string;
  userMessage: string;
  conversationId?: string;
  effort?: "low" | "medium" | "high";
}

export interface RunResponse {
  runId: string;
  response: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export async function createRun(input: CreateRunInput): Promise<RunResponse> {
  return api.post<RunResponse>("/runs", input);
}
