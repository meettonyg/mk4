/**
 * @file renderer.js
 * @description Guest Intro Component Self-Registering Renderer
 * 
 * ARCHITECTURE: Self-contained component with self-registration
 */

(function() {
    'use strict';
    
    const COMPONENT_TYPE = 'guest-intro';
    
    const schema = {
        dataBindings: {
            name: 'full_name',
            title: 'guest_title',
            tagline: 'tagline',
            introduction: 'introduction',
            expertise: 'expertise_areas',
            credentials: 'credentials'
        },
        layouts: ['default', 'centered', 'sidebar', 'minimal'],
        defaults: {
            name: '',
            title: '',
            tagline: '',
            introduction: '',
            layout: 'default',
            showCredentials: true
        },
        validation: {
            required: ['name'],
            maxLength: { 
                tagline: 200,
                introduction: 1000
            }
        }
    };
    
    function renderComponent(data, options = {}) {
        try {
            const name = data.name || data.full_name || 'Guest Speaker';
            const title = data.title || data.guest_title || '';
            const tagline = data.tagline || '';
            const introduction = data.introduction || '';
            const expertise = data.expertise || data.expertise_areas || '';
            const credentials = data.credentials || '';
            const layout = options.layout || schema.defaults.layout;
            const showCredentials = options.showCredentials !== undefined ? options.showCredentials : schema.defaults.showCredentials;
            
            let html = `<div class="gmkb-guest-intro gmkb-guest-intro--${layout} gmkb-component--self-registered">`;
            
            if (window.gmkbData?.debugMode) {
                html += `<div class="gmkb-component__phase2-badge">[SELF-REGISTERED - GUEST INTRO]</div>`;
            }
            
            if (layout === 'centered') {
                html += `<div class="gmkb-guest-intro__content gmkb-guest-intro__content--centered">`;
                html += `<h2 class="gmkb-guest-intro__name">${escapeHtml(name)}</h2>`;
                if (title) {
                    html += `<p class="gmkb-guest-intro__title">${escapeHtml(title)}</p>`;
                }
                if (tagline) {
                    html += `<p class="gmkb-guest-intro__tagline">"${escapeHtml(tagline)}"</p>`;
                }
                if (introduction) {
                    html += `<div class="gmkb-guest-intro__introduction">${formatParagraphs(introduction)}</div>`;
                }
                if (showCredentials && credentials) {
                    html += `<div class="gmkb-guest-intro__credentials">
                        <h4>Credentials</h4>
                        <p>${escapeHtml(credentials)}</p>
                    </div>`;
                }
                html += `</div>`;
            } else if (layout === 'minimal') {
                html += `<div class="gmkb-guest-intro__minimal">`;
                html += `<h2 class="gmkb-guest-intro__name">${escapeHtml(name)}</h2>`;
                if (title) {
                    html += `<p class="gmkb-guest-intro__title">${escapeHtml(title)}</p>`;
                }
                if (tagline) {
                    html += `<p class="gmkb-guest-intro__tagline">${escapeHtml(tagline)}</p>`;
                }
                html += `</div>`;
            } else {
                // Default layout
                html += `<div class="gmkb-guest-intro__header">`;
                html += `<h2 class="gmkb-guest-intro__name">${escapeHtml(name)}</h2>`;
                if (title) {
                    html += `<p class="gmkb-guest-intro__title">${escapeHtml(title)}</p>`;
                }
                html += `</div>`;
                
                if (tagline) {
                    html += `<div class="gmkb-guest-intro__tagline">
                        <blockquote>"${escapeHtml(tagline)}"</blockquote>
                    </div>`;
                }
                
                if (introduction) {
                    html += `<div class="gmkb-guest-intro__body">
                        <h3>Introduction</h3>
                        <div class="gmkb-guest-intro__introduction">${formatParagraphs(introduction)}</div>
                    </div>`;
                }
                
                if (expertise) {
                    html += `<div class="gmkb-guest-intro__expertise">
                        <h4>Areas of Expertise</h4>
                        <p>${escapeHtml(expertise)}</p>
                    </div>`;
                }
                
                if (showCredentials && credentials) {
                    html += `<div class="gmkb-guest-intro__credentials">
                        <h4>Credentials</h4>
                        <p>${escapeHtml(credentials)}</p>
                    </div>`;
                }
            }
            
            html += '</div>';
            return html;
            
        } catch (error) {
            console.error(`Error rendering ${COMPONENT_TYPE}:`, error);
            return `<div class="gmkb-component gmkb-component--error">
                <h3>⚠️ Error Rendering Guest Intro</h3>
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
                console.log(`✅ Guest Intro component registered successfully`);
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