/**
 * E2E Test: Media Kit Builder Core Functionality
 * Tests the complete user journey from login to save
 */

describe('Media Kit Builder - Core Functionality', () => {
  
  beforeEach(() => {
    // Login and visit builder
    cy.wpLogin();
    cy.visitBuilder();
    cy.waitForVueReady();
  });
  
  describe('Application Initialization', () => {
    it('should load the Vue application', () => {
      cy.get('#app').should('exist');
      cy.get('.media-kit-builder').should('be.visible');
    });
    
    it('should initialize stores correctly', () => {
      cy.window().then((win) => {
        expect(win.gmkbApp).to.exist;
        expect(win.mediaKitStore).to.exist;
        expect(win.themeStore).to.exist;
      });
    });
    
    it('should load without JavaScript errors', () => {
      cy.window().then((win) => {
        cy.spy(win.console, 'error');
        cy.wrap(win.console.error).should('not.be.called');
      });
    });
    
    it('should display loading screen briefly', () => {
      cy.visit('/wp-admin/post.php?post=1&action=edit');
      cy.get('.loading-screen', { timeout: 1000 }).should('exist');
      cy.get('.media-kit-builder', { timeout: 10000 }).should('be.visible');
    });
  });
  
  describe('Component Library', () => {
    it('should open component library', () => {
      cy.get('[data-test="open-library"]').click();
      cy.get('.component-library').should('be.visible');
    });
    
    it('should display all component categories', () => {
      cy.get('[data-test="open-library"]').click();
      cy.get('.component-category').should('have.length.at.least', 3);
    });
    
    it('should filter components by category', () => {
      cy.get('[data-test="open-library"]').click();
      cy.get('[data-category="essential"]').click();
      cy.get('[data-component-type]').each(($el) => {
        expect($el.attr('data-category')).to.equal('essential');
      });
    });
    
    it('should search for components', () => {
      cy.get('[data-test="open-library"]').click();
      cy.get('[data-test="component-search"]').type('hero');
      cy.get('[data-component-type="hero"]').should('be.visible');
      cy.get('[data-component-type="biography"]').should('not.be.visible');
    });
    
    it('should close component library', () => {
      cy.get('[data-test="open-library"]').click();
      cy.get('.component-library').should('be.visible');
      cy.get('[data-test="close-library"]').click();
      cy.get('.component-library').should('not.exist');
    });
  });
  
  describe('Adding Components', () => {
    beforeEach(() => {
      cy.clearAllComponents();
    });
    
    it('should add a hero component', () => {
      cy.addComponent('hero');
      cy.get('.component-hero').should('exist');
    });
    
    it('should add multiple components', () => {
      cy.addComponent('hero');
      cy.addComponent('biography');
      cy.addComponent('contact');
      
      cy.getComponentCount().should('equal', 3);
    });
    
    it('should auto-generate initial components on empty state', () => {
      cy.get('[data-test="auto-generate"]').click();
      
      // Should add essential components
      cy.get('.component-hero').should('exist');
      cy.get('.component-biography').should('exist');
      cy.get('.component-contact').should('exist');
    });
    
    it('should maintain component order', () => {
      cy.addComponent('hero');
      cy.addComponent('biography');
      cy.addComponent('contact');
      
      cy.get('[data-component-type]').then(($components) => {
        expect($components.eq(0).attr('data-component-type')).to.equal('hero');
        expect($components.eq(1).attr('data-component-type')).to.equal('biography');
        expect($components.eq(2).attr('data-component-type')).to.equal('contact');
      });
    });
  });
  
  describe('Editing Components', () => {
    beforeEach(() => {
      cy.clearAllComponents();
      cy.addComponent('hero');
    });
    
    it('should open design panel on component click', () => {
      cy.get('.component-hero').click();
      cy.get('.design-panel').should('be.visible');
    });
    
    it('should update component title', () => {
      cy.get('.component-hero').click();
      cy.updateField('title', 'John Doe');
      
      cy.get('.component-hero').should('contain', 'John Doe');
    });
    
    it('should update component subtitle', () => {
      cy.get('.component-hero').click();
      cy.updateField('subtitle', 'Professional Speaker');
      
      cy.get('.component-hero').should('contain', 'Professional Speaker');
    });
    
    it('should close design panel', () => {
      cy.get('.component-hero').click();
      cy.get('.design-panel').should('be.visible');
      cy.get('[data-test="close-panel"]').click();
      cy.get('.design-panel').should('not.exist');
    });
    
    it('should switch between design tabs', () => {
      cy.get('.component-hero').click();
      
      cy.get('[data-tab="content"]').click();
      cy.get('.tab-content-content').should('be.visible');
      
      cy.get('[data-tab="design"]').click();
      cy.get('.tab-content-design').should('be.visible');
      
      cy.get('[data-tab="advanced"]').click();
      cy.get('.tab-content-advanced').should('be.visible');
    });
  });
  
  describe('Drag and Drop', () => {
    beforeEach(() => {
      cy.clearAllComponents();
      cy.addComponent('hero');
      cy.addComponent('biography');
      cy.addComponent('contact');
    });
    
    it('should reorder components via drag and drop', () => {
      // Get initial order
      cy.get('[data-component-type]').first().should('have.attr', 'data-component-type', 'hero');
      
      // Drag biography to top
      cy.get('[data-component-type="biography"]')
        .trigger('dragstart');
      
      cy.get('[data-component-type="hero"]')
        .trigger('drop');
      
      // Check new order
      cy.get('[data-component-type]').first().should('have.attr', 'data-component-type', 'biography');
    });
    
    it('should show drop indicator during drag', () => {
      cy.get('[data-component-type="biography"]')
        .trigger('dragstart');
      
      cy.get('.drop-indicator').should('be.visible');
    });
  });
  
  describe('Removing Components', () => {
    beforeEach(() => {
      cy.clearAllComponents();
      cy.addComponent('hero');
    });
    
    it('should remove component via delete button', () => {
      cy.get('.component-hero').trigger('mouseover');
      cy.get('[data-test="delete-component"]').click();
      
      cy.get('.component-hero').should('not.exist');
    });
    
    it('should confirm before deleting', () => {
      cy.get('.component-hero').trigger('mouseover');
      cy.get('[data-test="delete-component"]').click();
      
      cy.get('.confirm-dialog').should('be.visible');
      cy.get('[data-test="confirm-delete"]').click();
      
      cy.get('.component-hero').should('not.exist');
    });
    
    it('should allow canceling deletion', () => {
      cy.get('.component-hero').trigger('mouseover');
      cy.get('[data-test="delete-component"]').click();
      
      cy.get('.confirm-dialog').should('be.visible');
      cy.get('[data-test="cancel-delete"]').click();
      
      cy.get('.component-hero').should('exist');
    });
  });
  
  describe('Saving', () => {
    it('should save media kit successfully', () => {
      cy.addComponent('hero');
      cy.saveMediaKit();
    });
    
    it('should show save indicator', () => {
      cy.addComponent('hero');
      cy.get('[data-test="save-btn"]').click();
      cy.get('.saving-indicator').should('be.visible');
    });
    
    it('should show success toast after save', () => {
      cy.addComponent('hero');
      cy.saveMediaKit();
      cy.get('.toast-success').should('contain', 'Saved');
    });
    
    it('should auto-save after changes', () => {
      cy.addComponent('hero');
      cy.get('.component-hero').click();
      cy.updateField('title', 'Test Title');
      
      // Wait for auto-save (3 seconds)
      cy.wait(3500);
      cy.get('.auto-save-indicator').should('contain', 'Saved');
    });
    
    it('should handle save errors gracefully', () => {
      cy.intercept('POST', '/wp-json/gmkb/v2/mediakit/*', {
        statusCode: 500,
        body: { error: 'Server error' }
      }).as('saveError');
      
      cy.addComponent('hero');
      cy.get('[data-test="save-btn"]').click();
      
      cy.wait('@saveError');
      cy.get('.toast-error').should('be.visible');
    });
  });
  
  describe('Theme Switching', () => {
    it('should switch themes', () => {
      cy.switchTheme('modern_bold');
      
      cy.get('.media-kit-builder').should('have.attr', 'data-theme', 'modern_bold');
    });
    
    it('should persist theme after reload', () => {
      cy.switchTheme('modern_bold');
      cy.saveMediaKit();
      
      cy.reload();
      cy.waitForVueReady();
      
      cy.get('.media-kit-builder').should('have.attr', 'data-theme', 'modern_bold');
    });
    
    it('should preview theme before applying', () => {
      cy.get('[data-test="theme-switcher"]').click();
      cy.get('[data-theme-id="modern_bold"]').trigger('mouseover');
      
      // Preview should be visible
      cy.get('.theme-preview').should('be.visible');
    });
  });
  
  describe('Responsive Design', () => {
    it('should work on mobile viewport', () => {
      cy.setViewport('mobile');
      cy.get('.media-kit-builder').should('be.visible');
      cy.addComponent('hero');
      cy.get('.component-hero').should('be.visible');
    });
    
    it('should work on tablet viewport', () => {
      cy.setViewport('tablet');
      cy.get('.media-kit-builder').should('be.visible');
      cy.addComponent('hero');
      cy.get('.component-hero').should('be.visible');
    });
    
    it('should adapt toolbar on mobile', () => {
      cy.setViewport('mobile');
      cy.get('.toolbar-mobile').should('be.visible');
      cy.get('.toolbar-desktop').should('not.be.visible');
    });
  });
  
  describe('Performance', () => {
    it('should load within 3 seconds', () => {
      const startTime = Date.now();
      
      cy.visitBuilder();
      cy.waitForVueReady();
      
      cy.then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(3000);
      });
    });
    
    it('should handle 10 components without lag', () => {
      for (let i = 0; i < 10; i++) {
        cy.addComponent('biography');
      }
      
      cy.getComponentCount().should('equal', 10);
      
      // Check interaction is still smooth
      cy.get('.component-biography').first().click();
      cy.get('.design-panel').should('be.visible');
    });
  });
  
  describe('Error Handling', () => {
    it('should handle network errors gracefully', () => {
      cy.intercept('GET', '/wp-json/gmkb/v2/mediakit/*', {
        forceNetworkError: true
      }).as('networkError');
      
      cy.reload();
      
      cy.get('.error-screen').should('be.visible');
      cy.get('.error-screen').should('contain', 'Failed to load');
    });
    
    it('should recover from errors with retry', () => {
      let attempts = 0;
      
      cy.intercept('GET', '/wp-json/gmkb/v2/mediakit/*', (req) => {
        attempts++;
        if (attempts < 2) {
          req.reply({ forceNetworkError: true });
        } else {
          req.continue();
        }
      }).as('retryLoad');
      
      cy.reload();
      cy.waitForVueReady();
      
      // Should eventually load after retry
      cy.get('.media-kit-builder').should('be.visible');
    });
  });
});
