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
     * ROOT FIX: Enhanced design panel loading with bidirectional sync support
     * FIXED: Now uses WordPress AJAX endpoint and includes real-time component sync
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

        console.log(`📋 ROOT FIX: Component found:`, component);

        try {
            // Show loading state
            this.panel.innerHTML = `
                <div class="element-editor__title">Loading Settings...</div>
                <div class="element-editor__subtitle">Loading component configuration</div>
                <div class="design-panel-loading">
                    <div class="loading-spinner"></div>
                    <p>Loading ${component.type} settings...</p>
                </div>
            `;

            // SIMPLEST FIX: Use WordPress AJAX endpoint with post ID for unified context
            const formData = new FormData();
            formData.append('action', 'guestify_render_design_panel');
            formData.append('component', component.type);
            formData.append('post_id', window.gmkbData.postId); // ✅ UNIFIED: Same context as template
            formData.append('nonce', window.gmkbData.nonce); // ROOT FIX: Use gmkbData not guestifyData

            const response = await fetch(window.gmkbData.ajaxUrl, {
                method: 'POST',
                body: formData,
                credentials: 'same-origin' // Include cookies for WordPress authentication
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Check if WordPress returned a success response
            if (!data.success) {
                throw new Error(data.data || 'Failed to load design panel');
            }

            const html = data.data.html;
            
            this.panel.innerHTML = html;
            
            // ROOT FIX: Dispatch design panel loaded event for component scripts
            document.dispatchEvent(new CustomEvent('designPanelLoaded', {
                detail: {
                    component: component.type,
                    componentId: componentId,
                    timestamp: Date.now()
                }
            }));
            
            // ROOT FIX: Wait for panel content to be inserted into DOM before binding controls
            setTimeout(() => {
                this.bindControls(component.props || component.data || {});
                
                // ROOT FIX: Setup component-specific enhancements
                if (component.type === 'topics') {
                    this.setupTopicsSpecificEnhancements(componentId);
                }
                
                console.log(`Design panel loaded for ${component.type}`);
            }, 100);
            
            this.show();
            
            // ROOT FIX: Dispatch design panel opened event for universal sync
            document.dispatchEvent(new CustomEvent('gmkb:design-panel-opened', {
                detail: {
                    componentId: componentId,
                    componentType: component.type,
                    componentData: component,
                    timestamp: Date.now()
                }
            }));
            
        } catch (error) {
            console.error('Error loading design panel:', error);
            
            // Enhanced error handling with specific WordPress error support
            let errorMessage = error.message;
            let troubleshooting = [];
            
            if (error.message.includes('403')) {
                errorMessage = 'Access denied - authentication issue';
                troubleshooting.push('Try refreshing the page to renew your session');
                troubleshooting.push('Ensure you have proper permissions');
            } else if (error.message.includes('404')) {
                errorMessage = 'Design panel not found for this component';
                troubleshooting.push('This component may not have custom settings');
                troubleshooting.push('Try editing the component directly in the preview');
            } else if (error.message.includes('500')) {
                errorMessage = 'Server error occurred';
                troubleshooting.push('Check the browser console for more details');
                troubleshooting.push('Contact support if the issue persists');
            } else if (!window.gmkbData) {
                errorMessage = 'WordPress data not loaded';
                troubleshooting.push('Ensure the page loaded completely');
                troubleshooting.push('Try refreshing the page');
            } else if (!window.gmkbData.ajaxUrl) {
                errorMessage = 'WordPress AJAX URL not available';
                troubleshooting.push('Check WordPress configuration');
                troubleshooting.push('Ensure plugin is properly activated');
            }
            
            this.panel.innerHTML = `
                <div class="element-editor__title">Error Loading Settings</div>
                <div class="element-editor__subtitle">Could not load component configuration</div>
                <div class="form-section">
                    <h4 class="form-section__title">Error Details</h4>
                    <p class="form-help-text"><strong>Component:</strong> ${component.type}</p>
                    <p class="form-help-text"><strong>Error:</strong> ${errorMessage}</p>
                </div>
                ${troubleshooting.length > 0 ? `
                <div class="form-section">
                    <h4 class="form-section__title">Troubleshooting</h4>
                    <ul class="tips-list">
                        ${troubleshooting.map(tip => `<li>${tip}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
                <div class="form-section">
                    <h4 class="form-section__title">Alternative Options</h4>
                    <ul class="tips-list">
                        <li>Try editing the component directly by clicking on it in the preview</li>
                        <li>Use the component controls (move, duplicate, delete) if available</li>
                        <li>Refresh the page and try again</li>
                    </ul>
                </div>
            `;
            this.show();
        }
    }
    
    /**
     * ROOT FIX: Simplified topics setup - coordinates with panel-script.js
     * @param {string} componentId - The topics component ID
     */
    setupTopicsSpecificEnhancements(componentId) {
        console.log('TOPICS: Setting up simplified design panel coordination...');
        
        try {
            // ROOT FIX: Just notify that topics sync is available
            // The actual sync is handled by panel-script.js
            document.dispatchEvent(new CustomEvent('gmkb:topics-design-panel-ready', {
                detail: { 
                    componentId: componentId,
                    timestamp: Date.now()
                }
            }));
            
            console.log('TOPICS: Design panel coordination setup complete');
            
        } catch (error) {
            console.error('TOPICS: Error setting up design panel coordination:', error);
        }
    }
    
    // ROOT FIX: Removed complex monitoring - handled by panel-script.js
    
    // ROOT FIX: Removed complex monitoring - handled by panel-script.js
    
    // ROOT FIX: Removed complex preview sync - handled by panel-script.js
    
    // ROOT FIX: Removed complex event listeners - handled by panel-script.js
    
    // ROOT FIX: Removed complex sync method - handled by panel-script.js
    
    // ROOT FIX: Removed validation method - handled by panel-script.js
    
    // ROOT FIX: Removed topic counting method - handled by panel-script.js
    
    // ROOT FIX: Removed counter display method - handled by panel-script.js

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
     * ROOT FIX: Enhanced control binding with topics-specific sync
     * Binds the design panel controls to the component's properties with real-time sync
     * @param {object} props - The component's properties.
     */
    bindControls(props) {
        const inputs = this.panel.querySelectorAll('[data-property]');
        
        const debouncedUpdate = (window.debounce || quickDebounce)((id, newProps) => {
            // ROOT FIX: Mark that we're updating to prevent panel closure
            this.isUpdating = true;
            
            // ROOT FIX: Announce that an update is about to begin (prevents deselection)
            document.dispatchEvent(new CustomEvent('gmkb:before-component-update', {
                detail: { 
                    componentId: id,
                    isFromDesignPanel: true
                }
            }));
            
            // ROOT FIX: Use the correct component manager reference
            let componentManager = null;
            
            // Try different manager references in priority order
            if (window.GMKB && window.GMKB.componentManager && typeof window.GMKB.componentManager.updateComponent === 'function') {
                componentManager = window.GMKB.componentManager;
            } else if (window.enhancedComponentManager && typeof window.enhancedComponentManager.updateComponent === 'function') {
                componentManager = window.enhancedComponentManager;
            } else if (window.componentManager && typeof window.componentManager.updateComponent === 'function') {
                componentManager = window.componentManager;
            } else if (window.updateComponentProps && typeof window.updateComponentProps === 'function') {
                // Use the global updateComponentProps function
                window.updateComponentProps(id, newProps);
                // ROOT FIX: Announce that the update has completed
                setTimeout(() => {
                    this.isUpdating = false;
                    document.dispatchEvent(new CustomEvent('gmkb:after-component-update', {
                        detail: { 
                            componentId: id,
                            isFromDesignPanel: true
                        }
                    }));
                }, 100);
                return;
            }
            
            if (componentManager) {
                componentManager.updateComponent(id, newProps);
            } else {
                // ROOT FIX: Fallback to direct state manager update
                if (window.enhancedStateManager && typeof window.enhancedStateManager.updateComponent === 'function') {
                    window.enhancedStateManager.updateComponent(id, newProps);
                } else {
                    console.error('No component manager available for updates');
                }
            }
            
            // ROOT FIX: Announce that the update has completed (allows re-selection)
            setTimeout(() => {
                this.isUpdating = false;
                document.dispatchEvent(new CustomEvent('gmkb:after-component-update', {
                    detail: { 
                        componentId: id,
                        isFromDesignPanel: true
                    }
                }));
            }, 100);
            
            // ROOT FIX: Trigger topics sync if this is a topics component
            const currentComponent = this.getComponent(this.currentComponentId);
            if (currentComponent?.type === 'topics') {
                setTimeout(() => {
                    this.syncTopicsCounterWithPreview();
                }, 200);
            }
        }, 300);

        inputs.forEach(input => {
            const propName = input.dataset.property;
            if (props.hasOwnProperty(propName)) {
                const rawValue = props[propName];
                const trimmedValue = (typeof rawValue === 'string') ? rawValue.trim() : rawValue;
                input.value = trimmedValue;
            }

            input.addEventListener('input', () => {
                const currentComponent = this.getComponent(this.currentComponentId);
                if (currentComponent) {
                    const newProps = { ...(currentComponent.props || currentComponent.data || {}) };
                    newProps[propName] = input.value.trim();
                    debouncedUpdate(this.currentComponentId, newProps);
                    
                    // ROOT FIX: Notify topics sync system of changes
                    if (currentComponent.type === 'topics' && 
                        ['title', 'displayStyle', 'columns', 'topicColor'].includes(propName)) {
                        // Let the simplified sync system handle it
                        document.dispatchEvent(new CustomEvent('gmkb:topics-property-changed', {
                            detail: { property: propName, value: input.value.trim(), componentId: this.currentComponentId }
                        }));
                    }
                }
            });
            
            // ROOT FIX: Listen for change events (selects, checkboxes) - simplified
            input.addEventListener('change', () => {
                const currentComponent = this.getComponent(this.currentComponentId);
                if (currentComponent?.type === 'topics') {
                    // Notify simplified sync system
                    document.dispatchEvent(new CustomEvent('gmkb:topics-property-changed', {
                        detail: { property: propName, componentId: this.currentComponentId }
                    }));
                }
            });
        });
        
        // ROOT FIX: Setup special handling for Add Topic button
        const addTopicBtn = this.panel.querySelector('#add-topic-btn');
        if (addTopicBtn) {
            this.setupAddTopicButtonEnhancement(addTopicBtn);
        }
    }
    
    /**
     * ROOT FIX: Simplified Add Topic button setup
     * @param {HTMLElement} button - The Add Topic button element
     */
    setupAddTopicButtonEnhancement(button) {
        console.log('TOPICS: Setting up Add Topic button coordination...');
        
        button.addEventListener('click', (event) => {
            console.log('TOPICS: Add Topic button clicked - notifying sync system');
            
            // Notify simplified sync system
            setTimeout(() => {
                document.dispatchEvent(new CustomEvent('gmkb:topics-added', {
                    detail: { componentId: this.currentComponentId, timestamp: Date.now() }
                }));
            }, 100);
        }, { passive: true });
        
        console.log('TOPICS: Add Topic button coordination active');
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