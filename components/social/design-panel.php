<?php
/**
 * Social Component Design Panel
 * Settings and configuration options for the social component
 */
?>
<div class="element-editor__title">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
    </svg>
    Social Media Links
</div>
<div class="element-editor__subtitle">Connect your visitors to your social media profiles</div>

<div class="form-section">
    <h4 class="form-section__title">Social Profiles</h4>
    
    <div class="form-group">
        <label class="form-label">Twitter / X</label>
        <input type="url" class="form-input" data-property="twitter_url" placeholder="https://twitter.com/yourusername">
    </div>
    
    <div class="form-group">
        <label class="form-label">LinkedIn</label>
        <input type="url" class="form-input" data-property="linkedin_url" placeholder="https://linkedin.com/in/yourusername">
    </div>
    
    <div class="form-group">
        <label class="form-label">Instagram</label>
        <input type="url" class="form-input" data-property="instagram_url" placeholder="https://instagram.com/yourusername">
    </div>
    
    <div class="form-group">
        <label class="form-label">Facebook</label>
        <input type="url" class="form-input" data-property="facebook_url" placeholder="https://facebook.com/yourusername">
    </div>
    
    <div class="form-group">
        <label class="form-label">YouTube</label>
        <input type="url" class="form-input" data-property="youtube_url" placeholder="https://youtube.com/c/yourusername">
    </div>
    
    <div class="form-group">
        <label class="form-label">TikTok</label>
        <input type="url" class="form-input" data-property="tiktok_url" placeholder="https://tiktok.com/@yourusername">
    </div>
    
    <div class="form-group">
        <label class="form-label">Pinterest</label>
        <input type="url" class="form-input" data-property="pinterest_url" placeholder="https://pinterest.com/yourusername">
    </div>
    
    <div class="form-group">
        <label class="form-label">Medium</label>
        <input type="url" class="form-input" data-property="medium_url" placeholder="https://medium.com/@yourusername">
    </div>
</div>

<div class="form-section">
    <h4 class="form-section__title">Custom Social Links</h4>
    
    <div class="custom-social-links" id="custom-social-links">
        <!-- Custom social links will be added here dynamically -->
    </div>
    
    <button class="add-item-btn" id="add-social-link-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Add Custom Link
    </button>
</div>

<div class="form-section">
    <h4 class="form-section__title">Display Settings</h4>
    
    <div class="form-group">
        <label class="form-label">Icon Style</label>
        <select class="form-select" data-property="icon_style">
            <option value="solid">Solid</option>
            <option value="outline">Outline</option>
            <option value="minimal">Minimal</option>
            <option value="branded">Branded Colors</option>
        </select>
    </div>
    
    <div class="form-group">
        <label class="form-label">Icon Size</label>
        <select class="form-select" data-property="icon_size">
            <option value="small">Small</option>
            <option value="medium" selected>Medium</option>
            <option value="large">Large</option>
        </select>
    </div>
    
    <div class="form-group">
        <label class="form-label">Layout</label>
        <select class="form-select" data-property="layout">
            <option value="horizontal">Horizontal</option>
            <option value="vertical">Vertical</option>
            <option value="grid">Grid</option>
        </select>
    </div>
    
    <div class="form-group">
        <label class="form-label">Icon Shape</label>
        <select class="form-select" data-property="icon_shape">
            <option value="circle">Circle</option>
            <option value="square">Square</option>
            <option value="rounded">Rounded</option>
            <option value="none">No Background</option>
        </select>
    </div>
</div>

<div class="form-section">
    <h4 class="form-section__title">Colors</h4>
    
    <div class="form-group">
        <label class="form-label">Icon Color</label>
        <div class="color-picker">
            <input type="color" class="color-input" data-property="icon_color" value="#ffffff">
            <input type="text" class="form-input" value="#ffffff" style="flex: 1;">
        </div>
    </div>
    
    <div class="form-group">
        <label class="form-label">Background Color</label>
        <div class="color-picker">
            <input type="color" class="color-input" data-property="background_color" value="#4f46e5">
            <input type="text" class="form-input" value="#4f46e5" style="flex: 1;">
        </div>
    </div>
    
    <div class="form-group">
        <label class="form-label">Hover Color</label>
        <div class="color-picker">
            <input type="color" class="color-input" data-property="hover_color" value="#4338ca">
            <input type="text" class="form-input" value="#4338ca" style="flex: 1;">
        </div>
    </div>
</div>

<div class="form-section">
    <h4 class="form-section__title">Advanced</h4>
    
    <div class="form-group">
        <label class="form-label">
            <input type="checkbox" data-property="show_labels">
            Show Platform Labels
        </label>
    </div>
    
    <div class="form-group">
        <label class="form-label">
            <input type="checkbox" data-property="open_new_tab" checked>
            Open Links in New Tab
        </label>
    </div>
    
    <div class="form-group">
        <label class="form-label">
            <input type="checkbox" data-property="add_rel_nofollow" checked>
            Add rel="nofollow" to Links
        </label>
    </div>
    
    <div class="form-group">
        <label class="form-label">Animation</label>
        <select class="form-select" data-property="animation">
            <option value="none">None</option>
            <option value="pulse">Pulse</option>
            <option value="bounce">Bounce</option>
            <option value="shake">Shake</option>
        </select>
    </div>
</div>
