console.log('🎨 SectionRenderer.js LOADING');

/**
 * Section Renderer - ARCHITECTURE COMPLIANT
 * 
 * PRINCIPLES:
 * ✅ Event-driven, no polling
 * ✅ Single source of truth (state manager)
 * ✅ Self-contained architecture
 * ✅ Root cause fixes only
 */

class SectionRenderer {
    constructor() {
        this.initialized = false;
        this.stateManager = null;
        this.sectionManager = null;
        this.logger = window.structuredLogger || console;
        
        // Event-driven initialization
        this.setupEventListeners();
        
        this.logger.info('[SECTION_RENDERER] Section Renderer created, waiting for dependencies');
    }
    
    setupEventListeners() {
        // CHECKLIST COMPLIANT: Event-driven initialization only - NO POLLING
        const tryInitialize = () => {
            if (!this.initialized && window.enhancedStateManager && window.sectionLayoutManager) {
                this.logger.info('[SECTION_RENDERER] Dependencies available, initializing immediately');
                this.init();
            }
        };
        
        // Listen for dependencies
        document.addEventListener('gmkb:state-manager-ready', tryInitialize);
        document.addEventListener('gmkb:section-manager-ready', tryInitialize);
        document.addEventListener('gmkb:section-layout-manager-created', tryInitialize);
        document.addEventListener('gmkb:core-systems-ready', tryInitialize);
        
        // Try immediate initialization if dependencies exist
        if (window.enhancedStateManager && window.sectionLayoutManager) {
            tryInitialize();
        }
    }
    
    init() {
        if (this.initialized) {
            this.logger.info('[SECTION_RENDERER] Already initialized, skipping');
            return;
        }
        
        this.stateManager = window.enhancedStateManager;
        this.sectionManager = window.sectionLayoutManager;
        
        if (!this.stateManager || !this.sectionManager) {
            this.logger.error('[SECTION_RENDERER] Dependencies not available, cannot initialize');
            return;
        }
        
        this.initialized = true;
        this.logger.info('[SECTION_RENDERER] ✅ Section Renderer initialized');
        
        // Set up event handlers
        this.setupSectionHandlers();
        
        // Dispatch ready event
        document.dispatchEvent(new CustomEvent('gmkb:section-renderer-ready'));
        
        // ROOT FIX: Notify coordinator of our readiness
        if (window.coreSystemsCoordinator && typeof window.coreSystemsCoordinator.checkSystemReadiness === 'function') {
            window.coreSystemsCoordinator.checkSystemReadiness();
            this.logger.info('[SECTION_RENDERER] Notified coordinator of readiness');
        }
        
        // Auto-create sections for existing components if needed
        this.autoCreateSectionsForExistingComponents();
        
        // ROOT FIX: DO NOT render sections here - main Renderer handles it
        this.logger.info('[SECTION_RENDERER] Skipping initial render (handled by main renderer)');
    }
    
    setupSectionHandlers() {
        // ROOT FIX: DISABLE auto-rendering to prevent duplicates
        // The main Renderer.js already handles section rendering
        // This class should only provide section management utilities
        
        // Listen for explicit render requests only
        document.addEventListener('gmkb:render-section', (e) => {
            // Disabled to prevent duplicate rendering
            this.logger.info('[SECTION_RENDERER] Render request received but ignored (handled by main renderer)');
        });
        
        document.addEventListener('gmkb:render-all-sections', () => {
            // Disabled to prevent duplicate rendering
            this.logger.info('[SECTION_RENDERER] Render all request received but ignored (handled by main renderer)');
        });
        
        // ROOT FIX: DO NOT subscribe to state changes for rendering
        // Main renderer already handles this
    }
    
    sectionsChanged(newState) {
        const oldSections = this.lastSections || [];
        const newSections = newState.sections || [];
        
        if (oldSections.length !== newSections.length) {
            this.lastSections = newSections;
            return true;
        }
        
        // Check for changes in section content
        for (let i = 0; i < newSections.length; i++) {
            if (JSON.stringify(oldSections[i]) !== JSON.stringify(newSections[i])) {
                this.lastSections = newSections;
                return true;
            }
        }
        
        return false;
    }
    
    autoCreateSectionsForExistingComponents() {
        const state = this.stateManager.getState();
        const components = state.components || {};
        const sections = state.sections || [];
        
        // Check if we have components but no sections
        if (Object.keys(components).length > 0 && sections.length === 0) {
            this.logger.info('[SECTION_RENDERER] Components exist without sections, creating default section');
            
            // Create a default section
            const defaultSectionId = `section_default_${Date.now()}`;
            this.sectionManager.registerSection(defaultSectionId, 'full_width', { isDefault: true });
            
            // Assign all components to this section
            Object.values(components).forEach(component => {
                if (!component.sectionId) {
                    this.stateManager.dispatch({
                        type: 'UPDATE_COMPONENT',
                        payload: {
                            id: component.id,
                            updates: { sectionId: defaultSectionId }
                        }
                    });
                }
            });
        }
    }
    
    renderAllSections() {
        const container = this.getMainContainer();
        if (!container) {
            this.logger.warn('[SECTION_RENDERER] No container found for sections');
            return;
        }
        
        const state = this.stateManager.getState();
        const sections = state.sections || [];
        
        if (sections.length === 0) {
            this.logger.info('[SECTION_RENDERER] No sections to render');
            return;
        }
        
        this.logger.info('[SECTION_RENDERER] Rendering sections:', sections.length);
        
        // Clear existing sections
        const existingSections = container.querySelectorAll('[data-section-id]');
        existingSections.forEach(el => el.remove());
        
        // Render each section
        sections.forEach(section => {
            this.renderSectionElement(section, container);
        });
    }
    
    renderSection(sectionId) {
        const container = this.getMainContainer();
        if (!container) {
            this.logger.warn('[SECTION_RENDERER] No container found');
            return;
        }
        
        const state = this.stateManager.getState();
        const section = (state.sections || []).find(s => s.section_id === sectionId);
        
        if (!section) {
            this.logger.warn('[SECTION_RENDERER] Section not found:', sectionId);
            return;
        }
        
        // Check if section already exists
        let existingSection = container.querySelector(`[data-section-id="${sectionId}"]`);
        if (existingSection) {
            existingSection.remove();
        }
        
        this.renderSectionElement(section, container);
    }
    
    renderSectionElement(section, container) {
        // Create section element
        const sectionEl = document.createElement('div');
        sectionEl.className = `gmkb-section gmkb-section--${section.type || 'full_width'}`;
        sectionEl.setAttribute('data-section-id', section.section_id);
        sectionEl.setAttribute('data-section-type', section.type || 'full_width');
        
        // Create inner container for proper structure
        const innerContainer = document.createElement('div');
        innerContainer.className = 'gmkb-section__inner';
        
        // Add section content area(s) based on type
        if (section.type === 'two_column') {
            // Two column layout with proper drop zones
            innerContainer.innerHTML = `
                <div class="gmkb-section__column gmkb-section__column--1 gmkb-section__column--left" 
                     data-drop-zone="true" 
                     data-column="left"
                     data-column-index="1">
                    <div class="gmkb-section__drop-zone">
                        <span class="gmkb-section__drop-text">Drop to Column 1</span>
                    </div>
                </div>
                <div class="gmkb-section__column gmkb-section__column--2 gmkb-section__column--right" 
                     data-drop-zone="true" 
                     data-column="right"
                     data-column-index="2">
                    <div class="gmkb-section__drop-zone">
                        <span class="gmkb-section__drop-text">Drop to Column 2</span>
                    </div>
                </div>
            `;
        } else if (section.type === 'three_column') {
            // Three column layout with proper drop zones
            innerContainer.innerHTML = `
                <div class="gmkb-section__column gmkb-section__column--1 gmkb-section__column--left" 
                     data-drop-zone="true" 
                     data-column="left"
                     data-column-index="1">
                    <div class="gmkb-section__drop-zone">
                        <span class="gmkb-section__drop-text">Drop to Column 1</span>
                    </div>
                </div>
                <div class="gmkb-section__column gmkb-section__column--2 gmkb-section__column--center" 
                     data-drop-zone="true" 
                     data-column="center"
                     data-column-index="2">
                    <div class="gmkb-section__drop-zone">
                        <span class="gmkb-section__drop-text">Drop to Column 2</span>
                    </div>
                </div>
                <div class="gmkb-section__column gmkb-section__column--3 gmkb-section__column--right" 
                     data-drop-zone="true" 
                     data-column="right"
                     data-column-index="3">
                    <div class="gmkb-section__drop-zone">
                        <span class="gmkb-section__drop-text">Drop to Column 3</span>
                    </div>
                </div>
            `;
        } else if (section.type === 'main_sidebar' || section.type === 'sidebar') {
            // Main + Sidebar layout
            innerContainer.innerHTML = `
                <div class="gmkb-section__column gmkb-section__column--1 gmkb-section__column--main" 
                     data-drop-zone="true" 
                     data-column="main"
                     data-column-index="1">
                    <div class="gmkb-section__drop-zone">
                        <span class="gmkb-section__drop-text">Drop to Main Area</span>
                    </div>
                </div>
                <div class="gmkb-section__column gmkb-section__column--2 gmkb-section__column--sidebar" 
                     data-drop-zone="true" 
                     data-column="sidebar"
                     data-column-index="2">
                    <div class="gmkb-section__drop-zone">
                        <span class="gmkb-section__drop-text">Drop to Sidebar</span>
                    </div>
                </div>
            `;
        } else {
            // Full width or default - single content area
            innerContainer.innerHTML = `
                <div class="gmkb-section__content" 
                     data-drop-zone="true" 
                     data-column="full"
                     data-column-index="1">
                    <div class="gmkb-section__drop-zone">
                        <span class="gmkb-section__drop-text">Drop components here</span>
                    </div>
                </div>
            `;
        }
        
        // Add inner container to section
        sectionEl.appendChild(innerContainer);
        
        // Add section controls
        const controlsEl = document.createElement('div');
        controlsEl.className = 'gmkb-section__controls';
        controlsEl.innerHTML = `
            <button class="gmkb-section__control gmkb-section__control--move gmkb-section__control--move-up" 
                    data-section-id="${section.section_id}"
                    data-action="move-up"
                    title="Move Section Up">
                <span>↑</span>
            </button>
            <button class="gmkb-section__control gmkb-section__control--move gmkb-section__control--move-down" 
                    data-section-id="${section.section_id}"
                    data-action="move-down"
                    title="Move Section Down">
                <span>↓</span>
            </button>
            <button class="gmkb-section__control gmkb-section__control--settings" 
                    data-section-id="${section.section_id}"
                    data-action="settings"
                    title="Section Settings">
                <span>⚙</span>
            </button>
            <button class="gmkb-section__control gmkb-section__control--duplicate" 
                    data-section-id="${section.section_id}"
                    data-action="duplicate"
                    title="Duplicate Section">
                <span>⧉</span>
            </button>
            <button class="gmkb-section__control gmkb-section__control--delete" 
                    data-section-id="${section.section_id}"
                    data-action="delete"
                    title="Delete Section">
                <span>×</span>
            </button>
        `;
        sectionEl.appendChild(controlsEl);
        
        // Append to container
        container.appendChild(sectionEl);
        
        this.logger.info('[SECTION_RENDERER] Rendered section:', section.section_id);
        
        // Dispatch event for components to render
        document.dispatchEvent(new CustomEvent('gmkb:section-rendered', {
            detail: {
                sectionId: section.section_id,
                element: sectionEl,
                timestamp: Date.now()
            }
        }));
    }
    
    getMainContainer() {
        return document.getElementById('saved-components-container') || 
               document.getElementById('media-kit-preview') ||
               document.querySelector('.media-kit-preview');
    }
    
    getDebugInfo() {
        const state = this.stateManager ? this.stateManager.getState() : null;
        return {
            initialized: this.initialized,
            sectionsInState: state ? (state.sections || []).length : 0,
            sectionsInDOM: document.querySelectorAll('[data-section-id]').length,
            componentsInState: state ? Object.keys(state.components || {}).length : 0,
            componentsInDOM: document.querySelectorAll('[data-component-id]').length
        };
    }
}

// ARCHITECTURE COMPLIANT: Expose class globally first
window.SectionRenderer = SectionRenderer;

// CHECKLIST COMPLIANT: Event-driven initialization
(function() {
    'use strict';
    
    function initializeSectionRenderer() {
        if (window.sectionRenderer) {
            console.log('✅ Section Renderer already exists');
            return;
        }
        
        // Create instance
        window.sectionRenderer = new SectionRenderer();
        console.log('✅ Section Renderer instance created');
        
        // Dispatch event for other systems
        document.dispatchEvent(new CustomEvent('gmkb:section-renderer-created', {
            detail: { renderer: window.sectionRenderer }
        }));
    }
    
    // Listen for section manager to be ready
    document.addEventListener('gmkb:section-manager-ready', initializeSectionRenderer);
    document.addEventListener('gmkb:section-layout-manager-created', initializeSectionRenderer);
    document.addEventListener('gmkb:core-systems-ready', initializeSectionRenderer);
    
    // If DOM is ready and dependencies exist, initialize immediately
    if (document.readyState !== 'loading') {
        if (window.enhancedStateManager && window.sectionLayoutManager) {
            initializeSectionRenderer();
        }
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            if (window.enhancedStateManager && window.sectionLayoutManager) {
                initializeSectionRenderer();
            }
        });
    }
})();