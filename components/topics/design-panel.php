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

<!-- PHASE 1: MKCG Integration Section (Hidden by default, shown by JavaScript when MKCG data is available) -->
<div class="mkcg-integration-section" id="topics-mkcg-section" style="display: none;">
    <div class="form-section mkcg-section">
        <h4 class="form-section__title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
            </svg>
            MKCG Data Integration
        </h4>
        
        <div class="mkcg-status-indicator">
            <div class="mkcg-connection-status">
                <span class="status-dot"></span>
                <span class="status-text">Checking connection...</span>
            </div>
            <div class="mkcg-data-info">
                <span class="data-count">-- topics available</span>
                <span class="data-quality">--% quality</span>
            </div>
        </div>
        
        <div class="mkcg-data-controls">
            <button type="button" class="mkcg-refresh-btn btn-secondary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <polyline points="1 20 1 14 7 14"></polyline>
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10"></path>
                    <path d="M3.51 15a9 9 0 0 0 14.85 3.36L23 14"></path>
                </svg>
                Refresh MKCG Data
            </button>
            <button type="button" class="mkcg-sync-all-btn btn-primary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Sync All Topics
            </button>
        </div>
        
        <!-- PHASE 2B: Enhanced Bulk Operations -->
        <div class="mkcg-bulk-operations">
            <button type="button" class="mkcg-clear-all-btn btn-warning">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                Clear All Topics
            </button>
            <button type="button" class="mkcg-reset-btn btn-secondary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="1 4 1 10 7 10"></polyline>
                    <path d="M3.51 15a9 9 0 0 0 13.48 3.36M21 12c0-4.97-4.03-9-9-9-2.87 0-5.42 1.34-7.07 3.44"></path>
                </svg>
                Reset to MKCG
            </button>
        </div>
        
        <!-- PHASE 2B: Auto-Save Status -->
        <div class="auto-save-status">
            <div class="auto-save-indicator">
                <span class="save-status-icon">💾</span>
                <span class="save-status-text">Auto-save: <span class="save-timer">Ready</span></span>
            </div>
            <div class="save-progress">
                <div class="save-progress-bar"></div>
            </div>
        </div>
        
        <!-- ROOT FIX: Enhanced Data Display Section -->
        <div class="stored-topics-preview" id="stored-topics-preview" style="display: none;">
            <h5 class="preview-title">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 11H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-4m-2 0V9a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2"/>
                </svg>
                Stored Topics Data
            </h5>
            
            <div class="topics-data-grid" id="topics-data-grid">
                <!-- Dynamic topic cards will be inserted here -->
            </div>
            
            <div class="data-summary">
                <div class="summary-stats">
                    <span class="stat-item">
                        <strong id="total-topics-count">0</strong> Topics
                    </span>
                    <span class="stat-item">
                        <strong id="data-quality-score">--</strong>% Quality
                    </span>
                    <span class="stat-item">
                        Last Modified: <strong id="last-modified-time">--</strong>
                    </span>
                </div>
            </div>
        </div>
        
        <div class="mkcg-help-text">
            <small>Topics from your stored data will automatically populate the fields below. You can edit them directly or sync fresh data.</small>
        </div>
    </div>
</div>

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
    <h4 class="form-section__title">
        Topics
        <span class="topics-field-counter" id="topics-field-counter" style="display: none;">
            (<span id="active-topics-count">0</span> of 5)
        </span>
    </h4>
    
    <!-- ROOT FIX: Enhanced Topic Fields with Data Integration -->
    <div class="enhanced-topics-container">
        <div class="topics-list" id="design-topics-list">
            <!-- Topics will be dynamically added here -->
        </div>
        
        <!-- ROOT FIX: Dynamic Topic Field Creation Zone -->
        <div class="dynamic-field-zone" id="dynamic-field-zone" style="display: none;">
            <div class="field-zone-header">
                <h5>Additional Topic Fields</h5>
                <p class="field-zone-description">Fields created based on your stored topics data</p>
            </div>
            <div class="dynamic-fields-container" id="dynamic-fields-container">
                <!-- Dynamic fields will be inserted here -->
            </div>
        </div>
        
        <!-- ROOT FIX: Enhanced Topic Controls -->
        <div class="topics-controls">
            <button class="add-item-btn" id="add-topic-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add Topic
            </button>
            
            <button class="load-stored-btn" id="load-stored-topics-btn" style="display: none;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Load Stored Topics
            </button>
            
            <button class="populate-fields-btn" id="populate-fields-btn" style="display: none;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                Populate Fields
            </button>
        </div>
    </div>
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
