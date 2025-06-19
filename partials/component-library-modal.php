<div class="library-modal" id="component-library-overlay">
    <div class="library">
        <div class="library__header">
            <div class="library__title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14,2 14,8 20,8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10,9 9,9 8,9"></polyline>
                </svg>
                Component Library
            </div>
            <div class="library__controls">
                <select class="library__filter" id="category-filter">
                    <option value="all">All Categories</option>
                    <option value="hero">Hero Sections</option>
                    <option value="biography">Biography</option>
                    <option value="topics">Topics</option>
                    <option value="social">Social Links</option>
                    <option value="media">Media</option>
                    <option value="contact">Contact</option>
                    <option value="stats">Statistics</option>
                </select>
                <div class="library__search">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <input type="text" placeholder="Search components..." id="component-search">
                </div>
                <button class="library__close" id="close-library">&times;</button>
            </div>
        </div>
        
        <div class="library__content">
            <div class="library__sidebar">
                <ul class="category-list">
                    <li class="category-item category-item--active" data-category="all">All Components</li>
                    <li class="category-item" data-category="hero">Hero Sections</li>
                    <li class="category-item" data-category="biography">Biography</li>
                    <li class="category-item" data-category="topics">Topics & Skills</li>
                    <li class="category-item" data-category="social">Social Links</li>
                    <li class="category-item" data-category="media">Media & Gallery</li>
                    <li class="category-item" data-category="contact">Contact Info</li>
                    <li class="category-item" data-category="stats">Statistics</li>
                </ul>
            </div>
            
            <div class="library__main">
                <div class="library__section-header">
                    <h3>Free Components</h3>
                    <p>Essential components included with your Guestify account</p>
                </div>
                
                <div class="components-grid" id="component-grid">
                    <div class="component-card" data-category="hero" data-component="hero">
                        <div class="component-preview preview-hero">
                            <div class="mini-avatar"></div>
                            <div class="mini-name">John Doe</div>
                            <div class="mini-title">Professional Title</div>
                        </div>
                        <div class="component-info">
                            <h4>Hero Section</h4>
                            <p>Profile section with name, title and bio</p>
                        </div>
                    </div>
                    
                    <div class="component-card" data-category="biography" data-component="biography">
                        <div class="component-preview preview-bio">
                            <div class="mini-lines"></div>
                            <div class="mini-lines"></div>
                            <div class="mini-lines"></div>
                            <div class="mini-lines"></div>
                        </div>
                        <div class="component-info">
                            <h4>Biography</h4>
                            <p>Full-width text biography section</p>
                        </div>
                    </div>
                    
                    <div class="component-card" data-category="topics" data-component="topics">
                        <div class="component-preview preview-topics">
                            <div class="mini-topic"></div>
                            <div class="mini-topic"></div>
                            <div class="mini-topic"></div>
                            <div class="mini-topic"></div>
                        </div>
                        <div class="component-info">
                            <h4>Topics</h4>
                            <p>Grid layout for speaking topics</p>
                        </div>
                    </div>
                    
                    <div class="component-card" data-category="social" data-component="social">
                        <div class="component-preview preview-social">
                            <div class="mini-social"></div>
                            <div class="mini-social"></div>
                            <div class="mini-social"></div>
                        </div>
                        <div class="component-info">
                            <h4>Social Links</h4>
                            <p>Social media icon links</p>
                        </div>
                    </div>

                    <div class="component-card" data-category="stats" data-component="stats">
                        <div class="component-preview preview-stats">
                            <div class="mini-stat">
                                <div class="mini-stat-number">1.2M</div>
                                <div class="mini-stat-label">Followers</div>
                            </div>
                            <div class="mini-stat">
                                <div class="mini-stat-number">150+</div>
                                <div class="mini-stat-label">Shows</div>
                            </div>
                        </div>
                        <div class="component-info">
                            <h4>Statistics</h4>
                            <p>Display key metrics and numbers</p>
                        </div>
                    </div>

                    <div class="component-card" data-category="media" data-component="logo-grid">
                        <div class="component-preview" style="background: #f8fafc; padding: 8px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
                            <div style="background: #e2e8f0; aspect-ratio: 1; border-radius: 2px;"></div>
                            <div style="background: #e2e8f0; aspect-ratio: 1; border-radius: 2px;"></div>
                            <div style="background: #e2e8f0; aspect-ratio: 1; border-radius: 2px;"></div>
                            <div style="background: #e2e8f0; aspect-ratio: 1; border-radius: 2px;"></div>
                        </div>
                        <div class="component-info">
                            <h4>Logo Grid</h4>
                            <p>Showcase client and partner logos</p>
                        </div>
                    </div>
                </div>
                
                <div class="library__section-header" style="margin-top: 30px;">
                    <h3>Premium Components</h3>
                    <p>Advanced components available with Guestify Pro</p>
                </div>
                
                <div class="components-grid" id="premium-components">
                    <div class="component-card component-card--premium" data-category="media" data-component="video-intro">
                        <div class="component-preview" style="background: #1e293b; display: flex; align-items: center; justify-content: center;">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" stroke-width="2">
                                <polygon points="5,3 19,12 5,21"></polygon>
                            </svg>
                        </div>
                        <div class="component-info">
                            <h4>Video Introduction</h4>
                            <p>Embedded video player for introductions</p>
                        </div>
                    </div>
                    
                    <div class="component-card component-card--premium" data-category="media" data-component="image-gallery">
                        <div class="component-preview" style="background: #f8fafc; padding: 6px; display: grid; grid-template-columns: 1fr 1fr; gap: 3px;">
                            <div style="background: #cbd5e1; aspect-ratio: 1; border-radius: 2px;"></div>
                            <div style="background: #cbd5e1; aspect-ratio: 1; border-radius: 2px;"></div>
                            <div style="background: #cbd5e1; aspect-ratio: 1; border-radius: 2px;"></div>
                            <div style="background: #cbd5e1; aspect-ratio: 1; border-radius: 2px;"></div>
                        </div>
                        <div class="component-info">
                            <h4>Image Gallery</h4>
                            <p>Professional photo gallery with lightbox</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="library__footer">
            <button class="btn btn--secondary" id="cancel-component-button">Cancel</button>
            <button class="btn btn--primary" id="add-component-button">Add Selected</button>
        </div>
    </div>
</div>