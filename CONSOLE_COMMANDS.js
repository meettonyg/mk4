// Media Kit Builder Console Test Commands
// Copy any of these to your browser console

// 1. QUICK TEST (One-liner - tests if enhanced features are working)
fetch('data:text/javascript,'+encodeURIComponent(`console.clear();console.log('%c🚀 Media Kit Quick Test','color:#0ea5e9;font-size:20px;font-weight:bold');const test=async()=>{const log=(m,c='#3b82f6')=>console.log(\`%c\${m}\`,\`color:\${c}\`);const ok=(m)=>log('✅ '+m,'#10b981');const err=(m)=>log('❌ '+m,'#ef4444');const features=window.mediaKitFeatures?.FEATURES;if(!features){err('Feature system not found');return}let score=0,total=5;if(window.enhancedStateManager){ok('Enhanced State Manager loaded');score++}else err('Enhanced State Manager missing');if(window.enhancedComponentManager){ok('Enhanced Component Manager loaded');score++}else err('Enhanced Component Manager missing');if(window.enhancedComponentRenderer){ok('Enhanced Component Renderer loaded');score++}else err('Enhanced Component Renderer missing');const sm=window.enhancedStateManager||window.stateManager;if(sm?.batchUpdate){ok('Batch updates available');score++}else err('Batch updates not available');if(sm?.setPendingAction){ok('Pending actions available');score++}else err('Pending actions not available');log(\`\\nScore: \${score}/\${total}\`,'#8b5cf6');if(score===total){log('\\n🎉 All enhanced features working!','#10b981');log('Run mkTest.help() for interactive testing','#3b82f6')}else{log('\\n⚠️ Some features missing','#f59e0b');log('Run this to enable all:','#3b82f6');log('Object.keys(mediaKitFeatures.FEATURES).forEach(f=>f.startsWith("USE_")&&mediaKitFeatures.toggleFeature(f,true))','#6b7280')}};test()`)).then(r=>r.text()).then(eval);

// 2. ENABLE ALL ENHANCED FEATURES
Object.keys(mediaKitFeatures.FEATURES).forEach(f=>f.startsWith("USE_")&&mediaKitFeatures.toggleFeature(f,true));location.reload();

// 3. INTERACTIVE TEST COMMANDS (after loading interactive console)
mkTest.status()                    // Show system status
mkTest.enableAll()                 // Enable all enhanced features
mkTest.addRapidComponents(5)       // Add 5 components rapidly
mkTest.testControlActions()        // Test delete/duplicate/move buttons
mkTest.testBatchOperations()       // Test batch update performance
mkTest.testTemplateLoad()          // Load a template
mkTest.testPendingActions()        // Test duplicate action prevention
mkTest.stressTestRenderer(20)      // Stress test with 20 operations
mkTest.clearAll()                  // Clear all components
mkTest.help()                      // Show all commands

// 4. DEBUG HELPERS
gmkbDebug.getState()                              // View current state
window.enhancedStateManager.pendingActions        // Check pending actions
window.enhancedStateManager.componentMeta         // View component metadata
window.enhancedComponentRenderer.renderQueue      // Check render queue
document.dispatchEvent(new CustomEvent('force-render'))  // Force re-render

// 5. FEATURE FLAG MANAGEMENT
mediaKitFeatures.FEATURES                         // View all feature flags
mediaKitFeatures.toggleFeature('USE_ENHANCED_STATE_MANAGER', true)  // Enable specific feature
mediaKitFeatures.resetFeatureFlags()              // Reset to defaults

// 6. FIX COMMON ISSUES
// State/DOM mismatch
document.dispatchEvent(new CustomEvent('force-render'))

// Clear duplicate event listeners
location.reload()

// Enable rendering if disabled
window.componentRenderer.disableRendering = false

// Clear all and restart fresh
mkTest.clearAll(); localStorage.clear(); location.reload();

// 7. PERFORMANCE MONITORING
// Check for duplicate renders
let renderCount = 0;
const unsubscribe = stateManager.subscribeGlobal(() => { renderCount++; console.log('Render #' + renderCount); });
// Do some operations...
unsubscribe(); // Stop monitoring

// 8. QUICK COMPONENT TEST
(async () => {
    const id = await componentManager.addComponent('hero');
    console.log('Added:', id);
    await new Promise(r => setTimeout(r, 1000));
    stateManager.updateComponent(id, 'title', 'Test Title');
    console.log('Updated');
    await new Promise(r => setTimeout(r, 1000));
    await componentManager.removeComponent(id);
    console.log('Removed');
})();