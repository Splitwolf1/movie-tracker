import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AchievementsComponent } from './achievements.component';
import { AchievementDetailsComponent } from './achievement-details/achievement-details.component';

const routes: Routes = [
  {
    path: '',
    component: AchievementsComponent
  },
  {
    path: ':id',
    component: AchievementDetailsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AchievementsRoutingModule { } 