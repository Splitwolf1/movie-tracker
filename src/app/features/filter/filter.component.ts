import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FilterService, FilterOptions } from '../../core/services/filter.service';

@Component({
  selector: 'app-filter',
  template: `
    <form [formGroup]="filterForm" class="filter-form">
      <div class="filter-section">
        <h3>Genres</h3>
        <mat-chip-listbox>
          <mat-chip-option
            *ngFor="let genre of genres"
            [selected]="isGenreSelected(genre.id)"
            (click)="toggleGenre(genre.id)"
          >
            {{ genre.name }}
          </mat-chip-option>
        </mat-chip-listbox>
      </div>

      <div class="filter-section">
        <h3>Year</h3>
        <mat-form-field appearance="outline">
          <mat-label>Release Year</mat-label>
          <mat-select formControlName="year">
            <mat-option [value]="null">Any Year</mat-option>
            <mat-option *ngFor="let year of years" [value]="year">
              {{ year }}
            </mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div class="filter-section">
        <h3>Rating</h3>
        <mat-slider>
          <input
            matSliderThumb
            formControlName="rating"
            min="0"
            max="10"
            step="0.5"
            aria-labelledby="rating-slider"
          >
        </mat-slider>
        <div class="rating-label">{{ formatRating(filterForm.get('rating')?.value) }}</div>
      </div>

      <div class="filter-section">
        <h3>Sort By</h3>
        <mat-form-field appearance="outline">
          <mat-label>Sort By</mat-label>
          <mat-select formControlName="sortBy">
            <mat-option value="popularity">Popularity</mat-option>
            <mat-option value="vote_average">Rating</mat-option>
            <mat-option value="release_date">Release Date</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Order</mat-label>
          <mat-select formControlName="sortOrder">
            <mat-option value="desc">Descending</mat-option>
            <mat-option value="asc">Ascending</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
      
      <div class="filter-actions">
        <button mat-raised-button color="primary" (click)="applyFilters()">
          Apply Filters
        </button>
        <button mat-button (click)="resetFilters()">
          Reset
        </button>
      </div>
    </form>
  `,
  styles: [`
    .filter-form {
      padding: 1rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .filter-section {
      margin-bottom: 1.5rem;
      h3 {
        margin-bottom: 0.5rem;
        color: #333;
      }
    }
    mat-chip-listbox {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    mat-form-field {
      width: 100%;
      margin-bottom: 1rem;
    }
    mat-slider {
      width: 100%;
    }
    .rating-label {
      text-align: center;
      margin-top: 8px;
      color: #555;
    }
    .filter-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 1rem;
    }
  `]
})
export class FilterComponent implements OnInit {
  @Input() contentType: 'movie' | 'tv' = 'movie';
  @Output() filterChange = new EventEmitter<FilterOptions>();
  
  filterForm: FormGroup;
  genres: { id: number; name: string }[] = [];
  years: number[] = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);

  constructor(
    private fb: FormBuilder,
    private filterService: FilterService
  ) {
    this.filterForm = this.fb.group({
      genres: [[]],
      year: [null],
      rating: [0],
      sortBy: ['popularity'],
      sortOrder: ['desc']
    });
  }

  ngOnInit(): void {
    this.loadGenres();
  }
  
  ngOnChanges(): void {
    this.loadGenres();
  }

  private loadGenres(): void {
    if (this.contentType === 'tv') {
      this.filterService.getTvGenres().subscribe({
        next: (response) => {
          this.genres = response.genres;
        },
        error: (error) => {
          console.error('Error loading TV genres:', error);
        }
      });
    } else {
      this.filterService.getGenres().subscribe({
        next: (response) => {
          this.genres = response.genres;
        },
        error: (error) => {
          console.error('Error loading movie genres:', error);
        }
      });
    }
  }

  applyFilters(): void {
    this.filterChange.emit(this.filterForm.value);
  }
  
  resetFilters(): void {
    this.filterForm.reset({
      genres: [],
      year: null,
      rating: 0,
      sortBy: 'popularity',
      sortOrder: 'desc'
    });
    this.applyFilters();
  }

  isGenreSelected(genreId: number): boolean {
    return this.filterForm.get('genres')?.value.includes(genreId);
  }

  toggleGenre(genreId: number): void {
    const genres = this.filterForm.get('genres')?.value || [];
    const index = genres.indexOf(genreId);
    
    if (index === -1) {
      genres.push(genreId);
    } else {
      genres.splice(index, 1);
    }
    
    this.filterForm.patchValue({ genres });
  }

  formatRating(value: number): string {
    return value === 0 ? 'Any Rating' : `${value}+`;
  }
} 