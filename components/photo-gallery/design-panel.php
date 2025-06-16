<?php
/**
 * Photo Gallery Component Design Panel
 * Settings and configuration options for the photo-gallery component
 */
?>
<div class="element-editor__title">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
    </svg>
    Photo Gallery
</div>
<div class="element-editor__subtitle">Showcase your professional photos and portfolio</div>

<div class="form-section">
    <h4 class="form-section__title">Content</h4>
    
    <div class="form-group">
        <label class="form-label">Gallery Title</label>
        <input type="text" class="form-input" data-property="title" placeholder="Photo Gallery">
    </div>
    
    <div class="form-group">
        <label class="form-label">Description</label>
        <textarea class="form-input form-textarea" data-property="description" rows="2" placeholder="A collection of my professional photos..."></textarea>
    </div>
</div>

<div class="form-section">
    <h4 class="form-section__title">Photos</h4>
    
    <div class="photos-list" id="design-photos-list">
        <!-- Photos will be dynamically added here -->
    </div>
    
    <button class="add-item-btn" id="add-photo-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Add Photo
    </button>
</div>

<div class="form-section">
    <h4 class="form-section__title">Layout</h4>
    
    <div class="form-group">
        <label class="form-label">Gallery Layout</label>
        <select class="form-select" data-property="galleryLayout">
            <option value="grid">Grid</option>
            <option value="masonry">Masonry</option>
            <option value="carousel">Carousel</option>
            <option value="fullwidth">Full Width</option>
        </select>
    </div>
    
    <div class="form-group">
        <label class="form-label">Columns</label>
        <select class="form-select" data-property="columns">
            <option value="2">2 Columns</option>
            <option value="3" selected>3 Columns</option>
            <option value="4">4 Columns</option>
            <option value="5">5 Columns</option>
        </select>
    </div>
    
    <div class="form-group">
        <label class="form-label">Image Size</label>
        <select class="form-select" data-property="imageSize">
            <option value="small">Small</option>
            <option value="medium" selected>Medium</option>
            <option value="large">Large</option>
        </select>
    </div>
    
    <div class="form-group">
        <label class="form-label">Aspect Ratio</label>
        <select class="form-select" data-property="aspectRatio">
            <option value="auto">Auto (Original)</option>
            <option value="1:1">Square (1:1)</option>
            <option value="4:3">Standard (4:3)</option>
            <option value="16:9">Widescreen (16:9)</option>
            <option value="3:4">Portrait (3:4)</option>
        </select>
    </div>
</div>

<div class="form-section">
    <h4 class="form-section__title">Appearance</h4>
    
    <div class="form-group">
        <label class="form-label">Image Style</label>
        <select class="form-select" data-property="imageStyle">
            <option value="standard">Standard</option>
            <option value="rounded">Rounded Corners</option>
            <option value="circle">Circle (for square images)</option>
            <option value="polaroid">Polaroid</option>
            <option value="shadow">Shadow</option>
        </select>
    </div>
    
    <div class="form-group">
        <label class="form-label">Spacing</label>
        <select class="form-select" data-property="spacing">
            <option value="none">No Spacing</option>
            <option value="small">Small</option>
            <option value="medium" selected>Medium</option>
            <option value="large">Large</option>
        </select>
    </div>
    
    <div class="form-group">
        <label class="form-label">
            <input type="checkbox" data-property="showCaptions" checked>
            Show Image Captions
        </label>
    </div>
    
    <div class="form-group">
        <label class="form-label">
            <input type="checkbox" data-property="enableLightbox" checked>
            Enable Lightbox
        </label>
    </div>
</div>

<div class="form-section">
    <h4 class="form-section__title">Advanced</h4>
    
    <div class="form-group">
        <label class="form-label">Animation</label>
        <select class="form-select" data-property="animation">
            <option value="none">None</option>
            <option value="fade">Fade In</option>
            <option value="zoom">Zoom In</option>
            <option value="slide">Slide In</option>
        </select>
    </div>
    
    <div class="form-group">
        <label class="form-label">
            <input type="checkbox" data-property="lazyLoad" checked>
            Enable Lazy Loading
        </label>
    </div>
    
    <div class="form-group">
        <label class="form-label">
            <input type="checkbox" data-property="showDownloadButton">
            Show Download Button
        </label>
    </div>
</div>
