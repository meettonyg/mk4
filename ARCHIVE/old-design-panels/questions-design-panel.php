<?php
/**
 * Questions Component Design Panel
 * Settings and configuration options for the questions component
 */
?>
<div class="element-editor__title">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
    Questions
</div>
<div class="element-editor__subtitle">Frequently asked questions about your work and expertise</div>

<div class="form-section">
    <h4 class="form-section__title">Content</h4>
    
    <div class="form-group">
        <label class="form-label">Section Title</label>
        <input type="text" class="form-input" data-property="title" placeholder="Frequently Asked Questions">
    </div>
    
    <div class="form-group">
        <label class="form-label">Description</label>
        <textarea class="form-input form-textarea" data-property="description" rows="2" placeholder="Common questions that people ask me..."></textarea>
    </div>
</div>

<div class="form-section">
    <h4 class="form-section__title">Questions</h4>
    
    <div class="questions-list" id="design-questions-list">
        <!-- Questions will be dynamically added here -->
    </div>
    
    <button class="add-item-btn" id="add-question-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Add Question
    </button>
</div>

<div class="form-section">
    <h4 class="form-section__title">Layout</h4>
    
    <div class="form-group">
        <label class="form-label">Display Style</label>
        <select class="form-select" data-property="displayStyle">
            <option value="accordion" selected>Accordion</option>
            <option value="toggle">Toggle</option>
            <option value="grid">Grid</option>
            <option value="cards">Cards</option>
        </select>
    </div>
    
    <div class="form-group">
        <label class="form-label">Columns (Grid/Cards View)</label>
        <select class="form-select" data-property="columns">
            <option value="1">1 Column</option>
            <option value="2" selected>2 Columns</option>
            <option value="3">3 Columns</option>
        </select>
    </div>
    
    <div class="form-group">
        <label class="form-label">
            <input type="checkbox" data-property="expandFirstQuestion">
            Expand First Question by Default
        </label>
    </div>
    
    <div class="form-group">
        <label class="form-label">
            <input type="checkbox" data-property="allowMultipleOpen">
            Allow Multiple Questions Open at Once
        </label>
    </div>
</div>

<div class="form-section">
    <h4 class="form-section__title">Appearance</h4>
    
    <div class="form-group">
        <label class="form-label">Style</label>
        <select class="form-select" data-property="style">
            <option value="default" selected>Default</option>
            <option value="minimal">Minimal</option>
            <option value="bordered">Bordered</option>
            <option value="separated">Separated</option>
        </select>
    </div>
    
    <div class="form-group">
        <label class="form-label">Question Font Size</label>
        <select class="form-select" data-property="questionFontSize">
            <option value="small">Small</option>
            <option value="medium" selected>Medium</option>
            <option value="large">Large</option>
        </select>
    </div>
    
    <div class="form-group">
        <label class="form-label">Icon Style</label>
        <select class="form-select" data-property="iconStyle">
            <option value="plus-minus" selected>Plus/Minus</option>
            <option value="arrow">Arrow</option>
            <option value="chevron">Chevron</option>
            <option value="none">No Icon</option>
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
    <h4 class="form-section__title">Animation</h4>
    
    <div class="form-group">
        <label class="form-label">Animation Style</label>
        <select class="form-select" data-property="animationStyle">
            <option value="slide" selected>Slide</option>
            <option value="fade">Fade</option>
            <option value="none">None</option>
        </select>
    </div>
    
    <div class="form-group">
        <label class="form-label">Animation Speed</label>
        <select class="form-select" data-property="animationSpeed">
            <option value="fast">Fast</option>
            <option value="medium" selected>Medium</option>
            <option value="slow">Slow</option>
        </select>
    </div>
</div>
