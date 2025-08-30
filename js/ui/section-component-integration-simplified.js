/**
 * @file section-component-integration-simplified.js
 * @description ROOT FIX: Simplified Direct Drag-Drop System
 * 
 * ✅ CHECKLIST COMPLIANT:
 * - Phase 1: No polling, event-driven, root cause fix  
 * - Phase 2: Simplicity first, code reduction
 * - Phase 3: Direct state integration
 * - Phase 4: Clear error handling
 * - Phase 5: WordPress compatible
 */

(function() {
    'use strict';
    
    // ✅ CHECKLIST COMPLIANT: Event-driven initialization only
    const initWhenReady = () => {
        if (window.structuredLogger) {
            initializeSimplifiedDragDrop();
            return;
        }
        
        // ✅ NO POLLING: Listen for dependency ready events only
        document.addEventListener('gmkb:structured-logger-ready', () => {
            if (window.structuredLogger) {
                initializeSimplifiedDragDrop();
            }
        }, { once: true });
        
        document.addEventListener('gmkb:core-systems-ready', () => {
            if (window.structuredLogger) {
                initializeSimplifiedDragDrop();
            }
        }, { once: true });
    };
    
    const initializeSimplifiedDragDrop = () => {
        const structuredLogger = window.structuredLogger;
        
        if (!structuredLogger) {
            console.error('❌ CRITICAL: StructuredLogger not available for simplified drag-drop');
            return;
        }
        
        structuredLogger.info('DRAG', 'Simplified Drag-Drop System initializing...');

        class SimplifiedDragDropSystem {
            constructor() {
                this.logger = structuredLogger;
                this.dragData = null;
                this.currentDragElement = null;
                this.dropZones = new Set();
                
                this.logger.info('DRAG', 'Setting up simplified drag-drop system');
                this.setupDragDrop();
            }
            
            /**
             * ✅ ROOT CAUSE FIX: Simple drag-drop setup without complex DOM traversal
             */
            setupDragDrop() {
                // ✅ SIMPLIFIED: Single event delegation for all drag-drop interactions
                document.addEventListener('dragstart', (e) => this.handleDragStart(e), true);
                document.addEventListener('dragend', (e) => this.handleDragEnd(e), true);
                document.addEventListener('dragover', (e) => this.handleDragOver(e), true);
                document.addEventListener('drop', (e) => this.handleDrop(e), true);
                document.addEventListener('dragleave', (e) => this.handleDragLeave(e), true);
                
                // ✅ SIMPLIFIED: Make components and library items draggable
                this.setupDraggableElements();
                
                // ✅ CHECKLIST COMPLIANT: Watch for new elements via mutation observer
                this.observeForNewElements();
                
                this.logger.info('DRAG', 'Drag-drop event listeners attached');
            }
            
            /**
             * ✅ ROOT CAUSE FIX: Simple draggable element setup
             */
            setupDraggableElements() {
                // Make existing components draggable
                const components = document.querySelectorAll('[data-component-id]');
                components.forEach(component => {
                    this.makeDraggable(component);
                });
                
                // Make library items draggable
                const libraryItems = document.querySelectorAll('.component-card, .component-item, [data-component-type], [data-component]');
                libraryItems.forEach(item => {
                    this.makeDraggable(item);
                });
                
                this.logger.debug('DRAG', `Made ${components.length} components and ${libraryItems.length} library items draggable`);
            }
            
            /**
             * ✅ SIMPLIFIED: Make element draggable with minimal setup
             */
            makeDraggable(element) {
                if (!element.hasAttribute('draggable')) {
                    element.setAttribute('draggable', 'true');
                    element.style.cursor = 'move';
                }
            }
            
            /**
             * ✅ CHECKLIST COMPLIANT: Watch for new elements via mutation observer (no polling)
             */
            observeForNewElements() {
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach(mutation => {
                        mutation.addedNodes.forEach(node => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                // Check if it's a component
                                if (node.hasAttribute('data-component-id')) {
                                    this.makeDraggable(node);
                                }
                                
                                // Check if it contains components
                                const components = node.querySelectorAll('[data-component-id]');
                                components.forEach(comp => this.makeDraggable(comp));
                                
                                // Check if it's a library item
                                if (node.classList.contains('component-card') || 
                                    node.classList.contains('component-item') ||
                                    node.hasAttribute('data-component-type')) {
                                    this.makeDraggable(node);
                                }
                                
                                // Check if it contains library items
                                const libraryItems = node.querySelectorAll('.component-card, .component-item, [data-component-type]');
                                libraryItems.forEach(item => this.makeDraggable(item));
                            }
                        });
                    });
                });
                
                // Observe main containers
                const containers = [
                    document.getElementById('media-kit-preview'),
                    document.getElementById('saved-components-container'),
                    document.getElementById('component-grid'),
                    document.querySelector('.component-library')
                ].filter(Boolean);
                
                containers.forEach(container => {
                    observer.observe(container, { childList: true, subtree: true });
                });
                
                this.logger.debug('DRAG', `Observing ${containers.length} containers for new draggable elements`);
            }
            
            /**
             * ✅ ROOT CAUSE FIX: Simple drag start without complex data extraction
             */
            handleDragStart(e) {
                if (!e.target || e.target.nodeType !== Node.ELEMENT_NODE) return;
                
                this.currentDragElement = e.target;
                
                // ✅ SIMPLIFIED: Determine drag type and data directly
                let dragType = 'unknown';
                let componentId = null;
                let componentType = null;
                let isNewComponent = false;
                
                // Check if it's an existing component
                const existingComponent = e.target.closest('[data-component-id]');
                if (existingComponent) {
                    dragType = 'existing-component';
                    componentId = existingComponent.getAttribute('data-component-id');
                    componentType = existingComponent.getAttribute('data-component-type') || '';
                }
                
                // Check if it's a library item (new component)
                const libraryItem = e.target.closest('.component-card, .component-item, [data-component-type], [data-component]');
                if (libraryItem && !existingComponent) {
                    dragType = 'new-component';
                    componentType = libraryItem.getAttribute('data-component-type') || 
                                   libraryItem.getAttribute('data-component') || '';
                    isNewComponent = true;
                }
                
                // ✅ ROOT CAUSE FIX: Store simple drag data
                this.dragData = {
                    type: dragType,
                    componentId,
                    componentType,
                    isNewComponent,
                    sourceElement: this.currentDragElement
                };
                
                // ✅ SIMPLIFIED: Set drag data on event
                if (e.dataTransfer) {
                    e.dataTransfer.effectAllowed = isNewComponent ? 'copy' : 'move';
                    e.dataTransfer.setData('text/plain', componentType || componentId || '');
                    e.dataTransfer.setData('component-type', componentType || '');
                    if (componentId) {
                        e.dataTransfer.setData('component-id', componentId);
                    }
                    if (isNewComponent) {
                        e.dataTransfer.setData('new-component', 'true');
                    }
                }
                
                // ✅ SIMPLIFIED: Visual feedback
                this.currentDragElement.style.opacity = '0.5';
                this.currentDragElement.classList.add('gmkb-dragging');
                
                this.logger.info('DRAG', `Drag started: ${dragType} - ${componentType || componentId}`);
            }
            
            /**
             * ✅ ROOT CAUSE FIX: Simple drag end cleanup
             */
            handleDragEnd(e) {
                if (this.currentDragElement) {
                    // ✅ SIMPLIFIED: Remove visual feedback
                    this.currentDragElement.style.opacity = '';
                    this.currentDragElement.classList.remove('gmkb-dragging');
                    
                    // ✅ SIMPLIFIED: Clear drag over states
                    document.querySelectorAll('.gmkb-drop-zone-active').forEach(zone => {
                        zone.classList.remove('gmkb-drop-zone-active');
                    });
                    
                    this.logger.debug('DRAG', 'Drag ended - cleanup complete');
                }
                
                this.currentDragElement = null;
                this.dragData = null;
            }
            
            /**
             * ✅ ROOT CAUSE FIX: Simple drag over with enhanced section detection
             */
            handleDragOver(e) {
                if (!this.dragData) return;
                
                // ✅ SIMPLIFIED: Find valid drop targets directly
                const dropTarget = this.findDropTarget(e.target);
                
                if (dropTarget) {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = this.dragData.isNewComponent ? 'copy' : 'move';
                    
                    // ROOT FIX: Enhanced visual feedback for sections
                    const sectionElement = e.target.closest('[data-section-id]') || dropTarget.closest('[data-section-id]');
                    if (sectionElement) {
                        sectionElement.classList.add('gmkb-section-drag-over');
                        this.logger.debug('DRAG', `Section drag over: ${sectionElement.dataset.sectionId}`);
                    }
                    
                    // ✅ SIMPLIFIED: General drop target feedback
                    dropTarget.classList.add('gmkb-drop-zone-active');
                    
                } else {
                    // ✅ SIMPLIFIED: Remove feedback from non-drop zones
                    document.querySelectorAll('.gmkb-drop-zone-active, .gmkb-section-drag-over').forEach(zone => {
                        zone.classList.remove('gmkb-drop-zone-active', 'gmkb-section-drag-over');
                    });
                }
            }
            
            /**
             * ✅ ROOT CAUSE FIX: Simple drop target identification
             */
            findDropTarget(element) {
                if (!element || element.nodeType !== Node.ELEMENT_NODE) return null;
                
                // ✅ SIMPLIFIED: Check common drop targets directly
                const dropTargets = [
                    '#media-kit-preview',
                    '#saved-components-container',
                    '.gmkb-preview-container',
                    '[data-section-id]',
                    '.gmkb-section',
                    '.section-container'
                ];
                
                for (const selector of dropTargets) {
                    const target = element.closest(selector);
                    if (target) {
                        return target;
                    }
                }
                
                return null;
            }
            
            /**
             * ✅ ROOT CAUSE FIX: Simple drag leave with proper target checking
             */
            handleDragLeave(e) {
                // ROOT FIX: Ensure we have a valid DOM element before accessing classList
                if (!e.target || e.target.nodeType !== Node.ELEMENT_NODE) return;
                
                // ROOT FIX: Use e.target instead of e.currentTarget for element operations
                const element = e.target;
                const relatedTarget = e.relatedTarget;
                
                // Only remove classes if we're actually leaving the element
                if (!relatedTarget || !element.contains(relatedTarget)) {
                    // Safely remove visual feedback
                    if (element.classList) {
                        element.classList.remove('gmkb-drop-zone-active', 'gmkb-section-drag-over');
                    }
                    
                    // Also remove from parent section if applicable
                    const sectionElement = element.closest && element.closest('[data-section-id]');
                    if (sectionElement && sectionElement.classList) {
                        sectionElement.classList.remove('gmkb-section-drag-over');
                    }
                }
            }
            
            /**
             * ✅ ROOT CAUSE FIX: Direct drop handling with section targeting
             */
            handleDrop(e) {
                e.preventDefault();
                
                if (!this.dragData) {
                    this.logger.warn('DRAG', 'Drop occurred without drag data');
                    return;
                }
                
                const dropTarget = this.findDropTarget(e.target);
                if (!dropTarget) {
                    this.logger.warn('DRAG', 'Drop occurred on invalid target');
                    return;
                }
                
                // ROOT CAUSE FIX: Detect section targeting from actual drop target
                let targetSectionId = null;
                let targetColumn = 1;
                
                // Check if we dropped directly on a section element or its children
                const sectionElement = e.target.closest('[data-section-id]') || dropTarget.closest('[data-section-id]');
                if (sectionElement) {
                    targetSectionId = sectionElement.getAttribute('data-section-id');
                    
                    // Check if dropped on a specific column
                    const columnElement = e.target.closest('.gmkb-section__column');
                    if (columnElement) {
                        targetColumn = parseInt(columnElement.getAttribute('data-column')) || 1;
                    }
                    
                    this.logger.info('DRAG', `Targeting section ${targetSectionId}, column ${targetColumn}`);
                } else {
                    // Check if the drop target itself is a section or section container
                    if (dropTarget.id && dropTarget.id.includes('section-')) {
                        targetSectionId = dropTarget.id.replace('section-', '');
                        this.logger.info('DRAG', `Targeting section from drop target ID: ${targetSectionId}`);
                    } else if (dropTarget.dataset && dropTarget.dataset.sectionId) {
                        targetSectionId = dropTarget.dataset.sectionId;
                        this.logger.info('DRAG', `Targeting section from dataset: ${targetSectionId}`);
                    }
                }
                
                // ✅ SIMPLIFIED: Clean up visual feedback immediately
                document.querySelectorAll('.gmkb-drop-zone-active, .gmkb-section-drag-over').forEach(zone => {
                    zone.classList.remove('gmkb-drop-zone-active', 'gmkb-section-drag-over');
                });
                
                this.logger.info('DRAG', `Processing drop: ${this.dragData.type} on ${dropTarget.id || dropTarget.className}`);
                
                // ✅ ROOT CAUSE FIX: Handle drop based on type with section targeting
                if (this.dragData.isNewComponent) {
                    this.handleNewComponentDrop(this.dragData.componentType, targetSectionId, targetColumn);
                } else if (this.dragData.componentId) {
                    this.handleExistingComponentDrop(this.dragData.componentId, dropTarget, targetSectionId, targetColumn);
                }
            }
            
            /**
             * ✅ ROOT CAUSE FIX: New component creation with section targeting
             */
            async handleNewComponentDrop(componentType, targetSectionId = null, targetColumn = 1) {
                if (!componentType) {
                    this.logger.error('DRAG', 'Cannot create component - no type specified');
                    this.showUserMessage('Invalid component type', 'error');
                    return;
                }
                
                try {
                    // ✅ ROOT CAUSE FIX: Pass section targeting to component manager
                    const props = {
                        dragDropCreated: true,
                        timestamp: Date.now()
                    };
                    
                    if (targetSectionId) {
                        props.targetSectionId = targetSectionId;
                        props.targetColumn = targetColumn;
                        this.logger.info('DRAG', `Creating ${componentType} in section ${targetSectionId}, column ${targetColumn}`);
                    }
                    
                    // ✅ SIMPLIFIED: Direct component manager call with section data
                    if (window.enhancedComponentManager && window.enhancedComponentManager.addComponent) {
                        const componentId = await window.enhancedComponentManager.addComponent(componentType, props);
                        
                        this.logger.info('DRAG', `Successfully created component: ${componentId}`);
                        this.showUserMessage(`${componentType} component added!`, 'success');
                        
                    } else {
                        throw new Error('Component manager not available');
                    }
                    
                } catch (error) {
                    this.logger.error('DRAG', 'Failed to create component:', error);
                    this.showUserMessage('Failed to add component', 'error');
                }
            }
            
            /**
             * ✅ ROOT CAUSE FIX: Component move with section targeting
             */
            handleExistingComponentDrop(componentId, dropTarget, targetSectionId = null, targetColumn = 1) {
                this.logger.info('DRAG', `Moving component ${componentId} to new location`);
                
                // ROOT CAUSE FIX: Handle section-specific moves
                if (targetSectionId && window.sectionLayoutManager) {
                    try {
                        const success = window.sectionLayoutManager.assignComponentToSection(
                            componentId,
                            targetSectionId,
                            targetColumn
                        );
                        
                        if (success) {
                            this.logger.info('DRAG', `Component ${componentId} moved to section ${targetSectionId}`);
                            this.showUserMessage('Component moved to section!', 'success');
                            
                            // Trigger component manager move for DOM updates
                            if (window.enhancedComponentManager && window.enhancedComponentManager.moveComponentToCorrectSection) {
                                setTimeout(() => {
                                    window.enhancedComponentManager.moveComponentToCorrectSection(componentId, targetSectionId, targetColumn);
                                }, 50);
                            }
                        } else {
                            throw new Error('Section assignment failed');
                        }
                    } catch (error) {
                        this.logger.error('DRAG', `Failed to move to section: ${error.message}`);
                        this.showUserMessage('Failed to move component', 'error');
                    }
                } else {
                    // ✅ SIMPLIFIED: General move without section targeting
                    document.dispatchEvent(new CustomEvent('gmkb:component-moved', {
                        detail: {
                            componentId,
                            targetContainer: dropTarget.id || 'main-container',
                            timestamp: Date.now()
                        }
                    }));
                    
                    this.showUserMessage('Component moved!', 'success');
                }
            }
            
            /**
             * ✅ SIMPLIFIED: User feedback without complex toast systems
             */
            showUserMessage(message, type = 'info') {
                if (window.showToast) {
                    window.showToast(message, type, 3000);
                } else {
                    console.log(`${type.toUpperCase()}: ${message}`);
                    
                    // ✅ SIMPLIFIED: Create simple notification
                    const notification = document.createElement('div');
                    notification.className = `gmkb-notification gmkb-notification--${type}`;
                    notification.textContent = message;
                    notification.style.cssText = `
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        padding: 12px 24px;
                        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
                        color: white;
                        border-radius: 8px;
                        z-index: 10000;
                        opacity: 0;
                        transform: translateY(-10px);
                        transition: all 0.3s ease;
                    `;
                    
                    document.body.appendChild(notification);
                    
                    // ✅ SIMPLIFIED: Animate in
                    setTimeout(() => {
                        notification.style.opacity = '1';
                        notification.style.transform = 'translateY(0)';
                    }, 10);
                    
                    // ✅ SIMPLIFIED: Remove after delay
                    setTimeout(() => {
                        notification.style.opacity = '0';
                        notification.style.transform = 'translateY(-10px)';
                        setTimeout(() => {
                            if (notification.parentNode) {
                                notification.parentNode.removeChild(notification);
                            }
                        }, 300);
                    }, 3000);
                }
            }
            
            /**
             * ✅ PUBLIC API: Manual component creation
             */
            async createComponent(componentType) {
                return await this.handleNewComponentDrop(componentType);
            }
            
            /**
             * ✅ DIAGNOSTICS: Simple debug info
             */
            getDebugInfo() {
                return {
                    dragData: this.dragData,
                    currentDragElement: this.currentDragElement ? this.currentDragElement.id : null,
                    dropZonesCount: this.dropZones.size,
                    draggableElements: document.querySelectorAll('[draggable="true"]').length,
                    simplified: true
                };
            }
        }
        
        // ✅ EXPORT: Create and expose globally
        window.SimplifiedDragDropSystem = SimplifiedDragDropSystem;
        window.sectionComponentIntegration = new SimplifiedDragDropSystem();
        
        // ✅ CHECKLIST COMPLIANT: Emit ready event
        document.dispatchEvent(new CustomEvent('gmkb:section-component-integration-ready', {
            detail: { 
                integration: window.sectionComponentIntegration,
                simplified: true,
                timestamp: Date.now()
            }
        }));
        
        structuredLogger.info('DRAG', 'Simplified Drag-Drop System ready and exposed globally');
    };
    
    // ✅ EVENT-DRIVEN: Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWhenReady);
    } else {
        initWhenReady();
    }
    
})();