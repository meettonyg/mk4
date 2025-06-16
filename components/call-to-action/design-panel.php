<?php
/**
 * Call to Action Component Design Panel
 * Settings and configuration options for the call-to-action component
 */
?>
<div class="element-editor__title">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 16 16 12 12 8"></polyline>
        <line x1="8" y1="12" x2="16" y2="12"></line>
    </svg>
    Call to Action
</div>
<div class="element-editor__subtitle">Create a compelling call to action to engage your audience</div>

<div class="form-section">
    <h4 class="form-section__title">Content</h4>
    
    <div class="form-group">
        <label class="form-label">Headline</label>
        <input type="text" class="form-input" data-property="title" placeholder="Let's Work Together">
    </div>
    
    <div class="form-group">
        <label class="form-label">Description</label>
        <textarea class="form-input form-textarea" data-property="description" rows="3" placeholder="Ready to book me for your next event? Get in touch today!"></textarea>
    </div>
</div>

<div class="form-section">
    <h4 class="form-section__title">Button</h4>
    
    <div class="form-group">
        <label class="form-label">Button Text</label>
        <input type="text" class="form-input" data-property="buttonText" placeholder="Contact Me">
    </div>
    
    <div class="form-group">
        <label class="form-label">Button URL</label>
        <input type="url" class="form-input" data-property="buttonUrl" placeholder="https://example.com/contact">
    </div>
    
    <div class="form-group">
        <label class="form-label">Open Link In</label>
        <select class="form-select" data-property="buttonTarget">
            <option value="_self">Same Window</option>
            <option value="_blank">New Tab</option>
        </select>
    </div>
</div>

<div class="form-section">
    <h4 class="form-section__title">Style</h4>
    
    <div class="form-group">
        <label class="form-label">CTA Style</label>
        <select class="form-select" data-property="ctaStyle">
            <option value="standard">Standard</option>
            <option value="prominent">Prominent (Full Width)</option>
            <option value="subtle">Subtle</option>
            <option value="floating">Floating</option>
        </select>
    </div>
    
    <div class="form-group">
        <label class="form-label">Background Color</label>
        <div class="color-picker">
            <input type="color" class="color-input" data-property="backgroundColor" value="#4f46e5">
            <input type="text" class="form-input" value="#4f46e5" style="flex: 1;">
        </div>
    </div>
    
    <div class="form-group">
        <label class="form-label">Text Color</label>
        <div class="color-picker">
            <input type="color" class="color-input" data-property="textColor" value="#ffffff">
            <input type="text" class="form-input" value="#ffffff" style="flex: 1;">
        </div>
    </div>
    
    <div class="form-group">
        <label class="form-label">Button Color</label>
        <div class="color-picker">
            <input type="color" class="color-input" data-property="buttonColor" value="#ffffff">
            <input type="text" class="form-input" value="#ffffff" style="flex: 1;">
        </div>
    </div>
    
    <div class="form-group">
        <label class="form-label">Button Text Color</label>
        <div class="color-picker">
            <input type="color" class="color-input" data-property="buttonTextColor" value="#4f46e5">
            <input type="text" class="form-input" value="#4f46e5" style="flex: 1;">
        </div>
    </div>
</div>

<div class="form-section">
    <h4 class="form-section__title">Advanced</h4>
    
    <div class="form-group">
        <label class="form-label">
            <input type="checkbox" data-property="showButton" checked>
            Show Button
        </label>
    </div>
    
    <div class="form-group">
        <label class="form-label">Animation</label>
        <select class="form-select" data-property="animation">
            <option value="none">None</option>
            <option value="fade">Fade In</option>
            <option value="slide">Slide In</option>
            <option value="pulse">Pulse</option>
        </select>
    </div>
</div>
