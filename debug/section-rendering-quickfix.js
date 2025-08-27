/**
 * Quick patch to fix section rendering issues
 * Run this after page loads to ensure sections work properly
 */

(function() {
    console.log('🔧 Section Rendering Quick Fix Loading...');
    
    // Wait for systems to be ready
    const initFix = () => {
        if (!window.sectionLayoutManager || !window.sectionRenderer) {
            console.log('⏳ Waiting for section systems...');
            setTimeout(initFix, 100);
            return;
        }
        
        console.log('✅ Section systems ready, applying fix...');
        
        // Override the registerSection method to ensure proper structure
        const originalRegisterSection = window.sectionLayoutManager.registerSection.bind(window.sectionLayoutManager);
        
        window.sectionLayoutManager.registerSection = function(sectionId, sectionType, configuration = {}) {
            // Ensure we have valid parameters
            if (!sectionId) {
                sectionId = `section_${Date.now()}`;
            }
            if (!sectionType) {
                sectionType = 'full_width';
            }
            
            console.log(`📐 Registering section: ${sectionId} (${sectionType})`);
            
            // Call original method
            const result = originalRegisterSection(sectionId, sectionType, configuration);
            
            // Ensure the section is properly stored and has all properties
            const section = this.sections.get(sectionId);
            if (section) {
                // Ensure all required properties exist
                if (!section.section_id) {
                    section.section_id = sectionId;
                }
                if (!section.section_type) {
                    section.section_type = sectionType;
                }
                if (!section.layout || !section.layout.columns) {
                    const defaults = this.getDefaultSectionConfiguration(sectionType);
                    section.layout = defaults.layout;
                    section.section_options = section.section_options || defaults.section_options;
                    section.responsive = section.responsive || defaults.responsive;
                }
                
                // Update the stored section
                this.sections.set(sectionId, section);
                
                console.log('✅ Section registered with complete structure:', section);
            }
            
            return result;
        };
        
        // Also patch renderSection to be more robust
        const originalRenderSection = window.sectionRenderer.renderSection.bind(window.sectionRenderer);
        
        window.sectionRenderer.renderSection = function(sectionOrId) {
            console.log('🎨 Rendering section:', sectionOrId);
            
            // If it's a string, fetch the section
            if (typeof sectionOrId === 'string') {
                const section = window.sectionLayoutManager.getSection(sectionOrId);
                if (section) {
                    return originalRenderSection(section);
                } else {
                    console.error('❌ Section not found:', sectionOrId);
                    return;
                }
            }
            
            // If it's an object, ensure it has required properties
            if (typeof sectionOrId === 'object' && sectionOrId !== null) {
                if (!sectionOrId.section_id || !sectionOrId.section_type) {
                    console.error('❌ Invalid section object:', sectionOrId);
                    return;
                }
                
                // Ensure layout exists
                if (!sectionOrId.layout || !sectionOrId.layout.columns) {
                    const defaults = window.sectionLayoutManager.getDefaultSectionConfiguration(sectionOrId.section_type || 'full_width');
                    sectionOrId.layout = defaults.layout;
                    sectionOrId.section_options = sectionOrId.section_options || defaults.section_options;
                    sectionOrId.responsive = sectionOrId.responsive || defaults.responsive;
                }
            }
            
            return originalRenderSection(sectionOrId);
        };
        
        console.log('✅ Section rendering fix applied!');
        console.log('💡 Try creating a section from the Layout tab now.');
    };
    
    // Start the fix
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFix);
    } else {
        setTimeout(initFix, 100);
    }
})();

// Export test function
window.testSectionQuickFix = function() {
    console.log('🧪 Testing section quick fix...');
    
    if (!window.sectionLayoutManager || !window.sectionRenderer) {
        console.error('❌ Section systems not available');
        return;
    }
    
    // Create a test section
    const testId = `test_${Date.now()}`;
    window.sectionLayoutManager.registerSection(testId, 'two_column');
    
    // Try to render it
    window.sectionRenderer.renderSection(testId);
    
    // Check if it rendered
    setTimeout(() => {
        const element = document.querySelector(`[data-section-id="${testId}"]`);
        if (element) {
            console.log('✅ Test section rendered successfully!');
            // Clean up
            window.sectionLayoutManager.removeSection(testId);
        } else {
            console.error('❌ Test section failed to render');
        }
    }, 500);
};
