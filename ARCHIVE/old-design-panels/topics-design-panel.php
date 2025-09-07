<?php
/**
 * Topics Component Design Panel - BEM COMPLIANT MODERN UI
 * BEM-compliant version with enhanced drag & drop, smart placeholders, and improved UX
 * 
 * ROOT FIX: Added data-property attributes to all form elements for JavaScript binding
 * This fixes the topic edit sync issue between sidebar and preview
 * 
 * @package Guestify/Components/Topics
 * @version 6.0.0-bem-compliant
 */

// FIXED: Get post_id from request parameters instead of hard-coding
$post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;

if ($post_id <= 0) {
    // Fallback: try to get from URL or other sources
    $post_id = isset($_GET['post_id']) ? intval($_GET['post_id']) : 0;
    
    if ($post_id <= 0) {
        $post_id = get_the_ID();
    }
}

// Use the AJAX handler directly for topics data instead of complex service
$topicsList = array();
$topicsFound = false;
$current_post_id = $post_id;
$sidebar_message = 'No topics found';

// Load topics using the same method as the AJAX handler
if ($post_id > 0) {
    // PHASE 1 FIX: Load from Pods fields only (topic_1, topic_2, etc.) - single source of truth
    for ($i = 1; $i <= 5; $i++) {
        $topic_value = get_post_meta($post_id, "topic_{$i}", true);
        
        if (!empty($topic_value) && is_string($topic_value)) {
            $cleaned_value = sanitize_text_field(trim($topic_value));
            if (strlen($cleaned_value) > 0) {
                $topicsList[] = array(
                    'title' => $cleaned_value,
                    'description' => '',
                    'index' => $i - 1
                );
                $topicsFound = true;
            }
        }
    }
    
    if ($topicsFound) {
        $sidebar_message = count($topicsList) . ' topics loaded from Pods fields';
    } else {
        $sidebar_message = 'No topics found for post ' . $post_id;
    }
} else {
    $sidebar_message = 'No valid post ID provided';
}

// Data already loaded above

// Smart placeholders for different topic positions
$smart_placeholders = [
    1 => "Enter your primary expertise area...",
    2 => "Add your second area of expertise...",
    3 => "What's another topic you speak about?",
    4 => "Share another area you're knowledgeable about...",
    5 => "Round out your expertise with a final topic..."
];

if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log("BEM TOPICS: Using post_id {$post_id} - Result: " . count($topicsList) . " topics");
}
?>

<!-- ROOT FIX: Add section title control -->
<div class="element-editor__title">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
    </svg>
    Topics Component
</div>
<div class="element-editor__subtitle">Manage your speaking topics and display settings</div>

<div class="form-section">
    <h4 class="form-section__title">Section Settings</h4>
    
    <div class="form-group">
        <label class="form-label">Section Title</label>
        <input type="text" class="form-input" data-property="title" placeholder="Speaking Topics" value="Speaking Topics">
        <p class="form-help-text">The main heading for your topics section</p>
    </div>
</div>

<!-- BEM COMPLIANT TEMPLATE MATCHING DESIGN -->
<div class="topics-sidebar">
    <!-- LIVE EDITOR SECTION (NO MAIN HEADER) -->
    <div class="topics-sidebar__live-section">
        <div class="topics-sidebar__section-header">
            <h3 class="topics-sidebar__section-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Live Editor
            </h3>
            <div class="topics-sidebar__auto-save topics-sidebar__auto-save--saved">
                <div class="topics-sidebar__save-dot"></div>
                <span>Auto-saved</span>
            </div>
        </div>

        <!-- TOPICS LIST MATCHING TEMPLATE DESIGN -->
        <div class="topics-sidebar__topics-list" id="topics-list">
            <?php if ($topicsFound && !empty($topicsList)): ?>
                <?php foreach ($topicsList as $index => $topic): ?>
                    <div class="topics-sidebar__topic-item <?php echo $index === 0 ? 'topics-sidebar__topic-item--focused' : ''; ?>" data-topic-index="<?php echo $index + 1; ?>">
                        <div class="topics-sidebar__topic-header">
                            <div class="topics-sidebar__drag-handle" draggable="true">
                                <span></span><span></span><span></span>
                            </div>
                            <div class="topics-sidebar__topic-number"><?php echo $index + 1; ?></div>
                            <div class="topics-sidebar__topic-status">
                                <div class="topics-sidebar__status-dot"></div>
                            </div>
                        </div>
                        <div class="topics-sidebar__input-container">
                            <textarea class="topics-sidebar__topic-input" 
                                      data-property="topic_<?php echo $index + 1; ?>"
                                      placeholder="<?php echo esc_attr($smart_placeholders[$index + 1] ?? 'Enter your speaking topic...'); ?>" 
                                      aria-label="Topic <?php echo $index + 1; ?> input"><?php echo esc_textarea(trim($topic['title'])); ?></textarea>
                        </div>
                        <div class="topics-sidebar__input-feedback">
                            <?php 
                            $topicLength = strlen($topic['title']);
                            $counterClass = 'topics-sidebar__char-counter';
                            $statusText = 'characters';
                            
                            if ($topicLength >= 20 && $topicLength <= 60) {
                                $counterClass .= ' topics-sidebar__char-counter--optimal';
                                $statusText = 'optimal length';
                            } elseif ($topicLength > 60 && $topicLength <= 80) {
                                $counterClass .= ' topics-sidebar__char-counter--warning';
                                $statusText = 'getting long';
                            } elseif ($topicLength > 80) {
                                $counterClass .= ' topics-sidebar__char-counter--error';
                                $statusText = 'too long';
                            }
                            ?>
                            <div class="<?php echo $counterClass; ?>">
                                <span><?php echo $topicLength; ?>/80</span>
                                <span><?php echo $statusText; ?></span>
                            </div>
                            <div class="topics-sidebar__range-indicator">Sweet spot: 20-60</div>
                        </div>
                        <div class="topics-sidebar__topic-actions">
                            <button class="topics-sidebar__action-btn" data-tooltip="Create a copy of this topic">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                </svg>
                                Copy
                            </button>
                            <button class="topics-sidebar__action-btn topics-sidebar__action-btn--danger" data-tooltip="Remove this topic permanently">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3,6 5,6 21,6"></polyline>
                                    <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
                                </svg>
                                Delete
                            </button>
                        </div>
                    </div>
                <?php endforeach; ?>
                
                <!-- ROOT FIX: Add hidden inputs for unused topic slots -->
                <?php 
                $topicsCount = count($topicsList);
                for ($i = $topicsCount + 1; $i <= 5; $i++): 
                ?>
                    <input type="hidden" data-property="topic_<?php echo $i; ?>" value="">
                <?php endfor; ?>
            <?php else: ?>
                <!-- TEMPLATE MATCHING EMPTY STATE WITH FORM INPUTS -->
                <div class="topics-sidebar__empty-state">
                    <div class="topics-sidebar__empty-message">No topics yet. Add your first topic to get started.</div>
                    <button class="topics-sidebar__add-first-btn" data-action="add-first-topic">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Add First Topic
                    </button>
                </div>
                
                <!-- ROOT FIX: Add hidden form inputs for all topics to ensure data-property binding -->
                <?php for ($i = 1; $i <= 5; $i++): ?>
                    <input type="hidden" data-property="topic_<?php echo $i; ?>" value="">
                <?php endfor; ?>
            <?php endif; ?>
        </div>
    </div>

    <!-- DISPLAY OPTIONS SECTION -->
    <div class="topics-sidebar__display-options">
        <div class="topics-sidebar__options-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span>Display Options</span>
        </div>
        
        <div class="topics-sidebar__option-row">
            <span class="topics-sidebar__option-label">Enable numbering</span>
            <label class="topics-sidebar__toggle topics-sidebar__toggle--active">
                <input type="checkbox" data-property="show_numbering" checked>
                <div class="topics-sidebar__toggle-slider"></div>
            </label>
        </div>
        
        <div class="topics-sidebar__option-row">
            <span class="topics-sidebar__option-label">Drag & drop reordering</span>
            <label class="topics-sidebar__toggle topics-sidebar__toggle--active">
                <input type="checkbox" data-property="enable_drag_drop" checked>
                <div class="topics-sidebar__toggle-slider"></div>
            </label>
        </div>
        
        <div class="topics-sidebar__option-row">
            <span class="topics-sidebar__option-label">Link to AI Builder</span>
            <button class="topics-sidebar__ai-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 11H1l8-8 8 8"></path>
                    <circle cx="9" cy="11" r="2"></circle>
                </svg>
                Open AI Builder
            </button>
        </div>
        
        <div class="topics-sidebar__style-grid">
            <label class="topics-sidebar__style-option topics-sidebar__style-option--active">
                <input type="radio" name="layout_style" data-property="layout_style" value="list" checked style="display: none;">
                List View
            </label>
            <label class="topics-sidebar__style-option">
                <input type="radio" name="layout_style" data-property="layout_style" value="grid" style="display: none;">
                Grid View
            </label>
            <label class="topics-sidebar__style-option">
                <input type="radio" name="layout_style" data-property="layout_style" value="pills" style="display: none;">
                Tag Style
            </label>
            <label class="topics-sidebar__style-option">
                <input type="radio" name="layout_style" data-property="layout_style" value="cards" style="display: none;">
                Card Layout
            </label>
        </div>
        
        <div class="topics-sidebar__option-row">
            <span class="topics-sidebar__option-label">Number of Columns</span>
            <select class="form-select" data-property="columns" style="min-width: 80px; padding: 4px 8px; border: 1px solid #e2e8f0; border-radius: 4px;">
                <option value="1">1 Column</option>
                <option value="2" selected>2 Columns</option>
                <option value="3">3 Columns</option>
            </select>
        </div>
    </div>
    
    <!-- ADD NEW TOPIC SECTION -->
    <div class="topics-sidebar__add-section">
        <button class="topics-sidebar__add-btn" id="add-topic-btn" data-action="add-topic">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add New Topic
        </button>
        <p class="topics-sidebar__add-help">Add up to 5 speaking topics to showcase your expertise</p>
        <div class="topics-sidebar__add-hint">
            <span class="topics-sidebar__kbd">Enter</span>
            <span>to add new topic</span>
        </div>
    </div>
    
    <!-- ACTION BUTTONS -->
    <div class="topics-sidebar__bottom-actions">
        <button class="topics-sidebar__save-btn" data-action="save-topics">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17,21 17,13 7,13 7,21"></polyline>
                <polyline points="7,3 7,8 15,8"></polyline>
            </svg>
            Save Changes
        </button>
        <button class="topics-sidebar__reset-btn" data-action="reset-topics">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="1 4 1 10 7 10"></polyline>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
            </svg>
            Reset
        </button>
    </div>
</div>

<?php 
// Debug info removed for production
// To enable debug info, uncomment the block below and set WP_DEBUG to true
/*
if (defined('WP_DEBUG') && WP_DEBUG): ?>
<div class="topics-sidebar__debug-info" style="margin-top: 20px; padding: 12px; background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 6px; font-size: 12px;">
    <strong>🔧 DEBUG INFO:</strong><br>
    Post ID: <?php echo esc_html($current_post_id); ?><br>
    Topics Found: <?php echo count($topicsList); ?><br>
    Message: <?php echo esc_html($sidebar_message); ?><br>
    BEM Compliant UI: ✅ Active
</div>
<?php endif; 
*/
?>
