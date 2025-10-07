/**
 * Cypress E2E Support File
 * Custom commands and global configuration
 */

// Import commands
import './commands';

// Global before hook
before(() => {
  cy.log('Starting E2E test suite');
});

// Global after hook
after(() => {
  cy.log('E2E test suite completed');
});

// Prevent uncaught exceptions from failing tests
Cypress.on('uncaught:exception', (err, runnable) => {
  // Returning false here prevents Cypress from failing the test
  // Only for expected WordPress/Plugin errors
  if (err.message.includes('ResizeObserver')) {
    return false;
  }
  return true;
});

// Configure viewport for all tests
Cypress.Commands.add('setViewport', (device = 'desktop') => {
  const viewports = {
    mobile: [375, 667],
    tablet: [768, 1024],
    desktop: [1280, 720],
    wide: [1920, 1080]
  };
  
  const [width, height] = viewports[device] || viewports.desktop;
  cy.viewport(width, height);
});

// Add custom assertions
chai.Assertion.addMethod('haveClass', function(className) {
  const obj = this._obj;
  new chai.Assertion(obj).to.have.class(className);
});
