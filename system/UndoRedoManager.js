/**
 * Undo/Redo Manager for Media Kit Builder
 * Manages undo/redo functionality with efficient state tracking
 * 
 * ROOT FIX: Event-driven, no polling, integrates with existing state manager
 * CHECKLIST COMPLIANT: Reuses existing systems, event-driven architecture
 * 
 * @since 2.2.0
 */

(function() {
    'use strict';
    
    class UndoRedoManager {
        constructor() {
            this.history = [];
            this.currentIndex = -1;
            this.maxHistorySize = 50;
            this.isUndoingOrRedoing = false;
            this.lastStateHash = null;
            this.logger = window.structuredLogger || console;
            
            // Debounce timers
            this.saveTimer = null;
            this.updateUITimer = null;
            
            // Track action types for better descriptions
            this.actionDescriptions = {
                'ADD_COMPONENT': 'Added component',
                'REMOVE_COMPONENT': 'Removed component',
                'UPDATE_COMPONENT': 'Updated component',
                'MOVE_COMPONENT': 'Moved component',
                'SET_LAYOUT': 'Changed layout',
                'UPDATE_GLOBAL_SETTINGS': 'Updated settings',
                'UPDATE_SECTIONS': 'Modified sections',
                'component_added': 'Added component',
                'component_removed': 'Removed component',
                'component_updated': 'Updated component',
                'component_moved': 'Moved component',
                'section_added': 'Added section',
                'section_removed': 'Removed section',
                'theme_changed': 'Changed theme'
            };
            
            this.init();
        }
        
        /**
         * Initialize the undo/redo manager
         * ROOT FIX: Event-driven initialization
         */
        init() {
            this.logger.info('UNDO-REDO', 'Initializing UndoRedoManager...');
            
            // Wait for state manager to be ready
            if (window.enhancedStateManager) {
                this.attachToStateManager();
            } else {
                // Listen for state manager ready event
                document.addEventListener('gmkb:enhanced-state-manager-ready', (e) => {
                    this.logger.info('UNDO-REDO', 'State manager ready, attaching...');
                    this.attachToStateManager();
                });
            }
            
            // Set up keyboard shortcuts
            this.setupKeyboardShortcuts();
            
            // Set up UI event listeners
            this.setupUIListeners();
            
            // Update UI initially
            this.updateUI();
            
            this.logger.info('UNDO-REDO', '✅ UndoRedoManager initialized');
        }
        
        /**
         * Attach to the state manager for change tracking
         * ROOT FIX: Use existing state manager's subscription system
         */
        attachToStateManager() {
            const stateManager = window.enhancedStateManager;
            
            if (!stateManager) {
                this.logger.warn('UNDO-REDO', 'State manager not found');
                return;
            }
            
            // Subscribe to state changes
            stateManager.subscribeGlobal((state) => {
                // Don't track changes during undo/redo operations
                if (this.isUndoingOrRedoing) {
                    return;
                }
                
                // Create a hash of the current state to detect real changes
                const stateHash = this.createStateHash(state);
                
                // Only save if state actually changed
                if (stateHash !== this.lastStateHash) {
                    this.saveStateToHistory(state);
                    this.lastStateHash = stateHash;
                }
            });
            
            // Listen for specific action events for better descriptions
            document.addEventListener('gmkb:component-added', (e) => {
                this.lastActionType = 'component_added';
                this.lastActionDetail = e.detail?.type || 'component';
            });
            
            document.addEventListener('gmkb:component-removed', (e) => {
                this.lastActionType = 'component_removed';
                this.lastActionDetail = e.detail?.type || 'component';
            });
            
            document.addEventListener('gmkb:component-updated', (e) => {
                this.lastActionType = 'component_updated';
                this.lastActionDetail = e.detail?.componentId || 'component';
            });
            
            document.addEventListener('gmkb:section-added', (e) => {
                this.lastActionType = 'section_added';
                this.lastActionDetail = e.detail?.sectionType || 'section';
            });
            
            document.addEventListener('gmkb:theme-changed', (e) => {
                this.lastActionType = 'theme_changed';
                this.lastActionDetail = e.detail?.theme || 'theme';
            });
            
            this.logger.info('UNDO-REDO', 'Attached to state manager');
        }
        
        /**
         * Setup keyboard shortcuts
         * ROOT FIX: Prevent conflicts with WordPress shortcuts
         */
        setupKeyboardShortcuts() {
            document.addEventListener('keydown', (e) => {
                // Check if we're in the builder
                if (!document.querySelector('.gmkb-builder-container')) {
                    return;
                }
                
                // Check if target is an input field
                if (e.target.matches('input, textarea, select, [contenteditable="true"]')) {
                    return;
                }
                
                // Undo: Ctrl/Cmd + Z
                if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
                    e.preventDefault();
                    this.undo();
                }
                // Redo: Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y
                else if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') || 
                         ((e.ctrlKey || e.metaKey) && e.key === 'y')) {
                    e.preventDefault();
                    this.redo();
                }
            });
            
            this.logger.info('UNDO-REDO', 'Keyboard shortcuts registered');
        }
        
        /**
         * Setup UI button listeners
         * ROOT FIX: Use data attributes for flexibility
         */
        setupUIListeners() {
            document.addEventListener('click', (e) => {
                const button = e.target.closest('[data-action]');
                if (!button) return;
                
                const action = button.getAttribute('data-action');
                
                if (action === 'undo') {
                    e.preventDefault();
                    this.undo();
                } else if (action === 'redo') {
                    e.preventDefault();
                    this.redo();
                }
            });
            
            this.logger.info('UNDO-REDO', 'UI listeners registered');
        }
        
        /**
         * Save current state to history
         * @param {Object} state - The state to save
         */
        saveStateToHistory(state) {
            // Clear any states after current index (when new action after undo)
            if (this.currentIndex < this.history.length - 1) {
                this.history = this.history.slice(0, this.currentIndex + 1);
            }
            
            // Create history entry
            const entry = {
                state: this.cloneState(state),
                timestamp: Date.now(),
                action: this.lastActionType || 'state_changed',
                detail: this.lastActionDetail || '',
                description: this.getActionDescription(this.lastActionType, this.lastActionDetail)
            };
            
            // Add to history
            this.history.push(entry);
            
            // Limit history size
            if (this.history.length > this.maxHistorySize) {
                this.history.shift(); // Remove oldest
            } else {
                this.currentIndex++;
            }
            
            // Reset action tracking
            this.lastActionType = null;
            this.lastActionDetail = null;
            
            // Update UI
            this.debouncedUpdateUI();
            
            this.logger.debug('UNDO-REDO', 'State saved to history', {
                index: this.currentIndex,
                total: this.history.length,
                action: entry.action
            });
        }
        
        /**
         * Perform undo operation
         * @returns {boolean} Success
         */
        undo() {
            if (!this.canUndo()) {
                this.logger.info('UNDO-REDO', 'Cannot undo - no previous states');
                return false;
            }
            
            this.isUndoingOrRedoing = true;
            
            try {
                // Move index back
                this.currentIndex--;
                
                // Get the state to restore
                const entry = this.history[this.currentIndex];
                
                // Restore state via state manager
                if (window.enhancedStateManager) {
                    // Use batch update to prevent multiple notifications
                    window.enhancedStateManager.startBatchUpdate();
                    
                    // Clear and rebuild state
                    const newState = this.cloneState(entry.state);
                    window.enhancedStateManager.applyTransaction({
                        type: 'SET_STATE',
                        payload: newState
                    });
                    
                    window.enhancedStateManager.endBatchUpdate();
                    
                    this.logger.info('UNDO-REDO', 'Undo performed', {
                        action: entry.description,
                        newIndex: this.currentIndex
                    });
                    
                    // Show toast notification
                    this.showToast(`Undone: ${entry.description}`);
                    
                    // Dispatch event
                    document.dispatchEvent(new CustomEvent('gmkb:undo', {
                        detail: { 
                            action: entry.action,
                            description: entry.description,
                            state: newState 
                        }
                    }));
                    
                    // Update the state hash to prevent re-saving
                    this.lastStateHash = this.createStateHash(newState);
                    
                    // Update UI
                    this.updateUI();
                    
                    return true;
                } else {
                    this.logger.error('UNDO-REDO', 'State manager not available');
                    return false;
                }
            } catch (error) {
                this.logger.error('UNDO-REDO', 'Error during undo', error);
                return false;
            } finally {
                // Reset flag after a delay to allow state propagation
                setTimeout(() => {
                    this.isUndoingOrRedoing = false;
                }, 100);
            }
        }
        
        /**
         * Perform redo operation
         * @returns {boolean} Success
         */
        redo() {
            if (!this.canRedo()) {
                this.logger.info('UNDO-REDO', 'Cannot redo - no future states');
                return false;
            }
            
            this.isUndoingOrRedoing = true;
            
            try {
                // Move index forward
                this.currentIndex++;
                
                // Get the state to restore
                const entry = this.history[this.currentIndex];
                
                // Restore state via state manager
                if (window.enhancedStateManager) {
                    // Use batch update to prevent multiple notifications
                    window.enhancedStateManager.startBatchUpdate();
                    
                    // Clear and rebuild state
                    const newState = this.cloneState(entry.state);
                    window.enhancedStateManager.applyTransaction({
                        type: 'SET_STATE',
                        payload: newState
                    });
                    
                    window.enhancedStateManager.endBatchUpdate();
                    
                    this.logger.info('UNDO-REDO', 'Redo performed', {
                        action: entry.description,
                        newIndex: this.currentIndex
                    });
                    
                    // Show toast notification
                    this.showToast(`Redone: ${entry.description}`);
                    
                    // Dispatch event
                    document.dispatchEvent(new CustomEvent('gmkb:redo', {
                        detail: { 
                            action: entry.action,
                            description: entry.description,
                            state: newState 
                        }
                    }));
                    
                    // Update the state hash to prevent re-saving
                    this.lastStateHash = this.createStateHash(newState);
                    
                    // Update UI
                    this.updateUI();
                    
                    return true;
                } else {
                    this.logger.error('UNDO-REDO', 'State manager not available');
                    return false;
                }
            } catch (error) {
                this.logger.error('UNDO-REDO', 'Error during redo', error);
                return false;
            } finally {
                // Reset flag after a delay to allow state propagation
                setTimeout(() => {
                    this.isUndoingOrRedoing = false;
                }, 100);
            }
        }
        
        /**
         * Check if undo is available
         * @returns {boolean}
         */
        canUndo() {
            return this.currentIndex > 0;
        }
        
        /**
         * Check if redo is available
         * @returns {boolean}
         */
        canRedo() {
            return this.currentIndex < this.history.length - 1;
        }
        
        /**
         * Get history statistics
         * @returns {Object}
         */
        getStats() {
            return {
                totalStates: this.history.length,
                currentIndex: this.currentIndex,
                canUndo: this.canUndo(),
                canRedo: this.canRedo(),
                maxHistorySize: this.maxHistorySize,
                oldestState: this.history[0]?.timestamp,
                newestState: this.history[this.history.length - 1]?.timestamp,
                recentActions: this.history.slice(-5).map(h => h.description)
            };
        }
        
        /**
         * Clear all history
         */
        clear() {
            this.history = [];
            this.currentIndex = -1;
            this.lastStateHash = null;
            this.updateUI();
            this.logger.info('UNDO-REDO', 'History cleared');
        }
        
        /**
         * Update UI elements based on undo/redo availability
         */
        updateUI() {
            const canUndo = this.canUndo();
            const canRedo = this.canRedo();
            
            // Update undo buttons
            document.querySelectorAll('[data-action="undo"], .undo-btn, #undo-btn').forEach(btn => {
                btn.disabled = !canUndo;
                btn.classList.toggle('disabled', !canUndo);
                btn.setAttribute('aria-disabled', !canUndo);
                
                // Update tooltip with last action
                if (canUndo && this.currentIndex > 0) {
                    const lastAction = this.history[this.currentIndex - 1];
                    btn.setAttribute('title', `Undo: ${lastAction.description} (Ctrl+Z)`);
                } else {
                    btn.setAttribute('title', 'Nothing to undo (Ctrl+Z)');
                }
            });
            
            // Update redo buttons
            document.querySelectorAll('[data-action="redo"], .redo-btn, #redo-btn').forEach(btn => {
                btn.disabled = !canRedo;
                btn.classList.toggle('disabled', !canRedo);
                btn.setAttribute('aria-disabled', !canRedo);
                
                // Update tooltip with next action
                if (canRedo && this.currentIndex < this.history.length - 1) {
                    const nextAction = this.history[this.currentIndex + 1];
                    btn.setAttribute('title', `Redo: ${nextAction.description} (Ctrl+Y)`);
                } else {
                    btn.setAttribute('title', 'Nothing to redo (Ctrl+Y)');
                }
            });
            
            // Dispatch event for other UI components
            document.dispatchEvent(new CustomEvent('gmkb:undo-redo-state-changed', {
                detail: {
                    canUndo,
                    canRedo,
                    historyLength: this.history.length,
                    currentIndex: this.currentIndex
                }
            }));
        }
        
        /**
         * Debounced UI update
         */
        debouncedUpdateUI() {
            if (this.updateUITimer) {
                clearTimeout(this.updateUITimer);
            }
            this.updateUITimer = setTimeout(() => {
                this.updateUI();
            }, 100);
        }
        
        /**
         * Clone state for history storage
         * @param {Object} state
         * @returns {Object}
         */
        cloneState(state) {
            return JSON.parse(JSON.stringify(state));
        }
        
        /**
         * Create a hash of the state for change detection
         * @param {Object} state
         * @returns {string}
         */
        createStateHash(state) {
            // Simple hash based on JSON string
            const str = JSON.stringify(state);
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32bit integer
            }
            return hash.toString(36);
        }
        
        /**
         * Get human-readable action description
         * @param {string} action
         * @param {string} detail
         * @returns {string}
         */
        getActionDescription(action, detail) {
            if (this.actionDescriptions[action]) {
                const base = this.actionDescriptions[action];
                if (detail) {
                    return `${base}: ${detail}`;
                }
                return base;
            }
            return action || 'State changed';
        }
        
        /**
         * Show toast notification
         * @param {string} message
         */
        showToast(message) {
            // Use existing toast system if available
            if (window.showToast) {
                window.showToast(message, 'success', 2000);
            } else {
                // Fallback to simple notification
                const toast = document.createElement('div');
                toast.className = 'gmkb-toast gmkb-toast--success';
                toast.textContent = message;
                toast.style.cssText = `
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: #4CAF50;
                    color: white;
                    padding: 12px 20px;
                    border-radius: 4px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                    z-index: 10000;
                    animation: slideIn 0.3s ease;
                `;
                
                document.body.appendChild(toast);
                
                setTimeout(() => {
                    toast.style.animation = 'slideOut 0.3s ease';
                    setTimeout(() => toast.remove(), 300);
                }, 2000);
            }
        }
        
        /**
         * Get history for debugging
         * @returns {Array}
         */
        getHistory() {
            return this.history.map((entry, index) => ({
                index,
                current: index === this.currentIndex,
                action: entry.action,
                description: entry.description,
                timestamp: new Date(entry.timestamp).toLocaleTimeString()
            }));
        }
        
        /**
         * Debug the undo/redo manager
         */
        debug() {
            console.group('%c🔄 Undo/Redo Manager Debug', 'font-size: 14px; font-weight: bold; color: #FF9800');
            console.log('Current Index:', this.currentIndex);
            console.log('History Length:', this.history.length);
            console.log('Can Undo:', this.canUndo());
            console.log('Can Redo:', this.canRedo());
            console.table(this.getHistory());
            console.groupEnd();
        }
    }
    
    // Create and expose globally
    window.UndoRedoManager = UndoRedoManager;
    window.undoRedoManager = new UndoRedoManager();
    
    // Add CSS for animations
    if (!document.querySelector('#gmkb-undo-redo-styles')) {
        const style = document.createElement('style');
        style.id = 'gmkb-undo-redo-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            
            [data-action="undo"]:disabled,
            [data-action="redo"]:disabled,
            .undo-btn:disabled,
            .redo-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .gmkb-toast {
                animation: slideIn 0.3s ease;
            }
        `;
        document.head.appendChild(style);
    }
    
    console.log('✅ Undo/Redo Manager: Initialized and ready');
    
})();
