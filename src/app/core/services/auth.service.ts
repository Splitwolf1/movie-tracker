import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';
import { User, UserRole, LoginCredentials, RegisterCredentials, AuthResponse } from '../models/user.model';

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.authApiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {
    // Initialize the current user from storage if available
    const user = this.storageService.getUser();
    if (user) {
      this.currentUserSubject.next(user);
    }
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap((response: AuthResponse) => {
        this.storageService.setToken(response.token);
        this.storageService.setUser(response.user);
        this.currentUserSubject.next(response.user);
      })
    );
  }

  register(data: RegisterCredentials): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, data);
  }

  logout(): void {
    this.storageService.clear();
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.storageService.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.getValue();
  }

  /**
   * Check if the current user has a specific role
   * @param role The role to check for
   * @returns True if the user has the specified role
   */
  hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    return !!user && user.roles.includes(role);
  }

  /**
   * Check if the current user is an admin
   * @returns True if the user has the admin role
   */
  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  /**
   * Check if the current user is a moderator
   * @returns True if the user has the moderator role
   */
  isModerator(): boolean {
    return this.hasRole('moderator') || this.isAdmin();
  }

  /**
   * Update the current user's profile
   * @param userData The updated user data
   * @returns An observable of the updated user
   */
  updateProfile(userData: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${environment.apiUrl}/users/profile`, userData).pipe(
      tap(updatedUser => {
        const currentUser = this.getCurrentUser();
        if (currentUser) {
          const mergedUser = { ...currentUser, ...updatedUser };
          this.storageService.setUser(mergedUser);
          this.currentUserSubject.next(mergedUser);
        }
      })
    );
  }

  refreshToken(): Observable<any> {
    return this.http.post(`${this.API_URL}/refresh-token`, {
      token: this.storageService.getToken()
    }).pipe(
      tap((response: any) => {
        this.storageService.setToken(response.token);
      })
    );
  }

  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.API_URL}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.API_URL}/reset-password`, {
      token,
      newPassword
    });
  }

  /**
   * Admin method: Get all users
   * @returns An observable of all users
   */
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/admin/users`);
  }

  /**
   * Admin method: Get user by ID
   * @param userId The user ID to fetch
   * @returns An observable of the user
   */
  getUserById(userId: string): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/admin/users/${userId}`);
  }

  /**
   * Admin method: Update user roles
   * @param userId The user ID to update
   * @param roles The new roles for the user
   * @returns An observable of the updated user
   */
  updateUserRoles(userId: string, roles: UserRole[]): Observable<User> {
    return this.http.patch<User>(`${environment.apiUrl}/admin/users/${userId}/roles`, { roles });
  }

  /**
   * Admin method: Activate or deactivate a user
   * @param userId The user ID to update
   * @param isActive Whether the user should be active
   * @returns An observable of the updated user
   */
  setUserActiveStatus(userId: string, isActive: boolean): Observable<User> {
    return this.http.patch<User>(`${environment.apiUrl}/admin/users/${userId}/status`, { isActive });
  }

  /**
   * Admin method: Delete a user
   * @param userId The user ID to delete
   * @returns An observable of the deletion result
   */
  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/admin/users/${userId}`);
  }
} 