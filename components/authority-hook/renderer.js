/**
 * @file renderer.js
 * @description Authority Hook Component Self-Registering Renderer
 * 
 * ARCHITECTURE: Self-contained component with self-registration
 */

(function() {
    'use strict';
    
    const COMPONENT_TYPE = 'authority-hook';
    
    const schema = {
        dataBindings: {
            title: 'hook_title',
            headline: 'hook_headline',
            subheadline: 'hook_subheadline',
            achievements: 'key_achievements',
            credentials: 'credentials',
            socialProof: 'social_proof',
            callToAction: 'cta_text'
        },
        layouts: ['default', 'bold', 'minimal', 'stats_focused'],
        defaults: {
            title: 'Why Book This Speaker',
            headline: '',
            subheadline: '',
            layout: 'default',
            showStats: true,
            showCTA: true
        },
        validation: {
            required: [],
            maxLength: { 
                headline: 150,
                subheadline: 200
            }
        }
    };
    
    function renderComponent(data, options = {}) {
        try {
            const title = data.title || schema.defaults.title;
            const headline = data.headline || data.hook_headline || '';
            const subheadline = data.subheadline || data.hook_subheadline || '';
            const achievements = data.achievements || data.key_achievements || [];
            const credentials = data.credentials || '';
            const socialProof = data.socialProof || data.social_proof || '';
            const callToAction = data.callToAction || data.cta_text || 'Book Now';
            
            const layout = options.layout || schema.defaults.layout;
            const showStats = options.showStats !== undefined ? options.showStats : schema.defaults.showStats;
            const showCTA = options.showCTA !== undefined ? options.showCTA : schema.defaults.showCTA;
            
            let html = `<div class="gmkb-authority-hook gmkb-authority-hook--${layout} gmkb-component--self-registered">`;
            
            if (window.gmkbData?.debugMode) {
                html += `<div class="gmkb-component__phase2-badge">[SELF-REGISTERED - AUTHORITY HOOK]</div>`;
            }
            
            html += `<h3 class="gmkb-authority-hook__title">${escapeHtml(title)}</h3>`;
            
            if (headline) {
                html += `<h2 class="gmkb-authority-hook__headline">${escapeHtml(headline)}</h2>`;
            }
            
            if (subheadline) {
                html += `<p class="gmkb-authority-hook__subheadline">${escapeHtml(subheadline)}</p>`;
            }
            
            // Process achievements
            const achievementsList = Array.isArray(achievements) ? achievements : 
                (typeof achievements === 'string' ? achievements.split('\n').filter(a => a.trim()) : []);
            
            if (achievementsList.length > 0) {
                html += `<div class="gmkb-authority-hook__achievements">`;
                html += `<h4>Key Achievements</h4>`;
                html += `<ul class="gmkb-authority-hook__list">`;
                achievementsList.forEach(achievement => {
                    const text = typeof achievement === 'object' ? achievement.text || achievement.title : achievement;
                    html += `<li class="gmkb-authority-hook__achievement">
                        <span class="gmkb-authority-hook__check">✓</span>
                        ${escapeHtml(text)}
                    </li>`;
                });
                html += `</ul>`;
                html += `</div>`;
            }
            
            if (credentials) {
                html += `<div class="gmkb-authority-hook__credentials">
                    <h4>Credentials</h4>
                    <p>${escapeHtml(credentials)}</p>
                </div>`;
            }
            
            if (socialProof) {
                html += `<div class="gmkb-authority-hook__social-proof">
                    <blockquote>"${escapeHtml(socialProof)}"</blockquote>
                </div>`;
            }
            
            if (showCTA && callToAction) {
                html += `<div class="gmkb-authority-hook__cta">
                    <button class="gmkb-authority-hook__button">${escapeHtml(callToAction)}</button>
                </div>`;
            }
            
            html += '</div>';
            return html;
            
        } catch (error) {
            console.error(`Error rendering ${COMPONENT_TYPE}:`, error);
            return `<div class="gmkb-component gmkb-component--error">
                <h3>⚠️ Error Rendering Authority Hook</h3>
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
                console.log(`✅ Authority Hook component registered successfully`);
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