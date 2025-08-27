/**
 * Test Script: Drag-Drop to Sections Fix Verification
 * Tests the fixes for drag-drop functionality between components and sections
 */

(function() {
    'use strict';
    
    const logger = window.StructuredLogger || console;
    
    window.testDragDropSectionFix = function() {
        logger.info('🧪 TESTING DRAG-DROP TO SECTIONS FIX...');
        logger.info('');
        
        // Test 1: Check section data attributes
        logger.info('1️⃣ Checking section data attributes...');
        const sections = document.querySelectorAll('.gmkb-section');
        
        if (sections.length === 0) {
            logger.warn('   ⚠️ No sections found. Create a section first.');
            return;
        }
        
        sections.forEach(section => {
            const datasetId = section.dataset.sectionId;
            const attrId = section.getAttribute('data-section-id');
            
            logger.info(`   Section found:`, {
                datasetId: datasetId,
                attributeId: attrId,
                hasId: !!(datasetId || attrId),
                element: section
            });
            
            if (!datasetId && !attrId) {
                logger.error(`   ❌ Section missing data-section-id attribute!`);
            } else {
                logger.info(`   ✅ Section has proper ID: ${datasetId || attrId}`);
            }
        });
        
        // Test 2: Check section columns
        logger.info('');
        logger.info('2️⃣ Checking section columns...');
        const columns = document.querySelectorAll('.gmkb-section__column, .gmkb-section__content');
        
        columns.forEach(column => {
            const columnNumber = column.dataset.column || column.getAttribute('data-column');
            const parent = column.closest('.gmkb-section');
            const parentId = parent?.dataset.sectionId || parent?.getAttribute('data-section-id');
            
            logger.info(`   Column in section ${parentId}:`, {
                columnNumber: columnNumber || 'default',
                className: column.className
            });
        });
        
        // Test 3: Check SectionLayoutManager availability
        logger.info('');
        logger.info('3️⃣ Checking SectionLayoutManager...');
        if (window.sectionLayoutManager) {
            const sections = window.sectionLayoutManager.getAllSections();
            logger.info(`   ✅ SectionLayoutManager available with ${sections.length} sections:`);
            sections.forEach(s => {
                logger.info(`      - ${s.section_id} (${s.section_type})`);
            });
        } else {
            logger.error('   ❌ SectionLayoutManager not available!');
        }
        
        // Test 4: Simulate drag-drop
        logger.info('');
        logger.info('4️⃣ Simulating drag-drop event...');
        
        const component = document.querySelector('[data-component-id]');
        const targetSection = document.querySelector('.gmkb-section');
        const targetColumn = targetSection?.querySelector('.gmkb-section__column, .gmkb-section__content');
        
        if (!component) {
            logger.warn('   ⚠️ No component found to test drag');
            return;
        }
        
        if (!targetSection || !targetColumn) {
            logger.warn('   ⚠️ No section/column found to test drop');
            return;
        }
        
        const componentId = component.dataset.componentId;
        const sectionId = targetSection.dataset.sectionId || targetSection.getAttribute('data-section-id');
        
        logger.info(`   Testing drag of ${componentId} to section ${sectionId}`);
        
        // Create mock drag event
        const dragStartEvent = new DragEvent('dragstart', {
            bubbles: true,
            cancelable: true
        });
        
        // Mock dataTransfer
        Object.defineProperty(dragStartEvent, 'dataTransfer', {
            value: {
                setData: function(type, value) {
                    logger.info(`      Mock: Setting drag data ${type} = ${value}`);
                },
                effectAllowed: 'move'
            },
            writable: false
        });
        
        component.dispatchEvent(dragStartEvent);
        
        // Create mock drop event
        const dropEvent = new DragEvent('drop', {
            bubbles: true,
            cancelable: true
        });
        
        Object.defineProperty(dropEvent, 'dataTransfer', {
            value: {
                getData: function(type) {
                    if (type === 'text/plain') return componentId;
                    if (type === 'component-type') return component.dataset.componentType;
                    return '';
                }
            },
            writable: false
        });
        
        // Dispatch drop on column
        targetColumn.dispatchEvent(dropEvent);
        
        logger.info('   ✅ Drag-drop events simulated - check console for handler output');
        
        // Test 5: Verify integration
        logger.info('');
        logger.info('5️⃣ Checking Section-Component Integration...');
        
        if (window.sectionComponentIntegration) {
            const debugInfo = window.sectionComponentIntegration.getDebugInfo();
            logger.info('   ✅ Integration active:', debugInfo);
        } else {
            logger.error('   ❌ Section-Component Integration not loaded!');
        }
        
        logger.info('');
        logger.info('📊 TEST COMPLETE');
        logger.info('✅ The fixes should now allow drag-drop to sections');
        logger.info('💡 Try dragging a component to a section column now!');
    };
    
    // Auto-run test after delay
    setTimeout(() => {
        if (window.location.search.includes('debug=true')) {
            logger.info('🔧 Debug mode - running drag-drop section fix test...');
            window.testDragDropSectionFix();
        }
    }, 3000);
    
    logger.info('✅ Drag-Drop Section Fix Test Script loaded');
    logger.info('💡 Run testDragDropSectionFix() to test the fix');
    
})();