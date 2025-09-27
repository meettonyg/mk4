/**
 * @file renderer.js
 * @description Stats Component Self-Registering Renderer
 */
(function() {
    'use strict';
    
    const COMPONENT_TYPE = 'stats';
    
    const schema = {
        dataBindings: { title: 'stats_title', stats: 'stats_list' },
        layouts: ['default', 'counters', 'bars', 'circles'],
        defaults: { title: 'Key Statistics', layout: 'default' }
    };
    
    function renderComponent(data, options = {}) {
        const title = data.title || schema.defaults.title;
        const stats = Array.isArray(data.stats) ? data.stats : [];
        const layout = options.layout || schema.defaults.layout;
        
        let html = `<div class="gmkb-stats gmkb-stats--${layout}">
            <h3>${escapeHtml(title)}</h3>`;
        
        if (stats.length > 0) {
            html += '<div class="gmkb-stats__grid">';
            stats.forEach(stat => {
                const value = typeof stat === 'object' ? stat.value || stat.number || '0' : stat;
                const label = typeof stat === 'object' ? stat.label || stat.title || '' : '';
                const suffix = typeof stat === 'object' ? stat.suffix || '' : '';
                
                html += `<div class="gmkb-stats__item">
                    <div class="gmkb-stats__value">${escapeHtml(value)}${escapeHtml(suffix)}</div>
                    ${label ? `<div class="gmkb-stats__label">${escapeHtml(label)}</div>` : ''}
                </div>`;
            });
            html += '</div>';
        } else {
            html += '<p>No statistics available.</p>';
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