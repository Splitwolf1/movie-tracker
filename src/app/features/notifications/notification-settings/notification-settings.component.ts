import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationPreferences } from '../../../core/models/notification.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-notification-settings',
  templateUrl: './notification-settings.component.html',
  styleUrls: ['./notification-settings.component.scss']
})
export class NotificationSettingsComponent implements OnInit, OnDestroy {
  settingsForm: FormGroup;
  isLoading = false;
  isSaving = false;
  private subscriptions: Subscription[] = [];
  
  constructor(
    private notificationService: NotificationService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.settingsForm = this.formBuilder.group({
      friendRequests: [true],
      friendActivity: [true],
      comments: [true],
      recommendations: [true],
      achievements: [true],
      systemNotifications: [true],
      emailNotifications: [false],
      pushNotifications: [false]
    });
  }
  
  ngOnInit(): void {
    this.loadPreferences();
  }
  
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  loadPreferences(): void {
    this.isLoading = true;
    
    const sub = this.notificationService.getNotificationPreferences().pipe(
      tap(preferences => {
        this.settingsForm.patchValue(preferences);
        this.isLoading = false;
      })
    ).subscribe();
    
    this.subscriptions.push(sub);
  }
  
  savePreferences(): void {
    if (this.settingsForm.invalid || this.isSaving) {
      return;
    }
    
    this.isSaving = true;
    const preferences: NotificationPreferences = this.settingsForm.value;
    
    const sub = this.notificationService.updateNotificationPreferences(preferences).pipe(
      tap(() => {
        this.isSaving = false;
        this.snackBar.open('Notification preferences saved', 'Close', {
          duration: 3000
        });
      })
    ).subscribe();
    
    this.subscriptions.push(sub);
  }
} 