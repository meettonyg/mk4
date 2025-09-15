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
        
        let html = `<div class="gmkb-photo-gallery gmkb-photo-gallery--${layout}">
            <h3>${escapeHtml(title)}</h3>`;
        
        if (images.length > 0) {
            html += `<div class="gmkb-photo-gallery__grid" style="grid-template-columns: repeat(${columns}, 1fr);">`;
            images.forEach(img => {
                const src = typeof img === 'string' ? img : img.url || img.src || '';
                const alt = typeof img === 'object' ? img.alt || img.title || '' : '';
                html += `<div class="gmkb-photo-gallery__item">
                    <img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" />
                </div>`;
            });
            html += '</div>';
        } else {
            html += '<p>No images in gallery.</p>';
        }
        
        html += '</div>';
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