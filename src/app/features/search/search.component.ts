import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { SearchService } from '../../core/services/search.service';
import { Movie } from '../../core/models/movie.model';
import { Person } from '../../core/models/person.model';

@Component({
  selector: 'app-search',
  template: `
    <div class="search-container">
      <div class="search-header">
        <h1>Search</h1>
        <p>Find movies, TV shows, and people</p>
      </div>

      <form [formGroup]="searchForm" class="search-form">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search movies, TV shows, and people</mat-label>
          <input
            matInput
            formControlName="query"
            placeholder="Enter search term..."
            autocomplete="off"
            (keyup.enter)="performSearch()"
          >
          <button mat-icon-button matSuffix (click)="performSearch()">
            <mat-icon>search</mat-icon>
          </button>
        </mat-form-field>

        <div class="search-filters">
          <mat-button-toggle-group formControlName="type" aria-label="Search Type">
            <mat-button-toggle value="all">All</mat-button-toggle>
            <mat-button-toggle value="movies">Movies</mat-button-toggle>
            <mat-button-toggle value="people">People</mat-button-toggle>
          </mat-button-toggle-group>
        </div>
      </form>

      <ng-container *ngIf="isLoading">
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      </ng-container>

      <ng-container *ngIf="!isLoading">
        <div class="search-results" *ngIf="searchResults$ | async as results">
          <div class="results-section" *ngIf="results.movies.length">
            <h2>Movies & TV Shows</h2>
            <div class="results-grid">
              <mat-card class="result-card" *ngFor="let movie of results.movies" [routerLink]="['/details', 'movie', movie.id]">
                <img [src]="getPosterUrl(movie)" [alt]="movie.title" class="poster">
                <mat-card-content>
                  <h3>{{ movie.title }}</h3>
                  <p>{{ movie.release_date | date:'yyyy' }}</p>
                  <div class="rating" *ngIf="movie.vote_average">
                    <mat-icon>star</mat-icon>
                    <span>{{ movie.vote_average | number:'1.1-1' }}</span>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </div>

          <div class="results-section" *ngIf="results.people.length">
            <h2>People</h2>
            <div class="results-grid">
              <mat-card class="result-card" *ngFor="let person of results.people" [routerLink]="['/person', person.id]">
                <img [src]="getProfileUrl(person)" [alt]="person.name" class="profile">
                <mat-card-content>
                  <h3>{{ person.name }}</h3>
                  <p>{{ person.known_for_department }}</p>
                </mat-card-content>
              </mat-card>
            </div>
          </div>

          <div class="no-results" *ngIf="(!results.movies.length && !results.people.length) && searchPerformed">
            <mat-icon>search_off</mat-icon>
            <p>No results found for "{{ searchForm.get('query')?.value }}"</p>
            <p>Try different keywords or check spelling</p>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .search-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }
    .search-header {
      text-align: center;
      margin-bottom: 2rem;
      h1 {
        font-size: 2.5rem;
        margin-bottom: 0.5rem;
        color: #3f51b5;
      }
      p {
        font-size: 1.2rem;
        color: #666;
      }
    }
    .search-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .search-field {
      width: 100%;
    }
    .search-filters {
      display: flex;
      justify-content: center;
    }
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 2rem;
    }
    .results-section {
      margin-bottom: 2rem;
      h2 {
        font-size: 1.5rem;
        margin-bottom: 1rem;
        color: #333;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid #3f51b5;
      }
    }
    .results-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
    }
    .result-card {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
      }
    }
    .poster, .profile {
      width: 100%;
      height: 300px;
      object-fit: cover;
    }
    .rating {
      display: flex;
      align-items: center;
      color: #f5c518;
      mat-icon {
        font-size: 18px;
        height: 18px;
        width: 18px;
        margin-right: 4px;
      }
    }
    .no-results {
      text-align: center;
      padding: 3rem 1rem;
      color: #666;
      mat-icon {
        font-size: 48px;
        height: 48px;
        width: 48px;
        margin-bottom: 1rem;
        color: #999;
      }
      p {
        margin-bottom: 0.5rem;
        &:first-of-type {
          font-size: 1.2rem;
          font-weight: 500;
        }
      }
    }
    @media (max-width: 768px) {
      .results-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      }
      .poster, .profile {
        height: 225px;
      }
    }
  `]
})
export class SearchComponent implements OnInit {
  searchForm: FormGroup;
  searchResults$: Observable<{ movies: Movie[]; people: Person[] }> = of({ movies: [], people: [] });
  isLoading = false;
  searchPerformed = false;

  constructor(
    private fb: FormBuilder,
    private searchService: SearchService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.searchForm = this.fb.group({
      query: [''],
      type: ['all']
    });
  }

  ngOnInit(): void {
    // Check if there's a query parameter from the URL
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.searchForm.get('query')?.setValue(params['q']);
        this.performSearch();
      }
    });

    // Set up the reactive form handling
    this.searchForm.get('query')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      if (this.searchForm.get('query')?.value) {
        this.updateQueryParams();
      }
    });

    this.searchForm.get('type')?.valueChanges.subscribe(() => {
      if (this.searchForm.get('query')?.value) {
        this.performSearch();
      }
    });
  }

  performSearch(): void {
    const query = this.searchForm.get('query')?.value?.trim();
    if (!query) {
      return;
    }

    this.searchPerformed = true;
    this.isLoading = true;
    this.updateQueryParams();
    
    this.searchResults$ = this.searchService.search(query).pipe(
      switchMap(results => {
        this.isLoading = false;
        // Filter results based on selected type
        const type = this.searchForm.get('type')?.value;
        if (type === 'movies') {
          return of({ movies: results.movies, people: [] });
        } else if (type === 'people') {
          return of({ movies: [], people: results.people });
        }
        return of(results);
      })
    );
  }

  updateQueryParams(): void {
    const query = this.searchForm.get('query')?.value?.trim();
    if (query) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { q: query },
        queryParamsHandling: 'merge'
      });
    }
  }

  getPosterUrl(movie: Movie): string {
    return movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : 'assets/images/no-poster.jpg';
  }

  getProfileUrl(person: Person): string {
    return person.profile_path
      ? `https://image.tmdb.org/t/p/w500${person.profile_path}`
      : 'assets/images/no-profile.jpg';
  }
} 