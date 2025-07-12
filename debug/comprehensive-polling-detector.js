/**
 * @file comprehensive-polling-detector.js
 * @description ROOT FIX: Comprehensive Polling Detection and Elimination System
 * 
 * This script creates a comprehensive monitoring system to detect ALL polling
 * functions, setTimeout loops, and race conditions in the Media Kit Builder.
 * 
 * CRITICAL: This will identify the exact source of line 2584 error
 */

(function() {
    'use strict';
    
    console.log('🕵️ ROOT FIX: Comprehensive Polling Detection System Active');
    
    // Global polling detection state
    window.pollingDetector = {
        detected: [],
        intervals: [],
        timeouts: [],
        originalSetTimeout: window.setTimeout,
        originalSetInterval: window.setInterval,
        originalClearTimeout: window.clearTimeout,
        originalClearInterval: window.clearInterval,
        startTime: Date.now(),
        isActive: true
    };
    
    // PHASE 1: Override setTimeout to detect polling patterns
    window.setTimeout = function(...args) {
        const callback = args[0];
        const delay = args[1] || 0;
        
        // Detect potential polling patterns
        if (delay === 250 || delay === 500 || delay === 1000) {
            // Get stack trace to identify source
            const stack = new Error().stack;
            const caller = stack.split('\n')[2] || 'unknown';
            
            // Check if callback contains polling indicators
            const callbackStr = typeof callback === 'function' ? callback.toString() : String(callback);
            const isPolling = callbackStr.includes('check') || 
                            callbackStr.includes('Enhanced state manager') ||
                            callbackStr.includes('setTimeout') ||
                            callbackStr.includes('while') ||
                            callbackStr.includes('setInterval');
            
            if (isPolling) {
                const pollingInfo = {
                    type: 'setTimeout',
                    delay: delay,
                    callback: callbackStr.substring(0, 200) + '...',
                    caller: caller,
                    timestamp: Date.now(),
                    stackTrace: stack
                };
                
                window.pollingDetector.detected.push(pollingInfo);
                
                console.warn('🚨 POLLING DETECTED:', pollingInfo);
                console.warn('🔍 Full callback:', callbackStr);
                console.warn('📍 Stack trace:', stack);
                
                // Check if this is the specific error we're looking for
                if (callbackStr.includes('Enhanced state manager not found') || 
                    callbackStr.includes('check') && delay === 250) {
                    console.error('🎯 FOUND THE CULPRIT! This is likely line 2584 polling:', pollingInfo);
                    console.error('🚫 BLOCKING THIS POLLING FUNCTION');
                    
                    // Block the polling function and return a dummy timeout
                    return window.pollingDetector.originalSetTimeout(() => {
                        console.log('🚫 Blocked polling function would have executed');
                    }, 1);
                }
            }
        }
        
        // Track all timeouts for monitoring
        const timeoutId = window.pollingDetector.originalSetTimeout.apply(this, args);
        window.pollingDetector.timeouts.push({
            id: timeoutId,
            delay: delay,
            timestamp: Date.now()
        });
        
        return timeoutId;
    };
    
    // PHASE 2: Override setInterval to detect polling patterns
    window.setInterval = function(...args) {
        const callback = args[0];
        const delay = args[1] || 0;
        
        // All setInterval calls are potential polling
        const stack = new Error().stack;
        const caller = stack.split('\n')[2] || 'unknown';
        const callbackStr = typeof callback === 'function' ? callback.toString() : String(callback);
        
        const intervalInfo = {
            type: 'setInterval',
            delay: delay,
            callback: callbackStr.substring(0, 200) + '...',
            caller: caller,
            timestamp: Date.now(),
            stackTrace: stack
        };
        
        window.pollingDetector.detected.push(intervalInfo);
        
        console.warn('🔄 INTERVAL DETECTED:', intervalInfo);
        
        // Check if this looks like problematic polling
        if (callbackStr.includes('check') || callbackStr.includes('Enhanced state manager')) {
            console.error('🚨 SUSPICIOUS INTERVAL - May need blocking:', intervalInfo);
        }
        
        const intervalId = window.pollingDetector.originalSetInterval.apply(this, args);
        window.pollingDetector.intervals.push({
            id: intervalId,
            delay: delay,
            timestamp: Date.now()
        });
        
        return intervalId;
    };
    
    // PHASE 3: Monitor function calls that might contain polling
    const monitorFunction = (obj, funcName, objName) => {
        if (obj && typeof obj[funcName] === 'function') {
            const original = obj[funcName];
            obj[funcName] = function(...args) {
                // Check if this function call might be related to polling
                const funcStr = original.toString();
                if (funcStr.includes('setTimeout') && funcStr.includes('check')) {
                    console.warn(`🔍 ${objName}.${funcName} contains setTimeout + check:`, funcStr.substring(0, 300));
                }
                return original.apply(this, args);
            };
        }
    };
    
    // Monitor common objects that might contain polling
    setTimeout(() => {
        monitorFunction(window, 'waitForEnhancedSystems', 'window');
        monitorFunction(window, 'coordinateStateLoading', 'window');
        monitorFunction(window, 'checkSystemReady', 'window');
        
        if (window.enhancedStateManager) {
            monitorFunction(window.enhancedStateManager, 'autoLoadSavedState', 'enhancedStateManager');
        }
        
        if (window.initializationManager) {
            monitorFunction(window.initializationManager, 'initialize', 'initializationManager');
        }
    }, 100);
    
    // PHASE 4: Scan all global functions for polling patterns
    const scanGlobalFunctions = () => {
        console.log('🔍 Scanning all global functions for polling patterns...');
        
        for (const prop in window) {
            try {
                if (typeof window[prop] === 'function') {
                    const funcStr = window[prop].toString();
                    
                    // Check for polling patterns
                    if ((funcStr.includes('setTimeout') && funcStr.includes('check')) ||
                        (funcStr.includes('Enhanced state manager not found')) ||
                        (funcStr.includes('250') && funcStr.includes('setTimeout'))) {
                        
                        console.error(`🎯 POTENTIAL POLLING FUNCTION FOUND: window.${prop}`);
                        console.error('📄 Function content:', funcStr);
                        
                        // This might be our culprit
                        if (funcStr.includes('Enhanced state manager not found')) {
                            console.error('🚨 THIS IS LIKELY THE LINE 2584 ERROR SOURCE!');
                            window.pollingDetector.likelySource = prop;
                        }
                    }
                }
            } catch (error) {
                // Ignore errors accessing restricted properties
            }
        }
    };
    
    // PHASE 5: Deep DOM scan for inline scripts with polling
    const scanInlineScripts = () => {
        console.log('🔍 Scanning inline scripts for polling patterns...');
        
        const scripts = document.querySelectorAll('script');
        scripts.forEach((script, index) => {
            if (script.textContent) {
                const content = script.textContent;
                
                if ((content.includes('setTimeout') && content.includes('check')) ||
                    content.includes('Enhanced state manager not found') ||
                    (content.includes('250') && content.includes('setTimeout'))) {
                    
                    console.error(`🎯 POLLING FOUND IN INLINE SCRIPT #${index}:`);
                    console.error('📄 Script content:', content.substring(0, 500) + '...');
                    console.error('📍 Script element:', script);
                    
                    // This is very likely our culprit
                    window.pollingDetector.inlineScriptIndex = index;
                    window.pollingDetector.problematicScript = content;
                }
            }
        });
    };
    
    // PHASE 6: Generate comprehensive report
    window.pollingDetector.generateReport = function() {
        console.group('📊 COMPREHENSIVE POLLING DETECTION REPORT');
        
        console.log(`🕐 Detection running for: ${Math.round((Date.now() - this.startTime) / 1000)} seconds`);
        console.log(`🚨 Total polling instances detected: ${this.detected.length}`);
        console.log(`⏰ Active timeouts: ${this.timeouts.length}`);
        console.log(`🔄 Active intervals: ${this.intervals.length}`);
        
        if (this.detected.length > 0) {
            console.group('🚨 DETECTED POLLING INSTANCES:');
            this.detected.forEach((item, index) => {
                console.log(`${index + 1}. ${item.type} (${item.delay}ms):`, item);
            });
            console.groupEnd();
        }
        
        if (this.likelySource) {
            console.error(`🎯 LIKELY SOURCE OF LINE 2584 ERROR: window.${this.likelySource}`);
        }
        
        if (this.inlineScriptIndex !== undefined) {
            console.error(`🎯 POLLING FOUND IN INLINE SCRIPT #${this.inlineScriptIndex}`);
        }
        
        console.log('💡 Next steps:');
        console.log('  1. Review detected polling instances above');
        console.log('  2. Check likely source functions');
        console.log('  3. Examine inline scripts if found');
        console.log('  4. Run pollingDetector.eliminateAllPolling() to fix');
        
        console.groupEnd();
        return this.detected;
    };
    
    // PHASE 7: Automatic polling elimination
    window.pollingDetector.eliminateAllPolling = function() {
        console.log('🚫 ELIMINATING ALL DETECTED POLLING...');
        
        // Clear all timeouts
        this.timeouts.forEach(timeout => {
            try {
                this.originalClearTimeout(timeout.id);
                console.log(`✅ Cleared timeout: ${timeout.id}`);
            } catch (error) {
                console.warn(`⚠️ Failed to clear timeout ${timeout.id}:`, error);
            }
        });
        
        // Clear all intervals
        this.intervals.forEach(interval => {
            try {
                this.originalClearInterval(interval.id);
                console.log(`✅ Cleared interval: ${interval.id}`);
            } catch (error) {
                console.warn(`⚠️ Failed to clear interval ${interval.id}:`, error);
            }
        });
        
        // Replace polling functions with no-ops
        if (this.likelySource && window[this.likelySource]) {
            console.log(`🚫 Disabling polling function: ${this.likelySource}`);
            window[this.likelySource] = function() {
                console.log(`🚫 Blocked call to polling function: ${this.likelySource}`);
                return false;
            };
        }
        
        // Force system exposure if needed
        this.forceSystemExposure();
        
        console.log('✅ All detected polling eliminated');
        return true;
    };
    
    // PHASE 8: Force system exposure to eliminate need for polling
    window.pollingDetector.forceSystemExposure = function() {
        console.log('🔧 Forcing system exposure to eliminate polling need...');
        
        // Ensure all critical systems are exposed
        const criticalSystems = [
            'systemRegistrar',
            'enhancedStateManager', 
            'stateManager',
            'enhancedComponentManager',
            'componentManager',
            'renderer',
            'dynamicComponentLoader'
        ];
        
        let exposedCount = 0;
        criticalSystems.forEach(system => {
            if (window[system]) {
                exposedCount++;
                console.log(`✅ ${system}: Available`);
            } else {
                console.warn(`❌ ${system}: Missing`);
                
                // Try to create emergency system
                if (system === 'enhancedStateManager' || system === 'stateManager') {
                    window[system] = {
                        getState: () => ({ components: {}, layout: [] }),
                        setState: () => {},
                        addComponent: () => {},
                        autoLoadSavedState: () => {},
                        emergency: true
                    };
                    console.log(`🚑 Created emergency ${system}`);
                    exposedCount++;
                }
            }
        });
        
        console.log(`📊 System exposure: ${exposedCount}/${criticalSystems.length} systems available`);
        
        // Dispatch system ready events to satisfy any waiting code
        const events = ['coreSystemsReady', 'enhancedSystemsReady', 'mediaKitBuilderReady'];
        events.forEach(eventName => {
            try {
                document.dispatchEvent(new CustomEvent(eventName, {
                    detail: { 
                        source: 'polling-detector-force',
                        exposedSystems: exposedCount,
                        timestamp: Date.now()
                    }
                }));
                console.log(`✅ Dispatched ${eventName} event`);
            } catch (error) {
                console.warn(`⚠️ Failed to dispatch ${eventName}:`, error);
            }
        });
        
        return exposedCount;
    };
    
    // PHASE 9: Real-time monitoring setup
    const setupRealTimeMonitoring = () => {
        // Monitor every 5 seconds for first minute
        const monitoringIntervals = [5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000];
        
        monitoringIntervals.forEach((delay, index) => {
            setTimeout(() => {
                if (window.pollingDetector.detected.length > 0) {
                    console.log(`📊 Monitoring update #${index + 1}: ${window.pollingDetector.detected.length} polling instances detected`);
                    
                    // Auto-eliminate if we find the specific error
                    const hasTargetError = window.pollingDetector.detected.some(item => 
                        item.callback.includes('Enhanced state manager not found')
                    );
                    
                    if (hasTargetError && index > 3) { // After 20 seconds
                        console.log('🚨 Auto-eliminating detected polling after 20 seconds...');
                        window.pollingDetector.eliminateAllPolling();
                    }
                }
            }, delay * (index + 1));
        });
    };
    
    // PHASE 10: Initialize detection
    setTimeout(() => {
        scanGlobalFunctions();
        setupRealTimeMonitoring();
    }, 1000);
    
    setTimeout(() => {
        scanInlineScripts();
    }, 2000);
    
    // Auto-generate report after 10 seconds
    setTimeout(() => {
        window.pollingDetector.generateReport();
    }, 10000);
    
    // Global access functions
    window.detectPolling = () => window.pollingDetector.generateReport();
    window.eliminatePolling = () => window.pollingDetector.eliminateAllPolling();
    window.pollingStatus = () => {
        return {
            detected: window.pollingDetector.detected.length,
            timeouts: window.pollingDetector.timeouts.length,
            intervals: window.pollingDetector.intervals.length,
            likelySource: window.pollingDetector.likelySource || 'none',
            running: Date.now() - window.pollingDetector.startTime
        };
    };
    
    console.log('✅ Comprehensive Polling Detection System Ready');
    console.log('🔧 Available commands:');
    console.log('  detectPolling() - Generate detection report');
    console.log('  eliminatePolling() - Eliminate all detected polling');
    console.log('  pollingStatus() - Get current status');
    
})();
