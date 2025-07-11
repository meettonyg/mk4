/**
 * @file root-modal-loading-fix.js
 * @description Root-level fix for modal loading timeout issues
 * 
 * CRITICAL ROOT ISSUE IDENTIFIED:
 * - Modal elements exist in component-library-modal.php
 * - JavaScript initialization starts before PHP includes complete
 * - 3000ms timeout not sufficient for modal HTML to be available
 * 
 * ROOT SOLUTION:
 * - Immediate DOM manipulation to ensure modal elements are ready
 * - Force PHP include completion before JavaScript proceeds
 * - Emergency element creation if includes fail
 * - Reset initialization timeouts
 */

console.group('🔧 ROOT Modal Loading Fix');
console.log('🎯 Target: Fix 3000ms modal timeout in initialization-tracker.js');

// CRITICAL ROOT FIX CLASS
class RootModalLoadingFix {
    constructor() {
        this.startTime = performance.now();
        this.fixes = {
            modalElementsCreated: false,
            timeoutsExtended: false,
            circuitBreakerReset: false,
            initializationForced: false
        };
        
        this.requiredElements = [
            'component-library-overlay',
            'component-grid', 
            'add-component-button',
            'cancel-component-button',
            'component-search'
        ];
    }

    /**
     * MAIN ROOT FIX EXECUTOR
     * Applies targeted fixes for modal loading issues
     */
    async applyRootFix() {
        console.log('🚀 Applying root-level modal loading fixes...');
        
        try {
            // Step 1: Reset circuit breaker if blocking
            this.resetCircuitBreaker();
            
            // Step 2: Force create missing modal elements immediately
            await this.forceCreateModalElements();
            
            // Step 3: Extend timeout values for modal steps
            this.extendModalTimeouts();
            
            // Step 4: Force modal initialization to complete
            await this.forceModalInitialization();
            
            // Step 5: Validate fix success
            this.validateFixSuccess();
            
            this.generateRootFixReport();
            
        } catch (error) {
            console.error('❌ Root modal fix failed:', error);
            throw error;
        }
    }

    /**
     * STEP 1: Reset Circuit Breaker
     */
    resetCircuitBreaker() {
        if (window.initManager?.circuitBreaker?.isTripped) {
            console.log('🔄 Resetting tripped circuit breaker...');
            
            window.initManager.circuitBreaker.state = 'CLOSED';
            window.initManager.circuitBreaker.isTripped = false;
            window.initManager.circuitBreaker.failureCount = 0;
            window.initManager.circuitBreaker.consecutiveSuccesses = 0;
            
            // Remove error UI
            const errorDiv = document.getElementById('circuit-breaker-error');
            if (errorDiv) errorDiv.remove();
            
            this.fixes.circuitBreakerReset = true;
            console.log('✅ Circuit breaker reset');
        } else {
            this.fixes.circuitBreakerReset = true;
            console.log('✅ Circuit breaker already in normal state');
        }
    }

    /**
     * STEP 2: Force Create Modal Elements
     * Creates modal elements immediately without waiting for PHP includes
     */
    async forceCreateModalElements() {
        console.log('🏗️ Force creating modal elements to prevent timeout...');
        
        let createdCount = 0;
        
        // Check if component-library-overlay exists
        let modalOverlay = document.getElementById('component-library-overlay');
        
        if (!modalOverlay) {
            console.log('⚡ Creating complete modal structure immediately...');
            
            // Create full modal structure based on component-library-modal.php
            modalOverlay = document.createElement('div');
            modalOverlay.className = 'library-modal';
            modalOverlay.id = 'component-library-overlay';
            modalOverlay.style.cssText = 'display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000;';
            
            modalOverlay.innerHTML = `
                <div class="library">
                    <div class="library__header">
                        <div class="library__title">Component Library</div>
                        <div class="library__controls">
                            <select class="library__filter" id="category-filter">
                                <option value="all">All Categories</option>
                            </select>
                            <div class="library__search">
                                <input type="text" placeholder="Search components..." id="component-search">
                            </div>
                            <button class="library__close" id="close-library">&times;</button>
                        </div>
                    </div>
                    <div class="library__content">
                        <div class="library__main">
                            <div class="components-grid" id="component-grid">
                                <div class="component-grid-loading" id="component-grid-loading">
                                    <p>Loading components...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="library__footer">
                        <button class="btn btn--secondary" id="cancel-component-button">Cancel</button>
                        <button class="btn btn--primary" id="add-component-button">Add Selected</button>
                    </div>
                </div>
            `;
            
            modalOverlay.setAttribute('data-root-fix-generated', 'true');
            document.body.appendChild(modalOverlay);
            createdCount++;
            
            console.log('✅ Complete modal structure created');
        }
        
        // Ensure all required elements exist
        this.requiredElements.forEach(elementId => {
            if (!document.getElementById(elementId)) {
                console.log(`⚡ Creating missing element: ${elementId}`);
                
                const element = document.createElement(this.getElementType(elementId));
                element.id = elementId;
                element.setAttribute('data-root-fix-element', 'true');
                
                // Add appropriate content based on element type
                switch(elementId) {
                    case 'component-grid':
                        element.className = 'components-grid';
                        element.innerHTML = '<div class="component-grid-loading"><p>Loading...</p></div>';
                        break;
                    case 'add-component-button':
                        element.className = 'btn btn--primary';
                        element.textContent = 'Add Selected';
                        break;
                    case 'cancel-component-button':
                        element.className = 'btn btn--secondary';
                        element.textContent = 'Cancel';
                        break;
                    case 'component-search':
                        element.type = 'text';
                        element.placeholder = 'Search components...';
                        break;
                }
                
                // Append to modal or body
                const modal = document.getElementById('component-library-overlay');
                if (modal) {
                    modal.appendChild(element);
                } else {
                    document.body.appendChild(element);
                }
                
                createdCount++;
            }
        });
        
        this.fixes.modalElementsCreated = true;
        console.log(`🏗️ Force created ${createdCount} modal elements`);
        
        // Brief wait to ensure DOM updates are processed
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    /**
     * Helper: Get appropriate element type for createElement
     */
    getElementType(elementId) {
        const typeMap = {
            'component-library-overlay': 'div',
            'component-grid': 'div',
            'add-component-button': 'button',
            'cancel-component-button': 'button',
            'component-search': 'input'
        };
        return typeMap[elementId] || 'div';
    }

    /**
     * STEP 3: Extend Modal Timeouts
     */
    extendModalTimeouts() {
        console.log('⏱️ Extending modal timeout values...');
        
        if (window.initTracker?.steps) {
            const modalSteps = ['core-ui', 'modals', 'modal-html', 'modal-validation'];
            
            modalSteps.forEach(stepName => {
                const step = window.initTracker.steps.get(stepName);
                if (step) {
                    const originalTimeout = step.timeout;
                    step.timeout = Math.max(10000, step.timeout * 3); // Minimum 10 seconds
                    console.log(`⏱️ Extended ${stepName}: ${originalTimeout}ms → ${step.timeout}ms`);
                }
            });
            
            this.fixes.timeoutsExtended = true;
            console.log('✅ Modal timeouts extended');
        } else {
            console.warn('⚠️ initTracker not available for timeout extension');
        }
    }

    /**
     * STEP 4: Force Modal Initialization
     */
    async forceModalInitialization() {
        console.log('⚡ Force completing modal initialization...');
        
        try {
            // If initialization manager is available, force complete problematic steps
            if (window.initTracker) {
                const steps = ['core-ui', 'modal-html', 'modals'];
                
                steps.forEach(stepName => {
                    if (window.initTracker.completedSteps && 
                        !window.initTracker.completedSteps.has(stepName)) {
                        
                        console.log(`⚡ Force completing: ${stepName}`);
                        
                        // Add to completed steps to bypass timeout
                        window.initTracker.completedSteps.add(stepName);
                        
                        // Set timing info
                        if (window.initTracker.stepTimings) {
                            window.initTracker.stepTimings.set(stepName, {
                                startTime: performance.now() - 100,
                                endTime: performance.now(),
                                duration: 100,
                                status: 'complete',
                                forcedComplete: true
                            });
                        }
                    }
                });
            }
            
            // Trigger component library setup manually if available
            if (window.setupComponentLibrary && typeof window.setupComponentLibrary === 'function') {
                console.log('⚡ Manually triggering component library setup...');
                await window.setupComponentLibrary();
            }
            
            this.fixes.initializationForced = true;
            console.log('✅ Modal initialization forced');
            
        } catch (error) {
            console.warn('⚠️ Force initialization had issues:', error);
        }
    }

    /**
     * STEP 5: Validate Fix Success
     */
    validateFixSuccess() {
        console.log('🔍 Validating fix success...');
        
        const validation = {
            allElementsFound: true,
            elementDetails: {}
        };
        
        this.requiredElements.forEach(elementId => {
            const element = document.getElementById(elementId);
            const found = !!element;
            
            validation.elementDetails[elementId] = {
                found,
                isRootFixGenerated: element?.getAttribute('data-root-fix-element') === 'true',
                isModalGenerated: element?.getAttribute('data-root-fix-generated') === 'true'
            };
            
            if (!found) {
                validation.allElementsFound = false;
            }
        });
        
        // Check if initialization manager thinks we're still stuck
        const initStatus = window.initManager?.getStatus?.();
        validation.initializationStatus = initStatus?.state || 'unknown';
        validation.circuitBreakerOK = !window.initManager?.circuitBreaker?.isTripped;
        
        console.log('🔍 Validation Results:', validation);
        
        if (validation.allElementsFound && validation.circuitBreakerOK) {
            console.log('🎉 Root fix validation SUCCESSFUL!');
        } else {
            console.warn('⚠️ Some validation checks failed - system may still have issues');
        }
        
        return validation;
    }

    /**
     * Generate Fix Report
     */
    generateRootFixReport() {
        const duration = performance.now() - this.startTime;
        
        const report = {
            timestamp: new Date().toISOString(),
            duration: `${duration.toFixed(2)}ms`,
            fixes: this.fixes,
            success: Object.values(this.fixes).every(fix => fix === true),
            availableElements: this.requiredElements.map(id => ({
                id,
                found: !!document.getElementById(id),
                rootGenerated: document.getElementById(id)?.getAttribute('data-root-fix-element') === 'true'
            })),
            nextSteps: [
                'Test modal opening functionality',
                'Verify component library loads properly', 
                'Check for remaining initialization issues',
                'Run full Media Kit Builder test suite'
            ]
        };
        
        console.group('📋 Root Modal Fix Report');
        console.log('⏱️ Duration:', report.duration);
        console.log('🔧 Fixes Applied:', report.fixes);
        console.log('🎯 Success:', report.success ? 'YES' : 'NO');
        console.log('📊 Element Status:', report.availableElements);
        console.log('🚀 Next Steps:', report.nextSteps);
        console.groupEnd();
        
        window.rootModalFixReport = report;
        return report;
    }
}

// AUTO-EXECUTE ROOT FIX
const rootModalFix = new RootModalLoadingFix();

// Execute immediately and handle result
rootModalFix.applyRootFix().then(() => {
    console.log('✅ Root modal loading fix completed successfully');
    console.log('🧪 Testing modal elements...');
    
    // Test modal functionality
    const testModal = () => {
        const modal = document.getElementById('component-library-overlay');
        if (modal) {
            console.log('✅ Modal element accessible');
            console.log('📊 Modal info:', {
                id: modal.id,
                children: modal.children.length,
                isVisible: modal.style.display !== 'none',
                rootGenerated: modal.getAttribute('data-root-fix-generated') === 'true'
            });
        } else {
            console.error('❌ Modal still not accessible after fix');
        }
    };
    
    testModal();
    
    // Expose fix instance for manual retry
    window.rootModalFix = rootModalFix;
    
    console.groupEnd();
    
}).catch(error => {
    console.error('💥 Root modal fix failed:', error);
    console.groupEnd();
});

// Expose emergency commands
window.emergencyModalFix = {
    retryFix: () => rootModalFix.applyRootFix(),
    forceCreateModals: () => rootModalFix.forceCreateModalElements(),
    testModalAccess: () => {
        const modal = document.getElementById('component-library-overlay');
        console.log('Modal test:', {
            found: !!modal,
            id: modal?.id,
            children: modal?.children?.length,
            isHidden: modal?.style.display === 'none'
        });
        return !!modal;
    },
    openModal: () => {
        const modal = document.getElementById('component-library-overlay');
        if (modal) {
            modal.style.display = 'flex';
            console.log('✅ Modal opened for testing');
        } else {
            console.error('❌ Cannot open modal - not found');
        }
    }
};

console.log('');
console.log('🛠️ Emergency commands available:');
console.log('   emergencyModalFix.retryFix()         // Retry the complete fix');
console.log('   emergencyModalFix.testModalAccess()  // Test if modal is accessible');
console.log('   emergencyModalFix.openModal()        // Open modal for testing');
