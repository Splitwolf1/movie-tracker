import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Review } from '../../../core/models/review.model';
import { Comment } from '../../../core/models/social.model';
import { catchError } from 'rxjs/operators';

export interface ModerationStats {
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  totalContentModerated: number;
  pendingReviews: number;
  pendingComments: number;
  reportsByType: Record<string, number>;
  actionsPerDay: { date: string; count: number }[];
  popularReportReasons: { reason: string; count: number }[];
  averageResolutionTime: number;
}

export interface ContentReport {
  id: string;
  contentType: 'review' | 'comment' | 'user';
  contentId: string;
  reason: string;
  reportedBy: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: Date;
}

export interface ModerationAction {
  id: string;
  adminId: string;
  adminName: string;
  contentType: string;
  contentId: string;
  action: 'approve' | 'reject' | 'delete' | 'suspend' | 'warn';
  reason: string;
  createdAt: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class ContentModerationService {
  private apiUrl = `${environment.apiUrl}/admin/moderation`;

  constructor(private http: HttpClient) {}

  getReports(
    status: string = 'all',
    contentType: string = 'all',
    page: number = 1,
    pageSize: number = 10
  ): Observable<{ reports: ContentReport[], total: number }> {
    return this.http.get<{ reports: ContentReport[], total: number }>(`${this.apiUrl}/reports`, {
      params: { status, contentType, page: page.toString(), pageSize: pageSize.toString() }
    });
  }

  getPendingReviews(
    page: number = 1,
    pageSize: number = 10
  ): Observable<{ reviews: Review[], total: number }> {
    return this.http.get<{ reviews: Review[], total: number }>(`${this.apiUrl}/reviews/pending`, {
      params: { page: page.toString(), pageSize: pageSize.toString() }
    });
  }

  getPendingComments(
    page: number = 1,
    pageSize: number = 10
  ): Observable<{ comments: Comment[], total: number }> {
    return this.http.get<{ comments: Comment[], total: number }>(`${this.apiUrl}/comments/pending`, {
      params: { page: page.toString(), pageSize: pageSize.toString() }
    });
  }

  getModerationLog(
    page: number = 1,
    pageSize: number = 10
  ): Observable<{ actions: ModerationAction[], total: number }> {
    return this.http.get<{ actions: ModerationAction[], total: number }>(`${this.apiUrl}/actions`, {
      params: { page: page.toString(), pageSize: pageSize.toString() }
    });
  }

  updateReportStatus(reportId: string, status: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/reports/${reportId}`, { status });
  }

  getReportedContent(contentType: string, contentId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/content/${contentType}/${contentId}`);
  }

  approveReview(reviewId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/reviews/${reviewId}/approve`, {});
  }

  rejectReview(reviewId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/reviews/${reviewId}/reject`, {});
  }

  approveComment(commentId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/comments/${commentId}/approve`, {});
  }

  rejectComment(commentId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/comments/${commentId}/reject`, {});
  }

  deleteReview(reviewId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/reviews/${reviewId}`);
  }

  deleteComment(commentId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/comments/${commentId}`);
  }

  getModerationStats(): Observable<ModerationStats> {
    return this.http.get<ModerationStats>(`${this.apiUrl}/stats`).pipe(
      catchError(() => {
        const mockStats: ModerationStats = {
          totalReports: 87,
          pendingReports: 12,
          resolvedReports: 75,
          totalContentModerated: 156,
          pendingReviews: 15,
          pendingComments: 23,
          reportsByType: {
            'review': 45,
            'comment': 32,
            'user': 10
          },
          actionsPerDay: [
            { date: '2023-07-01', count: 5 },
            { date: '2023-07-02', count: 8 },
            { date: '2023-07-03', count: 12 },
            { date: '2023-07-04', count: 7 },
            { date: '2023-07-05', count: 10 }
          ],
          popularReportReasons: [
            { reason: 'Inappropriate content', count: 32 },
            { reason: 'Spam', count: 25 },
            { reason: 'Harassment', count: 15 },
            { reason: 'Misinformation', count: 10 },
            { reason: 'Other', count: 5 }
          ],
          averageResolutionTime: 4.5
        };
        return of(mockStats);
      })
    );
  }
} 