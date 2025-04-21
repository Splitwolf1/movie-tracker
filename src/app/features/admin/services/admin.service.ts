import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, delay, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { User, AdminUserInfo } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';
import { Report } from '../../../core/models/report.model';
import { ActionLog } from '../../../core/models/action-log.model';
import { Review } from '../../../core/models/review.model';
import { Comment } from '../../../core/models/social.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly API_URL = `${environment.apiUrl}/admin`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Get admin dashboard statistics
   */
  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.API_URL}/dashboard/stats`);
  }

  /**
   * Get all users with pagination
   */
  getUsers(page = 1, limit = 20, searchTerm = '', sortBy = 'createdAt', sortOrder = 'desc'): Observable<{
    users: AdminUserInfo[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.http.get<{
      users: AdminUserInfo[];
      total: number;
      page: number;
      limit: number;
    }>(`${this.API_URL}/users`, {
      params: {
        page: page.toString(),
        limit: limit.toString(),
        search: searchTerm,
        sortBy,
        sortOrder
      }
    });
  }

  /**
   * Get user details for admin view
   */
  getUserDetails(userId: string): Observable<AdminUserInfo> {
    return this.http.get<AdminUserInfo>(`${this.API_URL}/users/${userId}`);
  }

  /**
   * Update user details (admin access)
   */
  updateUser(userId: string, userData: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.API_URL}/users/${userId}`, userData);
  }

  /**
   * Delete a user
   */
  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/users/${userId}`);
  }

  /**
   * Ban a user
   */
  banUser(userId: string, reason: string, endDate?: Date): Observable<any> {
    return this.http.post(`${this.API_URL}/users/${userId}/ban`, {
      reason,
      endDate
    });
  }

  /**
   * Suspend a user
   */
  suspendUser(userId: string, reason: string, endDate: Date): Observable<any> {
    return this.http.post(`${this.API_URL}/users/${userId}/suspend`, {
      reason,
      endDate
    });
  }

  /**
   * Reinstate a banned or suspended user
   */
  reinstateUser(userId: string): Observable<any> {
    return this.http.post(`${this.API_URL}/users/${userId}/reinstate`, {});
  }

  /**
   * Get system health information
   */
  getSystemHealth(): Observable<any> {
    // In a real app, would call the API
    // For now, return mock data
    return of({
      status: 'healthy', // healthy, warning, critical
      cpuUsage: 45,
      memoryUsage: 62,
      diskUsage: 58,
      avgResponseTime: 120,
      uptime: '12 days, 5 hours',
      lastRestart: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
      errorRate: 0.5,
      activeUsers: 128
    }).pipe(
      delay(800) // Simulate network delay
    );
  }

  /**
   * Get system logs
   */
  getSystemLogs(page = 1, limit = 100, level = 'all'): Observable<any> {
    // In a real app, would call the API
    // For now, return mock data
    const mockLogs = this.getMockSystemLogs();
    
    // Filter logs by level if needed
    const filteredLogs = level === 'all' 
      ? mockLogs 
      : mockLogs.filter(log => log.level === level);
    
    return of({
      logs: filteredLogs,
      total: filteredLogs.length,
      page,
      limit
    }).pipe(
      delay(800) // Simulate network delay
    );
  }

  /**
   * Backup system data
   */
  createBackup(): Observable<any> {
    // In a real app, would call the API
    // For now, return success
    return of({
      success: true,
      backupId: `backup-${Date.now()}`,
      timestamp: new Date()
    }).pipe(
      delay(1500) // Simulate network delay for backup creation
    );
  }

  /**
   * Get list of backups
   */
  getBackups(): Observable<any> {
    // In a real app, would call the API
    // For now, return mock data
    return of({
      backups: this.getMockBackups(),
      total: 3
    }).pipe(
      delay(800) // Simulate network delay
    );
  }

  /**
   * Restore from backup
   */
  restoreFromBackup(backupId: string): Observable<any> {
    // In a real app, would call the API
    // For now, return success
    return of({
      success: true,
      message: `System restored from backup: ${backupId}`,
      timestamp: new Date()
    }).pipe(
      delay(2000) // Simulate longer network delay for restore operation
    );
  }

  getReports(filters?: any): Observable<Report[]> {
    // In a real app, would call the API with filters
    // For now, return mock data
    return of(this.getMockReports()).pipe(
      delay(500) // Simulate network delay
    );
  }

  getPendingReviews(filters?: any): Observable<Review[]> {
    // In a real app, would call the API with filters
    // For now, return mock data
    return of(this.getMockReviews()).pipe(
      delay(500) // Simulate network delay
    );
  }

  getPendingComments(filters?: any): Observable<Comment[]> {
    // In a real app, would call the API with filters
    // For now, return mock data
    return of(this.getMockComments()).pipe(
      delay(500) // Simulate network delay
    );
  }

  getActionLogs(filters?: any): Observable<ActionLog[]> {
    // In a real app, would call the API with filters
    // For now, return mock data
    return of(this.getMockActionLogs()).pipe(
      delay(500) // Simulate network delay
    );
  }

  // Mock data methods
  private getMockReports(): Report[] {
    return [
      {
        id: '1',
        contentId: '101',
        contentType: 'review' as any,
        reportedBy: 'user123',
        reportReason: 'inappropriate',
        reportedAt: new Date(),
        status: 'pending'
      },
      {
        id: '2',
        contentId: '102',
        contentType: 'comment' as any,
        reportedBy: 'user456',
        reportReason: 'spam',
        reportedAt: new Date(Date.now() - 86400000), // 1 day ago
        status: 'pending'
      }
    ];
  }

  private getMockReviews(): Review[] {
    return [
      {
        id: '101',
        userId: 'user123',
        movieId: 101,
        title: 'Test Review 1',
        content: 'This is a test review content',
        rating: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '102',
        userId: 'user456',
        movieId: 102,
        title: 'Test Review 2',
        content: 'This is another test review content',
        rating: 3,
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
        updatedAt: new Date(Date.now() - 86400000)
      }
    ];
  }

  private getMockComments(): Comment[] {
    return [
      {
        id: '201',
        userId: 'user123',
        username: 'testuser1',
        userAvatar: 'avatar1.jpg',
        movieId: 'movie101',
        content: 'This is a test comment',
        likes: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'pending'
      },
      {
        id: '202',
        userId: 'user456',
        username: 'testuser2',
        userAvatar: 'avatar2.jpg',
        movieId: 'movie102',
        content: 'This is another test comment',
        likes: 2,
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
        updatedAt: new Date(Date.now() - 86400000),
        status: 'pending'
      }
    ];
  }

  private getMockActionLogs(): ActionLog[] {
    return [
      {
        id: '301',
        actionType: 'approve' as any,
        contentId: '101',
        contentType: 'review' as any,
        userId: 'admin1',
        timestamp: new Date(),
        details: 'Approved review'
      },
      {
        id: '302',
        actionType: 'reject' as any,
        contentId: '202',
        contentType: 'comment' as any,
        userId: 'admin2',
        timestamp: new Date(Date.now() - 86400000), // 1 day ago
        details: 'Rejected comment due to spam'
      }
    ];
  }

  // Private helper methods for mock data
  private getMockSystemLogs() {
    return [
      {
        id: '1',
        timestamp: new Date(),
        level: 'info',
        source: 'AuthService',
        message: 'User user123 logged in successfully'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        level: 'warning',
        source: 'ContentService',
        message: 'Content upload limit approached for user456',
        details: { userId: 'user456', uploadCount: 95, limit: 100 }
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        level: 'error',
        source: 'APIService',
        message: 'External API request failed',
        details: { endpoint: '/api/external/movies', status: 500, error: 'Internal Server Error' }
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        level: 'info',
        source: 'BackupService',
        message: 'Automated backup completed successfully'
      },
      {
        id: '5',
        timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        level: 'debug',
        source: 'SearchService',
        message: 'Search index rebuilt',
        details: { documentsIndexed: 1240, duration: '45s' }
      }
    ];
  }

  private getMockBackups() {
    return [
      {
        id: 'backup-1',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        size: '156 MB',
        description: 'Daily automated backup',
        createdBy: 'system'
      },
      {
        id: 'backup-2',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        size: '152 MB',
        description: 'Pre-deployment backup',
        createdBy: 'admin'
      },
      {
        id: 'backup-3',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        size: '148 MB',
        description: 'Weekly automated backup',
        createdBy: 'system'
      }
    ];
  }
} 