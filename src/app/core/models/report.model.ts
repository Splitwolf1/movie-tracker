import { ContentType } from './moderation.model';

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