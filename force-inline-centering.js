// Direct Style Application - Bypass CSS loading issues
// Run this in console to force centering styles directly on elements

(function forceEmptyStateCentering() {
    console.log('Applying direct inline styles to force centering...');
    
    // Get all required elements
    const preview = document.querySelector('.preview');
    const previewContainer = document.getElementById('preview-container');
    const mediaKit = document.getElementById('media-kit-preview');
    const emptyState = document.getElementById('empty-state');
    
    if (!preview || !previewContainer || !mediaKit || !emptyState) {
        console.error('Required elements not found!');
        return;
    }
    
    // Apply styles directly to elements
    
    // 1. Preview area
    preview.style.cssText = `
        flex: 1;
        margin-top: 48px;
        height: calc(100vh - 48px);
        overflow: auto;
        background: #1a1a1a;
        position: relative;
        display: flex;
        flex-direction: column;
    `;
    
    // 2. Preview container
    previewContainer.style.cssText = `
        max-width: 900px;
        margin: 30px auto;
        background: white;
        border-radius: 10px;
        box-shadow: 0 15px 35px rgba(0,0,0,0.3);
        overflow: hidden;
        transition: all 0.3s ease;
        min-height: 500px;
        display: flex;
        flex-direction: column;
        flex: 1;
        width: 100%;
    `;
    
    // 3. Media kit container - CRITICAL for centering
    mediaKit.style.cssText = `
        color: #1a1a1a;
        position: relative;
        background: white;
        display: flex;
        flex-direction: column;
        flex: 1;
        width: 100%;
        min-height: 500px;
        justify-content: center;
        align-items: center;
    `;
    
    // 4. Empty state
    emptyState.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 60px 20px;
        width: 100%;
        max-width: 600px;
        margin: 0 auto;
    `;
    
    // 5. Style the empty state contents
    const title = emptyState.querySelector('.empty-state__title');
    if (title) {
        title.style.cssText = `
            font-size: 24px;
            font-weight: 600;
            color: #1e293b;
            margin: 0 0 12px 0;
        `;
    }
    
    const text = emptyState.querySelector('.empty-state__text');
    if (text) {
        text.style.cssText = `
            font-size: 16px;
            color: #64748b;
            margin: 0 0 32px 0;
            max-width: 400px;
        `;
    }
    
    const actions = emptyState.querySelector('.empty-state__actions');
    if (actions) {
        actions.style.cssText = `
            display: flex;
            gap: 16px;
            align-items: center;
            justify-content: center;
        `;
    }
    
    // 6. Style buttons
    const buttons = emptyState.querySelectorAll('.btn');
    buttons.forEach(btn => {
        const baseStyles = `
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 20px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
            text-decoration: none;
        `;
        
        if (btn.classList.contains('btn--primary')) {
            btn.style.cssText = baseStyles + `
                background: #0ea5e9;
                color: white;
            `;
        } else if (btn.classList.contains('btn--secondary')) {
            btn.style.cssText = baseStyles + `
                background: white;
                color: #64748b;
                border: 1px solid #e2e8f0;
            `;
        }
    });
    
    console.log('✅ Direct styles applied successfully!');
    
    // Verify positioning
    const mediaKitRect = mediaKit.getBoundingClientRect();
    const emptyStateRect = emptyState.getBoundingClientRect();
    
    console.log('Layout verification:');
    console.log('- Media kit height:', mediaKitRect.height);
    console.log('- Empty state centered:', {
        horizontal: Math.abs((emptyStateRect.left + emptyStateRect.width/2) - (mediaKitRect.left + mediaKitRect.width/2)) < 5,
        vertical: Math.abs((emptyStateRect.top + emptyStateRect.height/2) - (mediaKitRect.top + mediaKitRect.height/2)) < 5
    });
    
    // Add a listener to maintain styles when components are added/removed
    const observer = new MutationObserver((mutations) => {
        const hasComponents = mediaKit.querySelector('[data-component-id]');
        if (!hasComponents && !mediaKit.classList.contains('has-components')) {
            // Re-apply centering when empty
            mediaKit.style.justifyContent = 'center';
            mediaKit.style.alignItems = 'center';
        } else {
            // Normal layout when has components
            mediaKit.style.justifyContent = 'flex-start';
            mediaKit.style.alignItems = 'stretch';
        }
    });
    
    observer.observe(mediaKit, { childList: true, subtree: true });
    console.log('✅ Style observer attached to maintain layout');
})();

// Run it
console.log('Empty state centering fix loaded. The content should now be centered.');