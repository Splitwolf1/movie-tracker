import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Movie } from '../models/movie.model';
import { environment } from '../../../environments/environment';

export interface TvShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  backdrop_path?: string;
  first_air_date: string;
  vote_average: number;
  popularity: number;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
}

export interface FilterOptions {
  genres: number[];
  year: number | null;
  rating: number | null;
  sortBy: 'popularity' | 'vote_average' | 'release_date' | 'first_air_date';
  sortOrder: 'asc' | 'desc';
}

export interface FilterResponse<T> {
  results: T[];
  total_results: number;
  total_pages: number;
  page: number;
}

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  private readonly apiUrl = 'https://api.themoviedb.org/3';
  private readonly apiKey = environment.tmdbApiKey;

  constructor(private http: HttpClient) {}

  getGenres(): Observable<{ genres: { id: number; name: string }[] }> {
    return this.http.get<{ genres: { id: number; name: string }[] }>(
      `${this.apiUrl}/genre/movie/list`,
      {
        params: {
          api_key: this.apiKey,
          language: 'en-US'
        }
      }
    );
  }

  getTvGenres(): Observable<{ genres: { id: number; name: string }[] }> {
    return this.http.get<{ genres: { id: number; name: string }[] }>(
      `${this.apiUrl}/genre/tv/list`,
      {
        params: {
          api_key: this.apiKey,
          language: 'en-US'
        }
      }
    );
  }

  getFilteredMovies(options: FilterOptions, page: number = 1, pageSize: number = 20): Observable<FilterResponse<Movie>> {
    const params: any = {
      api_key: this.apiKey,
      language: 'en-US',
      include_adult: 'false',
      page: page.toString()
    };

    if (options.genres.length) {
      params.with_genres = options.genres.join(',');
    }

    if (options.year) {
      params.primary_release_year = options.year;
    }

    if (options.rating) {
      params['vote_average.gte'] = options.rating;
    }

    if (options.sortBy) {
      params.sort_by = `${options.sortBy}.${options.sortOrder}`;
    }

    return this.http.get<FilterResponse<Movie>>(
      `${this.apiUrl}/discover/movie`,
      { params }
    );
  }

  getFilteredTvShows(options: FilterOptions, page: number = 1, pageSize: number = 20): Observable<FilterResponse<TvShow>> {
    const params: any = {
      api_key: this.apiKey,
      language: 'en-US',
      include_adult: 'false',
      page: page.toString()
    };

    if (options.genres.length) {
      params.with_genres = options.genres.join(',');
    }

    if (options.year) {
      params.first_air_date_year = options.year;
    }

    if (options.rating) {
      params['vote_average.gte'] = options.rating;
    }

    if (options.sortBy) {
      let sortBy = options.sortBy;
      // Map movie sort fields to TV show fields if needed
      if (sortBy === 'release_date') {
        sortBy = 'first_air_date';
      }
      params.sort_by = `${sortBy}.${options.sortOrder}`;
    }

    return this.http.get<FilterResponse<TvShow>>(
      `${this.apiUrl}/discover/tv`,
      { params }
    );
  }
} 