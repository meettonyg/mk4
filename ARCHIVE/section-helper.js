/**
 * Section Helper Commands
 * Manual section testing commands for debugging
 * 
 * Usage in console:
 * - createTestSection('two_column')
 * - debugSections()
 * - fixSectionManager()
 */

(function() {
    'use strict';
    
    // Helper function to create section manager if not exists
    window.fixSectionManager = function() {
        console.log('🔧 Attempting to fix Section Manager...');
        
        if (!window.SectionLayoutManager) {
            console.error('❌ SectionLayoutManager class not found. Script may not have loaded.');
            return false;
        }
        
        if (!window.sectionLayoutManager) {
            console.log('📦 Creating new SectionLayoutManager instance...');
            window.sectionLayoutManager = new window.SectionLayoutManager();
            
            // Manually initialize if state manager is available
            if (window.enhancedStateManager) {
                console.log('✅ State manager found, initializing section manager...');
                window.sectionLayoutManager.init();
                return true;
            } else {
                console.warn('⚠️ State manager not available yet. Section manager created but not initialized.');
                return false;
            }
        } else {
            console.log('✅ Section manager already exists');
            
            // Try to initialize if not initialized
            if (!window.sectionLayoutManager.initialized && window.enhancedStateManager) {
                console.log('📦 Initializing existing section manager...');
                window.sectionLayoutManager.init();
            }
            
            return true;
        }
    };
    
    // Create test section
    window.createTestSection = function(type = 'two_column') {
        console.log(`🎯 Creating test section: ${type}`);
        
        // Fix manager first
        if (!window.sectionLayoutManager) {
            window.fixSectionManager();
        }
        
        if (!window.sectionLayoutManager) {
            console.error('❌ Cannot create section - manager not available');
            return null;
        }
        
        const section = window.sectionLayoutManager.createSection(type);
        console.log('✅ Section created:', section);
        
        // Force render if renderer is available
        if (window.sectionRenderer && section) {
            console.log('📦 Rendering section with SectionRenderer...');
            window.sectionRenderer.renderSection(section.section_id);
        }
        
        return section;
    };
    
    // Debug sections
    window.debugSections = function() {
        console.group('🔍 Section System Debug');
        
        console.log('SectionLayoutManager class:', typeof window.SectionLayoutManager);
        console.log('sectionLayoutManager instance:', typeof window.sectionLayoutManager);
        
        if (window.sectionLayoutManager) {
            console.log('Initialized:', window.sectionLayoutManager.initialized);
            console.log('Sections:', window.sectionLayoutManager.getAllSections());
            console.log('State Manager:', window.sectionLayoutManager.stateManager ? 'Available' : 'Not available');
        }
        
        console.log('SectionRenderer:', typeof window.sectionRenderer);
        console.log('Enhanced State Manager:', typeof window.enhancedStateManager);
        
        // Check DOM
        const sections = document.querySelectorAll('[data-section-id]');
        console.log(`DOM Sections: ${sections.length} found`);
        sections.forEach(section => {
            console.log(`- ${section.dataset.sectionId} (${section.dataset.sectionType})`);
        });
        
        console.groupEnd();
    };
    
    // Auto-fix on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            // Give other scripts time to load
            setTimeout(function() {
                if (!window.sectionLayoutManager) {
                    console.log('🔧 Auto-fixing Section Manager on DOM ready...');
                    window.fixSectionManager();
                }
            }, 1000);
        });
    } else {
        // DOM already loaded
        setTimeout(function() {
            if (!window.sectionLayoutManager) {
                console.log('🔧 Auto-fixing Section Manager...');
                window.fixSectionManager();
            }
        }, 1000);
    }
    
    // Add console helper
    console.log(`
📚 Section Helper Commands Available:
- fixSectionManager() - Fix/create section manager
- createTestSection('two_column') - Create a test section
- debugSections() - Debug section system status
    `);
    
})();