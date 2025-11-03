/**
 * WordPress Media Library Diagnostic Tool
 * 
 * Add this to the browser console to test media library functionality
 * Run: GMKB.testMediaLibrary()
 */

// Add to the global GMKB namespace
if (typeof window.GMKB !== 'undefined') {
    window.GMKB.testMediaLibrary = function() {
        console.log('🔍 WordPress Media Library Diagnostic');
        console.log('=====================================');
        
        const tests = {
            'window.wp exists': typeof window.wp !== 'undefined',
            'wp.media exists': typeof window.wp !== 'undefined' && typeof window.wp.media !== 'undefined',
            'wp.media is function': typeof window.wp !== 'undefined' && typeof window.wp.media === 'function',
            'jQuery loaded': typeof window.jQuery !== 'undefined',
            'Backbone loaded': typeof window.Backbone !== 'undefined',
            'Underscore loaded': typeof window._ !== 'undefined',
            'Plupload settings': typeof window._wpPluploadSettings !== 'undefined',
            'Media views script': document.querySelector('script[src*="media-views"]') !== null,
            'Media models script': document.querySelector('script[src*="media-models"]') !== null,
            'Media templates in DOM': document.querySelectorAll('script[type="text/html"][id^="tmpl-"]').length > 0
        };
        
        let allPassed = true;
        let failedTests = [];
        
        Object.entries(tests).forEach(([test, result]) => {
            const status = result ? '✅' : '❌';
            console.log(`${status} ${test}: ${result}`);
            if (!result) {
                allPassed = false;
                failedTests.push(test);
            }
        });
        
        console.log('=====================================');
        
        if (allPassed) {
            console.log('✅ All tests passed! Media library should work correctly.');
            console.log('💡 Try: GMKB.openTestMedia() to open the media library');
        } else {
            console.error('❌ Some tests failed:', failedTests.join(', '));
            console.log('🔧 Troubleshooting:');
            
            if (!tests['Media templates in DOM']) {
                console.log('  - Media templates not found. wp_print_media_templates() may not have been called.');
                console.log('  - Check if gmkb_print_media_templates_on_frontend() is running.');
            }
            
            if (!tests['wp.media is function']) {
                console.log('  - wp.media is not a function. Media library scripts may not be loaded.');
                console.log('  - Check if wp_enqueue_media() is being called.');
            }
            
            if (!tests['Plupload settings']) {
                console.log('  - Plupload settings missing. File uploads may fail.');
                console.log('  - Check if wp_plupload_default_settings() is being output.');
            }
        }
        
        return allPassed;
    };
    
    // Test function to actually open the media library
    window.GMKB.openTestMedia = function() {
        if (typeof window.wp === 'undefined' || typeof window.wp.media !== 'function') {
            console.error('❌ Cannot open media library - wp.media is not available');
            console.log('Run GMKB.testMediaLibrary() for diagnostics');
            return;
        }
        
        try {
            const frame = window.wp.media({
                title: 'Test Media Library',
                button: { text: 'Select' },
                multiple: false,
                library: { type: 'image' }
            });
            
            frame.on('select', function() {
                const attachment = frame.state().get('selection').first().toJSON();
                console.log('✅ Image selected:', {
                    id: attachment.id,
                    url: attachment.url,
                    title: attachment.title
                });
            });
            
            frame.open();
            console.log('✅ Media library opened successfully');
        } catch (error) {
            console.error('❌ Failed to open media library:', error);
        }
    };
    
    // Auto-run diagnostic on page load if in debug mode
    if (window.gmkbDebug || (window.gmkbData && window.gmkbData.debugMode)) {
        setTimeout(() => {
            console.log('🤖 Auto-running media library diagnostic...');
            window.GMKB.testMediaLibrary();
        }, 2000);
    }
    
    console.log('💡 Media Library Diagnostic Commands Available:');
    console.log('  GMKB.testMediaLibrary() - Run diagnostic tests');
    console.log('  GMKB.openTestMedia() - Open test media library');
}
