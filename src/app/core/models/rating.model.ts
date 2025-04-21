import { Movie } from './movie.model';

export interface Rating {
  movieId: number;
  userId: string;
  rating: number;
  movie?: Movie;
  timestamp?: Date;
} 