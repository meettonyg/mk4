<div id="design-tab" class="tab-content">
    <div class="element-editor" id="element-editor">
        <div class="editor-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Hero Section
        </div>
        <div class="editor-subtitle">Click on any element to edit its properties</div>
        
        <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" class="form-input" value="Daniel Jackson" id="hero-name">
        </div>
        
        <div class="form-group">
            <label class="form-label">Professional Title</label>
            <input type="text" class="form-input" value="Astral Engineer" id="hero-title">
        </div>
        
        <div class="form-group">
            <label class="form-label">Bio Description</label>
            <textarea class="form-input form-textarea" id="hero-bio">Expert in ancient technology and quantum physics. Leading researcher in astral projection and interdimensional travel with over 15 years of experience.</textarea>
        </div>
        
        <div class="form-group">
            <label class="form-label">Background Color</label>
            <div class="color-picker">
                <input type="color" class="color-input" value="#f8fafc" id="hero-bg-color">
                <input type="text" class="form-input" value="#f8fafc" id="hero-bg-text" style="flex: 1;">
            </div>
        </div>

        <div class="form-group">
            <label class="form-label">Text Color</label>
            <div class="color-picker">
                <input type="color" class="color-input" value="#1e293b" id="hero-text-color">
                <input type="text" class="form-input" value="#1e293b" id="hero-text-text" style="flex: 1;">
            </div>
        </div>
    </div>

    <div class="theme-controls-section">
        <button class="global-settings-btn" id="global-settings-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            Global Theme Settings
        </button>
    </div>
</div>