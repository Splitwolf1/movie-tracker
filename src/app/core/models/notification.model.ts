import { ContentType } from './social.model';

export enum NotificationType {
  FRIEND_REQUEST = 'friend_request',
  FRIEND_ACCEPTED = 'friend_accepted',
  WATCHLIST_SHARED = 'watchlist_shared',
  COMMENT_ADDED = 'comment_added',
  MOVIE_RECOMMENDATION = 'movie_recommendation',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  SYSTEM_NOTIFICATION = 'system_notification'
}

export interface Notification {
  id: string;
  type: NotificationType;
  userId: string;         // User who should receive the notification
  createdAt: Date;
  isRead: boolean;
  
  // Content-related fields
  title: string;
  message: string;
  
  // Fields for specific notification types
  senderId?: string;      // User who triggered the notification (if applicable)
  senderName?: string;    // Name of sender for display
  senderAvatar?: string;  // Avatar of sender for display
  contentId?: string;     // ID of related content (movie, review, watchlist, etc.)
  contentType?: ContentType; // Type of related content
  actionUrl?: string;     // URL to navigate to when notification is clicked
}

export interface NotificationPreferences {
  friendRequests: boolean;
  friendActivity: boolean;
  comments: boolean;
  recommendations: boolean;
  achievements: boolean;
  systemNotifications: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
} 