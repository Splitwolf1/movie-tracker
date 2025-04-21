import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, fromEvent, merge, Subject } from 'rxjs';
import { map, catchError, tap, finalize } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class OfflineService {
  private isOnlineSubject = new BehaviorSubject<boolean>(true);
  public isOnline$ = this.isOnlineSubject.asObservable();
  
  // New subject for sync events
  private syncEventSubject = new Subject<SyncEvent>();
  public syncEvent$ = this.syncEventSubject.asObservable();
  
  // Cache expiration time (in milliseconds)
  private cacheExpiration = 24 * 60 * 60 * 1000; // 24 hours
  
  // Queue for operations that need to be synchronized
  private syncQueue: SyncOperation[] = [];
  
  // Sync in progress flag
  private isSyncInProgress = false;

  // Browser check
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      this.isOnlineSubject.next(navigator.onLine);
      this.initializeNetworkListeners();
      this.loadSyncQueue();
    }
  }

  /**
   * Initialize listeners for online/offline events
   */
  private initializeNetworkListeners(): void {
    if (!this.isBrowser) return;

    // Listen for online event
    fromEvent(window, 'online').subscribe(() => {
      this.isOnlineSubject.next(true);
      this.notifySyncEvent({ type: 'status_change', status: 'online' });
      this.syncData();
    });

    // Listen for offline event
    fromEvent(window, 'offline').subscribe(() => {
      this.isOnlineSubject.next(false);
      this.notifySyncEvent({ type: 'status_change', status: 'offline' });
    });
  }

  /**
   * Get the current online status
   */
  public isOnline(): boolean {
    return this.isOnlineSubject.getValue();
  }

  /**
   * Get data with offline support
   * @param url API endpoint URL
   * @param cacheKey Key for storing in local cache
   * @param forceRefresh Force refresh from server
   */
  public getData<T>(url: string, cacheKey: string, forceRefresh = false): Observable<T> {
    // If online and force refresh, fetch from API and update cache
    if (this.isOnline() && forceRefresh) {
      return this.fetchFromApi<T>(url, cacheKey);
    }
    
    // If online, try API first then fallback to cache
    if (this.isOnline()) {
      return this.http.get<T>(url).pipe(
        tap(data => this.saveToCache(cacheKey, data)),
        catchError(() => this.getFromCache<T>(cacheKey))
      );
    }
    
    // If offline, get from cache
    return this.getFromCache<T>(cacheKey);
  }

  /**
   * Save data to API with offline support
   * @param url API endpoint URL
   * @param data Data to save
   * @param method HTTP method (POST, PUT, PATCH, DELETE)
   * @param syncKey Key for synchronization (usually entity ID)
   */
  public saveData<T>(url: string, data: any, method: 'POST' | 'PUT' | 'PATCH' | 'DELETE', syncKey: string): Observable<T> {
    // If online, save directly to API
    if (this.isOnline()) {
      return this.saveToApi<T>(url, data, method);
    }
    
    // If offline, add to sync queue
    const operation: SyncOperation = {
      url,
      data,
      method,
      syncKey,
      timestamp: new Date().getTime(),
      retryCount: 0
    };
    
    this.addToSyncQueue(operation);
    
    // Return mock success
    return of(data as unknown as T);
  }

  /**
   * Add movie to offline cache
   * @param movie Movie object to cache
   */
  public cacheMovie(movie: any): void {
    const cacheKey = `movie_${movie.id}`;
    this.saveToCache(cacheKey, movie);
  }

  /**
   * Get movie from offline cache
   * @param movieId Movie ID
   */
  public getCachedMovie(movieId: number): Observable<any> {
    const cacheKey = `movie_${movieId}`;
    return this.getFromCache(cacheKey);
  }

  /**
   * Check if a specific item is cached
   * @param cacheKey Cache key
   */
  public isCached(cacheKey: string): boolean {
    if (!this.isBrowser) {
      return false;
    }
    
    const cachedItem = localStorage.getItem(`cache_${cacheKey}`);
    if (!cachedItem) {
      return false;
    }
    
    try {
      const parsedItem = JSON.parse(cachedItem);
      // Check if cache is expired
      return parsedItem.timestamp + this.cacheExpiration > new Date().getTime();
    } catch (error) {
      return false;
    }
  }

  /**
   * Clear all cached data
   */
  public clearCache(): void {
    if (!this.isBrowser) {
      return;
    }
    
    // Get all keys
    const allKeys = Object.keys(localStorage);
    
    // Filter cache keys
    const cacheKeys = allKeys.filter(key => key.startsWith('cache_'));
    
    // Remove all cache keys
    cacheKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    this.notifySyncEvent({ type: 'cache_cleared' });
  }

  /**
   * Clear expired cache
   */
  public clearExpiredCache(): void {
    if (!this.isBrowser) {
      return;
    }
    
    const currentTime = new Date().getTime();
    const allKeys = Object.keys(localStorage);
    const cacheKeys = allKeys.filter(key => key.startsWith('cache_'));
    let clearedCount = 0;
    
    cacheKeys.forEach(key => {
      try {
        const cachedItem = JSON.parse(localStorage.getItem(key) || '{}');
        if (cachedItem.timestamp + this.cacheExpiration < currentTime) {
          localStorage.removeItem(key);
          clearedCount++;
        }
      } catch (error) {
        // Invalid JSON, remove the item
        localStorage.removeItem(key);
        clearedCount++;
      }
    });
    
    this.notifySyncEvent({ type: 'cache_expired_cleared', count: clearedCount });
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): CacheStats {
    if (!this.isBrowser) {
      return {
        totalItems: 0,
        expiredItems: 0,
        totalSizeBytes: 0,
        totalSizeMB: 0
      };
    }
    
    const allKeys = Object.keys(localStorage);
    const cacheKeys = allKeys.filter(key => key.startsWith('cache_'));
    const currentTime = new Date().getTime();
    
    let totalSize = 0;
    let expiredCount = 0;
    
    cacheKeys.forEach(key => {
      const item = localStorage.getItem(key);
      if (item) {
        totalSize += item.length;
        
        try {
          const parsedItem = JSON.parse(item);
          if (parsedItem.timestamp + this.cacheExpiration < currentTime) {
            expiredCount++;
          }
        } catch (error) {
          // Invalid JSON
        }
      }
    });
    
    return {
      totalItems: cacheKeys.length,
      expiredItems: expiredCount,
      totalSizeBytes: totalSize,
      totalSizeMB: Math.round((totalSize / (1024 * 1024)) * 100) / 100
    };
  }

  /**
   * Synchronize offline changes with server
   * @returns Observable that completes when sync is finished
   */
  public syncData(): Observable<SyncResult> {
    if (!this.isOnline() || this.syncQueue.length === 0 || this.isSyncInProgress) {
      return of({ 
        success: true, 
        syncedCount: 0, 
        failedCount: 0, 
        remainingCount: this.syncQueue.length 
      });
    }
    
    this.isSyncInProgress = true;
    this.notifySyncEvent({ type: 'sync_started', queueLength: this.syncQueue.length });
    
    // Create a subject to track completion
    const syncSubject = new Subject<SyncResult>();
    
    // Process each operation in the queue
    this.processSyncQueue().then(result => {
      syncSubject.next(result);
      syncSubject.complete();
      this.isSyncInProgress = false;
      this.notifySyncEvent({ 
        type: 'sync_completed', 
        success: result.success,
        syncedCount: result.syncedCount,
        failedCount: result.failedCount,
        remainingCount: result.remainingCount
      });
    });
    
    return syncSubject.asObservable();
  }

  /**
   * Process the sync queue
   * @returns Promise that resolves when all operations are processed
   */
  private async processSyncQueue(): Promise<SyncResult> {
    // Clone the queue
    const queue = [...this.syncQueue];
    
    // Clear the queue
    this.syncQueue = [];
    this.saveSyncQueue();
    
    let syncedCount = 0;
    let failedCount = 0;
    
    // Process operations sequentially
    for (const operation of queue) {
      try {
        await this.processSyncOperation(operation);
        syncedCount++;
      } catch (error) {
        failedCount++;
        
        // If operation has failed less than 3 times, add it back to the queue
        if (operation.retryCount < 3) {
          operation.retryCount++;
          this.addToSyncQueue(operation);
        } else {
          this.notifySyncEvent({
            type: 'sync_operation_failed',
            operation: operation,
            error: error
          });
        }
      }
    }
    
    return {
      success: failedCount === 0,
      syncedCount,
      failedCount,
      remainingCount: this.syncQueue.length
    };
  }

  /**
   * Process a single sync operation
   * @param operation The operation to process
   * @returns Promise that resolves when the operation is processed
   */
  private processSyncOperation(operation: SyncOperation): Promise<any> {
    return new Promise((resolve, reject) => {
      this.saveToApi(operation.url, operation.data, operation.method)
        .subscribe({
          next: (result) => {
            this.notifySyncEvent({
              type: 'sync_operation_success',
              operation: operation
            });
            resolve(result);
          },
          error: (error) => {
            reject(error);
          }
        });
    });
  }

  /**
   * Get the number of pending sync operations
   */
  public getSyncQueueLength(): number {
    return this.syncQueue.length;
  }

  /**
   * Get pending sync count (alias for getSyncQueueLength for backward compatibility)
   */
  public getPendingSyncCount(): number {
    return this.getSyncQueueLength();
  }

  /**
   * Get operation details from the sync queue
   * @returns Array of sync operations
   */
  public getSyncOperations(): SyncOperationInfo[] {
    return this.syncQueue.map(op => ({
      url: op.url,
      method: op.method,
      timestamp: op.timestamp,
      retryCount: op.retryCount
    }));
  }

  /**
   * Save to API
   * @param url API endpoint URL
   * @param data Data to save
   * @param method HTTP method
   */
  private saveToApi<T>(url: string, data: any, method: string): Observable<T> {
    switch (method) {
      case 'POST':
        return this.http.post<T>(url, data);
      case 'PUT':
        return this.http.put<T>(url, data);
      case 'PATCH':
        return this.http.patch<T>(url, data);
      case 'DELETE':
        return this.http.delete<T>(url);
      default:
        return this.http.post<T>(url, data);
    }
  }

  /**
   * Fetch from API and update cache
   * @param url API endpoint URL
   * @param cacheKey Cache key
   */
  private fetchFromApi<T>(url: string, cacheKey: string): Observable<T> {
    return this.http.get<T>(url).pipe(
      tap(data => {
        this.saveToCache(cacheKey, data);
        this.notifySyncEvent({ type: 'data_fetched', cacheKey });
      }),
      catchError(error => {
        this.notifySyncEvent({ type: 'fetch_error', cacheKey, error });
        return this.getFromCache<T>(cacheKey);
      })
    );
  }

  /**
   * Save data to cache
   * @param key Cache key
   * @param data Data to save
   */
  private saveToCache(key: string, data: any): void {
    if (!this.isBrowser) {
      return;
    }
    
    const cacheItem = {
      data,
      timestamp: new Date().getTime()
    };
    
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Error saving to cache', error);
    }
  }

  /**
   * Get data from cache
   * @param key Cache key
   */
  private getFromCache<T>(key: string): Observable<T> {
    if (!this.isBrowser) {
      return of(null as unknown as T);
    }
    
    const cachedItem = localStorage.getItem(`cache_${key}`);
    if (!cachedItem) {
      return of(null as unknown as T);
    }
    
    try {
      const parsedItem = JSON.parse(cachedItem);
      
      // Check if cache is expired
      if (parsedItem.timestamp + this.cacheExpiration < new Date().getTime()) {
        // Cache expired, remove it
        localStorage.removeItem(`cache_${key}`);
        return of(null as unknown as T);
      }
      
      return of(parsedItem.data);
    } catch (error) {
      console.error('Error parsing cached data', error);
      return of(null as unknown as T);
    }
  }

  /**
   * Add operation to sync queue
   * @param operation Operation to add
   */
  private addToSyncQueue(operation: SyncOperation): void {
    if (!this.isBrowser) {
      return;
    }
    
    // Check for duplicates (same URL and method)
    const existingIndex = this.syncQueue.findIndex(op => 
      op.url === operation.url && 
      op.method === operation.method &&
      op.syncKey === operation.syncKey
    );
    
    if (existingIndex !== -1) {
      // Replace existing operation
      this.syncQueue[existingIndex] = operation;
    } else {
      // Add new operation
      this.syncQueue.push(operation);
    }
    
    // Save to local storage
    this.saveSyncQueue();
    
    // Notify
    this.notifySyncEvent({ 
      type: 'queue_updated', 
      queueLength: this.syncQueue.length 
    });
  }

  /**
   * Save sync queue to local storage
   */
  private saveSyncQueue(): void {
    if (this.isBrowser) {
      localStorage.setItem('sync_queue', JSON.stringify(this.syncQueue));
    }
  }

  /**
   * Load sync queue from local storage
   */
  private loadSyncQueue(): void {
    if (!this.isBrowser) {
      return;
    }
    
    const queue = localStorage.getItem('sync_queue');
    if (queue) {
      try {
        this.syncQueue = JSON.parse(queue);
      } catch (error) {
        console.error('Error loading sync queue', error);
        this.syncQueue = [];
      }
    } else {
      this.syncQueue = [];
    }
  }
  
  /**
   * Notify about sync events
   * @param event Sync event
   */
  private notifySyncEvent(event: SyncEvent): void {
    this.syncEventSubject.next(event);
  }
}

interface SyncOperation {
  url: string;
  data: any;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  syncKey: string;
  timestamp: number;
  retryCount: number;
}

interface SyncOperationInfo {
  url: string;
  method: string;
  timestamp: number;
  retryCount: number;
}

interface CacheStats {
  totalItems: number;
  expiredItems: number;
  totalSizeBytes: number;
  totalSizeMB: number;
}

interface SyncResult {
  success: boolean;
  syncedCount: number;
  failedCount: number;
  remainingCount: number;
}

type SyncEvent = 
  | { type: 'status_change', status: 'online' | 'offline' }
  | { type: 'sync_started', queueLength: number }
  | { type: 'sync_completed', success: boolean, syncedCount: number, failedCount: number, remainingCount: number }
  | { type: 'sync_operation_success', operation: SyncOperation }
  | { type: 'sync_operation_failed', operation: SyncOperation, error: any }
  | { type: 'queue_updated', queueLength: number }
  | { type: 'data_fetched', cacheKey: string }
  | { type: 'fetch_error', cacheKey: string, error: any }
  | { type: 'cache_cleared' }
  | { type: 'cache_expired_cleared', count: number }; 