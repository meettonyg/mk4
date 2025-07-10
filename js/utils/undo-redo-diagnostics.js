/**
 * @file undo-redo-diagnostics.js
 * @description Diagnostic tools for debugging undo/redo functionality issues
 * 
 * ROOT FIX: Comprehensive undo/redo system debugging
 */

import { structuredLogger } from '../utils/structured-logger.js';

class UndoRedoDiagnostics {
    constructor() {
        this.logger = structuredLogger;
    }
    
    /**
     * Run comprehensive undo/redo system diagnostics
     */
    async runDiagnostics() {
        console.group('↩️ Undo/Redo System Diagnostics');
        
        try {
            // Step 1: Check basic requirements
            const basicChecks = this.checkBasicRequirements();
            console.log('📋 Basic Requirements:', basicChecks);
            
            // Step 2: Check state history
            const historyChecks = this.checkStateHistory();
            console.log('📜 State History:', historyChecks);
            
            // Step 3: Check button states
            const buttonChecks = this.checkButtonStates();
            console.log('🔘 Button States:', buttonChecks);
            
            // Step 4: Check state manager integration
            const integrationChecks = this.checkStateManagerIntegration();
            console.log('🔗 State Manager Integration:', integrationChecks);
            
            // Step 5: Test undo/redo operations
            await this.testUndoRedoOperations();
            
            // Step 6: Provide recommendations
            this.provideRecommendations(basicChecks, historyChecks, buttonChecks, integrationChecks);
            
        } catch (error) {
            console.error('❌ Undo/redo diagnostics failed:', error);
        } finally {
            console.groupEnd();
        }
    }
    
    /**
     * Check basic requirements
     */
    checkBasicRequirements() {
        return {
            stateHistory: {
                exists: !!window.stateHistory,
                type: window.stateHistory?.constructor?.name || 'unknown',
                enabled: window.stateHistory?.isEnabled || false
            },
            toolbarInteractions: {
                exists: !!window.toolbarInteractions,
                initialized: window.toolbarInteractions?.isInitialized || false
            },
            buttons: {
                undoButton: {
                    exists: !!document.getElementById('undo-btn'),
                    disabled: document.getElementById('undo-btn')?.disabled || false
                },
                redoButton: {
                    exists: !!document.getElementById('redo-btn'),
                    disabled: document.getElementById('redo-btn')?.disabled || false
                }
            }
        };
    }
    
    /**
     * Check state history
     */
    checkStateHistory() {
        const stateHistory = window.stateHistory;
        
        if (!stateHistory) {
            return {
                exists: false,
                error: 'State history not found on window object'
            };
        }
        
        try {
            const stats = stateHistory.getStats();
            const timeline = stateHistory.getTimeline();
            
            return {
                exists: true,
                enabled: stateHistory.isEnabled,
                isNavigating: stateHistory.isNavigating,
                stats: {
                    totalSnapshots: stats.totalSnapshots,
                    currentIndex: stats.currentIndex,
                    canUndo: stats.canUndo,
                    canRedo: stats.canRedo,
                    totalSize: stats.totalSize,
                    averageSize: stats.averageSize
                },
                timeline: {
                    length: timeline.length,
                    current: timeline.find(item => item.current),
                    recent: timeline.slice(-3)
                },
                methods: {
                    hasUndo: typeof stateHistory.undo === 'function',
                    hasRedo: typeof stateHistory.redo === 'function',
                    hasCanUndo: typeof stateHistory.canUndo === 'function',
                    hasCanRedo: typeof stateHistory.canRedo === 'function',
                    hasGetStats: typeof stateHistory.getStats === 'function'
                }
            };
        } catch (error) {
            return {
                exists: true,
                error: `Error checking state history: ${error.message}`
            };
        }
    }
    
    /**
     * Check button states
     */
    checkButtonStates() {
        const undoBtn = document.getElementById('undo-btn');
        const redoBtn = document.getElementById('redo-btn');
        const stateHistory = window.stateHistory;
        
        const results = {
            undoButton: {
                element: !!undoBtn,
                disabled: undoBtn?.disabled || false,
                hasEventListeners: this.checkButtonEventListeners(undoBtn),
                expectedDisabled: null,
                stateMatches: null
            },
            redoButton: {
                element: !!redoBtn,
                disabled: redoBtn?.disabled || false,
                hasEventListeners: this.checkButtonEventListeners(redoBtn),
                expectedDisabled: null,
                stateMatches: null
            }
        };
        
        if (stateHistory) {
            const canUndo = stateHistory.canUndo();
            const canRedo = stateHistory.canRedo();
            
            results.undoButton.expectedDisabled = !canUndo;
            results.undoButton.stateMatches = (undoBtn?.disabled || false) === !canUndo;
            
            results.redoButton.expectedDisabled = !canRedo;
            results.redoButton.stateMatches = (redoBtn?.disabled || false) === !canRedo;
        }
        
        return results;
    }
    
    /**
     * Check if button has event listeners (basic check)
     */
    checkButtonEventListeners(button) {
        if (!button) return false;
        
        // Check for onclick handler
        if (button.onclick) return true;
        
        // Check for addEventListener (harder to detect reliably)
        // This is a basic check - modern browsers don't expose listener details
        return button.getAttribute('data-has-listeners') === 'true' || 
               button.dataset.hasListeners === 'true';
    }
    
    /**
     * Check state manager integration
     */
    checkStateManagerIntegration() {
        const stateManager = window.enhancedStateManager;
        const stateHistory = window.stateHistory;
        
        if (!stateManager) {
            return {
                stateManagerExists: false,
                error: 'Enhanced state manager not available'
            };
        }
        
        if (!stateHistory) {
            return {
                stateManagerExists: true,
                stateHistoryExists: false,
                error: 'State history not available'
            };
        }
        
        try {
            return {
                stateManagerExists: true,
                stateHistoryExists: true,
                stateManagerMethods: {
                    hasSubscribeGlobal: typeof stateManager.subscribeGlobal === 'function',
                    hasApplyTransaction: typeof stateManager.applyTransaction === 'function',
                    hasGetState: typeof stateManager.getState === 'function'
                },
                integration: {
                    historyEnabled: stateHistory.isEnabled,
                    historyNavigating: stateHistory.isNavigating,
                    stateManagerBusy: stateManager.isBusy?.() || false
                },
                currentState: {
                    hasComponents: !!(stateManager.getState()?.components),
                    componentCount: Object.keys(stateManager.getState()?.components || {}).length,
                    hasLayout: !!(stateManager.getState()?.layout),
                    layoutLength: (stateManager.getState()?.layout || []).length
                }
            };
        } catch (error) {
            return {
                stateManagerExists: true,
                stateHistoryExists: true,
                error: `Error checking integration: ${error.message}`
            };
        }
    }
    
    /**
     * Test undo/redo operations
     */
    async testUndoRedoOperations() {
        console.group('🧪 Testing Undo/Redo Operations');
        
        const stateHistory = window.stateHistory;
        const stateManager = window.enhancedStateManager;
        
        if (!stateHistory || !stateManager) {
            console.log('❌ Cannot test operations - missing dependencies');
            console.groupEnd();
            return;
        }
        
        try {
            // Get initial state
            const initialState = stateManager.getState();
            const initialCanUndo = stateHistory.canUndo();
            const initialCanRedo = stateHistory.canRedo();
            
            console.log('📊 Initial state:', {
                components: Object.keys(initialState.components || {}).length,
                canUndo: initialCanUndo,
                canRedo: initialCanRedo,
                historyIndex: stateHistory.currentIndex,
                historyLength: stateHistory.history.length
            });
            
            // Test undo if possible
            if (initialCanUndo) {
                console.log('🔄 Testing undo operation...');
                const undoResult = stateHistory.undo();
                
                if (undoResult) {
                    const afterUndoState = stateManager.getState();
                    console.log('✅ Undo successful:', {
                        components: Object.keys(afterUndoState.components || {}).length,
                        canUndo: stateHistory.canUndo(),
                        canRedo: stateHistory.canRedo(),
                        historyIndex: stateHistory.currentIndex
                    });
                    
                    // Test redo
                    console.log('🔄 Testing redo operation...');
                    const redoResult = stateHistory.redo();
                    
                    if (redoResult) {
                        const afterRedoState = stateManager.getState();
                        console.log('✅ Redo successful:', {
                            components: Object.keys(afterRedoState.components || {}).length,
                            canUndo: stateHistory.canUndo(),
                            canRedo: stateHistory.canRedo(),
                            historyIndex: stateHistory.currentIndex
                        });
                    } else {
                        console.log('❌ Redo failed');
                    }
                } else {
                    console.log('❌ Undo failed');
                }
            } else {
                console.log('⚠️ No undo history available for testing');
            }
            
        } catch (error) {
            console.error('❌ Error during operation testing:', error);
        } finally {
            console.groupEnd();
        }
    }
    
    /**
     * Provide recommendations
     */
    provideRecommendations(basicChecks, historyChecks, buttonChecks, integrationChecks) {
        console.group('💡 Recommendations');
        
        const issues = [];
        
        // Check for critical issues
        if (!basicChecks.stateHistory.exists) {
            issues.push('State history not loaded - check state-history.js imports');
        }
        
        if (!basicChecks.toolbarInteractions.exists) {
            issues.push('Toolbar interactions not loaded - check toolbar-interactions.js imports');
        }
        
        if (!basicChecks.toolbarInteractions.initialized) {
            issues.push('Toolbar interactions not initialized - check for initialization errors');
        }
        
        if (!basicChecks.buttons.undoButton.exists) {
            issues.push('Undo button element not found - check template HTML');
        }
        
        if (!basicChecks.buttons.redoButton.exists) {
            issues.push('Redo button element not found - check template HTML');
        }
        
        if (historyChecks.exists && !historyChecks.enabled) {
            issues.push('State history disabled - check isEnabled property');
        }
        
        if (buttonChecks.undoButton.element && !buttonChecks.undoButton.stateMatches) {
            issues.push('Undo button state does not match history state');
        }
        
        if (buttonChecks.redoButton.element && !buttonChecks.redoButton.stateMatches) {
            issues.push('Redo button state does not match history state');
        }
        
        if (!integrationChecks.stateManagerExists) {
            issues.push('Enhanced state manager missing - check enhanced-state-manager.js');
        }
        
        if (integrationChecks.error) {
            issues.push(`Integration error: ${integrationChecks.error}`);
        }
        
        if (issues.length === 0) {
            console.log('✅ No critical issues detected');
            console.log('The undo/redo system appears to be properly configured.');
            console.log('Try adding/removing components to build up history.');
        } else {
            console.log('❌ Issues detected:');
            issues.forEach(issue => console.log(`   - ${issue}`));
        }
        
        console.log('\\n🔧 Quick fixes to try:');
        console.log('1. Refresh the page and try again');
        console.log('2. Add a component to build up undo history');
        console.log('3. Check browser console for initialization errors');
        console.log('4. Try manual undo/redo: triggerUndo(), triggerRedo()');
        console.log('5. Check state history: stateHistory.debug()');
        
        console.groupEnd();
    }
    
    /**
     * Quick fix attempts for undo/redo
     */
    async attemptQuickFixes() {
        console.group('🔧 Undo/Redo Quick Fix Attempts');
        
        // Fix 1: Force button state update
        try {
            if (window.toolbarInteractions && typeof window.toolbarInteractions.updateButtonStates === 'function') {
                console.log('🔄 Attempting to update button states...');
                window.toolbarInteractions.updateButtonStates();
                console.log('✅ Button states updated');
            }
        } catch (error) {
            console.log('❌ Failed to update button states:', error.message);
        }
        
        // Fix 2: Re-enable state history if disabled
        try {
            if (window.stateHistory && !window.stateHistory.isEnabled) {
                console.log('🔄 Attempting to enable state history...');
                window.stateHistory.setEnabled(true);
                console.log('✅ State history enabled');
            }
        } catch (error) {
            console.log('❌ Failed to enable state history:', error.message);
        }
        
        // Fix 3: Check and refresh state history subscription
        try {
            if (window.stateHistory && window.enhancedStateManager) {
                console.log('🔄 Checking state history subscription...');
                const stats = window.stateHistory.getStats();
                console.log('📊 Current state history stats:', stats);
            }
        } catch (error) {
            console.log('❌ Error checking state history subscription:', error.message);
        }
        
        console.groupEnd();
    }
}

// Create and export singleton
export const undoRedoDiagnostics = new UndoRedoDiagnostics();

// Expose globally for easy access
window.undoRedoDiagnostics = undoRedoDiagnostics;

// Convenience functions
export const runUndoRedoDiagnostics = () => undoRedoDiagnostics.runDiagnostics();
export const attemptUndoRedoFixes = () => undoRedoDiagnostics.attemptQuickFixes();
