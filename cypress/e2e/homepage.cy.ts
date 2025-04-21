/// <reference types="cypress" />
// Test the homepage

describe('Homepage', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display the home page with trending movies', () => {
    cy.get('h2').contains('Trending Movies');
    cy.get('app-movie-card').should('exist');
  });

  it('should have a working navigation', () => {
    cy.get('mat-toolbar').should('exist');
    cy.get('button').contains('Movies').should('exist');
  });

  it('should display search functionality', () => {
    cy.get('input[placeholder*="Search"]').should('exist');
  });
}); 