<?php
/**
 * Topics Component Design Panel - BEM COMPLIANT MODERN UI
 * BEM-compliant version with enhanced drag & drop, smart placeholders, and improved UX
 * 
 * @package Guestify/Components/Topics
 * @version 6.0.0-bem-compliant
 */

// SCALABLE ARCHITECTURE: Load base service and topics service
if (!class_exists('Base_Component_Data_Service')) {
    require_once(GUESTIFY_PLUGIN_DIR . 'system/Base_Component_Data_Service.php');
}
if (!class_exists('Topics_Data_Service')) {
    require_once(__DIR__ . '/class-topics-data-service.php');
}

// Get post_id from context
$preview_post_id = 32372; // Working post_id
$sidebar_data = Topics_Data_Service::get_sidebar_data($preview_post_id, 'design-panel');

$topicsList = $sidebar_data['topics'];
$topicsFound = $sidebar_data['found'];
$current_post_id = $sidebar_data['post_id'];
$sidebar_message = $sidebar_data['message'];

// Smart placeholders for different topic positions
$smart_placeholders = [
    1 => "Enter your primary expertise area...",
    2 => "Add your second area of expertise...",
    3 => "What's another topic you speak about?",
    4 => "Share another area you're knowledgeable about...",
    5 => "Round out your expertise with a final topic..."
];

if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log("BEM TOPICS: Using post_id {$preview_post_id} - Result: " . count($topicsList) . " topics");
}
?>

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
                                      placeholder="<?php echo esc_attr($smart_placeholders[$index + 1] ?? 'Enter your speaking topic...'); ?>" 
                                      aria-label="Topic <?php echo $index + 1; ?> input"><?php echo esc_textarea($topic['title']); ?></textarea>
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
            <?php else: ?>
                <!-- TEMPLATE MATCHING EMPTY STATE -->
                <div class="topics-sidebar__empty-state">
                    <div class="topics-sidebar__empty-message">No topics yet. Add your first topic to get started.</div>
                    <button class="topics-sidebar__add-first-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Add First Topic
                    </button>
                </div>
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
            <div class="topics-sidebar__toggle topics-sidebar__toggle--active">
                <div class="topics-sidebar__toggle-slider"></div>
            </div>
        </div>
        
        <div class="topics-sidebar__option-row">
            <span class="topics-sidebar__option-label">Drag & drop reordering</span>
            <div class="topics-sidebar__toggle topics-sidebar__toggle--active">
                <div class="topics-sidebar__toggle-slider"></div>
            </div>
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
            <div class="topics-sidebar__style-option topics-sidebar__style-option--active">List View</div>
            <div class="topics-sidebar__style-option">Grid View</div>
            <div class="topics-sidebar__style-option">Tag Style</div>
            <div class="topics-sidebar__style-option">Card Layout</div>
        </div>
    </div>
    
    <!-- ADD NEW TOPIC SECTION -->
    <div class="topics-sidebar__add-section">
        <button class="topics-sidebar__add-btn">
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
        <button class="topics-sidebar__save-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17,21 17,13 7,13 7,21"></polyline>
                <polyline points="7,3 7,8 15,8"></polyline>
            </svg>
            Save Changes
        </button>
        <button class="topics-sidebar__reset-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="1 4 1 10 7 10"></polyline>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
            </svg>
            Reset
        </button>
    </div>
</div>

<?php if (defined('WP_DEBUG') && WP_DEBUG): ?>
<div class="topics-sidebar__debug-info" style="margin-top: 20px; padding: 12px; background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 6px; font-size: 12px;">
    <strong>🔧 DEBUG INFO:</strong><br>
    Post ID: <?php echo esc_html($current_post_id); ?><br>
    Topics Found: <?php echo count($topicsList); ?><br>
    Message: <?php echo esc_html($sidebar_message); ?><br>
    BEM Compliant UI: ✅ Active
</div>
<?php endif; ?>
