import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { MovieDetailsComponent } from './movie-details.component';
import { TvShowDetailsComponent } from './tv-show-details.component';
import { DetailsComponent } from './details.component';
import { ReviewsModule } from '../reviews/reviews.module';
import { DetailsRoutingModule } from './details-routing.module';

@NgModule({
  declarations: [
    MovieDetailsComponent,
    TvShowDetailsComponent,
    DetailsComponent
  ],
  imports: [
    CommonModule,
    DetailsRoutingModule,
    SharedModule,
    ReviewsModule
  ],
  exports: [
    MovieDetailsComponent,
    TvShowDetailsComponent,
    DetailsComponent
  ]
})
export class DetailsModule { } 