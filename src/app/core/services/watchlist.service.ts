import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { take, tap, map } from 'rxjs/operators';
import { Movie } from '../models/movie.model';
import { MovieService } from './movie.service';
import { SocialService } from './social.service';
import { ContentType, PrivacyLevel } from '../models/social.model';

/**
 * Service responsible for managing the user's watchlist functionality.
 * Provides methods for adding, removing, sorting, and exporting movies in the watchlist.
 * Uses BehaviorSubject to maintain reactive state and exposes an Observable stream
 * for components to subscribe to watchlist changes.
 */
@Injectable({
  providedIn: 'root'
})
export class WatchlistService {
  /** BehaviorSubject that holds the current state of the watchlist */
  private watchlistSubject = new BehaviorSubject<Movie[]>([]);
  
  /** Observable stream of the watchlist that components can subscribe to */
  public watchlist$ = this.watchlistSubject.asObservable();

  /**
   * Creates an instance of WatchlistService.
   * @param movieService - Service for movie-related operations
   * @param socialService - Service for social sharing functionality
   */
  constructor(
    private movieService: MovieService,
    private socialService: SocialService
  ) {
    this.loadWatchlist();
  }

  /**
   * Loads the user's watchlist from the MovieService.
   * Called automatically when the service is instantiated.
   * @private
   */
  private loadWatchlist(): void {
    this.movieService.getWatchlist().pipe(
      take(1)
    ).subscribe(movies => {
      this.watchlistSubject.next(movies);
    });
  }

  /**
   * Gets the current watchlist as an Observable.
   * @returns Observable of the current list of movies in the watchlist
   */
  getWatchlist(): Observable<Movie[]> {
    return this.watchlist$;
  }

  /**
   * Adds a movie to the user's watchlist.
   * @param movie - The movie to add to the watchlist
   */
  addToWatchlist(movie: Movie): void {
    this.movieService.addToWatchlist(movie).pipe(
      take(1)
    ).subscribe(watchlist => {
      this.watchlistSubject.next(watchlist);
    });
  }

  /**
   * Removes a movie from the user's watchlist.
   * @param movieId - The ID of the movie to remove
   */
  removeFromWatchlist(movieId: number): void {
    this.movieService.removeFromWatchlist(movieId).pipe(
      take(1)
    ).subscribe(watchlist => {
      this.watchlistSubject.next(watchlist);
    });
  }

  /**
   * Checks if a movie is currently in the watchlist.
   * @param movieId - The ID of the movie to check
   * @returns Observable that emits true if the movie is in the watchlist, false otherwise
   */
  isInWatchlist(movieId: number): Observable<boolean> {
    return this.watchlist$.pipe(
      map(movies => movies.some(movie => movie.id === movieId))
    );
  }

  /**
   * Gets the current count of movies in the watchlist.
   * @returns Observable that emits the number of movies in the watchlist
   */
  getWatchlistCount(): Observable<number> {
    return this.watchlist$.pipe(
      map(movies => movies.length)
    );
  }

  /**
   * Marks a movie as watched and optionally adds a user rating.
   * Once marked as watched, the movie is removed from the watchlist.
   * @param movie - The movie to mark as watched
   * @param rating - Optional user rating for the movie
   */
  markAsWatched(movie: Movie, rating?: number): void {
    this.movieService.addToWatchHistory(movie, rating).pipe(
      take(1)
    ).subscribe(() => {
      this.removeFromWatchlist(movie.id);
    });
  }

  /**
   * Exports the current watchlist as a JSON file and triggers a download.
   * Creates a downloadable JSON file containing all the movie data.
   */
  exportWatchlist(): void {
    this.watchlist$.pipe(
      take(1)
    ).subscribe(watchlist => {
      const dataStr = JSON.stringify(watchlist, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = 'watchlist.json';
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    });
  }

  /**
   * Shares the watchlist with other users through the social service.
   * @param message - Optional message to attach to the shared watchlist
   * @param privacy - Privacy level for the shared watchlist (default: friends only)
   * @returns Observable that emits true if sharing was successful, false otherwise
   */
  shareWatchlist(message: string = '', privacy: PrivacyLevel = PrivacyLevel.FRIENDS): Observable<boolean> {
    return this.watchlist$.pipe(
      take(1),
      map(watchlist => {
        if (watchlist.length === 0) {
          return false;
        }
        
        // Create a watchlist ID for sharing
        const watchlistId = 'watchlist_' + Date.now().toString();
        
        // Store the watchlist in localStorage for reference
        localStorage.setItem(watchlistId, JSON.stringify(watchlist));
        
        // Share via social service
        this.socialService.shareContent(
          ContentType.LIST,
          watchlistId,
          message,
          privacy
        ).subscribe();
        
        return true;
      })
    );
  }

  /**
   * Gets watchlists that have been shared by other users.
   * @returns Observable that emits an array of shared watchlist content items
   */
  getSharedWatchlists(): Observable<any[]> {
    return this.socialService.getSharedContent(undefined, ContentType.LIST);
  }

  /**
   * Loads a specific shared watchlist by its ID.
   * @param watchlistId - The ID of the shared watchlist to load
   * @returns Observable that emits the loaded watchlist's movies or an empty array if not found
   */
  loadSharedWatchlist(watchlistId: string): Observable<Movie[]> {
    const storedWatchlist = localStorage.getItem(watchlistId);
    if (!storedWatchlist) {
      return new Observable<Movie[]>(observer => {
        observer.next([]);
        observer.complete();
      });
    }
    
    return new Observable<Movie[]>(observer => {
      observer.next(JSON.parse(storedWatchlist));
      observer.complete();
    });
  }

  /**
   * Sorts the watchlist by the specified criteria.
   * @param sortBy - The sort criteria ('title', 'releaseDate', or 'popularity')
   */
  sortWatchlist(sortBy: string): void {
    this.watchlist$.pipe(
      take(1)
    ).subscribe(watchlist => {
      let sortedWatchlist: Movie[] = [...watchlist];
      
      switch (sortBy) {
        case 'title':
          sortedWatchlist.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case 'releaseDate':
          sortedWatchlist.sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime());
          break;
        case 'popularity':
          sortedWatchlist.sort((a, b) => b.popularity - a.popularity);
          break;
        default:
          // Default sort by title
          sortedWatchlist.sort((a, b) => a.title.localeCompare(b.title));
      }
      
      this.watchlistSubject.next(sortedWatchlist);
    });
  }
} 