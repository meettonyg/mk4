/**
 * Podcast Player Component Panel Script
 * Handles the dynamic functionality of the podcast player design panel
 */

// Register this component's panel handler
window.componentPanelHandlers = window.componentPanelHandlers || {};
window.componentPanelHandlers['podcast-player'] = function(element, schema) {
    initializePodcastPlayerPanel(element, schema);
};

/**
 * Initialize podcast player panel
 * @param {HTMLElement} element - The podcast player component element
 * @param {Object} schema - Component schema (optional)
 */
function initializePodcastPlayerPanel(element, schema) {
    // Log schema if available
    if (schema) {
        console.log('Podcast Player component schema:', schema);
    }
    
    // Setup episodes list
    setupEpisodesList(element);
    
    // Handle player style change
    const playerStyleSelect = document.querySelector('[data-property="playerStyle"]');
    if (playerStyleSelect) {
        // Get initial value
        const currentStyle = element.getAttribute('data-player-style') || 'standard';
        playerStyleSelect.value = currentStyle;
        
        // Add change listener
        playerStyleSelect.addEventListener('change', function() {
            // Update data attribute
            element.setAttribute('data-player-style', this.value);
            
            // Update classes
            element.classList.remove('player--standard', 'player--compact', 'player--expanded', 'player--minimal');
            element.classList.add('player--' + this.value);
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
    }
    
    // Handle display type change
    const displayTypeSelect = document.querySelector('[data-property="displayType"]');
    if (displayTypeSelect) {
        // Get initial value
        const currentDisplay = element.getAttribute('data-display-type') || 'list';
        displayTypeSelect.value = currentDisplay;
        
        // Add change listener
        displayTypeSelect.addEventListener('change', function() {
            // Update data attribute
            element.setAttribute('data-display-type', this.value);
            
            // Update classes
            element.classList.remove('display--list', 'display--grid', 'display--cards');
            element.classList.add('display--' + this.value);
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
    }
    
    // Handle episode count change
    const episodeCountSelect = document.querySelector('[data-property="episodeCount"]');
    if (episodeCountSelect) {
        // Get initial value
        const currentCount = element.getAttribute('data-episode-count') || '10';
        episodeCountSelect.value = currentCount;
        
        // Add change listener
        episodeCountSelect.addEventListener('change', function() {
            // Update data attribute
            element.setAttribute('data-episode-count', this.value);
            
            // Update episodes display
            updateEpisodeDisplay(element, this.value);
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
    }
    
    // Handle show/hide toggles
    setupToggleOption('showArtwork', '.episode-artwork', element);
    setupToggleOption('showDescription', '.episode-description', element);
    setupToggleOption('showDuration', '.episode-duration', element);
    setupToggleOption('showDate', '.episode-date', element);
    setupToggleOption('showSubscribeButtons', '.podcast-subscribe-buttons', element);
    
    // Handle autoplay toggle
    const autoplayCheckbox = document.querySelector('[data-property="autoplay"]');
    if (autoplayCheckbox) {
        // Get initial state
        autoplayCheckbox.checked = element.hasAttribute('data-autoplay');
        
        // Add change listener
        autoplayCheckbox.addEventListener('change', function() {
            if (this.checked) {
                element.setAttribute('data-autoplay', 'true');
                
                // Update audio elements
                const audioElements = element.querySelectorAll('audio');
                audioElements.forEach(audio => {
                    audio.setAttribute('autoplay', '');
                });
            } else {
                element.removeAttribute('data-autoplay');
                
                // Update audio elements
                const audioElements = element.querySelectorAll('audio');
                audioElements.forEach(audio => {
                    audio.removeAttribute('autoplay');
                });
            }
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
    }
    
    // Handle subscribe platform toggles
    setupSubscribePlatformToggle('showApplePodcasts', '.subscribe-apple', element);
    setupSubscribePlatformToggle('showSpotify', '.subscribe-spotify', element);
    setupSubscribePlatformToggle('showGooglePodcasts', '.subscribe-google', element);
    setupSubscribePlatformToggle('showRss', '.subscribe-rss', element);
    
    // Setup primary color picker
    setupColorPicker('primaryColor', element, function(color) {
        element.style.setProperty('--podcast-primary-color', color);
        
        // Update play buttons
        const playButtons = element.querySelectorAll('.play-button');
        playButtons.forEach(button => {
            button.style.backgroundColor = color;
        });
        
        // Update progress bars
        const progressBars = element.querySelectorAll('.progress-bar');
        progressBars.forEach(bar => {
            bar.style.setProperty('--progress-color', color);
        });
    });
    
    // Handle import from RSS button
    const importFeedBtn = document.getElementById('import-feed-btn');
    if (importFeedBtn) {
        importFeedBtn.addEventListener('click', function() {
            const rssUrlInput = document.querySelector('[data-property="podcastRssUrl"]');
            if (rssUrlInput && rssUrlInput.value) {
                // In a real implementation, this would fetch and parse the RSS feed
                alert('This would import episodes from: ' + rssUrlInput.value);
                
                // For now, we'll just add a sample episode
                const episodesList = document.getElementById('design-episodes-list');
                if (episodesList) {
                    const newIndex = episodesList.children.length;
                    const episodeItem = addEpisodeToPanel(
                        'New Imported Episode',
                        'This is an imported episode from the RSS feed.',
                        '30:00',
                        new Date().toISOString().split('T')[0],
                        '',
                        '',
                        newIndex
                    );
                    
                    // Update component
                    updateEpisodesInComponent(element);
                }
            } else {
                alert('Please enter a valid RSS feed URL first.');
            }
        });
    }
    
    // Setup text content updaters
    setupTextContentUpdater('title', '.podcast-section-title', element);
    setupTextContentUpdater('description', '.podcast-section-description', element);
    setupTextContentUpdater('podcastName', '.podcast-name', element);
    
    // Handle podcast ID/URL inputs
    updatePodcastLinks('podcastAppleId', 'apple', element);
    updatePodcastLinks('podcastSpotifyId', 'spotify', element);
    updatePodcastLinks('podcastGoogleUrl', 'google', element);
    updatePodcastLinks('podcastRssUrl', 'rss', element);
}

/**
 * Setup episodes list functionality
 * @param {HTMLElement} element - The component element
 */
function setupEpisodesList(element) {
    const episodesList = document.getElementById('design-episodes-list');
    const addEpisodeBtn = document.getElementById('add-episode-btn');
    
    if (!episodesList || !addEpisodeBtn) return;
    
    // Load existing episodes
    const existingEpisodes = element.querySelectorAll('.episode-item');
    episodesList.innerHTML = '';
    
    existingEpisodes.forEach((episode, index) => {
        const title = episode.querySelector('.episode-title')?.textContent || '';
        const description = episode.querySelector('.episode-description')?.textContent || '';
        const duration = episode.querySelector('.episode-duration')?.textContent || '';
        const date = episode.querySelector('.episode-date')?.textContent || '';
        const audioSrc = episode.querySelector('audio')?.getAttribute('src') || '';
        const artworkSrc = episode.querySelector('.episode-artwork img')?.getAttribute('src') || '';
        
        addEpisodeToPanel(title, description, duration, date, audioSrc, artworkSrc, index);
    });
    
    // Add episode button handler
    addEpisodeBtn.addEventListener('click', function() {
        const newIndex = episodesList.children.length;
        const episodeItem = addEpisodeToPanel(
            'New Episode Title',
            'Episode description goes here...',
            '25:00',
            new Date().toISOString().split('T')[0],
            '',
            '',
            newIndex
        );
        
        // Focus the first input
        const input = episodeItem.querySelector('input');
        if (input) {
            input.focus();
            input.select();
        }
        
        // Update component
        updateEpisodesInComponent(element);
    });
}

/**
 * Add an episode to the design panel
 * @param {string} title - Episode title
 * @param {string} description - Episode description
 * @param {string} duration - Episode duration
 * @param {string} date - Episode date
 * @param {string} audioSrc - Audio source URL
 * @param {string} artworkSrc - Artwork image source URL
 * @param {number} index - Episode index
 * @returns {HTMLElement} - The episode item element
 */
function addEpisodeToPanel(title, description, duration, date, audioSrc, artworkSrc, index) {
    const episodesList = document.getElementById('design-episodes-list');
    const episodeItem = document.createElement('div');
    episodeItem.className = 'episode-editor-item';
    episodeItem.innerHTML = `
        <div class="episode-editor-header">
            <h4>Episode ${index + 1}</h4>
            <button class="remove-item-btn" title="Remove episode">×</button>
        </div>
        <div class="episode-editor-content">
            <div class="form-group">
                <label class="form-label">Title</label>
                <input type="text" class="form-input" value="${escapeHtml(title)}" data-episode-title="${index}">
            </div>
            <div class="form-group">
                <label class="form-label">Description</label>
                <textarea class="form-input form-textarea" rows="2" data-episode-description="${index}">${escapeHtml(description)}</textarea>
            </div>
            <div class="episode-meta-inputs">
                <div class="form-group">
                    <label class="form-label">Duration</label>
                    <input type="text" class="form-input" value="${escapeHtml(duration)}" data-episode-duration="${index}" placeholder="MM:SS">
                </div>
                <div class="form-group">
                    <label class="form-label">Date</label>
                    <input type="date" class="form-input" value="${escapeHtml(date)}" data-episode-date="${index}">
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Audio File</label>
                <div class="audio-upload-control">
                    <button class="upload-audio-btn" data-episode-index="${index}">Choose Audio File</button>
                    <span class="selected-audio">${audioSrc ? 'Audio file selected' : 'No audio file selected'}</span>
                </div>
                <input type="hidden" data-episode-audio="${index}" value="${escapeHtml(audioSrc)}">
            </div>
            <div class="form-group">
                <label class="form-label">Episode Artwork</label>
                <div class="image-upload-control">
                    <button class="upload-image-btn" data-episode-index="${index}">Choose Image</button>
                    <span class="selected-image">${artworkSrc ? 'Image selected' : 'No image selected'}</span>
                </div>
                <input type="hidden" data-episode-artwork="${index}" value="${escapeHtml(artworkSrc)}">
            </div>
        </div>
    `;
    
    // Input handlers
    const inputs = episodeItem.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            updateEpisodesInComponent(document.querySelector('.editable-element--selected'));
        });
    });
    
    // Audio upload handler
    const uploadAudioBtn = episodeItem.querySelector('.upload-audio-btn');
    if (uploadAudioBtn) {
        uploadAudioBtn.addEventListener('click', function() {
            // This would typically use the WordPress media uploader
            alert('Audio upload functionality would open media browser here');
            
            // Simulating an audio file selection
            const audioInput = episodeItem.querySelector(`[data-episode-audio="${index}"]`);
            const selectedAudio = episodeItem.querySelector('.selected-audio');
            
            if (audioInput && selectedAudio) {
                // For demonstration, we'll use a placeholder audio URL
                const placeholderAudio = 'https://example.com/podcast-episode.mp3';
                audioInput.value = placeholderAudio;
                selectedAudio.textContent = 'Audio file selected';
                
                // Update component
                updateEpisodesInComponent(document.querySelector('.editable-element--selected'));
            }
        });
    }
    
    // Image upload handler
    const uploadImageBtn = episodeItem.querySelector('.upload-image-btn');
    if (uploadImageBtn) {
        uploadImageBtn.addEventListener('click', function() {
            // This would typically use the WordPress media uploader
            alert('Image upload functionality would open media browser here');
            
            // Simulating an image selection
            const artworkInput = episodeItem.querySelector(`[data-episode-artwork="${index}"]`);
            const selectedImage = episodeItem.querySelector('.selected-image');
            
            if (artworkInput && selectedImage) {
                // For demonstration, we'll use a placeholder image URL
                const placeholderImage = 'https://via.placeholder.com/300x300?text=Episode+Artwork';
                artworkInput.value = placeholderImage;
                selectedImage.textContent = 'Image selected';
                
                // Update component
                updateEpisodesInComponent(document.querySelector('.editable-element--selected'));
            }
        });
    }
    
    // Remove button handler
    const removeBtn = episodeItem.querySelector('.remove-item-btn');
    removeBtn.addEventListener('click', function() {
        episodeItem.remove();
        updateEpisodesInComponent(document.querySelector('.editable-element--selected'));
    });
    
    episodesList.appendChild(episodeItem);
    return episodeItem;
}

/**
 * Update episodes in the component based on panel inputs
 * @param {HTMLElement} element - The component element
 */
function updateEpisodesInComponent(element) {
    if (!element) return;
    
    const episodesContainer = element.querySelector('.episodes-container');
    if (!episodesContainer) return;
    
    const episodeItems = document.querySelectorAll('.episode-editor-item');
    
    // Clear existing episodes
    episodesContainer.innerHTML = '';
    
    // Add episodes from panel
    episodeItems.forEach((item, index) => {
        const titleInput = item.querySelector(`[data-episode-title="${index}"]`);
        const descInput = item.querySelector(`[data-episode-description="${index}"]`);
        const durationInput = item.querySelector(`[data-episode-duration="${index}"]`);
        const dateInput = item.querySelector(`[data-episode-date="${index}"]`);
        const audioInput = item.querySelector(`[data-episode-audio="${index}"]`);
        const artworkInput = item.querySelector(`[data-episode-artwork="${index}"]`);
        
        if (titleInput && descInput) {
            const episodeDiv = document.createElement('div');
            episodeDiv.className = 'episode-item';
            
            // Format date
            let formattedDate = '';
            if (dateInput && dateInput.value) {
                const date = new Date(dateInput.value);
                formattedDate = date.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
            }
            
            // Build episode HTML
            episodeDiv.innerHTML = `
                <div class="episode-header">
                    <div class="episode-artwork">
                        ${artworkInput && artworkInput.value 
                            ? `<img src="${escapeHtml(artworkInput.value)}" alt="${escapeHtml(titleInput.value)} Artwork">` 
                            : '<div class="artwork-placeholder"></div>'}
                    </div>
                    <div class="episode-info">
                        <h3 class="episode-title" contenteditable="true">${escapeHtml(titleInput.value)}</h3>
                        <div class="episode-meta">
                            ${dateInput && dateInput.value ? `<span class="episode-date">${formattedDate}</span>` : ''}
                            ${durationInput && durationInput.value ? `<span class="episode-duration">${escapeHtml(durationInput.value)}</span>` : ''}
                        </div>
                    </div>
                    <div class="episode-controls">
                        <button class="play-button" aria-label="Play episode">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="episode-content">
                    <div class="episode-description" contenteditable="true">${escapeHtml(descInput.value)}</div>
                    <div class="episode-player">
                        <audio controls ${element.hasAttribute('data-autoplay') ? 'autoplay' : ''} preload="none">
                            ${audioInput && audioInput.value ? `<source src="${escapeHtml(audioInput.value)}" type="audio/mpeg">` : ''}
                            Your browser does not support the audio element.
                        </audio>
                        <div class="progress-container">
                            <div class="progress-bar" style="width: 0%"></div>
                        </div>
                    </div>
                </div>
            `;
            
            episodesContainer.appendChild(episodeDiv);
        }
    });
    
    // Apply episode count limit
    updateEpisodeDisplay(element, element.getAttribute('data-episode-count') || '10');
    
    // Trigger save
    const event = new Event('change', { bubbles: true });
    element.dispatchEvent(event);
}

/**
 * Update episode display based on count setting
 * @param {HTMLElement} element - The component element
 * @param {string} count - Number of episodes to show
 */
function updateEpisodeDisplay(element, count) {
    const episodes = element.querySelectorAll('.episode-item');
    
    if (count === 'all') {
        // Show all episodes
        episodes.forEach(episode => {
            episode.style.display = '';
        });
    } else {
        // Show limited number of episodes
        const limit = parseInt(count, 10);
        episodes.forEach((episode, index) => {
            episode.style.display = index < limit ? '' : 'none';
        });
    }
}

/**
 * Setup toggle option
 * @param {string} property - The property name
 * @param {string} selector - The element selector
 * @param {HTMLElement} element - The component element
 */
function setupToggleOption(property, selector, element) {
    const checkbox = document.querySelector(`[data-property="${property}"]`);
    if (!checkbox) return;
    
    // Get initial state
    const items = element.querySelectorAll(selector);
    if (items.length > 0) {
        checkbox.checked = items[0].style.display !== 'none';
    }
    
    // Add change listener
    checkbox.addEventListener('change', function() {
        const items = element.querySelectorAll(selector);
        items.forEach(item => {
            item.style.display = this.checked ? '' : 'none';
        });
        
        // Trigger save
        const event = new Event('change', { bubbles: true });
        element.dispatchEvent(event);
    });
}

/**
 * Setup subscribe platform toggle
 * @param {string} property - The property name
 * @param {string} selector - The element selector
 * @param {HTMLElement} element - The component element
 */
function setupSubscribePlatformToggle(property, selector, element) {
    const checkbox = document.querySelector(`[data-property="${property}"]`);
    if (!checkbox) return;
    
    // Get initial state
    const platformBtn = element.querySelector(selector);
    if (platformBtn) {
        checkbox.checked = platformBtn.style.display !== 'none';
    }
    
    // Add change listener
    checkbox.addEventListener('change', function() {
        const platformBtn = element.querySelector(selector);
        if (platformBtn) {
            platformBtn.style.display = this.checked ? '' : 'none';
        }
        
        // Trigger save
        const event = new Event('change', { bubbles: true });
        element.dispatchEvent(event);
    });
}

/**
 * Update podcast links
 * @param {string} property - The property name
 * @param {string} platform - The platform name
 * @param {HTMLElement} element - The component element
 */
function updatePodcastLinks(property, platform, element) {
    const input = document.querySelector(`[data-property="${property}"]`);
    if (!input) return;
    
    // Get initial value
    const link = element.querySelector(`.subscribe-${platform}`);
    if (link) {
        const href = link.getAttribute('href');
        if (href) input.value = href;
    }
    
    // Add input listener
    input.addEventListener('input', function() {
        const link = element.querySelector(`.subscribe-${platform}`);
        if (link) {
            let href = this.value;
            
            // Format links based on platform
            if (platform === 'apple' && !href.includes('//')) {
                href = `https://podcasts.apple.com/podcast/id${href}`;
            } else if (platform === 'spotify' && !href.includes('//')) {
                href = `https://open.spotify.com/show/${href}`;
            }
            
            link.setAttribute('href', href);
            
            // Show/hide based on value
            link.style.display = href ? '' : 'none';
            
            // Update related checkbox
            const relatedCheckbox = document.querySelector(`[data-property="show${platform.charAt(0).toUpperCase() + platform.slice(1)}Podcasts"]`);
            if (relatedCheckbox) {
                relatedCheckbox.disabled = !href;
                if (!href) relatedCheckbox.checked = false;
            }
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        }
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

/**
 * Setup a color picker
 * @param {string} property - The property name
 * @param {HTMLElement} element - The component element
 * @param {Function} applyCallback - Callback to apply the color
 */
function setupColorPicker(property, element, applyCallback) {
    const colorInput = document.querySelector(`[data-property="${property}"]`);
    const textInput = colorInput?.nextElementSibling;
    
    if (!colorInput || !textInput) return;
    
    // Get current color if available
    const currentColor = getComputedStyle(element).getPropertyValue('--podcast-primary-color');
    if (currentColor && currentColor !== '') {
        const hex = rgbToHex(currentColor);
        colorInput.value = hex;
        textInput.value = hex;
    }
    
    // Sync color and text inputs
    colorInput.addEventListener('input', function() {
        textInput.value = this.value;
        if (applyCallback) {
            applyCallback(this.value);
        }
        
        // Trigger save
        const event = new Event('change', { bubbles: true });
        element.dispatchEvent(event);
    });
    
    textInput.addEventListener('input', function() {
        // Validate hex color
        if (/^#[0-9A-F]{6}$/i.test(this.value)) {
            colorInput.value = this.value;
            if (applyCallback) {
                applyCallback(this.value);
            }
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        }
    });
}

/**
 * Convert RGB to HEX color
 * @param {string} rgb - RGB color string
 * @returns {string} - HEX color string
 */
function rgbToHex(rgb) {
    // If already a hex color, return as is
    if (rgb.startsWith('#')) {
        return rgb;
    }
    
    // Extract RGB values
    const rgbMatch = rgb.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
    if (!rgbMatch) return '#4f46e5'; // Default color
    
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

/**
 * Escape HTML for safe insertion
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
