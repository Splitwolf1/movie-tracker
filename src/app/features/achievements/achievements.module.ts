import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';

import { AchievementsRoutingModule } from './achievements-routing.module';
import { AchievementsComponent } from './achievements.component';
import { AchievementCardComponent } from './achievement-card/achievement-card.component';
import { AchievementDetailsComponent } from './achievement-details/achievement-details.component';

@NgModule({
  declarations: [
    AchievementsComponent,
    AchievementCardComponent,
    AchievementDetailsComponent
  ],
  imports: [
    CommonModule,
    AchievementsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MaterialModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,
    MatIconModule,
    MatProgressBarModule,
    MatTabsModule,
    MatTooltipModule,
    MatBadgeModule,
    MatDividerModule
  ]
})
export class AchievementsModule { } 