// Quick fix for empty state styling issues
// Run this in browser console if empty state styles are broken

(function fixEmptyStateStyles() {
    const style = document.createElement('style');
    style.id = 'empty-state-quick-fix';
    
    // Remove any existing fix
    const existing = document.getElementById('empty-state-quick-fix');
    if (existing) existing.remove();
    
    style.textContent = `
        /* Force proper styling for empty state */
        #media-kit-preview .empty-state {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            padding: 60px 20px !important;
            text-align: center !important;
            min-height: 400px !important;
            background: transparent !important;
            color: #1a1a1a !important;
        }
        
        #media-kit-preview .empty-state * {
            color: inherit;
        }
        
        #media-kit-preview .empty-state__icon {
            margin-bottom: 24px !important;
            color: #475569 !important;
            opacity: 0.5 !important;
        }
        
        #media-kit-preview .empty-state__title {
            font-size: 24px !important;
            font-weight: 600 !important;
            color: #1e293b !important;
            margin: 0 0 12px 0 !important;
        }
        
        #media-kit-preview .empty-state__text {
            font-size: 16px !important;
            color: #64748b !important;
            margin: 0 0 32px 0 !important;
        }
        
        #media-kit-preview .btn {
            display: inline-flex !important;
            align-items: center !important;
            gap: 8px !important;
            padding: 10px 20px !important;
            border-radius: 6px !important;
            font-size: 14px !important;
            font-weight: 500 !important;
            cursor: pointer !important;
            transition: all 0.2s !important;
            text-decoration: none !important;
        }
        
        #media-kit-preview .btn--primary {
            background: #0ea5e9 !important;
            color: white !important;
            border: none !important;
        }
        
        #media-kit-preview .btn--primary:hover {
            background: #0284c7 !important;
        }
        
        #media-kit-preview .btn--secondary {
            background: white !important;
            color: #64748b !important;
            border: 1px solid #e2e8f0 !important;
        }
        
        #media-kit-preview .btn--secondary:hover {
            background: #f8fafc !important;
        }
        
        #media-kit-preview:not(.has-components) .empty-state {
            display: flex !important;
        }
    `;
    
    document.head.appendChild(style);
    console.log('Empty state styles fixed! The buttons should now look correct.');
})();