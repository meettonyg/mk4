/**
 * @file design-panel.js
 * @description Manages the design panel for editing component properties.
 * FIXED: Now uses WordPress AJAX endpoints instead of direct PHP file access.
 */

import {
    debounce
} from '../utils/helpers.js';

class DesignPanel {
    constructor() {
        // FIXED: Use existing element-editor in left sidebar
        this.panel = document.getElementById('element-editor');
        this.currentComponentId = null;

        // No close button needed since this is part of the sidebar
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
     * Loads the design panel with the controls for a specific component.
     * FIXED: Now uses WordPress AJAX endpoint instead of direct PHP file access.
     * @param {string} componentId - The ID of the component to load.
     */
    async load(componentId) {
        console.log(`🎯 Loading design panel for component: ${componentId}`);
        
        this.currentComponentId = componentId;
        const component = this.getComponent(componentId);
        
        if (!component) {
            console.warn(`⚠️ Component not found in any state manager: ${componentId}`);
            
            // DEBUG: Show available components
            this.debugAvailableComponents();
            
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

            // FIXED: Use WordPress AJAX endpoint instead of direct PHP file access
            const formData = new FormData();
            formData.append('action', 'guestify_render_design_panel');
            formData.append('component', component.type);
            formData.append('nonce', window.guestifyData.nonce);

            const response = await fetch(window.guestifyData.ajaxUrl, {
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
            console.log(`✅ Design panel loaded for ${component.type}`);
            
            this.panel.innerHTML = html;
            this.bindControls(component.props || component.data || {});
            this.show();
            
        } catch (error) {
            console.error('❌ Error loading design panel:', error);
            
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
            } else if (!window.guestifyData) {
                errorMessage = 'WordPress data not loaded';
                troubleshooting.push('Ensure the page loaded completely');
                troubleshooting.push('Try refreshing the page');
            } else if (!window.guestifyData.ajaxUrl) {
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
     * Debug function to show available components
     */
    debugAvailableComponents() {
        console.log('🔍 DEBUG: Available components in state managers:');
        
        if (window.enhancedStateManager) {
            try {
                const state = window.enhancedStateManager.getState();
                console.log('Enhanced State Manager components:', Object.keys(state.components || {}));
            } catch (e) {
                console.log('Enhanced State Manager error:', e.message);
            }
        }
        
        if (window.stateManager) {
            try {
                const state = window.stateManager.getState();
                console.log('Regular State Manager components:', Object.keys(state.components || {}));
            } catch (e) {
                console.log('Regular State Manager error:', e.message);
            }
        }
        
        if (window.state) {
            console.log('Legacy State components:', Object.keys(window.state.components || {}));
        }
        
        // Also debug WordPress data availability
        console.log('🔍 DEBUG: WordPress data availability:');
        console.log('guestifyData exists:', !!window.guestifyData);
        if (window.guestifyData) {
            console.log('ajaxUrl:', window.guestifyData.ajaxUrl);
            console.log('nonce:', window.guestifyData.nonce ? 'Available' : 'Missing');
            console.log('pluginUrl:', window.guestifyData.pluginUrl);
        }
    }

    /**
     * Binds the design panel controls to the component's properties.
     * @param {object} props - The component's properties.
     */
    bindControls(props) {
        const inputs = this.panel.querySelectorAll('[data-property]');
        console.log(`🔗 Binding ${inputs.length} controls to component properties:`, props);
        
        const debouncedUpdate = debounce((id, newProps) => {
            if (window.enhancedComponentManager && typeof window.enhancedComponentManager.updateComponent === 'function') {
                window.enhancedComponentManager.updateComponent(id, newProps);
                console.log(`🔄 Updated via enhanced manager: ${id}`);
            } else if (window.componentManager && typeof window.componentManager.updateComponent === 'function') {
                window.componentManager.updateComponent(id, newProps);
                console.log(`🔄 Updated via regular manager: ${id}`);
            } else {
                console.warn('No component manager available for updates');
            }
        }, 300);

        inputs.forEach(input => {
            const propName = input.dataset.property;
            if (props.hasOwnProperty(propName)) {
                input.value = props[propName];
                console.log(`📝 Bound property ${propName} = ${props[propName]}`);
            }

            input.addEventListener('input', () => {
                const currentComponent = this.getComponent(this.currentComponentId);
                if (currentComponent) {
                    const newProps = { ...(currentComponent.props || currentComponent.data || {}) };
                    newProps[propName] = input.value;
                    debouncedUpdate(this.currentComponentId, newProps);
                    console.log(`🔄 Updated ${propName} = ${input.value}`);
                }
            });
        });
    }

    /**
     * Shows the design panel (switches to Design tab).
     */
    show() {
        // Switch to Design tab in sidebar
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
            
            console.log('📋 Switched to Design tab');
        }
    }

    /**
     * Hides the design panel (shows default state).
     */
    hide() {
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
        console.log('📋 Design panel hidden, showing default state');
    }
}

// Export the designPanel instance so it can be imported by other modules.
export const designPanel = new DesignPanel();