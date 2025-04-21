import { Component } from '@angular/core';

/**
 * A reusable loading spinner component that displays a centered Material spinner.
 * 
 * This component is used throughout the application to provide a consistent loading
 * indicator when content is being fetched or processed.
 * 
 * @example
 * <app-loading-spinner></app-loading-spinner>
 */
@Component({
  selector: 'app-loading-spinner',
  template: `
    <div class="spinner-container">
      <mat-spinner diameter="50"></mat-spinner>
    </div>
  `,
  styles: [`
    .spinner-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      width: 100%;
      min-height: 200px;
    }
  `]
})
export class LoadingSpinnerComponent { } 