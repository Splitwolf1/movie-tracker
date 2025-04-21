import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, of } from 'rxjs';
import { catchError, finalize, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { ContentModerationService, ContentReport, ModerationAction } from '../../services/content-moderation.service';
import { Review } from '../../../../core/models/review.model';
import { Comment } from '../../../../core/models/social.model';
import { Report } from '../../../../core/models/report.model';
import { ActionLog } from '../../../../core/models/action-log.model';
import { AdminService } from '../../services/admin.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-content-moderation',
  templateUrl: './content-moderation.component.html',
  styleUrls: ['./content-moderation.component.scss']
})
export class ContentModerationComponent implements OnInit {
  // Reports table
  reportsDataSource = new MatTableDataSource<ContentReport>([]);
  reportsDisplayedColumns: string[] = ['id', 'contentType', 'reason', 'createdAt', 'status', 'actions'];
  reportsTotalItems = 0;
  
  // Search control
  reportsSearchControl = new FormControl('');
  
  // Active tab index
  activeTabIndex = 0;

  // Loading states
  isLoading = {
    reports: false,
    reviews: false,
    comments: false,
    actions: false
  };

  // Filter forms
  reportFilterForm: FormGroup;
  reviewFilterForm: FormGroup;
  commentFilterForm: FormGroup;
  actionLogFilterForm: FormGroup;

  // Status options
  reportsStatusFilter = 'all';
  reportsContentTypeFilter = 'all';
  
  // Pagination
  reportsCurrentPage = 0;
  reportsPageSize = 10;
  reviewsCurrentPage = 0;
  reviewsPageSize = 10;
  commentsCurrentPage = 0;
  commentsPageSize = 10;
  actionsCurrentPage = 0;
  actionsPageSize = 10;
  
  // Reviews table
  reviewsDataSource = new MatTableDataSource<Review>([]);
  reviewsDisplayedColumns: string[] = ['id', 'movieTitle', 'userName', 'rating', 'createdAt', 'actions'];
  reviewsTotalItems = 0;
  
  // Comments table
  commentsDataSource = new MatTableDataSource<Comment>([]);
  commentsDisplayedColumns: string[] = ['id', 'userName', 'content', 'createdAt', 'actions'];
  commentsTotalItems = 0;
  
  // Actions table
  actionsDataSource = new MatTableDataSource<ModerationAction>([]);
  actionsDisplayedColumns: string[] = ['id', 'adminName', 'action', 'contentType', 'createdAt'];
  actionsTotalItems = 0;
  
  // Table sort
  @ViewChild('reportsSort') reportsSort!: MatSort;
  @ViewChild('reviewsSort') reviewsSort!: MatSort;
  @ViewChild('commentsSort') commentsSort!: MatSort;
  @ViewChild('actionsSort') actionsSort!: MatSort;
  
  // Paginators
  @ViewChild('reportsPaginator') reportsPaginator!: MatPaginator;
  @ViewChild('reviewsPaginator') reviewsPaginator!: MatPaginator;
  @ViewChild('commentsPaginator') commentsPaginator!: MatPaginator;
  @ViewChild('actionsPaginator') actionsPaginator!: MatPaginator;

  constructor(
    private moderationService: ContentModerationService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private adminService: AdminService,
    private notificationService: NotificationService
  ) {
    this.reportFilterForm = this.fb.group({
      status: ['all'],
      contentType: ['all'],
      searchTerm: ['']
    });

    this.reviewFilterForm = this.fb.group({
      searchTerm: ['']
    });

    this.commentFilterForm = this.fb.group({
      searchTerm: ['']
    });

    this.actionLogFilterForm = this.fb.group({
      action: ['all'],
      fromDate: [null],
      toDate: [null]
    });
  }

  ngOnInit(): void {
    this.loadReports();
    
    // Set up search field with debounce
    this.reportFilterForm.get('searchTerm')?.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.loadReports();
      });
  }

  // Handle tab changes
  onTabChange(event: MatTabChangeEvent): void {
    this.activeTabIndex = event.index;
    
    switch (event.index) {
      case 0:
        this.loadReports();
        break;
      case 1:
        this.loadPendingReviews();
        break;
      case 2:
        this.loadPendingComments();
        break;
      case 3:
        this.loadModerationActions();
        break;
    }
  }

  // Load reports with filtering
  loadReports(): void {
    this.isLoading.reports = true;
    const filters = this.reportFilterForm.value;
    
    this.adminService.getReports(filters)
      .pipe(
        catchError(error => {
          this.notificationService.showError('Failed to load reports');
          console.error('Error loading reports:', error);
          return of([]);
        }),
        finalize(() => {
          this.isLoading.reports = false;
        })
      )
      .subscribe((reports: Report[]) => {
        this.reportsDataSource.data = reports as any;
        
        // Apply sorting and pagination after data is loaded
        setTimeout(() => {
          this.reportsDataSource.sort = this.reportsSort;
          this.reportsDataSource.paginator = this.reportsPaginator;
        });
      });
  }

  // Handle page events
  onReportsPageChange(event: any): void {
    this.reportsCurrentPage = event.pageIndex;
    this.reportsPageSize = event.pageSize;
    this.loadReports();
  }

  // View reported item details
  viewReportedItem(report: ContentReport): void {
    this.moderationService.getReportedContent(report.contentType, report.contentId).subscribe({
      next: (content) => {
        this.openReportDetailsDialog(report, content);
      },
      error: (error) => {
        console.error('Error loading reported content:', error);
        this.snackBar.open('Failed to load reported content', 'Close', { duration: 3000 });
      }
    });
  }

  // Open dialog with report details
  openReportDetailsDialog(report: ContentReport, content: any): void {
    // Implementation will depend on dialog component
    console.log('Opening dialog with report:', report, 'and content:', content);
  }

  // Load pending reviews
  loadPendingReviews(): void {
    this.isLoading.reviews = true;
    const filters = this.reviewFilterForm.value;
    
    this.adminService.getPendingReviews(filters)
      .pipe(
        catchError(error => {
          this.notificationService.showError('Failed to load pending reviews');
          console.error('Error loading pending reviews:', error);
          return of([]);
        }),
        finalize(() => {
          this.isLoading.reviews = false;
        })
      )
      .subscribe((reviews: Review[]) => {
        this.reviewsDataSource.data = reviews;
        
        // Apply sorting and pagination after data is loaded
        setTimeout(() => {
          this.reviewsDataSource.sort = this.reviewsSort;
          this.reviewsDataSource.paginator = this.reviewsPaginator;
        });
      });
  }

  // Handle reviews page events
  onReviewsPageChange(event: any): void {
    this.reviewsCurrentPage = event.pageIndex;
    this.reviewsPageSize = event.pageSize;
    this.loadPendingReviews();
  }

  // Load pending comments
  loadPendingComments(): void {
    this.isLoading.comments = true;
    const filters = this.commentFilterForm.value;
    
    this.adminService.getPendingComments(filters)
      .pipe(
        catchError(error => {
          this.notificationService.showError('Failed to load pending comments');
          console.error('Error loading pending comments:', error);
          return of([]);
        }),
        finalize(() => {
          this.isLoading.comments = false;
        })
      )
      .subscribe((comments: Comment[]) => {
        this.commentsDataSource.data = comments;
        
        // Apply sorting and pagination after data is loaded
        setTimeout(() => {
          this.commentsDataSource.sort = this.commentsSort;
          this.commentsDataSource.paginator = this.commentsPaginator;
        });
      });
  }

  // Handle comments page events
  onCommentsPageChange(event: any): void {
    this.commentsCurrentPage = event.pageIndex;
    this.commentsPageSize = event.pageSize;
    this.loadPendingComments();
  }

  // Load moderation actions log
  loadModerationActions(): void {
    this.isLoading.actions = true;
    const filters = this.actionLogFilterForm.value;
    
    this.adminService.getActionLogs(filters)
      .pipe(
        catchError(error => {
          this.notificationService.showError('Failed to load action logs');
          console.error('Error loading action logs:', error);
          return of([]);
        }),
        finalize(() => {
          this.isLoading.actions = false;
        })
      )
      .subscribe((logs: ActionLog[]) => {
        this.actionsDataSource.data = logs as any;
        
        // Apply sorting and pagination after data is loaded
        setTimeout(() => {
          this.actionsDataSource.sort = this.actionsSort;
          this.actionsDataSource.paginator = this.actionsPaginator;
        });
      });
  }

  // Handle actions page events
  onActionsPageChange(event: any): void {
    this.actionsCurrentPage = event.pageIndex;
    this.actionsPageSize = event.pageSize;
    this.loadModerationActions();
  }

  // Update report status
  updateReportStatus(report: ContentReport, status: string): void {
    this.moderationService.updateReportStatus(report.id, status).subscribe({
      next: () => {
        this.snackBar.open(`Report marked as ${status}`, 'Close', { duration: 3000 });
        this.loadReports();
      },
      error: (error) => {
        console.error('Error updating report status:', error);
        this.snackBar.open('Failed to update report status', 'Close', { duration: 3000 });
      }
    });
  }

  // Update review status
  approveReview(review: Review): void {
    if (!review.id) return;
    
    this.moderationService.approveReview(review.id).subscribe({
      next: () => {
        this.snackBar.open('Review approved', 'Close', { duration: 3000 });
        this.loadPendingReviews();
      },
      error: (error) => {
        console.error('Error approving review:', error);
        this.snackBar.open('Failed to approve review', 'Close', { duration: 3000 });
      }
    });
  }

  rejectReview(review: Review): void {
    if (!review.id) return;
    
    this.moderationService.rejectReview(review.id).subscribe({
      next: () => {
        this.snackBar.open('Review rejected', 'Close', { duration: 3000 });
        this.loadPendingReviews();
      },
      error: (error) => {
        console.error('Error rejecting review:', error);
        this.snackBar.open('Failed to reject review', 'Close', { duration: 3000 });
      }
    });
  }

  // Update comment status
  approveComment(comment: Comment): void {
    this.moderationService.approveComment(comment.id).subscribe({
      next: () => {
        this.snackBar.open('Comment approved', 'Close', { duration: 3000 });
        this.loadPendingComments();
      },
      error: (error) => {
        console.error('Error approving comment:', error);
        this.snackBar.open('Failed to approve comment', 'Close', { duration: 3000 });
      }
    });
  }

  rejectComment(comment: Comment): void {
    this.moderationService.rejectComment(comment.id).subscribe({
      next: () => {
        this.snackBar.open('Comment rejected', 'Close', { duration: 3000 });
        this.loadPendingComments();
      },
      error: (error) => {
        console.error('Error rejecting comment:', error);
        this.snackBar.open('Failed to reject comment', 'Close', { duration: 3000 });
      }
    });
  }

  // Filter reports based on form values
  applyReportFilter(): void {
    this.reportsStatusFilter = this.reportFilterForm.get('status')?.value || 'all';
    this.reportsContentTypeFilter = this.reportFilterForm.get('contentType')?.value || 'all';
    this.reportsCurrentPage = 0;
    this.loadReports();
  }

  // Filter reviews based on form values
  applyReviewFilter(): void {
    this.reviewsCurrentPage = 0;
    this.loadPendingReviews();
  }

  // Filter comments based on form values
  applyCommentFilter(): void {
    this.commentsCurrentPage = 0;
    this.loadPendingComments();
  }

  // Filter action logs based on form values
  applyActionLogFilter(): void {
    this.actionsCurrentPage = 0;
    this.loadModerationActions();
  }

  // Reset filters
  resetReportFilters(): void {
    this.reportFilterForm.reset({
      status: 'all',
      contentType: 'all',
      searchTerm: ''
    });
    this.reportsStatusFilter = 'all';
    this.reportsContentTypeFilter = 'all';
    this.loadReports();
  }

  // Get CSS class for status display
  getStatusClass(status: string): string {
    return status.toLowerCase();
  }

  // Format date for display
  formatDate(date: Date): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString();
  }

  // Get CSS class for action type
  getActionClass(action: string): string {
    switch (action) {
      case 'approve':
        return 'approved';
      case 'reject':
        return 'rejected';
      case 'flag':
        return 'flagged';
      case 'delete':
        return 'deleted';
      default:
        return '';
    }
  }

  // Update report status
  changeReportStatus(reportId: string, status: string): void {
    this.moderationService.updateReportStatus(reportId, status).subscribe({
      next: () => {
        this.snackBar.open(`Report marked as ${status}`, 'Close', { duration: 3000 });
        this.loadReports();
      },
      error: (error: any) => {
        console.error('Error updating report status:', error);
        this.snackBar.open('Failed to update report status', 'Close', { duration: 3000 });
      }
    });
  }

  // Delete review
  deleteReview(reviewId: string): void {
    this.moderationService.deleteReview(reviewId).subscribe({
      next: () => {
        this.snackBar.open('Review deleted', 'Close', { duration: 3000 });
        this.loadPendingReviews();
      },
      error: (error: any) => {
        console.error('Error deleting review:', error);
        this.snackBar.open('Failed to delete review', 'Close', { duration: 3000 });
      }
    });
  }

  // Delete comment
  deleteComment(commentId: string): void {
    this.moderationService.deleteComment(commentId).subscribe({
      next: () => {
        this.snackBar.open('Comment deleted', 'Close', { duration: 3000 });
        this.loadPendingComments();
      },
      error: (error: any) => {
        console.error('Error deleting comment:', error);
        this.snackBar.open('Failed to delete comment', 'Close', { duration: 3000 });
      }
    });
  }
} 