import { ContentType } from './moderation.model';
import { User } from './user.model';
import { Movie } from './movie.model';
import { Review } from './review.model';
import { CustomList } from './custom-list.model';

export enum ContentStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  PUBLISHED = 'published',
  REJECTED = 'rejected',
  ARCHIVED = 'archived'
}

export enum ContentUpdateType {
  CREATED = 'created',
  UPDATED = 'updated',
  STATUS_CHANGED = 'status_changed',
  DELETED = 'deleted'
}

export interface ContentItem {
  id: string;
  title: string;
  description?: string;
  type: ContentType;
  status: ContentStatus;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  createdBy: string;
  views?: number;
  likes?: number;
  comments?: number;
  contentUrl?: string;
  imageUrl?: string;
  rejectionReason?: string;
  metadata?: Record<string, any>;
}

export interface ContentFilters {
  status?: ContentStatus;
  type?: ContentType;
  searchQuery?: string;
  dateFrom?: Date | string;
  dateTo?: Date | string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface ContentUpdate {
  id: string;
  contentId: string;
  updateType: ContentUpdateType;
  updatedBy: string;
  updatedAt: Date;
  previousStatus?: ContentStatus;
  newStatus?: ContentStatus;
  changes?: Record<string, any>;
  notes?: string;
}

export interface ContentStats {
  totalContent: number;
  contentByStatus: Record<ContentStatus, number>;
  contentByType: Record<ContentType, number>;
  pendingApproval: number;
  publishedToday: number;
  rejectedToday: number;
  avgPublishTime: number; // In minutes
}

export interface ApprovalRequest {
  id: string;
  contentId: string;
  contentType: ContentType;
  requestedBy: string;
  requestedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  notes?: string;
} 