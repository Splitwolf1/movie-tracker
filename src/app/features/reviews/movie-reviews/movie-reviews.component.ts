import { Component, OnInit, Input } from '@angular/core';
import { Review } from '../../../core/models/review.model';
import { Movie } from '../../../core/models/movie.model';
import { ReviewService } from '../../../core/services/review.service';
import { AuthService } from '../../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-movie-reviews',
  templateUrl: './movie-reviews.component.html',
  styleUrls: ['./movie-reviews.component.scss']
})
export class MovieReviewsComponent implements OnInit {
  @Input() movie!: Movie;
  
  reviews: Review[] = [];
  isLoading = false;
  showAddReviewForm = false;
  reviewToEdit: Review | null = null;
  isAuthenticated = false;
  hasUserReviewed = false;
  
  constructor(
    private reviewService: ReviewService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    if (this.movie) {
      this.loadMovieReviews();
    }
  }
  
  loadMovieReviews(): void {
    this.isLoading = true;
    
    this.reviewService.getMovieReviews(this.movie.id).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
        this.checkUserReview();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading movie reviews', error);
        this.isLoading = false;
      }
    });
  }
  
  checkUserReview(): void {
    if (!this.isAuthenticated) {
      return;
    }
    
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.id) {
      this.hasUserReviewed = this.reviews.some(review => review.userId === currentUser.id);
    }
  }
  
  onAddReview(): void {
    if (!this.isAuthenticated) {
      this.snackBar.open('Please sign in to write a review', 'Sign In', { duration: 3000 });
      return;
    }
    
    this.showAddReviewForm = true;
    this.reviewToEdit = null;
  }
  
  onEditReview(review: Review): void {
    this.reviewToEdit = review;
    this.showAddReviewForm = true;
  }
  
  onDeleteReview(review: Review): void {
    if (!review.id) {
      return;
    }
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Delete Review',
        message: 'Are you sure you want to delete this review? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result && review.id) {
        this.reviewService.deleteReview(review.id).subscribe({
          next: (success) => {
            if (success) {
              this.reviews = this.reviews.filter(r => r.id !== review.id);
              this.hasUserReviewed = false;
              this.snackBar.open('Review deleted successfully', '', { duration: 3000 });
            } else {
              this.snackBar.open('Failed to delete review', 'Dismiss', { duration: 3000 });
            }
          },
          error: (error) => {
            console.error('Error deleting review', error);
            this.snackBar.open('Failed to delete review', 'Dismiss', { duration: 3000 });
          }
        });
      }
    });
  }
  
  onLikeReview(review: Review): void {
    if (!review.id) {
      return;
    }
    
    this.reviewService.likeReview(review.id).subscribe({
      next: (updatedReview) => {
        if (updatedReview) {
          this.reviews = this.reviews.map(r => 
            r.id === updatedReview.id ? updatedReview : r
          );
        }
      },
      error: (error) => {
        console.error('Error liking review', error);
      }
    });
  }
  
  onSubmitReview(reviewData: {title: string; content: string; rating: number; containsSpoilers: boolean}): void {
    if (this.reviewToEdit && this.reviewToEdit.id) {
      // Update existing review
      this.reviewService.updateReview(this.reviewToEdit.id, reviewData).subscribe({
        next: (updatedReview) => {
          if (updatedReview) {
            this.reviews = this.reviews.map(r => 
              r.id === updatedReview.id ? updatedReview : r
            );
            this.snackBar.open('Review updated successfully', '', { duration: 3000 });
          } else {
            this.snackBar.open('Failed to update review', 'Dismiss', { duration: 3000 });
          }
          this.resetForm();
        },
        error: (error) => {
          console.error('Error updating review', error);
          this.snackBar.open('Failed to update review', 'Dismiss', { duration: 3000 });
        }
      });
    } else {
      // Add new review
      const newReview = {
        ...reviewData,
        movieId: this.movie.id
      };
      
      this.reviewService.addReview(newReview).subscribe({
        next: (addedReview) => {
          if (addedReview) {
            this.reviews = [addedReview, ...this.reviews];
            this.hasUserReviewed = true;
            this.snackBar.open('Review submitted successfully', '', { duration: 3000 });
          } else {
            this.snackBar.open('Failed to submit review', 'Dismiss', { duration: 3000 });
          }
          this.resetForm();
        },
        error: (error) => {
          console.error('Error submitting review', error);
          this.snackBar.open('Failed to submit review', 'Dismiss', { duration: 3000 });
        }
      });
    }
  }
  
  onCancelForm(): void {
    this.resetForm();
  }
  
  private resetForm(): void {
    this.showAddReviewForm = false;
    this.reviewToEdit = null;
  }
} 