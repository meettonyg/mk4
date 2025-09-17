/**
 * @file renderer.js
 * @description Photo Gallery Component Self-Registering Renderer
 */
(function() {
    'use strict';
    
    const COMPONENT_TYPE = 'photo-gallery';
    
    const schema = {
        dataBindings: {
            title: 'gallery_title',
            images: 'gallery_images'
        },
        layouts: ['grid', 'masonry', 'carousel', 'lightbox'],
        defaults: {
            title: 'Photo Gallery',
            layout: 'grid',
            columns: 3
        }
    };
    
    function renderComponent(data, options = {}) {
        const title = data.title || schema.defaults.title;
        const images = Array.isArray(data.images) ? data.images : [];
        const layout = options.layout || schema.defaults.layout;
        const columns = options.columns || schema.defaults.columns;
        const spacing = options.spacing || 'medium';
        const imageStyle = options.imageStyle || 'standard';
        const hoverEffect = options.hoverEffect || 'zoom';
        const captionStyle = options.captionStyle || 'none';
        
        // ROOT FIX: Use the correct CSS classes that match the styles.css file
        let html = `<div class="photo-gallery-component layout-${layout}">
            <div class="photo-gallery-container">
                <h3 class="photo-gallery-title">${escapeHtml(title)}</h3>`;
        
        if (images.length > 0) {
            // Use the correct CSS classes for the grid
            html += `<div class="photo-gallery-grid spacing-${spacing}" data-columns="${columns}" data-hover="${hoverEffect}" data-caption-style="${captionStyle}">`;
            images.forEach(img => {
                const src = typeof img === 'string' ? img : img.url || img.src || '';
                const alt = typeof img === 'object' ? img.alt || img.title || '' : '';
                const caption = typeof img === 'object' ? img.caption || '' : '';
                
                html += `<div class="photo-item image-${imageStyle}">
                    <div class="photo-wrapper">
                        <img class="photo-image" src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" />
                    </div>`;
                
                // Add caption if needed
                if (caption && captionStyle !== 'none') {
                    html += `<div class="photo-caption">${escapeHtml(caption)}</div>`;
                }
                
                html += `</div>`;
            });
            html += '</div>';
        } else {
            // Use placeholder classes from CSS
            html += `<div class="photo-gallery-placeholder">
                <div class="placeholder-content">
                    <div class="placeholder-icon"></div>
                    <p>No images in gallery. Click "Edit" to add photos.</p>
                </div>
            </div>`;
        }
        
        html += `</div>
        </div>`;
        return html;
    }
    
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = String(text);
        return div.innerHTML;
    }
    
    // ROOT FIX: Event-driven registration - no polling
    function registerComponent() {
        if (window.GMKBComponentRegistry && typeof window.GMKBComponentRegistry.register === 'function') {
            // Register with proper component object structure
            window.GMKBComponentRegistry.register(COMPONENT_TYPE, {
                renderer: renderComponent,
                schema: schema,
                type: COMPONENT_TYPE
            });
        }
    }
    
    // Try immediate registration if registry exists
    if (window.GMKBComponentRegistry) {
        registerComponent();
    } else {
        // Listen for registry ready event - EVENT-DRIVEN, no polling
        document.addEventListener('gmkb:component-registry-ready', registerComponent);
    }
})();