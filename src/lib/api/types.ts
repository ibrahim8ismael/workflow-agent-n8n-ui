// Core entity types mirroring the Woops Agent Engine API reference
// (Obsidian: 11-api-reference-core, 12-api-reference-billing)

// ----------------------------------------------------------------------
// Enums
// ----------------------------------------------------------------------

export type UserRole = "USER" | "SYSTEM_ADMINISTRATOR";
export type AgentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED" | "ERROR";
export type ConversationStatus = "ACTIVE" | "RESOLVED" | "ARCHIVED";
export type MemoryType = "CONVERSATION" | "USER" | "AGENT";
export type ChannelType =
  | "WIDGET"
  | "WHATSAPP"
  | "MESSENGER"
  | "INSTAGRAM"
  | "TELEGRAM"
  | "EMAIL"
  | "SLACK"
  | "DISCORD"
  | "API";
export type IntegrationCategory =
  | "AI"
  | "COMMUNICATION"
  | "CRM"
  | "PAYMENT"
  | "ANALYTICS"
  | "STORAGE"
  | "OTHER";
export type SkillExecutionMode =
  | "AI_ONLY"
  | "N8N_WORKFLOW"
  | "KNOWLEDGE_RETRIEVAL"
  | "MEMORY_RETRIEVAL"
  | "HYBRID"
  | "HUMAN_APPROVAL";
export type SkillStatus =
  | "DRAFT"
  | "TESTING"
  | "PUBLISHED"
  | "ACTIVE"
  | "DEPRECATED"
  | "ARCHIVED";
export type SkillVisibility = "PRIVATE" | "ORGANIZATION" | "PUBLIC";
export type RunStatus =
  | "CREATED"
  | "PREPARING"
  | "PLANNING"
  | "EXECUTING"
  | "WAITING"
  | "GENERATING"
  | "PERSISTING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED"
  | "TIMEOUT";

// ----------------------------------------------------------------------
// Auth
// ----------------------------------------------------------------------

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
}

export interface OtpVerifyResponse {
  accessToken: string;
  sessionId: string;
  user: AuthUser;
}

// ----------------------------------------------------------------------
// Users
// ----------------------------------------------------------------------

export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  emailVerifiedAt?: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserSession {
  id: string;
  device?: string;
  browser?: string;
  ip?: string;
  lastUsedAt?: string;
  expiresAt?: string;
}

// ----------------------------------------------------------------------
// Agents
// ----------------------------------------------------------------------

export interface Agent {
  id: string;
  name: string;
  description?: string | null;
  instructions?: string | null;
  personality?: string | null;
  model: string;
  status: AgentStatus;
  userId?: string | null;
  organizationId?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateAgentInput {
  name: string;
  description?: string;
  instructions?: string;
  personality?: string;
  model?: string;
  status?: AgentStatus;
  organizationId?: string;
}

export type UpdateAgentInput = Partial<CreateAgentInput>;

// ----------------------------------------------------------------------
// Skills
// ----------------------------------------------------------------------

export interface Skill {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  category?: string | null;
  executionMode: SkillExecutionMode;
  status: SkillStatus;
  visibility: SkillVisibility;
  inputSchema?: Record<string, unknown> | null;
  outputSchema?: Record<string, unknown> | null;
  instructions?: string | null;
  timeout?: number | null;
  retryPolicy?: Record<string, unknown> | null;
  successCriteria?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  userId?: string | null;
  organizationId?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

// ----------------------------------------------------------------------
// Conversations & Messages
// ----------------------------------------------------------------------

export interface Conversation {
  id: string;
  title?: string | null;
  status: ConversationStatus;
  metadata?: Record<string, unknown> | null;
  agentId: string;
  userId?: string | null;
  organizationId?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface Message {
  id: string;
  conversationId: string;
  role: string;
  content: string;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

// ----------------------------------------------------------------------
// Knowledge
// ----------------------------------------------------------------------

export interface KnowledgeDocument {
  id: string;
  title: string;
  source?: string | null;
  contentType: string;
  content?: string | null;
  metadata?: Record<string, unknown> | null;
  userId?: string | null;
  organizationId?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface KnowledgeChunk {
  id: string;
  knowledgeDocumentId: string;
  content: string;
  metadata?: Record<string, unknown> | null;
  chunkIndex: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

// ----------------------------------------------------------------------
// Memory
// ----------------------------------------------------------------------

export interface Memory {
  id: string;
  agentId: string;
  type: MemoryType;
  key: string;
  content: string;
  metadata?: Record<string, unknown> | null;
  userId?: string | null;
  organizationId?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

// ----------------------------------------------------------------------
// Channels & Integrations
// ----------------------------------------------------------------------

export interface Channel {
  id: string;
  agentId: string;
  type: ChannelType;
  name?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface Integration {
  id: string;
  name: string;
  category: IntegrationCategory;
  provider: string;
  status: string;
  config?: Record<string, unknown> | null;
  userId?: string | null;
  organizationId?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

// ----------------------------------------------------------------------
// Runs
// ----------------------------------------------------------------------

export interface Run {
  id: string;
  agentId: string;
  conversationId?: string | null;
  userId?: string | null;
  organizationId?: string | null;
  status: RunStatus;
  plan?: unknown | null;
  result?: unknown | null;
  error?: string | null;
  metadata?: Record<string, unknown> | null;
  startedAt?: string | null;
  completedAt?: string | null;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost?: number | null;
  durationMs?: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

// ----------------------------------------------------------------------
// Billing
// ----------------------------------------------------------------------

export type SubscriptionStatus =
  | "ACTIVE"
  | "CANCELED"
  | "PAST_DUE"
  | "TRIALING"
  | "INCOMPLETE";

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  currency: string;
  interval: string;
  features?: Record<string, unknown> | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  provider: string;
  providerSubscriptionId?: string | null;
  trialEndsAt?: string | null;
  canceledAt?: string | null;
  userId?: string | null;
  organizationId?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  plan?: SubscriptionPlan;
}

export interface Invoice {
  id: string;
  subscriptionId?: string | null;
  amount: number;
  currency: string;
  status: string;
  providerInvoiceId?: string | null;
  paidAt?: string | null;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface Wallet {
  id: string;
  balanceCredits: string;
  balanceCreditsUsd: string;
  lifetimeCredits: string;
  lifetimeSpendUsd: string;
  currency: string;
  softLimit?: string | null;
  hardLimit?: string | null;
  gracePeriodEnd?: string | null;
  isFrozen: boolean;
  version: number;
  userId?: string | null;
  organizationId?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: string;
  amountCredits: string;
  amountUsd?: string | null;
  currency: string;
  balanceBefore: string;
  balanceAfter: string;
  description?: string | null;
  referenceType?: string | null;
  referenceId?: string | null;
  metadata?: Record<string, unknown> | null;
  couponId?: string | null;
  expiresAt?: string | null;
  createdAt: string;
}

export interface Usage {
  id: string;
  subscriptionId?: string | null;
  aiCreditsUsed: string;
  aiCreditsLimit: string;
  operationsUsed: string;
  operationsLimit: string;
  resetAt: string;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------
// Pagination params (skip/take convention — core endpoints)
// ----------------------------------------------------------------------

export interface PaginationParams {
  skip?: number;
  take?: number;
}
