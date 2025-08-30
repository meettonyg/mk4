/**
 * GMKB Test Cleanup Script
 * Comprehensive cleanup utilities for test artifacts
 */

if (typeof GMKBTest === 'undefined') {
    console.error('❌ GMKBTest harness not loaded. Please load console-test-suite.js first.');
} else {
    
    /**
     * Enhanced cleanup functionality
     */
    GMKBTest.cleanup = function(options = {}) {
        const {
            removeTestComponents = true,
            closeModals = true,
            closePanels = true,
            resetViewport = true,
            clearSnapshots = false,
            resetState = false,
            verbose = true
        } = options;
        
        if (verbose) console.log('🧹 Starting comprehensive cleanup...');
        
        let cleaned = {
            testComponents: 0,
            modals: 0,
            panels: 0,
            snapshots: 0,
            errors: []
        };
        
        try {
            // Step 1: Remove test components
            if (removeTestComponents) {
                if (verbose) console.log('  🗑️ Removing test components...');
                
                const testSelectors = [
                    '[data-component-id^="test-"]',
                    '[data-component-id*="Test"]',
                    '[data-component-id*="A1"]',
                    '[data-component-id*="A2"]',
                    '[data-component-id*="A3"]',
                    '[data-component-id*="A4"]',
                    '[data-component-id*="A5"]',
                    '[data-component-id*="A6"]',
                    '[data-component-id*="B1"]',
                    '[data-component-id*="B2"]',
                    '[data-component-id*="B3"]'
                ];
                
                testSelectors.forEach(selector => {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(el => {
                        try {
                            // Try to remove via state manager first
                            const componentId = el.dataset.componentId;
                            if (window.enhancedComponentManager?.removeComponent) {
                                window.enhancedComponentManager.removeComponent(componentId);
                            } else {
                                // Fallback to DOM removal
                                el.remove();
                            }
                            cleaned.testComponents++;
                        } catch (error) {
                            cleaned.errors.push(`Failed to remove component: ${error.message}`);
                        }
                    });
                });
                
                if (verbose) console.log(`    ✅ Removed ${cleaned.testComponents} test components`);
            }
            
            // Step 2: Close modals
            if (closeModals) {
                if (verbose) console.log('  🚪 Closing modals...');
                
                const modalSelectors = [
                    '.modal.show',
                    '.modal[style*="display: block"]',
                    '.modal[style*="display:block"]',
                    '[data-modal].show',
                    '#component-library-modal',
                    '#template-library-modal',
                    '#export-modal',
                    '#global-settings-modal'
                ];
                
                modalSelectors.forEach(selector => {
                    const modals = document.querySelectorAll(selector);
                    modals.forEach(modal => {
                        try {
                            modal.style.display = 'none';
                            modal.classList.remove('show', 'active');
                            modal.setAttribute('aria-hidden', 'true');
                            cleaned.modals++;
                        } catch (error) {
                            cleaned.errors.push(`Failed to close modal: ${error.message}`);
                        }
                    });
                });
                
                // Remove modal backdrops
                const backdrops = document.querySelectorAll('.modal-backdrop, .backdrop');
                backdrops.forEach(backdrop => {
                    try {
                        backdrop.remove();
                    } catch (error) {
                        cleaned.errors.push(`Failed to remove backdrop: ${error.message}`);
                    }
                });
                
                if (verbose) console.log(`    ✅ Closed ${cleaned.modals} modals`);
            }
            
            // Step 3: Close panels
            if (closePanels) {
                if (verbose) console.log('  📋 Closing panels...');
                
                const panelSelectors = [
                    '.design-panel.open',
                    '.design-panel.show',
                    '.element-editor.show',
                    '.element-editor.active',
                    '.sidebar-panel.open',
                    '.right-panel.open'
                ];
                
                panelSelectors.forEach(selector => {
                    const panels = document.querySelectorAll(selector);
                    panels.forEach(panel => {
                        try {
                            panel.classList.remove('open', 'show', 'active');
                            panel.style.display = '';
                            cleaned.panels++;
                        } catch (error) {
                            cleaned.errors.push(`Failed to close panel: ${error.message}`);
                        }
                    });
                });
                
                if (verbose) console.log(`    ✅ Closed ${cleaned.panels} panels`);
            }
            
            // Step 4: Reset viewport
            if (resetViewport) {
                if (verbose) console.log('  📱 Resetting viewport...');
                
                try {
                    const builderRoot = document.querySelector(GMKBTest.selectors.builderRoot);
                    if (builderRoot) {
                        // Remove device classes
                        builderRoot.classList.remove('device-mobile', 'device-tablet', 'device-desktop');
                        builderRoot.classList.add('device-desktop'); // Default to desktop
                        
                        // Reset any inline styles that might affect viewport
                        builderRoot.style.width = '';
                        builderRoot.style.maxWidth = '';
                    }
                    
                    // Reset device toggle buttons
                    const deviceButtons = document.querySelectorAll('[data-device]');
                    deviceButtons.forEach(btn => {
                        btn.classList.remove('active');
                        if (btn.dataset.device === 'desktop') {
                            btn.classList.add('active');
                        }
                    });
                    
                    if (verbose) console.log('    ✅ Viewport reset to desktop');
                } catch (error) {
                    cleaned.errors.push(`Failed to reset viewport: ${error.message}`);
                }
            }
            
            // Step 5: Clear snapshots
            if (clearSnapshots) {
                if (verbose) console.log('  📸 Clearing snapshots...');
                
                try {
                    cleaned.snapshots = GMKBTest.state.snapshots.size;
                    GMKBTest.state.snapshots.clear();
                    
                    if (verbose) console.log(`    ✅ Cleared ${cleaned.snapshots} snapshots`);
                } catch (error) {
                    cleaned.errors.push(`Failed to clear snapshots: ${error.message}`);
                }
            }
            
            // Step 6: Reset state (careful!)
            if (resetState) {
                if (verbose) console.log('  ⚠️ Resetting state (caution: destructive)...');
                
                try {
                    if (window.enhancedStateManager && GMKBTest.state.snapshots.has('initial')) {
                        const initialSnapshot = GMKBTest.state.snapshots.get('initial');
                        // This is destructive - only do if explicitly requested
                        window.enhancedStateManager.setState(initialSnapshot);
                        if (verbose) console.log('    ✅ State reset to initial snapshot');
                    } else {
                        if (verbose) console.log('    ⚠️ Cannot reset state - no initial snapshot available');
                    }
                } catch (error) {
                    cleaned.errors.push(`Failed to reset state: ${error.message}`);
                }
            }
            
            // Step 7: Execute cleanup queue
            if (GMKBTest.state.cleanup.length > 0) {
                if (verbose) console.log(`  🔧 Executing ${GMKBTest.state.cleanup.length} cleanup functions...`);
                
                let executed = 0;
                GMKBTest.state.cleanup.forEach(cleanupFn => {
                    try {
                        cleanupFn();
                        executed++;
                    } catch (error) {
                        cleaned.errors.push(`Cleanup function failed: ${error.message}`);
                    }
                });
                
                GMKBTest.state.cleanup = [];
                if (verbose) console.log(`    ✅ Executed ${executed} cleanup functions`);
            }
            
            // Step 8: Clear debug classes
            if (verbose) console.log('  🐛 Removing debug classes...');
            
            try {
                document.body.classList.remove('gmkb-debug-mode', 'gmkb-test-mode');
                const debugElements = document.querySelectorAll('.test-highlight, .debug-outline');
                debugElements.forEach(el => {
                    el.classList.remove('test-highlight', 'debug-outline');
                });
                
                if (verbose) console.log('    ✅ Debug classes removed');
            } catch (error) {
                cleaned.errors.push(`Failed to remove debug classes: ${error.message}`);
            }
            
            // Step 9: Restore focus
            if (verbose) console.log('  🎯 Restoring focus...');
            
            try {
                // Remove focus from any active elements
                if (document.activeElement && document.activeElement !== document.body) {
                    document.activeElement.blur();
                }
                
                // Focus on body or main content area
                const mainContent = document.querySelector(GMKBTest.selectors.builderRoot) || document.body;
                mainContent.focus();
                
                if (verbose) console.log('    ✅ Focus restored');
            } catch (error) {
                cleaned.errors.push(`Failed to restore focus: ${error.message}`);
            }
            
        } catch (error) {
            cleaned.errors.push(`General cleanup error: ${error.message}`);
        }
        
        // Final summary
        if (verbose) {
            console.log('✅ Cleanup completed:');
            console.log(`  🗑️ Components removed: ${cleaned.testComponents}`);
            console.log(`  🚪 Modals closed: ${cleaned.modals}`);
            console.log(`  📋 Panels closed: ${cleaned.panels}`);
            if (clearSnapshots) console.log(`  📸 Snapshots cleared: ${cleaned.snapshots}`);
            
            if (cleaned.errors.length > 0) {
                console.log(`  ⚠️ Errors: ${cleaned.errors.length}`);
                cleaned.errors.forEach(error => console.log(`    - ${error}`));
            }
        }
        
        return cleaned;
    };
    
    /**
     * Quick cleanup presets
     */
    GMKBTest.quickCleanup = function() {
        return this.cleanup({
            removeTestComponents: true,
            closeModals: true,
            closePanels: true,
            resetViewport: true,
            clearSnapshots: false,
            resetState: false,
            verbose: false
        });
    };
    
    GMKBTest.deepCleanup = function() {
        return this.cleanup({
            removeTestComponents: true,
            closeModals: true,
            closePanels: true,
            resetViewport: true,
            clearSnapshots: true,
            resetState: false, // Still dangerous
            verbose: true
        });
    };
    
    GMKBTest.resetAll = function() {
        console.warn('⚠️ DESTRUCTIVE: This will reset all state. Are you sure?');
        return this.cleanup({
            removeTestComponents: true,
            closeModals: true,
            closePanels: true,
            resetViewport: true,
            clearSnapshots: true,
            resetState: true,
            verbose: true
        });
    };
    
    /**
     * Cleanup on page unload (automatic)
     */
    window.addEventListener('beforeunload', () => {
        try {
            GMKBTest.quickCleanup();
        } catch (error) {
            console.log('Cleanup on unload failed:', error.message);
        }
    });
    
    console.log('✅ GMKB Test Cleanup utilities loaded');
    console.log('🧹 Use GMKBTest.cleanup() for full cleanup');
    console.log('⚡ Use GMKBTest.quickCleanup() for fast cleanup');
    console.log('🔥 Use GMKBTest.deepCleanup() for thorough cleanup');
    console.log('💀 Use GMKBTest.resetAll() for complete reset (destructive!)');
}
