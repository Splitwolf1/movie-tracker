import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  template: `
    <div class="forgot-password-container">
      <mat-card class="forgot-password-card">
        <mat-card-header>
          <mat-card-title>Reset Password</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <p class="instruction-text">
            Enter your email address and we'll send you a link to reset your password.
          </p>
          
          <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()" *ngIf="!resetLinkSent">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" required>
              <mat-error *ngIf="forgotPasswordForm.get('email')?.hasError('required')">
                Email is required
              </mat-error>
              <mat-error *ngIf="forgotPasswordForm.get('email')?.hasError('email')">
                Please enter a valid email
              </mat-error>
            </mat-form-field>
            
            <div class="form-actions">
              <button mat-button routerLink="/auth/login">Back to Login</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="forgotPasswordForm.invalid || isLoading">
                <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
                <span *ngIf="!isLoading">Send Reset Link</span>
              </button>
            </div>
          </form>
          
          <div class="success-message" *ngIf="resetLinkSent">
            <mat-icon color="primary">check_circle</mat-icon>
            <p>Password reset link has been sent to your email.</p>
            <button mat-raised-button color="primary" routerLink="/auth/login">Back to Login</button>
          </div>
          
          <app-error-message *ngIf="errorMessage" [message]="errorMessage"></app-error-message>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .forgot-password-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      padding: 2rem;
    }
    
    .forgot-password-card {
      max-width: 400px;
      width: 100%;
    }
    
    .instruction-text {
      margin-bottom: 1rem;
      color: #666;
    }
    
    .full-width {
      width: 100%;
      margin-bottom: 1rem;
    }
    
    .form-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1rem;
    }
    
    .success-message {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 1rem;
      
      mat-icon {
        font-size: 3rem;
        height: 3rem;
        width: 3rem;
        margin-bottom: 1rem;
      }
      
      p {
        margin-bottom: 1.5rem;
      }
    }
  `]
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  resetLinkSent = false;
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }
  
  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const { email } = this.forgotPasswordForm.value;
      
      this.authService.requestPasswordReset(email).subscribe({
        next: () => {
          this.isLoading = false;
          this.resetLinkSent = true;
        },
        error: (error: any) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'Failed to send reset link. Please try again.';
        }
      });
    }
  }
} 