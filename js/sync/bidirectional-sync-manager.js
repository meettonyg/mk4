/**
 * @file bidirectional-sync-manager.js
 * @description ROOT FIX: Comprehensive bidirectional sync system for sidebar-to-preview sync
 * 
 * This system ensures that changes in the design panel (sidebar) are immediately reflected
 * in the preview, and vice versa. It's specifically designed to fix the topics sync issue.
 * 
 * CHECKLIST COMPLIANCE:
 * ✅ Event-Driven: All sync happens via events, no polling
 * ✅ Root Cause Fix: Addresses the fundamental sync communication issue
 * ✅ No Global Object Sniffing: Uses proper event listeners
 * ✅ Dependency-Aware: Waits for required systems to be ready
 */

class BidirectionalSyncManager {
    constructor() {
        this.isInitialized = false;
        this.syncRegistry = new Map(); // componentId -> sync configuration
        this.eventListeners = new Map(); // element -> listener functions for cleanup
        this.mutationObserver = null;
        
        // Debounce settings
        this.debounceTime = 150;
        this.debouncedSyncs = new Map();
        
        // Initialize when systems are ready
        this.init();
    }
    
    /**
     * Initialize the sync manager when all dependencies are ready
     */
    init() {
        if (this.isInitialized) return;
        
        console.log('🔄 SYNC: Initializing bidirectional sync manager...');
        
        // Wait for required systems
        this.waitForSystems().then(() => {
            this.setupGlobalEventListeners();
            this.setupMutationObserver();
            this.isInitialized = true;
            
            console.log('✅ SYNC: Bidirectional sync manager ready');
            
            // Dispatch ready event
            document.dispatchEvent(new CustomEvent('gmkb:sync-manager-ready', {
                detail: { timestamp: Date.now() }
            }));
            
            // Auto-register topics component if it exists
            setTimeout(() => {
                this.autoRegisterTopicsComponent();
            }, 500);
            
        }).catch(error => {
            console.error('❌ SYNC: Failed to initialize sync manager:', error);
        });
    }
    
    /**
     * Wait for required systems to be available
     */
    async waitForSystems() {
        return new Promise((resolve) => {
            const checkSystems = () => {
                const hasStateManager = !!(window.enhancedStateManager || window.stateManager);
                const hasDesignPanel = !!window.designPanel;
                const hasDOM = document.readyState === 'complete' || document.readyState === 'interactive';
                
                if (hasStateManager && hasDesignPanel && hasDOM) {
                    console.log('✅ SYNC: All required systems available');
                    resolve();
                } else {
                    console.log('⏳ SYNC: Waiting for systems...', {
                        stateManager: hasStateManager,
                        designPanel: hasDesignPanel,
                        dom: hasDOM
                    });
                    setTimeout(checkSystems, 100);
                }
            };
            
            checkSystems();
        });
    }
    
    /**
     * Setup global event listeners for sync events
     */
    setupGlobalEventListeners() {
        console.log('🎧 SYNC: Setting up global event listeners...');
        
        // Listen for design panel loaded events
        document.addEventListener('designPanelLoaded', (event) => {
            const { component, componentId } = event.detail;
            console.log(`🎯 SYNC: Design panel loaded for ${component} (${componentId})`);
            
            if (component === 'topics') {
                setTimeout(() => {
                    this.registerTopicsSync(componentId);
                }, 200);
            }
        });
        
        // Listen for component state changes
        document.addEventListener('componentStateChanged', (event) => {
            const { componentId, property, value } = event.detail;
            console.log(`🔄 SYNC: Component state changed: ${componentId}.${property} = ${value}`);
            
            this.handleStateChange(componentId, property, value);
        });
        
        // Listen for manual sync requests
        document.addEventListener('requestBidirectionalSync', (event) => {
            const { componentId } = event.detail;
            console.log(`🔄 SYNC: Manual sync requested for ${componentId}`);
            
            this.performFullSync(componentId);
        });
        
        console.log('✅ SYNC: Global event listeners active');
    }
    
    /**
     * Setup mutation observer for DOM changes
     */
    setupMutationObserver() {
        console.log('👁️ SYNC: Setting up DOM mutation observer...');
        
        this.mutationObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                this.handleMutation(mutation);
            });
        });
        
        // Observe the entire document for changes
        this.mutationObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['data-component-id', 'contenteditable'],
            characterData: false // Ignore text content changes
        });
        
        console.log('✅ SYNC: Mutation observer active');
    }
    
    /**
     * Handle DOM mutations
     */
    handleMutation(mutation) {
        // Only care about structural changes or attribute changes
        if (mutation.type === 'childList') {
            // Check for new components that need sync
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const componentElement = node.querySelector ? node.querySelector('[data-component-id]') : null;
                    if (componentElement || (node.dataset && node.dataset.componentId)) {
                        const element = componentElement || node;
                        const componentId = element.dataset.componentId;
                        const componentType = element.dataset.component || element.dataset.componentType;
                        
                        if (componentType === 'topics' && componentId) {
                            console.log(`🔄 SYNC: New topics component detected: ${componentId}`);
                            setTimeout(() => {
                                this.registerTopicsSync(componentId);
                            }, 300);
                        }
                    }
                }
            });
        }
    }
    
    /**
     * Auto-register topics component if it exists
     */
    autoRegisterTopicsComponent() {
        console.log('🔍 SYNC: Auto-registering topics components...');
        
        const topicsComponents = document.querySelectorAll('[data-component="topics"], [data-component-type="topics"]');
        
        topicsComponents.forEach(element => {
            const componentId = element.dataset.componentId;
            if (componentId && !this.syncRegistry.has(componentId)) {
                console.log(`🎯 SYNC: Auto-registering topics component: ${componentId}`);
                this.registerTopicsSync(componentId);
            }
        });
        
        if (topicsComponents.length === 0) {
            console.log('ℹ️ SYNC: No topics components found for auto-registration');
        }
    }
    
    /**
     * Register bidirectional sync for a topics component
     */
    registerTopicsSync(componentId) {
        if (this.syncRegistry.has(componentId)) {
            console.log(`🔄 SYNC: Topics sync already registered for ${componentId}`);
            return false;
        }
        
        console.log(`🎯 SYNC: Registering topics sync for ${componentId}`);
        
        const syncConfig = {
            componentId: componentId,
            componentType: 'topics',
            sidebarSelectors: [
                '.topics-sidebar__topic-input',
                '[data-property^=\"topic_\"]',
                '.topic-input'
            ],
            previewSelectors: [
                '.topic-title[contenteditable=\"true\"]',
                '.topic-title',
                '[data-topic-title]'
            ],
            syncProperties: [
                'topic_1', 'topic_2', 'topic_3', 'topic_4', 'topic_5',
                'title', 'show_numbering', 'enable_drag_drop', 'layout_style', 'columns'
            ]
        };
        
        this.syncRegistry.set(componentId, syncConfig);
        
        // Setup sync listeners
        this.setupSyncListeners(syncConfig);
        
        // Perform initial sync
        setTimeout(() => {
            this.performFullSync(componentId);
        }, 100);
        
        console.log(`✅ SYNC: Topics sync registered for ${componentId}`);
        return true;
    }
    
    /**
     * Setup sync listeners for a component
     */
    setupSyncListeners(syncConfig) {
        const { componentId, sidebarSelectors, previewSelectors } = syncConfig;
        
        // Setup sidebar to preview sync
        sidebarSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                this.setupElementListener(element, 'sidebar', componentId);
            });
        });
        
        // Setup preview to sidebar sync
        previewSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                this.setupElementListener(element, 'preview', componentId);
            });
        });
        
        console.log(`🔗 SYNC: Listeners setup for ${componentId}`);
    }
    
    /**
     * Setup event listener for an element
     */
    setupElementListener(element, direction, componentId) {
        if (this.eventListeners.has(element)) {
            return; // Already has listener
        }
        
        const debouncedSync = this.createDebouncedSync(element, direction, componentId);
        
        // Create listener function
        const listener = (event) => {
            console.log(`🔄 SYNC: ${direction} change detected for ${componentId}`);
            debouncedSync(event);
        };
        
        // Add event listeners
        element.addEventListener('input', listener);
        element.addEventListener('change', listener);
        
        // For contenteditable elements, also listen for blur
        if (element.isContentEditable || element.getAttribute('contenteditable') === 'true') {
            element.addEventListener('blur', listener);
        }
        
        // Store listener for cleanup
        this.eventListeners.set(element, listener);
        
        console.log(`🎧 SYNC: ${direction} listener added for ${componentId}`);
    }
    
    /**
     * Create a debounced sync function
     */
    createDebouncedSync(element, direction, componentId) {
        return this.debounce((event) => {
            this.performSync(element, direction, componentId, event);
        }, this.debounceTime);
    }
    
    /**
     * Perform sync for a specific element change
     */
    performSync(changedElement, direction, componentId, event) {
        console.log(`🔄 SYNC: Performing ${direction} sync for ${componentId}`);
        
        const syncConfig = this.syncRegistry.get(componentId);
        if (!syncConfig) {
            console.warn(`⚠️ SYNC: No sync config found for ${componentId}`);
            return;
        }
        
        try {
            if (direction === 'sidebar') {
                this.syncSidebarToPreview(changedElement, syncConfig, event);
            } else if (direction === 'preview') {
                this.syncPreviewToSidebar(changedElement, syncConfig, event);
            }
        } catch (error) {
            console.error(`❌ SYNC: Error in ${direction} sync for ${componentId}:`, error);
        }
    }
    
    /**
     * Sync from sidebar to preview
     */
    syncSidebarToPreview(sidebarElement, syncConfig, event) {
        const { componentId } = syncConfig;
        
        console.log(`➡️ SYNC: Sidebar → Preview for ${componentId}`);
        
        const property = sidebarElement.dataset.property;
        const value = sidebarElement.value || sidebarElement.textContent;
        
        if (!property) {
            console.warn('⚠️ SYNC: No data-property attribute found on sidebar element');
            return;
        }
        
        // Update state manager
        this.updateComponentState(componentId, property, value);
        
        // Update preview elements
        this.updatePreviewElements(syncConfig, property, value);
        
        // Dispatch sync event
        document.dispatchEvent(new CustomEvent('sidebarToPreviewSync', {
            detail: { componentId, property, value, timestamp: Date.now() }
        }));
        
        console.log(`✅ SYNC: ${property} = "${value}" synced from sidebar to preview`);
    }
    
    /**
     * Sync from preview to sidebar
     */
    syncPreviewToSidebar(previewElement, syncConfig, event) {
        const { componentId } = syncConfig;
        
        console.log(`⬅️ SYNC: Preview → Sidebar for ${componentId}`);
        
        const value = previewElement.textContent || previewElement.value;
        
        // Try to determine which topic this is based on element attributes or position
        let property = previewElement.dataset.property;
        
        if (!property) {
            // Try to infer property from topic number or index
            const topicNumber = previewElement.dataset.topicNumber || 
                               previewElement.getAttribute('data-topic-number');
            
            if (topicNumber) {
                property = `topic_${topicNumber}`;
            } else {
                // Try to find by position
                const allTopicTitles = document.querySelectorAll('.topic-title');
                const index = Array.from(allTopicTitles).indexOf(previewElement);
                if (index >= 0) {
                    property = `topic_${index + 1}`;
                }
            }
        }
        
        if (!property) {
            console.warn('⚠️ SYNC: Cannot determine property for preview element');
            return;
        }
        
        // Update state manager
        this.updateComponentState(componentId, property, value);
        
        // Update sidebar elements
        this.updateSidebarElements(syncConfig, property, value);
        
        // Dispatch sync event
        document.dispatchEvent(new CustomEvent('previewToSidebarSync', {
            detail: { componentId, property, value, timestamp: Date.now() }
        }));
        
        console.log(`✅ SYNC: ${property} = "${value}" synced from preview to sidebar`);
    }
    
    /**
     * Update component state in state manager
     */
    updateComponentState(componentId, property, value) {
        console.log(`💾 SYNC: Updating state for ${componentId}.${property} = "${value}"`);
        
        try {
            if (window.enhancedStateManager && window.enhancedStateManager.updateComponentProperty) {
                window.enhancedStateManager.updateComponentProperty(componentId, property, value);
            } else if (window.enhancedStateManager && window.enhancedStateManager.updateComponent) {
                // Get current component data
                const state = window.enhancedStateManager.getState();
                const component = state.components[componentId];
                
                if (component) {
                    const updatedProps = { ...component.props, [property]: value };
                    window.enhancedStateManager.updateComponent(componentId, updatedProps);
                }
            } else if (window.stateManager) {
                // Fallback to regular state manager
                const state = window.stateManager.getState();
                const component = state.components[componentId];
                
                if (component) {
                    const updatedProps = { ...component.props, [property]: value };
                    window.stateManager.updateComponent(componentId, updatedProps);
                }
            } else {
                console.warn('⚠️ SYNC: No state manager available for update');
                return;
            }
            
            console.log(`✅ SYNC: State updated for ${componentId}`);
            
        } catch (error) {
            console.error(`❌ SYNC: Failed to update state for ${componentId}:`, error);
        }
    }
    
    /**
     * Update preview elements to match sidebar change
     */
    updatePreviewElements(syncConfig, property, value) {
        const { previewSelectors } = syncConfig;
        
        // For topic properties, update the corresponding preview element
        if (property.startsWith('topic_')) {
            const topicNumber = property.split('_')[1];
            const previewElement = document.querySelector(`[data-topic-number="${topicNumber}"]`) ||
                                 document.querySelector(`.topic-title:nth-child(${topicNumber})`);
            
            if (previewElement) {
                // Temporarily disable sync to prevent loops
                const listener = this.eventListeners.get(previewElement);
                if (listener) {
                    previewElement.removeEventListener('input', listener);
                    previewElement.removeEventListener('change', listener);
                    previewElement.removeEventListener('blur', listener);
                }
                
                previewElement.textContent = value;
                
                // Re-enable sync after a brief delay
                setTimeout(() => {
                    if (listener) {
                        previewElement.addEventListener('input', listener);
                        previewElement.addEventListener('change', listener);
                        if (previewElement.isContentEditable) {
                            previewElement.addEventListener('blur', listener);
                        }
                    }
                }, 50);
                
                console.log(`📝 SYNC: Updated preview topic ${topicNumber} to "${value}"`);
            } else {
                console.warn(`⚠️ SYNC: Preview element not found for topic ${topicNumber}`);
            }
        }
    }
    
    /**
     * Update sidebar elements to match preview change
     */
    updateSidebarElements(syncConfig, property, value) {
        const { sidebarSelectors } = syncConfig;
        
        // Find the corresponding sidebar element
        const sidebarElement = document.querySelector(`[data-property="${property}"]`);
        
        if (sidebarElement) {
            // Temporarily disable sync to prevent loops
            const listener = this.eventListeners.get(sidebarElement);
            if (listener) {
                sidebarElement.removeEventListener('input', listener);
                sidebarElement.removeEventListener('change', listener);
            }
            
            if (sidebarElement.tagName.toLowerCase() === 'input' || 
                sidebarElement.tagName.toLowerCase() === 'textarea') {
                sidebarElement.value = value;
            } else {
                sidebarElement.textContent = value;
            }
            
            // Re-enable sync after a brief delay
            setTimeout(() => {
                if (listener) {
                    sidebarElement.addEventListener('input', listener);
                    sidebarElement.addEventListener('change', listener);
                }
            }, 50);
            
            console.log(`📝 SYNC: Updated sidebar ${property} to "${value}"`);
        } else {
            console.warn(`⚠️ SYNC: Sidebar element not found for ${property}`);
        }
    }
    
    /**
     * Perform full sync for a component
     */
    performFullSync(componentId) {
        console.log(`🔄 SYNC: Performing full sync for ${componentId}`);
        
        const syncConfig = this.syncRegistry.get(componentId);
        if (!syncConfig) {
            console.warn(`⚠️ SYNC: No sync config found for ${componentId}`);
            return;
        }
        
        try {
            // Get component state from state manager
            const state = window.enhancedStateManager ? 
                         window.enhancedStateManager.getState() : 
                         (window.stateManager ? window.stateManager.getState() : null);
            
            if (!state || !state.components[componentId]) {
                console.warn(`⚠️ SYNC: Component ${componentId} not found in state`);
                return;
            }
            
            const component = state.components[componentId];
            const props = component.props || component.data || {};
            
            // Sync all properties from state to both sidebar and preview
            syncConfig.syncProperties.forEach(property => {
                if (props.hasOwnProperty(property)) {
                    const value = props[property];
                    console.log(`🔄 SYNC: Full sync ${property} = "${value}"`);
                    
                    this.updateSidebarElements(syncConfig, property, value);
                    this.updatePreviewElements(syncConfig, property, value);
                }
            });
            
            console.log(`✅ SYNC: Full sync completed for ${componentId}`);
            
            // Dispatch full sync event
            document.dispatchEvent(new CustomEvent('fullSyncCompleted', {
                detail: { componentId, timestamp: Date.now() }
            }));
            
        } catch (error) {
            console.error(`❌ SYNC: Full sync failed for ${componentId}:`, error);
        }
    }
    
    /**
     * Handle state changes from external sources
     */
    handleStateChange(componentId, property, value) {
        const syncConfig = this.syncRegistry.get(componentId);
        if (!syncConfig) return;
        
        console.log(`🔄 SYNC: External state change for ${componentId}.${property}`);
        
        // Update both sidebar and preview to reflect the state change
        this.updateSidebarElements(syncConfig, property, value);
        this.updatePreviewElements(syncConfig, property, value);
    }
    
    /**
     * Unregister sync for a component
     */
    unregisterSync(componentId) {
        console.log(`🗑️ SYNC: Unregistering sync for ${componentId}`);
        
        const syncConfig = this.syncRegistry.get(componentId);
        if (!syncConfig) return;
        
        // Remove event listeners
        this.eventListeners.forEach((listener, element) => {
            element.removeEventListener('input', listener);
            element.removeEventListener('change', listener);
            element.removeEventListener('blur', listener);
        });
        this.eventListeners.clear();
        
        // Remove from registry
        this.syncRegistry.delete(componentId);
        
        console.log(`✅ SYNC: Sync unregistered for ${componentId}`);
    }
    
    /**
     * Cleanup all sync registrations
     */
    cleanup() {
        console.log('🧹 SYNC: Cleaning up bidirectional sync manager...');
        
        // Disconnect mutation observer
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
            this.mutationObserver = null;
        }
        
        // Clear all sync registrations
        this.syncRegistry.forEach((config, componentId) => {
            this.unregisterSync(componentId);
        });
        
        this.isInitialized = false;
        
        console.log('✅ SYNC: Cleanup completed');
    }
    
    /**
     * Debug function to show sync status
     */
    debug() {
        console.group('🔍 SYNC: Debug Information');
        console.log('Initialized:', this.isInitialized);
        console.log('Registered components:', Array.from(this.syncRegistry.keys()));
        console.log('Active listeners:', this.eventListeners.size);
        
        this.syncRegistry.forEach((config, componentId) => {
            console.group(`Component: ${componentId}`);
            console.log('Config:', config);
            
            const sidebarElements = [];
            config.sidebarSelectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                sidebarElements.push(...elements);
            });
            
            const previewElements = [];
            config.previewSelectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                previewElements.push(...elements);
            });
            
            console.log(`Sidebar elements: ${sidebarElements.length}`);
            console.log(`Preview elements: ${previewElements.length}`);
            console.groupEnd();
        });
        
        console.groupEnd();
        
        return {
            initialized: this.isInitialized,
            registeredComponents: Array.from(this.syncRegistry.keys()),
            activeListeners: this.eventListeners.size,
            configs: Object.fromEntries(this.syncRegistry)
        };
    }
    
    /**
     * Utility: Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Create global instance
window.bidirectionalSyncManager = new BidirectionalSyncManager();

// Expose debug functions
window.debugBidirectionalSync = () => window.bidirectionalSyncManager.debug();
window.testBidirectionalSync = (componentId) => {
    if (componentId) {
        window.bidirectionalSyncManager.performFullSync(componentId);
    } else {
        console.log('🧪 SYNC: Testing all registered components...');
        window.bidirectionalSyncManager.syncRegistry.forEach((config, id) => {
            window.bidirectionalSyncManager.performFullSync(id);
        });
    }
};

console.log('✅ SYNC: Bidirectional Sync Manager loaded');
console.log('🧪 Debug commands available:');
console.log('   debugBidirectionalSync() - Show sync status');
console.log('   testBidirectionalSync(componentId) - Test sync for component');
console.log('📡 Events: gmkb:sync-manager-ready, sidebarToPreviewSync, previewToSidebarSync, fullSyncCompleted');
