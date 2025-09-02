/**
 * GMKB Data Diagnostic Tool
 * ROOT CAUSE ANALYSIS: Diagnose why saved components aren't loading on refresh
 */

(function() {
    'use strict';
    
    // Run diagnostic when data is available
    function runDataDiagnostic() {
        console.group('🔍 GMKB DATA PIPELINE DIAGNOSTIC');
        
        // Check if gmkbData exists
        if (!window.gmkbData) {
            console.error('❌ CRITICAL: gmkbData is not defined!');
            console.groupEnd();
            return;
        }
        
        // Analyze gmkbData structure
        console.log('✅ gmkbData exists');
        console.log('📊 gmkbData keys:', Object.keys(window.gmkbData));
        
        // Check for saved state
        console.log('\n📦 Saved State Analysis:');
        console.log('  - Has saved_state:', !!window.gmkbData.saved_state);
        console.log('  - Has saved_components:', !!window.gmkbData.saved_components);
        console.log('  - Has layout:', !!window.gmkbData.layout);
        console.log('  - Has components:', !!window.gmkbData.components);
        
        // Detailed saved_state inspection
        if (window.gmkbData.saved_state) {
            console.log('\n📋 saved_state structure:');
            console.log('  - Type:', typeof window.gmkbData.saved_state);
            console.log('  - Keys:', Object.keys(window.gmkbData.saved_state));
            
            if (window.gmkbData.saved_state.components) {
                const components = window.gmkbData.saved_state.components;
                console.log('  - Components type:', typeof components);
                console.log('  - Is array:', Array.isArray(components));
                console.log('  - Component count:', Array.isArray(components) ? components.length : Object.keys(components).length);
                
                // Show first component if exists
                if (Array.isArray(components) && components.length > 0) {
                    console.log('  - First component:', components[0]);
                } else if (typeof components === 'object' && Object.keys(components).length > 0) {
                    const firstKey = Object.keys(components)[0];
                    console.log('  - First component key:', firstKey);
                    console.log('  - First component data:', components[firstKey]);
                }
            }
            
            if (window.gmkbData.saved_state.saved_components) {
                console.log('\n  - saved_components in saved_state:');
                console.log('    Count:', window.gmkbData.saved_state.saved_components.length);
                if (window.gmkbData.saved_state.saved_components.length > 0) {
                    console.log('    First item:', window.gmkbData.saved_state.saved_components[0]);
                }
            }
        }
        
        // Check saved_components at root level
        if (window.gmkbData.saved_components) {
            console.log('\n📋 Root level saved_components:');
            console.log('  - Type:', typeof window.gmkbData.saved_components);
            console.log('  - Is array:', Array.isArray(window.gmkbData.saved_components));
            console.log('  - Count:', window.gmkbData.saved_components.length);
            if (window.gmkbData.saved_components.length > 0) {
                console.log('  - First component:', window.gmkbData.saved_components[0]);
            }
        }
        
        // Check post ID
        console.log('\n🆔 Post ID Analysis:');
        console.log('  - postId:', window.gmkbData.postId);
        console.log('  - post_id:', window.gmkbData.post_id);
        
        // Check if state manager will load this
        console.log('\n🔮 State Manager Load Prediction:');
        const willLoad = !!(
            window.gmkbData.saved_state && 
            typeof window.gmkbData.saved_state === 'object'
        );
        console.log('  - Will state manager load saved state?', willLoad ? '✅ YES' : '❌ NO');
        
        if (!willLoad) {
            console.log('  - Reason: saved_state is', window.gmkbData.saved_state ? 'invalid format' : 'missing');
        }
        
        console.groupEnd();
    }
    
    // ROOT CAUSE FIX: Event-driven initialization without polling
    // Wait for DOM and gmkbData to be available
    function initDiagnostic() {
        if (typeof window.gmkbData !== 'undefined') {
            // Data is available, run diagnostic
            runDataDiagnostic();
        } else {
            // Data not yet available, wait for WordPress to localize it
            // Listen for gmkb:ready which indicates WordPress data is loaded
            document.addEventListener('gmkb:ready', runDataDiagnostic, { once: true });
            
            // Also listen for DOMContentLoaded as fallback
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    // Check again after DOM is ready
                    if (typeof window.gmkbData !== 'undefined') {
                        runDataDiagnostic();
                    }
                }, { once: true });
            }
        }
    }
    
    // Start initialization
    initDiagnostic();
    
    // Expose globally for manual testing
    window.runGmkbDataDiagnostic = runDataDiagnostic;
    
})();
