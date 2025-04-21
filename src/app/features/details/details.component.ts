import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MovieService } from '../../core/services/movie.service';
import { Movie } from '../../core/models/movie.model';

@Component({
  selector: 'app-details',
  template: `
    <div class="details-container" *ngIf="movie">
      <div class="backdrop" [style.background-image]="'url(' + getBackdropUrl() + ')'">
        <div class="backdrop-overlay">
          <div class="movie-info">
            <img [src]="getPosterUrl()" [alt]="movie.title" class="poster">
            <div class="info-content">
              <h1>{{ movie.title }}</h1>
              <div class="meta-info">
                <span class="release-date">{{ movie.release_date | date:'yyyy' }}</span>
                <span class="runtime">{{ movie.runtime }} min</span>
                <span class="rating">
                  <mat-icon>star</mat-icon>
                  {{ movie.vote_average | number:'1.1-1' }}
                </span>
              </div>
              <div class="genres">
                <mat-chip-set>
                  <mat-chip *ngFor="let genre of movie.genres">{{ genre.name }}</mat-chip>
                </mat-chip-set>
              </div>
              <p class="overview">{{ movie.overview }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="content-container">
        <section class="cast-section" *ngIf="movie?.credits?.cast?.length">
          <h2>Cast</h2>
          <div class="cast-grid">
            <mat-card class="cast-card" *ngFor="let actor of movie?.credits?.cast || []">
              <img [src]="getProfileUrl(actor)" [alt]="actor.name" class="profile">
              <mat-card-content>
                <h3>{{ actor.name }}</h3>
                <p>{{ actor.character }}</p>
              </mat-card-content>
            </mat-card>
          </div>
        </section>

        <section class="videos-section" *ngIf="movie?.videos?.results?.length">
          <h2>Videos</h2>
          <div class="videos-grid">
            <div class="video-card" *ngFor="let video of movie?.videos?.results || []">
              <iframe
                [src]="getVideoUrl(video)"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
              <h3>{{ video.name }}</h3>
            </div>
          </div>
        </section>

        <section class="similar-section" *ngIf="movie?.similar?.results?.length">
          <h2>Similar Movies</h2>
          <div class="similar-grid">
            <mat-card class="similar-card" *ngFor="let similar of movie?.similar?.results || []">
              <img [src]="getPosterUrl(similar)" [alt]="similar.title" class="poster">
              <mat-card-content>
                <h3>{{ similar.title }}</h3>
                <p>{{ similar.release_date | date:'yyyy' }}</p>
              </mat-card-content>
            </mat-card>
          </div>
        </section>
      </div>
    </div>

    <div class="loading-container" *ngIf="loading">
      <app-loading-spinner></app-loading-spinner>
    </div>
  `,
  styles: [`
    .details-container {
      min-height: 100vh;
    }
    .backdrop {
      height: 60vh;
      background-size: cover;
      background-position: center;
      position: relative;
    }
    .backdrop-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 100%);
      display: flex;
      align-items: center;
      padding: 2rem;
    }
    .movie-info {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      gap: 2rem;
      align-items: flex-start;
    }
    .poster {
      width: 300px;
      height: 450px;
      object-fit: cover;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }
    .info-content {
      flex: 1;
      color: white;
    }
    h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }
    .meta-info {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      color: #ccc;
    }
    .rating {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      color: #f5c518;
    }
    .genres {
      margin-bottom: 1rem;
    }
    .overview {
      font-size: 1.1rem;
      line-height: 1.6;
      color: #ccc;
    }
    .content-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    .cast-grid, .similar-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }
    .cast-card, .similar-card {
      cursor: pointer;
      transition: transform 0.2s;
      &:hover {
        transform: translateY(-5px);
      }
    }
    .profile, .poster {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }
    .videos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }
    .video-card {
      iframe {
        width: 100%;
        height: 200px;
        border-radius: 8px;
      }
      h3 {
        margin-top: 0.5rem;
        font-size: 1rem;
      }
    }
    .loading-container {
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  `]
})
export class DetailsComponent implements OnInit {
  movie: Movie | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadMovieDetails(+id);
    }
  }

  private loadMovieDetails(id: number): void {
    this.movieService.getMovieDetails(id).subscribe({
      next: (movie) => {
        this.movie = movie;
        
        // Load credits
        this.movieService.getMovieCast(id).subscribe({
          next: (credits) => {
            if (this.movie) {
              this.movie.credits = credits;
            }
          },
          error: (error) => console.error('Error loading credits:', error)
        });
        
        // Load videos
        this.movieService.getMovieTrailers(id).subscribe({
          next: (videos) => {
            if (this.movie) {
              this.movie.videos = { results: videos.results };
            }
          },
          error: (error) => console.error('Error loading videos:', error)
        });
        
        // Load similar movies
        this.movieService.getSimilarMovies(id).subscribe({
          next: (similar) => {
            if (this.movie) {
              this.movie.similar = { results: similar.results };
            }
          },
          error: (error) => console.error('Error loading similar movies:', error)
        });
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading movie details:', error);
        this.loading = false;
      }
    });
  }

  getPosterUrl(movie?: Movie): string {
    const posterPath = movie?.poster_path || this.movie?.poster_path;
    return posterPath
      ? `https://image.tmdb.org/t/p/w500${posterPath}`
      : 'assets/images/no-poster.jpg';
  }

  getBackdropUrl(): string {
    return this.movie?.backdrop_path
      ? `https://image.tmdb.org/t/p/original${this.movie.backdrop_path}`
      : 'assets/images/no-backdrop.jpg';
  }

  getProfileUrl(actor: any): string {
    return actor.profile_path
      ? `https://image.tmdb.org/t/p/w500${actor.profile_path}`
      : 'assets/images/no-profile.jpg';
  }

  getVideoUrl(video: any): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${video.key}`
    );
  }
} 