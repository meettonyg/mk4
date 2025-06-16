<?php
/**
 * Hero Component Design Panel
 * Settings and configuration options for the hero component
 */
?>
<div class="element-editor__title">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
    Hero Section
</div>
<div class="element-editor__subtitle">Customize your hero section</div>

<div class="form-section">
    <h4 class="form-section__title">Profile Information</h4>
    
    <div class="form-group">
        <label class="form-label">Full Name</label>
        <input type="text" class="form-input" data-property="hero_name" placeholder="Your Name">
    </div>
    
    <div class="form-group">
        <label class="form-label">Professional Title</label>
        <input type="text" class="form-input" data-property="hero_title" placeholder="Your Professional Title">
    </div>
    
    <div class="form-group">
        <label class="form-label">Bio Description</label>
        <textarea class="form-input form-textarea" data-property="hero_bio" rows="3" placeholder="Brief introduction about yourself..."></textarea>
    </div>
</div>

<div class="form-section">
    <h4 class="form-section__title">Profile Image</h4>
    
    <div class="form-group">
        <label class="form-label">Profile Picture</label>
        <div class="image-upload-area">
            <button class="upload-btn">Choose Image</button>
            <span class="upload-text">or drag and drop</span>
        </div>
        <p class="form-help-text">Recommended: Square image, at least 200x200px</p>
    </div>
</div>

<div class="form-section">
    <h4 class="form-section__title">Appearance</h4>
    
    <div class="form-group">
        <label class="form-label">Background Style</label>
        <select class="form-select" data-property="hero_bg_style">
            <option value="gradient">Gradient Background</option>
            <option value="solid">Solid Color</option>
            <option value="image">Background Image</option>
            <option value="pattern">Pattern Background</option>
        </select>
    </div>
    
    <div class="form-group">
        <label class="form-label">Background Color</label>
        <div class="color-picker">
            <input type="color" class="color-input" data-property="hero_bg_color" value="#f8fafc">
            <input type="text" class="form-input" data-property="hero_bg_color_text" value="#f8fafc" style="flex: 1;">
        </div>
    </div>
    
    <div class="form-group">
        <label class="form-label">Text Color</label>
        <div class="color-picker">
            <input type="color" class="color-input" data-property="hero_text_color" value="#1e293b">
            <input type="text" class="form-input" data-property="hero_text_color_text" value="#1e293b" style="flex: 1;">
        </div>
    </div>
    
    <div class="form-group">
        <label class="form-label">Avatar Style</label>
        <select class="form-select" data-property="avatar_style">
            <option value="circle">Circle</option>
            <option value="square">Square</option>
            <option value="rounded">Rounded Square</option>
        </select>
    </div>
    
    <div class="form-group">
        <label class="form-label">
            <input type="checkbox" data-property="show_bio" checked>
            Show Bio Description
        </label>
    </div>
</div>
