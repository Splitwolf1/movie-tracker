import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-error-message',
  template: `
    <div class="error-container" *ngIf="message">
      <mat-icon>error_outline</mat-icon>
      <span>{{ message }}</span>
    </div>
  `,
  styles: [`
    .error-container {
      display: flex;
      align-items: center;
      color: #f44336;
      padding: 8px;
      background-color: #ffebee;
      border-radius: 4px;
      margin: 8px 0;
    }
    mat-icon {
      margin-right: 8px;
    }
  `]
})
export class ErrorMessageComponent {
  @Input() message: string = '';
} 