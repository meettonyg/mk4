/**
 * Section Renderer
 * Phase 3: Section Layer System - Visual Rendering
 * 
 * ROOT FIX: Missing renderer component that actually creates DOM elements for sections
 * This was the root cause of sections not appearing visually
 * 
 * @version 3.0.0-phase3-renderer
 * @package GMKB/System
 */

class SectionRenderer {
    constructor() {
        this.logger = window.StructuredLogger || console;
        this.sectionLayoutManager = null;
        this.componentRenderer = null;
        this.renderedSections = new Set();
        this.containerElement = null;
        
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
        
        // ROOT FIX: Also try immediate initialization if systems are already ready
        if (window.sectionLayoutManager && window.enhancedComponentRenderer) {
            this.onCoreSystemsReady();
        }
        
        this.logger.info('✅ PHASE 3: SectionRenderer initialized');
    }
    
    /**
     * Handle core systems ready event
     * Following checklist: Dependency-Awareness, No Global Object Sniffing
     */
    onCoreSystemsReady() {
        this.sectionLayoutManager = window.sectionLayoutManager;
        this.componentRenderer = window.enhancedComponentRenderer;
        
        // Find container element
        this.containerElement = this.findContainerElement();
        
        if (!this.containerElement) {
            this.logger.error('❌ PHASE 3: No container element found for sections');
            return;
        }
        
        this.logger.info('🎯 PHASE 3: Section renderer ready - container found:', {
            containerId: this.containerElement.id,
            containerClass: this.containerElement.className
        });
        
        // Render any existing sections
        this.renderExistingSections();
    }
    
    /**
     * Find the container element for sections
     * Following checklist: Root Cause Fix
     */
    findContainerElement() {
        // Look for dedicated section container first
        let container = document.getElementById('gmkb-sections-container');
        
        // Fall back to component preview container
        if (!container) {
            container = document.getElementById('component-preview-container');
        }
        
        // Fall back to generic preview container
        if (!container) {
            container = document.querySelector('.gmkb-preview__container');
        }
        
        // Create container if it doesn't exist
        if (!container) {
            const previewArea = document.querySelector('.gmkb-preview') || 
                               document.querySelector('#gmkb-preview-area');
            
            if (previewArea) {
                container = document.createElement('div');
                container.id = 'gmkb-sections-container';
                container.className = 'gmkb-sections-container';
                previewArea.appendChild(container);
                
                this.logger.info('📦 PHASE 3: Created sections container');
            }
        }
        
        return container;
    }
    
    /**
     * Render existing sections from state
     * Following checklist: Centralized State, Schema Compliance
     */
    renderExistingSections() {
        if (!this.sectionLayoutManager) return;
        
        const sections = this.sectionLayoutManager.getSectionsInOrder();
        
        if (sections.length > 0) {
            this.logger.info(`📐 PHASE 3: Rendering ${sections.length} existing sections`);
            sections.forEach(section => {
                this.renderSection(section);
            });
        } else {
            this.logger.info('📐 PHASE 3: No existing sections to render');
        }
    }
    
    /**
     * Handle section registered event
     * Following checklist: Event-Driven, Real-time Updates
     */
    onSectionRegistered(detail) {
        const { sectionId, configuration } = detail;
        
        this.logger.info(`📐 PHASE 3: Rendering newly registered section ${sectionId}`);
        
        // Get full section data from manager
        const section = this.sectionLayoutManager?.getSection(sectionId) || configuration;
        
        if (section) {
            this.renderSection(section);
        }
    }
    
    /**
     * Render a section to DOM
     * Following checklist: DOM Manipulation, Visual Consistency
     */
    renderSection(section) {
        if (!this.containerElement) {
            this.logger.error('❌ PHASE 3: Cannot render section - no container element');
            return;
        }
        
        // Check if section already rendered
        if (this.renderedSections.has(section.section_id)) {
            this.logger.debug(`🔄 PHASE 3: Section ${section.section_id} already rendered, updating`);
            this.updateSectionElement(section);
            return;
        }
        
        // Create section element
        const sectionElement = this.createSectionElement(section);
        
        if (!sectionElement) {
            this.logger.error(`❌ PHASE 3: Failed to create section element for ${section.section_id}`);
            return;
        }
        
        // Add to container
        this.containerElement.appendChild(sectionElement);
        
        // Track rendered section
        this.renderedSections.add(section.section_id);
        
        // Apply CSS styles
        this.applySectionStyles(sectionElement, section);
        
        // Render components in this section
        this.renderSectionComponents(sectionElement, section);
        
        this.logger.info(`✅ PHASE 3: Section ${section.section_id} rendered successfully`);
        
        // Dispatch rendered event
        this.dispatchSectionEvent('gmkb:section-rendered', {
            sectionId: section.section_id,
            element: sectionElement
        });
    }
    
    /**
     * Create section DOM element
     * Following checklist: DOM Creation, Semantic HTML
     */
    createSectionElement(section) {
        const sectionElement = document.createElement('section');
        
        // Set identifiers
        sectionElement.id = `section-${section.section_id}`;
        sectionElement.dataset.sectionId = section.section_id;
        sectionElement.dataset.sectionType = section.section_type;
        
        // Add classes
        sectionElement.className = [
            'gmkb-section',
            `gmkb-section--${section.section_type}`,
            section.section_options?.custom_class || ''
        ].filter(Boolean).join(' ');
        
        // Create inner container for layout
        const innerContainer = document.createElement('div');
        innerContainer.className = 'gmkb-section__inner';
        
        // Handle column layouts
        if (section.layout.columns > 1) {
            for (let i = 1; i <= section.layout.columns; i++) {
                const column = document.createElement('div');
                column.className = `gmkb-section__column gmkb-section__column--${i}`;
                column.dataset.column = i;
                innerContainer.appendChild(column);
            }
        } else {
            // Single column or custom layout
            innerContainer.classList.add('gmkb-section__content');
        }
        
        sectionElement.appendChild(innerContainer);
        
        // Add section controls (edit, remove, etc.)
        this.addSectionControls(sectionElement, section);
        
        return sectionElement;
    }
    
    /**
     * Add interactive controls to section
     * Following checklist: User Experience, Interactivity
     */
    addSectionControls(sectionElement, section) {
        const controls = document.createElement('div');
        controls.className = 'gmkb-section__controls';
        
        // Edit button
        const editBtn = document.createElement('button');
        editBtn.className = 'gmkb-section__control gmkb-section__control--edit';
        editBtn.innerHTML = '<span class="dashicons dashicons-edit"></span>';
        editBtn.title = 'Edit Section';
        editBtn.addEventListener('click', () => {
            this.handleSectionEdit(section.section_id);
        });
        
        // Remove button
        const removeBtn = document.createElement('button');
        removeBtn.className = 'gmkb-section__control gmkb-section__control--remove';
        removeBtn.innerHTML = '<span class="dashicons dashicons-trash"></span>';
        removeBtn.title = 'Remove Section';
        removeBtn.addEventListener('click', () => {
            this.handleSectionRemove(section.section_id);
        });
        
        // Move handle
        const moveHandle = document.createElement('div');
        moveHandle.className = 'gmkb-section__control gmkb-section__control--move';
        moveHandle.innerHTML = '<span class="dashicons dashicons-move"></span>';
        moveHandle.title = 'Drag to Reorder';
        
        controls.appendChild(editBtn);
        controls.appendChild(removeBtn);
        controls.appendChild(moveHandle);
        
        sectionElement.appendChild(controls);
    }
    
    /**
     * Apply CSS styles to section
     * Following checklist: Visual Consistency, Responsive Design
     */
    applySectionStyles(sectionElement, section) {
        if (!this.sectionLayoutManager) return;
        
        // Generate and apply CSS
        const css = this.sectionLayoutManager.generateSectionCSS(section.section_id);
        
        if (css) {
            const innerElement = sectionElement.querySelector('.gmkb-section__inner');
            if (innerElement) {
                innerElement.style.cssText = css;
            }
        }
        
        // Add responsive classes
        this.addResponsiveClasses(sectionElement, section);
    }
    
    /**
     * Add responsive classes for breakpoints
     * Following checklist: Responsive Design, Mobile-First
     */
    addResponsiveClasses(sectionElement, section) {
        const responsive = section.responsive || {};
        
        // Add data attributes for responsive behavior
        if (responsive.mobile) {
            sectionElement.dataset.mobileColumns = responsive.mobile.columns || '';
        }
        
        if (responsive.tablet) {
            sectionElement.dataset.tabletColumns = responsive.tablet.columns || '';
        }
    }
    
    /**
     * Render components within a section
     * Following checklist: Component Integration, Layout Management
     */
    renderSectionComponents(sectionElement, section) {
        if (!section.components || section.components.length === 0) {
            // Add placeholder for empty sections
            this.addEmptySectionPlaceholder(sectionElement);
            return;
        }
        
        section.components.forEach(componentAssignment => {
            const { component_id, column } = componentAssignment;
            
            // Find target container based on layout
            let targetContainer;
            
            if (section.layout.columns > 1) {
                targetContainer = sectionElement.querySelector(`.gmkb-section__column[data-column="${column}"]`);
            } else {
                targetContainer = sectionElement.querySelector('.gmkb-section__content');
            }
            
            if (targetContainer) {
                // Move or render component in this section
                this.moveComponentToSection(component_id, targetContainer);
            }
        });
    }
    
    /**
     * Move component to section container
     * Following checklist: DOM Manipulation, Component Management
     */
    moveComponentToSection(componentId, targetContainer) {
        // Find existing component element
        const componentElement = document.querySelector(`[data-component-id="${componentId}"]`);
        
        if (componentElement) {
            // Move existing component
            targetContainer.appendChild(componentElement);
            this.logger.debug(`🔄 PHASE 3: Moved component ${componentId} to section`);
        } else {
            // Component not yet rendered, add placeholder
            const placeholder = document.createElement('div');
            placeholder.className = 'gmkb-component-placeholder';
            placeholder.dataset.componentId = componentId;
            placeholder.textContent = `Component: ${componentId}`;
            targetContainer.appendChild(placeholder);
            
            this.logger.debug(`📍 PHASE 3: Added placeholder for component ${componentId}`);
        }
    }
    
    /**
     * Add placeholder for empty sections
     * Following checklist: User Experience, Visual Feedback
     */
    addEmptySectionPlaceholder(sectionElement) {
        const innerElement = sectionElement.querySelector('.gmkb-section__inner, .gmkb-section__content');
        
        if (innerElement && !innerElement.querySelector('.gmkb-section__empty')) {
            const placeholder = document.createElement('div');
            placeholder.className = 'gmkb-section__empty';
            placeholder.innerHTML = `
                <div class="gmkb-section__empty-icon">
                    <span class="dashicons dashicons-plus-alt2"></span>
                </div>
                <div class="gmkb-section__empty-text">
                    Drop components here or click to add
                </div>
            `;
            
            // Make clickable to add components
            placeholder.addEventListener('click', () => {
                this.handleAddComponentToSection(sectionElement.dataset.sectionId);
            });
            
            innerElement.appendChild(placeholder);
        }
    }
    
    /**
     * Update existing section element
     * Following checklist: DOM Updates, Performance
     */
    updateSectionElement(section) {
        const sectionElement = document.getElementById(`section-${section.section_id}`);
        
        if (!sectionElement) {
            // Section not rendered yet, render it
            this.renderSection(section);
            return;
        }
        
        // Update styles
        this.applySectionStyles(sectionElement, section);
        
        // Update components
        const innerElement = sectionElement.querySelector('.gmkb-section__inner');
        if (innerElement) {
            // Clear and re-render components
            innerElement.querySelectorAll('.gmkb-section__column, .gmkb-section__content').forEach(col => {
                col.innerHTML = '';
            });
            
            this.renderSectionComponents(sectionElement, section);
        }
        
        this.logger.debug(`🔄 PHASE 3: Updated section ${section.section_id}`);
    }
    
    /**
     * Handle section updated event
     * Following checklist: Event-Driven Updates, Real-time Sync
     */
    onSectionUpdated(detail) {
        const { sectionId, section } = detail;
        this.updateSectionElement(section);
    }
    
    /**
     * Handle section removed event
     * Following checklist: DOM Cleanup, Memory Management
     */
    onSectionRemoved(detail) {
        const { sectionId } = detail;
        
        const sectionElement = document.getElementById(`section-${sectionId}`);
        if (sectionElement) {
            // Move components back to unassigned area
            const components = sectionElement.querySelectorAll('[data-component-id]');
            components.forEach(comp => {
                // Move to temporary holding area or delete
                const holdingArea = document.getElementById('unassigned-components');
                if (holdingArea) {
                    holdingArea.appendChild(comp);
                }
            });
            
            // Remove section element
            sectionElement.remove();
            
            // Update tracking
            this.renderedSections.delete(sectionId);
            
            this.logger.info(`🗑️ PHASE 3: Removed section ${sectionId} from DOM`);
        }
    }
    
    /**
     * Handle sections reordered event
     * Following checklist: DOM Reordering, Visual Consistency
     */
    onSectionsReordered(detail) {
        const { newOrder } = detail;
        
        if (!this.containerElement) return;
        
        // Reorder DOM elements to match new order
        newOrder.forEach((sectionId, index) => {
            const sectionElement = document.getElementById(`section-${sectionId}`);
            if (sectionElement) {
                this.containerElement.appendChild(sectionElement);
            }
        });
        
        this.logger.info(`🔄 PHASE 3: Reordered ${newOrder.length} sections in DOM`);
    }
    
    /**
     * Handle section edit
     * Following checklist: User Interaction, Modal Management
     */
    handleSectionEdit(sectionId) {
        this.logger.info(`✏️ PHASE 3: Editing section ${sectionId}`);
        
        // Dispatch event for section editor
        this.dispatchSectionEvent('gmkb:section-edit-requested', {
            sectionId
        });
    }
    
    /**
     * Handle section remove
     * Following checklist: User Confirmation, Safe Deletion
     */
    handleSectionRemove(sectionId) {
        if (confirm('Are you sure you want to remove this section?')) {
            if (this.sectionLayoutManager) {
                this.sectionLayoutManager.removeSection(sectionId);
            }
        }
    }
    
    /**
     * Handle add component to section
     * Following checklist: Component Management, User Experience
     */
    handleAddComponentToSection(sectionId) {
        this.logger.info(`➕ PHASE 3: Adding component to section ${sectionId}`);
        
        // Dispatch event for component library
        this.dispatchSectionEvent('gmkb:add-component-to-section', {
            sectionId
        });
    }
    
    /**
     * Dispatch section-related events
     * Following checklist: Event-Driven, Documentation
     */
    dispatchSectionEvent(eventType, detail) {
        const event = new CustomEvent(eventType, {
            detail: {
                ...detail,
                timestamp: Date.now(),
                source: 'SectionRenderer'
            }
        });
        
        document.dispatchEvent(event);
    }
    
    /**
     * Render all sections (utility method)
     * Following checklist: Batch Operations, Performance
     */
    renderAllSections() {
        this.logger.info('🎨 PHASE 3: Rendering all sections');
        
        // Clear container
        if (this.containerElement) {
            this.containerElement.innerHTML = '';
            this.renderedSections.clear();
        }
        
        // Render all sections
        this.renderExistingSections();
    }
    
    /**
     * Auto-create sections for existing components
     * Following checklist: Migration, Backward Compatibility
     */
    autoCreateSectionsForExistingComponents() {
        if (!window.enhancedStateManager || !this.sectionLayoutManager) {
            this.logger.warn('⚠️ PHASE 3: Cannot auto-create sections - dependencies not ready');
            return;
        }
        
        const state = window.enhancedStateManager.getState();
        const components = Object.values(state.components || {});
        
        if (components.length > 0 && (!state.sections || state.sections.length === 0)) {
            this.logger.info(`🔧 PHASE 3: Auto-creating sections for ${components.length} existing components`);
            
            // Create a default section
            const defaultSectionId = `section_default_${Date.now()}`;
            const defaultSection = this.sectionLayoutManager.registerSection(
                defaultSectionId, 
                'full_width'
            );
            
            // Assign all components to this section
            components.forEach(component => {
                this.sectionLayoutManager.assignComponentToSection(
                    component.id, 
                    defaultSectionId
                );
            });
            
            this.logger.info(`✅ PHASE 3: Created default section with ${components.length} components`);
        }
    }
    
    /**
     * Debug method - get current state
     * Following checklist: Diagnostic Logging
     */
    getDebugInfo() {
        return {
            containerElement: this.containerElement?.id || 'none',
            renderedSections: Array.from(this.renderedSections),
            renderedSectionCount: this.renderedSections.size,
            domSectionCount: document.querySelectorAll('.gmkb-section').length,
            sectionLayoutManagerAvailable: !!this.sectionLayoutManager,
            componentRendererAvailable: !!this.componentRenderer
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
