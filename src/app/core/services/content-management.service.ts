import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

import { 
  ContentItem,
  ContentStatus,
  ContentFilters,
  ApprovalRequest
} from '../models/content-management.model';

@Injectable({
  providedIn: 'root'
})
export class ContentManagementService {
  private baseUrl = environment.apiUrl;
  private contentItemsKey = 'content_items';
  private approvalRequestsKey = 'approval_requests';
  
  private contentSubject = new BehaviorSubject<ContentItem[]>([]);
  public content$ = this.contentSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.loadContent();
  }

  /**
   * Load content from storage or API
   */
  private loadContent(): void {
    const storedContent = localStorage.getItem(this.contentItemsKey);
    if (storedContent) {
      this.contentSubject.next(JSON.parse(storedContent));
    } else {
      // In a real app, would call the API
      this.contentSubject.next([]);
    }
  }

  /**
   * Get content with optional filtering
   */
  getContent(filters?: ContentFilters): Observable<ContentItem[]> {
    // In a real app, would call the API with filters
    return this.content$.pipe(
      map(items => {
        if (!filters || Object.keys(filters).length === 0) {
          return items;
        }
        
        return items.filter(item => {
          // Apply filters if they exist
          if (filters.status && item.status !== filters.status) {
            return false;
          }
          
          if (filters.type && item.type !== filters.type) {
            return false;
          }
          
          if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            return (
              item.title.toLowerCase().includes(query) ||
              (item.description && item.description.toLowerCase().includes(query))
            );
          }
          
          // Additional filters can be implemented here
          
          return true;
        });
      })
    );
  }

  /**
   * Get approval requests
   */
  getApprovalRequests(status?: string): Observable<ApprovalRequest[]> {
    // In a real app, would call the API
    const storedRequests = localStorage.getItem(this.approvalRequestsKey);
    let requests: ApprovalRequest[] = storedRequests ? JSON.parse(storedRequests) : [];
    
    if (status) {
      requests = requests.filter(req => req.status === status);
    }
    
    return of(requests);
  }

  /**
   * Change content status
   */
  changeContentStatus(
    contentId: string, 
    newStatus: ContentStatus, 
    rejectionReason?: string
  ): Observable<ContentItem | null> {
    // In a real app, would call the API
    const storedContent = localStorage.getItem(this.contentItemsKey);
    const items: ContentItem[] = storedContent ? JSON.parse(storedContent) : [];
    
    const itemIndex = items.findIndex(item => item.id === contentId);
    if (itemIndex === -1) {
      return of(null);
    }
    
    const updatedItem = {
      ...items[itemIndex],
      status: newStatus,
      rejectionReason: newStatus === ContentStatus.REJECTED ? rejectionReason : undefined,
      updatedAt: new Date()
    };
    
    items[itemIndex] = updatedItem;
    localStorage.setItem(this.contentItemsKey, JSON.stringify(items));
    
    // Update the content subject
    this.contentSubject.next(items);
    
    return of(updatedItem);
  }

  /**
   * Delete content
   */
  deleteContent(contentId: string): Observable<boolean> {
    // In a real app, would call the API
    const storedContent = localStorage.getItem(this.contentItemsKey);
    const items: ContentItem[] = storedContent ? JSON.parse(storedContent) : [];
    
    const updatedItems = items.filter(item => item.id !== contentId);
    localStorage.setItem(this.contentItemsKey, JSON.stringify(updatedItems));
    
    // Update the content subject
    this.contentSubject.next(updatedItems);
    
    return of(true);
  }

  /**
   * Process an approval request
   */
  processApprovalRequest(requestId: string, approved: boolean, comments?: string): Observable<ApprovalRequest> {
    // In a real app, would call the API
    const storedRequests = localStorage.getItem(this.approvalRequestsKey);
    const requests: ApprovalRequest[] = storedRequests ? JSON.parse(storedRequests) : [];
    
    const requestIndex = requests.findIndex(req => req.id === requestId);
    if (requestIndex === -1) {
      return throwError(() => new Error('Approval request not found'));
    }
    
    const request = requests[requestIndex];
    const updatedRequest: ApprovalRequest = {
      ...request,
      status: approved ? 'approved' : 'rejected',
      approvedBy: 'current-admin-id', // In a real app, would use the current user ID
      approvedAt: new Date(),
      notes: comments
    };
    
    // Update the request
    requests[requestIndex] = updatedRequest;
    localStorage.setItem(this.approvalRequestsKey, JSON.stringify(requests));
    
    // Update the content item's status if it was approved or rejected
    if (approved) {
      this.changeContentStatus(request.contentId, ContentStatus.PUBLISHED).subscribe();
    } else {
      this.changeContentStatus(request.contentId, ContentStatus.REJECTED, comments).subscribe();
    }
    
    return of(updatedRequest);
  }
} 