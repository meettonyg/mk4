/**
 * EMERGENCY PHASE 3 SYSTEM LOADER
 * Run this script in browser console to force-load all Phase 3 systems
 * This bypasses any caching or import issues
 */

console.log('%c🚀 Emergency Phase 3 System Loader', 'font-size: 16px; font-weight: bold; color: #4CAF50');
console.log('=====================================\n');

async function emergencyLoadPhase3Systems() {
    console.log('🔧 Force-loading Phase 3 systems with cache busting...');
    
    const timestamp = Date.now();
    const baseUrl = window.guestifyData?.pluginUrl || '';
    
    try {
        // Load all Phase 3 modules with cache busting
        console.log('📦 Loading state validator...');
        const stateValidatorModule = await import(`${baseUrl}js/core/state-validator.js?t=${timestamp}`);
        window.stateValidator = stateValidatorModule.stateValidator;
        
        console.log('📦 Loading UI registry...');
        const uiRegistryModule = await import(`${baseUrl}js/core/ui-registry.js?t=${timestamp}`);
        window.uiRegistry = uiRegistryModule.uiRegistry;
        
        console.log('📦 Loading state history...');
        const stateHistoryModule = await import(`${baseUrl}js/core/state-history.js?t=${timestamp}`);
        window.stateHistory = stateHistoryModule.stateHistory;
        
        console.log('📦 Loading enhanced state manager...');
        const enhancedStateModule = await import(`${baseUrl}js/core/enhanced-state-manager.js?t=${timestamp}`);
        window.enhancedStateManager = enhancedStateModule.enhancedStateManager;
        
        console.log('📦 Loading save service...');
        const saveServiceModule = await import(`${baseUrl}js/services/save-service.js?t=${timestamp}`);
        window.saveService = saveServiceModule.saveService;
        
        // Setup keyboard shortcuts
        setupEmergencyKeyboardShortcuts();
        
        // Verify all systems loaded
        const loadedSystems = {
            stateValidator: !!window.stateValidator,
            uiRegistry: !!window.uiRegistry,
            stateHistory: !!window.stateHistory,
            enhancedStateManager: !!window.enhancedStateManager,
            saveService: !!window.saveService,
            eventBus: !!window.eventBus
        };
        
        console.log('📊 Emergency load results:');
        console.table(loadedSystems);
        
        const successCount = Object.values(loadedSystems).filter(Boolean).length;
        console.log(`✅ Successfully loaded ${successCount}/6 Phase 3 systems`);
        
        if (successCount >= 5) {
            console.log('🎉 Emergency load successful! Re-run the Phase 3 validation test.');
        } else {
            console.log('⚠️ Some systems still failed to load. Check for JavaScript errors.');
        }
        
        return loadedSystems;
        
    } catch (error) {
        console.error('❌ Emergency load failed:', error);
        console.log('🔍 Check:');
        console.log('1. Plugin URL:', baseUrl);
        console.log('2. Network tab for failed requests');
        console.log('3. Console for JavaScript errors');
    }
}

function setupEmergencyKeyboardShortcuts() {
    console.log('⌨️ Setting up emergency keyboard shortcuts...');
    
    // Remove any existing listeners first
    document.removeEventListener('keydown', window.emergencyKeyHandler);
    
    // Add new listener
    window.emergencyKeyHandler = (event) => {
        // Ctrl+Z (undo)
        if (event.ctrlKey && event.key === 'z' && !event.shiftKey) {
            event.preventDefault();
            if (window.stateHistory && window.stateHistory.canUndo()) {
                window.stateHistory.undo();
                console.log('↩️ Emergency undo triggered');
            } else {
                console.log('❌ Undo not available');
            }
        }
        
        // Ctrl+Y (redo)
        if ((event.ctrlKey && event.key === 'y') || 
            (event.ctrlKey && event.shiftKey && event.key === 'z')) {
            event.preventDefault();
            if (window.stateHistory && window.stateHistory.canRedo()) {
                window.stateHistory.redo();
                console.log('↪️ Emergency redo triggered');
            } else {
                console.log('❌ Redo not available');
            }
        }
        
        // Ctrl+S (save)
        if (event.ctrlKey && event.key === 's') {
            event.preventDefault();
            if (window.saveService && window.saveService.saveState) {
                window.saveService.saveState();
                console.log('💾 Emergency save triggered');
            } else {
                console.log('❌ Save service not available');
            }
        }
    };
    
    document.addEventListener('keydown', window.emergencyKeyHandler);
    console.log('✅ Emergency keyboard shortcuts active');
}

// Auto-run the emergency loader
emergencyLoadPhase3Systems().then(results => {
    window.emergencyLoadResults = results;
    
    console.log('\n🧪 Ready for testing!');
    console.log('Now run the Phase 3 validation test again...');
    
    // Provide quick test commands
    console.log('\n⚡ Quick test commands:');
    console.log('window.stateValidator?.getStats()');
    console.log('window.uiRegistry?.getStats()');
    console.log('window.stateHistory?.getStats()');
    console.log('window.enhancedStateManager?.getState()');
});
