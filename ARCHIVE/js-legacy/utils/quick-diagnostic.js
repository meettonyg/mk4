/**
 * Quick Diagnostic Tool
 * Always available diagnostic functions for the Media Kit Builder
 * 
 * @version 1.0.0
 */
(function() {
    'use strict';
    
    // Quick diagnostic function that's always available
    window.runQuickDiagnostic = function() {
        console.log('\n🔍 Quick System Diagnostic\n');
        console.log('='.repeat(60));
        
        const checks = {
            'GMKB System': !!window.GMKB,
            'State Manager': !!window.enhancedStateManager,
            'Component Manager': !!window.enhancedComponentManager,
            'Component Renderer': !!window.enhancedComponentRenderer,
            'Controls Manager': !!window.componentControlsManager,
            'Modal System': !!window.GMKB_Modals,
            'Event Bus': !!window.eventBus,
            'Template Cache': !!window.templateCache,
            'Section Manager': !!window.sectionLayoutManager,
            'Section Renderer': !!window.sectionRenderer,
            'Configuration Manager': !!window.componentConfigurationManager,
            'Data Binding Engine': !!window.dataBindingEngine
        };
        
        let passCount = 0;
        let totalCount = 0;
        
        for (const [system, status] of Object.entries(checks)) {
            console.log(`${status ? '✅' : '❌'} ${system}: ${status ? 'Ready' : 'Not Found'}`);
            if (status) passCount++;
            totalCount++;
        }
        
        console.log('='.repeat(60));
        console.log(`System Health: ${Math.round((passCount / totalCount) * 100)}%`);
        
        // Check current state
        const state = window.enhancedStateManager?.getState();
        if (state) {
            console.log(`\n📊 Current State:`);
            console.log(`  Components: ${state.components?.length || 0}`);
            console.log(`  Sections: ${state.sections?.length || 0}`);
            console.log(`  Last Save: ${state.lastSaved || 'Never'}`);
            console.log(`  Debug Mode: ${window.gmkbData?.debugMode ? 'ON' : 'OFF'}`);
        }
        
        // Check WordPress data
        if (window.gmkbData) {
            console.log(`\n📦 WordPress Data:`);
            console.log(`  Post ID: ${window.gmkbData.postId || 'None'}`);
            console.log(`  Components Available: ${window.gmkbData.components?.length || 0}`);
            console.log(`  Schemas Loaded: ${Object.keys(window.gmkbData.componentSchemas || {}).length}`);
            console.log(`  Ajax URL: ${window.gmkbData.ajaxUrl ? 'Set' : 'Missing'}`);
            console.log(`  Nonce: ${window.gmkbData.nonce ? 'Set' : 'Missing'}`);
        }
        
        console.log('='.repeat(60));
        
        return {
            systems: checks,
            health: Math.round((passCount / totalCount) * 100),
            state: state,
            wpData: window.gmkbData
        };
    };
    
    // Quick status check
    window.gmkbStatus = function() {
        const status = {
            ready: !!window.GMKB && !!window.enhancedStateManager,
            components: window.enhancedStateManager?.getState()?.components?.length || 0,
            sections: window.enhancedStateManager?.getState()?.sections?.length || 0
        };
        
        console.log(`GMKB Status: ${status.ready ? '✅ Ready' : '❌ Not Ready'} | Components: ${status.components} | Sections: ${status.sections}`);
        return status;
    };
    
    // List all available global GMKB objects
    window.gmkbGlobals = function() {
        console.log('\n🌍 GMKB Global Objects:\n');
        console.log('='.repeat(60));
        
        const globals = [];
        for (const key in window) {
            if (key.toLowerCase().includes('gmkb') || 
                key.toLowerCase().includes('enhanced') ||
                key.toLowerCase().includes('component') ||
                key.toLowerCase().includes('section')) {
                if (typeof window[key] !== 'undefined' && window[key] !== null) {
                    globals.push(key);
                }
            }
        }
        
        globals.sort().forEach(key => {
            const type = typeof window[key];
            const isFunction = type === 'function';
            const isObject = type === 'object';
            console.log(`  ${isFunction ? '🔧' : isObject ? '📦' : '📝'} window.${key} (${type})`);
        });
        
        console.log('='.repeat(60));
        console.log(`Total: ${globals.length} global objects`);
        
        return globals;
    };
    
    // Test component operations
    window.testComponentOps = function() {
        console.log('\n🧪 Testing Component Operations:\n');
        console.log('='.repeat(60));
        
        const tests = {
            'State Manager': !!window.enhancedStateManager?.getState,
            'Add Component': !!window.enhancedComponentManager?.addComponent,
            'Remove Component': !!window.enhancedComponentManager?.removeComponent,
            'Duplicate Component': !!window.enhancedComponentManager?.duplicateComponent,
            'Move Component': !!window.enhancedStateManager?.moveComponent,
            'Save State': !!window.enhancedComponentManager?.autoSaveState,
            'Undo/Redo': !!window.stateHistory?.undo && !!window.stateHistory?.redo
        };
        
        for (const [operation, available] of Object.entries(tests)) {
            console.log(`  ${available ? '✅' : '❌'} ${operation}: ${available ? 'Available' : 'Not Found'}`);
        }
        
        console.log('='.repeat(60));
        
        return tests;
    };
    
    // Test section operations
    window.testSectionOps = function() {
        console.log('\n🏗️ Testing Section Operations:\n');
        console.log('='.repeat(60));
        
        const tests = {
            'Section Manager': !!window.sectionLayoutManager,
            'Create Section': !!window.sectionLayoutManager?.createSection,
            'Delete Section': !!window.sectionLayoutManager?.deleteSection,
            'Update Section': !!window.sectionLayoutManager?.updateSection,
            'Section Renderer': !!window.sectionRenderer,
            'Render Sections': !!window.sectionRenderer?.renderSections
        };
        
        for (const [operation, available] of Object.entries(tests)) {
            console.log(`  ${available ? '✅' : '❌'} ${operation}: ${available ? 'Available' : 'Not Found'}`);
        }
        
        console.log('='.repeat(60));
        
        return tests;
    };
    
    // Create a test component
    window.createTestComponent = function(type = 'hero') {
        if (!window.enhancedComponentManager) {
            console.error('❌ Component Manager not available');
            return false;
        }
        
        const testComponent = {
            type: type,
            props: {
                title: 'Test Component',
                subtitle: 'Created by diagnostic tool',
                description: 'This is a test component'
            }
        };
        
        try {
            window.enhancedComponentManager.addComponent(testComponent);
            console.log(`✅ Test ${type} component created`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to create test component:`, error);
            return false;
        }
    };
    
    // Create a test section
    window.createTestSection = function(type = 'full_width') {
        if (!window.sectionLayoutManager) {
            console.error('❌ Section Manager not available');
            return false;
        }
        
        try {
            const section = window.sectionLayoutManager.createSection(type);
            console.log(`✅ Test ${type} section created:`, section);
            return section;
        } catch (error) {
            console.error(`❌ Failed to create test section:`, error);
            return false;
        }
    };
    
    // Clear all components
    window.clearAllComponents = function() {
        if (!window.enhancedStateManager) {
            console.error('❌ State Manager not available');
            return false;
        }
        
        try {
            window.enhancedStateManager.dispatch({
                type: 'CLEAR_ALL_COMPONENTS'
            });
            console.log('✅ All components cleared');
            return true;
        } catch (error) {
            console.error('❌ Failed to clear components:', error);
            return false;
        }
    };
    
    // Show help
    window.gmkbHelp = function() {
        console.log('\n📚 GMKB Diagnostic Commands:\n');
        console.log('='.repeat(60));
        console.log('  runQuickDiagnostic()  - Full system diagnostic');
        console.log('  gmkbStatus()          - Quick status check');
        console.log('  gmkbGlobals()         - List all GMKB globals');
        console.log('  testComponentOps()    - Test component operations');
        console.log('  testSectionOps()      - Test section operations');
        console.log('  createTestComponent() - Create a test component');
        console.log('  createTestSection()   - Create a test section');
        console.log('  clearAllComponents()  - Clear all components');
        console.log('  gmkbHelp()           - Show this help');
        console.log('='.repeat(60));
        console.log('\n🔧 Debug Mode Commands:');
        console.log('  window.gmkbData.debugMode = true  - Enable debug mode');
        console.log('  window.gmkbData.debugMode = false - Disable debug mode');
        console.log('='.repeat(60));
        console.log('\n🌐 URL Parameters:');
        console.log('  ?load_tests=1    - Load test suite');
        console.log('  ?debug_mode=full - Load all debug scripts');
        console.log('  ?debug_extra=1   - Load extra debug tools');
        console.log('='.repeat(60));
    };
    
    // Auto-run status on load if debug mode
    if (window.gmkbData?.debugMode) {
        console.log('✅ Quick Diagnostic loaded - Type gmkbHelp() for available commands');
    }
    
})();