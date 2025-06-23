/**
 * FIXED EMERGENCY PHASE 3 SYSTEM LOADER
 * This version fixes circular dependency issues
 * Run this script in browser console after fixing circular dependencies
 */

console.log('%c🚀 FIXED Emergency Phase 3 System Loader', 'font-size: 16px; font-weight: bold; color: #4CAF50');
console.log('===============================================\n');

async function fixedEmergencyLoadPhase3Systems() {
    console.log('🔧 Loading Phase 3 systems with circular dependency fixes...');
    
    const timestamp = Date.now();
    const baseUrl = window.guestifyData?.pluginUrl || '';
    
    try {
        // Load in specific order to avoid circular dependencies
        console.log('📦 Step 1: Loading enhanced state manager first...');
        const enhancedStateModule = await import(`${baseUrl}js/core/enhanced-state-manager.js?t=${timestamp}`);
        window.enhancedStateManager = enhancedStateModule.enhancedStateManager;
        console.log('✅ Enhanced state manager loaded');
        
        console.log('📦 Step 2: Loading state validator...');
        const stateValidatorModule = await import(`${baseUrl}js/core/state-validator.js?t=${timestamp}`);
        window.stateValidator = stateValidatorModule.stateValidator;
        console.log('✅ State validator loaded');
        
        console.log('📦 Step 3: Loading UI registry...');
        const uiRegistryModule = await import(`${baseUrl}js/core/ui-registry.js?t=${timestamp}`);
        window.uiRegistry = uiRegistryModule.uiRegistry;
        console.log('✅ UI registry loaded');
        
        console.log('📦 Step 4: Loading state history...');
        const stateHistoryModule = await import(`${baseUrl}js/core/state-history.js?t=${timestamp}`);
        window.stateHistory = stateHistoryModule.stateHistory;
        console.log('✅ State history loaded');
        
        console.log('📦 Step 5: Loading save service...');
        const saveServiceModule = await import(`${baseUrl}js/services/save-service.js?t=${timestamp}`);
        window.saveService = saveServiceModule.saveService;
        console.log('✅ Save service loaded');
        
        // Setup keyboard shortcuts
        setupFixedKeyboardShortcuts();
        
        // Verify all systems loaded
        const loadedSystems = {
            enhancedStateManager: !!window.enhancedStateManager && typeof window.enhancedStateManager.getState === 'function',
            stateValidator: !!window.stateValidator && typeof window.stateValidator.validateState === 'function',
            uiRegistry: !!window.uiRegistry && typeof window.uiRegistry.register === 'function',
            stateHistory: !!window.stateHistory && typeof window.stateHistory.undo === 'function',
            saveService: !!window.saveService && typeof window.saveService.saveState === 'function',
            eventBus: !!window.eventBus && typeof window.eventBus.emit === 'function'
        };
        
        console.log('📊 Fixed emergency load results:');
        console.table(loadedSystems);
        
        const successCount = Object.values(loadedSystems).filter(Boolean).length;
        console.log(`✅ Successfully loaded ${successCount}/6 Phase 3 systems`);
        
        // Test basic functionality
        console.log('\n🧪 Testing basic functionality...');
        
        // Test state manager
        if (window.enhancedStateManager) {
            try {
                const state = window.enhancedStateManager.getState();
                console.log('✅ State manager test: Can get state -', typeof state === 'object');
            } catch (error) {
                console.log('❌ State manager test failed:', error.message);
            }
        }
        
        // Test state validator
        if (window.stateValidator) {
            try {
                const stats = window.stateValidator.getStats();
                console.log('✅ State validator test: Can get stats -', typeof stats === 'object');
            } catch (error) {
                console.log('❌ State validator test failed:', error.message);
            }
        }
        
        // Test state history
        if (window.stateHistory) {
            try {
                const canUndo = window.stateHistory.canUndo();
                console.log('✅ State history test: Can check undo -', typeof canUndo === 'boolean');
            } catch (error) {
                console.log('❌ State history test failed:', error.message);
            }
        }
        
        if (successCount >= 5) {
            console.log('\n🎉 Fixed emergency load successful! Re-run the Phase 3 validation test.');
            
            // Show quick test commands
            console.log('\n⚡ Quick test commands to verify functionality:');
            console.log('window.enhancedStateManager.getState()');
            console.log('window.stateValidator.getStats()');
            console.log('window.uiRegistry.getStats()');
            console.log('window.stateHistory.getStats()');
            console.log('window.saveService.getStats()');
            
        } else {
            console.log('⚠️ Some systems still failed to load. Check for remaining errors.');
        }
        
        return loadedSystems;
        
    } catch (error) {
        console.error('❌ Fixed emergency load failed:', error);
        console.log('🔍 Error details:', {
            message: error.message,
            stack: error.stack?.split('\n')[0],
            baseUrl
        });
        
        console.log('\n💡 If this still fails, the circular dependency fixes may not have taken effect.');
        console.log('Try refreshing the page first (Ctrl+F5) then running this script again.');
    }
}

function setupFixedKeyboardShortcuts() {
    console.log('⌨️ Setting up fixed keyboard shortcuts...');
    
    // Remove any existing listeners first
    if (window.fixedKeyHandler) {
        document.removeEventListener('keydown', window.fixedKeyHandler);
    }
    
    // Add new listener
    window.fixedKeyHandler = (event) => {
        // Ctrl+Z (undo)
        if (event.ctrlKey && event.key === 'z' && !event.shiftKey) {
            event.preventDefault();
            if (window.stateHistory && window.stateHistory.canUndo()) {
                window.stateHistory.undo();
                console.log('↩️ Fixed undo triggered');
            } else {
                console.log('❌ Undo not available or state history not loaded');
            }
        }
        
        // Ctrl+Y (redo)
        if ((event.ctrlKey && event.key === 'y') || 
            (event.ctrlKey && event.shiftKey && event.key === 'z')) {
            event.preventDefault();
            if (window.stateHistory && window.stateHistory.canRedo()) {
                window.stateHistory.redo();
                console.log('↪️ Fixed redo triggered');
            } else {
                console.log('❌ Redo not available or state history not loaded');
            }
        }
        
        // Ctrl+S (save)
        if (event.ctrlKey && event.key === 's') {
            event.preventDefault();
            if (window.saveService && window.saveService.saveState) {
                window.saveService.saveState();
                console.log('💾 Fixed save triggered');
            } else {
                console.log('❌ Save service not available');
            }
        }
    };
    
    document.addEventListener('keydown', window.fixedKeyHandler);
    console.log('✅ Fixed keyboard shortcuts active');
}

// Auto-run the fixed emergency loader
fixedEmergencyLoadPhase3Systems().then(results => {
    window.fixedEmergencyLoadResults = results;
    
    console.log('\n📋 NEXT STEPS:');
    console.log('1. ✅ Systems loaded - now test them');
    console.log('2. 🧪 Run the Phase 3 validation test script again');
    console.log('3. 🎯 Expected result: 10/10 tests should now pass');
    console.log('\n💡 If tests still fail, check for specific error messages in the validation output.');
});
