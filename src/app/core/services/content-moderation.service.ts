import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { 
  ContentType,
  ModerationStatus,
  ModerationReason,
  ModerationRequest,
  ModerationResult,
  ModerationDecision,
  ReportedContent,
  ModerationStatistics,
  ModerationSettings
} from '../models/moderation.model';

@Injectable({
  providedIn: 'root'
})
export class ContentModerationService {
  private baseUrl = environment.apiUrl;
  private localStorageKey = 'moderation_data';
  private moderationSettingsSubject = new BehaviorSubject<ModerationSettings>({
    automaticModeration: true,
    sensitivityLevel: 'medium',
    enabledReasons: Object.values(ModerationReason),
    minConfidenceThreshold: 0.7,
    autoRejectThreshold: 0.9,
    autoApproveThreshold: 0.1
  });

  public moderationSettings$ = this.moderationSettingsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.loadModerationSettings();
  }

  /**
   * Moderate content automatically or queue for manual review
   * @param contentType Type of content being moderated
   * @param content The actual content to be checked
   * @param contentId Identifier for the content
   * @returns An observable with the moderation result
   */
  moderateContent(contentType: ContentType, content: string, contentId: string): Observable<ModerationResult> {
    const user = this.authService.getCurrentUser();
    
    if (!user) {
      return throwError(() => new Error('User must be authenticated to moderate content'));
    }

    // Create moderation request
    const request: ModerationRequest = {
      contentId,
      contentType,
      content,
      userId: user.id,
      createdAt: new Date()
    };

    // In a production app, this would call the API
    return this.http.post<ModerationResult>(`${this.baseUrl}/moderation/check`, request).pipe(
      catchError(error => {
        // Fallback to local mock implementation if API fails
        console.warn('API call failed, using local mock implementation', error);
        return of(this.mockModerateContent(request));
      })
    );
  }

  /**
   * Report inappropriate content
   * @param contentType Type of content being reported
   * @param contentId Identifier for the content
   * @param reason The reason for reporting
   * @param description Additional details about the report
   * @returns An observable with the created report
   */
  reportContent(
    contentType: ContentType, 
    contentId: string, 
    reason: ModerationReason, 
    description?: string
  ): Observable<ReportedContent> {
    const user = this.authService.getCurrentUser();
    
    if (!user) {
      return throwError(() => new Error('User must be authenticated to report content'));
    }

    const reportData = {
      contentId,
      contentType,
      reason,
      description,
      reportedBy: user.id
    };

    return this.http.post<ReportedContent>(`${this.baseUrl}/moderation/reports`, reportData).pipe(
      catchError(error => {
        // Fallback to local mock implementation if API fails
        console.warn('API call failed, using local mock implementation', error);
        return of(this.mockReportContent(reportData));
      })
    );
  }

  /**
   * Get reported content for moderation
   * @param status Optional status filter
   * @returns Observable with reported content items
   */
  getReportedContent(status?: ModerationStatus): Observable<ReportedContent[]> {
    // Only admin and moderator roles should access this
    if (!this.authService.isModerator()) {
      return throwError(() => new Error('User must be a moderator to access reported content'));
    }

    let url = `${this.baseUrl}/moderation/reports`;
    if (status) {
      url += `?status=${status}`;
    }

    return this.http.get<ReportedContent[]>(url).pipe(
      catchError(error => {
        // Fallback to local mock implementation if API fails
        console.warn('API call failed, using local mock implementation', error);
        return of(this.getStoredReportedContent(status));
      })
    );
  }

  /**
   * Make a moderation decision on reported content
   * @param reportId The ID of the reported content
   * @param status The decision status
   * @param reason Optional reason for the decision
   * @param comments Optional comments about the decision
   * @returns Observable with the updated report
   */
  makeDecision(
    reportId: string, 
    status: ModerationStatus, 
    reason?: ModerationReason, 
    comments?: string
  ): Observable<ReportedContent> {
    // Only admin and moderator roles should access this
    if (!this.authService.isModerator()) {
      return throwError(() => new Error('User must be a moderator to make decisions'));
    }

    const user = this.authService.getCurrentUser();
    
    const decisionData: Partial<ModerationDecision> = {
      moderatorId: user!.id,
      status,
      reason,
      comments
    };

    return this.http.post<ReportedContent>(
      `${this.baseUrl}/moderation/reports/${reportId}/decision`, 
      decisionData
    ).pipe(
      catchError(error => {
        // Fallback to local mock implementation if API fails
        console.warn('API call failed, using local mock implementation', error);
        return of(this.mockMakeDecision(reportId, decisionData));
      })
    );
  }

  /**
   * Get moderation statistics
   * @returns Observable with moderation statistics
   */
  getModerationStatistics(): Observable<ModerationStatistics> {
    // Only admin and moderator roles should access this
    if (!this.authService.isModerator()) {
      return throwError(() => new Error('User must be a moderator to access statistics'));
    }

    return this.http.get<ModerationStatistics>(`${this.baseUrl}/moderation/statistics`).pipe(
      catchError(error => {
        // Fallback to local mock implementation if API fails
        console.warn('API call failed, using local mock implementation', error);
        return of(this.mockGetStatistics());
      })
    );
  }

  /**
   * Update moderation settings
   * @param settings The new settings
   * @returns Observable with the updated settings
   */
  updateModerationSettings(settings: Partial<ModerationSettings>): Observable<ModerationSettings> {
    // Only admin role should be able to update settings
    if (!this.authService.isAdmin()) {
      return throwError(() => new Error('User must be an admin to update moderation settings'));
    }

    return this.http.patch<ModerationSettings>(`${this.baseUrl}/moderation/settings`, settings).pipe(
      catchError(error => {
        // Fallback to local mock implementation if API fails
        console.warn('API call failed, using local mock implementation', error);
        const currentSettings = this.moderationSettingsSubject.getValue();
        const updatedSettings = { ...currentSettings, ...settings };
        this.moderationSettingsSubject.next(updatedSettings);
        localStorage.setItem('moderation_settings', JSON.stringify(updatedSettings));
        return of(updatedSettings);
      })
    );
  }

  /**
   * Get moderation settings
   * @returns Observable with the current settings
   */
  getModerationSettings(): Observable<ModerationSettings> {
    return this.moderationSettings$;
  }

  // Private helper methods
  private loadModerationSettings(): void {
    const storedSettings = localStorage.getItem('moderation_settings');
    if (storedSettings) {
      try {
        const parsedSettings = JSON.parse(storedSettings);
        this.moderationSettingsSubject.next(parsedSettings);
      } catch (e) {
        console.error('Failed to parse stored moderation settings', e);
      }
    }
  }

  // Mock implementations for local development/testing
  private mockModerateContent(request: ModerationRequest): ModerationResult {
    const settings = this.moderationSettingsSubject.getValue();
    const sensitivityMap = {
      'low': 0.3,
      'medium': 0.6,
      'high': 0.8
    };
    
    // List of potentially problematic words for demo purposes
    const problematicWords = [
      'hate', 'kill', 'stupid', 'idiot', 'damn', 'hell',
      'crap', 'inappropriate', 'offensive', 'spam', 'scam'
    ];
    
    // Check for problematic content
    const contentLower = request.content.toLowerCase();
    const flaggedWords = problematicWords.filter(word => contentLower.includes(word));
    
    // Calculate confidence score based on sensitivity and flagged words
    let confidence = 0;
    if (flaggedWords.length > 0) {
      // Base confidence on number of flagged words and their severity
      confidence = Math.min(0.95, (flaggedWords.length / 3) * sensitivityMap[settings.sensitivityLevel]);
    }
    
    // Determine moderation status based on confidence thresholds
    let status: ModerationStatus;
    if (confidence >= settings.autoRejectThreshold) {
      status = ModerationStatus.AUTO_REJECTED;
    } else if (confidence <= settings.autoApproveThreshold) {
      status = ModerationStatus.AUTO_APPROVED;
    } else {
      status = ModerationStatus.PENDING;
    }
    
    return {
      status,
      contentId: request.contentId,
      contentType: request.contentType,
      flaggedWords: flaggedWords.length > 0 ? flaggedWords : undefined,
      confidence,
      message: flaggedWords.length > 0 
        ? `Content flagged for potentially inappropriate words: ${flaggedWords.join(', ')}`
        : 'Content appears appropriate'
    };
  }

  private mockReportContent(reportData: any): ReportedContent {
    const storedReports = this.getStoredReportedContent();
    
    const newReport: ReportedContent = {
      id: this.generateId(),
      contentId: reportData.contentId,
      contentType: reportData.contentType,
      reportedBy: reportData.reportedBy,
      reason: reportData.reason,
      description: reportData.description,
      reportedAt: new Date(),
      status: ModerationStatus.PENDING
    };
    
    const updatedReports = [...storedReports, newReport];
    localStorage.setItem(this.localStorageKey, JSON.stringify(updatedReports));
    
    return newReport;
  }

  private mockMakeDecision(reportId: string, decisionData: Partial<ModerationDecision>): ReportedContent {
    const storedReports = this.getStoredReportedContent();
    const reportToUpdate = storedReports.find(report => report.id === reportId);
    
    if (!reportToUpdate) {
      throw new Error(`Report with ID ${reportId} not found`);
    }
    
    const decision: ModerationDecision = {
      id: this.generateId(),
      requestId: reportId,
      moderatorId: decisionData.moderatorId!,
      status: decisionData.status!,
      reason: decisionData.reason,
      comments: decisionData.comments,
      decidedAt: new Date()
    };
    
    const updatedReport: ReportedContent = {
      ...reportToUpdate,
      status: decisionData.status!,
      decision
    };
    
    const updatedReports = storedReports.map(report => 
      report.id === reportId ? updatedReport : report
    );
    
    localStorage.setItem(this.localStorageKey, JSON.stringify(updatedReports));
    
    return updatedReport;
  }

  private mockGetStatistics(): ModerationStatistics {
    const reports = this.getStoredReportedContent();
    
    const pendingCount = reports.filter(r => r.status === ModerationStatus.PENDING).length;
    const approvedCount = reports.filter(r => r.status === ModerationStatus.APPROVED).length;
    const rejectedCount = reports.filter(r => r.status === ModerationStatus.REJECTED).length;
    const autoApprovedCount = reports.filter(r => r.status === ModerationStatus.AUTO_APPROVED).length;
    const autoRejectedCount = reports.filter(r => r.status === ModerationStatus.AUTO_REJECTED).length;
    
    return {
      totalRequests: reports.length,
      pendingRequests: pendingCount,
      approvedRequests: approvedCount,
      rejectedRequests: rejectedCount,
      autoApprovedRequests: autoApprovedCount,
      autoRejectedRequests: autoRejectedCount,
      averageProcessingTimeMs: 450  // Mock value
    };
  }

  private getStoredReportedContent(status?: ModerationStatus): ReportedContent[] {
    const storedData = localStorage.getItem(this.localStorageKey);
    const reports: ReportedContent[] = storedData ? JSON.parse(storedData) : [];
    
    if (status) {
      return reports.filter(report => report.status === status);
    }
    
    return reports;
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
} 