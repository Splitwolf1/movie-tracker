# Movie/TV Show Tracking Platform - Features Documentation

## Core Features

### Homepage (`src/app/features/home/`)
- **Hero Section** (`src/app/features/home/components/hero-section/`)
  - Displays featured content
  - Responsive design with background image
  - Call-to-action buttons

- **Trending Section** (`src/app/features/home/components/trending-section/`)
  - Shows currently trending movies/TV shows
  - Grid layout with movie cards
  - Displays title, rating, and release date

- **Upcoming Section** (`src/app/features/home/components/upcoming-section/`)
  - Lists upcoming releases
  - Release date countdown
  - Movie poster and basic info

- **Popular People Section** (`src/app/features/home/components/popular-people-section/`)
  - Displays popular actors/directors
  - Shows known works
  - Profile images and department info

### Search Functionality (`src/app/features/search/`)
- **Search Component** (`src/app/features/search/search.component.ts`)
  - Real-time search with debouncing
  - Type filters (All, Movies, People)
  - Responsive results grid
  - Loading states and error handling

- **Search Service** (`src/app/core/services/search.service.ts`)
  - Multi-search endpoint
  - Movie-specific search
  - People-specific search
  - API integration with TMDB

### Movie/TV Show Details (`src/app/features/details/`)
- **Details Component** (`src/app/features/details/details.component.ts`)
  - Hero section with backdrop image
  - Movie poster and basic info
  - Meta information (release date, runtime, rating)
  - Genre tags
  - Overview text
  - Cast section with actor cards
  - Videos section with embedded trailers
  - Similar movies section
  - Responsive design
  - Loading states

- **Movie Service** (`src/app/core/services/movie.service.ts`)
  - Movie details endpoint
  - Credits, videos, and similar movies
  - API integration with TMDB

## Core Services (`src/app/core/services/`)
- **Movie Service** (`movie.service.ts`)
  - Trending movies
  - Upcoming releases
  - Popular movies
  - Movie details

- **People Service** (`people.service.ts`)
  - Popular people
  - Person details
  - Known works

- **Search Service** (`search.service.ts`)
  - Multi-search
  - Movie search
  - People search

- **Watchlist Service** (`watchlist.service.ts`)
  - Add/remove movies from watchlist with reactive updates
  - Get observable stream of watchlist items
  - Check if movie is in watchlist with boolean observable
  - Get watchlist count with number observable
  - Mark movies as watched with date tracking
  - Export watchlist to JSON/CSV formats
  - Sort watchlist by different criteria (title, release date, popularity)
  - Reactive state management using RxJS BehaviorSubject
  - Persistence with local storage
  - Integration with authentication service

- **Friend Service** (`friend.service.ts`)
  - Get friends list
  - Send/accept/decline friend requests
  - Get incoming/outgoing requests
  - Remove friends
  - Search for users

- **Offline Service** (`offline.service.ts`)
  - Real-time online/offline status detection and monitoring
  - Data caching with configurable expiration times
  - Sync queue for offline operations with retry mechanism
  - Cache management with automatic cleanup
  - API request fallback with cache
  - Event-based synchronization system
  - Network status visualization in UI
  - Advanced synchronization with conflict resolution
  - Pending operations tracking
  - Cache statistics reporting

- **Auth Service** (`auth.service.ts`)
  - User registration and login
  - JWT token management
  - User role management
  - Admin authentication
  - Role-based access control
  - Profile management
  - Password reset functionality

## Models (`src/app/core/models/`)
- **Movie Model** (`movie.model.ts`)
  - Title, overview, release date
  - Poster path, backdrop path
  - Rating, popularity
  - Genre IDs

- **Person Model** (`person.model.ts`)
  - Name, profile path
  - Known for department
  - Popularity
  - Known works

- **Genre Model** (`genre.model.ts`)
  - Simple structure with id and name
  - Used for categorizing movies and filtering

- **Friend Models** (`friend.model.ts`)
  - Friend request with status
  - Friendship between users
  - Friend profile information

- **Social Models** (`social.model.ts`)
  - Comment structure
  - Content sharing
  - Activity feeds
  - Privacy levels

- **User Model** (`user.model.ts`)
  - User credentials and profile
  - Role-based permissions
  - User preferences
  - Account status
  - Authentication data

## Routing (`src/app/app-routing.module.ts`)
- Home route: `/`
- Search route: `/search`
- Details route: `/details/:id`
- Friends route: `/friends`
- Profile route: `/profile/:id`
- Offline route: `/offline`
- Admin route: `/admin`

## Shared Components (`src/app/shared/`)
- **Loading Spinner** (`components/loading-spinner/`)
  - Reusable loading indicator
  - Customizable size and color

## Environment Configuration
- TMDB API key
- API endpoints
- Image base URLs

## How to Use This Documentation
1. To find a specific feature, use the table of contents above
2. Each feature includes its file location and main functionality
3. For modifications, check the corresponding component/service
4. For new features, follow the established patterns

## Social Features (`src/app/features/social/`)

- **Friend System** (`src/app/features/social/friends/`)
  - Friend list with search and filtering
  - Friend request management
  - Friend profile viewing
  - Add/remove friend functionality
  - Friend request notifications

- **Watchlist Sharing** (`src/app/features/social/watchlist-sharing/`)
  - Share watchlist with friends
  - Public/private options
  - Customizable messages
  - View friends' shared watchlists
  - Add movies from shared watchlists to your own

- **Comments & Activity** (`src/app/features/social/comments/`, `src/app/features/social/activity/`)
  - Comment on shared watchlists
  - Like and reply to comments
  - Activity feed showing friends' actions
  - Filter and view specific activity types
  - Navigate to content from activity items

## Notification System (`src/app/features/notifications/`)

- **Notification Service** (`src/app/core/services/notification.service.ts`)
  - Centralized notification management
  - Different notification types support
  - Create, read, and delete notifications
  - Notification count tracking

- **Notification Components**
  - Notification Bell (`src/app/features/notifications/notification-bell/`)
    - Badge indicating unread notifications
    - Quick access to notifications
  - Notification List (`src/app/features/notifications/notification-list/`)
    - View all notifications
    - Mark as read/unread
    - Navigate to related content
  - Notification Settings (`src/app/features/notifications/notification-settings/`)
    - Customize notification preferences
    - Toggle different notification types
    - External notification options (email, push)

## Offline Mode (`src/app/features/offline/`)
- **Offline Service** (`src/app/core/services/offline.service.ts`)
  - Network status detection and monitoring
  - Caching mechanisms for movies and data
  - Sync queue for pending operations
  - Retry mechanism with configurable attempts
  - Event-based synchronization with observable streams
  - Cache management with configurable expiration
  - Automatic synchronization when coming back online
  - Manual synchronization options
  - Progress reporting through events
  - Error handling and recovery

- **Sync Manager Component** (`src/app/features/offline/sync-manager/`)
  - Visual display of sync status
  - Pending operations counter
  - Last sync time indicator
  - Manual sync trigger button
  - Network status indicator
  - Cache statistics display
  - Cache management options (clear expired, clear all)

- **Offline Status Component** (`src/app/features/offline/offline-status/`)
  - Network status indicator in toolbar
  - Pending operations badge counter
  - Quick access to offline sync manager

## Admin Dashboard (`src/app/features/admin/`)
- **Admin Authentication** (`src/app/core/guards/admin.guard.ts`, `src/app/core/guards/moderator.guard.ts`)
  - Role-based access control
  - Admin-only and moderator routes
  - Authentication guards
  - Specialized admin login

- **Admin Services**
  - Admin Service (`src/app/features/admin/services/admin.service.ts`)
    - User management operations
    - System health monitoring
    - Backup and restore functionality
    - System logs access
  - Analytics Service (`src/app/features/admin/services/analytics.service.ts`)
    - User statistics gathering and analysis
    - Content statistics compilation
    - System performance metrics
    - Chart data generation for visualization
    - Comprehensive report generation in multiple formats (PDF, CSV, JSON)
    - Configurable time range analysis with preset and custom options
    - Top content identification for strategic decision making
  - Content Moderation Service (`src/app/core/services/content-moderation.service.ts`)
    - Automatic content moderation with configurable sensitivity
    - Manual content review for moderators
    - User-generated content reporting system
    - Review and comment approval/rejection workflow
    - Moderation action tracking and history
    - Content flagging based on inappropriate words/phrases
    - Configurable moderation settings with sensitivity levels
    - Role-based access control for moderation features
    - Mock data support for development and testing
    - Reactive programming with RxJS observables
  - Content Management Service (`src/app/core/services/content-management.service.ts`)
    - CRUD operations for all content types (reviews, comments, profiles, custom lists)
    - Content filtering and sorting capabilities with multiple criteria
    - Status tracking with workflow management (draft, pending, published, rejected, archived)
    - Content metadata tracking and analytics
    - Content history tracking with detailed audit trail
    - Approval request system with reviewer comments
    - Role-based permissions for content operations
    - Content statistics for admin dashboard
    - Reactive data streams with RxJS BehaviorSubject
    - Mock API implementation with localStorage persistence
  - User Management Service (`src/app/core/services/user-management.service.ts`)
    - Comprehensive user listing with advanced filtering and sorting
    - User status management (active, suspended, banned, inactive)
    - User role management for access control
    - User activity monitoring and logging
    - User suspension system with reason tracking
    - User statistics and metrics collection
    - Admin action logging for accountability
    - Password reset functionality
    - User deletion with confirmation workflow
    - Role-based permissions for user management operations
    - Mock API implementation with local storage data persistence

- **Admin Dashboard Component** (`src/app/features/admin/components/admin-dashboard/`)
  - Overview of key metrics
  - Quick links to admin features
  - System health status
  - Pending moderation actions
  - User growth statistics

- **Content Moderation Component** (`src/app/features/admin/components/content-moderation/`)
  - Reports review and management
  - Pending content approval interface
  - Moderation action history
  - Filtering and search capabilities
  - Status updates for reports and content
  - User report handling system
  - Tabbed interface for different moderation tasks

- **Content Management Component** (`src/app/features/admin/components/content-management/`)
  - Complete content listing with advanced filtering and sorting
  - Multiple filter criteria (status, type, date range, search)
  - Content status management (publish, reject, archive)
  - Full approval workflow with request processing
  - Detailed content view with metadata display
  - Content metrics visualization
  - Responsive design with Bootstrap components
  - Role-based UI controls and permissions
  - Interactive modal dialogs for content details
  - Clean, modern user interface with consistent styling

- **User Management Component** (`src/app/features/admin/components/user-management/`)
  - Comprehensive user listing with filtering and sorting
  - Advanced search capabilities (username, email, status, roles, dates)
  - User status management (activate, suspend, ban)
  - User role assignment interface with permission controls
  - Recent user activity monitoring
  - Admin action logging and tracking
  - User details view with profile information
  - Password reset functionality
  - User deletion with confirmation
  - Suspension management with reason and duration
  - Activity history timeline
  - Role-based UI controls with permission checks

- **Analytics Component** (`src/app/features/admin/components/analytics/`)
  - Interactive dashboard with key performance indicators
  - Customizable time range selection with presets and custom date ranges
  - User statistics (total, active, new users, growth rate)
  - Content statistics (watched movies, reviews, watchlist items, ratings)
  - System performance metrics (API calls, response time, error rate, server load)
  - Multiple chart visualizations for trend analysis
  - Top content listings (most watched genres, most rated movies)
  - Report generation in multiple formats (PDF, CSV, JSON)
  - Responsive design with mobile optimization
  - Role-based access control with admin-only features

- **System Management Component** (`src/app/features/admin/components/system-management/`)
  - Real-time system health monitoring with visual status indicators
  - Performance metrics tracking (CPU, memory, disk usage, response times)
  - System backup creation and restoration functionality
  - Backup history and management with download capabilities
  - Comprehensive system logs viewer with filtering by log level
  - Log exporting functionality for offline analysis
  - Visual indicators for critical system metrics with color-coded alerts
  - Uptime and error rate monitoring
  - Admin-only access with role-based permissions
  - Responsive design with intuitive dashboard layout

## Current Features
- Movie searching and browsing
- Watchlist management
- User authentication
- Friend system
- Notification system
- Complete offline support with data synchronization
- Achievement system with badges
- Custom lists for organization
- Admin dashboard with role-based access control
- Content moderation with automatic and manual review capabilities
- Content management with CRUD operations and approval workflow
- User management with role-based permissions and activity monitoring
- Analytics dashboard with comprehensive data visualization and reporting

## Notes
- This documentation will be updated as new features are added
- File paths are relative to the project root
- Components follow Angular best practices
- Services use RxJS for reactive programming 
- The application includes mock implementations for development and testing before API integration

# Performance Optimization Features

## Lazy Loading
- All feature modules are lazy loaded to reduce initial bundle size
- Significant reduction in initial load time
- Better user experience with faster time-to-interactive
- Routes are only loaded when needed, improving memory usage

## Code Splitting
- `DeferredLoadingDirective` allows component-level code splitting
- Heavy components are only loaded when they need to be displayed
- Optimized bundle sizes through conditional loading
- Template-based deferred loading for complex UI elements

## Image Optimization
- `OptimizedImageDirective` provides responsive image handling
- Automatic srcset generation for TMDb images
- Resolution-adaptive image loading based on device viewport
- Lazy loading of images with placeholder support
- Error handling for failed image loads
- Significant bandwidth savings through proper image sizing 

# Security Features

## CSRF Protection (`src/app/core/interceptors/csrf.interceptor.ts`, `src/app/core/services/csrf.service.ts`)
- Automatic CSRF token inclusion in all non-GET requests
- Token validation for sensitive operations
- Token refresh mechanisms
- Cookie-based primary storage with localStorage fallback
- Centralized token management through CsrfService
- Exclusion of external API calls from CSRF requirements
- Seamless integration through HTTP interceptor

## Rate Limiting (`src/app/core/interceptors/rate-limit.interceptor.ts`, `src/app/core/services/rate-limit.service.ts`)
- Request throttling to prevent API abuse
- Configurable limits for different endpoints
- Specialized limits for sensitive operations (search, ratings, reviews)
- Time-window based tracking with automatic cleanup
- Automatic request queuing for requests slightly over limit
- Rejection with retry information for severely rate-limited requests
- Client-side prevention of API flooding
- Remaining request count tracking
- Reset capabilities for administrative purposes

## Input Validation (`src/app/core/services/input-validation.service.ts`)
- Comprehensive validation for all user inputs
- Pattern-based validation for common fields (email, username, etc.)
- XSS attack detection and prevention
- SQL injection detection and prevention
- Custom form validators for Angular reactive forms
- Password strength validation with multiple criteria
- Text sanitization capabilities
- Centralized validation service for consistent security checks
- Detailed validation error reporting 

# Testing Infrastructure

## Unit Testing with Jest
- Complete Jest configuration for optimal Angular testing
- Support for component, service, pipe, and directive testing
- Integration with Angular's TestBed for comprehensive coverage
- Mocking utilities for Angular services and components
- 100% TypeScript support with proper typing
- Code coverage reporting with detailed metrics
- Watch mode for development-time testing
- Integration with TestingModule for simplified test setup

## E2E Testing with Cypress
- Complete Cypress setup for end-to-end testing
- Custom commands for common UI interactions
- Page object models for maintainable tests
- Real browser environment testing
- Visual testing capabilities
- Network request stubbing
- CI/CD pipeline integration
- Test reporting and screenshot capture

## Testing Utilities
- Mock service implementations for common app services
- TestingModule with pre-configured imports and providers
- Type definitions for all testing utilities
- Shared test fixtures and test data
- Component harnesses for easier component testing
- Test environment configuration 