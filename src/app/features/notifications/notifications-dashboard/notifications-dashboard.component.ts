import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notifications-dashboard',
  templateUrl: './notifications-dashboard.component.html',
  styleUrls: ['./notifications-dashboard.component.scss']
})
export class NotificationsDashboardComponent implements OnInit {
  
  constructor(private router: Router) { }
  
  ngOnInit(): void {
  }
  
  navigateToSettings(): void {
    this.router.navigate(['/notifications/settings']);
  }
  
  navigateToNotifications(): void {
    this.router.navigate(['/notifications']);
  }
} 