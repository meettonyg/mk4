/**
 * Dynamic Section Templates
 * Phase 3: Section Layer System - Dynamic Rendering
 * 
 * JavaScript-based section templates that match the builder's dynamic architecture
 * Following checklist: Configuration-Driven, Dynamic Rendering, Maintainability
 * 
 * @version 3.1.0-dynamic
 * @package GMKB/System
 */

class DynamicSectionTemplates {
    constructor() {
        this.templates = new Map();
        this.logger = window.StructuredLogger || console;
        
        this.logger.info('📐 PHASE 3: DynamicSectionTemplates initializing');
        this.initializeTemplates();
    }
    
    /**
     * Initialize all section templates
     * Following checklist: Configuration-Driven, No Hardcoded Templates
     */
    initializeTemplates() {
        // Register all section types dynamically
        this.registerTemplate('full_width', this.createFullWidthTemplate());
        this.registerTemplate('two_column', this.createTwoColumnTemplate());
        this.registerTemplate('three_column', this.createThreeColumnTemplate());
        this.registerTemplate('grid', this.createGridTemplate());
        this.registerTemplate('hero', this.createHeroTemplate());
        
        this.logger.info(`✅ PHASE 3: Registered ${this.templates.size} dynamic section templates`);
    }
    
    /**
     * Register a section template
     * Following checklist: Extensibility, Plugin Architecture
     */
    registerTemplate(sectionType, template) {
        this.templates.set(sectionType, template);
        this.logger.debug(`📐 PHASE 3: Registered template for ${sectionType}`);
    }
    
    /**
     * Render section using dynamic template
     * Following checklist: Dynamic Rendering, Configuration-Driven
     */
    renderSection(section, components = []) {
        const template = this.templates.get(section.section_type);
        
        if (!template) {
            this.logger.warn(`⚠️ PHASE 3: No template found for section type: ${section.section_type}`);
            return this.createFallbackSection(section, components);
        }
        
        return template.render(section, components);
    }
    
    /**
     * Full Width Template - Dynamic
     * Single container that adapts to content
     */
    createFullWidthTemplate() {
        return {
            name: 'Full Width',
            description: 'Single full-width container',
            render: (section, components) => {
                const sectionEl = document.createElement('div');
                sectionEl.className = 'gmkb-section gmkb-section--full-width';
                sectionEl.id = `section-${section.section_id}`;
                sectionEl.dataset.sectionId = section.section_id;
                sectionEl.dataset.sectionType = 'full_width';
                
                // Apply dynamic styling
                this.applySectionStyling(sectionEl, section);
                
                // Create container structure
                const container = this.createContainer(section);
                const content = this.createContent(section, 'full_width');
                
                // Render components or empty state
                if (components.length > 0) {
                    components.forEach(component => {
                        const componentEl = this.createComponentContainer(component);
                        content.appendChild(componentEl);
                    });
                } else {
                    content.appendChild(this.createEmptyState(section));
                }
                
                container.appendChild(content);
                sectionEl.appendChild(container);
                
                return sectionEl;
            },
            
            getDefaultConfig: () => ({
                layout: {
                    width: 'full_width',
                    max_width: '100%',
                    padding: '40px 20px',
                    columns: 1
                },
                section_options: {
                    background_type: 'none',
                    spacing_top: 'medium',
                    spacing_bottom: 'medium'
                }
            })
        };
    }
    
    /**
     * Two Column Template - Dynamic
     * Flexible two-column layout with responsive behavior
     */
    createTwoColumnTemplate() {
        return {
            name: 'Two Column',
            description: 'Split layout with flexible ratios',
            render: (section, components) => {
                const sectionEl = document.createElement('div');
                sectionEl.className = 'gmkb-section gmkb-section--two-column';
                sectionEl.id = `section-${section.section_id}`;
                sectionEl.dataset.sectionId = section.section_id;
                sectionEl.dataset.sectionType = 'two_column';
                
                this.applySectionStyling(sectionEl, section);
                
                const container = this.createContainer(section);
                const content = this.createContent(section, 'two_column');
                
                // Organize components by column
                const columnComponents = this.organizeByColumns(components, 2);
                
                // Create column containers
                for (let i = 1; i <= 2; i++) {
                    const column = document.createElement('div');
                    column.className = `gmkb-section__column gmkb-section__column--${i}`;
                    column.dataset.column = i;
                    
                    if (columnComponents[i].length > 0) {
                        columnComponents[i].forEach(component => {
                            const componentEl = this.createComponentContainer(component);
                            column.appendChild(componentEl);
                        });
                    } else {
                        column.appendChild(this.createColumnEmptyState(section, i));
                    }
                    
                    content.appendChild(column);
                }
                
                container.appendChild(content);
                sectionEl.appendChild(container);
                
                return sectionEl;
            },
            
            getDefaultConfig: () => ({
                layout: {
                    width: 'constrained',
                    max_width: '1200px',
                    padding: '60px 20px',
                    columns: 2,
                    column_gap: '40px'
                },
                section_options: {
                    background_type: 'none',
                    spacing_top: 'large',
                    spacing_bottom: 'large'
                }
            })
        };
    }
    
    /**
     * Three Column Template - Dynamic
     */
    createThreeColumnTemplate() {
        return {
            name: 'Three Column',
            description: 'Triple column layout',
            render: (section, components) => {
                const sectionEl = document.createElement('div');
                sectionEl.className = 'gmkb-section gmkb-section--three-column';
                sectionEl.id = `section-${section.section_id}`;
                sectionEl.dataset.sectionId = section.section_id;
                sectionEl.dataset.sectionType = 'three_column';
                
                this.applySectionStyling(sectionEl, section);
                
                const container = this.createContainer(section);
                const content = this.createContent(section, 'three_column');
                
                const columnComponents = this.organizeByColumns(components, 3);
                
                for (let i = 1; i <= 3; i++) {
                    const column = document.createElement('div');
                    column.className = `gmkb-section__column gmkb-section__column--${i}`;
                    column.dataset.column = i;
                    
                    if (columnComponents[i].length > 0) {
                        columnComponents[i].forEach(component => {
                            const componentEl = this.createComponentContainer(component);
                            column.appendChild(componentEl);
                        });
                    } else {
                        column.appendChild(this.createColumnEmptyState(section, i));
                    }
                    
                    content.appendChild(column);
                }
                
                container.appendChild(content);
                sectionEl.appendChild(container);
                
                return sectionEl;
            },
            
            getDefaultConfig: () => ({
                layout: {
                    width: 'constrained',
                    max_width: '1200px',
                    padding: '60px 20px',
                    columns: 3,
                    column_gap: '30px'
                }
            })
        };
    }
    
    /**
     * Grid Template - Dynamic
     * CSS Grid with automatic placement
     */
    createGridTemplate() {
        return {
            name: 'Grid',
            description: 'CSS Grid flexible layout',
            render: (section, components) => {
                const sectionEl = document.createElement('div');
                sectionEl.className = 'gmkb-section gmkb-section--grid';
                sectionEl.id = `section-${section.section_id}`;
                sectionEl.dataset.sectionId = section.section_id;
                sectionEl.dataset.sectionType = 'grid';
                
                this.applySectionStyling(sectionEl, section);
                
                const container = this.createContainer(section);
                const content = this.createContent(section, 'grid');
                
                if (components.length > 0) {
                    components.forEach(component => {
                        const componentEl = this.createComponentContainer(component);
                        componentEl.classList.add('gmkb-section__grid-item');
                        content.appendChild(componentEl);
                    });
                } else {
                    const emptyState = this.createEmptyState(section, true);
                    emptyState.classList.add('gmkb-section__grid-empty');
                    content.appendChild(emptyState);
                }
                
                container.appendChild(content);
                sectionEl.appendChild(container);
                
                return sectionEl;
            },
            
            getDefaultConfig: () => ({
                layout: {
                    display: 'grid',
                    grid_template_columns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    column_gap: '30px',
                    row_gap: '30px'
                }
            })
        };
    }
    
    /**
     * Hero Template - Dynamic
     * Full-height hero section
     */
    createHeroTemplate() {
        return {
            name: 'Hero',
            description: 'Full-height hero section',
            render: (section, components) => {
                const sectionEl = document.createElement('div');
                sectionEl.className = 'gmkb-section gmkb-section--hero';
                sectionEl.id = `section-${section.section_id}`;
                sectionEl.dataset.sectionId = section.section_id;
                sectionEl.dataset.sectionType = 'hero';
                
                this.applySectionStyling(sectionEl, section);
                
                const container = this.createContainer(section);
                container.classList.add('gmkb-section__hero-container');
                
                const content = this.createContent(section, 'hero');
                content.classList.add('gmkb-section__hero-content');
                
                if (components.length > 0) {
                    components.forEach(component => {
                        const componentEl = this.createComponentContainer(component);
                        componentEl.classList.add('gmkb-section__hero-component');
                        content.appendChild(componentEl);
                    });
                    
                    // Add hero overlay
                    const overlay = document.createElement('div');
                    overlay.className = 'gmkb-section__hero-overlay';
                    container.appendChild(overlay);
                } else {
                    content.appendChild(this.createHeroEmptyState(section));
                }
                
                container.appendChild(content);
                sectionEl.appendChild(container);
                
                return sectionEl;
            },
            
            getDefaultConfig: () => ({
                layout: {
                    min_height: '70vh',
                    display: 'flex',
                    align_items: 'center',
                    justify_content: 'center'
                },
                section_options: {
                    background_type: 'gradient',
                    background_color: '#295cff'
                }
            })
        };
    }
    
    /**
     * Utility Methods for Template Creation
     */
    
    createContainer(section) {
        const container = document.createElement('div');
        container.className = 'gmkb-section__container';
        return container;
    }
    
    createContent(section, sectionType) {
        const content = document.createElement('div');
        content.className = `gmkb-section__content gmkb-section__content--${sectionType}`;
        return content;
    }
    
    createComponentContainer(component) {
        const div = document.createElement('div');
        div.className = 'gmkb-section__component';
        div.dataset.componentId = component.component_id;
        return div;
    }
    
    organizeByColumns(components, maxColumns) {
        const organized = {};
        
        // Initialize columns
        for (let i = 1; i <= maxColumns; i++) {
            organized[i] = [];
        }
        
        // Distribute components
        components.forEach(component => {
            const column = Math.min(maxColumns, Math.max(1, component.column || 1));
            organized[column].push(component);
        });
        
        return organized;
    }
    
    createEmptyState(section, isGrid = false) {
        const emptyState = document.createElement('div');
        emptyState.className = 'gmkb-section__empty-state';
        
        const dropZone = document.createElement('div');
        dropZone.className = 'gmkb-section__drop-zone';
        dropZone.dataset.sectionId = section.section_id;
        dropZone.dataset.column = '1';
        
        const message = isGrid 
            ? 'Drop components here - they\'ll arrange automatically in a grid'
            : 'Drop components here';
            
        dropZone.innerHTML = `<span class="gmkb-section__drop-text">${message}</span>`;
        
        emptyState.appendChild(dropZone);
        return emptyState;
    }
    
    createColumnEmptyState(section, columnNumber) {
        const emptyState = document.createElement('div');
        emptyState.className = 'gmkb-section__empty-state';
        
        const dropZone = document.createElement('div');
        dropZone.className = 'gmkb-section__drop-zone';
        dropZone.dataset.sectionId = section.section_id;
        dropZone.dataset.column = columnNumber.toString();
        
        dropZone.innerHTML = `<span class="gmkb-section__drop-text">Drop components here</span>`;
        
        emptyState.appendChild(dropZone);
        return emptyState;
    }
    
    createHeroEmptyState(section) {
        const emptyState = document.createElement('div');
        emptyState.className = 'gmkb-section__empty-state gmkb-section__hero-empty';
        
        const dropZone = document.createElement('div');
        dropZone.className = 'gmkb-section__drop-zone gmkb-section__hero-drop-zone';
        dropZone.dataset.sectionId = section.section_id;
        dropZone.dataset.column = '1';
        
        dropZone.innerHTML = `
            <div class="gmkb-section__hero-placeholder">
                <div class="gmkb-section__hero-icon">🌟</div>
                <h3 class="gmkb-section__hero-title">Hero Section</h3>
                <p class="gmkb-section__drop-text">Drop components here to create an impactful hero section</p>
            </div>
        `;
        
        emptyState.appendChild(dropZone);
        return emptyState;
    }
    
    applySectionStyling(element, section) {
        if (!window.sectionLayoutManager) return;
        
        const css = window.sectionLayoutManager.generateSectionCSS(section.section_id, 'desktop');
        if (css) {
            element.setAttribute('style', css);
        }
    }
    
    createFallbackSection(section, components) {
        this.logger.warn(`🔄 PHASE 3: Using fallback template for ${section.section_type}`);
        
        // Use full_width as fallback
        const fallbackTemplate = this.templates.get('full_width');
        if (fallbackTemplate) {
            return fallbackTemplate.render(section, components);
        }
        
        // Ultimate fallback
        const div = document.createElement('div');
        div.innerHTML = `<div class="gmkb-section-error">Section type "${section.section_type}" not supported</div>`;
        return div;
    }
    
    /**
     * Get available section types for UI
     */
    getAvailableTypes() {
        return Array.from(this.templates.keys()).map(type => {
            const template = this.templates.get(type);
            return {
                type,
                name: template.name,
                description: template.description,
                defaultConfig: template.getDefaultConfig()
            };
        });
    }
    
    /**
     * Get template configuration
     */
    getTemplateConfig(sectionType) {
        const template = this.templates.get(sectionType);
        return template ? template.getDefaultConfig() : null;
    }
    
    /**
     * Debug method
     */
    getDebugInfo() {
        return {
            registeredTemplates: Array.from(this.templates.keys()),
            templateCount: this.templates.size
        };
    }
}

// Global instance
window.DynamicSectionTemplates = DynamicSectionTemplates;

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.dynamicSectionTemplates = new DynamicSectionTemplates();
    });
} else {
    window.dynamicSectionTemplates = new DynamicSectionTemplates();
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DynamicSectionTemplates;
}
