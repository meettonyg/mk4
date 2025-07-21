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
            console.log(`✅ ROOT FIX: Design panel loaded for ${component.type}`);
            
            this.panel.innerHTML = html;
            this.bindControls(component.props || component.data || {});
            
            // ROOT FIX: Setup component-specific enhancements
            if (component.type === 'topics') {
                this.setupTopicsSpecificEnhancements(componentId);
            }
            
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
     * ROOT FIX: Setup topics-specific enhancements for real-time sync
     * Implements bidirectional communication and counter synchronization
     * @param {string} componentId - The topics component ID
     */
    setupTopicsSpecificEnhancements(componentId) {
        console.log('🎯 ROOT FIX: Setting up topics-specific enhancements...');
        
        try {
            // ROOT FIX: Setup real-time counter monitoring
            this.setupTopicsCounterMonitoring();
            
            // ROOT FIX: Setup preview component sync
            this.setupTopicsPreviewSync(componentId);
            
            // ROOT FIX: Setup event listeners for topics events
            this.setupTopicsEventListeners();
            
            // ROOT FIX: Initial sync check
            setTimeout(() => {
                this.syncTopicsCounterWithPreview();
            }, 500);
            
            console.log('✅ ROOT FIX: Topics-specific enhancements setup complete');
            
        } catch (error) {
            console.error('❌ ROOT FIX: Error setting up topics enhancements:', error);
        }
    }
    
    /**
     * ROOT FIX: Setup topics counter monitoring for real-time updates
     * Monitors counter changes and validates sync
     */
    setupTopicsCounterMonitoring() {
        console.log('📊 ROOT FIX: Setting up topics counter monitoring...');
        
        const counterElement = document.getElementById('topic-count');
        if (!counterElement) {
            console.warn('⚠️ ROOT FIX: Topic counter element not found');
            return;
        }
        
        // ROOT FIX: Monitor counter changes with MutationObserver
        const counterObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'characterData' || 
                    (mutation.type === 'childList' && mutation.target === counterElement)) {
                    const newValue = counterElement.textContent;
                    console.log(`🔄 ROOT FIX: Counter changed to: ${newValue}`);
                    
                    // ROOT FIX: Validate counter accuracy
                    setTimeout(() => {
                        this.validateTopicsCounterAccuracy();
                    }, 100);
                }
            });
        });
        
        counterObserver.observe(counterElement, {
            childList: true,
            subtree: true,
            characterData: true
        });
        
        // Store observer for cleanup
        this.topicsCounterObserver = counterObserver;
        
        console.log('✅ ROOT FIX: Topics counter monitoring active');
    }
    
    /**
     * ROOT FIX: Setup topics preview sync for bidirectional communication
     * Ensures changes in preview are reflected in design panel
     * @param {string} componentId - The topics component ID
     */
    setupTopicsPreviewSync(componentId) {
        console.log('🔗 ROOT FIX: Setting up topics preview sync...');
        
        // ROOT FIX: Monitor preview component for changes
        const previewComponent = document.querySelector('.editable-element[data-component="topics"]');
        if (!previewComponent) {
            console.warn('⚠️ ROOT FIX: Preview topics component not found');
            return;
        }
        
        // ROOT FIX: Setup MutationObserver for preview changes
        const previewObserver = new MutationObserver((mutations) => {
            let topicsChanged = false;
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    const topicsContainer = mutation.target.closest('.topics-container');
                    if (topicsContainer) {
                        topicsChanged = true;
                    }
                }
                
                // Check for attribute changes related to topics
                if (mutation.type === 'attributes' && 
                    ['data-topics-count', 'data-has-dynamic-topics'].includes(mutation.attributeName)) {
                    topicsChanged = true;
                }
            });
            
            if (topicsChanged) {
                console.log('🔄 ROOT FIX: Preview topics changed, syncing design panel...');
                (window.debounce || quickDebounce)(() => {
                    this.syncTopicsCounterWithPreview();
                }, 300)();
            }
        });
        
        previewObserver.observe(previewComponent, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['data-topics-count', 'data-has-dynamic-topics', 'data-topics-source']
        });
        
        // Store observer for cleanup
        this.topicsPreviewObserver = previewObserver;
        
        console.log('✅ ROOT FIX: Topics preview sync active');
    }
    
    /**
     * ROOT FIX: Setup topics event listeners for cross-component communication
     * Listens for events from other parts of the system
     */
    setupTopicsEventListeners() {
        console.log('🎧 ROOT FIX: Setting up topics event listeners...');
        
        // ROOT FIX: Listen for topics counter updates
        document.addEventListener('topicsCounterUpdated', (event) => {
            const { count, source } = event.detail;
            console.log(`🔄 ROOT FIX: Received counter update: ${count} from ${source}`);
            
            // ROOT FIX: Update design panel display if needed
            this.updateTopicsCounterDisplay(count);
        });
        
        // ROOT FIX: Listen for topics preview updates
        document.addEventListener('topicsPreviewUpdated', (event) => {
            const { count, source } = event.detail;
            console.log(`🔄 ROOT FIX: Received preview update: ${count} topics from ${source}`);
            
            // ROOT FIX: Sync design panel with preview
            setTimeout(() => {
                this.syncTopicsCounterWithPreview();
            }, 100);
        });
        
        // ROOT FIX: Listen for topic addition/removal events
        document.addEventListener('topicAdded', (event) => {
            console.log('➕ ROOT FIX: Topic added event received');
            this.syncTopicsCounterWithPreview();
        });
        
        document.addEventListener('topicRemoved', (event) => {
            console.log('🗑️ ROOT FIX: Topic removed event received');
            this.syncTopicsCounterWithPreview();
        });
        
        document.addEventListener('topicsCleared', (event) => {
            console.log('🗑️ ROOT FIX: Topics cleared event received');
            this.syncTopicsCounterWithPreview();
        });
        
        console.log('✅ ROOT FIX: Topics event listeners active');
    }
    
    /**
     * ROOT FIX: Sync topics counter with preview component
     * Ensures design panel counter matches actual topics in preview
     */
    syncTopicsCounterWithPreview() {
        console.log('🔄 ROOT FIX: Syncing topics counter with preview...');
        
        try {
            const previewComponent = document.querySelector('.editable-element[data-component="topics"]');
            if (!previewComponent) {
                console.log('ℹ️ ROOT FIX: No preview component for sync');
                return;
            }
            
            // ROOT FIX: Count actual topics in preview
            const topicItems = previewComponent.querySelectorAll('.topic-item');
            const realTopics = Array.from(topicItems).filter(item => {
                const title = item.querySelector('.topic-title');
                const titleText = title?.textContent?.trim();
                const source = item.getAttribute('data-topic-source');
                
                return source !== 'placeholder' && titleText && titleText.length > 0;
            });
            
            const actualCount = realTopics.length;
            const counterElement = document.getElementById('topic-count');
            const currentCounterValue = counterElement?.textContent;
            
            console.log('📊 ROOT FIX: Sync data:', {
                actualTopicsInPreview: actualCount,
                currentCounterValue: currentCounterValue,
                needsUpdate: actualCount.toString() !== currentCounterValue
            });
            
            // ROOT FIX: Update counter if different
            if (counterElement && actualCount.toString() !== currentCounterValue) {
                console.log(`🔄 ROOT FIX: Updating counter: ${currentCounterValue} → ${actualCount}`);
                
                counterElement.style.transition = 'all 0.3s ease';
                counterElement.style.transform = 'scale(1.1)';
                counterElement.textContent = actualCount;
                
                setTimeout(() => {
                    counterElement.style.transform = 'scale(1)';
                }, 200);
                
                // ROOT FIX: Dispatch sync complete event
                document.dispatchEvent(new CustomEvent('topicsCounterSynced', {
                    detail: { 
                        previousValue: currentCounterValue,
                        newValue: actualCount,
                        source: 'design_panel_sync'
                    }
                }));
            }
            
        } catch (error) {
            console.error('❌ ROOT FIX: Error syncing topics counter:', error);
        }
    }
    
    /**
     * ROOT FIX: Validate topics counter accuracy
     * Checks if counter matches actual component state
     */
    validateTopicsCounterAccuracy() {
        console.log('🔍 ROOT FIX: Validating topics counter accuracy...');
        
        try {
            const counterElement = document.getElementById('topic-count');
            const counterValue = parseInt(counterElement?.textContent || '0');
            
            // Get actual count from preview
            const previewComponent = document.querySelector('.editable-element[data-component="topics"]');
            const actualCount = this.getActualTopicsCount(previewComponent);
            
            // Get count from editor
            const editorItems = document.querySelectorAll('.topic-editor-item');
            const editorCount = editorItems.length;
            
            const validation = {
                counterValue: counterValue,
                actualCount: actualCount,
                editorCount: editorCount,
                counterAccurate: counterValue === actualCount,
                editorSynced: editorCount === actualCount,
                fullyInSync: counterValue === actualCount && editorCount === actualCount
            };
            
            console.log('📊 ROOT FIX: Counter validation:', validation);
            
            if (!validation.fullyInSync) {
                console.warn('⚠️ ROOT FIX: Counter not fully in sync, attempting correction...');
                
                // ROOT FIX: Use actual count as source of truth
                if (actualCount >= 0) {
                    this.updateTopicsCounterDisplay(actualCount);
                }
            } else {
                console.log('✅ ROOT FIX: Counter validation passed - all systems in sync');
            }
            
            return validation;
            
        } catch (error) {
            console.error('❌ ROOT FIX: Error validating counter accuracy:', error);
            return { error: error.message };
        }
    }
    
    /**
     * ROOT FIX: Get actual topics count from preview component
     * Provides accurate count of real topics (excluding placeholders)
     * @param {HTMLElement} component - The topics component
     * @returns {number} The actual count of topics
     */
    getActualTopicsCount(component) {
        if (!component) {
            return -1;
        }
        
        try {
            const topicItems = component.querySelectorAll('.topic-item');
            const realTopics = Array.from(topicItems).filter(item => {
                const title = item.querySelector('.topic-title');
                const titleText = title?.textContent?.trim();
                const source = item.getAttribute('data-topic-source');
                
                return source !== 'placeholder' && titleText && titleText.length > 0;
            });
            
            return realTopics.length;
            
        } catch (error) {
            console.error('❌ ROOT FIX: Error counting topics:', error);
            return -1;
        }
    }
    
    /**
     * ROOT FIX: Update topics counter display
     * Updates the counter element with animation
     * @param {number} count - The new count to display
     */
    updateTopicsCounterDisplay(count) {
        const counterElement = document.getElementById('topic-count');
        if (!counterElement) {
            return;
        }
        
        if (counterElement.textContent !== count.toString()) {
            console.log(`🔄 ROOT FIX: Updating counter display to: ${count}`);
            
            counterElement.style.transition = 'all 0.3s ease';
            counterElement.style.transform = 'scale(1.1)';
            counterElement.textContent = count;
            
            setTimeout(() => {
                counterElement.style.transform = 'scale(1)';
            }, 200);
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
     * ROOT FIX: Enhanced control binding with topics-specific sync
     * Binds the design panel controls to the component's properties with real-time sync
     * @param {object} props - The component's properties.
     */
    bindControls(props) {
        const inputs = this.panel.querySelectorAll('[data-property]');
        console.log(`🔗 ROOT FIX: Binding ${inputs.length} controls to component properties:`, props);
        
        const debouncedUpdate = (window.debounce || quickDebounce)((id, newProps) => {
            if (window.enhancedComponentManager && typeof window.enhancedComponentManager.updateComponent === 'function') {
                window.enhancedComponentManager.updateComponent(id, newProps);
                console.log(`🔄 ROOT FIX: Updated via enhanced manager: ${id}`);
            } else if (window.componentManager && typeof window.componentManager.updateComponent === 'function') {
                window.componentManager.updateComponent(id, newProps);
                console.log(`🔄 ROOT FIX: Updated via regular manager: ${id}`);
            } else {
                console.warn('ROOT FIX: No component manager available for updates');
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
                input.value = props[propName];
                console.log(`📝 ROOT FIX: Bound property ${propName} = ${props[propName]}`);
            }

            input.addEventListener('input', () => {
                const currentComponent = this.getComponent(this.currentComponentId);
                if (currentComponent) {
                    const newProps = { ...(currentComponent.props || currentComponent.data || {}) };
                    newProps[propName] = input.value;
                    debouncedUpdate(this.currentComponentId, newProps);
                    console.log(`🔄 ROOT FIX: Updated ${propName} = ${input.value}`);
                    
                    // ROOT FIX: Immediate topics sync for topics-related properties
                    if (currentComponent.type === 'topics' && 
                        ['title', 'displayStyle', 'columns', 'topicColor'].includes(propName)) {
                        setTimeout(() => {
                            this.syncTopicsCounterWithPreview();
                        }, 150);
                    }
                }
            });
            
            // ROOT FIX: Also listen for change events (for selects, checkboxes)
            input.addEventListener('change', () => {
                const currentComponent = this.getComponent(this.currentComponentId);
                if (currentComponent?.type === 'topics') {
                    setTimeout(() => {
                        this.syncTopicsCounterWithPreview();
                    }, 100);
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
     * ROOT FIX: Setup Add Topic button enhancement with sync integration
     * Ensures counter updates immediately when Add Topic is clicked
     * @param {HTMLElement} button - The Add Topic button element
     */
    setupAddTopicButtonEnhancement(button) {
        console.log('➕ ROOT FIX: Setting up Add Topic button enhancement...');
        
        // ROOT FIX: Override the existing click handler
        const originalClickHandler = button.onclick;
        
        button.addEventListener('click', (event) => {
            console.log('➕ ROOT FIX: Add Topic button clicked - enhancing with sync...');
            
            // ROOT FIX: Small delay to allow normal processing, then sync
            setTimeout(() => {
                this.syncTopicsCounterWithPreview();
                
                // ROOT FIX: Validate counter was updated correctly
                setTimeout(() => {
                    this.validateTopicsCounterAccuracy();
                }, 200);
            }, 100);
        }, { passive: true }); // Don't interfere with existing handlers
        
        console.log('✅ ROOT FIX: Add Topic button enhancement active');
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
     * ROOT FIX: Enhanced hide method with cleanup
     * Hides the design panel and cleans up topics-specific observers
     */
    hide() {
        // ROOT FIX: Cleanup topics-specific observers
        this.cleanupTopicsEnhancements();
        
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
        console.log('📋 ROOT FIX: Design panel hidden with cleanup, showing default state');
    }
    
    /**
     * ROOT FIX: Cleanup topics-specific enhancements
     * Removes observers and event listeners to prevent memory leaks
     */
    cleanupTopicsEnhancements() {
        console.log('🧹 ROOT FIX: Cleaning up topics enhancements...');
        
        try {
            // ROOT FIX: Disconnect observers
            if (this.topicsCounterObserver) {
                this.topicsCounterObserver.disconnect();
                this.topicsCounterObserver = null;
                console.log('✅ ROOT FIX: Topics counter observer cleaned up');
            }
            
            if (this.topicsPreviewObserver) {
                this.topicsPreviewObserver.disconnect();
                this.topicsPreviewObserver = null;
                console.log('✅ ROOT FIX: Topics preview observer cleaned up');
            }
            
            console.log('✅ ROOT FIX: Topics enhancements cleanup complete');
            
        } catch (error) {
            console.error('❌ ROOT FIX: Error during topics cleanup:', error);
        }
    }
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
            topicCountElement: !!document.getElementById('topic-count'),
            currentValue: document.getElementById('topic-count')?.textContent,
            editorItems: document.querySelectorAll('.topic-editor-item').length,
            previewItems: document.querySelectorAll('.topic-item').length
        }
    };
    
    console.table(debugInfo.topicsEnhancements);
    console.table(debugInfo.counters);
    
    if (designPanel.currentComponentId) {
        const component = designPanel.getComponent(designPanel.currentComponentId);
        console.log('Current component data:', component);
    }
    
    return debugInfo;
};

window.testDesignPanelSync = function() {
    console.log('🧪 ROOT FIX: Testing design panel sync...');
    
    if (designPanel.currentComponentId) {
        const component = designPanel.getComponent(designPanel.currentComponentId);
        if (component?.type === 'topics') {
            console.log('Testing topics counter sync...');
            designPanel.syncTopicsCounterWithPreview();
            
            setTimeout(() => {
                const validation = designPanel.validateTopicsCounterAccuracy();
                console.log('Sync test results:', validation);
            }, 300);
        } else {
            console.log('Current component is not topics type:', component?.type);
        }
    } else {
        console.log('No current component selected');
    }
};

console.log('✅ ROOT FIX: Enhanced Design Panel with bidirectional topics sync ready');
console.log('📊 ROOT FIX: Debug commands available:');
console.log('   debugDesignPanel() - Show design panel debug info');
console.log('   testDesignPanelSync() - Test topics counter sync');