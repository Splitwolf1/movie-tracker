import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { OfflineService } from '../../../core/services/offline.service';

@Component({
  selector: 'app-offline-status',
  templateUrl: './offline-status.component.html',
  styleUrls: ['./offline-status.component.scss']
})
export class OfflineStatusComponent implements OnInit {
  isOnline$: Observable<boolean>;
  pendingSyncCount = 0;

  constructor(private offlineService: OfflineService) {
    this.isOnline$ = this.offlineService.isOnline$;
  }

  ngOnInit(): void {
    this.updatePendingSyncCount();
  }

  private updatePendingSyncCount(): void {
    // We'll update this to use the method we're about to add to the service
    this.pendingSyncCount = this.offlineService.getSyncQueueLength();
  }
} 