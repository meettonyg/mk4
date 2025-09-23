/**
 * Clean Component Library Integration
 * Simplified bridge that connects all "Add Component" buttons to the Vue component
 */

export function initializeComponentLibrary() {
  // ROOT FIX: Use event delegation instead of direct button manipulation
  // This is more robust and works with Vue's dynamic DOM updates
  
  const setupEventDelegation = () => {
    // Remove any existing delegated handlers to prevent duplicates
    if (window.gmkbComponentLibraryHandler) {
      document.body.removeEventListener('click', window.gmkbComponentLibraryHandler);
    }
    
    // Create delegated event handler
    window.gmkbComponentLibraryHandler = (e) => {
      // Check if clicked element or its parent is an add component button
      const button = e.target.closest(
        '#add-component-btn, #add-first-component, [data-action="add-component"], .add-component-btn:not(.component-card .add-component-btn)'
      );
      
      if (button) {
        e.preventDefault();
        e.stopPropagation();
        
        // Open Vue component library
        if (typeof window.openComponentLibrary === 'function') {
          window.openComponentLibrary();
        } else {
          // Dispatch event as fallback
          document.dispatchEvent(new CustomEvent('gmkb:open-component-library'));
        }
      }
    };
    
    // Add delegated event listener to body
    document.body.addEventListener('click', window.gmkbComponentLibraryHandler);
    
    console.log('✅ Component Library: Event delegation initialized');
  };
  
  // Setup event delegation once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupEventDelegation);
  } else {
    setupEventDelegation();
  }
  
  // No need to re-setup as delegation handles dynamic elements automatically
  
  // ROOT FIX: Use event delegation for sidebar items too
  const setupSidebarDelegation = () => {
    // Remove any existing sidebar handler
    if (window.gmkbSidebarHandler) {
      document.body.removeEventListener('click', window.gmkbSidebarHandler);
    }
    
    // Create delegated handler for sidebar component items
    window.gmkbSidebarHandler = (e) => {
      const item = e.target.closest('.component-item[data-component]');
      
      if (item && !e.defaultPrevented) {
        const componentType = item.dataset.component;
        
        // Use store to add component
        const store = window.gmkbStore || window.mediaKitStore;
        if (store?.addComponent) {
          store.addComponent({ type: componentType });
          
          // Show feedback
          if (window.showToast) {
            window.showToast(`Added ${componentType} component`, 'success');
          }
        }
      }
    };
    
    // Add delegated click handler
    document.body.addEventListener('click', window.gmkbSidebarHandler);
    
    // Add CSS for hover effects via stylesheet instead of inline
    if (!document.getElementById('gmkb-sidebar-styles')) {
      const style = document.createElement('style');
      style.id = 'gmkb-sidebar-styles';
      style.textContent = `
        .component-item[data-component] {
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .component-item[data-component]:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
      `;
      document.head.appendChild(style);
    }
    
    console.log('✅ Component Library: Sidebar delegation initialized');
  };
  
  // Setup sidebar delegation
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupSidebarDelegation);
  } else {
    setupSidebarDelegation();
  }
}

// Auto-initialize
initializeComponentLibrary();
