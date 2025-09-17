/**
 * Section State Persistence
 * Handles saving and loading section state with WordPress
 * 
 * @version 1.0.0
 * @package GMKB/Services
 */

class SectionStatePersistence {
    constructor() {
        this.logger = window.StructuredLogger || console;
        this.stateManager = null;
        this.sectionLayoutManager = null;
        this.saveDebounceTimer = null;
        this.isSaving = false;
        
        this.logger.info('💾 Section State Persistence initializing');
        this.initializePersistence();
    }
    
    initializePersistence() {
        // Wait for systems
        document.addEventListener('gmkb:core-systems-ready', () => {
            this.onCoreSystemsReady();
        });
        
        // Listen for section changes
        this.setupSectionListeners();
        
        // Try immediate init
        if (window.enhancedStateManager && window.sectionLayoutManager) {
            this.onCoreSystemsReady();
        }
    }
    
    onCoreSystemsReady() {
        this.stateManager = window.enhancedStateManager;
        this.sectionLayoutManager = window.sectionLayoutManager;
        
        if (!this.stateManager || !this.sectionLayoutManager) {
            this.logger.warn('⚠️ Required systems not available for section persistence');
            return;
        }
        
        // Load existing sections from state
        this.loadSectionsFromState();
        
        // Setup auto-save
        this.setupAutoSave();
        
        this.logger.info('✅ Section State Persistence ready');
    }
    
    /**
     * Setup listeners for section changes
     */
    setupSectionListeners() {
        const events = [
            'gmkb:section-registered',
            'gmkb:section-updated',
            'gmkb:section-removed',
            'gmkb:sections-reordered',
            'gmkb:component-assigned-to-section',
            'gmkb:component-removed-from-section',
            'gmkb:component-moved-to-section'
        ];
        
        events.forEach(eventType => {
            document.addEventListener(eventType, (event) => {
                this.handleSectionChange(event.type, event.detail);
            });
        });
    }
    
    /**
     * Handle section state changes
     */
    handleSectionChange(eventType, detail) {
        this.logger.debug(`📝 Section change: ${eventType}`, detail);
        
        // Update state with sections
        this.updateStateWithSections();
        
        // Trigger debounced save
        this.debouncedSave();
    }
    
    /**
     * Update state manager with current sections
     */
    updateStateWithSections() {
        if (!this.stateManager || !this.sectionLayoutManager) return;
        
        const sections = this.sectionLayoutManager.getSectionsInOrder();
        
        // Include component assignments in section data
        const sectionsWithComponents = sections.map(section => {
            // Get actual component elements in this section
            const sectionElement = document.querySelector(`[data-section-id="${section.section_id}"]`);
            const componentElements = sectionElement ? 
                sectionElement.querySelectorAll('.gmkb-component') : [];
            
            // Build component list from DOM
            const components = Array.from(componentElements).map((el, index) => ({
                component_id: el.dataset.componentId,
                column: parseInt(el.closest('[data-column]')?.dataset.column) || 1,
                order: index
            }));
            
            return {
                ...section,
                components: components.length > 0 ? components : section.components
            };
        });
        
        // Update state
        this.stateManager.dispatch({
            type: 'UPDATE_SECTIONS',
            payload: sectionsWithComponents
        });
        
        this.logger.debug(`💾 Updated state with ${sectionsWithComponents.length} sections`);
    }
    
    /**
     * Debounced save function
     */
    debouncedSave() {
        // Clear existing timer
        if (this.saveDebounceTimer) {
            clearTimeout(this.saveDebounceTimer);
        }
        
        // Set new timer
        this.saveDebounceTimer = setTimeout(() => {
            this.saveToWordPress();
        }, 1000); // Save after 1 second of no changes
    }
    
    /**
     * Save sections to WordPress
     */
    async saveToWordPress() {
        if (this.isSaving) {
            this.logger.debug('⏳ Save already in progress, skipping');
            return;
        }
        
        if (!window.gmkbData || !window.gmkbData.ajaxUrl) {
            this.logger.error('❌ WordPress AJAX data not available');
            return;
        }
        
        this.isSaving = true;
        
        try {
            const state = this.stateManager.getState();
            const sections = state.sections || [];
            
            // ROOT FIX: Include sections in the complete state save
            // This ensures sections are saved along with components
            const completeState = {
            ...state,
            sections: sections,
            timestamp: Date.now()
            };
            
            // Prepare save data
            const saveData = {
                action: 'guestify_save_media_kit',
                    nonce: window.gmkbData.nonce,
                    post_id: window.gmkbData.postId,
                    state: JSON.stringify(completeState)
                };
            
            // Send AJAX request
            const response = await fetch(window.gmkbData.ajaxUrl, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(saveData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.logger.info(`✅ Sections saved successfully (${sections.length} sections)`);
                
                // Update save indicator
                this.updateSaveIndicator('saved');
                
                // Dispatch save success event
                document.dispatchEvent(new CustomEvent('gmkb:sections-saved', {
                    detail: { sections: sections.length, timestamp: Date.now() }
                }));
            } else {
                throw new Error(result.data?.message || 'Save failed');
            }
            
        } catch (error) {
            this.logger.error('❌ Failed to save sections:', error);
            this.updateSaveIndicator('error');
            
            // Show error to user
            if (window.showToast) {
                window.showToast('Failed to save sections. Please try again.', 'error');
            }
        } finally {
            this.isSaving = false;
        }
    }
    
    /**
     * Load sections from state on initialization
     */
    loadSectionsFromState() {
        if (!this.stateManager || !this.sectionLayoutManager) return;
        
        const state = this.stateManager.getState();
        const sections = state.sections || [];
        
        if (sections.length > 0) {
            this.logger.info(`📥 Loading ${sections.length} sections from saved state`);
            
            // ROOT FIX: Don't render sections here - they're already rendered by SectionRenderer
            // This was causing duplicate rendering
            // The SectionLayoutManager and SectionRenderer handle initial rendering
            // We only need to handle persistence, not rendering
        }
    }
    
    /**
     * Setup auto-save functionality
     */
    setupAutoSave() {
        // Auto-save every 30 seconds if there are changes
        setInterval(() => {
            if (this.hasUnsavedChanges()) {
                this.saveToWordPress();
            }
        }, 30000);
        
        // Save on page unload if there are changes
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges()) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
            }
        });
    }
    
    /**
     * Check if there are unsaved changes
     */
    hasUnsavedChanges() {
        // Check save indicator or track changes
        const indicator = document.querySelector('.toolbar__status-dot');
        return indicator && !indicator.classList.contains('toolbar__status-dot--saved');
    }
    
    /**
     * Update save indicator in toolbar
     */
    updateSaveIndicator(status) {
        const indicator = document.querySelector('.toolbar__status-dot');
        const text = document.querySelector('.toolbar__status span');
        
        if (indicator) {
            indicator.classList.remove('toolbar__status-dot--saving', 'toolbar__status-dot--saved', 'toolbar__status-dot--error');
            
            switch(status) {
                case 'saving':
                    indicator.classList.add('toolbar__status-dot--saving');
                    if (text) text.textContent = 'Saving...';
                    break;
                case 'saved':
                    indicator.classList.add('toolbar__status-dot--saved');
                    if (text) text.textContent = 'Saved';
                    break;
                case 'error':
                    indicator.classList.add('toolbar__status-dot--error');
                    if (text) text.textContent = 'Error';
                    break;
            }
        }
    }
    
    /**
     * Manual save trigger
     */
    save() {
        this.updateStateWithSections();
        return this.saveToWordPress();
    }
    
    /**
     * Get debug info
     */
    getDebugInfo() {
        const state = this.stateManager?.getState();
        return {
            sectionsInState: state?.sections?.length || 0,
            isSaving: this.isSaving,
            hasUnsavedChanges: this.hasUnsavedChanges()
        };
    }
}

// Initialize
window.SectionStatePersistence = SectionStatePersistence;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.sectionStatePersistence = new SectionStatePersistence();
    });
} else {
    window.sectionStatePersistence = new SectionStatePersistence();
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SectionStatePersistence;
}