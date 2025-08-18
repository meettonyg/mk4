/**
 * @file component-interactions.js
 * @description Handles component interactions like deletion, selection, and adding from the library.
 * @version 3.0.0
 *
 * ROOT FIX: Complete refactor to vanilla JavaScript.
 * - Removes all jQuery dependencies to fix critical execution errors.
 * - Uses modern event delegation for robust and performant interactions.
 * - Ensures compatibility with the global WordPress-style architecture.
 * - Exposes a single setup function to be called by the main application script.
 */

(function() {
    'use strict';

    // Flag to prevent multiple initializations
    let isInitialized = false;

    /**
     * Main setup function for all component interactions.
     * This is the only function that should be exposed globally.
     */
    function setupComponentInteractions() {
        if (isInitialized) {
            console.warn('⚠️ INTERACTIONS: Component interactions already initialized. Skipping.');
            return;
        }

        console.log('🚀 INTERACTIONS: Setting up all component interactions...');

        // Use a central event listener on the document body for robust delegation
        document.body.addEventListener('click', handleGlobalClick);

        isInitialized = true;
        console.log('✅ INTERACTIONS: Component interactions setup complete.');
    }

    /**
     * Handles all delegated click events from the document body.
     * @param {MouseEvent} event - The click event.
     */
    function handleGlobalClick(event) {
        const target = event.target;

        // --- Delegated Event: Delete Component ---
        const deleteButton = target.closest('.delete-component');
        if (deleteButton) {
            handleDeleteComponent(deleteButton);
            return; // Stop further processing
        }

        // --- Delegated Event: Add Component from Library ---
        const componentItem = target.closest('.component-item');
        if (componentItem) {
            event.preventDefault();
            event.stopPropagation();
            handleAddFromLibrary(componentItem);
            return; // Stop further processing
        }
        
        // --- Delegated Event: Open Component Library Modal ---
        const addComponentBtn = target.closest('#add-component-btn');
        if (addComponentBtn) {
            event.preventDefault();
            handleOpenLibraryModal();
            return;
        }
    }

    /**
     * Handles the logic for deleting a component.
     * @param {HTMLElement} deleteButton - The delete button that was clicked.
     */
    function handleDeleteComponent(deleteButton) {
        const component = deleteButton.closest('.gmkb-component');
        if (component && component.dataset.componentId) {
            const componentId = component.dataset.componentId;
            console.log(`🗑️ INTERACTIONS: Delete button clicked for component ${componentId}`);

            if (window.enhancedComponentManager) {
                window.enhancedComponentManager.removeComponent(componentId);
            } else {
                console.error('❌ INTERACTIONS: enhancedComponentManager not found.');
            }
        } else {
            console.warn('⚠️ INTERACTIONS: Could not find component ID for deletion.');
        }
    }

    /**
     * Handles adding a component when an item in the library is clicked.
     * @param {HTMLElement} componentItem - The component item element from the library.
     */
    function handleAddFromLibrary(componentItem) {
        const componentType = componentItem.getAttribute('data-component');
        if (!componentType) {
            console.warn('⚠️ INTERACTIONS: Component item is missing the data-component attribute.');
            return;
        }

        console.log(`🧩 INTERACTIONS: Component clicked in library: ${componentType}`);
        addClickFeedback(componentItem); // Provide visual feedback

        if (window.enhancedComponentManager) {
            // The component manager will handle creating default props
            window.enhancedComponentManager.addComponent(componentType);
            console.log(`✅ INTERACTIONS: ${componentType} added via enhancedComponentManager.`);
        } else {
            console.error('❌ INTERACTIONS: enhancedComponentManager not found.');
        }
    }
    
    /**
     * Handles opening the component library modal.
     */
    function handleOpenLibraryModal() {
        console.log('➕ INTERACTIONS: "Add Component" button clicked.');
        if (window.componentLibrarySystem && window.componentLibrarySystem.show) {
            window.componentLibrarySystem.show();
        } else {
            console.error('❌ INTERACTIONS: Component library system not available.');
        }
    }

    /**
     * Adds temporary visual feedback to a clicked item in the library.
     * @param {HTMLElement} item - The library item that was clicked.
     */
    function addClickFeedback(item) {
        item.classList.add('component-clicked');
        setTimeout(() => {
            item.classList.remove('component-clicked');
        }, 300);

        const indicator = document.createElement('div');
        indicator.className = 'component-added-indicator';
        indicator.textContent = '✓';
        indicator.style.cssText = `
            position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: #10b981; color: white; width: 24px; height: 24px;
            border-radius: 50%; display: flex; align-items: center; justify-content: center;
            font-weight: bold; font-size: 14px; z-index: 100;
            animation: fadeInOut 1s ease; pointer-events: none;
        `;

        // Add keyframes for the animation dynamically
        if (!document.getElementById('gmkb-fade-in-out-style')) {
            const style = document.createElement('style');
            style.id = 'gmkb-fade-in-out-style';
            style.innerHTML = `
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                    20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                    80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                    100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                }
            `;
            document.head.appendChild(style);
        }
        
        const originalPosition = item.style.position;
        if (originalPosition !== 'relative' && originalPosition !== 'absolute') {
            item.style.position = 'relative';
        }
        
        item.appendChild(indicator);

        setTimeout(() => {
            indicator.remove();
            // Only reset position if we set it
            if (originalPosition !== 'relative' && originalPosition !== 'absolute') {
                item.style.position = originalPosition;
            }
        }, 1000);
    }

    // Expose the single setup function to the global scope for main.js to call
    window.setupComponentInteractions = setupComponentInteractions;

})();
