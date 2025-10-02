<?php
/**
 * Sidebar Tabs
 * Contains the tab navigation and content panels for the Media Kit Builder sidebar
 */
?>

<div class="sidebar__tabs">
    <div class="tabs">
        <button class="tab tab--active" data-tab="components">Components</button>
        <button class="tab" data-tab="layout">Layout</button>
        <button class="tab" data-tab="design">Design</button>
    </div>
    
    <div class="tab-content tab-content--active" data-tab-content="components">
        <div class="section">
            <div class="section__header">
                <h3>Components</h3>
                <button class="btn btn--sm btn--primary" data-action="add-component">
                    <span>Add Component</span>
                </button>
            </div>
            <div class="component-list" id="component-list">
                <!-- Components will be populated here by JavaScript -->
            </div>
        </div>
    </div>
    
    <div class="tab-content" data-tab-content="layout">
        <div class="section">
            <div class="section__header">
                <h3>Section Layout</h3>
            </div>
            
            <div class="layout-options">
                <div class="layout-option layout-option--active" data-layout="full-width">
                    <div class="layout-icon">
                        <div class="layout-block layout-block--full"></div>
                    </div>
                    <span>Full Width</span>
                </div>
                
                <div class="layout-option" data-layout="two-column">
                    <div class="layout-icon">
                        <div class="layout-block layout-block--half"></div>
                        <div class="layout-block layout-block--half"></div>
                    </div>
                    <span>Two Column</span>
                </div>
                
                <div class="layout-option" data-layout="sidebar">
                    <div class="layout-icon">
                        <div class="layout-block layout-block--main"></div>
                        <div class="layout-block layout-block--sidebar"></div>
                    </div>
                    <span>Main + Sidebar</span>
                </div>
                
                <div class="layout-option" data-layout="three-column">
                    <div class="layout-icon">
                        <div class="layout-block layout-block--third"></div>
                        <div class="layout-block layout-block--third"></div>
                        <div class="layout-block layout-block--third"></div>
                    </div>
                    <span>Three Column</span>
                </div>
            </div>
            
            <div class="section-actions">
                <button class="btn btn--primary btn--full" id="add-section-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="12" y1="8" x2="12" y2="16"></line>
                        <line x1="8" y1="12" x2="16" y2="12"></line>
                    </svg>
                    Add Section
                </button>
                
                <button class="btn btn--secondary btn--full" id="use-template-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="7" height="7"></rect>
                        <rect x="14" y="3" width="7" height="7"></rect>
                        <rect x="14" y="14" width="7" height="7"></rect>
                        <rect x="3" y="14" width="7" height="7"></rect>
                    </svg>
                    Use Template
                </button>
                
                <button class="btn btn--outline btn--full section-btn--disabled" id="duplicate-section-btn" disabled>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    Duplicate Section
                </button>
            </div>
        </div>
        
        <div class="section">
            <div class="section__header">
                <h3>Global Settings</h3>
            </div>
            
            <div class="form-group">
                <label>Max Width</label>
                <select id="global-max-width" class="form-control">
                    <option value="100%">Full Width (100%)</option>
                    <option value="1400px">Extra Large (1400px)</option>
                    <option value="1200px" selected>Large (1200px)</option>
                    <option value="960px">Medium (960px)</option>
                    <option value="720px">Small (720px)</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>Section Spacing</label>
                <select id="global-spacing" class="form-control">
                    <option value="0px">None</option>
                    <option value="20px">Small</option>
                    <option value="40px" selected>Medium</option>
                    <option value="60px">Large</option>
                    <option value="80px">Extra Large</option>
                </select>
            </div>
        </div>
    </div>
    
    <div class="tab-content" data-tab-content="design">
        <div class="section">
            <div class="section__header">
                <h3>Design Panel</h3>
            </div>
            
            <div class="design-panel-content" id="design-panel-content">
                <!-- Design panel content will be populated here -->
                <div class="empty-panel">
                    <p>Select a component to edit its design</p>
                </div>
            </div>
        </div>
    </div>
</div>
