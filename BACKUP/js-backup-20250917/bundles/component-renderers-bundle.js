/**
 * @file component-renderers-bundle.js
 * @description COMPLETE bundled component renderers for production use
 * Contains all 17 component renderers in a single file
 * 
 * PERFORMANCE OPTIMIZATION: Reduces HTTP requests from 17 to 1
 */

(function() {
    'use strict';
    
    // Wait for registry to be ready
    function initializeRenderers() {
        if (!window.GMKBComponentRegistry) {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initializeRenderers);
            } else {
                setTimeout(initializeRenderers, 50);
            }
            return;
        }
        
        // Utility function used by all components
        function escapeHtml(text) {
            if (!text) return '';
            const div = document.createElement('div');
            div.textContent = String(text);
            return div.innerHTML;
        }
        
        function formatParagraphs(text) {
            if (!text) return '';
            return text.split('\n\n').map(p => `<p>${escapeHtml(p)}</p>`).join('');
        }
        
        // Register all 17 components
        const components = {
            // 1. HERO
            'hero': {
                schema: {
                    dataBindings: { title: 'full_name', subtitle: 'guest_title', description: 'biography', image: 'guest_headshot' },
                    layouts: ['center_aligned', 'left_aligned', 'right_aligned'],
                    defaults: { title: 'Guest Name', layout: 'left_aligned' }
                },
                render: (data, options = {}) => {
                    const title = data.title || data.full_name || 'Professional Headline';
                    const subtitle = data.subtitle || data.guest_title || 'Your expertise';
                    const description = data.description || data.biography || 'Briefly introduce yourself and your expertise.';
                    const image = data.image || data.guest_headshot || '';
                    const buttonText = data.buttonText || 'Get In Touch';
                    const layout = options.layout || 'center_aligned';
                    
                    // ROOT FIX: Generate proper hero layout with avatar placeholder and button
                    let html = `<div class="gmkb-hero gmkb-hero--${layout}">`;
                    
                    if (layout === 'center_aligned' || !image) {
                        // Center aligned or no image - show avatar placeholder
                        html += `
                            <div class="gmkb-hero__avatar">
                                ${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(title)}" class="gmkb-hero__image">` : 
                                        `<div class="gmkb-hero__avatar-placeholder">DJ</div>`}
                            </div>
                            <div class="gmkb-hero__content gmkb-hero__content--center">
                                <h1 class="gmkb-hero__title">${escapeHtml(title)}</h1>
                                <p class="gmkb-hero__subtitle">${escapeHtml(subtitle)}</p>
                                <p class="gmkb-hero__description">${escapeHtml(description)}</p>
                                <button class="gmkb-hero__button">${escapeHtml(buttonText)}</button>
                            </div>`;
                    } else {
                        // Left or right aligned with image
                        html += `
                            ${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(title)}" class="gmkb-hero__image">` : ''}
                            <div class="gmkb-hero__content">
                                <h1 class="gmkb-hero__title">${escapeHtml(title)}</h1>
                                <p class="gmkb-hero__subtitle">${escapeHtml(subtitle)}</p>
                                <p class="gmkb-hero__description">${escapeHtml(description)}</p>
                                <button class="gmkb-hero__button">${escapeHtml(buttonText)}</button>
                            </div>`;
                    }
                    
                    html += '</div>';
                    return html;
                }
            },
            
            // 2. TOPICS - ROOT FIX: Self-contained with data fetching
            'topics': {
                schema: {
                    dataBindings: { title: 'topics_title', topics: 'topics_list' },
                    layouts: ['grid', 'list', 'tags'],
                    defaults: { title: 'Speaking Topics', layout: 'grid' }
                },
                render: (data, options = {}) => {
                    const title = data.title || 'Untitled';
                    let topics = Array.isArray(data.topics) ? data.topics : [];
                    const layout = options.layout || 'grid';
                    
                    // ROOT FIX: Self-contained Pods data fetching
                    // Check if we have Pods field data in the props
                    if (topics.length === 0 && !data.podsDataFetched) {
                        // Check for Pods field data directly in props
                        const podsTopics = [];
                        for (let i = 1; i <= 5; i++) {
                            const fieldKey = `topic_${i}`;
                            if (data[fieldKey]) {
                                podsTopics.push({
                                    title: data[fieldKey],
                                    description: ''
                                });
                            }
                        }
                        
                        if (podsTopics.length > 0) {
                            topics = podsTopics;
                        } else {
                            // ROOT FIX: Trigger async data fetch if component has a componentId
                            // This allows the component to fetch its own data
                            if (options.componentId && window.gmkbData?.postId) {
                                // Mark container for async update
                                const containerId = `topics-container-${options.componentId || Date.now()}`;
                                
                                // Self-contained async fetch (no external dependencies)
                                setTimeout(() => {
                                    const container = document.querySelector(`[data-component-id="${options.componentId}"]`);
                                    if (container && window.gmkbData?.pods_data) {
                                        // Extract topics from global Pods data
                                        const updatedTopics = [];
                                        for (let i = 1; i <= 5; i++) {
                                            const fieldKey = `topic_${i}`;
                                            if (window.gmkbData.pods_data[fieldKey]) {
                                                updatedTopics.push({
                                                    title: window.gmkbData.pods_data[fieldKey],
                                                    description: ''
                                                });
                                            }
                                        }
                                        
                                        if (updatedTopics.length > 0) {
                                            // Re-render with loaded data
                                            const updatedHtml = components['topics'].render(
                                                { ...data, topics: updatedTopics, podsDataFetched: true },
                                                options
                                            );
                                            container.innerHTML = updatedHtml;
                                        }
                                    }
                                }, 100);
                            }
                        }
                    }
                    
                    // ROOT FIX: Render component even without topics to match expected UI
                    let html = `<div class="gmkb-topics gmkb-topics--${layout}">
                        <h3 class="gmkb-topics__title">${escapeHtml(title)}</h3>`;
                    
                    if (topics.length > 0) {
                        html += layout === 'list' ? '<ul class="gmkb-topics__list">' : '<div class="gmkb-topics__grid">';
                        topics.forEach(topic => {
                            const topicTitle = typeof topic === 'object' ? topic.topic_title || topic.title : topic;
                            const topicDescription = typeof topic === 'object' ? topic.topic_description || topic.description || '' : '';
                            html += layout === 'list' 
                                ? `<li class="gmkb-topics__item">
                                    <h4>${escapeHtml(topicTitle)}</h4>
                                    ${topicDescription ? `<p>${escapeHtml(topicDescription)}</p>` : ''}
                                   </li>`
                                : `<div class="gmkb-topics__item">
                                    <h4>${escapeHtml(topicTitle)}</h4>
                                    ${topicDescription ? `<p>${escapeHtml(topicDescription)}</p>` : ''}
                                   </div>`;
                        });
                        html += layout === 'list' ? '</ul>' : '</div>';
                    } else {
                        // ROOT FIX: Show the "No topics configured" message as seen in the UI
                        html += '<p class="gmkb-topics__empty">No topics configured.</p>';
                    }
                    
                    html += '</div>';
                    return html;
                }
            },
            
            // 3. BIOGRAPHY
            'biography': {
                schema: {
                    dataBindings: { title: 'biography_title', content: 'biography' },
                    layouts: ['default', 'two_column', 'expandable'],
                    defaults: { title: 'Biography', layout: 'default' }
                },
                render: (data, options = {}) => {
                    const title = data.title || 'Biography';
                    const content = data.content || data.biography || '';
                    return `<div class="gmkb-biography">
                        <h3>${escapeHtml(title)}</h3>
                        <div class="gmkb-biography__content">${formatParagraphs(content)}</div>
                    </div>`;
                }
            },
            
            // 4. CONTACT
            'contact': {
                schema: {
                    dataBindings: { email: 'email', phone: 'phone', website: 'website' },
                    layouts: ['vertical', 'horizontal', 'grid'],
                    defaults: { title: 'Contact Information', layout: 'vertical' }
                },
                render: (data, options = {}) => {
                    const title = data.title || 'Contact Information';
                    let html = `<div class="gmkb-contact"><h3>${escapeHtml(title)}</h3><div class="gmkb-contact__info">`;
                    if (data.email) html += `<p>Email: <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></p>`;
                    if (data.phone) html += `<p>Phone: <a href="tel:${escapeHtml(data.phone)}">${escapeHtml(data.phone)}</a></p>`;
                    if (data.website) html += `<p>Website: <a href="${escapeHtml(data.website)}" target="_blank">${escapeHtml(data.website)}</a></p>`;
                    html += '</div></div>';
                    return html;
                }
            },
            
            // 5. SOCIAL (ROOT FIX: Changed from social-links to match system expectations)
            'social': {
                schema: {
                    dataBindings: { links: 'social_links' },
                    layouts: ['horizontal', 'vertical', 'icons_only'],
                    defaults: { title: 'Connect With Me', layout: 'horizontal' }
                },
                render: (data, options = {}) => {
                    const title = data.title || 'Connect With Me';
                    const links = Array.isArray(data.links) ? data.links : [];
                    let html = `<div class="gmkb-social-links"><h3>${escapeHtml(title)}</h3>`;
                    if (links.length > 0) {
                        html += '<ul class="gmkb-social-links__list">';
                        links.forEach(link => {
                            const url = typeof link === 'object' ? link.url : link;
                            const name = typeof link === 'object' ? link.name || link.platform : 'Link';
                            html += `<li><a href="${escapeHtml(url)}" target="_blank">${escapeHtml(name)}</a></li>`;
                        });
                        html += '</ul>';
                    }
                    html += '</div>';
                    return html;
                }
            },
            
            // 6. GUEST-INTRO
            'guest-intro': {
                schema: {
                    dataBindings: { name: 'full_name', title: 'guest_title', introduction: 'introduction' },
                    layouts: ['default', 'centered', 'minimal'],
                    defaults: { layout: 'default' }
                },
                render: (data, options = {}) => {
                    const name = data.name || data.full_name || 'Guest Speaker';
                    const title = data.title || data.guest_title || '';
                    const introduction = data.introduction || '';
                    return `<div class="gmkb-guest-intro">
                        <h2>${escapeHtml(name)}</h2>
                        ${title ? `<p class="gmkb-guest-intro__title">${escapeHtml(title)}</p>` : ''}
                        ${introduction ? `<div class="gmkb-guest-intro__introduction">${formatParagraphs(introduction)}</div>` : ''}
                    </div>`;
                }
            },
            
            // 7. AUTHORITY-HOOK
            'authority-hook': {
                schema: {
                    dataBindings: { headline: 'hook_headline', achievements: 'key_achievements' },
                    layouts: ['default', 'bold', 'minimal'],
                    defaults: { title: 'Why Book This Speaker' }
                },
                render: (data, options = {}) => {
                    const title = data.title || 'Why Book This Speaker';
                    const headline = data.headline || '';
                    return `<div class="gmkb-authority-hook">
                        <h3>${escapeHtml(title)}</h3>
                        ${headline ? `<h2>${escapeHtml(headline)}</h2>` : ''}
                    </div>`;
                }
            },
            
            // 8. QUESTIONS
            'questions': {
                schema: {
                    dataBindings: { questions: 'interview_questions' },
                    layouts: ['default', 'accordion', 'numbered'],
                    defaults: { title: 'Interview Questions' }
                },
                render: (data, options = {}) => {
                    const title = data.title || 'Interview Questions';
                    const questions = Array.isArray(data.questions) ? data.questions : [];
                    let html = `<div class="gmkb-questions"><h3>${escapeHtml(title)}</h3>`;
                    if (questions.length > 0) {
                        html += '<ul>';
                        questions.forEach(q => {
                            const text = typeof q === 'string' ? q : q.question || q.text || '';
                            html += `<li>${escapeHtml(text)}</li>`;
                        });
                        html += '</ul>';
                    }
                    html += '</div>';
                    return html;
                }
            },
            
            // 9. VIDEO-INTRO
            'video-intro': {
                schema: {
                    dataBindings: { videoUrl: 'video_url', embedCode: 'video_embed' },
                    layouts: ['default', 'full_width'],
                    defaults: { title: 'Video Introduction' }
                },
                render: (data, options = {}) => {
                    const title = data.title || 'Video Introduction';
                    const embedCode = data.embedCode || data.video_embed || '';
                    return `<div class="gmkb-video-intro">
                        <h3>${escapeHtml(title)}</h3>
                        ${embedCode ? `<div class="gmkb-video-intro__embed">${embedCode}</div>` : '<p>No video configured.</p>'}
                    </div>`;
                }
            },
            
            // 10. PHOTO-GALLERY
            'photo-gallery': {
                schema: {
                    dataBindings: { images: 'gallery_images' },
                    layouts: ['grid', 'masonry', 'carousel'],
                    defaults: { title: 'Photo Gallery', layout: 'grid' }
                },
                render: (data, options = {}) => {
                    const title = data.title || 'Photo Gallery';
                    const images = Array.isArray(data.images) ? data.images : [];
                    let html = `<div class="gmkb-photo-gallery"><h3>${escapeHtml(title)}</h3>`;
                    if (images.length > 0) {
                        html += '<div class="gmkb-photo-gallery__grid">';
                        images.forEach(img => {
                            const src = typeof img === 'string' ? img : img.url || '';
                            html += `<img src="${escapeHtml(src)}" alt="" />`;
                        });
                        html += '</div>';
                    }
                    html += '</div>';
                    return html;
                }
            },
            
            // 11. PODCAST-PLAYER
            'podcast-player': {
                schema: {
                    dataBindings: { episodes: 'podcast_episodes', embedCode: 'podcast_embed' },
                    layouts: ['default', 'list'],
                    defaults: { title: 'Podcast Episodes' }
                },
                render: (data, options = {}) => {
                    const title = data.title || 'Podcast Episodes';
                    const embedCode = data.embedCode || '';
                    return `<div class="gmkb-podcast-player">
                        <h3>${escapeHtml(title)}</h3>
                        ${embedCode ? `<div>${embedCode}</div>` : '<p>No podcast configured.</p>'}
                    </div>`;
                }
            },
            
            // 12. TESTIMONIALS
            'testimonials': {
                schema: {
                    dataBindings: { testimonials: 'testimonials_list' },
                    layouts: ['default', 'carousel', 'grid'],
                    defaults: { title: 'Testimonials' }
                },
                render: (data, options = {}) => {
                    const title = data.title || 'Testimonials';
                    const testimonials = Array.isArray(data.testimonials) ? data.testimonials : [];
                    let html = `<div class="gmkb-testimonials"><h3>${escapeHtml(title)}</h3>`;
                    testimonials.forEach(t => {
                        const text = typeof t === 'string' ? t : t.text || t.quote || '';
                        html += `<blockquote>"${escapeHtml(text)}"</blockquote>`;
                    });
                    html += '</div>';
                    return html;
                }
            },
            
            // 13. STATS
            'stats': {
                schema: {
                    dataBindings: { stats: 'stats_list' },
                    layouts: ['default', 'counters', 'bars'],
                    defaults: { title: 'Key Statistics' }
                },
                render: (data, options = {}) => {
                    const title = data.title || 'Key Statistics';
                    const stats = Array.isArray(data.stats) ? data.stats : [];
                    let html = `<div class="gmkb-stats"><h3>${escapeHtml(title)}</h3><div class="gmkb-stats__grid">`;
                    stats.forEach(stat => {
                        const value = typeof stat === 'object' ? stat.value || '0' : stat;
                        const label = typeof stat === 'object' ? stat.label || '' : '';
                        html += `<div class="gmkb-stats__item">
                            <div class="gmkb-stats__value">${escapeHtml(value)}</div>
                            ${label ? `<div class="gmkb-stats__label">${escapeHtml(label)}</div>` : ''}
                        </div>`;
                    });
                    html += '</div></div>';
                    return html;
                }
            },
            
            // 14. LOGO-GRID
            'logo-grid': {
                schema: {
                    dataBindings: { logos: 'logos_list' },
                    layouts: ['grid', 'carousel'],
                    defaults: { title: 'Featured In' }
                },
                render: (data, options = {}) => {
                    const title = data.title || 'Featured In';
                    const logos = Array.isArray(data.logos) ? data.logos : [];
                    let html = `<div class="gmkb-logo-grid"><h3>${escapeHtml(title)}</h3>`;
                    if (logos.length > 0) {
                        html += '<div class="gmkb-logo-grid__grid">';
                        logos.forEach(logo => {
                            const src = typeof logo === 'string' ? logo : logo.url || '';
                            html += `<img src="${escapeHtml(src)}" alt="" />`;
                        });
                        html += '</div>';
                    }
                    html += '</div>';
                    return html;
                }
            },
            
            // 15. PORTFOLIO
            'portfolio': {
                schema: {
                    dataBindings: { items: 'portfolio_items' },
                    layouts: ['grid', 'list'],
                    defaults: { title: 'Portfolio' }
                },
                render: (data, options = {}) => {
                    const title = data.title || 'Portfolio';
                    const items = Array.isArray(data.items) ? data.items : [];
                    let html = `<div class="gmkb-portfolio"><h3>${escapeHtml(title)}</h3>`;
                    if (items.length > 0) {
                        html += '<div class="gmkb-portfolio__grid">';
                        items.forEach(item => {
                            const itemTitle = typeof item === 'string' ? item : item.title || '';
                            html += `<div class="gmkb-portfolio__item"><h4>${escapeHtml(itemTitle)}</h4></div>`;
                        });
                        html += '</div>';
                    }
                    html += '</div>';
                    return html;
                }
            },
            
            // 16. CALL-TO-ACTION (note: this is call-to-action in directory)
            'call-to-action': {
                schema: {
                    dataBindings: { buttonText: 'cta_button_text', buttonUrl: 'cta_button_url' },
                    layouts: ['default', 'centered', 'banner'],
                    defaults: { title: 'Ready to Get Started?', buttonText: 'Contact Us' }
                },
                render: (data, options = {}) => {
                    const title = data.title || 'Ready to Get Started?';
                    const buttonText = data.buttonText || 'Contact Us';
                    const buttonUrl = data.buttonUrl || '#contact';
                    return `<div class="gmkb-cta">
                        <h3>${escapeHtml(title)}</h3>
                        <a href="${escapeHtml(buttonUrl)}" class="gmkb-cta__button">${escapeHtml(buttonText)}</a>
                    </div>`;
                }
            },
            
            // 17. BOOKING-CALENDAR
            'booking-calendar': {
                schema: {
                    dataBindings: { calendarUrl: 'calendar_url', embedCode: 'calendar_embed' },
                    layouts: ['default', 'embedded'],
                    defaults: { title: 'Book a Speaking Engagement' }
                },
                render: (data, options = {}) => {
                    const title = data.title || 'Book a Speaking Engagement';
                    const calendarUrl = data.calendarUrl || '';
                    const embedCode = data.embedCode || '';
                    return `<div class="gmkb-booking-calendar">
                        <h3>${escapeHtml(title)}</h3>
                        ${embedCode ? `<div>${embedCode}</div>` : 
                         calendarUrl ? `<a href="${escapeHtml(calendarUrl)}" target="_blank">Check Availability</a>` :
                         '<p>Booking calendar not configured.</p>'}
                    </div>`;
                }
            }
        };
        
        // Register all components
        Object.entries(components).forEach(([type, component]) => {
            window.GMKBComponentRegistry.register(type, component.render, component.schema);
        });
        
        console.log(`✅ Component Renderers Bundle: Loaded ${Object.keys(components).length} components`);
    }
    
    // Start initialization
    initializeRenderers();
})();