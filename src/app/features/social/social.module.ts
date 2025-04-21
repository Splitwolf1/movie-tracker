import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ShareWatchlistComponent } from './watchlist-sharing/share-watchlist.component';
import { SharedWatchlistsComponent } from './watchlist-sharing/shared-watchlists.component';
import { CommentSectionComponent } from './comments/comment-section.component';
import { ActivityFeedComponent } from './activity/activity-feed.component';

// Create the SocialDashboardComponent which will be the container component
@Component({
  selector: 'app-social-dashboard',
  template: `
    <div class="social-dashboard">
      <mat-tab-group>
        <mat-tab label="Activity Feed">
          <app-activity-feed></app-activity-feed>
        </mat-tab>
        <mat-tab label="Share Watchlist">
          <app-share-watchlist></app-share-watchlist>
        </mat-tab>
        <mat-tab label="Shared Watchlists">
          <app-shared-watchlists></app-shared-watchlists>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .social-dashboard {
      padding: 1rem;
    }
  `]
})
export class SocialDashboardComponent implements OnInit {
  constructor() {}
  
  ngOnInit(): void {}
}

const routes: Routes = [
  {
    path: '',
    component: SocialDashboardComponent
  },
  {
    path: 'share',
    component: ShareWatchlistComponent
  },
  {
    path: 'shared',
    component: SharedWatchlistsComponent
  },
  {
    path: 'activity',
    component: ActivityFeedComponent
  }
];

@NgModule({
  declarations: [
    ShareWatchlistComponent,
    SharedWatchlistsComponent,
    SocialDashboardComponent,
    CommentSectionComponent,
    ActivityFeedComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatListModule,
    MatTabsModule,
    MatSnackBarModule,
    MatDividerModule,
    MatTooltipModule
  ],
  exports: [
    ShareWatchlistComponent,
    SharedWatchlistsComponent,
    SocialDashboardComponent,
    CommentSectionComponent,
    ActivityFeedComponent
  ]
})
export class SocialModule { } 