import { Movie } from './movie.model';

export interface Review {
  id?: string;
  userId: string;
  movieId: number;
  movie?: Movie;
  title: string;
  content: string;
  rating: number;
  createdAt: Date;
  updatedAt?: Date;
  likes?: number;
  containsSpoilers?: boolean;
} 