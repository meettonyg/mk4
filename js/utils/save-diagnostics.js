/**
 * @file save-diagnostics.js
 * @description Diagnostic tools for debugging save functionality issues
 * 
 * ROOT FIX: Comprehensive save system debugging
 */

import { structuredLogger } from '../utils/structured-logger.js';

class SaveDiagnostics {
    constructor() {
        this.logger = structuredLogger;
    }
    
    /**
     * Run comprehensive save system diagnostics
     */
    async runDiagnostics() {
        console.group('🔍 Save System Diagnostics');
        
        try {
            // Step 1: Check basic requirements
            const basicChecks = this.checkBasicRequirements();
            console.log('📋 Basic Requirements:', basicChecks);
            
            // Step 2: Check state manager
            const stateChecks = this.checkStateManager();
            console.log('🗂️ State Manager:', stateChecks);
            
            // Step 3: Check save service
            const saveServiceChecks = this.checkSaveService();
            console.log('💾 Save Service:', saveServiceChecks);
            
            // Step 4: Check AJAX configuration
            const ajaxChecks = this.checkAjaxConfiguration();
            console.log('🌐 AJAX Configuration:', ajaxChecks);
            
            // Step 5: Test save process step by step
            await this.testSaveProcess();
            
            // Step 6: Provide recommendations
            this.provideRecommendations(basicChecks, stateChecks, saveServiceChecks, ajaxChecks);
            
        } catch (error) {
            console.error('❌ Diagnostics failed:', error);
        } finally {
            console.groupEnd();
        }
    }
    
    /**
     * Check basic requirements
     */
    checkBasicRequirements() {
        return {
            toolbarInteractions: {
                exists: !!window.toolbarInteractions,
                initialized: window.toolbarInteractions?.isInitialized || false,
                saveInProgress: window.toolbarInteractions?.saveInProgress || false
            },
            saveButton: {
                exists: !!document.getElementById('save-btn'),
                disabled: document.getElementById('save-btn')?.disabled || false
            },
            guestifyData: {
                exists: !!window.guestifyData,
                hasAjaxUrl: !!(window.guestifyData?.ajaxUrl || window.guestifyData?.ajax_url),
                hasNonce: !!(window.guestifyData?.nonce),
                pluginUrl: window.guestifyData?.pluginUrl || 'missing'
            }
        };
    }
    
    /**
     * Check state manager
     */
    checkStateManager() {
        const stateManager = window.enhancedStateManager;
        
        if (!stateManager) {
            return {
                exists: false,
                error: 'Enhanced state manager not found on window object'
            };
        }
        
        try {
            const state = stateManager.getState();
            
            return {
                exists: true,
                hasGetState: typeof stateManager.getState === 'function',
                state: {
                    exists: !!state,
                    hasComponents: !!(state?.components),
                    componentCount: state?.components ? Object.keys(state.components).length : 0,
                    hasLayout: !!(state?.layout),
                    layoutLength: state?.layout ? state.layout.length : 0,
                    hasGlobalSettings: !!(state?.globalSettings)
                }
            };
        } catch (error) {
            return {
                exists: true,
                error: `Error getting state: ${error.message}`
            };
        }
    }
    
    /**
     * Check save service
     */
    checkSaveService() {
        const saveService = window.saveService;
        
        if (!saveService) {
            return {
                exists: false,
                error: 'Save service not found on window object'
            };
        }
        
        return {
            exists: true,
            hasSaveState: typeof saveService.saveState === 'function',
            hasLoadState: typeof saveService.loadState === 'function',
            hasGetStats: typeof saveService.getStats === 'function',
            stats: this.getSaveServiceStats(saveService)
        };
    }
    
    /**
     * Get save service statistics safely
     */
    getSaveServiceStats(saveService) {
        try {
            if (typeof saveService.getStats === 'function') {
                return saveService.getStats();
            }
            return 'getStats method not available';
        } catch (error) {
            return `Error getting stats: ${error.message}`;
        }
    }
    
    /**
     * Check AJAX configuration
     */
    checkAjaxConfiguration() {
        const guestifyData = window.guestifyData;
        
        if (!guestifyData) {
            return {
                configured: false,
                error: 'guestifyData not available'
            };
        }
        
        const ajaxUrl = guestifyData.ajaxUrl || guestifyData.ajax_url || window.ajaxurl;
        
        return {
            configured: !!ajaxUrl,
            ajaxUrl: ajaxUrl || 'missing',
            nonce: guestifyData.nonce || 'missing',
            hasWordPressAjax: !!window.ajaxurl,
            wpAjaxUrl: window.ajaxurl || 'missing'
        };
    }
    
    /**
     * Test save process step by step
     */
    async testSaveProcess() {
        console.group('🧪 Step-by-Step Save Process Test');
        
        try {
            // Step 1: Get state manager
            console.log('Step 1: Getting enhanced state manager...');
            const stateManager = window.enhancedStateManager;
            if (!stateManager) {
                throw new Error('Enhanced state manager not available');
            }
            console.log('✅ State manager found');
            
            // Step 2: Get current state
            console.log('Step 2: Getting current state...');
            const currentState = stateManager.getState();
            if (!currentState) {
                throw new Error('No state available from state manager');
            }
            console.log('✅ State retrieved:', {
                components: Object.keys(currentState.components || {}).length,
                layout: (currentState.layout || []).length
            });
            
            // Step 3: Get save service
            console.log('Step 3: Getting save service...');
            const saveService = window.saveService;
            if (!saveService) {
                throw new Error('Save service not available');
            }
            console.log('✅ Save service found');
            
            // Step 4: Test save service method
            console.log('Step 4: Testing save service method...');
            if (typeof saveService.saveState !== 'function') {
                throw new Error('saveState method not available on save service');
            }
            console.log('✅ saveState method available');
            
            // Step 5: Test actual save (with error catching)
            console.log('Step 5: Testing actual save operation...');
            try {
                const result = await this.testSaveOperation(currentState, saveService);
                console.log('✅ Save test completed:', result);
            } catch (saveError) {
                console.error('❌ Save operation failed:', saveError);
                this.analyzeSaveError(saveError);
            }
            
        } catch (error) {
            console.error('❌ Step-by-step test failed:', error);
        } finally {
            console.groupEnd();
        }
    }
    
    /**
     * Test save operation safely
     */
    async testSaveOperation(state, saveService) {
        return new Promise((resolve) => {
            try {
                console.log('🔄 Calling saveService.saveState()...');
                const result = saveService.saveState(state);
                
                if (result && typeof result.then === 'function') {
                    // Async result
                    result.then((asyncResult) => {
                        resolve({ 
                            type: 'async', 
                            result: asyncResult,
                            success: !!asyncResult 
                        });
                    }).catch((asyncError) => {
                        resolve({ 
                            type: 'async', 
                            error: asyncError.message,
                            success: false 
                        });
                    });
                } else {
                    // Sync result
                    resolve({ 
                        type: 'sync', 
                        result: result,
                        success: !!result 
                    });
                }
            } catch (error) {
                resolve({ 
                    type: 'error', 
                    error: error.message,
                    success: false 
                });
            }
        });
    }
    
    /**
     * Analyze save error
     */
    analyzeSaveError(error) {
        console.group('🔍 Save Error Analysis');
        
        console.log('Error Details:', {
            message: error.message,
            name: error.name,
            stack: error.stack?.split('\n').slice(0, 5)
        });
        
        // Common error patterns
        if (error.message.includes('localStorage')) {
            console.log('💡 Analysis: localStorage issue detected');
            console.log('Possible causes:');
            console.log('- Storage quota exceeded');
            console.log('- Private browsing mode');
            console.log('- Storage disabled by browser');
        }
        
        if (error.message.includes('nonce')) {
            console.log('💡 Analysis: WordPress nonce issue detected');
            console.log('Possible causes:');
            console.log('- Invalid or expired nonce');
            console.log('- User not logged in');
            console.log('- Insufficient permissions');
        }
        
        if (error.message.includes('AJAX')) {
            console.log('💡 Analysis: AJAX/Network issue detected');
            console.log('Possible causes:');
            console.log('- Server endpoint not available');
            console.log('- Network connectivity issue');
            console.log('- CORS policy blocking request');
        }
        
        console.groupEnd();
    }
    
    /**
     * Provide recommendations
     */
    provideRecommendations(basicChecks, stateChecks, saveServiceChecks, ajaxChecks) {
        console.group('💡 Recommendations');
        
        const issues = [];
        
        // Check for critical issues
        if (!basicChecks.toolbarInteractions.exists) {
            issues.push('Toolbar interactions not loaded - check main.js imports');
        }
        
        if (!basicChecks.toolbarInteractions.initialized) {
            issues.push('Toolbar interactions not initialized - check for initialization errors');
        }
        
        if (!stateChecks.exists) {
            issues.push('Enhanced state manager missing - check enhanced-state-manager.js');
        }
        
        if (stateChecks.error) {
            issues.push(`State manager error: ${stateChecks.error}`);
        }
        
        if (!saveServiceChecks.exists) {
            issues.push('Save service missing - check save-service.js');
        }
        
        if (!ajaxChecks.configured) {
            issues.push('AJAX not configured - check guestifyData setup');
        }
        
        if (issues.length === 0) {
            console.log('✅ No critical issues detected');
            console.log('The save system appears to be properly configured.');
            console.log('If saves are still failing, the issue may be on the server side.');
        } else {
            console.log('❌ Issues detected:');
            issues.forEach(issue => console.log(`   - ${issue}`));
        }
        
        console.log('\n🔧 Quick fixes to try:');
        console.log('1. Refresh the page and try again');
        console.log('2. Check browser console for additional errors');
        console.log('3. Verify you are logged into WordPress');
        console.log('4. Check if localStorage is available');
        console.log('5. Try in incognito/private browsing mode');
        
        console.groupEnd();
    }
    
    /**
     * Test localStorage functionality
     */
    testLocalStorage() {
        try {
            const testKey = 'gmkb_test_' + Date.now();
            const testValue = 'test_value';
            
            localStorage.setItem(testKey, testValue);
            const retrieved = localStorage.getItem(testKey);
            localStorage.removeItem(testKey);
            
            return {
                available: true,
                working: retrieved === testValue
            };
        } catch (error) {
            return {
                available: false,
                error: error.message
            };
        }
    }
    
    /**
     * Quick fix attempts
     */
    async attemptQuickFixes() {
        console.group('🔧 Quick Fix Attempts');
        
        // Fix 1: Reinitialize toolbar interactions
        try {
            if (window.toolbarInteractions && typeof window.toolbarInteractions.init === 'function') {
                console.log('🔄 Attempting to reinitialize toolbar interactions...');
                window.toolbarInteractions.init();
                console.log('✅ Toolbar interactions reinitialized');
            }
        } catch (error) {
            console.log('❌ Failed to reinitialize toolbar interactions:', error.message);
        }
        
        // Fix 2: Test localStorage
        console.log('🔄 Testing localStorage...');
        const storageTest = this.testLocalStorage();
        console.log('📦 localStorage test:', storageTest);
        
        // Fix 3: Refresh guestifyData
        try {
            if (window.guestifyData) {
                console.log('🔄 Current guestifyData:', {
                    hasAjaxUrl: !!(window.guestifyData.ajaxUrl || window.guestifyData.ajax_url),
                    hasNonce: !!window.guestifyData.nonce,
                    pluginUrl: window.guestifyData.pluginUrl || 'missing'
                });
            }
        } catch (error) {
            console.log('❌ Error checking guestifyData:', error.message);
        }
        
        console.groupEnd();
    }
}

// Create and export singleton
export const saveDiagnostics = new SaveDiagnostics();

// Expose globally for easy access
window.saveDiagnostics = saveDiagnostics;

// Convenience functions
export const runSaveDiagnostics = () => saveDiagnostics.runDiagnostics();
export const attemptSaveFixes = () => saveDiagnostics.attemptQuickFixes();
