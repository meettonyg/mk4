/**
 * Phase 3 Implementation Examples
 * Code snippets and integration patterns for Phase 3 implementation
 */

// ============================================
// 1. ENHANCED STATE MANAGER INTEGRATION
// ============================================

// File: js/core/enhanced-state-manager.js
// Add these imports at the top:
import { stateValidator } from './state-validator.js';
import { eventBus } from './event-bus.js';
import { structuredLogger } from '../utils/structured-logger.js';

// Modify the applyTransaction method:
applyTransaction(transaction, batch = false) {
    if (this.isBatching && !batch) {
        this.transactionQueue.push(transaction);
        return;
    }

    // NEW: Validate transaction before applying
    const currentState = this.getState();
    const validation = stateValidator.validateTransaction(transaction, currentState);
    
    if (!validation.valid) {
        // Try automatic recovery
        if (validation.errors[0]?.recoverable) {
            structuredLogger.warn('STATE', 'Attempting transaction recovery', {
                transaction: transaction.type,
                error: validation.errors[0].message
            });
            
            const recovered = stateValidator.attemptRecovery(transaction, validation.errors, {
                state: currentState,
                transaction
            });
            
            if (recovered) {
                transaction = recovered;
                structuredLogger.info('STATE', 'Transaction recovered successfully');
            } else {
                const error = new Error(`Invalid transaction: ${validation.errors[0].message}`);
                eventBus.emit('state:transaction-failed', { transaction, error });
                throw error;
            }
        } else {
            const error = new Error(`Invalid transaction: ${validation.errors[0].message}`);
            eventBus.emit('state:transaction-failed', { transaction, error });
            throw error;
        }
    }

    // Track transaction start
    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    eventBus.emit('state:transaction-start', { 
        transactionId, 
        transaction,
        batch 
    });

    try {
        // Existing transaction logic
        switch (transaction.type) {
            case 'ADD_COMPONENT':
                this.state.components[transaction.payload.id] = transaction.payload;
                this.state.layout.push(transaction.payload.id);
                // NEW: Emit component-specific event
                eventBus.emit('state:component-added', {
                    componentId: transaction.payload.id,
                    component: transaction.payload
                });
                break;
                
            case 'REMOVE_COMPONENT':
                const removedComponent = this.state.components[transaction.payload];
                delete this.state.components[transaction.payload];
                this.state.layout = this.state.layout.filter(id => id !== transaction.payload);
                // NEW: Emit component-specific event
                eventBus.emit('state:component-removed', {
                    componentId: transaction.payload,
                    component: removedComponent
                });
                break;
                
            case 'UPDATE_COMPONENT':
                {
                    const { componentId, newProps } = transaction.payload;
                    if (this.state.components[componentId]) {
                        const oldProps = { ...this.state.components[componentId].props };
                        this.state.components[componentId].props = {
                            ...this.state.components[componentId].props,
                            ...newProps
                        };
                        // NEW: Emit component-specific event
                        eventBus.emit('state:component-updated', {
                            componentId,
                            changes: newProps,
                            oldProps,
                            newProps: this.state.components[componentId].props
                        });
                    }
                    break;
                }
                
            case 'MOVE_COMPONENT':
                {
                    const { componentId, direction } = transaction.payload;
                    const index = this.state.layout.indexOf(componentId);
                    if (index === -1) break;

                    const oldIndex = index;
                    let newIndex = index;

                    if (direction === 'up' && index > 0) {
                        [this.state.layout[index], this.state.layout[index - 1]] = 
                        [this.state.layout[index - 1], this.state.layout[index]];
                        newIndex = index - 1;
                    } else if (direction === 'down' && index < this.state.layout.length - 1) {
                        [this.state.layout[index], this.state.layout[index + 1]] = 
                        [this.state.layout[index + 1], this.state.layout[index]];
                        newIndex = index + 1;
                    }
                    
                    // NEW: Emit layout change event
                    if (oldIndex !== newIndex) {
                        eventBus.emit('state:layout-changed', {
                            componentId,
                            oldIndex,
                            newIndex,
                            layout: [...this.state.layout]
                        });
                    }
                    break;
                }
                
            case 'SET_LAYOUT':
                const oldLayout = [...this.state.layout];
                this.state.layout = transaction.payload;
                // NEW: Emit layout change event
                eventBus.emit('state:layout-changed', {
                    oldLayout,
                    newLayout: transaction.payload
                });
                break;
                
            case 'SET_STATE':
                // NEW: Validate entire state
                const stateValidation = stateValidator.validateState(transaction.payload);
                if (!stateValidation.valid) {
                    if (stateValidation.recovered) {
                        this.state = stateValidation.fixed;
                        structuredLogger.warn('STATE', 'State recovered during SET_STATE');
                    } else {
                        throw new Error('Invalid state in SET_STATE transaction');
                    }
                } else {
                    this.state = transaction.payload;
                }
                // NEW: Emit full state change
                eventBus.emit('state:reset', { state: this.state });
                break;
                
            case 'UPDATE_GLOBAL_SETTINGS':
                const oldSettings = { ...this.state.globalSettings };
                this.state.globalSettings = { 
                    ...this.state.globalSettings,
                    ...transaction.payload
                };
                // NEW: Emit settings change event
                eventBus.emit('state:settings-changed', {
                    oldSettings,
                    newSettings: this.state.globalSettings,
                    changes: transaction.payload
                });
                break;
        }

        // NEW: Emit transaction complete
        eventBus.emit('state:transaction-applied', {
            transactionId,
            transaction,
            state: this.getState()
        });

        if (!this.isBatching) {
            // NEW: Validate final state
            const finalValidation = stateValidator.validateState(this.state);
            if (!finalValidation.valid) {
                structuredLogger.error('STATE', 'State invalid after transaction', {
                    transaction: transaction.type,
                    errors: finalValidation.errors
                });
            }
            
            this.notifySubscribers();
            saveService.saveState(this.state);
            
            // NEW: Emit state changed event
            eventBus.emit('state:changed', {
                transaction,
                state: this.getState()
            });
        }
        
    } catch (error) {
        // NEW: Emit transaction failed event
        eventBus.emit('state:transaction-failed', {
            transactionId,
            transaction,
            error
        });
        throw error;
    }
}

// ============================================
// 2. UI REGISTRY INTEGRATION IN RENDERER
// ============================================

// File: js/core/enhanced-component-renderer.js
// Add import at top:
import { uiRegistry } from './ui-registry.js';

// Modify renderNewComponents method:
async renderNewComponents(componentIds, newState) {
    const fragment = document.createDocumentFragment();
    const renderPromises = Array.from(componentIds).map(id => {
        const componentState = newState.components[id];
        if (!componentState) {
            console.error(`State for new component ${id} not found!`);
            return null;
        }
        return this.renderComponentWithLoader(id, componentState.type, componentState.data);
    });

    const renderedComponents = await Promise.all(renderPromises);
    renderedComponents.forEach(comp => {
        if (comp) {
            fragment.appendChild(comp.element);
            this.componentCache.set(comp.id, comp.element);
            
            // NEW: Register with UI Registry
            this.registerComponentWithUI(comp.id, comp.element, componentState.type);
        }
    });

    this.previewContainer.appendChild(fragment);
    const state = enhancedStateManager.getState();
    this.reorderComponents(state.layout);
}

// NEW: Add method to register components with UI Registry
registerComponentWithUI(componentId, element, componentType) {
    // Define update function based on component type
    const updateFn = (el, state, context) => {
        // For now, trigger re-render
        // In future, implement smart updates per component type
        if (componentType === 'hero') {
            // Example: Smart update for hero component
            const titleEl = el.querySelector('.hero-title');
            if (titleEl && state.props?.title) {
                titleEl.textContent = state.props.title;
            }
            // Update other properties...
        } else {
            // Generic update: Replace entire content
            this.renderComponentWithLoader(componentId, state.type, state.data)
                .then(({ element: newElement }) => {
                    el.innerHTML = newElement.innerHTML;
                    // Re-apply any event listeners
                    this.setupComponentEventListeners(el, componentId);
                });
        }
    };
    
    // Register with options
    uiRegistry.register(componentId, element, updateFn, {
        updateOn: ['props', 'data'], // Only update on these property changes
        debounce: 100 // Debounce rapid updates
    });
}

// ============================================
// 3. EVENT BUS INTEGRATION IN MODALS
// ============================================

// File: js/modals/component-library.js
// Replace at top of file:
import { eventBus } from '../core/event-bus.js';

// In setupEventListeners function, replace:
// OLD: document.addEventListener('show-component-library', () => {
// NEW:
eventBus.on('ui:show-component-library', () => {
    showComponentLibraryModal();
});

// Replace custom event dispatches:
// OLD: document.dispatchEvent(new CustomEvent('show-component-library'));
// NEW:
eventBus.emit('ui:show-component-library');

// In the Add Component button handler:
if (window.componentManager) {
    for (const componentType of selectedComponents) {
        await window.componentManager.addComponent(componentType, {});
        // NEW: Emit component added event
        eventBus.emit('ui:component-added-from-library', {
            componentType,
            source: 'component-library'
        });
    }
}

// ============================================
// 4. SAVE SERVICE MIGRATION
// ============================================

// File: js/services/save-service.js
// Complete replacement of imports:
import { enhancedStateManager } from '../core/enhanced-state-manager.js';
import { stateValidator } from '../core/state-validator.js';
import { stateHistory } from '../core/state-history.js';
import { eventBus } from '../core/event-bus.js';
import { showToast } from '../utils/toast-polyfill.js';

class SaveService {
    constructor() {
        this.autosaveInterval = null;
        this.lastSaveHash = null;
        this.setupAutoSave();
    }

    setupAutoSave() {
        // Listen for state changes
        eventBus.on('state:changed', () => {
            this.debouncedAutoSave();
        });
    }

    debouncedAutoSave = this.debounce(() => {
        this.saveState();
        showToast('Auto-saved!', 'info', 1500);
    }, 5000);

    async saveState() {
        try {
            const currentState = enhancedStateManager.getState();
            
            // Validate before saving
            const validation = await stateValidator.validateAndRepair(currentState);
            
            // Check if state actually changed
            const stateHash = this.hashState(validation);
            if (stateHash === this.lastSaveHash) {
                return; // No changes to save
            }
            
            const saveData = {
                state: validation,
                version: '2.0.0',
                timestamp: Date.now(),
                metadata: {
                    componentCount: Object.keys(validation.components || {}).length,
                    hasCustomCSS: !!validation.globalSettings?.advanced?.customCSS,
                    historySize: stateHistory.getStats().totalSnapshots
                }
            };
            
            const serialized = JSON.stringify(saveData);
            
            // Compress if too large
            if (serialized.length > 100000) {
                console.warn('State is large, consider implementing compression');
            }
            
            localStorage.setItem(SAVE_KEY, serialized);
            this.lastSaveHash = stateHash;
            
            console.log('Media kit state saved.', saveData.metadata);
            
            // Emit save event
            eventBus.emit('state:saved', {
                size: serialized.length,
                metadata: saveData.metadata
            });
            
        } catch (error) {
            console.error('Error saving state:', error);
            showToast('Error: Could not save your work.', 'error');
            eventBus.emit('state:save-failed', { error });
        }
    }

    loadState() {
        try {
            const savedData = localStorage.getItem(SAVE_KEY);
            if (!savedData) return null;
            
            const parsed = JSON.parse(savedData);
            
            // Handle different save formats
            let state;
            if (parsed.state && parsed.version) {
                // New format
                state = parsed.state;
                
                // Check version and migrate if needed
                if (parsed.version !== '2.0.0') {
                    console.log('Migrating save data from version', parsed.version);
                    state = this.migrateState(state, parsed.version);
                }
            } else {
                // Legacy format
                state = parsed;
                state = this.migrateState(state, '1.0.0');
            }
            
            // Validate loaded state
            const validation = stateValidator.validateState(state);
            if (!validation.valid) {
                if (validation.recovered) {
                    state = validation.fixed;
                    showToast('Save data repaired during load', 'warning');
                } else {
                    throw new Error('Invalid save data');
                }
            }
            
            console.log('Media kit state loaded.');
            return state;
            
        } catch (error) {
            console.error('Error loading state:', error);
            showToast('Error: Could not load saved work.', 'error');
            return null;
        }
    }

    migrateState(state, fromVersion) {
        // Implement migration logic
        if (fromVersion === '1.0.0') {
            return {
                layout: state.layout || [],
                components: state.components || {},
                globalSettings: state.globalSettings || {},
                version: '2.0.0'
            };
        }
        return state;
    }

    hashState(state) {
        // Simple hash for change detection
        return JSON.stringify({
            layoutLength: state.layout?.length,
            componentIds: Object.keys(state.components || {}).sort(),
            settingsHash: JSON.stringify(state.globalSettings)
        });
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    exportState(filename = 'media-kit-backup.json') {
        const state = enhancedStateManager.getState();
        const history = stateHistory.export();
        
        const exportData = {
            state,
            history,
            version: '2.0.0',
            exported: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        
        showToast('State exported successfully', 'success');
    }

    async importState(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            if (data.state) {
                // Validate imported state
                const validation = await stateValidator.validateAndRepair(data.state);
                
                // Apply state
                enhancedStateManager.applyTransaction({
                    type: 'SET_STATE',
                    payload: validation
                });
                
                // Import history if available
                if (data.history) {
                    stateHistory.import(data.history);
                }
                
                showToast('State imported successfully', 'success');
                return true;
            }
            
            throw new Error('Invalid import file');
            
        } catch (error) {
            console.error('Import failed:', error);
            showToast('Failed to import state', 'error');
            return false;
        }
    }
}

// ============================================
// 5. KEYBOARD SHORTCUTS FOR UNDO/REDO
// ============================================

// Add to main initialization or enhanced-state-manager.js:
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Check if in input field
        if (e.target.matches('input, textarea, [contenteditable]')) {
            return;
        }
        
        // Ctrl/Cmd + Z = Undo
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            if (stateHistory.canUndo()) {
                stateHistory.undo();
                showToast('Undone', 'info', 1000);
            }
        }
        
        // Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z = Redo
        if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
            e.preventDefault();
            if (stateHistory.canRedo()) {
                stateHistory.redo();
                showToast('Redone', 'info', 1000);
            }
        }
        
        // Ctrl/Cmd + S = Save
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveService.saveState();
            showToast('Saved', 'success', 1000);
        }
    });
}

// ============================================
// 6. PERFORMANCE MONITORING DASHBOARD
// ============================================

// Create a simple performance dashboard
function createPerformanceDashboard() {
    const dashboard = document.createElement('div');
    dashboard.id = 'performance-dashboard';
    dashboard.style.cssText = `
        position: fixed;
        bottom: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 10px;
        border-radius: 5px;
        font-family: monospace;
        font-size: 12px;
        z-index: 10000;
        display: none;
    `;
    
    document.body.appendChild(dashboard);
    
    // Update dashboard periodically
    setInterval(() => {
        if (dashboard.style.display === 'none') return;
        
        const stats = {
            state: stateValidator.getStats(),
            ui: uiRegistry.getStats(),
            events: eventBus.getStats(),
            history: stateHistory.getStats()
        };
        
        dashboard.innerHTML = `
            <div><strong>Performance Monitor</strong></div>
            <div>State Validations: ${stats.state.successRate}</div>
            <div>UI Components: ${stats.ui.registeredComponents}</div>
            <div>Pending Updates: ${stats.ui.pendingUpdates}</div>
            <div>Event Queue: ${stats.events.queueSize}</div>
            <div>History Size: ${stats.history.totalSnapshots}</div>
            <div>Can Undo: ${stats.history.canUndo ? 'Yes' : 'No'}</div>
        `;
    }, 1000);
    
    // Toggle with Ctrl+Shift+P
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'P') {
            e.preventDefault();
            dashboard.style.display = dashboard.style.display === 'none' ? 'block' : 'none';
        }
    });
}