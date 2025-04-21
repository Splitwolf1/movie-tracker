import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FilterService, FilterOptions, FilterResponse } from '../../core/services/filter.service';
import { Movie } from '../../core/models/movie.model';

@Component({
  selector: 'app-filtered-movies',
  template: `
    <div class="filtered-movies-container">
      <h1 class="page-title">Browse Movies</h1>
      
      <div class="filter-section">
        <app-filter 
          [contentType]="'movie'" 
          (filterChange)="onFilterChange($event)">
        </app-filter>
      </div>

      <div class="pagination-controls">
        <div class="items-per-page">
          <span>Show</span>
          <mat-button-toggle-group [value]="itemsPerPage" (change)="changeItemsPerPage($event.value)">
            <mat-button-toggle [value]="20">20</mat-button-toggle>
            <mat-button-toggle [value]="50">50</mat-button-toggle>
            <mat-button-toggle [value]="100">100</mat-button-toggle>
          </mat-button-toggle-group>
          <span>per page</span>
        </div>
        <div class="page-info">
          Showing {{ startItem }} - {{ endItem }} of {{ totalResults }} movies
        </div>
      </div>

      <div class="movies-grid" *ngIf="!loading; else loadingTemplate">
        <mat-card class="movie-card" *ngFor="let movie of movies" (click)="navigateToMovieDetails(movie.id)">
          <img [src]="getPosterUrl(movie)" [alt]="movie.title" class="poster">
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

      <ng-template #loadingTemplate>
        <div class="loading-container">
          <mat-spinner></mat-spinner>
        </div>
      </ng-template>

      <div class="no-results" *ngIf="!loading && !movies.length">
        <p>No movies found matching your filters.</p>
      </div>

      <mat-paginator
        *ngIf="totalResults > 0"
        [length]="totalResults"
        [pageSize]="itemsPerPage"
        [pageSizeOptions]="[20, 50, 100]"
        [pageIndex]="currentPage - 1"
        (page)="onPageChange($event)"
        showFirstLastButtons>
      </mat-paginator>
    </div>
  `,
  styles: [`
    .filtered-movies-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }
    .page-title {
      font-size: 2.5rem;
      margin-bottom: 1.5rem;
      color: #333;
      text-align: center;
    }
    .filter-section {
      margin-bottom: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    .pagination-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .items-per-page {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .movies-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
      margin-top: 2rem;
      margin-bottom: 2rem;
    }
    .movie-card {
      cursor: pointer;
      transition: transform 0.2s;
      &:hover {
        transform: translateY(-5px);
      }
    }
    .poster {
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
    .rating {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      color: #f5c518;
    }
    .loading-container {
      min-height: 300px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .no-results {
      text-align: center;
      padding: 2rem;
      color: #666;
    }
    mat-paginator {
      background: transparent;
    }
    
    @media (max-width: 768px) {
      .pagination-controls {
        flex-direction: column;
        align-items: flex-start;
      }
      .items-per-page {
        margin-bottom: 1rem;
      }
    }
  `]
})
export class FilteredMoviesComponent implements OnInit {
  movies: Movie[] = [];
  loading = false;
  
  currentPage = 1;
  itemsPerPage = 20;
  totalResults = 0;
  currentFilters?: FilterOptions;
  
  get startItem(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }
  
  get endItem(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalResults);
  }

  constructor(
    private filterService: FilterService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMovies();
  }

  onFilterChange(options: FilterOptions): void {
    this.currentFilters = options;
    this.currentPage = 1; // Reset to first page on filter change
    this.loadMovies(options);
  }

  navigateToMovieDetails(movieId: number): void {
    this.router.navigate(['/movie', movieId]);
  }
  
  onPageChange(event: any): void {
    this.currentPage = event.pageIndex + 1;
    this.itemsPerPage = event.pageSize;
    this.loadMovies(this.currentFilters);
  }
  
  changeItemsPerPage(value: number): void {
    this.itemsPerPage = value;
    this.loadMovies(this.currentFilters);
  }

  private loadMovies(options?: FilterOptions): void {
    this.loading = true;
    const defaultOptions: FilterOptions = {
      genres: [],
      year: null,
      rating: null,
      sortBy: 'popularity',
      sortOrder: 'desc'
    };
    
    this.filterService.getFilteredMovies(options || defaultOptions, this.currentPage, this.itemsPerPage).subscribe({
      next: (response) => {
        this.movies = response.results;
        this.totalResults = response.total_results;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading filtered movies:', error);
        this.loading = false;
      }
    });
  }

  getPosterUrl(movie: Movie): string {
    return movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : 'assets/images/no-poster.jpg';
  }
} 