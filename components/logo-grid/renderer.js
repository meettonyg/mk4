/**
 * @file renderer.js
 * @description Logo Grid Component Self-Registering Renderer
 */
(function() {
    'use strict';
    
    const COMPONENT_TYPE = 'logo-grid';
    
    const schema = {
        dataBindings: { title: 'logos_title', logos: 'logos_list' },
        layouts: ['grid', 'carousel', 'list'],
        defaults: { title: 'Featured In', layout: 'grid', columns: 4 }
    };
    
    function renderComponent(data, options = {}) {
        const title = data.title || schema.defaults.title;
        const logos = Array.isArray(data.logos) ? data.logos : [];
        const columns = options.columns || schema.defaults.columns;
        
        let html = `<div class="gmkb-logo-grid">
            <h3>${escapeHtml(title)}</h3>`;
        
        if (logos.length > 0) {
            html += `<div class="gmkb-logo-grid__grid" style="grid-template-columns: repeat(${columns}, 1fr);">`;
            logos.forEach(logo => {
                const src = typeof logo === 'string' ? logo : logo.url || logo.src || '';
                const name = typeof logo === 'object' ? logo.name || logo.alt || '' : '';
                html += `<div class="gmkb-logo-grid__item">
                    <img src="${escapeHtml(src)}" alt="${escapeHtml(name)}" />
                </div>`;
            });
            html += '</div>';
        } else {
            html += '<p>No logos available.</p>';
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
    
    window.GMKBComponentRegistry?.register(COMPONENT_TYPE, renderComponent, schema) || 
    setTimeout(() => window.GMKBComponentRegistry?.register(COMPONENT_TYPE, renderComponent, schema), 100);
})();