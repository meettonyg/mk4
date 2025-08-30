/**
 * Test Section System
 * Comprehensive debugging and testing for Phase 3 Section Layer
 * 
 * @version 1.0.0
 * @package GMKB/Test
 */

(function() {
    'use strict';
    
    console.log('🧪 PHASE 3 TEST: Section System Test Script Loading...');
    
    /**
     * Test section creation functionality
     */
    window.testSectionCreation = function() {
        console.group('🧪 PHASE 3 TEST: Section Creation');
        
        if (!window.sectionLayoutManager) {
            console.error('❌ SectionLayoutManager not available');
            console.groupEnd();
            return false;
        }
        
        // Create test sections
        const testLayouts = ['full_width', 'two_column', 'three_column'];
        const createdSections = [];
        
        testLayouts.forEach(layout => {
            const sectionId = `test_section_${layout}_${Date.now()}`;
            const section = window.sectionLayoutManager.registerSection(sectionId, layout);
            
            if (section) {
                createdSections.push(section);
                console.log(`✅ Created ${layout} section:`, section);
            } else {
                console.error(`❌ Failed to create ${layout} section`);
            }
        });
        
        console.log(`📊 Created ${createdSections.length}/${testLayouts.length} sections`);
        console.log('📋 All sections:', window.sectionLayoutManager.getAllSections());
        
        console.groupEnd();
        return createdSections;
    };
    
    /**
     * Test section rendering
     */
    window.testSectionRendering = function() {
        console.group('🧪 PHASE 3 TEST: Section Rendering');
        
        if (!window.sectionRenderer) {
            console.error('❌ SectionRenderer not available');
            console.groupEnd();
            return false;
        }
        
        // Check container
        const container = document.getElementById('gmkb-sections-container');
        console.log('📦 Container found:', !!container, container);
        
        if (!container) {
            console.warn('⚠️ Creating container manually for test');
            const savedContainer = document.getElementById('saved-components-container');
            if (savedContainer) {
                const newContainer = document.createElement('div');
                newContainer.id = 'gmkb-sections-container';
                newContainer.className = 'gmkb-sections-container';
                savedContainer.appendChild(newContainer);
                console.log('✅ Container created');
            }
        }
        
        // Check renderer state
        const debugInfo = window.sectionRenderer.getDebugInfo();
        console.log('🔍 Renderer state:', debugInfo);
        
        // Try to render existing sections
        window.sectionRenderer.renderExistingSections();
        
        // Check DOM
        const domSections = document.querySelectorAll('.gmkb-section');
        console.log(`📊 DOM sections found: ${domSections.length}`);
        domSections.forEach((section, index) => {
            console.log(`  ${index + 1}. ${section.id} (${section.dataset.sectionType})`);
        });
        
        console.groupEnd();
        return domSections.length > 0;
    };
    
    /**
     * Test section persistence
     */
    window.testSectionPersistence = function() {
        console.group('🧪 PHASE 3 TEST: Section Persistence');
        
        if (!window.sectionStatePersistence) {
            console.error('❌ SectionStatePersistence not available');
            console.groupEnd();
            return false;
        }
        
        const debugInfo = window.sectionStatePersistence.getDebugInfo();
        console.log('💾 Persistence state:', debugInfo);
        
        // Check WordPress data
        if (window.gmkbData) {
            console.log('📡 WordPress data available:', {
                ajaxUrl: !!window.gmkbData.ajaxUrl,
                nonce: !!window.gmkbData.nonce,
                postId: window.gmkbData.postId
            });
        } else {
            console.error('❌ WordPress data not available');
        }
        
        // Test save
        console.log('💾 Testing save...');
        window.sectionStatePersistence.save().then(result => {
            console.log('✅ Save result:', result);
        }).catch(error => {
            console.error('❌ Save failed:', error);
        });
        
        console.groupEnd();
        return true;
    };
    
    /**
     * Test sidebar integration
     */
    window.testSidebarIntegration = function() {
        console.group('🧪 PHASE 3 TEST: Sidebar Integration');
        
        if (!window.sidebarSectionIntegration) {
            console.error('❌ SidebarSectionIntegration not available');
            console.groupEnd();
            return false;
        }
        
        const debugInfo = window.sidebarSectionIntegration.getDebugInfo();
        console.log('🎛️ Sidebar state:', debugInfo);
        
        // Check buttons
        const addBtn = document.getElementById('add-section-btn');
        const duplicateBtn = document.getElementById('duplicate-section-btn');
        
        console.log('🔘 Add section button:', !!addBtn);
        console.log('🔘 Duplicate section button:', !!duplicateBtn);
        
        // Check layout options
        const layoutOptions = document.querySelectorAll('.layout-option');
        console.log(`📐 Layout options found: ${layoutOptions.length}`);
        layoutOptions.forEach(option => {
            console.log(`  - ${option.dataset.layout}`);
        });
        
        console.groupEnd();
        return debugInfo.addButtonAvailable;
    };
    
    /**
     * Comprehensive section system test
     */
    window.testSectionSystem = function() {
        console.group('🧪 PHASE 3 COMPREHENSIVE TEST: Section System');
        console.log('Starting comprehensive section system test...');
        
        const results = {
            managers: {
                layoutManager: !!window.sectionLayoutManager,
                renderer: !!window.sectionRenderer,
                persistence: !!window.sectionStatePersistence,
                sidebar: !!window.sidebarSectionIntegration
            },
            tests: {}
        };
        
        // Test each component
        console.log('\n📋 Testing Section Creation...');
        results.tests.creation = testSectionCreation();
        
        console.log('\n🎨 Testing Section Rendering...');
        results.tests.rendering = testSectionRendering();
        
        console.log('\n💾 Testing Section Persistence...');
        results.tests.persistence = testSectionPersistence();
        
        console.log('\n🎛️ Testing Sidebar Integration...');
        results.tests.sidebar = testSidebarIntegration();
        
        // Summary
        console.log('\n📊 TEST SUMMARY:');
        console.table(results.managers);
        
        const allManagersReady = Object.values(results.managers).every(v => v);
        const allTestsPassed = Object.values(results.tests).every(v => !!v);
        
        if (allManagersReady && allTestsPassed) {
            console.log('✅ ALL TESTS PASSED - Section system is functional');
        } else {
            console.log('❌ SOME TESTS FAILED - Section system needs fixes');
            console.log('Failed managers:', Object.entries(results.managers).filter(([k, v]) => !v).map(([k]) => k));
            console.log('Failed tests:', Object.entries(results.tests).filter(([k, v]) => !v).map(([k]) => k));
        }
        
        console.groupEnd();
        return results;
    };
    
    /**
     * Create test section with components
     */
    window.createTestSectionWithComponents = function() {
        console.group('🧪 PHASE 3 TEST: Create Section with Components');
        
        // Create a section
        const sectionId = `test_section_${Date.now()}`;
        const section = window.sectionLayoutManager?.registerSection(sectionId, 'two_column');
        
        if (!section) {
            console.error('❌ Failed to create section');
            console.groupEnd();
            return;
        }
        
        console.log('✅ Created section:', section);
        
        // Add some test components
        const testComponents = [
            { id: `comp_${Date.now()}_1`, type: 'hero', column: 1 },
            { id: `comp_${Date.now()}_2`, type: 'biography', column: 2 }
        ];
        
        testComponents.forEach(comp => {
            // Create placeholder component element
            const compEl = document.createElement('div');
            compEl.className = 'gmkb-component gmkb-component--' + comp.type;
            compEl.dataset.componentId = comp.id;
            compEl.innerHTML = `
                <div class="component-content">
                    <h3>Test ${comp.type} Component</h3>
                    <p>Component ID: ${comp.id}</p>
                </div>
            `;
            
            // Add to DOM temporarily
            document.body.appendChild(compEl);
            
            // Assign to section
            window.sectionLayoutManager.assignComponentToSection(comp.id, sectionId, comp.column);
            
            console.log(`✅ Added ${comp.type} component to column ${comp.column}`);
        });
        
        // Force render
        window.sectionRenderer?.renderAllSections();
        
        console.groupEnd();
        return sectionId;
    };
    
    /**
     * Fix section container if missing
     */
    window.fixSectionContainer = function() {
        console.group('🔧 PHASE 3 FIX: Ensure Section Container Exists');
        
        let container = document.getElementById('gmkb-sections-container');
        
        if (container) {
            console.log('✅ Container already exists');
            console.groupEnd();
            return container;
        }
        
        // Find parent container
        const savedContainer = document.getElementById('saved-components-container');
        const mediaKitPreview = document.getElementById('media-kit-preview');
        const parent = savedContainer || mediaKitPreview;
        
        if (!parent) {
            console.error('❌ No parent container found');
            console.groupEnd();
            return null;
        }
        
        // Create container
        container = document.createElement('div');
        container.id = 'gmkb-sections-container';
        container.className = 'gmkb-sections-container';
        container.style.cssText = `
            min-height: 100px;
            padding: 20px;
            border: 2px dashed #ddd;
            margin: 20px 0;
            background: rgba(0, 123, 255, 0.05);
        `;
        
        parent.appendChild(container);
        
        console.log('✅ Container created in', parent.id);
        
        // Re-initialize renderer if needed
        if (window.sectionRenderer) {
            window.sectionRenderer.containerElement = container;
            window.sectionRenderer.renderExistingSections();
        }
        
        console.groupEnd();
        return container;
    };
    
    // Auto-run basic diagnostics on load
    setTimeout(() => {
        console.log('🧪 PHASE 3 AUTO-DIAGNOSTICS:');
        console.log('  SectionLayoutManager:', !!window.sectionLayoutManager);
        console.log('  SectionRenderer:', !!window.sectionRenderer);
        console.log('  SectionStatePersistence:', !!window.sectionStatePersistence);
        console.log('  SidebarSectionIntegration:', !!window.sidebarSectionIntegration);
        console.log('  Sections container:', !!document.getElementById('gmkb-sections-container'));
        console.log('');
        console.log('🧪 Run testSectionSystem() for comprehensive test');
        console.log('🔧 Run fixSectionContainer() to ensure container exists');
        console.log('➕ Run createTestSectionWithComponents() to create test section');
    }, 1000);
    
    console.log('✅ PHASE 3 TEST: Section System Test Script Loaded');
    console.log('Available test commands:');
    console.log('  - testSectionSystem() - Run all tests');
    console.log('  - testSectionCreation() - Test section creation');
    console.log('  - testSectionRendering() - Test section rendering');
    console.log('  - testSectionPersistence() - Test save/load');
    console.log('  - testSidebarIntegration() - Test sidebar buttons');
    console.log('  - createTestSectionWithComponents() - Create test section');
    console.log('  - fixSectionContainer() - Fix missing container');
    
})();