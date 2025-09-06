/**
 * @file test-complete-registry.js
 * @description Final test to verify all 17 components are registered
 */

(function() {
    'use strict';
    
    window.testCompleteRegistry = function() {
        console.log('\n🧪 COMPLETE COMPONENT REGISTRY TEST\n' + '='.repeat(50));
        
        const expectedComponents = [
            'hero', 'topics', 'biography', 'contact', 'social-links',
            'guest-intro', 'authority-hook', 'questions', 'video-intro',
            'photo-gallery', 'podcast-player', 'testimonials', 'stats',
            'logo-grid', 'portfolio', 'call-to-action', 'booking-calendar'
        ];
        
        const registry = window.GMKBComponentRegistry;
        if (!registry) {
            console.error('❌ Component Registry not found!');
            return false;
        }
        
        const registered = registry.getRegisteredTypes();
        console.log(`📦 Registered components: ${registered.length}`);
        console.log(`📋 Expected components: ${expectedComponents.length}`);
        
        const results = {};
        let passed = 0;
        let failed = 0;
        
        expectedComponents.forEach(type => {
            if (registered.includes(type)) {
                results[type] = '✅';
                passed++;
            } else {
                results[type] = '❌';
                failed++;
            }
        });
        
        console.table(results);
        
        console.log(`\n📊 RESULTS: ${passed}/${expectedComponents.length} components registered`);
        
        if (failed > 0) {
            console.log(`\n⚠️ Missing components: ${expectedComponents.filter(c => !registered.includes(c)).join(', ')}`);
        } else {
            console.log('\n🎉 SUCCESS! All components are registered and ready!');
        }
        
        // Test rendering a few components
        console.log('\n🧪 Testing component rendering...');
        try {
            const heroRenderer = registry.getRenderer('hero');
            const heroHtml = heroRenderer({title: 'Test Hero'}, {});
            console.log('✅ Hero renders:', heroHtml.includes('Test Hero'));
            
            const topicsRenderer = registry.getRenderer('topics');
            const topicsHtml = topicsRenderer({topics: [{topic_title: 'Test Topic'}]}, {});
            console.log('✅ Topics renders:', topicsHtml.includes('Test Topic'));
            
            const contactRenderer = registry.getRenderer('contact');
            const contactHtml = contactRenderer({email: 'test@example.com'}, {});
            console.log('✅ Contact renders:', contactHtml.includes('test@example.com'));
        } catch (e) {
            console.error('❌ Rendering test failed:', e);
        }
        
        return passed === expectedComponents.length;
    };
    
    // Auto-run after a delay
    if (window.gmkbData?.debugMode) {
        setTimeout(() => {
            console.log('Auto-running complete registry test...');
            window.testCompleteRegistry();
        }, 3000);
    }
    
    console.log('💡 Run window.testCompleteRegistry() to verify all components');
})();