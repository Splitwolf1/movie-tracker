import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MovieService } from '../../core/services/movie.service';
import { WatchlistService } from '../../core/services/watchlist.service';
import { AuthService } from '../../core/services/auth.service';
import { Review } from '../../core/models/review.model';
import { Movie } from '../../core/models/movie.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

// Add interfaces for video and cast member types
interface MovieVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  size: number;
  type: string;
}

interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string;
}

@Component({
  selector: 'app-movie-details',
  template: `
    <div class="movie-details-container" *ngIf="movie; else loadingTemplate">
      <div class="movie-header">
        <div class="poster-container">
          <img [src]="getPosterUrl(movie)" [alt]="movie.title" class="poster">
          
          <!-- Action Buttons - Only shown to logged in users -->
          <div class="action-buttons" *ngIf="isAuthenticated">
            <button mat-raised-button color="primary" class="action-btn" *ngIf="!isInWatchlist" (click)="addToWatchlist()">
              <mat-icon>bookmark</mat-icon> Add to Watchlist
            </button>
            <button mat-raised-button color="warn" class="action-btn" *ngIf="isInWatchlist" (click)="removeFromWatchlist()">
              <mat-icon>bookmark_remove</mat-icon> Remove from Watchlist
            </button>
            
            <button mat-raised-button color="accent" class="action-btn" (click)="openRatingDialog()">
              <mat-icon>star</mat-icon> Rate Movie
            </button>
          </div>
          
          <!-- Login Prompt for non-authenticated users -->
          <div class="login-prompt" *ngIf="!isAuthenticated">
            <p>Sign in to add to your watchlist, rate or review this movie</p>
            <button mat-raised-button color="primary" (click)="navigateToLogin()">
              Sign In
            </button>
          </div>
        </div>
        
        <div class="movie-info">
          <h1 class="title">{{ movie.title }}</h1>
          <div class="meta-info">
            <span class="release-date">{{ movie.release_date | date:'longDate' }}</span>
            <span class="runtime">{{ movie.runtime }} min</span>
            <span class="rating">
              <mat-icon>star</mat-icon>
              {{ movie.vote_average | number:'1.1-1' }}
            </span>
          </div>
          <div class="genres">
            <mat-chip-listbox>
              <mat-chip-option *ngFor="let genre of movie.genres">
                {{ genre.name }}
              </mat-chip-option>
            </mat-chip-listbox>
          </div>
          <p class="overview">{{ movie.overview }}</p>
        </div>
      </div>

      <div class="movie-content">
        <!-- Reviews Section -->
        <section class="reviews-section">
          <div class="section-header">
            <h2>Reviews</h2>
            <button 
              mat-raised-button 
              color="primary" 
              *ngIf="isAuthenticated" 
              (click)="showReviewForm = !showReviewForm">
              {{ showReviewForm ? 'Cancel' : 'Write a Review' }}
            </button>
          </div>
          
          <div class="review-form-container" *ngIf="showReviewForm">
            <app-review-form 
              [movie]="movie" 
              (submitReview)="submitReview($event)"
              (cancelReview)="showReviewForm = false">
            </app-review-form>
          </div>
          
          <div class="reviews-list" *ngIf="reviews.length > 0; else noReviews">
            <mat-card class="review-card" *ngFor="let review of reviews">
              <mat-card-header>
                <mat-icon mat-card-avatar>account_circle</mat-icon>
                <mat-card-title>{{ review.title }}</mat-card-title>
                <mat-card-subtitle>
                  <span class="review-author">User {{ review.userId.substring(0, 5) || 'Unknown' }}</span>
                  <span class="review-date">{{ review.createdAt | date }}</span>
                </mat-card-subtitle>
                <div class="review-rating">
                  <mat-icon>star</mat-icon>
                  <span>{{ review.rating }}/10</span>
                </div>
              </mat-card-header>
              
              <mat-card-content>
                <p class="spoiler-warning" *ngIf="review.containsSpoilers">
                  Contains spoilers
                </p>
                <p [class.spoiler-content]="review.containsSpoilers && !isReviewExpanded(review)">
                  {{ review.content }}
                </p>
                <button 
                  mat-button 
                  *ngIf="review.containsSpoilers && !isReviewExpanded(review)"
                  (click)="expandReview(review)">
                  Show Spoilers
                </button>
              </mat-card-content>
              
              <mat-card-actions *ngIf="currentUserId === review.userId">
                <button mat-button color="primary" (click)="editReview(review)">EDIT</button>
                <button mat-button color="warn" (click)="deleteReview(review.id)">DELETE</button>
              </mat-card-actions>
            </mat-card>
          </div>
          
          <ng-template #noReviews>
            <div class="no-reviews">
              <p>No reviews yet. Be the first to review this movie!</p>
            </div>
          </ng-template>
        </section>

        <section class="cast-section">
          <h2>Cast</h2>
          <div class="cast-grid">
            <div class="cast-member" *ngFor="let member of cast">
              <img [src]="getProfileUrl(member)" [alt]="member.name" class="profile">
              <div class="cast-info">
                <span class="name">{{ member.name }}</span>
                <span class="character">{{ member.character }}</span>
              </div>
            </div>
          </div>
        </section>

        <section class="trailers-section">
          <h2>Trailers</h2>
          <div class="trailers-grid">
            <div class="trailer" *ngFor="let trailer of trailers">
              <iframe
                [src]="getSafeUrl(trailer.key)"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen>
              </iframe>
            </div>
          </div>
        </section>

        <section class="similar-section">
          <h2>Similar Movies</h2>
          <div class="similar-grid">
            <mat-card class="similar-movie" *ngFor="let similar of similarMovies" (click)="navigateToMovieDetails(similar.id)">
              <img [src]="getPosterUrl(similar)" [alt]="similar.title" class="poster">
              <mat-card-content>
                <h3>{{ similar.title }}</h3>
                <div class="rating">
                  <mat-icon>star</mat-icon>
                  {{ similar.vote_average | number:'1.1-1' }}
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </section>
      </div>
    </div>

    <ng-template #loadingTemplate>
      <div class="loading-container">
        <app-loading-spinner></app-loading-spinner>
      </div>
    </ng-template>
  `,
  styles: [`
    .movie-details-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }
    .movie-header {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 2rem;
      margin-bottom: 3rem;
    }
    .poster-container {
      position: relative;
      padding-top: 150%;
    }
    .poster {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 8px;
    }
    .action-buttons {
      margin-top: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .action-btn {
      width: 100%;
    }
    .login-prompt {
      margin-top: 1rem;
      background: rgba(0,0,0,0.05);
      padding: 1rem;
      border-radius: 8px;
      text-align: center;
    }
    .login-prompt p {
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
      color: #666;
    }
    .movie-info {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .title {
      font-size: 2.5rem;
      margin: 0;
    }
    .meta-info {
      display: flex;
      gap: 1rem;
      color: #666;
    }
    .rating {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      color: #f5c518;
    }
    .genres {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .overview {
      font-size: 1.1rem;
      line-height: 1.6;
      color: #333;
    }
    
    /* Reviews Section */
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .reviews-section {
      margin-bottom: 2rem;
    }
    .review-form-container {
      background: #f9f9f9;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
    }
    .reviews-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .review-card {
      margin-bottom: 1rem;
    }
    .review-author {
      font-weight: 500;
    }
    .review-date {
      margin-left: 0.5rem;
      color: #888;
    }
    .review-rating {
      display: flex;
      align-items: center;
      color: #f5c518;
      margin-left: auto;
    }
    .spoiler-warning {
      display: inline-block;
      background: #f44336;
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
      margin-bottom: 0.5rem;
    }
    .spoiler-content {
      filter: blur(5px);
      user-select: none;
    }
    .no-reviews {
      text-align: center;
      padding: 2rem;
      background: #f9f9f9;
      border-radius: 8px;
      color: #666;
    }
    
    /* Cast Section */
    .cast-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }
    .cast-member {
      text-align: center;
    }
    .profile {
      width: 100%;
      aspect-ratio: 2/3;
      object-fit: cover;
      border-radius: 8px;
    }
    .cast-info {
      margin-top: 0.5rem;
    }
    .name {
      font-weight: 500;
      display: block;
    }
    .character {
      color: #666;
      font-size: 0.9rem;
    }
    
    /* Trailers Section */
    .trailers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }
    .trailer {
      position: relative;
      padding-top: 56.25%;
    }
    .trailer iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: 8px;
    }
    
    /* Similar Movies Section */
    .similar-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }
    .similar-movie {
      cursor: pointer;
      transition: transform 0.2s;
      &:hover {
        transform: translateY(-5px);
      }
    }
    .loading-container {
      min-height: 500px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    @media (max-width: 768px) {
      .movie-header {
        grid-template-columns: 1fr;
      }
      .poster-container {
        padding-top: 0;
        max-width: 300px;
        margin: 0 auto 2rem;
      }
      .poster {
        position: relative;
        height: auto;
      }
    }
  `]
})
export class MovieDetailsComponent implements OnInit {
  movie: Movie | null = null;
  cast: any[] = [];
  trailers: any[] = [];
  similarMovies: Movie[] = [];
  reviews: Review[] = [];
  loading = true;
  isInWatchlist = false;
  isAuthenticated = false;
  currentUserId: string | null = null;
  showReviewForm = false;
  expandedReviews: { [key: string]: boolean } = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private movieService: MovieService,
    private watchlistService: WatchlistService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    if (this.isAuthenticated) {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        this.currentUserId = currentUser.id;
      }
    }
    
    const movieId = this.route.snapshot.paramMap.get('id');
    if (movieId) {
      this.loadMovieDetails(Number(movieId));
      this.loadReviews(Number(movieId));
    }
  }

  private loadMovieDetails(movieId: number): void {
    this.loading = true;
    this.movieService.getMovieDetails(movieId).subscribe({
      next: (movie) => {
        this.movie = movie;
        this.loadCast(movieId);
        this.loadTrailers(movieId);
        this.loadSimilarMovies(movieId);
        
        if (this.isAuthenticated) {
          this.checkIfInWatchlist(movieId);
        }
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading movie details:', error);
        this.loading = false;
      }
    });
  }

  private loadCast(movieId: number): void {
    this.movieService.getMovieCast(movieId).subscribe({
      next: (cast) => {
        this.cast = cast.cast.slice(0, 10);
      },
      error: (error) => {
        console.error('Error loading cast:', error);
      }
    });
  }

  private loadTrailers(movieId: number): void {
    this.movieService.getMovieTrailers(movieId).subscribe({
      next: (videos) => {
        this.trailers = videos.results.filter((video: MovieVideo) => video.type === 'Trailer');
      },
      error: (error: any) => {
        console.error('Error loading trailers:', error);
      }
    });
  }

  private loadSimilarMovies(movieId: number): void {
    this.movieService.getSimilarMovies(movieId).subscribe({
      next: (movies) => {
        this.similarMovies = movies.results.slice(0, 6);
      },
      error: (error: any) => {
        console.error('Error loading similar movies:', error);
      }
    });
  }
  
  private loadReviews(movieId: number): void {
    this.movieService.getMovieReviews(movieId).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
        this.reviews.forEach(review => {
          if (review.id) {
            this.expandedReviews[review.id] = false;
          }
        });
      },
      error: (error) => {
        console.error('Error loading reviews', error);
      }
    });
  }

  checkIfInWatchlist(movieId: number): void {
    this.watchlistService.isInWatchlist(movieId).subscribe(isInWatchlist => {
      this.isInWatchlist = isInWatchlist;
    });
  }

  addToWatchlist(): void {
    if (!this.isAuthenticated) {
      this.promptLogin();
      return;
    }
    
    if (this.movie) {
      this.watchlistService.addToWatchlist(this.movie);
      this.isInWatchlist = true;
      
      this.snackBar.open(`Added "${this.movie.title}" to your watchlist`, 'View Watchlist', {
        duration: 3000
      }).onAction().subscribe(() => {
        // Navigate to watchlist
        this.router.navigate(['/watchlist']);
      });
    }
  }
  
  removeFromWatchlist(): void {
    if (this.movie) {
      this.watchlistService.removeFromWatchlist(this.movie.id);
      this.isInWatchlist = false;
      
      this.snackBar.open(`Removed "${this.movie.title}" from your watchlist`, 'Undo', {
        duration: 3000
      }).onAction().subscribe(() => {
        // Add the movie back if the user clicks "Undo"
        if (this.movie) {
          this.watchlistService.addToWatchlist(this.movie);
          this.isInWatchlist = true;
        }
      });
    }
  }
  
  openRatingDialog(): void {
    if (!this.isAuthenticated) {
      this.promptLogin();
      return;
    }
    
    // Open rating dialog component
    this.showReviewForm = true;
  }
  
  submitReview(reviewData: {title: string; content: string; rating: number; containsSpoilers: boolean}): void {
    if (!this.movie || !this.isAuthenticated) {
      this.snackBar.open('You must be logged in to submit a review', '', { duration: 3000 });
      return;
    }
    
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.snackBar.open('User information not available', '', { duration: 3000 });
      return;
    }
    
    const newReview: Partial<Review> = {
      movieId: this.movie.id,
      userId: currentUser.id,
      title: reviewData.title,
      content: reviewData.content,
      rating: reviewData.rating,
      containsSpoilers: reviewData.containsSpoilers,
      createdAt: new Date()
    };
    
    this.movieService.submitReview(newReview).subscribe({
      next: (addedReview: Review) => {
        this.reviews = [addedReview, ...this.reviews];
        this.showReviewForm = false;
        this.snackBar.open('Review submitted successfully', '', { duration: 3000 });
      },
      error: (error: any) => {
        console.error('Error submitting review:', error);
        this.snackBar.open('Failed to submit review', '', { duration: 3000 });
      }
    });
  }
  
  editReview(review: Review): void {
    if (!this.isAuthenticated) {
      return;
    }
    
    // Check if review has an ID
    if (!review.id) {
      console.error('Cannot edit review without an ID');
      return;
    }
    
    // Open dialog to edit review
    this.movieService.updateReview(review.id, review).subscribe({
      next: (updatedReview) => {
        const index = this.reviews.findIndex(r => r.id === updatedReview.id);
        if (index !== -1) {
          this.reviews[index] = updatedReview;
        }
        this.snackBar.open('Your review has been updated!', 'Close', {
          duration: 3000
        });
      },
      error: (error) => {
        console.error('Error updating review:', error);
      }
    });
  }
  
  deleteReview(reviewId: string | undefined): void {
    if (!reviewId) {
      this.snackBar.open('Cannot delete review: Invalid review ID', '', { duration: 3000 });
      return;
    }
    
    this.movieService.deleteReview(reviewId).subscribe({
      next: () => {
        this.reviews = this.reviews.filter(r => r.id !== reviewId);
        this.snackBar.open('Your review has been deleted.', 'Close', {
          duration: 3000
        });
      },
      error: (error) => {
        console.error('Error deleting review:', error);
      }
    });
  }
  
  navigateToLogin(): void {
    this.router.navigate(['/auth/login'], { 
      queryParams: { returnUrl: this.router.url } 
    });
  }
  
  promptLogin(): void {
    this.snackBar.open('Please sign in to access this feature', 'Sign In', {
      duration: 5000
    }).onAction().subscribe(() => {
      this.navigateToLogin();
    });
  }

  getPosterUrl(movie: Movie): string {
    return movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : 'assets/images/no-poster.jpg';
  }
  
  getBackdropUrl(movie: Movie): SafeResourceUrl {
    const url = movie.backdrop_path
      ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
      : 'assets/images/no-backdrop.jpg';
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getProfileUrl(castMember: CastMember): string {
    return castMember.profile_path
      ? `https://image.tmdb.org/t/p/w185${castMember.profile_path}`
      : 'assets/images/no-profile.jpg';
  }

  getSafeUrl(key: string): SafeResourceUrl {
    const url = `https://www.youtube.com/embed/${key}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  navigateToMovieDetails(movieId: number): void {
    // Navigate to the movie details page and refresh the component
    this.router.navigate(['/movie', movieId]).then(() => {
      window.scrollTo(0, 0);
    });
  }

  isReviewExpanded(review: Review): boolean {
    return review.id ? this.expandedReviews[review.id] : false;
  }

  expandReview(review: Review): void {
    if (review.id) {
      this.expandedReviews[review.id] = true;
    }
  }
} 