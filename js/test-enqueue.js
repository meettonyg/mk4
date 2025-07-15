// EMERGENCY TEST SCRIPT - Vanilla JS to verify WordPress enqueue system
console.log('🚨 EMERGENCY TEST: WordPress enqueue system is working!');
console.log('⏰ Load time:', new Date().toISOString());
console.log('📋 Script loaded successfully via wp_enqueue_script');
console.log('✅ VANILLA JS: No external dependencies required');

// Test vanilla JavaScript DOM readiness
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('✅ VANILLA JS: DOM ready fired');
    });
} else {
    console.log('✅ VANILLA JS: DOM already ready');
}

// Test basic vanilla JS functionality
console.log('✅ VANILLA JS: All systems operational');
console.log('🎆 NO JQUERY NEEDED: Modern vanilla JavaScript approach');
