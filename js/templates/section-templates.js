/**
 * Dynamic Section Templates
 * Phase 3: Section Layer System - Dynamic Approach
 * 
 * JavaScript-based section templates that render dynamically
 * Matches the existing sidebar section layout system
 * 
 * @version 3.0.0-phase3-dynamic
 * @package GMKB/JS/Templates
 */

class SectionTemplates {
    constructor() {
        this.templates = new Map();
        this.logger = window.StructuredLogger || console;
        
        this.logger.info('📋 PHASE 3: SectionTemplates initializing (dynamic approach)');
        this.initializeTemplates();
    }
    
    /**
     * Initialize all section templates
     * Following checklist: Simplicity First, No Redundant Logic
     */
    initializeTemplates() {
        // Register all built-in section templates that match sidebar options
        this.registerTemplate('full_width', this.createFullWidthTemplate);
        this.registerTemplate('two_column', this.createTwoColumnTemplate);  
        this.registerTemplate('three_column', this.createThreeColumnTemplate);
        this.registerTemplate('main_sidebar', this.createMainSidebarTemplate); // Main + Sidebar from UI
        this.registerTemplate('grid', this.createGridTemplate);
        this.registerTemplate('hero', this.createHeroTemplate);
        
        this.logger.info(`✅ PHASE 3: Registered ${this.templates.size} dynamic section templates`);
    }
    
    /**
     * Register a section template
     * Following checklist: Maintainability, Extensibility
     */
    registerTemplate(sectionType, templateFunction) {
        this.templates.set(sectionType, templateFunction.bind(this));
        this.logger.debug(`📋 PHASE 3: Registered template for ${sectionType}`);
    }
    
    /**
     * Main render method - used by SectionRenderer
     * Following checklist: Event-Driven, Performance
     */
    renderSection(section, container = null) {
        const templateFunction = this.templates.get(section.section_type);
        
        if (!templateFunction) {
            this.logger.warn(`⚠️ PHASE 3: No template found for section type: ${section.section_type}`);
            return this.createFallbackTemplate(section, container);
        }
        
        const sectionElement = templateFunction(section, container);
        
        // Add section controls overlay (like the existing component controls)
        this.addSectionControlsOverlay(sectionElement, section);
        
        return sectionElement;
    }
    
    /**
     * Full Width Section Template
     * Matches "Full Width" from sidebar
     */
    createFullWidthTemplate(section, container) {
        const sectionElement = this.createBaseSectionElement(section);
        const containerDiv = this.createElement('div', 'gmkb-section__container');
        const contentDiv = this.createElement('div', 'gmkb-section__content gmkb-section__content--full-width');
        
        // Render components or empty state
        if (section.components && section.components.length > 0) {
            section.components.forEach(component => {
                const componentDiv = this.createComponentContainer(component);
                this.renderComponentContent(component, componentDiv);
                contentDiv.appendChild(componentDiv);
            });
        } else {
            const emptyState = this.createSectionEmptyState(section);
            contentDiv.appendChild(emptyState);
        }
        
        containerDiv.appendChild(contentDiv);
        sectionElement.appendChild(containerDiv);
        
        this.addDebugInfo(section, sectionElement);
        
        if (container) {
            container.appendChild(sectionElement);
        }
        
        return sectionElement;
    }
    
    /**
     * Two Column Section Template  
     * Matches "Two Column" from sidebar
     */
    createTwoColumnTemplate(section, container) {
        const sectionElement = this.createBaseSectionElement(section);
        const containerDiv = this.createElement('div', 'gmkb-section__container');
        const contentDiv = this.createElement('div', 'gmkb-section__content gmkb-section__content--two-column');
        
        // Organize components by column
        const columnComponents = { 1: [], 2: [] };
        if (section.components) {
            section.components.forEach(component => {
                const column = Math.min(2, Math.max(1, component.column || 1));
                columnComponents[column].push(component);
            });
        }
        
        // Create columns
        for (let i = 1; i <= 2; i++) {
            const columnDiv = this.createElement('div', `gmkb-section__column gmkb-section__column--${i}`);
            columnDiv.dataset.column = i;
            
            if (columnComponents[i].length === 0) {
                const emptyState = this.createColumnEmptyState(section, i);
                columnDiv.appendChild(emptyState);
            } else {
                columnComponents[i].forEach(component => {
                    const componentDiv = this.createComponentContainer(component);
                    this.renderComponentContent(component, componentDiv);
                    columnDiv.appendChild(componentDiv);
                });
            }
            
            contentDiv.appendChild(columnDiv);
        }
        
        containerDiv.appendChild(contentDiv);
        sectionElement.appendChild(containerDiv);
        
        this.addDebugInfo(section, sectionElement);
        
        if (container) {
            container.appendChild(sectionElement);
        }
        
        return sectionElement;
    }
    
    /**
     * Three Column Section Template
     * Matches "Three Column" from sidebar  
     */
    createThreeColumnTemplate(section, container) {
        const sectionElement = this.createBaseSectionElement(section);
        const containerDiv = this.createElement('div', 'gmkb-section__container');
        const contentDiv = this.createElement('div', 'gmkb-section__content gmkb-section__content--three-column');
        
        // Organize components by column
        const columnComponents = { 1: [], 2: [], 3: [] };
        if (section.components) {
            section.components.forEach(component => {
                const column = Math.min(3, Math.max(1, component.column || 1));
                columnComponents[column].push(component);
            });
        }
        
        // Create columns
        for (let i = 1; i <= 3; i++) {
            const columnDiv = this.createElement('div', `gmkb-section__column gmkb-section__column--${i}`);
            columnDiv.dataset.column = i;
            
            if (columnComponents[i].length === 0) {
                const emptyState = this.createColumnEmptyState(section, i);
                columnDiv.appendChild(emptyState);
            } else {
                columnComponents[i].forEach(component => {
                    const componentDiv = this.createComponentContainer(component);
                    this.renderComponentContent(component, componentDiv);
                    columnDiv.appendChild(componentDiv);
                });
            }
            
            contentDiv.appendChild(columnDiv);
        }
        
        containerDiv.appendChild(contentDiv);
        sectionElement.appendChild(containerDiv);
        
        this.addDebugInfo(section, sectionElement);
        
        if (container) {
            container.appendChild(sectionElement);
        }
        
        return sectionElement;
    }
    
    /**
     * Main + Sidebar Template
     * Matches "Main + Sidebar" from sidebar - asymmetric layout
     */
    createMainSidebarTemplate(section, container) {
        const sectionElement = this.createBaseSectionElement(section);
        const containerDiv = this.createElement('div', 'gmkb-section__container');
        const contentDiv = this.createElement('div', 'gmkb-section__content gmkb-section__content--main-sidebar');
        
        // Organize components: column 1 = main (2/3), column 2 = sidebar (1/3)
        const columnComponents = { 1: [], 2: [] };
        if (section.components) {
            section.components.forEach(component => {
                const column = Math.min(2, Math.max(1, component.column || 1));
                columnComponents[column].push(component);
            });
        }
        
        // Main column (wider)
        const mainColumnDiv = this.createElement('div', 'gmkb-section__column gmkb-section__column--main');
        mainColumnDiv.dataset.column = 1;
        
        if (columnComponents[1].length === 0) {
            const emptyState = this.createColumnEmptyState(section, 1, 'Drop main content here');
            mainColumnDiv.appendChild(emptyState);
        } else {
            columnComponents[1].forEach(component => {
                const componentDiv = this.createComponentContainer(component);
                this.renderComponentContent(component, componentDiv);
                mainColumnDiv.appendChild(componentDiv);
            });
        }
        
        // Sidebar column (narrower)
        const sidebarColumnDiv = this.createElement('div', 'gmkb-section__column gmkb-section__column--sidebar');
        sidebarColumnDiv.dataset.column = 2;
        
        if (columnComponents[2].length === 0) {
            const emptyState = this.createColumnEmptyState(section, 2, 'Drop sidebar content here');
            sidebarColumnDiv.appendChild(emptyState);
        } else {
            columnComponents[2].forEach(component => {
                const componentDiv = this.createComponentContainer(component);
                this.renderComponentContent(component, componentDiv);
                sidebarColumnDiv.appendChild(componentDiv);
            });
        }
        
        contentDiv.appendChild(mainColumnDiv);
        contentDiv.appendChild(sidebarColumnDiv);
        
        containerDiv.appendChild(contentDiv);
        sectionElement.appendChild(containerDiv);
        
        this.addDebugInfo(section, sectionElement);
        
        if (container) {
            container.appendChild(sectionElement);
        }
        
        return sectionElement;
    }
    
    /**
     * Grid Section Template
     * Auto-arranging grid layout
     */
    createGridTemplate(section, container) {
        const sectionElement = this.createBaseSectionElement(section);
        const containerDiv = this.createElement('div', 'gmkb-section__container');
        const contentDiv = this.createElement('div', 'gmkb-section__content gmkb-section__content--grid');
        
        // Render components or empty state
        if (section.components && section.components.length > 0) {
            section.components.forEach(component => {
                const componentDiv = this.createComponentContainer(component);
                componentDiv.classList.add('gmkb-section__grid-item');
                this.renderComponentContent(component, componentDiv);
                contentDiv.appendChild(componentDiv);
            });
        } else {
            const emptyState = this.createSectionEmptyState(section, true); // isGrid = true
            contentDiv.appendChild(emptyState);
        }
        
        containerDiv.appendChild(contentDiv);
        sectionElement.appendChild(containerDiv);
        
        this.addDebugInfo(section, sectionElement);
        
        if (container) {
            container.appendChild(sectionElement);
        }
        
        return sectionElement;
    }
    
    /**
     * Hero Section Template
     * Full-height impactful section
     */
    createHeroTemplate(section, container) {
        const sectionElement = this.createBaseSectionElement(section);
        const containerDiv = this.createElement('div', 'gmkb-section__container gmkb-section__hero-container');
        const contentDiv = this.createElement('div', 'gmkb-section__content gmkb-section__hero-content');
        
        // Render components or empty state
        if (section.components && section.components.length > 0) {
            section.components.forEach(component => {
                const componentDiv = this.createComponentContainer(component);
                componentDiv.classList.add('gmkb-section__hero-component');
                this.renderComponentContent(component, componentDiv);
                contentDiv.appendChild(componentDiv);
            });
            
            // Add hero overlay for better text contrast
            const overlay = this.createElement('div', 'gmkb-section__hero-overlay');
            containerDiv.appendChild(overlay);
        } else {
            const emptyState = this.createSectionEmptyState(section, false, true); // isHero = true
            contentDiv.appendChild(emptyState);
        }
        
        containerDiv.appendChild(contentDiv);
        sectionElement.appendChild(containerDiv);
        
        this.addDebugInfo(section, sectionElement);
        
        if (container) {
            container.appendChild(sectionElement);
        }
        
        return sectionElement;
    }
    
    /**
     * Create base section element with common attributes
     * Following checklist: No Redundant Logic
     */
    createBaseSectionElement(section) {
        const element = this.createElement('div', `gmkb-section gmkb-section--${section.section_type}`);
        element.id = `section-${section.section_id}`;
        element.dataset.sectionId = section.section_id;
        element.dataset.sectionType = section.section_type;
        
        // Apply dynamic CSS if section layout manager is available
        if (window.sectionLayoutManager) {
            const css = window.sectionLayoutManager.generateSectionCSS(section.section_id, 'desktop');
            if (css) {
                element.setAttribute('style', css);
            }
        }
        
        return element;
    }
    
    /**
     * Create component container
     * Following checklist: Component Integration
     */
    createComponentContainer(component) {
        const div = this.createElement('div', 'gmkb-section__component');
        div.dataset.componentId = component.component_id;
        return div;
    }
    
    /**
     * Render component content into container
     * Integrates with existing component rendering system
     */
    renderComponentContent(component, containerDiv) {
        // Use existing component renderer if available
        if (window.enhancedComponentRenderer && window.enhancedStateManager) {
            const state = window.enhancedStateManager.getState();
            const componentData = state?.components?.[component.component_id];
            
            if (componentData) {
                // Use existing component rendering system
                window.enhancedComponentRenderer.renderComponentInContainer(componentData, containerDiv);
            } else {
                // Placeholder for missing component
                containerDiv.innerHTML = `
                    <div class="gmkb-component-placeholder">
                        <div class="gmkb-component-placeholder__icon">⚠️</div>
                        <div class="gmkb-component-placeholder__text">Component not found: ${component.component_id}</div>
                    </div>
                `;
            }
        } else {
            // Fallback placeholder
            containerDiv.innerHTML = `
                <div class="gmkb-component-placeholder">
                    <div class="gmkb-component-placeholder__icon">📦</div>
                    <div class="gmkb-component-placeholder__text">Component: ${component.component_id}</div>
                </div>
            `;
        }
    }
    
    /**
     * Create section empty state
     * Following checklist: User Experience
     */
    createSectionEmptyState(section, isGrid = false, isHero = false) {
        const emptyState = this.createElement('div', 'gmkb-section__empty-state');
        
        if (isGrid) {
            emptyState.classList.add('gmkb-section__grid-empty');
        }
        
        const dropZone = this.createElement('div', 'gmkb-section__drop-zone');
        dropZone.dataset.sectionId = section.section_id;
        dropZone.dataset.column = '1';
        
        // Make drop zones interactive
        this.makeDropZoneInteractive(dropZone);
        
        if (isHero) {
            dropZone.classList.add('gmkb-section__hero-drop-zone');
            dropZone.innerHTML = `
                <div class="gmkb-section__hero-placeholder">
                    <div class="gmkb-section__hero-icon">🌟</div>
                    <h3 class="gmkb-section__hero-title">Hero Section</h3>
                    <p class="gmkb-section__drop-text">Drop components here to create an impactful hero section</p>
                </div>
            `;
        } else {
            const message = isGrid 
                ? 'Drop components here - they\'ll arrange automatically in a grid'
                : 'Drop components here';
            
            const dropText = this.createElement('span', 'gmkb-section__drop-text');
            dropText.textContent = message;
            dropZone.appendChild(dropText);
        }
        
        emptyState.appendChild(dropZone);
        return emptyState;
    }
    
    /**
     * Create column empty state
     * Following checklist: Column Layout Support
     */
    createColumnEmptyState(section, columnNumber, customMessage = null) {
        const emptyState = this.createElement('div', 'gmkb-section__empty-state');
        
        const dropZone = this.createElement('div', 'gmkb-section__drop-zone');
        dropZone.dataset.sectionId = section.section_id;
        dropZone.dataset.column = columnNumber.toString();
        
        // Make drop zones interactive
        this.makeDropZoneInteractive(dropZone);
        
        const dropText = this.createElement('span', 'gmkb-section__drop-text');
        dropText.textContent = customMessage || 'Drop components here';
        dropZone.appendChild(dropText);
        
        emptyState.appendChild(dropZone);
        return emptyState;
    }
    
    /**
     * Make drop zone interactive with existing drag-and-drop system
     * Following checklist: Integration with Existing Systems
     */
    makeDropZoneInteractive(dropZone) {
        // Add click handler to open component library
        dropZone.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Trigger component library modal with section context
            if (window.componentLibrarySimple) {
                const sectionId = dropZone.dataset.sectionId;
                const column = dropZone.dataset.column;
                
                // Store target section info for component placement
                window.componentLibrarySimple.setTargetSection(sectionId, column);
                window.componentLibrarySimple.show();
            }
        });
        
        // Add hover effects
        dropZone.addEventListener('mouseenter', () => {
            dropZone.classList.add('gmkb-drop-zone--hover');
        });
        
        dropZone.addEventListener('mouseleave', () => {
            dropZone.classList.remove('gmkb-drop-zone--hover');
        });
    }
    
    /**
     * Add section controls overlay (like existing component controls)
     * Following checklist: Consistent UI Patterns
     */
    addSectionControlsOverlay(sectionElement, section) {
        // Only add in editing mode
        if (window.gmkbData?.builderPage !== true) return;
        
        const controlsDiv = this.createElement('div', 'gmkb-section__controls');
        controlsDiv.innerHTML = `
            <button class="gmkb-section__control-btn gmkb-section__control-btn--settings" 
                    title="Section Settings" 
                    data-section-id="${section.section_id}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
            </button>
            <button class="gmkb-section__control-btn gmkb-section__control-btn--add" 
                    title="Add Section After" 
                    data-section-id="${section.section_id}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            </button>
            <button class="gmkb-section__control-btn gmkb-section__control-btn--remove" 
                    title="Remove Section" 
                    data-section-id="${section.section_id}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3,6 5,6 21,6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
            </button>
        `;
        
        sectionElement.appendChild(controlsDiv);
    }
    
    /**
     * Add debug information if in debug mode
     * Following checklist: Diagnostic Logging
     */
    addDebugInfo(section, sectionElement) {
        if (window.gmkbData?.debugMode) {
            const debugDiv = this.createElement('div', 'gmkb-section__debug');
            debugDiv.textContent = `${section.section_id} (${section.section_type}) - ${section.components?.length || 0} components`;
            sectionElement.appendChild(debugDiv);
        }
    }
    
    /**
     * Create fallback template for unknown section types
     * Following checklist: Graceful Failure
     */
    createFallbackTemplate(section, container) {
        this.logger.warn(`⚠️ PHASE 3: Using fallback template for unknown section type: ${section.section_type}`);
        
        // Use full width as fallback
        const fallbackSection = {
            ...section,
            section_type: 'full_width'
        };
        
        return this.createFullWidthTemplate(fallbackSection, container);
    }
    
    /**
     * Utility method to create elements with classes
     * Following checklist: DRY Principle
     */
    createElement(tagName, className) {
        const element = document.createElement(tagName);
        if (className) {
            element.className = className;
        }
        return element;
    }
    
    /**
     * Get available template types (matches sidebar options)
     * Following checklist: Introspection Support
     */
    getAvailableTemplates() {
        return Array.from(this.templates.keys());
    }
    
    /**
     * Check if template exists
     * Following checklist: Validation
     */
    hasTemplate(sectionType) {
        return this.templates.has(sectionType);
    }
    
    /**
     * Add custom template (for extensibility)
     * Following checklist: Extensibility
     */
    addCustomTemplate(sectionType, templateFunction) {
        this.registerTemplate(sectionType, templateFunction);
        this.logger.info(`✅ PHASE 3: Added custom template for ${sectionType}`);
    }
    
    /**
     * Update CSS for section layouts to match sidebar system
     * Following checklist: Dynamic Styling
     */
    updateSectionCSS() {
        // Add dynamic CSS for the main + sidebar layout
        const style = document.createElement('style');
        style.textContent = `
            .gmkb-section__content--main-sidebar {
                display: grid;
                grid-template-columns: 2fr 1fr;
                gap: 40px;
            }
            
            @media (max-width: 768px) {
                .gmkb-section__content--main-sidebar {
                    grid-template-columns: 1fr;
                    gap: 20px;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Debug method - get current state
     * Following checklist: Diagnostic Logging
     */
    getDebugInfo() {
        return {
            registeredTemplates: this.getAvailableTemplates(),
            templateCount: this.templates.size,
            sidebarIntegration: true,
            dynamicRendering: true
        };
    }
}

// Global instance
window.SectionTemplates = SectionTemplates;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.sectionTemplates = new SectionTemplates();
        // Add dynamic CSS
        window.sectionTemplates.updateSectionCSS();
    });
} else {
    window.sectionTemplates = new SectionTemplates();
    window.sectionTemplates.updateSectionCSS();
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SectionTemplates;
}
