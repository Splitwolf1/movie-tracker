import { ContentType } from './moderation.model';

export enum ActionType {
  APPROVE = 'approve',
  REJECT = 'reject',
  DELETE = 'delete',
  FLAG = 'flag',
  REPORT = 'report',
  REVIEW = 'review'
}

export interface ActionLog {
  id: string;
  actionType: ActionType;
  contentId: string;
  contentType: ContentType;
  userId: string;
  timestamp: Date;
  details?: string;
  metadata?: Record<string, any>;
} 