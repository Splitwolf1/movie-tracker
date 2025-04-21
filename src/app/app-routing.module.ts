import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';

const routes: Routes = [
  { 
    path: '', 
    loadChildren: () => import('./features/home/home.module').then(m => m.HomeModule) 
  },
  { 
    path: 'details', 
    loadChildren: () => import('./features/details/details.module').then(m => m.DetailsModule) 
  },
  { 
    path: 'movie/:id', 
    redirectTo: 'details/movie/:id'
  },
  { 
    path: 'tv/:id', 
    redirectTo: 'details/tv/:id'
  },
  { 
    path: 'filter', 
    loadChildren: () => import('./features/filter/filter.module').then(m => m.FilterModule) 
  },
  { 
    path: 'browse', 
    redirectTo: 'filter/browse'
  },
  { 
    path: 'tv', 
    redirectTo: 'filter/tv'
  },
  { 
    path: 'auth', 
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule) 
  },
  {
    path: 'profile',
    loadChildren: () => import('./features/profile/profile.module').then(m => m.ProfileModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'reviews',
    loadChildren: () => import('./features/reviews/reviews.module').then(m => m.ReviewsModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'watchlist',
    loadChildren: () => import('./features/watchlist/watchlist.module').then(m => m.WatchlistModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'custom-lists',
    loadChildren: () => import('./features/custom-lists/custom-lists.module').then(m => m.CustomListsModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'achievements',
    loadChildren: () => import('./features/achievements/achievements.module').then(m => m.AchievementsModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'social',
    loadChildren: () => import('./features/social/social.module').then(m => m.SocialModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'notifications',
    loadChildren: () => import('./features/notifications/notifications.module').then(m => m.NotificationsModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'offline',
    loadChildren: () => import('./features/offline/offline.module').then(m => m.OfflineModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule),
    canActivate: [AdminGuard]
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    initialNavigation: 'enabledBlocking',
    scrollPositionRestoration: 'enabled',
    paramsInheritanceStrategy: 'always'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { } 