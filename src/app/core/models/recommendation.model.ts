import { Movie } from './movie.model';

export enum RecommendationSource {
  WATCH_HISTORY = 'watch_history',
  RATINGS = 'ratings',
  GENRE_PREFERENCE = 'genre_preference',
  SIMILAR_USERS = 'similar_users',
  TRENDING = 'trending',
  DIRECTOR = 'director',
  ACTOR = 'actor'
}

export enum RecommendationStrength {
  WEAK = 'weak',
  MEDIUM = 'medium',
  STRONG = 'strong'
}

export interface RecommendationReason {
  source: RecommendationSource;
  description: string;
  strength: RecommendationStrength;
  relatedItemId?: number; // ID of related movie, actor, director, etc.
  relatedItemName?: string; // Name of related movie, actor, director, etc.
}

export interface Recommendation {
  movie: Movie;
  score: number; // 0-100 recommendation score
  reasons: RecommendationReason[];
}

export interface RecommendationSettings {
  enableRecommendations: boolean;
  includeWatchHistory: boolean;
  includeRatings: boolean;
  includeGenrePreferences: boolean;
  includeSimilarUsers: boolean;
  includeTrending: boolean;
  excludeGenres: string[]; // IDs of genres to exclude
  excludeWatched: boolean;
}

export interface GenrePreference {
  id: number;
  name: string;
  weight: number; // 0-10 preference weight
} 