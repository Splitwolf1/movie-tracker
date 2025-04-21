import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface AnalyticsTimeframe {
  start: Date;
  end: Date;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    fill?: boolean;
  }[];
}

export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  growth: number;
}

export interface ContentStatistics {
  totalMoviesWatched: number;
  totalReviews: number;
  totalWatchlistItems: number;
  averageRating: number;
  mostWatchedGenres: { name: string; count: number }[];
  mostRatedMovies: { id: number; title: string; count: number }[];
}

export interface SystemStatistics {
  apiCalls: number;
  averageResponseTime: number;
  errorRate: number;
  serverLoad: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private readonly API_URL = `${environment.apiUrl}/admin/analytics`;

  constructor(private http: HttpClient) {}

  /**
   * Get user statistics
   */
  getUserStatistics(timeframe?: AnalyticsTimeframe): Observable<UserStatistics> {
    return this.http.get<UserStatistics>(`${this.API_URL}/users`, {
      params: this.buildTimeframeParams(timeframe)
    });
  }

  /**
   * Get content statistics
   */
  getContentStatistics(timeframe?: AnalyticsTimeframe): Observable<ContentStatistics> {
    return this.http.get<ContentStatistics>(`${this.API_URL}/content`, {
      params: this.buildTimeframeParams(timeframe)
    });
  }

  /**
   * Get system statistics
   */
  getSystemStatistics(timeframe?: AnalyticsTimeframe): Observable<SystemStatistics> {
    return this.http.get<SystemStatistics>(`${this.API_URL}/system`, {
      params: this.buildTimeframeParams(timeframe)
    });
  }

  /**
   * Get user growth chart data
   */
  getUserGrowthChart(timeframe?: AnalyticsTimeframe): Observable<ChartData> {
    return this.http.get<ChartData>(`${this.API_URL}/charts/user-growth`, {
      params: this.buildTimeframeParams(timeframe)
    });
  }

  /**
   * Get movie ratings chart data
   */
  getMovieRatingsChart(timeframe?: AnalyticsTimeframe): Observable<ChartData> {
    return this.http.get<ChartData>(`${this.API_URL}/charts/movie-ratings`, {
      params: this.buildTimeframeParams(timeframe)
    });
  }

  /**
   * Get genre popularity chart data
   */
  getGenrePopularityChart(timeframe?: AnalyticsTimeframe): Observable<ChartData> {
    return this.http.get<ChartData>(`${this.API_URL}/charts/genre-popularity`, {
      params: this.buildTimeframeParams(timeframe)
    });
  }

  /**
   * Get active users chart data
   */
  getActiveUsersChart(timeframe?: AnalyticsTimeframe): Observable<ChartData> {
    return this.http.get<ChartData>(`${this.API_URL}/charts/active-users`, {
      params: this.buildTimeframeParams(timeframe)
    });
  }

  /**
   * Get feature usage chart data
   */
  getFeatureUsageChart(timeframe?: AnalyticsTimeframe): Observable<ChartData> {
    return this.http.get<ChartData>(`${this.API_URL}/charts/feature-usage`, {
      params: this.buildTimeframeParams(timeframe)
    });
  }

  /**
   * Generate analytics report
   */
  generateReport(timeframe?: AnalyticsTimeframe, format: 'pdf' | 'csv' | 'json' = 'pdf'): Observable<Blob> {
    return this.http.get(`${this.API_URL}/report`, {
      params: {
        ...this.buildTimeframeParams(timeframe),
        format
      },
      responseType: 'blob'
    });
  }

  /**
   * Build timeframe parameters for API requests
   */
  private buildTimeframeParams(timeframe?: AnalyticsTimeframe): any {
    if (!timeframe) {
      return {};
    }

    return {
      startDate: timeframe.start.toISOString(),
      endDate: timeframe.end.toISOString()
    };
  }
} 