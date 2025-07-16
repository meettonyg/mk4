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

<!-- ENHANCED JAVASCRIPT FOR LIVE EDITOR -->
<script>
/**
 * PHASE 1: Enhanced Live Topics Editor JavaScript
 * Implements real-time preview synchronization and advanced editing features
 */

class EnhancedTopicsDesignPanel {
    constructor() {
        this.topics = [];
        this.postId = null;
        this.isInitialized = false;
        this.saveTimeout = null;
        this.selectedElement = null;
        this.previewElement = null;
        this.autoSaveEnabled = true;
        this.qualityThresholds = {
            excellent: 80,
            good: 60,
            fair: 40,
            poor: 0
        };
        
        this.init();
    }

    async init() {
        console.log('🚀 Enhanced Topics Design Panel: Initializing...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    async initialize() {
        try {
            // Extract essential data
            this.extractPostId();
            this.extractNonce();
            this.findPreviewElement();
            
            // Setup UI components
            this.setupEventListeners();
            this.setupSortable();
            this.setupCollapsibleSections();
            
            // Load existing topics
            await this.loadExistingTopics();
            
            // Initialize integration status
            this.checkIntegrationStatus();
            
            // Setup auto-save
            this.setupAutoSave();
            
            this.isInitialized = true;
            console.log('✅ Enhanced Topics Design Panel: Initialization complete');
            
            // Trigger custom event for other components
            this.triggerEvent('topicsDesignPanelReady', {
                panel: this,
                postId: this.postId,
                topicsCount: this.topics.length
            });
            
        } catch (error) {
            console.error('❌ Enhanced Topics Design Panel: Initialization failed:', error);
            this.showError('Failed to initialize topics editor: ' + error.message);
        }
    }

    extractPostId() {
        // Multiple strategies to get post ID - ROOT FIX: Enhanced detection
        this.postId = (
            new URLSearchParams(window.location.search).get('post_id') ||
            new URLSearchParams(window.location.search).get('p') ||
            window.gmkbData?.postId ||                    // ROOT FIX: Correct global variable
            window.guestifyData?.postId ||
            window.guestifyMediaKit?.postId ||
            document.querySelector('[data-post-id]')?.dataset.postId ||
            document.querySelector('.topics-component')?.dataset.postId ||  // From preview element
            null
        );
        
        this.postId = this.postId ? parseInt(this.postId, 10) : null;
        
        if (!this.postId) {
            console.warn('⚠️ No post ID detected for topics editor');
            console.log('🔍 URL params:', new URLSearchParams(window.location.search).toString());
            console.log('🔍 gmkbData:', window.gmkbData);
        } else {
            console.log(`✅ Post ID detected: ${this.postId}`);
        }
    }

    extractNonce() {
        this.nonce = (
            window.gmkbData?.nonce ||            // ROOT FIX: Correct global variable name
            window.guestifyData?.nonce ||
            window.guestifyMediaKit?.nonce ||
            document.querySelector('input[name="_wpnonce"]')?.value ||
            document.querySelector('meta[name="gmkb-nonce"]')?.content ||
            ''
        );
        
        if (!this.nonce) {
            console.warn('⚠️ No nonce detected - save functionality may fail');
            console.log('🔍 Available globals:', {
                gmkbData: !!window.gmkbData,
                guestifyData: !!window.guestifyData,
                guestifyMediaKit: !!window.guestifyMediaKit
            });
        } else {
            console.log('✅ Nonce extracted successfully');
        }
    }

    findPreviewElement() {
        // Find the topics component in preview
        this.previewElement = (
            document.querySelector('.topics-component') ||
            document.querySelector('[data-component="topics"]') ||
            document.querySelector('.media-kit .content-section[data-element="topics"]')
        );
        
        if (this.previewElement) {
            console.log('✅ Preview element found:', this.previewElement);
        } else {
            console.warn('⚠️ Preview element not found - live updates may not work');
        }
    }

    setupEventListeners() {
        // Add topic button
        const addFirstTopicBtn = document.getElementById('add-first-topic-btn');
        const addTopicForm = document.getElementById('add-topic-form');
        const addTopicPrompt = document.getElementById('add-topic-prompt');
        const newTopicInput = document.getElementById('new-topic-input');
        const confirmAddBtn = document.getElementById('confirm-add-topic');
        const cancelAddBtn = document.getElementById('cancel-add-topic');

        addFirstTopicBtn?.addEventListener('click', () => {
            addTopicPrompt.style.display = 'none';
            addTopicForm.style.display = 'block';
            newTopicInput.focus();
        });

        confirmAddBtn?.addEventListener('click', () => this.addNewTopic());
        cancelAddBtn?.addEventListener('click', () => this.cancelAddTopic());

        // New topic input validation and quality checking
        newTopicInput?.addEventListener('input', (e) => this.validateNewTopicInput(e.target));
        newTopicInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addNewTopic();
            }
        });

        // Section settings listeners
        const sectionTitleInput = document.getElementById('section-title-input');
        const sectionIntroInput = document.getElementById('section-intro-input');
        
        sectionTitleInput?.addEventListener('input', (e) => this.updateSectionTitle(e.target.value));
        sectionIntroInput?.addEventListener('input', (e) => this.updateSectionIntro(e.target.value));

        // Display options listeners
        const displayStyleSelect = document.getElementById('display-style-select');
        const columnsSelect = document.getElementById('columns-select');
        
        displayStyleSelect?.addEventListener('change', (e) => this.updateDisplayStyle(e.target.value));
        columnsSelect?.addEventListener('change', (e) => this.updateColumns(e.target.value));

        // Integration actions
        const loadFromMkcgBtn = document.getElementById('load-from-mkcg');
        const syncWithMkcgBtn = document.getElementById('sync-with-mkcg');
        
        loadFromMkcgBtn?.addEventListener('click', () => this.loadFromMKCG());
        syncWithMkcgBtn?.addEventListener('click', () => this.syncWithMKCG());
    }

    setupSortable() {
        const topicsList = document.getElementById('live-topics-list');
        if (!topicsList || !window.Sortable) return;

        this.sortable = Sortable.create(topicsList, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            dragClass: 'sortable-drag',
            handle: '.topic-drag-handle',
            onStart: (evt) => {
                evt.item.classList.add('is-dragging');
            },
            onEnd: (evt) => {
                evt.item.classList.remove('is-dragging');
                this.handleTopicReorder(evt.oldIndex, evt.newIndex);
            }
        });
    }

    setupCollapsibleSections() {
        const toggles = document.querySelectorAll('.form-section__toggle');
        
        toggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const section = toggle.closest('.form-section--collapsible');
                const content = section.querySelector('.form-section__content');
                
                if (content.style.display === 'none') {
                    content.style.display = 'block';
                    section.classList.add('expanded');
                } else {
                    content.style.display = 'none';
                    section.classList.remove('expanded');
                }
            });
        });
    }

    async loadExistingTopics() {
        const loadingEl = document.getElementById('topics-loading');
        const topicsList = document.getElementById('live-topics-list');
        
        try {
            loadingEl.style.display = 'flex';
            
            // Try to get topics from preview first
            this.extractTopicsFromPreview();
            
            // If no topics and we have a post ID, try to load from server
            if (this.topics.length === 0 && this.postId) {
                await this.loadTopicsFromServer();
            }
            
            // Render topics in design panel
            this.renderTopicsList();
            this.updateTopicsCounter();
            this.updateQualityOverview();
            
        } catch (error) {
            console.error('Failed to load existing topics:', error);
            this.showError('Failed to load topics: ' + error.message);
        } finally {
            loadingEl.style.display = 'none';
        }
    }

    extractTopicsFromPreview() {
        if (!this.previewElement) return;

        const topicItems = this.previewElement.querySelectorAll('.topic-item');
        
        this.topics = Array.from(topicItems).map((item, index) => {
            const titleEl = item.querySelector('.topic-title');
            const title = titleEl ? titleEl.textContent.trim() : '';
            
            return {
                id: `topic_${index + 1}`,
                index: index,
                title: title,
                description: '',
                source: 'preview',
                element: item,
                quality: this.calculateTopicQuality(title),
                isValid: title.length >= 3
            };
        }).filter(topic => topic.title.length > 0);

        console.log(`📊 Extracted ${this.topics.length} topics from preview`);
    }

    async loadTopicsFromServer() {
        if (!this.postId || !this.nonce) return;

        try {
            const response = await this.sendAjaxRequest({
                action: 'load_stored_topics',
                post_id: this.postId,
                nonce: this.nonce
            });

            if (response.success && response.data.topics) {
                const serverTopics = response.data.topics;
                
                Object.entries(serverTopics).forEach(([key, title], index) => {
                    if (title && title.trim()) {
                        this.topics.push({
                            id: key,
                            index: index,
                            title: title.trim(),
                            description: '',
                            source: 'server',
                            quality: this.calculateTopicQuality(title),
                            isValid: title.length >= 3
                        });
                    }
                });

                console.log(`📊 Loaded ${this.topics.length} topics from server`);
            }
        } catch (error) {
            console.error('Failed to load topics from server:', error);
        }
    }

    renderTopicsList() {
        const topicsList = document.getElementById('live-topics-list');
        const loadingEl = document.getElementById('topics-loading');
        
        if (!topicsList) return;

        // Clear existing content except loading
        const existingItems = topicsList.querySelectorAll('.live-topic-item');
        existingItems.forEach(item => item.remove());

        if (this.topics.length === 0) {
            this.showAddTopicPrompt();
            return;
        }

        // Render each topic
        this.topics.forEach((topic, index) => {
            const topicEl = this.createTopicElement(topic, index);
            topicsList.insertBefore(topicEl, loadingEl);
        });

        this.hideAddTopicPrompt();
        this.showQualityOverview();
    }

    createTopicElement(topic, index) {
        const quality = this.getQualityLevel(topic.quality);
        
        const topicEl = document.createElement('div');
        topicEl.className = 'live-topic-item';
        topicEl.dataset.topicId = topic.id;
        topicEl.dataset.index = index;
        
        topicEl.innerHTML = `
            <div class="topic-drag-handle">
                <span></span>
                <span></span>
                <span></span>
            </div>
            
            <div class="topic-content">
                <input type="text" 
                       class="topic-input" 
                       value="${this.escapeHtml(topic.title)}"
                       data-topic-id="${topic.id}"
                       data-original-value="${this.escapeHtml(topic.title)}"
                       maxlength="100"
                       placeholder="Enter topic title...">
                
                <div class="topic-meta">
                    <div class="topic-quality">
                        <span class="quality-label">${quality.toUpperCase()}</span>
                        <div class="quality-bar">
                            <div class="quality-fill ${quality}" style="width: ${topic.quality}%"></div>
                        </div>
                        <span class="quality-score">${topic.quality}%</span>
                    </div>
                    <span class="topic-source">Source: ${topic.source}</span>
                    <span class="topic-chars">${topic.title.length}/100</span>
                </div>
            </div>
            
            <div class="topic-actions">
                <button class="topic-action-btn" title="Enhance Quality" data-action="enhance">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                    </svg>
                </button>
                <button class="topic-action-btn" title="Duplicate Topic" data-action="duplicate">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                </button>
                <button class="topic-action-btn danger" title="Delete Topic" data-action="delete">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                    </svg>
                </button>
            </div>
        `;

        // Add event listeners
        this.setupTopicElementListeners(topicEl, topic);
        
        return topicEl;
    }

    setupTopicElementListeners(topicEl, topic) {
        const input = topicEl.querySelector('.topic-input');
        const actionButtons = topicEl.querySelectorAll('.topic-action-btn');

        // Input change handling
        input.addEventListener('input', (e) => this.handleTopicInput(e, topic));
        input.addEventListener('blur', (e) => this.handleTopicBlur(e, topic));
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.target.blur();
            }
        });

        // Action button handling
        actionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleTopicAction(btn.dataset.action, topic, topicEl);
            });
        });
    }

    handleTopicInput(e, topic) {
        const newValue = e.target.value;
        const topicEl = e.target.closest('.live-topic-item');  // ROOT FIX: Get the topic element
        const charCount = topicEl.querySelector('.topic-chars');
        const qualityElements = topicEl.querySelectorAll('.quality-fill, .quality-score, .quality-label');
        
        // Update character count
        if (charCount) {
            charCount.textContent = `${newValue.length}/100`;
        }
        
        // Update quality in real-time
        const quality = this.calculateTopicQuality(newValue);
        const qualityLevel = this.getQualityLevel(quality);
        
        const qualityFill = topicEl.querySelector('.quality-fill');
        const qualityScore = topicEl.querySelector('.quality-score');
        const qualityLabel = topicEl.querySelector('.quality-label');
        
        if (qualityFill) {
            qualityFill.style.width = `${quality}%`;
            qualityFill.className = `quality-fill ${qualityLevel}`;
        }
        if (qualityScore) {
            qualityScore.textContent = `${quality}%`;
        }
        if (qualityLabel) {
            qualityLabel.textContent = qualityLevel.toUpperCase();
        }
        
        // Mark as unsaved
        this.markUnsaved();
        
        // Update preview in real-time
        this.updatePreviewTopic(topic.id, newValue);
    }

    handleTopicBlur(e, topic) {
        const newValue = e.target.value.trim();
        const originalValue = e.target.dataset.originalValue;
        
        if (newValue !== originalValue) {
            // Update topic data
            topic.title = newValue;
            topic.quality = this.calculateTopicQuality(newValue);
            topic.isValid = newValue.length >= 3;
            
            // Update original value
            e.target.dataset.originalValue = newValue;
            
            // Save changes
            this.scheduleAutoSave();
            
            console.log(`📝 Topic updated: "${originalValue}" → "${newValue}"`);
        }
    }

    handleTopicAction(action, topic, topicEl) {
        switch (action) {
            case 'enhance':
                this.enhanceTopicQuality(topic);
                break;
            case 'duplicate':
                this.duplicateTopic(topic);
                break;
            case 'delete':
                this.deleteTopic(topic, topicEl);
                break;
        }
    }

    enhanceTopicQuality(topic) {
        // Provide quality enhancement suggestions
        const suggestions = this.getQualityEnhancements(topic.title);
        
        if (suggestions.length > 0) {
            const message = `Quality Enhancement Suggestions for "${topic.title}":\n\n` +
                           suggestions.join('\n');
            
            if (confirm(message + '\n\nWould you like to apply the first suggestion?')) {
                const topicInput = document.querySelector(`input[data-topic-id="${topic.id}"]`);
                if (topicInput) {
                    topicInput.value = suggestions[0];
                    topicInput.dispatchEvent(new Event('input'));
                    topicInput.dispatchEvent(new Event('blur'));
                }
            }
        } else {
            alert(`"${topic.title}" already has excellent quality!`);
        }
    }

    getQualityEnhancements(title) {
        const enhancements = [];
        
        if (title.length < 20) {
            enhancements.push(`${title} Strategies and Best Practices`);
        }
        
        if (!title.includes('and') && !title.includes('&')) {
            enhancements.push(`${title} and Implementation`);
        }
        
        if (title.charAt(0) !== title.charAt(0).toUpperCase()) {
            enhancements.push(title.charAt(0).toUpperCase() + title.slice(1));
        }
        
        return enhancements.slice(0, 3);
    }

    duplicateTopic(topic) {
        const newTopic = {
            id: `topic_${Date.now()}`,
            index: this.topics.length,
            title: `${topic.title} (Copy)`,
            description: topic.description,
            source: 'duplicated',
            quality: this.calculateTopicQuality(`${topic.title} (Copy)`),
            isValid: true
        };
        
        this.topics.push(newTopic);
        this.renderTopicsList();
        this.updateTopicsCounter();
        this.scheduleAutoSave();
        
        console.log(`📋 Topic duplicated: "${topic.title}"`);
    }

    deleteTopic(topic, topicEl) {
        if (!confirm(`Delete topic "${topic.title}"?`)) return;
        
        // Remove from array
        const index = this.topics.findIndex(t => t.id === topic.id);
        if (index > -1) {
            this.topics.splice(index, 1);
        }
        
        // Remove from DOM
        topicEl.remove();
        
        // Update preview
        this.removePreviewTopic(topic.id);
        
        // Update UI
        this.updateTopicsCounter();
        this.updateQualityOverview();
        
        if (this.topics.length === 0) {
            this.showAddTopicPrompt();
        }
        
        // Save changes
        this.scheduleAutoSave();
        
        console.log(`🗑️ Topic deleted: "${topic.title}"`);
    }

    // ... (Continue with remaining methods in next part due to length)

    calculateTopicQuality(title) {
        if (!title || title.length < 3) return 0;
        
        let score = 0;
        const length = title.length;
        const wordCount = title.split(/\s+/).length;
        
        // Length scoring (optimal 20-60 characters)
        if (length >= 20 && length <= 60) {
            score += 40;
        } else if (length >= 10 && length <= 80) {
            score += 25;
        } else if (length >= 3) {
            score += 10;
        }
        
        // Word count scoring (optimal 2-8 words)
        if (wordCount >= 2 && wordCount <= 8) {
            score += 30;
        } else if (wordCount >= 1 && wordCount <= 12) {
            score += 15;
        }
        
        // Professional language indicators
        if (/^[A-Z]/.test(title)) score += 10; // Starts with capital
        if (!/\s{2,}/.test(title)) score += 10; // No double spaces
        if (!/[!]{2,}/.test(title)) score += 10; // No excessive punctuation
        
        return Math.min(100, score);
    }

    getQualityLevel(score) {
        if (score >= this.qualityThresholds.excellent) return 'excellent';
        if (score >= this.qualityThresholds.good) return 'good';
        if (score >= this.qualityThresholds.fair) return 'fair';
        return 'poor';
    }

    updatePreviewTopic(topicId, newTitle) {
        if (!this.previewElement) return;
        
        const index = parseInt(topicId.split('_')[1]) - 1;
        const previewTopicItem = this.previewElement.querySelector(`.topic-item:nth-child(${index + 1})`);
        
        if (previewTopicItem) {
            const titleElement = previewTopicItem.querySelector('.topic-title');
            if (titleElement) {
                titleElement.textContent = newTitle;
                
                // Add visual feedback
                titleElement.style.background = '#e6f3ff';
                setTimeout(() => {
                    titleElement.style.background = '';
                }, 1000);
            }
        }
        
        console.log(`🔄 Preview updated for ${topicId}: "${newTitle}"`);
    }

    // Auto-save and save functionality
    setupAutoSave() {
        this.autoSaveDelay = 2000; // 2 seconds
        console.log('⚡ Auto-save enabled for topics design panel');
    }

    scheduleAutoSave() {
        if (!this.autoSaveEnabled) return;
        
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }
        
        this.setSaveStatus('unsaved');
        
        this.saveTimeout = setTimeout(() => {
            this.performSave('auto');
        }, this.autoSaveDelay);
    }

    async performSave(saveType = 'manual') {
        // ROOT FIX: Enhanced save validation and error handling
        if (!this.postId || !this.nonce) {
            const errorMsg = `Cannot save: Missing ${!this.postId ? 'post ID' : 'nonce'}`;
            console.error('❌ Save validation failed:', errorMsg);
            this.setSaveStatus('error', errorMsg);
            this.showUserError('Save failed: Missing required data. Please refresh the page.');
            return false;
        }
        
        if (window.gmkbData?.debugMode) {
            console.log('💾 Starting save operation:', {
                saveType: saveType,
                postId: this.postId,
                topicsCount: this.topics.length,
                hasNonce: !!this.nonce
            });
        }
        
        this.setSaveStatus('saving');
        
        try {
            // ROOT FIX: Enhanced topics data preparation with validation
            const topicsData = {};
            let validTopicsCount = 0;
            
            this.topics.forEach((topic, index) => {
                if (topic.title && topic.title.trim() && topic.title.trim().length >= 3) {
                    topicsData[topic.id] = topic.title.trim();
                    validTopicsCount++;
                } else if (window.gmkbData?.debugMode) {
                    console.log(`⚠️ Skipping invalid topic ${index + 1}: "${topic.title}" (too short)`);
                }
            });
            
            if (window.gmkbData?.debugMode) {
                console.log('💾 Topics data prepared:', {
                    totalTopics: this.topics.length,
                    validTopics: validTopicsCount,
                    topicsData: topicsData
                });
            }
            
            // ROOT FIX: Enhanced AJAX request with better error details
            const requestData = {
                action: 'save_custom_topics',
                post_id: this.postId,
                topics: topicsData, // Will be JSON.stringify'd by sendAjaxRequest
                save_type: saveType,
                client_timestamp: Math.floor(Date.now() / 1000),
                nonce: this.nonce
            };
            
            if (window.gmkbData?.debugMode) {
                console.log('💾 Sending AJAX request:', requestData);
            }
            
            const response = await this.sendAjaxRequest(requestData);
            
            if (response.success) {
                this.setSaveStatus('saved');
                
                if (window.gmkbData?.debugMode) {
                    console.log('✅ Topics saved successfully:', response.data);
                }
                
                // Show user success feedback
                this.showUserSuccess(`Saved ${validTopicsCount} topic${validTopicsCount !== 1 ? 's' : ''} successfully!`);
                
                return true;
            } else {
                // ROOT FIX: Enhanced error handling with specific error types
                const errorMsg = response.data?.message || response.message || 'Save operation failed';
                const errorCode = response.data?.code || 'UNKNOWN_ERROR';
                
                console.error('❌ Server returned error:', {
                    message: errorMsg,
                    code: errorCode,
                    fullResponse: response
                });
                
                // Show user-friendly error message based on error code
                let userMessage = errorMsg;
                switch (errorCode) {
                    case 'NONCE_MISSING':
                    case 'INVALID_NONCE':
                        userMessage = 'Security verification failed. Please refresh the page and try again.';
                        break;
                    case 'INSUFFICIENT_PERMISSIONS':
                        userMessage = 'You do not have permission to save topics. Please check your user role.';
                        break;
                    case 'INVALID_POST_ID':
                    case 'POST_NOT_FOUND':
                        userMessage = 'The post could not be found. Please refresh the page.';
                        break;
                    case 'JSON_DECODE_ERROR':
                        userMessage = 'Data format error. Please try saving again.';
                        break;
                    case 'VALIDATION_FAILED':
                        userMessage = 'Some topics contain invalid content. Please check your entries.';
                        break;
                }
                
                this.setSaveStatus('error', userMessage);
                this.showUserError(userMessage);
                
                throw new Error(errorMsg);
            }
            
        } catch (error) {
            console.error('❌ Save failed with exception:', {
                error: error.message,
                stack: error.stack,
                saveType: saveType,
                postId: this.postId
            });
            
            const errorMessage = error.message || 'An unexpected error occurred while saving';
            this.setSaveStatus('error', errorMessage);
            
            // Show user-friendly error for network/connection issues
            if (error.message.includes('HTTP') || error.message.includes('fetch')) {
                this.showUserError('Connection error. Please check your internet connection and try again.');
            } else {
                this.showUserError(errorMessage);
            }
            
            return false;
        }
    }

    setSaveStatus(status, message = '') {
        const statusEl = document.getElementById('topics-save-status');
        const iconEl = statusEl?.querySelector('.save-icon');
        const textEl = statusEl?.querySelector('.save-text');
        const timestampEl = statusEl?.querySelector('.save-timestamp');
        
        if (!statusEl) return;
        
        statusEl.dataset.status = status;
        
        const configs = {
            saved: { icon: '✅', text: 'Saved', color: '#10b981' },
            saving: { icon: '⏳', text: 'Saving...', color: '#f59e0b' },
            unsaved: { icon: '⚠️', text: 'Unsaved changes', color: '#ef4444' },
            error: { icon: '❌', text: 'Save failed', color: '#ef4444' }
        };
        
        const config = configs[status] || configs.saved;
        
        if (iconEl) iconEl.textContent = config.icon;
        if (textEl) {
            textEl.textContent = message || config.text;
            textEl.style.color = config.color;
        }
        
        if (timestampEl && status === 'saved') {
            timestampEl.textContent = `at ${new Date().toLocaleTimeString()}`;
        }
    }

    // ROOT FIX: Add missing methods that are being called
    showAddTopicPrompt() {
        const addTopicPrompt = document.getElementById('add-topic-prompt');
        const addTopicForm = document.getElementById('add-topic-form');
        
        if (addTopicPrompt) addTopicPrompt.style.display = 'block';
        if (addTopicForm) addTopicForm.style.display = 'none';
    }

    hideAddTopicPrompt() {
        const addTopicPrompt = document.getElementById('add-topic-prompt');
        if (addTopicPrompt) addTopicPrompt.style.display = 'none';
    }

    showQualityOverview() {
        const qualityOverview = document.getElementById('topics-quality-overview');
        if (qualityOverview && this.topics.length > 0) {
            qualityOverview.style.display = 'block';
        }
    }

    updateTopicsCounter() {
        const countEl = document.getElementById('live-topic-count');
        if (countEl) {
            countEl.textContent = this.topics.length;
        }
    }

    updateQualityOverview() {
        if (this.topics.length === 0) return;

        const avgQuality = Math.round(
            this.topics.reduce((sum, topic) => sum + topic.quality, 0) / this.topics.length
        );
        
        const completion = Math.round((this.topics.length / 10) * 100); // Assuming 10 is max
        const excellentCount = this.topics.filter(t => t.quality >= 80).length;

        const avgQualityEl = document.getElementById('average-quality');
        const completionEl = document.getElementById('completion-rate');
        const excellenceEl = document.getElementById('excellence-count');

        if (avgQualityEl) avgQualityEl.textContent = `${avgQuality}%`;
        if (completionEl) completionEl.textContent = `${completion}%`;
        if (excellenceEl) excellenceEl.textContent = excellentCount;
    }

    checkIntegrationStatus() {
        const statusDot = document.getElementById('integration-status-dot');
        const statusText = document.getElementById('integration-status-text');
        
        if (this.postId && this.topics.length > 0) {
            if (statusDot) statusDot.dataset.status = 'connected';
            if (statusText) statusText.textContent = `Found ${this.topics.length} topics`;
        } else {
            if (statusDot) statusDot.dataset.status = 'disconnected';
            if (statusText) statusText.textContent = 'No topics data found';
        }
    }

    markUnsaved() {
        this.setSaveStatus('unsaved');
    }

    addNewTopic() {
        const input = document.getElementById('new-topic-input');
        const newTitle = input?.value?.trim();
        
        if (!newTitle || newTitle.length < 3) {
            alert('Please enter a topic with at least 3 characters.');
            return;
        }

        const newTopic = {
            id: `topic_${Date.now()}`,
            index: this.topics.length,
            title: newTitle,
            description: '',
            source: 'manual',
            quality: this.calculateTopicQuality(newTitle),
            isValid: true
        };

        this.topics.push(newTopic);
        this.renderTopicsList();
        this.updateTopicsCounter();
        this.updateQualityOverview();
        this.scheduleAutoSave();

        // Clear form
        if (input) input.value = '';
        this.cancelAddTopic();

        console.log(`➕ New topic added: "${newTitle}"`);
    }

    cancelAddTopic() {
        const addTopicForm = document.getElementById('add-topic-form');
        const addTopicPrompt = document.getElementById('add-topic-prompt');
        const input = document.getElementById('new-topic-input');
        
        if (addTopicForm) addTopicForm.style.display = 'none';
        if (this.topics.length === 0 && addTopicPrompt) {
            addTopicPrompt.style.display = 'block';
        }
        if (input) input.value = '';
    }

    validateNewTopicInput(input) {
        const charCounter = document.querySelector('.char-counter');
        const qualityIndicator = document.getElementById('new-topic-quality');
        
        if (charCounter) {
            charCounter.textContent = `${input.value.length}/100`;
        }
        
        if (qualityIndicator) {
            const quality = this.calculateTopicQuality(input.value);
            const level = this.getQualityLevel(quality);
            const qualitySpan = qualityIndicator.querySelector('span');
            if (qualitySpan) {
                qualitySpan.textContent = level.charAt(0).toUpperCase() + level.slice(1);
                qualitySpan.className = level;
            }
        }
    }

    handleTopicReorder(oldIndex, newIndex) {
        if (oldIndex === newIndex) return;
        
        // Reorder topics array
        const topic = this.topics.splice(oldIndex, 1)[0];
        this.topics.splice(newIndex, 0, topic);
        
        // Update indices
        this.topics.forEach((topic, index) => {
            topic.index = index;
        });
        
        // Update preview
        this.updatePreviewOrder();
        
        // Save changes
        this.scheduleAutoSave();
        
        console.log(`🔄 Topic reordered: ${oldIndex} → ${newIndex}`);
    }

    updatePreviewOrder() {
        // Update the preview component to match new order
        if (!this.previewElement) return;
        
        const topicsContainer = this.previewElement.querySelector('.topics-container');
        if (!topicsContainer) return;
        
        // Reorder preview elements to match new order
        const topicItems = Array.from(topicsContainer.querySelectorAll('.topic-item'));
        
        this.topics.forEach((topic, newIndex) => {
            const topicElement = topicItems.find(el => {
                const titleEl = el.querySelector('.topic-title');
                return titleEl && titleEl.textContent.trim() === topic.title;
            });
            
            if (topicElement) {
                topicsContainer.appendChild(topicElement);
            }
        });
    }

    removePreviewTopic(topicId) {
        if (!this.previewElement) return;
        
        const index = parseInt(topicId.split('_')[1]) - 1;
        const previewTopicItem = this.previewElement.querySelector(`.topic-item:nth-child(${index + 1})`);
        
        if (previewTopicItem) {
            previewTopicItem.remove();
        }
    }

    updateSectionTitle(title) {
        if (!this.previewElement) return;
        
        const titleElement = this.previewElement.querySelector('.section-title');
        if (titleElement) {
            titleElement.textContent = title;
        }
        
        this.scheduleAutoSave();
    }

    updateSectionIntro(intro) {
        if (!this.previewElement) return;
        
        const introElement = this.previewElement.querySelector('.topics-introduction');
        if (introElement) {
            introElement.textContent = intro;
        }
        
        this.scheduleAutoSave();
    }

    updateDisplayStyle(style) {
        if (!this.previewElement) return;
        
        const container = this.previewElement.querySelector('.topics-container');
        if (container) {
            container.setAttribute('data-layout', style);
        }
        
        this.scheduleAutoSave();
    }

    updateColumns(columns) {
        if (!this.previewElement) return;
        
        this.previewElement.style.setProperty('--columns', columns);
        this.scheduleAutoSave();
    }

    async loadFromMKCG() {
        console.log('🔄 Loading topics from MKCG...');
        // Implementation for MKCG integration
        alert('MKCG integration coming soon!');
    }

    async syncWithMKCG() {
        console.log('🔄 Syncing with MKCG...');
        // Implementation for MKCG sync
        alert('MKCG sync coming soon!');
    }

    // ROOT FIX: Enhanced AJAX communication with proper error handling
    async sendAjaxRequest(data) {
        const url = window.gmkbData?.ajaxUrl || window.guestifyData?.ajaxUrl || '/wp-admin/admin-ajax.php';
        
        if (window.gmkbData?.debugMode) {
            console.log('🌐 AJAX Request Debug:', {
                url: url,
                action: data.action,
                dataKeys: Object.keys(data),
                payloadSize: JSON.stringify(data).length
            });
        }
        
        // ROOT FIX: Use URLSearchParams instead of FormData for better WordPress compatibility
        const requestBody = new URLSearchParams();
        Object.entries(data).forEach(([key, value]) => {
            if (typeof value === 'object' && value !== null) {
                // Ensure proper JSON encoding for complex data
                requestBody.append(key, JSON.stringify(value));
            } else {
                requestBody.append(key, String(value || ''));
            }
        });
        
        try {
            const startTime = performance.now();
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: requestBody,
                credentials: 'same-origin'
            });
            
            const endTime = performance.now();
            
            if (window.gmkbData?.debugMode) {
                console.log(`🌐 AJAX Response: ${response.status} (${Math.round(endTime - startTime)}ms)`);
            }
            
            if (!response.ok) {
                // Get response text for better error reporting
                const errorText = await response.text();
                console.error('❌ AJAX Error Response:', {
                    status: response.status,
                    statusText: response.statusText,
                    responseText: errorText.substring(0, 500) // First 500 chars
                });
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const responseData = await response.json();
            
            if (window.gmkbData?.debugMode) {
                console.log('🌐 AJAX Response Data:', responseData);
            }
            
            return responseData;
            
        } catch (error) {
            console.error('❌ AJAX Request Failed:', {
                error: error.message,
                url: url,
                action: data.action,
                requestSize: requestBody.toString().length
            });
            throw error;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    triggerEvent(eventName, data) {
        const event = new CustomEvent(eventName, { detail: data });
        window.dispatchEvent(event);
    }

    showError(message) {
        console.error('Topics Design Panel Error:', message);
        this.showUserError(message);
    }
    
    // ROOT FIX: User feedback methods for better UX
    showUserError(message) {
        // Remove any existing notifications
        this.removeNotifications();
        
        const notification = document.createElement('div');
        notification.className = 'topics-notification topics-notification--error';
        notification.innerHTML = `
            <div class="notification-content">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                <span class="notification-message">${this.escapeHtml(message)}</span>
                <button class="notification-close" aria-label="Close">&times;</button>
            </div>
        `;
        
        this.insertNotification(notification);
    }
    
    showUserSuccess(message) {
        // Remove any existing notifications
        this.removeNotifications();
        
        const notification = document.createElement('div');
        notification.className = 'topics-notification topics-notification--success';
        notification.innerHTML = `
            <div class="notification-content">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span class="notification-message">${this.escapeHtml(message)}</span>
                <button class="notification-close" aria-label="Close">&times;</button>
            </div>
        `;
        
        this.insertNotification(notification);
        
        // Auto-hide success notifications after 3 seconds
        setTimeout(() => {
            this.removeNotifications();
        }, 3000);
    }
    
    insertNotification(notification) {
        const topicsEditor = document.getElementById('topics-live-editor');
        if (topicsEditor) {
            topicsEditor.insertBefore(notification, topicsEditor.firstChild);
            
            // Add close button functionality
            const closeBtn = notification.querySelector('.notification-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.removeNotifications();
                });
            }
        }
    }
    
    removeNotifications() {
        const notifications = document.querySelectorAll('.topics-notification');
        notifications.forEach(notification => notification.remove());
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.enhancedTopicsDesignPanel = new EnhancedTopicsDesignPanel();
    });
} else {
    window.enhancedTopicsDesignPanel = new EnhancedTopicsDesignPanel();
}
</script>
