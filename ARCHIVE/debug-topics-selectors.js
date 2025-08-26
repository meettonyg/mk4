/**
 * Debug script to find actual topics selectors
 */

(function() {
    'use strict';
    
    console.log('🔍 DEBUGGING: Finding actual topics selectors...');
    
    function findTopicsElements() {
        console.log('🔍 === TOPICS SELECTOR DEBUG ===');
        
        // Find all possible sidebar inputs
        const potentialSidebarSelectors = [
            'input[data-property*="topic"]',
            'textarea[data-property*="topic"]', 
            'input[name*="topic"]',
            'textarea[name*="topic"]',
            '.topics-sidebar input',
            '.topics-sidebar textarea',
            '.design-panel input[data-property*="topic"]',
            '.design-panel textarea[data-property*="topic"]',
            '#design-panel input[data-property*="topic"]',
            '#design-panel textarea[data-property*="topic"]',
            '.sidebar input[data-property*="topic"]',
            '.sidebar textarea[data-property*="topic"]'
        ];
        
        console.log('🔍 SEARCHING FOR SIDEBAR INPUTS:');
        potentialSidebarSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                console.log(`✅ FOUND: ${selector} (${elements.length} elements)`);
                elements.forEach((el, i) => {
                    console.log(`  Element ${i+1}:`, el, {
                        id: el.id,
                        className: el.className,
                        name: el.name,
                        dataProperty: el.dataset.property,
                        value: el.value
                    });
                });
            } else {
                console.log(`❌ NOT FOUND: ${selector}`);
            }
        });
        
        // Find all possible preview elements
        const potentialPreviewSelectors = [
            '.topic-title',
            '.topic-item .topic-title',
            '.topics-container .topic-title',
            '[data-topic-number]',
            '.topic-content .topic-title',
            '.content-section .topic-title',
            '[contenteditable="true"][data-topic-number]'
        ];
        
        console.log('\n🔍 SEARCHING FOR PREVIEW ELEMENTS:');
        potentialPreviewSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                console.log(`✅ FOUND: ${selector} (${elements.length} elements)`);
                elements.forEach((el, i) => {
                    console.log(`  Element ${i+1}:`, el, {
                        id: el.id,
                        className: el.className,
                        textContent: el.textContent?.trim(),
                        contentEditable: el.contentEditable,
                        dataTopicNumber: el.dataset.topicNumber
                    });
                });
            } else {
                console.log(`❌ NOT FOUND: ${selector}`);
            }
        });
        
        // Find all contenteditable elements
        const allContentEditable = document.querySelectorAll('[contenteditable="true"]');
        console.log(`\n🔍 ALL CONTENTEDITABLE ELEMENTS: ${allContentEditable.length}`);
        allContentEditable.forEach((el, i) => {
            console.log(`  ${i+1}:`, el.tagName, el.className, el.textContent?.trim().substring(0, 50));
        });
        
        // Find design panel container
        const designPanels = [
            '.design-panel',
            '#design-panel', 
            '.sidebar',
            '#sidebar',
            '.panel-content',
            '.topics-panel'
        ];
        
        console.log('\n🔍 SEARCHING FOR DESIGN PANEL:');
        designPanels.forEach(selector => {
            const panel = document.querySelector(selector);
            if (panel) {
                console.log(`✅ FOUND PANEL: ${selector}`, panel);
                const inputs = panel.querySelectorAll('input, textarea, [contenteditable]');
                console.log(`  Contains ${inputs.length} input elements`);
                inputs.forEach((input, i) => {
                    console.log(`    Input ${i+1}:`, input.tagName, input.className, input.name || input.dataset.property);
                });
            } else {
                console.log(`❌ NO PANEL: ${selector}`);
            }
        });
    }
    
    // Run immediately if DOM is ready
    if (document.readyState !== 'loading') {
        findTopicsElements();
    } else {
        document.addEventListener('DOMContentLoaded', findTopicsElements);
    }
    
    // Also run after component rendering  
    document.addEventListener('gmkb:application-ready', () => {
        console.log('🔍 RE-RUNNING AFTER GMKB READY...');
        setTimeout(findTopicsElements, 1000);
    });
    
    // Export for manual use
    window.debugTopicsSelectors = findTopicsElements;
    
    console.log('🔍 Debug script loaded. Run debugTopicsSelectors() manually anytime.');
    
})();
