import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Input Validation Service
 * 
 * Provides reusable validation functions and custom validators
 * for reactive forms throughout the application.
 * 
 * This service centralizes validation logic to ensure consistency
 * and security across the application.
 */
@Injectable({
  providedIn: 'root'
})
export class InputValidationService {
  // Common regex patterns
  private patterns = {
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    url: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    username: /^[a-zA-Z0-9_-]{3,20}$/,
    safeText: /^[^<>]*$/
  };
  
  // XSS attack patterns to detect
  private xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /on\w+\s*=\s*['"](.*?)['"]|javascript:/gi,
    /data:text\/html/gi
  ];
  
  // SQL injection patterns to detect
  private sqlInjectionPatterns = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/gi,
    /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/gi,
    /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/gi,
    /exec(\s|\+)+(s|x)p\w+/gi
  ];
  
  constructor() {}
  
  /**
   * Validate an email address
   */
  validateEmail(email: string): boolean {
    return this.patterns.email.test(email);
  }
  
  /**
   * Validate a password against strong password requirements
   */
  validatePassword(password: string): boolean {
    return this.patterns.password.test(password);
  }
  
  /**
   * Check if text contains potential XSS attacks
   */
  containsXss(text: string): boolean {
    return this.xssPatterns.some(pattern => pattern.test(text));
  }
  
  /**
   * Check if text contains potential SQL injection
   */
  containsSqlInjection(text: string): boolean {
    return this.sqlInjectionPatterns.some(pattern => pattern.test(text));
  }
  
  /**
   * Check if text is generally safe (no obvious XSS or SQL injection)
   */
  isSafeText(text: string): boolean {
    return this.patterns.safeText.test(text) && 
           !this.containsXss(text) && 
           !this.containsSqlInjection(text);
  }
  
  /**
   * Sanitize text by removing potentially dangerous content
   * Note: This is NOT a replacement for proper server-side sanitization
   */
  sanitizeText(text: string): string {
    // Replace HTML tags with their entity equivalents
    return text
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  
  /**
   * Custom validator to check for XSS attacks
   */
  xssValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null;
      }
      
      const hasXss = this.containsXss(value);
      return hasXss ? { xss: true } : null;
    };
  }
  
  /**
   * Custom validator to check for SQL injection
   */
  sqlInjectionValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null;
      }
      
      const hasSqlInjection = this.containsSqlInjection(value);
      return hasSqlInjection ? { sqlInjection: true } : null;
    };
  }
  
  /**
   * Password strength validator
   */
  passwordStrengthValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null;
      }
      
      const errors: ValidationErrors = {};
      
      if (value.length < 8) {
        errors['minlength'] = { requiredLength: 8, actualLength: value.length };
      }
      
      if (!/[A-Z]/.test(value)) {
        errors['uppercase'] = true;
      }
      
      if (!/[a-z]/.test(value)) {
        errors['lowercase'] = true;
      }
      
      if (!/[0-9]/.test(value)) {
        errors['digit'] = true;
      }
      
      if (!/[@$!%*?&]/.test(value)) {
        errors['specialChar'] = true;
      }
      
      return Object.keys(errors).length > 0 ? errors : null;
    };
  }
  
  /**
   * Email validator
   */
  emailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null;
      }
      
      const isValid = this.validateEmail(value);
      return isValid ? null : { email: true };
    };
  }
} 