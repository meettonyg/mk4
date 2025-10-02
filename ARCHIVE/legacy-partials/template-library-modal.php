<div class="library-modal" id="template-library-modal">
    <div class="library">
        <div class="library__header">
            <div class="library__title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14,2 14,8 20,8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
                Template Library
            </div>
            <div class="library__controls">
                <button class="library__close" id="close-template-library">&times;</button>
            </div>
        </div>
        
        <div class="library__content">
            <div class="library__main">
                <div class="library__section-header">
                    <h3>Preset Templates</h3>
                    <p>Choose a template to get started quickly</p>
                </div>
                
                <div class="templates-grid" id="template-grid">
                    <div class="template-card" data-template="professional-speaker">
                        <div class="template-preview">
                            <div class="template-preview-content">
                                <div class="preview-hero"></div>
                                <div class="preview-bio"></div>
                                <div class="preview-topics"></div>
                            </div>
                        </div>
                        <div class="template-info">
                            <h4>Professional Speaker</h4>
                            <p>Complete speaker media kit with bio, topics, and social links</p>
                        </div>
                    </div>
                    
                    <div class="template-card" data-template="podcast-host">
                        <div class="template-preview">
                            <div class="template-preview-content">
                                <div class="preview-hero"></div>
                                <div class="preview-stats"></div>
                                <div class="preview-social"></div>
                            </div>
                        </div>
                        <div class="template-info">
                            <h4>Podcast Host</h4>
                            <p>Media kit focused on podcasting with stats and social presence</p>
                        </div>
                    </div>
                    
                    <div class="template-card" data-template="minimal-professional">
                        <div class="template-preview">
                            <div class="template-preview-content">
                                <div class="preview-hero"></div>
                                <div class="preview-bio"></div>
                            </div>
                        </div>
                        <div class="template-info">
                            <h4>Minimal Professional</h4>
                            <p>Clean, simple layout with essential components only</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="library__footer">
            <button class="btn btn--secondary" id="cancel-template-button">Cancel</button>
            <button class="btn btn--primary" id="load-template-button">Load Template</button>
        </div>
    </div>
</div>