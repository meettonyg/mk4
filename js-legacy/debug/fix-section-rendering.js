/**
 * PHASE 3 Section System Quick Fix
 * Run this in the browser console to fix the section rendering issue
 */

window.fixSectionRendering = function() {
    console.log('🔧 PHASE 3 QUICK FIX: Starting section rendering fix...');
    
    // Step 1: Check current state
    const containerExists = document.getElementById('gmkb-sections-container');
    const savedComponentsContainer = document.getElementById('saved-components-container');
    const sectionRenderer = window.sectionRenderer;
    const sectionLayoutManager = window.sectionLayoutManager;
    
    console.log('📊 Current state:', {
        containerExists: !!containerExists,
        savedComponentsVisible: savedComponentsContainer?.style.display !== 'none',
        sectionRendererReady: !!sectionRenderer,
        sectionManagerReady: !!sectionLayoutManager,
        sectionsInState: sectionLayoutManager?.getSectionsInOrder().length || 0
    });
    
    // Step 2: Ensure container exists and is visible
    if (!containerExists) {
        console.log('📦 Creating sections container...');
        
        // Find parent container
        let parent = savedComponentsContainer || 
                    document.getElementById('media-kit-preview') ||
                    document.querySelector('.preview__container');
        
        if (parent) {
            // First show the saved components container if it's hidden
            if (savedComponentsContainer && savedComponentsContainer.style.display === 'none') {
                console.log('👁️ Making saved-components-container visible...');
                savedComponentsContainer.style.display = 'block';
                savedComponentsContainer.style.minHeight = '400px';
                
                // Hide empty state if it exists
                const emptyState = document.getElementById('empty-state');
                if (emptyState) {
                    emptyState.style.display = 'none';
                    console.log('🚫 Hidden empty state container');
                }
            }
            
            // Create the sections container
            const container = document.createElement('div');
            container.id = 'gmkb-sections-container';
            container.className = 'gmkb-sections-container';
            container.style.minHeight = '200px';
            
            // Insert into the correct parent
            if (savedComponentsContainer) {
                // Look for existing container first
                let existing = savedComponentsContainer.querySelector('#gmkb-sections-container');
                if (!existing) {
                    savedComponentsContainer.appendChild(container);
                    console.log('✅ Created sections container in saved-components-container');
                } else {
                    console.log('✅ Sections container already exists in saved-components-container');
                }
            } else {
                parent.appendChild(container);
                console.log('✅ Created sections container in parent');
            }
        } else {
            console.error('❌ Could not find parent container for sections');
            return false;
        }
    } else {
        console.log('✅ Sections container already exists');
        
        // Make sure it's visible
        if (savedComponentsContainer && savedComponentsContainer.style.display === 'none') {
            savedComponentsContainer.style.display = 'block';
            console.log('👁️ Made saved-components-container visible');
            
            // Hide empty state
            const emptyState = document.getElementById('empty-state');
            if (emptyState) {
                emptyState.style.display = 'none';
            }
        }
    }
    
    // Step 3: Re-initialize section renderer if needed
    if (sectionRenderer && !sectionRenderer.containerElement) {
        console.log('🔄 Re-initializing section renderer...');
        sectionRenderer.onCoreSystemsReady();
        
        // Wait a moment for initialization
        setTimeout(() => {
            if (sectionRenderer.containerElement) {
                console.log('✅ Section renderer re-initialized with container');
                
                // Try rendering existing sections
                const sections = sectionLayoutManager?.getSectionsInOrder();
                if (sections && sections.length > 0) {
                    console.log(`📐 Rendering ${sections.length} existing sections...`);
                    sectionRenderer.renderExistingSections();
                } else {
                    console.log('📋 No sections to render yet');
                }
            } else {
                console.log('⚠️ Section renderer still missing container');
            }
        }, 500);
    }
    
    // Step 4: Test by creating a section if none exist
    if (sectionLayoutManager) {
        const sections = sectionLayoutManager.getSectionsInOrder();
        if (sections.length === 0) {
            console.log('📝 Creating test section...');
            const testSection = sectionLayoutManager.registerSection(
                `test_section_${Date.now()}`,
                'full_width'
            );
            
            if (testSection) {
                console.log('✅ Test section created:', testSection.section_id);
                
                // Force render after a moment
                setTimeout(() => {
                    const sectionElement = document.querySelector('.gmkb-section');
                    if (sectionElement) {
                        console.log('✅ Section successfully rendered in DOM!');
                    } else {
                        console.log('⚠️ Section created but not yet visible in DOM');
                    }
                }, 500);
            }
        } else {
            console.log(`📊 ${sections.length} sections already exist`);
        }
    }
    
    return true;
};

// Auto-run fix if sections container is missing
setTimeout(() => {
    const container = document.getElementById('gmkb-sections-container');
    const sectionRenderer = window.sectionRenderer;
    
    if (!container && sectionRenderer) {
        console.log('⚠️ Section container missing - auto-running fix...');
        window.fixSectionRendering();
    } else if (container) {
        console.log('✅ Sections container found - system ready');
    }
}, 2000);

console.log('🔧 Section Rendering Fix loaded. Run fixSectionRendering() to manually fix issues.');
