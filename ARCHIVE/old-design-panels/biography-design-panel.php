<?php
/**
 * Biography Component Design Panel
 * Settings and configuration options for the biography component
 */
?>
<div class="element-editor__title">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
    Biography
</div>
<div class="element-editor__subtitle">Customize your professional biography section</div>

<div class="form-section">
    <h4 class="form-section__title">Content</h4>
    
    <div class="form-group">
        <label class="form-label">Section Title</label>
        <input type="text" class="form-input" data-property="section_title" placeholder="About Me">
    </div>
    
    <div class="form-group">
        <label class="form-label">Biography Text</label>
        <textarea class="form-input form-textarea" data-property="content" rows="6" placeholder="Write your professional biography here..."></textarea>
        <p class="form-help-text">Craft a compelling narrative about your professional journey, expertise, and unique perspective.</p>
    </div>
</div>

<div class="form-section">
    <h4 class="form-section__title">Appearance</h4>
    
    <div class="form-group">
        <label class="form-label">Style</label>
        <select class="form-select" data-property="style">
            <option value="standard">Standard</option>
            <option value="featured">Featured (with background)</option>
            <option value="bordered">Bordered</option>
        </select>
    </div>
    
    <div class="form-group">
        <label class="form-label">
            <input type="checkbox" data-property="show_section_title" checked>
            Show Section Title
        </label>
    </div>
</div>
