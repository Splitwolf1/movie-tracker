import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FilteredMoviesComponent } from './filtered-movies.component';
import { FilteredTvShowsComponent } from './filtered-tv-shows.component';

const routes: Routes = [
  {
    path: '',
    component: FilteredMoviesComponent
  },
  {
    path: 'browse',
    component: FilteredMoviesComponent
  },
  {
    path: 'tv',
    component: FilteredTvShowsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FilterRoutingModule { } 