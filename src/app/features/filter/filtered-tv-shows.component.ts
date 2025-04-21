import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import { FilterService, FilterOptions, FilterResponse, TvShow } from '../../core/services/filter.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-filtered-tv-shows',
  template: `
    <div class="filtered-tv-container">
      <h1 class="page-title">Browse TV Shows</h1>
      
      <div class="filter-section">
        <app-filter 
          [contentType]="'tv'" 
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
          Showing {{ startItem }} - {{ endItem }} of {{ totalResults }} TV shows
        </div>
      </div>

      <div class="tv-grid" *ngIf="!loading; else loadingTemplate">
        <mat-card class="tv-card" *ngFor="let show of tvShows" (click)="navigateToTvDetails(show.id)">
          <img [src]="getPosterUrl(show)" [alt]="show.name" class="poster">
          <mat-card-content>
            <h3 class="tv-title">{{ show.name }}</h3>
            <div class="tv-info">
              <span class="rating">
                <mat-icon>star</mat-icon>
                {{ show.vote_average | number:'1.1-1' }}
              </span>
              <span class="year">{{ show.first_air_date | date:'yyyy' }}</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <ng-template #loadingTemplate>
        <div class="loading-container">
          <mat-spinner></mat-spinner>
        </div>
      </ng-template>

      <div class="no-results" *ngIf="!loading && !tvShows.length">
        <p>No TV shows found matching your filters.</p>
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
    .filtered-tv-container {
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
    .tv-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
      margin-top: 2rem;
      margin-bottom: 2rem;
    }
    .tv-card {
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
    .tv-title {
      font-size: 1rem;
      margin: 0.5rem 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .tv-info {
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
export class FilteredTvShowsComponent implements OnInit {
  tvShows: TvShow[] = [];
  loading = false;
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 20;
  totalResults = 0;
  
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
    this.loadTvShows();
  }

  onFilterChange(options: FilterOptions): void {
    this.currentPage = 1; // Reset to first page on filter change
    this.loadTvShows(options);
  }

  navigateToTvDetails(showId: number): void {
    this.router.navigate(['/tv', showId]);
  }
  
  onPageChange(event: any): void {
    this.currentPage = event.pageIndex + 1;
    this.itemsPerPage = event.pageSize;
    this.loadTvShows();
  }
  
  changeItemsPerPage(value: number): void {
    this.itemsPerPage = value;
    this.loadTvShows();
  }

  private loadTvShows(options?: FilterOptions): void {
    this.loading = true;
    const defaultOptions: FilterOptions = {
      genres: [],
      year: null,
      rating: null,
      sortBy: 'popularity',
      sortOrder: 'desc'
    };

    this.filterService.getFilteredTvShows(options || defaultOptions, this.currentPage, this.itemsPerPage).subscribe({
      next: (response) => {
        this.tvShows = response.results;
        this.totalResults = response.total_results;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading TV shows:', error);
        this.loading = false;
      }
    });
  }

  getPosterUrl(show: TvShow): string {
    return show.poster_path
      ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
      : 'assets/images/no-poster.jpg';
  }
} 