import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-registration-prompt',
  templateUrl: './registration-prompt.component.html',
  styleUrls: ['./registration-prompt.component.scss']
})
export class RegistrationPromptComponent {
  registrationForm: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<RegistrationPromptComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string },
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.registrationForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.registrationForm.valid) {
      const { username, email, password, confirmPassword } = this.registrationForm.value;
      this.authService.register({ 
        username, 
        email, 
        password, 
        passwordConfirm: confirmPassword 
      }).subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (error: any) => {
          console.error('Registration failed:', error);
          // Handle error (show error message)
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
} 