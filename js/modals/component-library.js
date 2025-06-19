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
 */
export function setupComponentLibrary() {
    // Assign DOM elements here, inside the setup function, which is called after DOMContentLoaded.
    componentLibraryModal = document.getElementById('component-library-modal');
    componentGrid = document.getElementById('component-grid');
    addComponentButton = document.getElementById('add-component-button');
    cancelComponentButton = document.getElementById('cancel-component-button');
    componentSearchInput = document.getElementById('component-search');

    if (!componentLibraryModal) {
        console.warn('Component library modal not found, skipping setup.');
        return;
    }

    // This is the button in the main UI that opens the modal
    const openComponentLibraryButton = document.getElementById('add-component');
    if (openComponentLibraryButton) {
        openComponentLibraryButton.addEventListener('click', () => {
            showComponentLibraryModal();
        });
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
    if (!componentGrid || !window.guestifyData || !window.guestifyData.components) {
        console.error('Component grid or guestifyData is not available.');
        return;
    }

    componentGrid.innerHTML = ''; // Clear existing components

    window.guestifyData.components.forEach(component => {
        const card = document.createElement('div');
        card.className = 'component-card';
        card.dataset.componentType = component.type;

        const icon = component.icon ? `<i class="fa ${component.icon}"></i>` : '';
        const title = `<h6>${component.title}</h6>`;
        const description = `<p>${component.description}</p>`;

        card.innerHTML = `
            <div class="component-card-content">
                ${icon}
                ${title}
                ${description}
            </div>
            <div class="component-card-checkbox">
                <input type="checkbox" id="checkbox-${component.type}" name="component-checkbox">
            </div>
        `;

        card.addEventListener('click', (event) => {
            if (event.target.type !== 'checkbox') {
                const checkbox = card.querySelector('input[type="checkbox"]');
                checkbox.checked = !checkbox.checked;
            }
            card.classList.toggle('selected', card.querySelector('input[type="checkbox"]').checked);
        });

        componentGrid.appendChild(card);
    });
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
            selected.push(card.dataset.componentType);
        }
    });
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
