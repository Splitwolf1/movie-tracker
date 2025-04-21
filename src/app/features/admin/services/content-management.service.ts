import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContentManagementService {
  private readonly API_URL = `${environment.apiUrl}/admin/content`;

  constructor(private http: HttpClient) {}

  /**
   * Get all content with pagination and filtering
   */
  getAllContent(page = 1, limit = 20, filters: any = {}): Observable<any> {
    // In a real app, would call API
    // For now, return mock data
    return of({
      content: [],
      total: 0,
      page,
      limit
    }).pipe(
      delay(500) // Simulate network delay
    );
  }

  /**
   * Get content by ID
   */
  getContentById(contentId: string): Observable<any> {
    // In a real app, would call API
    return of({}).pipe(
      delay(500) // Simulate network delay
    );
  }

  /**
   * Approve content
   */
  approveContent(contentId: string): Observable<any> {
    // In a real app, would call API
    return of({ success: true }).pipe(
      delay(500) // Simulate network delay
    );
  }

  /**
   * Reject content
   */
  rejectContent(contentId: string, reason: string): Observable<any> {
    // In a real app, would call API
    return of({ success: true }).pipe(
      delay(500) // Simulate network delay
    );
  }

  /**
   * Archive content
   */
  archiveContent(contentId: string): Observable<any> {
    // In a real app, would call API
    return of({ success: true }).pipe(
      delay(500) // Simulate network delay
    );
  }
} 