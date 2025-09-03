/**
 * Sync-Lifecycle Bridge
 * Connects Phase 1 ComponentLifecycle with Phase 3 SyncCoordinator
 * Fixes the bi-directional sync issue where editors keep getting destroyed
 */
(function() {
    'use strict';
    
    const logger = window.structuredLogger || console;
    
    class SyncLifecycleBridge {
        constructor() {
            this.activeEditors = new Map();
            this.syncRegistrations = new Map();
            this.init();
        }
        
        init() {
            // Listen for component lifecycle events
            document.addEventListener('component:editor-ready', (e) => this.onEditorReady(e));
            document.addEventListener('component:data-changed', (e) => this.onDataChanged(e));
            document.addEventListener('component:destroyed', (e) => this.onComponentDestroyed(e));
            
            // Listen for DOM ready to set up existing components
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setupExistingComponents());
            } else {
                this.setupExistingComponents();
            }
            
            logger.info('SYNC_BRIDGE', 'Sync-Lifecycle Bridge initialized');
        }
        
        onEditorReady(event) {
            const { componentId, type, container } = event.detail;
            
            logger.info('SYNC_BRIDGE', `Editor ready for ${type} (${componentId})`);
            
            // Store active editor reference
            this.activeEditors.set(componentId, {
                type,
                container,
                timestamp: Date.now()
            });
            
            // Set up bi-directional sync
            this.setupBidirectionalSync(componentId, type, container);
        }
        
        setupBidirectionalSync(componentId, type, editorContainer) {
            // Find the preview element
            const previewElement = document.querySelector(`#${componentId}`);
            if (!previewElement) {
                logger.warn('SYNC_BRIDGE', `Preview element not found for ${componentId}`);
                return;
            }
            
            // Check if SyncCoordinator is available
            if (!window.SyncCoordinator) {
                logger.warn('SYNC_BRIDGE', 'SyncCoordinator not available');
                return;
            }
            
            // Determine fields based on component type
            const fields = this.getComponentFields(type, editorContainer);
            
            // Register with SyncCoordinator
            try {
                window.SyncCoordinator.register(componentId, {
                    editor: editorContainer,
                    preview: previewElement,
                    fields: fields,
                    type: type
                });
                
                this.syncRegistrations.set(componentId, {
                    type,
                    fields,
                    editorContainer,
                    previewElement
                });
                
                logger.info('SYNC_BRIDGE', `✅ Bi-directional sync established for ${componentId}`);
                
                // Set up sync event listeners
                this.setupSyncListeners(componentId, editorContainer, previewElement, fields);
                
            } catch (error) {
                logger.error('SYNC_BRIDGE', `Failed to register sync for ${componentId}:`, error);
            }
        }
        
        setupSyncListeners(componentId, editorContainer, previewElement, fields) {
            // Listen for changes in editor inputs
            const inputs = editorContainer.querySelectorAll('input, textarea, select');
            
            inputs.forEach(input => {
                // Remove any existing listeners to prevent duplicates
                if (input._syncListener) {
                    input.removeEventListener('input', input._syncListener);
                }
                
                // Create new listener
                input._syncListener = (e) => {
                    this.syncEditorToPreview(componentId, input, previewElement);
                };
                
                // Add listener
                input.addEventListener('input', input._syncListener);
            });
            
            // For Topics component specifically
            if (editorContainer.classList.contains('topics-content-editor')) {
                this.setupTopicsSync(componentId, editorContainer, previewElement);
            }
        }
        
        setupTopicsSync(componentId, editorContainer, previewElement) {
            const topicInputs = editorContainer.querySelectorAll('.topic-input');
            
            topicInputs.forEach((input, index) => {
                // Remove existing listener if present
                if (input._topicSyncListener) {
                    input.removeEventListener('input', input._topicSyncListener);
                }
                
                // Create sync listener
                input._topicSyncListener = () => {
                    const topicValue = input.value.trim();
                    const topicNumber = index + 1;
                    
                    // Update preview
                    const previewItem = previewElement.querySelector(`.gmkb-topics__item:nth-child(${topicNumber}) h4`);
                    if (previewItem) {
                        previewItem.textContent = topicValue || `Topic ${topicNumber}`;
                    }
                    
                    // Update state
                    if (window.GMKB && window.GMKB.stateManager) {
                        const currentData = window.GMKB.stateManager.getComponent(componentId);
                        if (currentData) {
                            const updatedData = {
                                ...currentData,
                                props: {
                                    ...currentData.props,
                                    [`topic_${topicNumber}`]: topicValue
                                }
                            };
                            window.GMKB.stateManager.updateComponent(componentId, updatedData);
                        }
                    }
                    
                    logger.debug('SYNC_BRIDGE', `Synced topic ${topicNumber} for ${componentId}`);
                };
                
                input.addEventListener('input', input._topicSyncListener);
            });
            
            logger.info('SYNC_BRIDGE', `Topics-specific sync setup for ${componentId}`);
        }
        
        syncEditorToPreview(componentId, input, previewElement) {
            const fieldName = input.dataset.field || input.name || input.id;
            const value = input.value;
            
            // Find corresponding preview element
            const previewField = previewElement.querySelector(`[data-field="${fieldName}"]`);
            if (previewField) {
                if (previewField.tagName === 'INPUT' || previewField.tagName === 'TEXTAREA') {
                    previewField.value = value;
                } else {
                    previewField.textContent = value;
                }
            }
            
            // Emit data changed event
            document.dispatchEvent(new CustomEvent('component:data-changed', {
                detail: {
                    componentId,
                    field: fieldName,
                    value: value,
                    source: 'editor'
                }
            }));
        }
        
        onDataChanged(event) {
            const { componentId, field, value, source } = event.detail;
            
            // Skip if change came from this bridge
            if (source === 'sync-bridge') return;
            
            const registration = this.syncRegistrations.get(componentId);
            if (!registration) return;
            
            // Sync to the opposite side
            if (source === 'preview') {
                // Sync to editor
                const input = registration.editorContainer.querySelector(
                    `[data-field="${field}"], [name="${field}"], #${field}`
                );
                if (input && input.value !== value) {
                    input.value = value;
                }
            } else if (source === 'editor') {
                // Sync to preview (handled by syncEditorToPreview)
            }
        }
        
        onComponentDestroyed(event) {
            const { componentId } = event.detail;
            
            // Clean up registrations
            this.activeEditors.delete(componentId);
            this.syncRegistrations.delete(componentId);
            
            // Unregister from SyncCoordinator
            if (window.SyncCoordinator && window.SyncCoordinator.unregister) {
                window.SyncCoordinator.unregister(componentId);
            }
            
            logger.info('SYNC_BRIDGE', `Cleaned up sync for destroyed component ${componentId}`);
        }
        
        getComponentFields(type, container) {
            // Get fields based on component type
            switch(type) {
                case 'topics':
                    return ['topic_1', 'topic_2', 'topic_3', 'topic_4', 'topic_5'];
                case 'hero':
                    return ['title', 'subtitle', 'description', 'button_text', 'button_url'];
                case 'biography':
                    return ['biography', 'biography_short'];
                case 'contact':
                    return ['email', 'phone', 'website'];
                default:
                    // Auto-detect fields from inputs
                    const inputs = container.querySelectorAll('input, textarea, select');
                    const fields = [];
                    inputs.forEach(input => {
                        const field = input.dataset.field || input.name || input.id;
                        if (field && !fields.includes(field)) {
                            fields.push(field);
                        }
                    });
                    return fields;
            }
        }
        
        setupExistingComponents() {
            // Find all components with editors already loaded
            document.querySelectorAll('[data-component-id]').forEach(component => {
                const componentId = component.dataset.componentId;
                const componentType = component.dataset.componentType;
                
                // Check if there's an active editor
                const editor = document.querySelector(`#custom-content-editor .${componentType}-content-editor`);
                if (editor) {
                    this.setupBidirectionalSync(componentId, componentType, editor);
                }
            });
        }
        
        // Public API
        reconnectSync(componentId) {
            const editor = this.activeEditors.get(componentId);
            if (editor) {
                this.setupBidirectionalSync(componentId, editor.type, editor.container);
                return true;
            }
            return false;
        }
        
        getSyncStatus() {
            return {
                activeEditors: Array.from(this.activeEditors.keys()),
                syncRegistrations: Array.from(this.syncRegistrations.keys()),
                syncCoordinatorAvailable: !!window.SyncCoordinator
            };
        }
    }
    
    // Initialize bridge
    window.syncLifecycleBridge = new SyncLifecycleBridge();
    
    // Expose helper functions
    window.reconnectComponentSync = (componentId) => {
        return window.syncLifecycleBridge.reconnectSync(componentId);
    };
    
    window.getSyncBridgeStatus = () => {
        return window.syncLifecycleBridge.getSyncStatus();
    };
    
    logger.info('SYNC_BRIDGE', 'Bridge loaded. Commands: reconnectComponentSync(id), getSyncBridgeStatus()');
    
})();
