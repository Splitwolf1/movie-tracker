import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { WatchlistService } from './watchlist.service';
import { MovieService } from './movie.service';
import { SocialService } from './social.service';
import { Movie } from '../models/movie.model';
import { PrivacyLevel } from '../models/social.model';

describe('WatchlistService', () => {
  let service: WatchlistService;
  let movieServiceSpy: jasmine.SpyObj<MovieService>;
  let socialServiceSpy: jasmine.SpyObj<SocialService>;

  const mockMovies: Movie[] = [
    {
      id: 1,
      title: 'Test Movie 1',
      overview: 'Test overview 1',
      poster_path: '/test1.jpg',
      release_date: '2021-01-01',
      vote_average: 8.5,
      vote_count: 1000,
      popularity: 100,
      genre_ids: [1, 2]
    },
    {
      id: 2,
      title: 'Test Movie 2',
      overview: 'Test overview 2',
      poster_path: '/test2.jpg',
      release_date: '2022-02-02',
      vote_average: 7.5,
      vote_count: 800,
      popularity: 90,
      genre_ids: [2, 3]
    }
  ];

  beforeEach(() => {
    const movieSpy = jest.fn();
    const socialSpy = jest.fn();

    TestBed.configureTestingModule({
      providers: [
        WatchlistService,
        { provide: MovieService, useValue: { 
          getWatchlist: jest.fn().mockReturnValue(of(mockMovies)),
          addToWatchlist: jest.fn().mockImplementation((movie) => of([...mockMovies, movie])),
          removeFromWatchlist: jest.fn().mockImplementation((movieId) => of(mockMovies.filter(m => m.id !== movieId))),
          addToWatchHistory: jest.fn().mockReturnValue(of({}))
        } },
        { provide: SocialService, useValue: { 
          shareContent: jest.fn().mockReturnValue(of({})),
          getSharedContent: jest.fn().mockReturnValue(of([]))
        } }
      ]
    });

    service = TestBed.inject(WatchlistService);
    movieServiceSpy = TestBed.inject(MovieService) as jasmine.SpyObj<MovieService>;
    socialServiceSpy = TestBed.inject(SocialService) as jasmine.SpyObj<SocialService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load watchlist on initialization', () => {
    expect(movieServiceSpy.getWatchlist).toHaveBeenCalled();
  });

  it('should return the current watchlist', (done) => {
    service.getWatchlist().subscribe(watchlist => {
      expect(watchlist).toEqual(mockMovies);
      done();
    });
  });

  it('should add a movie to the watchlist', () => {
    const newMovie: Movie = {
      id: 3,
      title: 'Test Movie 3',
      overview: 'Test overview 3',
      poster_path: '/test3.jpg',
      release_date: '2023-03-03',
      vote_average: 9.0,
      vote_count: 1200,
      popularity: 110,
      genre_ids: [1, 3]
    };

    service.addToWatchlist(newMovie);
    expect(movieServiceSpy.addToWatchlist).toHaveBeenCalledWith(newMovie);
  });

  it('should remove a movie from the watchlist', () => {
    service.removeFromWatchlist(1);
    expect(movieServiceSpy.removeFromWatchlist).toHaveBeenCalledWith(1);
  });

  it('should check if a movie is in the watchlist', (done) => {
    service.isInWatchlist(1).subscribe(isInWatchlist => {
      expect(isInWatchlist).toBeTruthy();
      done();
    });
  });

  it('should return the count of movies in the watchlist', (done) => {
    service.getWatchlistCount().subscribe(count => {
      expect(count).toBe(2);
      done();
    });
  });

  it('should mark a movie as watched', () => {
    service.markAsWatched(mockMovies[0], 8);
    expect(movieServiceSpy.addToWatchHistory).toHaveBeenCalledWith(mockMovies[0], 8);
  });

  it('should sort the watchlist by title', (done) => {
    service.sortWatchlist('title');
    service.getWatchlist().subscribe(watchlist => {
      expect(watchlist[0].title).toBe('Test Movie 1');
      expect(watchlist[1].title).toBe('Test Movie 2');
      done();
    });
  });

  it('should sort the watchlist by release date', (done) => {
    service.sortWatchlist('releaseDate');
    service.getWatchlist().subscribe(watchlist => {
      expect(watchlist[0].release_date).toBe('2022-02-02');
      expect(watchlist[1].release_date).toBe('2021-01-01');
      done();
    });
  });

  it('should sort the watchlist by popularity', (done) => {
    service.sortWatchlist('popularity');
    service.getWatchlist().subscribe(watchlist => {
      expect(watchlist[0].popularity).toBe(100);
      expect(watchlist[1].popularity).toBe(90);
      done();
    });
  });

  // Test with localStorage mock
  it('should export the watchlist', () => {
    // Mock document.createElement and click function
    const mockLinkElement = {
      setAttribute: jest.fn(),
      click: jest.fn()
    };
    
    jest.spyOn(document, 'createElement').mockImplementation(() => mockLinkElement as unknown as HTMLElement);
    
    service.exportWatchlist();
    
    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(mockLinkElement.setAttribute).toHaveBeenCalledTimes(2);
    expect(mockLinkElement.click).toHaveBeenCalled();
  });
}); 