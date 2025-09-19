/**
 * @file gmkb-diagnostic-ui.js
 * @description Diagnostic script to debug UI issues with tabs and modals
 * @version 1.0.0
 */

(function() {
    'use strict';
    
    console.log('=== GMKB UI Diagnostic Started ===');
    
    // Check for key UI elements
    const diagnostics = {
        // Modal elements
        globalSettingsModal: document.getElementById('global-settings-modal'),
        closeButton: document.querySelector('#close-global-settings, .modal__close'),
        globalThemeBtn: document.getElementById('global-theme-btn'),
        
        // Tab elements
        sidebarTabs: document.querySelector('.sidebar__tabs'),
        tabButtons: document.querySelectorAll('.sidebar__tab'),
        tabContents: document.querySelectorAll('.tab-content'),
        componentsTab: document.getElementById('components-tab'),
        designTab: document.getElementById('design-tab'),
        layoutTab: document.getElementById('layout-tab'),
        
        // System availability
        modalSystem: window.GMKB_Modals,
        tabsSystem: window.setupTabs || window.GMKBTabs,
        globalSettings: window.globalSettings || window.GMKBGlobalSettings
    };
    
    console.log('UI Elements Found:');
    Object.entries(diagnostics).forEach(([key, value]) => {
        if (value && value.nodeType) {
            console.log(`✅ ${key}: Found (${value.tagName || 'element'})`);
        } else if (value && value.length !== undefined) {
            console.log(`✅ ${key}: Found (${value.length} items)`);
        } else if (value) {
            console.log(`✅ ${key}: Available`);
        } else {
            console.log(`❌ ${key}: Not found`);
        }
    });
    
    // Test modal functionality
    if (diagnostics.globalThemeBtn && diagnostics.globalSettingsModal) {
        console.log('\n🧪 Testing modal functionality...');
        
        // Check if modal can be shown
        if (window.GMKB_Modals && window.GMKB_Modals.show) {
            console.log('✅ Modal system available, can show modals');
        } else {
            console.log('❌ Modal system not properly initialized');
        }
        
        // Check close button
        if (diagnostics.closeButton) {
            const events = getEventListeners ? getEventListeners(diagnostics.closeButton) : null;
            if (events && events.click) {
                console.log('✅ Close button has click listeners:', events.click.length);
            } else {
                console.log('⚠️ Close button may not have event listeners attached');
            }
        }
    }
    
    // Test tab functionality
    if (diagnostics.tabButtons.length > 0) {
        console.log('\n🧪 Testing tab functionality...');
        
        diagnostics.tabButtons.forEach((tab, index) => {
            const tabName = tab.getAttribute('data-tab');
            const isActive = tab.classList.contains('sidebar__tab--active');
            console.log(`Tab ${index + 1}: ${tabName} ${isActive ? '(active)' : ''}`);
            
            // Check if corresponding content exists
            const content = document.getElementById(`${tabName}-tab`);
            if (content) {
                console.log(`  ✅ Content found: #${tabName}-tab`);
            } else {
                console.log(`  ❌ Content not found: #${tabName}-tab`);
            }
        });
    }
    
    // Manual fix functions
    window.GMKBDiagnostic = {
        // Force initialize tabs
        initTabs: function() {
            if (window.setupTabs) {
                window.setupTabs();
                console.log('✅ Tabs re-initialized');
            } else {
                console.log('❌ setupTabs function not available');
            }
        },
        
        // Force initialize global settings
        initGlobalSettings: function() {
            if (window.globalSettings && window.globalSettings.init) {
                window.globalSettings.init().then(() => {
                    console.log('✅ Global settings re-initialized');
                });
            } else {
                console.log('❌ Global settings not available');
            }
        },
        
        // Test modal open/close
        testModal: function() {
            const modal = document.getElementById('global-settings-modal');
            if (modal && window.GMKB_Modals) {
                console.log('Opening modal...');
                window.GMKB_Modals.show('global-settings-modal');
                
                setTimeout(() => {
                    console.log('Closing modal...');
                    window.GMKB_Modals.hide('global-settings-modal');
                }, 2000);
            }
        },
        
        // Test tab switching
        testTabs: function() {
            const tabs = ['components', 'design', 'layout'];
            let index = 0;
            
            const switchTab = () => {
                const tabName = tabs[index % tabs.length];
                const tabButton = document.querySelector(`[data-tab="${tabName}"]`);
                
                if (tabButton) {
                    console.log(`Switching to ${tabName} tab...`);
                    tabButton.click();
                    index++;
                    
                    if (index < tabs.length) {
                        setTimeout(switchTab, 1000);
                    }
                }
            };
            
            switchTab();
        },
        
        // Force re-attach all event listeners
        reattachEvents: function() {
            this.initTabs();
            this.initGlobalSettings();
            console.log('✅ Event listeners re-attached');
        }
    };
    
    console.log('\n📋 Available diagnostic commands:');
    console.log('- GMKBDiagnostic.initTabs() - Re-initialize tabs');
    console.log('- GMKBDiagnostic.initGlobalSettings() - Re-initialize global settings');
    console.log('- GMKBDiagnostic.testModal() - Test modal open/close');
    console.log('- GMKBDiagnostic.testTabs() - Test tab switching');
    console.log('- GMKBDiagnostic.reattachEvents() - Re-attach all event listeners');
    
    console.log('=== GMKB UI Diagnostic Complete ===');
})();
