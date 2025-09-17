/**
 * @file keyboard-service.js
 * @description This service handles global keyboard shortcuts for the application,
 * such as undo, redo, and deleting components.
 * ROOT FIX: Converted from ES6 modules to WordPress global namespace
 */

// ROOT FIX: Remove ES6 imports - use global namespace
// Dependencies will be available globally via WordPress enqueue system

class KeyboardService {
    constructor() {
        this.boundHandleKeyDown = this.handleKeyDown.bind(this);
    }

    /**
     * Initializes the keyboard service by adding the global keydown event listener.
     */
    init() {
        document.addEventListener('keydown', this.boundHandleKeyDown);
        console.log('✅ Keyboard service initialized.');
    }

    /**
     * Handles the keydown event for various keyboard shortcuts.
     * @param {KeyboardEvent} e - The keyboard event.
     */
    handleKeyDown(e) {
        // Prevent actions while typing in an input field or a contenteditable area
        const activeElement = document.activeElement;
        if (activeElement.isContentEditable || activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
            return;
        }

        // Handle Delete and Backspace keys to remove the selected component
        if (e.key === 'Delete' || e.key === 'Backspace') {
            e.preventDefault();
            this.deleteSelectedElement();
        }

        // Undo/Redo functionality using global services
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            if (window.historyService && window.historyService.undo) {
                window.historyService.undo();
            } else if (window.undo) {
                window.undo();
            } else {
                console.log('Undo service not available');
            }
        }

        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'Z' || e.key === 'z')) {
            e.preventDefault();
            if (window.historyService && window.historyService.redo) {
                window.historyService.redo();
            } else if (window.redo) {
                window.redo();
            } else {
                console.log('Redo service not available');
            }
        }
    }

    /**
     * Deletes the currently selected component.
     * It gets the component ID from the design panel and uses the component manager to remove it.
     */
    deleteSelectedElement() {
        // Try to get current component ID from design panel
        const designPanel = window.designPanel;
        let componentIdToDelete = null;
        
        if (designPanel && designPanel.currentComponentId) {
            componentIdToDelete = designPanel.currentComponentId;
        } else {
            // Fallback: look for selected element with data attributes
            const selectedElement = document.querySelector('[data-component-id].selected') || 
                                  document.querySelector('.component.selected[data-component-id]') ||
                                  document.querySelector('.mk-component.selected[data-component-id]');
            
            if (selectedElement) {
                componentIdToDelete = selectedElement.dataset.componentId;
            }
        }
        
        if (componentIdToDelete) {
            console.log(`🗑️ Deleting selected element: ${componentIdToDelete}`);
            
            // Try enhanced component manager first
            if (window.enhancedComponentManager && window.enhancedComponentManager.removeComponent) {
                window.enhancedComponentManager.removeComponent(componentIdToDelete);
            } else if (window.componentManager && window.componentManager.removeComponent) {
                window.componentManager.removeComponent(componentIdToDelete);
            } else {
                console.warn('No component manager available for deletion');
                return;
            }
            
            // Hide the design panel since the component it was editing is now gone
            if (designPanel && designPanel.hide) {
                designPanel.hide();
            }
        } else {
            console.log('No component selected for deletion');
        }
    }

    /**
     * Destroys the service, removing event listeners.
     */
    destroy() {
        document.removeEventListener('keydown', this.boundHandleKeyDown);
        console.log('⚠️ Keyboard service destroyed.');
    }
}

// Create and expose globally
const keyboardService = new KeyboardService();

// ROOT FIX: Expose globally
window.keyboardService = keyboardService;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        keyboardService.init();
    });
} else {
    keyboardService.init();
}

console.log('✅ Keyboard Service: Global namespace setup complete');
