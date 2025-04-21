import { Component, OnInit } from '@angular/core';
import { SocialService } from '../../../core/services/social.service';
import { Activity, ActivityType, ContentType } from '../../../core/models/social.model';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-activity-feed',
  templateUrl: './activity-feed.component.html',
  styleUrls: ['./activity-feed.component.scss']
})
export class ActivityFeedComponent implements OnInit {
  activities$: Observable<Activity[]>;
  ActivityType = ActivityType;
  ContentType = ContentType;
  
  constructor(
    private socialService: SocialService,
    private router: Router
  ) {
    this.activities$ = this.socialService.getActivityFeed();
  }
  
  ngOnInit(): void {
  }
  
  getActivityMessage(activity: Activity): string {
    switch(activity.type) {
      case ActivityType.CONTENT_SHARED:
        return this.getContentSharedMessage(activity);
      case ActivityType.COMMENT_ADDED:
        return `commented on a ${this.getContentTypeLabel(activity.contentType)}`;
      case ActivityType.FRIEND_ADDED:
        return 'added a new friend';
      case ActivityType.MOVIE_RATED:
        return 'rated a movie';
      case ActivityType.MOVIE_WATCHED:
        return 'watched a movie';
      case ActivityType.MOVIE_ADDED:
        return 'added a movie to their watchlist';
      default:
        return 'did something';
    }
  }
  
  getContentSharedMessage(activity: Activity): string {
    if (!activity.contentType) {
      return 'shared content';
    }
    
    switch(activity.contentType) {
      case ContentType.MOVIE:
        return 'shared a movie';
      case ContentType.REVIEW:
        return 'shared a review';
      case ContentType.LIST:
        return 'shared their watchlist';
      case ContentType.PROFILE:
        return 'updated their profile';
      default:
        return 'shared content';
    }
  }
  
  getContentTypeLabel(contentType?: ContentType): string {
    if (!contentType) {
      return 'content';
    }
    
    switch(contentType) {
      case ContentType.MOVIE:
        return 'movie';
      case ContentType.REVIEW:
        return 'review';
      case ContentType.LIST:
        return 'watchlist';
      case ContentType.PROFILE:
        return 'profile';
      default:
        return 'content';
    }
  }
  
  getActivityIcon(activity: Activity): string {
    switch(activity.type) {
      case ActivityType.CONTENT_SHARED:
        return this.getContentTypeIcon(activity.contentType);
      case ActivityType.COMMENT_ADDED:
        return 'comment';
      case ActivityType.FRIEND_ADDED:
        return 'person_add';
      case ActivityType.MOVIE_RATED:
        return 'star_rate';
      case ActivityType.MOVIE_WATCHED:
        return 'visibility';
      case ActivityType.MOVIE_ADDED:
        return 'playlist_add';
      default:
        return 'notifications';
    }
  }
  
  getContentTypeIcon(contentType?: ContentType): string {
    if (!contentType) {
      return 'share';
    }
    
    switch(contentType) {
      case ContentType.MOVIE:
        return 'movie';
      case ContentType.REVIEW:
        return 'rate_review';
      case ContentType.LIST:
        return 'playlist_play';
      case ContentType.PROFILE:
        return 'person';
      default:
        return 'share';
    }
  }
  
  getActivityTime(activity: Activity): string {
    const date = new Date(activity.createdAt);
    return date.toLocaleString();
  }
  
  navigateToContent(activity: Activity): void {
    if (!activity.contentId || !activity.contentType) {
      return;
    }
    
    switch(activity.contentType) {
      case ContentType.MOVIE:
        this.router.navigate(['/movie', activity.contentId]);
        break;
      case ContentType.REVIEW:
        // Navigate to review
        this.router.navigate(['/review', activity.contentId]);
        break;
      case ContentType.LIST:
        // Navigate to shared watchlist
        this.router.navigate(['/social/shared'], { 
          queryParams: { id: activity.contentId } 
        });
        break;
      case ContentType.PROFILE:
        // Navigate to profile
        this.router.navigate(['/profile', activity.contentId]);
        break;
    }
  }
} 