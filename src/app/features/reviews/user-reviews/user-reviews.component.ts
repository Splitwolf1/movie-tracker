import { Component, OnInit } from '@angular/core';
import { Review } from '../../../core/models/review.model';
import { ReviewService } from '../../../core/services/review.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-user-reviews',
  templateUrl: './user-reviews.component.html',
  styleUrls: ['./user-reviews.component.scss']
})
export class UserReviewsComponent implements OnInit {
  reviews: Review[] = [];
  isLoading = false;
  reviewToEdit: Review | null = null;
  showForm = false;
  
  constructor(
    private reviewService: ReviewService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadUserReviews();
  }
  
  loadUserReviews(): void {
    this.isLoading = true;
    
    this.reviewService.getUserReviews().subscribe({
      next: (reviews) => {
        this.reviews = reviews;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading user reviews', error);
        this.snackBar.open('Failed to load your reviews', 'Dismiss', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }
  
  onEditReview(review: Review): void {
    this.reviewToEdit = review;
    this.showForm = true;
  }
  
  onDeleteReview(review: Review): void {
    if (!review.id) {
      this.snackBar.open('Cannot delete this review', 'Dismiss', { duration: 3000 });
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
          // Update the review in the list
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
  
  onReviewSubmit(reviewData: {title: string; content: string; rating: number; containsSpoilers: boolean}): void {
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
    }
  }
  
  onCancelForm(): void {
    this.resetForm();
  }
  
  private resetForm(): void {
    this.reviewToEdit = null;
    this.showForm = false;
  }
} 