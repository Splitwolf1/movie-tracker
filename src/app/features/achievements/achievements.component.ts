import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { AchievementService } from '../../core/services/achievement.service';
import { 
  Achievement, 
  AchievementCategory, 
  AchievementProgress 
} from '../../core/models/achievement.model';

@Component({
  selector: 'app-achievements',
  templateUrl: './achievements.component.html',
  styleUrls: ['./achievements.component.scss']
})
export class AchievementsComponent implements OnInit {
  achievements$: Observable<AchievementProgress[]>;
  categories = Object.values(AchievementCategory);
  activeCategory: AchievementCategory | 'all' = 'all';
  totalPoints = 0;
  completedCount = 0;
  totalCount = 0;
  
  constructor(
    private achievementService: AchievementService,
    private router: Router
  ) {
    this.achievements$ = this.achievementService.getAllAchievementProgress();
  }

  ngOnInit(): void {
    this.loadAchievements();
    this.loadTotalPoints();
  }

  loadAchievements(): void {
    this.achievements$ = this.achievementService.getAllAchievementProgress();
    this.achievements$.subscribe(achievements => {
      this.totalCount = achievements.length;
      this.completedCount = achievements.filter(a => a.userAchievement?.isComplete).length;
    });
  }

  loadTotalPoints(): void {
    this.achievementService.getTotalPoints().subscribe(points => {
      this.totalPoints = points;
    });
  }

  filterByCategory(category: AchievementCategory | 'all'): void {
    this.activeCategory = category;
    if (category === 'all') {
      this.achievements$ = this.achievementService.getAllAchievementProgress();
    } else {
      this.achievements$ = this.achievementService.getAchievementProgressByCategory(category);
    }
  }

  getCategoryName(category: AchievementCategory): string {
    // Convert enum values to display names
    switch (category) {
      case AchievementCategory.WATCHLIST:
        return 'Watchlist';
      case AchievementCategory.REVIEWS:
        return 'Reviews';
      case AchievementCategory.RATINGS:
        return 'Ratings';
      case AchievementCategory.CUSTOM_LISTS:
        return 'Custom Lists';
      case AchievementCategory.SOCIAL:
        return 'Social';
      case AchievementCategory.PROFILE:
        return 'Profile';
      case AchievementCategory.EXPLORATION:
        return 'Exploration';
      default:
        return category;
    }
  }

  viewAchievementDetails(achievement: Achievement): void {
    this.router.navigate(['/achievements', achievement.id]);
  }
} 