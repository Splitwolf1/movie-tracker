import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { WatchlistService } from '../../../core/services/watchlist.service';
import { Movie } from '../../../core/models/movie.model';
import { SharedContent, PrivacyLevel } from '../../../core/models/social.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-share-watchlist',
  templateUrl: './share-watchlist.component.html',
  styleUrls: ['./share-watchlist.component.scss']
})
export class ShareWatchlistComponent implements OnInit {
  watchlist$: Observable<Movie[]>;
  shareForm: FormGroup;
  submitting = false;
  privacyOptions = [
    { value: PrivacyLevel.PUBLIC, label: 'Public - Anyone can see' },
    { value: PrivacyLevel.FRIENDS, label: 'Friends Only - Only your friends can see' },
    { value: PrivacyLevel.PRIVATE, label: 'Private - Only you can see' }
  ];
  
  constructor(
    private watchlistService: WatchlistService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.watchlist$ = this.watchlistService.getWatchlist();
    this.shareForm = this.formBuilder.group({
      message: ['Check out my watchlist!', [Validators.maxLength(500)]],
      privacy: [PrivacyLevel.FRIENDS, [Validators.required]]
    });
  }
  
  ngOnInit(): void {
  }
  
  onSubmit(): void {
    if (this.shareForm.invalid || this.submitting) {
      return;
    }
    
    this.submitting = true;
    const formValue = this.shareForm.value;
    
    this.watchlistService.shareWatchlist(
      formValue.message,
      formValue.privacy
    ).subscribe(
      success => {
        this.submitting = false;
        
        if (success) {
          this.snackBar.open('Watchlist shared successfully!', 'Close', {
            duration: 3000
          });
          
          // Reset form
          this.shareForm.patchValue({
            message: 'Check out my watchlist!'
          });
        } else {
          this.snackBar.open('Unable to share empty watchlist.', 'Close', {
            duration: 3000
          });
        }
      },
      error => {
        this.submitting = false;
        this.snackBar.open('Failed to share watchlist. Please try again.', 'Close', {
          duration: 3000
        });
      }
    );
  }
} 