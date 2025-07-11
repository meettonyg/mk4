/**
 * System Validation Test - Verify Missing Methods Fix
 * 
 * This script tests that the missing methods have been properly implemented
 * and that the system registrar validation now passes.
 * 
 * @version 1.0.0-fix-validation
 */

console.log('🧪 Starting System Validation Test...');

/**
 * Test the enhanced error handler methods
 */
function testEnhancedErrorHandler() {
    console.group('🛡️ Testing Enhanced Error Handler');
    
    try {
        // Import the enhanced error handler
        if (window.enhancedErrorHandler) {
            const handler = window.enhancedErrorHandler;
            
            // Test handleError method exists
            if (typeof handler.handleError === 'function') {
                console.log('✅ handleError method exists');
                
                // Test the method with a simple error
                handler.handleError('Test error for validation', { 
                    module: 'VALIDATION_TEST',
                    severity: 'low',
                    errorType: 'validation-error'
                });
                console.log('✅ handleError method executes successfully');
            } else {
                console.error('❌ handleError method missing');
            }
            
            // Test displayError method exists
            if (typeof handler.displayError === 'function') {
                console.log('✅ displayError method exists');
                
                // Test the method with a simple message
                setTimeout(() => {
                    handler.displayError('Test error message for validation', {
                        module: 'VALIDATION_TEST',
                        severity: 'low',
                        errorType: 'validation-error'
                    });
                    console.log('✅ displayError method executes successfully');
                    
                    // Hide the test error panel after 2 seconds
                    setTimeout(() => {
                        const testPanels = document.querySelectorAll('.error-guidance-panel');
                        testPanels.forEach(panel => {
                            if (panel.textContent.includes('Test error message for validation')) {
                                panel.remove();
                                console.log('🧹 Cleaned up test error panel');
                            }
                        });
                    }, 2000);
                }, 100);
            } else {
                console.error('❌ displayError method missing');
            }
            
        } else {
            console.error('❌ Enhanced Error Handler not available on window');
        }
        
    } catch (error) {
        console.error('❌ Error testing Enhanced Error Handler:', error);
    }
    
    console.groupEnd();
}

/**
 * Test the MKCG data mapper methods
 */
function testMKCGDataMapper() {
    console.group('🔗 Testing MKCG Data Mapper');
    
    try {
        // Import the MKCG data mapper
        if (window.mkcgDataMapper) {
            const mapper = window.mkcgDataMapper;
            
            // Test mapDataToComponent method exists (this should already exist)
            if (typeof mapper.mapDataToComponent === 'function') {
                console.log('✅ mapDataToComponent method exists');
            } else {
                console.error('❌ mapDataToComponent method missing');
            }
            
            // Test getDataAvailability method exists (this is the new one)
            if (typeof mapper.getDataAvailability === 'function') {
                console.log('✅ getDataAvailability method exists');
                
                // Test the method
                const availability = mapper.getDataAvailability();
                console.log('✅ getDataAvailability method executes successfully');
                console.log('📊 Data availability result:', availability);
                
                // Test with specific component type
                const heroAvailability = mapper.getDataAvailability('hero');
                console.log('✅ getDataAvailability for specific component:', heroAvailability);
                
            } else {
                console.error('❌ getDataAvailability method missing');
            }
            
        } else {
            console.error('❌ MKCG Data Mapper not available on window');
        }
        
    } catch (error) {
        console.error('❌ Error testing MKCG Data Mapper:', error);
    }
    
    console.groupEnd();
}

/**
 * Test the system registrar validation
 */
function testSystemRegistrarValidation() {
    console.group('📋 Testing System Registrar Validation');
    
    try {
        if (window.systemRegistrar) {
            const registrar = window.systemRegistrar;
            
            // Get current system status
            const coreSystemsStatus = registrar.areCoreSytemsReady();
            console.log('📊 Core systems status:', coreSystemsStatus);
            
            // Generate debug report
            const debugReport = registrar.generateDebugReport();
            console.log('📈 Debug report generated successfully');
            
            // Check if enhanced error handler validation passes
            if (window.enhancedErrorHandler) {
                console.log('🔍 Validating Enhanced Error Handler...');
                registrar.validateCoreSystem('enhancedErrorHandler', window.enhancedErrorHandler);
            }
            
            // Check if MKCG data mapper validation passes
            if (window.mkcgDataMapper) {
                console.log('🔍 Validating MKCG Data Mapper...');
                registrar.validateCoreSystem('mkcgDataMapper', window.mkcgDataMapper);
            }
            
        } else {
            console.error('❌ System Registrar not available on window');
        }
        
    } catch (error) {
        console.error('❌ Error testing System Registrar validation:', error);
    }
    
    console.groupEnd();
}

/**
 * Run comprehensive validation test
 */
function runComprehensiveValidationTest() {
    console.group('🎯 Comprehensive System Validation Test');
    
    console.log('🚀 Testing all implemented fixes...');
    
    // Wait for systems to be fully loaded
    setTimeout(() => {
        testEnhancedErrorHandler();
        testMKCGDataMapper();
        testSystemRegistrarValidation();
        
        console.log('✅ All validation tests completed!');
        console.log('📋 Check console output above for any remaining issues.');
        console.log('🎉 If no errors shown, the missing methods fix was successful!');
        
    }, 1000);
    
    console.groupEnd();
}

// Auto-run test when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runComprehensiveValidationTest);
} else {
    runComprehensiveValidationTest();
}

// Expose test functions globally for manual testing
window.systemValidationTest = {
    testEnhancedErrorHandler,
    testMKCGDataMapper,
    testSystemRegistrarValidation,
    runComprehensiveValidationTest,
    
    help: () => {
        console.log('📚 System Validation Test Commands:');
        console.log('  systemValidationTest.testEnhancedErrorHandler()  - Test error handler methods');
        console.log('  systemValidationTest.testMKCGDataMapper()        - Test data mapper methods');
        console.log('  systemValidationTest.testSystemRegistrarValidation() - Test registrar validation');
        console.log('  systemValidationTest.runComprehensiveValidationTest() - Run all tests');
    }
};

console.log('🧪 System Validation Test loaded! Run systemValidationTest.help() for commands.');
