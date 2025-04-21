/// <reference types="cypress" />

// Ensure TypeScript knows Cypress as a global var
declare const cy: Cypress.cy & CyEventEmitter;
declare const Cypress: Cypress.Cypress & CyEventEmitter;

interface CyEventEmitter {
  on: (eventName: string, cb: Function) => void;
} 