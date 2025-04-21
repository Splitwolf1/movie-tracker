import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { Review } from '../models/review.model';
import { MovieService } from './movie.service';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private baseUrl = environment.apiUrl;
  private storageKey = 'user_reviews';
  
  constructor(
    private http: HttpClient,
    private movieService: MovieService,
    private authService: AuthService
  ) {}
  
  // Get reviews for a specific movie
  getMovieReviews(movieId: number): Observable<Review[]> {
    // In a real app, we would call an API
    // For now, we'll use localStorage
    const allReviews = this.getStoredReviews();
    const movieReviews = allReviews.filter(review => review.movieId === movieId);
    
    return of(movieReviews).pipe(
      tap(reviews => {
        // Load movie details for each review if needed
        reviews.forEach(review => {
          if (!review.movie) {
            this.movieService.getMovieDetails(review.movieId).subscribe(
              movie => review.movie = movie
            );
          }
        });
      })
    );
  }
  
  // Get user's reviews
  getUserReviews(): Observable<Review[]> {
    const user = this.authService.getCurrentUser();
    if (!user || !user.id) {
      return of([]);
    }
    
    const allReviews = this.getStoredReviews();
    const userReviews = allReviews.filter(review => review.userId === user.id);
    
    return of(userReviews).pipe(
      tap(reviews => {
        // Load movie details for each review if needed
        reviews.forEach(review => {
          if (!review.movie) {
            this.movieService.getMovieDetails(review.movieId).subscribe(
              movie => review.movie = movie
            );
          }
        });
      })
    );
  }
  
  // Create a new review
  addReview(review: Omit<Review, 'id' | 'userId' | 'createdAt'>): Observable<Review | null> {
    const user = this.authService.getCurrentUser();
    if (!user || !user.id) {
      return of(null);
    }
    
    const allReviews = this.getStoredReviews();
    
    // Check if user already reviewed this movie
    const existingReview = allReviews.find(r => r.userId === user.id && r.movieId === review.movieId);
    
    if (existingReview) {
      // Update existing review
      const updatedReview = {
        ...existingReview,
        ...review,
        userId: user.id,
        updatedAt: new Date()
      };
      
      const updatedReviews = allReviews.map(r => 
        r.id === existingReview.id ? updatedReview : r
      );
      
      localStorage.setItem(this.storageKey, JSON.stringify(updatedReviews));
      return of(updatedReview);
    } else {
      // Create new review
      const newReview: Review = {
        ...review,
        id: this.generateId(),
        userId: user.id,
        createdAt: new Date(),
        likes: 0
      };
      
      const updatedReviews = [...allReviews, newReview];
      localStorage.setItem(this.storageKey, JSON.stringify(updatedReviews));
      
      return of(newReview);
    }
  }
  
  // Update an existing review
  updateReview(reviewId: string, updates: Partial<Review>): Observable<Review | null> {
    const user = this.authService.getCurrentUser();
    if (!user || !user.id) {
      return of(null);
    }
    
    const allReviews = this.getStoredReviews();
    const reviewToUpdate = allReviews.find(review => review.id === reviewId);
    
    if (!reviewToUpdate || reviewToUpdate.userId !== user.id) {
      return of(null);
    }
    
    const updatedReview = {
      ...reviewToUpdate,
      ...updates,
      updatedAt: new Date()
    };
    
    const updatedReviews = allReviews.map(review => 
      review.id === reviewId ? updatedReview : review
    );
    
    localStorage.setItem(this.storageKey, JSON.stringify(updatedReviews));
    return of(updatedReview);
  }
  
  // Delete a review
  deleteReview(reviewId: string): Observable<boolean> {
    const user = this.authService.getCurrentUser();
    if (!user || !user.id) {
      return of(false);
    }
    
    const allReviews = this.getStoredReviews();
    const reviewToDelete = allReviews.find(review => review.id === reviewId);
    
    if (!reviewToDelete || reviewToDelete.userId !== user.id) {
      return of(false);
    }
    
    const updatedReviews = allReviews.filter(review => review.id !== reviewId);
    localStorage.setItem(this.storageKey, JSON.stringify(updatedReviews));
    
    return of(true);
  }
  
  // Like a review
  likeReview(reviewId: string): Observable<Review | null> {
    const allReviews = this.getStoredReviews();
    const reviewToLike = allReviews.find(review => review.id === reviewId);
    
    if (!reviewToLike) {
      return of(null);
    }
    
    const updatedReview = {
      ...reviewToLike,
      likes: (reviewToLike.likes || 0) + 1
    };
    
    const updatedReviews = allReviews.map(review => 
      review.id === reviewId ? updatedReview : review
    );
    
    localStorage.setItem(this.storageKey, JSON.stringify(updatedReviews));
    return of(updatedReview);
  }
  
  // Private helper methods
  private getStoredReviews(): Review[] {
    const storedReviews = localStorage.getItem(this.storageKey);
    return storedReviews ? JSON.parse(storedReviews) : [];
  }
  
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
} 