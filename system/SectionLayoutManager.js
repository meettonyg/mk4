/**
 * Section Layout Manager - ARCHITECTURE COMPLIANT
 * 
 * PRINCIPLES:
 * ✅ Event-driven, no polling
 * ✅ Single source of truth (state manager)
 * ✅ Self-contained architecture
 * ✅ Root cause fixes only
 */

class SectionLayoutManager {
    constructor() {
        this.initialized = false;
        this.sections = new Map();
        this.stateManager = null;
        this.logger = window.structuredLogger || console;
        
        // Event-driven initialization
        this.setupEventListeners();
        
        this.logger.info('[SECTION_MANAGER] Section Layout Manager created, waiting for core systems');
    }
    
    setupEventListeners() {
        // Listen for core systems ready
        document.addEventListener('gmkb:core-systems-ready', () => {
            this.logger.info('[SECTION_MANAGER] Core systems ready event received');
            this.init();
        });
        
        // Also try immediate initialization
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            setTimeout(() => {
                if (!this.initialized && window.enhancedStateManager) {
                    this.logger.info('[SECTION_MANAGER] Initializing immediately (systems detected)');
                    this.init();
                }
            }, 100);
        }
    }
    
    init() {
        if (this.initialized) {
            this.logger.info('[SECTION_MANAGER] Already initialized, skipping');
            return;
        }
        
        this.stateManager = window.enhancedStateManager;
        if (!this.stateManager) {
            this.logger.error('[SECTION_MANAGER] State manager not available, cannot initialize');
            return;
        }
        
        this.initialized = true;
        this.logger.info('[SECTION_MANAGER] ✅ Section Layout Manager initialized');
        
        // Load existing sections from state
        this.loadSectionsFromState();
        
        // Set up section operation handlers
        this.setupSectionHandlers();
        
        // Dispatch ready event
        document.dispatchEvent(new CustomEvent('gmkb:section-manager-ready'));
        
        // Render all sections
        this.renderAllSections();
    }
    
    setupSectionHandlers() {
        // Listen for section operations
        document.addEventListener('gmkb:add-section', (e) => {
            this.addSection(e.detail.type, e.detail.config);
        });
        
        document.addEventListener('gmkb:remove-section', (e) => {
            this.removeSection(e.detail.sectionId);
        });
        
        document.addEventListener('gmkb:component-added', (e) => {
            this.handleComponentAdded(e.detail);
        });
    }
    
    loadSectionsFromState() {
        const state = this.stateManager.getState();
        if (state.sections && Array.isArray(state.sections)) {
            this.logger.info('[SECTION_MANAGER] Loading sections from state:', state.sections.length);
            
            state.sections.forEach(section => {
                this.sections.set(section.section_id, section);
            });
        } else {
            this.logger.info('[SECTION_MANAGER] No sections in state');
        }
    }
    
    registerSection(sectionId, type = 'full_width', config = {}) {
        this.logger.info('[SECTION_MANAGER] Registering section:', sectionId, type);
        
        const section = {
            section_id: sectionId,
            type: type,
            config: config,
            components: [],
            created_at: Date.now()
        };
        
        this.sections.set(sectionId, section);
        
        // Update state
        this.updateSectionsInState();
        
        // Render the section
        this.renderSection(section);
        
        return section;
    }
    
    addSection(type = 'full_width', config = {}) {
        const sectionId = `section_${Date.now()}`;
        return this.registerSection(sectionId, type, config);
    }
    
    removeSection(sectionId) {
        this.logger.info('[SECTION_MANAGER] Removing section:', sectionId);
        
        // Remove from internal map
        this.sections.delete(sectionId);
        
        // Update state
        this.updateSectionsInState();
        
        // Remove from DOM
        const element = document.querySelector(`[data-section-id="${sectionId}"]`);
        if (element) {
            element.remove();
        }
    }
    
    updateSectionsInState() {
        const sectionsArray = Array.from(this.sections.values());
        
        this.stateManager.dispatch({
            type: 'UPDATE_SECTIONS',
            payload: sectionsArray
        });
        
        this.logger.info('[SECTION_MANAGER] Updated sections in state:', sectionsArray.length);
    }
    
    handleComponentAdded(detail) {
        const { componentId, targetSectionId } = detail;
        
        if (targetSectionId && this.sections.has(targetSectionId)) {
            const section = this.sections.get(targetSectionId);
            if (!section.components) {
                section.components = [];
            }
            
            // Add component to section
            if (!section.components.find(c => c.component_id === componentId)) {
                section.components.push({
                    component_id: componentId,
                    added_at: Date.now()
                });
                
                this.logger.info('[SECTION_MANAGER] Added component to section:', componentId, '->', targetSectionId);
                
                // Update state
                this.updateSectionsInState();
            }
        }
    }
    
    renderAllSections() {
        const container = document.getElementById('saved-components-container') || 
                        document.getElementById('media-kit-preview');
        
        if (!container) {
            this.logger.warn('[SECTION_MANAGER] No container found for sections');
            return;
        }
        
        this.logger.info('[SECTION_MANAGER] Rendering all sections:', this.sections.size);
        
        // Clear container
        const existingSections = container.querySelectorAll('[data-section-id]');
        existingSections.forEach(el => el.remove());
        
        // Render each section
        this.sections.forEach(section => {
            this.renderSection(section);
        });
    }
    
    renderSection(section) {
        const container = document.getElementById('saved-components-container') || 
                        document.getElementById('media-kit-preview');
        
        if (!container) {
            this.logger.warn('[SECTION_MANAGER] No container found for section');
            return;
        }
        
        // Check if section already exists
        let sectionEl = document.querySelector(`[data-section-id="${section.section_id}"]`);
        
        if (!sectionEl) {
            // Create section element
            sectionEl = document.createElement('div');
            sectionEl.className = `gmkb-section gmkb-section--${section.type || 'full_width'}`;
            sectionEl.setAttribute('data-section-id', section.section_id);
            sectionEl.setAttribute('data-section-type', section.type || 'full_width');
            
            // Add section content area
            const contentEl = document.createElement('div');
            contentEl.className = 'gmkb-section__content';
            contentEl.setAttribute('data-drop-zone', 'true');
            sectionEl.appendChild(contentEl);
            
            // Add section controls
            const controlsEl = document.createElement('div');
            controlsEl.className = 'gmkb-section__controls';
            controlsEl.innerHTML = `
                <button class="gmkb-section__control gmkb-section__control--delete" 
                        data-section-id="${section.section_id}"
                        title="Delete Section">
                    <span>×</span>
                </button>
            `;
            sectionEl.appendChild(controlsEl);
            
            container.appendChild(sectionEl);
            
            this.logger.info('[SECTION_MANAGER] Created section element:', section.section_id);
        }
        
        // Now render components in this section
        this.renderComponentsInSection(section);
    }
    
    renderComponentsInSection(section) {
        const state = this.stateManager.getState();
        const sectionEl = document.querySelector(`[data-section-id="${section.section_id}"]`);
        
        if (!sectionEl) {
            this.logger.warn('[SECTION_MANAGER] Section element not found:', section.section_id);
            return;
        }
        
        const contentEl = sectionEl.querySelector('.gmkb-section__content');
        if (!contentEl) {
            this.logger.warn('[SECTION_MANAGER] Section content area not found');
            return;
        }
        
        // Find components for this section
        const components = Object.values(state.components || {}).filter(
            comp => comp.sectionId === section.section_id
        );
        
        this.logger.info('[SECTION_MANAGER] Rendering components in section:', section.section_id, components.length);
        
        // Render each component
        components.forEach(component => {
            if (window.enhancedComponentRenderer && typeof window.enhancedComponentRenderer.renderComponent === 'function') {
                window.enhancedComponentRenderer.renderComponent(component);
            }
        });
    }
    
    getAllSections() {
        return Array.from(this.sections.values());
    }
    
    getSection(sectionId) {
        return this.sections.get(sectionId);
    }
}

// Wait for dependencies before creating the manager
// ARCHITECTURE COMPLIANT: Event-driven initialization
(function() {
    'use strict';
    
    let managerCreated = false;
    
    const createManager = () => {
        if (managerCreated) return;
        
        // Check if dependencies are available
        if (!window.structuredLogger || !window.enhancedStateManager) {
            // Listen for dependencies
            if (!window.structuredLogger) {
                document.addEventListener('gmkb:structured-logger-ready', createManager, { once: true });
            }
            if (!window.enhancedStateManager) {
                document.addEventListener('gmkb:state-manager-ready', createManager, { once: true });
            }
            return;
        }
        
        managerCreated = true;
        
        // Create and expose globally
        window.sectionLayoutManager = new SectionLayoutManager();
        
        // Also expose as SectionLayoutManager for compatibility
        window.SectionLayoutManager = window.sectionLayoutManager;
        
        // Log availability
        if (window.structuredLogger) {
            window.structuredLogger.info('[SECTION_MANAGER] Section Layout Manager available globally');
        } else {
            console.log('✅ Section Layout Manager available globally');
        }
    };
    
    // Try to create immediately if dependencies are ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createManager);
    } else {
        createManager();
    }
    
    // Also listen for state manager ready event
    document.addEventListener('gmkb:state-manager-ready', createManager);
})();
