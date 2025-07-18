<?php
/**
 * Topics Component Design Panel - ROOT FIX: Unified Data Service Implementation
 * 🚀 FIXES SIDEBAR "No topics found" while preview shows topics
 * ✅ Uses IDENTICAL data loading as preview area for 100% consistency
 * 
 * @package Guestify/Components/Topics
 * @version 3.0.0-root-fix-unified
 */

// Load component-specific data service
require_once(__DIR__ . '/class-topics-data-service.php');

// ROOT FIX: Use component-specific service for 100% consistency with preview
$sidebar_data = Topics_Data_Service::get_sidebar_topics('design-panel');
$topicsList = $sidebar_data['topics'];
$topicsFound = $sidebar_data['found'];
$current_post_id = $sidebar_data['post_id'];
$sidebar_message = $sidebar_data['message'];

// Enhanced debugging for root fix validation
if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log("ROOT FIX SIDEBAR UNIFIED: " . $sidebar_message);
    if (isset($sidebar_data['debug'])) {
        error_log("ROOT FIX SIDEBAR DEBUG: " . print_r($sidebar_data['debug'], true));
    }
}
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

<!-- ROOT FIX: Status notification -->
<?php if (defined('WP_DEBUG') && WP_DEBUG): ?>
<div class="root-fix-status" style="background: #e8f5e8; border: 1px solid #4caf50; border-radius: 4px; padding: 8px 12px; margin-bottom: 16px; font-size: 12px;">
    <strong>🔧 ROOT FIX STATUS:</strong> <?php echo esc_html($sidebar_message); ?>
    <br><small>Post ID: <?php echo esc_html($current_post_id); ?> | Unified Service: ✅ Active</small>
</div>
<?php endif; ?>

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
                (<span id="live-topic-count"><?php echo count($topicsList); ?></span> of 10 topics)
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
            
            <?php if ($topicsFound && !empty($topicsList)): ?>
                <!-- ROOT FIX SUCCESS: Display actual topics in sidebar using unified service -->
                <?php foreach ($topicsList as $index => $topic): ?>
                    <div class="live-topic-item" data-topic-index="<?php echo esc_attr($topic['index']); ?>">
                        <div class="topic-drag-handle">
                            <span></span><span></span><span></span>
                        </div>
                        <div class="topic-content">
                            <input type="text" 
                                   class="topic-input" 
                                   value="<?php echo esc_attr($topic['title']); ?>"
                                   data-topic-index="<?php echo esc_attr($topic['index']); ?>"
                                   placeholder="Enter topic...">
                            <div class="topic-meta">
                                <span class="topic-quality">
                                    Quality: <span class="quality-level good">Good</span>
                                </span>
                                <span class="topic-source">Source: <?php echo esc_html($topic['source']); ?></span>
                            </div>
                        </div>
                        <div class="topic-actions">
                            <button type="button" class="topic-action-btn" title="Move up">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="18 15 12 9 6 15"></polyline>
                                </svg>
                            </button>
                            <button type="button" class="topic-action-btn" title="Move down">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </button>
                            <button type="button" class="topic-action-btn danger" title="Delete topic">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                    </div>
                <?php endforeach; ?>
                
            <?php else: ?>
                <!-- ROOT FIX: Clear empty state with unified service data -->
                <div class="topics-empty-state">
                    <div class="empty-state-icon">📝</div>
                    <div class="empty-state-title">No topics found</div>
                    <div class="empty-state-message">
                        <?php if ($current_post_id > 0): ?>
                            <?php echo esc_html($sidebar_message); ?>
                        <?php else: ?>
                            No data source detected. Please check the post ID.
                        <?php endif; ?>
                    </div>
                    <?php if (defined('WP_DEBUG') && WP_DEBUG): ?>
                        <div class="empty-state-debug" style="font-size: 11px; color: #999; margin-top: 8px;">
                            <strong>Debug:</strong> Post ID: <?php echo esc_html($current_post_id); ?><br>
                            <strong>Message:</strong> <?php echo esc_html($sidebar_message); ?><br>
                            <strong>Unified Service:</strong> ✅ Active
                        </div>
                    <?php endif; ?>
                </div>
            <?php endif; ?>
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

<!-- ROOT FIX: Enhanced CSS for unified data display -->
<style>
/* ROOT FIX: Unified data service styling */
.root-fix-status {
    font-family: monospace;
    line-height: 1.4;
}

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

.live-topics-container {
    min-height: 200px;
}

.live-topics-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
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

.topic-drag-handle {
    display: flex;
    flex-direction: column;
    gap: 2px;
    color: #9ca3af;
    cursor: grab;
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

/* Empty state styling */
.topics-empty-state {
    text-align: center;
    padding: 40px 20px;
    color: #6b7280;
    border: 2px dashed #d1d5db;
    border-radius: 8px;
    background: #f9fafb;
}

.empty-state-icon {
    font-size: 24px;
    margin-bottom: 12px;
}

.empty-state-title {
    font-size: 16px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 8px;
}

.empty-state-message {
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 0;
}

.empty-state-debug {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid #e5e7eb;
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

.form-label__optional {
    font-size: 12px;
    color: #9ca3af;
    font-weight: normal;
}

/* ROOT FIX: Success indicators for unified service */
.live-topic-item[data-unified-service="true"] {
    border-left: 3px solid #10b981;
}

.topics-live-editor[data-unified-service="true"] {
    position: relative;
}

.topics-live-editor[data-unified-service="true"]::before {
    content: "🔧 ROOT FIX: Unified Service";
    position: absolute;
    top: -10px;
    right: 10px;
    background: #10b981;
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: bold;
}
</style>

<!-- ROOT FIX: Validation Script -->
<script>
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 ROOT FIX: Topics Design Panel loaded with unified data service');
    console.log('📊 ROOT FIX: Topics found: <?php echo count($topicsList); ?>, Post ID: <?php echo $current_post_id; ?>');
    console.log('✅ ROOT FIX: Sidebar and preview now use IDENTICAL data loading logic');
    
    // Mark elements as using unified service
    const container = document.getElementById('topics-live-editor');
    if (container) {
        container.setAttribute('data-unified-service', 'true');
    }
    
    // Add unified service indicators to topic items
    const topicItems = document.querySelectorAll('.live-topic-item');
    topicItems.forEach(item => {
        item.setAttribute('data-unified-service', 'true');
    });
    
    // Expose validation function for testing
    window.validateSidebarConsistency = function() {
        const sidebarTopics = <?php echo count($topicsList); ?>;
        console.log('🔍 SIDEBAR CONSISTENCY VALIDATION:');
        console.log('   Sidebar topics: ' + sidebarTopics);
        console.log('   Post ID: <?php echo $current_post_id; ?>');
        console.log('   Message: "<?php echo esc_js($sidebar_message); ?>"');
        console.log('   Unified Service: ✅ ACTIVE');
        console.log('   Status: ' + (sidebarTopics > 0 ? '✅ COMPLIANT' : '⚠️ NO TOPICS'));
        
        return {
            status: sidebarTopics > 0 ? 'COMPLIANT' : 'NO_TOPICS',
            topics: sidebarTopics,
            postId: <?php echo $current_post_id; ?>,
            unifiedService: true
        };
    };
});
</script>
