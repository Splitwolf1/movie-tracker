import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, forkJoin, combineLatest } from 'rxjs';
import { map, catchError, tap, switchMap, take } from 'rxjs/operators';

import { Movie } from '../models/movie.model';
import { Recommendation, RecommendationReason, RecommendationSettings, RecommendationSource, RecommendationStrength, GenrePreference } from '../models/recommendation.model';
import { MovieService } from './movie.service';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { NotificationService } from './notification.service';
import { Genre } from '../models/genre.model';
import { Rating } from '../models/rating.model';

// Extend MovieService interface to add the methods we need
interface ExtendedMovieService extends MovieService {
  getRatings?: () => Observable<Rating[]>;
  getMoviesByGenre?: (genreId: string) => Observable<Movie[]>;
  discoverMovies?: (params: any) => Observable<Movie[]>;
  getGenres?: () => Observable<Genre[]>;
}

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  private baseUrl = environment.apiUrl;
  private settingsKey = 'recommendation_settings';
  private genrePreferencesKey = 'genre_preferences';
  
  private recommendationsSubject = new BehaviorSubject<Recommendation[]>([]);
  public recommendations$ = this.recommendationsSubject.asObservable();
  
  constructor(
    private http: HttpClient,
    private movieService: MovieService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}
  
  /**
   * Generate recommendations for the current user
   * @returns Observable of recommendations
   */
  generateRecommendations(): Observable<Recommendation[]> {
    const user = this.authService.getCurrentUser();
    if (!user || !user.id) {
      return of([]);
    }
    
    return this.getRecommendationSettings().pipe(
      switchMap(settings => {
        if (!settings.enableRecommendations) {
          return of([]);
        }
        
        // Get data needed for recommendations
        const sources: Observable<Recommendation[]>[] = [];
        
        if (settings.includeWatchHistory) {
          sources.push(this.getRecommendationsFromWatchHistory(settings));
        }
        
        if (settings.includeRatings) {
          sources.push(this.getRecommendationsFromRatings(settings));
        }
        
        if (settings.includeGenrePreferences) {
          sources.push(this.getRecommendationsFromGenrePreferences(settings));
        }
        
        if (settings.includeTrending) {
          sources.push(this.getRecommendationsFromTrending(settings));
        }
        
        if (settings.includeSimilarUsers) {
          sources.push(this.getRecommendationsFromSimilarUsers(settings));
        }
        
        // If no sources, return empty array
        if (sources.length === 0) {
          return of([]);
        }
        
        // Combine all sources of recommendations
        return forkJoin(sources).pipe(
          map(recommendationArrays => {
            // Flatten array of arrays
            const allRecommendations = recommendationArrays.reduce((acc, curr) => [...acc, ...curr], []);
            
            // Deduplicate and aggregate scores and reasons
            const uniqueRecommendations = this.deduplicateAndAggregateRecommendations(allRecommendations);
            
            // Sort by score (descending)
            uniqueRecommendations.sort((a, b) => b.score - a.score);
            
            // Store recommendations
            this.recommendationsSubject.next(uniqueRecommendations);
            
            return uniqueRecommendations;
          })
        );
      })
    );
  }
  
  /**
   * Get current recommendations
   * @returns Observable of recommendations
   */
  getRecommendations(): Observable<Recommendation[]> {
    const recommendations = this.recommendationsSubject.getValue();
    
    // If recommendations are empty, generate new ones
    if (recommendations.length === 0) {
      return this.generateRecommendations();
    }
    
    return of(recommendations);
  }
  
  /**
   * Get recommendations from user's watch history
   * @param settings Recommendation settings
   * @returns Observable of recommendations
   */
  private getRecommendationsFromWatchHistory(settings: RecommendationSettings): Observable<Recommendation[]> {
    return this.movieService.getWatchHistory().pipe(
      take(1),
      switchMap(watchedMovies => {
        if (watchedMovies.length === 0) {
          return of([]);
        }
        
        // Get similar movies for each watched movie
        const requests = watchedMovies.map(movie => 
          this.movieService.getSimilarMovies(movie.id).pipe(
            map(similarMovies => this.mapToRecommendations(
              similarMovies,
              RecommendationSource.WATCH_HISTORY,
              movie.id,
              movie.title,
              `Because you watched ${movie.title}`
            ))
          )
        );
        
        return forkJoin(requests).pipe(
          switchMap(results => {
            // Flatten array of arrays
            const recommendations = results.reduce((acc, curr) => [...acc, ...curr], []);
            
            // Filter out already watched movies if setting is enabled
            if (settings.excludeWatched) {
              return this.filterOutWatchedMovies(recommendations, watchedMovies);
            }
            return of(recommendations);
          })
        );
      }),
      catchError(() => of([]))
    );
  }
  
  /**
   * Get recommendations from user's ratings
   * @param settings Recommendation settings
   * @returns Observable of recommendations
   */
  private getRecommendationsFromRatings(settings: RecommendationSettings): Observable<Recommendation[]> {
    // Cast to extended interface
    const extendedMovieService = this.movieService as ExtendedMovieService;
    
    // Check if method exists through a safer approach
    if (typeof extendedMovieService.getRatings !== 'function') {
      // Placeholder implementation
      return of([]);
    }
    
    return extendedMovieService.getRatings!().pipe(
      take(1),
      switchMap(ratings => {
        if (!ratings || ratings.length === 0) {
          return of([]);
        }
        
        // Sort by rating (descending)
        const sortedRatings = [...ratings].sort((a, b) => b.rating - a.rating);
        
        // Take top 5 rated movies
        const topRatedMovies = sortedRatings.slice(0, 5);
        
        // Get similar movies for each top rated movie
        const requests = topRatedMovies.map(rating => 
          this.movieService.getSimilarMovies(rating.movieId).pipe(
            map(similarMovies => this.mapToRecommendations(
              similarMovies,
              RecommendationSource.RATINGS,
              rating.movieId,
              rating.movie?.title || `Movie #${rating.movieId}`,
              `Because you rated ${rating.movie?.title || 'a similar movie'} highly`
            ))
          )
        );
        
        return forkJoin(requests).pipe(
          switchMap(results => {
            // Flatten array of arrays
            const recommendations = results.reduce((acc, curr) => [...acc, ...curr], []);
            
            // Filter out already watched movies if setting is enabled
            if (settings.excludeWatched) {
              return this.filterOutWatchedMovies(recommendations, []);
            }
            return of(recommendations);
          })
        );
      }),
      catchError(() => of([]))
    );
  }
  
  /**
   * Get recommendations from user's genre preferences
   * @param settings Recommendation settings
   * @returns Observable of recommendations
   */
  private getRecommendationsFromGenrePreferences(settings: RecommendationSettings): Observable<Recommendation[]> {
    // Cast to extended interface
    const extendedMovieService = this.movieService as ExtendedMovieService;
    
    return this.getGenrePreferences().pipe(
      switchMap(preferences => {
        if (preferences.length === 0) {
          return of([]);
        }
        
        // Sort by weight (descending)
        const sortedPreferences = [...preferences].sort((a, b) => b.weight - a.weight);
        
        // Take top 3 genres
        const topGenres = sortedPreferences.slice(0, 3);
        
        // Check if getMoviesByGenre method exists
        if (typeof extendedMovieService.getMoviesByGenre !== 'function') {
          // Fallback to discover movies with a safer approach
          const requests = topGenres.map(genre => {
            // If discoverMovies doesn't exist, create a safe fallback
            if (typeof extendedMovieService.discoverMovies !== 'function') {
              return of([]).pipe(
                map(movies => this.mapToRecommendations(
                  [],
                  RecommendationSource.GENRE_PREFERENCE,
                  genre.id,
                  genre.name,
                  `Because you like ${genre.name} movies`
                ))
              );
            }
            
            return extendedMovieService.discoverMovies!({ with_genres: genre.id.toString() }).pipe(
              map(movies => this.mapToRecommendations(
                movies,
                RecommendationSource.GENRE_PREFERENCE,
                genre.id,
                genre.name,
                `Because you like ${genre.name} movies`
              ))
            );
          });
          
          return forkJoin(requests).pipe(
            switchMap(results => {
              // Flatten array of arrays
              const recommendations = results.reduce((acc, curr) => [...acc, ...curr], []);
              
              // Filter out already watched movies if setting is enabled
              if (settings.excludeWatched) {
                return this.filterOutWatchedMovies(recommendations, []);
              }
              return of(recommendations);
            })
          );
        }
        
        // Get movies for each top genre
        const requests = topGenres.map(genre => 
          extendedMovieService.getMoviesByGenre!(genre.id.toString()).pipe(
            map(movies => this.mapToRecommendations(
              movies,
              RecommendationSource.GENRE_PREFERENCE,
              genre.id,
              genre.name,
              `Because you like ${genre.name} movies`
            ))
          )
        );
        
        return forkJoin(requests).pipe(
          switchMap(results => {
            // Flatten array of arrays
            const recommendations = results.reduce((acc, curr) => [...acc, ...curr], []);
            
            // Filter out already watched movies if setting is enabled
            if (settings.excludeWatched) {
              return this.filterOutWatchedMovies(recommendations, []);
            }
            return of(recommendations);
          })
        );
      }),
      catchError(() => of([]))
    );
  }
  
  /**
   * Get recommendations from trending movies
   * @param settings Recommendation settings
   * @returns Observable of recommendations
   */
  private getRecommendationsFromTrending(settings: RecommendationSettings): Observable<Recommendation[]> {
    return this.movieService.getTrendingMovies().pipe(
      switchMap(movies => {
        const recommendations = this.mapToRecommendations(
          movies,
          RecommendationSource.TRENDING,
          undefined,
          undefined,
          'Because this is trending now'
        );
        
        // Filter out already watched movies if setting is enabled
        if (settings.excludeWatched) {
          return this.filterOutWatchedMovies(recommendations, []);
        }
        return of(recommendations);
      }),
      catchError(() => of([]))
    );
  }
  
  /**
   * Get recommendations from similar users
   * @param settings Recommendation settings
   * @returns Observable of recommendations
   */
  private getRecommendationsFromSimilarUsers(settings: RecommendationSettings): Observable<Recommendation[]> {
    // In a real app, this would use a more sophisticated algorithm
    // For now, we'll just return popular movies
    return this.movieService.getPopularMovies().pipe(
      switchMap(movies => {
        const recommendations = this.mapToRecommendations(
          movies,
          RecommendationSource.SIMILAR_USERS,
          undefined,
          undefined,
          'Because people with similar tastes enjoyed this'
        );
        
        // Filter out already watched movies if setting is enabled
        if (settings.excludeWatched) {
          return this.filterOutWatchedMovies(recommendations, []);
        }
        return of(recommendations);
      }),
      catchError(() => of([]))
    );
  }
  
  /**
   * Map movies to recommendations
   * @param movies Movies to map
   * @param source Recommendation source
   * @param relatedItemId Related item ID
   * @param relatedItemName Related item name
   * @param description Recommendation description
   * @returns Array of recommendations
   */
  private mapToRecommendations(
    movies: Movie[], 
    source: RecommendationSource,
    relatedItemId?: number,
    relatedItemName?: string,
    description?: string
  ): Recommendation[] {
    return movies.map(movie => {
      const baseScore = this.calculateBaseScore(movie, source);
      
      const reason: RecommendationReason = {
        source,
        description: description || 'Recommended for you',
        strength: this.getStrengthFromScore(baseScore),
        relatedItemId,
        relatedItemName
      };
      
      return {
        movie,
        score: baseScore,
        reasons: [reason]
      };
    });
  }
  
  /**
   * Calculate base recommendation score for a movie
   * @param movie Movie to calculate score for
   * @param source Recommendation source
   * @returns Recommendation score (0-100)
   */
  private calculateBaseScore(movie: Movie, source: RecommendationSource): number {
    let baseScore = 0;
    
    // Start with a score based on movie popularity and vote average
    if (movie.vote_average) {
      // Convert vote_average (0-10) to 0-50 scale
      baseScore += (movie.vote_average / 10) * 50;
    }
    
    if (movie.popularity) {
      // Normalize popularity (roughly 0-1000) to 0-25 scale
      const popularityScore = Math.min(movie.popularity / 40, 25);
      baseScore += popularityScore;
    }
    
    // Adjust base score based on source
    switch (source) {
      case RecommendationSource.WATCH_HISTORY:
        baseScore *= 1.2; // 20% boost
        break;
      case RecommendationSource.RATINGS:
        baseScore *= 1.3; // 30% boost
        break;
      case RecommendationSource.GENRE_PREFERENCE:
        baseScore *= 1.1; // 10% boost
        break;
      case RecommendationSource.TRENDING:
        baseScore *= 1.0; // No adjustment
        break;
      case RecommendationSource.SIMILAR_USERS:
        baseScore *= 1.05; // 5% boost
        break;
      case RecommendationSource.DIRECTOR:
        baseScore *= 1.15; // 15% boost
        break;
      case RecommendationSource.ACTOR:
        baseScore *= 1.1; // 10% boost
        break;
    }
    
    // Cap score at 100
    return Math.min(Math.round(baseScore), 100);
  }
  
  /**
   * Get recommendation strength from score
   * @param score Recommendation score
   * @returns Recommendation strength
   */
  private getStrengthFromScore(score: number): RecommendationStrength {
    if (score >= 80) {
      return RecommendationStrength.STRONG;
    } else if (score >= 60) {
      return RecommendationStrength.MEDIUM;
    } else {
      return RecommendationStrength.WEAK;
    }
  }
  
  /**
   * Filter out watched movies from recommendations
   * @param recommendations Recommendations to filter
   * @param watchedMovies Optional array of watched movies
   * @returns Filtered recommendations
   */
  private filterOutWatchedMovies(recommendations: Recommendation[], watchedMovies: Movie[] = []): Observable<Recommendation[]> {
    // If watched movies are provided, use them
    if (watchedMovies.length > 0) {
      const watchedIds = new Set(watchedMovies.map(movie => movie.id));
      return of(recommendations.filter(rec => !watchedIds.has(rec.movie.id)));
    }
    
    // Otherwise, get watched movies from service
    return this.movieService.getWatchHistory().pipe(
      take(1),
      map(history => {
        const watchedIds = new Set(history.map(movie => movie.id));
        return recommendations.filter(rec => !watchedIds.has(rec.movie.id));
      })
    );
  }
  
  /**
   * Deduplicate recommendations and aggregate scores and reasons
   * @param recommendations Recommendations to deduplicate
   * @returns Deduplicated recommendations
   */
  private deduplicateAndAggregateRecommendations(recommendations: Recommendation[]): Recommendation[] {
    const movieMap = new Map<number, Recommendation>();
    
    for (const rec of recommendations) {
      const movieId = rec.movie.id;
      
      if (movieMap.has(movieId)) {
        // Movie already exists, update score and reasons
        const existingRec = movieMap.get(movieId)!;
        
        // Aggregate score (use max score)
        existingRec.score = Math.max(existingRec.score, rec.score);
        
        // Add new reasons
        existingRec.reasons = [...existingRec.reasons, ...rec.reasons];
      } else {
        // New movie, add to map
        movieMap.set(movieId, { ...rec });
      }
    }
    
    return Array.from(movieMap.values());
  }
  
  /**
   * Get user's recommendation settings
   * @returns Observable of recommendation settings
   */
  getRecommendationSettings(): Observable<RecommendationSettings> {
    const user = this.authService.getCurrentUser();
    if (!user || !user.id) {
      return of(this.getDefaultSettings());
    }
    
    const storedSettings = localStorage.getItem(`${this.settingsKey}_${user.id}`);
    if (!storedSettings) {
      return of(this.getDefaultSettings());
    }
    
    return of(JSON.parse(storedSettings));
  }
  
  /**
   * Save user's recommendation settings
   * @param settings Settings to save
   * @returns Observable of saved settings
   */
  saveRecommendationSettings(settings: RecommendationSettings): Observable<RecommendationSettings> {
    const user = this.authService.getCurrentUser();
    if (!user || !user.id) {
      return of(settings);
    }
    
    localStorage.setItem(`${this.settingsKey}_${user.id}`, JSON.stringify(settings));
    
    // Regenerate recommendations if settings changed
    this.generateRecommendations().subscribe();
    
    return of(settings);
  }
  
  /**
   * Get default recommendation settings
   * @returns Default settings
   */
  private getDefaultSettings(): RecommendationSettings {
    return {
      enableRecommendations: true,
      includeWatchHistory: true,
      includeRatings: true,
      includeGenrePreferences: true,
      includeSimilarUsers: true,
      includeTrending: true,
      excludeGenres: [],
      excludeWatched: true
    };
  }
  
  /**
   * Get user's genre preferences
   * @returns Observable of genre preferences
   */
  getGenrePreferences(): Observable<GenrePreference[]> {
    const user = this.authService.getCurrentUser();
    if (!user || !user.id) {
      return of([]);
    }
    
    const storedPreferences = localStorage.getItem(`${this.genrePreferencesKey}_${user.id}`);
    if (!storedPreferences) {
      return this.generateInitialGenrePreferences();
    }
    
    return of(JSON.parse(storedPreferences));
  }
  
  /**
   * Save user's genre preferences
   * @param preferences Preferences to save
   * @returns Observable of saved preferences
   */
  saveGenrePreferences(preferences: GenrePreference[]): Observable<GenrePreference[]> {
    const user = this.authService.getCurrentUser();
    if (!user || !user.id) {
      return of(preferences);
    }
    
    localStorage.setItem(`${this.genrePreferencesKey}_${user.id}`, JSON.stringify(preferences));
    
    // Regenerate recommendations if preferences changed
    this.generateRecommendations().subscribe();
    
    return of(preferences);
  }
  
  /**
   * Generate initial genre preferences based on user's watch history
   * @returns Observable of genre preferences
   */
  private generateInitialGenrePreferences(): Observable<GenrePreference[]> {
    // Cast to extended interface
    const extendedMovieService = this.movieService as ExtendedMovieService;
    
    // Check if getGenres method exists safely
    if (typeof extendedMovieService.getGenres !== 'function') {
      // Placeholder implementation using hardcoded popular genres
      const popularGenres = [
        { id: 28, name: 'Action' },
        { id: 12, name: 'Adventure' },
        { id: 16, name: 'Animation' },
        { id: 35, name: 'Comedy' },
        { id: 80, name: 'Crime' },
        { id: 99, name: 'Documentary' },
        { id: 18, name: 'Drama' },
        { id: 10751, name: 'Family' },
        { id: 14, name: 'Fantasy' },
        { id: 36, name: 'History' },
        { id: 27, name: 'Horror' },
        { id: 10402, name: 'Music' },
        { id: 9648, name: 'Mystery' },
        { id: 10749, name: 'Romance' },
        { id: 878, name: 'Science Fiction' },
        { id: 10770, name: 'TV Movie' },
        { id: 53, name: 'Thriller' },
        { id: 10752, name: 'War' },
        { id: 37, name: 'Western' }
      ];
      
      // Start with all genres at weight 5 (neutral)
      const initialPreferences = popularGenres.map(genre => ({
        id: genre.id,
        name: genre.name,
        weight: 5
      }));
      
      return of(initialPreferences);
    }
    
    return extendedMovieService.getGenres!().pipe(
      switchMap(genres => {
        if (!genres) {
          return of([]);
        }
        
        // Start with all genres at weight 5 (neutral)
        const initialPreferences = genres.map(genre => ({
          id: typeof genre.id === 'string' ? parseInt(genre.id) : genre.id,
          name: genre.name,
          weight: 5
        }));
        
        return this.movieService.getWatchHistory().pipe(
          map(watchedMovies => {
            if (watchedMovies.length === 0) {
              return initialPreferences;
            }
            
            // Count genres in watch history
            const genreCounts = new Map<number, number>();
            watchedMovies.forEach(movie => {
              if (movie.genre_ids) {
                movie.genre_ids.forEach((genreId: number) => {
                  const count = genreCounts.get(genreId) || 0;
                  genreCounts.set(genreId, count + 1);
                });
              }
            });
            
            // Adjust weights based on watch history
            return initialPreferences.map(pref => {
              const count = genreCounts.get(pref.id) || 0;
              // Adjust weight based on frequency in watch history
              // Each watched movie with this genre adds 1 to the weight, up to 10
              const newWeight = Math.min(5 + count, 10);
              return { ...pref, weight: newWeight };
            });
          })
        );
      }),
      tap(preferences => {
        // Save generated preferences
        const user = this.authService.getCurrentUser();
        if (user && user.id) {
          localStorage.setItem(`${this.genrePreferencesKey}_${user.id}`, JSON.stringify(preferences));
        }
      }),
      catchError(() => of([]))
    );
  }
  
  /**
   * Update genre preferences based on user's rating of a movie
   * @param movieId Movie ID
   * @param rating Rating (1-5)
   * @returns Observable of updated preferences
   */
  updateGenrePreferencesFromRating(movieId: number, rating: number): Observable<GenrePreference[]> {
    return this.movieService.getMovieDetails(movieId).pipe(
      switchMap(movie => {
        if (!movie.genres || movie.genres.length === 0) {
          return of([]);
        }
        
        return this.getGenrePreferences().pipe(
          map(preferences => {
            const genreIds = movie.genres?.map(g => g.id) || [];
            
            // Adjust weights based on rating
            // Rating 1-2: decrease weight, 4-5: increase weight, 3: no change
            let adjustment = 0;
            if (rating <= 2) {
              adjustment = -1;
            } else if (rating >= 4) {
              adjustment = 1;
            }
            
            return preferences.map(pref => {
              if (genreIds.includes(pref.id)) {
                // Keep weight between 1-10
                const newWeight = Math.max(1, Math.min(10, pref.weight + adjustment));
                return { ...pref, weight: newWeight };
              }
              return pref;
            });
          }),
          switchMap(updatedPreferences => this.saveGenrePreferences(updatedPreferences))
        );
      }),
      catchError(() => of([]))
    );
  }
  
  /**
   * Recommend a specific movie to another user
   * @param movieId Movie ID
   * @param userId Target user ID
   * @returns Observable of success
   */
  recommendMovieToUser(movieId: number, userId: string): Observable<boolean> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      return of(false);
    }
    
    return this.movieService.getMovieDetails(movieId).pipe(
      switchMap(movie => {
        return this.notificationService.createMovieRecommendationNotification(
          userId,
          currentUser.username || 'A friend',
          movieId.toString(),
          movie.title,
          currentUser.avatar
        ).pipe(
          map(() => true)
        );
      }),
      catchError(() => of(false))
    );
  }
} 