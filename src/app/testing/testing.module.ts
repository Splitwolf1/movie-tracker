import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { of } from 'rxjs';

// Mock Services
export class MockAuthService {
  isAuthenticated = jest.fn().mockReturnValue(true);
  getCurrentUser = jest.fn().mockReturnValue({ id: '1', username: 'testuser', email: 'test@example.com', roles: ['user'] });
  login = jest.fn().mockReturnValue(of({ token: 'fake-token' }));
  logout = jest.fn();
  register = jest.fn().mockReturnValue(of({ success: true }));
}

export class MockMovieService {
  getTrending = jest.fn().mockReturnValue(of([]));
  getUpcoming = jest.fn().mockReturnValue(of([]));
  getPopular = jest.fn().mockReturnValue(of([]));
  getMovieDetails = jest.fn().mockReturnValue(of({}));
  getMovieCredits = jest.fn().mockReturnValue(of({ cast: [] }));
  getMovieVideos = jest.fn().mockReturnValue(of({ results: [] }));
  getSimilarMovies = jest.fn().mockReturnValue(of({ results: [] }));
  searchMovies = jest.fn().mockReturnValue(of({ results: [] }));
  getMovieGenres = jest.fn().mockReturnValue(of({ genres: [] }));
}

export class MockWatchlistService {
  getWatchlist = jest.fn().mockReturnValue(of([]));
  addToWatchlist = jest.fn();
  removeFromWatchlist = jest.fn();
  isInWatchlist = jest.fn().mockReturnValue(of(false));
  getWatchlistCount = jest.fn().mockReturnValue(of(0));
  markAsWatched = jest.fn();
  exportWatchlist = jest.fn();
}

export class MockNotificationService {
  showSuccess = jest.fn();
  showError = jest.fn();
  showInfo = jest.fn();
  showWarning = jest.fn();
}

@NgModule({
  imports: [
    CommonModule,
    RouterTestingModule,
    HttpClientTestingModule,
    NoopAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    MatSnackBarModule
  ],
  providers: [],
  exports: [
    RouterTestingModule,
    HttpClientTestingModule,
    NoopAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    MatSnackBarModule
  ]
})
export class TestingModule { } 