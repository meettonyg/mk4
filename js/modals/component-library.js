/**
 * Component library modal functionality
 */

import { showModal, hideModal, setupModalClose } from './modal-base.js';
import { showUpgradePrompt } from '../utils/helpers.js';
import { markUnsaved } from '../services/save-service.js';
import { getComponentInfo } from '../components/dynamic-component-loader.js';

/**
 * Set up component library modal
 */
export function setupComponentLibraryModal() {
    setupModalClose('component-library-overlay', 'close-library');
    
    // Setup button click handler - will work for both initial and dynamically created buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('#add-component-btn')) {
            showComponentLibraryModal();
        }
    });
    
    // Listen for custom event to show component library
    document.addEventListener('show-component-library', function() {
        console.log('Received show-component-library event');
        showComponentLibraryModal();
    });
    
    // Populate modal with dynamic components
    populateComponentLibrary();
    
    // Re-populate when components are loaded dynamically
    document.addEventListener('componentsLoaded', function() {
        populateComponentLibrary();
    });

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

    // Component selection in modal - use event delegation for dynamic content
    const libraryMain = document.querySelector('.library__main');
    if (libraryMain) {
        libraryMain.addEventListener('click', async function(e) {
            const card = e.target.closest('.component-card');
            if (!card) return;
            
            const componentType = card.getAttribute('data-component');
            const isPremium = card.classList.contains('component-card--premium');
            
            if (isPremium) {
                showUpgradePrompt();
            } else {
                // Map display names to component types
                const componentTypeMap = {
                    'Hero Section': 'hero',
                    'Biography': 'biography',
                    'Topics': 'topics',
                    'Social Links': 'social'
                };
                
                // Use mapped type if available
                const actualComponentType = componentTypeMap[componentType] || componentType;
                
                // Check if this is the first component (empty state)
                const preview = document.getElementById('media-kit-preview');
                const hasComponents = preview && preview.querySelector('[data-component-id]');
                
                // Use the global component manager (will be enhanced if enabled)
                if (window.componentManager) {
                    await window.componentManager.addComponent(actualComponentType);
                    
                    // Hide empty state if this was the first component
                    if (!hasComponents) {
                        const emptyState = document.getElementById('empty-state');
                        if (emptyState) {
                            emptyState.style.display = 'none';
                        }
                        preview.classList.add('has-components');
                    }
                } else {
                    console.error('Component manager not available');
                }
                
                hideComponentLibraryModal();
                markUnsaved();
            }
        });
    }
}

/**
 * Show the component library modal
 */
export function showComponentLibraryModal() {
    console.log('showComponentLibraryModal called');
    let modal = document.getElementById('component-library-overlay');
    
    // Create modal if it doesn't exist
    if (!modal) {
        console.log('Modal not found, creating it...');
        createComponentLibraryModal();
        modal = document.getElementById('component-library-overlay');
    }
    
    if (modal) {
        console.log('Modal found, showing...');
        modal.style.display = 'flex';
        // Ensure it's visible
        modal.style.opacity = '1';
        modal.style.visibility = 'visible';
        // Populate it if needed
        populateComponentLibrary();
    } else {
        console.error('Failed to create component library modal!');
    }
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

/**
 * Create the component library modal HTML
 */
function createComponentLibraryModal() {
    const modal = document.createElement('div');
    modal.id = 'component-library-overlay';
    modal.className = 'modal-overlay';
    modal.style.display = 'none';
    
    modal.innerHTML = `
        <div class="modal modal--library">
            <div class="library__header">
                <h2>Component Library</h2>
                <button class="modal__close" id="close-library">×</button>
            </div>
            <div class="library__body">
                <div class="library__sidebar">
                    <h3>Categories</h3>
                    <div class="category-list">
                        <div class="category-item active" data-category="all">All Components</div>
                        <div class="category-item" data-category="essential">Essential</div>
                        <div class="category-item" data-category="media">Media & Content</div>
                        <div class="category-item" data-category="premium">Premium</div>
                    </div>
                </div>
                <div class="library__main">
                    <div class="library__search">
                        <input type="text" id="component-search" placeholder="Search components..." />
                    </div>
                    <div class="component-grid" id="free-components">
                        <!-- Free components will be populated here -->
                    </div>
                    <div class="premium-section">
                        <h3>Premium Components</h3>
                        <div class="component-grid" id="premium-components">
                            <!-- Premium components will be populated here -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Setup close functionality
    setupModalClose('component-library-overlay', 'close-library');
}

/**
 * Populate component library with dynamic components
 */
function populateComponentLibrary() {
    if (!guestifyData.categories) return;
    
    const freeComponentsGrid = document.getElementById('free-components');
    const premiumComponentsGrid = document.getElementById('premium-components');
    
    if (!freeComponentsGrid || !premiumComponentsGrid) return;
    
    // Clear existing content
    freeComponentsGrid.innerHTML = '';
    premiumComponentsGrid.innerHTML = '';
    
    // Populate components by category
    Object.entries(guestifyData.categories).forEach(([categoryName, components]) => {
        components.forEach(component => {
            const card = createComponentCard(component, categoryName);
            
            if (component.isPremium) {
                premiumComponentsGrid.appendChild(card);
            } else {
                freeComponentsGrid.appendChild(card);
            }
        });
    });
}

/**
 * Create a component card for the library
 * @param {object} component - Component data
 * @param {string} categoryName - Category name
 * @returns {HTMLElement} - The card element
 */
function createComponentCard(component, categoryName) {
    const card = document.createElement('div');
    card.className = 'component-card';
    if (component.isPremium) {
        card.className += ' component-card--premium';
    }
    card.setAttribute('data-category', categoryName);
    card.setAttribute('data-component', component.directory);
    
    // Create preview based on component type
    const preview = createComponentPreview(component.directory, component.name);
    
    card.innerHTML = `
        ${preview}
        <div class="component-info">
            <h4>${component.name}</h4>
            <p>${component.description || 'Add ' + component.name + ' to your media kit'}</p>
        </div>
    `;
    
    return card;
}

/**
 * Create component preview HTML
 * @param {string} componentType - Component type/directory
 * @param {string} componentName - Component display name
 * @returns {string} - Preview HTML
 */
function createComponentPreview(componentType, componentName) {
    // Map component types to preview styles
    const previewMap = {
        'hero': '<div class="component-preview preview-hero"><div class="mini-avatar"></div><div class="mini-name">John Doe</div><div class="mini-title">Professional Title</div></div>',
        'biography': '<div class="component-preview preview-bio"><div class="mini-lines"></div><div class="mini-lines"></div><div class="mini-lines"></div><div class="mini-lines"></div></div>',
        'topics': '<div class="component-preview preview-topics"><div class="mini-topic"></div><div class="mini-topic"></div><div class="mini-topic"></div><div class="mini-topic"></div></div>',
        'social': '<div class="component-preview preview-social"><div class="mini-social"></div><div class="mini-social"></div><div class="mini-social"></div></div>',
        'stats': '<div class="component-preview preview-stats"><div class="mini-stat"><div class="mini-stat-number">1.2M</div><div class="mini-stat-label">Followers</div></div><div class="mini-stat"><div class="mini-stat-number">150+</div><div class="mini-stat-label">Shows</div></div></div>',
        'logo-grid': '<div class="component-preview" style="background: #f8fafc; padding: 8px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px;"><div style="background: #e2e8f0; aspect-ratio: 1; border-radius: 2px;"></div><div style="background: #e2e8f0; aspect-ratio: 1; border-radius: 2px;"></div><div style="background: #e2e8f0; aspect-ratio: 1; border-radius: 2px;"></div><div style="background: #e2e8f0; aspect-ratio: 1; border-radius: 2px;"></div></div>',
        'video-intro': '<div class="component-preview" style="background: #1e293b; display: flex; align-items: center; justify-content: center;"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" stroke-width="2"><polygon points="5,3 19,12 5,21"></polygon></svg></div>',
        'photo-gallery': '<div class="component-preview" style="background: #f8fafc; padding: 6px; display: grid; grid-template-columns: 1fr 1fr; gap: 3px;"><div style="background: #cbd5e1; aspect-ratio: 1; border-radius: 2px;"></div><div style="background: #cbd5e1; aspect-ratio: 1; border-radius: 2px;"></div><div style="background: #cbd5e1; aspect-ratio: 1; border-radius: 2px;"></div><div style="background: #cbd5e1; aspect-ratio: 1; border-radius: 2px;"></div></div>',
        'guest-intro': '<div class="component-preview" style="background: #f8fafc; padding: 10px;"><div style="text-align: center; margin-bottom: 5px;"><div style="font-size: 8px; color: #64748b; text-transform: uppercase;">Introducing</div><div style="font-size: 12px; font-weight: bold; color: #1e293b;">Guest Name</div></div><div style="font-size: 8px; color: #64748b; margin-bottom: 5px;">Professional Title</div><div style="display: flex; gap: 2px; font-size: 8px; color: #475569;"><span>•</span><span style="flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Topic 1</span></div><div style="display: flex; gap: 2px; font-size: 8px; color: #475569;"><span>•</span><span style="flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Topic 2</span></div></div>',
        'default': '<div class="component-preview" style="background: #f1f5f9; display: flex; align-items: center; justify-content: center; color: #64748b;"><div style="text-align: center; font-size: 10px;">' + componentName + '</div></div>'
    };
    
    return previewMap[componentType] || previewMap['default'];
}
