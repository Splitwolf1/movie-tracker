export enum ContentType {
  REVIEW = 'review',
  COMMENT = 'comment',
  USER_PROFILE = 'user_profile',
  CUSTOM_LIST = 'custom_list'
}

export enum ModerationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  AUTO_APPROVED = 'auto_approved',
  AUTO_REJECTED = 'auto_rejected'
}

export enum ModerationReason {
  INAPPROPRIATE = 'inappropriate',
  SPAM = 'spam',
  HARASSMENT = 'harassment',
  HATE_SPEECH = 'hate_speech',
  ADULT_CONTENT = 'adult_content',
  VIOLENCE = 'violence',
  OTHER = 'other'
}

export interface ModerationResult {
  status: ModerationStatus;
  contentId: string;
  contentType: ContentType;
  flaggedWords?: string[];
  confidence: number;
  message?: string;
}

export interface ModerationRequest {
  contentId: string;
  contentType: ContentType;
  content: string;
  userId: string;
  createdAt: Date;
}

export interface ModerationDecision {
  id: string;
  requestId: string;
  moderatorId: string;
  status: ModerationStatus;
  reason?: ModerationReason;
  comments?: string;
  decidedAt: Date;
}

export interface ReportedContent {
  id: string;
  contentId: string;
  contentType: ContentType;
  reportedBy: string;
  reason: ModerationReason;
  description?: string;
  reportedAt: Date;
  status: ModerationStatus;
  decision?: ModerationDecision;
}

export interface ModerationStatistics {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  autoApprovedRequests: number;
  autoRejectedRequests: number;
  averageProcessingTimeMs: number;
}

export interface ModerationSettings {
  automaticModeration: boolean;
  sensitivityLevel: 'low' | 'medium' | 'high';
  enabledReasons: ModerationReason[];
  minConfidenceThreshold: number;
  autoRejectThreshold: number;
  autoApproveThreshold: number;
}

export interface ReportReason {
  id: string;
  name: string;
  description: string;
}

export interface Report {
  id: string;
  contentId: string;
  contentType: ContentType;
  reportedBy: string;
  reportReason: string;
  reportedAt: Date;
  status: 'pending' | 'reviewed' | 'dismissed';
  reviewedAt?: Date;
  reviewedBy?: string;
  notes?: string;
} 