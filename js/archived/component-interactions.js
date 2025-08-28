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
        
        // ROOT FIX: Verify dependencies before initializing
        const dependencyCheck = {
            enhancedComponentManager: !!window.enhancedComponentManager,
            enhancedStateManager: !!window.enhancedStateManager,
            structuredLogger: !!window.structuredLogger
        };
        
        console.log('🔍 INTERACTIONS: Dependency check:', dependencyCheck);
        
        if (!dependencyCheck.enhancedComponentManager) {
            console.warn('⚠️ INTERACTIONS: enhancedComponentManager not available during setup');
        }

        // Use a central event listener on the document body for robust delegation
        document.body.addEventListener('click', handleGlobalClick);
        
        // ROOT FIX: Add verification timeout to check if component items are clickable
        setTimeout(() => {
            const componentItems = document.querySelectorAll('.component-item');
            console.log('🔍 INTERACTIONS: Post-setup verification:', {
                componentItemsFound: componentItems.length,
                sampleItems: Array.from(componentItems).slice(0, 3).map(item => ({
                    className: item.className,
                    dataComponent: item.dataset.component,
                    isDraggable: item.draggable
                })),
                enhancedComponentManagerReady: window.enhancedComponentManager ? window.enhancedComponentManager.isReady() : false
            });
        }, 1000);

        isInitialized = true;
        console.log('✅ INTERACTIONS: Component interactions setup complete.');
    }

    /**
     * Handles all delegated click events from the document body.
     * ROOT FIX: Removed component control handling to prevent conflicts with ComponentControlsManager
     * @param {MouseEvent} event - The click event.
     */
    function handleGlobalClick(event) {
        const target = event.target;
        
        // ROOT FIX: Only handle component library interactions
        // Component controls (delete, edit, etc.) are handled by ComponentControlsManager
        const componentItem = target.closest('.component-item');
        const addComponentBtn = target.closest('#add-component-btn');
        
        // Only log if this is a click we care about
        if ((componentItem || addComponentBtn) && window.gmkbData?.debugMode) {
            console.log('🔘 INTERACTIONS: Library click detected', {
                target: target.tagName,
                className: target.className,
                id: target.id,
                dataComponent: target.dataset.component,
                closest: {
                    componentItem: !!componentItem,
                    addComponentBtn: !!addComponentBtn
                }
            });
        }

        // ROOT FIX: Component control events (delete, edit, move, duplicate) are now
        // exclusively handled by ComponentControlsManager to prevent conflicts

        // --- Delegated Event: Add Component from Library ---
        if (componentItem) {
            event.preventDefault();
            event.stopPropagation();
            
            if (window.gmkbData?.debugMode) {
                console.log('🧩 INTERACTIONS: Component item clicked detected', {
                    element: componentItem,
                    dataComponent: componentItem.dataset.component,
                    isDraggable: componentItem.draggable
                });
            }
            
            handleAddFromLibrary(componentItem);
            return; // Stop further processing
        }
        
        // --- Delegated Event: Open Component Library Modal ---
        if (addComponentBtn) {
            event.preventDefault();
            handleOpenLibraryModal();
            return;
        }
    }

    // ROOT FIX: handleDeleteComponent removed - now handled exclusively by ComponentControlsManager
    // This prevents conflicts and ensures single source of truth for component controls

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
        
        // ROOT FIX: Enhanced component manager availability check
        if (window.enhancedComponentManager) {
            // Check if the component manager is initialized
            if (!window.enhancedComponentManager.isReady()) {
                console.log('🔄 INTERACTIONS: Component manager not ready, initializing...');
                try {
                    window.enhancedComponentManager.initialize();
                } catch (initError) {
                    console.error('❌ INTERACTIONS: Failed to initialize component manager:', initError);
                    return;
                }
            }
            
            // Add the component
            try {
                window.enhancedComponentManager.addComponent(componentType)
                    .then((componentId) => {
                        console.log(`✅ INTERACTIONS: ${componentType} added successfully with ID: ${componentId}`);
                    })
                    .catch((error) => {
                        console.error(`❌ INTERACTIONS: Failed to add ${componentType}:`, error);
                    });
            } catch (error) {
                console.error(`❌ INTERACTIONS: Exception while adding ${componentType}:`, error);
            }
        } else {
            console.error('❌ INTERACTIONS: enhancedComponentManager not found.');
            console.log('🔍 INTERACTIONS: Available window properties:', Object.keys(window).filter(key => key.toLowerCase().includes('component')));
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
    
    // ROOT FIX: Debug utilities for testing component interactions
    window.debugComponentInteractions = {
        testComponentClick: (componentType) => {
            console.log(`🧪 TESTING: Simulating click for ${componentType}`);
            const componentItem = document.querySelector(`[data-component="${componentType}"]`);
            if (componentItem) {
                handleAddFromLibrary(componentItem);
            } else {
                console.error(`Component item not found: ${componentType}`);
            }
        },
        checkStatus: () => {
            return {
                isInitialized,
                componentItemsFound: document.querySelectorAll('.component-item').length,
                enhancedComponentManagerAvailable: !!window.enhancedComponentManager,
                enhancedComponentManagerReady: window.enhancedComponentManager ? window.enhancedComponentManager.isReady() : false,
                availableComponentTypes: Array.from(document.querySelectorAll('.component-item')).map(item => item.dataset.component)
            };
        },
        listClickableElements: () => {
            const items = document.querySelectorAll('.component-item');
            return Array.from(items).map(item => ({
                element: item,
                dataComponent: item.dataset.component,
                className: item.className,
                isDraggable: item.draggable,
                boundingRect: item.getBoundingClientRect()
            }));
        }
    };

})();
