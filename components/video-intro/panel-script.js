/**
 * Video Intro Component Panel Script
 * Handles the dynamic functionality of the video intro design panel
 */

// Register this component's panel handler
window.componentPanelHandlers = window.componentPanelHandlers || {};
window.componentPanelHandlers['video-intro'] = function(element, schema) {
    initializeVideoIntroPanel(element, schema);
};

/**
 * Initialize video intro panel
 * @param {HTMLElement} element - The video intro component element
 * @param {Object} schema - Component schema (optional)
 */
function initializeVideoIntroPanel(element, schema) {
    // Log schema if available
    if (schema) {
        console.log('Video Intro component schema:', schema);
    }
    
    // Handle video source change
    const videoSourceSelect = document.querySelector('[data-property="videoSource"]');
    const uploadVideoGroup = document.getElementById('upload-video-group');
    
    if (videoSourceSelect && uploadVideoGroup) {
        // Get initial value
        const currentSource = element.getAttribute('data-video-source') || 'youtube';
        videoSourceSelect.value = currentSource;
        
        // Set initial visibility
        uploadVideoGroup.style.display = currentSource === 'upload' ? 'block' : 'none';
        
        // Add change listener
        videoSourceSelect.addEventListener('change', function() {
            // Update data attribute
            element.setAttribute('data-video-source', this.value);
            
            // Show/hide upload control
            uploadVideoGroup.style.display = this.value === 'upload' ? 'block' : 'none';
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
    }
    
    // Handle video URL input
    const videoUrlInput = document.querySelector('[data-property="videoUrl"]');
    if (videoUrlInput) {
        // Get initial value
        const videoContainer = element.querySelector('.video-container');
        if (videoContainer) {
            const iframe = videoContainer.querySelector('iframe');
            const video = videoContainer.querySelector('video');
            
            if (iframe) {
                videoUrlInput.value = iframe.getAttribute('src') || '';
            } else if (video) {
                videoUrlInput.value = video.getAttribute('src') || '';
            }
        }
        
        // Add input listener
        videoUrlInput.addEventListener('input', function() {
            // Process video URL
            processVideoUrl(element, this.value, videoSourceSelect.value);
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
    }
    
    // Handle video size change
    const videoSizeSelect = document.querySelector('[data-property="videoSize"]');
    const customSizeGroup = document.querySelector('.custom-size-group');
    
    if (videoSizeSelect && customSizeGroup) {
        // Get initial value
        const currentSize = element.getAttribute('data-video-size') || 'responsive';
        videoSizeSelect.value = currentSize;
        
        // Set initial visibility
        customSizeGroup.style.display = currentSize === 'custom' ? 'block' : 'none';
        
        // Add change listener
        videoSizeSelect.addEventListener('change', function() {
            // Update data attribute
            element.setAttribute('data-video-size', this.value);
            
            // Show/hide custom size input
            customSizeGroup.style.display = this.value === 'custom' ? 'block' : 'none';
            
            // Update video container size
            const videoContainer = element.querySelector('.video-container');
            if (videoContainer) {
                videoContainer.className = 'video-container video-size--' + this.value;
                
                if (this.value === 'custom') {
                    const customWidth = document.querySelector('[data-property="customWidth"]').value || '800';
                    videoContainer.style.width = customWidth + 'px';
                } else {
                    videoContainer.style.width = '';
                }
            }
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
    }
    
    // Handle custom width input
    const customWidthInput = document.querySelector('[data-property="customWidth"]');
    if (customWidthInput) {
        // Get initial value
        const videoContainer = element.querySelector('.video-container');
        if (videoContainer && videoContainer.style.width) {
            customWidthInput.value = parseInt(videoContainer.style.width) || 800;
        }
        
        // Add input listener
        customWidthInput.addEventListener('input', function() {
            const videoContainer = element.querySelector('.video-container');
            if (videoContainer) {
                videoContainer.style.width = this.value + 'px';
            }
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
    }
    
    // Handle aspect ratio change
    const aspectRatioSelect = document.querySelector('[data-property="aspectRatio"]');
    if (aspectRatioSelect) {
        // Get initial value
        const currentRatio = element.getAttribute('data-aspect-ratio') || '16:9';
        aspectRatioSelect.value = currentRatio;
        
        // Add change listener
        aspectRatioSelect.addEventListener('change', function() {
            // Update data attribute
            element.setAttribute('data-aspect-ratio', this.value);
            
            // Update video container class
            const videoContainer = element.querySelector('.video-container');
            if (videoContainer) {
                videoContainer.classList.remove('aspect-ratio--16:9', 'aspect-ratio--4:3', 'aspect-ratio--1:1', 'aspect-ratio--9:16');
                videoContainer.classList.add('aspect-ratio--' + this.value);
            }
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
    }
    
    // Handle player controls change
    const playerControlsSelect = document.querySelector('[data-property="playerControls"]');
    if (playerControlsSelect) {
        // Get initial value
        const currentControls = element.getAttribute('data-player-controls') || 'default';
        playerControlsSelect.value = currentControls;
        
        // Add change listener
        playerControlsSelect.addEventListener('change', function() {
            // Update data attribute
            element.setAttribute('data-player-controls', this.value);
            
            // Update controls for video element
            const video = element.querySelector('video');
            if (video) {
                if (this.value === 'minimal' || this.value === 'custom') {
                    video.setAttribute('controls', 'true');
                    video.classList.add('controls--' + this.value);
                } else {
                    video.setAttribute('controls', 'true');
                    video.classList.remove('controls--minimal', 'controls--custom');
                }
            }
            
            // Update iframe parameters for YouTube/Vimeo
            updateEmbedParameters(element);
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
    }
    
    // Handle layout change
    const layoutSelect = document.querySelector('[data-property="layout"]');
    if (layoutSelect) {
        // Get initial value
        const currentLayout = element.getAttribute('data-layout') || 'standard';
        layoutSelect.value = currentLayout;
        
        // Add change listener
        layoutSelect.addEventListener('change', function() {
            // Update data attribute
            element.setAttribute('data-layout', this.value);
            
            // Update container classes
            element.classList.remove('layout--standard', 'layout--with-text', 'layout--side-by-side');
            element.classList.add('layout--' + this.value);
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
    }
    
    // Handle checkbox options
    setupCheckboxOption('autoplay', element, updateEmbedParameters);
    setupCheckboxOption('loop', element, updateEmbedParameters);
    setupCheckboxOption('muted', element, updateEmbedParameters);
    setupCheckboxOption('showRelatedVideos', element, updateEmbedParameters);
    setupCheckboxOption('lightbox', element);
    setupCheckboxOption('lazyLoad', element);
    
    // Handle upload buttons
    const uploadVideoBtn = document.getElementById('upload-video-btn');
    if (uploadVideoBtn) {
        uploadVideoBtn.addEventListener('click', function() {
            // This would typically use the WordPress media uploader
            alert('Video upload functionality would open media browser here');
            
            // Simulating a video file selection
            const selectedFilename = document.getElementById('selected-video-filename');
            if (selectedFilename) {
                selectedFilename.textContent = 'example-video.mp4';
                
                // Update video source
                const videoUrl = 'https://example.com/videos/example-video.mp4';
                processVideoUrl(element, videoUrl, 'upload');
                
                // Update video URL input
                const videoUrlInput = document.querySelector('[data-property="videoUrl"]');
                if (videoUrlInput) {
                    videoUrlInput.value = videoUrl;
                }
                
                // Trigger save
                const event = new Event('change', { bubbles: true });
                element.dispatchEvent(event);
            }
        });
    }
    
    const uploadThumbnailBtn = document.getElementById('upload-thumbnail-btn');
    if (uploadThumbnailBtn) {
        uploadThumbnailBtn.addEventListener('click', function() {
            // This would typically use the WordPress media uploader
            alert('Thumbnail upload functionality would open media browser here');
            
            // Simulating a thumbnail image selection
            const selectedFilename = document.getElementById('selected-thumbnail-filename');
            if (selectedFilename) {
                selectedFilename.textContent = 'thumbnail.jpg';
                
                // Update video thumbnail
                const video = element.querySelector('video');
                if (video) {
                    const poster = 'https://example.com/images/thumbnail.jpg';
                    video.setAttribute('poster', poster);
                    
                    // Trigger save
                    const event = new Event('change', { bubbles: true });
                    element.dispatchEvent(event);
                }
            }
        });
    }
    
    // Setup text content updaters
    setupTextContentUpdater('title', '.video-section-title', element);
    setupTextContentUpdater('description', '.video-description', element);
}

/**
 * Process video URL and update the video container
 * @param {HTMLElement} element - The component element
 * @param {string} url - The video URL
 * @param {string} source - The video source (youtube, vimeo, upload)
 */
function processVideoUrl(element, url, source) {
    const videoContainer = element.querySelector('.video-container');
    if (!videoContainer) return;
    
    // Clear current content
    videoContainer.innerHTML = '';
    
    if (!url) return;
    
    // Process based on source
    if (source === 'youtube') {
        // Extract YouTube ID
        let videoId = '';
        
        if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1].split('?')[0];
        } else if (url.includes('youtube.com/watch')) {
            const urlParams = new URLSearchParams(url.split('?')[1]);
            videoId = urlParams.get('v');
        } else if (url.includes('youtube.com/embed/')) {
            videoId = url.split('youtube.com/embed/')[1].split('?')[0];
        }
        
        if (videoId) {
            // Create iframe with parameters
            const iframe = document.createElement('iframe');
            iframe.setAttribute('width', '100%');
            iframe.setAttribute('height', '100%');
            iframe.setAttribute('frameborder', '0');
            iframe.setAttribute('allowfullscreen', 'true');
            
            // Set src with parameters
            const embedUrl = new URL(`https://www.youtube.com/embed/${videoId}`);
            
            // Add parameters based on settings
            const autoplay = element.hasAttribute('data-autoplay');
            const loop = element.hasAttribute('data-loop');
            const muted = element.hasAttribute('data-muted');
            const showRelated = element.hasAttribute('data-showRelatedVideos');
            
            if (autoplay) embedUrl.searchParams.append('autoplay', '1');
            if (loop) {
                embedUrl.searchParams.append('loop', '1');
                embedUrl.searchParams.append('playlist', videoId);
            }
            if (muted) embedUrl.searchParams.append('mute', '1');
            if (!showRelated) embedUrl.searchParams.append('rel', '0');
            
            // Add lazy loading if enabled
            const lazyLoad = element.hasAttribute('data-lazyLoad');
            if (lazyLoad) {
                iframe.setAttribute('loading', 'lazy');
            }
            
            iframe.setAttribute('src', embedUrl.toString());
            videoContainer.appendChild(iframe);
        }
    } else if (source === 'vimeo') {
        // Extract Vimeo ID
        let videoId = '';
        
        if (url.includes('vimeo.com/')) {
            videoId = url.split('vimeo.com/')[1].split('?')[0];
        }
        
        if (videoId) {
            // Create iframe with parameters
            const iframe = document.createElement('iframe');
            iframe.setAttribute('width', '100%');
            iframe.setAttribute('height', '100%');
            iframe.setAttribute('frameborder', '0');
            iframe.setAttribute('allowfullscreen', 'true');
            
            // Set src with parameters
            const embedUrl = new URL(`https://player.vimeo.com/video/${videoId}`);
            
            // Add parameters based on settings
            const autoplay = element.hasAttribute('data-autoplay');
            const loop = element.hasAttribute('data-loop');
            const muted = element.hasAttribute('data-muted');
            
            if (autoplay) embedUrl.searchParams.append('autoplay', '1');
            if (loop) embedUrl.searchParams.append('loop', '1');
            if (muted) embedUrl.searchParams.append('muted', '1');
            
            // Add lazy loading if enabled
            const lazyLoad = element.hasAttribute('data-lazyLoad');
            if (lazyLoad) {
                iframe.setAttribute('loading', 'lazy');
            }
            
            iframe.setAttribute('src', embedUrl.toString());
            videoContainer.appendChild(iframe);
        }
    } else if (source === 'upload') {
        // Create video element
        const video = document.createElement('video');
        video.setAttribute('width', '100%');
        video.setAttribute('height', '100%');
        video.setAttribute('controls', 'true');
        
        // Set attributes based on settings
        const autoplay = element.hasAttribute('data-autoplay');
        const loop = element.hasAttribute('data-loop');
        const muted = element.hasAttribute('data-muted');
        
        if (autoplay) video.setAttribute('autoplay', 'true');
        if (loop) video.setAttribute('loop', 'true');
        if (muted) video.setAttribute('muted', 'true');
        
        // Add lazy loading if enabled
        const lazyLoad = element.hasAttribute('data-lazyLoad');
        if (lazyLoad) {
            video.setAttribute('loading', 'lazy');
            video.setAttribute('preload', 'none');
        }
        
        // Apply player controls style
        const controlsStyle = element.getAttribute('data-player-controls');
        if (controlsStyle === 'minimal' || controlsStyle === 'custom') {
            video.classList.add('controls--' + controlsStyle);
        }
        
        video.setAttribute('src', url);
        videoContainer.appendChild(video);
    }
    
    // Add lightbox functionality if enabled
    const lightbox = element.hasAttribute('data-lightbox');
    if (lightbox) {
        videoContainer.classList.add('has-lightbox');
        
        // Add click handler to open lightbox
        videoContainer.addEventListener('click', function(e) {
            if (e.target === videoContainer) {
                openVideoLightbox(element, url, source);
            }
        });
    } else {
        videoContainer.classList.remove('has-lightbox');
    }
}

/**
 * Open video in lightbox
 * @param {HTMLElement} element - The component element
 * @param {string} url - The video URL
 * @param {string} source - The video source (youtube, vimeo, upload)
 */
function openVideoLightbox(element, url, source) {
    // Create lightbox container if it doesn't exist
    let lightbox = document.getElementById('video-lightbox');
    
    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.id = 'video-lightbox';
        lightbox.className = 'video-lightbox';
        
        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'lightbox-close';
        closeBtn.innerHTML = '×';
        closeBtn.addEventListener('click', function() {
            lightbox.classList.remove('active');
        });
        
        lightbox.appendChild(closeBtn);
        
        // Add lightbox content container
        const content = document.createElement('div');
        content.className = 'lightbox-content';
        lightbox.appendChild(content);
        
        // Add to body
        document.body.appendChild(lightbox);
        
        // Add click outside to close
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                lightbox.classList.remove('active');
            }
        });
    }
    
    // Get content container
    const content = lightbox.querySelector('.lightbox-content');
    content.innerHTML = '';
    
    // Clone video container
    const videoContainer = element.querySelector('.video-container').cloneNode(true);
    
    // Force video to play in lightbox
    if (source === 'youtube' || source === 'vimeo') {
        const iframe = videoContainer.querySelector('iframe');
        if (iframe) {
            let src = iframe.getAttribute('src');
            if (src.includes('?')) {
                src += '&autoplay=1';
            } else {
                src += '?autoplay=1';
            }
            iframe.setAttribute('src', src);
        }
    } else if (source === 'upload') {
        const video = videoContainer.querySelector('video');
        if (video) {
            video.setAttribute('autoplay', 'true');
        }
    }
    
    content.appendChild(videoContainer);
    
    // Show lightbox
    lightbox.classList.add('active');
}

/**
 * Update embed parameters for YouTube and Vimeo videos
 * @param {HTMLElement} element - The component element
 */
function updateEmbedParameters(element) {
    const iframe = element.querySelector('iframe');
    const video = element.querySelector('video');
    
    if (iframe) {
        // Get current URL
        let src = iframe.getAttribute('src');
        const url = new URL(src);
        
        // Update parameters
        const autoplay = element.hasAttribute('data-autoplay');
        const loop = element.hasAttribute('data-loop');
        const muted = element.hasAttribute('data-muted');
        const showRelated = element.hasAttribute('data-showRelatedVideos');
        
        // YouTube parameters
        if (src.includes('youtube.com')) {
            url.searchParams.set('autoplay', autoplay ? '1' : '0');
            url.searchParams.set('mute', muted ? '1' : '0');
            url.searchParams.set('rel', showRelated ? '1' : '0');
            
            if (loop) {
                url.searchParams.set('loop', '1');
                // Need video ID for playlist parameter
                const videoId = src.split('embed/')[1].split('?')[0];
                url.searchParams.set('playlist', videoId);
            } else {
                url.searchParams.delete('loop');
                url.searchParams.delete('playlist');
            }
        }
        // Vimeo parameters
        else if (src.includes('vimeo.com')) {
            url.searchParams.set('autoplay', autoplay ? '1' : '0');
            url.searchParams.set('muted', muted ? '1' : '0');
            url.searchParams.set('loop', loop ? '1' : '0');
        }
        
        iframe.setAttribute('src', url.toString());
    } else if (video) {
        // Update HTML5 video parameters
        const autoplay = element.hasAttribute('data-autoplay');
        const loop = element.hasAttribute('data-loop');
        const muted = element.hasAttribute('data-muted');
        
        if (autoplay) {
            video.setAttribute('autoplay', 'true');
        } else {
            video.removeAttribute('autoplay');
        }
        
        if (loop) {
            video.setAttribute('loop', 'true');
        } else {
            video.removeAttribute('loop');
        }
        
        if (muted) {
            video.setAttribute('muted', 'true');
        } else {
            video.removeAttribute('muted');
        }
        
        // Update controls style
        const controlsStyle = element.getAttribute('data-player-controls');
        video.classList.remove('controls--minimal', 'controls--custom');
        
        if (controlsStyle === 'minimal' || controlsStyle === 'custom') {
            video.classList.add('controls--' + controlsStyle);
        }
    }
}

/**
 * Setup checkbox option
 * @param {string} property - The property name
 * @param {HTMLElement} element - The component element
 * @param {Function} callback - Optional callback to run when changed
 */
function setupCheckboxOption(property, element, callback) {
    const checkbox = document.querySelector(`[data-property="${property}"]`);
    if (!checkbox) return;
    
    // Get initial state
    checkbox.checked = element.hasAttribute(`data-${property}`);
    
    // Add change listener
    checkbox.addEventListener('change', function() {
        if (this.checked) {
            element.setAttribute(`data-${property}`, 'true');
        } else {
            element.removeAttribute(`data-${property}`);
        }
        
        // Run callback if provided
        if (callback) {
            callback(element);
        }
        
        // Trigger save
        const event = new Event('change', { bubbles: true });
        element.dispatchEvent(event);
    });
}

/**
 * Setup text content updater
 * @param {string} property - The property name
 * @param {string} selector - The element selector
 * @param {HTMLElement} component - The component element
 */
function setupTextContentUpdater(property, selector, component) {
    const input = document.querySelector(`[data-property="${property}"]`);
    if (!input) return;
    
    // Get initial value
    const element = component.querySelector(selector);
    if (element) {
        input.value = element.textContent.trim();
    }
    
    // Add input listener
    input.addEventListener('input', function() {
        const element = component.querySelector(selector);
        if (element) {
            element.textContent = this.value;
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            component.dispatchEvent(event);
        }
    });
}
