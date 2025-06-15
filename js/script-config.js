/**
 * Script configuration and enqueueing for Guestify Media Kit Builder
 * This file defines which scripts to load and their dependencies
 */

// Wait for the ScriptLoader class to be available
document.addEventListener('DOMContentLoaded', () => {
    // Create a new loader instance
    const loader = new ScriptLoader();
    
    // Utility scripts (no dependencies)
    loader.enqueue('js/utils/helpers.js', [], true);
    
    // Core state management
    loader.enqueue('js/state.js', ['js/utils/helpers.js'], true);
    
    // UI modules
    loader.enqueue('js/ui/tabs.js', ['js/state.js'], true);
    loader.enqueue('js/ui/preview.js', ['js/state.js'], true);
    loader.enqueue('js/ui/form-controls.js', ['js/state.js', 'js/utils/helpers.js'], true);
    loader.enqueue('js/ui/layout.js', ['js/state.js'], true);
    
    // Basic services
    loader.enqueue('js/services/save-service.js', ['js/state.js'], true);
    loader.enqueue('js/services/share-service.js', [], true);
    
    // Modal base functionality
    loader.enqueue('js/modals/modal-base.js', [], true);
    
    // UI modules with dependencies
    loader.enqueue('js/ui/element-editor.js', [
        'js/state.js',
        'js/services/save-service.js'
    ], true);
    
    // Services with dependencies
    loader.enqueue('js/services/history-service.js', [
        'js/state.js', 
        'js/services/save-service.js', 
        'js/ui/element-editor.js'
    ], true);
    
    // Component management
    loader.enqueue('js/components/component-manager.js', ['js/ui/element-editor.js'], true);
    
    // Modal implementations
    loader.enqueue('js/modals/global-settings.js', [
        'js/modals/modal-base.js', 
        'js/state.js', 
        'js/services/save-service.js'
    ], true);
    
    loader.enqueue('js/modals/export.js', ['js/modals/modal-base.js'], true);
    
    loader.enqueue('js/modals/component-library.js', [
        'js/modals/modal-base.js',
        'js/utils/helpers.js',
        'js/components/component-manager.js',
        'js/services/save-service.js',
        'js/services/history-service.js'
    ], true);
    
    // Complex UI module with many dependencies
    loader.enqueue('js/ui/dnd.js', [
        'js/state.js',
        'js/services/save-service.js',
        'js/services/history-service.js',
        'js/components/component-manager.js',
        'js/utils/helpers.js',
        'js/modals/component-library.js'
    ], true);
    
    // Keyboard service
    loader.enqueue('js/services/keyboard-service.js', [
        'js/services/save-service.js',
        'js/services/history-service.js',
        'js/modals/export.js',
        'js/ui/element-editor.js',
        'js/state.js'
    ], true);
    
    // Main application entry point - depends on everything
    loader.enqueue('js/main.js', [
        'js/state.js',
        'js/ui/tabs.js',
        'js/ui/preview.js',
        'js/ui/dnd.js',
        'js/ui/element-editor.js',
        'js/ui/form-controls.js',
        'js/ui/layout.js',
        'js/services/save-service.js',
        'js/services/keyboard-service.js',
        'js/modals/component-library.js',
        'js/modals/global-settings.js',
        'js/modals/export.js',
        'js/services/share-service.js',
        'js/services/history-service.js'
    ], true);
    
    // Start loading all scripts
    loader.loadScripts();
});
