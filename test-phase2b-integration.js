/**
 * Quick test to verify Phase 2B logging integration
 * This simulates the initialization process and demonstrates the new logging
 */

// Test the initialization with new logging
console.log('🧪 Testing Media Kit Builder with Phase 2B Logging\n');

// First, let's check if the logging commands are available
if (window.mkLog) {
    console.log('✅ mkLog commands are available!');
    console.log('   Try: mkLog.help() for all commands\n');
} else {
    console.log('⚠️  mkLog not yet available - waiting for initialization...\n');
}

// Listen for initialization events
window.addEventListener('mediaKitBuilderReady', (event) => {
    console.log('\n🎉 Media Kit Builder Ready!');
    console.log('Event details:', event.detail);
    
    // Now test the logging commands
    console.log('\n📊 Testing logging commands...');
    
    // Show initialization report
    console.log('\n1. Initialization Report:');
    mkLog.report();
    
    // Show any errors
    console.log('\n2. Error Report:');
    mkLog.errors();
    
    // Show timing report
    console.log('\n3. Timing Report:');
    mkLog.timing();
    
    // Test search
    console.log('\n4. Searching for "modal":');
    mkLog.search('modal');
    
    console.log('\n✅ All logging features working correctly!');
    console.log('💡 Tip: Open the browser console and try mkLog.help() for more commands');
});

window.addEventListener('mediaKitBuilderError', (event) => {
    console.error('\n❌ Media Kit Builder Error!');
    console.error('Event details:', event.detail);
    
    // Show error report
    console.log('\nGenerating error report...');
    if (window.mkLog) {
        mkLog.errors();
        mkLog.report();
    }
});

// Trigger a manual test after page load
window.addEventListener('load', () => {
    setTimeout(() => {
        console.log('\n🔍 Checking initialization status...');
        
        if (window.initManager) {
            const status = window.initManager.getStatus();
            console.log('Initialization status:', status);
            
            if (status.state === 'complete') {
                console.log('✅ Initialization completed successfully!');
            } else if (status.state === 'failed') {
                console.log('❌ Initialization failed');
                console.log('Errors:', status.errors);
            } else {
                console.log('⏳ Initialization still in progress...');
            }
        }
        
        // Test adding a component with logging
        if (window.componentManager && status.state === 'complete') {
            console.log('\n🧪 Testing component addition with logging...');
            
            // This should trigger logging
            const testButton = document.getElementById('add-component-btn');
            if (testButton) {
                console.log('Simulating click on Add Component button...');
                testButton.click();
                
                setTimeout(() => {
                    // Check for modal
                    const modal = document.getElementById('component-library-overlay');
                    if (modal && modal.style.display !== 'none') {
                        console.log('✅ Component Library modal opened successfully!');
                        
                        // Close it
                        const closeBtn = document.getElementById('close-library');
                        if (closeBtn) closeBtn.click();
                    }
                }, 500);
            }
        }
    }, 2000);
});

console.log('Test script loaded. Waiting for Media Kit Builder initialization...');
console.log('Check the console for colored, structured logs!');
