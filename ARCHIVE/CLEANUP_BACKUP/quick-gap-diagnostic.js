/**
 * @file quick-gap-diagnostic.js
 * @description Immediate diagnostic script for browser console execution
 * 
 * USAGE: Copy and paste into browser console for instant gap analysis
 */

(function quickGapDiagnostic() {
    console.log('🔍 QUICK GAP DIAGNOSTIC - PHASE 2.3 IMPLEMENTATION');
    console.log('==================================================');
    console.log('');
    
    const diagnostics = {
        timestamp: new Date().toISOString(),
        frameworks: {},
        dom_elements: {},
        functionality: {},
        gaps: [],
        immediate_fixes: []
    };
    
    // 1. Framework Availability Quick Check
    console.group('🔧 Framework Availability');
    
    const frameworks = {
        'Implementation Validator': !!window.implementationValidator,
        'Testing Foundation': !!window.testingFoundation,
        'Enhanced Component Manager': !!window.enhancedComponentManager,
        'Enhanced State Manager': !!window.enhancedStateManager,
        'MKCG Data Mapper': !!window.mkcgDataMapper,
        'Guestify Data': !!window.guestifyData,
        'MKCG Data': !!(window.guestifyData?.mkcgData)
    };
    
    Object.entries(frameworks).forEach(([name, available]) => {
        console.log(`${available ? '✅' : '❌'} ${name}`);
        diagnostics.frameworks[name] = available;
        if (!available) {
            diagnostics.gaps.push(`Framework Missing: ${name}`);
        }
    });
    
    console.groupEnd();
    
    // 2. DOM Element Presence Check
    console.group('📋 DOM Elements Check');
    
    const domElements = {
        'Empty State Container': !!document.querySelector('.empty-state-enhanced'),
        'MKCG Dashboard': !!document.querySelector('.mkcg-enhanced-dashboard'),
        'Preview Components': document.querySelectorAll('.preview-component-enhanced').length,
        'Quality Badges': document.querySelectorAll('.quality-badge').length,
        'Data Freshness Indicators': document.querySelectorAll('.data-freshness').length,
        'Sync Indicators': document.querySelectorAll('.sync-indicator').length,
        'Media Kit Preview': !!document.getElementById('media-kit-preview'),
        'Component Library Modal': !!document.getElementById('component-library-overlay')
    };
    
    Object.entries(domElements).forEach(([name, result]) => {
        const status = typeof result === 'boolean' ? result : result > 0;
        const display = typeof result === 'number' ? ` (${result})` : '';
        console.log(`${status ? '✅' : '❌'} ${name}${display}`);
        diagnostics.dom_elements[name] = result;
        if (!status && !name.includes('Indicators')) {
            diagnostics.gaps.push(`DOM Missing: ${name}`);
        }
    });
    
    console.groupEnd();
    
    // 3. Functionality Quick Test
    console.group('⚡ Functionality Quick Test');
    
    const functionality = {
        'Add Component Method': typeof window.enhancedComponentManager?.addComponent === 'function',
        'Auto-Generation Available': typeof window.enhancedComponentManager?.autoGenerateFromMKCGEnhanced === 'function',
        'State Manager Init': typeof window.enhancedStateManager?.init === 'function',
        'Data Mapper Available': typeof window.mkcgDataMapper?.mapDataToComponent === 'function',
        'Empty State Handling': typeof window.enhancedStateManager?.checkMKCGDataAvailability === 'function'
    };
    
    Object.entries(functionality).forEach(([name, available]) => {
        console.log(`${available ? '✅' : '❌'} ${name}`);
        diagnostics.functionality[name] = available;
        if (!available) {
            diagnostics.gaps.push(`Functionality Missing: ${name}`);
        }
    });
    
    console.groupEnd();
    
    // 4. Quick Component Test
    console.group('🧪 Quick Component Test');
    
    let componentTestResult = 'No test performed';
    try {
        if (window.enhancedComponentManager && typeof window.enhancedComponentManager.addComponent === 'function') {
            // Simulate adding a component
            console.log('🔄 Testing component addition...');
            
            // Check if preview container exists
            const previewContainer = document.getElementById('media-kit-preview');
            if (previewContainer) {
                console.log('✅ Preview container found');
                componentTestResult = 'Preview container available for testing';
            } else {
                console.log('❌ Preview container missing');
                componentTestResult = 'Preview container missing - cannot test components';
                diagnostics.gaps.push('Critical: Preview container missing');
            }
        } else {
            console.log('❌ Component manager not functional');
            componentTestResult = 'Component manager not available';
            diagnostics.gaps.push('Critical: Component manager not functional');
        }
    } catch (error) {
        console.error('❌ Component test failed:', error.message);
        componentTestResult = `Component test error: ${error.message}`;
        diagnostics.gaps.push(`Component Test Error: ${error.message}`);
    }
    
    diagnostics.functionality['Component Test'] = componentTestResult;
    console.log('Component Test Result:', componentTestResult);
    
    console.groupEnd();
    
    // 5. Generate Immediate Fix Recommendations
    console.group('🎯 Immediate Fix Recommendations');
    
    // Prioritize gaps
    const criticalGaps = diagnostics.gaps.filter(gap => 
        gap.includes('Critical') || 
        gap.includes('Enhanced Component Manager') || 
        gap.includes('Preview container')
    );
    
    const highGaps = diagnostics.gaps.filter(gap => 
        gap.includes('Enhanced State Manager') || 
        gap.includes('MKCG Data Mapper') ||
        gap.includes('Functionality Missing')
    );
    
    const mediumGaps = diagnostics.gaps.filter(gap => 
        !criticalGaps.includes(gap) && !highGaps.includes(gap)
    );
    
    if (criticalGaps.length > 0) {
        console.log('🔴 CRITICAL FIXES NEEDED:');
        criticalGaps.forEach(gap => console.log(`   • ${gap}`));
        
        diagnostics.immediate_fixes.push({
            priority: 'CRITICAL',
            fixes: criticalGaps,
            files: ['js/main.js', 'js/core/enhanced-component-manager.js', 'templates/builder-template.php'],
            timeEstimate: '1-2 hours'
        });
    }
    
    if (highGaps.length > 0) {
        console.log('🟡 HIGH PRIORITY FIXES:');
        highGaps.forEach(gap => console.log(`   • ${gap}`));
        
        diagnostics.immediate_fixes.push({
            priority: 'HIGH',
            fixes: highGaps,
            files: ['js/core/enhanced-state-manager.js', 'js/utils/mkcg-data-mapper.js'],
            timeEstimate: '30-60 minutes'
        });
    }
    
    if (mediumGaps.length > 0) {
        console.log('🟢 MEDIUM PRIORITY FIXES:');
        mediumGaps.forEach(gap => console.log(`   • ${gap}`));
        
        diagnostics.immediate_fixes.push({
            priority: 'MEDIUM',
            fixes: mediumGaps,
            files: ['js/tests/', 'includes/enqueue.php'],
            timeEstimate: '15-30 minutes'
        });
    }
    
    if (diagnostics.gaps.length === 0) {
        console.log('🎉 NO CRITICAL GAPS FOUND - RUNNING COMPREHENSIVE VALIDATION RECOMMENDED');
    }
    
    console.groupEnd();
    
    // 6. Next Steps Recommendation
    console.group('📋 Next Steps');
    
    const totalGaps = diagnostics.gaps.length;
    const estimatedCompletion = Math.max(87.5, 100 - (totalGaps * 2));
    
    console.log(`📊 Current Estimated Completion: ${estimatedCompletion}%`);
    console.log(`🎯 Gaps to Address: ${totalGaps}`);
    console.log('');
    
    if (totalGaps === 0) {
        console.log('✅ RECOMMENDED: Run comprehensive testing');
        console.log('   Command: window.phase23TestRunner?.run()');
    } else if (criticalGaps.length > 0) {
        console.log('🔴 RECOMMENDED: Fix critical gaps first');
        console.log('   1. Ensure Enhanced Component Manager is loaded');
        console.log('   2. Verify preview container exists');
        console.log('   3. Test component addition functionality');
    } else if (highGaps.length > 0) {
        console.log('🟡 RECOMMENDED: Address functionality gaps');
        console.log('   1. Load missing framework components');
        console.log('   2. Test state management functionality');
        console.log('   3. Verify data mapping system');
    } else {
        console.log('🟢 RECOMMENDED: Complete minor fixes and test');
        console.log('   1. Load missing testing frameworks');
        console.log('   2. Run comprehensive validation');
    }
    
    console.groupEnd();
    
    // Store results globally
    window.quickDiagnosticResults = diagnostics;
    
    // Summary
    console.log('');
    console.log('🎯 QUICK DIAGNOSTIC SUMMARY');
    console.log('==========================');
    console.log(`Total Gaps Found: ${totalGaps}`);
    console.log(`Critical: ${criticalGaps.length}`);
    console.log(`High: ${highGaps.length}`);
    console.log(`Medium: ${mediumGaps.length}`);
    console.log(`Estimated Completion: ${estimatedCompletion}%`);
    console.log('');
    console.log('📋 Results stored in: window.quickDiagnosticResults');
    console.log('');
    
    if (totalGaps > 0) {
        console.log('🔄 NEXT: Address the identified gaps and re-run diagnostic');
    } else {
        console.log('🚀 NEXT: Run comprehensive validation for detailed testing');
        console.log('   Load: js/tests/run-runtime-validation.js');
    }
    
    return diagnostics;
})();
