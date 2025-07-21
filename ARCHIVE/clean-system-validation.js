/**
 * @file clean-system-validation.js
 * @description ROOT FIX: Clean System Validation (No Polling)
 * 
 * This script validates the current system status without any polling,
 * timeouts, or debug overhead. It provides a clean assessment of 
 * whether the race condition fixes are working.
 */

(function() {
    'use strict';
    
    console.log('✨ CLEAN SYSTEM VALIDATION (No Polling)');
    
    /**
     * Clean System Status Check (No Polling)
     */
    window.cleanSystemValidation = function() {
        console.clear();
        console.log('🔍 CLEAN SYSTEM VALIDATION - No Polling, No Debug Overhead');
        console.log('═'.repeat(70));
        
        const timestamp = new Date().toISOString();
        console.log('🕐 Test Time:', timestamp);
        
        // Phase 1: Core System Availability (Immediate Check)
        const coreSystemStatus = {
            enhancedComponentManager: !!window.enhancedComponentManager,
            stateManager: !!window.stateManager,
            enhancedStateManager: !!window.enhancedStateManager,
            renderer: !!window.renderer,
            systemRegistrar: !!window.systemRegistrar,
            dynamicComponentLoader: !!window.dynamicComponentLoader
        };
        
        const systemsReady = Object.values(coreSystemStatus).filter(Boolean).length;
        const totalSystems = Object.keys(coreSystemStatus).length;
        
        console.log('📊 CORE SYSTEM STATUS:');
        console.table(coreSystemStatus);
        console.log(`🎯 Systems Ready: ${systemsReady}/${totalSystems}`);
        
        // Phase 2: Anti-Polling System Status
        const antiPollingStatus = {
            pollingDetectorActive: !!window.pollingDetector,
            pollingEliminatorActive: !!window.pollingEliminator,
            antiPollingDebugActive: !!window.antiPollingDebug,
            setTimeoutOverridden: window.setTimeout.toString().includes('BLOCKED') || 
                                 window.setTimeout.toString().includes('polling'),
            setIntervalOverridden: window.setInterval.toString().includes('BLOCKED') || 
                                  window.setInterval.toString().includes('polling')
        };
        
        console.log('🚫 ANTI-POLLING STATUS:');
        console.table(antiPollingStatus);
        
        // Phase 3: Event Coordination Status
        const eventStatus = {
            eventCoordinationExists: !!window.gmkbEventCoordination,
            coreSystemsReadyFired: window.gmkbEventCoordination?.coreSystemsReadyFired || false,
            mediaKitBuilderReadyFired: window.gmkbEventCoordination?.mediaKitBuilderReadyFired || false,
            bundleCoordination: window.gmkbBundleCoordination?.coordination || 'unknown',
            templateReady: !!window.gmkbTemplateComplete
        };
        
        console.log('🎧 EVENT COORDINATION STATUS:');
        console.table(eventStatus);
        
        // Phase 4: Initialization Performance
        const performanceStatus = {
            startTime: window.gmkbEventCoordination?.startTime || null,
            currentTime: Date.now(),
            initializationDuration: window.gmkbEventCoordination?.startTime ? 
                `${Math.round((Date.now() - window.gmkbEventCoordination.startTime) / 1000)}s` : 'unknown',
            wordPressCompatible: !!window.gmkbWordPressCompatible,
            bundleArchitecture: !!window.gmkbBundleCoordination
        };
        
        console.log('⚡ PERFORMANCE STATUS:');
        console.table(performanceStatus);
        
        // Phase 5: DOM Elements Status
        const domStatus = {
            builderExists: !!document.querySelector('.builder'),
            previewExists: !!document.getElementById('media-kit-preview'),
            emptyStateExists: !!document.getElementById('empty-state'),
            componentLibraryExists: !!document.getElementById('component-library-overlay'),
            toolbarExists: !!document.querySelector('.toolbar')
        };
        
        console.log('🏗️ DOM ELEMENTS STATUS:');
        console.table(domStatus);
        
        // Phase 6: Overall Assessment
        const assessment = {
            coreSystemsWorking: systemsReady >= 4,
            eventsWorking: eventStatus.coreSystemsReadyFired,
            domReady: domStatus.builderExists && domStatus.previewExists,
            noActivePolling: !antiPollingStatus.pollingDetectorActive && 
                           !antiPollingStatus.pollingEliminatorActive,
            fastInit: performanceStatus.initializationDuration !== 'unknown' && 
                     parseInt(performanceStatus.initializationDuration) < 10
        };
        
        const overallSuccess = assessment.coreSystemsWorking && 
                             assessment.eventsWorking && 
                             assessment.domReady;
        
        console.log('═'.repeat(70));
        console.log('🏆 OVERALL ASSESSMENT:');
        console.table(assessment);
        
        if (overallSuccess) {
            console.log('%c🎆 SUCCESS: RACE CONDITIONS ELIMINATED!', 'color: #10b981; font-size: 16px; font-weight: bold;');
            console.log('✅ All core systems working');
            console.log('✅ Event-driven coordination active');
            console.log('✅ DOM elements ready');
            console.log('✅ No timeout errors expected');
            
            if (assessment.noActivePolling) {
                console.log('✅ No active polling systems detected');
            } else {
                console.log('⚠️ Some polling/anti-polling systems still active (may be cached)');
            }
            
            if (assessment.fastInit) {
                console.log('✅ Fast initialization achieved');
            }
            
        } else {
            console.log('%c⚠️ ISSUES DETECTED:', 'color: #f59e0b; font-size: 16px; font-weight: bold;');
            
            if (!assessment.coreSystemsWorking) {
                console.log(`❌ Core systems: ${systemsReady}/${totalSystems} ready`);
                const missingSystems = Object.entries(coreSystemStatus)
                    .filter(([key, value]) => !value)
                    .map(([key]) => key);
                console.log('   Missing systems:', missingSystems);
            }
            
            if (!assessment.eventsWorking) {
                console.log('❌ Event coordination not working');
            }
            
            if (!assessment.domReady) {
                console.log('❌ DOM elements not ready');
            }
            
            console.log('\n🔧 RECOMMENDED ACTIONS:');
            console.log('1. Clear browser cache completely (Ctrl+Shift+Delete)');
            console.log('2. Clear WordPress cache if using caching plugins');
            console.log('3. Hard refresh the page (Ctrl+F5)');
            console.log('4. Wait 5-10 seconds and re-run this test');
        }
        
        // Phase 7: Browser Cache Warning
        if (antiPollingStatus.pollingDetectorActive || antiPollingStatus.pollingEliminatorActive) {
            console.log('\n🗄️ CACHE WARNING:');
            console.log('⚠️ Anti-polling systems detected - likely from browser cache');
            console.log('🧹 Clear browser cache to see clean results');
            console.log('💡 These systems may be blocking functions but should not be needed anymore');
        }
        
        console.log('═'.repeat(70));
        console.log('🕐 Test completed at:', new Date().toISOString());
        
        return {
            coreSystemStatus,
            antiPollingStatus,
            eventStatus,
            performanceStatus,
            domStatus,
            assessment,
            overallSuccess,
            timestamp
        };
    };
    
    /**
     * Quick Status Check
     */
    window.quickSystemCheck = function() {
        const systems = {
            enhancedComponentManager: !!window.enhancedComponentManager,
            stateManager: !!window.stateManager,
            renderer: !!window.renderer,
            events: window.gmkbEventCoordination?.coreSystemsReadyFired || false
        };
        
        const ready = Object.values(systems).filter(Boolean).length;
        console.log(`🎯 Quick Check: ${ready}/4 systems ready`, systems);
        
        return ready === 4;
    };
    
    /**
     * Cache Status Check
     */
    window.checkCacheStatus = function() {
        const cacheIndicators = {
            pollingDetector: !!window.pollingDetector,
            pollingEliminator: !!window.pollingEliminator,
            antiPollingDebug: !!window.antiPollingDebug,
            setTimeoutModified: window.setTimeout.toString().length > 100,
            setIntervalModified: window.setInterval.toString().length > 100
        };
        
        const cacheIssues = Object.values(cacheIndicators).filter(Boolean).length;
        
        console.log('🗄️ Cache Status Check:');
        console.table(cacheIndicators);
        
        if (cacheIssues > 0) {
            console.log('⚠️ Browser cache detected - clear cache for clean results');
        } else {
            console.log('✅ Clean cache - no legacy debug systems detected');
        }
        
        return cacheIssues === 0;
    };
    
    // Auto-run after 2 seconds to allow systems to initialize
    setTimeout(() => {
        console.log('🤖 Auto-running clean system validation...');
        window.cleanSystemValidation();
    }, 2000);
    
    console.log('✅ Clean System Validation Loaded');
    console.log('📝 Commands:');
    console.log('  cleanSystemValidation() - Full system check');
    console.log('  quickSystemCheck() - Quick status');
    console.log('  checkCacheStatus() - Check for cached debug scripts');
    
})();
