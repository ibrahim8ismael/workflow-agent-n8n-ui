// Knowledge endpoints — /api/v1/knowledge

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
  contentType?: "markdown";
  category?: string;
  organizationId?: string;
  metadata?: Record<string, unknown>;
}): Promise<KnowledgeDocument> {
  return api.post<KnowledgeDocument>("/knowledge/ingest", input);
}

/** POST /knowledge/upload — upload and ingest a UTF-8 Markdown file. */
export async function uploadKnowledge(
  file: File,
  input: {
    title?: string;
    category?: string;
    organizationId?: string;
  } = {},
): Promise<KnowledgeDocument> {
  const formData = new FormData();
  formData.append("file", file);
  if (input.title) formData.append("title", input.title);
  if (input.category) formData.append("category", input.category);
  if (input.organizationId) formData.append("organizationId", input.organizationId);

  return api.post<KnowledgeDocument>("/knowledge/upload", formData);
}

/** GET /knowledge/search — text search returning matching chunks. */
export async function searchKnowledge(params: {
  query: string;
  organizationId?: string;
  category?: string;
  limit?: number;
  offset?: number;
}): Promise<KnowledgeChunk[]> {
  return api.get<KnowledgeChunk[]>(
    `/knowledge/search${buildQuery(params)}`,
  );
}

/** GET /knowledge/:id */
export async function getKnowledge(id: string): Promise<KnowledgeDocument> {
  return api.get<KnowledgeDocument>(`/knowledge/${id}`);
}

/** PATCH /knowledge/:id */
export async function updateKnowledge(
  id: string,
  input: Partial<{
    title: string;
    content: string;
    source: string;
    contentType: "markdown";
    category: string;
    organizationId: string;
    metadata: Record<string, unknown>;
  }>,
): Promise<KnowledgeDocument> {
  return api.patch<KnowledgeDocument>(`/knowledge/${id}`, input);
}

/** DELETE /knowledge/:id — soft deletes the document. */
export async function deleteKnowledge(id: string): Promise<KnowledgeDocument> {
  return api.delete<KnowledgeDocument>(`/knowledge/${id}`);
}

/** GET /knowledge/:id/chunks */
export async function getKnowledgeChunks(
  id: string,
): Promise<KnowledgeChunk[]> {
  return api.get<KnowledgeChunk[]>(`/knowledge/${id}/chunks`);
}
