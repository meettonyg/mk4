<div id="layout-tab" class="tab-content">
    <div class="sidebar__section-title">Section Layouts</div>
    <div class="layout-options">
        <div class="layout-option layout-option--active" data-layout="full-width">
            <div class="layout-preview layout-preview--full-width"></div>
            <div class="layout-name">Full Width</div>
        </div>
        <div class="layout-option" data-layout="two-column">
            <div class="layout-preview layout-preview--two-column"></div>
            <div class="layout-name">Two Column</div>
        </div>
        <div class="layout-option" data-layout="sidebar">
            <div class="layout-preview layout-preview--sidebar"></div>
            <div class="layout-name">Main + Sidebar</div>
        </div>
        <div class="layout-option" data-layout="three-column">
            <div class="layout-preview layout-preview--three-column"></div>
            <div class="layout-name">Three Column</div>
        </div>
    </div>
    
    <div class="section-controls">
        <button class="section-btn" id="add-section-btn">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Section
        </button>
        <button class="section-btn" id="duplicate-section-btn">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            Duplicate
        </button>
    </div>

    <div class="sidebar__section-title" style="margin-top: 24px;">Global Settings</div>
    <div class="form-group">
        <label class="form-label">Max Width</label>
        <input type="text" class="form-input" value="900px" id="global-max-width">
    </div>
    <div class="form-group">
        <label class="form-label">Section Spacing</label>
        <input type="text" class="form-input" value="30px" id="global-spacing">
    </div>
</div>