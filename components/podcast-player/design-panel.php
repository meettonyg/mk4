<?php
/**
 * Podcast Player Component Design Panel
 * Settings and configuration options for the podcast-player component
 */
?>
<div class="element-editor__title">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
    </svg>
    Podcast Player
</div>
<div class="element-editor__subtitle">Showcase your podcast episodes and audio content</div>

<div class="form-section">
    <h4 class="form-section__title">General Settings</h4>
    
    <div class="form-group">
        <label class="form-label">Section Title</label>
        <input type="text" class="form-input" data-property="title" placeholder="Podcast Episodes">
    </div>
    
    <div class="form-group">
        <label class="form-label">Description</label>
        <textarea class="form-input form-textarea" data-property="description" rows="2" placeholder="Listen to my latest podcast episodes..."></textarea>
    </div>
</div>

<div class="form-section">
    <h4 class="form-section__title">Podcast Information</h4>
    
    <div class="form-group">
        <label class="form-label">Podcast Name</label>
        <input type="text" class="form-input" data-property="podcastName" placeholder="My Awesome Podcast">
    </div>
    
    <div class="form-group">
        <label class="form-label">Podcast RSS Feed URL</label>
        <input type="url" class="form-input" data-property="podcastRssUrl" placeholder="https://example.com/feed.xml">
        <p class="form-help-text">Enter your podcast RSS feed URL to enable subscribe buttons.</p>
    </div>
    
    <div class="form-group">
        <label class="form-label">Apple Podcasts ID</label>
        <input type="text" class="form-input" data-property="podcastAppleId" placeholder="1234567890">
    </div>
    
    <div class="form-group">
        <label class="form-label">Spotify Show ID</label>
        <input type="text" class="form-input" data-property="podcastSpotifyId" placeholder="1a2b3c4d5e">
    </div>
    
    <div class="form-group">
        <label class="form-label">Google Podcasts URL</label>
        <input type="url" class="form-input" data-property="podcastGoogleUrl" placeholder="https://podcasts.google.com/...">
    </div>
</div>

<div class="form-section">
    <h4 class="form-section__title">Episodes</h4>
    
    <div class="episodes-list" id="design-episodes-list">
        <!-- Episodes will be dynamically added here -->
    </div>
    
    <div class="form-actions">
        <button class="add-item-btn" id="add-episode-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Episode
        </button>
        
        <button class="import-btn" id="import-feed-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 8l-5-5-5 5M12 3v12"></path>
            </svg>
            Import from RSS
        </button>
    </div>
</div>

<div class="form-section">
    <h4 class="form-section__title">Player Settings</h4>
    
    <div class="form-group">
        <label class="form-label">Player Style</label>
        <select class="form-select" data-property="playerStyle">
            <option value="standard">Standard</option>
            <option value="compact">Compact</option>
            <option value="expanded">Expanded</option>
            <option value="minimal">Minimal</option>
        </select>
    </div>
    
    <div class="form-group">
        <label class="form-label">Primary Color</label>
        <div class="color-picker">
            <input type="color" class="color-input" data-property="primaryColor" value="#4f46e5">
            <input type="text" class="form-input" value="#4f46e5" style="flex: 1;">
        </div>
    </div>
    
    <div class="form-group">
        <label class="form-label">Display Type</label>
        <select class="form-select" data-property="displayType">
            <option value="list">List View</option>
            <option value="grid">Grid View</option>
            <option value="cards">Card View</option>
        </select>
    </div>
    
    <div class="form-group">
        <label class="form-label">
            <input type="checkbox" data-property="showArtwork" checked>
            Show Episode Artwork
        </label>
    </div>
    
    <div class="form-group">
        <label class="form-label">
            <input type="checkbox" data-property="showDescription" checked>
            Show Episode Description
        </label>
    </div>
    
    <div class="form-group">
        <label class="form-label">
            <input type="checkbox" data-property="showDuration" checked>
            Show Episode Duration
        </label>
    </div>
    
    <div class="form-group">
        <label class="form-label">
            <input type="checkbox" data-property="showDate" checked>
            Show Episode Date
        </label>
    </div>
    
    <div class="form-group">
        <label class="form-label">
            <input type="checkbox" data-property="autoplay">
            Enable Autoplay
        </label>
    </div>
    
    <div class="form-group">
        <label class="form-label">Number of Episodes to Display</label>
        <select class="form-select" data-property="episodeCount">
            <option value="3">3 Episodes</option>
            <option value="5">5 Episodes</option>
            <option value="10" selected>10 Episodes</option>
            <option value="all">All Episodes</option>
        </select>
    </div>
</div>

<div class="form-section">
    <h4 class="form-section__title">Subscribe Options</h4>
    
    <div class="form-group">
        <label class="form-label">
            <input type="checkbox" data-property="showSubscribeButtons" checked>
            Show Subscribe Buttons
        </label>
    </div>
    
    <div class="form-group">
        <label class="form-label">Subscribe Platforms</label>
        <div class="checkbox-group">
            <label>
                <input type="checkbox" data-property="showApplePodcasts" checked>
                Apple Podcasts
            </label>
            <label>
                <input type="checkbox" data-property="showSpotify" checked>
                Spotify
            </label>
            <label>
                <input type="checkbox" data-property="showGooglePodcasts" checked>
                Google Podcasts
            </label>
            <label>
                <input type="checkbox" data-property="showRss" checked>
                RSS
            </label>
        </div>
    </div>
</div>
