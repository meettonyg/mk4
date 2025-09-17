/**
 * Comprehensive Save/Load Test Suite for Media Kit Builder
 * 
 * This script provides all the tools needed to diagnose and verify
 * the component persistence fix.
 */

(function() {
  'use strict';
  
  // Color codes for console output
  const colors = {
    success: 'color: #10b981; font-weight: bold;',
    error: 'color: #ef4444; font-weight: bold;',
    info: 'color: #3b82f6; font-weight: bold;',
    warning: 'color: #f59e0b; font-weight: bold;'
  };
  
  // Test Suite Object
  window.GMKBTestSuite = {
    
    /**
     * Run all diagnostics
     */
    runFullDiagnostic: async function() {
      console.log('%c=== GMKB Full Diagnostic Starting ===', colors.info);
      
      // 1. Check current state
      this.checkCurrentState();
      
      // 2. Test save functionality
      await this.testSave();
      
      // 3. Inspect database
      await this.inspectDatabase();
      
      // 4. Check for common issues
      this.checkCommonIssues();
      
      console.log('%c=== Diagnostic Complete ===', colors.info);
      console.log('Next step: Refresh the page and run GMKBTestSuite.verifyAfterReload()');
    },
    
    /**
     * Check current state
     */
    checkCurrentState: function() {
      console.log('%c\n📊 Checking Current State...', colors.info);
      
      const state = window.stateManager?.getState() || {};
      const componentCount = Object.keys(state.components || {}).length;
      const sectionCount = (state.sections || []).length;
      
      console.log(`Components in state: ${componentCount}`);
      console.log(`Sections in state: ${sectionCount}`);
      
      if (componentCount > 0) {
        console.log('%c✅ Components found in state', colors.success);
        console.log('Component IDs:', Object.keys(state.components));
        
        // Show component details
        Object.entries(state.components).forEach(([id, comp]) => {
          console.log(`  - ${id}: type=${comp.type}, section=${comp.sectionId || 'none'}`);
        });
      } else {
        console.log('%c⚠️ No components in state', colors.warning);
      }
      
      // Check sections
      if (sectionCount > 0) {
        state.sections.forEach(section => {
          const compRefs = section.components ? section.components.length : 0;
          console.log(`Section ${section.section_id}: ${compRefs} component references`);
        });
      }
      
      return { componentCount, sectionCount, state };
    },
    
    /**
     * Test save functionality
     */
    testSave: async function() {
      console.log('%c\n💾 Testing Save Functionality...', colors.info);
      
      const state = window.stateManager?.getState() || {};
      const componentCount = Object.keys(state.components || {}).length;
      
      if (componentCount === 0) {
        console.log('%c❌ No components to save. Add a component first!', colors.error);
        return false;
      }
      
      console.log(`Attempting to save ${componentCount} components...`);
      
      try {
        // Trigger save
        if (window.GMKB && window.GMKB.save) {
          await window.GMKB.save();
          console.log('%c✅ Save function completed', colors.success);
        } else {
          console.log('%c❌ Save function not available', colors.error);
          return false;
        }
        
        // Wait a moment for save to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('Check the network tab for the save request.');
        console.log('The response should show components_count > 0');
        
        return true;
      } catch (error) {
        console.log('%c❌ Save failed:', colors.error, error);
        return false;
      }
    },
    
    /**
     * Inspect database state
     */
    inspectDatabase: async function() {
      console.log('%c\n🗄️ Inspecting Database State...', colors.info);
      
      if (!window.inspectDatabaseState) {
        console.log('%c⚠️ Database inspector not available', colors.warning);
        return;
      }
      
      try {
        const analysis = await window.inspectDatabaseState();
        
        if (analysis) {
          console.log('Database state retrieved successfully');
          
          if (analysis.components_analysis) {
            const count = analysis.components_analysis.count || 0;
            if (count > 0) {
              console.log(`%c✅ ${count} components in database`, colors.success);
              console.log('Component IDs:', analysis.components_analysis.first_5_ids);
            } else {
              console.log('%c❌ No components in database', colors.error);
            }
          }
          
          if (analysis.sections_analysis) {
            console.log(`Sections in database: ${analysis.sections_analysis.count}`);
          }
        }
      } catch (error) {
        console.log('%c❌ Database inspection failed:', colors.error, error);
      }
    },
    
    /**
     * Check for common issues
     */
    checkCommonIssues: function() {
      console.log('%c\n🔍 Checking for Common Issues...', colors.info);
      
      const issues = [];
      
      // Check if state manager exists
      if (!window.stateManager) {
        issues.push('State manager not initialized');
      }
      
      // Check if API service exists
      if (!window.apiService && !window.GMKB) {
        issues.push('API service not available');
      }
      
      // Check for post ID
      const postId = window.gmkbData?.postId || window.apiService?.postId;
      if (!postId || postId === 0) {
        issues.push('No valid post ID detected');
      } else {
        console.log(`Post ID: ${postId}`);
      }
      
      // Check for nonce
      const nonce = window.gmkbData?.nonce;
      if (!nonce) {
        issues.push('No nonce available for AJAX requests');
      }
      
      if (issues.length > 0) {
        console.log('%c⚠️ Issues detected:', colors.warning);
        issues.forEach(issue => console.log(`  - ${issue}`));
      } else {
        console.log('%c✅ No common issues detected', colors.success);
      }
      
      return issues;
    },
    
    /**
     * Verify components after page reload
     */
    verifyAfterReload: function() {
      console.log('%c=== Verifying Component Persistence After Reload ===', colors.info);
      
      const state = window.stateManager?.getState() || {};
      const componentCount = Object.keys(state.components || {}).length;
      
      if (componentCount > 0) {
        console.log(`%c✅ SUCCESS! ${componentCount} components loaded from database`, colors.success);
        console.log('Component IDs:', Object.keys(state.components));
        
        // Check if components are rendered
        const renderedComponents = document.querySelectorAll('[data-component-id]');
        console.log(`Components rendered in DOM: ${renderedComponents.length}`);
        
        if (renderedComponents.length === 0 && componentCount > 0) {
          console.log('%c⚠️ Components loaded but not rendered', colors.warning);
          console.log('This might be a rendering issue, not a save issue');
        }
      } else {
        console.log('%c❌ FAILED! No components loaded after refresh', colors.error);
        console.log('The save fix may not be working correctly');
        
        // Check if we have savedState
        if (window.gmkbData?.savedState) {
          console.log('Saved state exists in gmkbData:', window.gmkbData.savedState);
        }
      }
      
      return componentCount > 0;
    },
    
    /**
     * Add test component
     */
    addTestComponent: function(type = 'biography') {
      console.log(`%c\n➕ Adding test ${type} component...`, colors.info);
      
      if (!window.GMKB || !window.GMKB.addComponent) {
        console.log('%c❌ Add component function not available', colors.error);
        return;
      }
      
      const componentId = window.GMKB.addComponent(type, {
        test: true,
        createdAt: Date.now()
      });
      
      console.log(`%c✅ Component added with ID: ${componentId}`, colors.success);
      return componentId;
    },
    
    /**
     * Quick fix verification
     */
    quickVerify: async function() {
      console.log('%c=== Quick Fix Verification ===', colors.info);
      
      // 1. Check current state
      const before = this.checkCurrentState();
      
      if (before.componentCount === 0) {
        console.log('No components found. Adding a test component...');
        this.addTestComponent();
        
        // Wait for component to be added
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // 2. Test save
      const saveSuccess = await this.testSave();
      
      if (saveSuccess) {
        console.log('%c\n✅ Save appears to be working!', colors.success);
        console.log('Now refresh the page and run: GMKBTestSuite.verifyAfterReload()');
      } else {
        console.log('%c\n❌ Save is not working correctly', colors.error);
      }
    }
  };
  
  // Auto-run verification on page load if components should exist
  window.addEventListener('load', () => {
    setTimeout(() => {
      const urlParams = new URLSearchParams(window.location.search);
      const autoTest = urlParams.get('test') === 'auto';
      
      if (autoTest) {
        console.log('%c🤖 Auto-test mode enabled', colors.info);
        GMKBTestSuite.verifyAfterReload();
      }
    }, 2000);
  });
  
  // Log availability
  console.log('%c✅ GMKB Test Suite Loaded', colors.success);
  console.log('Available commands:');
  console.log('  GMKBTestSuite.runFullDiagnostic() - Run complete diagnostic');
  console.log('  GMKBTestSuite.quickVerify() - Quick save verification');
  console.log('  GMKBTestSuite.verifyAfterReload() - Check persistence after refresh');
  console.log('  GMKBTestSuite.addTestComponent() - Add a test component');
  console.log('  GMKBTestSuite.inspectDatabase() - Check database state');
  
})();
