/**
 * Force initialization if needed
 * Run this if the UI still isn't working after page load
 */

console.log('🔧 Checking initialization status...\n');

// Check if already initialized
if (window.mediaKitBuilderInitialized) {
    console.log('✅ Media Kit Builder is already initialized');
    
    // Just ensure UI is set up
    Promise.all([
        import('./js/ui/tabs.js').then(m => m.setupTabs()),
        import('./js/modals/component-library.js').then(m => m.setupComponentLibraryModal()),
        import('./js/modals/modal-base.js')
    ]).then(() => {
        console.log('✅ UI modules reloaded');
    });
} else {
    console.log('⚠️ Media Kit Builder not initialized - initializing now...');
    
    // Force initialization
    import('./js/core/media-kit-builder-init.js').then(module => {
        if (module.mediaKitBuilderInit) {
            module.mediaKitBuilderInit.initialize().then(() => {
                console.log('✅ Media Kit Builder initialized successfully!');
            });
        }
    });
}

// Also ensure modal base is initialized
import('./js/modals/modal-base.js').then(() => {
    console.log('✅ Modal base loaded');
});