/**
 * @file manual-race-condition-test.js
 * @description Manual test that can be run directly in console to test race condition fix
 * Independent of initialization system - can be pasted directly into browser console
 */

// Manual test function that can be pasted into console
window.manualRaceConditionTest = function() {
    console.log('🧪 Manual Race Condition Test (Console Safe)...');
    
    // Test 1: Check if authority-hook component can be added without errors
    const testResults = {
        componentManagerAvailable: false,
        authorityHookSuccess: false,
        noAbortErrors: true,
        noRenderingErrors: true,
        coordinationWorking: false
    };
    
    // Check component manager
    if (window.enhancedComponentManager && typeof window.enhancedComponentManager.addComponent === 'function') {
        testResults.componentManagerAvailable = true;
        console.log('✅ Enhanced component manager available');
        
        // Test authority-hook component addition
        try {
            console.log('🧪 Testing authority-hook component addition...');
            
            // Capture console errors
            const originalError = console.error;
            const errors = [];
            console.error = (...args) => {
                errors.push(args.join(' '));
                originalError.apply(console, args);
            };
            
            // Try to add authority-hook component
            const componentId = window.enhancedComponentManager.addComponent('authority-hook');
            
            // Restore console.error
            console.error = originalError;
            
            if (componentId) {
                testResults.authorityHookSuccess = true;
                console.log(`✅ Authority-hook component added successfully: ${componentId}`);
                
                // Check for abort errors
                const abortErrors = errors.filter(error => 
                    error.includes('aborted') || 
                    error.includes('signal is aborted')
                );
                
                if (abortErrors.length > 0) {
                    testResults.noAbortErrors = false;
                    console.log('❌ Abort errors detected:', abortErrors);
                } else {
                    console.log('✅ No abort errors detected');
                }
                
                // Check for rendering errors
                const renderErrors = errors.filter(error => 
                    error.includes('Error rendering component') ||
                    error.includes('authority-hook')
                );
                
                if (renderErrors.length > 0) {
                    testResults.noRenderingErrors = false;
                    console.log('❌ Rendering errors detected:', renderErrors);
                } else {
                    console.log('✅ No rendering errors detected');
                }
                
                // Clean up - remove the component
                try {
                    if (window.enhancedComponentManager.removeComponent) {
                        window.enhancedComponentManager.removeComponent(componentId);
                        console.log('🧹 Test component cleaned up');
                    }
                } catch (cleanupError) {
                    console.log('⚠️ Cleanup error (non-critical):', cleanupError.message);
                }
                
            } else {
                console.log('❌ Authority-hook component addition failed - no ID returned');
            }
            
        } catch (error) {
            console.log('❌ Authority-hook component test failed:', error.message);
            
            if (error.message.includes('aborted')) {
                testResults.noAbortErrors = false;
                console.log('❌ Race condition still present - abort error detected');
            }
        }
        
    } else {
        console.log('❌ Enhanced component manager not available');
    }
    
    // Test coordination manager
    if (window.startupCoordinationManager) {
        try {
            const status = window.startupCoordinationManager.getStatus();
            if (status.state === 'COMPLETE' && !status.renderingBlocked) {
                testResults.coordinationWorking = true;
                console.log('✅ Coordination manager working properly');
            } else {
                console.log('⚠️ Coordination manager status:', status);
            }
        } catch (error) {
            console.log('❌ Coordination manager error:', error.message);
        }
    } else {
        console.log('⚠️ Coordination manager not available');
    }
    
    // Summary
    const successCount = Object.values(testResults).filter(Boolean).length;
    const totalTests = Object.keys(testResults).length;
    
    console.log('\n📊 Manual Test Results:');
    console.log(`  Success Rate: ${successCount}/${totalTests}`);
    console.log(`  Component Manager: ${testResults.componentManagerAvailable ? '✅' : '❌'}`);
    console.log(`  Authority-Hook Success: ${testResults.authorityHookSuccess ? '✅' : '❌'}`);
    console.log(`  No Abort Errors: ${testResults.noAbortErrors ? '✅' : '❌'}`);
    console.log(`  No Rendering Errors: ${testResults.noRenderingErrors ? '✅' : '❌'}`);
    console.log(`  Coordination Working: ${testResults.coordinationWorking ? '✅' : '❌'}`);
    
    if (testResults.authorityHookSuccess && testResults.noAbortErrors && testResults.noRenderingErrors) {
        console.log('\n🎉 RACE CONDITION APPEARS FIXED!');
        console.log('✅ Authority-hook component renders without abort errors');
    } else if (testResults.componentManagerAvailable && !testResults.authorityHookSuccess) {
        console.log('\n⚠️ Component addition failed - check component manager status');
    } else if (!testResults.noAbortErrors) {
        console.log('\n❌ Race condition still present - abort errors detected');
        console.log('🔧 Try running quickDiagnostic.emergencyBypass()');
    } else {
        console.log('\n⚠️ Partial success - some issues remain');
    }
    
    return testResults;
};

// Simple authority-hook test function
window.testAuthorityHook = function() {
    console.log('🎯 Simple Authority-Hook Test...');
    
    if (!window.enhancedComponentManager) {
        console.log('❌ Enhanced component manager not available');
        return false;
    }
    
    try {
        console.log('Adding authority-hook component...');
        const id = window.enhancedComponentManager.addComponent('authority-hook');
        
        if (id) {
            console.log(`✅ Success! Component ID: ${id}`);
            console.log('🎉 No race condition detected!');
            
            // Clean up
            setTimeout(() => {
                if (window.enhancedComponentManager.removeComponent) {
                    window.enhancedComponentManager.removeComponent(id);
                    console.log('🧹 Test component removed');
                }
            }, 1000);
            
            return true;
        } else {
            console.log('❌ Failed - no component ID returned');
            return false;
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
        if (error.message.includes('aborted')) {
            console.log('🚫 Race condition detected - template fetch was aborted');
        }
        return false;
    }
};

console.log('🧪 Manual Race Condition Tests Loaded!');
console.log('📚 Console Commands:');
console.log('  manualRaceConditionTest()  - Comprehensive manual test');
console.log('  testAuthorityHook()        - Simple authority-hook test');
console.log('  quickDiagnostic()          - System diagnostic');
console.log('  quickDiagnostic.emergencyBypass() - Emergency bypass');
