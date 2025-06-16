<?php
/**
 * Topics Component Design Panel
 * Settings and configuration options for the topics component
 */
?>
<div class="element-editor__title">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="8" y1="6" x2="21" y2="6"></line>
        <line x1="8" y1="12" x2="21" y2="12"></line>
        <line x1="8" y1="18" x2="21" y2="18"></line>
        <line x1="3" y1="6" x2="3.01" y2="6"></line>
        <line x1="3" y1="12" x2="3.01" y2="12"></line>
        <line x1="3" y1="18" x2="3.01" y2="18"></line>
    </svg>
    Topics
</div>
<div class="element-editor__subtitle">Showcase your areas of expertise and speaking topics</div>

<div class="form-section">
    <h4 class="form-section__title">Content</h4>
    
    <div class="form-group">
        <label class="form-label">Section Title</label>
        <input type="text" class="form-input" data-property="title" placeholder="Speaking Topics">
    </div>
    
    <div class="form-group">
        <label class="form-label">Introduction Text</label>
        <textarea class="form-input form-textarea" data-property="introduction" rows="2" placeholder="Topics I'm knowledgeable about and can speak on..."></textarea>
    </div>
</div>

<div class="form-section">
    <h4 class="form-section__title">Topics</h4>
    
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

<div class="form-section">
    <h4 class="form-section__title">Display</h4>
    
    <div class="form-group">
        <label class="form-label">Display Style</label>
        <select class="form-select" data-property="displayStyle">
            <option value="list" selected>List</option>
            <option value="grid">Grid</option>
            <option value="tags">Tags</option>
            <option value="cards">Cards</option>
        </select>
    </div>
    
    <div class="form-group">
        <label class="form-label">Columns (Grid/Cards View)</label>
        <select class="form-select" data-property="columns">
            <option value="2">2 Columns</option>
            <option value="3" selected>3 Columns</option>
            <option value="4">4 Columns</option>
        </select>
    </div>
    
    <div class="form-group">
        <label class="form-label">
            <input type="checkbox" data-property="showDescriptions" checked>
            Show Topic Descriptions
        </label>
    </div>
    
    <div class="form-group">
        <label class="form-label">
            <input type="checkbox" data-property="expandable">
            Make Topics Expandable
        </label>
    </div>
</div>

<div class="form-section">
    <h4 class="form-section__title">Style</h4>
    
    <div class="form-group">
        <label class="form-label">Topic Style</label>
        <select class="form-select" data-property="topicStyle">
            <option value="default" selected>Default</option>
            <option value="minimal">Minimal</option>
            <option value="boxed">Boxed</option>
            <option value="bordered">Bordered</option>
            <option value="numbered">Numbered</option>
        </select>
    </div>
    
    <div class="form-group">
        <label class="form-label">Topic Size</label>
        <select class="form-select" data-property="topicSize">
            <option value="small">Small</option>
            <option value="medium" selected>Medium</option>
            <option value="large">Large</option>
        </select>
    </div>
    
    <div class="form-group">
        <label class="form-label">Icon Position</label>
        <select class="form-select" data-property="iconPosition">
            <option value="left" selected>Left</option>
            <option value="right">Right</option>
            <option value="none">No Icons</option>
        </select>
    </div>
    
    <div class="form-group">
        <label class="form-label">Topic Color</label>
        <div class="color-picker">
            <input type="color" class="color-input" data-property="topicColor" value="#4f46e5">
            <input type="text" class="form-input" value="#4f46e5" style="flex: 1;">
        </div>
    </div>
</div>

<div class="form-section">
    <h4 class="form-section__title">Animations</h4>
    
    <div class="form-group">
        <label class="form-label">Animation</label>
        <select class="form-select" data-property="animation">
            <option value="none" selected>None</option>
            <option value="fade">Fade In</option>
            <option value="slide">Slide In</option>
            <option value="grow">Grow</option>
        </select>
    </div>
    
    <div class="form-group">
        <label class="form-label">Hover Effect</label>
        <select class="form-select" data-property="hoverEffect">
            <option value="none">None</option>
            <option value="scale" selected>Scale</option>
            <option value="highlight">Highlight</option>
            <option value="shadow">Shadow</option>
        </select>
    </div>
</div>
