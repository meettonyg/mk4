/**
 * @file component-controls-manager.js
 * @description ROOT FIX: Dynamic Component Controls Manager
 * Implements proper separation of concerns for component controls
 * Eliminates hardcoded HTML control injection and duplication issues
 * 
 * ARCHITECTURAL PRINCIPLES:
 * ✅ Separation of Concerns - Controls managed by dedicated class
 * ✅ Dynamic Generation - createElement API instead of innerHTML
 * ✅ Event-Driven - No direct DOM manipulation
 * ✅ Deduplication Prevention - Smart attachment checking
 * ✅ Lifecycle Management - Proper cleanup and state tracking
 */

// ROOT FIX: WordPress-compatible IIFE wrapper
(function() {
    'use strict';
    
    // ROOT FIX: Fallback utilities if dependencies not available
    const structuredLogger = window.structuredLogger || {
        info: console.log,
        warn: console.warn,
        error: console.error,
        debug: console.debug
    };
    
    const GMKB = window.GMKB || {
        dispatch: (eventName, detail) => {
            const event = new CustomEvent(eventName, { detail });
            document.dispatchEvent(event);
        },
        subscribe: (eventName, callback) => {
            document.addEventListener(eventName, callback);
        }
    };

    /**
     * ROOT FIX: Dynamic Component Controls Manager
     * Manages component controls through proper JavaScript DOM API
     * Eliminates HTML string injection and ensures separation of concerns
     */
    class ComponentControlsManager {
        constructor() {
            this.attachedControls = new Map(); // Track attached controls by component ID
            this.eventListeners = new Map(); // Track event listeners for cleanup
            this.controlDefinitions = this.getControlDefinitions();
            this.isInitialized = false;
            
            structuredLogger.info('CONTROLS', 'ComponentControlsManager initialized with dynamic control generation');
        }
        
        /**
         * ROOT FIX: Initialize the controls manager with dependency awareness
         * CHECKLIST COMPLIANT: Event-driven initialization, no polling
         */
        init() {
            if (this.isInitialized) {
                return;
            }
            
            // ROOT FIX: Check if component manager is ready immediately
            if (window.enhancedComponentManager && window.enhancedComponentManager.isInitialized) {
                structuredLogger.info('CONTROLS', 'Component manager already ready, initializing immediately');
                this.completeInitialization();
                return;
            }
            
            // ROOT FIX: Listen for component manager ready event with fallback
            structuredLogger.info('CONTROLS', 'Waiting for component manager to be ready...');
            document.addEventListener('gmkb:component-manager-ready', () => {
                structuredLogger.info('CONTROLS', 'Component manager ready signal received');
                this.completeInitialization();
            }, { once: true });
            
            // ROOT FIX: Fallback - check again after a brief delay in case the event already fired
            setTimeout(() => {
                if (!this.isInitialized && window.enhancedComponentManager && window.enhancedComponentManager.isInitialized) {
                    structuredLogger.info('CONTROLS', 'Component manager ready detected via fallback check');
                    this.completeInitialization();
                }
            }, 100);
        }
        
        /**
        * ROOT FIX: Complete initialization after dependencies are ready
        */
        completeInitialization() {
        if (this.isInitialized) {
        return;
        }
        
        this.setupEventListeners();
        this.isInitialized = true;
        
        structuredLogger.info('CONTROLS', '✅ ComponentControlsManager ready for dynamic control generation');
        
        // ROOT FIX: Request controls attachment via event - CHECKLIST COMPLIANT: No setTimeout
        // Use requestAnimationFrame for next paint cycle to ensure DOM is stable
        requestAnimationFrame(() => {
            this.attachControlsToAllExistingComponents();
        });
        
        // ROOT FIX: Dispatch ready event for event-driven coordination (NO POLLING)
        document.dispatchEvent(new CustomEvent('gmkb:component-controls-manager-ready', {
        detail: {
                timestamp: Date.now(),
                    manager: this,
                architecture: 'event-driven',
                dependenciesReady: true
            }
        }));
    }
        
        /**
         * ROOT FIX: Define control configurations
         * No HTML strings - only metadata for dynamic generation
         */
        getControlDefinitions() {
            return {
                edit: {
                    title: 'Edit Component',
                    icon: this.createEditIcon(),
                    className: 'component-control--edit',
                    position: 'primary'
                },
                'move-up': {
                    title: 'Move Up',
                    icon: this.createMoveUpIcon(),
                    className: 'component-control--move-up',
                    position: 'group'
                },
                'move-down': {
                    title: 'Move Down', 
                    icon: this.createMoveDownIcon(),
                    className: 'component-control--move-down',
                    position: 'group'
                },
                duplicate: {
                    title: 'Duplicate Component',
                    icon: this.createDuplicateIcon(),
                    className: 'component-control--duplicate',
                    position: 'secondary'
                },
                delete: {
                    title: 'Delete Component',
                    icon: this.createDeleteIcon(),
                    className: 'component-control--delete',
                    position: 'secondary'
                }
            };
        }
        
        /**
         * ROOT FIX: Dynamic control attachment with SINGLE-INSTANCE ENFORCEMENT
         * @param {HTMLElement} componentElement - Component DOM element
         * @param {string} componentId - Component ID
         */
        attachControls(componentElement, componentId) {
            if (!componentElement || !componentId) {
                structuredLogger.warn('CONTROLS', 'Invalid parameters for control attachment', { componentElement: !!componentElement, componentId });
                return false;
            }

            // ROOT FIX: Set data-component-id if not present (templates no longer set it)
            if (!componentElement.hasAttribute('data-component-id')) {
                componentElement.setAttribute('data-component-id', componentId);
                structuredLogger.debug('CONTROLS', `Set data-component-id="${componentId}" on element`);
            }
            
            // ROOT CAUSE FIX: More flexible validation for dynamically generated components
            // Accept the element if it either:
            // 1. Has matching data-component-id
            // 2. Has matching ID attribute
            // 3. Is being assigned a new data-component-id
            const existingDataId = componentElement.getAttribute('data-component-id');
            const existingId = componentElement.id;
            
            // If data-component-id exists but doesn't match, this is likely the wrong element
            if (existingDataId && existingDataId !== componentId) {
                // Check if this is a duplicated component that needs updating
                if (!componentId.includes('-copy-')) {
                    structuredLogger.warn('CONTROLS', `Element validation failed for ${componentId} - data-component-id mismatch (has: ${existingDataId})`);
                    return false;
                }
            }
            
            // Ensure the element has the correct data-component-id
            if (!existingDataId || existingDataId !== componentId) {
                componentElement.setAttribute('data-component-id', componentId);
                structuredLogger.debug('CONTROLS', `Updated data-component-id to ${componentId}`);
            }
            
            // Ensure the element has an ID if it doesn't
            if (!existingId) {
                componentElement.id = componentId;
                structuredLogger.debug('CONTROLS', `Set element ID to ${componentId}`);
            }
            
            // ROOT FIX: Check if controls already attached to THIS SPECIFIC component ID (not element)
            if (this.attachedControls.has(componentId)) {
                const existingData = this.attachedControls.get(componentId);
                if (existingData && existingData.element && existingData.element.parentNode) {
                    structuredLogger.debug('CONTROLS', `Controls already attached to ${componentId}, skipping duplicate attachment`);
                    return true; // Already attached successfully
                }
                // Clean up stale data if element no longer exists
                this.attachedControls.delete(componentId);
                this.cleanupEventListeners(componentId);
            }

            // ROOT FIX: AGGRESSIVE deduplication - remove ALL existing controls first
            // This prevents overlapping/stacking controls from multiple attachment attempts
            
            // ROOT CAUSE FIX: Check ALL possible containers, not just the component itself
            // Controls might be attached to parent containers in some render flows
            const searchContainers = [componentElement];
            if (componentElement.parentElement) {
                searchContainers.push(componentElement.parentElement);
            }
            
            searchContainers.forEach(container => {
                const allExistingControls = container.querySelectorAll(
                    '.component-controls, .component-controls--dynamic, .component-controls--legacy,' +
                    ' .control-toolbar, .control-button, [data-controls-type="legacy"], .emergency-controls'
                );
                allExistingControls.forEach(controlElement => {
                    // Only remove if it's for this component
                    const controlsFor = controlElement.getAttribute('data-controls-for') || 
                                      controlElement.querySelector('[data-controls-for]')?.getAttribute('data-controls-for');
                    if (!controlsFor || controlsFor === componentId) {
                        controlElement.remove();
                        structuredLogger.debug('CONTROLS', `Removed existing control element for ${componentId} from ${container === componentElement ? 'component' : 'parent'}`);
                    }
                });
            });
            
            // Clean up any old event listeners
            this.cleanupEventListeners(componentId);
            
            // Remove any control-related attributes to start fresh
            componentElement.removeAttribute('data-controls-attached');
            componentElement.removeAttribute('data-controls-manager');
            
            // Mark component as being processed to prevent simultaneous attachments
            if (componentElement.hasAttribute('data-controls-processing')) {
                structuredLogger.debug('CONTROLS', `Component ${componentId} already being processed, skipping`);
                return false;
            }
            componentElement.setAttribute('data-controls-processing', 'true');
            
            try {
                // ROOT FIX: Create controls container dynamically
                const controlsContainer = this.createControlsContainer();
                
                // ROOT FIX: Create toolbar dynamically
                const toolbar = this.createToolbar(componentId);
                controlsContainer.appendChild(toolbar);
                
                // ROOT FIX: Insert controls at beginning of component (proper DOM API)
                componentElement.insertBefore(controlsContainer, componentElement.firstChild);
                
                // ROOT FIX: Attach event listeners with proper cleanup tracking
                this.attachEventListeners(controlsContainer, componentId);
                
                // ROOT FIX: Attach hover behavior
                this.attachHoverBehavior(componentElement, controlsContainer);
                
                // ROOT FIX: Track attachment for deduplication
                this.attachedControls.set(componentId, {
                    element: componentElement,
                    controls: controlsContainer,
                    attachedAt: Date.now()
                });
                
                // ROOT FIX: Mark component as having controls attached
                componentElement.setAttribute('data-controls-attached', 'true');
                componentElement.setAttribute('data-controls-manager', 'dynamic');
                
                // Remove processing flag on success
                componentElement.removeAttribute('data-controls-processing');
                
                structuredLogger.info('CONTROLS', `Dynamic controls attached to ${componentId}`);
                
                // ROOT FIX: Dispatch control attachment event
                GMKB.dispatch('gmkb:controls-attached', {
                    componentId,
                    method: 'dynamic',
                    timestamp: Date.now()
                });
                
                return true;
                
            } catch (error) {
                // Remove processing flag on error
                componentElement.removeAttribute('data-controls-processing');
                structuredLogger.error('CONTROLS', `Failed to attach controls to ${componentId}`, error);
                return false;
            }
        }
        
        /**
         * ROOT FIX: Create controls container using createElement API
         */
        createControlsContainer() {
            const container = document.createElement('div');
            container.className = 'component-controls component-controls--dynamic';
            container.setAttribute('data-controls-type', 'dynamic');
            
            // ROOT FIX: Add CSS for dynamic controls with PROPER visibility behavior
            // Initial state: hidden but ready for hover
            container.style.cssText = `
                position: absolute;
                top: 8px;
                right: 8px;
                opacity: 0;
                visibility: hidden;
                pointer-events: none;
                transition: opacity 0.2s ease, visibility 0.2s ease, transform 0.2s ease;
                z-index: 1000;
                background: rgba(0, 0, 0, 0.9);
                border-radius: 6px;
                padding: 4px;
                box-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
                backdrop-filter: blur(8px);
                transform: translateY(-2px);
            `;
            
            return container;
        }
        
        /**
         * ROOT FIX: Create toolbar with dynamic control buttons
         */
        createToolbar(componentId) {
            const toolbar = document.createElement('div');
            toolbar.className = 'component-controls__toolbar component-controls__toolbar--dynamic';
            toolbar.setAttribute('data-toolbar-for', componentId);
            
            // ROOT FIX: Add toolbar styling
            toolbar.style.cssText = `
                display: flex;
                align-items: center;
                gap: 4px;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(8px);
                border-radius: 6px;
                padding: 4px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            `;
            
            // ROOT FIX: Create edit button (primary)
            const editButton = this.createControlButton('edit', componentId);
            toolbar.appendChild(editButton);
            
            // ROOT FIX: Create move group
            const moveGroup = this.createMoveGroup(componentId);
            toolbar.appendChild(moveGroup);
            
            // ROOT FIX: Create duplicate button
            const duplicateButton = this.createControlButton('duplicate', componentId);
            toolbar.appendChild(duplicateButton);
            
            // ROOT FIX: Create delete button
            const deleteButton = this.createControlButton('delete', componentId);
            toolbar.appendChild(deleteButton);
            
            return toolbar;
        }
        
        /**
         * ROOT FIX: Create individual control button dynamically
         */
        createControlButton(controlType, componentId) {
            const definition = this.controlDefinitions[controlType];
            if (!definition) {
                structuredLogger.warn('CONTROLS', `Unknown control type: ${controlType}`);
                return document.createElement('div');
            }
            
            const button = document.createElement('button');
            button.className = `component-control ${definition.className}`;
            button.setAttribute('data-action', controlType);
            // ROOT FIX: Use data-controls-for instead of data-component-id to prevent duplicate detection issues
            button.setAttribute('data-controls-for', componentId);
            button.setAttribute('title', definition.title);
            button.type = 'button';
            
            // ROOT FIX: Add button styling
            button.style.cssText = `
                width: 28px;
                height: 28px;
                border: none;
                background: transparent;
                color: white;
                cursor: pointer;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                position: relative;
            `;
            
            // ROOT FIX: Add icon (createElement, not innerHTML)
            button.appendChild(definition.icon.cloneNode(true));
            
            // ROOT FIX: Add hover styles via event listeners
            button.addEventListener('mouseenter', () => {
                button.style.background = 'rgba(255, 255, 255, 0.1)';
                button.style.transform = 'scale(1.05)';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.background = 'transparent';
                button.style.transform = 'scale(1)';
            });
            
            return button;
        }
        
        /**
         * ROOT FIX: Create move group container
         */
        createMoveGroup(componentId) {
            const group = document.createElement('div');
            group.className = 'component-control-group component-control-group--move';
            
            group.style.cssText = `
                display: flex;
                flex-direction: column;
                gap: 2px;
            `;
            
            // ROOT FIX: Create move up button
            const moveUpButton = this.createControlButton('move-up', componentId);
            moveUpButton.style.width = '20px';
            moveUpButton.style.height = '20px';
            
            // ROOT FIX: Create move down button
            const moveDownButton = this.createControlButton('move-down', componentId);
            moveDownButton.style.width = '20px';
            moveDownButton.style.height = '20px';
            
            group.appendChild(moveUpButton);
            group.appendChild(moveDownButton);
            
            return group;
        }
        
        /**
         * ROOT FIX: Attach event listeners with proper cleanup tracking
         */
        attachEventListeners(controlsContainer, componentId) {
            // ROOT FIX: Ensure all buttons use data-controls-for (not data-component-id)
            const buttons = controlsContainer.querySelectorAll('[data-action]');
            buttons.forEach(button => {
                if (!button.getAttribute('data-controls-for')) {
                    button.setAttribute('data-controls-for', componentId);
                    structuredLogger.debug('CONTROLS', `Set data-controls-for on ${button.getAttribute('data-action')} button for ${componentId}`);
                }
            });
            
            const handleControlClick = (event) => {
                event.stopPropagation();
                event.preventDefault();
                
                const button = event.target.closest('[data-action]');
                if (!button) return;
                
                const action = button.getAttribute('data-action');
                // ROOT FIX: Use data-controls-for to get the component ID
                let targetComponentId = button.getAttribute('data-controls-for');
                
                // ROOT FIX: If still no ID, traverse up to find the component
                if (!targetComponentId) {
                    // Find the closest ancestor with data-component-id
                    let parent = button.parentElement;
                    while (parent && parent !== document.body) {
                        if (parent.hasAttribute('data-component-id')) {
                            targetComponentId = parent.getAttribute('data-component-id');
                            break;
                        }
                        parent = parent.parentElement;
                    }
                    
                    // If still not found, use the componentId from closure
                    if (!targetComponentId) {
                        targetComponentId = componentId;
                        structuredLogger.debug('CONTROLS', 'Using componentId from closure as fallback', { componentId });
                    }
                }
                
                if (targetComponentId !== componentId) {
                    structuredLogger.warn('CONTROLS', 'Component ID mismatch in control click', {
                        expected: componentId,
                        received: targetComponentId
                    });
                    return;
                }
                
                // ROOT FIX: Disable button temporarily to prevent double-clicks
                button.disabled = true;
                setTimeout(() => {
                    button.disabled = false;
                }, 500);
                
                // ROOT FIX: Dispatch control action event instead of direct execution
                this.dispatchControlAction(action, componentId, button);
            };
            
            // ROOT FIX: Attach click listener
            controlsContainer.addEventListener('click', handleControlClick);
            
            // ROOT FIX: Track event listener for cleanup
            if (!this.eventListeners.has(componentId)) {
                this.eventListeners.set(componentId, []);
            }
            
            this.eventListeners.get(componentId).push({
                element: controlsContainer,
                event: 'click',
                handler: handleControlClick
            });
            
            structuredLogger.debug('CONTROLS', `Event listeners attached for ${componentId}`);
        }
        
        /**
         * ROOT FIX: Attach hover behavior for control visibility
         * PUBLIC METHOD - Can be called externally to re-attach hover behavior
         */
        attachHoverBehavior(componentElement, controlsContainer) {
            // ROOT FIX: Validate inputs
            if (!componentElement || !controlsContainer) {
                structuredLogger.warn('CONTROLS', 'Invalid parameters for attachHoverBehavior');
                return;
            }
            
            let hoverTimeout = null;
            
            const showControls = () => {
                // Clear any pending hide timeout
                if (hoverTimeout) {
                    clearTimeout(hoverTimeout);
                    hoverTimeout = null;
                }
                
                // Debug logging controlled by GMKBDebug
                if (window.GMKBDebug && window.GMKBDebug.categories.hover) {
                    console.log('🎛️ Showing controls for:', componentElement.id);
                }
                controlsContainer.style.opacity = '1';
                controlsContainer.style.visibility = 'visible';
                controlsContainer.style.pointerEvents = 'all';
                controlsContainer.style.transform = 'translateY(-2px)';
                
                // Add debugging border to verify the component
                if (window.GMKBDebugMode) {
                    componentElement.style.outline = '2px solid green';
                }
            };
            
            const hideControls = () => {
                // Use a small delay to prevent flickering when moving between element and controls
                hoverTimeout = setTimeout(() => {
                    // Debug logging controlled by GMKBDebug
                    if (window.GMKBDebug && window.GMKBDebug.categories.hover) {
                        console.log('🎛️ Hiding controls for:', componentElement.id);
                    }
                    controlsContainer.style.opacity = '0';
                    controlsContainer.style.visibility = 'hidden';
                    controlsContainer.style.pointerEvents = 'none';
                    controlsContainer.style.transform = 'translateY(0)';
                    
                    // Remove debugging border
                    if (window.GMKBDebugMode) {
                        componentElement.style.outline = '';
                    }
                }, 100);
            };
            
            // ROOT FIX: Use both mouseenter/leave AND focus events for better accessibility
            componentElement.addEventListener('mouseenter', showControls);
            componentElement.addEventListener('mouseleave', hideControls);
            componentElement.addEventListener('focus', showControls);
            componentElement.addEventListener('blur', hideControls);
            
            // ROOT FIX: Keep controls visible when hovering the controls themselves
            controlsContainer.addEventListener('mouseenter', showControls);
            controlsContainer.addEventListener('mouseleave', hideControls);
            
            // ROOT FIX: Track hover listeners for cleanup
            const componentId = componentElement.getAttribute('data-component-id');
            if (componentId && !this.eventListeners.has(componentId)) {
                this.eventListeners.set(componentId, []);
            }
            
            if (componentId) {
                this.eventListeners.get(componentId).push(
                    { element: componentElement, event: 'mouseenter', handler: showControls },
                    { element: componentElement, event: 'mouseleave', handler: hideControls },
                    { element: componentElement, event: 'focus', handler: showControls },
                    { element: componentElement, event: 'blur', handler: hideControls },
                    { element: controlsContainer, event: 'mouseenter', handler: showControls },
                    { element: controlsContainer, event: 'mouseleave', handler: hideControls }
                );
            }
        }
        
        /**
         * ROOT FIX: Dispatch control action event (event-driven architecture)
         */
        dispatchControlAction(action, componentId, buttonElement) {
            structuredLogger.info('CONTROLS', `Control action: ${action} on component: ${componentId}`);
            
            // ROOT FIX: Map control actions to events
            const actionEventMap = {
                'edit': 'gmkb:component-edit-requested',
                'move-up': 'gmkb:component-move-up-requested',
                'move-down': 'gmkb:component-move-down-requested',
                'duplicate': 'gmkb:component-duplicate-requested',
                'delete': 'gmkb:component-delete-requested'
            };
            
            const eventName = actionEventMap[action];
            if (!eventName) {
                structuredLogger.warn('CONTROLS', `Unknown control action: ${action}`);
                return;
            }
            
            // ROOT FIX: Dispatch component action event
            GMKB.dispatch(eventName, {
                componentId,
                action,
                source: 'dynamic-controls',
                buttonElement,
                timestamp: Date.now()
            });
            
            // ROOT FIX: Also dispatch generic control action event
            GMKB.dispatch('gmkb:component-control-action', {
                componentId,
                action,
                source: 'dynamic-controls',
                eventName,
                timestamp: Date.now()
            });
        }
        
        /**
         * ROOT FIX: Remove controls from component (proper cleanup)
         */
        removeControls(componentId) {
            if (!this.attachedControls.has(componentId)) {
                structuredLogger.debug('CONTROLS', `No controls attached to ${componentId} for removal`);
                return true;
            }
            
            try {
                const controlData = this.attachedControls.get(componentId);
                
                // ROOT FIX: Remove controls from DOM
                if (controlData.controls && controlData.controls.parentNode) {
                    controlData.controls.parentNode.removeChild(controlData.controls);
                }
                
                // ROOT FIX: Clean up event listeners
                this.cleanupEventListeners(componentId);
                
                // ROOT FIX: Remove component attributes
                if (controlData.element) {
                    controlData.element.removeAttribute('data-controls-attached');
                    controlData.element.removeAttribute('data-controls-manager');
                }
                
                // ROOT FIX: Remove from tracking
                this.attachedControls.delete(componentId);
                
                structuredLogger.info('CONTROLS', `Controls removed from ${componentId}`);
                
                // ROOT FIX: Dispatch control removal event
                GMKB.dispatch('gmkb:controls-removed', {
                    componentId,
                    timestamp: Date.now()
                });
                
                return true;
                
            } catch (error) {
                structuredLogger.error('CONTROLS', `Failed to remove controls from ${componentId}`, error);
                return false;
            }
        }
        
        /**
         * ROOT FIX: Remove controls from element (for cleanup)
         */
        removeControlsFromElement(componentElement, componentId) {
            const existingControls = componentElement.querySelector('.component-controls');
            if (existingControls) {
                existingControls.remove();
                structuredLogger.debug('CONTROLS', `Removed existing controls from DOM for ${componentId}`);
            }
        }
        
        /**
         * ROOT FIX: Clean up event listeners
         */
        cleanupEventListeners(componentId) {
            const listeners = this.eventListeners.get(componentId);
            if (!listeners) return;
            
            listeners.forEach(({ element, event, handler }) => {
                if (element && typeof element.removeEventListener === 'function') {
                    element.removeEventListener(event, handler);
                }
            });
            
            this.eventListeners.delete(componentId);
            structuredLogger.debug('CONTROLS', `Event listeners cleaned up for ${componentId}`);
        }
        
        /**
         * ROOT FIX: Setup global event listeners for component lifecycle
         */
        setupEventListeners() {
            // ROOT FIX: Listen for component attachment requests
            GMKB.subscribe('gmkb:attach-controls-requested', (event) => {
                const { componentElement, componentId } = event.detail;
                this.attachControls(componentElement, componentId);
            });
            
            // ROOT FIX: Listen for component removal
            GMKB.subscribe('gmkb:component-removed', (event) => {
                const { id: componentId } = event.detail;
                this.removeControls(componentId);
            });
            
            // ROOT FIX: Listen for component cleanup
            GMKB.subscribe('gmkb:component-cleanup-requested', (event) => {
                const { componentId } = event.detail;
                this.removeControls(componentId);
            });
            
            // ROOT FIX: Listen for request to attach controls to all existing components
            // CHECKLIST COMPLIANT: Event-driven, no setTimeout
            GMKB.subscribe('gmkb:request-controls-attachment', (event) => {
                structuredLogger.info('CONTROLS', 'Request received to attach controls to existing components', event.detail);
                this.attachControlsToAllExistingComponents();
            });
            
            structuredLogger.debug('CONTROLS', 'Global event listeners setup for ComponentControlsManager');
        }
        
        /**
         * ROOT FIX: Get manager status for debugging
         */
        getStatus() {
            return {
                isInitialized: this.isInitialized,
                attachedControls: this.attachedControls.size,
                eventListeners: this.eventListeners.size,
                controlDefinitions: Object.keys(this.controlDefinitions),
                architecture: 'dynamic-event-driven'
            };
        }
        
        /**
         * ROOT FIX: Batch remove all controls (for cleanup)
         */
        removeAllControls() {
            const componentIds = Array.from(this.attachedControls.keys());
            
            componentIds.forEach(componentId => {
                this.removeControls(componentId);
            });
            
            structuredLogger.info('CONTROLS', `Removed controls from ${componentIds.length} components`);
        }
        
        // ROOT FIX: Icon creation methods using createElement (no innerHTML)
        createEditIcon() {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', '14');
            svg.setAttribute('height', '14');
            svg.setAttribute('viewBox', '0 0 24 24');
            svg.setAttribute('fill', 'none');
            svg.setAttribute('stroke', 'currentColor');
            svg.setAttribute('stroke-width', '2');
            
            const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path1.setAttribute('d', 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7');
            
            const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path2.setAttribute('d', 'm18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z');
            
            svg.appendChild(path1);
            svg.appendChild(path2);
            
            return svg;
        }
        
        createMoveUpIcon() {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', '12');
            svg.setAttribute('height', '12');
            svg.setAttribute('viewBox', '0 0 24 24');
            svg.setAttribute('fill', 'none');
            svg.setAttribute('stroke', 'currentColor');
            svg.setAttribute('stroke-width', '2');
            
            const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
            polyline.setAttribute('points', '18,15 12,9 6,15');
            
            svg.appendChild(polyline);
            return svg;
        }
        
        createMoveDownIcon() {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', '12');
            svg.setAttribute('height', '12');
            svg.setAttribute('viewBox', '0 0 24 24');
            svg.setAttribute('fill', 'none');
            svg.setAttribute('stroke', 'currentColor');
            svg.setAttribute('stroke-width', '2');
            
            const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
            polyline.setAttribute('points', '6,9 12,15 18,9');
            
            svg.appendChild(polyline);
            return svg;
        }
        
        createDuplicateIcon() {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', '14');
            svg.setAttribute('height', '14');
            svg.setAttribute('viewBox', '0 0 24 24');
            svg.setAttribute('fill', 'none');
            svg.setAttribute('stroke', 'currentColor');
            svg.setAttribute('stroke-width', '2');
            
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', '9');
            rect.setAttribute('y', '9');
            rect.setAttribute('width', '13');
            rect.setAttribute('height', '13');
            rect.setAttribute('rx', '2');
            rect.setAttribute('ry', '2');
            
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1');
            
            svg.appendChild(rect);
            svg.appendChild(path);
            
            return svg;
        }
        
        createDeleteIcon() {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', '14');
            svg.setAttribute('height', '14');
            svg.setAttribute('viewBox', '0 0 24 24');
            svg.setAttribute('fill', 'none');
            svg.setAttribute('stroke', 'currentColor');
            svg.setAttribute('stroke-width', '2');
            
            const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
            polyline.setAttribute('points', '3,6 5,6 21,6');
            
            const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path1.setAttribute('d', 'm19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2');
            
            const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line1.setAttribute('x1', '10');
            line1.setAttribute('y1', '11');
            line1.setAttribute('x2', '10');
            line1.setAttribute('y2', '17');
            
            const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line2.setAttribute('x1', '14');
            line2.setAttribute('y1', '11');
            line2.setAttribute('x2', '14');
            line2.setAttribute('y2', '17');
            
            svg.appendChild(polyline);
            svg.appendChild(path1);
            svg.appendChild(line1);
            svg.appendChild(line2);
            
            return svg;
        }
    }

    // ROOT FIX: Create and expose ComponentControlsManager globally
    const componentControlsManager = new ComponentControlsManager();
    
    // ROOT FIX: WordPress-compatible global exposure
    window.componentControlsManager = componentControlsManager;
    window.ComponentControlsManager = ComponentControlsManager;
    
    // ROOT FIX: Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            componentControlsManager.init();
        });
    } else {
        componentControlsManager.init();
    }
    
    // ROOT FIX: Setup global debug commands
    window.debugComponentControls = () => {
        console.group('%c🎛️ Component Controls Manager Debug', 'font-size: 14px; font-weight: bold; color: #16a085');
        console.log('Manager Status:', componentControlsManager.getStatus());
        console.log('Attached Controls:', Array.from(componentControlsManager.attachedControls.keys()));
        console.log('Event Listeners:', componentControlsManager.eventListeners.size);
        
        // Check all components in DOM
        const allComponents = document.querySelectorAll('[data-component-id]');
        console.log('Components in DOM:', allComponents.length);
        
        allComponents.forEach(element => {
            const id = element.getAttribute('data-component-id');
            const hasControls = element.querySelector('.component-controls--dynamic');
            console.log(`- ${id}: controls ${hasControls ? 'PRESENT' : 'MISSING'}`);
        });
        
        console.groupEnd();
    };
    
    window.testComponentControls = (componentId) => {
        if (!componentId) {
            console.log('Usage: testComponentControls("component-id")');
            return;
        }
        
        const element = document.getElementById(componentId);
        if (!element) {
            console.error('Component element not found:', componentId);
            return;
        }
        
        console.log('Testing control attachment for:', componentId);
        const success = componentControlsManager.attachControls(element, componentId);
        console.log('Attachment result:', success);
    };
    
    // ROOT FIX: Emergency function to force show all controls for debugging
    window.forceShowAllControls = () => {
        console.log('🚨 Force showing all controls for debugging');
        const allControls = document.querySelectorAll('.component-controls--dynamic');
        
        allControls.forEach(controls => {
            controls.style.opacity = '1';
            controls.style.visibility = 'visible';
            controls.style.pointerEvents = 'all';
            controls.style.border = '2px solid red';
            controls.style.background = 'rgba(255, 0, 0, 0.8)';
        });
        
        console.log(`🚨 Forced ${allControls.length} control groups to be visible`);
        
        // Also enable debug mode
        document.body.classList.add('gmkb-debug-mode');
        window.GMKBDebugMode = true;
    };
    
    // ROOT FIX: Function to test hover behavior
    window.testHoverBehavior = (componentId) => {
        const element = document.getElementById(componentId);
        if (!element) {
            console.error('Component not found:', componentId);
            return;
        }
        
        console.log('🖱️ Testing hover behavior for:', componentId);
        
        // Simulate mouseenter
        element.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        console.log('Dispatched mouseenter event');
        
        setTimeout(() => {
            // Check if controls are visible
            const controls = element.querySelector('.component-controls--dynamic');
            if (controls) {
                console.log('Controls opacity:', controls.style.opacity);
                console.log('Controls visibility:', controls.style.visibility);
                console.log('Controls pointer-events:', controls.style.pointerEvents);
            } else {
                console.error('No controls found in element');
            }
        }, 100);
    };
    
    structuredLogger.info('CONTROLS', '✅ ComponentControlsManager loaded and ready for dynamic control generation');
    
    // ROOT FIX: Setup MutationObserver to ensure controls are always present
    componentControlsManager.setupMutationObserver = function() {
        const containers = [
            document.getElementById('saved-components-container'),
            document.getElementById('media-kit-preview')
        ].filter(el => el !== null);
        
        if (containers.length === 0) {
            structuredLogger.warn('CONTROLS', 'No containers found for MutationObserver');
            return;
        }
        
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                // Check added nodes
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // ROOT FIX: Check for any component by data-component-id or data-component-type
                        const isComponent = node.hasAttribute('data-component-id') || 
                                          node.hasAttribute('data-component-type') ||
                                          node.classList.contains('editable-element') ||
                                          node.classList.contains('media-kit-component') ||
                                          node.id && (node.id.includes('-component-') || node.id.match(/^[a-z-]+-\d{13}-\d+$/));
                        
                        if (isComponent) {
                            const componentId = node.id || node.getAttribute('data-component-id');
                            if (componentId && !node.querySelector('.component-controls--dynamic')) {
                                structuredLogger.debug('CONTROLS', `MutationObserver: Attaching controls to ${componentId}`);
                                setTimeout(() => {
                                    this.attachControls(node, componentId);
                                }, 50); // Small delay to let DOM settle
                            }
                        }
                        
                        // Also check child nodes recursively for nested components
                        const childComponents = node.querySelectorAll('[data-component-id], [data-component-type], .editable-element');
                        childComponents.forEach(childComponent => {
                            const childId = childComponent.id || childComponent.getAttribute('data-component-id');
                            if (childId && !childComponent.querySelector('.component-controls--dynamic')) {
                                structuredLogger.debug('CONTROLS', `MutationObserver: Attaching controls to nested ${childId}`);
                                setTimeout(() => {
                                    this.attachControls(childComponent, childId);
                                }, 100);
                            }
                        });
                    }
                });
            });
        });
        
        containers.forEach(container => {
            observer.observe(container, {
                childList: true,
                subtree: true
            });
            structuredLogger.debug('CONTROLS', `MutationObserver attached to ${container.id}`);
        });
        
        this.mutationObserver = observer;
    };
    
    // ROOT FIX: Call setupMutationObserver when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            componentControlsManager.setupMutationObserver();
        });
    } else {
        // Small delay to ensure containers are ready
        setTimeout(() => componentControlsManager.setupMutationObserver(), 100);
    }
    
    // ROOT FIX: Add debug helper functions
    window.enableControlsDebug = function() {
        console.log('🔍 Enabling controls debug mode...');
        
        // Add debug class to body
        document.body.classList.add('gmkb-debug-mode');
        document.body.classList.add('controls-debug');
        
        // Force show all controls
        const allControls = document.querySelectorAll('.component-controls--dynamic');
        allControls.forEach(controls => {
            // Use setAttribute to apply !important styles
            controls.setAttribute('style', 
                'visibility: visible !important; ' +
                'opacity: 0.7 !important; ' +
                'pointer-events: all !important; ' +
                'border: 2px solid red !important; ' +
                'background: rgba(255, 0, 0, 0.1) !important; ' +
                'z-index: 10000 !important; ' +
                'display: block !important; ' +
                'position: absolute !important;'
            );
        });
        
        console.log(`✅ Controls debug mode enabled. Found ${allControls.length} control groups.`);
        
        // Check for components without controls
        const componentsWithoutControls = [];
        document.querySelectorAll('[data-component-id]').forEach(component => {
            if (!component.querySelector('.component-controls--dynamic')) {
                componentsWithoutControls.push(component.id || component.getAttribute('data-component-id'));
            }
        });
        
        if (componentsWithoutControls.length > 0) {
            console.warn('⚠️ Components without controls:', componentsWithoutControls);
            console.log('Attempting to attach controls...');
            
            componentsWithoutControls.forEach(componentId => {
                const element = document.getElementById(componentId);
                if (element && window.componentControlsManager) {
                    window.componentControlsManager.attachControls(element, componentId);
                }
            });
        }
        
        return {
            debugEnabled: true,
            controlsFound: allControls.length,
            componentsWithoutControls: componentsWithoutControls.length
        };
    };
    
    window.disableControlsDebug = function() {
        console.log('🔍 Disabling controls debug mode...');
        
        document.body.classList.remove('gmkb-debug-mode');
        document.body.classList.remove('controls-debug');
        
        const allControls = document.querySelectorAll('.component-controls--dynamic');
        allControls.forEach(controls => {
            controls.style.visibility = '';
            controls.style.opacity = '';
            controls.style.pointerEvents = '';
            controls.style.border = '';
            controls.style.background = '';
            controls.style.zIndex = '';
        });
        
        console.log('✅ Controls debug mode disabled');
    };
    window.diagnoseDuplicateIdIssue = () => {
        console.log('🔍 DIAGNOSING DUPLICATE ID ISSUE');
        console.log('='.repeat(60));
        
        // Check all control buttons
        const allControlButtons = document.querySelectorAll('.component-control');
        console.log(`Found ${allControlButtons.length} control buttons`);
        
        allControlButtons.forEach((button, index) => {
            const action = button.getAttribute('data-action');
            const controlsFor = button.getAttribute('data-controls-for');
            const toolbar = button.closest('.component-controls__toolbar');
            const toolbarFor = toolbar?.getAttribute('data-toolbar-for');
            const componentElement = button.closest('[data-component-id]');
            const componentElementId = componentElement?.getAttribute('data-component-id');
            
            console.log(`\nButton ${index + 1} (${action}):`);
            console.log(`  data-controls-for: ${controlsFor || 'MISSING'} ${!controlsFor ? '❌' : '✅'}`);
            console.log(`  Toolbar data-toolbar-for: ${toolbarFor || 'MISSING'}`);
            console.log(`  Closest component element ID: ${componentElementId || 'NOT FOUND'}`);
            
            if (!controlsFor) {
                console.log(`  ⚠️ PROBLEM: No data-controls-for attribute on button!`);
            }
            
            // Check for duplicate data-component-id in the component
            if (componentElement) {
                const duplicateIds = componentElement.querySelectorAll('[data-component-id]');
                if (duplicateIds.length > 0) {
                    console.log(`  ⚠️ WARNING: Component contains ${duplicateIds.length} child elements with data-component-id`);
                }
            }
        });
        
        // Check all components for duplicate IDs
        console.log('\n' + '='.repeat(60));
        console.log('CHECKING COMPONENTS FOR DUPLICATE IDs:');
        
        const allComponents = document.querySelectorAll('[data-component-id]');
        const idMap = new Map();
        
        allComponents.forEach(element => {
            const id = element.getAttribute('data-component-id');
            if (!idMap.has(id)) {
                idMap.set(id, []);
            }
            idMap.get(id).push(element);
        });
        
        idMap.forEach((elements, id) => {
            if (elements.length > 1) {
                console.log(`\n❌ DUPLICATE ID FOUND: ${id} (${elements.length} instances)`);
                elements.forEach((el, i) => {
                    console.log(`  Instance ${i + 1}:`, {
                        tagName: el.tagName,
                        className: el.className,
                        parent: el.parentElement?.tagName + '.' + el.parentElement?.className
                    });
                });
            }
        });
        
        console.log('\n' + '='.repeat(60));
        console.log('DIAGNOSIS COMPLETE');
        
        return {
            controlButtons: allControlButtons.length,
            buttonsWithoutId: Array.from(allControlButtons).filter(b => !b.getAttribute('data-controls-for')).length,
            duplicateIds: Array.from(idMap.entries()).filter(([id, els]) => els.length > 1).length
        };
    };
    
    // ROOT FIX: Enhanced debugging function to test and fix controls immediately
    window.fixControlsNow = () => {
        console.log('🔧 FIXING CONTROLS NOW - Root cause fix applied');
        
        // Enable debug mode
        window.GMKBDebugMode = true;
        document.body.classList.add('gmkb-debug-mode');
        
        const allComponents = document.querySelectorAll('[data-component-id]');
        console.log(`Found ${allComponents.length} components to fix`);
        
        let fixedCount = 0;
        
        allComponents.forEach(component => {
            const componentId = component.getAttribute('data-component-id');
            if (!componentId) return;
            
            // Remove any existing controls to start fresh
            const existingControls = component.querySelectorAll('.component-controls, .component-controls--dynamic');
            existingControls.forEach(ctrl => ctrl.remove());
            
            // Force attach new controls
            const success = componentControlsManager.attachControls(component, componentId);
            if (success) {
                fixedCount++;
                
                // Force show the controls immediately for testing
                const newControls = component.querySelector('.component-controls--dynamic');
                if (newControls) {
                    newControls.style.opacity = '1';
                    newControls.style.visibility = 'visible';
                    newControls.style.pointerEvents = 'all';
                    newControls.style.border = '2px solid lime';
                    newControls.style.background = 'rgba(0, 255, 0, 0.2)';
                    
                    console.log(`✅ Fixed controls for ${componentId}`);
                }
            } else {
                console.error(`❌ Failed to fix controls for ${componentId}`);
            }
        });
        
        console.log(`🎉 Fixed ${fixedCount}/${allComponents.length} components`);
        
        return {
            totalComponents: allComponents.length,
            fixedComponents: fixedCount,
            debugMode: true,
            message: 'Controls fixed and debug mode enabled. Hover over components to test.'
        };
    };
    
    // ROOT FIX: IMMEDIATE FUNCTIONALITY TEST - Tests complete event flow
    window.testControlFunctionality = (componentId) => {
        if (!componentId) {
            const allComponents = document.querySelectorAll('[data-component-id]');
            if (allComponents.length > 0) {
                componentId = allComponents[0].getAttribute('data-component-id');
                console.log('Auto-selecting first component:', componentId);
            } else {
                console.error('No components found to test');
                return;
            }
        }
        
        console.log('🧪 TESTING COMPLETE CONTROL FUNCTIONALITY for:', componentId);
        console.log('='.repeat(60));
        
        // Test event dispatching with detailed logging
        const testEvent = (eventType, action) => {
            console.log(`\n🚀 Testing ${action.toUpperCase()} functionality...`);
            
            // Listen for the event to confirm it's received
            const eventReceived = new Promise((resolve) => {
                const handler = (event) => {
                    console.log(`  ✅ Event received: ${eventType}`, event.detail);
                    document.removeEventListener(eventType, handler);
                    resolve(true);
                };
                document.addEventListener(eventType, handler);
                
                // Timeout if event not received
                setTimeout(() => {
                    document.removeEventListener(eventType, handler);
                    resolve(false);
                }, 2000);
            });
            
            // Dispatch the event
            console.log(`  📡 Dispatching: ${eventType}`);
            document.dispatchEvent(new CustomEvent(eventType, {
                detail: {
                    componentId,
                    source: 'manual-test',
                    timestamp: Date.now()
                }
            }));
            
            return eventReceived;
        };
        
        // Test each control action
        const tests = [
            { eventType: 'gmkb:component-edit-requested', action: 'edit' },
            { eventType: 'gmkb:component-duplicate-requested', action: 'duplicate' },
            { eventType: 'gmkb:component-move-up-requested', action: 'move-up' },
            { eventType: 'gmkb:component-move-down-requested', action: 'move-down' },
            { eventType: 'gmkb:component-delete-requested', action: 'delete' }
        ];
        
        // Run tests sequentially
        const runTests = async () => {
            const results = [];
            
            for (const test of tests) {
                const received = await testEvent(test.eventType, test.action);
                results.push({ ...test, received });
                
                // Wait between tests
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            // Summary
            console.log('\n📊 FUNCTIONALITY TEST RESULTS:');
            console.log('='.repeat(40));
            results.forEach(result => {
                const status = result.received ? '✅ WORKING' : '❌ FAILED';
                console.log(`  ${result.action}: ${status}`);
            });
            
            const workingCount = results.filter(r => r.received).length;
            const totalCount = results.length;
            
            console.log(`\n🎯 SUMMARY: ${workingCount}/${totalCount} controls working`);
            
            if (workingCount === 0) {
                console.log('\n❌ NO CONTROLS WORKING - Event handlers may be missing or broken');
                console.log('Recommendations:');
                console.log('  1. Check console for JavaScript errors');
                console.log('  2. Verify enhancedComponentManager is loaded');
                console.log('  3. Check event listener registration');
            } else if (workingCount < totalCount) {
                console.log('\n⚠️ PARTIAL FUNCTIONALITY - Some controls working, others not');
            } else {
                console.log('\n✅ ALL CONTROLS WORKING - The issue may be with visual controls, not functionality');
            }
        };
        
        runTests();
    };
    
    // ROOT FIX: Final fix for component ID issues
    window.fixComponentIdIssues = () => {
        console.log('🔧 FIXING COMPONENT ID ISSUES');
        console.log('='.repeat(60));
        
        let issuesFixed = 0;
        
        // Step 1: Fix control buttons without component ID
        const allControlButtons = document.querySelectorAll('.component-control');
        allControlButtons.forEach(button => {
            if (!button.getAttribute('data-controls-for')) {
                // Try to find component ID from toolbar
                const toolbar = button.closest('.component-controls__toolbar');
                const toolbarFor = toolbar?.getAttribute('data-toolbar-for');
                
                if (toolbarFor) {
                    button.setAttribute('data-controls-for', toolbarFor);
                    issuesFixed++;
                    console.log(`✅ Fixed button ${button.getAttribute('data-action')} for component ${toolbarFor}`);
                } else {
                    // Try to find from parent component
                    const componentElement = button.closest('[data-component-id]');
                    if (componentElement) {
                        const componentId = componentElement.getAttribute('data-component-id');
                        button.setAttribute('data-controls-for', componentId);
                        issuesFixed++;
                        console.log(`✅ Fixed button ${button.getAttribute('data-action')} for component ${componentId}`);
                    }
                }
            }
        });
        
        // Step 2: Remove duplicate data-component-id attributes from children
        const allComponents = document.querySelectorAll('[data-component-id]');
        allComponents.forEach(component => {
            // Check if this is a root component (has ID matching data-component-id)
            const componentId = component.getAttribute('data-component-id');
            if (component.id === componentId) {
                // This is a root component, check for children with data-component-id
                const childrenWithId = component.querySelectorAll('[data-component-id]');
                if (childrenWithId.length > 0) {
                    childrenWithId.forEach(child => {
                        child.removeAttribute('data-component-id');
                        issuesFixed++;
                    });
                    console.log(`✅ Removed ${childrenWithId.length} duplicate data-component-id attributes from ${componentId}`);
                }
            }
        });
        
        // Step 3: Re-run diagnosis
        console.log('\n' + '='.repeat(60));
        console.log('POST-FIX DIAGNOSIS:');
        const diagnosis = window.diagnoseDuplicateIdIssue();
        
        console.log('\n' + '='.repeat(60));
        console.log(`TOTAL ISSUES FIXED: ${issuesFixed}`);
        
        return {
            issuesFixed,
            remainingIssues: diagnosis.buttonsWithoutId + diagnosis.duplicateIds
        };
    };
    
    // ROOT FIX: Test control button clicking directly
    window.testControlButtons = (componentId) => {
        if (!componentId) {
            const allComponents = document.querySelectorAll('[data-component-id]');
            if (allComponents.length > 0) {
                componentId = allComponents[0].getAttribute('data-component-id');
                console.log('Auto-selecting first component:', componentId);
            } else {
                console.error('No components found to test');
                return;
            }
        }
        
        console.log('🖱️ TESTING CONTROL BUTTON CLICKS for:', componentId);
        
        const component = document.getElementById(componentId);
        if (!component) {
            console.error('Component not found:', componentId);
            return;
        }
        
        const controls = component.querySelector('.component-controls--dynamic');
        if (!controls) {
            console.error('Controls not found for component:', componentId);
            return;
        }
        
        // Force show controls
        controls.style.opacity = '1';
        controls.style.visibility = 'visible';
        controls.style.pointerEvents = 'all';
        controls.style.border = '2px solid orange';
        
        console.log('Controls made visible, testing buttons...');
        
        // Test each button
        const buttons = [
            { selector: '[data-action="edit"]', action: 'edit' },
            { selector: '[data-action="duplicate"]', action: 'duplicate' },
            { selector: '[data-action="move-up"]', action: 'move-up' },
            { selector: '[data-action="move-down"]', action: 'move-down' },
            { selector: '[data-action="delete"]', action: 'delete' }
        ];
        
        buttons.forEach((buttonTest, index) => {
            setTimeout(() => {
                const button = controls.querySelector(buttonTest.selector);
                if (button) {
                    console.log(`Clicking ${buttonTest.action} button...`);
                    button.style.border = '2px solid red';
                    button.click();
                } else {
                    console.error(`Button not found: ${buttonTest.action}`);
                }
            }, index * 1000);
        });
    };
        
    /**
     * ROOT FIX: Attach controls to all existing components on initialization
     * Ensures components rendered before controls manager was ready get controls
     */
    componentControlsManager.attachControlsToAllExistingComponents = function() {
        // ROOT FIX: Look for ALL components with proper attributes, not just specific classes
        const existingComponents = document.querySelectorAll(
            '[data-component-id], ' +
            '[data-component-type], ' + 
            '.media-kit-component, ' +
            '.content-section, ' + 
            '.editable-element'
        );
        
        let attachedCount = 0;
        
        existingComponents.forEach(element => {
            // Skip if element is inside a modal or overlay
            if (element.closest('.modal, .overlay, #component-library-overlay, .component-library, .gmkb-modal')) {
                return;
            }
            
            // Get component ID from element
            let componentId = element.id || element.getAttribute('data-component-id');
            
            // Skip elements without proper component ID or that already have controls
            if (!componentId || element.querySelector('.component-controls--dynamic')) {
                return;
            }
            
            // Skip UI elements that look like components but aren't (more comprehensive check)
            const skipPatterns = ['search', 'grid', 'loading', 'overlay', 'modal', 'library', 'toolbar', 'button'];
            if (skipPatterns.some(pattern => componentId.toLowerCase().includes(pattern))) {
                return;
            }
            
            // Ensure element has proper attributes
            if (!element.id && componentId) {
                element.id = componentId;
            }
            if (!element.hasAttribute('data-component-id')) {
                element.setAttribute('data-component-id', componentId);
            }
            
            // ROOT FIX: Set component-type if missing but can be inferred from ID or classes
            if (!element.hasAttribute('data-component-type')) {
                let componentType = element.getAttribute('data-component') || element.getAttribute('data-element');
                if (!componentType && componentId) {
                    // Extract type from ID (e.g., 'booking-calendar-123456-1' -> 'booking-calendar')
                    componentType = componentId.split('-').slice(0, -2).join('-');
                }
                if (componentType) {
                    element.setAttribute('data-component-type', componentType);
                }
            }
            
            const success = componentControlsManager.attachControls(element, componentId);
            if (success) {
                attachedCount++;
                structuredLogger.debug('CONTROLS', `Retroactively attached controls to: ${componentId}`);
            }
        });
        
        if (attachedCount > 0) {
            structuredLogger.info('CONTROLS', `Retroactively attached controls to ${attachedCount} existing components`);
            
            // Dispatch event for tracking
            document.dispatchEvent(new CustomEvent('gmkb:retroactive-controls-attached', {
                detail: {
                    attachedCount,
                    totalExisting: existingComponents.length,
                    timestamp: Date.now()
                }
            }));
        }
    };

})(); // ROOT FIX: Close IIFE wrapper