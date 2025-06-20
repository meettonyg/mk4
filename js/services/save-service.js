/**
 * @file save-service.js
 * @description Manages saving the media kit state to localStorage.
 *
 * Phase 3 Update: Migrated to use enhancedStateManager with validation,
 * state history integration, and improved error handling.
 */
import {
    enhancedStateManager
} from '../core/enhanced-state-manager.js';
import {
    stateValidator
} from '../core/state-validator.js';
import {
    stateHistory
} from '../core/state-history.js';
import {
    eventBus
} from '../core/event-bus.js';
import {
    structuredLogger
} from '../utils/structured-logger.js';
import {
    showToast
} from '../utils/toast-polyfill.js';
import {
    performanceMonitor
} from '../utils/performance-monitor.js';

const SAVE_KEY = 'guestifyMediaKitState';
const SAVE_KEY_BACKUP = 'guestifyMediaKitState_backup';
const SAVE_KEY_HISTORY = 'guestifyMediaKitState_history';
const SAVE_VERSION = '2.0.0';

class SaveService {
    constructor() {
        this.autosaveInterval = null;
        this.logger = structuredLogger;
        this.isCompressed = true;
        this.maxHistoryEntries = 10;
        
        // Setup event listeners
        this.setupEventListeners();
        
        this.logger.info('SAVE', 'Save service initialized');
    }
    
    /**
     * Setup event listeners for automatic saving
     */
    setupEventListeners() {
        // Listen for state changes from enhanced state manager
        eventBus.on('state:changed', (event) => {
            if (!event.data.batch) {
                // Debounced save for individual changes
                this.debouncedSave();
            }
        });
        
        // Listen for batch complete events
        eventBus.on('state:batch-complete', () => {
            this.saveState();
        });
        
        this.logger.debug('SAVE', 'Event listeners setup complete');
    }

    /**
     * Saves the current state of the media kit to localStorage with validation.
     * @param {object} [stateToSave] - Optional state to save, defaults to current state
     */
    saveState(stateToSave = null) {
        const perfEnd = performanceMonitor.start('state-save');
        
        try {
            // Get current state from enhanced state manager
            const currentState = stateToSave || enhancedStateManager.getState();
            
            // Validate state before saving
            const validation = stateValidator.validateState(currentState, { autoRecover: true });
            
            let finalState = currentState;
            if (!validation.valid) {
                if (validation.recovered) {
                    finalState = validation.fixed;
                    this.logger.warn('SAVE', 'State was repaired before saving', {
                        errors: validation.errors
                    });
                } else {
                    throw new Error('State validation failed: ' + validation.errors[0]?.message);
                }
            }
            
            // Add metadata
            const saveData = {
                ...finalState,
                meta: {
                    version: SAVE_VERSION,
                    savedAt: new Date().toISOString(),
                    componentsCount: Object.keys(finalState.components).length,
                    layoutLength: finalState.layout.length
                }
            };
            
            // Create backup of current save before overwriting
            const existingSave = localStorage.getItem(SAVE_KEY);
            if (existingSave) {
                localStorage.setItem(SAVE_KEY_BACKUP, existingSave);
            }
            
            // Serialize and save
            const serializedState = this.isCompressed 
                ? this.compressState(saveData)
                : JSON.stringify(saveData);
                
            localStorage.setItem(SAVE_KEY, serializedState);
            
            // Save to history
            this.saveToHistory(saveData);
            
            // Update state history
            if (window.stateHistory) {
                stateHistory.saveSnapshot(finalState, 'auto-save');
            }
            
            perfEnd();
            
            this.logger.info('SAVE', 'State saved successfully', {
                components: Object.keys(finalState.components).length,
                layout: finalState.layout.length,
                compressed: this.isCompressed,
                validated: validation.valid,
                repaired: validation.recovered
            });
            
            // Emit save event
            eventBus.emit('save:state-saved', {
                state: finalState,
                metadata: saveData.meta
            });
            
        } catch (error) {
            perfEnd();
            this.logger.error('SAVE', 'Error saving state', error);
            showToast('Error: Could not save your work. ' + error.message, 'error');
            
            // Emit error event
            eventBus.emit('save:error', {
                error: error.message,
                operation: 'save'
            });
        }
    }

    /**
     * Loads the media kit state from localStorage with validation and migration.
     * @returns {object|null} The loaded state object, or null if no state is saved.
     */
    loadState() {
        const perfEnd = performanceMonitor.start('state-load');
        
        try {
            const savedState = localStorage.getItem(SAVE_KEY);
            if (!savedState) {
                this.logger.info('SAVE', 'No saved state found');
                return null;
            }
            
            // Parse saved state
            let parsedState;
            try {
                parsedState = this.isCompressed 
                    ? this.decompressState(savedState)
                    : JSON.parse(savedState);
            } catch (parseError) {
                // Try fallback to uncompressed
                parsedState = JSON.parse(savedState);
            }
            
            // Check if state needs migration
            if (parsedState.meta?.version !== SAVE_VERSION) {
                this.logger.info('SAVE', 'Migrating state from version', {
                    from: parsedState.meta?.version || '1.0.0',
                    to: SAVE_VERSION
                });
                parsedState = this.migrateState(parsedState);
            }
            
            // Validate loaded state
            const validation = stateValidator.validateState(parsedState, { autoRecover: true });
            
            let finalState = parsedState;
            if (!validation.valid) {
                if (validation.recovered) {
                    finalState = validation.fixed;
                    this.logger.warn('SAVE', 'Loaded state was repaired', {
                        errors: validation.errors
                    });
                    showToast('Loaded data was repaired automatically', 'warning');
                } else {
                    this.logger.error('SAVE', 'Loaded state validation failed', null, {
                        errors: validation.errors
                    });
                    
                    // Try to load backup
                    const backupState = this.loadBackup();
                    if (backupState) {
                        showToast('Main save corrupted, loaded from backup', 'warning');
                        return backupState;
                    }
                    
                    throw new Error('Saved state is corrupted and could not be repaired');
                }
            }
            
            perfEnd();
            
            this.logger.info('SAVE', 'State loaded successfully', {
                components: Object.keys(finalState.components || {}).length,
                layout: (finalState.layout || []).length,
                version: finalState.meta?.version || 'unknown',
                validated: validation.valid,
                repaired: validation.recovered
            });
            
            // Emit load event
            eventBus.emit('save:state-loaded', {
                state: finalState,
                metadata: finalState.meta
            });
            
            return finalState;
            
        } catch (error) {
            perfEnd();
            this.logger.error('SAVE', 'Error loading state', error);
            showToast('Error: Could not load previously saved work. ' + error.message, 'error');
            
            // Emit error event
            eventBus.emit('save:error', {
                error: error.message,
                operation: 'load'
            });
        }
        return null;
    }

    /**
     * Debounced save to prevent excessive saves during rapid changes
     */
    debouncedSave() {
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }
        this.saveTimeout = setTimeout(() => {
            this.saveState();
            this.saveTimeout = null;
        }, 1000); // 1 second debounce
    }
    
    /**
     * Load backup state
     */
    loadBackup() {
        try {
            const backupState = localStorage.getItem(SAVE_KEY_BACKUP);
            if (backupState) {
                const parsed = this.isCompressed 
                    ? this.decompressState(backupState)
                    : JSON.parse(backupState);
                this.logger.info('SAVE', 'Backup state loaded');
                return parsed;
            }
        } catch (error) {
            this.logger.error('SAVE', 'Error loading backup state', error);
        }
        return null;
    }
    
    /**
     * Save state to history
     */
    saveToHistory(state) {
        try {
            let history = JSON.parse(localStorage.getItem(SAVE_KEY_HISTORY) || '[]');
            
            // Add new entry
            history.unshift({
                state,
                savedAt: new Date().toISOString()
            });
            
            // Limit history size
            if (history.length > this.maxHistoryEntries) {
                history = history.slice(0, this.maxHistoryEntries);
            }
            
            localStorage.setItem(SAVE_KEY_HISTORY, JSON.stringify(history));
        } catch (error) {
            this.logger.warn('SAVE', 'Error saving to history', error);
        }
    }
    
    /**
     * Migrate state from older versions
     */
    migrateState(oldState) {
        // If no meta, assume version 1.0.0
        const fromVersion = oldState.meta?.version || '1.0.0';
        
        let migratedState = { ...oldState };
        
        if (fromVersion === '1.0.0') {
            // Migrate from 1.0.0 to 2.0.0
            migratedState = {
                layout: oldState.layout || [],
                components: oldState.components || {},
                globalSettings: oldState.globalSettings || {},
                version: SAVE_VERSION,
                meta: {
                    version: SAVE_VERSION,
                    migratedFrom: fromVersion,
                    migratedAt: new Date().toISOString()
                }
            };
        }
        
        this.logger.info('SAVE', 'State migrated successfully', {
            from: fromVersion,
            to: SAVE_VERSION
        });
        
        return migratedState;
    }
    
    /**
     * Compress state for storage
     */
    compressState(state) {
        // Simple compression - remove whitespace and use shorter keys
        const compressed = {
            l: state.layout,
            c: state.components,
            g: state.globalSettings,
            v: state.version,
            m: state.meta
        };
        return JSON.stringify(compressed);
    }
    
    /**
     * Decompress state from storage
     */
    decompressState(compressedString) {
        const compressed = JSON.parse(compressedString);
        
        // Check if it's already in new format
        if (compressed.layout && compressed.components) {
            return compressed;
        }
        
        // Decompress from short keys
        return {
            layout: compressed.l || [],
            components: compressed.c || {},
            globalSettings: compressed.g || {},
            version: compressed.v || SAVE_VERSION,
            meta: compressed.m || {}
        };
    }
    
    /**
     * Export state data
     */
    exportState() {
        const state = enhancedStateManager.getState();
        const exportData = {
            ...state,
            meta: {
                ...state.meta,
                exportedAt: new Date().toISOString(),
                exportVersion: SAVE_VERSION
            }
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `media-kit-export-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        
        this.logger.info('SAVE', 'State exported');
        showToast('Media kit exported successfully', 'success');
    }
    
    /**
     * Import state data
     */
    async importState(file) {
        try {
            const text = await file.text();
            const importedData = JSON.parse(text);
            
            // Validate imported data
            const validation = stateValidator.validateState(importedData, { autoRecover: true });
            
            if (!validation.valid && !validation.recovered) {
                throw new Error('Imported data is invalid: ' + validation.errors[0]?.message);
            }
            
            const finalState = validation.recovered ? validation.fixed : importedData;
            
            // Load into state manager
            enhancedStateManager.setInitialState(finalState);
            
            this.logger.info('SAVE', 'State imported successfully');
            showToast('Media kit imported successfully', 'success');
            
        } catch (error) {
            this.logger.error('SAVE', 'Error importing state', error);
            showToast('Error importing file: ' + error.message, 'error');
        }
    }
    
    /**
     * Get save statistics
     */
    getStats() {
        const history = JSON.parse(localStorage.getItem(SAVE_KEY_HISTORY) || '[]');
        const currentSave = localStorage.getItem(SAVE_KEY);
        const backup = localStorage.getItem(SAVE_KEY_BACKUP);
        
        return {
            hasSavedData: !!currentSave,
            hasBackup: !!backup,
            historyEntries: history.length,
            lastSaved: history[0]?.savedAt || null,
            storageUsed: {
                main: currentSave ? Math.round(currentSave.length / 1024) + 'KB' : '0KB',
                backup: backup ? Math.round(backup.length / 1024) + 'KB' : '0KB',
                history: Math.round((localStorage.getItem(SAVE_KEY_HISTORY) || '').length / 1024) + 'KB'
            }
        };
    }
    
    /**
     * Clear all saved data
     */
    clearAllData() {
        localStorage.removeItem(SAVE_KEY);
        localStorage.removeItem(SAVE_KEY_BACKUP);
        localStorage.removeItem(SAVE_KEY_HISTORY);
        
        this.logger.info('SAVE', 'All saved data cleared');
        showToast('All saved data cleared', 'info');
    }

    /**
     * Starts the autosave functionality.
     * @param {number} interval - The interval in milliseconds for autosaving.
     */
    startAutosave(interval = 30000) { // Increased to 30 seconds
        if (this.autosaveInterval) {
            clearInterval(this.autosaveInterval);
        }
        this.autosaveInterval = setInterval(() => {
            this.saveState();
            showToast('Auto-saved!', 'info', 1500);
        }, interval);
        
        this.logger.info('SAVE', `Autosave started with ${interval}ms interval`);
    }

    /**
     * Stops the autosave functionality.
     */
    stopAutosave() {
        if (this.autosaveInterval) {
            clearInterval(this.autosaveInterval);
            this.autosaveInterval = null;
            this.logger.info('SAVE', 'Autosave stopped');
        }
    }
}

export const saveService = new SaveService();
