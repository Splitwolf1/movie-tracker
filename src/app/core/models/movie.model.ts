import { Genre } from './genre.model';

/**
 * Represents a movie with all its details and metadata.
 * Contains both TMDb API properties and application-specific properties.
 */
export interface Movie {
  /** Unique identifier for the movie from TMDb */
  id: number;
  
  /** The title of the movie */
  title: string;
  
  /** Plot summary or description of the movie */
  overview: string;
  
  /** Relative path to the movie's poster image */
  poster_path: string;
  
  /** Relative path to the movie's backdrop image (optional) */
  backdrop_path?: string;
  
  /** Release date of the movie in format 'YYYY-MM-DD' */
  release_date: string;
  
  /** Array of genre IDs associated with the movie */
  genre_ids?: number[];
  
  /** Detailed genre information if available */
  genres?: Genre[];
  
  /** Average vote score on a scale of 0-10 */
  vote_average: number;
  
  /** Popularity score from TMDb */
  popularity: number;
  
  /** Indicates whether the user has watched this movie */
  watched?: boolean;
  
  /** Number of votes the movie has received */
  vote_count: number;
  
  /** Movie runtime in minutes (optional) */
  runtime?: number;
  
  /** Cast information for the movie */
  credits?: {
    cast: Array<{
      /** Actor's unique identifier */
      id: number;
      
      /** Actor's name */
      name: string;
      
      /** Character played by the actor */
      character: string;
      
      /** Relative path to the actor's profile image */
      profile_path: string | null;
    }>;
  };
  
  /** Trailers and video clips for the movie */
  videos?: {
    results: Array<{
      /** Unique identifier for the video */
      id: string;
      
      /** YouTube key for the video */
      key: string;
      
      /** Title of the video */
      name: string;
      
      /** Type of video (e.g., 'Trailer', 'Clip', 'Teaser') */
      type: string;
    }>;
  };
  
  /** Similar movies recommendations */
  similar?: {
    results: Movie[];
  };
  
  // User-specific properties
  
  /** User's personal rating for the movie */
  userRating?: number;
  
  /** Date when the user watched the movie */
  watchedDate?: Date;
}

/**
 * Response structure for TMDb API movie list endpoints.
 * Contains paginated movie results and metadata.
 */
export interface MovieResponse {
  /** Array of movie objects */
  results: Movie[];
  
  /** Current page number */
  page: number;
  
  /** Total number of available pages */
  total_pages: number;
  
  /** Total number of movies available */
  total_results: number;
} 