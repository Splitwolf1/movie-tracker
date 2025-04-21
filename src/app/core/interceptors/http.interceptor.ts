import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { StorageService } from '../services/storage.service';
import { environment } from '../../../environments/environment';

export const httpInterceptorFn: HttpInterceptorFn = (req, next) => {
  const storageService = inject(StorageService);
  const authService = inject(AuthService);
  
  // Don't add token for public TMDB API endpoints or auth endpoints
  if (req.url.includes(environment.tmdbApiUrl) || 
      req.url.includes('/auth/login') || 
      req.url.includes('/auth/register') ||
      req.url.includes('/auth/forgot-password')) {
    return next(req);
  }
  
  const token = storageService.getToken();
  
  // Clone the request with the authorization header if token exists
  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return next(authReq).pipe(
      catchError((error) => {
        // Handle 401 Unauthorized errors - token might be expired
        if (error instanceof HttpErrorResponse && error.status === 401) {
          // Try to refresh the token
          return authService.refreshToken().pipe(
            switchMap(response => {
              const newToken = response.token;
              // Create a new request with the new token
              const newReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`
                }
              });
              // Retry the request with the new token
              return next(newReq);
            }),
            catchError((refreshError) => {
              // If refresh fails, log the user out
              authService.logout();
              return throwError(() => refreshError);
            })
          );
        }
        
        return throwError(() => error);
      })
    );
  }
  
  // No token, proceed with the original request
  return next(req);
}; 