import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Achievement } from '../../../core/models/achievement.model';
import { AchievementService } from '../../../core/services/achievement.service';

@Component({
  selector: 'app-achievement-details',
  templateUrl: './achievement-details.component.html',
  styleUrls: ['./achievement-details.component.scss']
})
export class AchievementDetailsComponent implements OnInit {
  achievementId: string = '';
  achievement$: Observable<Achievement | null> = null!;
  loading: boolean = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private achievementService: AchievementService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.achievementId = this.route.snapshot.paramMap.get('id') || '';

    if (!this.achievementId) {
      this.error = 'Achievement ID not found';
      this.loading = false;
      return;
    }

    this.achievement$ = this.achievementService.getAchievement(this.achievementId).pipe(
      map(achievement => {
        this.loading = false;
        if (!achievement) {
          this.error = 'Achievement not found';
          return null;
        }
        return achievement;
      })
    );
  }

  get progress(): number {
    return 0; // This will be calculated based on achievement progress
  }

  get isUnlocked(): boolean {
    return false; // This will be calculated based on achievement status
  }
} 