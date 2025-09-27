/**
 * @file renderer.js  
 * @description Podcast Player Component Self-Registering Renderer
 */
(function() {
    'use strict';
    
    const COMPONENT_TYPE = 'podcast-player';
    
    const schema = {
        dataBindings: {
            title: 'podcast_title',
            episodes: 'podcast_episodes',
            embedCode: 'podcast_embed'
        },
        layouts: ['default', 'list', 'cards'],
        defaults: { title: 'Podcast Episodes', layout: 'default' }
    };
    
    function renderComponent(data, options = {}) {
        const title = data.title || schema.defaults.title;
        const episodes = Array.isArray(data.episodes) ? data.episodes : [];
        const embedCode = data.embedCode || data.podcast_embed || '';
        
        let html = `<div class="gmkb-podcast-player">
            <h3>${escapeHtml(title)}</h3>`;
        
        if (embedCode) {
            html += `<div class="gmkb-podcast-player__embed">${embedCode}</div>`;
        } else if (episodes.length > 0) {
            html += '<div class="gmkb-podcast-player__episodes">';
            episodes.forEach(ep => {
                const epTitle = typeof ep === 'string' ? ep : ep.title || '';
                const epUrl = typeof ep === 'object' ? ep.url || '' : '';
                html += `<div class="gmkb-podcast-player__episode">
                    <h4>${escapeHtml(epTitle)}</h4>
                    ${epUrl ? `<audio controls><source src="${escapeHtml(epUrl)}"></audio>` : ''}
                </div>`;
            });
            html += '</div>';
        } else {
            html += '<p>No podcast episodes available.</p>';
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