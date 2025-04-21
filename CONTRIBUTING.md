# Contributing to Movie Tracker

We love your input! We want to make contributing to Movie Tracker as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

### Pull Requests

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Pull Request Process

1. Update the README.md or documentation with details of changes if applicable
2. Update the FEATURES.md or ROADMAP.md if your change adds or completes features
3. The PR should work with existing tests or include new tests if adding functionality
4. PRs require review from at least one maintainer
5. Once approved, your PR will be merged

## Coding Standards

### TypeScript

- Follow [Angular Style Guide](https://angular.dev/style-guide)
- Use TypeScript's strict mode
- Document code with JSDoc comments
- Use meaningful variable and function names
- Maintain the existing code style

```typescript
// Good example
/**
 * Retrieves movies based on the provided filter criteria.
 * @param filter - The filter criteria for movies
 * @returns Observable of filtered movies
 */
getFilteredMovies(filter: MovieFilter): Observable<Movie[]> {
  // Implementation
}
```

### Components

- Prefix all component selectors with `app-`
- Keep components small and focused on a single responsibility
- Use reactive forms over template-driven forms
- Utilize Angular Material components when applicable
- Extract reusable UI elements into shared components

### Services

- Keep services focused on a single responsibility
- Use dependency injection for service dependencies
- Document public methods thoroughly
- Use RxJS for asynchronous operations
- Implement proper error handling

### State Management

- Use NgRx for complex state management
- Use BehaviorSubjects for simpler state management
- Maintain immutable state patterns
- Document state effects and reducers

## Testing

- Write unit tests for services, pipes, and components
- Write integration tests for component interactions
- Write E2E tests for critical user flows
- Aim for high test coverage, especially for core functionality

```typescript
// Example of a good test
describe('WatchlistService', () => {
  it('should add a movie to the watchlist', () => {
    // Test implementation
  });
});
```

## Commit Messages

- Use clear and meaningful commit messages
- Follow the conventional commits format:
  - `feat`: A new feature
  - `fix`: A bug fix
  - `docs`: Documentation only changes
  - `style`: Changes that do not affect the meaning of the code
  - `refactor`: A code change that neither fixes a bug nor adds a feature
  - `test`: Adding missing tests or correcting existing tests
  - `chore`: Changes to the build process or auxiliary tools

Example: `feat: add watchlist sorting functionality`

## Reporting Bugs

Report bugs using GitHub issues.

Bug reports should include:

1. A quick summary and/or background
2. Steps to reproduce
   - Be specific
   - Provide sample code if possible
3. What you expected would happen
4. What actually happens
5. Notes (possibly including why you think this might be happening)

## Feature Requests

Feature requests are welcome. Please provide:

1. Clear description of the feature
2. Rationale for why it should be added
3. Any implementation ideas you have
4. Indicate if you'd like to contribute the implementation yourself

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License.

## References

- [Angular Style Guide](https://angular.dev/style-guide)
- [NgRx Documentation](https://ngrx.io/)
- [RxJS Documentation](https://rxjs.dev/)
- [Angular Material Documentation](https://material.angular.io/) 