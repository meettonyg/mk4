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
        
        // ROOT FIX: Attach controls to any existing components immediately
        setTimeout(() => {
            if (window.componentControlsManager && window.componentControlsManager.attachControlsToAllExistingComponents) {
                window.componentControlsManager.attachControlsToAllExistingComponents();
            }
        }, 100);
        
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
                moveUp: {
                    title: 'Move Up',
                    icon: this.createMoveUpIcon(),
                    className: 'component-control--move-up',
                    position: 'group'
                },
                moveDown: {
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

            // ROOT FIX: SINGLE-INSTANCE ENFORCEMENT - Ensure only ONE element with this ID exists
            const allElementsWithId = document.querySelectorAll(`[data-component-id="${componentId}"]`);
            const elementsById = document.querySelectorAll(`#${componentId}`);
            
            if (allElementsWithId.length > 1 || elementsById.length > 1) {
                structuredLogger.error('CONTROLS', `CRITICAL: Found ${allElementsWithId.length} elements with data-component-id=${componentId} and ${elementsById.length} with id=${componentId}!`);
                
                // ROOT FIX: Remove ALL duplicates except the first one
                for (let i = 1; i < allElementsWithId.length; i++) {
                    allElementsWithId[i].remove();
                    structuredLogger.warn('CONTROLS', `Removed duplicate element ${i} for ${componentId}`);
                }
                
                for (let i = 1; i < elementsById.length; i++) {
                    elementsById[i].remove();
                    structuredLogger.warn('CONTROLS', `Removed duplicate element by ID ${i} for ${componentId}`);
                }
                
                // Use the first element that still exists
                componentElement = allElementsWithId[0] || document.getElementById(componentId);
                
                if (!componentElement) {
                    structuredLogger.error('CONTROLS', `No valid element found after deduplication for ${componentId}`);
                    return false;
                }
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
            
            // Remove ALL control containers (any class variation)
            const allExistingControls = componentElement.querySelectorAll('.component-controls, .component-controls--dynamic, .emergency-controls');
            allExistingControls.forEach(controlElement => {
                controlElement.remove();
                structuredLogger.debug('CONTROLS', `Aggressively removed existing control element for ${componentId}`);
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
            container.style.cssText = `
                position: absolute;
                top: 8px;
                right: 8px;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.2s ease, visibility 0.2s ease, transform 0.2s ease;
                z-index: 1000;
                pointer-events: none;
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
            button.setAttribute('data-component-id', componentId);
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
            const moveUpButton = this.createControlButton('moveUp', componentId);
            moveUpButton.style.width = '20px';
            moveUpButton.style.height = '20px';
            
            // ROOT FIX: Create move down button
            const moveDownButton = this.createControlButton('moveDown', componentId);
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
            const handleControlClick = (event) => {
                event.stopPropagation();
                event.preventDefault();
                
                const button = event.target.closest('[data-action]');
                if (!button) return;
                
                const action = button.getAttribute('data-action');
                const targetComponentId = button.getAttribute('data-component-id');
                
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
         */
        attachHoverBehavior(componentElement, controlsContainer) {
            let hoverTimeout = null;
            
            const showControls = () => {
                // Clear any pending hide timeout
                if (hoverTimeout) {
                    clearTimeout(hoverTimeout);
                    hoverTimeout = null;
                }
                
                console.log('🎛️ Showing controls for:', componentElement.id);
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
                    console.log('🎛️ Hiding controls for:', componentElement.id);
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
                'moveUp': 'gmkb:component-move-up-requested',
                'moveDown': 'gmkb:component-move-down-requested',
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
            { selector: '[data-action="moveUp"]', action: 'moveUp' },
            { selector: '[data-action="moveDown"]', action: 'moveDown' },
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
        const existingComponents = document.querySelectorAll('[data-component-id]');
        let attachedCount = 0;
        
        existingComponents.forEach(element => {
            const componentId = element.getAttribute('data-component-id');
            if (componentId && !element.querySelector('.component-controls--dynamic')) {
                const success = componentControlsManager.attachControls(element, componentId);
                if (success) {
                    attachedCount++;
                    structuredLogger.debug('CONTROLS', `Retroactively attached controls to: ${componentId}`);
                }
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