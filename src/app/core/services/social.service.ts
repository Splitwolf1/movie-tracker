import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { Comment, CommentThread, SharedContent, Activity, ContentType, PrivacyLevel, ActivityType } from '../models/social.model';
import { Movie } from '../models/movie.model';
import { FriendService } from './friend.service';

@Injectable({
  providedIn: 'root'
})
export class SocialService {
  private baseUrl = environment.apiUrl;
  private sharedContentKey = 'user_shared_content';
  private commentsKey = 'content_comments';
  private activityKey = 'user_activity';
  
  private activitiesSubject = new BehaviorSubject<Activity[]>([]);
  public activities$ = this.activitiesSubject.asObservable();
  
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private friendService: FriendService
  ) {
    this.loadActivities();
  }
  
  // Load user's activity feed
  private loadActivities(): void {
    const user = this.authService.getCurrentUser();
    if (!user || !user.id) {
      return;
    }
    
    // In a real app, this would be an API call
    const storedActivities = localStorage.getItem(this.activityKey);
    const activities = storedActivities ? JSON.parse(storedActivities) : [];
    
    // Get friend IDs to filter activities
    this.friendService.getFriends().pipe(
      take(1)
    ).subscribe(friends => {
      const friendIds = friends.map(friend => friend.id);
      // Include current user's ID to see their own activities
      friendIds.push(user.id);
      
      // Filter activities by user and friends
      const filteredActivities = activities.filter((activity: Activity) => 
        friendIds.includes(activity.userId)
      );
      
      // Sort by date (newest first)
      filteredActivities.sort((a: Activity, b: Activity) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      this.activitiesSubject.next(filteredActivities);
    });
  }
  
  // Get activity feed
  getActivityFeed(): Observable<Activity[]> {
    return this.activities$;
  }
  
  // Share content (movie, review, or watchlist)
  shareContent(
    contentType: ContentType, 
    contentId: string, 
    message: string = '',
    privacy: PrivacyLevel = PrivacyLevel.FRIENDS
  ): Observable<SharedContent | null> {
    const user = this.authService.getCurrentUser();
    if (!user || !user.id) {
      return of(null);
    }
    
    // Create new shared content
    const newSharedContent: SharedContent = {
      id: this.generateId(),
      userId: user.id,
      username: user.username,
      contentType,
      contentId,
      message,
      createdAt: new Date(),
      privacy,
      likes: 0
    };
    
    // Store shared content
    const storedContent = localStorage.getItem(this.sharedContentKey);
    const allSharedContent = storedContent ? JSON.parse(storedContent) : [];
    localStorage.setItem(this.sharedContentKey, JSON.stringify([...allSharedContent, newSharedContent]));
    
    // Create activity
    this.createActivity(ActivityType.CONTENT_SHARED, contentType, contentId);
    
    return of(newSharedContent);
  }
  
  // Get shared content
  getSharedContent(contentId?: string, contentType?: ContentType): Observable<SharedContent[]> {
    const user = this.authService.getCurrentUser();
    if (!user || !user.id) {
      return of([]);
    }
    
    // Get friend IDs for privacy filtering
    return this.friendService.getFriends().pipe(
      take(1),
      map(friends => {
        const friendIds = friends.map(friend => friend.id);
        
        // Get all shared content
        const storedContent = localStorage.getItem(this.sharedContentKey);
        const allSharedContent: SharedContent[] = storedContent ? JSON.parse(storedContent) : [];
        
        // Filter based on privacy and optional content parameters
        return allSharedContent.filter(content => {
          // Privacy check
          if (content.privacy === PrivacyLevel.PRIVATE && content.userId !== user.id) {
            return false;
          }
          
          if (content.privacy === PrivacyLevel.FRIENDS && 
              content.userId !== user.id && 
              !friendIds.includes(content.userId)) {
            return false;
          }
          
          // Content type and ID filtering if provided
          if (contentType && content.contentType !== contentType) {
            return false;
          }
          
          if (contentId && content.contentId !== contentId) {
            return false;
          }
          
          return true;
        });
      })
    );
  }
  
  // Add comment to content
  addComment(
    contentType: ContentType,
    contentId: string,
    commentText: string,
    parentId?: string
  ): Observable<Comment | null> {
    const user = this.authService.getCurrentUser();
    if (!user || !user.id) {
      return of(null);
    }
    
    // Create new comment
    const newComment: Comment = {
      id: this.generateId(),
      userId: user.id,
      username: user.username,
      userAvatar: user.avatar,
      movieId: contentType === ContentType.MOVIE ? contentId : "0",
      content: commentText,
      createdAt: new Date(),
      updatedAt: new Date(),
      parentId,
      likes: 0
    };
    
    // Get existing thread or create new one
    const storedThreads = localStorage.getItem(this.commentsKey);
    const allThreads: CommentThread[] = storedThreads ? JSON.parse(storedThreads) : [];
    
    let thread = allThreads.find(t => 
      t.contentId === contentId && t.contentType === contentType
    );
    
    if (thread) {
      // Add to existing thread
      thread.comments.push(newComment);
      const updatedThreads = allThreads.map(t => 
        t.id === thread?.id ? thread : t
      );
      localStorage.setItem(this.commentsKey, JSON.stringify(updatedThreads));
    } else {
      // Create new thread
      const newThread: CommentThread = {
        id: this.generateId(),
        contentId,
        contentType,
        comments: [newComment]
      };
      localStorage.setItem(this.commentsKey, JSON.stringify([...allThreads, newThread]));
    }
    
    return of(newComment);
  }
  
  // Get comments for specific content
  getComments(contentType: ContentType, contentId: string): Observable<Comment[]> {
    const storedThreads = localStorage.getItem(this.commentsKey);
    const allThreads: CommentThread[] = storedThreads ? JSON.parse(storedThreads) : [];
    
    const thread = allThreads.find(t => 
      t.contentId === contentId && t.contentType === contentType
    );
    
    return of(thread ? thread.comments : []);
  }
  
  // Like content
  likeContent(contentType: ContentType, contentId: string): Observable<boolean> {
    const user = this.authService.getCurrentUser();
    if (!user || !user.id) {
      return of(false);
    }
    
    // Handle different content types
    if (contentType === ContentType.MOVIE) {
      // Implement movie liking
      return of(true);
    } else if (contentType === ContentType.REVIEW) {
      // Implement review liking
      return of(true);
    } else if (contentType === ContentType.LIST) {
      // Implement list liking
      return of(true);
    }
    
    return of(false);
  }
  
  // Like a comment
  likeComment(commentId: string, contentType: ContentType, contentId: string): Observable<boolean> {
    const user = this.authService.getCurrentUser();
    if (!user || !user.id) {
      return of(false);
    }
    
    const storedThreads = localStorage.getItem(this.commentsKey);
    const allThreads: CommentThread[] = storedThreads ? JSON.parse(storedThreads) : [];
    
    const thread = allThreads.find(t => 
      t.contentId === contentId && t.contentType === contentType
    );
    
    if (!thread) {
      return of(false);
    }
    
    // Find and update the comment
    const commentIndex = thread.comments.findIndex(c => c.id === commentId);
    if (commentIndex === -1) {
      return of(false);
    }
    
    // Increment likes
    thread.comments[commentIndex].likes += 1;
    
    // Update storage
    const updatedThreads = allThreads.map(t => 
      t.id === thread.id ? thread : t
    );
    localStorage.setItem(this.commentsKey, JSON.stringify(updatedThreads));
    
    return of(true);
  }
  
  // Create activity
  private createActivity(
    type: ActivityType, 
    contentType?: ContentType,
    contentId?: string,
    friendId?: string
  ): void {
    const user = this.authService.getCurrentUser();
    if (!user || !user.id) {
      return;
    }
    
    const newActivity: Activity = {
      id: this.generateId(),
      type,
      userId: user.id,
      username: user.username,
      userAvatar: user.avatar,
      contentType,
      contentId,
      friendId,
      createdAt: new Date()
    };
    
    // Store activity
    const storedActivities = localStorage.getItem(this.activityKey);
    const allActivities = storedActivities ? JSON.parse(storedActivities) : [];
    localStorage.setItem(this.activityKey, JSON.stringify([...allActivities, newActivity]));
    
    // Update the activities subject
    this.loadActivities();
  }
  
  // Helper method to generate unique IDs
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
} 