/**
 * @file design-panel.js
 * @description Manages the design panel for editing component properties.
 * FIXED: Now uses WordPress AJAX endpoints instead of direct PHP file access.
 * ROOT FIX: Handles destructive re-rendering issue with event-driven architecture
 */


// ROOT FIX: Use global debounce function from helpers.js
// debounce will be available globally

// ROOT FIX: Enhanced debounce for immediate use in design panel
const quickDebounce = (func, wait = 100) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

class DesignPanel {
    constructor() {
        // FIXED: Use existing element-editor in left sidebar
        this.panel = document.getElementById('element-editor');
        this.currentComponentId = null;
        this.isUpdating = false; // Track update state
        
        // ROOT FIX: Setup event listeners for component selection
        this.setupEventListeners();
    }
    
    /**
     * ROOT FIX: Setup event listeners for component selection
     */
    setupEventListeners() {
        // Listen for component selection
        document.addEventListener('gmkb:component-selected', (event) => {
            console.log('🎯 Design Panel: Component selected', event.detail);
            const { componentId, isRestoration } = event.detail;
            
            // ROOT FIX: If this is a restoration after update, just update the current ID
            if (isRestoration && this.currentComponentId === componentId) {
                console.log('✅ Design Panel: Component restored after update');
                // Panel is already open with this component, no need to reload
                return;
            }
            
            if (componentId) {
                this.load(componentId);
            }
        });
        
        // Listen for component deselection
        document.addEventListener('gmkb:component-deselected', (event) => {
            console.log('🚫 Design Panel: Component deselected');
            // Only hide if not in the middle of an update
            if (!this.isUpdating) {
                this.hide();
            }
        });
        
        // Listen for component edit request (from edit buttons)
        document.addEventListener('gmkb:component-edit-requested', (event) => {
            console.log('✏️ Design Panel: Edit requested', event.detail);
            const { componentId } = event.detail;
            if (componentId) {
                // Switch to design tab and load component
                this.show();
                this.load(componentId);
            }
        });
        
        // Listen for update lifecycle events
        document.addEventListener('gmkb:before-component-update', (event) => {
            if (event.detail.componentId === this.currentComponentId) {
                this.isUpdating = true;
            }
        });
        
        document.addEventListener('gmkb:after-component-update', (event) => {
            if (event.detail.componentId === this.currentComponentId) {
                this.isUpdating = false;
            }
        });
    }

    /**
     * Gets the component from the enhanced state manager
     * @param {string} componentId - The component ID
     * @returns {object|null} The component or null if not found
     */
    getComponent(componentId) {
        // Try enhanced state manager first
        if (window.enhancedStateManager && typeof window.enhancedStateManager.getState === 'function') {
            const state = window.enhancedStateManager.getState();
            return state.components[componentId] || null;
        }
        
        // Fallback to regular state manager
        if (window.stateManager && typeof window.stateManager.getState === 'function') {
            const state = window.stateManager.getState();
            return state.components[componentId] || null;
        }
        
        // Fallback to legacy state object
        if (window.state && window.state.components) {
            return window.state.components[componentId] || null;
        }
        
        return null;
    }

    /**
     * ROOT FIX: SINGLE SYSTEM - Component Options UI Only
     * NO FALLBACKS, NO DUAL SYSTEMS - CHECKLIST COMPLIANT
     * @param {string} componentId - The ID of the component to load.
     */
    async load(componentId) {
        console.log(`Loading design panel for component: ${componentId}`);
        
        this.currentComponentId = componentId;
        const component = this.getComponent(componentId);
        
        if (!component) {
            console.warn(`Component not found: ${componentId}`);
            
            this.panel.innerHTML = `
                <div class="element-editor__title">Component Not Found</div>
                <div class="element-editor__subtitle">The selected component could not be loaded</div>
                <div class="form-section">
                    <p class="form-help-text">Component ID: ${componentId}</p>
                    <p class="form-help-text">Try refreshing the page or selecting a different component.</p>
                </div>
            `;
            this.show();
            return;
        }

        console.log(`📋 Component found:`, component);
        
        // Show the design panel first
        this.show();
        
        // Get or create the panel element
        if (!this.panel) {
            this.panel = document.getElementById('element-editor') || document.querySelector('.element-editor-sidebar');
        }
        
        // ROOT FIX: ONLY use Component Options UI - wait briefly if not ready
        const waitForOptionsUI = async () => {
            let attempts = 0;
            while (attempts < 10) {
                if (window.componentOptionsUI && typeof window.componentOptionsUI.loadComponentOptions === 'function') {
                    return true;
                }
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            return false;
        };
        
        const optionsUIReady = await waitForOptionsUI();
        
        if (optionsUIReady) {
            try {
                await window.componentOptionsUI.loadComponentOptions(
                    componentId,
                    component.type,
                    this.panel
                );
                
                console.log('✅ Component Options UI loaded successfully');
                
                // Dispatch design panel opened event
                document.dispatchEvent(new CustomEvent('gmkb:design-panel-opened', {
                    detail: {
                        componentId: componentId,
                        componentType: component.type,
                        panelElement: this.panel,
                        timestamp: Date.now()
                    }
                }));
                
            } catch (error) {
                console.error('Failed to load Component Options UI:', error);
                
                // Show simple error state - NO FALLBACK TO OLD SYSTEM
                this.panel.innerHTML = `
                    <div class="element-editor__title">${this.formatComponentName(component.type)} Settings</div>
                    <div class="element-editor__subtitle">Configuration unavailable</div>
                    <div class="form-section">
                        <p class="form-help-text">
                            This component doesn't have configurable options yet.
                            You can edit it directly in the preview area.
                        </p>
                    </div>
                    <div class="form-section">
                        <h4 class="form-section__title">Available Actions</h4>
                        <ul class="tips-list">
                            <li>Click directly on the component to edit inline</li>
                            <li>Use the hover controls to move, duplicate, or delete</li>
                            <li>Drag to reorder within sections</li>
                        </ul>
                    </div>
                `;
            }
        } else {
            // Component Options UI not available yet
            this.panel.innerHTML = `
                <div class="element-editor__title">Initializing...</div>
                <div class="element-editor__subtitle">Component configuration system loading</div>
                <div class="form-section">
                    <p class="form-help-text">Please wait a moment and try again.</p>
                </div>
            `;
            
            // Try again after a brief delay
            setTimeout(() => {
                if (window.componentOptionsUI) {
                    this.load(componentId);
                }
            }, 500);
        }
    }
    
    /**
     * Helper to format component name
     */
    formatComponentName(type) {
        return type.replace(/_/g, ' ').replace(/-/g, ' ')
                   .replace(/\b\w/g, l => l.toUpperCase());
    }
    


    /**
     * Debug function to show available components (debug console only)
     */
    debugAvailableComponents() {
        // Only log to console in debug mode
        if (window.gmkbData?.debugMode) {
            console.log('🔍 DEBUG: Checking component availability...');
            
            if (window.enhancedStateManager) {
                try {
                    const state = window.enhancedStateManager.getState();
                    const componentCount = Object.keys(state.components || {}).length;
                    if (componentCount > 0) {
                        console.log(`Found ${componentCount} components in state manager`);
                    }
                } catch (e) {
                    console.log('State manager error:', e.message);
                }
            }
        }
    }



    /**
     * Shows the design panel (switches to Design tab).
     */
    show() {
        // ROOT FIX: Use the global tabs system to properly switch tabs
        if (window.GMKBTabs && window.GMKBTabs.activateTab) {
            const designTab = document.querySelector('[data-tab="design"]');
            if (designTab) {
                window.GMKBTabs.activateTab(designTab);
                console.log('📋 ROOT FIX: Switched to Design tab using GMKBTabs system');
                
                // Ensure the sidebar is visible
                const sidebar = document.querySelector('.sidebar, .media-kit-sidebar, #media-kit-sidebar');
                if (sidebar) {
                    sidebar.classList.add('sidebar--active', 'show');
                    sidebar.style.display = 'block';
                }
            } else {
                console.warn('⚠️ ROOT FIX: Design tab not found');
            }
        } else {
            // Fallback to manual tab switching
            const designTab = document.querySelector('[data-tab="design"]');
            const designTabContent = document.getElementById('design-tab');
            
            if (designTab && designTabContent) {
                // Remove active from all tabs
                document.querySelectorAll('.sidebar__tab').forEach(tab => {
                    tab.classList.remove('sidebar__tab--active');
                });
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('tab-content--active');
                });
                
                // Activate design tab
                designTab.classList.add('sidebar__tab--active');
                designTabContent.classList.add('tab-content--active');
                
                console.log('📋 ROOT FIX: Switched to Design tab (fallback method)');
            }
        }
    }

    /**
     * ROOT FIX: Simplified hide method
     */
    hide() {
        // Clear the current component ID when panel is hidden
        this.currentComponentId = null;
        
        this.panel.innerHTML = `
            <div class="element-editor__title">No Element Selected</div>
            <div class="element-editor__subtitle">Click on any element in the preview to edit its properties</div>
            
            <div class="form-section">
                <h4 class="form-section__title">Getting Started</h4>
                <ul class="tips-list">
                    <li>Select an element by clicking on it in the preview</li>
                    <li>Use the design panel to customize properties</li>
                    <li>Some components allow direct inline editing</li>
                    <li>Changes are saved automatically</li>
                </ul>
            </div>
        `;
        console.log('Design panel hidden, showing default state.');
    }
    
    // ROOT FIX: Removed complex cleanup - no longer needed
}

// ROOT FIX: Create design panel instance and expose globally
const designPanel = new DesignPanel();
window.designPanel = designPanel;

console.log('✅ Design Panel initialized and ready for component configuration');