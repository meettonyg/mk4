/**
 * @file fix-modal-close.js
 * @description Emergency fix for modal close functionality
 * @version 1.0.0
 */

(function() {
    'use strict';
    
    console.log('🔧 Running modal close fix...');
    
    // Function to fix modal close functionality
    function fixModalClose() {
        const modal = document.getElementById('global-settings-modal');
        const closeButton = document.querySelector('#close-global-settings, .modal__close');
        
        if (!modal) {
            console.error('❌ Modal not found');
            return;
        }
        
        if (!closeButton) {
            console.error('❌ Close button not found');
            return;
        }
        
        console.log('✅ Found modal and close button');
        
        // Remove old handlers by cloning
        const newCloseButton = closeButton.cloneNode(true);
        closeButton.parentNode.replaceChild(newCloseButton, closeButton);
        
        // Add new click handler
        newCloseButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔧 Close button clicked');
            
            // Multiple methods to ensure modal closes
            modal.classList.remove('modal--open');
            modal.style.display = 'none';
            document.body.classList.remove('modal-open');
            
            // Also try using the modal system if available
            if (window.GMKB_Modals && window.GMKB_Modals.hide) {
                window.GMKB_Modals.hide('global-settings-modal');
            }
        });
        
        // Add backdrop click handler
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                console.log('🔧 Backdrop clicked');
                modal.classList.remove('modal--open');
                modal.style.display = 'none';
                document.body.classList.remove('modal-open');
                
                if (window.GMKB_Modals && window.GMKB_Modals.hide) {
                    window.GMKB_Modals.hide('global-settings-modal');
                }
            }
        });
        
        // Add ESC key handler
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && (modal.classList.contains('modal--open') || modal.style.display === 'flex')) {
                console.log('🔧 ESC key pressed');
                modal.classList.remove('modal--open');
                modal.style.display = 'none';
                document.body.classList.remove('modal-open');
                
                if (window.GMKB_Modals && window.GMKB_Modals.hide) {
                    window.GMKB_Modals.hide('global-settings-modal');
                }
            }
        });
        
        console.log('✅ Modal close handlers attached');
        
        // Remove the data attribute to force re-registration
        modal.removeAttribute('data-close-handlers-setup');
    }
    
    // Run the fix
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fixModalClose);
    } else {
        fixModalClose();
    }
    
    // Make it available globally for manual execution
    window.GMKBFixModalClose = fixModalClose;
    
})();
