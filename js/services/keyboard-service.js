/**
 * Keyboard shortcuts functionality
 */

import { saveMediaKit } from './save-service.js';
import { undo, redo } from './history-service.js';
import { showExportModal } from '../modals/export.js';
import { deleteSelectedElement } from '../ui/element-editor.js';
import { getState } from '../state.js';

/**
 * Set up keyboard shortcuts
 */
export function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 's':
                    e.preventDefault();
                    saveMediaKit();
                    break;
                case 'z':
                    e.preventDefault();
                    if (e.shiftKey) {
                        redo();
                    } else {
                        undo();
                    }
                    break;
                case 'e':
                    e.preventDefault();
                    showExportModal();
                    break;
            }
        }
        
        if (e.key === 'Delete' && getState('selectedElement')) {
            deleteSelectedElement();
        }
    });
}
