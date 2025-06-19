/**
 * @file keyboard-service.js
 * @description This service handles global keyboard shortcuts for the application,
 * such as undo, redo, and deleting components.
 *
 * This version has been updated to use the new enhanced state and component managers,
 * resolving module import errors and aligning it with the new architecture.
 */

import {
    enhancedComponentManager
} from '../core/enhanced-component-manager.js';
import {
    designPanel
} from '../ui/design-panel.js';
// Note: History service might need similar updates if used. For now, we focus on the delete functionality.
// import { history } from './history-service.js';

class KeyboardService {
    constructor() {
        this.boundHandleKeyDown = this.handleKeyDown.bind(this);
    }

    /**
     * Initializes the keyboard service by adding the global keydown event listener.
     */
    init() {
        document.addEventListener('keydown', this.boundHandleKeyDown);
        console.log('Keyboard service initialized.');
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

        // Placeholder for Undo/Redo functionality
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            e.preventDefault();
            console.log('Undo action triggered (history service not fully integrated).');
            // if (history) history.undo();
        }

        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Z') {
            e.preventDefault();
            console.log('Redo action triggered (history service not fully integrated).');
            // if (history) history.redo();
        }
    }

    /**
     * Deletes the currently selected component.
     * It gets the component ID from the design panel and uses the component manager to remove it.
     */
    deleteSelectedElement() {
        const componentIdToDelete = designPanel.currentComponentId;
        if (componentIdToDelete) {
            console.log(`Deleting selected element: ${componentIdToDelete}`);
            enhancedComponentManager.removeComponent(componentIdToDelete);
            // Hide the design panel since the component it was editing is now gone.
            designPanel.hide();
        }
    }

    /**
     * Destroys the service, removing event listeners.
     */
    destroy() {
        document.removeEventListener('keydown', this.boundHandleKeyDown);
        console.log('Keyboard service destroyed.');
    }
}

export const keyboardService = new KeyboardService();
