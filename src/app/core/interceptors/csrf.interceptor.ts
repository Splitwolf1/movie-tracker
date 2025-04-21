import { HttpInterceptorFn, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';

/**
 * CSRF protection interceptor
 * 
 * This interceptor adds CSRF tokens to all non-GET requests to protect against
 * Cross-Site Request Forgery attacks.
 * 
 * It retrieves the CSRF token from a cookie or localStorage and adds it as a header
 * to each non-GET request going to our API.
 */
export const csrfInterceptorFn: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  // Skip for GET requests (they should be idempotent and don't need CSRF protection)
  if (req.method === 'GET') {
    return next(req);
  }
  
  // Skip for requests to external APIs (like TMDB)
  if (!req.url.includes('/api/')) {
    return next(req);
  }
  
  // Get CSRF token from cookie or localStorage
  const csrfToken = getCsrfToken();
  
  // If we have a token, add it to the request
  if (csrfToken) {
    const modifiedRequest = req.clone({
      setHeaders: {
        'X-CSRF-Token': csrfToken
      }
    });
    return next(modifiedRequest);
  }
  
  // If no token, pass through (server should reject unsafe requests)
  return next(req);
};

/**
 * Get CSRF token from cookie or localStorage
 */
function getCsrfToken(): string | null {
  // Try to get from cookie first (more secure)
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];
    
  if (cookieValue) {
    return cookieValue;
  }
  
  // Fallback to localStorage
  return localStorage.getItem('XSRF-TOKEN');
} 