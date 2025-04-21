import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TvShow } from '../models/tv-show.model';
import { environment } from '../../../environments/environment';

interface CastResponse {
  cast: Array<{
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
  }>;
}

interface VideoResponse {
  results: Array<{
    id: string;
    key: string;
    name: string;
    type: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class TvShowService {
  private apiUrl = 'https://api.themoviedb.org/3';
  private apiKey = environment.tmdbApiKey;

  constructor(private http: HttpClient) {}

  getTvShowDetails(tvShowId: number): Observable<TvShow> {
    return this.http.get<TvShow>(`${this.apiUrl}/tv/${tvShowId}`, {
      params: { api_key: this.apiKey }
    });
  }

  getTvShowCast(tvShowId: number): Observable<CastResponse> {
    return this.http.get<CastResponse>(`${this.apiUrl}/tv/${tvShowId}/credits`, {
      params: { api_key: this.apiKey }
    });
  }

  getTvShowTrailers(tvShowId: number): Observable<VideoResponse> {
    return this.http.get<VideoResponse>(`${this.apiUrl}/tv/${tvShowId}/videos`, {
      params: { api_key: this.apiKey }
    });
  }

  getSimilarTvShows(tvShowId: number): Observable<{ results: TvShow[] }> {
    return this.http.get<{ results: TvShow[] }>(`${this.apiUrl}/tv/${tvShowId}/similar`, {
      params: { api_key: this.apiKey }
    });
  }
} 