import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { Notification, NotificationType, NotificationPreferences } from '../models/notification.model';
import { ContentType } from '../models/social.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private baseUrl = environment.apiUrl;
  private notificationsKey = 'user_notifications';
  private preferencesKey = 'notification_preferences';
  
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();
  
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();
  
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.loadNotifications();
  }
  
  // Load user's notifications
  private loadNotifications(): void {
    const user = this.authService.getCurrentUser();
    if (!user || !user.id) {
      return;
    }
    
    // In a real app, this would be an API call
    const storedNotifications = localStorage.getItem(this.notificationsKey);
    const notifications: Notification[] = storedNotifications ? JSON.parse(storedNotifications) : [];
    
    // Filter notifications for the current user
    const userNotifications = notifications.filter(
      notification => notification.userId === user.id
    );
    
    // Sort by date (newest first)
    userNotifications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    this.notificationsSubject.next(userNotifications);
    this.updateUnreadCount(userNotifications);
  }
  
  // Get current user's notifications
  getNotifications(): Observable<Notification[]> {
    return this.notifications$;
  }
  
  // Create a new notification
  createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Observable<Notification> {
    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      createdAt: new Date(),
      isRead: false
    };
    
    // In a real app, this would be an API call
    const storedNotifications = localStorage.getItem(this.notificationsKey);
    const notifications: Notification[] = storedNotifications ? JSON.parse(storedNotifications) : [];
    
    notifications.push(newNotification);
    localStorage.setItem(this.notificationsKey, JSON.stringify(notifications));
    
    // Update the notifications for the current user
    this.loadNotifications();
    
    return of(newNotification);
  }
  
  // Mark a notification as read
  markAsRead(notificationId: string): Observable<boolean> {
    const storedNotifications = localStorage.getItem(this.notificationsKey);
    if (!storedNotifications) {
      return of(false);
    }
    
    const notifications: Notification[] = JSON.parse(storedNotifications);
    const notificationIndex = notifications.findIndex(n => n.id === notificationId);
    
    if (notificationIndex === -1) {
      return of(false);
    }
    
    notifications[notificationIndex].isRead = true;
    localStorage.setItem(this.notificationsKey, JSON.stringify(notifications));
    
    // Update the notifications for the current user
    this.loadNotifications();
    
    return of(true);
  }
  
  // Mark all notifications as read
  markAllAsRead(): Observable<boolean> {
    const user = this.authService.getCurrentUser();
    if (!user || !user.id) {
      return of(false);
    }
    
    const storedNotifications = localStorage.getItem(this.notificationsKey);
    if (!storedNotifications) {
      return of(true);
    }
    
    const notifications: Notification[] = JSON.parse(storedNotifications);
    const updatedNotifications = notifications.map(notification => {
      if (notification.userId === user.id) {
        return { ...notification, isRead: true };
      }
      return notification;
    });
    
    localStorage.setItem(this.notificationsKey, JSON.stringify(updatedNotifications));
    
    // Update the notifications for the current user
    this.loadNotifications();
    
    return of(true);
  }
  
  // Delete a notification
  deleteNotification(notificationId: string): Observable<boolean> {
    const storedNotifications = localStorage.getItem(this.notificationsKey);
    if (!storedNotifications) {
      return of(false);
    }
    
    const notifications: Notification[] = JSON.parse(storedNotifications);
    const updatedNotifications = notifications.filter(n => n.id !== notificationId);
    
    localStorage.setItem(this.notificationsKey, JSON.stringify(updatedNotifications));
    
    // Update the notifications for the current user
    this.loadNotifications();
    
    return of(true);
  }
  
  // Get user notification preferences
  getNotificationPreferences(): Observable<NotificationPreferences> {
    const user = this.authService.getCurrentUser();
    if (!user || !user.id) {
      return of(this.getDefaultPreferences());
    }
    
    const storedPreferences = localStorage.getItem(`${this.preferencesKey}_${user.id}`);
    if (!storedPreferences) {
      return of(this.getDefaultPreferences());
    }
    
    return of(JSON.parse(storedPreferences));
  }
  
  // Update user notification preferences
  updateNotificationPreferences(preferences: NotificationPreferences): Observable<NotificationPreferences> {
    const user = this.authService.getCurrentUser();
    if (!user || !user.id) {
      return of(this.getDefaultPreferences());
    }
    
    localStorage.setItem(`${this.preferencesKey}_${user.id}`, JSON.stringify(preferences));
    return of(preferences);
  }
  
  // Create a friend request notification
  createFriendRequestNotification(targetUserId: string, senderName: string, senderAvatar?: string): Observable<Notification> {
    return this.createNotification({
      type: NotificationType.FRIEND_REQUEST,
      userId: targetUserId,
      title: 'New Friend Request',
      message: `${senderName} sent you a friend request`,
      senderId: this.authService.getCurrentUser()?.id,
      senderName,
      senderAvatar,
      actionUrl: '/friends'
    });
  }
  
  // Create a friend accepted notification
  createFriendAcceptedNotification(targetUserId: string, senderName: string, senderAvatar?: string): Observable<Notification> {
    return this.createNotification({
      type: NotificationType.FRIEND_ACCEPTED,
      userId: targetUserId,
      title: 'Friend Request Accepted',
      message: `${senderName} accepted your friend request`,
      senderId: this.authService.getCurrentUser()?.id,
      senderName,
      senderAvatar,
      actionUrl: '/friends'
    });
  }
  
  // Create a watchlist shared notification
  createWatchlistSharedNotification(targetUserId: string, senderName: string, watchlistId: string, senderAvatar?: string): Observable<Notification> {
    return this.createNotification({
      type: NotificationType.WATCHLIST_SHARED,
      userId: targetUserId,
      title: 'Watchlist Shared',
      message: `${senderName} shared a watchlist with you`,
      senderId: this.authService.getCurrentUser()?.id,
      senderName,
      senderAvatar,
      contentId: watchlistId,
      contentType: ContentType.LIST,
      actionUrl: `/social/shared?id=${watchlistId}`
    });
  }
  
  // Create a comment notification
  createCommentNotification(targetUserId: string, senderName: string, contentId: string, contentType: ContentType, senderAvatar?: string): Observable<Notification> {
    let contentTypeLabel = '';
    let actionUrl = '';
    
    switch (contentType) {
      case ContentType.MOVIE:
        contentTypeLabel = 'movie';
        actionUrl = `/movie/${contentId}`;
        break;
      case ContentType.REVIEW:
        contentTypeLabel = 'review';
        actionUrl = `/review/${contentId}`;
        break;
      case ContentType.LIST:
        contentTypeLabel = 'watchlist';
        actionUrl = `/social/shared?id=${contentId}`;
        break;
      default:
        contentTypeLabel = 'content';
        actionUrl = '';
    }
    
    return this.createNotification({
      type: NotificationType.COMMENT_ADDED,
      userId: targetUserId,
      title: 'New Comment',
      message: `${senderName} commented on your ${contentTypeLabel}`,
      senderId: this.authService.getCurrentUser()?.id,
      senderName,
      senderAvatar,
      contentId,
      contentType,
      actionUrl
    });
  }
  
  // Create a movie recommendation notification
  createMovieRecommendationNotification(targetUserId: string, senderName: string, movieId: string, movieTitle: string, senderAvatar?: string): Observable<Notification> {
    return this.createNotification({
      type: NotificationType.MOVIE_RECOMMENDATION,
      userId: targetUserId,
      title: 'Movie Recommendation',
      message: `${senderName} recommended "${movieTitle}" to you`,
      senderId: this.authService.getCurrentUser()?.id,
      senderName,
      senderAvatar,
      contentId: movieId,
      contentType: ContentType.MOVIE,
      actionUrl: `/movie/${movieId}`
    });
  }
  
  // Show error message
  showError(message: string): void {
    console.error(message);
    // In a real app, this would show a toast or snackbar
    // For now, just log to console
  }
  
  // Update unread count
  private updateUnreadCount(notifications: Notification[]): void {
    const unreadCount = notifications.filter(n => !n.isRead).length;
    this.unreadCountSubject.next(unreadCount);
  }
  
  // Helper function to get default notification preferences
  private getDefaultPreferences(): NotificationPreferences {
    return {
      friendRequests: true,
      friendActivity: true,
      comments: true,
      recommendations: true,
      achievements: true,
      systemNotifications: true,
      emailNotifications: false,
      pushNotifications: false
    };
  }
  
  // Helper method to generate unique IDs
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
} 