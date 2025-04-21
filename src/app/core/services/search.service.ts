import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Movie } from '../models/movie.model';
import { Person } from '../models/person.model';
import { environment } from '../../../environments/environment';

export interface SearchResults {
  movies: Movie[];
  people: Person[];
}

// Interface for TMDB API responses which include media_type
interface TMDBMultiSearchResult {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  profile_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  media_type: string;
  vote_average?: number;
  known_for_department?: string;
  overview?: string;
  backdrop_path?: string | null;
  popularity?: number;
  vote_count?: number;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private readonly apiUrl = 'https://api.themoviedb.org/3';
  private readonly apiKey = environment.tmdbApiKey;

  constructor(private http: HttpClient) {}

  search(query: string): Observable<SearchResults> {
    return this.http.get<{ results: TMDBMultiSearchResult[] }>(
      `${this.apiUrl}/search/multi`,
      {
        params: {
          api_key: this.apiKey,
          language: 'en-US',
          query: query,
          include_adult: 'false'
        }
      }
    ).pipe(
      map(response => {
        const results = response.results || [];
        const movies = results
          .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
          .map(item => this.mapToMovie(item));
        
        const people = results
          .filter(item => item.media_type === 'person')
          .map(item => this.mapToPerson(item));
        
        return { movies, people };
      })
    );
  }

  // Helper method to map TMDB results to our Movie model
  private mapToMovie(item: TMDBMultiSearchResult): Movie {
    return {
      id: item.id,
      title: item.title || item.name || 'Unknown Title',
      poster_path: item.poster_path || '', // Convert null to empty string
      release_date: item.release_date || item.first_air_date || '',
      vote_average: item.vote_average || 0,
      overview: item.overview || '',
      backdrop_path: item.backdrop_path || undefined, // Optional, can be undefined
      genre_ids: [],
      popularity: item.popularity || 0,
      vote_count: item.vote_count || 0
    };
  }

  // Helper method to map TMDB results to our Person model
  private mapToPerson(item: TMDBMultiSearchResult): Person {
    return {
      id: item.id,
      name: item.name || 'Unknown Name',
      profile_path: item.profile_path === undefined ? null : item.profile_path, // Handle undefined case
      known_for_department: item.known_for_department || '',
      popularity: item.popularity || 0
    };
  }

  searchMovies(query: string): Observable<{ results: Movie[] }> {
    return this.http.get<{ results: any[] }>(
      `${this.apiUrl}/search/movie`,
      {
        params: {
          api_key: this.apiKey,
          language: 'en-US',
          query: query,
          include_adult: 'false'
        }
      }
    ).pipe(
      map(response => ({
        results: (response.results || []).map(item => this.mapToMovie({
          ...item,
          media_type: 'movie'
        }))
      }))
    );
  }

  searchPeople(query: string): Observable<{ results: Person[] }> {
    return this.http.get<{ results: any[] }>(
      `${this.apiUrl}/search/person`,
      {
        params: {
          api_key: this.apiKey,
          language: 'en-US',
          query: query,
          include_adult: 'false'
        }
      }
    ).pipe(
      map(response => ({
        results: (response.results || []).map(item => this.mapToPerson({
          ...item,
          media_type: 'person'
        }))
      }))
    );
  }
} 