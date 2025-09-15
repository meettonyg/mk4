/**
 * @file renderer.js
 * @description Social Links Component Self-Registering Renderer
 * 
 * ARCHITECTURE: Self-contained component with self-registration
 */

(function() {
    'use strict';
    
    const COMPONENT_TYPE = 'social-links';
    
    const schema = {
        dataBindings: {
            title: 'social_title',
            links: 'social_links',
            facebook: 'facebook_url',
            twitter: 'twitter_url',
            linkedin: 'linkedin_url',
            instagram: 'instagram_url',
            youtube: 'youtube_url',
            github: 'github_url'
        },
        layouts: ['horizontal', 'vertical', 'icons_only', 'buttons'],
        defaults: {
            title: 'Connect With Me',
            links: [],
            layout: 'horizontal',
            showLabels: false,
            iconSize: 'medium',
            openInNewTab: true
        },
        validation: {
            required: [],
            url: ['facebook', 'twitter', 'linkedin', 'instagram', 'youtube', 'github']
        }
    };
    
    const socialIcons = {
        facebook: '📘',
        twitter: '🐦',
        linkedin: '💼',
        instagram: '📷',
        youtube: '📺',
        github: '💻',
        website: '🌐',
        email: '✉️',
        default: '🔗'
    };
    
    function renderComponent(data, options = {}) {
        try {
            const title = data.title || schema.defaults.title;
            const layout = options.layout || schema.defaults.layout;
            const showLabels = options.showLabels !== undefined ? options.showLabels : schema.defaults.showLabels;
            const openInNewTab = options.openInNewTab !== undefined ? options.openInNewTab : schema.defaults.openInNewTab;
            
            let links = [];
            
            // Check for array of links first
            if (Array.isArray(data.links) && data.links.length > 0) {
                links = data.links;
            } else {
                // Check individual platform fields
                const platforms = ['facebook', 'twitter', 'linkedin', 'instagram', 'youtube', 'github'];
                platforms.forEach(platform => {
                    if (data[platform]) {
                        links.push({
                            platform: platform,
                            url: data[platform],
                            name: platform.charAt(0).toUpperCase() + platform.slice(1)
                        });
                    }
                });
            }
            
            let html = `<div class="gmkb-social-links gmkb-social-links--${layout} gmkb-component--self-registered">`;
            
            if (layout !== 'icons_only') {
                html += `<h3 class="gmkb-social-links__title">${escapeHtml(title)}</h3>`;
            }
            
            if (window.gmkbData?.debugMode) {
                html += `<div class="gmkb-component__phase2-badge">[SELF-REGISTERED - SOCIAL]</div>`;
            }
            
            if (links.length > 0) {
                const targetAttr = openInNewTab ? 'target="_blank" rel="noopener"' : '';
                
                if (layout === 'buttons') {
                    html += '<div class="gmkb-social-links__buttons">';
                    links.forEach(link => {
                        const platform = link.platform || 'website';
                        const icon = socialIcons[platform.toLowerCase()] || socialIcons.default;
                        const name = link.name || platform;
                        html += `<a href="${escapeHtml(link.url)}" class="gmkb-social-links__button gmkb-social-links__button--${platform}" ${targetAttr}>
                            <span class="gmkb-social-links__icon">${icon}</span>
                            ${showLabels ? `<span class="gmkb-social-links__label">${escapeHtml(name)}</span>` : ''}
                        </a>`;
                    });
                    html += '</div>';
                } else if (layout === 'icons_only') {
                    html += '<div class="gmkb-social-links__icons">';
                    links.forEach(link => {
                        const platform = link.platform || 'website';
                        const icon = socialIcons[platform.toLowerCase()] || socialIcons.default;
                        html += `<a href="${escapeHtml(link.url)}" class="gmkb-social-links__icon-link" title="${escapeHtml(link.name || platform)}" ${targetAttr}>
                            <span class="gmkb-social-links__icon gmkb-social-links__icon--large">${icon}</span>
                        </a>`;
                    });
                    html += '</div>';
                } else if (layout === 'vertical') {
                    html += '<ul class="gmkb-social-links__list gmkb-social-links__list--vertical">';
                    links.forEach(link => {
                        const platform = link.platform || 'website';
                        const icon = socialIcons[platform.toLowerCase()] || socialIcons.default;
                        const name = link.name || platform;
                        html += `<li class="gmkb-social-links__item">
                            <a href="${escapeHtml(link.url)}" ${targetAttr}>
                                <span class="gmkb-social-links__icon">${icon}</span>
                                <span class="gmkb-social-links__name">${escapeHtml(name)}</span>
                            </a>
                        </li>`;
                    });
                    html += '</ul>';
                } else {
                    // Horizontal (default)
                    html += '<ul class="gmkb-social-links__list gmkb-social-links__list--horizontal">';
                    links.forEach(link => {
                        const platform = link.platform || 'website';
                        const icon = socialIcons[platform.toLowerCase()] || socialIcons.default;
                        const name = link.name || platform;
                        html += `<li class="gmkb-social-links__item">
                            <a href="${escapeHtml(link.url)}" ${targetAttr}>
                                <span class="gmkb-social-links__icon">${icon}</span>
                                ${showLabels ? `<span class="gmkb-social-links__name">${escapeHtml(name)}</span>` : ''}
                            </a>
                        </li>`;
                    });
                    html += '</ul>';
                }
            } else {
                html += '<p class="gmkb-social-links__empty">No social links configured.</p>';
            }
            
            html += '</div>';
            return html;
            
        } catch (error) {
            console.error(`Error rendering ${COMPONENT_TYPE}:`, error);
            return `<div class="gmkb-component gmkb-component--error">
                <h3>⚠️ Error Rendering Social Links</h3>
                <p>${escapeHtml(error.message)}</p>
            </div>`;
        }
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
                console.log(`✅ Social Links component registered successfully`);
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