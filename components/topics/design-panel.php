<?php
/**
 * Topics Component Design Panel - PHASE 1 ROOT FIX IMPLEMENTATION
 * Enhanced Live Topics Editor with Real-time Preview Synchronization
 * 
 * FEATURES:
 * - Live inline topic editing with real-time preview updates
 * - Drag-and-drop topic reordering with visual feedback
 * - Add/remove topics with proper validation
 * - Quality indicators and save status
 * - Bidirectional communication with preview
 * - Auto-save functionality with conflict resolution
 * 
 * @package Guestify/Components/Topics
 * @version 2.0.0-phase1-enhanced
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
    ✨ Topics Editor
</div>
<div class="element-editor__subtitle">Edit your speaking topics with live preview updates</div>

<!-- PHASE 1: ENHANCED LIVE TOPICS EDITOR -->
<div class="form-section form-section--primary topics-live-editor" id="topics-live-editor">
    <div class="topics-editor-header">
        <h4 class="form-section__title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <edit-3></edit-3>
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Live Topics Editor
            <span class="topics-counter" id="live-topics-counter">
                (<span id="live-topic-count">0</span> of 10 topics)
            </span>
        </h4>
        
        <!-- Save Status Indicator -->
        <div class="topics-save-status" id="topics-save-status" data-status="saved">
            <div class="save-indicator">
                <span class="save-icon">✅</span>
                <span class="save-text">Saved</span>
                <span class="save-timestamp"></span>
            </div>
            <div class="save-progress" style="display: none;">
                <div class="save-progress-bar"></div>
            </div>
        </div>
    </div>
    
    <!-- Live Topics List -->
    <div class="live-topics-container" id="live-topics-container">
        <div class="live-topics-list" id="live-topics-list" data-sortable="true">
            <!-- Dynamic topic items will be rendered here -->
            <div class="topics-loading" id="topics-loading">
                <div class="loading-spinner"></div>
                <span>Loading your topics...</span>
            </div>
        </div>
        
        <!-- Add New Topic Interface -->
        <div class="add-topic-interface" id="add-topic-interface">
            <div class="add-topic-prompt" id="add-topic-prompt">
                <button class="add-topic-btn btn btn--primary" id="add-first-topic-btn" type="button">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Add Your First Topic
                </button>
                <p class="add-topic-help">Start building your expertise showcase</p>
            </div>
            
            <div class="add-topic-form" id="add-topic-form" style="display: none;">
                <div class="form-group">
                    <label class="form-label">New Topic</label>
                    <input type="text" 
                           class="form-input" 
                           id="new-topic-input" 
                           placeholder="e.g. Digital Marketing Strategy"
                           maxlength="100">
                    <div class="input-helper">
                        <span class="char-counter">0/100</span>
                        <span class="quality-indicator" id="new-topic-quality">Quality: <span>Good</span></span>
                    </div>
                </div>
                <div class="form-actions">
                    <button class="btn btn--primary" id="confirm-add-topic" type="button">Add Topic</button>
                    <button class="btn btn--secondary" id="cancel-add-topic" type="button">Cancel</button>
                </div>
            </div>
        </div>
        
        <!-- Bulk Actions -->
        <div class="topics-bulk-actions" id="topics-bulk-actions" style="display: none;">
            <div class="bulk-actions-bar">
                <span class="bulk-selection-count">
                    <span id="selected-count">0</span> topics selected
                </span>
                <div class="bulk-action-buttons">
                    <button class="btn btn--small btn--secondary" id="bulk-reorder-btn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                        Reorder
                    </button>
                    <button class="btn btn--small btn--secondary" id="bulk-enhance-btn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                        </svg>
                        Enhance Quality
                    </button>
                    <button class="btn btn--small btn--danger" id="bulk-delete-btn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                        </svg>
                        Delete Selected
                    </button>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Topics Quality Overview -->
    <div class="topics-quality-overview" id="topics-quality-overview" style="display: none;">
        <div class="quality-summary">
            <h5>Quality Overview</h5>
            <div class="quality-stats">
                <div class="quality-stat">
                    <div class="stat-value" id="average-quality">0%</div>
                    <div class="stat-label">Average Quality</div>
                </div>
                <div class="quality-stat">
                    <div class="stat-value" id="completion-rate">0%</div>
                    <div class="stat-label">Completion</div>
                </div>
                <div class="quality-stat">
                    <div class="stat-value" id="excellence-count">0</div>
                    <div class="stat-label">Excellent Topics</div>
                </div>
            </div>
        </div>
        
        <div class="quality-recommendations" id="quality-recommendations">
            <!-- Dynamic recommendations will be inserted here -->
        </div>
    </div>
</div>

<!-- SECTION 2: CONTENT SETTINGS -->
<div class="form-section">
    <h4 class="form-section__title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-3"></path>
            <path d="M10.5 1.5l-8 8v3h3l8-8a1.5 1.5 0 0 0 0-2.12l-.88-.88a1.5 1.5 0 0 0-2.12 0z"></path>
        </svg>
        Section Settings
    </h4>
    
    <div class="form-group">
        <label class="form-label">Section Title</label>
        <input type="text" 
               class="form-input" 
               id="section-title-input"
               data-property="title" 
               placeholder="Speaking Topics" 
               value="">
    </div>
    
    <div class="form-group">
        <label class="form-label">Introduction Text <span class="form-label__optional">(optional)</span></label>
        <textarea class="form-input form-textarea" 
                  id="section-intro-input"
                  data-property="introduction" 
                  rows="2" 
                  placeholder="Brief description of your speaking expertise..."></textarea>
    </div>
</div>

<!-- SECTION 3: DISPLAY OPTIONS -->
<div class="form-section">
    <h4 class="form-section__title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
        Display & Layout
    </h4>
    
    <div class="form-group">
        <label class="form-label">Display Style</label>
        <select class="form-select" id="display-style-select" data-property="displayStyle">
            <option value="list" selected>List View</option>
            <option value="grid">Grid View</option>
            <option value="tags">Tag Style</option>
            <option value="cards">Card Layout</option>
        </select>
    </div>
    
    <div class="form-group" id="columns-group">
        <label class="form-label">Number of Columns</label>
        <select class="form-select" id="columns-select" data-property="columns">
            <option value="1">1 Column</option>
            <option value="2">2 Columns</option>
            <option value="3" selected>3 Columns</option>
            <option value="4">4 Columns</option>
        </select>
    </div>
    
    <div class="form-checkbox-group">
        <label class="form-checkbox">
            <input type="checkbox" id="show-descriptions-checkbox" data-property="showDescriptions" checked>
            <span class="checkmark"></span>
            Show topic descriptions
        </label>
        
        <label class="form-checkbox">
            <input type="checkbox" id="show-icons-checkbox" data-property="showIcons" checked>
            <span class="checkmark"></span>
            Show topic icons
        </label>
        
        <label class="form-checkbox">
            <input type="checkbox" id="show-numbers-checkbox" data-property="showNumbers">
            <span class="checkmark"></span>
            Number the topics
        </label>
        
        <label class="form-checkbox">
            <input type="checkbox" id="enable-reordering-checkbox" data-property="enableReordering" checked>
            <span class="checkmark"></span>
            Enable drag-and-drop reordering
        </label>
    </div>
</div>

<!-- SECTION 4: ADVANCED OPTIONS (Collapsible) -->
<div class="form-section form-section--collapsible" id="advanced-options">
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
            <select class="form-select" id="topic-style-select" data-property="topicStyle">
                <option value="default" selected>Default</option>
                <option value="minimal">Minimal</option>
                <option value="boxed">Boxed</option>
                <option value="bordered">Bordered</option>
                <option value="rounded">Rounded</option>
            </select>
        </div>
        
        <div class="form-group">
            <label class="form-label">Size</label>
            <select class="form-select" id="topic-size-select" data-property="topicSize">
                <option value="small">Small</option>
                <option value="medium" selected>Medium</option>
                <option value="large">Large</option>
            </select>
        </div>
        
        <div class="form-group">
            <label class="form-label">Color Theme</label>
            <div class="color-picker">
                <input type="color" 
                       class="color-input" 
                       id="topic-color-picker"
                       data-property="topicColor" 
                       value="#4f46e5">
                <input type="text" 
                       class="form-input color-text" 
                       id="topic-color-text"
                       value="#4f46e5" 
                       placeholder="#4f46e5">
            </div>
        </div>
        
        <div class="form-group">
            <label class="form-label">Animation</label>
            <select class="form-select" id="animation-select" data-property="animation">
                <option value="none" selected>None</option>
                <option value="fade">Fade In</option>
                <option value="slide">Slide Up</option>
                <option value="grow">Scale In</option>
            </select>
        </div>
        
        <div class="form-group">
            <label class="form-label">Hover Effect</label>
            <select class="form-select" id="hover-effect-select" data-property="hoverEffect">
                <option value="none">None</option>
                <option value="scale" selected>Scale</option>
                <option value="highlight">Highlight</option>
                <option value="shadow">Drop Shadow</option>
                <option value="glow">Glow Effect</option>
            </select>
        </div>
    </div>
</div>

<!-- SECTION 5: INTEGRATION & SYNC -->
<div class="form-section form-section--collapsible" id="integration-sync">
    <h4 class="form-section__title form-section__toggle" role="button" tabindex="0">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="toggle-icon">
            <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
        </svg>
        Content Integration
        <span class="form-label__badge">Smart Sync</span>
    </h4>
    
    <div class="form-section__content" style="display: none;">
        <div class="integration-status" id="integration-status">
            <div class="status-indicator">
                <span class="status-dot" id="integration-status-dot" data-status="checking"></span>
                <span class="status-text" id="integration-status-text">Checking for saved content...</span>
            </div>
            <div class="status-details" id="integration-status-details" style="display: none;">
                <!-- Dynamic status details -->
            </div>
        </div>
        
        <div class="integration-actions" id="integration-actions" style="display: none;">
            <button type="button" class="btn btn--secondary btn--small" id="load-from-mkcg">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                </svg>
                Load from Generator
            </button>
            
            <button type="button" class="btn btn--primary btn--small" id="sync-with-mkcg">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10"></path>
                </svg>
                Sync Changes
            </button>
            
            <button type="button" class="btn btn--secondary btn--small" id="export-topics">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                Export Topics
            </button>
        </div>
        
        <div class="form-help">
            <p class="form-help-text">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                Sync with Media Kit Content Generator to import your AI-generated topics.
            </p>
        </div>
    </div>
</div>

<!-- ENHANCED CSS FOR LIVE EDITOR -->
<style>
/* PHASE 1: Enhanced Live Topics Editor Styles */
.topics-live-editor {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 20px;
    background: #ffffff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.topics-editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e5e7eb;
}

.topics-counter {
    font-size: 14px;
    color: #6b7280;
    font-weight: normal;
}

.topics-save-status {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
}

.topics-save-status[data-status="saved"] .save-icon { color: #10b981; }
.topics-save-status[data-status="saving"] .save-icon { color: #f59e0b; }
.topics-save-status[data-status="unsaved"] .save-icon { color: #ef4444; }
.topics-save-status[data-status="error"] .save-icon { color: #ef4444; }

.save-progress {
    width: 60px;
    height: 3px;
    background: #e5e7eb;
    border-radius: 2px;
    overflow: hidden;
}

.save-progress-bar {
    height: 100%;
    background: #3b82f6;
    width: 0%;
    transition: width 0.3s ease;
}

.live-topics-container {
    min-height: 200px;
}

.live-topics-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
}

.topics-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 40px 20px;
    color: #6b7280;
    font-size: 14px;
}

.loading-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid #e5e7eb;
    border-top: 2px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.live-topic-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    background: #ffffff;
    transition: all 0.2s ease;
    cursor: move;
}

.live-topic-item:hover {
    border-color: #3b82f6;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.live-topic-item.is-dragging {
    opacity: 0.5;
    transform: rotate(2deg);
}

.live-topic-item.is-editing {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.topic-drag-handle {
    display: flex;
    flex-direction: column;
    gap: 2px;
    color: #9ca3af;
    cursor: grab;
}

.topic-drag-handle:active {
    cursor: grabbing;
}

.topic-drag-handle span {
    width: 4px;
    height: 4px;
    background: currentColor;
    border-radius: 50%;
}

.topic-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.topic-input {
    border: none;
    background: transparent;
    font-size: 14px;
    font-weight: 500;
    color: #111827;
    padding: 4px 8px;
    border-radius: 4px;
    transition: background-color 0.2s ease;
}

.topic-input:focus {
    outline: none;
    background: #f9fafb;
    border: 1px solid #3b82f6;
}

.topic-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: #6b7280;
}

.topic-quality {
    display: flex;
    align-items: center;
    gap: 4px;
}

.quality-bar {
    width: 30px;
    height: 3px;
    background: #e5e7eb;
    border-radius: 2px;
    overflow: hidden;
}

.quality-fill {
    height: 100%;
    transition: width 0.3s ease;
}

.quality-fill.excellent { background: #10b981; }
.quality-fill.good { background: #3b82f6; }
.quality-fill.fair { background: #f59e0b; }
.quality-fill.poor { background: #ef4444; }

.topic-actions {
    display: flex;
    gap: 4px;
}

.topic-action-btn {
    width: 24px;
    height: 24px;
    border: none;
    background: transparent;
    color: #6b7280;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.topic-action-btn:hover {
    background: #f3f4f6;
    color: #374151;
}

.topic-action-btn.danger:hover {
    background: #fef2f2;
    color: #dc2626;
}

.add-topic-interface {
    margin-top: 16px;
}

.add-topic-prompt {
    text-align: center;
    padding: 20px;
    border: 2px dashed #d1d5db;
    border-radius: 8px;
    background: #f9fafb;
}

.add-topic-btn {
    margin-bottom: 8px;
}

.add-topic-help {
    margin: 0;
    font-size: 14px;
    color: #6b7280;
}

.add-topic-form {
    padding: 16px;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    background: #ffffff;
}

.input-helper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 4px;
    font-size: 12px;
}

.char-counter {
    color: #6b7280;
}

.quality-indicator {
    color: #374151;
}

.quality-indicator span.excellent { color: #10b981; }
.quality-indicator span.good { color: #3b82f6; }
.quality-indicator span.fair { color: #f59e0b; }
.quality-indicator span.poor { color: #ef4444; }

.form-actions {
    display: flex;
    gap: 8px;
    margin-top: 12px;
}

.topics-bulk-actions {
    margin-top: 16px;
    padding: 12px;
    background: #f3f4f6;
    border-radius: 6px;
}

.bulk-actions-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.bulk-selection-count {
    font-size: 14px;
    color: #374151;
    font-weight: 500;
}

.bulk-action-buttons {
    display: flex;
    gap: 8px;
}

.topics-quality-overview {
    margin-top: 20px;
    padding: 16px;
    background: #f8fafc;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
}

.quality-summary h5 {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: #374151;
}

.quality-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 16px;
}

.quality-stat {
    text-align: center;
}

.stat-value {
    font-size: 20px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 4px;
}

.stat-label {
    font-size: 12px;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.quality-recommendations {
    /* Styling for recommendations */
}

/* Form section enhancements */
.form-section__title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    font-size: 16px;
    font-weight: 600;
    color: #111827;
}

.form-section__title svg {
    color: #6b7280;
}

.form-section__toggle {
    cursor: pointer;
    user-select: none;
}

.form-section__toggle:hover {
    color: #3b82f6;
}

.toggle-icon {
    transition: transform 0.2s ease;
}

.form-section--collapsible.expanded .toggle-icon {
    transform: rotate(180deg);
}

.form-label__badge {
    font-size: 10px;
    background: #3b82f6;
    color: white;
    padding: 2px 6px;
    border-radius: 10px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.form-label__optional {
    font-size: 12px;
    color: #9ca3af;
    font-weight: normal;
}

.priority-badge {
    font-size: 10px;
    background: #dc2626;
    color: white;
    padding: 2px 6px;
    border-radius: 10px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

/* Integration status */
.status-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
}

.status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #6b7280;
}

.status-dot[data-status="connected"] { background: #10b981; }
.status-dot[data-status="checking"] { 
    background: #f59e0b; 
    animation: pulse 2s infinite;
}
.status-dot[data-status="disconnected"] { background: #ef4444; }

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

/* ROOT FIX: User notification styles */
.topics-notification {
    margin-bottom: 16px;
    border-radius: 6px;
    border: 1px solid;
    background: #ffffff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    animation: slideInDown 0.3s ease;
}

.topics-notification--error {
    border-color: #f87171;
    background: #fef2f2;
}

.topics-notification--success {
    border-color: #34d399;
    background: #ecfdf5;
}

.notification-content {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
}

.topics-notification--error .notification-content {
    color: #dc2626;
}

.topics-notification--success .notification-content {
    color: #059669;
}

.notification-message {
    flex: 1;
    font-size: 14px;
    font-weight: 500;
}

.notification-close {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: inherit;
    opacity: 0.7;
    padding: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.notification-close:hover {
    opacity: 1;
}

@keyframes slideInDown {
    0% {
        transform: translateY(-20px);
        opacity: 0;
    }
    100% {
        transform: translateY(0);
        opacity: 1;
    }
}

/* Responsive design */
@media (max-width: 768px) {
    .topics-editor-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
    }
    
    .quality-stats {
        grid-template-columns: 1fr;
        gap: 12px;
    }
    
    .bulk-actions-bar {
        flex-direction: column;
        gap: 8px;
        align-items: stretch;
    }
    
    .bulk-action-buttons {
        justify-content: center;
    }
}
</style>

<!-- ROOT FIX: Embedded JavaScript removed - functionality moved to panel-script.js -->
<!-- This eliminates the conflicting JavaScript implementations issue -->
<!-- All functionality is now handled by the standardized panel-script.js file -->
