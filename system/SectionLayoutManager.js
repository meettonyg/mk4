/**
 * Section Layout Manager
 * Phase 3: Section Layer System
 * 
 * Creates a layout container system that manages component positioning, 
 * spacing, and responsive behavior at the section level
 * 
 * @version 3.0.0-phase3
 * @package GMKB/System
 */

class SectionLayoutManager {
    constructor() {
        this.sections = new Map();
        this.sectionOrder = [];
        this.logger = window.StructuredLogger || console;
        this.stateManager = null;
        
        this.logger.info('🏗️ PHASE 3: SectionLayoutManager initializing');
        this.initializeManager();
    }
    
    /**
     * Initialize the section layout manager
     * Following checklist: Event-Driven Initialization, Dependency-Awareness
     */
    initializeManager() {
        // Wait for core systems to be ready
        document.addEventListener('gmkb:core-systems-ready', () => {
            this.onCoreSystemsReady();
        });
        
        // Listen for component events
        document.addEventListener('gmkb:component-added', (event) => {
            this.onComponentAdded(event.detail);
        });
        
        document.addEventListener('gmkb:component-moved', (event) => {
            this.onComponentMoved(event.detail);
        });
        
        document.addEventListener('gmkb:component-removed', (event) => {
            this.onComponentRemoved(event.detail);
        });
        
        // Listen for section configuration updates
        document.addEventListener('gmkb:section-configuration-updated', (event) => {
            this.onSectionConfigurationUpdated(event.detail);
        });
        
        this.logger.info('✅ PHASE 3: SectionLayoutManager initialized');
    }
    
    /**
     * Handle core systems ready event
     * Following checklist: Centralized State, Dependency-Awareness
     */
    onCoreSystemsReady() {
        if (window.enhancedStateManager) {
            this.stateManager = window.enhancedStateManager;
            this.loadSectionsFromState();
        }
        
        this.logger.info('🎯 PHASE 3: Core systems ready - sections loaded');
    }
    
    /**
     * Load sections from state
     * Following checklist: Centralized State, Schema Compliance
     */
    loadSectionsFromState() {
        if (!this.stateManager) return;
        
        const state = this.stateManager.getState();
        const sections = state.sections || [];
        
        sections.forEach(sectionData => {
            this.registerSection(
                sectionData.section_id,
                sectionData.section_type,
                sectionData
            );
        });
        
        this.logger.info(`📊 PHASE 3: Loaded ${sections.length} sections from state`);
    }
    
    /**
     * Register a new section
     * Following checklist: Schema Compliance, Event-Driven
     */
    registerSection(sectionId, sectionType, configuration = {}) {
        const defaultConfig = this.getDefaultSectionConfiguration(sectionType);
        
        const sectionConfig = {
            section_id: sectionId,
            section_type: sectionType,
            ...defaultConfig,
            ...configuration,
            components: configuration.components || [],
            created_at: configuration.created_at || Date.now(),
            updated_at: Date.now()
        };
        
        this.sections.set(sectionId, sectionConfig);
        
        // Add to order if not already present
        if (!this.sectionOrder.includes(sectionId)) {
            this.sectionOrder.push(sectionId);
        }
        
        // Update state
        this.updateSectionsInState();
        
        // Dispatch section registered event
        this.dispatchSectionEvent('gmkb:section-registered', {
            sectionId,
            sectionType,
            configuration: sectionConfig
        });
        
        this.logger.info(`✅ PHASE 3: Registered section ${sectionType} (${sectionId})`);
        return sectionConfig;
    }
    
    /**
     * Get default section configuration
     * Following checklist: Simplicity First, No Redundant Logic
     */
    getDefaultSectionConfiguration(sectionType) {
        const defaults = {
            full_width: {
                layout: {
                    width: 'full_width',
                    max_width: '100%',
                    padding: '40px 20px',
                    columns: 1,
                    column_gap: '0px'
                },
                section_options: {
                    background_type: 'none',
                    background_color: 'transparent',
                    spacing_top: 'medium',
                    spacing_bottom: 'medium'
                },
                responsive: {
                    mobile: { padding: '20px 15px' },
                    tablet: { padding: '30px 20px' }
                }
            },
            two_column: {
                layout: {
                    width: 'constrained',
                    max_width: '1200px',
                    padding: '60px 20px',
                    columns: 2,
                    column_gap: '40px'
                },
                section_options: {
                    background_type: 'none',
                    background_color: 'transparent',
                    spacing_top: 'large',
                    spacing_bottom: 'large'
                },
                responsive: {
                    mobile: { columns: 1, column_gap: '0px' },
                    tablet: { columns: 2, column_gap: '30px' }
                }
            },
            three_column: {
                layout: {
                    width: 'constrained',
                    max_width: '1200px',
                    padding: '60px 20px',
                    columns: 3,
                    column_gap: '30px'
                },
                section_options: {
                    background_type: 'none',
                    background_color: 'transparent',
                    spacing_top: 'large',
                    spacing_bottom: 'large'
                },
                responsive: {
                    mobile: { columns: 1, column_gap: '0px' },
                    tablet: { columns: 2, column_gap: '20px' }
                }
            },
            grid: {
                layout: {
                    width: 'constrained',
                    max_width: '1200px',
                    padding: '60px 20px',
                    display: 'grid',
                    grid_template_columns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    column_gap: '30px',
                    row_gap: '30px'
                },
                section_options: {
                    background_type: 'none',
                    background_color: 'transparent',
                    spacing_top: 'large',
                    spacing_bottom: 'large'
                },
                responsive: {
                    mobile: { grid_template_columns: '1fr', column_gap: '0px' },
                    tablet: { grid_template_columns: 'repeat(2, 1fr)' }
                }
            },
            hero: {
                layout: {
                    width: 'full_width',
                    max_width: '100%',
                    min_height: '70vh',
                    padding: '80px 20px',
                    columns: 1,
                    display: 'flex',
                    align_items: 'center',
                    justify_content: 'center'
                },
                section_options: {
                    background_type: 'gradient',
                    background_color: '#295cff',
                    spacing_top: 'none',
                    spacing_bottom: 'large'
                },
                responsive: {
                    mobile: { min_height: '50vh', padding: '60px 15px' },
                    tablet: { min_height: '60vh', padding: '70px 20px' }
                }
            }
        };
        
        return defaults[sectionType] || defaults.full_width;
    }
    
    /**
     * Assign component to section
     * Following checklist: Centralized State, Event-Driven
     */
    assignComponentToSection(componentId, sectionId, column = 1) {
        const section = this.sections.get(sectionId);
        if (!section) {
            this.logger.warn(`⚠️ PHASE 3: Cannot assign component - section ${sectionId} not found`);
            return false;
        }
        
        // Remove component from other sections first
        this.removeComponentFromAllSections(componentId);
        
        // Add to target section
        const componentAssignment = {
            component_id: componentId,
            column: Math.min(column, section.layout.columns || 1),
            order: section.components.length,
            assigned_at: Date.now()
        };
        
        section.components.push(componentAssignment);
        section.updated_at = Date.now();
        
        // Update state
        this.updateSectionsInState();
        
        // Dispatch event
        this.dispatchSectionEvent('gmkb:component-assigned-to-section', {
            componentId,
            sectionId,
            column: componentAssignment.column
        });
        
        this.logger.info(`✅ PHASE 3: Assigned component ${componentId} to section ${sectionId}, column ${column}`);
        return true;
    }
    
    /**
     * Remove component from all sections
     * Following checklist: Code Reduction, No Redundant Logic
     */
    removeComponentFromAllSections(componentId) {
        let removedFrom = [];
        
        this.sections.forEach((section, sectionId) => {
            const initialLength = section.components.length;
            section.components = section.components.filter(comp => comp.component_id !== componentId);
            
            if (section.components.length < initialLength) {
                removedFrom.push(sectionId);
                section.updated_at = Date.now();
            }
        });
        
        if (removedFrom.length > 0) {
            this.updateSectionsInState();
            this.logger.info(`🗑️ PHASE 3: Removed component ${componentId} from sections: ${removedFrom.join(', ')}`);
        }
        
        return removedFrom;
    }
    
    /**
     * Update section configuration
     * Following checklist: Schema Compliance, Centralized State
     */
    updateSectionConfiguration(sectionId, updates) {
        const section = this.sections.get(sectionId);
        if (!section) {
            this.logger.warn(`⚠️ PHASE 3: Cannot update - section ${sectionId} not found`);
            return null;
        }
        
        const updatedSection = {
            ...section,
            ...updates,
            layout: {
                ...section.layout,
                ...(updates.layout || {})
            },
            section_options: {
                ...section.section_options,
                ...(updates.section_options || {})
            },
            responsive: {
                ...section.responsive,
                ...(updates.responsive || {})
            },
            updated_at: Date.now()
        };
        
        this.sections.set(sectionId, updatedSection);
        
        // Update state
        this.updateSectionsInState();
        
        // Dispatch event
        this.dispatchSectionEvent('gmkb:section-updated', {
            sectionId,
            section: updatedSection
        });
        
        this.logger.info(`🔄 PHASE 3: Updated section ${sectionId}`);
        return updatedSection;
    }
    
    /**
     * Reorder sections
     * Following checklist: Centralized State, Event-Driven
     */
    reorderSections(newOrder) {
        // Validate new order
        const validOrder = newOrder.filter(sectionId => this.sections.has(sectionId));
        
        if (validOrder.length !== this.sections.size) {
            this.logger.warn('⚠️ PHASE 3: Section order validation failed - some sections missing');
            return false;
        }
        
        this.sectionOrder = validOrder;
        
        // Update state
        this.updateSectionsInState();
        
        // Dispatch event
        this.dispatchSectionEvent('gmkb:sections-reordered', {
            newOrder: validOrder
        });
        
        this.logger.info(`🔄 PHASE 3: Sections reordered: ${validOrder.join(', ')}`);
        return true;
    }
    
    /**
     * Get section layout CSS
     * Following checklist: No Redundant Logic, Simplicity First
     */
    generateSectionCSS(sectionId, breakpoint = 'desktop') {
        const section = this.sections.get(sectionId);
        if (!section) return '';
        
        const layout = section.layout;
        const options = section.section_options;
        const responsive = section.responsive[breakpoint] || {};
        
        // Merge layout with responsive overrides
        const finalLayout = { ...layout, ...responsive };
        
        const css = [];
        
        // Container styles
        css.push(`max-width: ${finalLayout.max_width || layout.max_width};`);
        css.push(`padding: ${finalLayout.padding || layout.padding};`);
        
        if (finalLayout.min_height) {
            css.push(`min-height: ${finalLayout.min_height};`);
        }
        
        // Display and alignment
        if (finalLayout.display) {
            css.push(`display: ${finalLayout.display};`);
            
            if (finalLayout.display === 'flex') {
                if (finalLayout.align_items) css.push(`align-items: ${finalLayout.align_items};`);
                if (finalLayout.justify_content) css.push(`justify-content: ${finalLayout.justify_content};`);
            }
            
            if (finalLayout.display === 'grid') {
                if (finalLayout.grid_template_columns) css.push(`grid-template-columns: ${finalLayout.grid_template_columns};`);
                if (finalLayout.column_gap) css.push(`column-gap: ${finalLayout.column_gap};`);
                if (finalLayout.row_gap) css.push(`row-gap: ${finalLayout.row_gap};`);
            }
        }
        
        // Column layout
        if (finalLayout.columns > 1 && finalLayout.display !== 'grid') {
            css.push(`display: grid;`);
            css.push(`grid-template-columns: repeat(${finalLayout.columns}, 1fr);`);
            if (finalLayout.column_gap) css.push(`column-gap: ${finalLayout.column_gap};`);
        }
        
        // Background
        if (options.background_type === 'color' && options.background_color) {
            css.push(`background-color: ${options.background_color};`);
        } else if (options.background_type === 'gradient') {
            const gradientColor = options.background_color || '#295cff';
            css.push(`background: linear-gradient(135deg, ${gradientColor}, ${this.lightenColor(gradientColor, 0.2)});`);
        }
        
        return css.join(' ');
    }
    
    /**
     * Utility: Lighten color for gradients
     * Following checklist: Simplicity First, No Redundant Logic
     */
    lightenColor(color, amount) {
        // Simple color lightening for gradients
        const hex = color.replace('#', '');
        const num = parseInt(hex, 16);
        
        let r = (num >> 16) + Math.round(amount * 255);
        let g = (num >> 8 & 0x00FF) + Math.round(amount * 255);
        let b = (num & 0x0000FF) + Math.round(amount * 255);
        
        r = Math.min(255, Math.max(0, r));
        g = Math.min(255, Math.max(0, g));
        b = Math.min(255, Math.max(0, b));
        
        return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
    }
    
    /**
     * Update sections in state
     * Following checklist: Centralized State, No Direct Manipulation
     */
    updateSectionsInState() {
        if (!this.stateManager) return;
        
        const sectionsArray = this.sectionOrder.map(sectionId => this.sections.get(sectionId));
        
        this.stateManager.dispatch({
            type: 'UPDATE_SECTIONS',
            payload: sectionsArray
        });
    }
    
    /**
     * Event handlers for component lifecycle
     * Following checklist: Event-Driven, Root Cause Fix
     */
    onComponentAdded(detail) {
        const { componentId, targetSectionId } = detail;
        
        if (targetSectionId) {
            this.assignComponentToSection(componentId, targetSectionId);
        } else {
            // Auto-assign to appropriate section or create new one
            this.autoAssignComponent(componentId);
        }
    }
    
    onComponentMoved(detail) {
        const { componentId, targetSectionId, column } = detail;
        
        if (targetSectionId) {
            this.assignComponentToSection(componentId, targetSectionId, column);
        }
    }
    
    onComponentRemoved(detail) {
        const { componentId } = detail;
        this.removeComponentFromAllSections(componentId);
    }
    
    onSectionConfigurationUpdated(detail) {
        const { sectionId, configuration } = detail;
        this.updateSectionConfiguration(sectionId, configuration);
    }
    
    /**
     * Auto-assign component to appropriate section
     * Following checklist: Simplicity First, Maintainability
     */
    autoAssignComponent(componentId) {
        // Try to find existing section with available space
        for (const [sectionId, section] of this.sections) {
            if (section.components.length < (section.layout.columns || 1)) {
                this.assignComponentToSection(componentId, sectionId);
                return;
            }
        }
        
        // Create new section if none available
        const newSectionId = `section_${Date.now()}`;
        this.registerSection(newSectionId, 'full_width');
        this.assignComponentToSection(componentId, newSectionId);
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
                source: 'SectionLayoutManager'
            }
        });
        
        document.dispatchEvent(event);
    }
    
    /**
     * Get section information
     * Following checklist: No Redundant Logic
     */
    getSection(sectionId) {
        return this.sections.get(sectionId) || null;
    }
    
    getAllSections() {
        return Array.from(this.sections.values());
    }
    
    getSectionsInOrder() {
        return this.sectionOrder.map(sectionId => this.sections.get(sectionId));
    }
    
    getSectionComponents(sectionId) {
        const section = this.sections.get(sectionId);
        return section ? section.components : [];
    }
    
    /**
     * Remove section
     * Following checklist: Graceful Failure, Centralized State
     */
    removeSection(sectionId) {
        const section = this.sections.get(sectionId);
        if (!section) {
            this.logger.warn(`⚠️ PHASE 3: Cannot remove - section ${sectionId} not found`);
            return false;
        }
        
        // Remove components from section first
        section.components.forEach(comp => {
            this.dispatchSectionEvent('gmkb:component-removed-from-section', {
                componentId: comp.component_id,
                sectionId
            });
        });
        
        // Remove section
        this.sections.delete(sectionId);
        this.sectionOrder = this.sectionOrder.filter(id => id !== sectionId);
        
        // Update state
        this.updateSectionsInState();
        
        // Dispatch event
        this.dispatchSectionEvent('gmkb:section-removed', { sectionId });
        
        this.logger.info(`🗑️ PHASE 3: Removed section ${sectionId}`);
        return true;
    }
    
    /**
     * Debug method - get current state
     * Following checklist: Diagnostic Logging
     */
    getDebugInfo() {
        return {
            sectionsCount: this.sections.size,
            sectionOrder: this.sectionOrder,
            sections: Array.from(this.sections.entries()),
            stateManagerAvailable: !!this.stateManager
        };
    }
}

// Global instance
window.SectionLayoutManager = SectionLayoutManager;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.sectionLayoutManager = new SectionLayoutManager();
    });
} else {
    window.sectionLayoutManager = new SectionLayoutManager();
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SectionLayoutManager;
}
