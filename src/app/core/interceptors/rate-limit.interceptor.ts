import { HttpInterceptorFn, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { RateLimitService } from '../services/rate-limit.service';

/**
 * Rate limiting interceptor
 * 
 * This interceptor enforces rate limits on API requests to prevent abuse.
 * It checks if a request is allowed based on rate limits and:
 * - Allows the request if under the limit
 * - Delays the request if over the limit but can be retried soon
 * - Rejects the request with a 429 error if rate limit is severely exceeded
 */
export const rateLimitInterceptorFn: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const rateLimitService = inject(RateLimitService);
  
  // Skip rate limiting for some request types
  if (req.method === 'GET' && !req.url.includes('/api/search')) {
    // Skip rate limiting for most GET requests except search
    return next(req);
  }
  
  // Check if we can make this request
  const endpoint = getEndpointFromUrl(req.url);
  
  if (rateLimitService.canMakeRequest(endpoint)) {
    // Request is allowed, proceed
    return next(req);
  }
  
  // Request exceeds rate limits
  const waitTime = rateLimitService.getTimeUntilNextRequest(endpoint);
  
  if (waitTime > 15000) {
    // If wait time is over 15 seconds, reject immediately with 429 error
    return throwError(() => ({
      status: 429,
      error: {
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil(waitTime / 1000)
      }
    }));
  }
  
  // Otherwise, wait and retry automatically after delay
  return timer(waitTime).pipe(
    switchMap(() => next(req))
  );
};

/**
 * Extract endpoint identifier from URL for rate limiting
 */
function getEndpointFromUrl(url: string): string {
  if (url.includes('/api/search')) return 'search';
  if (url.includes('/api/rating')) return 'rating';
  if (url.includes('/api/review')) return 'review';
  return 'default';
} 