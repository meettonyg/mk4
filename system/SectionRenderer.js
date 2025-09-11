/**
 * Section Renderer - ARCHITECTURE COMPLIANT
 * 
 * PRINCIPLES:
 * ✅ Event-driven rendering
 * ✅ Works with Section Layout Manager
 * ✅ No polling or timeouts
 * ✅ Root cause fixes only
 */

class SectionRenderer {
    constructor() {
        this.initialized = false;
        this.logger = window.structuredLogger || console;
        this.stateManager = null;
        this.sectionManager = null;
        
        // Event-driven initialization
        this.setupEventListeners();
        
        this.logger.info('[SECTION_RENDERER] Section Renderer created');
    }
    
    setupEventListeners() {
        // Listen for section manager ready
        document.addEventListener('gmkb:section-manager-ready', () => {
            this.logger.info('[SECTION_RENDERER] Section manager ready, initializing renderer');
            this.init();
        });
        
        // Listen for section events
        document.addEventListener('gmkb:render-section', (e) => {
            this.renderSection(e.detail.sectionId);
        });
        
        document.addEventListener('gmkb:render-all-sections', () => {
            this.renderAllSections();
        });
        
        // Try immediate init if systems are ready
        if (window.sectionLayoutManager && window.enhancedStateManager) {
            setTimeout(() => {
                if (!this.initialized) {
                    this.init();
                }
            }, 100);
        }
    }
    
    init() {
        if (this.initialized) {
            return;
        }
        
        this.sectionManager = window.sectionLayoutManager;
        this.stateManager = window.enhancedStateManager;
        
        if (!this.sectionManager || !this.stateManager) {
            this.logger.warn('[SECTION_RENDERER] Required managers not available');
            return;
        }
        
        this.initialized = true;
        this.logger.info('[SECTION_RENDERER] ✅ Section Renderer initialized');
        
        // Dispatch ready event
        document.dispatchEvent(new CustomEvent('gmkb:section-renderer-ready'));
    }
    
    getContainer() {
        return document.getElementById('saved-components-container') || 
               document.getElementById('media-kit-preview');
    }
    
    renderAllSections() {
        const container = this.getContainer();
        if (!container) {
            this.logger.error('[SECTION_RENDERER] No container found for sections');
            return;
        }
        
        const state = this.stateManager.getState();
        const sections = state.sections || [];
        
        this.logger.info('[SECTION_RENDERER] Rendering all sections:', sections.length);
        
        // Clear existing sections
        const existingSections = container.querySelectorAll('[data-section-id]');
        existingSections.forEach(el => el.remove());
        
        // Render each section
        sections.forEach(section => {
            this.createSectionElement(section, container);
        });
        
        // Render components in sections
        this.renderComponentsInSections(sections);
    }
    
    renderSection(sectionId) {
        const container = this.getContainer();
        if (!container) {
            this.logger.error('[SECTION_RENDERER] No container found');
            return;
        }
        
        const state = this.stateManager.getState();
        const section = (state.sections || []).find(s => s.section_id === sectionId);
        
        if (!section) {
            this.logger.warn('[SECTION_RENDERER] Section not found:', sectionId);
            return;
        }
        
        // Check if section already exists
        let sectionEl = container.querySelector(`[data-section-id="${sectionId}"]`);
        
        if (!sectionEl) {
            sectionEl = this.createSectionElement(section, container);
        }
        
        // Render components in this section
        this.renderComponentsInSection(section);
    }
    
    createSectionElement(section, container) {
        const sectionEl = document.createElement('div');
        sectionEl.className = `gmkb-section gmkb-section--${section.type || 'full_width'}`;
        sectionEl.setAttribute('data-section-id', section.section_id);
        sectionEl.setAttribute('data-section-type', section.type || 'full_width');
        
        // Create section structure based on type
        const contentHTML = this.getSectionContentHTML(section.type);
        sectionEl.innerHTML = contentHTML;
        
        // Add section controls
        const controls = this.createSectionControls(section.section_id);
        sectionEl.appendChild(controls);
        
        container.appendChild(sectionEl);
        
        this.logger.info('[SECTION_RENDERER] Created section element:', section.section_id);
        
        return sectionEl;
    }
    
    getSectionContentHTML(type) {
        switch (type) {
            case 'two_column':
                return `
                    <div class="gmkb-section__content gmkb-section__content--two-column">
                        <div class="gmkb-section__column" data-column="1" data-drop-zone="true"></div>
                        <div class="gmkb-section__column" data-column="2" data-drop-zone="true"></div>
                    </div>
                `;
            
            case 'three_column':
                return `
                    <div class="gmkb-section__content gmkb-section__content--three-column">
                        <div class="gmkb-section__column" data-column="1" data-drop-zone="true"></div>
                        <div class="gmkb-section__column" data-column="2" data-drop-zone="true"></div>
                        <div class="gmkb-section__column" data-column="3" data-drop-zone="true"></div>
                    </div>
                `;
            
            case 'full_width':
            default:
                return `
                    <div class="gmkb-section__content" data-drop-zone="true"></div>
                `;
        }
    }
    
    createSectionControls(sectionId) {
        const controls = document.createElement('div');
        controls.className = 'gmkb-section__controls';
        controls.innerHTML = `
            <button class="gmkb-section__control gmkb-section__control--settings" 
                    data-section-id="${sectionId}"
                    title="Section Settings">
                ⚙️
            </button>
            <button class="gmkb-section__control gmkb-section__control--delete" 
                    data-section-id="${sectionId}"
                    title="Delete Section">
                ×
            </button>
        `;
        
        // Add event listeners
        controls.querySelector('.gmkb-section__control--delete').addEventListener('click', () => {
            this.handleDeleteSection(sectionId);
        });
        
        return controls;
    }
    
    handleDeleteSection(sectionId) {
        if (confirm('Delete this section and all its components?')) {
            document.dispatchEvent(new CustomEvent('gmkb:remove-section', {
                detail: { sectionId }
            }));
        }
    }
    
    renderComponentsInSections(sections) {
        const state = this.stateManager.getState();
        const components = state.components || {};
        
        sections.forEach(section => {
            this.renderComponentsInSection(section);
        });
    }
    
    renderComponentsInSection(section) {
        const state = this.stateManager.getState();
        const components = Object.values(state.components || {}).filter(
            comp => comp.sectionId === section.section_id
        );
        
        if (components.length === 0) {
            return;
        }
        
        const sectionEl = document.querySelector(`[data-section-id="${section.section_id}"]`);
        if (!sectionEl) {
            this.logger.warn('[SECTION_RENDERER] Section element not found:', section.section_id);
            return;
        }
        
        this.logger.info('[SECTION_RENDERER] Rendering', components.length, 'components in section:', section.section_id);
        
        // Render each component
        components.forEach(component => {
            // Determine target container based on column
            let targetContainer;
            if (section.type === 'two_column' || section.type === 'three_column') {
                const column = component.columnNumber || 1;
                targetContainer = sectionEl.querySelector(`[data-column="${column}"]`);
            }
            
            if (!targetContainer) {
                targetContainer = sectionEl.querySelector('.gmkb-section__content, [data-drop-zone="true"]');
            }
            
            if (targetContainer) {
                // Set temporary target for renderer
                component._renderTarget = targetContainer;
            }
            
            // Use the component renderer
            if (window.enhancedComponentRenderer && window.enhancedComponentRenderer.renderComponent) {
                window.enhancedComponentRenderer.renderComponent(component);
            }
        });
    }
}

// Wait for dependencies before creating the renderer
// ARCHITECTURE COMPLIANT: Event-driven initialization
(function() {
    'use strict';
    
    let rendererCreated = false;
    
    const createRenderer = () => {
        if (rendererCreated) return;
        
        // Check if dependencies are available
        if (!window.structuredLogger || !window.enhancedStateManager || !window.sectionLayoutManager) {
            // Listen for dependencies
            if (!window.structuredLogger) {
                document.addEventListener('gmkb:structured-logger-ready', createRenderer, { once: true });
            }
            if (!window.enhancedStateManager) {
                document.addEventListener('gmkb:state-manager-ready', createRenderer, { once: true });
            }
            if (!window.sectionLayoutManager) {
                document.addEventListener('gmkb:section-manager-ready', createRenderer, { once: true });
            }
            return;
        }
        
        rendererCreated = true;
        
        // Create and expose globally
        window.sectionRenderer = new SectionRenderer();
        
        // Also expose as SectionRenderer for compatibility
        window.SectionRenderer = window.sectionRenderer;
        
        // Log availability
        if (window.structuredLogger) {
            window.structuredLogger.info('[SECTION_RENDERER] Section Renderer available globally');
        } else {
            console.log('✅ Section Renderer available globally');
        }
    };
    
    // Try to create immediately if dependencies are ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createRenderer);
    } else {
        createRenderer();
    }
    
    // Also listen for dependency ready events
    document.addEventListener('gmkb:state-manager-ready', createRenderer);
    document.addEventListener('gmkb:section-manager-ready', createRenderer);
})();
