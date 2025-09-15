/**
 * @file renderer.js
 * @description Testimonials Component Self-Registering Renderer
 */
(function() {
    'use strict';
    
    const COMPONENT_TYPE = 'testimonials';
    
    const schema = {
        dataBindings: {
            title: 'testimonials_title',
            testimonials: 'testimonials_list'
        },
        layouts: ['default', 'carousel', 'grid', 'quotes'],
        defaults: { title: 'Testimonials', layout: 'default' }
    };
    
    function renderComponent(data, options = {}) {
        const title = data.title || schema.defaults.title;
        const testimonials = Array.isArray(data.testimonials) ? data.testimonials : [];
        const layout = options.layout || schema.defaults.layout;
        
        let html = `<div class="gmkb-testimonials gmkb-testimonials--${layout}">
            <h3>${escapeHtml(title)}</h3>`;
        
        if (testimonials.length > 0) {
            html += '<div class="gmkb-testimonials__list">';
            testimonials.forEach(t => {
                const text = typeof t === 'string' ? t : t.text || t.quote || '';
                const author = typeof t === 'object' ? t.author || t.name || '' : '';
                const role = typeof t === 'object' ? t.role || t.title || '' : '';
                
                html += `<div class="gmkb-testimonials__item">
                    <blockquote class="gmkb-testimonials__quote">"${escapeHtml(text)}"</blockquote>
                    ${author ? `<cite class="gmkb-testimonials__author">— ${escapeHtml(author)}${role ? `, ${escapeHtml(role)}` : ''}</cite>` : ''}
                </div>`;
            });
            html += '</div>';
        } else {
            html += '<p>No testimonials available.</p>';
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