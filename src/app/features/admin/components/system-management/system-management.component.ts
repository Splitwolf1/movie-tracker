import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../services/admin.service';

interface SystemLog {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'debug';
  source: string;
  message: string;
  details?: any;
}

interface SystemBackup {
  id: string;
  timestamp: Date;
  size: string;
  description: string;
  createdBy: string;
}

@Component({
  selector: 'app-system-management',
  templateUrl: './system-management.component.html',
  styleUrls: ['./system-management.component.scss']
})
export class SystemManagementComponent implements OnInit {
  isLoadingHealth = false;
  isLoadingLogs = false;
  isLoadingBackups = false;
  isCreatingBackup = false;
  isRestoringBackup = false;
  
  systemHealth: any = null;
  systemLogs: SystemLog[] = [];
  backups: SystemBackup[] = [];
  
  logLevels = ['all', 'info', 'warning', 'error', 'debug'];
  selectedLogLevel = 'all';
  logsPage = 1;
  logsLimit = 100;
  
  backupForm: FormGroup;
  
  constructor(
    private adminService: AdminService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.backupForm = this.fb.group({
      description: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadSystemHealth();
    this.loadSystemLogs();
    this.loadBackups();
  }

  loadSystemHealth(): void {
    this.isLoadingHealth = true;
    
    this.adminService.getSystemHealth().subscribe({
      next: (health) => {
        this.systemHealth = health;
        this.isLoadingHealth = false;
      },
      error: (error) => {
        console.error('Error loading system health:', error);
        this.isLoadingHealth = false;
        this.showErrorMessage('Failed to load system health information');
      }
    });
  }

  loadSystemLogs(): void {
    this.isLoadingLogs = true;
    
    this.adminService.getSystemLogs(this.logsPage, this.logsLimit, this.selectedLogLevel).subscribe({
      next: (response) => {
        this.systemLogs = response.logs;
        this.isLoadingLogs = false;
      },
      error: (error) => {
        console.error('Error loading system logs:', error);
        this.isLoadingLogs = false;
        this.showErrorMessage('Failed to load system logs');
      }
    });
  }

  loadBackups(): void {
    this.isLoadingBackups = true;
    
    this.adminService.getBackups().subscribe({
      next: (response) => {
        this.backups = response.backups;
        this.isLoadingBackups = false;
      },
      error: (error) => {
        console.error('Error loading backups:', error);
        this.isLoadingBackups = false;
        this.showErrorMessage('Failed to load system backups');
      }
    });
  }

  onCreateBackup(): void {
    if (this.backupForm.invalid) {
      return;
    }

    this.isCreatingBackup = true;
    const description = this.backupForm.get('description')?.value;

    this.adminService.createBackup().subscribe({
      next: (response) => {
        this.isCreatingBackup = false;
        this.loadBackups();
        this.backupForm.reset();
        this.showSuccessMessage('System backup created successfully');
      },
      error: (error) => {
        console.error('Error creating backup:', error);
        this.isCreatingBackup = false;
        this.showErrorMessage('Failed to create system backup');
      }
    });
  }

  onRestoreBackup(backupId: string): void {
    if (confirm('Are you sure you want to restore from this backup? This action cannot be undone.')) {
      this.isRestoringBackup = true;
      
      this.adminService.restoreFromBackup(backupId).subscribe({
        next: (response) => {
          this.isRestoringBackup = false;
          this.showSuccessMessage('System successfully restored from backup');
        },
        error: (error) => {
          console.error('Error restoring from backup:', error);
          this.isRestoringBackup = false;
          this.showErrorMessage('Failed to restore from backup');
        }
      });
    }
  }

  onLogLevelChange(level: string): void {
    this.selectedLogLevel = level;
    this.loadSystemLogs();
  }

  refreshData(): void {
    this.loadSystemHealth();
    this.loadSystemLogs();
    this.loadBackups();
  }

  downloadLogs(): void {
    // Convert logs to JSON string
    const logsData = JSON.stringify(this.systemLogs, null, 2);
    
    // Create a blob with the data
    const blob = new Blob([logsData], { type: 'application/json' });
    
    // Create a URL for the blob
    const url = window.URL.createObjectURL(blob);
    
    // Create a link element
    const a = document.createElement('a');
    
    // Set the download filename
    a.download = `system-logs-${new Date().toISOString().slice(0, 10)}.json`;
    
    // Set the link URL
    a.href = url;
    
    // Append the link to the document body
    document.body.appendChild(a);
    
    // Click the link to start the download
    a.click();
    
    // Remove the link from the document
    document.body.removeChild(a);
    
    // Release the URL object
    window.URL.revokeObjectURL(url);
  }

  getLogLevelClass(level: string): string {
    switch (level) {
      case 'error':
        return 'error-level';
      case 'warning':
        return 'warning-level';
      case 'info':
        return 'info-level';
      case 'debug':
        return 'debug-level';
      default:
        return '';
    }
  }

  getHealthStatusClass(): string {
    if (!this.systemHealth) {
      return '';
    }
    
    switch (this.systemHealth.status) {
      case 'healthy':
        return 'healthy-status';
      case 'warning':
        return 'warning-status';
      case 'critical':
        return 'critical-status';
      default:
        return '';
    }
  }

  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['success-snackbar']
    });
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
} 