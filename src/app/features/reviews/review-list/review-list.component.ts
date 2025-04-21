import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Review } from '../../../core/models/review.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-review-list',
  templateUrl: './review-list.component.html',
  styleUrls: ['./review-list.component.scss']
})
export class ReviewListComponent implements OnInit {
  @Input() reviews: Review[] = [];
  @Input() showMovieDetails = false;
  @Input() canEdit = true;
  
  @Output() editReview = new EventEmitter<Review>();
  @Output() deleteReview = new EventEmitter<Review>();
  @Output() likeReview = new EventEmitter<Review>();
  
  currentUserId: string | null = null;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.currentUserId = currentUser?.id || null;
  }
  
  isUserReview(review: Review): boolean {
    return this.currentUserId !== null && review.userId === this.currentUserId;
  }
  
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }
  
  onEditReview(review: Review): void {
    this.editReview.emit(review);
  }
  
  onDeleteReview(review: Review): void {
    this.deleteReview.emit(review);
  }
  
  onLikeReview(review: Review): void {
    this.likeReview.emit(review);
  }
  
  getStarsArray(rating: number): number[] {
    return Array(rating).fill(0).map((_, i) => i + 1);
  }
} 