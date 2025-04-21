import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RegistrationPromptComponent } from './features/auth/components/registration-prompt.component';
import { AuthService } from './core/services/auth.service';
import { OfflineService } from './core/services/offline.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  template: `
    <mat-toolbar color="primary">
      <button mat-icon-button (click)="sidenav.toggle()">
        <mat-icon>menu</mat-icon>
      </button>
      <span class="logo" routerLink="/">Movie Tracker</span>
      <span class="spacer"></span>
      <button mat-button routerLink="/browse">Browse</button>
      <button mat-button routerLink="/search">Search</button>
      
      <ng-container *ngIf="!isAuthenticated; else userActions">
        <button mat-button routerLink="/auth/login">Log In</button>
        <button mat-raised-button color="accent" routerLink="/auth/register">
          Sign Up
        </button>
      </ng-container>
      
      <ng-template #userActions>
        <div class="offline-status" routerLink="/offline" *ngIf="isAuthenticated">
          <mat-icon [ngClass]="{'online': (isOnline$ | async), 'offline': !(isOnline$ | async)}"
                  [matBadge]="pendingSyncCount > 0 ? pendingSyncCount.toString() : null"
                  matBadgeColor="warn"
                  [matTooltip]="(isOnline$ | async) ? 'Online' : 'Offline'">
            {{ (isOnline$ | async) ? 'wifi' : 'wifi_off' }}
          </mat-icon>
        </div>
      
        <button mat-button [matMenuTriggerFor]="userMenu" class="user-menu-button">
          <div class="avatar" [style.background-image]="'url(' + (currentUser?.avatar || defaultAvatar) + ')'"></div>
          <span class="username">{{ currentUser?.username }}</span>
          <mat-icon>arrow_drop_down</mat-icon>
        </button>
        
        <mat-menu #userMenu="matMenu">
          <button mat-menu-item routerLink="/profile">
            <mat-icon>person</mat-icon>
            <span>Profile</span>
          </button>
          <button mat-menu-item routerLink="/watchlist">
            <mat-icon>bookmark</mat-icon>
            <span>My Watchlist</span>
          </button>
          <button mat-menu-item routerLink="/history">
            <mat-icon>history</mat-icon>
            <span>Watch History</span>
          </button>
          <button mat-menu-item routerLink="/offline">
            <mat-icon>sync</mat-icon>
            <span>Offline Sync</span>
          </button>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="logout()">
            <mat-icon>exit_to_app</mat-icon>
            <span>Log Out</span>
          </button>
        </mat-menu>
      </ng-template>
    </mat-toolbar>

    <mat-sidenav-container>
      <mat-sidenav #sidenav mode="over">
        <mat-nav-list>
          <a mat-list-item routerLink="/" (click)="sidenav.close()">
            <mat-icon>home</mat-icon>
            <span>Home</span>
          </a>
          <a mat-list-item routerLink="/browse" (click)="sidenav.close()">
            <mat-icon>movie</mat-icon>
            <span>Browse</span>
          </a>
          <a mat-list-item routerLink="/search" (click)="sidenav.close()">
            <mat-icon>search</mat-icon>
            <span>Search</span>
          </a>
          <mat-divider></mat-divider>
          
          <ng-container *ngIf="!isAuthenticated">
            <a mat-list-item routerLink="/auth/login" (click)="sidenav.close()">
              <mat-icon>login</mat-icon>
              <span>Log In</span>
            </a>
            <a mat-list-item routerLink="/auth/register" (click)="sidenav.close()">
              <mat-icon>person_add</mat-icon>
              <span>Sign Up</span>
            </a>
          </ng-container>
          
          <ng-container *ngIf="isAuthenticated">
            <a mat-list-item routerLink="/profile" (click)="sidenav.close()">
              <mat-icon>person</mat-icon>
              <span>Profile</span>
            </a>
            <a mat-list-item routerLink="/watchlist" (click)="sidenav.close()">
              <mat-icon>bookmark</mat-icon>
              <span>My Watchlist</span>
            </a>
            <a mat-list-item routerLink="/history" (click)="sidenav.close()">
              <mat-icon>history</mat-icon>
              <span>Watch History</span>
            </a>
            <a mat-list-item routerLink="/offline" (click)="sidenav.close()">
              <mat-icon>sync</mat-icon>
              <span>Offline Sync</span>
              <span class="badge" *ngIf="pendingSyncCount > 0">{{pendingSyncCount}}</span>
            </a>
            <a mat-list-item (click)="logout(); sidenav.close()">
              <mat-icon>exit_to_app</mat-icon>
              <span>Log Out</span>
            </a>
          </ng-container>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <router-outlet></router-outlet>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }

    .mat-toolbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 2;
    }

    .logo {
      margin-left: 8px;
      cursor: pointer;
      font-size: 1.2rem;
      font-weight: 500;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .user-menu-button {
      display: flex;
      align-items: center;
      
      .avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-size: cover;
        background-position: center;
        margin-right: 8px;
      }
      
      .username {
        max-width: 100px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .offline-status {
      display: flex;
      align-items: center;
      margin-right: 16px;
      cursor: pointer;
      
      mat-icon {
        &.online {
          color: #4caf50;
        }
        
        &.offline {
          color: #f44336;
        }
      }
    }

    mat-sidenav-container {
      height: calc(100% - 64px);
      margin-top: 64px;
    }

    mat-sidenav {
      width: 250px;
    }

    mat-nav-list {
      .mat-icon {
        margin-right: 8px;
      }
      
      .badge {
        background-color: #f44336;
        color: white;
        border-radius: 50%;
        padding: 2px 6px;
        font-size: 12px;
        margin-left: 8px;
      }
    }

    @media (max-width: 599px) {
      mat-sidenav-container {
        height: calc(100% - 56px);
        margin-top: 56px;
      }
      
      .user-menu-button .username {
        display: none;
      }
    }
  `]
})
export class AppComponent implements OnInit {
  isAuthenticated = false;
  currentUser: any = null;
  defaultAvatar = 'https://via.placeholder.com/32x32?text=U';
  isOnline$: Observable<boolean>;
  pendingSyncCount = 0;
  
  constructor(
    private dialog: MatDialog,
    private authService: AuthService,
    private offlineService: OfflineService,
    private router: Router
  ) {
    this.isOnline$ = this.offlineService.isOnline$;
  }
  
  ngOnInit(): void {
    this.checkAuthenticationStatus();
    this.updateSyncCount();
    
    // Subscribe to sync events to update the pending count
    this.offlineService.syncEvent$.subscribe(event => {
      if (event.type === 'queue_updated' || event.type === 'sync_completed') {
        this.updateSyncCount();
      }
    });
  }
  
  checkAuthenticationStatus(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    if (this.isAuthenticated) {
      this.currentUser = this.authService.getCurrentUser();
    }
  }
  
  updateSyncCount(): void {
    this.pendingSyncCount = this.offlineService.getSyncQueueLength();
  }
  
  openLoginDialog(): void {
    this.dialog.open(RegistrationPromptComponent, {
      width: '400px',
      data: { message: 'Sign in to track your favorite movies and TV shows!' }
    });
  }
  
  logout(): void {
    this.authService.logout();
    this.isAuthenticated = false;
    this.currentUser = null;
    this.router.navigate(['/']);
  }
} 