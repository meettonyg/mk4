<div class="builder">
    <div class="toolbar">
        <div class="toolbar__section toolbar__section--left">
            <div class="toolbar__logo">Guestify</div>
            <div class="toolbar__guest-name">Editing: Daniel Jackson's Media Kit</div>
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
                <div class="hero editable-element editable-element--selected" data-element="hero" data-component="hero">
                    <div class="element-controls">
                        <button class="control-btn" title="Move Up">↑</button>
                        <button class="control-btn" title="Duplicate">⧉</button>
                        <button class="control-btn" title="Delete">×</button>
                    </div>
                    <div class="hero__avatar">
                        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='50' font-size='50' text-anchor='middle' x='50' fill='%2364748b'%3EDJ%3C/text%3E%3C/svg%3E" alt="Profile Avatar">
                    </div>
                    <h1 class="hero__name" contenteditable="true" id="preview-name">Daniel Jackson</h1>
                    <div class="hero__title" contenteditable="true" id="preview-title">Astral Engineer</div>
                    <p class="hero__bio" contenteditable="true" id="preview-bio">Expert in ancient technology and quantum physics. Leading researcher in astral projection and interdimensional travel with over 15 years of experience.</p>
                </div>

                <div class="drop-zone drop-zone--empty" data-zone="1"></div>

                <div class="content-section editable-element" data-element="topics" data-component="topics">
                    <div class="element-controls">
                        <button class="control-btn" title="Move Up">↑</button>
                        <button class="control-btn" title="Move Down">↓</button>
                        <button class="control-btn" title="Duplicate">⧉</button>
                        <button class="control-btn" title="Delete">×</button>
                    </div>
                    <h2 class="section-title" contenteditable="true">Speaking Topics</h2>
                    <div class="topics-grid">
                        <div class="topic-item" contenteditable="true">Quantum Physics</div>
                        <div class="topic-item" contenteditable="true">Space Exploration</div>
                        <div class="topic-item" contenteditable="true">Ancient Civilizations</div>
                        <div class="topic-item" contenteditable="true">Technology Innovation</div>
                    </div>
                </div>

                <div class="drop-zone drop-zone--empty" data-zone="2"></div>

                <div class="social-links editable-element" data-element="social" data-component="social">
                    <div class="element-controls">
                        <button class="control-btn" title="Move Up">↑</button>
                        <button class="control-btn" title="Move Down">↓</button>
                        <button class="control-btn" title="Duplicate">⧉</button>
                        <button class="control-btn" title="Delete">×</button>
                    </div>
                    <a href="#" class="social-link" title="Twitter">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                        </svg>
                    </a>
                    <a href="#" class="social-link" title="LinkedIn">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                            <circle cx="4" cy="4" r="2"/>
                        </svg>
                    </a>
                    <a href="#" class="social-link" title="Instagram">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                            <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                        </svg>
                    </a>
                </div>

                <div class="drop-zone drop-zone--empty" data-zone="3"></div>
            </div>
        </div>
    </div>

    <?php include plugin_dir_path(__FILE__) . '../partials/global-settings-modal.php'; ?>
    <?php include plugin_dir_path(__FILE__) . '../partials/export-modal.php'; ?>
    <?php include plugin_dir_path(__FILE__) . '../partials/component-library-modal.php'; ?>
</div>