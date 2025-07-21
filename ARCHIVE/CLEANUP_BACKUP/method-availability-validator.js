/**
 * Method Availability Validator - Root Fix Verification
 * 
 * This script validates that the required methods are immediately available
 * on both enhancedErrorHandler and mkcgDataMapper instances.
 * 
 * Run this in console to verify the fixes work.
 */

console.log('🔧 Method Availability Validator - Testing root fixes...');

// Test Enhanced Error Handler
try {
    const { enhancedErrorHandler } = await import('./utils/enhanced-error-handler.js');
    
    console.log('🧪 Testing Enhanced Error Handler...');
    console.log('✅ Instance available:', !!enhancedErrorHandler);
    console.log('✅ handleError method:', typeof enhancedErrorHandler.handleError);
    console.log('✅ displayError method:', typeof enhancedErrorHandler.displayError);
    
    if (typeof enhancedErrorHandler.handleError === 'function' && 
        typeof enhancedErrorHandler.displayError === 'function') {
        console.log('🎉 Enhanced Error Handler: ALL REQUIRED METHODS AVAILABLE');
    } else {
        console.error('❌ Enhanced Error Handler: Missing required methods');
    }
    
} catch (error) {
    console.error('❌ Enhanced Error Handler test failed:', error);
}

// Test MKCG Data Mapper
try {
    const { mkcgDataMapper } = await import('./utils/mkcg-data-mapper.js');
    
    console.log('🧪 Testing MKCG Data Mapper...');
    console.log('✅ Instance available:', !!mkcgDataMapper);
    console.log('✅ mapDataToComponent method:', typeof mkcgDataMapper.mapDataToComponent);
    console.log('✅ getDataAvailability method:', typeof mkcgDataMapper.getDataAvailability);
    
    if (typeof mkcgDataMapper.mapDataToComponent === 'function' && 
        typeof mkcgDataMapper.getDataAvailability === 'function') {
        console.log('🎉 MKCG Data Mapper: ALL REQUIRED METHODS AVAILABLE');
    } else {
        console.error('❌ MKCG Data Mapper: Missing required methods');
    }
    
} catch (error) {
    console.error('❌ MKCG Data Mapper test failed:', error);
}

// Test System Registrar Expected Methods
console.log('🔍 System Registrar Expected Methods:');
console.log('Enhanced Error Handler should have: handleError, displayError');
console.log('MKCG Data Mapper should have: mapDataToComponent, getDataAvailability');

console.log('✅ Method Availability Validator complete - check results above');
