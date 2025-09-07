<?php
/**
 * Video Intro Component Design Panel
 * Settings and configuration options for the video-intro component
 */
?>
<div class="element-editor__title">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="23 7 16 12 23 17 23 7"></polygon>
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
    </svg>
    Video Introduction
</div>
<div class="element-editor__subtitle">Showcase your personality and expertise with a video</div>

<div class="form-section">
    <h4 class="form-section__title">Content</h4>
    
    <div class="form-group">
        <label class="form-label">Section Title</label>
        <input type="text" class="form-input" data-property="title" placeholder="Video Introduction">
    </div>
    
    <div class="form-group">
        <label class="form-label">Description</label>
        <textarea class="form-input form-textarea" data-property="description" rows="2" placeholder="Watch my introduction video to learn more about my work..."></textarea>
    </div>
</div>

<div class="form-section">
    <h4 class="form-section__title">Video</h4>
    
    <div class="form-group">
        <label class="form-label">Video URL</label>
        <input type="url" class="form-input" data-property="videoUrl" placeholder="https://www.youtube.com/watch?v=XXXXXXXXXXX">
        <p class="form-help-text">Enter a YouTube, Vimeo, or direct video file URL.</p>
    </div>
    
    <div class="form-group">
        <label class="form-label">Video Source</label>
        <select class="form-select" data-property="videoSource">
            <option value="youtube" selected>YouTube</option>
            <option value="vimeo">Vimeo</option>
            <option value="upload">Upload Video</option>
        </select>
    </div>
    
    <div class="form-group" id="upload-video-group">
        <label class="form-label">Upload Video</label>
        <div class="upload-control">
            <button class="upload-btn" id="upload-video-btn">Choose Video File</button>
            <span class="selected-file" id="selected-video-filename">No file selected</span>
        </div>
    </div>
    
    <div class="form-group">
        <label class="form-label">Thumbnail Image</label>
        <div class="upload-control">
            <button class="upload-btn" id="upload-thumbnail-btn">Choose Thumbnail</button>
            <span class="selected-file" id="selected-thumbnail-filename">No file selected</span>
        </div>
        <p class="form-help-text">Custom thumbnail for direct video uploads. Not needed for YouTube or Vimeo.</p>
    </div>
</div>

<div class="form-section">
    <h4 class="form-section__title">Display Settings</h4>
    
    <div class="form-group">
        <label class="form-label">Video Size</label>
        <select class="form-select" data-property="videoSize">
            <option value="responsive" selected>Responsive (Full Width)</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
            <option value="custom">Custom Size</option>
        </select>
    </div>
    
    <div class="form-group custom-size-group">
        <label class="form-label">Custom Width (pixels)</label>
        <input type="number" class="form-input" data-property="customWidth" placeholder="800">
    </div>
    
    <div class="form-group">
        <label class="form-label">Aspect Ratio</label>
        <select class="form-select" data-property="aspectRatio">
            <option value="16:9" selected>16:9 (Widescreen)</option>
            <option value="4:3">4:3 (Standard)</option>
            <option value="1:1">1:1 (Square)</option>
            <option value="9:16">9:16 (Vertical)</option>
        </select>
    </div>
    
    <div class="form-group">
        <label class="form-label">Player Controls</label>
        <select class="form-select" data-property="playerControls">
            <option value="default" selected>Default</option>
            <option value="minimal">Minimal</option>
            <option value="custom">Custom</option>
        </select>
    </div>
</div>

<div class="form-section">
    <h4 class="form-section__title">Playback Options</h4>
    
    <div class="form-group">
        <label class="form-label">
            <input type="checkbox" data-property="autoplay">
            Autoplay
        </label>
        <p class="form-help-text">Note: Modern browsers may block autoplay with sound.</p>
    </div>
    
    <div class="form-group">
        <label class="form-label">
            <input type="checkbox" data-property="loop">
            Loop Video
        </label>
    </div>
    
    <div class="form-group">
        <label class="form-label">
            <input type="checkbox" data-property="muted">
            Start Muted
        </label>
    </div>
    
    <div class="form-group">
        <label class="form-label">
            <input type="checkbox" data-property="showRelatedVideos">
            Show Related Videos (YouTube)
        </label>
    </div>
</div>

<div class="form-section">
    <h4 class="form-section__title">Advanced</h4>
    
    <div class="form-group">
        <label class="form-label">Layout</label>
        <select class="form-select" data-property="layout">
            <option value="standard" selected>Standard</option>
            <option value="with-text">Video with Text</option>
            <option value="side-by-side">Side by Side</option>
        </select>
    </div>
    
    <div class="form-group">
        <label class="form-label">
            <input type="checkbox" data-property="lightbox" checked>
            Enable Lightbox
        </label>
        <p class="form-help-text">Opens video in a lightbox when clicked.</p>
    </div>
    
    <div class="form-group">
        <label class="form-label">
            <input type="checkbox" data-property="lazyLoad" checked>
            Enable Lazy Loading
        </label>
    </div>
</div>
