import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError, combineLatest } from 'rxjs';
import { catchError, tap, map, switchMap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { 
  User, 
  UserRole 
} from '../models/user.model';
import { 
  UserActivityLog,
  UserActivityAction,
  UserStats,
  UserStatus,
  SuspensionRecord,
  UserFilters,
  UserManagementStats,
  AdminActionLog,
  AdminAction
} from '../models/user-management.model';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private baseUrl = environment.apiUrl;
  private usersSubject = new BehaviorSubject<User[]>([]);
  public users$ = this.usersSubject.asObservable();
  
  private userFilterSubject = new BehaviorSubject<UserFilters>({});
  public userFilter$ = this.userFilterSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.loadUsers();
  }

  // Core User Management Methods

  /**
   * Get users with filtering
   * @param filters Optional filters to apply
   * @returns Observable of filtered users
   */
  getUsers(filters?: UserFilters): Observable<User[]> {
    if (!this.authService.isAdmin() && !this.authService.isModerator()) {
      return throwError(() => new Error('Unauthorized access to user management'));
    }

    if (filters) {
      this.userFilterSubject.next(filters);
    }

    return combineLatest([
      this.users$,
      this.userFilter$
    ]).pipe(
      map(([users, filter]) => this.applyFilters(users, filter))
    );
  }

  /**
   * Get a user by their ID
   * @param userId The user ID to fetch
   * @returns Observable of the user or null if not found
   */
  getUserById(userId: string): Observable<User | null> {
    if (!this.authService.isAdmin() && !this.authService.isModerator()) {
      return throwError(() => new Error('Unauthorized access to user management'));
    }

    return this.http.get<User>(`${this.baseUrl}/admin/users/${userId}`).pipe(
      catchError(error => {
        console.warn('API call failed, using local data', error);
        const users = this.getStoredUsers();
        const user = users.find(u => u.id === userId) || null;
        return of(user);
      })
    );
  }

  /**
   * Update user roles
   * @param userId The user ID to update
   * @param roles The new roles for the user
   * @returns Observable of the updated user
   */
  updateUserRoles(userId: string, roles: UserRole[]): Observable<User> {
    if (!this.authService.isAdmin()) {
      return throwError(() => new Error('Only admins can update user roles'));
    }

    return this.http.patch<User>(`${this.baseUrl}/admin/users/${userId}/roles`, { roles }).pipe(
      tap(updatedUser => {
        this.logAdminAction(userId, AdminAction.USER_ROLE_CHANGED, 
          `Updated user roles to: ${roles.join(', ')}`);
      }),
      catchError(error => {
        console.warn('API call failed, using local data', error);
        const users = this.getStoredUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
          return throwError(() => new Error('User not found'));
        }
        
        const previousRoles = [...users[userIndex].roles];
        const updatedUser = { 
          ...users[userIndex], 
          roles,
          lastLogin: new Date() // Update for mock data
        };
        
        users[userIndex] = updatedUser;
        localStorage.setItem('admin_users', JSON.stringify(users));
        this.usersSubject.next(users);
        
        this.logAdminAction(userId, AdminAction.USER_ROLE_CHANGED, 
          `Updated user roles from ${previousRoles.join(', ')} to ${roles.join(', ')}`);
        
        return of(updatedUser);
      })
    );
  }

  /**
   * Set user status (active, suspended, banned, etc.)
   * @param userId The user ID to update
   * @param status The new status to set
   * @param reason Optional reason for the status change
   * @param endDate Optional end date for suspension
   * @returns Observable of the updated user
   */
  setUserStatus(
    userId: string, 
    status: UserStatus, 
    reason?: string, 
    endDate?: Date
  ): Observable<User> {
    if (!this.authService.isAdmin() && !this.authService.isModerator()) {
      return throwError(() => new Error('Unauthorized to change user status'));
    }

    const requestData = { 
      status, 
      reason, 
      endDate 
    };

    let adminAction: AdminAction;
    switch (status) {
      case UserStatus.SUSPENDED:
        adminAction = AdminAction.USER_SUSPENDED;
        break;
      case UserStatus.BANNED:
        adminAction = AdminAction.USER_BANNED;
        break;
      case UserStatus.ACTIVE:
        adminAction = AdminAction.USER_ACTIVATED;
        break;
      default:
        adminAction = AdminAction.USER_ROLE_CHANGED;
    }

    return this.http.patch<User>(`${this.baseUrl}/admin/users/${userId}/status`, requestData).pipe(
      tap(updatedUser => {
        this.logAdminAction(userId, adminAction, 
          `Changed user status to ${status}${reason ? ': ' + reason : ''}`);
        
        // Create suspension record if applicable
        if (status === UserStatus.SUSPENDED) {
          this.createSuspensionRecord(userId, reason || 'No reason provided', endDate);
        }
      }),
      catchError(error => {
        console.warn('API call failed, using local data', error);
        const users = this.getStoredUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
          return throwError(() => new Error('User not found'));
        }
        
        const previousStatus = users[userIndex].accountStatus || 'active';
        const updatedUser = { 
          ...users[userIndex], 
          accountStatus: status,
          suspensionReason: status === UserStatus.SUSPENDED ? reason : undefined,
          suspensionEndDate: status === UserStatus.SUSPENDED ? endDate : undefined,
          lastLogin: new Date() // Update for mock data
        };
        
        users[userIndex] = updatedUser;
        localStorage.setItem('admin_users', JSON.stringify(users));
        this.usersSubject.next(users);
        
        this.logAdminAction(userId, adminAction, 
          `Changed user status from ${previousStatus} to ${status}${reason ? ': ' + reason : ''}`);
        
        // Create suspension record if applicable
        if (status === UserStatus.SUSPENDED) {
          this.createSuspensionRecord(userId, reason || 'No reason provided', endDate);
        }
        
        return of(updatedUser);
      })
    );
  }

  /**
   * Delete a user
   * @param userId The user ID to delete
   * @returns Observable of success status
   */
  deleteUser(userId: string): Observable<boolean> {
    if (!this.authService.isAdmin()) {
      return throwError(() => new Error('Only admins can delete users'));
    }

    return this.http.delete<void>(`${this.baseUrl}/admin/users/${userId}`).pipe(
      map(() => true),
      tap(() => {
        this.logAdminAction(userId, AdminAction.USER_DELETED, 'User account deleted');
      }),
      catchError(error => {
        console.warn('API call failed, using local data', error);
        const users = this.getStoredUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
          return throwError(() => new Error('User not found'));
        }
        
        const filteredUsers = users.filter(u => u.id !== userId);
        localStorage.setItem('admin_users', JSON.stringify(filteredUsers));
        this.usersSubject.next(filteredUsers);
        
        this.logAdminAction(userId, AdminAction.USER_DELETED, 'User account deleted');
        
        return of(true);
      })
    );
  }

  /**
   * Reset a user's password
   * @param userId The user ID to reset password for
   * @returns Observable of success status
   */
  resetUserPassword(userId: string): Observable<boolean> {
    if (!this.authService.isAdmin()) {
      return throwError(() => new Error('Only admins can reset passwords'));
    }

    return this.http.post<void>(`${this.baseUrl}/admin/users/${userId}/reset-password`, {}).pipe(
      map(() => true),
      tap(() => {
        this.logAdminAction(userId, AdminAction.USER_PASSWORD_RESET, 'User password reset initiated');
      }),
      catchError(error => {
        console.warn('API call failed, using local data', error);
        // In a real app, we would call the actual API to reset the password
        // For mock purposes, we'll just return success
        this.logAdminAction(userId, AdminAction.USER_PASSWORD_RESET, 'User password reset initiated');
        return of(true);
      })
    );
  }

  // User Activity & Monitoring Methods

  /**
   * Get activity logs for a specific user
   * @param userId The user ID to get logs for
   * @param limit Optional limit of logs to return
   * @returns Observable of activity logs
   */
  getUserActivityLogs(userId: string, limit?: number): Observable<UserActivityLog[]> {
    if (!this.authService.isAdmin() && !this.authService.isModerator()) {
      return throwError(() => new Error('Unauthorized to access user activity logs'));
    }

    let url = `${this.baseUrl}/admin/users/${userId}/activity`;
    if (limit) {
      url += `?limit=${limit}`;
    }

    return this.http.get<UserActivityLog[]>(url).pipe(
      catchError(error => {
        console.warn('API call failed, using local data', error);
        return of(this.getMockActivityLogs(userId, limit));
      })
    );
  }

  /**
   * Get recent activity across all users
   * @param limit Optional limit of logs to return
   * @returns Observable of activity logs
   */
  getRecentActivity(limit = 50): Observable<UserActivityLog[]> {
    if (!this.authService.isAdmin() && !this.authService.isModerator()) {
      return throwError(() => new Error('Unauthorized to access activity logs'));
    }

    return this.http.get<UserActivityLog[]>(`${this.baseUrl}/admin/activity?limit=${limit}`).pipe(
      catchError(error => {
        console.warn('API call failed, using local data', error);
        return of(this.getMockActivityLogs(undefined, limit));
      })
    );
  }

  /**
   * Get suspension records for a user
   * @param userId The user ID to get suspension records for
   * @returns Observable of suspension records
   */
  getUserSuspensions(userId: string): Observable<SuspensionRecord[]> {
    if (!this.authService.isAdmin() && !this.authService.isModerator()) {
      return throwError(() => new Error('Unauthorized to access suspension records'));
    }

    return this.http.get<SuspensionRecord[]>(`${this.baseUrl}/admin/users/${userId}/suspensions`).pipe(
      catchError(error => {
        console.warn('API call failed, using local data', error);
        return of(this.getStoredSuspensionRecords(userId));
      })
    );
  }

  /**
   * Get user statistics for the admin dashboard
   * @returns Observable of user management statistics
   */
  getUserManagementStats(): Observable<UserManagementStats> {
    if (!this.authService.isAdmin() && !this.authService.isModerator()) {
      return throwError(() => new Error('Unauthorized to access user statistics'));
    }

    return this.http.get<UserManagementStats>(`${this.baseUrl}/admin/users/stats`).pipe(
      catchError(error => {
        console.warn('API call failed, using local data', error);
        return of(this.calculateUserStats());
      })
    );
  }

  /**
   * Get detailed stats for a specific user
   * @param userId The user ID to get stats for
   * @returns Observable of user statistics
   */
  getUserStats(userId: string): Observable<UserStats> {
    if (!this.authService.isAdmin() && !this.authService.isModerator()) {
      return throwError(() => new Error('Unauthorized to access user statistics'));
    }

    return this.http.get<UserStats>(`${this.baseUrl}/admin/users/${userId}/stats`).pipe(
      catchError(error => {
        console.warn('API call failed, using local data', error);
        return of(this.getMockUserStats(userId));
      })
    );
  }

  /**
   * Get admin action logs
   * @param limit Optional limit of logs to return
   * @returns Observable of admin action logs
   */
  getAdminActionLogs(limit = 50): Observable<AdminActionLog[]> {
    if (!this.authService.isAdmin()) {
      return throwError(() => new Error('Only admins can access admin action logs'));
    }

    return this.http.get<AdminActionLog[]>(`${this.baseUrl}/admin/logs?limit=${limit}`).pipe(
      catchError(error => {
        console.warn('API call failed, using local data', error);
        return of(this.getStoredAdminLogs(limit));
      })
    );
  }

  // Private helper methods

  private loadUsers(): void {
    if (!this.authService.isAdmin() && !this.authService.isModerator()) {
      this.usersSubject.next([]);
      return;
    }

    this.http.get<User[]>(`${this.baseUrl}/admin/users`).pipe(
      catchError(error => {
        console.warn('API call failed, using local data', error);
        return of(this.getStoredUsers());
      })
    ).subscribe(users => {
      this.usersSubject.next(users);
    });
  }

  private getStoredUsers(): User[] {
    const storedUsers = localStorage.getItem('admin_users');
    if (!storedUsers) {
      const mockUsers = this.generateMockUsers();
      localStorage.setItem('admin_users', JSON.stringify(mockUsers));
      return mockUsers;
    }
    return JSON.parse(storedUsers);
  }

  private getStoredActivityLogs(): UserActivityLog[] {
    const storedLogs = localStorage.getItem('user_activity_logs');
    if (!storedLogs) {
      return [];
    }
    return JSON.parse(storedLogs);
  }

  private getStoredSuspensionRecords(userId?: string): SuspensionRecord[] {
    const storedRecords = localStorage.getItem('suspension_records');
    if (!storedRecords) {
      return [];
    }
    const records: SuspensionRecord[] = JSON.parse(storedRecords);
    if (userId) {
      return records.filter(record => record.userId === userId);
    }
    return records;
  }

  private getStoredAdminLogs(limit?: number): AdminActionLog[] {
    const storedLogs = localStorage.getItem('admin_action_logs');
    if (!storedLogs) {
      return [];
    }
    const logs: AdminActionLog[] = JSON.parse(storedLogs);
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    if (limit) {
      return logs.slice(0, limit);
    }
    return logs;
  }

  private applyFilters(users: User[], filters: UserFilters): User[] {
    if (!filters || Object.keys(filters).length === 0) {
      return users;
    }

    return users.filter(user => {
      // Status filter
      if (filters.status) {
        const userStatus = user.accountStatus || UserStatus.ACTIVE;
        if (userStatus !== filters.status) {
          return false;
        }
      }

      // Role filter
      if (filters.roles && filters.roles.length > 0) {
        if (!filters.roles.some(role => user.roles.includes(role))) {
          return false;
        }
      }

      // Date range filter
      if (filters.dateFrom) {
        const userCreatedAt = new Date(user.createdAt);
        const fromDate = new Date(filters.dateFrom);
        if (userCreatedAt < fromDate) {
          return false;
        }
      }

      if (filters.dateTo) {
        const userCreatedAt = new Date(user.createdAt);
        const toDate = new Date(filters.dateTo);
        if (userCreatedAt > toDate) {
          return false;
        }
      }

      // Search query filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const username = user.username.toLowerCase();
        const email = user.email.toLowerCase();
        
        if (!username.includes(query) && !email.includes(query)) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      // Apply sorting
      if (!filters.sortBy) {
        // Default sort by username
        return a.username.localeCompare(b.username);
      }

      const direction = filters.sortDirection === 'asc' ? 1 : -1;

      switch (filters.sortBy) {
        case 'username':
          return direction * a.username.localeCompare(b.username);
        case 'email':
          return direction * a.email.localeCompare(b.email);
        case 'createdAt':
          return direction * (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        case 'lastLogin':
          const bLogin = b.lastLogin ? new Date(b.lastLogin).getTime() : 0;
          const aLogin = a.lastLogin ? new Date(a.lastLogin).getTime() : 0;
          return direction * (bLogin - aLogin);
        case 'status':
          const bStatus = b.accountStatus || 'active';
          const aStatus = a.accountStatus || 'active';
          return direction * aStatus.localeCompare(bStatus);
        default:
          return 0;
      }
    });
  }

  private createSuspensionRecord(userId: string, reason: string, endDate?: Date): void {
    const admin = this.authService.getCurrentUser();
    if (!admin) return;
    
    const newRecord: SuspensionRecord = {
      id: this.generateId(),
      userId,
      reason,
      suspendedBy: admin.id,
      startDate: new Date(),
      endDate,
      isActive: true,
      notes: `Suspended by ${admin.username}`
    };
    
    const records = this.getStoredSuspensionRecords();
    records.push(newRecord);
    localStorage.setItem('suspension_records', JSON.stringify(records));
  }

  private logAdminAction(
    targetUserId: string, 
    action: AdminAction, 
    details: string, 
    previousState?: any,
    newState?: any
  ): void {
    const admin = this.authService.getCurrentUser();
    if (!admin) return;
    
    const newLog: AdminActionLog = {
      id: this.generateId(),
      adminId: admin.id,
      targetUserId,
      action,
      details,
      timestamp: new Date(),
      previousState,
      newState
    };
    
    const logs = this.getStoredAdminLogs();
    logs.push(newLog);
    localStorage.setItem('admin_action_logs', JSON.stringify(logs));
  }

  private getMockActivityLogs(userId?: string, limit?: number): UserActivityLog[] {
    const storedLogs = this.getStoredActivityLogs();
    if (storedLogs.length > 0) {
      let logs = userId ? storedLogs.filter(log => log.userId === userId) : storedLogs;
      logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      if (limit) {
        return logs.slice(0, limit);
      }
      return logs;
    }
    
    // Generate some mock activity logs if none exist
    const users = this.getStoredUsers();
    const logs: UserActivityLog[] = [];
    
    users.forEach(user => {
      if (userId && user.id !== userId) return;
      
      // Add login activity
      logs.push({
        id: this.generateId(),
        userId: user.id,
        action: UserActivityAction.LOGIN,
        timestamp: new Date(Date.now() - Math.random() * 10000000),
        ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        details: 'User login successful'
      });
      
      // Add profile update
      logs.push({
        id: this.generateId(),
        userId: user.id,
        action: UserActivityAction.PROFILE_UPDATE,
        timestamp: new Date(Date.now() - Math.random() * 10000000),
        details: 'User updated profile'
      });
      
      // Add other random activities
      const actions = Object.values(UserActivityAction);
      for (let i = 0; i < 5; i++) {
        const action = actions[Math.floor(Math.random() * actions.length)];
        logs.push({
          id: this.generateId(),
          userId: user.id,
          action,
          timestamp: new Date(Date.now() - Math.random() * 10000000),
          details: `User performed action: ${action}`
        });
      }
    });
    
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    localStorage.setItem('user_activity_logs', JSON.stringify(logs));
    
    if (limit) {
      return logs.slice(0, limit);
    }
    return logs;
  }

  private getMockUserStats(userId: string): UserStats {
    const user = this.getStoredUsers().find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    return {
      totalReviews: Math.floor(Math.random() * 50),
      averageRating: Math.random() * 5,
      watchlistCount: Math.floor(Math.random() * 100),
      moviesWatched: Math.floor(Math.random() * 200),
      listsCreated: Math.floor(Math.random() * 10),
      friendsCount: Math.floor(Math.random() * 30),
      achievementsEarned: Math.floor(Math.random() * 20),
      lastLoginDate: user.lastLogin,
      registrationDate: user.createdAt,
      totalLogins: Math.floor(Math.random() * 100) + 1
    };
  }

  private calculateUserStats(): UserManagementStats {
    const users = this.getStoredUsers();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    
    // Count users by status
    let activeUsers = 0;
    let suspendedUsers = 0;
    let bannedUsers = 0;
    let inactiveUsers = 0;
    let pendingVerificationUsers = 0;
    
    // Count new users
    let newUsersToday = 0;
    let newUsersThisWeek = 0;
    let newUsersThisMonth = 0;
    
    // Count users by role
    const usersByRole: Record<UserRole, number> = {
      user: 0,
      admin: 0,
      moderator: 0
    };
    
    users.forEach(user => {
      // Count by status
      const status = user.accountStatus || UserStatus.ACTIVE;
      switch (status) {
        case UserStatus.ACTIVE:
          activeUsers++;
          break;
        case UserStatus.SUSPENDED:
          suspendedUsers++;
          break;
        case UserStatus.BANNED:
          bannedUsers++;
          break;
        case UserStatus.INACTIVE:
          inactiveUsers++;
          break;
        case UserStatus.PENDING_VERIFICATION:
          pendingVerificationUsers++;
          break;
      }
      
      // Count by creation date
      const createdAt = new Date(user.createdAt);
      if (createdAt >= today) {
        newUsersToday++;
      }
      if (createdAt >= weekAgo) {
        newUsersThisWeek++;
      }
      if (createdAt >= monthAgo) {
        newUsersThisMonth++;
      }
      
      // Count by role
      user.roles.forEach(role => {
        usersByRole[role]++;
      });
    });
    
    return {
      totalUsers: users.length,
      activeUsers,
      suspendedUsers,
      bannedUsers,
      inactiveUsers,
      pendingVerificationUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      usersByRole
    };
  }

  private generateMockUsers(): User[] {
    const mockUsers: User[] = [
      {
        id: '1',
        username: 'admin',
        email: 'admin@example.com',
        roles: ['admin', 'user'],
        createdAt: new Date(2023, 0, 1),
        lastLogin: new Date(Date.now() - 1000000),
        isActive: true,
        accountStatus: UserStatus.ACTIVE
      },
      {
        id: '2',
        username: 'moderator',
        email: 'mod@example.com',
        roles: ['moderator', 'user'],
        createdAt: new Date(2023, 1, 15),
        lastLogin: new Date(Date.now() - 2000000),
        isActive: true,
        accountStatus: UserStatus.ACTIVE
      }
    ];
    
    // Generate some regular users
    for (let i = 3; i <= 50; i++) {
      const createdDate = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000);
      const lastLogin = Math.random() > 0.2 
        ? new Date(createdDate.getTime() + Math.random() * (Date.now() - createdDate.getTime())) 
        : undefined;
      
      // Randomly assign statuses
      let accountStatus = UserStatus.ACTIVE;
      if (i % 10 === 0) accountStatus = UserStatus.SUSPENDED;
      if (i % 15 === 0) accountStatus = UserStatus.BANNED;
      if (i % 20 === 0) accountStatus = UserStatus.INACTIVE;
      if (i % 25 === 0) accountStatus = UserStatus.PENDING_VERIFICATION;
      
      mockUsers.push({
        id: i.toString(),
        username: `user${i}`,
        email: `user${i}@example.com`,
        roles: ['user'],
        createdAt: createdDate,
        lastLogin,
        isActive: accountStatus === UserStatus.ACTIVE,
        accountStatus
      });
    }
    
    return mockUsers;
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
} 