/**
 * Performance diagnostic for slow initialization - run in console
 */
window.debugInitPerformance = function() {
    console.log('🐌 INITIALIZATION PERFORMANCE DIAGNOSTIC');
    console.log('='.repeat(50));
    
    if (!window.initManager) {
        console.log('❌ No initialization manager found');
        return;
    }
    
    const status = window.initManager.getStatus();
    console.log(`⏱️ Total Duration: ${status.duration}ms`);
    console.log(`🏁 Current State: ${status.state}`);
    console.log(`🔄 Retry Count: ${status.retryCount}`);
    console.log(`❌ Errors: ${status.errors.length}`);
    
    console.log('\n📊 STEP-BY-STEP BREAKDOWN:');
    if (status.steps && status.steps.length > 0) {
        let previousTime = 0;
        status.steps.forEach((step, index) => {
            const stepDuration = step.duration - previousTime;
            console.log(`${index + 1}. ${step.name}: ${stepDuration}ms (${step.status})`);
            previousTime = step.duration;
        });
    } else {
        console.log('No step data available');
    }
    
    // Check for performance metrics
    console.log('\n🔍 PERFORMANCE METRICS:');
    if (window.mkPerf) {
        try {
            const metrics = window.mkPerf.getMetrics ? window.mkPerf.getMetrics() : {};
            Object.keys(metrics).forEach(key => {
                if (key.includes('init') || key.includes('system')) {
                    console.log(`- ${key}: ${metrics[key].duration || 'N/A'}ms`);
                }
            });
        } catch (e) {
            console.log('Performance metrics not available:', e.message);
        }
    }
    
    // Check for retry attempts
    if (status.retryCount > 0) {
        console.log(`\n⚠️ RETRY ANALYSIS: ${status.retryCount} retries attempted`);
        console.log('This suggests prerequisites validation or system loading failed initially');
    }
    
    // Analyze potential bottlenecks
    console.log('\n🔍 POTENTIAL BOTTLENECKS:');
    if (status.duration > 10000) {
        console.log('⚠️ Initialization took > 10 seconds - this is abnormal');
        console.log('Possible causes:');
        console.log('1. Multiple retry attempts due to missing prerequisites');
        console.log('2. Slow network requests during system loading');
        console.log('3. DOM element validation timeouts');
        console.log('4. Performance monitoring overhead');
    }
    
    // Check current system state
    console.log('\n🔧 CURRENT SYSTEM STATE:');
    if (window.getSystemInfo) {
        const sysInfo = window.getSystemInfo();
        console.log('Available systems:', sysInfo.available);
        console.log('System types:', sysInfo.types);
    }
    
    return {
        duration: status.duration,
        steps: status.steps,
        retryCount: status.retryCount,
        errors: status.errors,
        isSlow: status.duration > 5000
    };
};

console.log('🔧 Performance diagnostic loaded');
console.log('💡 Run: window.debugInitPerformance()');
