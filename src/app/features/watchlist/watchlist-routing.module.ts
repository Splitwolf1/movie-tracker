import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WatchlistComponent } from './watchlist.component';
import { WatchHistoryComponent } from './watch-history.component';
import { AuthGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  { 
    path: '', 
    component: WatchlistComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'history',
    component: WatchHistoryComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WatchlistRoutingModule { } 