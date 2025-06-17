/* Final Empty State Centering Patch */
/* Apply this in the browser console if centering still doesn't work */

(function fixEmptyStateCentering() {
    const style = document.createElement('style');
    style.id = 'empty-state-centering-patch';
    
    // Remove any existing patch
    const existing = document.getElementById('empty-state-centering-patch');
    if (existing) existing.remove();
    
    style.textContent = `
        /* Ensure preview container uses flexbox */
        .preview__container {
            display: flex !important;
            flex-direction: column !important;
        }
        
        /* Media kit should fill available space and center when empty */
        #media-kit-preview {
            flex: 1 !important;
            display: flex !important;
            flex-direction: column !important;
            width: 100% !important;
            background: white !important;
            color: #1a1a1a !important;
        }
        
        /* Center content when no components */
        #media-kit-preview:not(.has-components) {
            justify-content: center !important;
            align-items: center !important;
        }
        
        /* Reset alignment when components exist */
        #media-kit-preview.has-components {
            justify-content: flex-start !important;
            align-items: stretch !important;
        }
        
        /* Ensure empty state is properly styled */
        #media-kit-preview .empty-state {
            width: 100% !important;
            max-width: 600px !important;
            text-align: center !important;
        }
        
        /* Hide drop zones when empty */
        #media-kit-preview:not(.has-components) .drop-zone {
            display: none !important;
        }
    `;
    
    document.head.appendChild(style);
    console.log('Empty state centering patch applied!');
})();