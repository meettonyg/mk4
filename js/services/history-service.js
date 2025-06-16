/**
 * Enhanced History Service
 * Manages undo/redo functionality using the centralized state manager
 */

import { stateManager } from './state-manager.js';

export class HistoryService {
    constructor() {
        this.isInitialized = false;
    }

    /**
     * Initialize the history service
     */
    init() {
        if (this.isInitialized) return;
        
        // Set up keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
                e.preventDefault();
                this.undo();
            } else if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') || 
                       ((e.ctrlKey || e.metaKey) && e.key === 'y')) {
                e.preventDefault();
                this.redo();
            }
        });
        
        // Set up button handlers
        document.addEventListener('click', (e) => {
            const action = e.target.closest('[data-action]')?.getAttribute('data-action');
            if (action === 'undo') {
                e.preventDefault();
                this.undo();
            } else if (action === 'redo') {
                e.preventDefault();
                this.redo();
            }
        });
        
        // Subscribe to state changes to update UI
        stateManager.subscribeGlobal(() => {
            this.updateUI();
        });
        
        this.isInitialized = true;
        this.updateUI();
    }

    /**
     * Perform undo operation
     * @returns {boolean} Success
     */
    undo() {
        const success = stateManager.undo();
        
        if (success) {
            this.showToast('Change undone');
            
            // Dispatch event for other components
            document.dispatchEvent(new CustomEvent('history-undo', {
                detail: { state: stateManager.getState() }
            }));
        }
        
        return success;
    }

    /**
     * Perform redo operation
     * @returns {boolean} Success
     */
    redo() {
        const success = stateManager.redo();
        
        if (success) {
            this.showToast('Change redone');
            
            // Dispatch event for other components
            document.dispatchEvent(new CustomEvent('history-redo', {
                detail: { state: stateManager.getState() }
            }));
        }
        
        return success;
    }

    /**
     * Update UI elements based on history state
     */
    updateUI() {
        const canUndo = this.canUndo();
        const canRedo = this.canRedo();
        
        // Update undo button - try multiple selectors
        const undoSelectors = ['[data-action="undo"]', '#undo-btn', '.undo-btn'];
        undoSelectors.forEach(selector => {
            const undoBtn = document.querySelector(selector);
            if (undoBtn) {
                undoBtn.disabled = !canUndo;
                undoBtn.classList.toggle('disabled', !canUndo);
                undoBtn.setAttribute('aria-disabled', !canUndo);
                
                // Update tooltip
                const tooltip = canUndo ? 'Undo (Ctrl+Z)' : 'Nothing to undo';
                undoBtn.setAttribute('title', tooltip);
                undoBtn.setAttribute('aria-label', tooltip);
            }
        });

        // Update redo button - try multiple selectors
        const redoSelectors = ['[data-action="redo"]', '#redo-btn', '.redo-btn'];
        redoSelectors.forEach(selector => {
            const redoBtn = document.querySelector(selector);
            if (redoBtn) {
                redoBtn.disabled = !canRedo;
                redoBtn.classList.toggle('disabled', !canRedo);
                redoBtn.setAttribute('aria-disabled', !canRedo);
                
                // Update tooltip
                const tooltip = canRedo ? 'Redo (Ctrl+Shift+Z)' : 'Nothing to redo';
                redoBtn.setAttribute('title', tooltip);
                redoBtn.setAttribute('aria-label', tooltip);
            }
        });

        // Dispatch event for other UI updates
        document.dispatchEvent(new CustomEvent('history-state-changed', {
            detail: {
                canUndo,
                canRedo
            }
        }));
    }

    /**
     * Check if undo is available
     * @returns {boolean}
     */
    canUndo() {
        // Check internal state manager history
        return stateManager.historyIndex > 0;
    }

    /**
     * Check if redo is available
     * @returns {boolean}
     */
    canRedo() {
        // Check internal state manager history
        return stateManager.historyIndex < stateManager.history.length - 1;
    }

    /**
     * Show a toast notification
     * @param {string} message - Message to show
     */
    showToast(message) {
        // Check if a toast container exists
        let toastContainer = document.querySelector('.gmkb-toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'gmkb-toast-container';
            document.body.appendChild(toastContainer);
        }
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = 'gmkb-toast';
        toast.textContent = message;
        
        // Add to container
        toastContainer.appendChild(toast);
        
        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });
        
        // Remove after delay
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 2000);
    }

    /**
     * Get history statistics from state manager
     * @returns {Object} History stats
     */
    getStats() {
        const history = stateManager.history;
        return {
            totalStates: history.length,
            currentIndex: stateManager.historyIndex,
            canUndo: this.canUndo(),
            canRedo: this.canRedo(),
            oldestState: history[0]?.timestamp,
            newestState: history[history.length - 1]?.timestamp,
            maxHistorySize: stateManager.maxHistorySize
        };
    }

    /**
     * Clear all history
     */
    clear() {
        stateManager.history = [];
        stateManager.historyIndex = -1;
        this.updateUI();
    }
}

// Create singleton instance
export const historyService = new HistoryService();

// Legacy function exports for backward compatibility
export function saveCurrentState() {
    console.warn('saveCurrentState is deprecated. State is now automatically tracked by stateManager.');
}

export function undo() {
    return historyService.undo();
}

export function redo() {
    return historyService.redo();
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        historyService.init();
    });
} else {
    historyService.init();
}