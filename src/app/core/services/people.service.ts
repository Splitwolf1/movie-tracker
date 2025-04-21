import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Person } from '../models/person.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PeopleService {
  private readonly apiUrl = 'https://api.themoviedb.org/3';
  private readonly apiKey = environment.tmdbApiKey;

  constructor(private http: HttpClient) {}

  getPopularPeople(): Observable<{ results: Person[] }> {
    return this.http.get<{ results: Person[] }>(
      `${this.apiUrl}/person/popular`,
      {
        params: {
          api_key: this.apiKey,
          language: 'en-US',
          page: '1'
        }
      }
    );
  }

  getPersonDetails(id: number): Observable<Person> {
    return this.http.get<Person>(
      `${this.apiUrl}/person/${id}`,
      {
        params: {
          api_key: this.apiKey,
          language: 'en-US',
          append_to_response: 'movie_credits'
        }
      }
    );
  }
} 