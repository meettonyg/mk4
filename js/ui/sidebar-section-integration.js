/**
 * Sidebar Section Integration
 * Phase 3: Section Layer System - Sidebar Integration
 * 
 * Connects sidebar section layout buttons to SectionLayoutManager
 * Makes section creation functional from the sidebar
 * 
 * @version 3.0.0-phase3-sidebar
 * @package GMKB/JS/UI
 */

// ROOT FIX: Immediate diagnostic to confirm script loads
console.log('🔍 sidebar-section-integration.js SCRIPT LOADED');

// ROOT FIX: Wrap in try-catch to catch any initialization errors
try {

class SidebarSectionIntegration {
    constructor() {
        this.logger = window.StructuredLogger || console;
        this.sectionLayoutManager = null;
        this.sectionRenderer = null; // ROOT FIX: Add section renderer reference
        this.selectedLayout = 'full_width'; // Default
        this.initialized = false; // ROOT FIX: Prevent duplicate initialization
        this.coreSystemsHandled = false; // ROOT FIX: Prevent duplicate core systems handling
        this.handlersSetup = false; // Already present, keeping for clarity
        
        this.logger.info('🎛️ PHASE 3: SidebarSectionIntegration initializing');
        this.initializeIntegration();
    }
    
    /**
     * Initialize sidebar section integration
     * Following checklist: Event-Driven Initialization, Dependency-Awareness
     */
    initializeIntegration() {
        // ROOT FIX: Prevent duplicate event listeners with flag
        if (this.initialized) {
            this.logger.warn('⚠️ PHASE 3: SidebarSectionIntegration already initialized, skipping');
            return;
        }
        this.initialized = true;
        
        // Wait for core systems to be ready
        document.addEventListener('gmkb:core-systems-ready', (event) => {
            // ROOT FIX: Prevent duplicate handler calls
            if (!this.coreSystemsHandled) {
                this.coreSystemsHandled = true;
                this.onCoreSystemsReady();
            }
        });
        
        // Initialize immediately if systems are already ready
        if (window.sectionLayoutManager && !this.coreSystemsHandled) {
            this.sectionLayoutManager = window.sectionLayoutManager;
            this.coreSystemsHandled = true;
            this.setupSidebarHandlers();
        }
        
        this.logger.info('✅ PHASE 3: SidebarSectionIntegration initialized');
    }
    
    /**
     * Handle core systems ready event
     * Following checklist: Dependency-Awareness, No Global Object Sniffing
     */
    onCoreSystemsReady() {
        // ROOT FIX: Get both manager and renderer
        this.sectionLayoutManager = window.sectionLayoutManager;
        this.sectionRenderer = window.sectionRenderer;
        
        if (!this.handlersSetup) {
            this.setupSidebarHandlers();
        }
        
        this.logger.info('🎯 PHASE 3: Sidebar integration ready - section manager and renderer connected');
    }
    
    /**
     * Setup sidebar event handlers
     * Following checklist: Event-Driven, No Polling
     */
    setupSidebarHandlers() {
        // Prevent duplicate event listener setup
        if (this.handlersSetup) {
            this.logger.warn('⚠️ PHASE 3: Sidebar handlers already setup, skipping duplicate setup');
            return;
        }
        this.handlersSetup = true;
        
        // Layout option selection
        document.addEventListener('click', (event) => {
            // Layout option clicks
            if (event.target.closest('.layout-option')) {
                event.preventDefault();
                event.stopPropagation();
                this.handleLayoutOptionClick(event.target.closest('.layout-option'));
                return;
            }
            
            // Add section button
            if (event.target.matches('#add-section-btn') || event.target.closest('#add-section-btn')) {
                event.preventDefault();
                event.stopPropagation();
                this.handleAddSection();
                return;
            }
            
            // Duplicate section button  
            if (event.target.matches('#duplicate-section-btn') || event.target.closest('#duplicate-section-btn')) {
                event.preventDefault();
                event.stopPropagation();
                this.handleDuplicateSection();
                return;
            }
        }, { once: false }); // Use event delegation but prevent duplicate setup
        
        // Global settings changes
        const maxWidthInput = document.getElementById('global-max-width');
        const spacingInput = document.getElementById('global-spacing');
        
        if (maxWidthInput) {
            maxWidthInput.addEventListener('change', (e) => {
                this.handleGlobalMaxWidthChange(e.target.value);
            });
        }
        
        if (spacingInput) {
            spacingInput.addEventListener('change', (e) => {
                this.handleGlobalSpacingChange(e.target.value);
            });
        }
        
        // Initialize current selection
        this.updateLayoutSelection();
        
        this.logger.info('🎛️ PHASE 3: Sidebar handlers setup complete');
    }
    
    /**
     * Handle layout option selection
     * Following checklist: User Experience, Visual Feedback
     */
    handleLayoutOptionClick(layoutElement) {
        const layoutType = layoutElement.dataset.layout;
        
        if (!layoutType) {
            this.logger.warn('⚠️ PHASE 3: No layout type found on clicked element');
            return;
        }
        
        // Update visual selection
        this.updateLayoutSelection(layoutType);
        
        // Store selected layout for next section creation
        this.selectedLayout = this.mapLayoutNameToType(layoutType);
        
        this.logger.info(`🎛️ PHASE 3: Selected layout: ${layoutType} (mapped to: ${this.selectedLayout})`);
        
        // Show visual feedback
        this.showLayoutSelectionFeedback(layoutType);
    }
    
    /**
     * Map sidebar layout names to section types
     * Following checklist: Data Mapping, Consistency
     */
    mapLayoutNameToType(layoutName) {
        const mapping = {
            'full-width': 'full_width',
            'two-column': 'two_column', 
            'sidebar': 'main_sidebar',
            'three-column': 'three_column',
            'grid': 'grid',
            'hero': 'hero'
        };
        
        return mapping[layoutName] || 'full_width';
    }
    
    /**
     * Update layout selection visual state
     * Following checklist: Visual Consistency, User Experience
     */
    updateLayoutSelection(selectedLayout = null) {
        const layoutOptions = document.querySelectorAll('.layout-option');
        
        layoutOptions.forEach(option => {
            const isSelected = selectedLayout ? 
                (option.dataset.layout === selectedLayout) :
                option.classList.contains('layout-option--active');
                
            if (isSelected) {
                option.classList.add('layout-option--active');
                if (!selectedLayout) {
                    // Initialize from current selection
                    this.selectedLayout = this.mapLayoutNameToType(option.dataset.layout);
                }
            } else {
                option.classList.remove('layout-option--active');
            }
        });
    }
    
    /**
     * Handle add section button click
     * Following checklist: Integration with Section Manager
     * ROOT FIX: Ensure section is both created AND rendered
     */
    handleAddSection() {
        // Prevent rapid duplicate clicks
        if (this.isAddingSection) {
            this.logger.warn('⚠️ PHASE 3: Section creation already in progress, ignoring duplicate click');
            return;
        }
        this.isAddingSection = true;
        
        if (!this.sectionLayoutManager) {
            this.logger.error('❌ PHASE 3: SectionLayoutManager not available');
            this.showError('Section manager not ready. Please try again.');
            this.isAddingSection = false;
            return;
        }
        
        // ROOT FIX: Ensure containers are visible before creating section
        this.ensureContainersVisible();
        
        // ROOT FIX: Ensure SectionRenderer exists using factory function
        if (!window.sectionRenderer) {
            this.logger.warn('⚠️ PHASE 3: SectionRenderer not found, getting via factory');
            if (window.getSectionRenderer) {
                window.sectionRenderer = window.getSectionRenderer();
                this.logger.info('✅ PHASE 3: Got SectionRenderer instance from factory');
            } else if (window.SectionRenderer) {
                // Fallback: create directly if factory not available
                window.sectionRenderer = new window.SectionRenderer();
                this.logger.info('✅ PHASE 3: Created SectionRenderer instance directly');
            } else {
                this.logger.error('❌ PHASE 3: SectionRenderer not available at all');
                this.showError('Section renderer not available. Please refresh the page.');
                this.isAddingSection = false;
                return;
            }
        }
        
        // ROOT FIX: Create new section regardless of existing components or preview state
        const sectionId = `section_${Date.now()}`;
        
        this.logger.info(`🛠️ PHASE 3: Creating ${this.selectedLayout} section (ID: ${sectionId})`);
        
        const section = this.sectionLayoutManager.registerSection(sectionId, this.selectedLayout);
        
        if (section) {
            this.logger.info(`✅ PHASE 3: Created section ${sectionId} with layout ${this.selectedLayout}`);
            
            // ROOT FIX: Dispatch event that SectionRenderer listens to
            const event = new CustomEvent('gmkb:section-registered', {
                detail: {
                    sectionId: sectionId,
                    section: section,
                    sectionLayoutManager: this.sectionLayoutManager
                }
            });
            document.dispatchEvent(event);
            
            // ROOT FIX: Also directly call the renderer if available
            if (window.sectionRenderer && typeof window.sectionRenderer.renderSection === 'function') {
                this.logger.info(`🎨 PHASE 3: Directly calling sectionRenderer.renderSection for ${sectionId}`);
                // Small delay to ensure container is ready
                setTimeout(() => {
                    window.sectionRenderer.renderSection(section, this.sectionLayoutManager);
                }, 50);
            }
            
            // Show success feedback
            this.showSuccess(`Added ${this.getLayoutDisplayName(this.selectedLayout)} section!`);
            
            // ROOT FIX: Ensure section is visible and scrollable
            setTimeout(() => {
                this.verifySectionVisualRendering(sectionId);
                this.scrollToNewSection(sectionId);
                
                // ROOT FIX: Make section available for drag-drop immediately
                this.enableSectionForDragDrop(sectionId);
                
                this.isAddingSection = false;
            }, 300);
        } else {
            this.logger.error(`❌ PHASE 3: Failed to create section with layout ${this.selectedLayout}`);
            this.showError('Failed to create section. Please try again.');
            this.isAddingSection = false;
        }
    }
    
    /**
     * Verify that the section was visually rendered in the DOM
     * Following checklist: Visual Verification, Diagnostic Logging
     */
    verifySectionVisualRendering(sectionId) {
        const sectionElement = document.getElementById(`section-${sectionId}`) || 
                             document.querySelector(`[data-section-id="${sectionId}"]`) ||
                             document.querySelector(`[id="${sectionId}"]`);
        
        if (sectionElement) {
            this.logger.info(`✅ PHASE 3: Section ${sectionId} successfully rendered in DOM`);
        } else {
            this.logger.warn(`⚠️ PHASE 3: Section ${sectionId} was created but not found in DOM - possible rendering issue`);
            
            // Try to find any section elements for debugging
            const allSections = document.querySelectorAll('[class*="section"], [id*="section"], [data-section]');
            this.logger.debug(`🔍 PHASE 3: Found ${allSections.length} section-related elements in DOM`);
            
            // Check if section is in state manager
            if (this.sectionLayoutManager) {
                const sectionInState = this.sectionLayoutManager.getSection(sectionId);
                if (sectionInState) {
                    this.logger.debug(`📊 PHASE 3: Section ${sectionId} exists in state manager:`, sectionInState);
                } else {
                    this.logger.warn(`⚠️ PHASE 3: Section ${sectionId} not found in state manager either`);
                }
            }
        }
    }
    
    /**
     * Handle duplicate section button click
     * Following checklist: Advanced Features, User Experience
     */
    handleDuplicateSection() {
        if (!this.sectionLayoutManager) {
            this.logger.error('❌ PHASE 3: SectionLayoutManager not available');
            return;
        }
        
        // ROOT FIX: Ensure SectionRenderer is available
        if (!window.sectionRenderer) {
            if (window.getSectionRenderer) {
                window.sectionRenderer = window.getSectionRenderer();
            } else if (window.SectionRenderer) {
                window.sectionRenderer = new window.SectionRenderer();
            }
        }
        
        // Find currently selected section (for now, duplicate the last section)
        const sections = this.sectionLayoutManager.getSectionsInOrder();
        
        if (sections.length === 0) {
            this.showError('No sections to duplicate. Create a section first.');
            return;
        }
        
        const lastSection = sections[sections.length - 1];
        const newSectionId = `section_${Date.now()}`;
        
        // Create duplicate with same configuration
        const duplicatedSection = this.sectionLayoutManager.registerSection(
            newSectionId,
            lastSection.section_type,
            {
                layout: { ...lastSection.layout },
                section_options: { ...lastSection.section_options },
                responsive: { ...lastSection.responsive }
            }
        );
        
        if (duplicatedSection) {
            this.logger.info(`✅ PHASE 3: Duplicated section ${lastSection.section_id} as ${newSectionId}`);
            
            // ROOT FIX: Dispatch event that SectionRenderer listens to
            const event = new CustomEvent('gmkb:section-registered', {
                detail: {
                    sectionId: newSectionId,
                    section: duplicatedSection,
                    sectionLayoutManager: this.sectionLayoutManager
                }
            });
            document.dispatchEvent(event);
            
            // ROOT FIX: Also directly call renderer if available
            if (window.sectionRenderer && typeof window.sectionRenderer.renderSection === 'function') {
                setTimeout(() => {
                    window.sectionRenderer.renderSection(duplicatedSection, this.sectionLayoutManager);
                }, 50);
            }
            
            this.showSuccess(`Duplicated ${this.getLayoutDisplayName(lastSection.section_type)} section!`);
            
            // Scroll to new section
            setTimeout(() => {
                this.scrollToNewSection(newSectionId);
            }, 200);
        }
    }
    
    /**
     * Handle global max width change
     * Following checklist: Global Settings, State Management
     */
    handleGlobalMaxWidthChange(maxWidth) {
        // Update all sections with new max width
        if (this.sectionLayoutManager) {
            const sections = this.sectionLayoutManager.getAllSections();
            
            sections.forEach(section => {
                this.sectionLayoutManager.updateSectionConfiguration(section.section_id, {
                    layout: {
                        ...section.layout,
                        max_width: maxWidth
                    }
                });
            });
            
            this.logger.info(`🎛️ PHASE 3: Updated global max width to ${maxWidth}`);
            this.showSuccess(`Updated max width to ${maxWidth}`);
        }
    }
    
    /**
     * Handle global spacing change
     * Following checklist: Global Settings, State Management
     */
    handleGlobalSpacingChange(spacing) {
        // Update all sections with new spacing
        if (this.sectionLayoutManager) {
            const sections = this.sectionLayoutManager.getAllSections();
            
            sections.forEach(section => {
                this.sectionLayoutManager.updateSectionConfiguration(section.section_id, {
                    layout: {
                        ...section.layout,
                        padding: `${spacing} 20px`
                    }
                });
            });
            
            this.logger.info(`🎛️ PHASE 3: Updated global spacing to ${spacing}`);
            this.showSuccess(`Updated spacing to ${spacing}`);
        }
    }
    
    /**
     * Get display name for layout type
     * Following checklist: User-Friendly Labels
     */
    getLayoutDisplayName(layoutType) {
        const names = {
            'full_width': 'Full Width',
            'two_column': 'Two Column',
            'main_sidebar': 'Main + Sidebar', 
            'three_column': 'Three Column',
            'grid': 'Grid',
            'hero': 'Hero'
        };
        
        return names[layoutType] || layoutType;
    }
    
    /**
     * Show layout selection feedback
     * Following checklist: User Experience, Visual Feedback
     */
    showLayoutSelectionFeedback(layoutType) {
        // Add temporary highlight effect
        const selectedOption = document.querySelector(`.layout-option[data-layout="${layoutType}"]`);
        
        if (selectedOption) {
            selectedOption.classList.add('layout-option--feedback');
            
            setTimeout(() => {
                selectedOption.classList.remove('layout-option--feedback');
            }, 300);
        }
    }
    
    /**
     * Scroll to newly created section
     * Following checklist: User Experience, Navigation
     */
    scrollToNewSection(sectionId) {
        // Wait a moment for the section to render
        setTimeout(() => {
            const sectionElement = document.getElementById(`section-${sectionId}`);
            if (sectionElement) {
                sectionElement.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
                
                // Add temporary highlight
                sectionElement.classList.add('gmkb-section--newly-added');
                setTimeout(() => {
                    sectionElement.classList.remove('gmkb-section--newly-added');
                }, 2000);
            }
        }, 100);
    }
    
    /**
     * Show success message
     * Following checklist: User Feedback, Success States
     */
    showSuccess(message) {
        if (window.enhancedToast) {
            window.enhancedToast.showSuccess(message);
        } else if (window.showToast) {
            window.showToast(message, 'success');
        } else {
            console.log('✅', message);
        }
    }
    
    /**
     * Show error message
     * Following checklist: Error Handling, User Feedback
     */
    showError(message) {
        if (window.enhancedToast) {
            window.enhancedToast.showError(message);
        } else if (window.showToast) {
            window.showToast(message, 'error');
        } else {
            console.error('❌', message);
        }
    }
    
    /**
     * Update sidebar state based on current sections
     * Following checklist: State Synchronization
     */
    updateSidebarFromSections() {
        if (!this.sectionLayoutManager) return;
        
        const sections = this.sectionLayoutManager.getAllSections();
        const duplicateBtn = document.getElementById('duplicate-section-btn');
        
        // Enable/disable duplicate button based on sections
        if (duplicateBtn) {
            if (sections.length > 0) {
                duplicateBtn.disabled = false;
                duplicateBtn.classList.remove('section-btn--disabled');
            } else {
                duplicateBtn.disabled = true;
                duplicateBtn.classList.add('section-btn--disabled');
            }
        }
    }
    
    /**
     * ROOT FIX: Ensure all necessary containers are visible
     */
    ensureContainersVisible() {
        // Show the main saved components container
        const savedComponentsContainer = document.getElementById('saved-components-container');
        if (savedComponentsContainer && savedComponentsContainer.style.display === 'none') {
            savedComponentsContainer.style.display = 'block';
            this.logger.info('📦 PHASE 3: Made saved-components-container visible for sections');
        }
        
        // Show the sections container
        const sectionsContainer = document.getElementById('gmkb-sections-container');
        if (sectionsContainer && sectionsContainer.style.display === 'none') {
            sectionsContainer.style.display = 'block';
            this.logger.info('📦 PHASE 3: Made gmkb-sections-container visible');
        }
        
        // Hide empty state if it exists
        const emptyState = document.getElementById('empty-state');
        if (emptyState && emptyState.style.display !== 'none') {
            emptyState.style.display = 'none';
            this.logger.info('🚫 PHASE 3: Hidden empty state for sections');
        }
        
        // Show the main preview container
        const previewContainer = document.getElementById('media-kit-preview');
        if (previewContainer && previewContainer.style.display === 'none') {
            previewContainer.style.display = 'block';
            this.logger.info('📦 PHASE 3: Made media-kit-preview visible');
        }
    }
    
    /**
     * ROOT FIX: Enable section for drag-drop immediately after creation
     */
    enableSectionForDragDrop(sectionId) {
        const sectionElement = document.getElementById(`section-${sectionId}`) || 
                               document.querySelector(`[data-section-id="${sectionId}"]`);
        
        if (sectionElement) {
            // Make section a drop target
            sectionElement.addEventListener('dragover', this.handleSectionDragOver.bind(this));
            sectionElement.addEventListener('drop', this.handleSectionDrop.bind(this));
            sectionElement.classList.add('gmkb-section-drop-enabled');
            
            this.logger.info(`🎯 PHASE 3: Section ${sectionId} enabled for drag-drop`);
        } else {
            // Retry after a short delay if section not found
            setTimeout(() => {
                this.enableSectionForDragDrop(sectionId);
            }, 200);
        }
    }
    
    /**
     * ROOT FIX: Handle drag over section
     */
    handleSectionDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        
        const section = e.currentTarget;
        section.classList.add('gmkb-section-drag-over');
    }
    
    /**
    * ROOT FIX: Handle drop on section - capture section info before component creation
    */
    handleSectionDrop(e) {
    e.preventDefault();
    
    const section = e.currentTarget;
    section.classList.remove('gmkb-section-drag-over');
    
    const sectionId = section.getAttribute('data-section-id');
    this.logger.info(`🎯 PHASE 3: Component dropped directly on section ${sectionId}`);
    
    // ROOT FIX: Store section targeting information for drag-drop system
    if (window.sectionComponentIntegration && window.sectionComponentIntegration.dragData) {
            // Inject section targeting into the current drag data
                    window.sectionComponentIntegration.dragData.targetSectionId = sectionId;
                    window.sectionComponentIntegration.dragData.targetColumn = 1;
                    this.logger.info(`📌 PHASE 3: Injected section targeting: ${sectionId}`);
                }
            }
    
    /**
     * Debug method - get current state
     * Following checklist: Diagnostic Logging
     */
    getDebugInfo() {
        return {
            selectedLayout: this.selectedLayout,
            sectionLayoutManagerAvailable: !!this.sectionLayoutManager,
            layoutOptionsCount: document.querySelectorAll('.layout-option').length,
            addButtonAvailable: !!document.getElementById('add-section-btn'),
            sectionsCount: document.querySelectorAll('[data-section-id]').length,
            dragDropEnabledSections: document.querySelectorAll('.gmkb-section-drop-enabled').length
        };
    }
}

// Global instance
window.SidebarSectionIntegration = SidebarSectionIntegration;
console.log('✅ SidebarSectionIntegration class exposed globally');

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    console.log('⏳ Waiting for DOM to initialize SidebarSectionIntegration');
    document.addEventListener('DOMContentLoaded', () => {
        window.sidebarSectionIntegration = new SidebarSectionIntegration();
        console.log('✅ SidebarSectionIntegration instance created on DOMContentLoaded');
    });
} else {
    window.sidebarSectionIntegration = new SidebarSectionIntegration();
    console.log('✅ SidebarSectionIntegration instance created immediately');
}

} catch (error) {
    console.error('❌ CRITICAL: SidebarSectionIntegration initialization failed:', error);
    console.error('Stack trace:', error.stack);
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SidebarSectionIntegration;
}
