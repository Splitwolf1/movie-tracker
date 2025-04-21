import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserReviewsComponent } from './user-reviews/user-reviews.component';

const routes: Routes = [
  {
    path: '',
    component: UserReviewsComponent
  },
  {
    path: 'my',
    component: UserReviewsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReviewsRoutingModule { } 