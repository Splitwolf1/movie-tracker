export type UserRole = 'user' | 'admin' | 'moderator';

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  roles: UserRole[];
  createdAt: Date;
  lastLogin?: Date;
  bio?: string;
  preferences?: UserPreferences;
  isActive: boolean;
  accountStatus?: 'active' | 'suspended' | 'banned' | 'inactive' | 'pending_verification';
}

export interface UserProfile extends Omit<User, 'email'> {
  watchlistCount: number;
  reviewsCount: number;
  friendsCount: number;
  achievementsCount: number;
}

export interface UserPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  privateProfile: boolean;
  privateWatchlist: boolean;
  privateActivity: boolean;
  showAdultContent: boolean;
  defaultLanguage: string;
  theme: 'light' | 'dark' | 'system';
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AdminUserInfo extends User {
  totalLogins: number;
  lastIpAddress?: string;
  subscriptionTier?: string;
  accountStatus: 'active' | 'suspended' | 'banned';
  suspensionReason?: string;
  suspensionEndDate?: Date;
} 