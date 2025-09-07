<?php
/**
 * Guest Intro Component Design Panel
 * Settings and configuration options for the guest intro component
 */
?>
<div class="element-editor__title">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" y1="19" x2="12" y2="23"></line>
        <line x1="8" y1="23" x2="16" y2="23"></line>
    </svg>
    Guest Introduction
</div>
<div class="element-editor__subtitle">Customize your guest introduction section</div>

<div class="form-section">
    <h4 class="form-section__title">Guest Information</h4>
    
    <div class="form-group">
        <label class="form-label">Guest Name</label>
        <input type="text" class="form-input" data-property="guest_name" placeholder="Enter guest's full name">
    </div>
    
    <div class="form-group">
        <label class="form-label">Professional Title</label>
        <input type="text" class="form-input" data-property="guest_title" placeholder="e.g., CEO of Example Company">
    </div>
    
    <div class="form-group">
        <label class="form-label">Tagline</label>
        <input type="text" class="form-input" data-property="tagline" placeholder="e.g., Expert in AI | Author | Speaker">
    </div>
    
    <div class="form-group">
        <label class="form-label">Introduction Text</label>
        <textarea class="form-input form-textarea" data-property="intro_text" rows="4" placeholder="Write a compelling introduction for your guest..."></textarea>
    </div>
</div>

<div class="form-section">
    <h4 class="form-section__title">Discussion Topics</h4>
    
    <div class="topics-editor" id="topics-editor">
        <div class="topics-list" id="design-topics-list">
            <!-- Topics will be dynamically added here -->
        </div>
        <button class="add-item-btn" id="add-topic-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Topic
        </button>
    </div>
</div>

<div class="form-section">
    <h4 class="form-section__title">Guest Links</h4>
    
    <div class="form-group">
        <label class="form-label">Website URL</label>
        <input type="url" class="form-input" data-property="guest_website" placeholder="https://example.com">
    </div>
    
    <div class="form-group">
        <label class="form-label">Social Media Link</label>
        <input type="url" class="form-input" data-property="guest_social" placeholder="https://twitter.com/username">
    </div>
</div>

<div class="form-section">
    <h4 class="form-section__title">Appearance</h4>
    
    <div class="form-group">
        <label class="form-label">Background Style</label>
        <select class="form-select" data-property="bg_style">
            <option value="light">Light Background</option>
            <option value="gradient">Gradient Background</option>
            <option value="accent">Accent Border</option>
            <option value="minimal">Minimal</option>
        </select>
    </div>
    
    <div class="form-group">
        <label class="form-label">Accent Color</label>
        <div class="color-picker">
            <input type="color" class="color-input" data-property="accent_color" value="#0ea5e9">
            <input type="text" class="form-input" data-property="accent_color_text" value="#0ea5e9" style="flex: 1;">
        </div>
    </div>
    
    <div class="form-group">
        <label class="form-label">
            <input type="checkbox" data-property="show_section_title" checked>
            Show Section Title
        </label>
    </div>
</div>
