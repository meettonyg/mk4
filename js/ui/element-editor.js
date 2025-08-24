/**
 * @file element-editor.js
 * @description Manages inline editing of component properties directly in the preview.
 * Also handles element selection and connection to the design panel.
 *
 * ROOT FIX: Converted to use global objects instead of ES6 imports
 * GEMINI FIX: Added element selection functionality and design panel integration.
 */

// ROOT FIX: Use global objects instead of ES6 imports
// state will be available via window.enhancedStateManager
// debounce will be available via window.debounce or window.GMKBHelpers.debounce
// designPanel will be available via window.designPanel

(function() {
    'use strict';
    
    // Global variable to track selected element
    let selectedElement = null;

    /**
     * Selects an element for editing.
     * GEMINI FIX: This function provides the missing connection between element selection and design panel.
     * ROOT FIX: Removed legacy control creation - now handled by component-controls-manager.js
     * @param {HTMLElement} element - The element to select.
     */
    function selectElement(element) {
        if (selectedElement) {
            selectedElement.classList.remove('selected');
        }

        selectedElement = element;
        if (selectedElement) {
            selectedElement.classList.add('selected');
            
            // ROOT FIX: Don't create legacy controls - component-controls-manager handles this
            // The modern control system will show controls on hover

            // GEMINI FIX: Load the design panel for the selected component.
            const componentId = selectedElement.getAttribute('data-component-id');
            if (componentId) {
                if (window.designPanel && typeof window.designPanel.load === 'function') {
                    window.designPanel.load(componentId);
                    console.log(`🎯 Component selected: ${componentId} - Design panel should open`);
                } else {
                    console.warn('⚠️ Design panel not available');
                }
            } else {
                console.warn('⚠️ Selected element has no data-component-id attribute');
            }
        } else {
            // If nothing is selected, hide the panel
            if (window.designPanel && typeof window.designPanel.hide === 'function') {
                window.designPanel.hide();
            }
        }
    }

    /**
     * ROOT FIX: Deprecated - Controls are now handled by component-controls-manager.js
     * @deprecated Use component-controls-manager instead
     * @returns {HTMLElement} Empty div for backward compatibility
     */
    function createControls() {
        console.warn('⚠️ createControls() is deprecated. Controls are now handled by component-controls-manager.js');
        const controls = document.createElement('div');
        controls.className = 'legacy-element-controls-disabled';
        controls.style.display = 'none';
        return controls;
    }

    class ElementEditor {
        constructor() {
            this.previewContainer = document.getElementById('media-kit-preview');
            this.isEditing = false;
            this.boundHandleBlur = null;

            this.init();
        }

        init() {
            // ROOT FIX: Get debounce function from global scope
            const debounce = window.debounce || window.GMKBHelpers?.debounce || function(func, wait) {
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
            
            // Handle inline editing
            this.previewContainer.addEventListener('input', debounce(e => {
                if (e.target.isContentEditable) {
                    this.handleInput(e);
                }
            }, 300));
            
            // GEMINI FIX: Handle element selection clicks
            this.previewContainer.addEventListener('click', (e) => {
                // Only handle clicks that are not on control buttons
                if (e.target.closest('.control-btn')) {
                    return; // Let element-controls.js handle this
                }
                
                // Find the clicked component
                const componentElement = e.target.closest('[data-component-id]');
                if (componentElement) {
                    e.stopPropagation();
                    selectElement(componentElement);
                } else {
                    // Clicked on empty area, deselect
                    selectElement(null);
                }
            });
            
            console.log('🎯 Element editor initialized with selection handling');
        }

        handleInput(e) {
            const element = e.target;
            const componentElement = element.closest('[data-component-id]');
            if (!componentElement) return;

            const componentId = componentElement.dataset.componentId;
            const propName = element.dataset.prop;

            if (componentId && propName) {
                const newProps = {};
                newProps[propName] = element.innerHTML; // Use innerHTML to preserve formatting
                
                // ROOT FIX: Use enhanced state manager's updateComponent method
                if (window.enhancedStateManager && typeof window.enhancedStateManager.updateComponent === 'function') {
                    window.enhancedStateManager.updateComponent(componentId, newProps);
                } else if (window.state && typeof window.state.updateComponent === 'function') {
                    window.state.updateComponent(componentId, newProps);
                } else {
                    console.warn('No state manager available for component update');
                }
            }
        }
    }

    /**
     * Gets the currently selected element
     * @returns {HTMLElement|null} The selected element
     */
    function getSelectedElement() {
        return selectedElement;
    }

    /**
     * Deselects the currently selected element
     */
    function deselectElement() {
        selectElement(null);
    }

    // ROOT FIX: Create and expose element editor globally
    const elementEditor = new ElementEditor();
    
    // ROOT FIX: Expose functions globally for other modules to use
    window.elementEditor = elementEditor;
    window.selectElement = selectElement;
    window.getSelectedElement = getSelectedElement;
    window.deselectElement = deselectElement;
    
    console.log('✅ Element Editor: Available globally and ready');
    
})();
