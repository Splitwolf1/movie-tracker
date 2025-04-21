import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { ContentManagementService } from '../../../../core/services/content-management.service';
import { ContentModerationService } from '../../services/content-moderation.service';
import { AuthService } from '../../../../core/services/auth.service';
import { 
  ContentItem,
  ContentStatus,
  ContentFilters,
  ApprovalRequest
} from '../../../../core/models/content-management.model';
import { ContentType } from '../../../../core/models/moderation.model';

@Component({
  selector: 'app-content-management',
  templateUrl: './content-management.component.html',
  styleUrls: ['./content-management.component.scss']
})
export class ContentManagementComponent implements OnInit, OnDestroy {
  contentItems: ContentItem[] = [];
  approvalRequests: ApprovalRequest[] = [];
  pendingApprovalCount = 0;
  
  filterForm: FormGroup;
  
  // Make ContentStatus available in the template
  ContentStatus = ContentStatus;
  
  contentStatusOptions = [
    { value: ContentStatus.DRAFT, label: 'Draft' },
    { value: ContentStatus.PENDING, label: 'Pending' },
    { value: ContentStatus.PUBLISHED, label: 'Published' },
    { value: ContentStatus.REJECTED, label: 'Rejected' },
    { value: ContentStatus.ARCHIVED, label: 'Archived' }
  ];
  
  contentTypeOptions = [
    { value: ContentType.REVIEW, label: 'Review' },
    { value: ContentType.COMMENT, label: 'Comment' },
    { value: ContentType.USER_PROFILE, label: 'User Profile' },
    { value: ContentType.CUSTOM_LIST, label: 'Custom List' }
  ];
  
  sortOptions = [
    { value: 'created', label: 'Creation Date' },
    { value: 'updated', label: 'Last Updated' },
    { value: 'published', label: 'Publish Date' },
    { value: 'title', label: 'Title' },
    { value: 'views', label: 'Views' },
    { value: 'likes', label: 'Likes' }
  ];
  
  isLoading = false;
  selectedContent: ContentItem | null = null;
  isViewingApprovals = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private contentService: ContentManagementService,
    private moderationService: ContentModerationService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      status: [''],
      type: [''],
      searchQuery: [''],
      dateFrom: [''],
      dateTo: [''],
      sortBy: ['updated'],
      sortDirection: ['desc']
    });
  }

  ngOnInit(): void {
    this.loadContent();
    this.setupFilterListener();
    this.loadApprovalRequests();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadContent(): void {
    this.isLoading = true;
    
    this.contentService.getContent()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (items: ContentItem[]) => {
          this.contentItems = items;
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading content:', error);
          this.isLoading = false;
        }
      });
  }

  loadApprovalRequests(): void {
    this.contentService.getApprovalRequests('pending')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (requests: ApprovalRequest[]) => {
          this.approvalRequests = requests;
          this.pendingApprovalCount = requests.length;
        },
        error: (error: any) => {
          console.error('Error loading approval requests:', error);
        }
      });
  }

  setupFilterListener(): void {
    this.filterForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
      takeUntil(this.destroy$)
    ).subscribe(values => {
      this.applyFilters(values);
    });
  }

  applyFilters(filters: ContentFilters): void {
    this.isLoading = true;
    
    // Clean up empty filters
    const cleanFilters: ContentFilters = {};
    Object.keys(filters).forEach(key => {
      const value = filters[key as keyof ContentFilters];
      if (value !== null && value !== undefined && value !== '') {
        cleanFilters[key as keyof ContentFilters] = value as any;
      }
    });
    
    this.contentService.getContent(cleanFilters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (items: ContentItem[]) => {
          this.contentItems = items;
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error applying filters:', error);
          this.isLoading = false;
        }
      });
  }

  resetFilters(): void {
    this.filterForm.reset({
      status: '',
      type: '',
      searchQuery: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'updated',
      sortDirection: 'desc'
    });
  }

  viewContent(content: ContentItem): void {
    this.selectedContent = content;
  }

  closeContentView(): void {
    this.selectedContent = null;
  }

  changeContentStatus(content: ContentItem, newStatus: ContentStatus): void {
    // For rejection, we'd typically show a dialog asking for rejection reason
    // Here we'll use a simple prompt for demonstration
    let rejectionReason = '';
    if (newStatus === ContentStatus.REJECTED) {
      rejectionReason = prompt('Please enter a reason for rejection:') || '';
    }
    
    this.contentService.changeContentStatus(content.id, newStatus, rejectionReason)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedContent: ContentItem | null) => {
          if (updatedContent) {
            // Update content in the list
            this.contentItems = this.contentItems.map(item => 
              item.id === content.id ? updatedContent : item
            );
            
            // Update selected content if it's the one being viewed
            if (this.selectedContent && this.selectedContent.id === content.id) {
              this.selectedContent = updatedContent;
            }
            
            // Refresh approval requests if necessary
            if (
              newStatus === ContentStatus.PUBLISHED || 
              newStatus === ContentStatus.REJECTED
            ) {
              this.loadApprovalRequests();
            }
          }
        },
        error: (error: any) => {
          console.error('Error changing content status:', error);
          alert('Failed to change content status: ' + error.message);
        }
      });
  }

  deleteContent(content: ContentItem): void {
    if (!confirm(`Are you sure you want to delete "${content.title}"?`)) {
      return;
    }
    
    this.contentService.deleteContent(content.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (success: boolean) => {
          if (success) {
            this.contentItems = this.contentItems.filter(item => item.id !== content.id);
            
            // Close detail view if the deleted content was being viewed
            if (this.selectedContent && this.selectedContent.id === content.id) {
              this.selectedContent = null;
            }
            
            // Refresh approval requests
            this.loadApprovalRequests();
          } else {
            alert('Failed to delete content.');
          }
        },
        error: (error: any) => {
          console.error('Error deleting content:', error);
          alert('Failed to delete content: ' + error.message);
        }
      });
  }

  showApprovals(): void {
    this.isViewingApprovals = true;
  }

  hideApprovals(): void {
    this.isViewingApprovals = false;
  }

  processApprovalRequest(requestId: string, approved: boolean): void {
    // For rejection, we'd typically show a dialog asking for comments
    // Here we'll use a simple prompt for demonstration
    let comments = '';
    if (!approved) {
      comments = prompt('Please enter comments about this rejection:') || '';
    }
    
    this.contentService.processApprovalRequest(requestId, approved, comments)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedRequest: ApprovalRequest) => {
          // Update the approval request in the list
          this.approvalRequests = this.approvalRequests.filter(req => req.id !== requestId);
          this.pendingApprovalCount = this.approvalRequests.length;
          
          // Refresh content list
          this.loadContent();
        },
        error: (error: any) => {
          console.error('Error processing approval request:', error);
          alert('Failed to process approval request: ' + error.message);
        }
      });
  }

  getStatusColor(status: ContentStatus): string {
    switch (status) {
      case ContentStatus.DRAFT:
        return 'text-secondary';
      case ContentStatus.PENDING:
        return 'text-warning';
      case ContentStatus.PUBLISHED:
        return 'text-success';
      case ContentStatus.REJECTED:
        return 'text-danger';
      case ContentStatus.ARCHIVED:
        return 'text-muted';
      default:
        return '';
    }
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get isModerator(): boolean {
    return this.authService.isModerator();
  }
} 