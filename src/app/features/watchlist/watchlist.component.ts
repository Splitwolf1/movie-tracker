import { Component, OnInit } from '@angular/core';
import { MovieService } from '../../core/services/movie.service';
import { WatchlistService } from '../../core/services/watchlist.service';
import { Movie } from '../../core/models/movie.model';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-watchlist',
  template: `
    <div class="watchlist-container">
      <div class="watchlist-header">
        <h1>My Watchlist</h1>
        <div class="watchlist-controls">
          <mat-form-field appearance="outline">
            <mat-label>Sort by</mat-label>
            <mat-select [(value)]="sortType" (selectionChange)="onSortChange()">
              <mat-option value="dateAdded">Date Added</mat-option>
              <mat-option value="title">Title</mat-option>
              <mat-option value="releaseDate">Release Date</mat-option>
              <mat-option value="popularity">Popularity</mat-option>
            </mat-select>
          </mat-form-field>
          
          <button mat-raised-button color="primary" (click)="exportWatchlist()">
            <mat-icon>file_download</mat-icon>
            Export
          </button>
        </div>
      </div>
      
      <div class="watchlist-content" *ngIf="!isLoading; else loading">
        <ng-container *ngIf="watchlist.length > 0; else emptyWatchlist">
          <div class="movie-grid">
            <mat-card class="movie-card" *ngFor="let movie of watchlist">
              <div class="card-overlay">
                <button mat-icon-button class="remove-button" (click)="removeFromWatchlist(movie)">
                  <mat-icon>close</mat-icon>
                </button>
                <button mat-icon-button class="watched-button" (click)="markAsWatched(movie)" matTooltip="Mark as watched">
                  <mat-icon>visibility</mat-icon>
                </button>
              </div>
              
              <img [src]="getPosterUrl(movie)" [alt]="movie.title" class="movie-poster" [routerLink]="['/movie', movie.id]">
              
              <mat-card-content>
                <h3 class="movie-title" [routerLink]="['/movie', movie.id]">{{ movie.title }}</h3>
                <div class="movie-meta">
                  <span class="release-date">{{ movie.release_date | date:'yyyy' }}</span>
                  <span class="rating" *ngIf="movie.vote_average">
                    <mat-icon class="star-icon">star</mat-icon>
                    {{ movie.vote_average | number:'1.1-1' }}
                  </span>
                </div>
                <div class="movie-genres" *ngIf="movie.genres && movie.genres.length">
                  <span class="genre-tag" *ngFor="let genre of movie.genres.slice(0, 2)">{{ genre.name }}</span>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </ng-container>
        
        <ng-template #emptyWatchlist>
          <div class="empty-watchlist">
            <mat-icon>visibility</mat-icon>
            <h2>Your watchlist is empty</h2>
            <p>Movies and TV shows you want to watch will appear here.</p>
            <button mat-raised-button color="primary" routerLink="/discover">Discover Movies</button>
          </div>
        </ng-template>
      </div>
      
      <ng-template #loading>
        <div class="loading-container">
          <mat-spinner></mat-spinner>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .watchlist-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }
    
    .watchlist-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      
      h1 {
        font-size: 2rem;
        font-weight: 400;
        margin: 0;
      }
    }
    
    .watchlist-controls {
      display: flex;
      align-items: center;
      gap: 1rem;
      
      mat-form-field {
        width: 120px;
      }
    }
    
    .movie-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1.5rem;
    }
    
    .movie-card {
      position: relative;
      transition: transform 0.2s, box-shadow 0.2s;
      
      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 12px rgba(0, 0, 0, 0.2);
        
        .card-overlay {
          opacity: 1;
        }
      }
    }
    
    .card-overlay {
      position: absolute;
      top: 0;
      right: 0;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 0.5rem;
      opacity: 0;
      transition: opacity 0.2s;
      z-index: 2;
      
      button {
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
      }
    }
    
    .movie-poster {
      width: 100%;
      aspect-ratio: 2/3;
      object-fit: cover;
      cursor: pointer;
    }
    
    .movie-title {
      font-size: 1rem;
      margin: 0.5rem 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      cursor: pointer;
      
      &:hover {
        color: #3f51b5;
      }
    }
    
    .movie-meta {
      display: flex;
      justify-content: space-between;
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
      
      .rating {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        color: #f5c518;
        
        .star-icon {
          font-size: 1rem;
          height: 1rem;
          width: 1rem;
        }
      }
    }
    
    .movie-genres {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      
      .genre-tag {
        font-size: 0.75rem;
        padding: 0.2rem 0.5rem;
        background-color: rgba(0, 0, 0, 0.05);
        border-radius: 4px;
        color: #666;
      }
    }
    
    .empty-watchlist {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 4rem 1rem;
      
      mat-icon {
        font-size: 4rem;
        height: 4rem;
        width: 4rem;
        margin-bottom: 1.5rem;
        color: #bbb;
      }
      
      h2 {
        font-size: 1.5rem;
        font-weight: 400;
        margin-bottom: 0.5rem;
      }
      
      p {
        color: #666;
        margin-bottom: 2rem;
      }
    }
    
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 4rem 0;
    }
  `]
})
export class WatchlistComponent implements OnInit {
  watchlist: Movie[] = [];
  sortType = 'dateAdded';
  isLoading = false;
  
  constructor(
    private movieService: MovieService,
    private watchlistService: WatchlistService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit(): void {
    this.loadWatchlist();
  }
  
  loadWatchlist(): void {
    this.isLoading = true;
    
    this.watchlistService.getWatchlist().subscribe(
      (movies) => {
        this.watchlist = movies;
        this.sortWatchlist();
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading watchlist:', error);
        this.isLoading = false;
      }
    );
  }
  
  sortWatchlist(): void {
    this.watchlistService.sortWatchlist(this.sortType);
  }
  
  onSortChange(): void {
    this.sortWatchlist();
  }
  
  removeFromWatchlist(movie: Movie): void {
    this.watchlistService.removeFromWatchlist(movie.id);
    
    this.snackBar.open(`Removed "${movie.title}" from your watchlist`, 'Undo', {
      duration: 3000
    }).onAction().subscribe(() => {
      // Add the movie back if the user clicks "Undo"
      this.watchlistService.addToWatchlist(movie);
    });
  }
  
  markAsWatched(movie: Movie): void {
    this.watchlistService.markAsWatched(movie);
    
    this.snackBar.open(`Marked "${movie.title}" as watched`, 'View History', {
      duration: 3000
    }).onAction().subscribe(() => {
      // Navigate to history
      // this.router.navigate(['/watchlist/history']);
    });
  }
  
  exportWatchlist(): void {
    this.watchlistService.exportWatchlist();
  }
  
  getPosterUrl(movie: Movie): string {
    return movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : 'assets/images/no-poster.jpg';
  }
} 