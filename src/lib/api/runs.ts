import { api } from "@/lib/api/client";

export type RuntimeMode = "conversation" | "employee_design" | "execution";

export interface CreateRunInput {
  agentId: string;
  userMessage: string;
  mode: RuntimeMode;
  conversationId?: string;
  effort?: "low" | "medium" | "high";
}

export interface RunResponse {
  runId: string;
  conversationId?: string;
  mode?: RuntimeMode;
  status?: string;
  response: string;
  plan?: unknown;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ConfirmEmployeeDesignInput {
  confirm: true;
  blueprintRevision: string;
}

export type RunStreamEvent =
  | { type: "run.started"; runId: string; mode?: RuntimeMode; conversationId?: string; payload?: { status: string } }
  | { type: "token"; runId: string; content?: string; payload?: { content: string } }
  | { type: "graph.node.started"; runId: string; payload?: { node: string } }
  | { type: "graph.node.completed"; runId: string; payload?: { node: string; durationMs: number } }
  | { type: "plan.created"; runId: string; payload?: { stepCount: number; requiresApproval: boolean } }
  | { type: "tool.started"; runId: string; payload?: { callId: string; toolName: string } }
  | { type: "tool.completed"; runId: string; payload?: { callId: string; toolName: string; durationMs: number } }
  | { type: "tool.failed"; runId: string; payload?: { callId: string; toolName: string; error: unknown } }
  | { type: "approval.required"; runId: string; payload?: { reason: string } }
  | { type: "run.waiting"; runId: string; payload?: { reason: "clarification" | "approval" } }
  | {
      type: "run.completed";
      runId: string;
      conversationId?: string;
      response?: string;
      usage?: NonNullable<RunResponse["usage"]>;
      payload?: { response: string; usage: NonNullable<RunResponse["usage"]> };
    }
  | {
      type: "run.failed";
      runId: string;
      code?: string;
      message?: string;
      payload?: { error: { code: string; message: string; retryable?: boolean } };
    }
  | { type: "run.cancelled"; runId: string; payload?: { reason?: string } };

export interface StreamRunOptions {
  signal?: AbortSignal;
}

export async function* streamRun(
  input: CreateRunInput,
  options: StreamRunOptions = {},
): AsyncGenerator<RunStreamEvent> {
  const response = await api.stream("/runs/stream", input, {
    signal: options.signal,
  });
  if (!response.body) throw new Error("The backend returned an empty stream");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      buffer = buffer.replaceAll("\r\n", "\n");

      let boundary = buffer.indexOf("\n\n");
      while (boundary !== -1) {
        const frame = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        const event = parseStreamFrame(frame);
        if (event) yield event;
        boundary = buffer.indexOf("\n\n");
      }

      if (done) {
        const event = parseStreamFrame(buffer);
        if (event) yield event;
        break;
      }
    }
  } finally {
    reader.releaseLock();
  }
}

function parseStreamFrame(frame: string): RunStreamEvent | null {
  const lines = frame.replaceAll("\r\n", "\n").split("\n");
  const data = lines
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice("data:".length).trimStart())
    .join("\n");
  if (!data) return null;
  return JSON.parse(data) as RunStreamEvent;
}

export async function createRun(input: CreateRunInput): Promise<RunResponse> {
  return api.post<RunResponse>("/runs", input);
}

export async function getRun(id: string): Promise<RunResponse> {
  return api.get<RunResponse>(`/runs/${id}`);
}

export async function approveRun(
  id: string,
): Promise<{ runId: string; status: string }> {
  return api.post<{ runId: string; status: string }>(`/runs/${id}/approve`);
}

export async function rejectRun(
  id: string,
  reason?: string,
): Promise<{ runId: string; status: string }> {
  return api.post<{ runId: string; status: string }>(`/runs/${id}/reject`, {
    reason,
  });
}

export async function confirmEmployeeDesign(
  runId: string,
  input: ConfirmEmployeeDesignInput,
): Promise<RunResponse> {
  return api.post<RunResponse>(`/runs/${runId}/confirm`, input);
}

