/**
 * @file renderer.js
 * @description Video Intro Component Self-Registering Renderer
 * 
 * ARCHITECTURE: Self-contained component with self-registration
 */

(function() {
    'use strict';
    
    const COMPONENT_TYPE = 'video-intro';
    
    const schema = {
        dataBindings: {
            title: 'video_title',
            videoUrl: 'video_url',
            embedCode: 'video_embed',
            thumbnail: 'video_thumbnail',
            description: 'video_description'
        },
        layouts: ['default', 'full_width', 'sidebar', 'modal'],
        defaults: {
            title: 'Video Introduction',
            layout: 'default',
            autoplay: false,
            showControls: true,
            aspectRatio: '16:9'
        }
    };
    
    function renderComponent(data, options = {}) {
        try {
            const title = data.title || schema.defaults.title;
            const videoUrl = data.videoUrl || data.video_url || '';
            const embedCode = data.embedCode || data.video_embed || '';
            const thumbnail = data.thumbnail || data.video_thumbnail || '';
            const description = data.description || data.video_description || '';
            const layout = options.layout || schema.defaults.layout;
            
            let html = `<div class="gmkb-video-intro gmkb-video-intro--${layout} gmkb-component--self-registered">`;
            
            html += `<h3 class="gmkb-video-intro__title">${escapeHtml(title)}</h3>`;
            
            if (embedCode) {
                html += `<div class="gmkb-video-intro__embed">${embedCode}</div>`;
            } else if (videoUrl) {
                const videoId = extractVideoId(videoUrl);
                if (videoId) {
                    html += `<div class="gmkb-video-intro__player">
                        <iframe src="https://www.youtube.com/embed/${videoId}" 
                                frameborder="0" 
                                allowfullscreen
                                class="gmkb-video-intro__iframe"></iframe>
                    </div>`;
                } else {
                    html += `<video class="gmkb-video-intro__video" controls>
                        <source src="${escapeHtml(videoUrl)}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>`;
                }
            } else if (thumbnail) {
                html += `<div class="gmkb-video-intro__thumbnail">
                    <img src="${escapeHtml(thumbnail)}" alt="${escapeHtml(title)}" />
                    <div class="gmkb-video-intro__play-overlay">▶</div>
                </div>`;
            } else {
                html += '<p class="gmkb-video-intro__empty">No video configured.</p>';
            }
            
            if (description) {
                html += `<p class="gmkb-video-intro__description">${escapeHtml(description)}</p>`;
            }
            
            html += '</div>';
            return html;
            
        } catch (error) {
            console.error(`Error rendering ${COMPONENT_TYPE}:`, error);
            return `<div class="gmkb-component gmkb-component--error">
                <h3>⚠️ Error Rendering Video Intro</h3>
                <p>${escapeHtml(error.message)}</p>
            </div>`;
        }
    }
    
    function extractVideoId(url) {
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
        return match ? match[1] : null;
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
            if (window.gmkbData?.debugMode) {
                console.log(`✅ Video Intro component registered`);
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