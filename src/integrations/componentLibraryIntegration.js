/**
 * Clean Component Library Integration
 * Simplified bridge that connects all "Add Component" buttons to the Vue component
 */

export function initializeComponentLibrary() {
  // Wait for Vue app to be ready
  const setupButtons = () => {
    // Find all possible add component buttons
    const buttons = [
      document.getElementById('add-component-btn'),
      document.getElementById('add-first-component'),
      ...document.querySelectorAll('[data-action="add-component"]'),
      ...document.querySelectorAll('.add-component-btn:not(.component-card .add-component-btn)')
    ].filter(Boolean);
    
    // Attach event listener to each button
    buttons.forEach(button => {
      // Remove any existing listeners
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);
      
      // Add clean click handler
      newButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Open Vue component library
        if (typeof window.openComponentLibrary === 'function') {
          window.openComponentLibrary();
        } else {
          // Dispatch event as fallback
          document.dispatchEvent(new CustomEvent('gmkb:open-component-library'));
        }
      });
    });
    
    console.log(`✅ Component Library: Connected ${buttons.length} buttons`);
  };
  
  // Setup immediately and on Vue ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupButtons);
  } else {
    setupButtons();
  }
  
  // Re-setup when Vue signals ready
  document.addEventListener('gmkb:ready', setupButtons);
  
  // Make sidebar component items clickable (not just draggable)
  const setupSidebarItems = () => {
    const items = document.querySelectorAll('.component-item[data-component]');
    
    items.forEach(item => {
      // Keep drag functionality but add click to add
      item.style.cursor = 'pointer';
      
      // Add click handler
      item.addEventListener('click', (e) => {
        // Don't trigger on drag
        if (e.defaultPrevented) return;
        
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
      });
      
      // Add hover effect
      item.addEventListener('mouseenter', () => {
        item.style.transform = 'translateY(-2px)';
        item.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
      });
      
      item.addEventListener('mouseleave', () => {
        item.style.transform = '';
        item.style.boxShadow = '';
      });
    });
    
    if (items.length > 0) {
      console.log(`✅ Component Library: Made ${items.length} sidebar items clickable`);
    }
  };
  
  // Setup sidebar items
  setTimeout(setupSidebarItems, 500);
}

// Auto-initialize
initializeComponentLibrary();
