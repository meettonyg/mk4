// Emergency CSS Fix for Empty State Centering
// Run this in console to inject critical styles

(function fixEmptyStateCentering() {
    const style = document.createElement('style');
    style.id = 'empty-state-css-fix';
    
    // Remove existing if present
    const existing = document.getElementById('empty-state-css-fix');
    if (existing) existing.remove();
    
    style.textContent = `
        /* Ensure preview has proper height */
        .preview {
            display: flex !important;
            flex-direction: column !important;
            height: calc(100vh - 48px) !important;
        }
        
        /* Preview container must be flex and fill space */
        .preview__container,
        #preview-container {
            display: flex !important;
            flex-direction: column !important;
            flex: 1 !important;
            background: white !important;
        }
        
        /* Media kit must fill and center */
        #media-kit-preview,
        .media-kit {
            display: flex !important;
            flex-direction: column !important;
            flex: 1 !important;
            width: 100% !important;
            background: white !important;
            color: #1a1a1a !important;
        }
        
        /* Center when no components */
        #media-kit-preview:not(.has-components),
        .media-kit:not(.has-components) {
            justify-content: center !important;
            align-items: center !important;
        }
        
        /* Reset when has components */
        #media-kit-preview.has-components,
        .media-kit.has-components {
            justify-content: flex-start !important;
            align-items: stretch !important;
        }
        
        /* Ensure empty state is properly styled */
        .empty-state {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            text-align: center !important;
            padding: 60px 20px !important;
            width: 100% !important;
            max-width: 600px !important;
            margin: 0 auto !important;
        }
        
        /* Hide drop zones */
        #media-kit-preview:not(.has-components) .drop-zone {
            display: none !important;
        }
        
        /* Style fixes for visibility */
        .empty-state__title {
            color: #1e293b !important;
            font-size: 24px !important;
            font-weight: 600 !important;
        }
        
        .empty-state__text {
            color: #64748b !important;
            font-size: 16px !important;
        }
        
        .empty-state .btn {
            display: inline-flex !important;
            align-items: center !important;
            gap: 8px !important;
            padding: 10px 20px !important;
            border-radius: 6px !important;
            font-size: 14px !important;
            font-weight: 500 !important;
            cursor: pointer !important;
        }
        
        .empty-state .btn--primary {
            background: #0ea5e9 !important;
            color: white !important;
            border: none !important;
        }
        
        .empty-state .btn--secondary {
            background: white !important;
            color: #64748b !important;
            border: 1px solid #e2e8f0 !important;
        }
    `;
    
    document.head.appendChild(style);
    console.log('✅ Emergency CSS fix applied! The empty state should now be centered.');
    
    // Also check the structure
    const preview = document.querySelector('.preview');
    const container = document.getElementById('preview-container');
    const mediaKit = document.getElementById('media-kit-preview');
    
    console.log('Structure check:');
    console.log('- .preview exists:', !!preview);
    console.log('- #preview-container exists:', !!container);
    console.log('- #media-kit-preview exists:', !!mediaKit);
    console.log('- has-components class:', mediaKit?.classList.contains('has-components'));
})();