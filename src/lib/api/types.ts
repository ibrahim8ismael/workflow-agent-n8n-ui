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
/** @deprecated ADR-011 — Skills removed; kept for read compat until drop migration. */
export type SkillExecutionMode =
  | "AI_ONLY"
  | "N8N_WORKFLOW"
  | "KNOWLEDGE_RETRIEVAL"
  | "MEMORY_RETRIEVAL"
  | "HYBRID"
  | "HUMAN_APPROVAL";
/** @deprecated ADR-011 */
export type SkillStatus =
  | "DRAFT"
  | "TESTING"
  | "PUBLISHED"
  | "ACTIVE"
  | "DEPRECATED"
  | "ARCHIVED";
/** @deprecated ADR-011 */
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
  model?: string | null;
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
// Automations & N8n Connections (ADR-011 client-managed n8n)
// ----------------------------------------------------------------------

export type N8nConnectionStatus =
  | "PENDING_VERIFICATION"
  | "ACTIVE"
  | "INVALID"
  | "SUSPENDED";

export interface N8nConnection {
  id: string;
  name: string;
  baseUrl: string;
  status: N8nConnectionStatus | string;
  lastVerifiedAt: string | null;
  lastError: string | null;
  keyPreview: string | null;
  createdAt: string;
  updatedAt: string;
}

export type AutomationStatus =
  | "DESIGN"
  | "PENDING_APPROVAL"
  | "PROVISIONING"
  | "ACTIVE"
  | "FAILED"
  | "SUSPENDED";

export interface AutomationBlueprint {
  ready: boolean;
  missingRequirements: string[];
  name: string;
  goal: string;
  summary: string;
  description?: string;
  trigger: {
    type: "webhook" | "schedule" | "manual" | "chat";
    config?: Record<string, unknown>;
  };
  steps: Array<{
    name: string;
    action: string;
    description?: string;
    integration?: string;
    config?: Record<string, unknown>;
  }>;
  integrations: string[];
  inputContract?: Record<string, unknown>;
  outputContract?: Record<string, unknown>;
  riskNotes?: string[];
}

export interface Automation {
  id: string;
  name: string;
  description: string | null;
  blueprint: AutomationBlueprint | Record<string, unknown>;
  status: AutomationStatus | string;
  connectionId: string;
  externalWorkflowId: string | null;
  webhookPath: string | null;
  lastSyncedAt: string | null;
  blueprintRevision: string | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------
// Skills (deprecated)
// ----------------------------------------------------------------------

/** @deprecated ADR-011 — see Automation. */
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

export interface CreateSkillInput {
  name: string;
  slug: string;
  description?: string;
  category?: string;
  executionMode?: SkillExecutionMode;
  inputSchema?: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
  instructions?: string;
  timeout?: number;
  retryPolicy?: Record<string, unknown>;
  successCriteria?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  visibility?: SkillVisibility;
}

export type UpdateSkillInput = Partial<CreateSkillInput>;

/** @deprecated ADR-011 */
export interface AgentSkill {
  id: string;
  agentId: string;
  skillId: string;
  name: string;
  enabled: boolean;
  config?: Record<string, unknown> | null;
  skill?: Skill;
}

// ----------------------------------------------------------------------
// Knowledge Base
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

export interface KnowledgeDocumentChunk {
  id: string;
  knowledgeDocumentId: string;
  content: string;
  chunkIndex: number;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface IngestKnowledgeInput {
  title: string;
  content: string;
  category?: string;
  source?: string;
  organizationId?: string;
}

export interface SearchKnowledgeParams {
  query: string;
  category?: string;
  limit?: number;
  offset?: number;
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

export interface CreateConversationInput {
  title?: string;
  agentId: string;
  userId?: string;
  organizationId?: string;
  metadata?: Record<string, unknown>;
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

export interface CreateMemoryInput {
  agentId: string;
  type: MemoryType;
  key: string;
  content: string;
  metadata?: Record<string, unknown>;
  userId?: string;
  organizationId?: string;
  expiresAt?: string;
}

export type UpdateMemoryInput = Partial<Omit<CreateMemoryInput, "agentId">>;

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

export interface TopUpPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  currency: string;
  bonusCredits?: number;
  isActive: boolean;
}

export interface TopUpPurchase {
  id: string;
  packageId: string;
  credits: number;
  amountPaid: number;
  currency: string;
  status: string;
  createdAt: string;
}

export interface CouponRedemption {
  success: boolean;
  message: string;
  creditsGranted?: number;
}

// ----------------------------------------------------------------------
// Health & Realtime
// ----------------------------------------------------------------------

export interface HealthCheckResponse {
  status: "ok" | "error";
  info?: Record<string, { status: "up" | "down" }>;
  error?: Record<string, unknown>;
  details: {
    database: { status: "up" | "down" };
    redis: { status: "up" | "down"; message?: string };
  };
}

// ----------------------------------------------------------------------
// Pagination params (skip/take convention — core endpoints)
// ----------------------------------------------------------------------

export interface PaginationParams {
  skip?: number;
  take?: number;
}

// ----------------------------------------------------------------------
// System Administration (Module: AdminModule)
// ----------------------------------------------------------------------

export interface AdminDashboardStats {
  totalUsers: number;
  activeOrganizations: number;
  totalRunsToday: number;
  mrrUsd: number;
  systemHealth: "HEALTHY" | "DEGRADED" | "CRITICAL" | string;
}

export interface AdminMrrData {
  mrrUsd: number;
  growthRate?: number;
  history?: Array<{ date: string; mrr: number }>;
  breakdownByPlan?: Record<string, number>;
}

export interface AdminChurnData {
  churnRate: number;
  churnedCount: number;
  totalSubscribers: number;
  period?: string;
}

export interface AdminCreditsBurnData {
  days: number;
  totalCreditsBurned: number;
  dailyAverage: number;
  history?: Array<{ date: string; credits: number }>;
  breakdownByModel?: Record<string, number>;
}

export interface AdminArpuData {
  arpuUsd: number;
  arpuByPlan?: Record<string, number>;
}

export interface AdminUserListItem {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
  isEmailVerified: boolean;
  isSuspended?: boolean;
  suspensionReason?: string | null;
  organizationCount?: number;
  walletBalance?: string | number;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  adminUsers: number;
  newUsersLast30Days?: number;
}

export interface AdminOrganizationListItem {
  id: string;
  name: string;
  slug?: string;
  ownerId?: string;
  ownerEmail?: string;
  memberCount?: number;
  agentCount?: number;
  isSuspended?: boolean;
  suspensionReason?: string | null;
  currentPlan?: string;
  walletBalanceCredits?: string | number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrganizationStats {
  totalOrganizations: number;
  activeOrganizations: number;
  suspendedOrganizations: number;
  enterpriseCount?: number;
}

export interface CreatePlanInput {
  name: string;
  description?: string;
  price: number;
  currency?: string;
  interval?: "month" | "year" | string;
  features?: Record<string, unknown>;
  isActive?: boolean;
}

export type UpdatePlanInput = Partial<CreatePlanInput>;

export interface AdminWalletTopUpInput {
  credits: string | number;
  description: string;
}

export interface AdminWalletDeductInput {
  credits: string | number;
  description: string;
}

export type CouponType =
  | "FREE_CREDITS"
  | "PERCENTAGE_DISCOUNT"
  | "FIXED_DISCOUNT"
  | string;

export interface AdminCoupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  maxRedemptions?: number | null;
  redemptionCount?: number;
  expiresAt?: string | null;
  isActive?: boolean;
  createdAt: string;
}

export interface CreateCouponInput {
  code: string;
  type: CouponType;
  value: number;
  maxRedemptions?: number;
  expiresAt?: string;
}

export interface FeatureFlagOverride {
  id?: string;
  entityType: "ORGANIZATION" | "USER";
  entityId: string;
  enabled: boolean;
  reason?: string;
  createdAt?: string;
}

export interface AdminFeatureFlag {
  id?: string;
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  overrides?: FeatureFlagOverride[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFeatureFlagInput {
  key: string;
  name: string;
  description?: string;
  enabled?: boolean;
}

export interface SetFeatureFlagOverrideInput {
  entityType: "ORGANIZATION" | "USER";
  entityId: string;
  enabled: boolean;
  reason?: string;
}

export interface AdminAuditLog {
  id: string;
  userId?: string | null;
  userEmail?: string | null;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
}

export interface AdminImpersonationLog {
  id: string;
  adminId: string;
  adminEmail?: string;
  impersonatedUserId: string;
  impersonatedUserEmail?: string;
  reason: string;
  ipAddress?: string;
  createdAt: string;
}


