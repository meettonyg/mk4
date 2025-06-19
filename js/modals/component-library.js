/**
 * @file component-library.js
 * @description This file manages the component library modal, allowing users to add new components to their media kit.
 *
 * Enhanced version with promise-based setup and proper validation to prevent race conditions.
 */

import {
    hideModal,
    showModal
} from './modal-base.js';

// Module-level variables for DOM elements
let componentLibraryModal, componentGrid, addComponentButton, cancelComponentButton, componentSearchInput;

/**
 * Sets up the component library, including event listeners and component rendering.
 * @returns {Promise<void>} Resolves when setup is complete
 */
export async function setupComponentLibrary() {
    console.log('📚 Setting up Component Library...');
    
    try {
        // Validate and assign DOM elements
        await validateAndAssignElements();
        
        // Setup event listeners
        setupEventListeners();
        
        // Populate the component grid
        populateComponentGrid();
        
        // Mark setup as complete
        componentLibraryModal.setAttribute('data-listener-attached', 'true');
        
        console.log('✅ Component Library setup complete.');
        
    } catch (error) {
        console.error('❌ Component Library setup failed:', error);
        throw error;
    }
}

/**
 * Validates that all required DOM elements exist and assigns them
 */
async function validateAndAssignElements() {
    const requiredElements = {
        'component-library-overlay': 'componentLibraryModal',
        'component-grid': 'componentGrid',
        'add-component-button': 'addComponentButton',
        'cancel-component-button': 'cancelComponentButton',
        'component-search': 'componentSearchInput'
    };
    
    const missingElements = [];
    
    for (const [elementId, varName] of Object.entries(requiredElements)) {
        const element = document.getElementById(elementId);
        if (!element) {
            missingElements.push(elementId);
        } else {
            // Assign to module variable
            if (varName === 'componentLibraryModal') componentLibraryModal = element;
            else if (varName === 'componentGrid') componentGrid = element;
            else if (varName === 'addComponentButton') addComponentButton = element;
            else if (varName === 'cancelComponentButton') cancelComponentButton = element;
            else if (varName === 'componentSearchInput') componentSearchInput = element;
        }
    }
    
    if (missingElements.length > 0) {
        throw new Error(`Component Library: Required elements not found: ${missingElements.join(', ')}`);
    }
}

/**
 * Sets up all event listeners for the component library
 */
function setupEventListeners() {
    // Main UI button that opens the modal
    const openComponentLibraryButton = document.getElementById('add-component');
    if (openComponentLibraryButton) {
        openComponentLibraryButton.addEventListener('click', () => {
            showComponentLibraryModal();
        });
    }
    
    // SIDEBAR Add Component button
    const sidebarAddComponentButton = document.getElementById('add-component-btn');
    if (sidebarAddComponentButton) {
        sidebarAddComponentButton.addEventListener('click', () => {
            console.log('Sidebar Add Component button clicked');
            showComponentLibraryModal();
        });
        // Mark button as having listener attached for validation
        sidebarAddComponentButton.setAttribute('data-listener-attached', 'true');
    } else {
        console.warn('Sidebar Add Component button not found (add-component-btn)');
    }

    // Empty state button event
    document.addEventListener('show-component-library', () => {
        showComponentLibraryModal();
    });
    
    // Empty state "Add Component" button (in preview area)
    const addFirstComponentButton = document.getElementById('add-first-component');
    if (addFirstComponentButton) {
        addFirstComponentButton.addEventListener('click', () => {
            console.log('Empty state Add Component button clicked');
            showComponentLibraryModal();
        });
        console.log('✅ Empty state Add Component button listener attached');
    } else {
        console.warn('Empty state Add Component button not found (add-first-component)');
    }

    // Cancel button
    if (cancelComponentButton) {
        cancelComponentButton.addEventListener('click', () => {
            hideComponentLibraryModal();
            clearSelection();
        });
    }
    
    // Close button (× in upper right)
    const closeComponentLibraryButton = document.getElementById('close-library');
    if (closeComponentLibraryButton) {
        closeComponentLibraryButton.addEventListener('click', () => {
            console.log('Component library close button (×) clicked');
            hideComponentLibraryModal();
            clearSelection();
        });
    }

    // Add button in modal footer
    if (addComponentButton) {
        addComponentButton.addEventListener('click', async () => {
            const selectedComponents = getSelectedComponents();
            if (selectedComponents.length > 0) {
                for (const componentType of selectedComponents) {
                    // Use the globally available component manager
                    if (window.componentManager) {
                        await window.componentManager.addComponent(componentType, {});
                    } else {
                        console.error('Component manager not available');
                    }
                }
            }
            hideComponentLibraryModal();
            clearSelection();
        });
    }

    // Search input
    if (componentSearchInput) {
        componentSearchInput.addEventListener('input', handleSearch);
    }
    
    // Category filter dropdown
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', handleCategoryFilter);
    }
    
    // Category sidebar items
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const category = e.target.dataset.category;
            filterByCategory(category);
            // Update active state
            document.querySelectorAll('.category-item').forEach(i => i.classList.remove('category-item--active'));
            e.target.classList.add('category-item--active');
        });
    });
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
            const card = createComponentCard(component);
            componentGrid.appendChild(card);
        });
        
        console.log(`✅ Component library populated with ${window.guestifyData.components.length} components`);
    } else {
        console.warn('No components found in guestifyData, using existing HTML components');
        // Components are already in the HTML from the PHP template
        // Just add the click handlers to existing cards
        setupExistingCards();
    }
}

/**
 * Creates a component card element
 */
function createComponentCard(component) {
    const card = document.createElement('div');
    card.className = 'component-card';
    card.dataset.componentType = component.type || component.directory || component.name;
    card.dataset.component = component.type || component.directory || component.name;
    card.dataset.category = component.category || 'general';

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

    return card;
}

/**
 * Sets up click handlers for existing component cards in the HTML
 */
function setupExistingCards() {
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
        const title = card.querySelector('h4')?.textContent.toLowerCase() || '';
        const description = card.querySelector('p')?.textContent.toLowerCase() || '';
        const isVisible = title.includes(searchTerm) || description.includes(searchTerm);
        card.style.display = isVisible ? '' : 'none';
    });
}

/**
 * Handles category filter dropdown
 */
function handleCategoryFilter(event) {
    const category = event.target.value;
    filterByCategory(category);
}

/**
 * Filters components by category
 */
function filterByCategory(category) {
    const cards = componentGrid.querySelectorAll('.component-card');
    
    cards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
    
    // Update dropdown if it exists
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter && categoryFilter.value !== category) {
        categoryFilter.value = category;
    }
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
        showModal('component-library-overlay'); // Pass the ID string, not the element
    } else {
        console.error('Component library modal could not be shown because it was not found.');
    }
}

/**
 * Hides the component library modal.
 */
function hideComponentLibraryModal() {
    if (componentLibraryModal) {
        hideModal('component-library-overlay'); // Pass the ID string, not the element
    }
}
