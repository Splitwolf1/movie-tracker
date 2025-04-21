import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Movie } from '../../../core/models/movie.model';

@Component({
  selector: 'app-movie-rating-dialog',
  template: `
    <h2 mat-dialog-title>Rate "{{ data.movie.title }}"</h2>
    <mat-dialog-content>
      <div class="rating-container">
        <div class="rating-stars">
          <button 
            *ngFor="let star of [1,2,3,4,5,6,7,8,9,10]" 
            class="star-button"
            [class.filled]="star <= rating"
            (click)="setRating(star)"
            (mouseenter)="hoverRating = star"
            (mouseleave)="hoverRating = 0">
            <mat-icon>{{ (star <= (hoverRating || rating)) ? 'star' : 'star_border' }}</mat-icon>
          </button>
        </div>
        <div class="rating-value">{{ rating || hoverRating || 0 }}/10</div>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="null">Cancel</button>
      <button mat-raised-button color="primary" [mat-dialog-close]="rating" [disabled]="!rating">
        Submit Rating
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .rating-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1rem 0;
    }
    
    .rating-stars {
      display: flex;
      gap: 5px;
      margin-bottom: 1rem;
    }
    
    .star-button {
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      
      mat-icon {
        font-size: 28px;
        color: #ddd;
        transition: color 0.2s;
      }
      
      &:hover mat-icon {
        color: #f5c518;
      }
      
      &.filled mat-icon {
        color: #f5c518;
      }
    }
    
    .rating-value {
      font-size: 1.5rem;
      font-weight: bold;
      color: #333;
    }
  `]
})
export class MovieRatingDialogComponent {
  rating: number = 0;
  hoverRating: number = 0;
  
  constructor(
    public dialogRef: MatDialogRef<MovieRatingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { movie: Movie }
  ) {
    // Initialize with existing rating if available
    if (data.movie.userRating) {
      this.rating = data.movie.userRating;
    }
  }
  
  setRating(value: number): void {
    this.rating = value;
  }
} 