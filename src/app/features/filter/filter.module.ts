import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { FilteredMoviesComponent } from './filtered-movies.component';
import { FilteredTvShowsComponent } from './filtered-tv-shows.component';
import { FilterComponent } from './filter.component';
import { FilterRoutingModule } from './filter-routing.module';

@NgModule({
  declarations: [
    FilteredMoviesComponent,
    FilteredTvShowsComponent,
    FilterComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FilterRoutingModule,
    SharedModule,
    MatButtonToggleModule,
    MatPaginatorModule,
    MatChipsModule
  ],
  exports: [
    FilteredMoviesComponent,
    FilteredTvShowsComponent,
    FilterComponent
  ]
})
export class FilterModule { } 