/**
 * Auto-Save Composable
 * 
 * ROOT FIX: Centralizes auto-save logic
 * Provides debounced saving with conflict detection
 * 
 * @package GMKB
 * @version 2.0.0
 */

import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useMediaKitStore } from '../stores/mediaKit';
import { useUIStore } from '../stores/ui';
import { debounce } from '../../utils/debounce';

export function useAutoSave(options = {}) {
    const mediaKitStore = useMediaKitStore();
    const uiStore = useUIStore();
    
    // Options with defaults
    const {
        delay = 2000,           // Debounce delay in ms
        enabled = true,         // Auto-save enabled by default
        conflictCheck = true,   // Check for conflicts before saving
        showNotifications = true // Show save notifications
    } = options;
    
    // Local state
    const isSaving = ref(false);
    const lastSaved = ref(null);
    const saveError = ref(null);
    const saveConflict = ref(null);
    const autoSaveEnabled = ref(enabled);
    const pendingSave = ref(false);
    
    // Statistics
    const saveCount = ref(0);
    const failCount = ref(0);
    const conflictCount = ref(0);
    
    // Computed
    const isDirty = computed(() => mediaKitStore.isDirty);
    const canSave = computed(() => {
        return !isSaving.value && 
               isDirty.value && 
               autoSaveEnabled.value &&
               !saveConflict.value;
    });
    
    const timeSinceLastSave = computed(() => {
        if (!lastSaved.value) return null;
        return Date.now() - lastSaved.value;
    });
    
    /**
     * Perform save operation
     */
    async function performSave() {
        if (!canSave.value) {
            console.log('⏭️ Auto-save skipped:', {
                isSaving: isSaving.value,
                isDirty: isDirty.value,
                enabled: autoSaveEnabled.value,
                conflict: !!saveConflict.value
            });
            return false;
        }
        
        isSaving.value = true;
        saveError.value = null;
        pendingSave.value = false;
        
        try {
            // Check for conflicts if enabled
            if (conflictCheck) {
                const hasConflict = await checkForConflicts();
                if (hasConflict) {
                    isSaving.value = false;
                    conflictCount.value++;
                    return false;
                }
            }
            
            // Perform the save
            await mediaKitStore.save();
            
            // Update state
            lastSaved.value = Date.now();
            saveCount.value++;
            
            // Show success notification
            if (showNotifications) {
                uiStore.showToast('Changes saved', 'success', 2000);
            }
            
            // Dispatch event
            document.dispatchEvent(new CustomEvent('gmkb:auto-save-success', {
                detail: {
                    timestamp: lastSaved.value,
                    saveCount: saveCount.value
                }
            }));
            
            console.log('✅ Auto-save successful:', {
                timestamp: new Date(lastSaved.value).toLocaleTimeString(),
                saveCount: saveCount.value
            });
            
            return true;
            
        } catch (error) {
            saveError.value = error.message || 'Save failed';
            failCount.value++;
            
            console.error('❌ Auto-save failed:', error);
            
            // Show error notification
            if (showNotifications) {
                uiStore.showToast(`Save failed: ${saveError.value}`, 'error', 5000);
            }
            
            // Dispatch error event
            document.dispatchEvent(new CustomEvent('gmkb:auto-save-error', {
                detail: {
                    error: saveError.value,
                    failCount: failCount.value
                }
            }));
            
            // Retry after a longer delay
            setTimeout(() => {
                if (isDirty.value && !isSaving.value) {
                    pendingSave.value = true;
                    debouncedSave();
                }
            }, delay * 3);
            
            return false;
            
        } finally {
            isSaving.value = false;
        }
    }
    
    /**
     * Check for save conflicts
     */
    async function checkForConflicts() {
        try {
            // Load current server state quietly
            const serverState = await mediaKitStore.loadFromWordPressQuiet();
            
            if (!serverState) {
                return false; // No conflict if we can't check
            }
            
            // Check if server version is newer
            if (serverState.lastSaved && mediaKitStore.lastSaved) {
                if (serverState.lastSaved > mediaKitStore.lastSaved) {
                    saveConflict.value = {
                        serverTime: serverState.lastSaved,
                        localTime: mediaKitStore.lastSaved,
                        message: 'Another user has made changes'
                    };
                    
                    // Show conflict notification
                    if (showNotifications) {
                        const action = uiStore.showToast(
                            'Conflict detected: Another user has made changes. Reload to see their changes.',
                            'warning',
                            0 // Don't auto-dismiss
                        );
                        
                        // Add buttons to handle conflict
                        handleConflict();
                    }
                    
                    return true;
                }
            }
            
            return false;
            
        } catch (error) {
            console.warn('Conflict check failed:', error);
            return false; // Assume no conflict if check fails
        }
    }
    
    /**
     * Handle save conflict
     */
    async function handleConflict() {
        const choice = await new Promise((resolve) => {
            // Show conflict dialog
            const dialog = confirm(
                'Another user has made changes to this media kit.\n\n' +
                'Choose OK to reload their changes (you will lose your changes).\n' +
                'Choose Cancel to overwrite their changes with yours.'
            );
            
            resolve(dialog ? 'reload' : 'overwrite');
        });
        
        if (choice === 'reload') {
            // Reload server state
            await mediaKitStore.initialize();
            saveConflict.value = null;
            
            if (showNotifications) {
                uiStore.showToast('Reloaded latest version', 'info');
            }
        } else {
            // Overwrite server state
            saveConflict.value = null;
            await performSave();
        }
    }
    
    /**
     * Create debounced save function
     */
    const debouncedSave = debounce(performSave, delay);
    
    /**
     * Trigger auto-save
     */
    function triggerAutoSave() {
        if (!autoSaveEnabled.value) {
            console.log('⏭️ Auto-save disabled');
            return;
        }
        
        pendingSave.value = true;
        debouncedSave();
    }
    
    /**
     * Force immediate save
     */
    async function saveNow() {
        // Cancel any pending debounced save
        debouncedSave.cancel?.();
        pendingSave.value = false;
        
        // Perform immediate save
        return await performSave();
    }
    
    /**
     * Enable auto-save
     */
    function enable() {
        autoSaveEnabled.value = true;
        
        // Trigger save if dirty
        if (isDirty.value) {
            triggerAutoSave();
        }
    }
    
    /**
     * Disable auto-save
     */
    function disable() {
        autoSaveEnabled.value = false;
        
        // Cancel pending save
        debouncedSave.cancel?.();
        pendingSave.value = false;
    }
    
    /**
     * Reset save statistics
     */
    function resetStats() {
        saveCount.value = 0;
        failCount.value = 0;
        conflictCount.value = 0;
    }
    
    /**
     * Watch for changes and trigger auto-save
     */
    const stopWatcher = watch(
        () => mediaKitStore.isDirty,
        (isDirty) => {
            if (isDirty && autoSaveEnabled.value) {
                triggerAutoSave();
            }
        }
    );
    
    /**
     * Handle window unload
     */
    async function handleBeforeUnload(e) {
        if (isDirty.value && !isSaving.value) {
            // Try to save before leaving
            await saveNow();
            
            // Show warning if still dirty
            if (mediaKitStore.isDirty) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
                return e.returnValue;
            }
        }
    }
    
    /**
     * Handle visibility change (tab switch)
     */
    function handleVisibilityChange() {
        if (!document.hidden && isDirty.value && autoSaveEnabled.value) {
            // Save when tab becomes visible again
            triggerAutoSave();
        }
    }
    
    // Setup event listeners
    onMounted(() => {
        window.addEventListener('beforeunload', handleBeforeUnload);
        document.addEventListener('visibilitychange', handleVisibilityChange);
    });
    
    // Cleanup
    onUnmounted(() => {
        stopWatcher();
        window.removeEventListener('beforeunload', handleBeforeUnload);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        
        // Cancel any pending save
        debouncedSave.cancel?.();
    });
    
    return {
        // State
        isSaving,
        lastSaved,
        saveError,
        saveConflict,
        autoSaveEnabled,
        pendingSave,
        
        // Computed
        isDirty,
        canSave,
        timeSinceLastSave,
        
        // Statistics
        saveCount,
        failCount,
        conflictCount,
        
        // Methods
        triggerAutoSave,
        saveNow,
        enable,
        disable,
        handleConflict,
        resetStats
    };
}
