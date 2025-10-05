/**
 * DOM Handlers Service
 * Handles legacy DOM events for buttons and UI elements
 * Extracted from main.js to follow single responsibility principle
 */

import { showToast } from './ToastService.js';

export class DOMHandlers {
  // ROOT FIX: Store handler references for proper cleanup
  static handlers = {
    emptyStateHandler: null,
    saveButtonHandler: null
  };
  
  /**
   * Setup empty state button handlers
   * These handle clicks on buttons shown when there are no components
   */
  static setupEmptyStateHandlers() {
    // ROOT FIX: Create named handler function that we can remove later
    this.handlers.emptyStateHandler = async (event) => {
      // Check for add component button
      if (event.target.id === 'add-component-btn' || 
          event.target.closest('#add-component-btn')) {
        event.preventDefault();
        if (window.openComponentLibrary) {
          window.openComponentLibrary();
        } else {
          document.dispatchEvent(new CustomEvent('gmkb:open-component-library'));
        }
        return;
      }
      
      // Check for data-action attributes
      const target = event.target.closest('[data-action]');
      if (!target) return;
      
      const action = target.dataset.action;
      const store = window.gmkbStore || window.mediaKitStore;
      if (!store) return;
      
      switch (action) {
        case 'add-component':
          event.preventDefault();
          if (window.openComponentLibrary) {
            window.openComponentLibrary();
          } else {
            document.dispatchEvent(new CustomEvent('gmkb:open-component-library'));
          }
          break;
          
        case 'add-section':
          event.preventDefault();
          store.addSection('full_width');
          showToast('Section added', 'success');
          break;
          
        case 'auto-generate-all':
          event.preventDefault();
          target.disabled = true;
          const originalText = target.textContent;
          target.textContent = 'Generating...';
          
          try {
            const componentsToAdd = ['hero', 'biography', 'topics', 'authority-hook', 'contact'];
            componentsToAdd.forEach(type => {
              store.addComponent({ type });
            });
            
            showToast('Media kit components generated!', 'success');
            await store.save();
            
          } catch (error) {
            console.error('Auto-generate failed:', error);
            showToast('Generation failed', 'error');
          } finally {
            target.disabled = false;
            target.textContent = originalText;
          }
          break;
      }
    };
    
    // ROOT FIX: Register the handler we can later remove
    document.addEventListener('click', this.handlers.emptyStateHandler);
  }
  
  /**
   * Setup minimal UI handlers for save button and other controls
   */
  static setupMinimalUIHandlers() {
    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) {
      // ROOT FIX: Create named handler function
      this.handlers.saveButtonHandler = async () => {
        const store = window.gmkbStore || window.mediaKitStore;
        if (!store) return;
        
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';
        
        try {
          await store.save();
          showToast('Saved successfully', 'success');
        } catch (error) {
          console.error('Save failed:', error);
          showToast('Save failed', 'error');
        } finally {
          saveBtn.disabled = false;
          saveBtn.textContent = 'Save';
        }
      };
      
      // ROOT FIX: Register handler we can later remove
      saveBtn.addEventListener('click', this.handlers.saveButtonHandler);
    }
    
    // Add any other minimal UI handlers here
  }
  
  /**
   * Initialize all DOM handlers
   */
  static initialize() {
    this.setupEmptyStateHandlers();
    this.setupMinimalUIHandlers();
    console.log('✅ DOM handlers initialized');
  }
  
  /**
   * Cleanup DOM handlers (for testing or cleanup)
   */
  static cleanup() {
    // ROOT FIX: Actually remove event listeners using stored references
    if (this.handlers.emptyStateHandler) {
      document.removeEventListener('click', this.handlers.emptyStateHandler);
      this.handlers.emptyStateHandler = null;
    }
    
    if (this.handlers.saveButtonHandler) {
      const saveBtn = document.getElementById('save-btn');
      if (saveBtn) {
        saveBtn.removeEventListener('click', this.handlers.saveButtonHandler);
      }
      this.handlers.saveButtonHandler = null;
    }
    
    console.log('✅ DOM handlers cleaned up');
  }
}

// Export convenience function
export const initializeDOMHandlers = () => DOMHandlers.initialize();
