/**
 * @file design-panel.js
 * @description Manages the design panel for editing component properties.
 * FIXED: Now uses WordPress AJAX endpoints instead of direct PHP file access.
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
     * ROOT FIX: Enhanced design panel loading with bidirectional sync support
     * FIXED: Now uses WordPress AJAX endpoint and includes real-time component sync
     * @param {string} componentId - The ID of the component to load.
     */
    async load(componentId) {
        console.log(`🎯 ROOT FIX: Loading enhanced design panel for component: ${componentId}`);
        
        this.currentComponentId = componentId;
        const component = this.getComponent(componentId);
        
        if (!component) {
            console.warn(`⚠️ ROOT FIX: Component not found in any state manager: ${componentId}`);
            
            // DEBUG: Show available components
            this.debugAvailableComponents();
            
            this.panel.innerHTML = `
                <div class="element-editor__title">Component Not Found</div>
                <div class="element-editor__subtitle">The selected component could not be loaded</div>
                <div class="form-section">
                    <p class="form-help-text">Component ID: ${componentId}</p>
                    <p class="form-help-text">Try refreshing the page or selecting a different component.</p>
                </div>
                <div class="form-section">
                    <h4 class="form-section__title">Debug Information</h4>
                    <button type="button" class="btn btn--secondary btn--small" onclick="window.debugDesignPanel && window.debugDesignPanel()">Debug Design Panel</button>
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
            console.log(`✅ ROOT FIX: Design panel loaded for ${component.type}`);
            
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
                
                console.log(`✅ ROOT FIX: Design panel binding complete for ${component.type}`);
            }, 100);
            
            this.show();
            
        } catch (error) {
            console.error('❌ ROOT FIX: Error loading design panel:', error);
            
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
        console.log('gmkbData exists:', !!window.gmkbData);
        if (window.gmkbData) {
            console.log('ajaxUrl:', window.gmkbData.ajaxUrl);
            console.log('nonce:', window.gmkbData.nonce ? 'Available' : 'Missing');
            console.log('pluginUrl:', window.gmkbData.pluginUrl);
        }
    }

    /**
     * ROOT FIX: Enhanced control binding with topics-specific sync
     * Binds the design panel controls to the component's properties with real-time sync
     * @param {object} props - The component's properties.
     */
    bindControls(props) {
        const inputs = this.panel.querySelectorAll('[data-property]');
        console.log(`🔗 ROOT FIX: Binding ${inputs.length} controls to component properties:`, props);
        
        const debouncedUpdate = (window.debounce || quickDebounce)((id, newProps) => {
            // ROOT FIX: Use the correct component manager reference
            let componentManager = null;
            
            // Try different manager references in priority order
            if (window.GMKB && window.GMKB.componentManager && typeof window.GMKB.componentManager.updateComponent === 'function') {
                componentManager = window.GMKB.componentManager;
                console.log(`🔄 ROOT FIX: Using GMKB.componentManager for update`);
            } else if (window.enhancedComponentManager && typeof window.enhancedComponentManager.updateComponent === 'function') {
                componentManager = window.enhancedComponentManager;
                console.log(`🔄 ROOT FIX: Using enhancedComponentManager for update`);
            } else if (window.componentManager && typeof window.componentManager.updateComponent === 'function') {
                componentManager = window.componentManager;
                console.log(`🔄 ROOT FIX: Using componentManager for update`);
            } else if (window.updateComponentProps && typeof window.updateComponentProps === 'function') {
                // Use the global updateComponentProps function
                window.updateComponentProps(id, newProps);
                console.log(`🔄 ROOT FIX: Updated via updateComponentProps: ${id}`);
                return;
            }
            
            if (componentManager) {
                componentManager.updateComponent(id, newProps);
                console.log(`🔄 ROOT FIX: Component updated via manager: ${id}`);
            } else {
                // ROOT FIX: Fallback to direct state manager update
                if (window.enhancedStateManager && typeof window.enhancedStateManager.updateComponent === 'function') {
                    window.enhancedStateManager.updateComponent(id, newProps);
                    console.log(`🔄 ROOT FIX: Updated via enhancedStateManager: ${id}`);
                } else {
                    console.error('ROOT FIX: No component manager available for updates');
                    console.log('🔍 Available global objects:', {
                        GMKB: !!window.GMKB,
                        enhancedComponentManager: !!window.enhancedComponentManager,
                        componentManager: !!window.componentManager,
                        updateComponentProps: !!window.updateComponentProps,
                        enhancedStateManager: !!window.enhancedStateManager
                    });
                }
            }
            
            // ROOT FIX: Trigger topics sync if this is a topics component
            const currentComponent = this.getComponent(this.currentComponentId);
            if (currentComponent?.type === 'topics') {
                setTimeout(() => {
                    this.syncTopicsCounterWithPreview();
                }, 100);
            }
        }, 300);

        inputs.forEach(input => {
            const propName = input.dataset.property;
            if (props.hasOwnProperty(propName)) {
                // ROOT FIX: Trim whitespace from property values before binding
                const rawValue = props[propName];
                const trimmedValue = (typeof rawValue === 'string') ? rawValue.trim() : rawValue;
                input.value = trimmedValue;
                console.log(`📝 ROOT FIX: Bound property ${propName} = ${trimmedValue}`);
            }

            input.addEventListener('input', () => {
                const currentComponent = this.getComponent(this.currentComponentId);
                if (currentComponent) {
                    const newProps = { ...(currentComponent.props || currentComponent.data || {}) };
                    // ROOT FIX: Trim input values before saving
                    newProps[propName] = input.value.trim();
                    debouncedUpdate(this.currentComponentId, newProps);
                    console.log(`🔄 ROOT FIX: Updated ${propName} = ${input.value.trim()}`);
                    
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
        console.log('TOPICS: Design panel hidden, showing default state');
    }
    
    // ROOT FIX: Removed complex cleanup - no longer needed
}

// ROOT FIX: Enhanced design panel instance with topics sync capabilities
// ROOT FIX: Create design panel instance and expose globally
const designPanel = new DesignPanel();

// ROOT FIX: Expose design panel globally for component manager access
window.designPanel = designPanel;

// ROOT FIX: Expose enhanced design panel functions globally for debugging
window.debugDesignPanel = function() {
    console.log('🔍 ROOT FIX: Design Panel Debug Information');
    
    const debugInfo = {
        currentComponent: designPanel.currentComponentId,
        panelVisible: designPanel.panel?.style?.display !== 'none',
        topicsEnhancements: {
            counterObserver: !!designPanel.topicsCounterObserver,
            previewObserver: !!designPanel.topicsPreviewObserver
        },
        counters: {
            sidebarTopics: document.querySelectorAll('.topics-sidebar__topic-item').length,
            previewTopics: document.querySelectorAll('.topic-item').length,
            topicInputs: document.querySelectorAll('.topics-sidebar__topic-input').length,
            inSync: document.querySelectorAll('.topics-sidebar__topic-item').length === document.querySelectorAll('.topic-item').length
        },
        availableManagers: {
            GMKB: !!window.GMKB,
            'GMKB.componentManager': !!(window.GMKB && window.GMKB.componentManager),
            'GMKB.componentManager.updateComponent': !!(window.GMKB && window.GMKB.componentManager && window.GMKB.componentManager.updateComponent),
            enhancedComponentManager: !!window.enhancedComponentManager,
            componentManager: !!window.componentManager,
            updateComponentProps: !!window.updateComponentProps,
            enhancedStateManager: !!window.enhancedStateManager,
            'enhancedStateManager.updateComponent': !!(window.enhancedStateManager && window.enhancedStateManager.updateComponent)
        }
    };
    
    console.table(debugInfo.topicsEnhancements);
    console.table(debugInfo.counters);
    console.table(debugInfo.availableManagers);
    
    if (designPanel.currentComponentId) {
        const component = designPanel.getComponent(designPanel.currentComponentId);
        console.log('Current component data:', component);
    }
    
    // Test component manager access
    if (window.GMKB && window.GMKB.componentManager) {
        console.log('GMKB.componentManager methods:', Object.getOwnPropertyNames(window.GMKB.componentManager));
    }
    
    return debugInfo;
};

window.testDesignPanelSync = function() {
    console.log('TOPICS: Testing design panel coordination...');
    
    if (designPanel.currentComponentId) {
        const component = designPanel.getComponent(designPanel.currentComponentId);
        if (component?.type === 'topics') {
            console.log('Testing topics sync coordination with panel-script.js...');
            
            // Test coordination with panel-script.js
            if (window.TopicsSync && typeof window.TopicsSync.testSync === 'function') {
                window.TopicsSync.testSync();
                console.log('Design panel coordinated with TopicsSync');
            } else {
                console.log('TopicsSync not available - check panel-script.js');
            }
        } else {
            console.log('Current component is not topics type:', component?.type);
        }
    } else {
        console.log('No current component selected');
    }
};

// ROOT FIX: Manual test for component manager
window.testComponentManagerAccess = function() {
    console.log('🧪 ROOT FIX: Testing component manager access...');
    
    const testComponentId = 'topics-1755999525631-1'; // Use current topics component
    const testProps = { title: 'TEST UPDATE - ' + Date.now() };
    
    // Try each manager method
    const methods = [
        () => {
            if (window.GMKB && window.GMKB.componentManager && window.GMKB.componentManager.updateComponent) {
                window.GMKB.componentManager.updateComponent(testComponentId, testProps);
                return 'GMKB.componentManager';
            }
            return null;
        },
        () => {
            if (window.updateComponentProps) {
                window.updateComponentProps(testComponentId, testProps);
                return 'updateComponentProps';
            }
            return null;
        },
        () => {
            if (window.enhancedStateManager && window.enhancedStateManager.updateComponent) {
                window.enhancedStateManager.updateComponent(testComponentId, testProps);
                return 'enhancedStateManager.updateComponent';
            }
            return null;
        }
    ];
    
    for (const method of methods) {
        try {
            const result = method();
            if (result) {
                console.log(`✅ SUCCESS: Updated component using ${result}`);
                return result;
            }
        } catch (error) {
            console.log(`❌ ERROR with method: ${error.message}`);
        }
    }
    
    console.log('❌ No working component manager found');
    return null;
};

console.log('TOPICS: Simplified Design Panel coordination ready');
console.log('Debug commands available:');
console.log('   debugDesignPanel() - Show design panel debug info and manager availability');
console.log('   testDesignPanelSync() - Test design panel coordination with panel-script.js');
console.log('   testComponentManagerAccess() - Test component update functionality');
console.log('ROOT CAUSE FIXED: Simplified sync coordination between design panel and preview');
console.log('Design panel now coordinates with panel-script.js for clean sync');