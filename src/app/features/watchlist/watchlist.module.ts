import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { WatchlistComponent } from './watchlist.component';
import { WatchlistRoutingModule } from './watchlist-routing.module';
import { WatchHistoryComponent } from './watch-history.component';
import { MovieRatingDialogComponent } from './movie-rating-dialog/movie-rating-dialog.component';

@NgModule({
  declarations: [
    WatchlistComponent,
    WatchHistoryComponent,
    MovieRatingDialogComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    SharedModule,
    WatchlistRoutingModule
  ]
})
export class WatchlistModule { } 