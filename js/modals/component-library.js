/**
 * Component library modal functionality
 */

import { showModal, hideModal, setupModalClose } from './modal-base.js';
import { showUpgradePrompt } from '../utils/helpers.js';
import { addComponentToZone } from '../components/component-manager.js';
import { markUnsaved } from '../services/save-service.js';
import { saveCurrentState } from '../services/history-service.js';

/**
 * Set up component library modal
 */
export function setupComponentLibraryModal() {
    const openLibraryBtn = document.getElementById('add-component-btn');
    setupModalClose('component-library-overlay', 'close-library');
    
    if (openLibraryBtn) {
        openLibraryBtn.addEventListener('click', showComponentLibraryModal);
    }

    // Category filtering in modal
    const categoryItems = document.querySelectorAll('.category-item');
    const categoryFilter = document.getElementById('category-filter');
    
    categoryItems.forEach(item => {
        item.addEventListener('click', function() {
            categoryItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            const category = this.getAttribute('data-category');
            filterComponents(category);
            if (categoryFilter) categoryFilter.value = category;
        });
    });

    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            const category = this.value;
            filterComponents(category);
            categoryItems.forEach(i => i.classList.remove('active'));
            const matchingSidebarItem = document.querySelector(`.category-item[data-category="${category}"]`);
            if (matchingSidebarItem) matchingSidebarItem.classList.add('active');
        });
    }

    // Search functionality in modal
    const componentSearch = document.getElementById('component-search');
    if (componentSearch) {
        componentSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const cards = document.querySelectorAll('.component-card');
            
            cards.forEach(card => {
                const title = card.querySelector('h4').textContent.toLowerCase();
                const description = card.querySelector('p').textContent.toLowerCase();
                
                if (title.includes(searchTerm) || description.includes(searchTerm)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    // Component selection in modal
    document.querySelectorAll('.component-card').forEach(card => {
        card.addEventListener('click', function() {
            const componentType = this.getAttribute('data-component');
            const isPremium = this.classList.contains('premium');
            
            if (isPremium) {
                showUpgradePrompt();
            } else {
                const firstEmptyDropZone = document.querySelector('.drop-zone.empty');
                if (firstEmptyDropZone) {
                    addComponentToZone(componentType, firstEmptyDropZone);
                    hideComponentLibraryModal();
                    markUnsaved();
                    saveCurrentState();
                } else {
                    alert('Please make space for a new component by moving or deleting an existing one, or dragging to an empty drop zone.');
                }
            }
        });
    });
}

/**
 * Show the component library modal
 */
export function showComponentLibraryModal() {
    showModal('component-library-overlay');
}

/**
 * Hide the component library modal
 */
export function hideComponentLibraryModal() {
    hideModal('component-library-overlay');
}

/**
 * Filter components by category
 * @param {string} category - The category to filter by
 */
function filterComponents(category) {
    const cards = document.querySelectorAll('.component-card');
    cards.forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}
