import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { NotificationListComponent } from './notification-list/notification-list.component';
import { NotificationBellComponent } from './notification-bell/notification-bell.component';
import { NotificationSettingsComponent } from './notification-settings/notification-settings.component';
import { NotificationsDashboardComponent } from './notifications-dashboard/notifications-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: NotificationsDashboardComponent,
    children: [
      {
        path: '',
        component: NotificationListComponent
      },
      {
        path: 'settings',
        component: NotificationSettingsComponent
      }
    ]
  }
];

@NgModule({
  declarations: [
    NotificationListComponent,
    NotificationBellComponent,
    NotificationSettingsComponent,
    NotificationsDashboardComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatDividerModule,
    MatListModule,
    MatTabsModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  exports: [
    NotificationBellComponent
  ]
})
export class NotificationsModule { } 