// Custom commands for Cypress testing
/// <reference types="cypress" />

// Declare the custom commands for TypeScript
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Login with the given username and password
       */
      login(username: string, password: string): void;
      
      /**
       * Navigate to the user's watchlist page
       */
      navigateToWatchlist(): void;
    }
  }
}

// Implementation of custom commands
Cypress.Commands.add('login', (username: string, password: string) => {
  cy.visit('/login');
  cy.get('input[formControlName="username"]').type(username);
  cy.get('input[formControlName="password"]').type(password);
  cy.get('button[type="submit"]').click();
});

// Additional command: navigate to watchlist
Cypress.Commands.add('navigateToWatchlist', () => {
  cy.get('button').contains('My Watchlist').click();
});

export {}; // Make this a module 