import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TvShowService } from '../../core/services/tv-show.service';
import { TvShow } from '../../core/models/tv-show.model';

@Component({
  selector: 'app-tv-show-details',
  template: `
    <div class="tv-show-details-container" *ngIf="tvShow; else loadingTemplate">
      <div class="tv-show-header">
        <div class="poster-container">
          <img [src]="getPosterUrl(tvShow)" [alt]="tvShow.name" class="poster">
        </div>
        <div class="tv-show-info">
          <h1 class="title">{{ tvShow.name }}</h1>
          <div class="meta-info">
            <span class="first-air-date">{{ tvShow.first_air_date | date:'longDate' }}</span>
            <span class="episode-runtime">{{ tvShow.episode_run_time[0] }} min</span>
            <span class="rating">
              <mat-icon>star</mat-icon>
              {{ tvShow.vote_average | number:'1.1-1' }}
            </span>
          </div>
          <div class="genres">
            <mat-chip *ngFor="let genre of tvShow.genres">
              {{ genre.name }}
            </mat-chip>
          </div>
          <p class="overview">{{ tvShow.overview }}</p>
          <div class="seasons-info">
            <p>Number of Seasons: {{ tvShow.number_of_seasons }}</p>
            <p>Number of Episodes: {{ tvShow.number_of_episodes }}</p>
          </div>
        </div>
      </div>

      <div class="tv-show-content">
        <section class="cast-section">
          <h2>Cast</h2>
          <div class="cast-grid">
            <div class="cast-member" *ngFor="let member of cast">
              <img [src]="getProfileUrl(member)" [alt]="member.name" class="profile">
              <div class="cast-info">
                <span class="name">{{ member.name }}</span>
                <span class="character">{{ member.character }}</span>
              </div>
            </div>
          </div>
        </section>

        <section class="seasons-section">
          <h2>Seasons</h2>
          <div class="seasons-grid">
            <mat-card class="season-card" *ngFor="let season of tvShow.seasons">
              <img [src]="getSeasonPosterUrl(season)" [alt]="season.name" class="season-poster">
              <mat-card-content>
                <h3>{{ season.name }}</h3>
                <p>Episodes: {{ season.episode_count }}</p>
                <p>{{ season.air_date | date:'yyyy' }}</p>
              </mat-card-content>
            </mat-card>
          </div>
        </section>

        <section class="trailers-section">
          <h2>Trailers</h2>
          <div class="trailers-grid">
            <div class="trailer" *ngFor="let trailer of trailers">
              <iframe
                [src]="getSafeUrl(trailer.key)"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen>
              </iframe>
            </div>
          </div>
        </section>

        <section class="similar-section">
          <h2>Similar TV Shows</h2>
          <div class="similar-grid">
            <mat-card class="similar-show" *ngFor="let similar of similarShows">
              <img [src]="getPosterUrl(similar)" [alt]="similar.name" class="poster">
              <mat-card-content>
                <h3>{{ similar.name }}</h3>
                <div class="rating">
                  <mat-icon>star</mat-icon>
                  {{ similar.vote_average | number:'1.1-1' }}
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </section>
      </div>
    </div>

    <ng-template #loadingTemplate>
      <div class="loading-container">
        <app-loading-spinner></app-loading-spinner>
      </div>
    </ng-template>
  `,
  styles: [`
    .tv-show-details-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }
    .tv-show-header {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 2rem;
      margin-bottom: 3rem;
    }
    .poster-container {
      position: relative;
      padding-top: 150%;
    }
    .poster {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 8px;
    }
    .tv-show-info {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .title {
      font-size: 2.5rem;
      margin: 0;
    }
    .meta-info {
      display: flex;
      gap: 1rem;
      color: #666;
    }
    .rating {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      color: #f5c518;
    }
    .genres {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .overview {
      font-size: 1.1rem;
      line-height: 1.6;
      color: #333;
    }
    .seasons-info {
      margin-top: 1rem;
      color: #666;
    }
    .cast-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }
    .cast-member {
      text-align: center;
    }
    .profile {
      width: 100%;
      aspect-ratio: 2/3;
      object-fit: cover;
      border-radius: 8px;
    }
    .cast-info {
      margin-top: 0.5rem;
    }
    .name {
      font-weight: 500;
      display: block;
    }
    .character {
      color: #666;
      font-size: 0.9rem;
    }
    .seasons-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }
    .season-card {
      cursor: pointer;
      transition: transform 0.2s;
      &:hover {
        transform: translateY(-5px);
      }
    }
    .season-poster {
      width: 100%;
      aspect-ratio: 2/3;
      object-fit: cover;
      border-radius: 4px;
    }
    .trailers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }
    .trailer {
      position: relative;
      padding-top: 56.25%;
    }
    .trailer iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: 8px;
    }
    .similar-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }
    .similar-show {
      cursor: pointer;
      transition: transform 0.2s;
      &:hover {
        transform: translateY(-5px);
      }
    }
    .loading-container {
      min-height: 500px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  `]
})
export class TvShowDetailsComponent implements OnInit {
  tvShow: TvShow | null = null;
  cast: any[] = [];
  trailers: any[] = [];
  similarShows: TvShow[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private tvShowService: TvShowService
  ) {}

  ngOnInit(): void {
    const tvShowId = this.route.snapshot.paramMap.get('id');
    if (tvShowId) {
      this.loadTvShowDetails(Number(tvShowId));
    }
  }

  private loadTvShowDetails(tvShowId: number): void {
    this.loading = true;
    this.tvShowService.getTvShowDetails(tvShowId).subscribe({
      next: (tvShow) => {
        this.tvShow = tvShow;
        this.loadCast(tvShowId);
        this.loadTrailers(tvShowId);
        this.loadSimilarShows(tvShowId);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading TV show details:', error);
        this.loading = false;
      }
    });
  }

  private loadCast(tvShowId: number): void {
    this.tvShowService.getTvShowCast(tvShowId).subscribe({
      next: (cast) => {
        this.cast = cast.cast.slice(0, 10);
      },
      error: (error) => {
        console.error('Error loading cast:', error);
      }
    });
  }

  private loadTrailers(tvShowId: number): void {
    this.tvShowService.getTvShowTrailers(tvShowId).subscribe({
      next: (videos) => {
        this.trailers = videos.results.filter(video => video.type === 'Trailer');
      },
      error: (error) => {
        console.error('Error loading trailers:', error);
      }
    });
  }

  private loadSimilarShows(tvShowId: number): void {
    this.tvShowService.getSimilarTvShows(tvShowId).subscribe({
      next: (shows) => {
        this.similarShows = shows.results.slice(0, 6);
      },
      error: (error) => {
        console.error('Error loading similar shows:', error);
      }
    });
  }

  getPosterUrl(tvShow: TvShow): string {
    return tvShow.poster_path
      ? `https://image.tmdb.org/t/p/w500${tvShow.poster_path}`
      : 'assets/images/no-poster.jpg';
  }

  getSeasonPosterUrl(season: any): string {
    return season.poster_path
      ? `https://image.tmdb.org/t/p/w500${season.poster_path}`
      : 'assets/images/no-poster.jpg';
  }

  getProfileUrl(castMember: any): string {
    return castMember.profile_path
      ? `https://image.tmdb.org/t/p/w185${castMember.profile_path}`
      : 'assets/images/no-profile.jpg';
  }

  getSafeUrl(key: string): string {
    return `https://www.youtube.com/embed/${key}`;
  }
} 