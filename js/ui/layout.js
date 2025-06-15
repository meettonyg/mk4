/**
 * Layout options functionality
 */

import { markUnsaved } from '../services/save-service.js';

/**
 * Set up layout options
 */
export function setupLayoutOptions() {
    const layoutOptions = document.querySelectorAll('.layout-option');
    
    layoutOptions.forEach(option => {
        option.addEventListener('click', function() {
            layoutOptions.forEach(opt => opt.classList.remove('layout-option--active'));
            this.classList.add('layout-option--active');
            
            const layout = this.getAttribute('data-layout');
            applyLayout(layout);
            markUnsaved();
        });
    });
}

/**
 * Apply a layout to the media kit
 * @param {string} layoutType - The type of layout to apply
 */
function applyLayout(layoutType) {
    console.log('Applying layout:', layoutType);
    
    // Implementation would depend on your specific layout system
    // This would modify the preview container's layout based on the selected option
    const preview = document.getElementById('media-kit-preview');
    
    // Remove existing layout classes
    preview.classList.remove('layout-full-width', 'layout-two-column', 'layout-sidebar', 'layout-three-column');
    
    // Add new layout class
    preview.classList.add(`layout-${layoutType}`);
}
