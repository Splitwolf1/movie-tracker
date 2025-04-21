import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, forkJoin, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';
import {
  Achievement,
  UserAchievement,
  UserAchievementWithDetails,
  AchievementProgress,
  AchievementCategory
} from '../models/achievement.model';
import { NotificationType } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class AchievementService {
  private baseUrl = environment.apiUrl;
  private achievementsSubject = new BehaviorSubject<Achievement[]>([]);
  private userAchievementsSubject = new BehaviorSubject<UserAchievement[]>([]);
  
  achievements$ = this.achievementsSubject.asObservable();
  userAchievements$ = this.userAchievementsSubject.asObservable();
  
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    this.loadAchievements();
  }
  
  /**
   * Load all achievement definitions
   */
  loadAchievements(): void {
    this.http.get<Achievement[]>(`${this.baseUrl}/achievements`)
      .pipe(
        catchError(() => of([]))
      )
      .subscribe(achievements => {
        this.achievementsSubject.next(achievements);
        this.loadUserAchievements();
      });
  }
  
  /**
   * Load user's achievement progress
   */
  loadUserAchievements(): void {
    const user = this.authService.getCurrentUser();
    if (!user || !user.id) {
      this.userAchievementsSubject.next([]);
      return;
    }
    
    this.http.get<UserAchievement[]>(`${this.baseUrl}/user-achievements?userId=${user.id}`)
      .pipe(
        catchError(() => of([]))
      )
      .subscribe(userAchievements => {
        this.userAchievementsSubject.next(userAchievements);
      });
  }
  
  /**
   * Get all achievement definitions
   */
  getAchievements(): Observable<Achievement[]> {
    return this.achievements$;
  }
  
  /**
   * Get achievements by category
   */
  getAchievementsByCategory(category: AchievementCategory): Observable<Achievement[]> {
    return this.achievements$.pipe(
      map(achievements => achievements.filter(a => a.category === category))
    );
  }
  
  /**
   * Get detailed user achievements with achievement details
   */
  getUserAchievementsWithDetails(): Observable<UserAchievementWithDetails[]> {
    return forkJoin([
      this.achievements$,
      this.userAchievements$
    ]).pipe(
      map(([achievements, userAchievements]) => {
        return userAchievements.map(ua => {
          const achievement = achievements.find(a => a.id === ua.achievementId);
          if (!achievement) {
            return null;
          }
          return {
            ...ua,
            achievement
          };
        }).filter((item): item is UserAchievementWithDetails => item !== null);
      })
    );
  }
  
  /**
   * Get achievement progress for a specific category
   */
  getAchievementProgressByCategory(category: AchievementCategory): Observable<AchievementProgress[]> {
    return forkJoin([
      this.getAchievementsByCategory(category),
      this.userAchievements$
    ]).pipe(
      map(([achievements, userAchievements]) => {
        return achievements.map(achievement => {
          const userAchievement = userAchievements.find(ua => ua.achievementId === achievement.id) || null;
          const percentComplete = userAchievement 
            ? (userAchievement.progress / achievement.criteria.target) * 100 
            : 0;
          
          return {
            achievement,
            userAchievement,
            percentComplete: Math.min(percentComplete, 100)
          };
        });
      })
    );
  }
  
  /**
   * Get all achievement progress for a user
   */
  getAllAchievementProgress(): Observable<AchievementProgress[]> {
    return forkJoin([
      this.achievements$,
      this.userAchievements$
    ]).pipe(
      map(([achievements, userAchievements]) => {
        return achievements.map(achievement => {
          const userAchievement = userAchievements.find(ua => ua.achievementId === achievement.id) || null;
          const percentComplete = userAchievement 
            ? (userAchievement.progress / achievement.criteria.target) * 100 
            : 0;
          
          return {
            achievement,
            userAchievement,
            percentComplete: Math.min(percentComplete, 100)
          };
        });
      })
    );
  }
  
  /**
   * Get a specific achievement by ID
   */
  getAchievement(id: string): Observable<Achievement | null> {
    return this.achievements$.pipe(
      map(achievements => achievements.find(a => a.id === id) || null)
    );
  }
  
  /**
   * Get achievement details including user progress
   */
  getAchievementDetails(id: string): Observable<AchievementProgress | null> {
    return forkJoin([
      this.getAchievement(id),
      this.userAchievements$
    ]).pipe(
      map(([achievement, userAchievements]) => {
        if (!achievement) {
          return null;
        }
        
        const userAchievement = userAchievements.find(ua => ua.achievementId === achievement.id) || null;
        const percentComplete = userAchievement 
          ? (userAchievement.progress / achievement.criteria.target) * 100 
          : 0;
        
        return {
          achievement,
          userAchievement,
          percentComplete: Math.min(percentComplete, 100)
        };
      })
    );
  }
  
  /**
   * Update achievement progress
   */
  updateAchievementProgress(achievementId: string, progressIncrement: number = 1): Observable<UserAchievement | null> {
    const user = this.authService.getCurrentUser();
    if (!user || !user.id) {
      return of(null);
    }
    
    return forkJoin([
      this.getAchievement(achievementId),
      this.getUserAchievement(achievementId)
    ]).pipe(
      switchMap(([achievement, userAchievement]) => {
        if (!achievement) {
          return throwError(() => new Error('Achievement not found'));
        }
        
        if (userAchievement && userAchievement.isComplete) {
          return of(userAchievement); // Already completed
        }
        
        const newProgress = (userAchievement?.progress || 0) + progressIncrement;
        const isComplete = newProgress >= achievement.criteria.target;
        
        if (userAchievement) {
          // Update existing user achievement
          const updatedUserAchievement: UserAchievement = {
            ...userAchievement,
            progress: newProgress,
            isComplete,
            dateUnlocked: isComplete && !userAchievement.isComplete ? new Date() : userAchievement.dateUnlocked
          };
          
          return this.http.patch<UserAchievement>(
            `${this.baseUrl}/user-achievements/${userAchievement.achievementId}_${user.id}`,
            updatedUserAchievement
          ).pipe(
            tap(updated => {
              if (isComplete && !userAchievement.isComplete) {
                this.notifyAchievementUnlocked(achievement);
              }
              this.updateLocalUserAchievement(updated);
            }),
            catchError(() => of(null))
          );
        } else {
          // Create new user achievement
          const newUserAchievement: UserAchievement = {
            achievementId,
            userId: user.id,
            progress: newProgress,
            isComplete,
            dateUnlocked: isComplete ? new Date() : new Date(0)
          };
          
          return this.http.post<UserAchievement>(
            `${this.baseUrl}/user-achievements`,
            newUserAchievement
          ).pipe(
            tap(created => {
              if (isComplete) {
                this.notifyAchievementUnlocked(achievement);
              }
              this.updateLocalUserAchievement(created);
            }),
            catchError(() => of(null))
          );
        }
      })
    );
  }
  
  /**
   * Get a user's progress on a specific achievement
   */
  getUserAchievement(achievementId: string): Observable<UserAchievement | null> {
    const user = this.authService.getCurrentUser();
    if (!user || !user.id) {
      return of(null);
    }
    
    return this.userAchievements$.pipe(
      map(userAchievements => userAchievements.find(ua => ua.achievementId === achievementId) || null)
    );
  }
  
  /**
   * Get total achievement points earned by user
   */
  getTotalPoints(): Observable<number> {
    return forkJoin([
      this.achievements$,
      this.userAchievements$
    ]).pipe(
      map(([achievements, userAchievements]) => {
        const completedAchievements = userAchievements.filter(ua => ua.isComplete);
        
        return completedAchievements.reduce((total, ua) => {
          const achievement = achievements.find(a => a.id === ua.achievementId);
          return total + (achievement?.points || 0);
        }, 0);
      })
    );
  }
  
  /**
   * Reset an achievement for testing purposes (development only)
   */
  resetAchievement(achievementId: string): Observable<boolean> {
    const user = this.authService.getCurrentUser();
    if (!user || !user.id) {
      return of(false);
    }
    
    const userAchievements = this.userAchievementsSubject.getValue();
    const userAchievement = userAchievements.find(ua => ua.achievementId === achievementId);
    
    if (!userAchievement) {
      return of(true); // Nothing to reset
    }
    
    return this.http.patch<UserAchievement>(
      `${this.baseUrl}/user-achievements/${achievementId}_${user.id}`,
      { progress: 0, isComplete: false }
    ).pipe(
      map(() => {
        this.updateLocalUserAchievement({
          ...userAchievement,
          progress: 0,
          isComplete: false
        });
        return true;
      }),
      catchError(() => of(false))
    );
  }
  
  /**
   * Trigger a check on various achievement types
   */
  checkAchievements(type: string, data?: any): void {
    // This method will be expanded to handle different types of achievements
    switch (type) {
      case 'watchlist_add':
        this.checkWatchlistAchievements();
        break;
      case 'rating_add':
        this.checkRatingAchievements();
        break;
      case 'review_add':
        this.checkReviewAchievements();
        break;
      case 'custom_list_add':
        this.checkCustomListAchievements();
        break;
      case 'movie_view':
        this.checkMovieViewAchievements(data);
        break;
      default:
        // No achievement check for this type
        break;
    }
  }
  
  /**
   * Check watchlist related achievements
   */
  private checkWatchlistAchievements(): void {
    // Implement specific achievement checks for watchlist
    // This is just a placeholder - actual implementation would query the watchlist count
    this.updateAchievementProgress('watchlist-beginner').subscribe();
  }
  
  /**
   * Check rating related achievements
   */
  private checkRatingAchievements(): void {
    // Implement specific achievement checks for ratings
    // This is just a placeholder - actual implementation would query the ratings count
    this.updateAchievementProgress('rating-beginner').subscribe();
  }
  
  /**
   * Check review related achievements
   */
  private checkReviewAchievements(): void {
    // Implement specific achievement checks for reviews
    // This is just a placeholder - actual implementation would query the reviews count
    this.updateAchievementProgress('review-beginner').subscribe();
  }
  
  /**
   * Check custom list related achievements
   */
  private checkCustomListAchievements(): void {
    // Implement specific achievement checks for custom lists
    // This is just a placeholder - actual implementation would query the custom lists count
    this.updateAchievementProgress('list-beginner').subscribe();
  }
  
  /**
   * Check movie viewing related achievements
   */
  private checkMovieViewAchievements(movieData: any): void {
    // Implement specific achievement checks for movie viewing
    // This is just a placeholder - actual implementation would check movie genres, release years, etc.
    this.updateAchievementProgress('explorer-beginner').subscribe();
  }
  
  /**
   * Send notification when achievement is unlocked
   */
  private notifyAchievementUnlocked(achievement: Achievement): void {
    this.notificationService.createNotification({
      type: NotificationType.ACHIEVEMENT_UNLOCKED,
      userId: this.authService.getCurrentUser()?.id || '',
      title: 'Achievement Unlocked!',
      message: `You've earned the "${achievement.title}" achievement.`,
      actionUrl: '/achievements',
      contentId: achievement.id
    }).subscribe();
  }
  
  /**
   * Update user achievement in local state
   */
  private updateLocalUserAchievement(userAchievement: UserAchievement): void {
    const userAchievements = this.userAchievementsSubject.getValue();
    const index = userAchievements.findIndex(ua => ua.achievementId === userAchievement.achievementId);
    
    if (index > -1) {
      // Update existing
      const updated = [...userAchievements];
      updated[index] = userAchievement;
      this.userAchievementsSubject.next(updated);
    } else {
      // Add new
      this.userAchievementsSubject.next([...userAchievements, userAchievement]);
    }
  }
} 