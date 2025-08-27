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
        
        // Create new section with selected layout
        const sectionId = `section_${Date.now()}`;
        const section = this.sectionLayoutManager.registerSection(sectionId, this.selectedLayout);
        
        if (section) {
            this.logger.info(`✅ PHASE 3: Created section ${sectionId} with layout ${this.selectedLayout}`);
            
            // Show success feedback
            this.showSuccess(`Added ${this.getLayoutDisplayName(this.selectedLayout)} section!`);
            
            // Check if section was rendered visually
            setTimeout(() => {
                this.verifySectionVisualRendering(sectionId);
                this.scrollToNewSection(sectionId);
                this.isAddingSection = false;
            }, 100);
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
            this.showSuccess(`Duplicated ${this.getLayoutDisplayName(lastSection.section_type)} section!`);
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
     * Debug method - get current state
     * Following checklist: Diagnostic Logging
     */
    getDebugInfo() {
        return {
            selectedLayout: this.selectedLayout,
            sectionLayoutManagerAvailable: !!this.sectionLayoutManager,
            layoutOptionsCount: document.querySelectorAll('.layout-option').length,
            addButtonAvailable: !!document.getElementById('add-section-btn')
        };
    }
}

// Global instance
window.SidebarSectionIntegration = SidebarSectionIntegration;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.sidebarSectionIntegration = new SidebarSectionIntegration();
    });
} else {
    window.sidebarSectionIntegration = new SidebarSectionIntegration();
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SidebarSectionIntegration;
}
