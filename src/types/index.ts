export type UserRole = 'EMPLOYEE' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  employeeId: string;
  avatarUrl?: string;
  joinedDate: string;
}

export type DocumentType = 'PDF' | 'DOCX' | 'TXT' | 'CSV';
export type DocumentStatus = 'Indexed' | 'Processing' | 'Failed';

export interface DocumentChunk {
  id: string;
  chunkIndex: number;
  text: string;
  tokenCount: number;
  embeddingDimension: number;
  page?: number;
  section?: string;
}

export interface KnowledgeDocument {
  id: string;
  name: string;
  type: DocumentType;
  department: string;
  size: string;
  status: DocumentStatus;
  updatedAt: string;
  chunksCount?: number;
  uploadedBy?: string;
  description?: string;
  previewSnippet?: string;
  sampleChunks?: DocumentChunk[];
}

export interface SourceReference {
  documentName: string;
  page?: number;
  section?: string;
  relevanceScore?: number;
  excerpt?: string;
  chunkId?: string;
  tokenCount?: number;
}

export type ConfidenceLevel = 'High' | 'Medium' | 'Low';
export type AnswerMode = 'Concise' | 'Detailed' | 'Summarize';

export interface AgentStep {
  id: string;
  label: string;
  agentName: string;
  status: 'pending' | 'running' | 'completed';
  durationMs?: number;
  description?: string;
}

export type Theme = 'light' | 'dark' | 'system';

export type AttachmentType = 'image' | 'document';

export interface ChatAttachment {
  type: AttachmentType;
  name: string;
  url: string;
  mimeType: string;
  size?: number;
}

export interface DetailedFeedback {
  rating: 'helpful' | 'unhelpful';
  tags: string[];
  comment?: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  image?: string | null;
  imageName?: string | null;
  attachment?: ChatAttachment | null;
  sources?: SourceReference[];
  confidence?: ConfidenceLevel;
  processingSteps?: AgentStep[];
  feedback?: 'helpful' | 'unhelpful' | null;
  detailedFeedback?: DetailedFeedback | null;
  isRegenerated?: boolean;
  answerMode?: AnswerMode;
  followUpQuestions?: string[];
  executionTimeMs?: number;
}

export interface Conversation {
  id: string;
  title: string;
  lastUpdated: string;
  messages: ChatMessage[];
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  aiResponseNotifications: boolean;
  documentProcessingNotifications: boolean;
  compactChatView: boolean;
}

export interface AdminStats {
  totalDocuments: number;
  totalUsers: number;
  totalQueries: number;
  indexedPercentage: number;
  vectorEmbeddingsCount: number;
}

export interface SessionInfo {
  sessionId: string;
  loginTime: string;
  ipAddress: string;
  networkLocation: string;
  encryption: string;
  tokenExpiry: string;
}

export interface SystemStatus {
  status: 'Operational' | 'Degraded' | 'Offline';
  latencyMs: number;
  vectorDbStatus: string;
  vectorDbRecords: number;
  embeddingModel: string;
  agentsActive: number;
  lastSync: string;
}
