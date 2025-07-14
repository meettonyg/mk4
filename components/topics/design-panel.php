<?php
/**
 * Topics Component Design Panel - ROOT FIX IMPLEMENTATION  
 * Clean, user-focused interface with proper information hierarchy
 * FIXED: Complete restructuring for optimal UX and mobile experience
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
    ✨ Topics Settings
</div>
<div class="element-editor__subtitle">Configure your speaking topics and expertise areas</div>

<!-- SECTION 1: CORE CONTENT SETTINGS (Priority #1) -->
<div class="form-section form-section--primary">
    <h4 class="form-section__title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-3"></path>
            <path d="M10.5 1.5l-8 8v3h3l8-8a1.5 1.5 0 0 0 0-2.12l-.88-.88a1.5 1.5 0 0 0-2.12 0z"></path>
        </svg>
        Content
        <span class="priority-badge">Essential</span>
    </h4>
    
    <div class="form-group">
        <label class="form-label">Section Title</label>
        <input type="text" class="form-input" data-property="title" placeholder="Speaking Topics" value="">
    </div>
    
    <div class="form-group">
        <label class="form-label">Introduction Text <span class="form-label__optional">(optional)</span></label>
        <textarea class="form-input form-textarea" data-property="introduction" rows="2" placeholder="Brief description of your speaking topics..."></textarea>
    </div>
</div>

<!-- SECTION 2: TOPIC MANAGEMENT (Priority #2) -->
<div class="form-section form-section--primary">
    <h4 class="form-section__title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 12l2 2 4-4"></path>
            <circle cx="12" cy="12" r="10"></circle>
        </svg>
        Your Topics
        <span class="topics-counter" id="topics-counter">(<span id="topic-count">0</span> topics)</span>
    </h4>
    
    <div class="topics-editor">
        <div class="topics-list" id="design-topics-list">
            <!-- Topic items will be added dynamically -->
        </div>
        
        <div class="topics-actions">
            <button class="add-topic-btn" id="add-topic-btn" type="button">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add Topic
            </button>
            
            <button class="clear-all-btn" id="clear-all-topics-btn" type="button" style="display: none;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                </svg>
                Clear All
            </button>
        </div>
        
        <div class="topics-help">
            <p class="form-help-text">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                Add up to 10 topics that showcase your expertise and speaking abilities.
            </p>
        </div>
    </div>
</div>

<!-- SECTION 3: DISPLAY OPTIONS (Priority #3) -->
<div class="form-section">
    <h4 class="form-section__title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
        Layout & Display
    </h4>
    
    <div class="form-group">
        <label class="form-label">Display Style</label>
        <select class="form-select" data-property="displayStyle">
            <option value="list" selected>List View</option>
            <option value="grid">Grid View</option>
            <option value="tags">Tag Style</option>
            <option value="cards">Card Layout</option>
        </select>
    </div>
    
    <div class="form-group" id="columns-group">
        <label class="form-label">Number of Columns</label>
        <select class="form-select" data-property="columns">
            <option value="1">1 Column</option>
            <option value="2">2 Columns</option>
            <option value="3" selected>3 Columns</option>
            <option value="4">4 Columns</option>
        </select>
    </div>
    
    <div class="form-checkbox-group">
        <label class="form-checkbox">
            <input type="checkbox" data-property="showDescriptions" checked>
            <span class="checkmark"></span>
            Show topic descriptions
        </label>
        
        <label class="form-checkbox">
            <input type="checkbox" data-property="showIcons" checked>
            <span class="checkmark"></span>
            Show topic icons
        </label>
        
        <label class="form-checkbox">
            <input type="checkbox" data-property="showNumbers">
            <span class="checkmark"></span>
            Number the topics
        </label>
    </div>
</div>

<!-- SECTION 4: ADVANCED STYLING (Collapsible) -->
<div class="form-section form-section--collapsible" id="advanced-styling">
    <h4 class="form-section__title form-section__toggle" role="button" tabindex="0">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="toggle-icon">
            <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M12 1v6m0 6v6"></path>
            <path d="M1 12h6m6 0h6"></path>
        </svg>
        Advanced Styling
        <span class="form-label__optional">Click to expand</span>
    </h4>
    
    <div class="form-section__content" style="display: none;">
        <div class="form-group">
            <label class="form-label">Topic Style</label>
            <select class="form-select" data-property="topicStyle">
                <option value="default" selected>Default</option>
                <option value="minimal">Minimal</option>
                <option value="boxed">Boxed</option>
                <option value="bordered">Bordered</option>
                <option value="rounded">Rounded</option>
            </select>
        </div>
        
        <div class="form-group">
            <label class="form-label">Size</label>
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
                <option value="top">Top</option>
                <option value="none">No Icons</option>
            </select>
        </div>
        
        <div class="form-group">
            <label class="form-label">Color Theme</label>
            <div class="color-picker">
                <input type="color" class="color-input" data-property="topicColor" value="#4f46e5">
                <input type="text" class="form-input color-text" value="#4f46e5" placeholder="#4f46e5">
            </div>
        </div>
        
        <div class="form-group">
            <label class="form-label">Animation</label>
            <select class="form-select" data-property="animation">
                <option value="none" selected>None</option>
                <option value="fade">Fade In</option>
                <option value="slide">Slide Up</option>
                <option value="grow">Scale In</option>
            </select>
        </div>
        
        <div class="form-group">
            <label class="form-label">Hover Effect</label>
            <select class="form-select" data-property="hoverEffect">
                <option value="none">None</option>
                <option value="scale" selected>Scale</option>
                <option value="highlight">Highlight</option>
                <option value="shadow">Drop Shadow</option>
                <option value="glow">Glow Effect</option>
            </select>
        </div>
    </div>
</div>

<!-- SECTION 5: SMART INTEGRATION (Collapsible, Hidden by Default) -->
<div class="form-section form-section--collapsible form-section--secondary" id="smart-integration" style="display: none;">
    <h4 class="form-section__title form-section__toggle" role="button" tabindex="0">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="toggle-icon">
            <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
        </svg>
        Smart Content Integration
        <span class="form-label__badge">AI-Powered</span>
    </h4>
    
    <div class="form-section__content" style="display: none;">
        <div class="integration-status" id="integration-status">
            <div class="status-indicator">
                <span class="status-dot" data-status="disconnected"></span>
                <span class="status-text">Checking for saved topics...</span>
            </div>
        </div>
        
        <div class="integration-actions" id="integration-actions" style="display: none;">
            <button type="button" class="btn btn--secondary btn--small" id="load-saved-topics">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-15"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                </svg>
                Load Saved Topics
            </button>
            
            <button type="button" class="btn btn--primary btn--small" id="sync-topics">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10"></path>
                </svg>
                Sync with Generator
            </button>
        </div>
        
        <div class="form-help">
            <p class="form-help-text">
                Connect with the Media Kit Content Generator to automatically populate topics from your saved data.
            </p>
        </div>
    </div>
</div>

