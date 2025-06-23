// Test script for Phase 2A - Modal Race Condition Fix
// Run this to verify that modals are properly initialized

console.log('🧪 Testing Phase 2A - Modal Race Condition Fix');
console.log('================================================');

// Test 1: Check if all modal elements exist
function testModalElements() {
    console.log('\n📋 Test 1: Modal Element Existence');
    const modals = {
        'component-library-overlay': 'Component Library Modal',
        'template-library-modal': 'Template Library Modal',
        'global-settings-modal': 'Global Settings Modal',
        'export-modal': 'Export Modal'
    };
    
    let allFound = true;
    for (const [id, name] of Object.entries(modals)) {
        const element = document.getElementById(id);
        if (element) {
            console.log(`✅ ${name} found (${id})`);
        } else {
            console.log(`❌ ${name} NOT FOUND (${id})`);
            allFound = false;
        }
    }
    
    return allFound;
}

// Test 2: Check if buttons have event listeners
function testButtonListeners() {
    console.log('\n📋 Test 2: Button Event Listeners');
    const buttons = {
        'add-component-btn': 'Add Component Button',
        'load-template': 'Load Template Button',
        'global-theme-btn': 'Global Theme Button'
    };
    
    let allSetup = true;
    for (const [id, name] of Object.entries(buttons)) {
        const button = document.getElementById(id);
        if (!button) {
            console.log(`⚠️ ${name} not found (${id})`);
            allSetup = false;
        } else if (button.hasAttribute('data-listener-attached')) {
            console.log(`✅ ${name} has listener attached`);
        } else {
            console.log(`❌ ${name} missing listener`);
            allSetup = false;
        }
    }
    
    return allSetup;
}

// Test 3: Check initialization status
function testInitializationStatus() {
    console.log('\n📋 Test 3: Initialization Status');
    
    if (window.initManager) {
        const status = window.initManager.getStatus();
        console.log('State:', status.state);
        console.log('Duration:', status.duration + 'ms');
        console.log('Steps completed:', status.steps.map(s => s.name).join(' → '));
        
        if (status.state === 'complete') {
            console.log('✅ Initialization completed successfully');
            return true;
        } else {
            console.log('❌ Initialization not complete');
            if (status.errors.length > 0) {
                console.log('Errors:', status.errors);
            }
            return false;
        }
    } else {
        console.log('❌ Initialization manager not available');
        return false;
    }
}

// Test 4: Try clicking modal buttons
async function testModalFunctionality() {
    console.log('\n📋 Test 4: Modal Functionality');
    
    const componentBtn = document.getElementById('add-component-btn');
    if (componentBtn) {
        console.log('Testing Component Library modal...');
        componentBtn.click();
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const modal = document.getElementById('component-library-overlay');
        if (modal && modal.classList.contains('modal--open')) {
            console.log('✅ Component Library modal opens correctly');
            
            // Close it
            const closeBtn = document.getElementById('close-library');
            if (closeBtn) {
                closeBtn.click();
                await new Promise(resolve => setTimeout(resolve, 100));
                
                if (!modal.classList.contains('modal--open')) {
                    console.log('✅ Component Library modal closes correctly');
                    return true;
                }
            }
        } else {
            console.log('❌ Component Library modal did not open');
            return false;
        }
    }
    
    return false;
}

// Run all tests
async function runAllTests() {
    const results = {
        modalElements: testModalElements(),
        buttonListeners: testButtonListeners(),
        initialization: testInitializationStatus(),
        functionality: await testModalFunctionality()
    };
    
    console.log('\n📊 Test Summary');
    console.log('===============');
    let passCount = 0;
    for (const [test, passed] of Object.entries(results)) {
        console.log(`${test}: ${passed ? '✅ PASS' : '❌ FAIL'}`);
        if (passed) passCount++;
    }
    
    const successRate = (passCount / Object.keys(results).length * 100).toFixed(1);
    console.log(`\nSuccess Rate: ${successRate}%`);
    
    if (successRate === '100.0') {
        console.log('\n🎉 All tests passed! Modal race condition is FIXED!');
    } else {
        console.log('\n⚠️ Some tests failed. Check the details above.');
    }
    
    return results;
}

// Wait for initialization to complete before running tests
if (document.readyState === 'complete' && window.initManager?.getStatus().state === 'complete') {
    runAllTests();
} else {
    console.log('⏳ Waiting for initialization to complete...');
    window.addEventListener('mediaKitBuilderReady', () => {
        console.log('✅ Media Kit Builder ready, running tests...');
        runAllTests();
    });
}
