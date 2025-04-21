import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification, NotificationType } from '../../../core/models/notification.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss']
})
export class NotificationListComponent implements OnInit, OnDestroy {
  notifications$: Observable<Notification[]>;
  unreadCount$: Observable<number>;
  NotificationType = NotificationType;
  isLoading = false;
  private subscriptions: Subscription[] = [];
  
  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.notifications$ = this.notificationService.getNotifications();
    this.unreadCount$ = this.notificationService.unreadCount$;
  }
  
  ngOnInit(): void {
  }
  
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  markAsRead(notification: Notification, event: Event): void {
    event.stopPropagation(); // Prevent click from propagating to parent
    
    if (notification.isRead) {
      return;
    }
    
    const sub = this.notificationService.markAsRead(notification.id).subscribe(
      success => {
        if (!success) {
          this.snackBar.open('Failed to mark notification as read', 'Close', {
            duration: 3000
          });
        }
      }
    );
    
    this.subscriptions.push(sub);
  }
  
  markAllAsRead(): void {
    this.isLoading = true;
    
    const sub = this.notificationService.markAllAsRead().pipe(
      tap(() => this.isLoading = false)
    ).subscribe(
      success => {
        if (success) {
          this.snackBar.open('All notifications marked as read', 'Close', {
            duration: 3000
          });
        } else {
          this.snackBar.open('Failed to mark all notifications as read', 'Close', {
            duration: 3000
          });
        }
      },
      error => {
        this.isLoading = false;
        this.snackBar.open('An error occurred', 'Close', {
          duration: 3000
        });
      }
    );
    
    this.subscriptions.push(sub);
  }
  
  deleteNotification(notification: Notification, event: Event): void {
    event.stopPropagation(); // Prevent click from propagating to parent
    
    const sub = this.notificationService.deleteNotification(notification.id).subscribe(
      success => {
        if (success) {
          this.snackBar.open('Notification deleted', 'Close', {
            duration: 3000
          });
        } else {
          this.snackBar.open('Failed to delete notification', 'Close', {
            duration: 3000
          });
        }
      }
    );
    
    this.subscriptions.push(sub);
  }
  
  getNotificationDate(notification: Notification): string {
    const date = new Date(notification.createdAt);
    return date.toLocaleString();
  }
  
  isToday(date: Date): boolean {
    const today = new Date();
    const notificationDate = new Date(date);
    
    return (
      notificationDate.getDate() === today.getDate() &&
      notificationDate.getMonth() === today.getMonth() &&
      notificationDate.getFullYear() === today.getFullYear()
    );
  }
  
  navigateToAction(notification: Notification): void {
    this.markAsRead(notification, new Event('click'));
    
    if (notification.actionUrl) {
      this.router.navigateByUrl(notification.actionUrl);
    }
  }
  
  getNotificationIcon(notification: Notification): string {
    switch (notification.type) {
      case NotificationType.FRIEND_REQUEST:
        return 'person_add';
      case NotificationType.FRIEND_ACCEPTED:
        return 'people';
      case NotificationType.WATCHLIST_SHARED:
        return 'playlist_play';
      case NotificationType.COMMENT_ADDED:
        return 'comment';
      case NotificationType.MOVIE_RECOMMENDATION:
        return 'recommend';
      case NotificationType.ACHIEVEMENT_UNLOCKED:
        return 'emoji_events';
      case NotificationType.SYSTEM_NOTIFICATION:
        return 'notifications';
      default:
        return 'notifications';
    }
  }
} 