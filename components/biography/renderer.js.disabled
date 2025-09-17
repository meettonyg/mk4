/**
 * @file renderer.js
 * @description Biography Component Self-Registering Renderer
 * 
 * ARCHITECTURE: Self-contained component with self-registration
 */

(function() {
    'use strict';
    
    const COMPONENT_TYPE = 'biography';
    
    const schema = {
        dataBindings: {
            title: 'biography_title',
            content: 'biography',
            shortBio: 'short_bio',
            longBio: 'long_bio',
            professionalBio: 'professional_bio',
            personalBio: 'personal_bio'
        },
        layouts: ['default', 'two_column', 'expandable', 'timeline'],
        defaults: {
            title: 'Biography',
            content: '',
            layout: 'default',
            showReadMore: true,
            maxLength: 500
        },
        validation: {
            required: [],
            maxLength: { content: 5000 }
        }
    };
    
    function renderComponent(data, options = {}) {
        try {
            // Get Pods data as fallback
            const podsData = window.gmkbData?.pods_data || {};
            
            // Handle both data structures (data.data, data.props, or direct properties)
            const componentData = data.data || data.props || data;
            
            const title = componentData.title || data.title || schema.defaults.title;
            const content = componentData.biography || componentData.content || data.biography || data.content || podsData.biography || componentData.longBio || componentData.professionalBio || '';
            const shortBio = componentData.shortBio || data.shortBio || podsData.biography_short || '';
            const layout = options.layout || componentData.layout || schema.defaults.layout;
            const showReadMore = options.showReadMore !== undefined ? options.showReadMore : schema.defaults.showReadMore;
            
            // Log if using Pods data
            if (!componentData.biography && !data.biography && podsData.biography) {
                console.log('Biography: Using Pods data as fallback');
            }
            
            let html = `<div class="gmkb-biography gmkb-biography--${layout} gmkb-component--self-registered">`;
            
            html += `<h3 class="gmkb-biography__title">${escapeHtml(title)}</h3>`;
            
            if (window.gmkbData?.debugMode) {
                html += `<div class="gmkb-component__phase2-badge">[SELF-REGISTERED - BIOGRAPHY]</div>`;
            }
            
            if (layout === 'two_column') {
                html += `<div class="gmkb-biography__columns">`;
                if (shortBio) {
                    html += `<div class="gmkb-biography__column">
                        <h4>Summary</h4>
                        <p>${escapeHtml(shortBio)}</p>
                    </div>`;
                }
                html += `<div class="gmkb-biography__column">
                    <h4>Full Biography</h4>
                    <div class="gmkb-biography__content">${formatParagraphs(content)}</div>
                </div>`;
                html += `</div>`;
            } else if (layout === 'expandable' && showReadMore && content.length > schema.defaults.maxLength) {
                const truncated = content.substring(0, schema.defaults.maxLength) + '...';
                html += `<div class="gmkb-biography__content gmkb-biography__content--expandable">
                    <div class="gmkb-biography__excerpt">${formatParagraphs(truncated)}</div>
                    <button class="gmkb-biography__read-more">Read More</button>
                    <div class="gmkb-biography__full" style="display: none;">${formatParagraphs(content)}</div>
                </div>`;
            } else {
                html += `<div class="gmkb-biography__content">${formatParagraphs(content)}</div>`;
            }
            
            html += '</div>';
            return html;
            
        } catch (error) {
            console.error(`Error rendering ${COMPONENT_TYPE}:`, error);
            return `<div class="gmkb-component gmkb-component--error">
                <h3>⚠️ Error Rendering Biography</h3>
                <p>${escapeHtml(error.message)}</p>
            </div>`;
        }
    }
    
    function formatParagraphs(text) {
        if (!text) return '';
        return text.split('\n\n').map(p => `<p>${escapeHtml(p)}</p>`).join('');
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
            const success = window.GMKBComponentRegistry.register(COMPONENT_TYPE, {
                renderer: renderComponent,
                schema: schema,
                type: COMPONENT_TYPE
            });
            if (success && window.gmkbData?.debugMode) {
                console.log(`✅ Biography component registered successfully`);
            }
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