import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Movie } from '../models/movie.model';
import { Person } from '../models/person.model';
import { environment } from '../../../environments/environment';

export interface SearchResults {
  movies: Movie[];
  people: Person[];
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private readonly apiUrl = 'https://api.themoviedb.org/3';
  private readonly apiKey = environment.tmdbApiKey;

  constructor(private http: HttpClient) {}

  search(query: string): Observable<SearchResults> {
    return this.http.get<SearchResults>(
      `${this.apiUrl}/search/multi`,
      {
        params: {
          api_key: this.apiKey,
          language: 'en-US',
          query: query,
          include_adult: 'false'
        }
      }
    );
  }

  searchMovies(query: string): Observable<{ results: Movie[] }> {
    return this.http.get<{ results: Movie[] }>(
      `${this.apiUrl}/search/movie`,
      {
        params: {
          api_key: this.apiKey,
          language: 'en-US',
          query: query,
          include_adult: 'false'
        }
      }
    );
  }

  searchPeople(query: string): Observable<{ results: Person[] }> {
    return this.http.get<{ results: Person[] }>(
      `${this.apiUrl}/search/person`,
      {
        params: {
          api_key: this.apiKey,
          language: 'en-US',
          query: query,
          include_adult: 'false'
        }
      }
    );
  }
} 