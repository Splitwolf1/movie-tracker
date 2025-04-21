export enum AchievementCategory {
  WATCHLIST = 'watchlist',
  REVIEWS = 'reviews',
  RATINGS = 'ratings',
  CUSTOM_LISTS = 'custom-lists',
  SOCIAL = 'social',
  PROFILE = 'profile',
  EXPLORATION = 'exploration'
}

export enum AchievementRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  icon: string;
  points: number;
  criteria: AchievementCriteria;
  isSecret?: boolean;
}

export interface AchievementCriteria {
  type: string;
  target: number;
  requirements?: {
    [key: string]: any;
  };
}

export interface UserAchievement {
  achievementId: string;
  userId: string;
  dateUnlocked: Date;
  progress: number;
  isComplete: boolean;
}

export interface UserAchievementWithDetails extends UserAchievement {
  achievement: Achievement;
}

export interface AchievementProgress {
  achievement: Achievement;
  userAchievement: UserAchievement | null;
  percentComplete: number;
} 