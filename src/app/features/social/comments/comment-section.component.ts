import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { SocialService } from '../../../core/services/social.service';
import { Comment, ContentType } from '../../../core/models/social.model';
import { Observable, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-comment-section',
  templateUrl: './comment-section.component.html',
  styleUrls: ['./comment-section.component.scss']
})
export class CommentSectionComponent implements OnInit, OnDestroy {
  @Input() contentId!: string;
  @Input() contentType!: ContentType;
  
  comments$!: Observable<Comment[]>;
  commentControl = new FormControl('', [Validators.required, Validators.maxLength(500)]);
  isSubmitting = false;
  currentUserId: string | null = null;
  subscriptions: Subscription[] = [];
  
  constructor(
    private socialService: SocialService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit(): void {
    if (!this.contentId || !this.contentType) {
      console.error('Comment section requires contentId and contentType');
      return;
    }
    
    this.loadComments();
    
    const user = this.authService.getCurrentUser();
    this.currentUserId = user ? user.id : null;
  }
  
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  loadComments(): void {
    this.comments$ = this.socialService.getComments(this.contentType, this.contentId);
  }
  
  submitComment(): void {
    if (this.commentControl.invalid || this.isSubmitting) {
      return;
    }
    
    const comment = this.commentControl.value;
    if (!comment) {
      return;
    }
    
    this.isSubmitting = true;
    
    const sub = this.socialService.addComment(
      this.contentType,
      this.contentId,
      comment
    ).pipe(
      tap(() => {
        this.commentControl.reset();
        this.isSubmitting = false;
        this.loadComments();
      })
    ).subscribe(
      result => {
        if (result) {
          this.snackBar.open('Comment added successfully', 'Close', {
            duration: 3000
          });
        }
      },
      error => {
        this.isSubmitting = false;
        this.snackBar.open('Failed to add comment', 'Close', {
          duration: 3000
        });
      }
    );
    
    this.subscriptions.push(sub);
  }
  
  likeComment(commentId: string): void {
    const sub = this.socialService.likeComment(commentId, this.contentType, this.contentId)
      .pipe(
        tap(() => this.loadComments())
      )
      .subscribe(
        success => {
          if (success) {
            // Silently update
          } else {
            this.snackBar.open('Failed to like comment', 'Close', {
              duration: 3000
            });
          }
        },
        error => {
          this.snackBar.open('Error liking comment', 'Close', {
            duration: 3000
          });
        }
      );
      
    this.subscriptions.push(sub);
  }
  
  getCommentDate(comment: Comment): string {
    const date = new Date(comment.createdAt);
    return date.toLocaleDateString();
  }
  
  isOwnComment(comment: Comment): boolean {
    return this.currentUserId === comment.userId;
  }
} 