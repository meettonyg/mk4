/**
 * Section Renderer
 * Phase 3: Section Layer System
 * 
 * Renders sections and integrates with existing component rendering
 * Following checklist: Event-Driven, Centralized State, No Direct Manipulation
 * 
 * @version 3.0.0-phase3
 * @package GMKB/JS/Core
 */

class SectionRenderer {
    constructor() {
        this.logger = window.StructuredLogger || console;
        this.stateManager = null;
        this.sectionLayoutManager = null;
        this.componentRenderer = null;
        
        this.logger.info('🎨 PHASE 3: SectionRenderer initializing');
        this.initializeRenderer();
    }
    
    /**
     * Initialize the section renderer
     * Following checklist: Event-Driven Initialization, Dependency-Awareness
     */
    initializeRenderer() {
        // Wait for core systems to be ready
        document.addEventListener('gmkb:core-systems-ready', () => {
            this.onCoreSystemsReady();
        });
        
        // Wait for dynamic templates to be ready
        document.addEventListener('DOMContentLoaded', () => {
            this.dynamicTemplates = window.dynamicSectionTemplates;
        });
        
        if (window.dynamicSectionTemplates) {
            this.dynamicTemplates = window.dynamicSectionTemplates;
        }
        
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
        
        document.addEventListener('gmkb:sections-reordered', (event) => {
            this.onSectionsReordered(event.detail);
        });
        
        // Listen for component events
        document.addEventListener('gmkb:component-assigned-to-section', (event) => {
            this.onComponentAssignedToSection(event.detail);
        });
        
        document.addEventListener('gmkb:component-removed-from-section', (event) => {
            this.onComponentRemovedFromSection(event.detail);
        });
        
        // Listen for re-render requests
        document.addEventListener('gmkb:section-rerender-requested', (event) => {
            this.rerenderSection(event.detail.sectionId);
        });
        
        // Listen for state changes that affect sections
        document.addEventListener('gmkb:state-updated', (event) => {
            const { path } = event.detail;
            if (path && path.includes('sections')) {
                this.onSectionsStateUpdated();
            }
        });
        
        this.logger.info('✅ PHASE 3: SectionRenderer initialized');
    }
    
    /**
     * Handle core systems ready
     * Following checklist: Dependency-Awareness, No Global Object Sniffing
     */
    onCoreSystemsReady() {
        this.stateManager = window.enhancedStateManager;
        this.sectionLayoutManager = window.sectionLayoutManager;
        this.componentRenderer = window.enhancedComponentRenderer;
        
        if (this.stateManager && this.sectionLayoutManager) {
            // Check if we have components but no sections - auto-create sections
            this.autoCreateSectionsForExistingComponents();
            
            // Initial render of all sections
            this.renderAllSections();
        }
        
        this.logger.info('🎯 PHASE 3: Section renderer ready - dependencies loaded');
    }
    
    /**
     * Auto-create sections for existing components that aren't in sections yet
     * Following checklist: Auto-Recovery, User Experience
     */
    autoCreateSectionsForExistingComponents() {
        const state = this.stateManager.getState();
        const existingComponents = state.components || {};
        const existingSections = this.sectionLayoutManager.getAllSections();
        
        // Get components that are not assigned to any section
        const componentIds = Object.keys(existingComponents);
        const assignedComponentIds = new Set();
        
        existingSections.forEach(section => {
            (section.components || []).forEach(comp => {
                assignedComponentIds.add(comp.component_id);
            });
        });
        
        const unassignedComponents = componentIds.filter(id => !assignedComponentIds.has(id));
        
        this.logger.info(`🔍 PHASE 3: Found ${componentIds.length} components, ${unassignedComponents.length} unassigned, ${existingSections.length} sections`);
        
        // If we have components but no sections, create a default section
        if (unassignedComponents.length > 0 && existingSections.length === 0) {
            const sectionId = 'section_auto_created';
            const section = this.sectionLayoutManager.registerSection(sectionId, 'full_width');
            
            if (section) {
                // Assign all unassigned components to this section
                unassignedComponents.forEach(componentId => {
                    this.sectionLayoutManager.assignComponentToSection(componentId, sectionId, 1);
                });
                
                this.logger.info(`✨ PHASE 3: Auto-created section for ${unassignedComponents.length} existing components`);
            }
        }
        // If we have unassigned components and existing sections, add to first section
        else if (unassignedComponents.length > 0 && existingSections.length > 0) {
            const firstSection = existingSections[0];
            unassignedComponents.forEach(componentId => {
                this.sectionLayoutManager.assignComponentToSection(componentId, firstSection.section_id, 1);
            });
            
            this.logger.info(`🔄 PHASE 3: Assigned ${unassignedComponents.length} orphaned components to existing section`);
        }
    }
    
    /**
     * Render all sections from current state
     * Following checklist: Centralized State, Schema Compliance
     */
    renderAllSections() {
        if (!this.sectionLayoutManager || !this.stateManager) return;
        
        // ROOT FIX: Find or create sections container
        let sectionsContainer = document.getElementById('gmkb-sections-container');
        
        if (!sectionsContainer) {
            // ROOT FIX: Create sections container if it doesn't exist
            sectionsContainer = this.createSectionsContainer();
            
            if (!sectionsContainer) {
                this.logger.error('❌ PHASE 3: Could not create or find sections container');
                return;
            }
        }
        
        const sections = this.sectionLayoutManager.getSectionsInOrder();
        
        // Clear existing content
        sectionsContainer.innerHTML = '';
        
        if (sections.length === 0) {
            // Show empty state for sections
            this.renderSectionsEmptyState(sectionsContainer);
            return;
        }
        
        // Render each section
        sections.forEach(section => {
            if (section) {
                this.renderSection(section, sectionsContainer);
            }
        });
        
        this.logger.info(`🎨 PHASE 3: Rendered ${sections.length} sections`);
    }
    
    /**
     * ROOT FIX: Create or find sections container
     * Following checklist: Graceful Fallback, DOM Integration
     */
    createSectionsContainer() {
        // Strategy 1: Try to find existing preview container
        let parentContainer = document.getElementById('media-kit-preview') ||
                             document.getElementById('saved-components-container') ||
                             document.querySelector('.media-kit-preview') ||
                             document.querySelector('.gmkb-preview');
        
        if (!parentContainer) {
            // Strategy 2: Try to find any main content container
            parentContainer = document.querySelector('main') ||
                             document.querySelector('.main-content') ||
                             document.querySelector('#content');
        }
        
        if (!parentContainer) {
            // Strategy 3: Use body as last resort
            parentContainer = document.body;
            this.logger.warn('⚠️ PHASE 3: No suitable parent container found, using body');
        }
        
        // Create the sections container
        const sectionsContainer = document.createElement('div');
        sectionsContainer.id = 'gmkb-sections-container';
        sectionsContainer.className = 'gmkb-sections-container';
        
        // Insert at the beginning of parent container
        parentContainer.insertBefore(sectionsContainer, parentContainer.firstChild);
        
        this.logger.info('✅ PHASE 3: Created sections container in', parentContainer.tagName.toLowerCase());
        return sectionsContainer;
    }
    
    /**
     * Render empty state for sections
     * Following checklist: Simplicity First, User Experience
     */
    renderSectionsEmptyState(container) {
        const emptyState = document.createElement('div');
        emptyState.className = 'gmkb-sections-empty-state';
        emptyState.innerHTML = `
            <div class="gmkb-sections-empty-content">
                <div class="gmkb-sections-empty-icon">📋</div>
                <h3 class="gmkb-sections-empty-title">No Sections Yet</h3>
                <p class="gmkb-sections-empty-description">
                    Sections will be created automatically when you add components, or you can create them manually.
                </p>
                <button class="gmkb-btn gmkb-btn--primary gmkb-create-section-btn" data-action="create-section">
                    Create First Section
                </button>
            </div>
        `;
        
        container.appendChild(emptyState);
        
        // Add event listener for create section button
        emptyState.querySelector('.gmkb-create-section-btn')?.addEventListener('click', () => {
            this.createFirstSection();
        });
    }
    
    /**
     * Render a single section - DYNAMIC VERSION
     * Following checklist: Dynamic Rendering, Configuration-Driven
     */
    renderSection(section, container = null) {
        if (!container) {
            // ROOT FIX: Use same container finding logic as renderAllSections
            container = document.getElementById('gmkb-sections-container');
            if (!container) {
                container = this.createSectionsContainer();
                if (!container) {
                    this.logger.error('❌ PHASE 3: No container available for section rendering');
                    return null;
                }
            }
        }
        
        // Remove existing section element if it exists
        const existingElement = document.getElementById(`section-${section.section_id}`);
        if (existingElement) {
            existingElement.remove();
        }
        
        // Use dynamic section templates instead of hardcoded rendering
        if (!window.sectionTemplates) {
            this.logger.warn('⚠️ PHASE 3: SectionTemplates not available - falling back to basic rendering');
            return this.createSectionManually(section, container);
        }
        
        // Render using dynamic templates
        const sectionElement = window.sectionTemplates.renderSection(section, container);
        
        this.logger.debug(`🎨 PHASE 3: Rendered section ${section.section_id} (${section.section_type}) using dynamic template`);
        return sectionElement;
    }
    
    /**
     * Get components for a specific section
     * Following checklist: Data Integration
     */
    getSectionComponents(section) {
        if (!this.stateManager) return [];
        
        const state = this.stateManager.getState();
        const components = section.components || [];
        
        return components.map(sectionComponent => {
            const componentData = state.components?.[sectionComponent.component_id];
            return {
                ...sectionComponent,
                componentData
            };
        }).filter(comp => comp.componentData); // Only include components that exist in state
    }
    
    /**
     * Render components within section element
     * Following checklist: Integration with Existing System
     */
    renderComponentsInSection(sectionElement, sectionComponents) {
        if (!this.componentRenderer) return;
        
        // Find component containers and render actual components
        const componentContainers = sectionElement.querySelectorAll('[data-component-id]');
        
        componentContainers.forEach(container => {
            const componentId = container.dataset.componentId;
            const sectionComponent = sectionComponents.find(sc => sc.component_id === componentId);
            
            if (sectionComponent && sectionComponent.componentData) {
                // Use existing component renderer to render into container
                this.componentRenderer.renderComponentInContainer(sectionComponent.componentData, container);
            }
        });
    }
    
    /**
     * Fallback section creation (for backward compatibility)
     * Following checklist: Graceful Fallback
     */
    createSectionManually(section, container) {
        this.logger.warn('⚠️ PHASE 3: Dynamic templates not available - using manual creation');
        
        const sectionElement = document.createElement('div');
        sectionElement.className = `gmkb-section gmkb-section--${section.section_type}`;
        sectionElement.id = `section-${section.section_id}`;
        sectionElement.dataset.sectionId = section.section_id;
        sectionElement.dataset.sectionType = section.section_type;
        
        // Apply section CSS
        const sectionCSS = this.generateSectionCSS(section);
        sectionElement.setAttribute('style', sectionCSS);
        
        // Simple container structure
        const containerDiv = document.createElement('div');
        containerDiv.className = 'gmkb-section__container';
        
        const content = document.createElement('div');
        content.className = 'gmkb-section__content';
        
        // Get components for this section
        const sectionComponents = this.getSectionComponents(section);
        
        // Add component containers
        if (sectionComponents.length > 0) {
            sectionComponents.forEach(component => {
                const componentEl = document.createElement('div');
                componentEl.className = 'gmkb-section__component';
                componentEl.dataset.componentId = component.component_id;
                
                // Render component if renderer is available
                if (this.componentRenderer && component.componentData) {
                    this.componentRenderer.renderComponentInContainer(component.componentData, componentEl);
                }
                
                content.appendChild(componentEl);
            });
        } else {
            // Empty state
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'gmkb-section__empty-state';
            emptyDiv.innerHTML = `
                <div class="gmkb-section__drop-zone" data-section-id="${section.section_id}" data-column="1">
                    <span class="gmkb-section__drop-text">Drop components here</span>
                </div>
            `;
            content.appendChild(emptyDiv);
        }
        
        containerDiv.appendChild(content);
        sectionElement.appendChild(containerDiv);
        
        if (container) {
            container.appendChild(sectionElement);
        }
        
        return sectionElement;
    }
    
    /**
     * Generate CSS for section based on configuration
     * Following checklist: Dynamic Styling, Responsive Design
     */
    generateSectionCSS(section) {
        if (!this.sectionLayoutManager) return '';
        
        return this.sectionLayoutManager.generateSectionCSS(section.section_id, 'desktop');
    }
    
    /**
     * Add debug information to section
     * Following checklist: Diagnostic Logging, Development Support
     */
    addSectionDebugInfo(section, sectionElement) {
        const debugDiv = document.createElement('div');
        debugDiv.className = 'gmkb-section__debug';
        debugDiv.textContent = `${section.section_id} (${section.section_type}) - ${section.components?.length || 0} components`;
        sectionElement.appendChild(debugDiv);
    }
    
    /**
     * Event handlers for section lifecycle
     * Following checklist: Event-Driven, Responsive Updates
     */
    onSectionRegistered(detail) {
        const { sectionId } = detail;
        const section = this.sectionLayoutManager?.getSection(sectionId);
        
        if (section) {
            this.renderSection(section);
        }
    }
    
    onSectionUpdated(detail) {
        const { sectionId } = detail;
        this.rerenderSection(sectionId);
    }
    
    onSectionRemoved(detail) {
        const { sectionId } = detail;
        const sectionElement = document.getElementById(`section-${sectionId}`);
        
        if (sectionElement) {
            sectionElement.remove();
            this.logger.debug(`🗑️ PHASE 3: Removed section element ${sectionId}`);
        }
    }
    
    onSectionsReordered(detail) {
        // Re-render all sections in new order
        this.renderAllSections();
    }
    
    onComponentAssignedToSection(detail) {
        const { sectionId } = detail;
        this.rerenderSection(sectionId);
    }
    
    onComponentRemovedFromSection(detail) {
        const { sectionId } = detail;
        this.rerenderSection(sectionId);
    }
    
    onSectionsStateUpdated() {
        // Re-render all sections when state changes
        this.renderAllSections();
    }
    
    /**
     * Re-render a specific section
     * Following checklist: Selective Updates, Performance
     */
    rerenderSection(sectionId) {
        if (!this.sectionLayoutManager) return;
        
        const section = this.sectionLayoutManager.getSection(sectionId);
        if (section) {
            this.renderSection(section);
            this.logger.debug(`🔄 PHASE 3: Re-rendered section ${sectionId}`);
        }
    }
    
    /**
     * Create first section when none exist
     * Following checklist: User Experience, Auto-Generation
     */
    createFirstSection() {
        if (!this.sectionLayoutManager) return;
        
        const sectionId = `section_${Date.now()}`;
        const section = this.sectionLayoutManager.registerSection(sectionId, 'full_width');
        
        if (section) {
            this.logger.info(`✅ PHASE 3: Created first section ${sectionId}`);
            
            // Show success message
            if (window.enhancedToast) {
                window.enhancedToast.showSuccess('First section created! You can now add components.');
            }
        }
    }
    
    /**
     * Debug method - get current state
     * Following checklist: Diagnostic Logging
     */
    getDebugInfo() {
        return {
            stateManagerAvailable: !!this.stateManager,
            sectionLayoutManagerAvailable: !!this.sectionLayoutManager,
            componentRendererAvailable: !!this.componentRenderer,
            renderedSections: document.querySelectorAll('.gmkb-section').length,
            sectionsContainer: !!document.getElementById('gmkb-sections-container')
        };
    }
}

// Global instance
window.SectionRenderer = SectionRenderer;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.sectionRenderer = new SectionRenderer();
    });
} else {
    window.sectionRenderer = new SectionRenderer();
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SectionRenderer;
}
