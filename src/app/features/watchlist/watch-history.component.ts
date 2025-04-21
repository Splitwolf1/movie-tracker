import { Component, OnInit } from '@angular/core';
import { MovieService } from '../../core/services/movie.service';
import { WatchlistService } from '../../core/services/watchlist.service';
import { Movie } from '../../core/models/movie.model';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MovieRatingDialogComponent } from './movie-rating-dialog/movie-rating-dialog.component';

export interface WatchedMovie extends Movie {
  watchedDate: Date;
  userRating?: number;
}

@Component({
  selector: 'app-watch-history',
  templateUrl: './watch-history.component.html',
  styleUrls: ['./watch-history.component.scss']
})
export class WatchHistoryComponent implements OnInit {
  history: WatchedMovie[] = [];
  sortType = 'watchedDate';
  isLoading = false;
  
  constructor(
    private movieService: MovieService,
    private watchlistService: WatchlistService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit(): void {
    this.loadHistory();
  }
  
  loadHistory(): void {
    this.isLoading = true;
    
    this.movieService.getWatchHistory().subscribe(
      (history) => {
        this.history = history;
        this.sortHistory();
        this.isLoading = false;
      },
      (error: any) => {
        console.error('Error loading watch history:', error);
        this.isLoading = false;
      }
    );
  }
  
  removeFromHistory(movie: WatchedMovie): void {
    this.movieService.removeFromWatchHistory(movie.id).subscribe(
      () => {
        this.history = this.history.filter(m => m.id !== movie.id);
        
        this.snackBar.open(`Removed "${movie.title}" from history`, 'Undo', {
          duration: 3000
        }).onAction().subscribe(() => {
          // Add movie back to history if user clicks "Undo"
          this.movieService.addToWatchHistory(movie, movie.userRating).subscribe(
            (history) => {
              this.history = history;
              this.sortHistory();
            }
          );
        });
      }
    );
  }
  
  addToWatchlist(movie: Movie): void {
    this.watchlistService.addToWatchlist(movie);
    
    this.snackBar.open(`Added "${movie.title}" to your watchlist`, 'View Watchlist', {
      duration: 3000
    }).onAction().subscribe(() => {
      // Navigate to watchlist
      window.location.href = '/watchlist';
    });
  }
  
  openRatingDialog(movie: WatchedMovie): void {
    const dialogRef = this.dialog.open(MovieRatingDialogComponent, {
      width: '400px',
      data: { movie }
    });
    
    dialogRef.afterClosed().subscribe(rating => {
      if (rating) {
        this.updateRating(movie, rating);
      }
    });
  }
  
  private updateRating(movie: WatchedMovie, rating: number): void {
    this.movieService.updateMovieRating(movie.id, rating).subscribe(
      (history) => {
        this.history = history;
        this.sortHistory();
        
        this.snackBar.open(`Rating updated for "${movie.title}"`, '', {
          duration: 2000
        });
      },
      (error: any) => {
        console.error('Error updating movie rating:', error);
      }
    );
  }
  
  sortHistory(): void {
    switch (this.sortType) {
      case 'title':
        this.history.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'rating':
        this.history.sort((a, b) => {
          const ratingA = a.userRating || 0;
          const ratingB = b.userRating || 0;
          return ratingB - ratingA;
        });
        break;
      case 'watchedDate':
      default:
        this.history.sort((a, b) => {
          const dateA = new Date(a.watchedDate).getTime();
          const dateB = new Date(b.watchedDate).getTime();
          return dateB - dateA;
        });
        break;
    }
  }
  
  getPosterUrl(movie: Movie): string {
    return movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : 'assets/images/no-poster.jpg';
  }
} 