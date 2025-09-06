/**
 * Section System Initialization Failsafe
 * ROOT FIX: Ensures Section Renderer and Sidebar Integration are initialized
 * even if they weren't automatically created
 */

(function() {
    'use strict';
    
    console.log('🔧 Section System Initialization Failsafe Loading...');
    
    // Function to initialize section systems
    function initializeSectionSystems() {
        console.log('🔍 Checking Section System status...');
        
        let initialized = false;
        
        // Check and create SectionRenderer if needed
        if (!window.sectionRenderer) {
            if (window.SectionRenderer) {
                try {
                    window.sectionRenderer = new window.SectionRenderer();
                    console.log('✅ SectionRenderer initialized via failsafe');
                    initialized = true;
                } catch (error) {
                    console.error('❌ Failed to initialize SectionRenderer:', error);
                }
            } else {
                console.warn('⚠️ SectionRenderer class not available yet');
            }
        } else {
            console.log('✅ SectionRenderer already initialized');
        }
        
        // Check and create SidebarSectionIntegration if needed
        if (!window.sidebarSectionIntegration) {
            if (window.SidebarSectionIntegration) {
                try {
                    window.sidebarSectionIntegration = new window.SidebarSectionIntegration();
                    console.log('✅ SidebarSectionIntegration initialized via failsafe');
                    initialized = true;
                } catch (error) {
                    console.error('❌ Failed to initialize SidebarSectionIntegration:', error);
                }
            } else {
                console.warn('⚠️ SidebarSectionIntegration class not available yet');
            }
        } else {
            console.log('✅ SidebarSectionIntegration already initialized');
        }
        
        // If we initialized anything, dispatch event
        if (initialized) {
            console.log('📢 Dispatching section-systems-initialized event');
            document.dispatchEvent(new CustomEvent('gmkb:section-systems-initialized', {
                detail: {
                    sectionRenderer: window.sectionRenderer,
                    sidebarSectionIntegration: window.sidebarSectionIntegration,
                    timestamp: Date.now()
                }
            }));
        }
        
        return initialized;
    }
    
    // Try initialization at different lifecycle points
    
    // 1. Try immediately
    if (initializeSectionSystems()) {
        console.log('✅ Section systems initialized immediately');
        return;
    }
    
    // 2. Try on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log('📋 DOMContentLoaded - attempting section system initialization');
            if (initializeSectionSystems()) {
                console.log('✅ Section systems initialized on DOMContentLoaded');
            }
        });
    }
    
    // 3. Try on gmkb:core-systems-ready event
    document.addEventListener('gmkb:core-systems-ready', function() {
        console.log('📋 Core systems ready - attempting section system initialization');
        if (initializeSectionSystems()) {
            console.log('✅ Section systems initialized on core-systems-ready');
        }
    });
    
    // 4. Try on window load (last resort)
    window.addEventListener('load', function() {
        console.log('📋 Window load - final attempt at section system initialization');
        if (initializeSectionSystems()) {
            console.log('✅ Section systems initialized on window load');
        } else {
            console.error('❌ Failed to initialize section systems after all attempts');
            
            // Provide manual fix command
            window.initSectionSystems = initializeSectionSystems;
            console.log('💡 Manual fix available: Run window.initSectionSystems() in console');
        }
    });
    
    // 5. Provide global function for manual initialization
    window.initSectionSystems = initializeSectionSystems;
    
    // 6. Add test function
    window.testSectionSystems = function() {
        console.log('🧪 Testing Section Systems...');
        console.log('SectionRenderer class:', typeof window.SectionRenderer);
        console.log('sectionRenderer instance:', window.sectionRenderer ? 'exists' : 'missing');
        console.log('SidebarSectionIntegration class:', typeof window.SidebarSectionIntegration);
        console.log('sidebarSectionIntegration instance:', window.sidebarSectionIntegration ? 'exists' : 'missing');
        
        if (window.sectionRenderer && window.sectionRenderer.getDebugInfo) {
            console.log('SectionRenderer debug info:', window.sectionRenderer.getDebugInfo());
        }
        
        // Try to add a test section
        if (window.sectionLayoutManager) {
            const testId = `test_section_${Date.now()}`;
            const section = window.sectionLayoutManager.registerSection(testId, 'full_width');
            if (section) {
                console.log('✅ Test section created:', testId);
                
                // Try to render it
                if (window.sectionRenderer) {
                    window.sectionRenderer.renderSection(section);
                    console.log('✅ Test section rendered');
                }
            }
        }
    };
    
    console.log('✅ Section System Initialization Failsafe Ready');
    console.log('💡 Commands available:');
    console.log('  - window.initSectionSystems() - Initialize section systems');
    console.log('  - window.testSectionSystems() - Test section systems');
    
})();
