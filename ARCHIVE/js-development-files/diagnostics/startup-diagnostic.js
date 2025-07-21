/**
 * @file startup-diagnostic.js
 * @description Comprehensive diagnostic tool for Media Kit Builder startup issues
 */

class StartupDiagnostic {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            errors: [],
            warnings: [],
            info: [],
            systemStatus: {},
            recommendations: []
        };
    }

    /**
     * Run comprehensive diagnostic
     */
    async runDiagnostic() {
        console.log('🔍 Running Media Kit Builder Startup Diagnostic...\n');
        
        // Check core systems
        this.checkCoreSystems();
        
        // Check initialization state
        this.checkInitializationState();
        
        // Check for common issues
        this.checkCommonIssues();
        
        // Check MKCG integration
        this.checkMKCGIntegration();
        
        // Check startup coordination
        this.checkStartupCoordination();
        
        // Generate recommendations
        this.generateRecommendations();
        
        // Display results
        this.displayResults();
        
        return this.results;
    }

    /**
     * Check core systems availability
     */
    checkCoreSystems() {
        console.log('📋 Checking Core Systems...');
        
        const systems = {
            'window.stateManager': !!window.stateManager,
            'window.componentManager': !!window.componentManager,
            'window.enhancedComponentManager': !!window.enhancedComponentManager,
            'window.renderer': !!window.renderer,
            'window.eventBus': !!window.eventBus,
            'window.systemRegistrar': !!window.systemRegistrar,
            'window.initializationManager': !!window.initializationManager,
            'window.startupCoordinationManager': !!window.startupCoordinationManager
        };

        this.results.systemStatus.coreSystems = systems;

        Object.entries(systems).forEach(([system, available]) => {
            if (available) {
                console.log(`  ✅ ${system}: Available`);
            } else {
                console.log(`  ❌ ${system}: NOT AVAILABLE`);
                this.results.errors.push(`Core system ${system} is not available`);
            }
        });

        // Check critical methods
        if (window.enhancedComponentManager) {
            const methods = {
                'addComponent': typeof window.enhancedComponentManager.addComponent === 'function',
                'updateComponent': typeof window.enhancedComponentManager.updateComponent === 'function',
                'removeComponent': typeof window.enhancedComponentManager.removeComponent === 'function',
                'init': typeof window.enhancedComponentManager.init === 'function'
            };

            this.results.systemStatus.enhancedComponentManagerMethods = methods;
            
            console.log('\n  Enhanced Component Manager Methods:');
            Object.entries(methods).forEach(([method, exists]) => {
                console.log(`    ${exists ? '✅' : '❌'} ${method}: ${exists ? 'Available' : 'NOT AVAILABLE'}`);
            });
        }
    }

    /**
     * Check initialization state
     */
    checkInitializationState() {
        console.log('\n📋 Checking Initialization State...');
        
        const initState = {
            'DOM Ready': document.readyState === 'complete',
            'guestifyData Available': !!window.guestifyData,
            'pluginUrl Available': !!window.guestifyData?.pluginUrl,
            'ajaxurl Available': !!window.guestifyData?.ajaxurl,
            'nonce Available': !!window.guestifyData?.nonce,
            'builder Element Present': !!document.getElementById('media-kit-preview'),
            'component Library Modal': !!document.getElementById('component-library-overlay')
        };

        this.results.systemStatus.initializationState = initState;

        Object.entries(initState).forEach(([check, passed]) => {
            console.log(`  ${passed ? '✅' : '❌'} ${check}: ${passed ? 'Yes' : 'No'}`);
            if (!passed && ['DOM Ready', 'guestifyData Available', 'builder Element Present'].includes(check)) {
                this.results.errors.push(`Critical initialization requirement failed: ${check}`);
            }
        });
    }

    /**
     * Check for common issues
     */
    checkCommonIssues() {
        console.log('\n📋 Checking Common Issues...');

        // Check for console errors
        const hasConsoleErrors = window.console?.error?.toString().includes('native code');
        if (!hasConsoleErrors) {
            this.results.warnings.push('Console error method may have been overridden');
        }

        // Check for global variable conflicts
        const globalConflicts = [
            'mk', 'mkLog', 'mkPerf', 'stateManager', 'componentManager', 'renderer'
        ].filter(varName => {
            const value = window[varName];
            return value && typeof value === 'object' && !value.__mediaKitBuilder;
        });

        if (globalConflicts.length > 0) {
            this.results.warnings.push(`Potential global variable conflicts: ${globalConflicts.join(', ')}`);
        }

        // Check for multiple jQuery versions
        if (window.jQuery && window.$) {
            const jqVersion = window.jQuery.fn?.jquery;
            const $Version = window.$.fn?.jquery;
            if (jqVersion !== $Version) {
                this.results.warnings.push(`Multiple jQuery versions detected: ${jqVersion} vs ${$Version}`);
            }
        }

        console.log(`  ${hasConsoleErrors ? '✅' : '⚠️'} Console methods intact`);
        console.log(`  ${globalConflicts.length === 0 ? '✅' : '⚠️'} No global conflicts${globalConflicts.length > 0 ? ': ' + globalConflicts.join(', ') : ''}`);
    }

    /**
     * Check MKCG integration
     */
    checkMKCGIntegration() {
        console.log('\n📋 Checking MKCG Integration...');

        const mkcgState = {
            'MKCG Data Available': !!window.guestifyData?.mkcgData,
            'Post ID Available': !!window.guestifyData?.postId,
            'MKCG Timestamp': !!window.guestifyData?.mkcgData?.meta_info?.extraction_timestamp,
            'Topics Data': !!window.guestifyData?.mkcgData?.topics,
            'Biography Data': !!window.guestifyData?.mkcgData?.biography,
            'Data Mapper Available': !!window.mkcgDataMapper,
            'Refresh Manager Available': !!window.mkcgDataRefreshManager
        };

        this.results.systemStatus.mkcgIntegration = mkcgState;

        Object.entries(mkcgState).forEach(([check, passed]) => {
            console.log(`  ${passed ? '✅' : '❌'} ${check}: ${passed ? 'Yes' : 'No'}`);
        });

        // Check if MKCG integration should be active
        const shouldHaveMKCG = window.location.search.includes('post_id=') || 
                              window.location.search.includes('p=') ||
                              window.location.search.includes('page_id=');

        if (shouldHaveMKCG && !mkcgState['MKCG Data Available']) {
            this.results.warnings.push('URL parameters suggest MKCG data should be available but it\'s not');
        }
    }

    /**
     * Check startup coordination status
     */
    checkStartupCoordination() {
        console.log('\n📋 Checking Startup Coordination...');

        if (window.startupCoordinationManager) {
            const status = window.startupCoordinationManager.getStatus();
            
            console.log(`  State: ${status.state}`);
            console.log(`  Current Phase: ${status.currentPhase || 'None'}`);
            console.log(`  Systems Ready: ${status.systemsReady ? 'Yes' : 'No'}`);
            console.log(`  Data Loading Complete: ${status.dataLoadingComplete ? 'Yes' : 'No'}`);
            console.log(`  Rendering Blocked: ${status.renderingBlocked ? 'Yes' : 'No'}`);
            console.log(`  Pending Operations:`, status.pendingOperations);
            console.log(`  Duration: ${Math.round(status.duration)}ms`);

            this.results.systemStatus.startupCoordination = status;

            // Check for issues
            if (status.state === 'IDLE' && status.duration === 0) {
                this.results.errors.push('Startup coordination never started');
            } else if (status.state === 'COORDINATING' && status.duration > 30000) {
                this.results.errors.push('Startup coordination stuck (> 30 seconds)');
            } else if (status.renderingBlocked) {
                this.results.warnings.push('Rendering is currently blocked');
            }

            // Display phases
            if (status.phases && status.phases.length > 0) {
                console.log('\n  Completed Phases:');
                status.phases.forEach(phase => {
                    const icon = phase.success ? '✅' : '❌';
                    console.log(`    ${icon} ${phase.name} (${Math.round(phase.duration)}ms)`);
                    if (!phase.success) {
                        this.results.errors.push(`Phase failed: ${phase.name} - ${phase.error}`);
                    }
                });
            }
        } else {
            console.log('  ❌ Startup Coordination Manager not available');
            this.results.errors.push('Startup Coordination Manager not available');
        }
    }

    /**
     * Generate recommendations based on findings
     */
    generateRecommendations() {
        // Check for critical system failures
        if (!window.stateManager || !window.componentManager || !window.renderer) {
            this.results.recommendations.push('CRITICAL: Core systems are not initialized. Try reloading the page.');
        }

        // Check for startup coordination issues
        if (this.results.errors.some(e => e.includes('SYSTEMS_READY'))) {
            this.results.recommendations.push('The SYSTEMS_READY phase is failing. This is now fixed - please reload the page.');
        }

        // Check for AJAX issues
        if (this.results.errors.some(e => e.includes('AJAX endpoint not found'))) {
            this.results.recommendations.push('MKCG refresh endpoints are not available. This is normal if not in WordPress admin.');
        }

        // Check for rendering issues
        if (window.renderer && !window.renderer.initialized) {
            this.results.recommendations.push('The renderer is not initialized. Components won\'t appear on screen.');
        }

        // Check for coordination timeout
        if (this.results.errors.some(e => e.includes('stuck'))) {
            this.results.recommendations.push('Startup is taking too long. Try the emergency recovery: window.startupCoordinationManager.executeEmergencyFallback()');
        }
    }

    /**
     * Display diagnostic results
     */
    displayResults() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 DIAGNOSTIC SUMMARY');
        console.log('='.repeat(60));

        // Errors
        if (this.results.errors.length > 0) {
            console.log('\n❌ ERRORS (' + this.results.errors.length + '):');
            this.results.errors.forEach(error => {
                console.log('  • ' + error);
            });
        } else {
            console.log('\n✅ No errors found!');
        }

        // Warnings
        if (this.results.warnings.length > 0) {
            console.log('\n⚠️ WARNINGS (' + this.results.warnings.length + '):');
            this.results.warnings.forEach(warning => {
                console.log('  • ' + warning);
            });
        }

        // Recommendations
        if (this.results.recommendations.length > 0) {
            console.log('\n💡 RECOMMENDATIONS:');
            this.results.recommendations.forEach(rec => {
                console.log('  → ' + rec);
            });
        }

        console.log('\n' + '='.repeat(60));
        console.log('Full diagnostic data available at: window.lastDiagnostic');
        console.log('='.repeat(60));

        // Store for inspection
        window.lastDiagnostic = this.results;
    }

    /**
     * Quick recovery attempt
     */
    async attemptRecovery() {
        console.log('\n🔧 Attempting automatic recovery...\n');

        try {
            // If startup coordinator exists and is stuck, try emergency fallback
            if (window.startupCoordinationManager && 
                window.startupCoordinationManager.getStatus().state !== 'COMPLETE') {
                console.log('  → Executing emergency fallback...');
                await window.startupCoordinationManager.executeEmergencyFallback();
            }

            // If renderer not initialized but exists, try manual init
            if (window.renderer && !window.renderer.initialized) {
                console.log('  → Manually initializing renderer...');
                if (typeof window.renderer.init === 'function') {
                    window.renderer.init();
                }
            }

            // If enhanced component manager not initialized, try manual init
            if (window.enhancedComponentManager && !window.enhancedComponentManager.isInitialized) {
                console.log('  → Manually initializing enhanced component manager...');
                if (typeof window.enhancedComponentManager.init === 'function') {
                    window.enhancedComponentManager.init();
                }
            }

            console.log('\n✅ Recovery attempt completed. Re-run diagnostic to check status.');
            
        } catch (error) {
            console.error('❌ Recovery failed:', error);
        }
    }
}

// Create and expose diagnostic tool
window.mkDiagnostic = new StartupDiagnostic();

// Add console commands
window.mkDiag = {
    run: () => window.mkDiagnostic.runDiagnostic(),
    recover: () => window.mkDiagnostic.attemptRecovery(),
    status: () => {
        if (window.startupCoordinationManager) {
            return window.startupCoordinationManager.getStatus();
        }
        return 'Startup coordinator not available';
    },
    systems: () => {
        return {
            stateManager: !!window.stateManager,
            componentManager: !!window.componentManager,
            enhancedComponentManager: !!window.enhancedComponentManager,
            renderer: !!window.renderer,
            eventBus: !!window.eventBus
        };
    },
    help: () => {
        console.log('🔍 Media Kit Builder Diagnostic Commands:');
        console.log('  mkDiag.run()     - Run full diagnostic');
        console.log('  mkDiag.recover() - Attempt automatic recovery');
        console.log('  mkDiag.status()  - Get startup coordinator status');
        console.log('  mkDiag.systems() - Quick system availability check');
        console.log('  mkDiag.help()    - Show this help');
    }
};

console.log('🔍 Startup Diagnostic loaded! Type mkDiag.help() for commands.');

// Auto-run diagnostic if there are console errors
if (window.location.hash === '#debug' || window.location.search.includes('debug=1')) {
    console.log('\n🔍 Debug mode detected - running diagnostic automatically...\n');
    setTimeout(() => window.mkDiagnostic.runDiagnostic(), 1000);
}
