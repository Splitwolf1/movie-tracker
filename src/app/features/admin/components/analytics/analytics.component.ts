import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AnalyticsService, AnalyticsTimeframe, ChartData, UserStatistics, ContentStatistics, SystemStatistics } from '../../services/analytics.service';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit, OnDestroy {
  // Time range form
  timeRangeForm: FormGroup;
  
  // Loading states
  isLoadingUserStats = false;
  isLoadingContentStats = false;
  isLoadingSystemStats = false;
  isLoadingCharts = false;
  isGeneratingReport = false;
  
  // Statistics
  userStats: UserStatistics | null = null;
  contentStats: ContentStatistics | null = null;
  systemStats: SystemStatistics | null = null;
  
  // Chart data
  userGrowthChart: ChartData | null = null;
  movieRatingsChart: ChartData | null = null;
  genrePopularityChart: ChartData | null = null;
  activeUsersChart: ChartData | null = null;
  featureUsageChart: ChartData | null = null;
  
  // Time range options
  timeRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'thisYear', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' }
  ];
  
  private destroy$ = new Subject<void>();

  constructor(
    private analyticsService: AnalyticsService,
    private fb: FormBuilder
  ) {
    this.timeRangeForm = this.fb.group({
      range: ['last30days'],
      startDate: [{ value: '', disabled: true }],
      endDate: [{ value: '', disabled: true }]
    });
  }

  ngOnInit(): void {
    // Setup form change listener
    this.timeRangeForm.get('range')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        if (value === 'custom') {
          this.timeRangeForm.get('startDate')?.enable();
          this.timeRangeForm.get('endDate')?.enable();
        } else {
          this.timeRangeForm.get('startDate')?.disable();
          this.timeRangeForm.get('endDate')?.disable();
          
          // Load data with the selected range
          this.loadData();
        }
      });
    
    // Load initial data
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load all analytics data
   */
  loadData(): void {
    const timeframe = this.getTimeframe();
    
    this.loadUserStatistics(timeframe);
    this.loadContentStatistics(timeframe);
    this.loadSystemStatistics(timeframe);
    this.loadCharts(timeframe);
  }

  /**
   * Apply custom date range
   */
  applyCustomRange(): void {
    if (this.timeRangeForm.get('range')?.value === 'custom') {
      this.loadData();
    }
  }

  /**
   * Generate analytics report
   */
  generateReport(format: 'pdf' | 'csv' | 'json'): void {
    this.isGeneratingReport = true;
    
    this.analyticsService.generateReport(this.getTimeframe(), format)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob: Blob) => {
          // Create a download link
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `analytics-report.${format}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          
          this.isGeneratingReport = false;
        },
        error: error => {
          console.error('Error generating report:', error);
          this.isGeneratingReport = false;
        }
      });
  }

  /**
   * Get timeframe based on form selection
   */
  private getTimeframe(): AnalyticsTimeframe | undefined {
    const range = this.timeRangeForm.get('range')?.value;
    
    if (range === 'custom') {
      const startDate = this.timeRangeForm.get('startDate')?.value;
      const endDate = this.timeRangeForm.get('endDate')?.value;
      
      if (startDate && endDate) {
        return {
          start: new Date(startDate),
          end: new Date(endDate)
        };
      }
      
      return undefined;
    }
    
    // Calculate timeframe based on selection
    const now = new Date();
    const start = new Date();
    const end = new Date();
    
    switch (range) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case 'yesterday':
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end.setDate(end.getDate() - 1);
        end.setHours(23, 59, 59, 999);
        break;
      case 'last7days':
        start.setDate(start.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        break;
      case 'last30days':
        start.setDate(start.getDate() - 30);
        start.setHours(0, 0, 0, 0);
        break;
      case 'thisMonth':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        break;
      case 'lastMonth':
        start.setMonth(start.getMonth() - 1);
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setDate(0); // Last day of previous month
        end.setHours(23, 59, 59, 999);
        break;
      case 'thisYear':
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);
        break;
      default:
        return undefined;
    }
    
    return { start, end };
  }

  /**
   * Load user statistics
   */
  private loadUserStatistics(timeframe?: AnalyticsTimeframe): void {
    this.isLoadingUserStats = true;
    
    this.analyticsService.getUserStatistics(timeframe)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: stats => {
          this.userStats = stats;
          this.isLoadingUserStats = false;
        },
        error: error => {
          console.error('Error loading user statistics:', error);
          this.isLoadingUserStats = false;
        }
      });
  }

  /**
   * Load content statistics
   */
  private loadContentStatistics(timeframe?: AnalyticsTimeframe): void {
    this.isLoadingContentStats = true;
    
    this.analyticsService.getContentStatistics(timeframe)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: stats => {
          this.contentStats = stats;
          this.isLoadingContentStats = false;
        },
        error: error => {
          console.error('Error loading content statistics:', error);
          this.isLoadingContentStats = false;
        }
      });
  }

  /**
   * Load system statistics
   */
  private loadSystemStatistics(timeframe?: AnalyticsTimeframe): void {
    this.isLoadingSystemStats = true;
    
    this.analyticsService.getSystemStatistics(timeframe)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: stats => {
          this.systemStats = stats;
          this.isLoadingSystemStats = false;
        },
        error: error => {
          console.error('Error loading system statistics:', error);
          this.isLoadingSystemStats = false;
        }
      });
  }

  /**
   * Load chart data
   */
  private loadCharts(timeframe?: AnalyticsTimeframe): void {
    this.isLoadingCharts = true;
    
    // Load user growth chart
    this.analyticsService.getUserGrowthChart(timeframe)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => {
          this.userGrowthChart = data;
        },
        error: error => {
          console.error('Error loading user growth chart:', error);
        }
      });
    
    // Load movie ratings chart
    this.analyticsService.getMovieRatingsChart(timeframe)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => {
          this.movieRatingsChart = data;
        },
        error: error => {
          console.error('Error loading movie ratings chart:', error);
        }
      });
    
    // Load genre popularity chart
    this.analyticsService.getGenrePopularityChart(timeframe)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => {
          this.genrePopularityChart = data;
        },
        error: error => {
          console.error('Error loading genre popularity chart:', error);
        }
      });
    
    // Load active users chart
    this.analyticsService.getActiveUsersChart(timeframe)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => {
          this.activeUsersChart = data;
        },
        error: error => {
          console.error('Error loading active users chart:', error);
        }
      });
    
    // Load feature usage chart
    this.analyticsService.getFeatureUsageChart(timeframe)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => {
          this.featureUsageChart = data;
          this.isLoadingCharts = false;
        },
        error: error => {
          console.error('Error loading feature usage chart:', error);
          this.isLoadingCharts = false;
        }
      });
  }
} 