<?php
/**
 * Logo Grid Component Design Panel
 * Settings and configuration options for the logo-grid component
 */
?>
<div class="element-editor__title">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
    </svg>
    Logo Grid
</div>
<div class="element-editor__subtitle">Showcase companies and organizations you've worked with</div>

<div class="form-section">
    <h4 class="form-section__title">Content</h4>
    
    <div class="form-group">
        <label class="form-label">Section Title</label>
        <input type="text" class="form-input" data-property="title" placeholder="Featured In">
    </div>
    
    <div class="form-group">
        <label class="form-label">Description</label>
        <textarea class="form-input form-textarea" data-property="description" rows="2" placeholder="Companies and organizations I've worked with..."></textarea>
    </div>
</div>

<div class="form-section">
    <h4 class="form-section__title">Logos</h4>
    
    <div class="logos-list" id="design-logos-list">
        <!-- Logos will be dynamically added here -->
    </div>
    
    <button class="add-item-btn" id="add-logo-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Add Logo
    </button>
</div>

<div class="form-section">
    <h4 class="form-section__title">Layout</h4>
    
    <div class="form-group">
        <label class="form-label">Columns</label>
        <select class="form-select" data-property="columns">
            <option value="3">3 Columns</option>
            <option value="4" selected>4 Columns</option>
            <option value="5">5 Columns</option>
            <option value="6">6 Columns</option>
        </select>
    </div>
    
    <div class="form-group">
        <label class="form-label">Display Style</label>
        <select class="form-select" data-property="displayStyle">
            <option value="grid">Grid</option>
            <option value="slider">Carousel Slider</option>
            <option value="masonry">Masonry</option>
        </select>
    </div>
    
    <div class="form-group">
        <label class="form-label">
            <input type="checkbox" data-property="showNames" checked>
            Show Logo Names
        </label>
    </div>
</div>

<div class="form-section">
    <h4 class="form-section__title">Appearance</h4>
    
    <div class="form-group">
        <label class="form-label">Logo Size</label>
        <select class="form-select" data-property="logoSize">
            <option value="small">Small</option>
            <option value="medium" selected>Medium</option>
            <option value="large">Large</option>
        </select>
    </div>
    
    <div class="form-group">
        <label class="form-label">Logo Style</label>
        <select class="form-select" data-property="logoStyle">
            <option value="default">Default</option>
            <option value="grayscale">Grayscale</option>
            <option value="colored">Colored</option>
            <option value="outlined">Outlined</option>
        </select>
    </div>
    
    <div class="form-group">
        <label class="form-label">Background Style</label>
        <select class="form-select" data-property="backgroundStyle">
            <option value="transparent">Transparent</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="branded">Branded</option>
        </select>
    </div>
    
    <div class="form-group">
        <label class="form-label">
            <input type="checkbox" data-property="addBorders">
            Add Borders Around Logos
        </label>
    </div>
</div>

<div class="form-section">
    <h4 class="form-section__title">Animation</h4>
    
    <div class="form-group">
        <label class="form-label">Animation</label>
        <select class="form-select" data-property="animation">
            <option value="none">None</option>
            <option value="fade">Fade In</option>
            <option value="slide">Slide In</option>
            <option value="zoom">Zoom In</option>
        </select>
    </div>
    
    <div class="form-group">
        <label class="form-label">
            <input type="checkbox" data-property="autoScroll">
            Auto-Scroll Logos (Carousel Mode)
        </label>
    </div>
</div>
