import { Component, Input, OnInit } from '@angular/core';
import { AchievementProgress, AchievementRarity } from '../../../core/models/achievement.model';

@Component({
  selector: 'app-achievement-card',
  templateUrl: './achievement-card.component.html',
  styleUrls: ['./achievement-card.component.scss']
})
export class AchievementCardComponent implements OnInit {
  @Input() achievementProgress!: AchievementProgress;
  
  constructor() { }

  ngOnInit(): void {
  }

  get rarityClass(): string {
    const rarity = this.achievementProgress.achievement.rarity;
    return rarity.toLowerCase();
  }

  get isUnlocked(): boolean {
    return this.achievementProgress.userAchievement?.isComplete || false;
  }

  get isSecret(): boolean {
    return this.achievementProgress.achievement.isSecret || false;
  }
  
  get shouldReveal(): boolean {
    // Show details for non-secret achievements or unlocked secret achievements
    return !this.isSecret || this.isUnlocked;
  }

  get progress(): number {
    return this.achievementProgress.percentComplete;
  }

  getRarityLabel(rarity: AchievementRarity): string {
    switch (rarity) {
      case AchievementRarity.COMMON:
        return 'Common';
      case AchievementRarity.UNCOMMON:
        return 'Uncommon';
      case AchievementRarity.RARE:
        return 'Rare';
      case AchievementRarity.EPIC:
        return 'Epic';
      case AchievementRarity.LEGENDARY:
        return 'Legendary';
      default:
        return rarity;
    }
  }
} 