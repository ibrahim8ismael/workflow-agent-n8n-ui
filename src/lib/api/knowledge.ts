import { api, buildQuery } from "@/lib/api/client";
import type {
  IngestKnowledgeInput,
  KnowledgeDocument,
  KnowledgeDocumentChunk,
  PaginationParams,
  SearchKnowledgeParams,
} from "@/lib/api/types";

/** POST /knowledge/upload — upload markdown file via multipart form. */
export async function uploadKnowledgeFile(
  file: File,
  title?: string,
  category?: string,
  organizationId?: string,
): Promise<KnowledgeDocument> {
  const formData = new FormData();
  formData.append("file", file);
  if (title) formData.append("title", title);
  if (category) formData.append("category", category);
  if (organizationId) formData.append("organizationId", organizationId);

  return api.post<KnowledgeDocument>("/knowledge/upload", formData);
}

/** POST /knowledge/ingest — ingest raw markdown text. */
export async function ingestKnowledgeText(
  input: IngestKnowledgeInput,
): Promise<KnowledgeDocument> {
  return api.post<KnowledgeDocument>("/knowledge/ingest", input);
}

/** GET /knowledge/search — semantic vector search. */
export async function searchKnowledge(
  params: SearchKnowledgeParams,
): Promise<KnowledgeDocumentChunk[]> {
  const { query, category, limit, offset } = params;
  return api.get<KnowledgeDocumentChunk[]>(
    `/knowledge/search${buildQuery({ query, category, limit, offset })}`,
  );
}

/** GET /knowledge — list documents. */
export async function listKnowledgeDocuments(
  params: PaginationParams & { category?: string; organizationId?: string } = {},
): Promise<KnowledgeDocument[]> {
  return api.get<KnowledgeDocument[]>(`/knowledge${buildQuery(params)}`);
}

/** GET /knowledge/:id — get document details. */
export async function getKnowledgeDocument(
  id: string,
): Promise<KnowledgeDocument> {
  return api.get<KnowledgeDocument>(`/knowledge/${id}`);
}

/** GET /knowledge/:id/chunks — get vector chunks for a document. */
export async function getKnowledgeDocumentChunks(
  id: string,
): Promise<KnowledgeDocumentChunk[]> {
  return api.get<KnowledgeDocumentChunk[]>(`/knowledge/${id}/chunks`);
}

/** PATCH /knowledge/:id — update document metadata. */
export async function updateKnowledgeDocument(
  id: string,
  input: { title?: string; category?: string },
): Promise<KnowledgeDocument> {
  return api.patch<KnowledgeDocument>(`/knowledge/${id}`, input);
}

/** DELETE /knowledge/:id — soft delete a document. */
export async function deleteKnowledgeDocument(id: string): Promise<void> {
  return api.delete<void>(`/knowledge/${id}`);
}
