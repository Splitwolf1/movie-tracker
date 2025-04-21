import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { AnalyticsService, UserStatistics, ContentStatistics, SystemStatistics } from '../../services/analytics.service';
import { ContentModerationService, ModerationStats } from '../../services/content-moderation.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  userStats: UserStatistics | null = null;
  contentStats: ContentStatistics | null = null;
  systemStats: SystemStatistics | null = null;
  moderationStats: ModerationStats | null = null;
  
  dashboardStats: any = null;
  isLoading = true;
  systemHealth: any = null;
  
  constructor(
    private adminService: AdminService,
    private analyticsService: AnalyticsService,
    private moderationService: ContentModerationService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    
    // Load dashboard stats from admin service
    this.adminService.getDashboardStats().subscribe({
      next: (stats) => {
        this.dashboardStats = stats;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading dashboard stats:', error);
        this.isLoading = false;
      }
    });

    // Load system health information
    this.adminService.getSystemHealth().subscribe({
      next: (health) => {
        this.systemHealth = health;
      },
      error: (error: any) => {
        console.error('Error loading system health:', error);
      }
    });
    
    // Load user statistics
    this.analyticsService.getUserStatistics().subscribe({
      next: (stats) => {
        this.userStats = stats;
      },
      error: (error: any) => {
        console.error('Error loading user statistics:', error);
      }
    });

    // Load content statistics
    this.analyticsService.getContentStatistics().subscribe({
      next: (stats) => {
        this.contentStats = stats;
      },
      error: (error: any) => {
        console.error('Error loading content statistics:', error);
      }
    });

    // Load system statistics
    this.analyticsService.getSystemStatistics().subscribe({
      next: (stats) => {
        this.systemStats = stats;
      },
      error: (error: any) => {
        console.error('Error loading system statistics:', error);
      }
    });

    // Load moderation statistics
    this.moderationService.getModerationStats().subscribe({
      next: (stats: ModerationStats) => {
        this.moderationStats = stats;
      },
      error: (error: any) => {
        console.error('Error loading moderation statistics:', error);
      }
    });
  }

  refreshData(): void {
    this.loadDashboardData();
  }

  createBackup(): void {
    this.adminService.createBackup().subscribe({
      next: () => {
        alert('Backup created successfully');
      },
      error: (error: any) => {
        console.error('Error creating backup:', error);
        alert('Error creating backup');
      }
    });
  }
} 