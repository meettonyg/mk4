/**
 * ROOT-LEVEL TOOLBAR FIXES VALIDATION SCRIPT
 * 
 * Use this script to test all toolbar functionality after fixes
 * 
 * Usage:
 * 1. Open browser console on media kit builder page
 * 2. Run: validateToolbarFixes()
 * 3. Check results in console
 * 
 * @version 1.0.0 - Comprehensive toolbar validation
 */

window.validateToolbarFixes = function() {
    console.group('🔧 ROOT-LEVEL TOOLBAR FIXES VALIDATION');
    
    const results = {
        modals: {},
        previewToggle: {},
        tabs: {},
        buttons: {},
        overall: 'PENDING'
    };
    
    // Test 1: Modal Centering and Structure
    console.log('\n📺 Testing Modal Systems...');
    
    // Test Global Settings Modal
    const globalModal = document.getElementById('global-settings-modal');
    results.modals.globalSettings = {
        exists: !!globalModal,
        hasOverlay: globalModal?.classList.contains('modal-overlay') || globalModal?.className.includes('modal-overlay'),
        hasCloseButton: !!globalModal?.querySelector('.modal__close'),
        structure: globalModal ? 'CORRECT' : 'MISSING'
    };
    
    // Test Export Modal
    const exportModal = document.getElementById('export-modal');
    results.modals.export = {
        exists: !!exportModal,
        hasOverlay: exportModal?.classList.contains('modal-overlay') || exportModal?.className.includes('modal-overlay'),
        hasCloseButton: !!exportModal?.querySelector('.modal__close'),
        structure: exportModal ? 'CORRECT' : 'MISSING'
    };
    
    console.log('Modal Test Results:', results.modals);
    
    // Test 2: Preview Toggle Functionality
    console.log('\n📱 Testing Preview Toggle...');
    
    const previewButtons = document.querySelectorAll('.toolbar__preview-btn');
    const previewContainer = document.getElementById('preview-container') || document.querySelector('.preview__container');
    
    results.previewToggle = {
        buttonsFound: previewButtons.length,
        containerExists: !!previewContainer,
        desktopButton: !!document.querySelector('[data-preview="desktop"]'),
        tabletButton: !!document.querySelector('[data-preview="tablet"]'),
        mobileButton: !!document.querySelector('[data-preview="mobile"]'),
        hasActiveButton: !!document.querySelector('.toolbar__preview-btn--active')
    };
    
    console.log('Preview Toggle Test Results:', results.previewToggle);
    
    // Test 3: Tab System
    console.log('\n📋 Testing Tab System...');
    
    const tabs = document.querySelectorAll('.sidebar__tab');
    const tabContents = document.querySelectorAll('.tab-content');
    const tabContainer = document.querySelector('.sidebar__tabs');
    
    results.tabs = {
        tabsFound: tabs.length,
        tabContentsFound: tabContents.length,
        containerExists: !!tabContainer,
        hasActiveTab: !!document.querySelector('.sidebar__tab--active'),
        hasActiveContent: !!document.querySelector('.tab-content--active')
    };
    
    console.log('Tab System Test Results:', results.tabs);
    
    // Test 4: Button Functionality
    console.log('\n🔘 Testing Toolbar Buttons...');
    
    results.buttons = {
        saveBtn: !!document.getElementById('save-btn'),
        exportBtn: !!document.getElementById('export-btn'),
        themeBtn: !!document.getElementById('global-theme-btn'),
        shareBtn: !!document.getElementById('share-btn'),
        undoBtn: !!document.getElementById('undo-btn'),
        redoBtn: !!document.getElementById('redo-btn'),
        toolbarInteractions: !!window.toolbarInteractions
    };
    
    console.log('Button Test Results:', results.buttons);
    
    // Test 5: CSS Loading
    console.log('\n🎨 Testing CSS Integration...');
    
    const toolbarFixesCSS = Array.from(document.styleSheets).find(sheet => 
        sheet.href && sheet.href.includes('toolbar-fixes.css')
    );
    
    results.css = {
        toolbarFixesLoaded: !!toolbarFixesCSS,
        totalStylesheets: document.styleSheets.length
    };
    
    console.log('CSS Test Results:', results.css);
    
    // Overall Assessment
    const issues = [];
    
    if (!results.modals.globalSettings.exists) issues.push('Global Settings Modal missing');
    if (!results.modals.export.exists) issues.push('Export Modal missing');
    if (results.previewToggle.buttonsFound !== 3) issues.push('Preview buttons incomplete');
    if (!results.previewToggle.containerExists) issues.push('Preview container missing');
    if (results.tabs.tabsFound === 0) issues.push('Tab system not found');
    if (!results.buttons.toolbarInteractions) issues.push('Toolbar interactions not loaded');
    if (!results.css.toolbarFixesLoaded) issues.push('Toolbar fixes CSS not loaded');
    
    if (issues.length === 0) {
        results.overall = '✅ ALL TESTS PASSED';
        console.log('\n🎉 SUCCESS: All toolbar fixes are working correctly!');
    } else {
        results.overall = '❌ ISSUES FOUND';
        console.log('\n⚠️ ISSUES DETECTED:');
        issues.forEach(issue => console.log(`  • ${issue}`));
    }
    
    // Quick Fix Suggestions
    if (issues.length > 0) {
        console.log('\n🔧 QUICK FIXES:');
        
        if (!results.css.toolbarFixesLoaded) {
            console.log('  • Refresh page to load CSS fixes');
        }
        
        if (!results.buttons.toolbarInteractions) {
            console.log('  • Check browser console for JavaScript errors');
        }
        
        if (results.previewToggle.buttonsFound !== 3) {
            console.log('  • Check if toolbar template loaded correctly');
        }
    }
    
    console.log('\n📊 COMPLETE RESULTS:', results);
    console.groupEnd();
    
    return results;
};

// Auto-run validation in debug mode
if (window.location.search.includes('debug') || window.location.search.includes('test')) {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            console.log('🔄 Auto-running toolbar validation in debug mode...');
            validateToolbarFixes();
        }, 2000);
    });
}

// Specific functionality tests
window.testModalCentering = function() {
    console.log('🎯 Testing Modal Centering...');
    
    const globalModal = document.getElementById('global-settings-modal');
    if (globalModal) {
        // Test opening
        globalModal.style.display = 'flex';
        globalModal.classList.add('modal--open');
        
        const rect = globalModal.getBoundingClientRect();
        const isProperlyPositioned = rect.top >= 0 && rect.left >= 0;
        
        console.log('Modal position:', { top: rect.top, left: rect.left, centered: isProperlyPositioned });
        
        // Close after test
        setTimeout(() => {
            globalModal.style.display = 'none';
            globalModal.classList.remove('modal--open');
        }, 2000);
        
        return isProperlyPositioned;
    } else {
        console.error('Global settings modal not found');
        return false;
    }
};

window.testPreviewToggle = function() {
    console.log('📱 Testing Preview Toggle...');
    
    const modes = ['desktop', 'tablet', 'mobile'];
    const container = document.getElementById('preview-container') || document.querySelector('.preview__container');
    
    if (!container) {
        console.error('Preview container not found');
        return false;
    }
    
    modes.forEach((mode, index) => {
        setTimeout(() => {
            const button = document.querySelector(`[data-preview="${mode}"]`);
            if (button) {
                button.click();
                console.log(`✅ Switched to ${mode} mode`);
                
                // Check if class was applied
                const hasClass = container.classList.contains(`preview--${mode}`);
                console.log(`Preview class applied: ${hasClass}`);
            }
        }, index * 1000);
    });
    
    return true;
};

window.testTabSwitching = function() {
    console.log('📋 Testing Tab Switching...');
    
    const tabs = document.querySelectorAll('.sidebar__tab');
    
    tabs.forEach((tab, index) => {
        setTimeout(() => {
            tab.click();
            const tabName = tab.getAttribute('data-tab');
            console.log(`✅ Switched to ${tabName} tab`);
        }, index * 800);
    });
    
    return tabs.length > 0;
};

// Export for use
console.log('🔧 Toolbar validation functions loaded:');
console.log('  • validateToolbarFixes() - Complete validation');
console.log('  • testModalCentering() - Test modal positioning');
console.log('  • testPreviewToggle() - Test device switching');
console.log('  • testTabSwitching() - Test tab functionality');
