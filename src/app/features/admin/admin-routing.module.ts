import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminGuard } from '../../core/guards/admin.guard';
import { ModeratorGuard } from '../../core/guards/moderator.guard';

import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { ContentModerationComponent } from './components/content-moderation/content-moderation.component';
import { ContentManagementComponent } from './components/content-management/content-management.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { AdminLoginComponent } from './components/admin-login/admin-login.component';
import { AnalyticsComponent } from './components/analytics/analytics.component';
import { SystemManagementComponent } from './components/system-management/system-management.component';

const routes: Routes = [
  {
    path: '',
    component: AdminDashboardComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'login',
    component: AdminLoginComponent
  },
  {
    path: 'moderation',
    component: ContentModerationComponent,
    canActivate: [ModeratorGuard]
  },
  {
    path: 'content',
    component: ContentManagementComponent,
    canActivate: [ModeratorGuard]
  },
  {
    path: 'users',
    component: UserManagementComponent,
    canActivate: [ModeratorGuard]
  },
  {
    path: 'analytics',
    component: AnalyticsComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'system',
    component: SystemManagementComponent,
    canActivate: [AdminGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { } 