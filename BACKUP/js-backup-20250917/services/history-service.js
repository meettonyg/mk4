/**
 * Enhanced History Service
 * Manages undo/redo functionality using the centralized state manager
 * ROOT FIX: Converted from ES6 modules to WordPress global namespace
 */

// ROOT FIX: Remove ES6 imports - use global namespace
// Dependencies will be available globally via WordPress enqueue system

class HistoryService {
    constructor() {
        this.isInitialized = false;
        this.logger = window.structuredLogger || console;
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
        
        // GEMINI FIX: Subscribe to enhanced state manager if available
        if (window.enhancedStateManager && window.enhancedStateManager.subscribeGlobal) {
            window.enhancedStateManager.subscribeGlobal(() => {
                this.updateUI();
            });
        } else {
            // Fallback to legacy state manager
            const stateManager = window.stateManager;
            if (stateManager) {
                stateManager.subscribeGlobal(() => {
                    this.updateUI();
                });
            }
        }
        
        this.isInitialized = true;
        this.updateUI();
    }

    /**
     * Perform undo operation
     * GEMINI FIX: Use enhanced state history system
     * @returns {boolean} Success
     */
    undo() {
        // Try enhanced state history first
        if (window.stateHistory && window.stateHistory.canUndo()) {
            const success = window.stateHistory.undo();
            
            if (success) {
                this.showToast('Change undone');
                
                // Dispatch event for other components
                document.dispatchEvent(new CustomEvent('history-undo', {
                    detail: { state: window.enhancedStateManager?.getState() }
                }));
            }
            
            return success;
        }
        
        // Fallback to legacy state manager
        const stateManager = window.stateManager;
        if (!stateManager) return false;
        
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
     * GEMINI FIX: Use enhanced state history system
     * @returns {boolean} Success
     */
    redo() {
        // Try enhanced state history first
        if (window.stateHistory && window.stateHistory.canRedo()) {
            const success = window.stateHistory.redo();
            
            if (success) {
                this.showToast('Change redone');
                
                // Dispatch event for other components
                document.dispatchEvent(new CustomEvent('history-redo', {
                    detail: { state: window.enhancedStateManager?.getState() }
                }));
            }
            
            return success;
        }
        
        // Fallback to legacy state manager
        const stateManager = window.stateManager;
        if (!stateManager) return false;
        
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
     * GEMINI FIX: Enhanced UI update with better selectors
     */
    updateUI() {
        const canUndo = this.canUndo();
        const canRedo = this.canRedo();
        
        this.logger.debug?.('HISTORY-UI', 'Updating UI state', { canUndo, canRedo });
        
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
     * GEMINI FIX: Use enhanced state history system
     * @returns {boolean}
     */
    canUndo() {
        // Try enhanced state history first
        if (window.stateHistory) {
            return window.stateHistory.canUndo();
        }
        
        // Fallback to legacy state manager
        const stateManager = window.stateManager;
        if (!stateManager) return false;
        
        return stateManager.historyIndex > 0;
    }

    /**
     * Check if redo is available
     * GEMINI FIX: Use enhanced state history system
     * @returns {boolean}
     */
    canRedo() {
        // Try enhanced state history first
        if (window.stateHistory) {
            return window.stateHistory.canRedo();
        }
        
        // Fallback to legacy state manager
        const stateManager = window.stateManager;
        if (!stateManager) return false;
        
        return stateManager.historyIndex < stateManager.history.length - 1;
    }

    /**
     * Show a toast notification
     * @param {string} message - Message to show
     * @param {string} type - Toast type: 'info', 'success', 'warning', 'error'
     * @param {number} duration - Duration in milliseconds (default: 3000)
     * @param {boolean} dismissible - Whether toast can be dismissed manually (default: false)
     */
    showToast(message, type = 'info', duration = 3000, dismissible = false) {
        // Check if a toast container exists
        let toastContainer = document.querySelector('.gmkb-toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'gmkb-toast-container';
            document.body.appendChild(toastContainer);
        }
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `gmkb-toast gmkb-toast--${type}`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'polite');
        toast.textContent = message;
        
        // Add close button if dismissible
        if (dismissible) {
            const closeBtn = document.createElement('button');
            closeBtn.className = 'gmkb-toast__close';
            closeBtn.innerHTML = '&times;';
            closeBtn.setAttribute('aria-label', 'Close notification');
            closeBtn.addEventListener('click', () => {
                toast.classList.add('closing');
                setTimeout(() => toast.remove(), 300);
            });
            toast.appendChild(closeBtn);
        }
        
        // Add to container
        toastContainer.appendChild(toast);
        
        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });
        
        // Remove after delay
        if (duration > 0) {
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    toast.classList.remove('show');
                    setTimeout(() => {
                        if (document.body.contains(toast)) {
                            toast.remove();
                        }
                    }, 300);
                }
            }, duration);
        }
        
        return toast; // Return toast element for potential future reference
    }

    /**
     * Get history statistics from state manager
     * @returns {Object} History stats
     */
    getStats() {
        // Try enhanced state history first
        if (window.stateHistory) {
            return {
                totalStates: window.stateHistory.getHistoryLength(),
                currentIndex: window.stateHistory.getCurrentIndex(),
                canUndo: window.stateHistory.canUndo(),
                canRedo: window.stateHistory.canRedo(),
                maxHistorySize: window.stateHistory.getMaxSize()
            };
        }
        
        // Fallback to legacy state manager
        const stateManager = window.stateManager;
        if (!stateManager) {
            return {
                totalStates: 0,
                currentIndex: 0,
                canUndo: false,
                canRedo: false,
                maxHistorySize: 0
            };
        }
        
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
        // Try enhanced state history first
        if (window.stateHistory && typeof window.stateHistory.clear === 'function') {
            window.stateHistory.clear();
            this.updateUI();
            return;
        }
        
        // Fallback to legacy state manager
        const stateManager = window.stateManager;
        if (!stateManager) return;
        
        stateManager.history = [];
        stateManager.historyIndex = -1;
        this.updateUI();
    }
}

// Create singleton instance
const historyService = new HistoryService();

// Legacy function exports for backward compatibility - only keeping essential ones
function undo() {
    return historyService.undo();
}

function redo() {
    return historyService.redo();
}

// ROOT FIX: Expose globally
window.historyService = historyService;
window.undo = undo;
window.redo = redo;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        historyService.init();
    });
} else {
    historyService.init();
}

console.log('✅ History Service: Global namespace setup complete');