import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, tap, of, map } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Service for managing CSRF tokens
 * 
 * This service handles:
 * - Retrieving a fresh CSRF token from the server
 * - Storing the token in both cookie and localStorage
 * - Validating the token's existence
 */
@Injectable({
  providedIn: 'root'
})
export class CsrfService {
  private baseUrl = environment.apiUrl;
  private tokenKey = 'XSRF-TOKEN';
  
  constructor(private http: HttpClient) {}
  
  /**
   * Get a new CSRF token from the server
   * The server should set a cookie, but we also store in localStorage as fallback
   */
  refreshToken(): Observable<boolean> {
    return this.http.get<{ token: string }>(`${this.baseUrl}/csrf-token`)
      .pipe(
        tap(response => {
          if (response && response.token) {
            // Store in localStorage as fallback
            localStorage.setItem(this.tokenKey, response.token);
          }
        }),
        // Map to success boolean
        map(() => true),
        catchError(error => {
          console.error('Error fetching CSRF token:', error);
          return of(false);
        })
      );
  }
  
  /**
   * Check if we have a valid CSRF token
   */
  hasValidToken(): boolean {
    // Check cookie first (more secure)
    const cookieExists = document.cookie
      .split('; ')
      .some(row => row.startsWith(`${this.tokenKey}=`));
      
    if (cookieExists) {
      return true;
    }
    
    // Fall back to localStorage
    const localToken = localStorage.getItem(this.tokenKey);
    return !!localToken;
  }
  
  /**
   * Remove the CSRF token (used during logout)
   */
  clearToken(): void {
    // Clear from localStorage
    localStorage.removeItem(this.tokenKey);
    
    // Clear from cookies by setting expiration in the past
    document.cookie = `${this.tokenKey}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
} 