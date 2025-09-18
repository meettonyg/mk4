/**
 * Ensure Component Attributes
 * Makes sure all components have proper data attributes for Vue control system
 */

export function ensureComponentAttributes() {
  console.log('🔧 Ensuring component attributes for Vue controls...');
  
  let updated = 0;
  
  // Find all components and ensure they have data-component-id
  document.querySelectorAll('.gmkb-component, .component-container').forEach(element => {
    // Check if it has a component ID somewhere
    let componentId = element.getAttribute('data-component-id') || 
                     element.dataset.componentId ||
                     element.id;
    
    // Try to extract ID from classes like component-hero_123
    if (!componentId) {
      const match = element.className.match(/component-([a-z0-9_]+)/i);
      if (match) {
        componentId = match[1];
      }
    }
    
    // If we found an ID, ensure it's set as data-component-id
    if (componentId && !element.getAttribute('data-component-id')) {
      element.setAttribute('data-component-id', componentId);
      updated++;
    }
    
    // Ensure it has the gmkb-component class
    if (!element.classList.contains('gmkb-component')) {
      element.classList.add('gmkb-component');
    }
  });
  
  // Find all sections and ensure they have data-section-id
  document.querySelectorAll('.gmkb-section, .section-container, [class*="section_"]').forEach(element => {
    // Check if it has a section ID somewhere
    let sectionId = element.getAttribute('data-section-id') || 
                   element.dataset.sectionId ||
                   element.id;
    
    // Try to extract ID from classes like section_123
    if (!sectionId) {
      const match = element.className.match(/section_([a-z0-9_]+)/i);
      if (match) {
        sectionId = match[1];
      }
    }
    
    // If we found an ID, ensure it's set as data-section-id
    if (sectionId && !element.getAttribute('data-section-id')) {
      element.setAttribute('data-section-id', sectionId);
      updated++;
    }
    
    // Ensure it has the gmkb-section class
    if (!element.classList.contains('gmkb-section')) {
      element.classList.add('gmkb-section');
    }
  });
  
  if (updated > 0) {
    console.log(`✅ Updated ${updated} elements with proper attributes`);
  }
  
  return updated;
}

// Run periodically to catch dynamically added components
export function startAttributeWatcher() {
  // Run immediately
  ensureComponentAttributes();
  
  // Watch for new components being added
  const observer = new MutationObserver(() => {
    ensureComponentAttributes();
  });
  
  // Start observing
  const container = document.getElementById('gmkb-sections-container') || 
                   document.getElementById('media-kit-preview') ||
                   document.querySelector('.preview-area');
                   
  if (container) {
    observer.observe(container, {
      childList: true,
      subtree: true
    });
    console.log('✅ Component attribute watcher started');
  }
  
  return observer;
}

// Auto-start when imported
if (typeof document !== 'undefined') {
  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startAttributeWatcher);
  } else {
    setTimeout(startAttributeWatcher, 100);
  }
}

// Export for manual use
window.ensureComponentAttributes = ensureComponentAttributes;
window.startAttributeWatcher = startAttributeWatcher;
