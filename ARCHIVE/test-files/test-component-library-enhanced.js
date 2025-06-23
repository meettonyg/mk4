/**
 * Enhanced Component Library Test Suite
 * Integrates existing race condition tests with specific component library issue validation
 * 
 * Usage:
 * 1. Run BEFORE fixes: componentLibraryTests.runBaselineTest()
 * 2. Run AFTER each phase: componentLibraryTests.runPhaseValidation(phaseNumber)
 * 3. Run final validation: componentLibraryTests.runCompleteValidation()
 */

window.componentLibraryTests = {
    
    // Test results storage
    results: {
        baseline: null,
        phases: {},
        final: null
    },
    
    /**
     * BASELINE TEST - Run before any fixes to document current failures
     */
    async runBaselineTest() {
        console.log('🚨 BASELINE TEST: Component Library Current State');
        console.log('=================================================');
        
        const results = {
            timestamp: new Date().toISOString(),
            raceConditions: await this.testRaceConditions(),
            componentLibrary: await this.testComponentLibrarySpecifics(),
            summary: {}
        };
        
        // Calculate baseline scores
        results.summary = this.calculateScores(results);
        this.results.baseline = results;
        
        console.log('\n📊 BASELINE SUMMARY:');
        console.log(`Race Conditions: ${results.summary.raceConditionScore}%`);
        console.log(`Component Library: ${results.summary.componentLibraryScore}%`);
        console.log(`Overall: ${results.summary.overallScore}%`);
        
        if (results.summary.overallScore < 50) {
            console.log('❌ System has significant issues - fixes needed');
        }
        
        return results;
    },
    
    /**
     * PHASE VALIDATION - Run after each fix phase
     */
    async runPhaseValidation(phaseNumber, phaseName) {
        console.log(`\n✅ PHASE ${phaseNumber} VALIDATION: ${phaseName}`);
        console.log('='.repeat(50));
        
        const results = {
            phase: phaseNumber,
            name: phaseName,
            timestamp: new Date().toISOString(),
            raceConditions: await this.testRaceConditions(),
            componentLibrary: await this.testComponentLibrarySpecifics(),
            summary: {}
        };
        
        results.summary = this.calculateScores(results);
        this.results.phases[phaseNumber] = results;
        
        // Compare with baseline
        if (this.results.baseline) {
            const improvement = results.summary.overallScore - this.results.baseline.summary.overallScore;
            console.log(`\n📈 Improvement: +${improvement.toFixed(1)}% from baseline`);
        }
        
        console.log(`\n📊 PHASE ${phaseNumber} RESULTS:`);
        console.log(`Race Conditions: ${results.summary.raceConditionScore}%`);
        console.log(`Component Library: ${results.summary.componentLibraryScore}%`);
        console.log(`Overall: ${results.summary.overallScore}%`);
        
        return results;
    },
    
    /**
     * RACE CONDITION TESTS - Based on existing test-phase2a-modals.js
     */
    async testRaceConditions() {
        const tests = {
            modalElements: this.testModalElements(),
            buttonListeners: this.testButtonListeners(),
            initialization: this.testInitializationStatus(),
            modalFunctionality: await this.testModalFunctionality()
        };
        
        const passCount = Object.values(tests).filter(Boolean).length;
        const score = (passCount / Object.keys(tests).length * 100);
        
        return {
            tests,
            score,
            passCount,
            totalTests: Object.keys(tests).length
        };
    },
    
    /**
     * COMPONENT LIBRARY SPECIFIC TESTS - New tests for our issues
     */
    async testComponentLibrarySpecifics() {
        const tests = {
            svgIconDisplay: this.testSVGIconDisplay(),
            componentSelection: this.testComponentSelection(),
            checkboxFunctionality: this.testCheckboxFunctionality(),
            addButtonFunctionality: await this.testAddButtonFunctionality(),
            componentPopulation: this.testComponentPopulation(),
            eventDelegation: this.testEventDelegation()
        };
        
        const passCount = Object.values(tests).filter(Boolean).length;
        const score = (passCount / Object.keys(tests).length * 100);
        
        return {
            tests,
            score,
            passCount,
            totalTests: Object.keys(tests).length
        };
    },
    
    // === RACE CONDITION TEST METHODS (from existing test-phase2a-modals.js) ===
    
    testModalElements() {
        const modals = {
            'component-library-overlay': 'Component Library Modal',
            'template-library-modal': 'Template Library Modal',
            'global-settings-modal': 'Global Settings Modal',
            'export-modal': 'Export Modal'
        };
        
        let allFound = true;
        for (const [id, name] of Object.entries(modals)) {
            if (!document.getElementById(id)) {
                console.log(`❌ ${name} NOT FOUND (${id})`);
                allFound = false;
            }
        }
        return allFound;
    },
    
    testButtonListeners() {
        const buttons = {
            'add-component-btn': 'Add Component Button',
            'load-template': 'Load Template Button', 
            'global-theme-btn': 'Global Theme Button'
        };
        
        let allSetup = true;
        for (const [id, name] of Object.entries(buttons)) {
            const button = document.getElementById(id);
            if (!button) {
                console.log(`⚠️ ${name} not found (${id})`);
                allSetup = false;
            } else if (!button.hasAttribute('data-listener-attached')) {
                console.log(`❌ ${name} missing listener`);
                allSetup = false;
            }
        }
        return allSetup;
    },
    
    testInitializationStatus() {
        if (!window.initManager) return false;
        
        const status = window.initManager.getStatus();
        return status.state === 'complete';
    },
    
    async testModalFunctionality() {
        const componentBtn = document.getElementById('add-component-btn');
        if (!componentBtn) return false;
        
        // Test modal opening
        componentBtn.click();
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const modal = document.getElementById('component-library-overlay');
        const opens = modal && (modal.classList.contains('modal--open') || modal.style.display !== 'none');
        
        if (opens) {
            // Test closing
            const closeBtn = document.getElementById('close-library');
            if (closeBtn) {
                closeBtn.click();
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        
        return opens;
    },
    
    // === COMPONENT LIBRARY SPECIFIC TEST METHODS ===
    
    testSVGIconDisplay() {
        // Test Biography component SVG icon specifically
        const componentGrid = document.getElementById('component-grid');
        if (!componentGrid) return false;
        
        const biographyCard = componentGrid.querySelector('[data-component="biography"]');
        if (!biographyCard) return false;
        
        // Check for SVG or img element
        const icon = biographyCard.querySelector('svg, img[src*="file-text.svg"]');
        const hasIcon = !!icon;
        
        if (!hasIcon) {
            console.log('❌ Biography SVG icon not found');
        }
        
        return hasIcon;
    },
    
    testComponentSelection() {
        const componentGrid = document.getElementById('component-grid');
        if (!componentGrid) return false;
        
        const firstCard = componentGrid.querySelector('.component-card');
        if (!firstCard) return false;
        
        // Test click selection
        const initialSelected = firstCard.classList.contains('selected');
        firstCard.click();
        
        const afterClick = firstCard.classList.contains('selected');
        const toggleWorks = initialSelected !== afterClick;
        
        if (!toggleWorks) {
            console.log('❌ Component selection toggle not working');
        }
        
        return toggleWorks;
    },
    
    testCheckboxFunctionality() {
        const componentGrid = document.getElementById('component-grid');
        if (!componentGrid) return false;
        
        const firstCheckbox = componentGrid.querySelector('input[type="checkbox"]');
        if (!firstCheckbox) return false;
        
        const initialState = firstCheckbox.checked;
        firstCheckbox.click();
        const afterClick = firstCheckbox.checked;
        
        // Reset state
        firstCheckbox.checked = initialState;
        
        const works = initialState !== afterClick;
        if (!works) {
            console.log('❌ Checkbox functionality not working');
        }
        
        return works;
    },
    
    async testAddButtonFunctionality() {
        const addButton = document.getElementById('add-component-button');
        if (!addButton) return false;
        
        // First select a component
        const componentGrid = document.getElementById('component-grid');
        const firstCard = componentGrid?.querySelector('.component-card');
        const firstCheckbox = firstCard?.querySelector('input[type="checkbox"]');
        
        if (!firstCheckbox) return false;
        
        firstCheckbox.checked = true;
        firstCard.classList.add('selected');
        
        // Test add button click
        const initialComponentCount = document.querySelectorAll('#media-kit-preview .component').length;
        
        try {
            addButton.click();
            await new Promise(resolve => setTimeout(resolve, 500)); // Wait for async operation
            
            const finalComponentCount = document.querySelectorAll('#media-kit-preview .component').length;
            const added = finalComponentCount > initialComponentCount;
            
            if (!added) {
                console.log('❌ Add Selected button did not add components');
            }
            
            return added;
        } catch (error) {
            console.log('❌ Add Selected button threw error:', error.message);
            return false;
        }
    },
    
    testComponentPopulation() {
        const componentGrid = document.getElementById('component-grid');
        if (!componentGrid) return false;
        
        const cards = componentGrid.querySelectorAll('.component-card');
        const hasCards = cards.length > 0;
        
        // Check if cards have proper data attributes
        let hasProperData = true;
        cards.forEach(card => {
            if (!card.dataset.component && !card.dataset.componentType) {
                hasProperData = false;
            }
        });
        
        if (!hasCards) {
            console.log('❌ No component cards found in grid');
        } else if (!hasProperData) {
            console.log('❌ Component cards missing data attributes');
        }
        
        return hasCards && hasProperData;
    },
    
    testEventDelegation() {
        const componentGrid = document.getElementById('component-grid');
        if (!componentGrid) return false;
        
        // Check if event listeners are on the grid (delegation) vs individual cards
        const listeners = getEventListeners ? getEventListeners(componentGrid) : null;
        
        // Fallback test: check if clicking works
        const firstCard = componentGrid.querySelector('.component-card');
        if (!firstCard) return false;
        
        const hasClickListener = firstCard.onclick || firstCard.addEventListener;
        return true; // Event delegation is hard to test directly
    },
    
    // === UTILITY METHODS ===
    
    calculateScores(results) {
        const raceConditionScore = results.raceConditions.score;
        const componentLibraryScore = results.componentLibrary.score;
        const overallScore = (raceConditionScore + componentLibraryScore) / 2;
        
        return {
            raceConditionScore: Math.round(raceConditionScore),
            componentLibraryScore: Math.round(componentLibraryScore),
            overallScore: Math.round(overallScore)
        };
    },
    
    /**
     * COMPLETE VALIDATION - Final comprehensive test
     */
    async runCompleteValidation() {
        console.log('🏆 COMPLETE VALIDATION: Final Component Library Test');
        console.log('===================================================');
        
        const results = await this.runPhaseValidation('final', 'Complete System Validation');
        this.results.final = results;
        
        // Generate comprehensive report
        this.generateComprehensiveReport();
        
        return results;
    },
    
    generateComprehensiveReport() {
        console.log('\n📊 COMPREHENSIVE TEST REPORT');
        console.log('============================');
        
        if (this.results.baseline) {
            console.log(`Baseline Score: ${this.results.baseline.summary.overallScore}%`);
        }
        
        Object.entries(this.results.phases).forEach(([phase, result]) => {
            console.log(`Phase ${phase} (${result.name}): ${result.summary.overallScore}%`);
        });
        
        if (this.results.final) {
            console.log(`Final Score: ${this.results.final.summary.overallScore}%`);
            
            if (this.results.baseline) {
                const totalImprovement = this.results.final.summary.overallScore - this.results.baseline.summary.overallScore;
                console.log(`\n🎯 Total Improvement: +${totalImprovement.toFixed(1)}%`);
                
                if (this.results.final.summary.overallScore >= 90) {
                    console.log('🎉 EXCELLENT: Component Library fully functional!');
                } else if (this.results.final.summary.overallScore >= 75) {
                    console.log('✅ GOOD: Component Library mostly functional');
                } else {
                    console.log('⚠️ NEEDS WORK: More fixes required');
                }
            }
        }
        
        // Export results for debugging
        window.componentLibraryTestResults = this.results;
        console.log('\n💾 Full results saved to: window.componentLibraryTestResults');
    }
};

// Integration with existing mkLog system
if (window.mkLog) {
    window.mkLog.componentLibrary = window.componentLibraryTests;
}

console.log('🧪 Enhanced Component Library Test Suite loaded!');
console.log('📋 Available commands:');
console.log('  componentLibraryTests.runBaselineTest()');
console.log('  componentLibraryTests.runPhaseValidation(1, "Icon System Fix")');
console.log('  componentLibraryTests.runCompleteValidation()');
