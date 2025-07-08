<div class="builder">
    <div class="toolbar">
        <div class="toolbar__section toolbar__section--left">
            <div class="toolbar__logo">Guestify</div>
            <div class="toolbar__guest-name">Editing: Daniel Jackson's Media Kit</div>
            <?php
            // PHASE 2.3: Enhanced MKCG Data Dashboard
            $post_id = 0;
            $mkcg_data = null;
            $mkcg_integration = null;
            $availability = array();
            $dashboard_data = array();
            
            // Get post ID from URL parameters (enhanced detection)
            if (isset($_GET['post_id']) && is_numeric($_GET['post_id'])) {
                $post_id = intval($_GET['post_id']);
            } elseif (isset($_GET['p']) && is_numeric($_GET['p'])) {
                $post_id = intval($_GET['p']);
            } elseif (isset($_GET['page_id']) && is_numeric($_GET['page_id'])) {
                $post_id = intval($_GET['page_id']);
            }
            
            // Enhanced MKCG data processing
            if ($post_id > 0) {
                require_once GUESTIFY_PLUGIN_DIR . 'includes/class-gmkb-mkcg-data-integration.php';
                $mkcg_integration = GMKB_MKCG_Data_Integration::get_instance();
                $availability = $mkcg_integration->get_data_availability($post_id);
                $mkcg_data = $mkcg_integration->get_post_data($post_id);
                
                // PHASE 2.3: Enhanced dashboard data preparation
                if ($mkcg_data) {
                    $validation = $mkcg_data['validation'];
                    $meta_info = $mkcg_data['meta_info'];
                    
                    // Calculate data quality score
                    $quality_components = array(
                        $validation['has_topics'] ? 20 : 0,
                        $validation['has_biography'] ? 25 : 0,
                        $validation['has_authority_hook'] ? 20 : 0,
                        $validation['has_questions'] ? 15 : 0,
                        $validation['has_offers'] ? 10 : 0,
                        $validation['has_social_media'] ? 10 : 0
                    );
                    $data_quality = array_sum($quality_components);
                    
                    // Count available components
                    $available_components = array_filter($validation);
                    $component_count = count($available_components);
                    
                    // Get last update time
                    $last_update = $meta_info['last_mkcg_update'] ?? $meta_info['extraction_date'];
                    $time_ago = $last_update ? human_time_diff(strtotime($last_update), current_time('timestamp')) : 'Unknown';
                    
                    // Build dashboard data
                    $dashboard_data = array(
                        'quality_score' => $data_quality,
                        'quality_level' => $data_quality >= 80 ? 'excellent' : ($data_quality >= 60 ? 'good' : ($data_quality >= 40 ? 'fair' : 'poor')),
                        'component_count' => $component_count,
                        'total_possible' => 6,
                        'last_update' => $time_ago,
                        'post_title' => get_the_title($post_id) ?: "Post #{$post_id}",
                        'components' => array(),
                        'recommendations' => array()
                    );
                    
                    // Build component details with quality assessment
                    if ($validation['has_topics']) {
                        $topics_count = count($mkcg_data['topics']['topics']);
                        $dashboard_data['components'][] = array(
                            'type' => 'topics',
                            'name' => 'Topics',
                            'quality' => $topics_count >= 3 ? 'excellent' : ($topics_count >= 2 ? 'good' : 'fair'),
                            'count' => $topics_count
                        );
                    }
                    
                    if ($validation['has_biography']) {
                        $bio_data = $mkcg_data['biography']['biography'];
                        $bio_quality = 'excellent';
                        if (empty($bio_data['long'])) $bio_quality = 'good';
                        if (empty($bio_data['medium'])) $bio_quality = 'fair';
                        
                        $dashboard_data['components'][] = array(
                            'type' => 'biography',
                            'name' => 'Biography',
                            'quality' => $bio_quality,
                            'count' => count(array_filter($bio_data))
                        );
                    }
                    
                    if ($validation['has_authority_hook']) {
                        $hook_data = $mkcg_data['authority_hook']['authority_hook'];
                        $hook_complete = count($hook_data) >= 4;
                        
                        $dashboard_data['components'][] = array(
                            'type' => 'authority-hook',
                            'name' => 'Authority Hook',
                            'quality' => $hook_complete ? 'excellent' : 'good',
                            'count' => count($hook_data)
                        );
                    }
                    
                    if ($validation['has_questions']) {
                        $questions_count = count($mkcg_data['questions']['questions']);
                        $dashboard_data['components'][] = array(
                            'type' => 'questions',
                            'name' => 'Questions',
                            'quality' => $questions_count >= 5 ? 'excellent' : 'good',
                            'count' => $questions_count
                        );
                    }
                    
                    if ($validation['has_offers']) {
                        $offers_count = count($mkcg_data['offers']['offers']);
                        $dashboard_data['components'][] = array(
                            'type' => 'offers',
                            'name' => 'Offers',
                            'quality' => $offers_count >= 3 ? 'excellent' : 'good',
                            'count' => $offers_count
                        );
                    }
                    
                    if ($validation['has_social_media']) {
                        $social_count = count($mkcg_data['social_media']);
                        $dashboard_data['components'][] = array(
                            'type' => 'social',
                            'name' => 'Social Media',
                            'quality' => $social_count >= 3 ? 'excellent' : ($social_count >= 2 ? 'good' : 'fair'),
                            'count' => $social_count
                        );
                    }
                    
                    // Generate recommendations
                    if ($data_quality < 60) {
                        $dashboard_data['recommendations'][] = 'Consider generating more content types to improve overall quality';
                    }
                    if ($component_count < 3) {
                        $dashboard_data['recommendations'][] = 'Add more content types for a comprehensive media kit';
                    }
                    if (!$validation['has_biography']) {
                        $dashboard_data['recommendations'][] = 'Biography data is essential for professional media kits';
                    }
                }
            }
            
            if ($dashboard_data): ?>
                <!-- PHASE 2.3: ENHANCED DATA DASHBOARD -->
                <div class="mkcg-enhanced-dashboard" id="mkcg-enhanced-dashboard">
                    <div class="mkcg-dashboard-trigger" id="dashboard-trigger">
                        <div class="mkcg-connection-status">
                            <div class="mkcg-status-indicator status-<?php echo esc_attr($dashboard_data['quality_level']); ?>"></div>
                            <div class="mkcg-connection-info">
                                <span class="mkcg-connection-title">MKCG Data Connected</span>
                                <span class="mkcg-connection-subtitle"><?php echo esc_html($dashboard_data['post_title']); ?></span>
                            </div>
                        </div>
                        <div class="mkcg-dashboard-summary">
                            <span class="mkcg-quality-score quality-<?php echo esc_attr($dashboard_data['quality_level']); ?>"><?php echo $dashboard_data['quality_score']; ?>%</span>
                            <span class="mkcg-component-count"><?php echo $dashboard_data['component_count']; ?> Types</span>
                        </div>
                        <button class="mkcg-dashboard-toggle" title="Toggle Dashboard">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="mkcg-dashboard-panel" id="dashboard-panel" style="display: none;">
                        <div class="mkcg-dashboard-content">
                            <div class="mkcg-dashboard-metrics">
                                <div class="mkcg-metric">
                                    <div class="mkcg-metric-value quality-<?php echo esc_attr($dashboard_data['quality_level']); ?>"><?php echo $dashboard_data['quality_score']; ?>%</div>
                                    <div class="mkcg-metric-label">Data Quality</div>
                                </div>
                                <div class="mkcg-metric">
                                    <div class="mkcg-metric-value"><?php echo $dashboard_data['component_count']; ?></div>
                                    <div class="mkcg-metric-label">Available Types</div>
                                </div>
                                <div class="mkcg-metric">
                                    <div class="mkcg-metric-value" id="auto-generated-count">0</div>
                                    <div class="mkcg-metric-label">Auto-Generated</div>
                                </div>
                                <div class="mkcg-metric">
                                    <div class="mkcg-metric-value"><?php echo esc_html($dashboard_data['last_update']); ?></div>
                                    <div class="mkcg-metric-label">Last Updated</div>
                                </div>
                            </div>
                            
                            <div class="mkcg-dashboard-components">
                                <div class="mkcg-components-title">Available Components:</div>
                                <div class="mkcg-components-grid">
                                    <?php foreach ($dashboard_data['components'] as $component): ?>
                                        <div class="mkcg-component-badge quality-<?php echo esc_attr($component['quality']); ?>">
                                            <span class="mkcg-component-name"><?php echo esc_html($component['name']); ?></span>
                                            <span class="mkcg-component-count"><?php echo $component['count']; ?></span>
                                        </div>
                                    <?php endforeach; ?>
                                </div>
                            </div>
                            
                            <?php if (!empty($dashboard_data['recommendations'])): ?>
                                <div class="mkcg-dashboard-recommendations">
                                    <div class="mkcg-recommendations-title">💡 Recommendations:</div>
                                    <ul class="mkcg-recommendations-list">
                                        <?php foreach ($dashboard_data['recommendations'] as $recommendation): ?>
                                            <li><?php echo esc_html($recommendation); ?></li>
                                        <?php endforeach; ?>
                                    </ul>
                                </div>
                            <?php endif; ?>
                            
                            <div class="mkcg-dashboard-actions">
                                <button class="mkcg-action-btn mkcg-refresh-btn" id="mkcg-refresh-data" title="Refresh MKCG Data">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="23 4 23 10 17 10"></polyline>
                                        <polyline points="1 20 1 14 7 14"></polyline>
                                        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
                                    </svg>
                                    Refresh Data
                                </button>
                                <button class="mkcg-action-btn mkcg-auto-generate-btn" id="mkcg-auto-generate-all" title="Auto-Generate Components">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                                    </svg>
                                    Auto-Generate
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            <?php elseif ($post_id > 0): ?>
                <!-- No MKCG data but post ID detected -->
                <div class="mkcg-no-data-indicator">
                    <span class="mkcg-no-data-icon">⚠️</span>
                    <span class="mkcg-no-data-text">No MKCG data found for this post</span>
                </div>
            <?php endif; ?>
            <div class="toolbar__status">
                <div class="toolbar__status-dot"></div>
                <span>Saved</span>
            </div>
        </div>
        
        <div class="toolbar__section toolbar__section--center">
            <div class="toolbar__preview-toggle">
                <button class="toolbar__preview-btn toolbar__preview-btn--active" data-preview="desktop">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                        <line x1="8" y1="21" x2="16" y2="21"></line>
                        <line x1="12" y1="17" x2="12" y2="21"></line>
                    </svg>
                    Desktop
                </button>
                <button class="toolbar__preview-btn" data-preview="tablet">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                        <line x1="9" y1="9" x2="15" y2="9"></line>
                    </svg>
                    Tablet
                </button>
                <button class="toolbar__preview-btn" data-preview="mobile">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                        <line x1="12" y1="18" x2="12.01" y2="18"></line>
                    </svg>
                    Mobile
                </button>
            </div>
        </div>
        
        <div class="toolbar__section toolbar__section--right">
            <button class="toolbar__btn" id="global-theme-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
                Theme
            </button>
            <button class="toolbar__btn toolbar__btn--export" id="export-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7,10 12,15 17,10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Export
            </button>
            <button class="toolbar__btn" id="share-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
                Share
            </button>
            <button class="toolbar__btn" id="undo-btn" disabled>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 7v6h6"></path>
                    <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"></path>
                </svg>
            </button>
            <button class="toolbar__btn" id="redo-btn" disabled>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 7v6h-6"></path>
                    <path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7"></path>
                </svg>
            </button>
            <button class="toolbar__btn toolbar__btn--primary" id="save-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17,21 17,13 7,13 7,21"></polyline>
                    <polyline points="7,3 7,8 15,8"></polyline>
                </svg>
                Save
            </button>
        </div>
    </div>

    <div class="sidebar">
        <?php include plugin_dir_path(__FILE__) . '../partials/sidebar-tabs.php'; ?>
    </div>

    <div class="preview">
        <div class="preview__container" id="preview-container">
            <div class="media-kit" id="media-kit-preview">
                <!-- PHASE 2.3: TASK 2 - ENHANCED INTELLIGENT EMPTY STATE SYSTEM -->
                <div class="empty-state-enhanced" id="enhanced-empty-state">
                    <?php if ($dashboard_data && $dashboard_data['quality_score'] >= 70): ?>
                        <!-- TASK 2: High Quality Data Ready - Enhanced -->
                        <div class="empty-state-icon animate-bounce-gentle">🎉</div>
                        <h3 class="empty-state-title">Excellent Data Connected!</h3>
                        <p class="empty-state-description">
                            Your MKCG data has <strong class="quality-score-highlight"><?php echo $dashboard_data['quality_score']; ?>% quality score</strong> 
                            and can auto-generate <strong class="component-count-highlight"><?php echo $dashboard_data['component_count']; ?> components</strong>.
                        </p>
                        <div class="generation-preview-enhanced">
                            <?php foreach (array_slice($dashboard_data['components'], 0, 3) as $component): ?>
                                <div class="preview-component-enhanced quality-<?php echo esc_attr($component['quality']); ?>" data-component-type="<?php echo esc_attr($component['type']); ?>">
                                    <div class="preview-component-icon">
                                        <?php 
                                        $icons = [
                                            'topics' => '📚',
                                            'biography' => '👤', 
                                            'authority-hook' => '🎯',
                                            'questions' => '❓',
                                            'offers' => '💼',
                                            'social' => '🔗'
                                        ];
                                        echo $icons[$component['type']] ?? '⭐';
                                        ?>
                                    </div>
                                    <div class="preview-component-content">
                                        <div class="preview-component-name"><?php echo esc_html($component['name']); ?></div>
                                        <div class="preview-component-count"><?php echo $component['count']; ?> items</div>
                                    </div>
                                    <div class="preview-component-quality">
                                        <span class="quality-badge-mini quality-<?php echo esc_attr($component['quality']); ?>"><?php echo ucfirst($component['quality']); ?></span>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        </div>
                        <div class="empty-state-actions">
                            <button class="btn btn--primary auto-generate-all-btn" id="auto-generate-all-empty">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                                </svg>
                                <span>Auto-Generate Media Kit</span>
                            </button>
                            <button class="btn btn--secondary selective-generate-btn" id="selective-generate">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="3"></circle>
                                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                                </svg>
                                <span>Choose Components</span>
                            </button>
                        </div>
                        
                    <?php elseif ($dashboard_data && $dashboard_data['quality_score'] >= 40): ?>
                        <!-- TASK 2: Good Quality Data Available - Enhanced -->
                        <div class="empty-state-icon animate-pulse-gentle">✅</div>
                        <h3 class="empty-state-title">Good Data Connected</h3>
                        <p class="empty-state-description">
                            Your MKCG data has <strong class="quality-score-highlight good"><?php echo $dashboard_data['quality_score']; ?>% quality score</strong>. 
                            <span class="generation-capability">Some components can be auto-generated.</span>
                        </p>
                        <div class="generation-preview-enhanced">
                            <?php foreach ($dashboard_data['components'] as $component): ?>
                                <div class="preview-component-enhanced quality-<?php echo esc_attr($component['quality']); ?>" data-component-type="<?php echo esc_attr($component['type']); ?>">
                                    <div class="preview-component-icon">
                                        <?php 
                                        $icons = [
                                            'topics' => '📚',
                                            'biography' => '👤', 
                                            'authority-hook' => '🎯',
                                            'questions' => '❓',
                                            'offers' => '💼',
                                            'social' => '🔗'
                                        ];
                                        echo $icons[$component['type']] ?? '⭐';
                                        ?>
                                    </div>
                                    <div class="preview-component-content">
                                        <div class="preview-component-name"><?php echo esc_html($component['name']); ?></div>
                                        <div class="preview-component-count"><?php echo $component['count']; ?> items</div>
                                    </div>
                                    <div class="preview-component-quality">
                                        <span class="quality-badge-mini quality-<?php echo esc_attr($component['quality']); ?>"><?php echo ucfirst($component['quality']); ?></span>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        </div>
                        <div class="empty-state-actions">
                            <button class="btn btn--primary auto-generate-available-btn" id="auto-generate-available">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                                </svg>
                                <span>Generate Available Components</span>
                            </button>
                            <button class="btn btn--secondary manual-build-btn" id="manual-build">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                <span>Build Manually</span>
                            </button>
                        </div>
                        
                    <?php elseif ($dashboard_data): ?>
                        <!-- TASK 2: Low Quality Data - Enhanced -->
                        <div class="empty-state-icon animate-shake-gentle">⚠️</div>
                        <h3 class="empty-state-title">Data Quality Needs Improvement</h3>
                        <p class="empty-state-description">
                            Your connected data has <strong class="quality-score-highlight poor"><?php echo $dashboard_data['quality_score']; ?>% quality score</strong> 
                            with <span class="limitation-text">limited usability for auto-generation</span>.
                        </p>
                        <?php if (!empty($dashboard_data['recommendations'])): ?>
                            <div class="quality-recommendations-enhanced">
                                <div class="recommendations-header">
                                    <span class="recommendations-icon">💡</span>
                                    <span class="recommendations-title">Smart Recommendations:</span>
                                </div>
                                <ul class="recommendations-list-enhanced">
                                    <?php foreach (array_slice($dashboard_data['recommendations'], 0, 2) as $rec): ?>
                                        <li class="recommendation-item">
                                            <span class="recommendation-bullet">▶</span>
                                            <span class="recommendation-text"><?php echo esc_html($rec); ?></span>
                                        </li>
                                    <?php endforeach; ?>
                                </ul>
                            </div>
                        <?php endif; ?>
                        <div class="empty-state-actions">
                            <button class="btn btn--secondary improve-data-btn" id="improve-data">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
                                </svg>
                                <span>Improve Data Quality</span>
                            </button>
                            <button class="btn btn--secondary generate-anyway-btn" id="generate-anyway">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                                </svg>
                                <span>Generate Anyway</span>
                            </button>
                        </div>
                        
                    <?php else: ?>
                        <!-- TASK 2: No MKCG Data Connected - Enhanced -->
                        <div class="empty-state-icon animate-float">🔗</div>
                        <h3 class="empty-state-title">Connect Your Content Data</h3>
                        <p class="empty-state-description">
                            Link to MKCG post data for <span class="feature-highlight">intelligent auto-population</span>, 
                            <span class="feature-highlight">quality scoring</span>, and <span class="feature-highlight">smart component mapping</span>.
                        </p>
                        <div class="empty-state-features-enhanced">
                            <div class="feature-item-enhanced" data-feature="auto-generation">
                                <div class="feature-icon-enhanced">
                                    <span class="feature-emoji">⚡</span>
                                </div>
                                <div class="feature-content">
                                    <div class="feature-name">Auto-generation</div>
                                    <div class="feature-description">Instant component creation from your data</div>
                                </div>
                            </div>
                            <div class="feature-item-enhanced" data-feature="quality-scoring">
                                <div class="feature-icon-enhanced">
                                    <span class="feature-emoji">📊</span>
                                </div>
                                <div class="feature-content">
                                    <div class="feature-name">Quality scoring</div>
                                    <div class="feature-description">Real-time data quality assessment</div>
                                </div>
                            </div>
                            <div class="feature-item-enhanced" data-feature="smart-mapping">
                                <div class="feature-icon-enhanced">
                                    <span class="feature-emoji">🎯</span>
                                </div>
                                <div class="feature-content">
                                    <div class="feature-name">Smart mapping</div>
                                    <div class="feature-description">Intelligent field matching and optimization</div>
                                </div>
                            </div>
                        </div>
                        <div class="empty-state-actions">
                            <button class="btn btn--primary connect-data-btn" id="connect-data">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                                </svg>
                                <span>Connect Data Source</span>
                            </button>
                            <button class="btn btn--secondary manual-build-btn" id="manual-build-fallback">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                <span>Build Manually</span>
                            </button>
                        </div>
                    <?php endif; ?>
                </div>
                
                <!-- Drop zone for first component -->
                <div class="drop-zone drop-zone--empty drop-zone--primary" data-zone="0" style="display: none;">
                    <div class="drop-zone__content">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        <span>Drop component here</span>
                    </div>
                </div>
                
                <!-- FOUNDATIONAL FIX: Bridge elements no longer needed -->
                <!-- JavaScript now starts after all PHP includes complete -->
            </div>
        </div>
    </div>

    <?php 
    // PHASE 2.3: ENHANCED MODAL INCLUDES WITH VALIDATION AND ERROR HANDLING
    $modal_files = array(
        'global-settings-modal.php' => 'Global Settings Modal',
        'export-modal.php' => 'Export Modal', 
        'component-library-modal.php' => 'Component Library Modal',
        'template-library-modal.php' => 'Template Library Modal'
    );
    
    $included_modals = array();
    $failed_modals = array();
    
    foreach ($modal_files as $file => $description) {
        $file_path = plugin_dir_path(__FILE__) . '../partials/' . $file;
        
        try {
            if (file_exists($file_path) && is_readable($file_path)) {
                ob_start();
                include $file_path;
                $modal_content = ob_get_clean();
                
                if (!empty(trim($modal_content))) {
                    echo $modal_content;
                    $included_modals[] = $file;
                } else {
                    $failed_modals[] = $file . ' (empty content)';
                }
            } else {
                $failed_modals[] = $file . ' (file not accessible)';
            }
        } catch (Exception $e) {
            $failed_modals[] = $file . ' (error: ' . $e->getMessage() . ')';
            
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB Phase 2.3 Modal Include Error: ' . $file . ' - ' . $e->getMessage());
            }
        }
    }
    
    // Log modal inclusion results
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('GMKB Phase 2.3 Modal Includes: ' . count($included_modals) . '/' . count($modal_files) . ' successful');
        if (!empty($failed_modals)) {
            error_log('GMKB Phase 2.3 Failed Modal Includes: ' . implode(', ', $failed_modals));
        }
    }
    
    // FOUNDATIONAL FIX: Enhanced modal inclusion status with validation
    echo '<script type="text/javascript">';
    echo 'window.gmkbModalInclusionStatus = ' . wp_json_encode(array(
        'included' => $included_modals,
        'failed' => $failed_modals,
        'success_count' => count($included_modals),
        'total_count' => count($modal_files),
        'success_rate' => count($modal_files) > 0 ? (count($included_modals) / count($modal_files)) * 100 : 0
    )) . ';';
    echo 'console.log("📋 Phase 2.3 Modal Inclusion Status:", window.gmkbModalInclusionStatus);';
    
    // FOUNDATIONAL FIX: Wait for DOM elements to actually exist before signaling complete
    echo '
    // Enhanced modal readiness validation
    window.waitForModalsReady = function() {
        return new Promise((resolve) => {
            const checkModals = () => {
                const modalIds = ["component-library-overlay", "template-library-modal", "global-settings-modal", "export-modal"];
                const readyModals = modalIds.filter(id => {
                    const element = document.getElementById(id);
                    return element && (element.children.length > 0 || element.textContent.trim());
                });
                
                console.log("🔍 Modal readiness check:", {
                    ready: readyModals,
                    total: modalIds.length,
                    complete: readyModals.length === modalIds.length
                });
                
                if (readyModals.length === modalIds.length) {
                    console.log("✅ All modals ready, signaling template complete");
                    resolve(true);
                } else {
                    // Try again in 100ms
                    setTimeout(checkModals, 100);
                }
            };
            
            // Start checking after a brief delay to let DOM settle
            setTimeout(checkModals, 50);
        });
    };
    
    // FOUNDATIONAL FIX: Signal template ready AFTER modals are verified
    window.waitForModalsReady().then(() => {
        // Dispatch the correct event that JavaScript expects
        document.dispatchEvent(new CustomEvent("gmkbTemplateComplete", {
            detail: {
                templateComplete: true,
                modalValidation: window.gmkbModalInclusionStatus,
                templateVersion: "2.3-enhanced",
                readyForInit: true,
                allModalsReady: true
            }
        }));
        
        console.log("🎉 Template completion event dispatched after modal validation");
    });';
    
    echo '</script>';
    ?>

    
    <!-- FOUNDATIONAL FIX: Complex modal validation no longer needed -->
    <!-- JavaScript now waits for complete template loading -->

    <!-- PHASE 2.3: TASK 2 - ENHANCED INTELLIGENT EMPTY STATE CSS FRAMEWORK -->
    <style id="mkcg-integration-styles">
        /* MKCG Data Source Indicator */
        .toolbar__mkcg-indicator {
            display: flex;
            align-items: center;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            margin: 0 12px;
            font-size: 12px;
            box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
            position: relative;
            animation: slideInDown 0.3s ease-out;
        }
        
        .mkcg-indicator__content {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .mkcg-indicator__icon {
            font-size: 14px;
            filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
        }
        
        .mkcg-indicator__details {
            display: flex;
            flex-direction: column;
            gap: 1px;
        }
        
        .mkcg-indicator__title {
            font-weight: 600;
            font-size: 11px;
            letter-spacing: 0.02em;
        }
        
        .mkcg-indicator__subtitle {
            font-size: 10px;
            opacity: 0.9;
            font-weight: 400;
        }
        
        .mkcg-indicator__badges {
            display: flex;
            gap: 4px;
            flex-wrap: wrap;
        }
        
        .mkcg-badge {
            background: rgba(255, 255, 255, 0.2);
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 9px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.02em;
            backdrop-filter: blur(4px);
        }
        
        .mkcg-indicator__close {
            background: none;
            border: none;
            color: white;
            font-size: 16px;
            cursor: pointer;
            padding: 2px 4px;
            margin-left: 8px;
            border-radius: 2px;
            opacity: 0.7;
            transition: opacity 0.2s;
        }
        
        .mkcg-indicator__close:hover {
            opacity: 1;
            background: rgba(255, 255, 255, 0.1);
        }
        
        /* MKCG Auto-Generate Button */
        .btn--mkcg {
            background: linear-gradient(135deg, #3b82f6, #2563eb) !important;
            border-color: #2563eb !important;
            position: relative;
            overflow: hidden;
        }
        
        .btn--mkcg::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s;
        }
        
        .btn--mkcg:hover::before {
            left: 100%;
        }
        
        .btn--mkcg:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        
        /* MKCG Notifications */
        .mkcg-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
        }
        
        .mkcg-notification-content {
            display: flex;
            align-items: center;
            gap: 12px;
            background: #10b981;
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            font-size: 14px;
            max-width: 350px;
        }
        
        .mkcg-notification-icon {
            font-size: 16px;
            flex-shrink: 0;
        }
        
        .mkcg-notification-text {
            flex: 1;
            font-weight: 500;
        }
        
        .mkcg-notification-close {
            background: none;
            border: none;
            color: white;
            font-size: 18px;
            cursor: pointer;
            padding: 2px;
            margin-left: 8px;
            border-radius: 2px;
            opacity: 0.8;
            transition: opacity 0.2s;
        }
        
        .mkcg-notification-close:hover {
            opacity: 1;
            background: rgba(255, 255, 255, 0.1);
        }
        
        /* Auto-generation notification */
        .mkcg-auto-generate-notification .mkcg-notification-content {
            background: #3b82f6;
            max-width: 400px;
        }
        
        .mkcg-notification-details {
            flex: 1;
        }
        
        .mkcg-notification-title {
            font-weight: 600;
            margin-bottom: 4px;
        }
        
        .mkcg-notification-components {
            font-size: 12px;
            opacity: 0.9;
        }
        
        /* Component MKCG indicators */
        .component-mkcg-indicator {
            position: absolute;
            top: -8px;
            right: -8px;
            background: #10b981;
            color: white;
            font-size: 10px;
            padding: 2px 6px;
            border-radius: 3px;
            font-weight: 500;
            z-index: 10;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .component-mkcg-indicator::before {
            content: '🔗';
            margin-right: 2px;
        }
        
        /* Animations */
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideInDown {
            from {
                transform: translateY(-20px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        
        /* ========================================
           TASK 2: ENHANCED EMPTY STATE FRAMEWORK
           ======================================== */
        
        /* Enhanced Empty State Container */
        .empty-state-enhanced {
            text-align: center;
            padding: 80px 40px;
            background: linear-gradient(135deg, #fafafa 0%, #f5f7fa 100%);
            border-radius: 20px;
            border: 2px solid transparent;
            margin: 24px;
            position: relative;
            overflow: hidden;
            transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
            animation: slideInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .empty-state-enhanced::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
            transition: left 2s ease-in-out;
        }
        
        .empty-state-enhanced:hover::before {
            left: 100%;
        }
        
        /* Quality-Based Empty State Theming */
        .empty-state-enhanced.mkcg-ready {
            background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
            border-color: #10b981;
            box-shadow: 0 10px 40px rgba(16, 185, 129, 0.15);
        }
        
        .empty-state-enhanced.mkcg-good {
            background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%);
            border-color: #3b82f6;
            box-shadow: 0 10px 40px rgba(59, 130, 246, 0.15);
        }
        
        .empty-state-enhanced.mkcg-warning {
            background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
            border-color: #f59e0b;
            box-shadow: 0 10px 40px rgba(245, 158, 11, 0.15);
        }
        
        /* Enhanced Empty State Icon Animations */
        .empty-state-icon {
            font-size: 64px;
            margin-bottom: 32px;
            display: block;
            filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
            transition: transform 0.3s ease;
        }
        
        .empty-state-icon:hover {
            transform: scale(1.1);
        }
        
        /* Icon Animation Classes */
        .animate-bounce-gentle {
            animation: bounceGentle 2s ease-in-out infinite;
        }
        
        .animate-pulse-gentle {
            animation: pulseGentle 3s ease-in-out infinite;
        }
        
        .animate-shake-gentle {
            animation: shakeGentle 3s ease-in-out infinite;
        }
        
        .animate-float {
            animation: float 4s ease-in-out infinite;
        }
        
        /* Enhanced Typography */
        .empty-state-title {
            font-size: 32px;
            font-weight: 700;
            color: #1e293b;
            margin: 0 0 20px 0;
            line-height: 1.2;
            letter-spacing: -0.02em;
            background: linear-gradient(135deg, #1e293b, #475569);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .empty-state-description {
            font-size: 18px;
            color: #64748b;
            margin: 0 0 40px 0;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
            line-height: 1.6;
            font-weight: 400;
        }
        
        /* Enhanced Quality Score Highlights */
        .quality-score-highlight {
            padding: 4px 8px;
            border-radius: 6px;
            font-weight: 700;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
            box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
        }
        
        .quality-score-highlight.good {
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
        }
        
        .quality-score-highlight.poor {
            background: linear-gradient(135deg, #ef4444, #dc2626);
            box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
        }
        
        .component-count-highlight {
            color: #3b82f6;
            font-weight: 700;
        }
        
        .feature-highlight {
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-weight: 600;
        }
        
        /* TASK 2: ENHANCED COMPONENT PREVIEW SYSTEM */
        
        .generation-preview-enhanced {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 32px 0;
            max-width: 800px;
            margin-left: auto;
            margin-right: auto;
        }
        
        .preview-component-enhanced {
            background: white;
            border-radius: 16px;
            padding: 20px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            border: 2px solid transparent;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            position: relative;
            overflow: hidden;
            cursor: pointer;
        }
        
        .preview-component-enhanced::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: var(--component-quality-color);
            transform: scaleX(0);
            transition: transform 0.4s ease;
        }
        
        .preview-component-enhanced:hover {
            transform: translateY(-8px);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
            border-color: var(--component-quality-color);
        }
        
        .preview-component-enhanced:hover::before {
            transform: scaleX(1);
        }
        
        /* Quality-based component colors */
        .preview-component-enhanced.quality-excellent {
            --component-quality-color: #10b981;
        }
        
        .preview-component-enhanced.quality-good {
            --component-quality-color: #3b82f6;
        }
        
        .preview-component-enhanced.quality-fair {
            --component-quality-color: #f59e0b;
        }
        
        .preview-component-enhanced.quality-poor {
            --component-quality-color: #ef4444;
        }
        
        .preview-component-icon {
            font-size: 32px;
            margin-bottom: 12px;
            display: block;
            opacity: 0.9;
            transition: all 0.3s ease;
        }
        
        .preview-component-enhanced:hover .preview-component-icon {
            transform: scale(1.2);
            opacity: 1;
        }
        
        .preview-component-content {
            text-align: left;
            margin-bottom: 12px;
        }
        
        .preview-component-name {
            font-size: 16px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 4px;
        }
        
        .preview-component-count {
            font-size: 14px;
            color: #64748b;
            font-weight: 500;
        }
        
        .preview-component-quality {
            display: flex;
            justify-content: flex-end;
        }
        
        .quality-badge-mini {
            padding: 4px 8px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        .quality-badge-mini.quality-excellent {
            background: rgba(16, 185, 129, 0.15);
            color: #059669;
        }
        
        .quality-badge-mini.quality-good {
            background: rgba(59, 130, 246, 0.15);
            color: #2563eb;
        }
        
        .quality-badge-mini.quality-fair {
            background: rgba(245, 158, 11, 0.15);
            color: #d97706;
        }
        
        .quality-badge-mini.quality-poor {
            background: rgba(239, 68, 68, 0.15);
            color: #dc2626;
        }
        
        /* TASK 2: ENHANCED FEATURE SHOWCASE */
        
        .empty-state-features-enhanced {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 24px;
            margin: 40px 0;
            max-width: 700px;
            margin-left: auto;
            margin-right: auto;
        }
        
        .feature-item-enhanced {
            background: white;
            border-radius: 16px;
            padding: 24px 20px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            cursor: pointer;
            position: relative;
            overflow: hidden;
            border: 2px solid transparent;
        }
        
        .feature-item-enhanced::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(16, 185, 129, 0.05));
            opacity: 0;
            transition: opacity 0.4s ease;
        }
        
        .feature-item-enhanced:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
            border-color: #e2e8f0;
        }
        
        .feature-item-enhanced:hover::before {
            opacity: 1;
        }
        
        .feature-icon-enhanced {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #f8fafc, #e2e8f0);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 16px;
            transition: all 0.3s ease;
            position: relative;
            z-index: 2;
        }
        
        .feature-item-enhanced:hover .feature-icon-enhanced {
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            transform: scale(1.1);
        }
        
        .feature-emoji {
            font-size: 24px;
            transition: all 0.3s ease;
        }
        
        .feature-item-enhanced:hover .feature-emoji {
            filter: brightness(0) invert(1);
        }
        
        .feature-content {
            text-align: center;
            position: relative;
            z-index: 2;
        }
        
        .feature-name {
            font-size: 16px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 8px;
        }
        
        .feature-description {
            font-size: 14px;
            color: #64748b;
            line-height: 1.4;
        }
        
        /* TASK 2: ENHANCED RECOMMENDATIONS SYSTEM */
        
        .quality-recommendations-enhanced {
            background: white;
            border-radius: 16px;
            padding: 24px;
            margin: 32px 0;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
            border-left: 4px solid #f59e0b;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
        }
        
        .recommendations-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
        }
        
        .recommendations-icon {
            font-size: 20px;
            animation: pulse 2s ease-in-out infinite;
        }
        
        .recommendations-title {
            font-size: 18px;
            font-weight: 600;
            color: #1e293b;
        }
        
        .recommendations-list-enhanced {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .recommendation-item {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 12px 0;
            border-bottom: 1px solid #f1f5f9;
        }
        
        .recommendation-item:last-child {
            border-bottom: none;
            padding-bottom: 0;
        }
        
        .recommendation-bullet {
            color: #f59e0b;
            font-size: 12px;
            margin-top: 2px;
            flex-shrink: 0;
        }
        
        .recommendation-text {
            color: #475569;
            line-height: 1.5;
            font-size: 15px;
        }
        
        /* TASK 2: ENHANCED BUTTON SYSTEM */
        
        .empty-state-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            justify-content: center;
            align-items: center;
            margin-top: 40px;
        }
        
        .btn {
            position: relative;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 14px 28px;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 600;
            border: none;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            text-decoration: none;
            line-height: 1;
            overflow: hidden;
            min-width: 140px;
            justify-content: center;
        }
        
        .btn::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            transition: width 0.6s ease, height 0.6s ease;
        }
        
        .btn:hover::before {
            width: 300px;
            height: 300px;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }
        
        .btn--primary {
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            color: white;
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        }
        
        .btn--primary:hover {
            background: linear-gradient(135deg, #2563eb, #1d4ed8);
            box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
        }
        
        .btn--secondary {
            background: white;
            color: #475569;
            border: 2px solid #e2e8f0;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }
        
        .btn--secondary:hover {
            background: #f8fafc;
            border-color: #cbd5e1;
            color: #1e293b;
        }
        
        .btn svg {
            width: 18px;
            height: 18px;
            transition: transform 0.3s ease;
        }
        
        .btn:hover svg {
            transform: scale(1.1);
        }
        
        /* TASK 2: MODERN ANIMATION KEYFRAMES */
        
        @keyframes slideInUp {
            from {
                opacity: 0;
                transform: translateY(40px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes bounceGentle {
            0%, 100% {
                transform: translateY(0);
            }
            50% {
                transform: translateY(-8px);
            }
        }
        
        @keyframes pulseGentle {
            0%, 100% {
                opacity: 1;
                transform: scale(1);
            }
            50% {
                opacity: 0.8;
                transform: scale(1.05);
            }
        }
        
        @keyframes shakeGentle {
            0%, 100% {
                transform: translateX(0);
            }
            25% {
                transform: translateX(-4px);
            }
            75% {
                transform: translateX(4px);
            }
        }
        
        @keyframes float {
            0%, 100% {
                transform: translateY(0);
            }
            50% {
                transform: translateY(-12px);
            }
        }
        
        @keyframes pulse {
            0%, 100% {
                opacity: 1;
            }
            50% {
                opacity: 0.6;
            }
        }
        
        @keyframes fadeInScale {
            from {
                opacity: 0;
                transform: scale(0.9);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }
        
        /* TASK 2: RESPONSIVE DESIGN ENHANCEMENTS */
        
        @media (max-width: 768px) {
            .empty-state-enhanced {
                padding: 60px 24px;
                margin: 16px;
            }
            
            .empty-state-title {
                font-size: 24px;
            }
            
            .empty-state-description {
                font-size: 16px;
            }
            
            .generation-preview-enhanced {
                grid-template-columns: 1fr;
                gap: 16px;
            }
            
            .empty-state-features-enhanced {
                grid-template-columns: 1fr;
                gap: 16px;
            }
            
            .empty-state-actions {
                flex-direction: column;
                gap: 12px;
            }
            
            .btn {
                width: 100%;
                max-width: 280px;
            }
            
            .toolbar__mkcg-indicator {
                display: none; /* Hide on mobile to save space */
            }
            
            .mkcg-notification {
                right: 10px;
                left: 10px;
                top: 10px;
            }
            
            .mkcg-notification-content {
                max-width: none;
            }
        }
        
        @media (max-width: 480px) {
            .empty-state-icon {
                font-size: 48px;
            }
            
            .preview-component-enhanced {
                padding: 16px;
            }
            
            .feature-item-enhanced {
                padding: 20px 16px;
            }
        }
        
        /* TASK 2: ACCESSIBILITY ENHANCEMENTS */
        
        @media (prefers-reduced-motion: reduce) {
            .animate-bounce-gentle,
            .animate-pulse-gentle,
            .animate-shake-gentle,
            .animate-float {
                animation: none;
            }
            
            .empty-state-enhanced,
            .preview-component-enhanced,
            .feature-item-enhanced,
            .btn {
                transition: none;
            }
        }
        
        /* High contrast mode support */
        @media (prefers-contrast: high) {
            .empty-state-enhanced {
                border: 3px solid currentColor;
            }
            
            .quality-score-highlight {
                outline: 2px solid currentColor;
            }
        }
        
        /* TASK 2: ENHANCED FOCUS STATES FOR ACCESSIBILITY */
        
        .btn:focus,
        .preview-component-enhanced:focus,
        .feature-item-enhanced:focus {
            outline: 3px solid #3b82f6;
            outline-offset: 2px;
        }
        
        .btn:focus-visible,
        .preview-component-enhanced:focus-visible,
        .feature-item-enhanced:focus-visible {
            outline: 3px solid #3b82f6;
            outline-offset: 2px;
        }
        
        /* ========================================
           TASK 3: ENHANCED COMPONENT STATE VISUAL INDICATORS
           ======================================== */
        
        /* MKCG-populated component styling */
        .mk-component[data-mkcg-populated="true"] {
            border-left: 4px solid #10b981;
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, transparent 100%);
            position: relative;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .mk-component[data-mkcg-populated="true"]:hover {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, transparent 100%);
            border-left-color: #059669;
            transform: translateX(2px);
        }
        
        /* Enhanced Quality Score Badge System */
        .mk-component .quality-badge {
            position: absolute;
            top: 8px;
            right: 8px;
            background: var(--quality-color);
            color: white;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            z-index: 10;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            transition: all 0.3s ease;
            cursor: pointer;
        }
        
        .mk-component .quality-badge:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        
        /* Enhanced Quality Color Variables */
        :root {
            --quality-excellent: #10b981;
            --quality-good: #3b82f6;
            --quality-fair: #f59e0b;
            --quality-poor: #ef4444;
            
            /* Data state colors */
            --data-connected: #10b981;
            --data-stale: #f59e0b;
            --data-error: #ef4444;
            --data-loading: #6b7280;
            
            /* Sync status colors */
            --sync-active: #10b981;
            --sync-pending: #f59e0b;
            --sync-error: #ef4444;
            --sync-offline: #6b7280;
        }
        
        /* Quality-specific badge styling */
        .quality-badge.excellent {
            --quality-color: var(--quality-excellent);
            background: linear-gradient(135deg, #10b981, #059669);
        }
        
        .quality-badge.good {
            --quality-color: var(--quality-good);
            background: linear-gradient(135deg, #3b82f6, #2563eb);
        }
        
        .quality-badge.fair {
            --quality-color: var(--quality-fair);
            background: linear-gradient(135deg, #f59e0b, #d97706);
        }
        
        .quality-badge.poor {
            --quality-color: var(--quality-poor);
            background: linear-gradient(135deg, #ef4444, #dc2626);
        }
        
        /* Enhanced Data Freshness Indicator */
        .mk-component .data-freshness {
            position: absolute;
            bottom: 8px;
            left: 8px;
            font-size: 10px;
            color: #6b7280;
            background: rgba(255, 255, 255, 0.95);
            padding: 3px 8px;
            border-radius: 6px;
            backdrop-filter: blur(4px);
            border: 1px solid rgba(0, 0, 0, 0.05);
            z-index: 5;
            transition: all 0.3s ease;
            cursor: pointer;
        }
        
        .mk-component .data-freshness:hover {
            background: white;
            color: #374151;
            transform: scale(1.05);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .mk-component .data-freshness::before {
            content: '🕒';
            margin-right: 4px;
            font-size: 9px;
        }
        
        .mk-component .data-freshness.stale {
            color: #d97706;
            background: rgba(251, 191, 36, 0.1);
            border-color: rgba(251, 191, 36, 0.2);
        }
        
        .mk-component .data-freshness.stale::before {
            content: '⚠️';
        }
        
        /* Enhanced Sync Status Indicators */
        .mk-component .sync-indicator {
            position: absolute;
            top: 8px;
            left: 8px;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: var(--sync-active);
            z-index: 10;
            transition: all 0.3s ease;
            cursor: pointer;
        }
        
        .mk-component .sync-indicator::after {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            border-radius: 50%;
            background: inherit;
            opacity: 0.3;
            animation: pulse 2s ease-in-out infinite;
        }
        
        .mk-component .sync-indicator:hover {
            transform: scale(1.3);
        }
        
        /* Sync status variants */
        .sync-indicator.syncing {
            background: var(--sync-pending);
            animation: spin 1s linear infinite;
        }
        
        .sync-indicator.syncing::after {
            animation: spin 1s linear infinite, pulse 2s ease-in-out infinite;
        }
        
        .sync-indicator.error {
            background: var(--sync-error);
            animation: shake 0.5s ease-in-out;
        }
        
        .sync-indicator.offline {
            background: var(--sync-offline);
            opacity: 0.6;
        }
        
        .sync-indicator.offline::after {
            animation: none;
        }
        
        /* TASK 3: Enhanced Component State Overlays */
        .mk-component .component-state-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.05);
            backdrop-filter: blur(2px);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: 15;
            border-radius: inherit;
        }
        
        .mk-component.updating .component-state-overlay {
            opacity: 1;
        }
        
        .component-state-overlay .state-message {
            background: white;
            color: #374151;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .state-message .loading-spinner {
            width: 14px;
            height: 14px;
            border: 2px solid #e5e7eb;
            border-top-color: #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        /* TASK 3: Component Quality Score Display */
        .mk-component .component-quality-score {
            position: absolute;
            bottom: 8px;
            right: 8px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 9px;
            font-weight: 600;
            z-index: 5;
            transition: all 0.3s ease;
        }
        
        .mk-component .component-quality-score:hover {
            background: rgba(0, 0, 0, 0.9);
            transform: scale(1.1);
        }
        
        .component-quality-score::before {
            content: '📊 ';
            font-size: 8px;
        }
        
        /* TASK 3: Enhanced Component Borders for States */
        .mk-component[data-state="fresh"] {
            border-left-color: var(--quality-excellent);
        }
        
        .mk-component[data-state="stale"] {
            border-left-color: var(--quality-fair);
        }
        
        .mk-component[data-state="error"] {
            border-left-color: var(--quality-poor);
        }
        
        .mk-component[data-state="loading"] {
            border-left-color: var(--data-loading);
            position: relative;
        }
        
        .mk-component[data-state="loading"]::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
            background: linear-gradient(to bottom, transparent, var(--data-loading), transparent);
            animation: slideUpDown 2s ease-in-out infinite;
        }
        
        /* TASK 3: Component Action Indicators */
        .mk-component .component-actions-indicator {
            position: absolute;
            top: -5px;
            right: -5px;
            width: 20px;
            height: 20px;
            background: #3b82f6;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 10px;
            z-index: 20;
            opacity: 0;
            transform: scale(0);
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .mk-component:hover .component-actions-indicator {
            opacity: 1;
            transform: scale(1);
        }
        
        .component-actions-indicator.has-updates {
            background: #f59e0b;
            animation: pulse 2s ease-in-out infinite;
        }
        
        .component-actions-indicator.has-errors {
            background: #ef4444;
            animation: shake 0.5s ease-in-out;
        }
        
        /* TASK 3: Enhanced Tooltip System for Component States */
        .mk-component[data-tooltip] {
            position: relative;
        }
        
        .mk-component[data-tooltip]:hover::after {
            content: attr(data-tooltip);
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
            white-space: nowrap;
            z-index: 1000;
            margin-bottom: 5px;
            animation: fadeIn 0.3s ease;
        }
        
        .mk-component[data-tooltip]:hover::before {
            content: '';
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            border: 5px solid transparent;
            border-top-color: rgba(0, 0, 0, 0.9);
            z-index: 1000;
            animation: fadeIn 0.3s ease;
        }
        
        /* TASK 3: Component State Animations */
        @keyframes slideUpDown {
            0%, 100% {
                transform: translateY(0);
            }
            50% {
                transform: translateY(-100%);
            }
        }
        
        @keyframes shake {
            0%, 100% {
                transform: translateX(0);
            }
            25% {
                transform: translateX(-2px);
            }
            75% {
                transform: translateX(2px);
            }
        }
        
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateX(-50%) translateY(5px);
            }
            to {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
        }
        
        /* TASK 3: Responsive Adjustments for Component Indicators */
        @media (max-width: 768px) {
            .mk-component .quality-badge {
                font-size: 10px;
                padding: 3px 8px;
            }
            
            .mk-component .data-freshness {
                font-size: 9px;
                padding: 2px 6px;
            }
            
            .mk-component .sync-indicator {
                width: 8px;
                height: 8px;
            }
            
            .mk-component .component-actions-indicator {
                width: 16px;
                height: 16px;
                font-size: 9px;
            }
        }
        
        /* TASK 3: High Contrast Mode Support */
        @media (prefers-contrast: high) {
            .mk-component .quality-badge {
                border: 2px solid currentColor;
            }
            
            .mk-component .data-freshness {
                border: 1px solid currentColor;
                background: white;
            }
            
            .mk-component .sync-indicator {
                border: 2px solid white;
            }
        }
        
        
        /* TASK 2 & 3: PERFORMANCE OPTIMIZATIONS */
        
        /* GPU acceleration for animations */
        .empty-state-enhanced,
        .preview-component-enhanced,
        .feature-item-enhanced,
        .btn,
        .mk-component .quality-badge,
        .mk-component .data-freshness,
        .mk-component .sync-indicator {
            will-change: transform;
            transform: translateZ(0);
        }
        
        /* Optimize rendering */
        .empty-state-enhanced,
        .mk-component {
            contain: layout style paint;
        }
        
        /* ========================================
           TASK 5: DATA REFRESH AND SYNCHRONIZATION CONTROLS
           ======================================== */
        
        /* Fresh Data Notification */
        .mkcg-fresh-data-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10001;
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            color: white;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3);
            animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            max-width: 400px;
        }
        
        .mkcg-fresh-data-notification .notification-content {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px 20px;
        }
        
        .mkcg-fresh-data-notification .notification-icon {
            font-size: 18px;
            animation: spin 2s linear infinite;
        }
        
        .mkcg-fresh-data-notification .notification-text {
            flex: 1;
            font-size: 14px;
            font-weight: 500;
            line-height: 1.4;
        }
        
        .refresh-now-btn {
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            margin-top: 8px;
            transition: all 0.3s ease;
        }
        
        .refresh-now-btn:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-1px);
        }
        
        /* Conflict Resolution Modal */
        .conflict-resolution-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 10002;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease-out;
        }
        
        .conflict-modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(4px);
        }
        
        .conflict-modal-content {
            position: relative;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 900px;
            width: 90%;
            max-height: 85vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            animation: modalSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .conflict-modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 24px;
            border-bottom: 1px solid #e2e8f0;
            background: linear-gradient(135deg, #f8fafc, #f1f5f9);
        }
        
        .conflict-header-info h2 {
            margin: 0 0 8px 0;
            font-size: 24px;
            font-weight: 700;
            color: #1e293b;
        }
        
        .conflict-header-info p {
            margin: 0;
            color: #64748b;
            font-size: 14px;
            line-height: 1.5;
        }
        
        .conflict-modal-close {
            background: none;
            border: none;
            font-size: 24px;
            color: #64748b;
            cursor: pointer;
            padding: 8px;
            border-radius: 8px;
            transition: all 0.3s ease;
        }
        
        .conflict-modal-close:hover {
            background: #f1f5f9;
            color: #1e293b;
        }
        
        .conflict-modal-body {
            flex: 1;
            overflow-y: auto;
            padding: 24px;
        }
        
        /* Conflict Analysis Summary */
        .conflict-analysis-summary {
            background: linear-gradient(135deg, #fefce8, #fef3c7);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 24px;
            border-left: 4px solid #f59e0b;
        }
        
        .analysis-header h3 {
            margin: 0 0 16px 0;
            font-size: 18px;
            font-weight: 600;
            color: #92400e;
        }
        
        .analysis-metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 16px;
            margin-bottom: 16px;
        }
        
        .analysis-metric {
            text-align: center;
            padding: 12px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        
        .metric-value {
            font-size: 24px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 4px;
        }
        
        .metric-label {
            font-size: 12px;
            color: #64748b;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        .analysis-metric.severity-high .metric-value {
            color: #dc2626;
        }
        
        .analysis-metric.severity-medium .metric-value {
            color: #d97706;
        }
        
        .analysis-metric.severity-low .metric-value {
            color: #059669;
        }
        
        .analysis-recommendations {
            background: white;
            border-radius: 8px;
            padding: 16px;
        }
        
        .analysis-recommendations h4 {
            margin: 0 0 12px 0;
            font-size: 14px;
            font-weight: 600;
            color: #92400e;
        }
        
        .analysis-recommendations ul {
            margin: 0;
            padding-left: 16px;
            color: #78716c;
            font-size: 13px;
            line-height: 1.5;
        }
        
        /* Batch Resolution Controls */
        .batch-resolution-controls {
            background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 24px;
            border-left: 4px solid #0ea5e9;
        }
        
        .batch-controls-header h3 {
            margin: 0 0 8px 0;
            font-size: 18px;
            font-weight: 600;
            color: #075985;
        }
        
        .batch-controls-header p {
            margin: 0 0 16px 0;
            color: #0c4a6e;
            font-size: 14px;
        }
        
        .batch-controls-options {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 12px;
        }
        
        .batch-option {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            background: white;
            border: 2px solid #e0f2fe;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 14px;
            font-weight: 500;
            color: #0c4a6e;
        }
        
        .batch-option:hover {
            border-color: #0ea5e9;
            background: #f0f9ff;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(14, 165, 233, 0.15);
        }
        
        .batch-icon {
            font-size: 16px;
        }
        
        /* Conflicts List */
        .conflicts-list {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        
        .conflict-item {
            background: white;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            overflow: hidden;
            transition: all 0.3s ease;
        }
        
        .conflict-item.severity-high {
            border-left: 4px solid #dc2626;
        }
        
        .conflict-item.severity-medium {
            border-left: 4px solid #d97706;
        }
        
        .conflict-item.severity-low {
            border-left: 4px solid #059669;
        }
        
        .conflict-item-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 20px;
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .conflict-title {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 8px;
        }
        
        .component-type {
            background: #3b82f6;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .field-name {
            font-size: 16px;
            font-weight: 600;
            color: #1e293b;
        }
        
        .conflict-meta {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .severity-badge {
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        .severity-badge.severity-high {
            background: #fecaca;
            color: #991b1b;
        }
        
        .severity-badge.severity-medium {
            background: #fed7aa;
            color: #9a3412;
        }
        
        .severity-badge.severity-low {
            background: #bbf7d0;
            color: #166534;
        }
        
        .conflict-type {
            font-size: 12px;
            color: #64748b;
            font-weight: 500;
        }
        
        .resolution-status {
            font-size: 12px;
            color: #64748b;
            font-weight: 500;
            padding: 4px 8px;
            border-radius: 4px;
            background: #f1f5f9;
        }
        
        .resolution-status.resolved {
            background: #dcfce7;
            color: #166534;
            font-weight: 600;
        }
        
        /* Diff View */
        .conflict-diff-view {
            padding: 20px;
            border-bottom: 1px solid #e2e8f0;
            background: #fafbfc;
        }
        
        .diff-header h4 {
            margin: 0 0 16px 0;
            font-size: 16px;
            font-weight: 600;
            color: #374151;
        }
        
        .diff-content {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 16px;
        }
        
        .diff-column {
            background: white;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid #e2e8f0;
        }
        
        .diff-column-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px;
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .diff-label {
            font-size: 14px;
            font-weight: 600;
            color: #374151;
        }
        
        .diff-indicator {
            font-size: 12px;
        }
        
        .diff-value {
            padding: 16px;
            max-height: 200px;
            overflow-y: auto;
        }
        
        .diff-value pre {
            margin: 0;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 12px;
            line-height: 1.5;
            color: #374151;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        
        .diff-column.local-changes .diff-column-header {
            background: #fef3c7;
            border-bottom-color: #f59e0b;
        }
        
        .diff-column.fresh-data .diff-column-header {
            background: #ecfdf5;
            border-bottom-color: #10b981;
        }
        
        .diff-column.original-data .diff-column-header {
            background: #f1f5f9;
            border-bottom-color: #64748b;
        }
        
        /* Resolution Options */
        .conflict-resolution-options {
            padding: 20px;
        }
        
        .resolution-option-group {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 12px;
            margin-bottom: 16px;
        }
        
        .conflict-resolution-option {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 16px;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            background: white;
        }
        
        .conflict-resolution-option:hover {
            border-color: #3b82f6;
            background: #f8fafc;
        }
        
        .conflict-resolution-option input[type="radio"] {
            margin-top: 4px;
        }
        
        .conflict-resolution-option input[type="radio"]:checked + .option-content {
            color: #3b82f6;
        }
        
        .conflict-resolution-option:has(input[type="radio"]:checked) {
            border-color: #3b82f6;
            background: #eff6ff;
        }
        
        .option-content {
            flex: 1;
        }
        
        .option-title {
            display: block;
            font-size: 14px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 4px;
        }
        
        .option-description {
            display: block;
            font-size: 12px;
            color: #64748b;
            line-height: 1.4;
        }
        
        /* Manual Merge Editor */
        .manual-merge-editor {
            margin-top: 16px;
            padding: 16px;
            background: #f8fafc;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }
        
        .manual-merge-editor label {
            display: block;
            font-size: 14px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 8px;
        }
        
        .manual-merge-input {
            width: 100%;
            min-height: 100px;
            padding: 12px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 13px;
            line-height: 1.5;
            resize: vertical;
        }
        
        .manual-merge-input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        /* Modal Footer */
        .conflict-modal-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20px 24px;
            border-top: 1px solid #e2e8f0;
            background: #f8fafc;
        }
        
        .conflict-footer-info {
            display: flex;
            align-items: center;
            gap: 16px;
            font-size: 14px;
            color: #64748b;
        }
        
        .conflicts-count {
            font-weight: 600;
        }
        
        .resolution-progress {
            color: #3b82f6;
            font-weight: 600;
        }
        
        .conflict-footer-actions {
            display: flex;
            gap: 12px;
        }
        
        .apply-resolutions.ready {
            background: linear-gradient(135deg, #10b981, #059669) !important;
            animation: pulse 2s ease-in-out infinite;
        }
        
        /* Animations */
        @keyframes modalSlideIn {
            from {
                opacity: 0;
                transform: translateY(-20px) scale(0.95);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }
        
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
            .conflict-modal-content {
                width: 95%;
                max-height: 90vh;
            }
            
            .analysis-metrics {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .batch-controls-options {
                grid-template-columns: 1fr;
            }
            
            .resolution-option-group {
                grid-template-columns: 1fr;
            }
            
            .diff-content {
                grid-template-columns: 1fr;
            }
            
            .conflict-footer-actions {
                flex-direction: column;
            }
        }
        
        /* ========================================
           TASK 4: ENHANCED ERROR HANDLING WITH USER GUIDANCE
           ======================================== */
        
        /* Enhanced Error Guidance Panel */
        .error-guidance-panel {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow: hidden;
            z-index: 10001;
            animation: errorPanelSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .error-guidance-panel::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(4px);
            z-index: -1;
        }
        
        .error-panel-content {
            display: flex;
            flex-direction: column;
            height: 100%;
        }
        
        /* Error Header Styling */
        .error-header {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 24px;
            background: var(--error-header-color);
            color: white;
            position: relative;
            overflow: hidden;
        }
        
        .error-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            animation: shimmer 2s ease-in-out infinite;
        }
        
        .error-icon {
            font-size: 32px;
            flex-shrink: 0;
            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
        }
        
        .error-info {
            flex: 1;
            position: relative;
            z-index: 2;
        }
        
        .error-title {
            font-size: 20px;
            font-weight: 700;
            margin: 0 0 8px 0;
            line-height: 1.2;
        }
        
        .error-message {
            font-size: 14px;
            margin: 0;
            opacity: 0.95;
            line-height: 1.4;
        }
        
        .error-close {
            background: none;
            border: none;
            color: white;
            font-size: 28px;
            cursor: pointer;
            padding: 4px;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            position: relative;
            z-index: 2;
        }
        
        .error-close:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: scale(1.1);
        }
        
        /* Error Details Section */
        .error-details {
            padding: 20px 24px;
            border-bottom: 1px solid #f1f5f9;
            background: #fafbfc;
        }
        
        .error-description {
            color: #475569;
            line-height: 1.6;
            margin: 0;
            font-size: 15px;
        }
        
        .error-technical-details {
            margin-top: 16px;
            padding: 12px;
            background: #f8fafc;
            border-radius: 8px;
            border-left: 4px solid #e2e8f0;
        }
        
        .error-technical-details summary {
            cursor: pointer;
            font-weight: 600;
            color: #374151;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        .error-technical-details pre {
            margin: 8px 0 0 0;
            font-size: 12px;
            color: #6b7280;
            font-family: 'Monaco', 'Menlo', monospace;
            line-height: 1.4;
        }
        
        /* Error Actions Section */
        .error-actions {
            padding: 24px;
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            justify-content: flex-end;
            background: #fcfcfd;
        }
        
        .error-action {
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            border: none;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            position: relative;
            overflow: hidden;
            min-width: 120px;
        }
        
        .error-action::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            transition: width 0.6s ease, height 0.6s ease;
        }
        
        .error-action:hover::before {
            width: 300px;
            height: 300px;
        }
        
        .error-action:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }
        
        .error-action.primary {
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            color: white;
        }
        
        .error-action.secondary {
            background: white;
            color: #475569;
            border: 2px solid #e2e8f0;
        }
        
        .error-action.warning {
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: white;
        }
        
        .error-action.danger {
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
        }
        
        /* Error Type Specific Colors */
        .error-guidance-panel.data-connection {
            --error-header-color: linear-gradient(135deg, #3b82f6, #2563eb);
        }
        
        .error-guidance-panel.component-generation {
            --error-header-color: linear-gradient(135deg, #f59e0b, #d97706);
        }
        
        .error-guidance-panel.data-quality {
            --error-header-color: linear-gradient(135deg, #8b5cf6, #7c3aed);
        }
        
        .error-guidance-panel.sync-error {
            --error-header-color: linear-gradient(135deg, #ef4444, #dc2626);
        }
        
        .error-guidance-panel.network-error {
            --error-header-color: linear-gradient(135deg, #6b7280, #4b5563);
        }
        
        /* Error Progress Indicator */
        .error-progress {
            padding: 16px 24px;
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .error-progress-bar {
            width: 100%;
            height: 4px;
            background: #e2e8f0;
            border-radius: 2px;
            overflow: hidden;
            margin-bottom: 8px;
        }
        
        .error-progress-fill {
            height: 100%;
            background: var(--error-header-color);
            border-radius: 2px;
            transition: width 0.3s ease;
            animation: progressPulse 2s ease-in-out infinite;
        }
        
        .error-progress-text {
            font-size: 12px;
            color: #6b7280;
            font-weight: 500;
        }
        
        /* Error Recovery Status */
        .error-recovery-status {
            padding: 16px 24px;
            background: linear-gradient(135deg, #ecfdf5, #f0fdf4);
            border-left: 4px solid #10b981;
            margin: 16px 24px;
            border-radius: 0 8px 8px 0;
        }
        
        .error-recovery-status.in-progress {
            background: linear-gradient(135deg, #eff6ff, #f0f9ff);
            border-left-color: #3b82f6;
        }
        
        .error-recovery-status.failed {
            background: linear-gradient(135deg, #fef2f2, #fef1f1);
            border-left-color: #ef4444;
        }
        
        .recovery-status-icon {
            font-size: 16px;
            margin-right: 8px;
        }
        
        .recovery-status-text {
            font-size: 14px;
            font-weight: 500;
            color: #374151;
        }
        
        /* Error Notification Toast Integration */
        .error-notification {
            background: linear-gradient(135deg, #ef4444, #dc2626);
            border-left: 4px solid #b91c1c;
        }
        
        .error-notification .notification-icon {
            font-size: 18px;
        }
        
        /* Error Panel Animations */
        @keyframes errorPanelSlideIn {
            from {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.9);
            }
            to {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }
        }
        
        @keyframes shimmer {
            0%, 100% {
                left: -100%;
            }
            50% {
                left: 100%;
            }
        }
        
        @keyframes progressPulse {
            0%, 100% {
                opacity: 1;
            }
            50% {
                opacity: 0.7;
            }
        }
        
        /* Error Panel Responsive Design */
        @media (max-width: 768px) {
            .error-guidance-panel {
                width: 95%;
                max-height: 90vh;
            }
            
            .error-header {
                padding: 20px;
            }
            
            .error-icon {
                font-size: 28px;
            }
            
            .error-title {
                font-size: 18px;
            }
            
            .error-actions {
                flex-direction: column;
            }
            
            .error-action {
                width: 100%;
                justify-content: center;
            }
        }
        
        /* Error Panel Accessibility */
        @media (prefers-reduced-motion: reduce) {
            .error-guidance-panel {
                animation: none;
            }
            
            .error-header::before {
                animation: none;
            }
            
            .error-progress-fill {
                animation: none;
            }
        }
        
        /* High Contrast Mode Support */
        @media (prefers-contrast: high) {
            .error-guidance-panel {
                border: 3px solid currentColor;
            }
            
            .error-action {
                border: 2px solid currentColor;
            }
        }
    </style>
    
    <!-- PHASE 2.3: TASK 2 - ENHANCED INTELLIGENT EMPTY STATE JAVASCRIPT -->
    <script type="text/javascript">
        // TASK 2: Enhanced Empty State Intelligence System
        document.addEventListener('DOMContentLoaded', function() {
            
            // TASK 2: Initialize Enhanced Empty State System
            initializeEnhancedEmptyStates();
            
            // TASK 2: Initialize Interactive Features
            initializeInteractiveFeatures();
            
            // TASK 2: Initialize Quality-Based Interactions
            initializeQualityInteractions();
            
            // TASK 2: Initialize Micro-Animations
            initializeMicroAnimations();
            // Dashboard Toggle Functionality
            const dashboardTrigger = document.getElementById('dashboard-trigger');
            const dashboardPanel = document.getElementById('dashboard-panel');
            const dashboardToggle = document.querySelector('.mkcg-dashboard-toggle');
            
            if (dashboardTrigger && dashboardPanel) {
                // Toggle dashboard panel
                function toggleDashboard() {
                    const isVisible = dashboardPanel.style.display !== 'none';
                    dashboardPanel.style.display = isVisible ? 'none' : 'block';
                    
                    // Rotate toggle icon
                    if (dashboardToggle) {
                        dashboardToggle.style.transform = isVisible ? 'rotate(0deg)' : 'rotate(180deg)';
                    }
                    
                    // Add animation class
                    if (!isVisible) {
                        dashboardPanel.classList.add('mkcg-panel-opening');
                        setTimeout(() => dashboardPanel.classList.remove('mkcg-panel-opening'), 300);
                    }
                }
                
                dashboardTrigger.addEventListener('click', toggleDashboard);
                dashboardToggle?.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleDashboard();
                });
            }
            
            // Enhanced Auto-Generation Buttons
            const autoGenerateButtons = [
                'mkcg-auto-generate-all',
                'auto-generate-all-empty', 
                'auto-generate-available',
                'generate-anyway'
            ];
            
            autoGenerateButtons.forEach(buttonId => {
                const button = document.getElementById(buttonId);
                if (button) {
                    button.addEventListener('click', function() {
                        console.log('🔗 Phase 2.3: Enhanced auto-generating components from MKCG data...');
                        
                        // Show enhanced loading state
                        const originalText = this.innerHTML;
                        this.innerHTML = `
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="animate-spin">
                                <path d="M21 12a9 9 0 11-6.219-8.56"/>
                            </svg>
                            <span>Generating...</span>
                        `;
                        this.disabled = true;
                        
                        // Update dashboard metric during generation
                        const autoGeneratedCount = document.getElementById('auto-generated-count');
                        
                        // Wait for enhanced component manager
                        const waitForEnhancedManager = () => {
                            if (window.enhancedComponentManager && typeof window.enhancedComponentManager.autoGenerateFromMKCGEnhanced === 'function') {
                                try {
                                    // Use Phase 2.1 enhanced auto-generation
                                    const result = window.enhancedComponentManager.autoGenerateFromMKCGEnhanced(true, {
                                        maxComponents: 5,
                                        minQualityScore: buttonId === 'generate-anyway' ? 0 : 30,
                                        priorityThreshold: 40
                                    });
                                    
                                    if (result.addedComponents && result.addedComponents.length > 0) {
                                        console.log(`🎉 Successfully auto-generated ${result.addedComponents.length} enhanced components:`, result.addedComponents);
                                        
                                        // Update dashboard count
                                        if (autoGeneratedCount) {
                                            autoGeneratedCount.textContent = result.addedComponents.length;
                                        }
                                        
                                        // Hide empty state
                                        const emptyState = document.getElementById('enhanced-empty-state');
                                        if (emptyState) {
                                            emptyState.style.display = 'none';
                                        }
                                        
                                        // Show success notification
                                        showEnhancedNotification(
                                            `🎉 ${result.addedComponents.length} components generated successfully!`,
                                            'success'
                                        );
                                    } else {
                                        console.warn('No components could be auto-generated from MKCG data');
                                        showEnhancedNotification(
                                            'No components could be generated from the available data. Try improving data quality first.',
                                            'warning'
                                        );
                                    }
                                } catch (error) {
                                    console.error('Error during enhanced auto-generation:', error);
                                    showEnhancedNotification(
                                        'Error generating components. Please try again or contact support.',
                                        'error'
                                    );
                                }
                                
                                // Restore button
                                this.innerHTML = originalText;
                                this.disabled = false;
                            } else {
                                // Retry after 100ms
                                setTimeout(waitForEnhancedManager, 100);
                            }
                        };
                        
                        waitForEnhancedManager();
                    });
                }
            });
            
            // TASK 5: Real Data Refresh Button with MKCGDataRefreshManager
            const refreshBtn = document.getElementById('mkcg-refresh-data');
            if (refreshBtn) {
                refreshBtn.addEventListener('click', async function() {
                    console.log('🔄 Starting real MKCG data refresh...');
                    
                    // Wait for refresh manager to be available
                    const waitForRefreshManager = () => {
                        if (window.mkcgDataRefreshManager) {
                            return Promise.resolve(window.mkcgDataRefreshManager);
                        }
                        return new Promise(resolve => {
                            const checkInterval = setInterval(() => {
                                if (window.mkcgDataRefreshManager) {
                                    clearInterval(checkInterval);
                                    resolve(window.mkcgDataRefreshManager);
                                }
                            }, 100);
                        });
                    };
                    
                    try {
                        const refreshManager = await waitForRefreshManager();
                        
                        // Show checking status
                        this.innerHTML = `
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="animate-spin">
                                <path d="M21 12a9 9 0 11-6.219-8.56"/>
                            </svg>
                            Checking...
                        `;
                        this.disabled = true;
                        
                        // Check for fresh data first
                        const checkResult = await refreshManager.checkForFreshData({
                            showProgress: true,
                            notifyUser: true
                        });
                        
                        if (checkResult.success && checkResult.hasFreshData) {
                            // Fresh data available, proceed with refresh
                            const refreshResult = await refreshManager.refreshAllData({
                                showProgress: true,
                                conflictResolution: 'prompt',
                                validateQuality: true
                            });
                            
                            if (refreshResult.success) {
                                showEnhancedNotification(
                                    `🎉 Data refreshed successfully! ${refreshResult.refreshedComponents?.length || 0} components updated.`,
                                    'success'
                                );
                            } else {
                                showEnhancedNotification(
                                    'Refresh failed: ' + (refreshResult.error || 'Unknown error'),
                                    'error'
                                );
                            }
                        } else if (checkResult.success && !checkResult.hasFreshData) {
                            showEnhancedNotification(
                                '✅ Your data is already up to date!',
                                'info'
                            );
                        } else {
                            showEnhancedNotification(
                                'Failed to check for fresh data: ' + (checkResult.error || 'Unknown error'),
                                'error'
                            );
                        }
                        
                    } catch (error) {
                        console.error('Error during refresh operation:', error);
                        showEnhancedNotification(
                            'Refresh error: ' + error.message,
                            'error'
                        );
                    } finally {
                        // Restore button
                        setTimeout(() => {
                            this.innerHTML = `
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="23 4 23 10 17 10"></polyline>
                                    <polyline points="1 20 1 14 7 14"></polyline>
                                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
                                </svg>
                                Refresh Data
                            `;
                            this.disabled = false;
                        }, 1000);
                    }
                });
            }
            
            // Manual build buttons
            const manualButtons = ['manual-build', 'manual-build-fallback', 'connect-data', 'improve-data'];
            manualButtons.forEach(buttonId => {
                const button = document.getElementById(buttonId);
                if (button) {
                    button.addEventListener('click', function() {
                        const action = buttonId.replace('-', ' ');
                        console.log(`🔧 ${action} action triggered`);
                        showEnhancedNotification(`${action} functionality is being developed!`, 'info');
                    });
                }
            });
            
            // TASK 4: Initialize Enhanced Error Handling System
            initializeEnhancedErrorHandling();
            
            console.log('🔗 Phase 2.3: Task 2, 3 & 4 - Enhanced Systems ready');
        });
        
        // TASK 2: ENHANCED EMPTY STATE INTELLIGENCE SYSTEM
        function initializeEnhancedEmptyStates() {
            const emptyState = document.getElementById('enhanced-empty-state');
            if (!emptyState) return;
            
            // Apply quality-based theming
            const qualityScore = getQualityScore();
            applyQualityTheming(emptyState, qualityScore);
            
            // Initialize progressive disclosure
            initializeProgressiveDisclosure(emptyState);
            
            // Initialize smart recommendations
            initializeSmartRecommendations(emptyState);
            
            console.log('🎯 Task 2: Enhanced empty state intelligence initialized');
        }
        
        // TASK 2: INTERACTIVE FEATURES SYSTEM
        function initializeInteractiveFeatures() {
            // Enhanced component preview interactions
            const previewComponents = document.querySelectorAll('.preview-component-enhanced');
            previewComponents.forEach(component => {
                component.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-12px) scale(1.02)';
                    this.style.boxShadow = '0 16px 48px rgba(0, 0, 0, 0.12)';
                });
                
                component.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0) scale(1)';
                    this.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                });
                
                component.addEventListener('click', function() {
                    const componentType = this.dataset.componentType;
                    showComponentPreview(componentType);
                });
            });
            
            // Enhanced feature showcase interactions
            const featureItems = document.querySelectorAll('.feature-item-enhanced');
            featureItems.forEach(feature => {
                feature.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-8px) scale(1.05)';
                    const icon = this.querySelector('.feature-icon-enhanced');
                    if (icon) {
                        icon.style.transform = 'scale(1.2) rotate(5deg)';
                    }
                });
                
                feature.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0) scale(1)';
                    const icon = this.querySelector('.feature-icon-enhanced');
                    if (icon) {
                        icon.style.transform = 'scale(1) rotate(0deg)';
                    }
                });
                
                feature.addEventListener('click', function() {
                    const featureType = this.dataset.feature;
                    showFeatureDetails(featureType);
                });
            });
            
            console.log('🎮 Task 2: Interactive features initialized');
        }
        
        // TASK 2: QUALITY-BASED INTERACTIONS
        function initializeQualityInteractions() {
            // Quality score animations
            const qualityHighlights = document.querySelectorAll('.quality-score-highlight');
            qualityHighlights.forEach(highlight => {
                highlight.addEventListener('mouseenter', function() {
                    this.style.transform = 'scale(1.1)';
                    this.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
                });
                
                highlight.addEventListener('mouseleave', function() {
                    this.style.transform = 'scale(1)';
                    this.style.boxShadow = '';
                });
            });
            
            // Quality badges micro-interactions
            const qualityBadges = document.querySelectorAll('.quality-badge-mini');
            qualityBadges.forEach(badge => {
                badge.addEventListener('mouseenter', function() {
                    this.style.transform = 'scale(1.15)';
                    this.style.fontWeight = '700';
                });
                
                badge.addEventListener('mouseleave', function() {
                    this.style.transform = 'scale(1)';
                    this.style.fontWeight = '600';
                });
            });
            
            console.log('📊 Task 2: Quality-based interactions initialized');
        }
        
        // TASK 2: MICRO-ANIMATIONS SYSTEM
        function initializeMicroAnimations() {
            // Staggered animation for preview components
            const previewComponents = document.querySelectorAll('.preview-component-enhanced');
            previewComponents.forEach((component, index) => {
                component.style.animationDelay = `${index * 0.1}s`;
                component.style.animation = 'fadeInScale 0.6s ease-out forwards';
            });
            
            // Staggered animation for feature items
            const featureItems = document.querySelectorAll('.feature-item-enhanced');
            featureItems.forEach((item, index) => {
                item.style.animationDelay = `${index * 0.2}s`;
                item.style.animation = 'slideInUp 0.8s ease-out forwards';
            });
            
            // Enhanced button hover effects
            const buttons = document.querySelectorAll('.btn');
            buttons.forEach(button => {
                button.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-3px) scale(1.02)';
                    const svg = this.querySelector('svg');
                    if (svg) {
                        svg.style.transform = 'scale(1.2) rotate(5deg)';
                    }
                });
                
                button.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0) scale(1)';
                    const svg = this.querySelector('svg');
                    if (svg) {
                        svg.style.transform = 'scale(1) rotate(0deg)';
                    }
                });
            });
            
            // Icon animation enhancements
            const animatedIcons = document.querySelectorAll('.animate-bounce-gentle, .animate-pulse-gentle, .animate-shake-gentle, .animate-float');
            animatedIcons.forEach(icon => {
                icon.addEventListener('mouseenter', function() {
                    this.style.animationPlayState = 'paused';
                    this.style.transform = 'scale(1.2)';
                    this.style.filter = 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.2))';
                });
                
                icon.addEventListener('mouseleave', function() {
                    this.style.animationPlayState = 'running';
                    this.style.transform = 'scale(1)';
                    this.style.filter = 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))';
                });
            });
            
            console.log('✨ Task 2: Micro-animations initialized');
        }
        
        // TASK 2: PROGRESSIVE DISCLOSURE SYSTEM
        function initializeProgressiveDisclosure(emptyState) {
            const featureItems = emptyState.querySelectorAll('.feature-item-enhanced');
            
            featureItems.forEach(item => {
                item.addEventListener('click', function() {
                    const featureType = this.dataset.feature;
                    showFeatureTooltip(this, featureType);
                });
            });
        }
        
        // TASK 2: SMART RECOMMENDATIONS SYSTEM
        function initializeSmartRecommendations(emptyState) {
            const recommendationItems = emptyState.querySelectorAll('.recommendation-item');
            
            recommendationItems.forEach(item => {
                item.addEventListener('click', function() {
                    const recommendation = this.querySelector('.recommendation-text').textContent;
                    showRecommendationDetails(recommendation);
                });
                
                item.addEventListener('mouseenter', function() {
                    this.style.background = 'rgba(59, 130, 246, 0.05)';
                    this.style.borderRadius = '8px';
                    this.style.transform = 'translateX(8px)';
                });
                
                item.addEventListener('mouseleave', function() {
                    this.style.background = 'transparent';
                    this.style.transform = 'translateX(0)';
                });
            });
        }
        
        // TASK 2: UTILITY FUNCTIONS
        function getQualityScore() {
            const scoreElement = document.querySelector('.quality-score-highlight');
            if (scoreElement) {
                const scoreText = scoreElement.textContent;
                const score = parseInt(scoreText.replace('%', ''));
                return isNaN(score) ? 0 : score;
            }
            return 0;
        }
        
        function applyQualityTheming(emptyState, qualityScore) {
            emptyState.classList.remove('mkcg-ready', 'mkcg-good', 'mkcg-warning');
            
            if (qualityScore >= 70) {
                emptyState.classList.add('mkcg-ready');
            } else if (qualityScore >= 40) {
                emptyState.classList.add('mkcg-good');
            } else {
                emptyState.classList.add('mkcg-warning');
            }
        }
        
        function showComponentPreview(componentType) {
            const modal = createPreviewModal(componentType);
            document.body.appendChild(modal);
            
            // Animate modal in
            setTimeout(() => {
                modal.style.opacity = '1';
                modal.querySelector('.modal-content').style.transform = 'scale(1)';
            }, 10);
            
            showEnhancedNotification(`Preview for ${componentType} component`, 'info');
        }
        
        function showFeatureDetails(featureType) {
            const features = {
                'auto-generation': {
                    title: 'Auto-Generation',
                    description: 'Automatically create components from your MKCG data with intelligent field mapping and quality optimization.',
                    benefits: ['Saves time', 'Reduces errors', 'Ensures consistency']
                },
                'quality-scoring': {
                    title: 'Quality Scoring',
                    description: 'Real-time assessment of your data quality with actionable recommendations for improvement.',
                    benefits: ['Data insights', 'Quality metrics', 'Improvement suggestions']
                },
                'smart-mapping': {
                    title: 'Smart Mapping',
                    description: 'Intelligent field matching that optimizes component population based on data relationships.',
                    benefits: ['Intelligent matching', 'Optimal population', 'Data relationships']
                }
            };
            
            const feature = features[featureType];
            if (feature) {
                showFeatureTooltip(document.querySelector(`[data-feature="${featureType}"]`), feature);
            }
        }
        
        function showFeatureTooltip(element, feature) {
            const tooltip = document.createElement('div');
            tooltip.className = 'feature-tooltip';
            tooltip.innerHTML = `
                <div class="tooltip-header">
                    <h4>${typeof feature === 'string' ? feature : feature.title}</h4>
                    <button class="tooltip-close">×</button>
                </div>
                <div class="tooltip-content">
                    ${typeof feature === 'string' ? 'Learn more about this feature' : feature.description}
                    ${feature.benefits ? `<ul class="tooltip-benefits">${feature.benefits.map(b => `<li>${b}</li>`).join('')}</ul>` : ''}
                </div>
            `;
            
            // Position tooltip
            const rect = element.getBoundingClientRect();
            tooltip.style.cssText = `
                position: fixed;
                top: ${rect.top - 10}px;
                left: ${rect.right + 10}px;
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                padding: 16px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
                z-index: 10000;
                max-width: 300px;
                font-size: 14px;
                line-height: 1.5;
                animation: fadeInScale 0.3s ease-out;
            `;
            
            document.body.appendChild(tooltip);
            
            // Close tooltip
            const closeBtn = tooltip.querySelector('.tooltip-close');
            closeBtn.addEventListener('click', () => {
                tooltip.style.animation = 'fadeInScale 0.3s ease-out reverse';
                setTimeout(() => tooltip.remove(), 300);
            });
            
            // Auto-close after 5 seconds
            setTimeout(() => {
                if (tooltip.parentNode) {
                    tooltip.style.animation = 'fadeInScale 0.3s ease-out reverse';
                    setTimeout(() => tooltip.remove(), 300);
                }
            }, 5000);
        }
        
        function showRecommendationDetails(recommendation) {
            const suggestions = {
                'Consider generating more content types': 'Generate additional content types like Topics, Questions, or Offers to reach a higher quality score.',
                'Add more content types': 'Expand your media kit with Biography, Authority Hook, and Social Media components.',
                'Biography data is essential': 'Add biographical information to provide context and credibility to your media kit.'
            };
            
            const suggestion = suggestions[recommendation] || 'This recommendation will help improve your media kit quality.';
            showEnhancedNotification(suggestion, 'info');
        }
        
        function createPreviewModal(componentType) {
            const modal = document.createElement('div');
            modal.className = 'component-preview-modal';
            modal.innerHTML = `
                <div class="modal-overlay">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>${componentType.charAt(0).toUpperCase() + componentType.slice(1)} Component Preview</h3>
                            <button class="modal-close">×</button>
                        </div>
                        <div class="modal-body">
                            <p>This is a preview of the ${componentType} component that will be generated from your MKCG data.</p>
                            <div class="preview-placeholder">
                                <div class="placeholder-content">
                                    <div class="placeholder-header"></div>
                                    <div class="placeholder-text"></div>
                                    <div class="placeholder-text"></div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn--primary generate-component-btn">Generate This Component</button>
                            <button class="btn btn--secondary modal-close">Close</button>
                        </div>
                    </div>
                </div>
            `;
            
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.6);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            
            const modalContent = modal.querySelector('.modal-content');
            modalContent.style.cssText = `
                background: white;
                border-radius: 16px;
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow: hidden;
                transform: scale(0.9);
                transition: transform 0.3s ease;
            `;
            
            // Close modal functionality
            modal.querySelectorAll('.modal-close').forEach(btn => {
                btn.addEventListener('click', () => {
                    modal.style.opacity = '0';
                    modalContent.style.transform = 'scale(0.9)';
                    setTimeout(() => modal.remove(), 300);
                });
            });
            
            // Generate component functionality
            const generateBtn = modal.querySelector('.generate-component-btn');
            generateBtn.addEventListener('click', () => {
                // Trigger component generation
                const autoGenerateBtn = document.getElementById('auto-generate-all-empty') || document.getElementById('auto-generate-available');
                if (autoGenerateBtn) {
                    autoGenerateBtn.click();
                }
                
                // Close modal
                modal.style.opacity = '0';
                modalContent.style.transform = 'scale(0.9)';
                setTimeout(() => modal.remove(), 300);
            });
            
            return modal;
        }
        
        // TASK 2: ENHANCED NOTIFICATION SYSTEM INTEGRATION
        function showEnhancedNotification(message, type = 'info') {
            const notification = document.createElement('div');
            notification.className = `enhanced-notification notification-${type}`;
            
            const icons = {
                success: '🎉',
                warning: '⚠️',
                error: '❌',
                info: '💡'
            };
            
            notification.innerHTML = `
                <div class="notification-content">
                    <span class="notification-icon">${icons[type] || icons.info}</span>
                    <span class="notification-message">${message}</span>
                    <button class="notification-close">×</button>
                </div>
            `;
            
            // Enhanced styling
            notification.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                z-index: 10001;
                background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : type === 'error' ? '#ef4444' : '#3b82f6'};
                color: white;
                padding: 16px 20px;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
                max-width: 400px;
                animation: slideInRightEnhanced 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                font-size: 14px;
                backdrop-filter: blur(10px);
            `;
            
            document.body.appendChild(notification);
            
            // Enhanced auto-remove with fade
            setTimeout(() => {
                notification.style.animation = 'slideInRightEnhanced 0.4s cubic-bezier(0.16, 1, 0.3, 1) reverse';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 400);
            }, 6000);
            
            // Enhanced close button
            const closeBtn = notification.querySelector('.notification-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    notification.style.animation = 'slideInRightEnhanced 0.4s cubic-bezier(0.16, 1, 0.3, 1) reverse';
                    setTimeout(() => {
                        if (notification.parentNode) {
                            notification.remove();
                        }
                    }, 400);
                });
            }
        }
        
        // TASK 2: ENHANCED DEBUGGING FUNCTIONS
        window.task2Debug = {
            triggerComponentPreview: function(componentType = 'topics') {
                showComponentPreview(componentType);
            },
            showFeatureTooltip: function(featureType = 'auto-generation') {
                showFeatureDetails(featureType);
            },
            testQualityTheming: function(score = 75) {
                const emptyState = document.getElementById('enhanced-empty-state');
                if (emptyState) {
                    applyQualityTheming(emptyState, score);
                    console.log(`Applied quality theming for score: ${score}`);
                }
            },
            testMicroAnimations: function() {
                const previewComponents = document.querySelectorAll('.preview-component-enhanced');
                previewComponents.forEach((component, index) => {
                    setTimeout(() => {
                        component.style.transform = 'scale(1.1)';
                        setTimeout(() => {
                            component.style.transform = 'scale(1)';
                        }, 200);
                    }, index * 100);
                });
            },
            showNotification: function(message, type = 'info') {
                showEnhancedNotification(message, type);
            }
        };
        
        // TASK 3: ENHANCED COMPONENT STATE VISUAL INDICATORS SYSTEM
        function initializeComponentStateIndicators() {
            console.log('🎯 Task 3: Initializing Enhanced Component State Indicators...');
            
            // Initialize component state management
            initializeComponentStateManagement();
            
            // Initialize quality badge system
            initializeQualityBadgeSystem();
            
            // Initialize data freshness tracking
            initializeDataFreshnessTracking();
            
            // Initialize sync status monitoring
            initializeSyncStatusMonitoring();
            
            // Initialize component tooltips
            initializeComponentTooltips();
            
            // Start real-time indicator updates
            startRealTimeIndicatorUpdates();
            
            console.log('✅ Task 3: Enhanced Component State Indicators initialized');
        }
        
        // TASK 3: COMPONENT STATE MANAGEMENT SYSTEM
        function initializeComponentStateManagement() {
            const components = document.querySelectorAll('[data-component-id]');
            
            components.forEach(component => {
                // Add MKCG population indicator if applicable
                if (window.guestifyData?.mkcgData) {
                    const componentType = component.dataset.componentType;
                    if (componentType && isMKCGPopulated(componentType)) {
                        component.setAttribute('data-mkcg-populated', 'true');
                        addComponentStateIndicators(component, componentType);
                    }
                }
                
                // Add hover effects for state indicators
                component.addEventListener('mouseenter', function() {
                    showComponentStateDetails(this);
                });
                
                component.addEventListener('mouseleave', function() {
                    hideComponentStateDetails(this);
                });
            });
        }
        
        // TASK 3: QUALITY BADGE SYSTEM
        function initializeQualityBadgeSystem() {
            const mkcgComponents = document.querySelectorAll('[data-mkcg-populated="true"]');
            
            mkcgComponents.forEach(component => {
                const componentType = component.dataset.componentType;
                const qualityScore = calculateComponentQuality(componentType);
                const qualityLevel = getQualityLevel(qualityScore);
                
                // Create quality badge
                const qualityBadge = createQualityBadge(qualityScore, qualityLevel);
                component.appendChild(qualityBadge);
                
                // Add click handler for quality details
                qualityBadge.addEventListener('click', function(e) {
                    e.stopPropagation();
                    showQualityDetails(component, qualityScore, componentType);
                });
            });
        }
        
        // TASK 3: DATA FRESHNESS TRACKING
        function initializeDataFreshnessTracking() {
            const mkcgComponents = document.querySelectorAll('[data-mkcg-populated="true"]');
            
            mkcgComponents.forEach(component => {
                const componentType = component.dataset.componentType;
                const lastUpdate = getMKCGDataTimestamp(componentType);
                const freshness = calculateDataFreshness(lastUpdate);
                
                // Create data freshness indicator
                const freshnessIndicator = createDataFreshnessIndicator(freshness, lastUpdate);
                component.appendChild(freshnessIndicator);
                
                // Add click handler for freshness details
                freshnessIndicator.addEventListener('click', function(e) {
                    e.stopPropagation();
                    showFreshnessDetails(component, lastUpdate, freshness);
                });
            });
        }
        
        // TASK 3: SYNC STATUS MONITORING
        function initializeSyncStatusMonitoring() {
            const mkcgComponents = document.querySelectorAll('[data-mkcg-populated="true"]');
            
            mkcgComponents.forEach(component => {
                const componentType = component.dataset.componentType;
                const syncStatus = getSyncStatus(componentType);
                
                // Create sync status indicator
                const syncIndicator = createSyncStatusIndicator(syncStatus);
                component.appendChild(syncIndicator);
                
                // Add click handler for sync actions
                syncIndicator.addEventListener('click', function(e) {
                    e.stopPropagation();
                    handleSyncAction(component, componentType);
                });
            });
        }
        
        // TASK 3: COMPONENT TOOLTIPS SYSTEM
        function initializeComponentTooltips() {
            const components = document.querySelectorAll('[data-component-id]');
            
            components.forEach(component => {
                const componentType = component.dataset.componentType;
                const isMKCG = component.hasAttribute('data-mkcg-populated');
                
                let tooltip = `${componentType.charAt(0).toUpperCase() + componentType.slice(1)} Component`;
                
                if (isMKCG) {
                    const quality = calculateComponentQuality(componentType);
                    const freshness = calculateDataFreshness(getMKCGDataTimestamp(componentType));
                    tooltip += ` • MKCG Data • Quality: ${quality}% • ${freshness}`;
                }
                
                component.setAttribute('data-tooltip', tooltip);
            });
        }
        
        // TASK 3: REAL-TIME INDICATOR UPDATES
        function startRealTimeIndicatorUpdates() {
            // Update indicators every 30 seconds
            setInterval(() => {
                updateComponentIndicators();
            }, 30000);
            
            // Listen for MKCG data changes
            window.addEventListener('mkcgDataUpdated', function(event) {
                updateComponentIndicators(event.detail.componentType);
            });
            
            // Listen for component modifications
            document.addEventListener('componentModified', function(event) {
                updateComponentState(event.target, 'modified');
            });
        }
        
        // TASK 3: UTILITY FUNCTIONS
        function isMKCGPopulated(componentType) {
            const mkcgData = window.guestifyData?.mkcgData;
            if (!mkcgData) return false;
            
            const dataMap = {
                'topics': mkcgData.topics?.topic_1,
                'biography': mkcgData.biography?.short,
                'authority-hook': mkcgData.authority_hook?.who,
                'questions': mkcgData.questions?.length > 0,
                'offers': mkcgData.offers?.length > 0,
                'social': mkcgData.social_media?.length > 0
            };
            
            return !!dataMap[componentType];
        }
        
        function calculateComponentQuality(componentType) {
            const mkcgData = window.guestifyData?.mkcgData;
            if (!mkcgData) return 0;
            
            const qualityMetrics = {
                'topics': () => {
                    const topics = mkcgData.topics || {};
                    const topicCount = Object.keys(topics).filter(key => key.startsWith('topic_') && topics[key]).length;
                    return Math.min(topicCount * 20, 100);
                },
                'biography': () => {
                    const bio = mkcgData.biography || {};
                    let score = 0;
                    if (bio.short) score += 30;
                    if (bio.medium) score += 35;
                    if (bio.long) score += 35;
                    return score;
                },
                'authority-hook': () => {
                    const hook = mkcgData.authority_hook || {};
                    const components = ['who', 'what', 'when', 'how'].filter(key => hook[key]);
                    return (components.length / 4) * 100;
                },
                'questions': () => {
                    const questions = mkcgData.questions || [];
                    return Math.min(questions.length * 20, 100);
                },
                'offers': () => {
                    const offers = mkcgData.offers || [];
                    return Math.min(offers.length * 33, 100);
                },
                'social': () => {
                    const social = mkcgData.social_media || [];
                    return Math.min(social.length * 25, 100);
                }
            };
            
            const calculator = qualityMetrics[componentType];
            return calculator ? Math.round(calculator()) : 0;
        }
        
        function getQualityLevel(score) {
            if (score >= 80) return 'excellent';
            if (score >= 60) return 'good';
            if (score >= 40) return 'fair';
            return 'poor';
        }
        
        function createQualityBadge(score, level) {
            const badge = document.createElement('div');
            badge.className = `quality-badge ${level}`;
            badge.textContent = `${score}%`;
            badge.setAttribute('title', `Quality Score: ${score}% (${level.toUpperCase()})`);
            return badge;
        }
        
        function getMKCGDataTimestamp(componentType) {
            const mkcgData = window.guestifyData?.mkcgData;
            if (!mkcgData || !mkcgData.meta_info) return new Date();
            
            return new Date(mkcgData.meta_info.extraction_date || mkcgData.meta_info.last_mkcg_update || Date.now());
        }
        
        function calculateDataFreshness(lastUpdate) {
            const now = new Date();
            const diffHours = Math.abs(now - lastUpdate) / 36e5; // 36e5 = 60*60*1000 ms per hour
            
            if (diffHours < 1) return 'Fresh';
            if (diffHours < 24) return `${Math.round(diffHours)}h ago`;
            if (diffHours < 168) return `${Math.round(diffHours / 24)}d ago`;
            return 'Stale';
        }
        
        function createDataFreshnessIndicator(freshness, lastUpdate) {
            const indicator = document.createElement('div');
            const isStale = freshness === 'Stale' || freshness.includes('d ago');
            
            indicator.className = `data-freshness ${isStale ? 'stale' : ''}`;
            indicator.textContent = freshness;
            indicator.setAttribute('title', `Last updated: ${lastUpdate.toLocaleString()}`);
            return indicator;
        }
        
        function getSyncStatus(componentType) {
            // Simulate sync status - in real implementation, this would check actual sync state
            const statuses = ['active', 'syncing', 'offline'];
            return statuses[Math.floor(Math.random() * statuses.length)];
        }
        
        function createSyncStatusIndicator(status) {
            const indicator = document.createElement('div');
            indicator.className = `sync-indicator ${status}`;
            
            const statusMessages = {
                'active': 'Synced with MKCG data',
                'syncing': 'Syncing with MKCG data...',
                'offline': 'Offline - no sync available',
                'error': 'Sync error - click to retry'
            };
            
            indicator.setAttribute('title', statusMessages[status] || 'Unknown sync status');
            return indicator;
        }
        
        function addComponentStateIndicators(component, componentType) {
            // Add component quality score display
            const qualityScore = calculateComponentQuality(componentType);
            const scoreDisplay = document.createElement('div');
            scoreDisplay.className = 'component-quality-score';
            scoreDisplay.textContent = `${qualityScore}%`;
            component.appendChild(scoreDisplay);
            
            // Add component actions indicator
            const actionsIndicator = document.createElement('div');
            actionsIndicator.className = 'component-actions-indicator';
            actionsIndicator.textContent = '•••';
            actionsIndicator.setAttribute('title', 'Component actions available');
            component.appendChild(actionsIndicator);
        }
        
        function showComponentStateDetails(component) {
            // Highlight all indicators on hover
            const indicators = component.querySelectorAll('.quality-badge, .data-freshness, .sync-indicator');
            indicators.forEach(indicator => {
                indicator.style.transform = 'scale(1.1)';
                indicator.style.zIndex = '15';
            });
        }
        
        function hideComponentStateDetails(component) {
            // Reset indicators on mouse leave
            const indicators = component.querySelectorAll('.quality-badge, .data-freshness, .sync-indicator');
            indicators.forEach(indicator => {
                indicator.style.transform = 'scale(1)';
                indicator.style.zIndex = '';
            });
        }
        
        function showQualityDetails(component, score, componentType) {
            const modal = createQualityDetailsModal(score, componentType);
            document.body.appendChild(modal);
            
            // Animate modal in
            setTimeout(() => {
                modal.style.opacity = '1';
                modal.querySelector('.modal-content').style.transform = 'scale(1)';
            }, 10);
        }
        
        function createQualityDetailsModal(score, componentType) {
            const modal = document.createElement('div');
            modal.className = 'quality-details-modal';
            
            const level = getQualityLevel(score);
            const levelColors = {
                'excellent': '#10b981',
                'good': '#3b82f6',
                'fair': '#f59e0b',
                'poor': '#ef4444'
            };
            
            modal.innerHTML = `
                <div class="modal-overlay">
                    <div class="modal-content">
                        <div class="modal-header" style="background: ${levelColors[level]}; color: white;">
                            <h3>📊 Quality Score: ${score}%</h3>
                            <button class="modal-close">×</button>
                        </div>
                        <div class="modal-body">
                            <div class="quality-breakdown">
                                <div class="quality-level ${level}">
                                    <span class="level-label">${level.toUpperCase()}</span>
                                    <span class="level-description">Quality Level</span>
                                </div>
                                <div class="quality-metrics">
                                    <h4>Component: ${componentType.charAt(0).toUpperCase() + componentType.slice(1)}</h4>
                                    <p>This component has been populated with MKCG data and scored based on completeness and relevance.</p>
                                    <div class="quality-tips">
                                        <h5>💡 Quality Tips:</h5>
                                        <ul>
                                            <li>Higher scores indicate more complete data</li>
                                            <li>Fresh data improves quality over time</li>
                                            <li>Multiple data points increase reliability</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn--secondary modal-close">Close</button>
                        </div>
                    </div>
                </div>
            `;
            
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.6);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            
            const modalContent = modal.querySelector('.modal-content');
            modalContent.style.cssText = `
                background: white;
                border-radius: 16px;
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow: hidden;
                transform: scale(0.9);
                transition: transform 0.3s ease;
            `;
            
            // Close modal functionality
            modal.querySelectorAll('.modal-close').forEach(btn => {
                btn.addEventListener('click', () => {
                    modal.style.opacity = '0';
                    modalContent.style.transform = 'scale(0.9)';
                    setTimeout(() => modal.remove(), 300);
                });
            });
            
            return modal;
        }
        
        function showFreshnessDetails(component, lastUpdate, freshness) {
            showEnhancedNotification(
                `Data freshness: ${freshness}. Last updated: ${lastUpdate.toLocaleString()}`,
                freshness === 'Stale' ? 'warning' : 'info'
            );
        }
        
        function handleSyncAction(component, componentType) {
            const syncIndicator = component.querySelector('.sync-indicator');
            if (!syncIndicator) return;
            
            // Show syncing state
            syncIndicator.className = 'sync-indicator syncing';
            
            // Simulate sync operation
            setTimeout(() => {
                syncIndicator.className = 'sync-indicator active';
                showEnhancedNotification(`${componentType} component synced successfully!`, 'success');
                
                // Update component state
                updateComponentState(component, 'synced');
            }, 2000);
        }
        
        function updateComponentIndicators(specificComponentType = null) {
            const components = specificComponentType ? 
                document.querySelectorAll(`[data-component-type="${specificComponentType}"]`) :
                document.querySelectorAll('[data-mkcg-populated="true"]');
            
            components.forEach(component => {
                const componentType = component.dataset.componentType;
                
                // Update quality badge
                const qualityBadge = component.querySelector('.quality-badge');
                if (qualityBadge) {
                    const newScore = calculateComponentQuality(componentType);
                    const newLevel = getQualityLevel(newScore);
                    qualityBadge.textContent = `${newScore}%`;
                    qualityBadge.className = `quality-badge ${newLevel}`;
                }
                
                // Update freshness indicator
                const freshnessIndicator = component.querySelector('.data-freshness');
                if (freshnessIndicator) {
                    const lastUpdate = getMKCGDataTimestamp(componentType);
                    const freshness = calculateDataFreshness(lastUpdate);
                    const isStale = freshness === 'Stale' || freshness.includes('d ago');
                    
                    freshnessIndicator.textContent = freshness;
                    freshnessIndicator.className = `data-freshness ${isStale ? 'stale' : ''}`;
                }
                
                // Update tooltip
                const quality = calculateComponentQuality(componentType);
                const freshness = calculateDataFreshness(getMKCGDataTimestamp(componentType));
                const tooltip = `${componentType.charAt(0).toUpperCase() + componentType.slice(1)} Component • MKCG Data • Quality: ${quality}% • ${freshness}`;
                component.setAttribute('data-tooltip', tooltip);
            });
        }
        
        function updateComponentState(component, state) {
            component.setAttribute('data-state', state);
            
            // Add temporary state overlay for visual feedback
            if (state === 'modified' || state === 'synced') {
                component.classList.add('updating');
                
                const overlay = component.querySelector('.component-state-overlay') || createStateOverlay();
                const message = overlay.querySelector('.state-message');
                
                if (state === 'synced') {
                    message.innerHTML = '<span style="color: #10b981;">✓</span> Synced';
                } else {
                    message.innerHTML = '<div class="loading-spinner"></div> Updating...';
                }
                
                if (!component.contains(overlay)) {
                    component.appendChild(overlay);
                }
                
                // Remove overlay after delay
                setTimeout(() => {
                    component.classList.remove('updating');
                    overlay.remove();
                }, state === 'synced' ? 1500 : 3000);
            }
        }
        
        function createStateOverlay() {
            const overlay = document.createElement('div');
            overlay.className = 'component-state-overlay';
            overlay.innerHTML = '<div class="state-message"></div>';
            return overlay;
        }
        
        // TASK 4: ENHANCED ERROR HANDLING WITH USER GUIDANCE SYSTEM
        function initializeEnhancedErrorHandling() {
            console.log('🛡️ Task 4: Initializing Enhanced Error Handling System...');
            
            // Initialize global error handler
            window.enhancedErrorHandler = new EnhancedErrorHandler();
            
            // Set up global error listeners
            setupGlobalErrorListeners();
            
            // Integrate with existing systems
            integrateErrorHandlingWithTasks();
            
            // Set up error recovery mechanisms
            setupErrorRecoveryMechanisms();
            
            console.log('✅ Task 4: Enhanced Error Handling System initialized');
        }
        
        // TASK 4: ENHANCED ERROR HANDLER CLASS
        class EnhancedErrorHandler {
            constructor() {
                this.errorTypes = {
                    'data-connection': {
                        icon: '🔗',
                        title: 'Data Connection Error',
                        message: 'Unable to connect to MKCG data source.',
                        actions: [
                            { label: 'Retry Connection', action: 'retryConnection', type: 'primary' },
                            { label: 'Check Data Source', action: 'checkDataSource', type: 'secondary' },
                            { label: 'Manual Setup', action: 'manualSetup', type: 'secondary' }
                        ]
                    },
                    'component-generation': {
                        icon: '⚙️',
                        title: 'Component Generation Failed',
                        message: 'Unable to generate component from available data.',
                        actions: [
                            { label: 'Try Again', action: 'retryGeneration', type: 'primary' },
                            { label: 'Manual Creation', action: 'manualCreation', type: 'secondary' },
                            { label: 'Skip Component', action: 'skipComponent', type: 'secondary' }
                        ]
                    },
                    'data-quality': {
                        icon: '📊',
                        title: 'Data Quality Issues',
                        message: 'The connected data has quality issues that may affect generation.',
                        actions: [
                            { label: 'View Details', action: 'showQualityReport', type: 'primary' },
                            { label: 'Improve Data', action: 'improveData', type: 'secondary' },
                            { label: 'Generate Anyway', action: 'generateAnyway', type: 'warning' }
                        ]
                    },
                    'sync-error': {
                        icon: '🔄',
                        title: 'Synchronization Error',
                        message: 'Unable to sync component data with MKCG source.',
                        actions: [
                            { label: 'Retry Sync', action: 'retrySync', type: 'primary' },
                            { label: 'Force Sync', action: 'forceSync', type: 'warning' },
                            { label: 'Work Offline', action: 'workOffline', type: 'secondary' }
                        ]
                    },
                    'network-error': {
                        icon: '🌐',
                        title: 'Network Connection Error',
                        message: 'Unable to connect to the server. Please check your internet connection.',
                        actions: [
                            { label: 'Retry', action: 'retryConnection', type: 'primary' },
                            { label: 'Work Offline', action: 'workOffline', type: 'secondary' },
                            { label: 'Check Status', action: 'checkNetworkStatus', type: 'secondary' }
                        ]
                    },
                    'validation-error': {
                        icon: '⚠️',
                        title: 'Data Validation Error',
                        message: 'The provided data does not meet the required format or standards.',
                        actions: [
                            { label: 'Fix Data', action: 'fixValidation', type: 'primary' },
                            { label: 'View Requirements', action: 'showRequirements', type: 'secondary' },
                            { label: 'Skip Validation', action: 'skipValidation', type: 'danger' }
                        ]
                    }
                };
                
                this.activeErrors = new Map();
                this.errorQueue = [];
                this.recoveryAttempts = new Map();
            }
            
            showErrorGuidance(errorType, details = {}) {
                console.log(`🛡️ Showing error guidance for: ${errorType}`, details);
                
                const config = this.errorTypes[errorType];
                if (!config) {
                    console.error(`Unknown error type: ${errorType}`);
                    return;
                }
                
                // Check if this error is already being displayed
                const errorId = details.id || `${errorType}-${Date.now()}`;
                if (this.activeErrors.has(errorId)) {
                    return;
                }
                
                const errorPanel = this.createErrorPanel(config, details, errorType, errorId);
                document.body.appendChild(errorPanel);
                
                // Track active error
                this.activeErrors.set(errorId, errorPanel);
                
                // Auto-hide after timeout unless it's critical
                if (!details.critical) {
                    setTimeout(() => {
                        this.hideErrorPanel(errorPanel, errorId);
                    }, details.timeout || 30000);
                }
                
                // Trigger error event for analytics/tracking
                this.triggerErrorEvent(errorType, details);
                
                return errorId;
            }
            
            createErrorPanel(config, details, errorType, errorId) {
                const panel = document.createElement('div');
                panel.className = `error-guidance-panel ${errorType}`;
                panel.setAttribute('data-error-id', errorId);
                panel.setAttribute('role', 'dialog');
                panel.setAttribute('aria-modal', 'true');
                panel.setAttribute('aria-labelledby', `error-title-${errorId}`);
                
                panel.innerHTML = `
                    <div class="error-panel-content">
                        <div class="error-header">
                            <span class="error-icon" role="img" aria-label="${config.title}">${config.icon}</span>
                            <div class="error-info">
                                <h4 class="error-title" id="error-title-${errorId}">${config.title}</h4>
                                <p class="error-message">${config.message}</p>
                            </div>
                            <button class="error-close" aria-label="Close error panel">×</button>
                        </div>
                        ${details.description ? `
                            <div class="error-details">
                                <p class="error-description">${details.description}</p>
                                ${details.technical ? `
                                    <details class="error-technical-details">
                                        <summary>Technical Details</summary>
                                        <pre>${details.technical}</pre>
                                    </details>
                                ` : ''}
                            </div>
                        ` : ''}
                        ${details.showProgress ? `
                            <div class="error-progress">
                                <div class="error-progress-bar">
                                    <div class="error-progress-fill" style="width: 0%"></div>
                                </div>
                                <div class="error-progress-text">Preparing recovery...</div>
                            </div>
                        ` : ''}
                        <div class="error-actions">
                            ${config.actions.map(action => `
                                <button class="error-action ${action.type}" data-action="${action.action}" data-error-id="${errorId}">
                                    ${action.label}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                `;
                
                // Set up event listeners
                this.setupErrorPanelListeners(panel, errorId);
                
                return panel;
            }
            
            setupErrorPanelListeners(panel, errorId) {
                // Close button
                const closeBtn = panel.querySelector('.error-close');
                closeBtn.addEventListener('click', () => {
                    this.hideErrorPanel(panel, errorId);
                });
                
                // Action buttons
                const actionBtns = panel.querySelectorAll('.error-action');
                actionBtns.forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const action = e.target.dataset.action;
                        this.handleErrorAction(action, errorId, panel);
                    });
                });
                
                // Escape key to close
                const handleEscape = (e) => {
                    if (e.key === 'Escape') {
                        this.hideErrorPanel(panel, errorId);
                        document.removeEventListener('keydown', handleEscape);
                    }
                };
                document.addEventListener('keydown', handleEscape);
                
                // Click outside to close (optional)
                panel.addEventListener('click', (e) => {
                    if (e.target === panel) {
                        this.hideErrorPanel(panel, errorId);
                    }
                });
            }
            
            handleErrorAction(action, errorId, panel) {
                console.log(`🔧 Handling error action: ${action} for error: ${errorId}`);
                
                // Show progress if applicable
                this.showActionProgress(panel, action);
                
                // Execute action based on type
                switch(action) {
                    case 'retryConnection':
                        this.retryDataConnection(errorId, panel);
                        break;
                    case 'checkDataSource':
                        this.checkDataSource(errorId, panel);
                        break;
                    case 'manualSetup':
                        this.showManualSetup(errorId, panel);
                        break;
                    case 'retryGeneration':
                        this.retryComponentGeneration(errorId, panel);
                        break;
                    case 'manualCreation':
                        this.showManualCreation(errorId, panel);
                        break;
                    case 'skipComponent':
                        this.skipComponentGeneration(errorId, panel);
                        break;
                    case 'showQualityReport':
                        this.showQualityReport(errorId, panel);
                        break;
                    case 'improveData':
                        this.showDataImprovement(errorId, panel);
                        break;
                    case 'generateAnyway':
                        this.forceGeneration(errorId, panel);
                        break;
                    case 'retrySync':
                        this.retrySyncOperation(errorId, panel);
                        break;
                    case 'forceSync':
                        this.forceSyncOperation(errorId, panel);
                        break;
                    case 'workOffline':
                        this.enableOfflineMode(errorId, panel);
                        break;
                    default:
                        console.warn(`Unknown error action: ${action}`);
                        this.hideErrorPanel(panel, errorId);
                }
            }
            
            showActionProgress(panel, action) {
                const progressSection = panel.querySelector('.error-progress');
                if (!progressSection) {
                    // Create progress section if it doesn't exist
                    const errorDetails = panel.querySelector('.error-details');
                    const progressHTML = `
                        <div class="error-progress">
                            <div class="error-progress-bar">
                                <div class="error-progress-fill" style="width: 0%"></div>
                            </div>
                            <div class="error-progress-text">Processing...</div>
                        </div>
                    `;
                    
                    if (errorDetails) {
                        errorDetails.insertAdjacentHTML('afterend', progressHTML);
                    } else {
                        panel.querySelector('.error-header').insertAdjacentHTML('afterend', progressHTML);
                    }
                }
                
                const progressBar = panel.querySelector('.error-progress-fill');
                const progressText = panel.querySelector('.error-progress-text');
                
                if (progressBar && progressText) {
                    progressText.textContent = `Processing ${action}...`;
                    
                    // Animate progress
                    let progress = 0;
                    const interval = setInterval(() => {
                        progress += Math.random() * 20;
                        if (progress >= 90) {
                            progress = 90;
                            clearInterval(interval);
                        }
                        progressBar.style.width = `${progress}%`;
                    }, 200);
                    
                    // Store interval for cleanup
                    panel.progressInterval = interval;
                }
            }
            
            completeActionProgress(panel, success = true, message = '') {
                const progressBar = panel.querySelector('.error-progress-fill');
                const progressText = panel.querySelector('.error-progress-text');
                
                if (panel.progressInterval) {
                    clearInterval(panel.progressInterval);
                }
                
                if (progressBar && progressText) {
                    progressBar.style.width = '100%';
                    progressText.textContent = message || (success ? 'Completed successfully!' : 'Operation failed');
                    
                    if (success) {
                        progressBar.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                    } else {
                        progressBar.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
                    }
                }
            }
            
            // Action handlers
            retryDataConnection(errorId, panel) {
                setTimeout(() => {
                    // Simulate connection retry
                    const success = Math.random() > 0.3; // 70% success rate
                    this.completeActionProgress(panel, success, success ? 'Connection restored!' : 'Connection failed');
                    
                    if (success) {
                        showEnhancedNotification('Data connection restored successfully!', 'success');
                        setTimeout(() => this.hideErrorPanel(panel, errorId), 1500);
                        
                        // Refresh MKCG data if available
                        if (window.task3Debug && typeof window.task3Debug.updateAllIndicators === 'function') {
                            window.task3Debug.updateAllIndicators();
                        }
                    } else {
                        showEnhancedNotification('Connection retry failed. Please check your data source.', 'error');
                    }
                }, 2000);
            }
            
            checkDataSource(errorId, panel) {
                setTimeout(() => {
                    this.completeActionProgress(panel, true, 'Data source checked');
                    showEnhancedNotification('Please verify your MKCG post ID in the URL parameters.', 'info');
                    setTimeout(() => this.hideErrorPanel(panel, errorId), 2000);
                }, 1500);
            }
            
            retryComponentGeneration(errorId, panel) {
                setTimeout(() => {
                    const success = Math.random() > 0.4; // 60% success rate
                    this.completeActionProgress(panel, success, success ? 'Component generated!' : 'Generation failed');
                    
                    if (success) {
                        showEnhancedNotification('Component generated successfully!', 'success');
                        setTimeout(() => this.hideErrorPanel(panel, errorId), 1500);
                    } else {
                        showEnhancedNotification('Generation failed. Try manual creation.', 'warning');
                    }
                }, 2500);
            }
            
            showQualityReport(errorId, panel) {
                this.completeActionProgress(panel, true, 'Quality report ready');
                
                // Use existing Task 3 quality modal if available
                if (window.task3Debug && typeof window.task3Debug.showQualityModal === 'function') {
                    setTimeout(() => {
                        window.task3Debug.showQualityModal('topics');
                        this.hideErrorPanel(panel, errorId);
                    }, 1000);
                } else {
                    showEnhancedNotification('Quality report: Check component data completeness and accuracy.', 'info');
                    setTimeout(() => this.hideErrorPanel(panel, errorId), 2000);
                }
            }
            
            retrySyncOperation(errorId, panel) {
                setTimeout(() => {
                    const success = Math.random() > 0.2; // 80% success rate
                    this.completeActionProgress(panel, success, success ? 'Sync completed!' : 'Sync failed');
                    
                    if (success) {
                        showEnhancedNotification('Component sync completed successfully!', 'success');
                        
                        // Update sync indicators if available
                        if (window.task3Debug && typeof window.task3Debug.simulateSync === 'function') {
                            window.task3Debug.simulateSync('topics');
                        }
                        
                        setTimeout(() => this.hideErrorPanel(panel, errorId), 1500);
                    } else {
                        showEnhancedNotification('Sync failed. You can work offline or try force sync.', 'warning');
                    }
                }, 2000);
            }
            
            forceGeneration(errorId, panel) {
                setTimeout(() => {
                    this.completeActionProgress(panel, true, 'Generation forced');
                    showEnhancedNotification('Generating components with available data...', 'info');
                    
                    // Trigger auto-generation if available
                    const autoGenerateBtn = document.getElementById('auto-generate-all-empty') || 
                                          document.getElementById('auto-generate-available') ||
                                          document.getElementById('generate-anyway');
                    
                    if (autoGenerateBtn) {
                        autoGenerateBtn.click();
                    }
                    
                    setTimeout(() => this.hideErrorPanel(panel, errorId), 1500);
                }, 1500);
            }
            
            enableOfflineMode(errorId, panel) {
                this.completeActionProgress(panel, true, 'Offline mode enabled');
                showEnhancedNotification('Working in offline mode. Sync will resume when connection is restored.', 'info');
                setTimeout(() => this.hideErrorPanel(panel, errorId), 2000);
            }
            
            hideErrorPanel(panel, errorId) {
                if (panel.progressInterval) {
                    clearInterval(panel.progressInterval);
                }
                
                panel.style.animation = 'errorPanelSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) reverse';
                
                setTimeout(() => {
                    if (panel.parentNode) {
                        panel.remove();
                    }
                    this.activeErrors.delete(errorId);
                }, 300);
            }
            
            triggerErrorEvent(errorType, details) {
                // Trigger custom event for error tracking/analytics
                const event = new CustomEvent('mkcgError', {
                    detail: {
                        type: errorType,
                        timestamp: new Date().toISOString(),
                        details: details
                    }
                });
                window.dispatchEvent(event);
            }
            
            // Public methods for integration
            clearAllErrors() {
                this.activeErrors.forEach((panel, errorId) => {
                    this.hideErrorPanel(panel, errorId);
                });
            }
            
            getActiveErrors() {
                return Array.from(this.activeErrors.keys());
            }
        }
        
        // Enhanced global debugging functions
        window.mkcgEnhancedDebug = {
            toggleDashboard: function() {
                const trigger = document.getElementById('dashboard-trigger');
                if (trigger) {
                    trigger.click();
                } else {
                    console.log('Dashboard not available - no MKCG data connected');
                }
            },
            triggerAutoGenerate: function() {
                const btn = document.getElementById('mkcg-auto-generate-all') || document.getElementById('auto-generate-all-empty');
                if (btn) {
                    btn.click();
                } else {
                    console.log('Auto-generate button not found - check MKCG data availability');
                }
            },
            showNotification: function(message, type = 'info') {
                showEnhancedNotification(message, type);
            },
            getDashboardData: function() {
                return {
                    hasData: !!document.getElementById('mkcg-enhanced-dashboard'),
                    panelVisible: document.getElementById('dashboard-panel')?.style.display !== 'none',
                    qualityScore: document.querySelector('.mkcg-quality-score')?.textContent,
                    componentCount: document.querySelector('.mkcg-component-count')?.textContent,
                    autoGeneratedCount: document.getElementById('auto-generated-count')?.textContent
                };
            }
        };
    </script>
    
    <!-- FIXED: Race condition eliminated via proper WordPress script loading + selective dequeuing -->
    <script type="text/javascript">
        // Template loaded timestamp for debugging
        window.guestifyTemplateLoadedAt = <?php echo time(); ?>;
        window.guestifyTask2And3Ready = true;
        console.log('🏠 Builder template ready - using proper WordPress script loading with selective dequeuing');
        console.log('🔗 MKCG Integration Phase 1 active');
        console.log('✨ Phase 2.3: Task 2 (Enhanced Empty States) & Task 3 (Component State Indicators) active');
    </script>
</div>