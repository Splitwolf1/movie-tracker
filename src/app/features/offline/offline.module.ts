import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';

import { SyncManagerComponent } from './sync-manager/sync-manager.component';
import { OfflineStatusComponent } from './offline-status/offline-status.component';

const routes: Routes = [
  {
    path: '',
    component: SyncManagerComponent
  }
];

@NgModule({
  declarations: [
    SyncManagerComponent,
    OfflineStatusComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatListModule,
    MatBadgeModule,
    MatTooltipModule
  ],
  exports: [
    SyncManagerComponent,
    OfflineStatusComponent
  ]
})
export class OfflineModule { } 