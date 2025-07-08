/**
 * @file run-runtime-validation.js
 * @description Runtime validation script for Phase 2.3 implementation gaps
 * 
 * This script runs comprehensive validation to identify specific gaps in the 87.5% completed implementation
 * and provides targeted fix recommendations.
 * 
 * USAGE: Copy this script into browser console or run via script tag
 */

(async function runRuntimeValidation() {
    console.log('🚀 PHASE 2.3 RUNTIME VALIDATION - TARGETING 12.5% GAPS');
    console.log('========================================================');
    console.log('');
    
    // Wait for initialization if available
    if (window.waitForInitialization) {
        try {
            console.log('🕰️ Waiting for system initialization...');
            await window.waitForInitialization();
            console.log('✅ System initialized, proceeding with validation...');
        } catch (error) {
            console.warn('⚠️ Could not wait for initialization:', error.message);
            console.log('🔄 Proceeding anyway...');
        }
    }
    
    // Validation results storage
    const validationResults = {
        timestamp: new Date().toISOString(),
        framework_availability: {},
        implementation_gaps: {},
        runtime_issues: {},
        targeted_fixes: [],
        completion_assessment: {}
    };
    
    try {
        // STEP 1: Framework Availability Check
        console.group('🔍 Step 1: Framework Availability Assessment');
        
        validationResults.framework_availability = {
            implementationValidator: !!window.implementationValidator,
            testingFoundation: !!window.testingFoundation,
            phase23TestRunner: !!window.phase23TestRunner,
            enhancedComponentManager: !!window.enhancedComponentManager,
            enhancedStateManager: !!window.enhancedStateManager,
            mkcgDataMapper: !!window.mkcgDataMapper,
            guestifyData: !!window.guestifyData,
            mkcgData: !!(window.guestifyData?.mkcgData)
        };
        
        console.log('📊 Framework Availability:', validationResults.framework_availability);
        
        // Check critical dependencies
        const criticalMissing = Object.entries(validationResults.framework_availability)
            .filter(([key, available]) => !available)
            .map(([key]) => key);
        
        if (criticalMissing.length > 0) {
            console.warn('⚠️ Missing critical components:', criticalMissing);
        } else {
            console.log('✅ All critical frameworks available');
        }
        
        console.groupEnd();
        
        // STEP 2: Run Implementation Validation
        console.group('🧪 Step 2: Implementation Validation Execution');
        
        if (window.implementationValidator) {
            console.log('🔄 Running comprehensive implementation validation...');
            const implementationResults = await window.implementationValidator.validateImplementation();
            validationResults.implementation_gaps = implementationResults;
            
            console.log('✅ Implementation validation completed');
            console.log(`   Task 2 Completion: ${implementationResults.overall_assessment.task2_completion}%`);
            console.log(`   Task 3 Completion: ${implementationResults.overall_assessment.task3_completion}%`);
            console.log(`   Critical Gaps: ${implementationResults.overall_assessment.critical_gaps.length}`);
        } else {
            console.error('❌ Implementation validator not available');
            validationResults.implementation_gaps.error = 'Implementation validator not loaded';
        }
        
        console.groupEnd();
        
        // STEP 3: Runtime Functionality Testing
        console.group('⚡ Step 3: Runtime Functionality Testing');
        
        if (window.testingFoundation) {
            console.log('🔄 Running runtime functionality tests...');
            
            try {
                // Test empty state scenarios
                const emptyStateTests = window.testingFoundation.createEmptyStateTests();
                validationResults.runtime_issues.emptyStates = {};
                
                // Wrap each test in try-catch to prevent cascading failures
                try {
                    validationResults.runtime_issues.emptyStates.noData = await emptyStateTests.testNoDataScenario();
                } catch (error) {
                    console.warn('⚠️ No data scenario test failed:', error.message);
                    validationResults.runtime_issues.emptyStates.noData = { performance: 'ERROR', error: error.message };
                }
                
                try {
                    validationResults.runtime_issues.emptyStates.lowQuality = await emptyStateTests.testLowQualityScenario();
                } catch (error) {
                    console.warn('⚠️ Low quality scenario test failed:', error.message);
                    validationResults.runtime_issues.emptyStates.lowQuality = { performance: 'ERROR', error: error.message };
                }
                
                try {
                    validationResults.runtime_issues.emptyStates.highQuality = await emptyStateTests.testHighQualityScenario();
                } catch (error) {
                    console.warn('⚠️ High quality scenario test failed:', error.message);
                    validationResults.runtime_issues.emptyStates.highQuality = { performance: 'ERROR', error: error.message };
                }
                
                // Test component indicators
                const componentTests = window.testingFoundation.createComponentStateTests();
                validationResults.runtime_issues.componentIndicators = {};
                
                try {
                    validationResults.runtime_issues.componentIndicators.mkcgPopulated = await componentTests.testMKCGPopulatedComponent();
                } catch (error) {
                    console.warn('⚠️ MKCG populated test failed:', error.message);
                    validationResults.runtime_issues.componentIndicators.mkcgPopulated = { performance: 'ERROR', error: error.message };
                }
                
                try {
                    validationResults.runtime_issues.componentIndicators.manual = await componentTests.testManualComponent();
                } catch (error) {
                    console.warn('⚠️ Manual component test failed:', error.message);
                    validationResults.runtime_issues.componentIndicators.manual = { performance: 'ERROR', error: error.message };
                }
                
                try {
                    validationResults.runtime_issues.componentIndicators.stale = await componentTests.testStaleComponent();
                } catch (error) {
                    console.warn('⚠️ Stale component test failed:', error.message);
                    validationResults.runtime_issues.componentIndicators.stale = { performance: 'ERROR', error: error.message };
                }
                
                console.log('✅ Runtime functionality testing completed');
            } catch (error) {
                console.error('❌ Runtime testing encountered critical error:', error.message);
                validationResults.runtime_issues.error = error.message;
            }
        } else {
            console.error('❌ Testing foundation not available');
            validationResults.runtime_issues.error = 'Testing foundation not loaded';
        }
        
        console.groupEnd();
        
        // STEP 4: Gap Analysis & Targeted Fix Generation
        console.group('🎯 Step 4: Gap Analysis & Targeted Fix Generation');
        
        const gapAnalysis = analyzeGaps(validationResults);
        validationResults.targeted_fixes = gapAnalysis.fixes;
        validationResults.completion_assessment = gapAnalysis.assessment;
        
        console.log('📊 Gap Analysis Results:');
        console.log(`   Identified Issues: ${gapAnalysis.fixes.length}`);
        console.log(`   Severity Distribution:`, gapAnalysis.severityDistribution);
        console.log(`   Estimated Completion: ${gapAnalysis.assessment.estimated_completion}%`);
        
        console.groupEnd();
        
        // STEP 5: Generate Action Plan
        console.group('📋 Step 5: Targeted Action Plan Generation');
        
        const actionPlan = generateActionPlan(validationResults);
        
        console.log('🎯 TARGETED ACTION PLAN:');
        console.log('========================');
        
        actionPlan.forEach((action, index) => {
            console.log(`${index + 1}. ${action.title}`);
            console.log(`   Priority: ${action.priority}`);
            console.log(`   Effort: ${action.effort}`);
            console.log(`   Files: ${action.files.join(', ')}`);
            console.log(`   Description: ${action.description}`);
            console.log('');
        });
        
        console.groupEnd();
        
        // STEP 6: Final Summary & Recommendations
        displayFinalSummary(validationResults, actionPlan);
        
        // Store results globally for further analysis
        window.runtimeValidationResults = validationResults;
        window.targetedActionPlan = actionPlan;
        
        return {
            validationResults,
            actionPlan,
            success: true
        };
        
    } catch (error) {
        console.error('❌ Runtime validation failed:', error);
        validationResults.error = error.message;
        return {
            validationResults,
            success: false,
            error: error.message
        };
    }
    
    // ANALYSIS FUNCTIONS
    
    function analyzeGaps(results) {
        const fixes = [];
        const severityCount = { critical: 0, high: 0, medium: 0, low: 0 };
        
        // Analyze implementation gaps
        if (results.implementation_gaps?.overall_assessment?.critical_gaps) {
            results.implementation_gaps.overall_assessment.critical_gaps.forEach(gap => {
                fixes.push({
                    type: 'implementation',
                    severity: 'critical',
                    issue: gap,
                    files: determineFilesForGap(gap),
                    effort: 'high',
                    description: `Address critical implementation gap: ${gap}`
                });
                severityCount.critical++;
            });
        }
        
        // Analyze runtime issues
        if (results.runtime_issues?.emptyStates) {
            Object.entries(results.runtime_issues.emptyStates).forEach(([scenario, result]) => {
                if (result.performance === 'ERROR' || result.performance === 'FAIL') {
                    fixes.push({
                        type: 'runtime',
                        severity: 'high',
                        issue: `Empty state ${scenario} scenario failing`,
                        files: ['templates/builder-template.php', 'js/core/enhanced-state-manager.js'],
                        effort: 'medium',
                        description: `Fix empty state functionality for ${scenario} scenario`
                    });
                    severityCount.high++;
                }
            });
        }
        
        if (results.runtime_issues?.componentIndicators) {
            Object.entries(results.runtime_issues.componentIndicators).forEach(([type, result]) => {
                if (result.performance === 'ERROR' || result.performance === 'FAIL') {
                    fixes.push({
                        type: 'runtime',
                        severity: 'high',
                        issue: `Component indicator ${type} failing`,
                        files: ['js/core/enhanced-component-manager.js', 'css/guestify-builder.css'],
                        effort: 'medium',
                        description: `Fix component indicator functionality for ${type} components`
                    });
                    severityCount.high++;
                }
            });
        }
        
        // Framework availability issues
        Object.entries(results.framework_availability).forEach(([framework, available]) => {
            if (!available) {
                fixes.push({
                    type: 'framework',
                    severity: framework.includes('enhanced') ? 'high' : 'medium',
                    issue: `Framework ${framework} not available`,
                    files: determineFilesForFramework(framework),
                    effort: 'low',
                    description: `Ensure ${framework} is properly loaded and exposed`
                });
                severityCount[framework.includes('enhanced') ? 'high' : 'medium']++;
            }
        });
        
        const totalGaps = fixes.length;
        const estimatedCompletion = Math.max(87.5, 100 - (totalGaps * 2.5)); // Rough estimation
        
        return {
            fixes,
            severityDistribution: severityCount,
            assessment: {
                total_gaps: totalGaps,
                estimated_completion: Math.round(estimatedCompletion),
                completion_to_go: Math.round(100 - estimatedCompletion),
                priority_gaps: fixes.filter(f => f.severity === 'critical' || f.severity === 'high').length
            }
        };
    }
    
    function determineFilesForGap(gap) {
        if (gap.includes('Task 2') && gap.includes('JavaScript')) {
            return ['js/core/enhanced-state-manager.js', 'js/core/enhanced-component-manager.js'];
        }
        if (gap.includes('Task 2') && gap.includes('interactive')) {
            return ['templates/builder-template.php', 'js/main.js'];
        }
        if (gap.includes('Task 3') && gap.includes('quality')) {
            return ['js/utils/mkcg-data-mapper.js', 'css/guestify-builder.css'];
        }
        if (gap.includes('Task 3') && gap.includes('freshness')) {
            return ['includes/class-gmkb-mkcg-data-integration.php', 'js/core/enhanced-state-manager.js'];
        }
        return ['js/main.js', 'templates/builder-template.php'];
    }
    
    function determineFilesForFramework(framework) {
        const frameworkFiles = {
            implementationValidator: ['js/tests/phase23-implementation-validator.js'],
            testingFoundation: ['js/tests/testing-foundation-utilities.js'],
            phase23TestRunner: ['js/tests/phase23-test-runner.js'],
            enhancedComponentManager: ['js/core/enhanced-component-manager.js'],
            enhancedStateManager: ['js/core/enhanced-state-manager.js'],
            mkcgDataMapper: ['js/utils/mkcg-data-mapper.js'],
            guestifyData: ['includes/enqueue.php'],
            mkcgData: ['includes/class-gmkb-mkcg-data-integration.php', 'guestify-media-kit-builder.php']
        };
        return frameworkFiles[framework] || ['js/main.js'];
    }
    
    function generateActionPlan(results) {
        const actionItems = [];
        const fixes = results.targeted_fixes;
        
        // Group fixes by priority and type
        const criticalFixes = fixes.filter(f => f.severity === 'critical');
        const highFixes = fixes.filter(f => f.severity === 'high');
        const mediumFixes = fixes.filter(f => f.severity === 'medium');
        
        // Critical priority actions
        if (criticalFixes.length > 0) {
            actionItems.push({
                title: 'CRITICAL: Fix Implementation Gaps',
                priority: 'CRITICAL',
                effort: 'HIGH',
                files: [...new Set(criticalFixes.flatMap(f => f.files))],
                issues: criticalFixes.map(f => f.issue),
                description: `Address ${criticalFixes.length} critical implementation gaps that prevent core functionality`,
                estimatedTime: '2-4 hours',
                blocksDeployment: true
            });
        }
        
        // High priority actions
        if (highFixes.length > 0) {
            actionItems.push({
                title: 'HIGH: Fix Runtime Functionality',
                priority: 'HIGH',
                effort: 'MEDIUM',
                files: [...new Set(highFixes.flatMap(f => f.files))],
                issues: highFixes.map(f => f.issue),
                description: `Fix ${highFixes.length} high-priority runtime issues affecting user experience`,
                estimatedTime: '1-3 hours',
                blocksDeployment: false
            });
        }
        
        // Framework loading issues
        const frameworkIssues = fixes.filter(f => f.type === 'framework');
        if (frameworkIssues.length > 0) {
            actionItems.push({
                title: 'MEDIUM: Fix Framework Loading',
                priority: 'MEDIUM',
                effort: 'LOW',
                files: [...new Set(frameworkIssues.flatMap(f => f.files))],
                issues: frameworkIssues.map(f => f.issue),
                description: `Ensure ${frameworkIssues.length} framework components are properly loaded`,
                estimatedTime: '30-60 minutes',
                blocksDeployment: false
            });
        }
        
        // Performance optimization
        actionItems.push({
            title: 'LOW: Performance Optimization',
            priority: 'LOW',
            effort: 'LOW',
            files: ['js/main.js', 'css/guestify-builder.css'],
            issues: ['Performance benchmarks may not be met'],
            description: 'Optimize performance to meet all target benchmarks',
            estimatedTime: '1-2 hours',
            blocksDeployment: false
        });
        
        // Final testing
        actionItems.push({
            title: 'FINAL: Comprehensive Testing',
            priority: 'LOW',
            effort: 'MEDIUM',
            files: ['js/tests/'],
            issues: ['Complete end-to-end validation needed'],
            description: 'Run comprehensive testing suite and validate 100% completion',
            estimatedTime: '1 hour',
            blocksDeployment: false
        });
        
        return actionItems;
    }
    
    function displayFinalSummary(results, actionPlan) {
        console.log('');
        console.log('🎯 ================================================');
        console.log('📊 RUNTIME VALIDATION SUMMARY');
        console.log('🎯 ================================================');
        console.log('');
        
        // Framework Status
        console.group('🔧 Framework Availability Status');
        Object.entries(results.framework_availability).forEach(([framework, available]) => {
            console.log(`${available ? '✅' : '❌'} ${framework}`);
        });
        console.groupEnd();
        
        // Implementation Status
        if (results.implementation_gaps?.overall_assessment) {
            const assessment = results.implementation_gaps.overall_assessment;
            console.group('📋 Implementation Status');
            console.log(`Task 2 Completion: ${assessment.task2_completion}%`);
            console.log(`Task 3 Completion: ${assessment.task3_completion}%`);
            console.log(`Critical Gaps: ${assessment.critical_gaps.length}`);
            console.log(`Overall Estimated: ${results.completion_assessment.estimated_completion}%`);
            console.groupEnd();
        }
        
        // Action Items Summary
        console.group('🎯 Action Items Summary');
        const criticalActions = actionPlan.filter(a => a.priority === 'CRITICAL').length;
        const highActions = actionPlan.filter(a => a.priority === 'HIGH').length;
        const totalEstimatedTime = actionPlan.reduce((total, action) => {
            const timeMatch = action.estimatedTime.match(/(\d+)/);
            return total + (timeMatch ? parseInt(timeMatch[1]) : 1);
        }, 0);
        
        console.log(`Critical Actions: ${criticalActions}`);
        console.log(`High Priority Actions: ${highActions}`);
        console.log(`Total Actions: ${actionPlan.length}`);
        console.log(`Estimated Time: ${totalEstimatedTime} hours`);
        console.groupEnd();
        
        // Deployment Readiness
        console.group('🚀 Deployment Readiness');
        const blockingIssues = actionPlan.filter(a => a.blocksDeployment).length;
        const readinessScore = results.completion_assessment.estimated_completion;
        
        if (readinessScore >= 95 && blockingIssues === 0) {
            console.log('%c🟢 READY FOR PRODUCTION', 'color: #10b981; font-weight: bold; font-size: 16px;');
        } else if (readinessScore >= 90 && blockingIssues === 0) {
            console.log('%c🟡 READY FOR DEPLOYMENT (minor fixes)', 'color: #f59e0b; font-weight: bold; font-size: 16px;');
        } else if (blockingIssues === 0) {
            console.log('%c🟠 TESTING REQUIRED', 'color: #f97316; font-weight: bold; font-size: 16px;');
        } else {
            console.log('%c🔴 CRITICAL FIXES NEEDED', 'color: #ef4444; font-weight: bold; font-size: 16px;');
        }
        
        console.log(`Blocking Issues: ${blockingIssues}`);
        console.log(`Readiness Score: ${readinessScore}%`);
        console.groupEnd();
        
        console.log('');
        console.log('📋 Access Results:');
        console.log('   window.runtimeValidationResults');
        console.log('   window.targetedActionPlan');
        console.log('');
        console.log('🔄 Next: Follow the targeted action plan to close the remaining gaps');
    }
})();

// Console helper for easy access
console.log(`
🎯 Runtime Validation Script Ready!

To run validation:
1. Copy this entire script to browser console, OR
2. Load via script tag in development

The script will:
✓ Check all framework availability
✓ Run comprehensive implementation validation  
✓ Test runtime functionality
✓ Identify specific gaps requiring fixes
✓ Generate targeted action plan with time estimates
✓ Provide deployment readiness assessment

Results will be stored in:
- window.runtimeValidationResults
- window.targetedActionPlan
`);
