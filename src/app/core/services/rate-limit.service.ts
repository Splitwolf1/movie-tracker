import { Injectable } from '@angular/core';

/**
 * Rate Limiting Service
 * 
 * This service helps prevent API abuse by limiting the number of requests
 * a client can make within a specified time window.
 * 
 * It supports:
 * - Different rate limits for different endpoints
 * - Configurable time windows
 * - Request tracking with timestamps
 * - Throttling determination
 */
@Injectable({
  providedIn: 'root'
})
export class RateLimitService {
  // Store request counts for each endpoint
  private requestCounts: Map<string, Array<number>> = new Map();
  
  // Default rate limits (requests per time window in ms)
  private rateLimits: Map<string, { limit: number; window: number }> = new Map([
    ['default', { limit: 50, window: 60000 }],      // 50 requests per minute by default
    ['search', { limit: 10, window: 10000 }],       // 10 search requests per 10s
    ['rating', { limit: 20, window: 60000 }],       // 20 rating submissions per minute
    ['review', { limit: 5, window: 60000 }]         // 5 review submissions per minute
  ]);
  
  constructor() {}
  
  /**
   * Track a request to determine if it should be allowed
   * @param endpoint The endpoint being accessed
   * @returns Whether the request should be allowed to proceed
   */
  canMakeRequest(endpoint: string): boolean {
    const now = Date.now();
    const key = this.getEndpointKey(endpoint);
    const config = this.getEndpointConfig(key);
    
    // Initialize request tracking array if needed
    if (!this.requestCounts.has(key)) {
      this.requestCounts.set(key, []);
    }
    
    // Get timestamp array for this endpoint
    const timestamps = this.requestCounts.get(key)!;
    
    // Remove expired timestamps outside the current window
    const validTimestamps = timestamps.filter(time => now - time < config.window);
    this.requestCounts.set(key, validTimestamps);
    
    // Check if we're under the limit
    const isUnderLimit = validTimestamps.length < config.limit;
    
    // If under limit, record this attempt
    if (isUnderLimit) {
      validTimestamps.push(now);
      this.requestCounts.set(key, validTimestamps);
    }
    
    return isUnderLimit;
  }
  
  /**
   * Configure custom rate limits for specific endpoints
   * @param endpointPattern Pattern to match endpoints
   * @param limit Maximum number of requests allowed
   * @param window Time window in milliseconds
   */
  setRateLimit(endpointPattern: string, limit: number, window: number): void {
    this.rateLimits.set(endpointPattern, { limit, window });
  }
  
  /**
   * Get remaining requests available for an endpoint
   * @param endpoint The endpoint to check
   * @returns Number of requests remaining in the current window
   */
  getRemainingRequests(endpoint: string): number {
    const now = Date.now();
    const key = this.getEndpointKey(endpoint);
    const config = this.getEndpointConfig(key);
    
    if (!this.requestCounts.has(key)) {
      return config.limit;
    }
    
    const timestamps = this.requestCounts.get(key)!;
    const validTimestamps = timestamps.filter(time => now - time < config.window);
    
    return Math.max(0, config.limit - validTimestamps.length);
  }
  
  /**
   * Get time remaining until next request can be made
   * @param endpoint The endpoint to check
   * @returns Time in milliseconds until next request is allowed, or 0 if allowed now
   */
  getTimeUntilNextRequest(endpoint: string): number {
    if (this.canMakeRequest(endpoint)) {
      return 0;
    }
    
    const now = Date.now();
    const key = this.getEndpointKey(endpoint);
    const config = this.getEndpointConfig(key);
    const timestamps = this.requestCounts.get(key)!.sort((a, b) => a - b);
    
    // Find the oldest timestamp that's still in the window
    const oldestValid = timestamps[0];
    return oldestValid + config.window - now;
  }
  
  /**
   * Reset rate limiting for testing or administrative purposes
   * @param endpoint Optional specific endpoint to reset, or all if not specified
   */
  reset(endpoint?: string): void {
    if (endpoint) {
      const key = this.getEndpointKey(endpoint);
      this.requestCounts.delete(key);
    } else {
      this.requestCounts.clear();
    }
  }
  
  /**
   * Find the most specific rate limit configuration for an endpoint
   */
  private getEndpointKey(endpoint: string): string {
    for (const pattern of this.rateLimits.keys()) {
      if (pattern !== 'default' && endpoint.includes(pattern)) {
        return pattern;
      }
    }
    return 'default';
  }
  
  /**
   * Get rate limit configuration for an endpoint
   */
  private getEndpointConfig(key: string): { limit: number; window: number } {
    return this.rateLimits.get(key) || this.rateLimits.get('default')!;
  }
} 