/**
 * Component Library Filter Fix
 * Fixes the issue where filtered components don't display in the library modal
 * ROOT FIX: Addresses the Vue rendering issue with conditional display
 */

(function() {
    'use strict';
    
    console.log('🔧 Component Library Filter Fix: Initializing...');
    
    // Monitor for component library open
    document.addEventListener('gmkb:open-component-library', fixComponentLibraryFilters);
    
    // Also monitor for clicks on the component library button
    document.addEventListener('click', function(e) {
        if (e.target.matches('[data-action="open-component-library"], #add-component-btn, .add-component-btn')) {
            setTimeout(fixComponentLibraryFilters, 100);
        }
    });
    
    function fixComponentLibraryFilters() {
        console.log('🔧 Fixing component library filters...');
        
        // Wait for the modal to be fully rendered
        setTimeout(() => {
            const modal = document.getElementById('component-library-overlay') || 
                         document.querySelector('.library-modal');
            
            if (!modal || !modal.style.display || modal.style.display === 'none') {
                return;
            }
            
            // Get all category items
            const categoryItems = modal.querySelectorAll('.category-item');
            
            categoryItems.forEach(item => {
                // Remove any existing listeners
                const newItem = item.cloneNode(true);
                item.parentNode.replaceChild(newItem, item);
                
                // Add new click handler
                newItem.addEventListener('click', function() {
                    const category = this.textContent.trim().toLowerCase().replace(/\s+/g, '-');
                    console.log('🔧 Category clicked:', category);
                    
                    // Update active state
                    modal.querySelectorAll('.category-item').forEach(ci => {
                        ci.classList.remove('category-item--active');
                    });
                    this.classList.add('category-item--active');
                    
                    // Get all component cards
                    const cards = modal.querySelectorAll('.component-card');
                    let visibleCount = 0;
                    
                    cards.forEach(card => {
                        const cardCategory = card.dataset.category;
                        
                        if (category === 'all-components' || category === 'all') {
                            card.style.display = '';
                            visibleCount++;
                        } else if (cardCategory) {
                            // Normalize categories for comparison
                            const normalizedCardCat = cardCategory.toLowerCase().replace(/-/g, ' ');
                            const normalizedSelectedCat = category.replace(/-/g, ' ');
                            
                            if (normalizedCardCat === normalizedSelectedCat || 
                                normalizedCardCat.includes(normalizedSelectedCat) ||
                                normalizedSelectedCat.includes(normalizedCardCat)) {
                                card.style.display = '';
                                visibleCount++;
                            } else {
                                card.style.display = 'none';
                            }
                        } else {
                            card.style.display = 'none';
                        }
                    });
                    
                    console.log(`🔧 Filter applied: ${visibleCount} components visible`);
                    
                    // Handle empty state
                    const noResults = modal.querySelector('.no-results');
                    const grid = modal.querySelector('.components-grid');
                    
                    if (visibleCount === 0) {
                        if (noResults) {
                            noResults.style.display = 'block';
                        } else if (grid) {
                            // Create no results message if it doesn't exist
                            const emptyMsg = document.createElement('div');
                            emptyMsg.className = 'no-results';
                            emptyMsg.innerHTML = `
                                <p>No components found in this category</p>
                                <button class="btn btn--secondary" onclick="document.querySelector('.category-item').click()">
                                    Show All
                                </button>
                            `;
                            grid.appendChild(emptyMsg);
                        }
                    } else {
                        if (noResults) {
                            noResults.style.display = 'none';
                        }
                    }
                });
            });
            
            // Fix the dropdown filter as well
            const filterDropdown = modal.querySelector('.library__filter');
            if (filterDropdown) {
                filterDropdown.addEventListener('change', function() {
                    const selectedCategory = this.value;
                    console.log('🔧 Dropdown changed to:', selectedCategory);
                    
                    // Find and click the corresponding category item
                    const categoryItems = modal.querySelectorAll('.category-item');
                    categoryItems.forEach(item => {
                        const itemText = item.textContent.trim().toLowerCase().replace(/\s+/g, '-');
                        if (itemText === selectedCategory.toLowerCase() || 
                            (selectedCategory === 'all' && itemText === 'all-components')) {
                            item.click();
                        }
                    });
                });
            }
            
            console.log('✅ Component library filters fixed');
            
        }, 200);
    }
    
    // Also fix on page load if the modal is already open
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(fixComponentLibraryFilters, 500);
        });
    } else {
        setTimeout(fixComponentLibraryFilters, 500);
    }
    
    console.log('✅ Component Library Filter Fix: Ready');
})();
