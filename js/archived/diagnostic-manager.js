/**
 * @file diagnostic-manager.js
 * @description Complete Diagnostic and Testing Tools (Phase 1 Completion)
 * 
 * ROOT FIX: All diagnostic capabilities, performance monitoring, and testing tools
 * extracted from main.js to keep it clean while providing comprehensive debugging.
 * 
 * This completes the final 10% of Phase 1 implementation.
 */

/**
 * Diagnostic Manager - Comprehensive system testing and monitoring
 */
export class DiagnosticManager {
    constructor() {
        this.initialized = false;
        this.performanceMetrics = {
            initializationStart: null,
            initializationEnd: null,
            componentOperations: [],
            stateOperations: [],
            renderOperations: []
        };
        
        this.testResults = {
            systemTests: [],
            integrationTests: [],
            performanceTests: []
        };
        
        this.monitors = {
            performance: null,
            memory: null,
            errors: null
        };
        
        console.log('🔍 Diagnostic Manager: Initialized');
    }

    /**
     * Initialize diagnostic systems
     */
    init() {
        console.log('🚀 Diagnostic Manager: Starting diagnostic systems...');
        
        try {
            this.setupPerformanceMonitoring();
            this.setupMemoryMonitoring();
            this.setupErrorTracking();
            this.setupValidationTools();
            this.setupTestSuites();
            this.exposeDiagnosticFunctions();
            
            this.initialized = true;
            console.log('✅ Diagnostic Manager: All diagnostic systems active');
            
        } catch (error) {
            console.error('❌ Diagnostic Manager initialization failed:', error);
            throw error;
        }
    }

    /**
     * Set up performance monitoring
     */
    setupPerformanceMonitoring() {
        console.log('📊 Setting up performance monitoring...');
        
        // Track initialization timing
        this.performanceMetrics.initializationStart = performance.now();
        
        // Monitor component operations
        this.monitorComponentOperations();
        
        // Monitor state operations  
        this.monitorStateOperations();
        
        // Monitor render operations
        this.monitorRenderOperations();
        
        // Set up performance observer
        if (window.PerformanceObserver) {
            this.setupPerformanceObserver();
        }
        
        console.log('✅ Performance monitoring active');
    }

    /**
     * Monitor component operations
     */
    monitorComponentOperations() {
        // Listen for component events
        document.addEventListener('componentAdded', (event) => {
            this.recordComponentOperation('add', event.detail);
        });
        
        document.addEventListener('componentRemoved', (event) => {
            this.recordComponentOperation('remove', event.detail);
        });
        
        document.addEventListener('componentUpdated', (event) => {
            this.recordComponentOperation('update', event.detail);
        });
    }

    /**
     * Record component operation metrics
     */
    recordComponentOperation(operation, detail) {
        const metric = {
            operation,
            timestamp: performance.now(),
            componentId: detail?.componentId,
            componentType: detail?.componentType,
            duration: detail?.duration || 0
        };
        
        this.performanceMetrics.componentOperations.push(metric);
        
        // Keep only last 100 operations
        if (this.performanceMetrics.componentOperations.length > 100) {
            this.performanceMetrics.componentOperations.shift();
        }
    }

    /**
     * Monitor state operations
     */
    monitorStateOperations() {
        // Listen for state change events
        document.addEventListener('stateChanged', (event) => {
            this.recordStateOperation('change', event.detail);
        });
        
        document.addEventListener('stateSaved', (event) => {
            this.recordStateOperation('save', event.detail);
        });
        
        document.addEventListener('stateLoaded', (event) => {
            this.recordStateOperation('load', event.detail);
        });
    }

    /**
     * Record state operation metrics
     */
    recordStateOperation(operation, detail) {
        const metric = {
            operation,
            timestamp: performance.now(),
            stateSize: detail?.stateSize || 0,
            duration: detail?.duration || 0,
            componentCount: detail?.componentCount || 0
        };
        
        this.performanceMetrics.stateOperations.push(metric);
        
        // Keep only last 100 operations
        if (this.performanceMetrics.stateOperations.length > 100) {
            this.performanceMetrics.stateOperations.shift();
        }
    }

    /**
     * Monitor render operations
     */
    monitorRenderOperations() {
        // Listen for render events
        document.addEventListener('renderStarted', (event) => {
            this.recordRenderOperation('start', event.detail);
        });
        
        document.addEventListener('renderCompleted', (event) => {
            this.recordRenderOperation('complete', event.detail);
        });
    }

    /**
     * Record render operation metrics
     */
    recordRenderOperation(operation, detail) {
        const metric = {
            operation,
            timestamp: performance.now(),
            componentCount: detail?.componentCount || 0,
            duration: detail?.duration || 0,
            renderType: detail?.renderType || 'full'
        };
        
        this.performanceMetrics.renderOperations.push(metric);
        
        // Keep only last 100 operations
        if (this.performanceMetrics.renderOperations.length > 100) {
            this.performanceMetrics.renderOperations.shift();
        }
    }

    /**
     * Set up performance observer
     */
    setupPerformanceObserver() {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (entry.name.includes('media-kit') || entry.name.includes('guestify')) {
                        console.log(`⚡ Performance: ${entry.name} - ${entry.duration.toFixed(2)}ms`);
                    }
                });
            });
            
            observer.observe({ entryTypes: ['measure', 'navigation'] });
            this.monitors.performance = observer;
            
        } catch (error) {
            console.warn('⚠️ Performance observer setup failed:', error);
        }
    }

    /**
     * Set up memory monitoring
     */
    setupMemoryMonitoring() {
        console.log('💾 Setting up memory monitoring...');
        
        // Monitor memory usage periodically
        this.monitors.memory = setInterval(() => {
            this.checkMemoryUsage();
        }, 30000); // Every 30 seconds
        
        console.log('✅ Memory monitoring active');
    }

    /**
     * Check memory usage
     */
    checkMemoryUsage() {
        if (performance.memory) {
            const memory = {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit,
                timestamp: Date.now()
            };
            
            // Log if memory usage is high
            const usagePercent = (memory.used / memory.limit) * 100;
            if (usagePercent > 80) {
                console.warn(`⚠️ High memory usage: ${usagePercent.toFixed(1)}%`);
            }
            
            return memory;
        }
        
        return null;
    }

    /**
     * Set up error tracking
     */
    setupErrorTracking() {
        console.log('🚨 Setting up error tracking...');
        
        // Global error handler
        window.addEventListener('error', (event) => {
            this.recordError('javascript', event.error, {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });
        
        // Promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            this.recordError('promise', event.reason);
        });
        
        console.log('✅ Error tracking active');
    }

    /**
     * Record error
     */
    recordError(type, error, details = {}) {
        const errorRecord = {
            type,
            message: error?.message || String(error),
            stack: error?.stack,
            timestamp: Date.now(),
            details,
            mediaKitRelated: this.isMediaKitRelatedError(error)
        };
        
        if (errorRecord.mediaKitRelated) {
            console.error(`🚨 Media Kit Error [${type}]:`, errorRecord);
        }
        
        // Store error (keep last 50)
        if (!this.errors) this.errors = [];
        this.errors.push(errorRecord);
        if (this.errors.length > 50) {
            this.errors.shift();
        }
    }

    /**
     * Check if error is Media Kit related
     */
    isMediaKitRelatedError(error) {
        const errorStr = String(error).toLowerCase();
        const mediaKitTerms = [
            'mediakit',
            'media-kit',
            'guestify',
            'enhanced',
            'component',
            'state'
        ];
        
        return mediaKitTerms.some(term => errorStr.includes(term));
    }

    /**
     * Set up validation tools
     */
    setupValidationTools() {
        console.log('✅ Setting up validation tools...');
        
        // System validation
        this.systemValidation = {
            validateCoreSystem: this.validateCoreSystem.bind(this),
            validateWordPressIntegration: this.validateWordPressIntegration.bind(this),
            validateRaceConditionFix: this.validateRaceConditionFix.bind(this),
            validatePerformance: this.validatePerformance.bind(this)
        };
        
        console.log('✅ Validation tools ready');
    }

    /**
     * Validate core system
     */
    validateCoreSystem() {
        console.group('🔍 Core System Validation');
        
        const validation = {
            mediaKitBuilder: !!window.MediaKitBuilder,
            systemRegistrar: !!window.systemRegistrar,
            enhancedComponentManager: !!window.enhancedComponentManager,
            enhancedStateManager: !!window.enhancedStateManager,
            renderer: !!window.renderer,
            raceConditionManager: !!window.raceConditionManager,
            wordPressCoordinator: !!window.wordPressCoordinator
        };
        
        console.table(validation);
        
        const availableSystems = Object.values(validation).filter(Boolean).length;
        const totalSystems = Object.keys(validation).length;
        
        console.log(`📊 System Status: ${availableSystems}/${totalSystems} systems available`);
        
        if (availableSystems === totalSystems) {
            console.log('🎉 CORE SYSTEM VALIDATION: ALL SYSTEMS AVAILABLE!');
        } else {
            const missingSystems = Object.entries(validation)
                .filter(([key, value]) => !value)
                .map(([key]) => key);
            console.warn('⚠️ Missing systems:', missingSystems);
        }
        
        console.groupEnd();
        return validation;
    }

    /**
     * Validate WordPress integration
     */
    validateWordPressIntegration() {
        console.group('🔍 WordPress Integration Validation');
        
        const validation = {
            guestifyData: !!window.guestifyData,
            pluginUrl: !!window.guestifyData?.pluginUrl,
            ajaxUrl: !!window.guestifyData?.ajaxUrl,
            nonce: !!window.guestifyData?.nonce,
            sortableJS: !!window.Sortable,
            wordPressCoordinator: !!window.wordPressCoordinator?.initialized
        };
        
        console.table(validation);
        
        const allValid = Object.values(validation).every(Boolean);
        
        if (allValid) {
            console.log('🎉 WORDPRESS INTEGRATION: ALL CHECKS PASSED!');
        } else {
            const issues = Object.entries(validation)
                .filter(([key, value]) => !value)
                .map(([key]) => key);
            console.warn('⚠️ WordPress integration issues:', issues);
        }
        
        console.groupEnd();
        return validation;
    }

    /**
     * Validate race condition fix
     */
    validateRaceConditionFix() {
        console.group('🔍 Race Condition Fix Validation');
        
        if (window.raceConditionManager && typeof window.raceConditionManager.validateRaceConditionFix === 'function') {
            return window.raceConditionManager.validateRaceConditionFix();
        }
        
        // Fallback validation
        const validation = {
            pollingEliminated: !this.detectPollingFunctions(),
            eventDrivenSystems: !!document.addEventListener,
            systemsReady: this.validateCoreSystem(),
            emergencyRecovery: typeof window.attemptEmergencySystemCreation === 'function'
        };
        
        console.table(validation);
        console.groupEnd();
        return validation;
    }

    /**
     * Detect polling functions
     */
    detectPollingFunctions() {
        const suspiciousFunctions = [];
        
        try {
            for (let prop in window) {
                if (typeof window[prop] === 'function') {
                    const funcStr = window[prop].toString();
                    if (funcStr.includes('setTimeout') && 
                        funcStr.includes('250') && 
                        funcStr.length > 500) {
                        suspiciousFunctions.push(prop);
                    }
                }
            }
        } catch (e) {
            // Ignore errors accessing properties
        }
        
        return suspiciousFunctions.length > 0;
    }

    /**
     * Validate performance
     */
    validatePerformance() {
        console.group('🔍 Performance Validation');
        
        const metrics = this.getPerformanceMetrics();
        
        const validation = {
            initializationTime: metrics.initializationDuration,
            averageComponentOperation: metrics.averageComponentOperation,
            averageStateOperation: metrics.averageStateOperation,
            averageRenderOperation: metrics.averageRenderOperation,
            memoryUsage: this.checkMemoryUsage()
        };
        
        console.table(validation);
        
        // Performance targets
        const targets = {
            initializationTime: 3000, // 3 seconds
            componentOperation: 100,   // 100ms
            stateOperation: 50,        // 50ms
            renderOperation: 200       // 200ms
        };
        
        const performanceIssues = [];
        
        if (validation.initializationTime > targets.initializationTime) {
            performanceIssues.push('Slow initialization');
        }
        
        if (validation.averageComponentOperation > targets.componentOperation) {
            performanceIssues.push('Slow component operations');
        }
        
        if (validation.averageStateOperation > targets.stateOperation) {
            performanceIssues.push('Slow state operations');
        }
        
        if (validation.averageRenderOperation > targets.renderOperation) {
            performanceIssues.push('Slow render operations');
        }
        
        if (performanceIssues.length === 0) {
            console.log('🎉 PERFORMANCE VALIDATION: ALL TARGETS MET!');
        } else {
            console.warn('⚠️ Performance issues detected:', performanceIssues);
        }
        
        console.groupEnd();
        return validation;
    }

    /**
     * Set up test suites
     */
    setupTestSuites() {
        console.log('🧪 Setting up test suites...');
        
        this.testSuites = {
            systemIntegrationTest: this.runSystemIntegrationTest.bind(this),
            componentOperationsTest: this.runComponentOperationsTest.bind(this),
            stateManagementTest: this.runStateManagementTest.bind(this),
            performanceTest: this.runPerformanceTest.bind(this),
            regressionTest: this.runRegressionTest.bind(this)
        };
        
        console.log('✅ Test suites ready');
    }

    /**
     * Run system integration test
     */
    async runSystemIntegrationTest() {
        console.log('🧪 Running system integration test...');
        
        const tests = [
            { name: 'Core systems available', test: () => this.validateCoreSystem() },
            { name: 'WordPress integration', test: () => this.validateWordPressIntegration() },
            { name: 'Race condition fix', test: () => this.validateRaceConditionFix() },
            { name: 'Performance metrics', test: () => this.validatePerformance() }
        ];
        
        const results = [];
        
        for (const test of tests) {
            try {
                const result = await test.test();
                const passed = this.evaluateTestResult(result);
                results.push({ name: test.name, passed, result });
                console.log(`${passed ? '✅' : '❌'} ${test.name}: ${passed ? 'PASS' : 'FAIL'}`);
            } catch (error) {
                results.push({ name: test.name, passed: false, error: error.message });
                console.log(`❌ ${test.name}: ERROR - ${error.message}`);
            }
        }
        
        const passedCount = results.filter(r => r.passed).length;
        console.log(`\n📊 System Integration Test Results: ${passedCount}/${results.length} passed`);
        
        return results;
    }

    /**
     * Run component operations test
     */
    async runComponentOperationsTest() {
        console.log('🧪 Running component operations test...');
        
        if (!window.mediaKitBuilder || !window.mediaKitBuilder.addComponent) {
            return { passed: false, error: 'MediaKit Builder not available' };
        }
        
        try {
            const startTime = performance.now();
            
            // Test add component
            const component = window.mediaKitBuilder.addComponent('test', { content: 'Test Component' });
            
            // Test component exists
            const state = window.mediaKitBuilder.getState();
            const componentExists = state.components.some(c => c.id === component.id);
            
            // Test remove component
            const removed = window.mediaKitBuilder.removeComponent(component.id);
            
            const duration = performance.now() - startTime;
            
            const result = {
                passed: componentExists && removed,
                duration,
                operations: ['add', 'validate', 'remove'],
                componentId: component.id
            };
            
            console.log(`${result.passed ? '✅' : '❌'} Component operations: ${result.passed ? 'PASS' : 'FAIL'} (${duration.toFixed(2)}ms)`);
            
            return result;
            
        } catch (error) {
            return { passed: false, error: error.message };
        }
    }

    /**
     * Run state management test
     */
    async runStateManagementTest() {
        console.log('🧪 Running state management test...');
        
        if (!window.enhancedStateManager) {
            return { passed: false, error: 'Enhanced State Manager not available' };
        }
        
        try {
            const startTime = performance.now();
            
            // Test get state
            const initialState = window.enhancedStateManager.getState();
            
            // Test set state
            const testState = { test: true, timestamp: Date.now() };
            window.enhancedStateManager.setState(testState);
            
            // Test state update
            const updatedState = window.enhancedStateManager.getState();
            const stateUpdated = updatedState.test === true;
            
            const duration = performance.now() - startTime;
            
            const result = {
                passed: stateUpdated,
                duration,
                operations: ['get', 'set', 'validate'],
                initialState: !!initialState,
                stateUpdated
            };
            
            console.log(`${result.passed ? '✅' : '❌'} State management: ${result.passed ? 'PASS' : 'FAIL'} (${duration.toFixed(2)}ms)`);
            
            return result;
            
        } catch (error) {
            return { passed: false, error: error.message };
        }
    }

    /**
     * Run performance test
     */
    async runPerformanceTest() {
        console.log('🧪 Running performance test...');
        
        const metrics = this.getPerformanceMetrics();
        
        const targets = {
            initializationTime: 3000,
            componentOperation: 100,
            stateOperation: 50,
            renderOperation: 200
        };
        
        const results = {
            initializationTimeMet: metrics.initializationDuration <= targets.initializationTime,
            componentOperationsMet: metrics.averageComponentOperation <= targets.componentOperation,
            stateOperationsMet: metrics.averageStateOperation <= targets.stateOperation,
            renderOperationsMet: metrics.averageRenderOperation <= targets.renderOperation
        };
        
        const passed = Object.values(results).every(Boolean);
        
        console.log(`${passed ? '✅' : '❌'} Performance test: ${passed ? 'PASS' : 'FAIL'}`);
        console.log('📊 Performance metrics:', metrics);
        
        return { passed, results, metrics, targets };
    }

    /**
     * Run regression test
     */
    async runRegressionTest() {
        console.log('🧪 Running regression test...');
        
        const tests = [
            this.runSystemIntegrationTest(),
            this.runComponentOperationsTest(),
            this.runStateManagementTest(),
            this.runPerformanceTest()
        ];
        
        const results = await Promise.all(tests);
        const passedCount = results.filter(r => r.passed).length;
        const totalTests = results.length;
        
        const regressionPassed = passedCount === totalTests;
        
        console.log(`${regressionPassed ? '✅' : '❌'} Regression test: ${regressionPassed ? 'PASS' : 'FAIL'} (${passedCount}/${totalTests})`);
        
        return { passed: regressionPassed, results, passedCount, totalTests };
    }

    /**
     * Evaluate test result
     */
    evaluateTestResult(result) {
        if (typeof result === 'boolean') return result;
        if (typeof result === 'object' && result.passed !== undefined) return result.passed;
        if (typeof result === 'object') {
            return Object.values(result).every(val => val === true || (typeof val === 'object' && val));
        }
        return false;
    }

    /**
     * Expose diagnostic functions globally
     */
    exposeDiagnosticFunctions() {
        console.log('🌐 Exposing diagnostic functions...');
        
        // Core validation functions
        window.validateMediaKitSystems = () => this.validateCoreSystem();
        window.validateWordPressIntegration = () => this.validateWordPressIntegration();
        window.validateRaceConditionFix = () => this.validateRaceConditionFix();
        window.validatePerformance = () => this.validatePerformance();
        
        // Test suite functions
        window.runSystemIntegrationTest = () => this.runSystemIntegrationTest();
        window.runComponentOperationsTest = () => this.runComponentOperationsTest();
        window.runStateManagementTest = () => this.runStateManagementTest();
        window.runPerformanceTest = () => this.runPerformanceTest();
        window.runRegressionTest = () => this.runRegressionTest();
        
        // Utility functions
        window.getPerformanceMetrics = () => this.getPerformanceMetrics();
        window.getDiagnosticStatus = () => this.getStatus();
        window.generateDiagnosticReport = () => this.generateComprehensiveReport();
        
        // Quick test function
        window.quickDiagnosticTest = async () => {
            console.log('⚡ Running quick diagnostic test...');
            const results = await this.runSystemIntegrationTest();
            const passed = results.filter(r => r.passed).length;
            console.log(`📊 Quick test results: ${passed}/${results.length} passed`);
            return results;
        };
        
        console.log('✅ Diagnostic functions exposed globally');
    }

    /**
     * Get performance metrics
     */
    getPerformanceMetrics() {
        const initDuration = this.performanceMetrics.initializationEnd && this.performanceMetrics.initializationStart
            ? this.performanceMetrics.initializationEnd - this.performanceMetrics.initializationStart
            : 0;
        
        const avgComponent = this.performanceMetrics.componentOperations.length > 0
            ? this.performanceMetrics.componentOperations.reduce((sum, op) => sum + op.duration, 0) / this.performanceMetrics.componentOperations.length
            : 0;
        
        const avgState = this.performanceMetrics.stateOperations.length > 0
            ? this.performanceMetrics.stateOperations.reduce((sum, op) => sum + op.duration, 0) / this.performanceMetrics.stateOperations.length
            : 0;
        
        const avgRender = this.performanceMetrics.renderOperations.length > 0
            ? this.performanceMetrics.renderOperations.reduce((sum, op) => sum + op.duration, 0) / this.performanceMetrics.renderOperations.length
            : 0;
        
        return {
            initializationDuration: initDuration,
            averageComponentOperation: avgComponent,
            averageStateOperation: avgState,
            averageRenderOperation: avgRender,
            totalComponentOperations: this.performanceMetrics.componentOperations.length,
            totalStateOperations: this.performanceMetrics.stateOperations.length,
            totalRenderOperations: this.performanceMetrics.renderOperations.length
        };
    }

    /**
     * Mark initialization completion
     */
    markInitializationComplete() {
        this.performanceMetrics.initializationEnd = performance.now();
        console.log(`⚡ Initialization completed in ${this.getPerformanceMetrics().initializationDuration.toFixed(2)}ms`);
    }

    /**
     * Generate comprehensive diagnostic report
     */
    generateComprehensiveReport() {
        console.group('📋 Comprehensive Diagnostic Report');
        
        const report = {
            timestamp: new Date().toISOString(),
            diagnosticManager: {
                initialized: this.initialized,
                version: '1.0.0'
            },
            systemValidation: this.validateCoreSystem(),
            wordPressIntegration: this.validateWordPressIntegration(),
            raceConditionFix: this.validateRaceConditionFix(),
            performanceMetrics: this.getPerformanceMetrics(),
            memoryUsage: this.checkMemoryUsage(),
            errorCount: this.errors ? this.errors.length : 0,
            recentErrors: this.errors ? this.errors.slice(-5) : []
        };
        
        console.log('📊 Diagnostic Report Generated:');
        console.table(report.systemValidation);
        console.table(report.wordPressIntegration);
        console.table(report.performanceMetrics);
        
        if (report.errorCount > 0) {
            console.warn(`⚠️ ${report.errorCount} errors recorded:`);
            console.table(report.recentErrors);
        }
        
        console.groupEnd();
        return report;
    }

    /**
     * Get diagnostic manager status
     */
    getStatus() {
        return {
            initialized: this.initialized,
            performanceMonitoring: !!this.monitors.performance,
            memoryMonitoring: !!this.monitors.memory,
            errorTracking: true,
            validationTools: !!this.systemValidation,
            testSuites: !!this.testSuites,
            errorCount: this.errors ? this.errors.length : 0,
            timestamp: Date.now()
        };
    }

    /**
     * Cleanup diagnostic systems
     */
    cleanup() {
        console.log('🧹 Cleaning up diagnostic systems...');
        
        // Clear performance monitor
        if (this.monitors.performance) {
            this.monitors.performance.disconnect();
        }
        
        // Clear memory monitor
        if (this.monitors.memory) {
            clearInterval(this.monitors.memory);
        }
        
        // Clear metrics
        this.performanceMetrics = {
            initializationStart: null,
            initializationEnd: null,
            componentOperations: [],
            stateOperations: [],
            renderOperations: []
        };
        
        console.log('✅ Diagnostic systems cleaned up');
    }
}

// Export for use
export default DiagnosticManager;

// Make available globally for easy access
window.DiagnosticManager = DiagnosticManager;

console.log('📦 Diagnostic Manager: Class loaded and ready (Phase 1 Complete)');
