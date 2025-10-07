/**
 * Custom Cypress Commands for Media Kit Builder
 */

/**
 * Login to WordPress
 */
Cypress.Commands.add('wpLogin', (username, password) => {
  const user = username || Cypress.env('wpUser');
  const pass = password || Cypress.env('wpPass');
  
  cy.session([user, pass], () => {
    cy.visit('/wp-login.php');
    cy.get('#user_login').type(user);
    cy.get('#user_pass').type(pass);
    cy.get('#wp-submit').click();
    cy.url().should('not.include', '/wp-login.php');
  });
});

/**
 * Visit media kit builder
 */
Cypress.Commands.add('visitBuilder', (mediaKitId) => {
  const id = mediaKitId || Cypress.env('testMediaKitId') || 1;
  cy.visit(`/wp-admin/post.php?post=${id}&action=edit`);
  
  // Wait for Vue to mount
  cy.get('#app', { timeout: 15000 }).should('exist');
  cy.get('.media-kit-builder', { timeout: 15000 }).should('be.visible');
});

/**
 * Wait for Vue app to be ready
 */
Cypress.Commands.add('waitForVueReady', () => {
  cy.window().then((win) => {
    return new Cypress.Promise((resolve) => {
      if (win.gmkbApp) {
        resolve();
      } else {
        win.addEventListener('gmkb:ready', resolve);
      }
    });
  });
});

/**
 * Get Pinia store
 */
Cypress.Commands.add('getStore', (storeName = 'mediaKit') => {
  cy.window().then((win) => {
    const stores = {
      mediaKit: win.mediaKitStore,
      theme: win.themeStore,
      ui: win.gmkbUIStore
    };
    return stores[storeName];
  });
});

/**
 * Add component from library
 */
Cypress.Commands.add('addComponent', (componentType) => {
  // Open component library
  cy.get('[data-test="open-library"]').click();
  cy.get('.component-library').should('be.visible');
  
  // Add component
  cy.get(`[data-component-type="${componentType}"]`).click();
  
  // Wait for component to be added
  cy.get(`.component-${componentType}`).should('exist');
  
  // Close library
  cy.get('[data-test="close-library"]').click();
});

/**
 * Edit component
 */
Cypress.Commands.add('editComponent', (componentId) => {
  cy.get(`[data-component-id="${componentId}"]`).click();
  cy.get('.design-panel').should('be.visible');
});

/**
 * Update component field
 */
Cypress.Commands.add('updateField', (fieldName, value) => {
  cy.get(`[data-field="${fieldName}"]`).clear().type(value);
  
  // Wait for debounce
  cy.wait(500);
});

/**
 * Save media kit
 */
Cypress.Commands.add('saveMediaKit', () => {
  cy.intercept('POST', '/wp-json/gmkb/v2/mediakit/*').as('saveRequest');
  
  cy.get('[data-test="save-btn"]').click();
  
  cy.wait('@saveRequest').its('response.statusCode').should('eq', 200);
  cy.get('.toast-success').should('be.visible');
});

/**
 * Switch theme
 */
Cypress.Commands.add('switchTheme', (themeId) => {
  cy.get('[data-test="theme-switcher"]').click();
  cy.get(`[data-theme-id="${themeId}"]`).click();
  
  // Wait for theme to apply
  cy.wait(300);
});

/**
 * Take accessibility snapshot
 */
Cypress.Commands.add('checkA11y', (context = null, options = {}) => {
  cy.injectAxe();
  cy.checkA11y(context, options);
});

/**
 * Check responsive design
 */
Cypress.Commands.add('testResponsive', (callback) => {
  const devices = ['mobile', 'tablet', 'desktop'];
  
  devices.forEach(device => {
    cy.setViewport(device);
    callback(device);
  });
});

/**
 * Simulate network conditions
 */
Cypress.Commands.add('throttleNetwork', (condition = 'slow') => {
  const conditions = {
    slow: { downloadThroughput: 50 * 1024, uploadThroughput: 20 * 1024, latency: 500 },
    fast: { downloadThroughput: 1.5 * 1024 * 1024, uploadThroughput: 750 * 1024, latency: 20 },
    offline: { downloadThroughput: 0, uploadThroughput: 0, latency: 0 }
  };
  
  cy.intercept('*', (req) => {
    req.on('response', (res) => {
      res.setDelay(conditions[condition].latency);
    });
  });
});

/**
 * Wait for idle
 */
Cypress.Commands.add('waitForIdle', (timeout = 1000) => {
  cy.wait(timeout);
  cy.window().then((win) => {
    return new Cypress.Promise((resolve) => {
      if ('requestIdleCallback' in win) {
        win.requestIdleCallback(resolve);
      } else {
        setTimeout(resolve, 100);
      }
    });
  });
});

/**
 * Get component count
 */
Cypress.Commands.add('getComponentCount', () => {
  return cy.getStore('mediaKit').then((store) => {
    return Object.keys(store.components).length;
  });
});

/**
 * Clear all components
 */
Cypress.Commands.add('clearAllComponents', () => {
  cy.getStore('mediaKit').then((store) => {
    const componentIds = Object.keys(store.components);
    componentIds.forEach(id => store.removeComponent(id));
  });
});

/**
 * Export media kit
 */
Cypress.Commands.add('exportMediaKit', () => {
  cy.get('[data-test="export-btn"]').click();
  cy.get('.export-modal').should('be.visible');
  cy.get('[data-test="export-json"]').click();
});

/**
 * Import media kit
 */
Cypress.Commands.add('importMediaKit', (jsonData) => {
  cy.get('[data-test="import-btn"]').click();
  cy.get('.import-modal').should('be.visible');
  cy.get('[data-test="import-json-input"]').invoke('val', JSON.stringify(jsonData));
  cy.get('[data-test="import-confirm"]').click();
});
