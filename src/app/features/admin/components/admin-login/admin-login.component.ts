import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  returnUrl: string = '/admin';
  
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Get return URL from route parameters or default to '/admin'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin';
    
    // Redirect to admin dashboard if already logged in as admin
    if (this.authService.isAuthenticated() && this.authService.isAdmin()) {
      this.router.navigateByUrl(this.returnUrl);
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid || this.isLoading) {
      return;
    }

    this.isLoading = true;
    
    const credentials = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        // Check if the logged in user has admin or moderator role
        if (this.authService.isAdmin() || this.authService.isModerator()) {
          this.router.navigateByUrl(this.returnUrl);
        } else {
          this.snackBar.open('You do not have admin permissions.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.authService.logout();
        }
      },
      error: (error) => {
        this.isLoading = false;
        const errorMessage = error.error?.message || 'Invalid credentials';
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  get username() { return this.loginForm.get('username'); }
  get password() { return this.loginForm.get('password'); }
} 