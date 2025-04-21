# Movie Tracker

Movie Tracker is a comprehensive web application built with Angular 18 that allows users to discover, track, and share their movie and TV show watching experiences. With a feature-rich interface, social capabilities, and powerful admin tools, Movie Tracker offers a complete entertainment tracking solution.

![Movie Tracker Screenshot](screenshot.png)

## Features

- **Comprehensive Movie & TV Show Database**: Browse trending, upcoming, and popular content
- **Personalized Watchlist**: Add, sort, export, and share your watchlist
- **User Reviews & Ratings**: Share your thoughts and ratings on movies
- **Social Features**: Friend system, activity feeds, and content sharing
- **Offline Support**: Full functionality even without internet connection
- **Custom Lists**: Create and manage themed lists of movies
- **Achievement System**: Earn badges for your watching activities
- **Admin Dashboard**: Powerful tools for content moderation and user management
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/movie-tracker.git
   cd movie-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment:
   - Create a `.env` file based on `.env.example`
   - Add your TMDB API key (Get one at [themoviedb.org](https://www.themoviedb.org/documentation/api))

4. Start the development server:
   ```bash
   npm start
   ```

5. Start the mock API server:
   ```bash
   npm run server
   ```

6. Start the auth server:
   ```bash
   npm run auth-server
   ```

7. Visit [http://localhost:4200](http://localhost:4200) in your browser

## Architecture

The application is built with a modular architecture following Angular best practices:

```
src/
├── app/
│   ├── core/            # Core services, models, and guards
│   ├── features/        # Feature modules (home, search, details, etc.)
│   ├── shared/          # Shared components, pipes, and directives
│   └── testing/         # Testing utilities
├── assets/              # Static assets
└── environments/        # Environment configurations
```

### Key Technologies

- **Angular 18**: Core framework
- **RxJS**: Reactive programming
- **NgRx**: State management
- **Angular Material**: UI components
- **Jest**: Unit testing
- **Cypress**: E2E testing

## Testing

### Unit Tests

Run unit tests with Jest:

```bash
npm test
```

For test coverage report:

```bash
npm run test:coverage
```

Watch mode for development:

```bash
npm run test:watch
```

### End-to-End Tests

Run Cypress tests:

```bash
npm run e2e
```

Headless mode:

```bash
npm run e2e:headless
```

## Building for Production

Create a production build:

```bash
npm run build
```

Analyze bundle:

```bash
npm run build:stats
```

## Server-side Rendering

The application supports Angular SSR:

```bash
npm run serve:ssr:movie-tracker
```

## Documentation

For detailed documentation, see:

- [Features Documentation](FEATURES.md): Detailed feature descriptions
- [Development Roadmap](ROADMAP.md): Project development plan
- [Contributing Guide](CONTRIBUTING.md): Guidelines for contributors

## Security

The application implements several security measures:

- **CSRF Protection**: Token-based protection for sensitive operations
- **Rate Limiting**: API request throttling to prevent abuse
- **Input Validation**: Comprehensive validation for all user inputs

## Performance Optimizations

- **Lazy Loading**: All feature modules are lazy-loaded
- **Code Splitting**: Conditional component loading
- **Image Optimization**: Responsive images with automatic size optimization

## API Integration

Movie Tracker integrates with:

- **TMDB API**: For movie and TV show data
- **JSON Server**: For development mocking
- **Custom Auth Server**: For authentication

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [The Movie Database (TMDB)](https://www.themoviedb.org/) for their excellent API
- [Angular Team](https://angular.io/) for the framework
- [Material Design](https://material.io/) for design guidelines
