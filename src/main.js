/**
 * Media Kit Builder - Main Entry Point
 * Architecture-Compliant Pure Vue Implementation
 * Event-driven, no polling, single source of truth
 */

// Import styles
import '../css/vue-controls.css';

// Vue 3 imports
import { createApp } from 'vue';
import { createPinia } from 'pinia';

// Main App component - use existing MediaKitApp
// import App from './App.vue'; // Our new App.vue
import MediaKitApp from './vue/components/MediaKitApp.vue';

// Core services
import { logger } from './utils/logger.js';

/**
 * Show toast notification
 */
function showToast(message, type = 'info', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('toast--visible');
  }, 10);
  
  setTimeout(() => {
    toast.classList.remove('toast--visible');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Initialize Vue application - Architecture-compliant
 */
async function initializeVue() {
  console.log('🚀 Initializing Vue Media Kit Builder (Architecture-Compliant)');
  
  try {
    // Find mount point
    let mountPoint = document.getElementById('vue-app-mount');
    
    // If not found, check for media-kit-preview
    if (!mountPoint) {
      const preview = document.getElementById('media-kit-preview');
      if (preview) {
        // Clear existing content
        preview.innerHTML = '';
        
        // Create mount point
        mountPoint = document.createElement('div');
        mountPoint.id = 'vue-app-mount';
        preview.appendChild(mountPoint);
      }
    }
    
    if (!mountPoint) {
      throw new Error('No mount point found for Vue app');
    }
    
    console.log('✅ Mount point found:', mountPoint.id);
    
    // Create Pinia store
    const pinia = createPinia();
    
    // Create Vue app
    const app = createApp(MediaKitApp);
    app.use(pinia);
    
    // Global properties for debugging
    app.config.globalProperties.$showToast = showToast;
    
    // Mount app
    const instance = app.mount(mountPoint);
    
    console.log('✅ Vue app mounted successfully');
    
    // Make available globally for debugging
    window.gmkbApp = app;
    window.gmkbPinia = pinia;
    
    // Get stores
    const { useMediaKitStore } = await import('./stores/mediaKit.js');
    const store = useMediaKitStore();
    
    // Make store globally available
    window.gmkbStore = store;
    window.mediaKitStore = store;
    
    // Console helpers
    window.GMKB = {
      version: '2.0.0',
      app,
      store,
      
      // Helper methods
      addComponent: (type) => store.addComponent(type),
      removeComponent: (id) => store.removeComponent(id),
      save: () => store.save(),
      getState: () => ({
        components: store.currentComponents,
        sections: store.currentSections,
        theme: store.globalSettings.theme
      }),
      
      // Debugging
      showToast,
      logger
    };
    
    console.log(`
🎯 Media Kit Builder v2.0 - Architecture Compliant
================================================
✅ Event-driven (no polling)
✅ Single source of truth (Pinia)
✅ WordPress bridge integration
✅ Clean separation of concerns

Commands:
- GMKB.addComponent('hero')
- GMKB.removeComponent(id)
- GMKB.save()
- GMKB.getState()

Store: gmkbStore
    `);
    
    return app;
    
  } catch (error) {
    console.error('❌ Failed to initialize Vue:', error);
    showToast('Failed to initialize Media Kit Builder', 'error');
    throw error;
  }
}

/**
 * Main initialization
 */
async function initialize() {
  console.log('🚀 Starting Media Kit Builder initialization...');
  
  try {
    // Wait for bridge to be ready (event-driven)
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Bridge initialization timeout'));
      }, 10000);
      
      // Check if bridge already exists
      if (window.gmkbBridge) {
        clearTimeout(timeout);
        console.log('✅ Bridge already available');
        resolve();
        return;
      }
      
      // Listen for bridge ready event
      document.addEventListener('gmkb:bridge:ready', () => {
        clearTimeout(timeout);
        console.log('✅ Bridge ready via event');
        resolve();
      }, { once: true });
      
      // Listen for bridge failure
      document.addEventListener('gmkb:bridge:failed', (event) => {
        clearTimeout(timeout);
        console.error('❌ Bridge failed:', event.detail);
        reject(new Error(event.detail?.reason || 'Bridge failed'));
      }, { once: true });
    });
    
    // Initialize Vue application
    const app = await initializeVue();
    
    // Dispatch ready event
    document.dispatchEvent(new CustomEvent('gmkb:ready', {
      detail: { 
        version: '2.0.0',
        architecture: 'compliant',
        vueApp: app
      }
    }));
    
    console.log('✅ Media Kit Builder initialization complete');
    
  } catch (error) {
    console.error('❌ Initialization failed:', error);
    showToast('Failed to initialize: ' + error.message, 'error');
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  // Use timeout to ensure all scripts are loaded
  setTimeout(initialize, 0);
}

// Export for module usage
export { showToast, logger };
