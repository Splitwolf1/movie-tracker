import { Component, Input } from '@angular/core';
import { Movie } from '../../../../core/models/movie.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-trending-section',
  template: `
    <section class="trending-section">
      <h2 class="section-title">Trending This Week</h2>
      
      <div class="movies-grid" *ngIf="!loading; else loadingTemplate">
        <mat-card class="movie-card" *ngFor="let movie of movies" (click)="navigateToMovieDetails(movie.id)">
          <img [src]="getPosterUrl(movie)" [alt]="movie.title" class="movie-poster">
          <mat-card-content>
            <h3 class="movie-title">{{ movie.title }}</h3>
            <div class="movie-info">
              <span class="rating">
                <mat-icon>star</mat-icon>
                {{ movie.vote_average | number:'1.1-1' }}
              </span>
              <span class="votes">
                <mat-icon>people</mat-icon>
                {{ movie.vote_count | number }}
              </span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <ng-template #loadingTemplate>
        <div class="loading-container">
          <app-loading-spinner></app-loading-spinner>
        </div>
      </ng-template>
    </section>
  `,
  styles: [`
    .trending-section {
      margin: 2rem 0;
    }
    .section-title {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: #333;
    }
    .movies-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
    }
    .movie-card {
      cursor: pointer;
      transition: transform 0.2s;
      &:hover {
        transform: translateY(-5px);
      }
    }
    .movie-poster {
      width: 100%;
      height: 300px;
      object-fit: cover;
    }
    .movie-title {
      font-size: 1rem;
      margin: 0.5rem 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .movie-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.9rem;
      color: #666;
    }
    .rating, .votes {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    .rating {
      color: #f5c518;
    }
    .votes {
      color: #2196f3;
    }
    .loading-container {
      min-height: 300px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  `]
})
export class TrendingSectionComponent {
  @Input() movies: Movie[] = [];
  @Input() loading: boolean = false;

  constructor(private router: Router) {}

  navigateToMovieDetails(movieId: number): void {
    this.router.navigate(['/movie', movieId]);
  }

  getPosterUrl(movie: Movie): string {
    return movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : 'assets/images/no-poster.jpg';
  }
} 