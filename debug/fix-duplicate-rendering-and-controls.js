/**
 * Root Fix: Duplicate Rendering and Missing Controls
 * This script diagnoses and fixes issues with:
 * 1. Duplicate component rendering
 * 2. Missing component controls
 * 3. Multiple renderer conflicts
 */

(function() {
    'use strict';
    
    console.log('🔧 ROOT FIX: Duplicate Rendering and Controls Fix Loading...');
    
    // Diagnostic function
    window.diagnoseDuplicateRendering = function() {
        console.log('🔍 DIAGNOSING DUPLICATE RENDERING ISSUES');
        console.log('='.repeat(60));
        
        // Check for duplicate components
        const allComponents = document.querySelectorAll('[data-component-id]');
        const componentMap = new Map();
        
        allComponents.forEach(el => {
            const id = el.getAttribute('data-component-id');
            if (!componentMap.has(id)) {
                componentMap.set(id, []);
            }
            componentMap.get(id).push(el);
        });
        
        let duplicatesFound = 0;
        componentMap.forEach((elements, id) => {
            if (elements.length > 1) {
                console.log(`❌ DUPLICATE: ${id} has ${elements.length} instances`);
                elements.forEach((el, index) => {
                    console.log(`  Instance ${index + 1}:`, {
                        parent: el.parentElement?.className,
                        hasControls: !!el.querySelector('.component-controls--dynamic'),
                        innerHTML: el.innerHTML.substring(0, 100) + '...'
                    });
                });
                duplicatesFound++;
            }
        });
        
        // Check for components without controls
        let missingControls = 0;
        allComponents.forEach(el => {
            if (!el.querySelector('.component-controls--dynamic')) {
                const id = el.getAttribute('data-component-id');
                console.log(`⚠️ NO CONTROLS: ${id}`);
                missingControls++;
            }
        });
        
        // Check active renderers
        console.log('\n📊 ACTIVE RENDERERS:');
        console.log('  enhancedComponentRenderer:', !!window.enhancedComponentRenderer);
        console.log('  clientOnlyRenderer:', !!window.clientOnlyRenderer);
        console.log('  SimplifiedComponentRenderer:', !!window.SimplifiedComponentRenderer);
        
        // Check state vs DOM
        const state = window.enhancedStateManager?.getState();
        if (state) {
            const stateComponentCount = Object.keys(state.components || {}).length;
            const domComponentCount = allComponents.length;
            console.log('\n📊 STATE VS DOM:');
            console.log('  Components in state:', stateComponentCount);
            console.log('  Components in DOM:', domComponentCount);
            if (domComponentCount > stateComponentCount) {
                console.log('  ⚠️ MORE components in DOM than state (duplicates likely)');
            }
        }
        
        console.log('\n📊 SUMMARY:');
        console.log('  Total components:', allComponents.length);
        console.log('  Duplicates found:', duplicatesFound);
        console.log('  Missing controls:', missingControls);
        console.log('='.repeat(60));
        
        return {
            totalComponents: allComponents.length,
            duplicates: duplicatesFound,
            missingControls: missingControls
        };
    };
    
    // Fix function
    window.fixDuplicatesAndControls = function() {
        console.log('🔧 FIXING DUPLICATE COMPONENTS AND MISSING CONTROLS...');
        
        let fixedDuplicates = 0;
        let fixedControls = 0;
        
        // Step 1: Remove duplicate components
        const allComponents = document.querySelectorAll('[data-component-id]');
        const componentMap = new Map();
        
        allComponents.forEach(el => {
            const id = el.getAttribute('data-component-id');
            if (!componentMap.has(id)) {
                componentMap.set(id, []);
            }
            componentMap.get(id).push(el);
        });
        
        componentMap.forEach((elements, id) => {
            if (elements.length > 1) {
                console.log(`🔧 Removing ${elements.length - 1} duplicate(s) of ${id}`);
                // Keep the first one, remove the rest
                for (let i = 1; i < elements.length; i++) {
                    elements[i].remove();
                    fixedDuplicates++;
                }
            }
        });
        
        // Step 2: Attach missing controls
        const remainingComponents = document.querySelectorAll('[data-component-id]');
        remainingComponents.forEach(el => {
            const id = el.getAttribute('data-component-id');
            if (!el.querySelector('.component-controls--dynamic')) {
                if (window.componentControlsManager && window.componentControlsManager.attachControls) {
                    const success = window.componentControlsManager.attachControls(el, id);
                    if (success) {
                        console.log(`✅ Attached controls to ${id}`);
                        fixedControls++;
                    } else {
                        console.error(`❌ Failed to attach controls to ${id}`);
                    }
                }
            }
        });
        
        console.log('\n✅ FIX COMPLETE:');
        console.log(`  Duplicates removed: ${fixedDuplicates}`);
        console.log(`  Controls attached: ${fixedControls}`);
        
        // Re-run diagnosis to verify
        console.log('\n📊 POST-FIX DIAGNOSIS:');
        return window.diagnoseDuplicateRendering();
    };
    
    // Disable conflicting renderers
    window.disableConflictingRenderers = function() {
        console.log('🔧 DISABLING CONFLICTING RENDERERS...');
        
        // Keep only the enhanced renderer
        if (window.clientOnlyRenderer && window.enhancedComponentRenderer) {
            console.log('  Disabling clientOnlyRenderer (keeping enhancedComponentRenderer)');
            window.clientOnlyRenderer = null;
        }
        
        console.log('✅ Conflicting renderers disabled');
    };
    
    // Monitor for new duplicates
    window.startDuplicateMonitoring = function() {
        console.log('👁️ STARTING DUPLICATE MONITORING...');
        
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE && node.hasAttribute('data-component-id')) {
                        const id = node.getAttribute('data-component-id');
                        const existing = document.querySelectorAll(`[data-component-id="${id}"]`);
                        if (existing.length > 1) {
                            console.warn(`⚠️ DUPLICATE DETECTED: ${id} now has ${existing.length} instances`);
                            // Auto-fix
                            for (let i = 1; i < existing.length; i++) {
                                existing[i].remove();
                                console.log(`  Auto-removed duplicate ${i} of ${id}`);
                            }
                        }
                        
                        // Check for controls
                        if (!node.querySelector('.component-controls--dynamic')) {
                            setTimeout(() => {
                                if (!node.querySelector('.component-controls--dynamic')) {
                                    console.warn(`⚠️ NO CONTROLS: ${id} - attempting to attach`);
                                    if (window.componentControlsManager && window.componentControlsManager.attachControls) {
                                        window.componentControlsManager.attachControls(node, id);
                                    }
                                }
                            }, 100);
                        }
                    }
                });
            });
        });
        
        const containers = [
            document.getElementById('saved-components-container'),
            document.getElementById('media-kit-preview')
        ].filter(el => el);
        
        containers.forEach(container => {
            observer.observe(container, {
                childList: true,
                subtree: true
            });
        });
        
        window.duplicateMonitor = observer;
        console.log('✅ Duplicate monitoring active');
        
        return observer;
    };
    
    // Auto-fix on load
    function autoFix() {
        console.log('🚀 AUTO-FIX: Running automatic fixes...');
        
        // Wait for systems to be ready
        if (!window.componentControlsManager || !window.enhancedStateManager) {
            console.log('  Waiting for systems to be ready...');
            setTimeout(autoFix, 500);
            return;
        }
        
        // Disable conflicting renderers
        window.disableConflictingRenderers();
        
        // Fix duplicates and controls
        window.fixDuplicatesAndControls();
        
        // Start monitoring
        window.startDuplicateMonitoring();
        
        console.log('✅ AUTO-FIX COMPLETE');
    }
    
    // Run auto-fix when ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(autoFix, 1000);
        });
    } else {
        setTimeout(autoFix, 1000);
    }
    
    // Expose main fix function
    window.runDuplicateFix = function() {
        console.log('='.repeat(60));
        console.log('🔧 RUNNING COMPLETE DUPLICATE FIX');
        console.log('='.repeat(60));
        
        // Step 1: Diagnose
        console.log('STEP 1: DIAGNOSIS');
        const before = window.diagnoseDuplicateRendering();
        
        if (before.duplicates === 0 && before.missingControls === 0) {
            console.log('✅ No issues found!');
            return;
        }
        
        // Step 2: Fix
        console.log('\nSTEP 2: APPLYING FIXES');
        window.disableConflictingRenderers();
        const after = window.fixDuplicatesAndControls();
        
        // Step 3: Monitor
        console.log('\nSTEP 3: ENABLING MONITORING');
        window.startDuplicateMonitoring();
        
        console.log('='.repeat(60));
        console.log('✅ COMPLETE FIX APPLIED');
        console.log('='.repeat(60));
        
        return {
            before,
            after
        };
    };
    
    console.log('✅ ROOT FIX: Duplicate Rendering and Controls Fix Ready');
    console.log('  Commands available:');
    console.log('  - diagnoseDuplicateRendering() - Check for issues');
    console.log('  - fixDuplicatesAndControls() - Fix issues');
    console.log('  - runDuplicateFix() - Complete diagnosis and fix');
    console.log('  - startDuplicateMonitoring() - Monitor for new issues');
    
})();