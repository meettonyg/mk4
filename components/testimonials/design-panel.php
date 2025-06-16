<?php
/**
 * Testimonials Component Design Panel
 * Settings and configuration options for the testimonials component
 */
?>
<div class="element-editor__title">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
    Testimonials
</div>
<div class="element-editor__subtitle">Showcase feedback and recommendations from clients and colleagues</div>

<div class="form-section">
    <h4 class="form-section__title">Content</h4>
    
    <div class="form-group">
        <label class="form-label">Section Title</label>
        <input type="text" class="form-input" data-property="title" placeholder="Testimonials">
    </div>
    
    <div class="form-group">
        <label class="form-label">Description</label>
        <textarea class="form-input form-textarea" data-property="description" rows="2" placeholder="What others are saying about my work..."></textarea>
    </div>
</div>

<div class="form-section">
    <h4 class="form-section__title">Testimonials</h4>
    
    <div class="testimonials-list" id="design-testimonials-list">
        <!-- Testimonials will be dynamically added here -->
    </div>
    
    <button class="add-item-btn" id="add-testimonial-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Add Testimonial
    </button>
</div>

<div class="form-section">
    <h4 class="form-section__title">Layout</h4>
    
    <div class="form-group">
        <label class="form-label">Display Style</label>
        <select class="form-select" data-property="displayStyle">
            <option value="grid" selected>Grid</option>
            <option value="carousel">Carousel</option>
            <option value="list">List</option>
        </select>
    </div>
    
    <div class="form-group">
        <label class="form-label">Columns</label>
        <select class="form-select" data-property="columns">
            <option value="1">1 Column</option>
            <option value="2" selected>2 Columns</option>
            <option value="3">3 Columns</option>
        </select>
    </div>
    
    <div class="form-group">
        <label class="form-label">Card Size</label>
        <select class="form-select" data-property="cardSize">
            <option value="small">Small</option>
            <option value="medium" selected>Medium</option>
            <option value="large">Large</option>
        </select>
    </div>
</div>

<div class="form-section">
    <h4 class="form-section__title">Appearance</h4>
    
    <div class="form-group">
        <label class="form-label">Card Style</label>
        <select class="form-select" data-property="cardStyle">
            <option value="default" selected>Default</option>
            <option value="minimal">Minimal</option>
            <option value="bordered">Bordered</option>
            <option value="shadowed">Shadowed</option>
        </select>
    </div>
    
    <div class="form-group">
        <label class="form-label">Quote Style</label>
        <select class="form-select" data-property="quoteStyle">
            <option value="default" selected>Default</option>
            <option value="large-quotes">Large Quotes</option>
            <option value="minimal">Minimal</option>
            <option value="none">No Quotes</option>
        </select>
    </div>
    
    <div class="form-group">
        <label class="form-label">Color Theme</label>
        <select class="form-select" data-property="colorTheme">
            <option value="light" selected>Light</option>
            <option value="dark">Dark</option>
            <option value="accent">Accent</option>
            <option value="custom">Custom</option>
        </select>
    </div>
    
    <div class="form-group">
        <label class="form-label">Accent Color</label>
        <div class="color-picker">
            <input type="color" class="color-input" data-property="accentColor" value="#4f46e5">
            <input type="text" class="form-input" value="#4f46e5" style="flex: 1;">
        </div>
    </div>
</div>

<div class="form-section">
    <h4 class="form-section__title">Author Display</h4>
    
    <div class="form-group">
        <label class="form-label">
            <input type="checkbox" data-property="showAuthorImage" checked>
            Show Author Images
        </label>
    </div>
    
    <div class="form-group">
        <label class="form-label">
            <input type="checkbox" data-property="showAuthorTitle" checked>
            Show Author Titles/Positions
        </label>
    </div>
    
    <div class="form-group">
        <label class="form-label">Author Image Style</label>
        <select class="form-select" data-property="authorImageStyle">
            <option value="circle" selected>Circle</option>
            <option value="square">Square</option>
            <option value="rounded">Rounded</option>
            <option value="none">No Border</option>
        </select>
    </div>
</div>

<div class="form-section">
    <h4 class="form-section__title">Carousel Settings</h4>
    
    <div class="form-group">
        <label class="form-label">Auto-Play</label>
        <div class="toggle-switch">
            <input type="checkbox" id="carousel-autoplay" data-property="carouselAutoplay">
            <label for="carousel-autoplay"></label>
        </div>
    </div>
    
    <div class="form-group">
        <label class="form-label">Speed</label>
        <select class="form-select" data-property="carouselSpeed">
            <option value="slow">Slow</option>
            <option value="medium" selected>Medium</option>
            <option value="fast">Fast</option>
        </select>
    </div>
    
    <div class="form-group">
        <label class="form-label">Navigation</label>
        <select class="form-select" data-property="carouselNavigation">
            <option value="dots">Dots</option>
            <option value="arrows">Arrows</option>
            <option value="both" selected>Dots & Arrows</option>
            <option value="none">None</option>
        </select>
    </div>
</div>
