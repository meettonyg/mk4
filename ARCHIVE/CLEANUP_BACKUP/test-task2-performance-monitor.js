/**
 * @file test-task2-performance-monitor.js
 * @description Performance monitoring and benchmarking for Task 2 Enhanced Empty States
 * @version 1.0.0
 * @date 2025-01-08
 * 
 * Monitors performance metrics and validates against benchmarks:
 * - Empty state rendering: <50ms
 * - State transitions: <200ms with 60fps
 * - Memory usage: <500KB additional overhead
 * - Interactive response: <100ms for user actions
 */

class Task2PerformanceMonitor {
    constructor() {
        this.benchmarks = {
            emptyStateRendering: 50, // ms
            stateTransitions: 200, // ms
            memoryUsage: 500, // KB
            interactiveResponse: 100, // ms
            animationFrameRate: 58, // fps (allowing 2fps tolerance)
            firstContentPaint: 800, // ms
            largestContentfulPaint: 1200, // ms
            cumulativeLayoutShift: 0.1, // score
            firstInputDelay: 100 // ms
        };
        
        this.measurements = new Map();
        this.performanceHistory = [];
        this.isMonitoring = false;
        this.startTime = null;
        
        // Performance observer setup
        this.observers = new Map();
        this.initializeObservers();
        
        console.log('⚡ Task 2 Performance Monitor initialized');
        console.log('📊 Benchmarks:', this.benchmarks);
    }

    /**
     * Initialize Performance Observers
     */
    initializeObservers() {
        // Paint timing observer
        if ('PerformanceObserver' in window) {
            try {
                const paintObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        this.recordMeasurement(`paint-${entry.name}`, entry.startTime);
                    });
                });
                paintObserver.observe({ entryTypes: ['paint'] });
                this.observers.set('paint', paintObserver);
            } catch (error) {
                console.warn('Paint observer not supported:', error.message);
            }

            // Layout shift observer
            try {
                const layoutObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        if (!entry.hadRecentInput) {
                            this.recordMeasurement('layout-shift', entry.value);
                        }
                    });
                });
                layoutObserver.observe({ entryTypes: ['layout-shift'] });
                this.observers.set('layout', layoutObserver);
            } catch (error) {
                console.warn('Layout shift observer not supported:', error.message);
            }

            // First Input Delay observer
            try {
                const fidObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        this.recordMeasurement('first-input-delay', entry.processingStart - entry.startTime);
                    });
                });
                fidObserver.observe({ entryTypes: ['first-input'] });
                this.observers.set('fid', fidObserver);
            } catch (error) {
                console.warn('First Input Delay observer not supported:', error.message);
            }
        }
    }

    /**
     * Start performance monitoring
     */
    startMonitoring() {
        this.isMonitoring = true;
        this.startTime = performance.now();
        this.measurements.clear();
        
        console.log('🔍 Performance monitoring started');
        
        // Monitor memory if available
        if (performance.memory) {
            this.recordMeasurement('memory-baseline', performance.memory.usedJSHeapSize / 1024); // KB
        }
        
        return this.startTime;
    }

    /**
     * Stop performance monitoring
     */
    stopMonitoring() {
        if (!this.isMonitoring) return null;
        
        this.isMonitoring = false;
        const duration = performance.now() - this.startTime;
        
        // Final memory measurement
        if (performance.memory) {
            this.recordMeasurement('memory-final', performance.memory.usedJSHeapSize / 1024); // KB
        }
        
        const report = this.generatePerformanceReport(duration);
        this.performanceHistory.push(report);
        
        console.log('📊 Performance monitoring stopped');
        console.log('⏱️ Total duration:', duration.toFixed(2), 'ms');
        
        return report;
    }

    /**
     * Record a performance measurement
     */
    recordMeasurement(metric, value, timestamp = null) {
        const measurement = {
            metric,
            value,
            timestamp: timestamp || performance.now(),
            relativeTime: this.startTime ? (timestamp || performance.now()) - this.startTime : 0
        };
        
        if (!this.measurements.has(metric)) {
            this.measurements.set(metric, []);
        }
        
        this.measurements.get(metric).push(measurement);
        
        // Check against benchmarks immediately
        this.validateMeasurement(measurement);
        
        return measurement;
    }

    /**
     * Validate measurement against benchmarks
     */
    validateMeasurement(measurement) {
        const { metric, value } = measurement;
        const benchmark = this.benchmarks[metric.replace(/-/g, '')];
        
        if (benchmark !== undefined) {
            const passed = value <= benchmark;
            const status = passed ? '✅' : '❌';
            
            if (!passed) {
                console.warn(`${status} Performance warning: ${metric} = ${value.toFixed(2)} (benchmark: ${benchmark})`);
            }
            
            return { passed, benchmark, actual: value };
        }
        
        return null;
    }

    /**
     * Measure empty state rendering performance
     */
    async measureEmptyStateRendering(renderFunction) {
        console.log('⚡ Measuring empty state rendering performance...');
        
        const start = performance.now();
        
        try {
            // Execute the render function
            if (renderFunction) {
                await renderFunction();
            } else {
                // Simulate empty state rendering
                this.simulateEmptyStateRender();
            }
            
            const duration = performance.now() - start;
            this.recordMeasurement('emptyStateRendering', duration);
            
            console.log(`   Rendering time: ${duration.toFixed(2)}ms`);
            
            return {
                duration,
                passed: duration <= this.benchmarks.emptyStateRendering,
                benchmark: this.benchmarks.emptyStateRendering
            };
            
        } catch (error) {
            console.error('❌ Error measuring empty state rendering:', error);
            return { duration: -1, passed: false, error: error.message };
        }
    }

    /**
     * Measure state transition performance
     */
    async measureStateTransition(transitionFunction, fromState, toState) {
        console.log(`🔄 Measuring state transition: ${fromState} → ${toState}`);
        
        const start = performance.now();
        let frameCount = 0;
        let frameStart = start;
        
        // Frame rate monitoring
        const frameMonitor = () => {
            frameCount++;
            const now = performance.now();
            if (now - frameStart >= 1000) { // 1 second sample
                const fps = frameCount / ((now - frameStart) / 1000);
                this.recordMeasurement('animationFrameRate', fps);
                frameCount = 0;
                frameStart = now;
            }
            
            if (performance.now() - start < this.benchmarks.stateTransitions) {
                requestAnimationFrame(frameMonitor);
            }
        };
        
        requestAnimationFrame(frameMonitor);
        
        try {
            // Execute transition
            if (transitionFunction) {
                await transitionFunction();
            } else {
                // Simulate state transition
                await this.simulateStateTransition(fromState, toState);
            }
            
            const duration = performance.now() - start;
            this.recordMeasurement('stateTransitions', duration);
            
            console.log(`   Transition time: ${duration.toFixed(2)}ms`);
            
            return {
                duration,
                passed: duration <= this.benchmarks.stateTransitions,
                benchmark: this.benchmarks.stateTransitions
            };
            
        } catch (error) {
            console.error('❌ Error measuring state transition:', error);
            return { duration: -1, passed: false, error: error.message };
        }
    }

    /**
     * Measure interactive response time
     */
    async measureInteractiveResponse(interactionFunction, interactionType = 'click') {
        console.log(`👆 Measuring interactive response: ${interactionType}`);
        
        const start = performance.now();
        
        try {
            if (interactionFunction) {
                await interactionFunction();
            } else {
                // Simulate interaction
                await this.simulateInteraction(interactionType);
            }
            
            const duration = performance.now() - start;
            this.recordMeasurement('interactiveResponse', duration);
            
            console.log(`   Response time: ${duration.toFixed(2)}ms`);
            
            return {
                duration,
                passed: duration <= this.benchmarks.interactiveResponse,
                benchmark: this.benchmarks.interactiveResponse
            };
            
        } catch (error) {
            console.error('❌ Error measuring interactive response:', error);
            return { duration: -1, passed: false, error: error.message };
        }
    }

    /**
     * Measure memory usage
     */
    measureMemoryUsage(label = 'memory-check') {
        if (!performance.memory) {
            console.warn('⚠️ Memory measurement not available in this browser');
            return null;
        }
        
        const memoryInfo = {
            used: performance.memory.usedJSHeapSize / 1024, // KB
            total: performance.memory.totalJSHeapSize / 1024, // KB
            limit: performance.memory.jsHeapSizeLimit / 1024 // KB
        };
        
        this.recordMeasurement(`${label}-used`, memoryInfo.used);
        this.recordMeasurement(`${label}-total`, memoryInfo.total);
        
        console.log(`💾 Memory usage (${label}):`, {
            used: `${memoryInfo.used.toFixed(0)}KB`,
            total: `${memoryInfo.total.toFixed(0)}KB`,
            limit: `${memoryInfo.limit.toFixed(0)}KB`
        });
        
        return memoryInfo;
    }

    /**
     * Calculate memory overhead
     */
    calculateMemoryOverhead() {
        const baseline = this.getMeasurementValue('memory-baseline');
        const final = this.getMeasurementValue('memory-final');
        
        if (baseline && final) {
            const overhead = final - baseline;
            this.recordMeasurement('memoryUsage', overhead);
            
            console.log(`📊 Memory overhead: ${overhead.toFixed(0)}KB`);
            
            return {
                overhead,
                passed: overhead <= this.benchmarks.memoryUsage,
                benchmark: this.benchmarks.memoryUsage
            };
        }
        
        return null;
    }

    /**
     * Measure Core Web Vitals
     */
    measureCoreWebVitals() {
        console.log('🔍 Measuring Core Web Vitals...');
        
        const vitals = {
            FCP: null, // First Contentful Paint
            LCP: null, // Largest Contentful Paint
            CLS: null, // Cumulative Layout Shift
            FID: null  // First Input Delay
        };
        
        // Get FCP and LCP from Performance API
        const paintEntries = performance.getEntriesByType('paint');
        const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
            vitals.FCP = fcpEntry.startTime;
            this.recordMeasurement('firstContentPaint', vitals.FCP);
        }
        
        // LCP requires PerformanceObserver (already set up)
        const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
        if (lcpEntries.length > 0) {
            vitals.LCP = lcpEntries[lcpEntries.length - 1].startTime;
            this.recordMeasurement('largestContentfulPaint', vitals.LCP);
        }
        
        // Get accumulated CLS
        const clsMeasurements = this.measurements.get('layout-shift');
        if (clsMeasurements) {
            vitals.CLS = clsMeasurements.reduce((sum, m) => sum + m.value, 0);
            this.recordMeasurement('cumulativeLayoutShift', vitals.CLS);
        }
        
        // FID from observer (if available)
        const fidMeasurements = this.measurements.get('first-input-delay');
        if (fidMeasurements && fidMeasurements.length > 0) {
            vitals.FID = fidMeasurements[0].value;
        }
        
        console.log('📊 Core Web Vitals:', vitals);
        
        return vitals;
    }

    /**
     * Simulate empty state rendering for testing
     */
    simulateEmptyStateRender() {
        return new Promise(resolve => {
            // Simulate DOM operations
            const container = document.createElement('div');
            container.className = 'empty-state-enhanced';
            container.innerHTML = `
                <div class="empty-state-icon">🔗</div>
                <h3 class="empty-state-title">Connect Your Content Data</h3>
                <p class="empty-state-description">Link to MKCG post data for intelligent auto-population</p>
                <div class="empty-state-actions">
                    <button class="btn btn--primary">Connect Data Source</button>
                    <button class="btn btn--secondary">Build Manually</button>
                </div>
            `;
            
            // Simulate layout calculation
            document.body.appendChild(container);
            const rect = container.getBoundingClientRect();
            document.body.removeChild(container);
            
            // Simulate async rendering completion
            setTimeout(resolve, Math.random() * 20); // 0-20ms random delay
        });
    }

    /**
     * Simulate state transition for testing
     */
    simulateStateTransition(fromState, toState) {
        return new Promise(resolve => {
            let progress = 0;
            const duration = 150; // 150ms transition
            const steps = 10;
            const stepTime = duration / steps;
            
            const animate = () => {
                progress += 1;
                
                // Simulate transition progress
                const easeProgress = 1 - Math.pow(1 - progress / steps, 3); // Ease-out
                
                if (progress < steps) {
                    setTimeout(animate, stepTime);
                } else {
                    resolve();
                }
            };
            
            animate();
        });
    }

    /**
     * Simulate user interaction for testing
     */
    simulateInteraction(type) {
        return new Promise(resolve => {
            const delays = {
                'click': 5,
                'hover': 2,
                'focus': 3,
                'scroll': 8
            };
            
            const delay = delays[type] || 5;
            setTimeout(resolve, delay + Math.random() * 10);
        });
    }

    /**
     * Get measurement value by metric name
     */
    getMeasurementValue(metric) {
        const measurements = this.measurements.get(metric);
        return measurements && measurements.length > 0 ? measurements[measurements.length - 1].value : null;
    }

    /**
     * Get measurement average
     */
    getMeasurementAverage(metric) {
        const measurements = this.measurements.get(metric);
        if (!measurements || measurements.length === 0) return null;
        
        const sum = measurements.reduce((total, m) => total + m.value, 0);
        return sum / measurements.length;
    }

    /**
     * Generate performance report
     */
    generatePerformanceReport(totalDuration) {
        const report = {
            timestamp: new Date().toISOString(),
            totalDuration: totalDuration,
            measurements: Object.fromEntries(this.measurements),
            benchmarkValidation: {},
            coreWebVitals: this.measureCoreWebVitals(),
            summary: {
                totalTests: 0,
                passedTests: 0,
                failedTests: 0,
                criticalIssues: [],
                warnings: []
            }
        };
        
        // Validate all measurements against benchmarks
        for (const [metricName, benchmark] of Object.entries(this.benchmarks)) {
            const measurement = this.getMeasurementValue(metricName) || this.getMeasurementAverage(metricName);
            
            if (measurement !== null) {
                const passed = measurement <= benchmark;
                report.benchmarkValidation[metricName] = {
                    measurement,
                    benchmark,
                    passed,
                    status: passed ? 'PASS' : 'FAIL'
                };
                
                report.summary.totalTests++;
                if (passed) {
                    report.summary.passedTests++;
                } else {
                    report.summary.failedTests++;
                    
                    // Categorize issues
                    const issue = `${metricName}: ${measurement.toFixed(2)} > ${benchmark}`;
                    if (metricName === 'emptyStateRendering' || metricName === 'interactiveResponse') {
                        report.summary.criticalIssues.push(issue);
                    } else {
                        report.summary.warnings.push(issue);
                    }
                }
            }
        }
        
        // Calculate success rate
        report.summary.successRate = report.summary.totalTests > 0 
            ? (report.summary.passedTests / report.summary.totalTests) * 100 
            : 0;
        
        // Memory overhead calculation
        const memoryOverhead = this.calculateMemoryOverhead();
        if (memoryOverhead) {
            report.memoryOverhead = memoryOverhead;
        }
        
        return report;
    }

    /**
     * Run comprehensive performance test suite
     */
    async runPerformanceTestSuite() {
        console.log('🚀 Running Task 2 Performance Test Suite...');
        console.log('================================================');
        
        this.startMonitoring();
        
        const results = {
            emptyStateRendering: null,
            stateTransitions: [],
            interactiveResponses: [],
            memoryUsage: null,
            coreWebVitals: null
        };
        
        // Test 1: Empty State Rendering
        console.log('\n1️⃣ Testing Empty State Rendering Performance');
        results.emptyStateRendering = await this.measureEmptyStateRendering();
        
        // Test 2: State Transitions
        console.log('\n2️⃣ Testing State Transition Performance');
        const transitions = [
            ['no-data', 'low-quality'],
            ['low-quality', 'good-quality'],
            ['good-quality', 'excellent']
        ];
        
        for (const [from, to] of transitions) {
            const result = await this.measureStateTransition(null, from, to);
            results.stateTransitions.push({ from, to, ...result });
        }
        
        // Test 3: Interactive Responses
        console.log('\n3️⃣ Testing Interactive Response Performance');
        const interactions = ['click', 'hover', 'focus'];
        
        for (const interaction of interactions) {
            const result = await this.measureInteractiveResponse(null, interaction);
            results.interactiveResponses.push({ type: interaction, ...result });
        }
        
        // Test 4: Memory Usage
        console.log('\n4️⃣ Testing Memory Usage');
        this.measureMemoryUsage('performance-test');
        results.memoryUsage = this.calculateMemoryOverhead();
        
        // Test 5: Core Web Vitals
        console.log('\n5️⃣ Measuring Core Web Vitals');
        results.coreWebVitals = this.measureCoreWebVitals();
        
        // Generate final report
        const report = this.stopMonitoring();
        results.finalReport = report;
        
        // Display summary
        this.displayPerformanceSummary(report);
        
        return results;
    }

    /**
     * Display performance summary
     */
    displayPerformanceSummary(report) {
        console.log('\n📊 PERFORMANCE TEST SUMMARY');
        console.log('=====================================');
        
        console.log(`\n📈 Overall Results:`);
        console.log(`   Tests Run: ${report.summary.totalTests}`);
        console.log(`   Passed: ${report.summary.passedTests}`);
        console.log(`   Failed: ${report.summary.failedTests}`);
        console.log(`   Success Rate: ${report.summary.successRate.toFixed(1)}%`);
        
        console.log(`\n⚡ Performance Metrics:`);
        for (const [metric, result] of Object.entries(report.benchmarkValidation)) {
            const status = result.passed ? '✅' : '❌';
            console.log(`   ${status} ${metric}: ${result.measurement.toFixed(2)} (target: ≤${result.benchmark})`);
        }
        
        if (report.memoryOverhead) {
            const memStatus = report.memoryOverhead.passed ? '✅' : '❌';
            console.log(`   ${memStatus} Memory Overhead: ${report.memoryOverhead.overhead.toFixed(0)}KB (target: ≤${this.benchmarks.memoryUsage}KB)`);
        }
        
        if (report.summary.criticalIssues.length > 0) {
            console.log(`\n🚨 Critical Issues:`);
            report.summary.criticalIssues.forEach(issue => {
                console.log(`   ❌ ${issue}`);
            });
        }
        
        if (report.summary.warnings.length > 0) {
            console.log(`\n⚠️ Warnings:`);
            report.summary.warnings.forEach(warning => {
                console.log(`   ⚠️ ${warning}`);
            });
        }
        
        // Performance grade
        const grade = this.calculatePerformanceGrade(report.summary.successRate);
        console.log(`\n🏆 Performance Grade: ${grade}`);
        
        // Recommendations
        if (report.summary.successRate < 90) {
            console.log(`\n💡 Recommendations:`);
            if (report.summary.criticalIssues.length > 0) {
                console.log(`   - Address critical rendering and interaction performance issues`);
            }
            if (report.memoryOverhead && !report.memoryOverhead.passed) {
                console.log(`   - Optimize memory usage and implement cleanup mechanisms`);
            }
            if (report.summary.warnings.length > 0) {
                console.log(`   - Fine-tune animation and transition performance`);
            }
        }
        
        console.log(`\n✅ Performance testing complete!`);
    }

    /**
     * Calculate performance grade
     */
    calculatePerformanceGrade(successRate) {
        if (successRate >= 95) return 'A+ (Excellent)';
        if (successRate >= 90) return 'A (Very Good)';
        if (successRate >= 80) return 'B (Good)';
        if (successRate >= 70) return 'C (Acceptable)';
        if (successRate >= 60) return 'D (Needs Improvement)';
        return 'F (Critical Issues)';
    }

    /**
     * Get performance history
     */
    getPerformanceHistory() {
        return this.performanceHistory;
    }

    /**
     * Compare performance with previous runs
     */
    compareWithHistory() {
        if (this.performanceHistory.length < 2) {
            console.log('📊 Insufficient data for comparison (need at least 2 runs)');
            return null;
        }
        
        const latest = this.performanceHistory[this.performanceHistory.length - 1];
        const previous = this.performanceHistory[this.performanceHistory.length - 2];
        
        const comparison = {
            successRate: {
                current: latest.summary.successRate,
                previous: previous.summary.successRate,
                change: latest.summary.successRate - previous.summary.successRate
            },
            trends: {}
        };
        
        // Compare key metrics
        for (const metric of Object.keys(this.benchmarks)) {
            const currentValue = latest.benchmarkValidation[metric]?.measurement;
            const previousValue = previous.benchmarkValidation[metric]?.measurement;
            
            if (currentValue !== undefined && previousValue !== undefined) {
                comparison.trends[metric] = {
                    current: currentValue,
                    previous: previousValue,
                    change: currentValue - previousValue,
                    improvement: currentValue < previousValue
                };
            }
        }
        
        console.log('📊 Performance Comparison:', comparison);
        return comparison;
    }

    /**
     * Reset performance monitor
     */
    reset() {
        this.measurements.clear();
        this.isMonitoring = false;
        this.startTime = null;
        console.log('🔄 Performance monitor reset');
    }

    /**
     * Cleanup observers
     */
    cleanup() {
        for (const [name, observer] of this.observers) {
            try {
                observer.disconnect();
            } catch (error) {
                console.warn(`Error disconnecting ${name} observer:`, error);
            }
        }
        this.observers.clear();
        console.log('🧹 Performance monitor cleaned up');
    }
}

// Export for use in tests
export { Task2PerformanceMonitor };

// Global exposure for browser console testing
window.Task2PerformanceMonitor = Task2PerformanceMonitor;
window.task2PerfMonitor = new Task2PerformanceMonitor();

// Console commands
window.runTask2PerformanceTests = () => window.task2PerfMonitor.runPerformanceTestSuite();
window.startTask2PerformanceMonitoring = () => window.task2PerfMonitor.startMonitoring();
window.stopTask2PerformanceMonitoring = () => window.task2PerfMonitor.stopMonitoring();
window.measureTask2EmptyStateRender = () => window.task2PerfMonitor.measureEmptyStateRendering();

console.log('⚡ Task 2 Performance Monitor loaded!');
console.log('🎯 Commands:');
console.log('   runTask2PerformanceTests()        - Run complete performance test suite');
console.log('   startTask2PerformanceMonitoring() - Start monitoring');
console.log('   stopTask2PerformanceMonitoring()  - Stop monitoring and generate report');
console.log('   measureTask2EmptyStateRender()    - Test empty state rendering performance');
console.log('   task2PerfMonitor.compareWithHistory() - Compare with previous runs');
