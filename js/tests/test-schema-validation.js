/**
 * Test Schema Validation System
 * Run this to verify schema validation is working correctly
 */

console.log('🧪 Testing Schema Validation System...\n');

// Test 1: Check if validator is loaded
console.log('Test 1: Checking if schema validator is loaded...');
if (window.mkSchema) {
    console.log('✅ Schema validator utilities loaded successfully');
} else {
    console.error('❌ Schema validator utilities not found');
}

// Test 2: Validate a component with good schema (hero)
console.log('\nTest 2: Validating component with comprehensive schema (hero)...');
window.mkSchema.validate('hero').then(result => {
    if (result) {
        console.log(`✅ Hero validation complete: ${result.summary}`);
        if (result.counts.total > 0) {
            console.log(`   Found ${result.counts.errors} errors, ${result.counts.warnings} warnings, ${result.counts.info} suggestions`);
        }
    }
});

// Test 3: Validate a component with minimal schema (biography)
console.log('\nTest 3: Validating component with minimal schema (biography)...');
setTimeout(() => {
    window.mkSchema.validate('biography').then(result => {
        if (result) {
            console.log(`✅ Biography validation complete: ${result.summary}`);
            if (result.counts.total > 0) {
                console.log(`   Found ${result.counts.errors} errors, ${result.counts.warnings} warnings, ${result.counts.info} suggestions`);
            }
        }
    });
}, 1000);

// Test 4: Check performance
console.log('\nTest 4: Checking validation performance...');
setTimeout(() => {
    const start = performance.now();
    window.mkSchema.validate('social').then(result => {
        const duration = performance.now() - start;
        console.log(`✅ Social validation completed in ${duration.toFixed(2)}ms`);
        if (duration < 10) {
            console.log('   ✅ Performance is within target (<10ms)');
        } else {
            console.log('   ⚠️ Performance exceeds target (>10ms)');
        }
    });
}, 2000);

// Test 5: Validate all components
console.log('\nTest 5: Validating all components...');
setTimeout(() => {
    console.log('Running full validation (this may take a moment)...');
    window.mkSchema.validateAll().then(results => {
        console.log(`\n✅ Validated ${results.length} components`);
        
        // Show summary
        const summary = window.mkSchema.summary();
        
        // Show components with issues
        if (summary.componentsWithErrors > 0 || summary.componentsWithWarnings > 0) {
            console.log('\n📋 Components with issues:');
            summary.components.forEach(comp => {
                if (comp.errors > 0 || comp.warnings > 0) {
                    console.log(`   ${comp.type}: ${comp.errors} errors, ${comp.warnings} warnings`);
                }
            });
        }
        
        console.log('\n🎉 Schema validation test complete!');
        console.log('Use mkSchema.help() for more commands');
    });
}, 3000);

// Show help after tests
setTimeout(() => {
    console.log('\n💡 Tip: You can run these commands manually:');
    console.log('   mkSchema.validate("component-name")');
    console.log('   mkSchema.issues("component-name")');
    console.log('   mkSchema.summary()');
}, 5000);