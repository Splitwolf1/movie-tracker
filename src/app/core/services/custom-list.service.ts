import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, catchError, tap, map, switchMap, forkJoin } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { MovieService } from './movie.service';
import { 
  CustomList, 
  CustomListItem, 
  CreateCustomListRequest, 
  UpdateCustomListRequest,
  CustomListSortOption,
  CustomListFilter
} from '../models/custom-list.model';
import { Movie } from '../models/movie.model';

@Injectable({
  providedIn: 'root'
})
export class CustomListService {
  private baseUrl = environment.apiUrl;
  private customListsSubject = new BehaviorSubject<CustomList[]>([]);
  public customLists$ = this.customListsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private movieService: MovieService
  ) {
    this.loadCustomLists();
  }

  /**
   * Load all custom lists for current user
   */
  loadCustomLists(): void {
    const user = this.authService.getCurrentUser();
    if (!user || !user.id) {
      this.customListsSubject.next([]);
      return;
    }

    this.http.get<CustomList[]>(`${this.baseUrl}/custom-lists?createdBy=${user.id}`)
      .pipe(
        catchError(() => of([]))
      )
      .subscribe(lists => {
        this.customListsSubject.next(lists);
      });
  }

  /**
   * Get all custom lists for current user
   */
  getCustomLists(): Observable<CustomList[]> {
    return this.customLists$;
  }

  /**
   * Get custom lists with optional filtering
   */
  getFilteredCustomLists(filter: CustomListFilter): Observable<CustomList[]> {
    return this.customLists$.pipe(
      map(lists => {
        let filtered = [...lists];

        // Apply search term filter
        if (filter.searchTerm) {
          const term = filter.searchTerm.toLowerCase();
          filtered = filtered.filter(list => 
            list.name.toLowerCase().includes(term) || 
            list.description.toLowerCase().includes(term) ||
            (list.tags && list.tags.some(tag => tag.toLowerCase().includes(term)))
          );
        }

        // Apply public/private filter
        if (filter.isPublic !== undefined) {
          filtered = filtered.filter(list => list.isPublic === filter.isPublic);
        }

        // Apply tag filter
        if (filter.tags && filter.tags.length > 0) {
          filtered = filtered.filter(list => 
            list.tags && filter.tags?.some(tag => list.tags?.includes(tag))
          );
        }

        // Apply sorting
        if (filter.sortBy) {
          switch (filter.sortBy) {
            case CustomListSortOption.NAME:
              filtered.sort((a, b) => a.name.localeCompare(b.name));
              break;
            case CustomListSortOption.ITEM_COUNT:
              filtered.sort((a, b) => b.items.length - a.items.length);
              break;
            case CustomListSortOption.DATE_CREATED:
              filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
              break;
            case CustomListSortOption.DATE_UPDATED:
              filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
              break;
            case CustomListSortOption.RECENT:
            default:
              filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
              break;
          }
        }

        return filtered;
      })
    );
  }

  /**
   * Get public custom lists with optional filtering
   */
  getPublicCustomLists(filter: CustomListFilter = {}): Observable<CustomList[]> {
    return this.http.get<CustomList[]>(`${this.baseUrl}/custom-lists?isPublic=true`).pipe(
      map(lists => {
        let filtered = [...lists];

        // Apply search term filter
        if (filter.searchTerm) {
          const term = filter.searchTerm.toLowerCase();
          filtered = filtered.filter(list => 
            list.name.toLowerCase().includes(term) || 
            list.description.toLowerCase().includes(term) ||
            (list.tags && list.tags.some(tag => tag.toLowerCase().includes(term)))
          );
        }

        // Apply tag filter
        if (filter.tags && filter.tags.length > 0) {
          filtered = filtered.filter(list => 
            list.tags && filter.tags?.some(tag => list.tags?.includes(tag))
          );
        }

        // Apply sorting
        if (filter.sortBy) {
          switch (filter.sortBy) {
            case CustomListSortOption.NAME:
              filtered.sort((a, b) => a.name.localeCompare(b.name));
              break;
            case CustomListSortOption.ITEM_COUNT:
              filtered.sort((a, b) => b.items.length - a.items.length);
              break;
            case CustomListSortOption.DATE_CREATED:
              filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
              break;
            case CustomListSortOption.DATE_UPDATED:
              filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
              break;
            case CustomListSortOption.RECENT:
            default:
              filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
              break;
          }
        }

        return filtered;
      }),
      catchError(() => of([]))
    );
  }

  /**
   * Get a specific custom list by ID
   */
  getCustomList(listId: string): Observable<CustomList | null> {
    return this.http.get<CustomList>(`${this.baseUrl}/custom-lists/${listId}`).pipe(
      switchMap(list => {
        // Load full movie details for each item in the list
        if (list.items && list.items.length > 0) {
          const movieObservables = list.items.map(item => 
            this.movieService.getMovieDetails(item.movieId).pipe(
              map(movie => {
                item.movie = movie;
                return item;
              }),
              catchError(() => of(item)) // Keep the item even if movie details fail
            )
          );
          
          return forkJoin(movieObservables).pipe(
            map(updatedItems => {
              list.items = updatedItems;
              return list;
            })
          );
        }
        return of(list);
      }),
      catchError(() => of(null))
    );
  }

  /**
   * Create a new custom list
   */
  createCustomList(request: CreateCustomListRequest): Observable<CustomList | null> {
    const user = this.authService.getCurrentUser();
    if (!user || !user.id) {
      return of(null);
    }

    const newList: Omit<CustomList, 'id'> = {
      ...request,
      createdBy: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: []
    };

    return this.http.post<CustomList>(`${this.baseUrl}/custom-lists`, newList).pipe(
      tap(list => {
        const currentLists = this.customListsSubject.getValue();
        this.customListsSubject.next([...currentLists, list]);
      }),
      catchError(() => of(null))
    );
  }

  /**
   * Update an existing custom list
   */
  updateCustomList(listId: string, request: UpdateCustomListRequest): Observable<CustomList | null> {
    return this.http.patch<CustomList>(`${this.baseUrl}/custom-lists/${listId}`, {
      ...request,
      updatedAt: new Date()
    }).pipe(
      tap(updatedList => {
        const currentLists = this.customListsSubject.getValue();
        const updatedLists = currentLists.map(list => 
          list.id === listId ? updatedList : list
        );
        this.customListsSubject.next(updatedLists);
      }),
      catchError(() => of(null))
    );
  }

  /**
   * Delete a custom list
   */
  deleteCustomList(listId: string): Observable<boolean> {
    return this.http.delete(`${this.baseUrl}/custom-lists/${listId}`).pipe(
      map(() => {
        const currentLists = this.customListsSubject.getValue();
        const updatedLists = currentLists.filter(list => list.id !== listId);
        this.customListsSubject.next(updatedLists);
        return true;
      }),
      catchError(() => of(false))
    );
  }

  /**
   * Add a movie to a custom list
   */
  addToCustomList(listId: string, movie: Movie, notes?: string): Observable<CustomList | null> {
    return this.getCustomList(listId).pipe(
      switchMap(list => {
        if (!list) {
          return of(null);
        }

        // Check if movie is already in the list
        const existingItem = list.items.find(item => item.movieId === movie.id);
        if (existingItem) {
          return of(list); // Movie already in list
        }

        // Create new list item
        const newItem: CustomListItem = {
          id: crypto.randomUUID(),
          movieId: movie.id,
          movie,
          addedAt: new Date(),
          notes
        };

        // Add item to list
        list.items.push(newItem);
        list.updatedAt = new Date();

        // Update on server
        return this.http.patch<CustomList>(`${this.baseUrl}/custom-lists/${listId}`, {
          items: list.items,
          updatedAt: list.updatedAt
        }).pipe(
          tap(updatedList => {
            const currentLists = this.customListsSubject.getValue();
            const updatedLists = currentLists.map(l => 
              l.id === listId ? updatedList : l
            );
            this.customListsSubject.next(updatedLists);
          }),
          catchError(() => of(null))
        );
      })
    );
  }

  /**
   * Remove a movie from a custom list
   */
  removeFromCustomList(listId: string, movieId: number): Observable<CustomList | null> {
    return this.getCustomList(listId).pipe(
      switchMap(list => {
        if (!list) {
          return of(null);
        }

        // Remove movie from list
        list.items = list.items.filter(item => item.movieId !== movieId);
        list.updatedAt = new Date();

        // Update on server
        return this.http.patch<CustomList>(`${this.baseUrl}/custom-lists/${listId}`, {
          items: list.items,
          updatedAt: list.updatedAt
        }).pipe(
          tap(updatedList => {
            const currentLists = this.customListsSubject.getValue();
            const updatedLists = currentLists.map(l => 
              l.id === listId ? updatedList : l
            );
            this.customListsSubject.next(updatedLists);
          }),
          catchError(() => of(null))
        );
      })
    );
  }

  /**
   * Update notes for a movie in a custom list
   */
  updateMovieNotes(listId: string, movieId: number, notes: string): Observable<CustomList | null> {
    return this.getCustomList(listId).pipe(
      switchMap(list => {
        if (!list) {
          return of(null);
        }

        // Find and update the item
        const itemIndex = list.items.findIndex(item => item.movieId === movieId);
        if (itemIndex === -1) {
          return of(list); // Item not in list
        }

        list.items[itemIndex].notes = notes;
        list.updatedAt = new Date();

        // Update on server
        return this.http.patch<CustomList>(`${this.baseUrl}/custom-lists/${listId}`, {
          items: list.items,
          updatedAt: list.updatedAt
        }).pipe(
          tap(updatedList => {
            const currentLists = this.customListsSubject.getValue();
            const updatedLists = currentLists.map(l => 
              l.id === listId ? updatedList : l
            );
            this.customListsSubject.next(updatedLists);
          }),
          catchError(() => of(null))
        );
      })
    );
  }

  /**
   * Check if a movie is in a custom list
   */
  isInCustomList(listId: string, movieId: number): Observable<boolean> {
    return this.getCustomList(listId).pipe(
      map(list => {
        if (!list) {
          return false;
        }
        return list.items.some(item => item.movieId === movieId);
      })
    );
  }

  /**
   * Get all custom lists that contain a specific movie
   */
  getListsContainingMovie(movieId: number): Observable<CustomList[]> {
    return this.customLists$.pipe(
      map(lists => lists.filter(list => 
        list.items.some(item => item.movieId === movieId)
      ))
    );
  }
} 