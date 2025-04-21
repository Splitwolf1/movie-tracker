import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { UserManagementService } from '../../../../core/services/user-management.service';
import { AuthService } from '../../../../core/services/auth.service';
import { User, UserRole } from '../../../../core/models/user.model';
import { 
  UserStatus, 
  UserFilters, 
  UserActivityLog, 
  AdminActionLog,
  AdminAction
} from '../../../../core/models/user-management.model';

// Create a const enum object since UserRole is only a type
const UserRoleEnum = {
  USER: 'user' as UserRole,
  MODERATOR: 'moderator' as UserRole,
  ADMIN: 'admin' as UserRole
};

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit, OnDestroy {
  users: User[] = [];
  filteredUsers: User[] = [];
  selectedUser: User | null = null;
  
  recentActivity: UserActivityLog[] = [];
  adminLogs: AdminActionLog[] = [];
  
  isLoading = false;
  isLoadingActivity = false;
  isViewingUserDetails = false;
  
  filterForm: FormGroup;
  
  // Make enums available in the template
  UserStatus = UserStatus;
  UserRole = UserRoleEnum;
  
  roleOptions = [
    { value: 'user', label: 'User' },
    { value: 'moderator', label: 'Moderator' },
    { value: 'admin', label: 'Administrator' }
  ];
  
  statusOptions = [
    { value: UserStatus.ACTIVE, label: 'Active' },
    { value: UserStatus.SUSPENDED, label: 'Suspended' },
    { value: UserStatus.BANNED, label: 'Banned' },
    { value: UserStatus.INACTIVE, label: 'Inactive' },
    { value: UserStatus.PENDING_VERIFICATION, label: 'Pending Verification' }
  ];
  
  sortOptions = [
    { value: 'username', label: 'Username' },
    { value: 'email', label: 'Email' },
    { value: 'createdAt', label: 'Registration Date' },
    { value: 'lastLogin', label: 'Last Login' },
    { value: 'status', label: 'Status' }
  ];
  
  private destroy$ = new Subject<void>();

  constructor(
    private userService: UserManagementService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.filterForm = this.fb.group({
      searchQuery: [''],
      status: [''],
      roles: [[]],
      dateFrom: [''],
      dateTo: [''],
      sortBy: ['username'],
      sortDirection: ['asc']
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.setupFilterListener();
    this.loadRecentActivity();
    if (this.authService.isAdmin()) {
      this.loadAdminLogs();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers(): void {
    this.isLoading = true;
    
    this.userService.getUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users: User[]) => {
          this.users = users;
          this.filteredUsers = users;
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading users:', error);
          this.isLoading = false;
        }
      });
  }

  loadRecentActivity(): void {
    this.isLoadingActivity = true;
    
    this.userService.getRecentActivity(10)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (activity: UserActivityLog[]) => {
          this.recentActivity = activity;
          this.isLoadingActivity = false;
        },
        error: (error: any) => {
          console.error('Error loading activity:', error);
          this.isLoadingActivity = false;
        }
      });
  }

  loadAdminLogs(): void {
    this.userService.getAdminActionLogs(10)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (logs: AdminActionLog[]) => {
          this.adminLogs = logs;
        },
        error: (error: any) => {
          console.error('Error loading admin logs:', error);
        }
      });
  }

  setupFilterListener(): void {
    this.filterForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
      takeUntil(this.destroy$)
    ).subscribe(values => {
      this.applyFilters(values);
    });
  }

  applyFilters(filters: UserFilters): void {
    this.isLoading = true;
    
    // Clean up empty filters
    const cleanFilters: UserFilters = {};
    Object.keys(filters).forEach(key => {
      const value = filters[key as keyof UserFilters];
      if (
        value !== null && 
        value !== undefined && 
        value !== '' && 
        !(Array.isArray(value) && value.length === 0)
      ) {
        cleanFilters[key as keyof UserFilters] = value as any;
      }
    });
    
    this.userService.getUsers(cleanFilters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users: User[]) => {
          this.filteredUsers = users;
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error applying filters:', error);
          this.isLoading = false;
        }
      });
  }

  resetFilters(): void {
    this.filterForm.reset({
      searchQuery: '',
      status: '',
      roles: [],
      dateFrom: '',
      dateTo: '',
      sortBy: 'username',
      sortDirection: 'asc'
    });
  }

  viewUserDetails(user: User): void {
    this.selectedUser = user;
    this.isViewingUserDetails = true;
  }

  closeUserDetails(): void {
    this.selectedUser = null;
    this.isViewingUserDetails = false;
  }

  viewUserProfile(userId: string): void {
    // Navigate to user profile page 
    this.router.navigate(['/admin/users', userId]);
  }

  updateUserRoles(user: User, role: string, isChecked: boolean): void {
    if (!this.authService.isAdmin()) {
      alert('Only administrators can change user roles');
      return;
    }
    
    // Prevent removing the last role
    if (!isChecked && user.roles.length === 1) {
      alert('User must have at least one role');
      return;
    }
    
    // Cast the role string to UserRole type
    const userRole = role as UserRole;
    
    // Update the roles array
    let updatedRoles: UserRole[];
    if (isChecked) {
      // Add the role if it doesn't exist
      updatedRoles = [...user.roles, userRole].filter((value, index, self) => 
        self.indexOf(value) === index
      );
    } else {
      // Remove the role
      updatedRoles = user.roles.filter(r => r !== userRole);
    }
    
    this.userService.updateUserRoles(user.id, updatedRoles)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedUser: User) => {
          // Update user in the lists
          this.users = this.users.map(u => 
            u.id === updatedUser.id ? updatedUser : u
          );
          this.filteredUsers = this.filteredUsers.map(u => 
            u.id === updatedUser.id ? updatedUser : u
          );
          
          // Update selected user if it's the same
          if (this.selectedUser && this.selectedUser.id === updatedUser.id) {
            this.selectedUser = updatedUser;
          }
        },
        error: (error: any) => {
          console.error('Error updating user roles:', error);
          alert('Failed to update user roles');
        }
      });
  }

  changeUserStatus(user: User, newStatus: UserStatus): void {
    if (!this.authService.isAdmin() && !this.authService.isModerator()) {
      alert('You do not have permission to change user status');
      return;
    }
    
    // For suspension, we need a reason and possibly an end date
    let reason = '';
    let endDate: Date | undefined;
    
    if (newStatus === UserStatus.SUSPENDED) {
      reason = prompt('Please enter a reason for suspension:') || '';
      if (!reason) {
        alert('A reason is required for suspension');
        return;
      }
      
      const daysInput = prompt('Enter number of days for suspension (leave empty for indefinite):');
      if (daysInput && !isNaN(Number(daysInput))) {
        const days = Number(daysInput);
        endDate = new Date();
        endDate.setDate(endDate.getDate() + days);
      }
    }
    
    this.userService.setUserStatus(user.id, newStatus, reason, endDate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedUser: User) => {
          // Update the user in the local array
          this.users = this.users.map(u => 
            u.id === updatedUser.id ? updatedUser : u
          );
          
          this.filteredUsers = this.filteredUsers.map(u => 
            u.id === updatedUser.id ? updatedUser : u
          );
          
          // Update selected user if needed
          if (this.selectedUser && this.selectedUser.id === updatedUser.id) {
            this.selectedUser = updatedUser;
          }
          
          alert(`Status updated for ${updatedUser.username}`);
          
          // Refresh activity logs
          this.loadRecentActivity();
          if (this.authService.isAdmin()) {
            this.loadAdminLogs();
          }
        },
        error: (error: any) => {
          console.error('Error updating user status:', error);
          alert(`Error updating status: ${error.message}`);
        }
      });
  }

  deleteUser(user: User): void {
    if (!this.authService.isAdmin()) {
      alert('Only administrators can delete users');
      return;
    }
    
    if (!confirm(`Are you sure you want to delete user ${user.username}? This action cannot be undone.`)) {
      return;
    }
    
    this.userService.deleteUser(user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (success: boolean) => {
          if (success) {
            // Remove the user from the arrays
            this.users = this.users.filter(u => u.id !== user.id);
            this.filteredUsers = this.filteredUsers.filter(u => u.id !== user.id);
            
            // Close details if this was the selected user
            if (this.selectedUser && this.selectedUser.id === user.id) {
              this.closeUserDetails();
            }
            
            alert(`User ${user.username} has been deleted`);
            
            // Refresh activity logs
            this.loadRecentActivity();
            this.loadAdminLogs();
          } else {
            alert('Failed to delete user');
          }
        },
        error: (error: any) => {
          console.error('Error deleting user:', error);
          alert(`Error deleting user: ${error.message}`);
        }
      });
  }

  resetPassword(user: User): void {
    if (!this.authService.isAdmin()) {
      alert('Only administrators can reset passwords');
      return;
    }
    
    if (!confirm(`Are you sure you want to reset the password for ${user.username}?`)) {
      return;
    }
    
    this.userService.resetUserPassword(user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (success: boolean) => {
          if (success) {
            alert(`Password reset email has been sent to ${user.email}`);
            
            // Refresh activity logs
            this.loadRecentActivity();
            this.loadAdminLogs();
          } else {
            alert('Failed to reset password');
          }
        },
        error: (error: any) => {
          console.error('Error resetting password:', error);
          alert(`Error resetting password: ${error.message}`);
        }
      });
  }

  getStatusClass(status: string | undefined): string {
    switch (status) {
      case UserStatus.ACTIVE:
        return 'text-success';
      case UserStatus.SUSPENDED:
        return 'text-warning';
      case UserStatus.BANNED:
        return 'text-danger';
      case UserStatus.INACTIVE:
        return 'text-secondary';
      case UserStatus.PENDING_VERIFICATION:
        return 'text-info';
      default:
        return 'text-muted';
    }
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return 'Never';
    return new Date(date).toLocaleString();
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get isModerator(): boolean {
    return this.authService.isModerator();
  }
  
  hasRole(user: User, roleValue: string): boolean {
    return user.roles.some(role => role === roleValue);
  }
} 