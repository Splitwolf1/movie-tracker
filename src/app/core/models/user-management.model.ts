import { User, UserRole } from './user.model';

export interface UserActivityLog {
  id: string;
  userId: string;
  action: UserActivityAction;
  details?: string;
  ip?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export enum UserActivityAction {
  LOGIN = 'login',
  LOGOUT = 'logout',
  PROFILE_UPDATE = 'profile_update',
  PASSWORD_CHANGE = 'password_change',
  ACCOUNT_CREATION = 'account_creation',
  PASSWORD_RESET = 'password_reset',
  REVIEW_CREATED = 'review_created',
  REVIEW_UPDATED = 'review_updated',
  REVIEW_DELETED = 'review_deleted',
  WATCHLIST_UPDATED = 'watchlist_updated',
  CUSTOM_LIST_CREATED = 'custom_list_created',
  CUSTOM_LIST_UPDATED = 'custom_list_updated',
  CUSTOM_LIST_DELETED = 'custom_list_deleted',
  FRIEND_REQUEST_SENT = 'friend_request_sent',
  FRIEND_REQUEST_ACCEPTED = 'friend_request_accepted',
  FRIEND_REMOVED = 'friend_removed',
  ACHIEVEMENT_EARNED = 'achievement_earned',
  CONTENT_REPORTED = 'content_reported',
  ADMIN_ACTION = 'admin_action'
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  BANNED = 'banned',
  INACTIVE = 'inactive',
  PENDING_VERIFICATION = 'pending_verification'
}

export interface UserStats {
  totalReviews: number;
  averageRating: number;
  watchlistCount: number;
  moviesWatched: number;
  listsCreated: number;
  friendsCount: number;
  achievementsEarned: number;
  lastLoginDate?: Date;
  registrationDate: Date;
  totalLogins: number;
}

export interface SuspensionRecord {
  id: string;
  userId: string;
  reason: string;
  suspendedBy: string;
  startDate: Date;
  endDate?: Date;
  notes?: string;
  isActive: boolean;
}

export interface UserFilters {
  searchQuery?: string;
  roles?: UserRole[];
  status?: UserStatus;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: 'username' | 'email' | 'createdAt' | 'lastLogin' | 'status';
  sortDirection?: 'asc' | 'desc';
}

export interface UserManagementStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  bannedUsers: number;
  inactiveUsers: number;
  pendingVerificationUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  usersByRole: Record<UserRole, number>;
}

export interface AdminActionLog {
  id: string;
  adminId: string;
  targetUserId: string;
  action: AdminAction;
  details: string;
  timestamp: Date;
  previousState?: any;
  newState?: any;
}

export enum AdminAction {
  USER_ROLE_CHANGED = 'user_role_changed',
  USER_SUSPENDED = 'user_suspended',
  USER_BANNED = 'user_banned',
  USER_ACTIVATED = 'user_activated',
  USER_DELETED = 'user_deleted',
  USER_PASSWORD_RESET = 'user_password_reset',
  CONTENT_MODERATED = 'content_moderated',
  SYSTEM_SETTINGS_CHANGED = 'system_settings_changed'
} 