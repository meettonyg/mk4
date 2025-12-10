/**
 * E2E Tests for AI Generators
 *
 * Tests both builder (integrated) and standalone (public) modes.
 *
 * @package GMKB
 * @subpackage Tests/E2E
 */

describe('AI Generators - Builder Integration', () => {
  beforeEach(() => {
    // Login to WordPress admin
    cy.visit('/wp-login.php');
    cy.get('#user_login').type(Cypress.env('wpUser'));
    cy.get('#user_pass').type(Cypress.env('wpPass'));
    cy.get('#wp-submit').click();

    // Navigate to Media Kit Builder
    cy.visit('/wp-admin/edit.php?post_type=gmkb_media_kit');
  });

  describe('Biography Generator', () => {
    it('opens AI modal from Biography editor', () => {
      // Open a media kit for editing
      cy.get('.gmkb-edit-link').first().click();

      // Wait for builder to load
      cy.get('.gmkb-builder', { timeout: 10000 }).should('be.visible');

      // Click on biography component
      cy.get('[data-component-type="biography"]').first().click();

      // Click Generate with AI button
      cy.get('.ai-generate-btn').contains('Generate with AI').click();

      // Modal should open
      cy.get('.gmkb-ai-modal').should('be.visible');
      cy.get('.gmkb-ai-modal__title').should('contain', 'Biography');
    });

    it('generates biography content', () => {
      // Setup - open modal
      cy.get('.gmkb-edit-link').first().click();
      cy.get('.gmkb-builder', { timeout: 10000 }).should('be.visible');
      cy.get('[data-component-type="biography"]').first().click();
      cy.get('.ai-generate-btn').click();

      // Fill in authority hook
      cy.get('[data-cy="authority-who"]').type('busy entrepreneurs');
      cy.get('[data-cy="authority-what"]').type('scale their businesses');

      // Select tone
      cy.get('[data-cy="tone-professional"]').click();

      // Generate
      cy.get('[data-cy="generate-button"]').click();

      // Wait for generation
      cy.get('.gmkb-ai-results', { timeout: 30000 }).should('be.visible');

      // Results should have content
      cy.get('.gmkb-ai-results__content').should('not.be.empty');
    });

    it('applies generated content to component', () => {
      // Setup and generate
      cy.get('.gmkb-edit-link').first().click();
      cy.get('.gmkb-builder', { timeout: 10000 }).should('be.visible');
      cy.get('[data-component-type="biography"]').first().click();
      cy.get('.ai-generate-btn').click();

      cy.get('[data-cy="authority-who"]').type('entrepreneurs');
      cy.get('[data-cy="generate-button"]').click();
      cy.get('.gmkb-ai-results', { timeout: 30000 }).should('be.visible');

      // Click Apply
      cy.get('[data-cy="apply-button"]').click();

      // Modal should close
      cy.get('.gmkb-ai-modal').should('not.exist');

      // Biography field should have content
      cy.get('#bio-text').should('not.have.value', '');
    });
  });

  describe('Topics Generator', () => {
    it('generates topics list', () => {
      cy.get('.gmkb-edit-link').first().click();
      cy.get('.gmkb-builder', { timeout: 10000 }).should('be.visible');
      cy.get('[data-component-type="topics"]').first().click();
      cy.get('.ai-generate-btn').click();

      // Fill expertise
      cy.get('[data-cy="expertise-input"]').type('Digital Marketing and Growth Strategy');

      // Generate
      cy.get('[data-cy="generate-button"]').click();

      // Wait for topics
      cy.get('.gmkb-ai-results', { timeout: 30000 }).should('be.visible');

      // Should have multiple topics
      cy.get('.gmkb-ai-topic-item').should('have.length.at.least', 3);
    });
  });

  describe('Questions Generator', () => {
    it('generates interview questions', () => {
      cy.get('.gmkb-edit-link').first().click();
      cy.get('.gmkb-builder', { timeout: 10000 }).should('be.visible');
      cy.get('[data-component-type="questions"]').first().click();
      cy.get('.ai-generate-btn').click();

      // Generate with default settings
      cy.get('[data-cy="generate-button"]').click();

      // Wait for questions
      cy.get('.gmkb-ai-results', { timeout: 30000 }).should('be.visible');

      // Should have questions
      cy.get('.gmkb-ai-question-item').should('have.length.at.least', 5);
    });
  });
});

describe('AI Generators - Standalone (Public)', () => {
  beforeEach(() => {
    // Visit page with AI tool shortcode
    cy.visit('/free-tools/biography-generator/');
  });

  describe('Biography Tool', () => {
    it('loads standalone biography generator', () => {
      // Widget should be visible
      cy.get('.gmkb-standalone-scope').should('be.visible');
      cy.get('.gmkb-ai-widget').should('be.visible');
    });

    it('generates biography in standalone mode', () => {
      // Fill in fields
      cy.get('[data-cy="name-input"]').type('John Smith');
      cy.get('[data-cy="expertise-input"]').type('Marketing Consultant');

      // Generate
      cy.get('[data-cy="generate-button"]').click();

      // Wait for results
      cy.get('.gmkb-ai-results', { timeout: 30000 }).should('be.visible');

      // Results should have content
      cy.get('.gmkb-ai-results__content').should('not.be.empty');
    });

    it('shows copy to clipboard button in standalone mode', () => {
      // Generate first
      cy.get('[data-cy="name-input"]').type('Jane Doe');
      cy.get('[data-cy="generate-button"]').click();
      cy.get('.gmkb-ai-results', { timeout: 30000 }).should('be.visible');

      // Copy button should be visible
      cy.get('[data-cy="copy-button"]').should('be.visible');
    });

    it('shows lead gen CTA in standalone mode', () => {
      // Generate first
      cy.get('[data-cy="name-input"]').type('Test User');
      cy.get('[data-cy="generate-button"]').click();
      cy.get('.gmkb-ai-results', { timeout: 30000 }).should('be.visible');

      // CTA should be visible
      cy.get('.gmkb-ai-cta').should('be.visible');
      cy.get('.gmkb-ai-cta').should('contain', 'unlimited');
    });

    it('displays usage meter', () => {
      // Generate to get usage info
      cy.get('[data-cy="name-input"]').type('Test');
      cy.get('[data-cy="generate-button"]').click();
      cy.get('.gmkb-ai-results', { timeout: 30000 }).should('be.visible');

      // Usage meter should show
      cy.get('.gmkb-ai-usage').should('be.visible');
      cy.get('.gmkb-ai-usage').should('contain', 'remaining');
    });
  });

  describe('Rate Limiting', () => {
    it('shows rate limit message after exceeding limit', () => {
      // This test may need to be run in isolation or with mocked backend
      // to properly test rate limiting without actually hitting limits

      // Generate multiple times
      for (let i = 0; i < 4; i++) {
        cy.get('[data-cy="name-input"]').clear().type(`Test ${i}`);
        cy.get('[data-cy="generate-button"]').click();
        cy.wait(2000);
      }

      // Should show rate limit error
      cy.get('.gmkb-ai-error').should('contain', 'limit');
    });
  });
});

describe('AI Generators - Error Handling', () => {
  it('shows error message on API failure', () => {
    // Intercept API call and force error
    cy.intercept('POST', '**/ai/generate', {
      statusCode: 500,
      body: { message: 'Internal server error' }
    }).as('apiError');

    cy.visit('/free-tools/biography-generator/');

    cy.get('[data-cy="name-input"]').type('Test');
    cy.get('[data-cy="generate-button"]').click();

    cy.wait('@apiError');

    // Error should be displayed
    cy.get('.gmkb-ai-error').should('be.visible');
    cy.get('.gmkb-ai-error').should('contain', 'error');
  });

  it('shows retry button on error', () => {
    cy.intercept('POST', '**/ai/generate', {
      statusCode: 500,
      body: { message: 'Error' }
    }).as('apiError');

    cy.visit('/free-tools/biography-generator/');

    cy.get('[data-cy="name-input"]').type('Test');
    cy.get('[data-cy="generate-button"]').click();

    cy.wait('@apiError');

    // Retry button should be visible
    cy.get('[data-cy="retry-button"]').should('be.visible');
  });
});

describe('AI Generators - Validation', () => {
  it('requires name/authority hook for biography', () => {
    cy.visit('/free-tools/biography-generator/');

    // Try to generate without filling fields
    cy.get('[data-cy="generate-button"]').click();

    // Should show validation error
    cy.get('.gmkb-ai-error').should('contain', 'required');
  });

  it('validates form before submission', () => {
    cy.visit('/free-tools/biography-generator/');

    // Generate button should be disabled when form is empty
    cy.get('[data-cy="generate-button"]').should('have.attr', 'disabled');

    // Fill in required field
    cy.get('[data-cy="name-input"]').type('John');

    // Button should be enabled
    cy.get('[data-cy="generate-button"]').should('not.have.attr', 'disabled');
  });
});

describe('AI Generators - Accessibility', () => {
  beforeEach(() => {
    cy.visit('/free-tools/biography-generator/');
  });

  it('has proper focus management', () => {
    // Tab through form elements
    cy.get('body').tab();
    cy.focused().should('have.attr', 'data-cy');
  });

  it('has accessible button labels', () => {
    cy.get('[data-cy="generate-button"]').should('have.attr', 'aria-label').or('contain.text', 'Generate');
  });

  it('announces loading state to screen readers', () => {
    cy.get('[data-cy="name-input"]').type('Test');
    cy.get('[data-cy="generate-button"]').click();

    // Loading indicator should have aria-live
    cy.get('.gmkb-ai-loading').should('have.attr', 'aria-live', 'polite');
  });
});
