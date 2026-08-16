# Knowledge Base & Vector Ingestion APIs

> Module: `KnowledgeModule` · Controller Path: `/knowledge` · Base URL Prefix: `/api/v1`

---

## Overview

The **Knowledge Base** provides Retrieval-Augmented Generation (RAG) capabilities to AI Employees. Documents (Standard Operating Procedures, policies, product catalogs, FAQs) are stored, chunked, and embedded into a PostgreSQL `pgvector` index (1536 dimensions).

### Content & File Standards
- **Supported Format**: Markdown (`.md` / `contentType: "markdown"`).
- **Max File Size**: 5 MB per document.
- **Chunking Strategy**: Semantic markdown header & paragraph chunking with overlapping context.

---

## 1. Upload Markdown Document (`multipart/form-data`)

Uploads a `.md` file directly from a file picker or drag-and-drop UI. The backend automatically parses the text, calculates chunk embeddings, and inserts them into pgvector.

- **Method**: `POST`
- **Path**: `/knowledge/upload`
- **Authentication**: `Bearer <accessToken>` (`JwtAuthGuard` + `TenantAccessGuard`)
- **Content-Type**: `multipart/form-data`

### Form Data Fields
| Field | Type | Required | Description |
|---|---|---|---|
| `file` | `File` (binary) | **Yes** | `.md` file to upload (Max 5MB) |
| `title` | `string` | No | Document title (defaults to filename if omitted) |
| `category` | `string` | No | Category tag (e.g. `SOP`, `HR`, `BILLING`, `PRODUCTS`) |

### Response Body (`201 Created`)
```json
{
  "id": "doc_8f1a2345-9876-4abc-def0-123456789abc",
  "title": "Refunds and Cancellation SOP",
  "source": "refunds_sop_v2.md",
  "contentType": "markdown",
  "content": null,
  "metadata": null,
  "userId": "c1f7a40b-7128-4444-9351-a90d98fa6a8b",
  "organizationId": null,
  "createdAt": "2026-08-16T12:00:00.000Z",
  "updatedAt": "2026-08-16T12:00:00.000Z",
  "deletedAt": null
}
```

---

## 2. Ingest Raw Markdown Text (`application/json`)

Ingests raw markdown text entered via a web editor or paste input without creating a local file.

- **Method**: `POST`
- **Path**: `/knowledge/ingest`
- **Authentication**: `Bearer <accessToken>` (`JwtAuthGuard` + `TenantAccessGuard`)

### Request Body
| Field | Type | Required | Description |
|---|---|---|---|
| `title` | `string` | **Yes** | Document title (1–500 chars) |
| `content` | `string` | **Yes** | Full markdown text content |
| `category` | `string` | No | Category tag |
| `source` | `string` | No | Source URL or reference name |

```json
{
  "title": "VIP Customer Service Guidelines",
  "content": "# VIP Guidelines\n\nVIP accounts (over $1,000/mo) receive 24/7 dedicated escalation...",
  "category": "CUSTOMER_SUPPORT"
}
```

### Response Body (`201 Created`)
```json
{
  "id": "doc_99bbaacc-1122-3344-5566-778899aabbcc",
  "title": "VIP Customer Service Guidelines",
  "source": null,
  "contentType": "markdown",
  "createdAt": "2026-08-16T12:05:00.000Z",
  "updatedAt": "2026-08-16T12:05:00.000Z"
}
```

---

## 3. Semantic Search Knowledge Base

Performs vector similarity search across all document chunks owned by the user or organization.

- **Method**: `GET`
- **Path**: `/knowledge/search`
- **Authentication**: `Bearer <accessToken>` (`JwtAuthGuard` + `TenantAccessGuard`)

### Query Parameters
| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `query` | `string` | **Yes** | — | Natural language search query |
| `category` | `string` | No | — | Filter search by category |
| `limit` | `number` | No | `10` | Max chunks to return (max `50`) |
| `offset` | `number` | No | `0` | Pagination offset |

### Example Request
```http
GET /api/v1/knowledge/search?query=what+is+the+refund+window&limit=3
Authorization: Bearer <accessToken>
```

### Response Body (`200 OK`)
```json
[
  {
    "id": "chk_01j4k1a...",
    "knowledgeDocumentId": "doc_8f1a2345-9876-4abc-def0-123456789abc",
    "content": "## Refund Timelines\nAll standard orders are eligible for a 100% refund within 30 days of purchase.",
    "chunkIndex": 1,
    "metadata": { "heading": "Refund Timelines" },
    "createdAt": "2026-08-16T12:00:01.000Z"
  }
]
```

---

## 4. List Documents

- **Method**: `GET`
- **Path**: `/knowledge`
- **Authentication**: `Bearer <accessToken>` (`JwtAuthGuard` + `TenantAccessGuard`)

### Query Parameters
| Parameter | Type | Required | Description |
|---|---|---|---|
| `skip` | `number` | No | Offset pagination |
| `take` | `number` | No | Items count |

### Response Body (`200 OK`)
```json
[
  {
    "id": "doc_8f1a2345-9876-4abc-def0-123456789abc",
    "title": "Refunds and Cancellation SOP",
    "source": "refunds_sop_v2.md",
    "contentType": "markdown",
    "createdAt": "2026-08-16T12:00:00.000Z",
    "updatedAt": "2026-08-16T12:00:00.000Z"
  }
]
```

---

## 5. Get Document Details & Chunks

### Get Document by ID
- **Method**: `GET`
- **Path**: `/knowledge/:id`
- **Response**: `KnowledgeDocument` entity.

### Get Document Chunks by Document ID
- **Method**: `GET`
- **Path**: `/knowledge/:id/chunks`
- **Response**: Array of `KnowledgeDocumentChunk` objects showing the vector slices.

---

## 6. Update Document Metadata

- **Method**: `PATCH`
- **Path**: `/knowledge/:id`
- **Authentication**: `Bearer <accessToken>` (`JwtAuthGuard` + `TenantAccessGuard`)

### Request Body
```json
{
  "title": "Updated Customer Service Guidelines",
  "category": "SUPPORT"
}
```

---

## 7. Delete Document (Soft Delete)

Soft deletes the document and removes its chunk embeddings from search.

- **Method**: `DELETE`
- **Path**: `/knowledge/:id`
- **Authentication**: `Bearer <accessToken>` (`JwtAuthGuard` + `TenantAccessGuard`)

---

## 8. Frontend Integration Snippet (TypeScript)

```typescript
import { api, buildQuery } from "@/lib/api/client";

// Upload markdown file via multipart form
export async function uploadKnowledgeFile(file: File, title?: string, category?: string) {
  const formData = new FormData();
  formData.append("file", file);
  if (title) formData.append("title", title);
  if (category) formData.append("category", category);

  return api.post("/knowledge/upload", formData);
}

// Ingest raw text
export async function ingestKnowledgeText(data: { title: string; content: string; category?: string }) {
  return api.post("/knowledge/ingest", data);
}

// Semantic search
export async function searchKnowledge(query: string, limit = 10) {
  const qs = buildQuery({ query, limit });
  return api.get(`/knowledge/search${qs}`);
}

// List documents
export async function getKnowledgeDocuments(params?: { skip?: number; take?: number }) {
  const qs = buildQuery(params);
  return api.get(`/knowledge${qs}`);
}

// Delete document
export async function deleteKnowledgeDocument(id: string) {
  return api.delete(`/knowledge/${id}`);
}
```
