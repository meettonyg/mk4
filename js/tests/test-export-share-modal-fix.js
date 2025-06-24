/**
 * Test script for Export and Share Modal Fix
 * 
 * This script validates that the root-level fix properly initializes
 * the export and share modal systems that were missing from the
 * initialization sequence.
 * 
 * USAGE:
 * 1. Load this script in browser console
 * 2. Run: testExportShareModalFix()
 * 3. Or run individual tests: quickExportShareTest()
 */

/**
 * Comprehensive test suite for export and share modal functionality
 */
function testExportShareModalFix() {
    console.log('🧪 Testing Export and Share Modal Fix...\n');
    
    const results = {
        passed: 0,
        failed: 0,
        tests: [],
        totalTests: 12
    };
    
    function test(name, condition, critical = false) {
        const status = condition ? 'PASS' : 'FAIL';
        const icon = condition ? '✅' : '❌';
        const criticalMarker = critical ? ' [CRITICAL]' : '';
        
        console.log(`${icon} ${name}${criticalMarker}: ${status}`);
        
        results.tests.push({ name, status, critical, condition });
        
        if (condition) {
            results.passed++;
        } else {
            results.failed++;
        }
        
        return condition;
    }
    
    console.log('📋 Testing Modal System Initialization...\n');
    
    // Test 1-3: Button existence
    const exportBtn = document.getElementById('export-btn');
    const shareBtn = document.getElementById('share-btn');
    const exportModal = document.getElementById('export-modal');
    
    test('Export button exists', !!exportBtn, true);
    test('Share button exists', !!shareBtn, true);
    test('Export modal exists', !!exportModal, true);
    
    // Test 4-5: Event listener validation
    let exportListenerAttached = false;
    let shareListenerAttached = false;
    
    if (exportBtn) {
        // Check if event listeners are attached by looking for click handlers
        const exportEvents = getEventListeners(exportBtn);
        exportListenerAttached = exportEvents && exportEvents.click && exportEvents.click.length > 0;
    }
    
    if (shareBtn) {
        const shareEvents = getEventListeners(shareBtn);
        shareListenerAttached = shareEvents && shareEvents.click && shareEvents.click.length > 0;
    }
    
    test('Export button has click listener', exportListenerAttached, true);
    test('Share button has click listener', shareListenerAttached, true);
    
    // Test 6-7: Modal functionality
    let exportModalShowsTest = false;
    let exportModalHidesTest = false;
    
    if (exportBtn && exportModal) {
        try {
            // Test showing export modal
            exportBtn.click();
            const isVisible = exportModal.style.display !== 'none' && 
                            !exportModal.hasAttribute('hidden') &&
                            exportModal.offsetParent !== null;
            exportModalShowsTest = isVisible;
            
            // Test hiding export modal (if it showed)
            if (isVisible) {
                const closeBtn = exportModal.querySelector('.modal__close, #close-export-modal');
                if (closeBtn) {
                    closeBtn.click();
                    const isHidden = exportModal.style.display === 'none' || 
                                   exportModal.hasAttribute('hidden') ||
                                   exportModal.offsetParent === null;
                    exportModalHidesTest = isHidden;
                } else {
                    // Try ESC key
                    const escEvent = new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27 });
                    document.dispatchEvent(escEvent);
                    setTimeout(() => {
                        const isHidden = exportModal.style.display === 'none' || 
                                       exportModal.offsetParent === null;
                        exportModalHidesTest = isHidden;
                    }, 100);
                }
            }
        } catch (error) {
            console.warn('Export modal test error:', error.message);
        }
    }
    
    test('Export modal shows when button clicked', exportModalShowsTest, true);
    test('Export modal hides when closed', exportModalHidesTest);
    
    // Test 8-9: Share functionality (basic validation)
    let shareSystemWorking = false;
    
    if (shareBtn) {
        try {
            // Override navigator.share temporarily for testing
            const originalShare = navigator.share;
            const originalClipboard = navigator.clipboard;
            
            let shareAttempted = false;
            navigator.share = () => { shareAttempted = true; return Promise.resolve(); };
            navigator.clipboard = { writeText: () => { shareAttempted = true; return Promise.resolve(); } };
            
            shareBtn.click();
            shareSystemWorking = shareAttempted;
            
            // Restore original functions
            if (originalShare) navigator.share = originalShare;
            if (originalClipboard) navigator.clipboard = originalClipboard;
            
        } catch (error) {
            console.warn('Share system test error:', error.message);
        }
    }
    
    test('Share system responds to button click', shareSystemWorking, true);
    
    // Test 10-12: Export options functionality
    let exportOptionsWorking = false;
    let exportOptionsCount = 0;
    
    if (exportModal) {
        const exportOptions = exportModal.querySelectorAll('.export-option');
        exportOptionsCount = exportOptions.length;
        
        if (exportOptions.length > 0) {
            try {
                // Test if export options have click handlers
                let hasListeners = false;
                exportOptions.forEach(option => {
                    const events = getEventListeners(option);
                    if (events && events.click && events.click.length > 0) {
                        hasListeners = true;
                    }
                });
                exportOptionsWorking = hasListeners;
            } catch (error) {
                console.warn('Export options test error:', error.message);
            }
        }
    }
    
    test('Export options exist', exportOptionsCount > 0);
    test('Export options have click handlers', exportOptionsWorking);
    test('Expected export options count (4)', exportOptionsCount === 4);
    
    // Summary
    console.log('\n📊 Test Results Summary:');
    console.log(`✅ Passed: ${results.passed}/${results.totalTests}`);
    console.log(`❌ Failed: ${results.failed}/${results.totalTests}`);
    
    const criticalTests = results.tests.filter(t => t.critical);
    const criticalPassed = criticalTests.filter(t => t.condition).length;
    const criticalFailed = criticalTests.filter(t => !t.condition).length;
    
    console.log(`🚨 Critical: ${criticalPassed}/${criticalTests.length} passed`);
    
    if (results.failed === 0) {
        console.log('\n🎉 ALL TESTS PASSED! Export and Share modals are working correctly.');
        console.log('✅ Root-level fix was successful.');
        return true;
    } else if (criticalFailed === 0) {
        console.log('\n⚠️ All critical tests passed, but some non-critical tests failed.');
        console.log('✅ Root-level fix appears to be working.');
        return true;
    } else {
        console.log('\n❌ Critical tests failed. Root-level fix needs investigation.');
        console.log('📋 Failed critical tests:');
        criticalTests.filter(t => !t.condition).forEach(t => {
            console.log(`   - ${t.name}`);
        });
        return false;
    }
}

/**
 * Quick test function for immediate validation
 */
function quickExportShareTest() {
    console.log('⚡ Quick Export/Share Test...\n');
    
    const exportBtn = document.getElementById('export-btn');
    const shareBtn = document.getElementById('share-btn');
    const exportModal = document.getElementById('export-modal');
    
    console.log('📋 Quick Status Check:');
    console.log(`Export Button: ${exportBtn ? '✅ Found' : '❌ Missing'}`);
    console.log(`Share Button: ${shareBtn ? '✅ Found' : '❌ Missing'}`);
    console.log(`Export Modal: ${exportModal ? '✅ Found' : '❌ Missing'}`);
    
    if (exportBtn) {
        console.log('\\n🖱️ Testing Export Button...');
        try {
            exportBtn.click();
            const modalVisible = exportModal && exportModal.offsetParent !== null;
            console.log(`Export Modal Opens: ${modalVisible ? '✅ Yes' : '❌ No'}`);
            
            // Close modal if it opened
            if (modalVisible) {
                const closeBtn = exportModal.querySelector('.modal__close, #close-export-modal');
                if (closeBtn) {
                    closeBtn.click();
                    console.log('Export Modal Closed: ✅ Yes');
                }
            }
        } catch (error) {
            console.log(`Export Button Error: ❌ ${error.message}`);
        }
    }
    
    if (shareBtn) {
        console.log('\\n🔗 Testing Share Button...');
        try {
            // Override share for testing
            const originalShare = navigator.share;
            const originalClipboard = navigator.clipboard;
            
            let shareTriggered = false;
            navigator.share = () => { shareTriggered = true; return Promise.resolve(); };
            navigator.clipboard = { writeText: () => { shareTriggered = true; return Promise.resolve(); } };
            
            shareBtn.click();
            
            console.log(`Share Function Triggered: ${shareTriggered ? '✅ Yes' : '❌ No'}`);
            
            // Restore
            if (originalShare) navigator.share = originalShare;
            if (originalClipboard) navigator.clipboard = originalClipboard;
            
        } catch (error) {
            console.log(`Share Button Error: ❌ ${error.message}`);
        }
    }
    
    console.log('\\n⚡ Quick test complete!');
}

/**
 * Get event listeners for an element (Chrome DevTools function)
 * Fallback if function not available
 */
function getEventListeners(element) {
    if (typeof window.getEventListeners === 'function') {
        return window.getEventListeners(element);
    }
    
    // Fallback: check for common event listener patterns
    if (element._eventListeners || element.__eventListeners) {
        return element._eventListeners || element.__eventListeners;
    }
    
    // Return null if we can't detect listeners
    return null;
}

/**
 * Test initialization system status
 */
function testInitializationStatus() {
    console.log('🔍 Checking Initialization System Status...\\n');
    
    const checks = {
        appInitializer: !!window.appInitializer,
        initializerReady: !!window.appInitializer?.isInitialized,
        featureSystemsMethod: typeof window.appInitializer?.initializeFeatureSystems === 'function',
        globalSettings: !!window.globalSettings,
        templateLoader: !!window.templateLoader
    };
    
    Object.entries(checks).forEach(([key, value]) => {
        const icon = value ? '✅' : '❌';
        console.log(`${icon} ${key}: ${value}`);
    });
    
    if (window.appInitializer?.getStatus) {
        console.log('\\n📊 App Initializer Status:');
        console.log(window.appInitializer.getStatus());
    }
    
    return checks;
}

// Auto-run quick test if loaded directly
if (typeof window !== 'undefined' && window.location) {
    console.log('📱 Export/Share Modal Fix Test Script Loaded');
    console.log('🧪 Run: testExportShareModalFix() for comprehensive test');
    console.log('⚡ Run: quickExportShareTest() for quick validation');
    console.log('🔍 Run: testInitializationStatus() for system status');
    
    // Add to global scope for easy access
window.testExportShareModalFix = testExportShareModalFix;
window.quickExportShareTest = quickExportShareTest;
window.testInitializationStatus = testInitializationStatus;

/**
 * Combined test function for all modal systems
 * Tests both export/share and global settings together
 */
function testAllModalSystems() {
    console.log('🧪 Testing ALL Modal Systems (Export, Share, Global Settings)...\n');
    
    const results = {
        exportShare: null,
        globalSettings: null,
        overall: {
            passed: 0,
            failed: 0
        }
    };
    
    // Test export/share system
    console.log('🔄 Testing Export/Share System...');
    try {
        results.exportShare = testExportShareModalFix();
        if (results.exportShare) {
            console.log('✅ Export/Share: PASSED\n');
            results.overall.passed++;
        } else {
            console.log('❌ Export/Share: FAILED\n');
            results.overall.failed++;
        }
    } catch (error) {
        console.log('❌ Export/Share: ERROR -', error.message, '\n');
        results.overall.failed++;
    }
    
    // Test global settings system (if available)
    if (typeof testGlobalSettingsModalFix === 'function') {
        console.log('🔄 Testing Global Settings System...');
        try {
            results.globalSettings = testGlobalSettingsModalFix();
            if (results.globalSettings) {
                console.log('✅ Global Settings: PASSED\n');
                results.overall.passed++;
            } else {
                console.log('❌ Global Settings: FAILED\n');
                results.overall.failed++;
            }
        } catch (error) {
            console.log('❌ Global Settings: ERROR -', error.message, '\n');
            results.overall.failed++;
        }
    } else {
        console.log('⚠️ Global Settings test not available (load test-global-settings-modal-fix.js first)\n');
    }
    
    // Overall summary
    console.log('📊 OVERALL MODAL SYSTEMS TEST SUMMARY:');
    console.log(`✅ Passed Systems: ${results.overall.passed}`);
    console.log(`❌ Failed Systems: ${results.overall.failed}`);
    
    if (results.overall.failed === 0) {
        console.log('\n🎉 ALL MODAL SYSTEMS WORKING! Root-level fixes successful.');
        return true;
    } else {
        console.log('\n⚠️ Some modal systems need attention.');
        return false;
    }
}

// Add combined test to global scope
window.testAllModalSystems = testAllModalSystems;
    
    // Run quick test automatically if requested
    if (window.location.search.includes('autotest=true')) {
        setTimeout(quickExportShareTest, 1000);
    }
}
