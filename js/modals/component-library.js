/**
 * @file component-library.js
 * @description This file manages the component library modal, allowing users to add new components to their media kit.
 *
 * This version includes a fix to move DOM element lookups inside the setup function,
 * ensuring the elements exist before the script tries to access them. This resolves race
 * condition errors on application startup.
 */

import {
    hideModal,
    showModal
} from './modal-base.js';

// Define variables at the top level, but assign them inside the setup function
// to prevent trying to access DOM elements before they are ready.
let componentLibraryModal, componentGrid, addComponentButton, cancelComponentButton, componentSearchInput;

/**
 * Sets up the component library, including event listeners and component rendering.
 * This function is called once the DOM is ready.
 * @param {boolean} isRetry - Whether this is a retry attempt
 * @param {number} retryCount - Number of retries attempted
 */
export function setupComponentLibrary(isRetry = false, retryCount = 0) {
    // Assign DOM elements here, inside the setup function, which is called after DOMContentLoaded.
    componentLibraryModal = document.getElementById('component-library-overlay');
    componentGrid = document.getElementById('component-grid');
    addComponentButton = document.getElementById('add-component-button');
    cancelComponentButton = document.getElementById('cancel-component-button');
    componentSearchInput = document.getElementById('component-search');

    if (!componentLibraryModal) {
        if (retryCount < 5) { // Increased retry limit
            const delay = Math.min(100 * Math.pow(2, retryCount), 1000); // Exponential backoff up to 1s
            console.warn(`Component library modal not found (attempt ${retryCount + 1}/5), retrying in ${delay}ms...`);
            setTimeout(() => {
                setupComponentLibrary(true, retryCount + 1);
            }, delay);
            return;
        } else {
            console.error('Component library modal still not found after 5 retries. This is a critical initialization failure.');
            // Try to diagnose the issue
            console.log('Available modal IDs:', Array.from(document.querySelectorAll('[id*="modal"], [id*="library"], [id*="overlay"]')).map(el => el.id));
            return;
        }
    }
    
    if (retryCount > 0) {
        console.log(`✅ Component library modal found on retry ${retryCount}! Setting up...`);
    }

    // This is the button in the main UI that opens the modal
    const openComponentLibraryButton = document.getElementById('add-component');
    if (openComponentLibraryButton) {
        openComponentLibraryButton.addEventListener('click', () => {
            showComponentLibraryModal();
        });
    }
    
    // SIDEBAR Add Component button (different ID)
    const sidebarAddComponentButton = document.getElementById('add-component-btn');
    if (sidebarAddComponentButton) {
        sidebarAddComponentButton.addEventListener('click', () => {
            console.log('Sidebar Add Component button clicked');
            showComponentLibraryModal();
        });
    } else {
        console.warn('Sidebar Add Component button not found (add-component-btn)');
    }

    // This is the button in the "empty state" UI
    // We add a global listener for a custom event instead of a direct click listener
    // to avoid coupling this module with the renderer.
    document.addEventListener('show-component-library', () => {
        showComponentLibraryModal();
    });


    if (cancelComponentButton) {
        cancelComponentButton.addEventListener('click', () => {
            hideComponentLibraryModal();
            clearSelection();
        });
    }
    
    // CLOSE BUTTON (× in upper right)
    const closeComponentLibraryButton = document.getElementById('close-library');
    if (closeComponentLibraryButton) {
        closeComponentLibraryButton.addEventListener('click', () => {
            console.log('Component library close button (×) clicked');
            hideComponentLibraryModal();
            clearSelection();
        });
    } else {
        console.warn('Component library close button not found (close-library)');
    }

    if (addComponentButton) {
        addComponentButton.addEventListener('click', () => {
            const selectedComponents = getSelectedComponents();
            if (selectedComponents.length > 0) {
                selectedComponents.forEach(async (componentType) => {
                    // Use the globally available component manager
                    await window.componentManager.addComponent(componentType, {});
                });
            }
            hideComponentLibraryModal();
            clearSelection();
        });
    }

    if (componentSearchInput) {
        componentSearchInput.addEventListener('input', handleSearch);
    }

    populateComponentGrid();
    console.log('Component Library setup complete.');
}


/**
 * Populates the component grid with available components from the global `guestifyData`.
 * Each component is rendered as a card with a checkbox for selection.
 */
function populateComponentGrid() {
    if (!componentGrid) {
        console.error('Component grid element not available.');
        return;
    }
    
    // Clear existing components first
    componentGrid.innerHTML = ''; 

    // Check if we have guestifyData components
    if (window.guestifyData?.components && Array.isArray(window.guestifyData.components)) {
        console.log(`Loading ${window.guestifyData.components.length} components from guestifyData`);
        
        window.guestifyData.components.forEach(component => {
            const card = document.createElement('div');
            card.className = 'component-card';
            card.dataset.componentType = component.type || component.directory || component.name;
            card.dataset.component = component.type || component.directory || component.name;

            const icon = component.icon ? `<i class="fa ${component.icon}"></i>` : createDefaultIcon();
            const title = `<h4>${component.title || component.name || 'Untitled'}</h4>`;
            const description = `<p>${component.description || 'No description available'}</p>`;

            card.innerHTML = `
                <div class="component-card-content">
                    <div class="component-preview">
                        ${icon}
                    </div>
                    <div class="component-info">
                        ${title}
                        ${description}
                    </div>
                </div>
                <div class="component-card-checkbox">
                    <input type="checkbox" id="checkbox-${component.type || component.name}" name="component-checkbox">
                </div>
            `;

            card.addEventListener('click', (event) => {
                if (event.target.type !== 'checkbox') {
                    const checkbox = card.querySelector('input[type="checkbox"]');
                    if (checkbox) {
                        checkbox.checked = !checkbox.checked;
                    }
                }
                card.classList.toggle('selected', card.querySelector('input[type="checkbox"]')?.checked || false);
            });

            componentGrid.appendChild(card);
        });
        
        console.log(`✅ Component library populated with ${window.guestifyData.components.length} components`);
    } else {
        console.warn('No components found in guestifyData, keeping static HTML components');
        // Components are already in the HTML from the PHP template
        // Just add the click handlers to existing cards
        const existingCards = componentGrid.querySelectorAll('.component-card');
        existingCards.forEach(card => {
            card.addEventListener('click', (event) => {
                if (event.target.type !== 'checkbox') {
                    const checkbox = card.querySelector('input[type="checkbox"]');
                    if (checkbox) {
                        checkbox.checked = !checkbox.checked;
                    }
                }
                card.classList.toggle('selected', card.querySelector('input[type="checkbox"]')?.checked || false);
            });
        });
        console.log(`✅ Added click handlers to ${existingCards.length} existing component cards`);
    }
}

/**
 * Creates a default icon for components without specific icons
 */
function createDefaultIcon() {
    return `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="12" cy="12" r="3"></circle>
        </svg>
    `;
}

/**
 * Handles the search functionality for the component library.
 * Filters components based on the user's input.
 * @param {Event} event - The input event from the search field.
 */
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const cards = componentGrid.querySelectorAll('.component-card');

    cards.forEach(card => {
        const title = card.querySelector('h6').textContent.toLowerCase();
        const description = card.querySelector('p').textContent.toLowerCase();
        const isVisible = title.includes(searchTerm) || description.includes(searchTerm);
        card.style.display = isVisible ? '' : 'none';
    });
}

/**
 * Gets the list of selected component types from the component grid.
 * @returns {string[]} An array of selected component type strings.
 */
function getSelectedComponents() {
    const selected = [];
    const checkboxes = componentGrid.querySelectorAll('input[type="checkbox"]:checked');
    checkboxes.forEach(checkbox => {
        const card = checkbox.closest('.component-card');
        if (card) {
            // Try multiple data attributes for compatibility
            const componentType = card.dataset.componentType || card.dataset.component;
            if (componentType) {
                selected.push(componentType);
            }
        }
    });
    console.log('Selected components:', selected);
    return selected;
}

/**
 * Clears the selection state of all components in the grid.
 */
function clearSelection() {
    const checkboxes = componentGrid.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
        const card = checkbox.closest('.component-card');
        if (card) {
            card.classList.remove('selected');
        }
    });
}

/**
 * Shows the component library modal.
 */
function showComponentLibraryModal() {
    if (componentLibraryModal) {
        showModal(componentLibraryModal);
    } else {
        console.error('Component library modal could not be shown because it was not found.');
    }
}

/**
 * Hides the component library modal.
 */
function hideComponentLibraryModal() {
    if (componentLibraryModal) {
        hideModal(componentLibraryModal);
    }
}
