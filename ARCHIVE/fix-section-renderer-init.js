/**
 * Fix Section Renderer Initialization
 * ROOT CAUSE: Section Renderer not initializing, sections created but not rendered
 * 
 * This script ensures the Section Renderer initializes and creates sections properly
 */

(function() {
    'use strict';
    
    const logger = window.StructuredLogger || console;
    
    logger.info('🔧 Section Renderer Init Fix: Starting...');
    
    // Function to initialize Section Renderer if not already done
    function ensureSectionRenderer() {
        // Check if SectionRenderer class exists but instance doesn't
        if (window.SectionRenderer && !window.sectionRenderer) {
            logger.info('📦 Creating Section Renderer instance...');
            window.sectionRenderer = new window.SectionRenderer();
            logger.info('✅ Section Renderer instance created');
            
            // Trigger core systems ready to ensure it initializes
            setTimeout(() => {
                if (window.coreSystemsCoordinator) {
                    window.coreSystemsCoordinator.forceCoreSystemsReady();
                }
            }, 100);
            
            return true;
        } else if (window.sectionRenderer) {
            logger.info('✅ Section Renderer already exists');
            return true;
        } else {
            logger.warn('⚠️ SectionRenderer class not available yet');
            return false;
        }
    }
    
    // Function to ensure sections container exists
    function ensureSectionsContainer() {
        let container = document.getElementById('gmkb-sections-container');
        
        if (!container) {
            // Find the best parent for the sections container
            const savedComponentsContainer = document.getElementById('saved-components-container');
            const mediaKitPreview = document.getElementById('media-kit-preview');
            
            const parent = savedComponentsContainer || mediaKitPreview;
            
            if (parent) {
                container = document.createElement('div');
                container.id = 'gmkb-sections-container';
                container.className = 'gmkb-sections-container';
                
                // Insert at beginning so sections come before components
                parent.insertBefore(container, parent.firstChild);
                
                logger.info('✅ Created sections container in', parent.id);
                
                // Make sure it's visible
                container.style.display = 'block';
                
                // Also ensure parent is visible
                if (parent.style.display === 'none') {
                    parent.style.display = 'block';
                }
                
                return container;
            } else {
                logger.error('❌ No suitable parent for sections container');
                return null;
            }
        }
        
        // Container exists, make sure it's visible
        if (container.style.display === 'none') {
            container.style.display = 'block';
        }
        
        return container;
    }
    
    // Function to render existing sections
    function renderExistingSections() {
        if (!window.sectionLayoutManager || !window.sectionRenderer) {
            logger.warn('⚠️ Section systems not ready for rendering');
            return;
        }
        
        const sections = window.sectionLayoutManager.getSectionsInOrder();
        
        if (sections.length > 0) {
            logger.info(`📐 Rendering ${sections.length} existing sections...`);
            
            // Ensure container exists
            const container = ensureSectionsContainer();
            if (!container) {
                logger.error('❌ Cannot render sections without container');
                return;
            }
            
            // Set container on renderer
            if (window.sectionRenderer && !window.sectionRenderer.containerElement) {
                window.sectionRenderer.containerElement = container;
                logger.info('✅ Set container on Section Renderer');
            }
            
            // Render each section
            sections.forEach(section => {
                logger.info(`📐 Rendering section ${section.section_id}`);
                window.sectionRenderer.renderSection(section);
            });
            
            logger.info('✅ All sections rendered');
            
            // Hide empty state if we have sections
            const emptyState = document.getElementById('empty-state');
            if (emptyState) {
                emptyState.style.display = 'none';
            }
        } else {
            logger.info('📭 No sections to render');
        }
    }
    
    // Main initialization function
    function initializeSectionSystem() {
        logger.info('🚀 Initializing Section System...');
        
        // Step 1: Ensure Section Renderer exists
        if (!ensureSectionRenderer()) {
            logger.warn('⏳ Waiting for SectionRenderer class...');
            setTimeout(initializeSectionSystem, 500);
            return;
        }
        
        // Step 2: Ensure sections container exists
        const container = ensureSectionsContainer();
        if (!container) {
            logger.error('❌ Failed to create sections container');
            return;
        }
        
        // Step 3: Wait for Section Layout Manager
        if (!window.sectionLayoutManager) {
            logger.warn('⏳ Waiting for Section Layout Manager...');
            setTimeout(initializeSectionSystem, 500);
            return;
        }
        
        // Step 4: Render existing sections
        renderExistingSections();
        
        // Step 5: Set up event listeners for new sections
        document.addEventListener('gmkb:section-registered', (event) => {
            logger.info('📐 New section registered, rendering...');
            const { sectionId } = event.detail;
            
            // Ensure container exists
            ensureSectionsContainer();
            
            // Render the new section
            if (window.sectionRenderer && window.sectionLayoutManager) {
                const section = window.sectionLayoutManager.getSection(sectionId);
                if (section) {
                    window.sectionRenderer.renderSection(section);
                }
            }
        });
        
        logger.info('✅ Section System initialized successfully');
    }
    
    // Start initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeSectionSystem);
    } else {
        // DOM already loaded, initialize immediately
        initializeSectionSystem();
    }
    
    // Also provide manual fix function
    window.fixSectionRendering = function() {
        logger.info('🔧 Manual Section Rendering Fix triggered');
        
        // Force initialization
        ensureSectionRenderer();
        ensureSectionsContainer();
        renderExistingSections();
        
        // Force core systems ready
        if (window.coreSystemsCoordinator) {
            window.coreSystemsCoordinator.forceCoreSystemsReady();
        }
        
        logger.info('✅ Manual fix complete - check if sections are visible');
    };
    
    // Debug function to check section system status
    window.checkSectionStatus = function() {
        console.log('=== SECTION SYSTEM STATUS ===');
        console.log('SectionRenderer class:', !!window.SectionRenderer);
        console.log('sectionRenderer instance:', !!window.sectionRenderer);
        console.log('SectionLayoutManager:', !!window.sectionLayoutManager);
        console.log('Sections container:', !!document.getElementById('gmkb-sections-container'));
        
        if (window.sectionLayoutManager) {
            const sections = window.sectionLayoutManager.getSectionsInOrder();
            console.log('Sections in state:', sections.length);
            sections.forEach(s => {
                const domElement = document.getElementById(`section-${s.section_id}`);
                console.log(`  - ${s.section_id}:`, domElement ? 'RENDERED' : 'NOT RENDERED');
            });
        }
        
        if (window.sectionRenderer) {
            console.log('Renderer debug:', window.sectionRenderer.getDebugInfo());
        }
    };
    
    logger.info('✅ Section Renderer Init Fix loaded - use fixSectionRendering() or checkSectionStatus() for debugging');
    
})();
