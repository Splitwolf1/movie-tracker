import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Movie } from '../models/movie.model';
import { environment } from '../../../environments/environment';
import { Review } from '../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private apiKey = environment.tmdbApiKey;
  private baseUrl = 'https://api.themoviedb.org/3';

  constructor(private http: HttpClient) {}

  getPopularMovies(page: number = 1): Observable<any> {
    const url = `${this.baseUrl}/movie/popular?api_key=${this.apiKey}&page=${page}`;
    return this.http.get(url).pipe(
      catchError(this.handleError('getPopularMovies', { results: [] }))
    );
  }

  getTrendingMovies(timeWindow: string = 'day'): Observable<any> {
    const url = `${this.baseUrl}/trending/movie/${timeWindow}?api_key=${this.apiKey}`;
    return this.http.get(url).pipe(
      catchError(this.handleError('getTrendingMovies', { results: [] }))
    );
  }

  getUpcomingMovies(page: number = 1): Observable<any> {
    const url = `${this.baseUrl}/movie/upcoming?api_key=${this.apiKey}&page=${page}`;
    return this.http.get(url).pipe(
      catchError(this.handleError('getUpcomingMovies', { results: [] }))
    );
  }

  getPopularActors(page: number = 1): Observable<any> {
    const url = `${this.baseUrl}/person/popular?api_key=${this.apiKey}&page=${page}`;
    return this.http.get(url).pipe(
      catchError(this.handleError('getPopularActors', { results: [] }))
    );
  }

  getMovieDetails(id: number): Observable<Movie> {
    const url = `${this.baseUrl}/movie/${id}?api_key=${this.apiKey}&append_to_response=credits,videos`;
    return this.http.get<Movie>(url).pipe(
      catchError(this.handleError<Movie>(`getMovieDetails id=${id}`))
    );
  }

  searchMovies(query: string, page: number = 1): Observable<any> {
    if (!query.trim()) {
      return of({ results: [] });
    }
    const url = `${this.baseUrl}/search/movie?api_key=${this.apiKey}&query=${query}&page=${page}`;
    return this.http.get(url).pipe(
      catchError(this.handleError('searchMovies', { results: [] }))
    );
  }

  getMovieRecommendations(id: number): Observable<any> {
    const url = `${this.baseUrl}/movie/${id}/recommendations?api_key=${this.apiKey}`;
    return this.http.get(url).pipe(
      catchError(this.handleError('getMovieRecommendations', { results: [] }))
    );
  }

  // Added missing methods required by DetailsComponent
  getMovieCast(id: number): Observable<any> {
    const url = `${this.baseUrl}/movie/${id}/credits?api_key=${this.apiKey}`;
    return this.http.get(url).pipe(
      catchError(this.handleError('getMovieCast', { cast: [], crew: [] }))
    );
  }
  
  getMovieTrailers(id: number): Observable<any> {
    const url = `${this.baseUrl}/movie/${id}/videos?api_key=${this.apiKey}`;
    return this.http.get(url).pipe(
      catchError(this.handleError('getMovieTrailers', { results: [] }))
    );
  }
  
  getSimilarMovies(id: number): Observable<any> {
    const url = `${this.baseUrl}/movie/${id}/similar?api_key=${this.apiKey}`;
    return this.http.get(url).pipe(
      catchError(this.handleError('getSimilarMovies', { results: [] }))
    );
  }

  // Watchlist management methods
  // In a real app, these would interact with a backend
  // For now, we'll use localStorage

  getWatchlist(): Observable<Movie[]> {
    const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
    return of(watchlist);
  }

  addToWatchlist(movie: Movie): Observable<Movie[]> {
    return this.getWatchlist().pipe(
      map(watchlist => {
        // Check if movie is already in watchlist
        if (!watchlist.some(m => m.id === movie.id)) {
          const updatedWatchlist = [...watchlist, movie];
          localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
          return updatedWatchlist;
        }
        return watchlist;
      })
    );
  }

  removeFromWatchlist(movieId: number): Observable<Movie[]> {
    return this.getWatchlist().pipe(
      map(watchlist => {
        const updatedWatchlist = watchlist.filter(movie => movie.id !== movieId);
        localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
        return updatedWatchlist;
      })
    );
  }

  // Watch history methods
  getWatchHistory(): Observable<any[]> {
    const history = JSON.parse(localStorage.getItem('watchHistory') || '[]');
    return of(history);
  }

  addToWatchHistory(movie: Movie, rating?: number): Observable<any[]> {
    return this.getWatchHistory().pipe(
      map(history => {
        const watchedMovie = {
          ...movie,
          watchedDate: new Date(),
          userRating: rating
        };
        
        // Remove from history if already exists
        const filteredHistory = history.filter(m => m.id !== movie.id);
        
        // Add to beginning of array
        const updatedHistory = [watchedMovie, ...filteredHistory];
        localStorage.setItem('watchHistory', JSON.stringify(updatedHistory));
        return updatedHistory;
      })
    );
  }

  removeFromWatchHistory(movieId: number): Observable<any[]> {
    return this.getWatchHistory().pipe(
      map(history => {
        const updatedHistory = history.filter(movie => movie.id !== movieId);
        localStorage.setItem('watchHistory', JSON.stringify(updatedHistory));
        return updatedHistory;
      })
    );
  }

  updateMovieRating(movieId: number, rating: number): Observable<any[]> {
    return this.getWatchHistory().pipe(
      map(history => {
        const updatedHistory = history.map(movie => {
          if (movie.id === movieId) {
            return { ...movie, userRating: rating };
          }
          return movie;
        });
        localStorage.setItem('watchHistory', JSON.stringify(updatedHistory));
        return updatedHistory;
      })
    );
  }

  /**
   * Get reviews for a specific movie
   * @param movieId The movie ID
   * @returns An Observable of the movie reviews
   */
  getMovieReviews(movieId: number): Observable<Review[]> {
    // In a real app, this would call the backend API
    // For now, we'll return mock data from local storage
    const storedReviews = localStorage.getItem('movieReviews');
    let reviews: Review[] = storedReviews ? JSON.parse(storedReviews) : [];
    
    // Filter reviews for this movie
    return of(reviews.filter(review => review.movieId === movieId));
  }

  /**
   * Submit a new review for a movie
   * @param reviewData The review data to submit
   * @returns An Observable of the created review
   */
  submitReview(reviewData: Partial<Review>): Observable<Review> {
    // In a real app, this would call the backend API
    // For now, we'll store in local storage
    
    const storedReviews = localStorage.getItem('movieReviews');
    let reviews: Review[] = storedReviews ? JSON.parse(storedReviews) : [];
    
    // Get current user from localStorage (this would use AuthService in a real app)
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    // Create new review
    const newReview: Review = {
      id: this.generateReviewId(),
      userId: currentUser.id || 'user-1',
      movieId: reviewData.movieId || 0,
      title: reviewData.title || '',
      content: reviewData.content || '',
      rating: reviewData.rating || 5,
      containsSpoilers: reviewData.containsSpoilers || false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Add to reviews array
    reviews.unshift(newReview);
    localStorage.setItem('movieReviews', JSON.stringify(reviews));
    
    return of(newReview);
  }

  /**
   * Update an existing review
   * @param reviewId The ID of the review to update
   * @param updatedData The updated review data
   * @returns An Observable of the updated review
   */
  updateReview(reviewId: string, reviewData: Partial<Review>): Observable<Review> {
    const storedReviews = localStorage.getItem('movieReviews');
    let reviews: Review[] = storedReviews ? JSON.parse(storedReviews) : [];
    
    const index = reviews.findIndex(r => r.id === reviewId);
    
    if (index !== -1) {
      // Get existing review
      const existingReview = reviews[index];
      
      // Get review data
      const updatedReview: Review = {
        ...existingReview,
        title: reviewData.title || existingReview.title,
        content: reviewData.content || existingReview.content,
        rating: reviewData.rating || existingReview.rating,
        containsSpoilers: reviewData.containsSpoilers !== undefined ? 
          reviewData.containsSpoilers : existingReview.containsSpoilers,
        updatedAt: new Date()
      };
      
      // Update reviews array
      reviews[index] = updatedReview;
      localStorage.setItem('movieReviews', JSON.stringify(reviews));
      
      return of(updatedReview);
    }
    
    // Review not found
    return new Observable(observer => {
      observer.error('Review not found');
    });
  }

  /**
   * Delete a review
   * @param reviewId The ID of the review to delete
   * @returns An Observable indicating success
   */
  deleteReview(reviewId: string): Observable<boolean> {
    const storedReviews = localStorage.getItem('movieReviews');
    let reviews: Review[] = storedReviews ? JSON.parse(storedReviews) : [];
    
    const filteredReviews = reviews.filter(r => r.id !== reviewId);
    
    if (filteredReviews.length !== reviews.length) {
      localStorage.setItem('movieReviews', JSON.stringify(filteredReviews));
      return of(true);
    }
    
    // Review not found
    return of(false);
  }
  
  /**
   * Generate a unique ID for a review
   * @returns A unique string ID
   */
  private generateReviewId(): string {
    return 'review-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      
      // Let the app keep running by returning an empty result
      return of(result as T);
    };
  }
} 