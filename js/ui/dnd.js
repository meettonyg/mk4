/**
 * Drag and drop functionality for components
 */

import { getState, setState } from '../state.js';
import { markUnsaved } from '../services/save-service.js';
import { addComponentToZone } from '../components/component-manager.js';
import { showUpgradePrompt } from '../utils/helpers.js';
import { showComponentLibraryModal } from '../modals/component-library.js';

/**
 * Set up drag and drop functionality
 */
export function setupDragAndDrop() {
    const dropZones = document.querySelectorAll('.drop-zone');
    
    // Use event delegation for dynamically created component items
    const componentsTab = document.getElementById('components-tab');
    if (componentsTab) {
        // Component drag start - using event delegation
        componentsTab.addEventListener('dragstart', function(e) {
            const item = e.target.closest('.component-item[draggable="true"]');
            if (!item) return;
            
            setState('draggedComponent', item.getAttribute('data-component'));
            item.classList.add('component-item--dragging');
            e.dataTransfer.effectAllowed = 'copy';
        });
        
        componentsTab.addEventListener('dragend', function(e) {
            const item = e.target.closest('.component-item[draggable="true"]');
            if (!item) return;
            
            item.classList.remove('component-item--dragging');
            setState('draggedComponent', null);
        });
    }

    // Drop zone functionality
    dropZones.forEach(zone => {
        zone.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            this.classList.add('drop-zone--drag-over');
        });

        zone.addEventListener('dragleave', function() {
            this.classList.remove('drop-zone--drag-over');
        });

        zone.addEventListener('drop', async function(e) {
            e.preventDefault();
            this.classList.remove('drop-zone--drag-over');
            
            const draggedComponent = getState('draggedComponent');
            if (draggedComponent) {
                // Add loading state to the drop zone
                this.classList.add('is-loading');
                try {
                    // Check if premium component
                    const componentElement = document.querySelector(`[data-component="${draggedComponent}"]`);
                    if (componentElement && componentElement.classList.contains('component-item--premium')) {
                        showUpgradePrompt();
                        return;
                    }
                    
                    // Add component asynchronously
                    await addComponentToZone(draggedComponent, this);
                    markUnsaved();
                    // State is now automatically tracked by stateManager
                } finally {
                    // Remove loading state in a finally block to ensure it's always removed
                    setTimeout(() => this.classList.remove('is-loading'), 300);
                }
            }
        });

        // Click to add component
        zone.addEventListener('click', function() {
            if (this.classList.contains('drop-zone--empty')) {
                showComponentLibraryModal();
            }
        });
    });
}
