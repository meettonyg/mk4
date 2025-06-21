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
                <div class="components-grid" id="component-grid">
                    <!-- Loading placeholder - will be replaced by JavaScript -->
                    <div class="component-grid-loading" id="component-grid-loading">
                        <div class="loading-spinner">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 12a9 9 0 11-6.219-8.56"/>
                            </svg>
                        </div>
                        <p>Loading components...</p>
                    </div>
                    <!-- Component cards will be populated dynamically by JavaScript -->
                </div>
            </div>
        </div>
        
        <div class="library__footer">
            <button class="btn btn--secondary" id="cancel-component-button">Cancel</button>
            <button class="btn btn--primary" id="add-component-button">Add Selected</button>
        </div>
    </div>
</div>