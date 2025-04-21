import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  template: `
    <div class="profile-container">
      <h1 class="profile-title">User Profile</h1>
      
      <mat-card class="profile-card">
        <mat-card-header>
          <div class="avatar-container">
            <div class="avatar" [style.background-image]="'url(' + (user?.avatar || defaultAvatar) + ')'"></div>
            <button mat-mini-fab color="primary" class="avatar-edit-button" (click)="openAvatarUpload()">
              <mat-icon>edit</mat-icon>
            </button>
          </div>
          <mat-card-title>{{ user?.username }}</mat-card-title>
          <mat-card-subtitle>Member since {{ user?.createdAt | date:'mediumDate' }}</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
            <div class="form-section">
              <h2>Personal Information</h2>
              
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Full Name</mat-label>
                  <input matInput formControlName="fullName">
                </mat-form-field>
              </div>
              
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Email</mat-label>
                  <input matInput formControlName="email" type="email">
                  <mat-error *ngIf="profileForm.get('email')?.hasError('email')">
                    Please enter a valid email
                  </mat-error>
                </mat-form-field>
              </div>
              
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Bio</mat-label>
                  <textarea matInput formControlName="bio" rows="4"></textarea>
                </mat-form-field>
              </div>
            </div>
            
            <div class="form-section">
              <h2>Preferences</h2>
              
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Favorite Genres</mat-label>
                  <mat-select formControlName="favoriteGenres" multiple>
                    <mat-option *ngFor="let genre of genres" [value]="genre.id">
                      {{ genre.name }}
                    </mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
              
              <div class="form-row">
                <mat-checkbox formControlName="emailNotifications">
                  Receive email notifications for new releases and recommendations
                </mat-checkbox>
              </div>
            </div>
            
            <div class="form-actions">
              <button mat-button type="button" (click)="resetForm()">Reset</button>
              <button 
                mat-raised-button 
                color="primary" 
                type="submit" 
                [disabled]="profileForm.invalid || !profileForm.dirty || isLoading"
              >
                <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
                <span *ngIf="!isLoading">Save Changes</span>
              </button>
            </div>
          </form>
          
          <div class="change-password">
            <button mat-button color="primary" (click)="openChangePasswordDialog()">
              Change Password
            </button>
          </div>
          
          <app-error-message *ngIf="errorMessage" [message]="errorMessage"></app-error-message>
          
          <div *ngIf="successMessage" class="success-message">
            <mat-icon>check_circle</mat-icon>
            {{ successMessage }}
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 0 1rem;
    }
    
    .profile-title {
      margin-bottom: 2rem;
      font-size: 2rem;
      font-weight: 300;
    }
    
    .avatar-container {
      position: relative;
      margin-right: 1.5rem;
    }
    
    .avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background-size: cover;
      background-position: center;
      background-color: #e0e0e0;
      border: 3px solid #fff;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    }
    
    .avatar-edit-button {
      position: absolute;
      bottom: 0;
      right: 0;
      transform: translate(25%, 25%);
    }
    
    .form-section {
      margin-bottom: 2rem;
      
      h2 {
        font-size: 1.25rem;
        font-weight: 500;
        margin-bottom: 1rem;
        color: #555;
        border-bottom: 1px solid #eee;
        padding-bottom: 0.5rem;
      }
    }
    
    .form-row {
      margin-bottom: 1rem;
      
      mat-form-field {
        width: 100%;
      }
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
    }
    
    .change-password {
      margin-top: 2rem;
      text-align: right;
    }
    
    .success-message {
      display: flex;
      align-items: center;
      color: #4caf50;
      background-color: #e8f5e9;
      padding: 0.75rem;
      border-radius: 4px;
      margin-top: 1rem;
      
      mat-icon {
        margin-right: 0.5rem;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  user: any = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  defaultAvatar = 'https://via.placeholder.com/100x100?text=User';
  
  genres = [
    { id: 28, name: 'Action' },
    { id: 12, name: 'Adventure' },
    { id: 16, name: 'Animation' },
    { id: 35, name: 'Comedy' },
    { id: 80, name: 'Crime' },
    { id: 99, name: 'Documentary' },
    { id: 18, name: 'Drama' },
    { id: 10751, name: 'Family' },
    { id: 14, name: 'Fantasy' },
    { id: 36, name: 'History' },
    { id: 27, name: 'Horror' },
    { id: 10402, name: 'Music' },
    { id: 9648, name: 'Mystery' },
    { id: 10749, name: 'Romance' },
    { id: 878, name: 'Science Fiction' },
    { id: 10770, name: 'TV Movie' },
    { id: 53, name: 'Thriller' },
    { id: 10752, name: 'War' },
    { id: 37, name: 'Western' }
  ];
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.profileForm = this.fb.group({
      fullName: [''],
      email: ['', Validators.email],
      bio: [''],
      favoriteGenres: [[]],
      emailNotifications: [false]
    });
  }
  
  ngOnInit(): void {
    this.loadUserProfile();
  }
  
  loadUserProfile(): void {
    this.user = this.authService.getCurrentUser();
    
    if (this.user) {
      this.profileForm.patchValue({
        fullName: this.user.fullName || '',
        email: this.user.email || '',
        bio: this.user.bio || '',
        favoriteGenres: this.user.preferences?.genres || [],
        emailNotifications: this.user.preferences?.emailNotifications || false
      });
    }
  }
  
  onSubmit(): void {
    if (this.profileForm.valid && this.profileForm.dirty) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';
      
      const profileData = {
        fullName: this.profileForm.value.fullName,
        email: this.profileForm.value.email,
        bio: this.profileForm.value.bio,
        preferences: {
          genres: this.profileForm.value.favoriteGenres,
          emailNotifications: this.profileForm.value.emailNotifications
        }
      };
      
      setTimeout(() => {
        // Mock API call for now
        // this.userService.updateProfile(profileData).subscribe({...})
        this.isLoading = false;
        this.successMessage = 'Profile updated successfully!';
        this.profileForm.markAsPristine();
      }, 1000);
    }
  }
  
  resetForm(): void {
    this.loadUserProfile();
    this.errorMessage = '';
    this.successMessage = '';
  }
  
  openAvatarUpload(): void {
    // Implement file upload dialog
    console.log('Avatar upload clicked');
  }
  
  openChangePasswordDialog(): void {
    // Implement change password dialog
    console.log('Change password clicked');
  }
} 