<div class="builder">
    <div class="toolbar">
        <div class="toolbar__section toolbar__section--left">
            <div class="toolbar__logo">Guestify</div>
            <div class="toolbar__guest-name">Editing: Daniel Jackson's Media Kit</div>
            <?php
            // PHASE 1: MKCG Data Source Indicator
            $post_id = 0;
            $mkcg_data = null;
            
            // Get post ID from URL parameters
            if (isset($_GET['post_id']) && is_numeric($_GET['post_id'])) {
                $post_id = intval($_GET['post_id']);
            } elseif (isset($_GET['p']) && is_numeric($_GET['p'])) {
                $post_id = intval($_GET['p']);
            } elseif (isset($_GET['page_id']) && is_numeric($_GET['page_id'])) {
                $post_id = intval($_GET['page_id']);
            }
            
            // Check if we have MKCG data for this post
            if ($post_id > 0) {
                require_once GUESTIFY_PLUGIN_DIR . 'includes/class-gmkb-mkcg-data-integration.php';
                $mkcg_integration = GMKB_MKCG_Data_Integration::get_instance();
                $availability = $mkcg_integration->get_data_availability($post_id);
                $has_mkcg_data = array_filter($availability);
                
                if (!empty($has_mkcg_data)) {
                    $post_title = get_the_title($post_id) ?: "Post #{$post_id}";
                    ?>
                    <div class="toolbar__mkcg-indicator" id="mkcg-data-indicator">
                        <div class="mkcg-indicator__content">
                            <span class="mkcg-indicator__icon">🔗</span>
                            <div class="mkcg-indicator__details">
                                <div class="mkcg-indicator__title">Data Connected</div>
                                <div class="mkcg-indicator__subtitle">From: <?php echo esc_html($post_title); ?></div>
                            </div>
                            <div class="mkcg-indicator__badges">
                                <?php if ($availability['has_topics']): ?>
                                    <span class="mkcg-badge mkcg-badge--topics">Topics</span>
                                <?php endif; ?>
                                <?php if ($availability['has_biography']): ?>
                                    <span class="mkcg-badge mkcg-badge--biography">Bio</span>
                                <?php endif; ?>
                                <?php if ($availability['has_authority_hook']): ?>
                                    <span class="mkcg-badge mkcg-badge--authority">Authority</span>
                                <?php endif; ?>
                                <?php if ($availability['has_questions']): ?>
                                    <span class="mkcg-badge mkcg-badge--questions">Questions</span>
                                <?php endif; ?>
                                <?php if ($availability['has_offers']): ?>
                                    <span class="mkcg-badge mkcg-badge--offers">Offers</span>
                                <?php endif; ?>
                                <?php if ($availability['has_social_media']): ?>
                                    <span class="mkcg-badge mkcg-badge--social">Social</span>
                                <?php endif; ?>
                            </div>
                        </div>
                        <button class="mkcg-indicator__close" title="Hide indicator">×</button>
                    </div>
                    <?php
                }
            }
            ?>
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
                <!-- Initial empty state with welcome message -->
                <div class="empty-state" id="empty-state">
                    <div class="empty-state__icon">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="9" y1="9" x2="15" y2="9"></line>
                            <line x1="9" y1="13" x2="15" y2="13"></line>
                            <line x1="9" y1="17" x2="11" y2="17"></line>
                        </svg>
                    </div>
                    <h2 class="empty-state__title">Start Building Your Media Kit</h2>
                    <p class="empty-state__text">Add components from the sidebar or choose a template to get started.</p>
                    
                    <?php
                    // PHASE 1: Show MKCG auto-generation option if data is available
                    $show_mkcg_option = false;
                    if ($post_id > 0 && !empty($has_mkcg_data)) {
                        $show_mkcg_option = true;
                        $available_count = count($has_mkcg_data);
                    }
                    ?>
                    
                    <div class="empty-state__actions">
                        <?php if ($show_mkcg_option): ?>
                            <button class="btn btn--primary btn--mkcg" id="auto-generate-from-mkcg">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                                </svg>
                                Auto-Generate from Data
                            </button>
                            <button class="btn btn--secondary" id="add-first-component">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                Add Component
                            </button>
                        <?php else: ?>
                            <button class="btn btn--primary" id="add-first-component">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                Add Component
                            </button>
                        <?php endif; ?>
                        
                        <button class="btn btn--secondary" id="load-template">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                            Load Template
                        </button>
                    </div>
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
            </div>
        </div>
    </div>

    <?php include plugin_dir_path(__FILE__) . '../partials/global-settings-modal.php'; ?>
    <?php include plugin_dir_path(__FILE__) . '../partials/export-modal.php'; ?>
    <?php include plugin_dir_path(__FILE__) . '../partials/component-library-modal.php'; ?>
    <?php include plugin_dir_path(__FILE__) . '../partials/template-library-modal.php'; ?>

    <!-- PHASE 1: MKCG Integration Styles -->
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
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
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
    </style>
    
    <!-- PHASE 1: MKCG Integration JavaScript -->
    <script type="text/javascript">
        // MKCG Integration functionality
        document.addEventListener('DOMContentLoaded', function() {
            // Auto-generate button handler
            const autoGenerateBtn = document.getElementById('auto-generate-from-mkcg');
            if (autoGenerateBtn) {
                autoGenerateBtn.addEventListener('click', function() {
                    console.log('🔗 Auto-generating components from MKCG data...');
                    
                    // Show loading state
                    const originalText = this.innerHTML;
                    this.innerHTML = `
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="animate-spin">
                            <path d="M21 12a9 9 0 11-6.219-8.56"/>
                        </svg>
                        Generating...
                    `;
                    this.disabled = true;
                    
                    // Wait for component manager to be available
                    const waitForManager = () => {
                        if (window.enhancedComponentManager && typeof window.enhancedComponentManager.autoGenerateFromMKCG === 'function') {
                            try {
                                const addedComponents = window.enhancedComponentManager.autoGenerateFromMKCG(true);
                                
                                if (addedComponents.length > 0) {
                                    console.log(`🎉 Successfully auto-generated ${addedComponents.length} components:`, addedComponents);
                                    
                                    // Hide empty state
                                    const emptyState = document.getElementById('empty-state');
                                    if (emptyState) {
                                        emptyState.style.display = 'none';
                                    }
                                } else {
                                    console.warn('No components could be auto-generated from MKCG data');
                                    alert('No components could be generated from the available data. Try adding components manually.');
                                }
                            } catch (error) {
                                console.error('Error during auto-generation:', error);
                                alert('Error generating components. Please try again or add components manually.');
                            }
                            
                            // Restore button
                            this.innerHTML = originalText;
                            this.disabled = false;
                        } else {
                            // Retry after 100ms
                            setTimeout(waitForManager, 100);
                        }
                    };
                    
                    waitForManager();
                });
            }
            
            // MKCG indicator close button
            const mkcgIndicator = document.getElementById('mkcg-data-indicator');
            if (mkcgIndicator) {
                const closeBtn = mkcgIndicator.querySelector('.mkcg-indicator__close');
                if (closeBtn) {
                    closeBtn.addEventListener('click', function() {
                        mkcgIndicator.style.animation = 'slideInDown 0.3s ease-out reverse';
                        setTimeout(() => {
                            mkcgIndicator.style.display = 'none';
                        }, 300);
                    });
                }
            }
            
            console.log('🔗 MKCG Integration UI ready');
        });
        
        // Global MKCG debugging functions
        window.mkcgUIDebug = {
            showIndicator: function() {
                const indicator = document.getElementById('mkcg-data-indicator');
                if (indicator) {
                    indicator.style.display = 'flex';
                    indicator.style.animation = 'slideInDown 0.3s ease-out';
                }
            },
            hideIndicator: function() {
                const indicator = document.getElementById('mkcg-data-indicator');
                if (indicator) {
                    indicator.style.display = 'none';
                }
            },
            triggerAutoGenerate: function() {
                const btn = document.getElementById('auto-generate-from-mkcg');
                if (btn) {
                    btn.click();
                } else {
                    console.log('Auto-generate button not found - no MKCG data available');
                }
            }
        };
    </script>
    
    <!-- FIXED: Race condition eliminated via proper WordPress script loading + selective dequeuing -->
    <script type="text/javascript">
        // Template loaded timestamp for debugging
        window.guestifyTemplateLoadedAt = <?php echo time(); ?>;
        console.log('🏠 Builder template ready - using proper WordPress script loading with selective dequeuing');
        console.log('🔗 MKCG Integration Phase 1 active');
    </script>
</div>