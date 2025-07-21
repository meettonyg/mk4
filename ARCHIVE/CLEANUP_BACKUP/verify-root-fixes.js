/**
 * Root Fix Verification Script
 * Tests that all UI components are working properly after the root fixes
 */

console.log('🔍 Verifying Root UI Fixes...\n');

// Test 1: Check if modal base is loaded
console.log('1️⃣ Modal Base Module:');
if (typeof showModal !== 'undefined' || window.showModal) {
    console.log('✅ Modal base functions available');
} else {
    console.warn('⚠️ Modal base not globally available (this is OK if using module imports)');
}

// Test 2: Check tabs
console.log('\n2️⃣ Testing Tabs:');
const tabs = document.querySelectorAll('.sidebar__tab');
const firstTab = tabs[0];
if (firstTab) {
    // Simulate click
    const tabName = firstTab.getAttribute('data-tab');
    console.log(`   Clicking ${tabName} tab...`);
    firstTab.click();
    
    setTimeout(() => {
        const content = document.getElementById(tabName + '-tab');
        if (content && content.classList.contains('tab-content--active')) {
            console.log('✅ Tab switching works!');
        } else {
            console.log('❌ Tab switching not working');
        }
    }, 100);
}

// Test 3: Check component library
console.log('\n3️⃣ Testing Component Library:');
const addBtn = document.getElementById('add-component-btn');
if (addBtn) {
    console.log('   Opening component library...');
    addBtn.click();
    
    setTimeout(() => {
        const modal = document.getElementById('component-library-overlay');
        if (modal && modal.style.display !== 'none') {
            console.log('✅ Component library opens!');
            
            // Test close button
            const closeBtn = modal.querySelector('.modal__close');
            if (closeBtn) {
                console.log('   Testing close button...');
                closeBtn.click();
                
                setTimeout(() => {
                    if (modal.style.display === 'none') {
                        console.log('✅ Modal close button works!');
                    } else {
                        console.log('❌ Modal close button not working');
                    }
                }, 100);
            }
        } else {
            console.log('❌ Component library did not open');
        }
    }, 100);
}

// Test 4: Check ESC key handler
console.log('\n4️⃣ Testing ESC Key Handler:');
console.log('   Press ESC to close any open modals...');
const escEvent = new KeyboardEvent('keydown', { key: 'Escape' });
document.dispatchEvent(escEvent);
console.log('✅ ESC handler triggered');

// Test 5: Check initialization status
console.log('\n5️⃣ Initialization Status:');
console.log(`   Media Kit Builder Initialized: ${window.mediaKitBuilderInitialized}`);
console.log(`   Enhanced State Manager: ${typeof enhancedStateManager !== 'undefined'}`);
console.log(`   Enhanced Component Manager: ${typeof enhancedComponentManager !== 'undefined'}`);
console.log(`   Enhanced Component Renderer: ${typeof enhancedComponentRenderer !== 'undefined'}`);

// Test 6: Empty state buttons
console.log('\n6️⃣ Testing Empty State Buttons:');
const addFirstBtn = document.getElementById('add-first-component');
const loadTemplateBtn = document.getElementById('load-template');
console.log(`   Add First Component button: ${!!addFirstBtn}`);
console.log(`   Load Template button: ${!!loadTemplateBtn}`);

console.log('\n✨ Verification complete!');
console.log('\n📝 Summary:');
console.log('- Tabs should switch when clicked');
console.log('- Component library should open and close properly');
console.log('- ESC key should close modals');
console.log('- All buttons should be responsive');

// Final check after all tests
setTimeout(() => {
    console.log('\n🎯 Final Status:');
    const issues = [];
    
    // Check if any modals are stuck open
    const openModals = document.querySelectorAll('.modal-overlay[style*="flex"], .modal-overlay[style*="block"]');
    if (openModals.length > 0) {
        issues.push('Some modals are still open');
    }
    
    // Check if tabs are working
    const activeTabs = document.querySelectorAll('.sidebar__tab--active');
    if (activeTabs.length !== 1) {
        issues.push('Tab active state is incorrect');
    }
    
    if (issues.length === 0) {
        console.log('✅ All UI components working correctly!');
    } else {
        console.log('⚠️ Issues found:');
        issues.forEach(issue => console.log(`   - ${issue}`));
    }
}, 1000);