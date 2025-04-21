import { User } from './user.model';
import { Movie } from './movie.model';
import { Review } from './review.model';

export interface Comment {
  id: string;
  userId: string;
  user?: User;
  movieId: string;
  movie?: Movie;
  content: string;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
  status?: 'pending' | 'approved' | 'rejected';
  reports?: number;
  username?: string;
  userAvatar?: string;
  parentId?: string;
}

export interface CommentResponse {
  comments: Comment[];
  total: number;
  page: number;
  pageSize: number;
}

export enum ContentType {
  MOVIE = 'movie',
  REVIEW = 'review',
  LIST = 'list',
  PROFILE = 'profile'
}

export interface CommentThread {
  id: string;
  contentType: ContentType;
  contentId: string;
  comments: Comment[];
}

export interface SharedContent {
  id: string;
  userId: string;
  username: string;
  contentType: ContentType;
  contentId: string;
  message: string;
  createdAt: Date;
  privacy: PrivacyLevel;
  likes: number;
}

export enum PrivacyLevel {
  PUBLIC = 'public',
  FRIENDS = 'friends',
  PRIVATE = 'private'
}

export interface WatchlistSummary {
  id: string;
  name: string;
  userId: string;
  itemCount: number;
  posterUrls: string[];
  privacy: PrivacyLevel;
}

export interface Activity {
  id: string;
  type: ActivityType;
  userId: string;
  username: string;
  userAvatar?: string;
  contentType?: ContentType;
  contentId?: string;
  friendId?: string;
  createdAt: Date;
}

export enum ActivityType {
  CONTENT_SHARED = 'content_shared',
  COMMENT_ADDED = 'comment_added',
  FRIEND_ADDED = 'friend_added',
  MOVIE_RATED = 'movie_rated',
  MOVIE_WATCHED = 'movie_watched',
  MOVIE_ADDED = 'movie_added'
} 