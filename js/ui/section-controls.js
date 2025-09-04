/**
 * Section Controls UI
 * Phase 3: Section Layer System
 * 
 * UI controls for section editing and management
 * Following checklist: Event-Driven, Simplicity First
 * 
 * @version 3.0.0-phase3
 * @package GMKB/JS/UI
 */

class SectionControlsUI {
    constructor() {
        this.logger = window.StructuredLogger || console;
        this.sectionLayoutManager = null;
        this.activeSection = null;
        
        this.logger.info('🎛️ PHASE 3: SectionControlsUI initializing');
        this.initializeControls();
    }
    
    /**
     * Initialize section controls
     * Following checklist: Event-Driven Initialization, Dependency-Awareness
     */
    initializeControls() {
        // Wait for core systems and section manager
        document.addEventListener('gmkb:core-systems-ready', () => {
            this.onCoreSystemsReady();
        });
        
        // Listen for section events
        document.addEventListener('gmkb:section-registered', (event) => {
            this.onSectionRegistered(event.detail);
        });
        
        document.addEventListener('gmkb:section-updated', (event) => {
            this.onSectionUpdated(event.detail);
        });
        
        document.addEventListener('gmkb:section-removed', (event) => {
            this.onSectionRemoved(event.detail);
        });
        
        // Listen for component events that affect sections
        document.addEventListener('gmkb:component-added', (event) => {
            this.refreshSectionControls();
        });
        
        document.addEventListener('gmkb:component-removed', (event) => {
            this.refreshSectionControls();
        });
        
        this.logger.info('✅ PHASE 3: SectionControlsUI initialized');
    }
    
    /**
     * Handle core systems ready
     * Following checklist: Dependency-Awareness, No Global Object Sniffing
     */
    onCoreSystemsReady() {
        if (window.sectionLayoutManager) {
            this.sectionLayoutManager = window.sectionLayoutManager;
            this.setupSectionInteractions();
        }
        
        this.logger.info('🎯 PHASE 3: Section controls ready - interactions setup');
    }
    
    /**
     * Setup section interaction handlers
     * Following checklist: Event-Driven, No Polling
     */
    setupSectionInteractions() {
        // Section hover effects
        document.addEventListener('mouseover', (event) => {
            const section = event.target.closest('.gmkb-section');
            if (section) {
                this.handleSectionHover(section, true);
            }
        });
        
        document.addEventListener('mouseout', (event) => {
            const section = event.target.closest('.gmkb-section');
            if (section) {
                this.handleSectionHover(section, false);
            }
        });
        
        // Section click handlers
        document.addEventListener('click', (event) => {
            // Section edit button (pencil icon)
            if (event.target.matches('.gmkb-section__control--edit, .gmkb-section__control--edit *')) {
                event.preventDefault();
                event.stopPropagation();
                const section = event.target.closest('.gmkb-section');
                if (section) {
                    const sectionId = section.dataset.sectionId || section.id?.replace('section-', '');
                    if (sectionId) {
                        // Dispatch event for section edit panel
                        document.dispatchEvent(new CustomEvent('gmkb:section-edit-requested', {
                            detail: { sectionId }
                        }));
                        this.logger.info(`✉️ PHASE 3: Edit requested for section ${sectionId}`);
                    }
                }
                return;
            }
            
            // Section settings button (legacy - redirect to edit panel)
            if (event.target.matches('.gmkb-section__control-btn--settings, .gmkb-section__control-btn--settings *')) {
                event.preventDefault();
                event.stopPropagation();
                const section = event.target.closest('.gmkb-section');
                if (section) {
                    const sectionId = section.dataset.sectionId || section.id?.replace('section-', '');
                    if (sectionId) {
                        // Dispatch event for section edit panel instead of opening modal
                        document.dispatchEvent(new CustomEvent('gmkb:section-edit-requested', {
                            detail: { sectionId }
                        }));
                        this.logger.info(`🎯 PHASE 3: Settings redirected to edit panel for section ${sectionId}`);
                    }
                }
                return;
            }
            
            // Section add button
            if (event.target.matches('.gmkb-section__control-btn--add')) {
                event.preventDefault();
                event.stopPropagation();
                const section = event.target.closest('.gmkb-section');
                if (section) {
                    this.addSectionAfter(section.dataset.sectionId);
                }
                return;
            }
            
            // Section remove button
            if (event.target.matches('.gmkb-section__control-btn--remove')) {
                event.preventDefault();
                event.stopPropagation();
                const section = event.target.closest('.gmkb-section');
                if (section) {
                    this.removeSectionWithConfirm(section.dataset.sectionId);
                }
                return;
            }
            
            // Section type change
            if (event.target.matches('.gmkb-section-type-option')) {
                event.preventDefault();
                const sectionId = event.target.dataset.sectionId;
                const newType = event.target.dataset.sectionType;
                this.changeSectionType(sectionId, newType);
                return;
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            if (this.activeSection) {
                this.handleSectionKeyboard(event);
            }
        });
        
        this.logger.info('🎛️ PHASE 3: Section interactions setup complete');
    }
    
    /**
     * Handle section hover states
     * Following checklist: Simplicity First
     */
    handleSectionHover(sectionElement, isHover) {
        const controls = sectionElement.querySelector('.gmkb-section__controls');
        if (!controls) {
            this.addSectionControls(sectionElement);
        }
        
        if (isHover) {
            sectionElement.classList.add('gmkb-section--hovered');
        } else {
            sectionElement.classList.remove('gmkb-section--hovered');
        }
    }
    
    /**
     * Add section controls to a section element
     * Following checklist: No Redundant Logic, Maintainability
     */
    addSectionControls(sectionElement) {
        const existingControls = sectionElement.querySelector('.gmkb-section__controls');
        if (existingControls) return; // Already has controls
        
        const sectionId = sectionElement.dataset.sectionId;
        const sectionType = sectionElement.dataset.sectionType;
        
        const controlsHtml = `
            <div class="gmkb-section__controls">
                <button class="gmkb-section__control-btn gmkb-section__control-btn--settings" 
                        title="Section Settings" 
                        data-section-id="${sectionId}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                </button>
                <button class="gmkb-section__control-btn gmkb-section__control-btn--add" 
                        title="Add Section After" 
                        data-section-id="${sectionId}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                </button>
                <button class="gmkb-section__control-btn gmkb-section__control-btn--remove" 
                        title="Remove Section" 
                        data-section-id="${sectionId}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3,6 5,6 21,6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                </button>
            </div>
        `;
        
        sectionElement.insertAdjacentHTML('beforeend', controlsHtml);
        
        this.logger.debug(`🎛️ PHASE 3: Added controls to section ${sectionId}`);
    }
    
    /**
     * Open section settings modal
     * Following checklist: Event-Driven, Schema Compliance
     */
    openSectionSettings(sectionId) {
        if (!this.sectionLayoutManager) return;
        
        const section = this.sectionLayoutManager.getSection(sectionId);
        if (!section) {
            this.logger.warn(`⚠️ PHASE 3: Cannot open settings - section ${sectionId} not found`);
            return;
        }
        
        this.activeSection = sectionId;
        
        // Create settings modal
        const modal = this.createSectionSettingsModal(section);
        document.body.appendChild(modal);
        
        // Show modal
        requestAnimationFrame(() => {
            modal.classList.add('gmkb-modal--visible');
            const firstInput = modal.querySelector('input, select, textarea');
            if (firstInput) firstInput.focus();
        });
        
        this.logger.info(`🎛️ PHASE 3: Opened settings for section ${sectionId}`);
    }
    
    /**
     * Create section settings modal
     * Following checklist: Maintainability, Documentation
     */
    createSectionSettingsModal(section) {
        const modal = document.createElement('div');
        modal.className = 'gmkb-modal gmkb-section-settings-modal';
        modal.dataset.sectionId = section.section_id;
        
        modal.innerHTML = `
            <div class="gmkb-modal__overlay"></div>
            <div class="gmkb-modal__content">
                <div class="gmkb-modal__header">
                    <h3 class="gmkb-modal__title">Section Settings</h3>
                    <button class="gmkb-modal__close" type="button">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                
                <div class="gmkb-modal__body">
                    <form class="gmkb-section-settings-form" data-section-id="${section.section_id}">
                        
                        <!-- Section Type -->
                        <div class="gmkb-form-group">
                            <label class="gmkb-form-label">Section Type</label>
                            <select class="gmkb-form-select" name="section_type">
                                <option value="full_width" ${section.section_type === 'full_width' ? 'selected' : ''}>Full Width</option>
                                <option value="two_column" ${section.section_type === 'two_column' ? 'selected' : ''}>Two Column</option>
                                <option value="three_column" ${section.section_type === 'three_column' ? 'selected' : ''}>Three Column</option>
                                <option value="grid" ${section.section_type === 'grid' ? 'selected' : ''}>Grid</option>
                                <option value="hero" ${section.section_type === 'hero' ? 'selected' : ''}>Hero</option>
                            </select>
                        </div>
                        
                        <!-- Background -->
                        <div class="gmkb-form-group">
                            <label class="gmkb-form-label">Background</label>
                            <select class="gmkb-form-select" name="background_type">
                                <option value="none" ${section.section_options?.background_type === 'none' ? 'selected' : ''}>None</option>
                                <option value="color" ${section.section_options?.background_type === 'color' ? 'selected' : ''}>Color</option>
                                <option value="gradient" ${section.section_options?.background_type === 'gradient' ? 'selected' : ''}>Gradient</option>
                            </select>
                        </div>
                        
                        <div class="gmkb-form-group" id="background-color-group" style="display: ${section.section_options?.background_type !== 'none' ? 'block' : 'none'};">
                            <label class="gmkb-form-label">Background Color</label>
                            <input type="color" class="gmkb-form-color" name="background_color" value="${section.section_options?.background_color || '#295cff'}">
                        </div>
                        
                        <!-- Spacing -->
                        <div class="gmkb-form-group">
                            <label class="gmkb-form-label">Top Spacing</label>
                            <select class="gmkb-form-select" name="spacing_top">
                                <option value="none" ${section.section_options?.spacing_top === 'none' ? 'selected' : ''}>None</option>
                                <option value="small" ${section.section_options?.spacing_top === 'small' ? 'selected' : ''}>Small</option>
                                <option value="medium" ${section.section_options?.spacing_top === 'medium' ? 'selected' : ''}>Medium</option>
                                <option value="large" ${section.section_options?.spacing_top === 'large' ? 'selected' : ''}>Large</option>
                            </select>
                        </div>
                        
                        <div class="gmkb-form-group">
                            <label class="gmkb-form-label">Bottom Spacing</label>
                            <select class="gmkb-form-select" name="spacing_bottom">
                                <option value="none" ${section.section_options?.spacing_bottom === 'none' ? 'selected' : ''}>None</option>
                                <option value="small" ${section.section_options?.spacing_bottom === 'small' ? 'selected' : ''}>Small</option>
                                <option value="medium" ${section.section_options?.spacing_bottom === 'medium' ? 'selected' : ''}>Medium</option>
                                <option value="large" ${section.section_options?.spacing_bottom === 'large' ? 'selected' : ''}>Large</option>
                            </select>
                        </div>
                        
                        <!-- Layout specific settings -->
                        <div class="gmkb-form-group" id="layout-settings">
                            <label class="gmkb-form-label">Max Width</label>
                            <input type="text" class="gmkb-form-input" name="max_width" value="${section.layout?.max_width || '1200px'}" placeholder="1200px">
                        </div>
                        
                    </form>
                </div>
                
                <div class="gmkb-modal__footer">
                    <button type="button" class="gmkb-btn gmkb-btn--secondary gmkb-modal-cancel">Cancel</button>
                    <button type="button" class="gmkb-btn gmkb-btn--primary gmkb-section-settings-save">Save Changes</button>
                </div>
            </div>
        `;
        
        // Add event listeners
        this.attachModalEventListeners(modal);
        
        return modal;
    }
    
    /**
     * Attach event listeners to modal
     * Following checklist: Event-Driven, No Redundant Logic
     */
    attachModalEventListeners(modal) {
        const closeBtn = modal.querySelector('.gmkb-modal__close');
        const cancelBtn = modal.querySelector('.gmkb-modal-cancel');
        const saveBtn = modal.querySelector('.gmkb-section-settings-save');
        const overlay = modal.querySelector('.gmkb-modal__overlay');
        const backgroundTypeSelect = modal.querySelector('select[name="background_type"]');
        const backgroundColorGroup = modal.querySelector('#background-color-group');
        
        // Close handlers
        const closeModal = () => this.closeSectionSettingsModal(modal);
        
        closeBtn?.addEventListener('click', closeModal);
        cancelBtn?.addEventListener('click', closeModal);
        overlay?.addEventListener('click', closeModal);
        
        // Save handler
        saveBtn?.addEventListener('click', () => {
            this.saveSectionSettings(modal);
        });
        
        // Background type change
        backgroundTypeSelect?.addEventListener('change', (e) => {
            const showColorPicker = e.target.value !== 'none';
            backgroundColorGroup.style.display = showColorPicker ? 'block' : 'none';
        });
        
        // Keyboard handlers
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        });
    }
    
    /**
     * Save section settings
     * Following checklist: Centralized State, Schema Compliance
     */
    saveSectionSettings(modal) {
        const form = modal.querySelector('.gmkb-section-settings-form');
        const sectionId = form.dataset.sectionId;
        
        if (!this.sectionLayoutManager) return;
        
        const formData = new FormData(form);
        const updates = {
            section_type: formData.get('section_type'),
            layout: {
                max_width: formData.get('max_width')
            },
            section_options: {
                background_type: formData.get('background_type'),
                background_color: formData.get('background_color'),
                spacing_top: formData.get('spacing_top'),
                spacing_bottom: formData.get('spacing_bottom')
            }
        };
        
        // Update section
        const updatedSection = this.sectionLayoutManager.updateSectionConfiguration(sectionId, updates);
        
        if (updatedSection) {
            // Re-render section with new configuration
            this.rerenderSection(sectionId);
            
            this.logger.info(`✅ PHASE 3: Saved settings for section ${sectionId}`);
            
            // Show success feedback
            this.showSuccessMessage('Section settings saved successfully!');
        } else {
            this.logger.error(`❌ PHASE 3: Failed to save settings for section ${sectionId}`);
            this.showErrorMessage('Failed to save section settings.');
        }
        
        this.closeSectionSettingsModal(modal);
    }
    
    /**
     * Close section settings modal
     * Following checklist: Simplicity First, Graceful Failure
     */
    closeSectionSettingsModal(modal) {
        modal.classList.remove('gmkb-modal--visible');
        
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
        
        this.activeSection = null;
    }
    
    /**
     * Add new section after current section
     * Following checklist: Event-Driven, Centralized State
     */
    addSectionAfter(sectionId) {
        if (!this.sectionLayoutManager) return;
        
        const newSectionId = `section_${Date.now()}`;
        const newSection = this.sectionLayoutManager.registerSection(newSectionId, 'full_width');
        
        if (newSection) {
            // Insert after current section in order
            const currentOrder = this.sectionLayoutManager.sectionOrder;
            const currentIndex = currentOrder.indexOf(sectionId);
            
            if (currentIndex !== -1) {
                currentOrder.splice(currentIndex + 1, 0, newSectionId);
                this.sectionLayoutManager.reorderSections(currentOrder);
            }
            
            this.logger.info(`✅ PHASE 3: Added new section ${newSectionId} after ${sectionId}`);
            this.showSuccessMessage('New section added!');
        }
    }
    
    /**
     * Remove section with confirmation
     * Following checklist: Graceful Failure, User-Friendly
     */
    removeSectionWithConfirm(sectionId) {
        if (!this.sectionLayoutManager) return;
        
        const section = this.sectionLayoutManager.getSection(sectionId);
        if (!section) return;
        
        const hasComponents = section.components && section.components.length > 0;
        const message = hasComponents 
            ? `This section contains ${section.components.length} component(s). Are you sure you want to remove it?`
            : 'Are you sure you want to remove this section?';
        
        if (confirm(message)) {
            const success = this.sectionLayoutManager.removeSection(sectionId);
            if (success) {
                this.logger.info(`✅ PHASE 3: Removed section ${sectionId}`);
                this.showSuccessMessage('Section removed successfully!');
            } else {
                this.showErrorMessage('Failed to remove section.');
            }
        }
    }
    
    /**
     * Change section type
     * Following checklist: Schema Compliance, Event-Driven
     */
    changeSectionType(sectionId, newType) {
        if (!this.sectionLayoutManager) return;
        
        const updatedSection = this.sectionLayoutManager.updateSectionConfiguration(sectionId, {
            section_type: newType
        });
        
        if (updatedSection) {
            this.rerenderSection(sectionId);
            this.logger.info(`✅ PHASE 3: Changed section ${sectionId} type to ${newType}`);
        }
    }
    
    /**
     * Re-render section with new configuration
     * Following checklist: Event-Driven, No Direct Manipulation
     */
    rerenderSection(sectionId) {
        // Dispatch event for section renderer to handle
        const event = new CustomEvent('gmkb:section-rerender-requested', {
            detail: {
                sectionId,
                timestamp: Date.now()
            }
        });
        
        document.dispatchEvent(event);
    }
    
    /**
     * Handle keyboard shortcuts for sections
     * Following checklist: Accessibility, User Experience
     */
    handleSectionKeyboard(event) {
        if (!this.activeSection) return;
        
        // Ctrl/Cmd + D: Duplicate section
        if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
            event.preventDefault();
            this.duplicateSection(this.activeSection);
            return;
        }
        
        // Delete key: Remove section (with confirmation)
        if (event.key === 'Delete') {
            event.preventDefault();
            this.removeSectionWithConfirm(this.activeSection);
            return;
        }
    }
    
    /**
     * Event handlers for section lifecycle
     * Following checklist: Event-Driven, Maintainability
     */
    onSectionRegistered(detail) {
        this.refreshSectionControls();
        this.logger.debug(`🎛️ PHASE 3: Section registered - refreshing controls`);
    }
    
    onSectionUpdated(detail) {
        this.refreshSectionControls();
        this.logger.debug(`🎛️ PHASE 3: Section updated - refreshing controls`);
    }
    
    onSectionRemoved(detail) {
        this.refreshSectionControls();
        this.logger.debug(`🎛️ PHASE 3: Section removed - refreshing controls`);
    }
    
    /**
     * Refresh section controls
     * Following checklist: No Redundant Logic, Performance
     */
    refreshSectionControls() {
        // Add controls to any sections that don't have them
        const sections = document.querySelectorAll('.gmkb-section:not(:has(.gmkb-section__controls))');
        sections.forEach(section => {
            this.addSectionControls(section);
        });
    }
    
    /**
     * Utility methods for user feedback
     * Following checklist: Actionable Error Messages, User Experience
     */
    showSuccessMessage(message) {
        if (window.enhancedToast) {
            window.enhancedToast.showSuccess(message);
        } else {
            console.info('✅', message);
        }
    }
    
    showErrorMessage(message) {
        if (window.enhancedToast) {
            window.enhancedToast.showError(message);
        } else {
            console.error('❌', message);
        }
    }
    
    /**
     * Debug method - get current state
     * Following checklist: Diagnostic Logging
     */
    getDebugInfo() {
        return {
            activeSection: this.activeSection,
            sectionLayoutManagerAvailable: !!this.sectionLayoutManager,
            sectionsWithControls: document.querySelectorAll('.gmkb-section:has(.gmkb-section__controls)').length,
            totalSections: document.querySelectorAll('.gmkb-section').length
        };
    }
}

// Global instance
window.SectionControlsUI = SectionControlsUI;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.sectionControlsUI = new SectionControlsUI();
    });
} else {
    window.sectionControlsUI = new SectionControlsUI();
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SectionControlsUI;
}
