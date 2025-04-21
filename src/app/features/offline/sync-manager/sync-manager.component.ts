import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { OfflineService } from '../../../core/services/offline.service';

@Component({
  selector: 'app-sync-manager',
  templateUrl: './sync-manager.component.html',
  styleUrls: ['./sync-manager.component.scss']
})
export class SyncManagerComponent implements OnInit, OnDestroy {
  isOnline$: Observable<boolean>;
  pendingSyncCount = 0;
  lastSyncTime: Date | null = null;
  syncInProgress = false;
  cacheStats: any;
  private subscriptions: Subscription[] = [];

  constructor(private offlineService: OfflineService) {
    this.isOnline$ = this.offlineService.isOnline$;
  }

  ngOnInit(): void {
    this.loadSyncStatus();
    
    // Subscribe to online status changes
    const onlineSub = this.isOnline$.subscribe(isOnline => {
      if (isOnline && this.pendingSyncCount > 0) {
        this.syncData();
      }
    });
    
    this.subscriptions.push(onlineSub);
    
    // Update cache stats
    this.updateCacheStats();
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadSyncStatus(): void {
    // Get pending sync count
    this.pendingSyncCount = this.offlineService.getPendingSyncCount();
    
    // Get last sync time from localStorage
    const lastSyncTimeStr = localStorage.getItem('lastSyncTime');
    if (lastSyncTimeStr) {
      this.lastSyncTime = new Date(JSON.parse(lastSyncTimeStr));
    }
  }

  syncData(): void {
    if (!this.offlineService.isOnline() || this.syncInProgress) {
      return;
    }
    
    this.syncInProgress = true;
    
    // Perform synchronization
    this.offlineService.syncData().subscribe({
      next: () => {
        // Update sync status
        this.pendingSyncCount = this.offlineService.getPendingSyncCount();
        this.lastSyncTime = new Date();
        localStorage.setItem('lastSyncTime', JSON.stringify(this.lastSyncTime.toISOString()));
        this.syncInProgress = false;
      },
      error: () => {
        this.syncInProgress = false;
      }
    });
  }

  clearCache(): void {
    this.offlineService.clearCache();
    this.updateCacheStats();
  }

  clearExpiredCache(): void {
    this.offlineService.clearExpiredCache();
    this.updateCacheStats();
  }

  private updateCacheStats(): void {
    this.cacheStats = this.offlineService.getCacheStats();
  }
} 