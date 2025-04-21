import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { SearchService } from '../../core/services/search.service';
import { Movie } from '../../core/models/movie.model';
import { Person } from '../../core/models/person.model';
import { Observable } from 'rxjs';
import { of } from 'rxjs';

@Component({
  selector: 'app-search',
  template: `
    <div class="search-container">
      <form [formGroup]="searchForm" class="search-form">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search movies, TV shows, and people</mat-label>
          <input
            matInput
            formControlName="query"
            placeholder="Enter search term..."
            autocomplete="off"
          >
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <div class="search-filters">
          <mat-button-toggle-group formControlName="type" aria-label="Search Type">
            <mat-button-toggle value="all">All</mat-button-toggle>
            <mat-button-toggle value="movies">Movies</mat-button-toggle>
            <mat-button-toggle value="people">People</mat-button-toggle>
          </mat-button-toggle-group>
        </div>
      </form>

      <div class="search-results" *ngIf="searchResults$ | async as results">
        <div class="results-section" *ngIf="results.movies.length">
          <h2>Movies & TV Shows</h2>
          <div class="results-grid">
            <mat-card class="result-card" *ngFor="let movie of results.movies">
              <img [src]="getPosterUrl(movie)" [alt]="movie.title" class="poster">
              <mat-card-content>
                <h3>{{ movie.title }}</h3>
                <p>{{ movie.release_date | date:'yyyy' }}</p>
              </mat-card-content>
            </mat-card>
          </div>
        </div>

        <div class="results-section" *ngIf="results.people.length">
          <h2>People</h2>
          <div class="results-grid">
            <mat-card class="result-card" *ngFor="let person of results.people">
              <img [src]="getProfileUrl(person)" [alt]="person.name" class="profile">
              <mat-card-content>
                <h3>{{ person.name }}</h3>
                <p>{{ person.known_for_department }}</p>
              </mat-card-content>
            </mat-card>
          </div>
        </div>

        <div class="no-results" *ngIf="!results.movies.length && !results.people.length">
          <p>No results found for "{{ searchForm.get('query')?.value }}"</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .search-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
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
    .results-section {
      margin-bottom: 2rem;
      h2 {
        font-size: 1.5rem;
        margin-bottom: 1rem;
        color: #333;
      }
    }
    .results-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
    }
    .result-card {
      cursor: pointer;
      transition: transform 0.2s;
      &:hover {
        transform: translateY(-5px);
      }
    }
    .poster, .profile {
      width: 100%;
      height: 300px;
      object-fit: cover;
    }
    .no-results {
      text-align: center;
      padding: 2rem;
      color: #666;
    }
  `]
})
export class SearchComponent implements OnInit {
  searchForm: FormGroup;
  searchResults$: Observable<{ movies: Movie[]; people: Person[] }>;

  constructor(
    private fb: FormBuilder,
    private searchService: SearchService
  ) {
    this.searchForm = this.fb.group({
      query: [''],
      type: ['all']
    });
  }

  ngOnInit(): void {
    this.searchResults$ = this.searchForm.get('query')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query) {
          return of({ movies: [], people: [] });
        }
        return this.searchService.search(query);
      })
    );
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