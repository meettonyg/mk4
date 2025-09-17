/**
 * Section Template Button Integration
 * Phase 3: Connects the "Use Template" button to the template system
 */

(function() {
    const logger = window.StructuredLogger || console;
    
    // Wait for DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTemplateButton);
    } else {
        initTemplateButton();
    }
    
    function initTemplateButton() {
        // Find the template button
        const templateButton = document.getElementById('use-template-btn');
        
        if (!templateButton) {
            logger.warn('Template button not found in sidebar');
            return;
        }
        
        // Add click handler
        templateButton.addEventListener('click', handleTemplateButtonClick);
        
        // Add pulse animation to draw attention (remove after first click)
        templateButton.classList.add('pulse-attention');
        templateButton.addEventListener('click', function() {
            templateButton.classList.remove('pulse-attention');
        }, { once: true });
        
        logger.info('✅ Section template button initialized');
    }
    
    function handleTemplateButtonClick(e) {
        e.preventDefault();
        e.stopPropagation();
        
        logger.info('📚 Opening section template library');
        
        // Check if template manager is available
        if (window.sectionTemplateManager) {
            window.sectionTemplateManager.openTemplateLibrary();
        } else {
            // Fallback: Open template modal directly
            if (window.modalBase && window.modalBase.openModal) {
                window.modalBase.openModal('template-library');
            } else {
                logger.error('Template system not available');
                alert('Template library is loading, please try again in a moment.');
            }
        }
    }
    
    // Listen for template library events
    document.addEventListener('gmkb:open-section-template-library', function(event) {
        const { templates, categories } = event.detail;
        
        // Open modal with template data
        if (window.modalBase && window.modalBase.openModal) {
            // Store template data for modal to use
            window.sectionTemplateData = {
                templates,
                categories
            };
            
            window.modalBase.openModal('template-library');
        }
    });
    
    // Handle template selection from modal
    document.addEventListener('gmkb:template-selected', function(event) {
        const { templateSlug } = event.detail;
        
        if (window.sectionTemplateManager) {
            // Apply the selected template
            const section = window.sectionTemplateManager.applyTemplate(templateSlug);
            
            if (section) {
                logger.info(`✅ Template applied successfully: ${templateSlug}`);
                
                // Close the modal
                if (window.modalBase && window.modalBase.closeModal) {
                    window.modalBase.closeModal('template-library');
                }
                
                // Show success message
                if (window.showToast) {
                    window.showToast('Section template applied successfully!', 'success');
                }
            } else {
                logger.error(`Failed to apply template: ${templateSlug}`);
                
                if (window.showToast) {
                    window.showToast('Failed to apply template. Please try again.', 'error');
                }
            }
        }
    });
    
})();
