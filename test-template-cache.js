/**
 * Test script for template caching implementation
 * Run this in the browser console to verify caching is working
 */

(async function testTemplateCache() {
    console.log('=== Template Cache Test Suite ===');
    console.log('Testing client-side template caching implementation...\n');
    
    // Check if cache monitoring is available
    if (!window.mkTemplateCache) {
        console.error('❌ Template cache monitoring not available. Make sure dynamic-component-loader.js is loaded.');
        return;
    }
    
    // Clear cache to start fresh
    console.log('1. Clearing cache...');
    window.mkTemplateCache.clear();
    console.log('✅ Cache cleared\n');
    
    // Test 1: First load (cache miss)
    console.log('2. Testing first component load (should be cache MISS)...');
    console.time('First hero load');
    
    if (window.componentManager && window.componentManager.addComponent) {
        await window.componentManager.addComponent('hero');
        console.timeEnd('First hero load');
        
        // Wait a bit for render to complete
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Check cache stats
        const stats1 = window.mkTemplateCache.getStats();
        console.log(`   Cache stats: ${stats1.hits} hits, ${stats1.misses} misses`);
        console.log(`   Cache size: ${stats1.cacheSize} templates\n`);
        
        // Test 2: Second load (cache hit)
        console.log('3. Testing second component load (should be cache HIT)...');
        console.time('Second hero load');
        await window.componentManager.addComponent('hero');
        console.timeEnd('Second hero load');
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const stats2 = window.mkTemplateCache.getStats();
        console.log(`   Cache stats: ${stats2.hits} hits, ${stats2.misses} misses`);
        console.log(`   Hit rate: ${stats2.getHitRate()}%\n`);
        
        // Test 3: Multiple rapid additions
        console.log('4. Testing rapid component additions (5 heroes)...');
        console.time('5 rapid heroes');
        
        const promises = [];
        for (let i = 0; i < 5; i++) {
            promises.push(window.componentManager.addComponent('hero'));
        }
        await Promise.all(promises);
        
        console.timeEnd('5 rapid heroes');
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Final report
        console.log('\n=== Final Cache Report ===');
        window.mkTemplateCache.report();
        
        const finalStats = window.mkTemplateCache.getStats();
        console.log(`Cached templates: ${finalStats.templates.join(', ')}`);
        console.log(`Average time (all): ${finalStats.getAverageTime()}ms`);
        console.log(`Average time (cached): ${finalStats.getAverageCachedTime()}ms`);
        
        // Calculate improvement
        const improvement = finalStats.getAverageCachedTime() > 0 
            ? (1 - (parseFloat(finalStats.getAverageCachedTime()) / parseFloat(finalStats.getAverageTime()))) * 100
            : 0;
        
        console.log(`\n🎉 Performance improvement: ${improvement.toFixed(1)}% faster for cached components!`);
        
        if (improvement > 80) {
            console.log('✅ SUCCESS: Achieved 90%+ performance improvement target!');
        } else if (improvement > 50) {
            console.log('⚠️ WARNING: Performance improvement is good but below 90% target.');
        } else {
            console.log('❌ FAIL: Performance improvement is below expectations.');
        }
        
    } else {
        console.error('❌ Component manager not found. Make sure the page is fully loaded.');
    }
    
    console.log('\n=== Test Complete ===');
})();

// Additional test commands
console.log('\n📊 Additional test commands available:');
console.log('- mkTemplateCache.report() - Show current cache statistics');
console.log('- mkTemplateCache.getStats() - Get detailed cache information');
console.log('- mkTemplateCache.clear() - Clear the template cache');
console.log('- mkTemplateCache.stats - Direct access to cache statistics object');
