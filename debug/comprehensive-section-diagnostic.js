/**
 * Comprehensive Section System Diagnostic
 * ROOT FIX: Identifies why SectionRenderer and SidebarSectionIntegration aren't working
 */

(function() {
    console.log('==================================================');
    console.log('🔍 COMPREHENSIVE SECTION SYSTEM DIAGNOSTIC');
    console.log('==================================================');
    console.log('Timestamp:', new Date().toISOString());
    
    // Phase 1: Check if scripts are loaded
    console.log('\n📋 PHASE 1: Script Load Check');
    console.log('--------------------------------');
    
    const scriptChecks = [
        { name: 'SectionLayoutManager.js', selector: 'script[src*="SectionLayoutManager.js"]' },
        { name: 'SectionRenderer.js', selector: 'script[src*="SectionRenderer.js"]' },
        { name: 'sidebar-section-integration.js', selector: 'script[src*="sidebar-section-integration.js"]' },
        { name: 'section-controls.js', selector: 'script[src*="section-controls.js"]' },
        { name: 'section-templates.js', selector: 'script[src*="section-templates.js"]' }
    ];
    
    scriptChecks.forEach(check => {
        const script = document.querySelector(check.selector);
        if (script) {
            console.log(`✅ ${check.name} found in DOM`);
            console.log(`   URL: ${script.src}`);
        } else {
            console.error(`❌ ${check.name} NOT found in DOM`);
        }
    });
    
    // Phase 2: Check if classes are defined
    console.log('\n📋 PHASE 2: Class Definition Check');
    console.log('--------------------------------');
    
    const classChecks = [
        'SectionLayoutManager',
        'SectionRenderer',
        'SidebarSectionIntegration',
        'SectionTemplateManager'
    ];
    
    classChecks.forEach(className => {
        if (window[className]) {
            console.log(`✅ window.${className} class exists`);
            console.log(`   Type: ${typeof window[className]}`);
        } else {
            console.error(`❌ window.${className} class NOT defined`);
        }
    });
    
    // Phase 3: Check if instances exist
    console.log('\n📋 PHASE 3: Instance Check');
    console.log('--------------------------------');
    
    const instanceChecks = [
        { name: 'sectionLayoutManager', expected: 'SectionLayoutManager' },
        { name: 'sectionRenderer', expected: 'SectionRenderer' },
        { name: 'sidebarSectionIntegration', expected: 'SidebarSectionIntegration' },
        { name: 'sectionTemplateManager', expected: 'SectionTemplateManager' }
    ];
    
    instanceChecks.forEach(check => {
        if (window[check.name]) {
            console.log(`✅ window.${check.name} instance exists`);
            const isCorrectType = window[check.name].constructor.name === check.expected;
            if (isCorrectType) {
                console.log(`   ✅ Correct type: ${check.expected}`);
            } else {
                console.warn(`   ⚠️ Unexpected type: ${window[check.name].constructor.name}`);
            }
        } else {
            console.error(`❌ window.${check.name} instance NOT created`);
        }
    });
    
    // Phase 4: Check factory functions
    console.log('\n📋 PHASE 4: Factory Function Check');
    console.log('--------------------------------');
    
    if (window.getSectionRenderer) {
        console.log('✅ getSectionRenderer factory exists');
        try {
            const renderer = window.getSectionRenderer();
            console.log(`   ✅ Factory returns: ${renderer ? renderer.constructor.name : 'null'}`);
        } catch (e) {
            console.error('   ❌ Factory throws error:', e.message);
        }
    } else {
        console.error('❌ getSectionRenderer factory NOT defined');
    }
    
    // Phase 5: Check DOM elements
    console.log('\n📋 PHASE 5: DOM Element Check');
    console.log('--------------------------------');
    
    const domChecks = [
        { id: 'saved-components-container', description: 'Main container' },
        { id: 'gmkb-sections-container', description: 'Sections container' },
        { id: 'media-kit-preview', description: 'Preview area' },
        { id: 'add-section-btn', description: 'Add Section button' },
        { id: 'use-template-btn', description: 'Use Template button' },
        { id: 'duplicate-section-btn', description: 'Duplicate button' }
    ];
    
    domChecks.forEach(check => {
        const element = document.getElementById(check.id);
        if (element) {
            console.log(`✅ ${check.description} (#${check.id}) exists`);
            const isVisible = element.style.display !== 'none' && element.offsetParent !== null;
            console.log(`   ${isVisible ? '✅ Visible' : '⚠️ Hidden'}`);
        } else {
            console.error(`❌ ${check.description} (#${check.id}) NOT found`);
        }
    });
    
    // Phase 6: Test initialization
    console.log('\n📋 PHASE 6: Manual Initialization Test');
    console.log('--------------------------------');
    
    // Try to manually create instances if they don't exist
    if (!window.sectionRenderer && window.SectionRenderer) {
        console.log('🔧 Attempting manual SectionRenderer creation...');
        try {
            window.sectionRenderer = new window.SectionRenderer();
            console.log('✅ SectionRenderer manually created');
        } catch (e) {
            console.error('❌ Manual creation failed:', e.message);
            console.error('Stack:', e.stack);
        }
    }
    
    if (!window.sidebarSectionIntegration && window.SidebarSectionIntegration) {
        console.log('🔧 Attempting manual SidebarSectionIntegration creation...');
        try {
            window.sidebarSectionIntegration = new window.SidebarSectionIntegration();
            console.log('✅ SidebarSectionIntegration manually created');
        } catch (e) {
            console.error('❌ Manual creation failed:', e.message);
            console.error('Stack:', e.stack);
        }
    }
    
    // Phase 7: Test section creation
    console.log('\n📋 PHASE 7: Section Creation Test');
    console.log('--------------------------------');
    
    if (window.sectionLayoutManager && window.sectionRenderer) {
        console.log('🧪 Testing section creation...');
        try {
            const testSectionId = `diagnostic_section_${Date.now()}`;
            const section = window.sectionLayoutManager.registerSection(testSectionId, 'full_width');
            
            if (section) {
                console.log(`✅ Test section created: ${testSectionId}`);
                
                // Dispatch event for renderer
                const event = new CustomEvent('gmkb:section-registered', {
                    detail: {
                        sectionId: testSectionId,
                        section: section,
                        sectionLayoutManager: window.sectionLayoutManager
                    }
                });
                document.dispatchEvent(event);
                
                // Check if it rendered
                setTimeout(() => {
                    const sectionElement = document.getElementById(`section-${testSectionId}`);
                    if (sectionElement) {
                        console.log('✅ Section rendered in DOM');
                        // Clean up
                        sectionElement.remove();
                    } else {
                        console.error('❌ Section NOT rendered in DOM');
                    }
                }, 500);
            } else {
                console.error('❌ Failed to create test section');
            }
        } catch (e) {
            console.error('❌ Section creation test failed:', e.message);
        }
    } else {
        console.warn('⚠️ Cannot test section creation - missing dependencies');
    }
    
    // Summary
    console.log('\n==================================================');
    console.log('📊 DIAGNOSTIC SUMMARY');
    console.log('==================================================');
    
    const problems = [];
    
    if (!window.SectionRenderer) problems.push('SectionRenderer class not defined');
    if (!window.sectionRenderer) problems.push('sectionRenderer instance not created');
    if (!window.SidebarSectionIntegration) problems.push('SidebarSectionIntegration class not defined');
    if (!window.sidebarSectionIntegration) problems.push('sidebarSectionIntegration instance not created');
    if (!document.querySelector('script[src*="SectionRenderer.js"]')) problems.push('SectionRenderer.js not loaded');
    if (!document.querySelector('script[src*="sidebar-section-integration.js"]')) problems.push('sidebar-section-integration.js not loaded');
    
    if (problems.length === 0) {
        console.log('✅ All systems operational!');
        console.log('The section system should be working.');
    } else {
        console.error('❌ Problems detected:');
        problems.forEach((problem, i) => {
            console.error(`   ${i + 1}. ${problem}`);
        });
        
        console.log('\n💡 RECOMMENDED FIXES:');
        if (!document.querySelector('script[src*="SectionRenderer.js"]')) {
            console.log('1. Check enqueue.php - SectionRenderer.js may not be enqueued');
            console.log('2. Check file path - system/SectionRenderer.js should exist');
        }
        if (window.SectionRenderer && !window.sectionRenderer) {
            console.log('1. Class exists but instance not created - check for JS errors');
            console.log('2. Try manual creation: window.sectionRenderer = new SectionRenderer()');
        }
    }
    
    console.log('\n🔧 Quick Fix Commands:');
    console.log('window.fixSectionSystem() - Attempt automatic fixes');
    console.log('window.testAddSection() - Test adding a section');
    
    // Provide fix function
    window.fixSectionSystem = function() {
        console.log('🔧 Attempting to fix section system...');
        
        let fixed = false;
        
        if (!window.sectionRenderer && window.SectionRenderer) {
            window.sectionRenderer = new window.SectionRenderer();
            console.log('✅ Created sectionRenderer instance');
            fixed = true;
        }
        
        if (!window.sidebarSectionIntegration && window.SidebarSectionIntegration) {
            window.sidebarSectionIntegration = new window.SidebarSectionIntegration();
            console.log('✅ Created sidebarSectionIntegration instance');
            fixed = true;
        }
        
        if (fixed) {
            console.log('✅ Fixes applied! Try using the Layout buttons now.');
        } else {
            console.log('⚠️ No fixes needed or unable to fix.');
        }
    };
    
    window.testAddSection = function() {
        if (!window.sectionLayoutManager) {
            console.error('❌ SectionLayoutManager not available');
            return;
        }
        
        const testId = `test_${Date.now()}`;
        const section = window.sectionLayoutManager.registerSection(testId, 'two_column');
        
        if (section) {
            console.log(`✅ Section created: ${testId}`);
            
            // Trigger render
            if (window.sectionRenderer) {
                window.sectionRenderer.renderSection(section);
            }
            
            // Dispatch event
            document.dispatchEvent(new CustomEvent('gmkb:section-registered', {
                detail: { sectionId: testId, section }
            }));
            
            return testId;
        } else {
            console.error('❌ Failed to create section');
        }
    };
    
})();
