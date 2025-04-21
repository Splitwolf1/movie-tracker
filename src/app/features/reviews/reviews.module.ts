import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { ReviewsRoutingModule } from './reviews-routing.module';

import { ReviewFormComponent } from './review-form/review-form.component';
import { ReviewListComponent } from './review-list/review-list.component';
import { UserReviewsComponent } from './user-reviews/user-reviews.component';
import { MovieReviewsComponent } from './movie-reviews/movie-reviews.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@NgModule({
  declarations: [
    ReviewFormComponent,
    ReviewListComponent,
    UserReviewsComponent,
    MovieReviewsComponent,
    ConfirmDialogComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ReviewsRoutingModule,
    SharedModule
  ],
  exports: [
    ReviewFormComponent,
    ReviewListComponent,
    UserReviewsComponent,
    MovieReviewsComponent
  ]
})
export class ReviewsModule { } 