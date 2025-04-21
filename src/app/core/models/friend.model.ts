export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: FriendRequestStatus;
  createdAt: Date;
  updatedAt?: Date;
}

export enum FriendRequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined'
}

export interface Friendship {
  id: string;
  userIds: string[];
  createdAt: Date;
}

export interface FriendProfile {
  id: string;
  username: string;
  avatar?: string;
  watchlistCount?: number;
  reviewsCount?: number;
  mutualFriendsCount?: number;
  isFriend: boolean;
  requestStatus?: FriendRequestStatus;
} 