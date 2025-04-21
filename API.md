# Movie Tracker API Documentation

This document provides an overview of the APIs used by the Movie Tracker application, including both external APIs (TMDB) and the internal mock API server.

## External APIs

### The Movie Database (TMDB) API

Movie Tracker uses the TMDB API for fetching movie and TV show data. For complete API documentation, visit [TMDB API Documentation](https://developers.themoviedb.org/3/getting-started/introduction).

#### Base URL

```
https://api.themoviedb.org/3
```

#### Authentication

All requests to the TMDB API require an API key:

```
?api_key=your_api_key
```

#### Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/movie/popular` | GET | Get a list of popular movies |
| `/movie/upcoming` | GET | Get a list of upcoming movies |
| `/movie/top_rated` | GET | Get the top rated movies |
| `/movie/{movie_id}` | GET | Get detailed information about a specific movie |
| `/movie/{movie_id}/credits` | GET | Get the cast and crew for a movie |
| `/movie/{movie_id}/videos` | GET | Get the videos for a movie |
| `/movie/{movie_id}/similar` | GET | Get a list of similar movies |
| `/search/movie` | GET | Search for movies |
| `/search/tv` | GET | Search for TV shows |
| `/search/multi` | GET | Search for movies, TV shows, and people |
| `/genre/movie/list` | GET | Get the list of movie genres |
| `/genre/tv/list` | GET | Get the list of TV genres |

## Internal API (JSON Server)

Movie Tracker uses a mock API server powered by JSON Server for user-specific data.

### Base URL

```
http://localhost:3000
```

### Authentication API

#### Base URL

```
http://localhost:3001
```

#### Endpoints

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/auth/register` | POST | Register a new user | `{ username, email, password }` | `{ id, username, email, token }` |
| `/auth/login` | POST | Login a user | `{ email, password }` | `{ id, username, email, token }` |
| `/auth/me` | GET | Get current user | - | `{ id, username, email, roles }` |

### Watchlist API

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/watchlist` | GET | Get user's watchlist | - | `[{ movie objects }]` |
| `/watchlist` | POST | Add movie to watchlist | `{ movie object }` | `{ movie object }` |
| `/watchlist/{id}` | DELETE | Remove movie from watchlist | - | `{}` |

### Watched History API

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/history` | GET | Get user's watch history | - | `[{ movie objects with watchedDate }]` |
| `/history` | POST | Add movie to history | `{ movie object, rating, watchedDate }` | `{ movie object, rating, watchedDate }` |
| `/history/{id}` | DELETE | Remove movie from history | - | `{}` |

### Reviews API

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/reviews` | GET | Get all reviews | - | `[{ review objects }]` |
| `/reviews` | POST | Create a review | `{ movieId, title, content, rating }` | `{ review object }` |
| `/reviews/{id}` | PUT | Update a review | `{ title, content, rating }` | `{ review object }` |
| `/reviews/{id}` | DELETE | Delete a review | - | `{}` |
| `/reviews?movieId={movieId}` | GET | Get reviews for a movie | - | `[{ review objects }]` |

### User API

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/users` | GET | Get all users | - | `[{ user objects }]` |
| `/users/{id}` | GET | Get a user | - | `{ user object }` |
| `/users/{id}` | PUT | Update a user | `{ username, email, etc. }` | `{ user object }` |

### Friends API

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/friends` | GET | Get user's friends | - | `[{ friendship objects }]` |
| `/friends` | POST | Create friendship | `{ userId, friendId }` | `{ friendship object }` |
| `/friends/{id}` | DELETE | Remove friendship | - | `{}` |
| `/friendRequests` | GET | Get friend requests | - | `[{ request objects }]` |
| `/friendRequests` | POST | Send friend request | `{ senderId, receiverId }` | `{ request object }` |
| `/friendRequests/{id}` | PUT | Update request status | `{ status }` | `{ request object }` |

### Custom Lists API

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/lists` | GET | Get user's custom lists | - | `[{ list objects }]` |
| `/lists` | POST | Create custom list | `{ name, description, isPublic }` | `{ list object }` |
| `/lists/{id}` | PUT | Update custom list | `{ name, description, isPublic }` | `{ list object }` |
| `/lists/{id}` | DELETE | Delete custom list | - | `{}` |
| `/lists/{id}/movies` | GET | Get movies in list | - | `[{ movie objects }]` |
| `/lists/{id}/movies` | POST | Add movie to list | `{ movie object }` | `{ movie object }` |
| `/lists/{id}/movies/{movieId}` | DELETE | Remove movie from list | - | `{}` |

## Response Objects

### Movie Object

```json
{
  "id": 123,
  "title": "Sample Movie",
  "overview": "A great movie description",
  "poster_path": "/path/to/poster.jpg",
  "backdrop_path": "/path/to/backdrop.jpg",
  "release_date": "2023-01-01",
  "vote_average": 8.5,
  "vote_count": 1000,
  "popularity": 100,
  "genre_ids": [28, 12, 878],
  "runtime": 120
}
```

### User Object

```json
{
  "id": "user123",
  "username": "moviefan",
  "email": "user@example.com",
  "bio": "I love movies!",
  "avatarUrl": "/path/to/avatar.jpg",
  "roles": ["user"]
}
```

### Review Object

```json
{
  "id": "review123",
  "userId": "user123",
  "movieId": 123,
  "title": "Great Movie!",
  "content": "This movie was amazing...",
  "rating": 4.5,
  "createdAt": "2023-01-15T12:00:00Z",
  "updatedAt": "2023-01-15T12:00:00Z"
}
```

## Authentication

The internal API uses JWT (JSON Web Token) for authentication. After login, include the token in the Authorization header:

```
Authorization: Bearer your_jwt_token
```

## Error Responses

The API returns standard HTTP status codes and JSON error messages:

```json
{
  "error": "Error message",
  "status": 400,
  "details": "Additional details about the error"
}
```

## Rate Limiting

- TMDB API: 40 requests every 10 seconds
- Internal API: 100 requests per minute per IP

## Pagination

For endpoints that return lists, pagination is supported with the following query parameters:

```
?page=1&limit=20
```

## Response Structure

List responses follow this structure:

```json
{
  "results": [...],
  "page": 1,
  "total_pages": 10,
  "total_results": 200
}
``` 