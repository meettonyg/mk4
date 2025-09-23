/**
 * Drag and Drop Manager
 * Architecture-compliant drag/drop implementation
 * Bridges sidebar drag operations with Vue drop zones
 */

class DragDropManager {
  constructor() {
    this.isDragging = false;
    this.dragData = null;
    this.dragSource = null;
    this.init();
  }

  init() {
    // Set up event delegation for drag operations
    this.setupDragHandlers();
    this.setupDropHandlers();
    console.log('✅ DragDropManager initialized');
  }

  setupDragHandlers() {
    // Use event delegation for all draggable elements
    document.addEventListener('dragstart', (e) => {
      // Check if it's a component item from sidebar
      const componentItem = e.target.closest('.component-item[data-component]');
      if (componentItem) {
        this.handleComponentDragStart(e, componentItem);
      }
    });

    document.addEventListener('dragend', (e) => {
      this.handleDragEnd(e);
    });

    // Add visual feedback
    document.addEventListener('dragover', (e) => {
      // Allow drop on drop zones
      const dropZone = e.target.closest('.component-drop-zone, .gmkb-section__content');
      if (dropZone) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
      }
    });
  }

  handleComponentDragStart(e, componentItem) {
    const componentType = componentItem.dataset.component;
    
    // Store drag data
    this.isDragging = true;
    this.dragData = {
      type: 'new-component',
      componentType: componentType
    };
    this.dragSource = componentItem;
    
    // Set data transfer with multiple formats for compatibility
    e.dataTransfer.effectAllowed = 'copy';
    
    // Set plain text for basic compatibility
    e.dataTransfer.setData('text/plain', componentType);
    
    // Set component type directly
    e.dataTransfer.setData('component-type', componentType);
    
    // Set JSON data for complex transfers
    try {
      e.dataTransfer.setData('application/json', JSON.stringify(this.dragData));
    } catch (err) {
      // Some browsers don't support application/json
      console.warn('Could not set JSON data:', err);
    }
    
    // Add dragging class
    componentItem.classList.add('dragging');
    
    // Visual feedback
    if (e.dataTransfer.setDragImage) {
      const dragImage = componentItem.cloneNode(true);
      dragImage.style.opacity = '0.5';
      document.body.appendChild(dragImage);
      e.dataTransfer.setDragImage(dragImage, 0, 0);
      setTimeout(() => dragImage.remove(), 0);
    }
    
    console.log('📦 Dragging component:', componentType);
  }

  handleDragEnd(e) {
    // Clean up
    this.isDragging = false;
    this.dragData = null;
    
    // Remove dragging class
    if (this.dragSource) {
      this.dragSource.classList.remove('dragging');
      this.dragSource = null;
    }
    
    // Remove any drag-over classes
    document.querySelectorAll('.drag-over').forEach(el => {
      el.classList.remove('drag-over');
    });
  }

  setupDropHandlers() {
    // Handle drops on Vue drop zones
    document.addEventListener('drop', (e) => {
      const dropZone = e.target.closest('.component-drop-zone');
      if (!dropZone) return;
      
      // Prevent default to allow drop
      e.preventDefault();
      
      // Get drop target info
      const sectionId = dropZone.dataset.sectionId;
      const column = dropZone.dataset.column || 1;
      
      // Get component type from various sources
      const componentType = e.dataTransfer.getData('component-type') || 
                           e.dataTransfer.getData('text/plain') ||
                           e.dataTransfer.getData('text');
      
      if (componentType && sectionId) {
        // Use store to add component to specific section and column
        const store = window.gmkbStore || window.mediaKitStore;
        if (store && store.addComponent) {
          const componentId = store.addComponent({
            type: componentType,
            sectionId: sectionId,
            column: parseInt(column)
          });
          
          console.log(`✅ Component dropped: ${componentType} in section ${sectionId}, column ${column}`);
          
          // Show feedback
          if (window.showToast) {
            window.showToast(`Added ${componentType} to column ${column}`, 'success');
          }
        }
      }
      
      // Clean up visual feedback
      dropZone.classList.remove('drag-over');
    });
    
    // Visual feedback for drag over
    document.addEventListener('dragenter', (e) => {
      const dropZone = e.target.closest('.component-drop-zone');
      if (dropZone) {
        dropZone.classList.add('drag-over');
      }
    });
    
    document.addEventListener('dragleave', (e) => {
      const dropZone = e.target.closest('.component-drop-zone');
      if (dropZone) {
        // Check if we're actually leaving the drop zone
        const rect = dropZone.getBoundingClientRect();
        if (e.clientX < rect.left || e.clientX > rect.right ||
            e.clientY < rect.top || e.clientY > rect.bottom) {
          dropZone.classList.remove('drag-over');
        }
      }
    });
  }

  // Enable drag for sidebar items
  enableSidebarDrag() {
    const items = document.querySelectorAll('.component-item[data-component]');
    items.forEach(item => {
      if (!item.hasAttribute('draggable')) {
        item.setAttribute('draggable', 'true');
        item.style.cursor = 'grab';
        
        // Add hover state
        item.addEventListener('mouseenter', () => {
          if (!this.isDragging) {
            item.style.cursor = 'grab';
          }
        });
        
        item.addEventListener('mousedown', () => {
          item.style.cursor = 'grabbing';
        });
        
        item.addEventListener('mouseup', () => {
          item.style.cursor = 'grab';
        });
      }
    });
    
    console.log(`✅ Enabled drag for ${items.length} sidebar items`);
  }
}

// Initialize when DOM is ready
let dragDropManager = null;

function initDragDrop() {
  if (!dragDropManager) {
    dragDropManager = new DragDropManager();
    
    // Enable drag for existing items
    dragDropManager.enableSidebarDrag();
    
    // Re-enable when new items are added
    const observer = new MutationObserver(() => {
      dragDropManager.enableSidebarDrag();
    });
    
    // Observe sidebar for changes
    const sidebar = document.querySelector('.sidebar__content');
    if (sidebar) {
      observer.observe(sidebar, { 
        childList: true, 
        subtree: true 
      });
    }
    
    // Make it globally available
    window.gmkbDragDrop = dragDropManager;
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDragDrop);
} else {
  setTimeout(initDragDrop, 100);
}

// Re-initialize when Vue is ready
document.addEventListener('gmkb:ready', () => {
  setTimeout(initDragDrop, 500);
});

export { DragDropManager, initDragDrop };
