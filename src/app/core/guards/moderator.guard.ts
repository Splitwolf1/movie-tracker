import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ModeratorGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // First check if the user is authenticated
    if (!this.authService.isAuthenticated()) {
      return this.router.createUrlTree(['/auth/login'], {
        queryParams: { returnUrl: state.url }
      });
    }

    // Then check if the user has moderator or admin role
    // (isAdmin is already checked in isModerator)
    if (this.authService.isModerator()) {
      return true;
    }

    // If the user is authenticated but not a moderator, redirect to home page
    // with an unauthorized message
    return this.router.createUrlTree(['/'], {
      queryParams: { unauthorized: 'moderator' }
    });
  }
} 