import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { AdminRoutingModule } from './admin-routing.module';
import { SharedModule } from '../../shared/shared.module';

import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { ContentModerationComponent } from './components/content-moderation/content-moderation.component';
import { ContentManagementComponent } from './components/content-management/content-management.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { AdminLoginComponent } from './components/admin-login/admin-login.component';
import { AnalyticsComponent } from './components/analytics/analytics.component';
import { SystemManagementComponent } from './components/system-management/system-management.component';

import { AdminService } from './services/admin.service';
import { AnalyticsService } from './services/analytics.service';
import { ContentModerationService } from './services/content-moderation.service';
import { ContentManagementService } from './services/content-management.service';
import { UserManagementService } from './services/user-management.service';

@NgModule({
  declarations: [
    AdminDashboardComponent,
    ContentModerationComponent,
    ContentManagementComponent,
    UserManagementComponent,
    AdminLoginComponent,
    AnalyticsComponent,
    SystemManagementComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatCardModule,
    MatSelectModule,
    MatChipsModule,
    MatTooltipModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatMenuModule,
    MatProgressBarModule,
    AdminRoutingModule,
    SharedModule
  ],
  providers: [
    AdminService,
    AnalyticsService,
    ContentModerationService,
    ContentManagementService,
    UserManagementService
  ]
})
export class AdminModule { } 