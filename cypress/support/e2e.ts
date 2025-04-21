// ***********************************************************
// This is a great place to put global configuration and
// behavior that modifies Cypress.
// ***********************************************************
/// <reference types="cypress" />

// Import commands.js using ES2015 syntax:
import './commands';

// Add any Cypress global configurations here
Cypress.on('uncaught:exception', (err) => {
  // returning false here prevents Cypress from failing the test
  console.log('Uncaught exception:', err);
  return false;
}); 