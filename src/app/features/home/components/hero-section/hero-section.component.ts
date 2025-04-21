import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MovieService } from '../../../../core/services/movie.service';
import { Movie } from '../../../../core/models/movie.model';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-hero-section',
  template: `
    <div class="hero-container" *ngIf="featuredMovie$ | async as movie">
      <div class="hero-backdrop" [style.background-image]="'url(' + getBackdropUrl(movie) + ')'">
        <div class="hero-content">
          <h1 class="hero-title">{{ movie.title }}</h1>
          <p class="hero-overview">{{ movie.overview }}</p>
          <div class="hero-actions">
            <button mat-raised-button color="primary" class="browse-button" (click)="navigateTo('/browse')">
              <mat-icon>movie</mat-icon>
              Browse Movies
            </button>
            <button mat-raised-button color="accent" class="browse-button" (click)="navigateTo('/tv')">
              <mat-icon>tv</mat-icon>
              Browse TV Shows
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hero-container {
      position: relative;
      height: 80vh;
      overflow: hidden;
    }
    .hero-backdrop {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: center;
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%);
      }
    }
    .hero-content {
      position: relative;
      max-width: 600px;
      padding: 2rem;
      color: white;
      z-index: 1;
    }
    .hero-title {
      font-size: 3rem;
      margin-bottom: 1rem;
      font-weight: bold;
    }
    .hero-overview {
      font-size: 1.2rem;
      margin-bottom: 2rem;
      line-height: 1.5;
    }
    .hero-actions {
      display: flex;
      gap: 1rem;
    }
    .browse-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1.5rem;
      font-size: 1.1rem;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .hero-content {
        max-width: 100%;
        text-align: center;
        padding: 1rem;
      }
      .hero-title {
        font-size: 2rem;
      }
      .hero-overview {
        font-size: 1rem;
      }
      .hero-actions {
        justify-content: center;
        flex-direction: column;
      }
    }
  `]
})
export class HeroSectionComponent implements OnInit {
  featuredMovie$: Observable<Movie> = of({} as Movie);

  constructor(
    private movieService: MovieService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFeaturedMovie();
  }

  loadFeaturedMovie(): void {
    this.featuredMovie$ = this.movieService.getTrendingMovies().pipe(
      map(movies => movies.results[0]),
      catchError(error => {
        console.error('Error loading featured movie:', error);
        return of({} as Movie);
      })
    );
  }

  getBackdropUrl(movie: Movie): string {
    return movie.backdrop_path 
      ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
      : 'assets/images/default-backdrop.jpg';
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
} 