import { Component, OnInit } from '@angular/core';
import { MovieService } from '../../core/services/movie.service';
import { Movie } from '../../core/models/movie.model';
import { Router } from '@angular/router';

// Define interfaces for the actor type
interface Actor {
  id: number;
  name: string;
  profile_path: string;
  known_for: Movie[];
  known_for_department: string;
}

@Component({
  selector: 'app-home',
  template: `
    <div class="home-container">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <h1>Discover Your Next Favorite</h1>
          <p>Track, rate, and discover movies and TV shows</p>
          <div class="hero-actions">
            <button mat-raised-button color="primary" (click)="navigateTo('/browse')">
              Browse Movies
            </button>
            <button mat-raised-button color="accent" (click)="navigateTo('/tv')">
              Browse TV Shows
            </button>
          </div>
        </div>
      </section>

      <!-- Trending Movies Section -->
      <section class="content-section">
        <h2>Trending Movies</h2>
        <div class="movie-grid" *ngIf="trendingMovies.length; else loading">
          <mat-card class="movie-card" *ngFor="let movie of trendingMovies" (click)="navigateToMovieDetails(movie.id)">
            <img [src]="getPosterUrl(movie)" [alt]="movie.title" class="movie-poster">
            <mat-card-content>
              <h3 class="movie-title">{{ movie.title }}</h3>
              <div class="movie-info">
                <span class="rating">
                  <mat-icon>star</mat-icon>
                  {{ movie.vote_average | number:'1.1-1' }}
                </span>
                <span class="year">{{ movie.release_date | date:'yyyy' }}</span>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </section>

      <!-- Upcoming Releases Section -->
      <section class="content-section">
        <h2>Coming Soon</h2>
        <div class="movie-grid" *ngIf="upcomingMovies.length; else loading">
          <mat-card class="movie-card" *ngFor="let movie of upcomingMovies" (click)="navigateToMovieDetails(movie.id)">
            <img [src]="getPosterUrl(movie)" [alt]="movie.title" class="movie-poster">
            <mat-card-content>
              <h3 class="movie-title">{{ movie.title }}</h3>
              <div class="movie-info">
                <span class="release-date">
                  {{ movie.release_date | date:'mediumDate' }}
                </span>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </section>

      <!-- Popular Actors Section -->
      <section class="content-section">
        <h2>Popular Actors</h2>
        <div class="actor-grid" *ngIf="popularActors.length; else loading">
          <mat-card class="actor-card" *ngFor="let actor of popularActors">
            <img [src]="getProfileUrl(actor)" [alt]="actor.name" class="actor-photo">
            <mat-card-content>
              <h3 class="actor-name">{{ actor.name }}</h3>
              <p class="known-for">Known for: {{ actor.known_for_department }}</p>
            </mat-card-content>
          </mat-card>
        </div>
      </section>
    </div>

    <ng-template #loading>
      <div class="loading-container">
        <mat-spinner></mat-spinner>
      </div>
    </ng-template>
  `,
  styles: [`
    .home-container {
      min-height: 100vh;
    }

    .hero-section {
      height: 60vh;
      background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)),
                  url('https://image.tmdb.org/t/p/original/h8gHn0OzBoaefsYseUByqsmEDMY.jpg') center/cover;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      color: white;
      margin-bottom: 3rem;
    }

    .hero-content {
      max-width: 800px;
      padding: 2rem;
    }

    .hero-content h1 {
      font-size: 3.5rem;
      margin-bottom: 1rem;
    }

    .hero-content p {
      font-size: 1.5rem;
      margin-bottom: 2rem;
    }

    .hero-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }

    .content-section {
      max-width: 1200px;
      margin: 0 auto 3rem;
      padding: 0 1rem;
    }

    .content-section h2 {
      font-size: 2rem;
      margin-bottom: 1.5rem;
    }

    .movie-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1.5rem;
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
      aspect-ratio: 2/3;
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

    .rating {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      color: #f5c518;
    }

    .actor-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 1.5rem;
    }

    .actor-card {
      text-align: center;
    }

    .actor-photo {
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
      border-radius: 50%;
    }

    .actor-name {
      font-size: 1rem;
      margin: 0.5rem 0;
    }

    .known-for {
      font-size: 0.9rem;
      color: #666;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 2rem;
    }

    @media (max-width: 768px) {
      .hero-content h1 {
        font-size: 2.5rem;
      }
      
      .hero-content p {
        font-size: 1.2rem;
      }
      
      .hero-actions {
        flex-direction: column;
        align-items: center;
      }
      
      .hero-actions button {
        width: 100%;
        margin-bottom: 0.5rem;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  trendingMovies: Movie[] = [];
  upcomingMovies: Movie[] = [];
  popularActors: Actor[] = [];

  constructor(
    private movieService: MovieService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTrendingMovies();
    this.loadUpcomingMovies();
    this.loadPopularActors();
  }

  navigateToMovieDetails(movieId: number): void {
    this.router.navigate(['/movie', movieId]);
  }
  
  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  private loadTrendingMovies(): void {
    this.movieService.getTrendingMovies().subscribe({
      next: (movies: { results: Movie[] }) => {
        this.trendingMovies = movies.results.slice(0, 6);
      },
      error: (error: any) => {
        console.error('Error loading trending movies:', error);
      }
    });
  }

  private loadUpcomingMovies(): void {
    this.movieService.getUpcomingMovies().subscribe({
      next: (movies: { results: Movie[] }) => {
        this.upcomingMovies = movies.results.slice(0, 6);
      },
      error: (error: any) => {
        console.error('Error loading upcoming movies:', error);
      }
    });
  }

  private loadPopularActors(): void {
    this.movieService.getPopularActors().subscribe({
      next: (actors: { results: Actor[] }) => {
        this.popularActors = actors.results.slice(0, 6);
      },
      error: (error: any) => {
        console.error('Error loading popular actors:', error);
      }
    });
  }

  getPosterUrl(movie: Movie): string {
    return movie.poster_path 
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
      : 'https://via.placeholder.com/300x450?text=No+Image+Available';
  }

  getProfileUrl(actor: Actor): string {
    return actor.profile_path 
      ? `https://image.tmdb.org/t/p/w500${actor.profile_path}` 
      : 'https://via.placeholder.com/300x300?text=No+Image';
  }
} 