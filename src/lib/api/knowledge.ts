// Knowledge endpoints — /api/v1/knowledge (currently public)

import { api, buildQuery } from "@/lib/api/client";
import type {
  KnowledgeChunk,
  KnowledgeDocument,
  PaginationParams,
} from "@/lib/api/types";

export interface ListKnowledgeParams extends PaginationParams {
  organizationId?: string;
}

/** GET /knowledge — list documents (bare array). */
export async function listKnowledge(
  params: ListKnowledgeParams = {},
): Promise<KnowledgeDocument[]> {
  const { organizationId, skip, take } = params;
  return api.get<KnowledgeDocument[]>(
    `/knowledge${buildQuery({ organizationId, skip, take })}`,
  );
}

/** POST /knowledge/ingest — create document + auto-chunk. */
export async function ingestKnowledge(input: {
  title: string;
  content: string;
  source?: string;
  contentType?: string;
  category?: string;
  organizationId?: string;
  metadata?: Record<string, unknown>;
}): Promise<KnowledgeDocument> {
  return api.post<KnowledgeDocument>("/knowledge/ingest", input);
}

/** GET /knowledge/search — semantic search. limit/offset must be numbers. */
export async function searchKnowledge(params: {
  query: string;
  organizationId?: string;
  category?: string;
  limit?: number;
  offset?: number;
}): Promise<KnowledgeDocument[]> {
  return api.get<KnowledgeDocument[]>(
    `/knowledge/search${buildQuery(params)}`,
  );
}

/** GET /knowledge/:id/chunks */
export async function getKnowledgeChunks(
  id: string,
): Promise<KnowledgeChunk[]> {
  return api.get<KnowledgeChunk[]>(`/knowledge/${id}/chunks`);
}
