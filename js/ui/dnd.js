/**
 * Drag and drop functionality for components
 */

import { getState, setState } from '../state.js';
import { markUnsaved } from '../services/save-service.js';
import { saveCurrentState } from '../services/history-service.js';
import { addComponentToZone } from '../components/component-manager.js';
import { showUpgradePrompt } from '../utils/helpers.js';
import { showComponentLibraryModal } from '../modals/component-library.js';

/**
 * Set up drag and drop functionality
 */
export function setupDragAndDrop() {
    const componentItems = document.querySelectorAll('.component-item[draggable="true"]');
    const dropZones = document.querySelectorAll('.drop-zone');

    // Component drag start
    componentItems.forEach(item => {
        item.addEventListener('dragstart', function(e) {
            setState('draggedComponent', this.getAttribute('data-component'));
            this.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'copy';
        });

        item.addEventListener('dragend', function() {
            this.classList.remove('dragging');
            setState('draggedComponent', null);
        });
    });

    // Drop zone functionality
    dropZones.forEach(zone => {
        zone.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            this.classList.add('drag-over');
        });

        zone.addEventListener('dragleave', function() {
            this.classList.remove('drag-over');
        });

        zone.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('drag-over');
            
            const draggedComponent = getState('draggedComponent');
            if (draggedComponent) {
                // Check if premium component
                const componentElement = document.querySelector(`[data-component="${draggedComponent}"]`);
                if (componentElement && componentElement.classList.contains('premium')) {
                    showUpgradePrompt();
                    return;
                }
                
                addComponentToZone(draggedComponent, this);
                markUnsaved();
                saveCurrentState();
            }
        });

        // Click to add component
        zone.addEventListener('click', function() {
            if (this.classList.contains('empty')) {
                showComponentLibraryModal();
            }
        });
    });
}
