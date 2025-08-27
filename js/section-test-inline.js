/**
 * Quick Section System Test
 * Inline test to verify Phase 3 Section functionality
 */
console.log('🧪 PHASE 3 INLINE TEST: Section System Quick Test');

// Test 1: Check if section managers exist
window.testSectionManagers = function() {
    console.group('🧪 Section Managers Check');
    const results = {
        sectionLayoutManager: !!window.sectionLayoutManager,
        sectionRenderer: !!window.sectionRenderer,
        sectionStatePersistence: !!window.sectionStatePersistence,
        sidebarSectionIntegration: !!window.sidebarSectionIntegration
    };
    
    console.table(results);
    
    if (window.sectionLayoutManager) {
        const sections = window.sectionLayoutManager.getAllSections();
        console.log('📊 Current sections:', sections);
        console.log('📊 Section count:', sections.length);
    }
    
    console.groupEnd();
    return results;
};

// Test 2: Create a test section
window.createTestSection = function() {
    console.group('🧪 Create Test Section');
    
    if (!window.sectionLayoutManager) {
        console.error('❌ SectionLayoutManager not available');
        console.groupEnd();
        return null;
    }
    
    const sectionId = `test_section_${Date.now()}`;
    const section = window.sectionLayoutManager.registerSection(sectionId, 'two_column');
    
    if (section) {
        console.log('✅ Created section:', section);
        
        // Check if it renders
        setTimeout(() => {
            const domElement = document.querySelector(`[data-section-id="${sectionId}"]`);
            if (domElement) {
                console.log('✅ Section rendered in DOM:', domElement);
            } else {
                console.warn('⚠️ Section not found in DOM');
                // Try to fix container
                window.fixSectionContainer();
            }
        }, 100);
    } else {
        console.error('❌ Failed to create section');
    }
    
    console.groupEnd();
    return section;
};

// Test 3: Fix section container
window.fixSectionContainer = function() {
    console.group('🔧 Fix Section Container');
    
    let container = document.getElementById('gmkb-sections-container');
    
    if (container) {
        console.log('✅ Container already exists:', container);
        console.groupEnd();
        return container;
    }
    
    // Find parent
    const savedContainer = document.getElementById('saved-components-container');
    const mediaKit = document.getElementById('media-kit-preview');
    const parent = savedContainer || mediaKit;
    
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
        min-height: 200px;
        padding: 20px;
        border: 2px dashed #007cba;
        margin: 20px 0;
        background: rgba(0, 123, 255, 0.05);
        position: relative;
    `;
    
    // Add placeholder text
    const placeholder = document.createElement('div');
    placeholder.style.cssText = `
        text-align: center;
        color: #666;
        padding: 40px;
    `;
    placeholder.innerHTML = `
        <h3>Section Container Ready</h3>
        <p>Sections will appear here</p>
    `;
    container.appendChild(placeholder);
    
    parent.appendChild(container);
    console.log('✅ Container created in', parent.id);
    
    // Re-initialize renderer
    if (window.sectionRenderer) {
        window.sectionRenderer.containerElement = container;
        window.sectionRenderer.renderExistingSections();
        console.log('✅ Renderer re-initialized');
    }
    
    console.groupEnd();
    return container;
};

// Test 4: Test sidebar button
window.testSidebarButton = function() {
    console.group('🧪 Test Sidebar Section Button');
    
    const addBtn = document.getElementById('add-section-btn');
    
    if (addBtn) {
        console.log('✅ Add section button found:', addBtn);
        console.log('🔘 Simulating click...');
        addBtn.click();
    } else {
        console.error('❌ Add section button not found');
        
        // Check layout tab
        const layoutTab = document.querySelector('[data-tab="layout"]');
        if (layoutTab) {
            console.log('📋 Switching to layout tab...');
            layoutTab.click();
            
            setTimeout(() => {
                const btn = document.getElementById('add-section-btn');
                if (btn) {
                    console.log('✅ Found button after tab switch');
                } else {
                    console.log('❌ Button still not found');
                }
            }, 100);
        }
    }
    
    console.groupEnd();
};

// Test 5: Full integration test
window.testSectionIntegration = function() {
    console.group('🧪 PHASE 3 FULL INTEGRATION TEST');
    
    console.log('1️⃣ Testing managers...');
    const managers = testSectionManagers();
    
    console.log('2️⃣ Fixing container...');
    const container = fixSectionContainer();
    
    if (container) {
        console.log('3️⃣ Creating test section...');
        const section = createTestSection();
        
        if (section) {
            console.log('4️⃣ Testing persistence...');
            if (window.sectionStatePersistence) {
                window.sectionStatePersistence.save().then(() => {
                    console.log('✅ Section saved successfully');
                }).catch((error) => {
                    console.error('❌ Save failed:', error);
                });
            }
        }
    }
    
    // Summary
    console.log('\n📊 INTEGRATION TEST SUMMARY:');
    const allPassed = Object.values(managers).every(v => v);
    if (allPassed && container) {
        console.log('✅ Section system is functional');
    } else {
        console.log('❌ Section system needs fixes');
        console.log('Missing:', Object.entries(managers).filter(([k,v]) => !v).map(([k]) => k));
    }
    
    console.groupEnd();
};

// Auto-run diagnostic
console.log('🧪 Section System Quick Test Ready!');
console.log('Commands:');
console.log('  testSectionManagers() - Check if managers are loaded');
console.log('  createTestSection() - Create a test section');
console.log('  fixSectionContainer() - Create/fix the section container');
console.log('  testSidebarButton() - Test the Add Section button');
console.log('  testSectionIntegration() - Run full integration test');

// Check initial state
setTimeout(() => {
    console.log('🔍 Initial check:');
    const hasManagers = !!window.sectionLayoutManager && !!window.sectionRenderer;
    const hasContainer = !!document.getElementById('gmkb-sections-container');
    console.log('  Managers loaded:', hasManagers);
    console.log('  Container exists:', hasContainer);
    
    if (hasManagers && !hasContainer) {
        console.log('⚠️ Managers loaded but no container - run fixSectionContainer()');
    }
}, 500);