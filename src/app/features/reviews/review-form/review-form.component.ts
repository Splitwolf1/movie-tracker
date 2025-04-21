import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Movie } from '../../../core/models/movie.model';
import { Review } from '../../../core/models/review.model';

@Component({
  selector: 'app-review-form',
  templateUrl: './review-form.component.html',
  styleUrls: ['./review-form.component.scss']
})
export class ReviewFormComponent implements OnInit {
  @Input() movie!: Movie;
  @Input() initialReview: Review | null = null;
  @Output() submitReview = new EventEmitter<{title: string; content: string; rating: number; containsSpoilers: boolean}>();
  @Output() cancelReview = new EventEmitter<void>();
  
  reviewForm!: FormGroup;
  ratingValue = 0;
  hoverValue = 0;
  isEditMode = false;
  
  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initForm();
    
    if (this.initialReview) {
      this.isEditMode = true;
      this.reviewForm.patchValue({
        title: this.initialReview.title,
        content: this.initialReview.content,
        containsSpoilers: this.initialReview.containsSpoilers || false
      });
      this.ratingValue = this.initialReview.rating;
    }
  }
  
  initForm(): void {
    this.reviewForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      content: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
      containsSpoilers: [false]
    });
  }
  
  setRating(value: number): void {
    this.ratingValue = value;
  }
  
  onSubmit(): void {
    if (this.reviewForm.valid && this.ratingValue > 0) {
      const formValue = this.reviewForm.value;
      this.submitReview.emit({
        ...formValue,
        rating: this.ratingValue
      });
      this.resetForm();
    }
  }
  
  onCancel(): void {
    this.cancelReview.emit();
    this.resetForm();
  }
  
  resetForm(): void {
    this.reviewForm.reset();
    this.ratingValue = 0;
    this.hoverValue = 0;
  }
  
  get titleControl() { return this.reviewForm.get('title')!; }
  get contentControl() { return this.reviewForm.get('content')!; }
  get isTitleInvalid() { return this.titleControl?.invalid && (this.titleControl?.dirty || this.titleControl?.touched); }
  get isContentInvalid() { return this.contentControl?.invalid && (this.contentControl?.dirty || this.contentControl?.touched); }
  get isRatingInvalid() { return this.ratingValue === 0; }
} 