<?php
/**
 * Stats Component Design Panel
 * Settings for statistics/metrics display
 */
?>
<div class="element-editor__title">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="12" y1="20" x2="12" y2="10"></line>
        <line x1="18" y1="20" x2="18" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="16"></line>
    </svg>
    Statistics Settings
</div>
<div class="element-editor__subtitle">Configure your key metrics and statistics</div>

<div class="form-section">
    <h4 class="form-section__title">Section Settings</h4>
    
    <div class="form-group">
        <label class="form-label">Section Title</label>
        <input type="text" class="form-input" data-property="section_title" value="Key Statistics">
    </div>
    
    <div class="form-group">
        <label class="form-label">
            <input type="checkbox" data-property="show_title" checked>
            Show Section Title
        </label>
    </div>
</div>

<div class="form-section">
    <h4 class="form-section__title">Statistics</h4>
    
    <p class="form-help-text">Click on any statistic in the preview to edit it directly, or manage them here:</p>
    
    <div class="stats-editor" id="stats-editor">
        <div class="stats-list" id="design-stats-list">
            <!-- Stats will be dynamically populated -->
        </div>
        <button class="add-item-btn" id="add-stat-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Statistic
        </button>
    </div>
</div>

<div class="form-section">
    <h4 class="form-section__title">Layout & Style</h4>
    
    <div class="form-group">
        <label class="form-label">Grid Columns</label>
        <select class="form-select" data-property="grid_columns">
            <option value="2">2 Columns</option>
            <option value="3">3 Columns</option>
            <option value="4" selected>4 Columns</option>
            <option value="5">5 Columns</option>
        </select>
    </div>
    
    <div class="form-group">
        <label class="form-label">Number Style</label>
        <select class="form-select" data-property="number_style">
            <option value="large">Large Numbers</option>
            <option value="medium">Medium Numbers</option>
            <option value="small">Small Numbers</option>
        </select>
    </div>
    
    <div class="form-group">
        <label class="form-label">Number Color</label>
        <div class="color-picker">
            <input type="color" class="color-input" data-property="number_color" value="#0ea5e9">
            <input type="text" class="form-input" data-property="number_color_text" value="#0ea5e9" style="flex: 1;">
        </div>
    </div>
    
    <div class="form-group">
        <label class="form-label">Background Style</label>
        <select class="form-select" data-property="stat_bg_style">
            <option value="card">Card Style</option>
            <option value="minimal">Minimal</option>
            <option value="bordered">Bordered</option>
            <option value="gradient">Gradient</option>
        </select>
    </div>
    
    <div class="form-group">
        <label class="form-label">
            <input type="checkbox" data-property="animate_numbers">
            Animate Numbers on Scroll
        </label>
    </div>
</div>

<script>
// Initialize stats editor when panel loads
document.addEventListener('DOMContentLoaded', function() {
    // This will be handled by the design panel loader
});
</script>
