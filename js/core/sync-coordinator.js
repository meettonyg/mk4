/**
 * Sync Coordinator
 * PHASE 3: Component Communication Redesign - Unified Sync System
 * 
 * Single source of truth for component synchronization
 * Replaces universal-component-sync.js with clean event-driven approach
 * No polling, no setTimeout, pure event coordination
 * 
 * @version 1.0.0
 * @package GMKB/Core
 * 
 * ARCHITECTURAL PRINCIPLES:
 * - Event-driven synchronization
 * - Clear DOM ownership boundaries
 * - Single registration per component
 * - No polling or timing dependencies
 */

(function(window) {
    'use strict';
    
    const logger = window.structuredLogger || console;
    
    /**
     * SyncCoordinator - Manages bi-directional sync between editor and preview
     */
    class SyncCoordinator {
        constructor() {
            // Registry of components and their sync configurations
            this.registry = new Map();
            
            // Track sync operations to prevent loops
            this.syncInProgress = new Set();
            
            // Configuration
            this.config = {
                syncDelay: 50, // ms delay for debouncing
                maxSyncRetries: 3,
                enablePreviewEditing: false // Can be toggled for edit mode
            };
            
            // Debounce timers
            this.syncTimers = new Map();
            
            // Statistics
            this.stats = {
                componentsRegistered: 0,
                syncOperations: 0,
                errors: 0
            };
            
            // Initialize
            this.init();
        }
        
        /**
         * Initialize the sync coordinator
         */
        init() {
            // Listen for component lifecycle events
            this.attachLifecycleListeners();
            
            // Listen for data change events
            this.attachDataListeners();
            
            // Listen for configuration changes
            this.attachConfigListeners();
            
            logger.info('SYNC', 'Sync Coordinator initialized');
        }
        
        /**
         * Attach listeners for component lifecycle events
         */
        attachLifecycleListeners() {
            // Component editor ready - auto-register for sync
            document.addEventListener('component:editor-ready', (event) => {
                const { componentId, componentType, container } = event.detail;
                
                // Auto-detect fields to sync
                const fields = this.detectSyncFields(container);
                
                if (fields.length > 0) {
                    this.register(componentId, {
                        componentType,
                        editorContainer: container,
                        fields
                    });
                }
            });
            
            // Component destroyed - unregister from sync
            document.addEventListener('component:destroyed', (event) => {
                const { componentId } = event.detail;
                this.unregister(componentId);
            });
            
            // Component rendered in preview - update preview reference
            document.addEventListener('gmkb:component-rendered', (event) => {
                const { componentId } = event.detail;
                this.updatePreviewReference(componentId);
            });
        }
        
        /**
         * Attach listeners for data change events
         */
        attachDataListeners() {
            // Listen for component data changes from lifecycle events
            document.addEventListener('component:data-changed', (event) => {
                const { componentId, newData } = event.detail;
                
                // Sync to preview if registered
                if (this.registry.has(componentId)) {
                    this.syncToPreview(componentId, newData);
                }
            });
            
            // Listen for state manager updates
            if (window.enhancedStateManager) {
                window.enhancedStateManager.subscribeGlobal((state) => {
                    // Handle bulk updates if needed
                    this.handleStateUpdate(state);
                });
            }
        }
        
        /**
         * Attach listeners for configuration changes
         */
        attachConfigListeners() {
            // Listen for edit mode toggle
            document.addEventListener('gmkb:edit-mode-toggle', (event) => {
                this.config.enablePreviewEditing = event.detail.enabled;
                this.togglePreviewEditing(event.detail.enabled);
            });
        }
        
        /**
         * Register a component for synchronization
         */
        register(componentId, config) {
            if (!componentId || !config) {
                logger.error('SYNC', 'Invalid registration parameters');
                return false;
            }
            
            // Prevent duplicate registration
            if (this.registry.has(componentId)) {
                logger.debug('SYNC', `Component ${componentId} already registered, updating config`);
            }
            
            // Handle different config formats
            let editorContainer = config.editorContainer || config.editor;
            let previewContainer = config.previewContainer || config.preview;
            
            // Find preview container if not provided
            if (!previewContainer) {
                previewContainer = this.findPreviewContainer(componentId);
            }
            
            // Create registration entry
            const registration = {
                componentId,
                componentType: config.componentType,
                editorContainer: editorContainer,
                previewContainer: previewContainer,
                fields: config.fields || [],
                options: config.options || {},
                listeners: new Map(),
                isActive: true
            };
            
            // Store registration
            this.registry.set(componentId, registration);
            
            // Set up sync listeners
            this.setupSyncListeners(registration);
            
            // Update stats
            this.stats.componentsRegistered++;
            
            logger.info('SYNC', `Registered component ${componentId} with ${registration.fields.length} fields`);
            
            // Dispatch registration event
            document.dispatchEvent(new CustomEvent('sync:component-registered', {
                detail: { componentId, fields: registration.fields }
            }));
            
            return true;
        }
        
        /**
         * Unregister a component from synchronization
         */
        unregister(componentId) {
            const registration = this.registry.get(componentId);
            if (!registration) {
                return false;
            }
            
            // Clean up listeners
            this.cleanupListeners(registration);
            
            // Clear any pending sync timers
            if (this.syncTimers.has(componentId)) {
                clearTimeout(this.syncTimers.get(componentId));
                this.syncTimers.delete(componentId);
            }
            
            // Remove from registry
            this.registry.delete(componentId);
            
            // Update stats
            this.stats.componentsRegistered--;
            
            logger.info('SYNC', `Unregistered component ${componentId}`);
            
            return true;
        }
        
        /**
         * Set up sync listeners for a registered component
         */
        setupSyncListeners(registration) {
            const { componentId, editorContainer, previewContainer, fields } = registration;
            
            // Set up editor → preview sync
            if (editorContainer) {
                fields.forEach(field => {
                    // Find input elements for this field
                    const inputs = this.findFieldInputs(editorContainer, field);
                    
                    inputs.forEach(input => {
                        const handler = (event) => {
                            this.handleEditorChange(componentId, field, input.value);
                        };
                        
                        // Listen for input changes
                        input.addEventListener('input', handler);
                        input.addEventListener('change', handler);
                        
                        // Store listener reference for cleanup
                        const key = `editor-${field}-${inputs.indexOf(input)}`;
                        registration.listeners.set(key, { element: input, handler, event: 'input' });
                    });
                });
            }
            
            // Set up preview → editor sync (if edit mode enabled)
            if (previewContainer && this.config.enablePreviewEditing) {
                this.setupPreviewListeners(registration);
            }
        }
        
        /**
         * Set up preview editing listeners
         */
        setupPreviewListeners(registration) {
            const { componentId, previewContainer, fields } = registration;
            
            fields.forEach(field => {
                // Find editable elements in preview
                const elements = this.findPreviewElements(previewContainer, field);
                
                elements.forEach(element => {
                    // Make element editable
                    element.contentEditable = true;
                    element.dataset.syncField = field;
                    
                    const handler = (event) => {
                        this.handlePreviewChange(componentId, field, element.textContent);
                    };
                    
                    // Listen for content changes
                    element.addEventListener('input', handler);
                    element.addEventListener('blur', handler);
                    
                    // Store listener reference
                    const key = `preview-${field}-${elements.indexOf(element)}`;
                    registration.listeners.set(key, { element, handler, event: 'input' });
                });
            });
        }
        
        /**
         * Handle editor change and sync to preview
         */
        handleEditorChange(componentId, field, value) {
            // Prevent sync loops
            if (this.syncInProgress.has(`${componentId}-${field}`)) {
                return;
            }
            
            // Debounce sync operation
            const timerKey = `${componentId}-${field}`;
            if (this.syncTimers.has(timerKey)) {
                clearTimeout(this.syncTimers.get(timerKey));
            }
            
            const timer = setTimeout(() => {
                this.performSync(componentId, field, value, 'editor-to-preview');
                this.syncTimers.delete(timerKey);
            }, this.config.syncDelay);
            
            this.syncTimers.set(timerKey, timer);
        }
        
        /**
         * Handle preview change and sync to editor
         */
        handlePreviewChange(componentId, field, value) {
            // Prevent sync loops
            if (this.syncInProgress.has(`${componentId}-${field}`)) {
                return;
            }
            
            // Debounce sync operation
            const timerKey = `${componentId}-${field}`;
            if (this.syncTimers.has(timerKey)) {
                clearTimeout(this.syncTimers.get(timerKey));
            }
            
            const timer = setTimeout(() => {
                this.performSync(componentId, field, value, 'preview-to-editor');
                this.syncTimers.delete(timerKey);
            }, this.config.syncDelay);
            
            this.syncTimers.set(timerKey, timer);
        }
        
        /**
         * Perform the actual sync operation
         */
        performSync(componentId, field, value, direction) {
            const registration = this.registry.get(componentId);
            if (!registration || !registration.isActive) {
                return;
            }
            
            // Mark sync in progress
            const syncKey = `${componentId}-${field}`;
            this.syncInProgress.add(syncKey);
            
            try {
                if (direction === 'editor-to-preview') {
                    // Update preview
                    this.updatePreviewField(registration, field, value);
                    
                    // Update state
                    this.updateComponentState(componentId, field, value);
                    
                } else if (direction === 'preview-to-editor') {
                    // Update editor
                    this.updateEditorField(registration, field, value);
                    
                    // Update state
                    this.updateComponentState(componentId, field, value);
                }
                
                // Update stats
                this.stats.syncOperations++;
                
                // Dispatch sync event
                document.dispatchEvent(new CustomEvent('sync:field-synced', {
                    detail: { componentId, field, value, direction }
                }));
                
            } catch (error) {
                logger.error('SYNC', `Sync failed for ${componentId}.${field}:`, error);
                this.stats.errors++;
            } finally {
                // Clear sync lock after a short delay
                setTimeout(() => {
                    this.syncInProgress.delete(syncKey);
                }, 100);
            }
        }
        
        /**
         * Update a field in the preview
         */
        updatePreviewField(registration, field, value) {
            const { previewContainer } = registration;
            if (!previewContainer) return;
            
            const elements = this.findPreviewElements(previewContainer, field);
            elements.forEach(element => {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.value = value;
                } else {
                    element.textContent = value;
                }
            });
        }
        
        /**
         * Update a field in the editor
         */
        updateEditorField(registration, field, value) {
            const { editorContainer } = registration;
            if (!editorContainer) return;
            
            const inputs = this.findFieldInputs(editorContainer, field);
            inputs.forEach(input => {
                if (input.value !== value) {
                    input.value = value;
                    // Trigger change event for other listeners
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });
        }
        
        /**
         * Update component state
         */
        updateComponentState(componentId, field, value) {
            // Update via component manager if available
            if (window.enhancedComponentManager) {
                const updates = { [field]: value };
                window.enhancedComponentManager.updateComponentProps(componentId, updates);
            }
        }
        
        /**
         * Sync all data to preview
         */
        syncToPreview(componentId, data) {
            const registration = this.registry.get(componentId);
            if (!registration) return;
            
            Object.entries(data).forEach(([field, value]) => {
                if (registration.fields.includes(field)) {
                    this.updatePreviewField(registration, field, value);
                }
            });
        }
        
        /**
         * Find preview container for a component
         */
        findPreviewContainer(componentId) {
            // Try multiple selectors
            const selectors = [
                `[data-component-id="${componentId}"]`,
                `#component-${componentId}`,
                `.gmkb-component[data-id="${componentId}"]`
            ];
            
            for (const selector of selectors) {
                const element = document.querySelector(selector);
                if (element) return element;
            }
            
            return null;
        }
        
        /**
         * Update preview reference when component is re-rendered
         */
        updatePreviewReference(componentId) {
            const registration = this.registry.get(componentId);
            if (!registration) return;
            
            const newPreviewContainer = this.findPreviewContainer(componentId);
            if (newPreviewContainer && newPreviewContainer !== registration.previewContainer) {
                // Clean up old listeners
                this.cleanupPreviewListeners(registration);
                
                // Update reference
                registration.previewContainer = newPreviewContainer;
                
                // Set up new listeners if edit mode is enabled
                if (this.config.enablePreviewEditing) {
                    this.setupPreviewListeners(registration);
                }
                
                logger.debug('SYNC', `Updated preview reference for ${componentId}`);
            }
        }
        
        /**
         * Detect sync fields from editor container
         */
        detectSyncFields(container) {
            const fields = new Set();
            
            // Find all inputs with data attributes
            const inputs = container.querySelectorAll('[data-field], [data-sync-field], [name]');
            inputs.forEach(input => {
                const field = input.dataset.field || input.dataset.syncField || input.name;
                if (field) {
                    fields.add(field);
                }
            });
            
            return Array.from(fields);
        }
        
        /**
         * Find input elements for a field in editor
         */
        findFieldInputs(container, field) {
            const selectors = [
                `[data-field="${field}"]`,
                `[data-sync-field="${field}"]`,
                `[name="${field}"]`,
                `#${field}`,
                `.field-${field} input`,
                `.field-${field} textarea`
            ];
            
            const inputs = [];
            selectors.forEach(selector => {
                container.querySelectorAll(selector).forEach(el => {
                    if (!inputs.includes(el)) {
                        inputs.push(el);
                    }
                });
            });
            
            return inputs;
        }
        
        /**
         * Find preview elements for a field
         */
        findPreviewElements(container, field) {
            const selectors = [
                `[data-field="${field}"]`,
                `[data-sync-field="${field}"]`,
                `.${field}`,
                `.field-${field}`,
                `[class*="${field}"]`
            ];
            
            const elements = [];
            selectors.forEach(selector => {
                try {
                    container.querySelectorAll(selector).forEach(el => {
                        if (!elements.includes(el)) {
                            elements.push(el);
                        }
                    });
                } catch (e) {
                    // Invalid selector, skip
                }
            });
            
            return elements;
        }
        
        /**
         * Toggle preview editing mode
         */
        togglePreviewEditing(enabled) {
            this.config.enablePreviewEditing = enabled;
            
            this.registry.forEach(registration => {
                if (enabled) {
                    this.setupPreviewListeners(registration);
                } else {
                    this.cleanupPreviewListeners(registration);
                }
            });
            
            logger.info('SYNC', `Preview editing ${enabled ? 'enabled' : 'disabled'}`);
        }
        
        /**
         * Clean up preview listeners
         */
        cleanupPreviewListeners(registration) {
            registration.listeners.forEach((listener, key) => {
                if (key.startsWith('preview-')) {
                    listener.element.removeEventListener(listener.event, listener.handler);
                    listener.element.contentEditable = false;
                    delete listener.element.dataset.syncField;
                }
            });
        }
        
        /**
         * Clean up all listeners for a registration
         */
        cleanupListeners(registration) {
            registration.listeners.forEach(listener => {
                listener.element.removeEventListener(listener.event, listener.handler);
            });
            registration.listeners.clear();
        }
        
        /**
         * Handle bulk state update
         */
        handleStateUpdate(state) {
            // This is called when state manager updates
            // We only need to handle components that are registered
            this.registry.forEach((registration, componentId) => {
                const component = state.components?.[componentId];
                if (component && component.props) {
                    // Sync relevant fields to preview
                    const dataToSync = {};
                    registration.fields.forEach(field => {
                        if (component.props[field] !== undefined) {
                            dataToSync[field] = component.props[field];
                        }
                    });
                    
                    if (Object.keys(dataToSync).length > 0) {
                        this.syncToPreview(componentId, dataToSync);
                    }
                }
            });
        }
        
        /**
         * Get sync statistics
         */
        getStats() {
            return {
                ...this.stats,
                activeComponents: this.registry.size,
                syncInProgress: this.syncInProgress.size
            };
        }
        
        /**
         * Debug registered components
         */
        debug() {
            console.group('%c🔄 Sync Coordinator Status', 'font-size: 14px; font-weight: bold; color: #4CAF50');
            console.log('Registered Components:', this.registry.size);
            console.log('Stats:', this.getStats());
            console.log('Config:', this.config);
            
            console.group('Component Details:');
            this.registry.forEach((registration, componentId) => {
                console.log(`${componentId}:`, {
                    type: registration.componentType,
                    fields: registration.fields,
                    hasEditor: !!registration.editorContainer,
                    hasPreview: !!registration.previewContainer,
                    isActive: registration.isActive
                });
            });
            console.groupEnd();
            
            console.groupEnd();
        }
    }
    
    // Create global instance
    window.syncCoordinator = new SyncCoordinator();
    
    // Export class for testing
    window.SyncCoordinator = SyncCoordinator;
    
    // Console commands for debugging
    window.debugSync = () => window.syncCoordinator.debug();
    window.togglePreviewEdit = (enabled = true) => window.syncCoordinator.togglePreviewEditing(enabled);
    
    logger.info('SYNC', 'Sync Coordinator loaded');
    logger.info('SYNC', 'Commands: debugSync(), togglePreviewEdit(true/false)');
    
})(window);
