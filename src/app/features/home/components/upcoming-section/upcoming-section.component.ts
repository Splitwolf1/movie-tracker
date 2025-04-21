import { Component, Input } from '@angular/core';
import { Movie } from '../../../../core/models/movie.model';

@Component({
  selector: 'app-upcoming-section',
  template: `
    <section class="upcoming-section">
      <h2 class="section-title">Coming Soon</h2>
      
      <div class="movies-grid" *ngIf="!loading; else loadingTemplate">
        <mat-card class="movie-card" *ngFor="let movie of movies">
          <img [src]="getPosterUrl(movie)" [alt]="movie.title" class="movie-poster">
          <mat-card-content>
            <h3 class="movie-title">{{ movie.title }}</h3>
            <div class="movie-info">
              <span class="release-date">
                <mat-icon>event</mat-icon>
                {{ movie.release_date | date:'MMM d, yyyy' }}
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
    .upcoming-section {
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
    .release-date {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    .loading-container {
      min-height: 300px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  `]
})
export class UpcomingSectionComponent {
  @Input() movies: Movie[] = [];
  @Input() loading: boolean = false;

  getPosterUrl(movie: Movie): string {
    return movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : 'assets/images/no-poster.jpg';
  }
} 