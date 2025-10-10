/**
 * MEDIA KIT BUILDER - COMPREHENSIVE CONSOLE TEST SUITE
 * 
 * Tests all functionality across component and section editors
 * 
 * USAGE:
 * 1. Open browser console
 * 2. Run: await MediaKitTestSuite.runAllTests()
 * 3. Or run individual test categories:
 *    - await MediaKitTestSuite.testSectionTabs()
 *    - await MediaKitTestSuite.testSectionContent()
 *    - await MediaKitTestSuite.testSectionStyle()
 *    - await MediaKitTestSuite.testSectionAdvanced()
 *    - await MediaKitTestSuite.testComponentEditors()
 * 
 * REQUIREMENTS:
 * - Must have at least one section in the builder
 * - Must have at least one component in the builder
 * - Run in browser console on the builder page
 */

class MediaKitTestSuite {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      errors: [],
      warnings: []
    };
    this.testStartTime = null;
    this.originalConsoleError = console.error;
    this.capturedErrors = [];
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  log(message, type = 'info') {
    const styles = {
      info: 'color: #3b82f6; font-weight: bold',
      success: 'color: #10b981; font-weight: bold',
      error: 'color: #ef4444; font-weight: bold',
      warning: 'color: #f59e0b; font-weight: bold',
      test: 'color: #8b5cf6; font-weight: bold'
    };
    console.log(`%c[TEST] ${message}`, styles[type] || styles.info);
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  assert(condition, message) {
    if (condition) {
      this.results.passed++;
      this.log(`✅ PASS: ${message}`, 'success');
      return true;
    } else {
      this.results.failed++;
      this.results.errors.push(message);
      this.log(`❌ FAIL: ${message}`, 'error');
      return false;
    }
  }

  warn(message) {
    this.results.warnings.push(message);
    this.log(`⚠️  WARNING: ${message}`, 'warning');
  }

  getStore() {
    try {
      // Try to get Vue instance and store
      const app = document.querySelector('#app').__vueParentComponent;
      if (app?.ctx?.app?.config?.globalProperties?.$store) {
        return app.ctx.app.config.globalProperties.$store;
      }
      
      // Alternative: check window
      if (window.mediaKitStore) {
        return window.mediaKitStore;
      }
      
      // Try to find store in Vue devtools
      if (window.__VUE_DEVTOOLS_GLOBAL_HOOK__?.store) {
        return window.__VUE_DEVTOOLS_GLOBAL_HOOK__.store;
      }
      
      throw new Error('Store not found');
    } catch (error) {
      this.log('Cannot access store - tests may be limited', 'warning');
      return null;
    }
  }

  getUIStore() {
    try {
      const app = document.querySelector('#app').__vueParentComponent;
      if (app?.ctx?.app?.config?.globalProperties?.$uiStore) {
        return app.ctx.app.config.globalProperties.$uiStore;
      }
      if (window.uiStore) {
        return window.uiStore;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  // ============================================================================
  // SETUP & TEARDOWN
  // ============================================================================

  startErrorCapture() {
    this.capturedErrors = [];
    console.error = (...args) => {
      this.capturedErrors.push(args.join(' '));
      this.originalConsoleError.apply(console, args);
    };
  }

  stopErrorCapture() {
    console.error = this.originalConsoleError;
    return this.capturedErrors;
  }

  async setup() {
    this.log('🚀 Starting Media Kit Builder Test Suite', 'test');
    this.testStartTime = Date.now();
    this.results = {
      passed: 0,
      failed: 0,
      errors: [],
      warnings: []
    };
    this.startErrorCapture();
    
    // Check if we're on the right page
    const builderExists = document.querySelector('.media-kit-builder') !== null;
    this.assert(builderExists, 'Media Kit Builder found on page');
    
    return builderExists;
  }

  async teardown() {
    const errors = this.stopErrorCapture();
    const duration = ((Date.now() - this.testStartTime) / 1000).toFixed(2);
    
    console.log('\n');
    this.log('═══════════════════════════════════════════════', 'test');
    this.log('📊 TEST SUITE RESULTS', 'test');
    this.log('═══════════════════════════════════════════════', 'test');
    this.log(`✅ Passed: ${this.results.passed}`, 'success');
    this.log(`❌ Failed: ${this.results.failed}`, 'error');
    this.log(`⚠️  Warnings: ${this.results.warnings.length}`, 'warning');
    this.log(`⏱️  Duration: ${duration}s`, 'info');
    
    if (errors.length > 0) {
      this.log(`🐛 Console Errors Captured: ${errors.length}`, 'warning');
      errors.forEach(err => console.warn('  - ' + err));
    }
    
    if (this.results.errors.length > 0) {
      console.log('\n');
      this.log('Failed Tests:', 'error');
      this.results.errors.forEach(err => console.log(`  ❌ ${err}`));
    }
    
    if (this.results.warnings.length > 0) {
      console.log('\n');
      this.log('Warnings:', 'warning');
      this.results.warnings.forEach(warn => console.log(`  ⚠️  ${warn}`));
    }
    
    const passRate = ((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1);
    console.log('\n');
    this.log(`Pass Rate: ${passRate}%`, passRate >= 80 ? 'success' : 'error');
    this.log('═══════════════════════════════════════════════', 'test');
    
    return {
      passed: this.results.passed,
      failed: this.results.failed,
      warnings: this.results.warnings.length,
      errors: errors.length,
      passRate: parseFloat(passRate),
      duration: parseFloat(duration)
    };
  }

  // ============================================================================
  // SECTION EDITOR TESTS
  // ============================================================================

  async testSectionTabs() {
    this.log('\n🔬 Testing Section Settings - Tab Structure', 'test');
    
    const store = this.getStore();
    const uiStore = this.getUIStore();
    
    // Check if sections exist
    const sections = store?.sections || [];
    if (sections.length === 0) {
      this.warn('No sections found - skipping section tests');
      return false;
    }
    
    // Try to open section settings
    const sectionId = sections[0].section_id;
    this.log(`Testing with section: ${sectionId}`);
    
    // Look for section settings button
    const sectionElement = document.querySelector(`[data-section-id="${sectionId}"]`);
    this.assert(sectionElement !== null, 'Section element found in DOM');
    
    // Check if section settings panel exists in DOM
    const panelExists = document.querySelector('.section-settings-panel') !== null;
    this.assert(panelExists, 'Section settings panel component exists');
    
    // Check if tabs exist
    const tabsContainer = document.querySelector('.settings-tabs');
    this.assert(tabsContainer !== null, 'Tabs container exists');
    
    if (tabsContainer) {
      const tabs = tabsContainer.querySelectorAll('.tab-button');
      this.assert(tabs.length === 3, 'Three tabs present (Content, Style, Advanced)');
      
      // Check tab labels
      const tabLabels = Array.from(tabs).map(t => t.textContent.trim());
      this.assert(tabLabels.includes('Content'), 'Content tab exists');
      this.assert(tabLabels.includes('Style'), 'Style tab exists');
      this.assert(tabLabels.includes('Advanced'), 'Advanced tab exists');
      
      // Check active tab
      const activeTab = tabsContainer.querySelector('.tab-button.active');
      this.assert(activeTab !== null, 'One tab is marked active');
    }
    
    return true;
  }

  async testSectionContent() {
    this.log('\n🔬 Testing Section Content Panel', 'test');
    
    // Check if content panel exists
    const contentPanel = document.querySelector('.section-content-panel');
    
    if (!contentPanel) {
      this.warn('Content panel not visible - may need to open section settings first');
      return false;
    }
    
    this.assert(contentPanel !== null, 'Section content panel exists');
    
    // Check layout options
    const layoutOptions = contentPanel.querySelectorAll('.layout-option');
    this.assert(layoutOptions.length === 3, 'Three layout options present');
    
    // Check for active layout
    const activeLayout = contentPanel.querySelector('.layout-option.active');
    this.assert(activeLayout !== null, 'One layout is marked active');
    
    // Check container settings
    const checkboxes = contentPanel.querySelectorAll('input[type="checkbox"]');
    this.assert(checkboxes.length >= 2, 'Container and mobile checkboxes present');
    
    // Check spacing presets
    const selects = contentPanel.querySelectorAll('select');
    this.assert(selects.length >= 2, 'Padding and gap selects present');
    
    // Check custom CSS input
    const textInputs = contentPanel.querySelectorAll('input[type="text"]');
    this.assert(textInputs.length >= 1, 'Custom CSS class input present');
    
    // Check tooltips
    const tooltips = contentPanel.querySelectorAll('[class*="tooltip"]');
    this.assert(tooltips.length >= 3, 'Multiple tooltips present for guidance');
    
    return true;
  }

  async testSectionStyle() {
    this.log('\n🔬 Testing Section Style Panel (BaseStylePanel)', 'test');
    
    const stylePanel = document.querySelector('.base-style-panel');
    
    if (!stylePanel) {
      this.warn('Style panel not visible - may need to switch to Style tab');
      return false;
    }
    
    this.assert(stylePanel !== null, 'Base style panel exists');
    
    // Check preset section
    const presetSection = stylePanel.querySelector('.preset-section');
    this.assert(presetSection !== null, 'Preset section exists');
    
    if (presetSection) {
      const presetButtons = presetSection.querySelectorAll('.preset-button');
      this.assert(presetButtons.length >= 3, 'Multiple style presets available');
    }
    
    // Check style sections
    const styleSections = stylePanel.querySelectorAll('.style-section');
    this.assert(styleSections.length >= 4, 'Multiple style sections present (Spacing, Background, Border, Effects)');
    
    // Check spacing control
    const spacingControl = stylePanel.querySelector('[class*="spacing"]');
    this.assert(spacingControl !== null, 'Spacing control exists');
    
    // Check background controls
    const colorPickers = stylePanel.querySelectorAll('[class*="color"]');
    this.assert(colorPickers.length >= 1, 'Color picker exists');
    
    // Check range inputs (opacity)
    const rangeInputs = stylePanel.querySelectorAll('input[type="range"]');
    this.assert(rangeInputs.length >= 1, 'Range sliders exist (opacity)');
    
    // Check border controls
    const borderInputs = stylePanel.querySelectorAll('input[type="number"]');
    this.assert(borderInputs.length >= 4, 'Border width inputs exist (top, right, bottom, left)');
    
    // Check effects dropdown
    const effectSelects = stylePanel.querySelectorAll('select');
    this.assert(effectSelects.length >= 2, 'Select dropdowns exist (border style, box shadow)');
    
    return true;
  }

  async testSectionAdvanced() {
    this.log('\n🔬 Testing Section Advanced Panel (BaseAdvancedPanel)', 'test');
    
    const advancedPanel = document.querySelector('.base-advanced-panel');
    
    if (!advancedPanel) {
      this.warn('Advanced panel not visible - may need to switch to Advanced tab');
      return false;
    }
    
    this.assert(advancedPanel !== null, 'Base advanced panel exists');
    
    // Check advanced sections
    const advancedSections = advancedPanel.querySelectorAll('.advanced-section');
    this.assert(advancedSections.length >= 3, 'Multiple advanced sections present (Layout, Responsive, Custom CSS)');
    
    // Check width controls
    const widthSelect = advancedPanel.querySelector('select');
    this.assert(widthSelect !== null, 'Width type selector exists');
    
    // Check alignment buttons
    const alignmentButtons = advancedPanel.querySelectorAll('.alignment-btn');
    this.assert(alignmentButtons.length === 3, 'Three alignment buttons present (left, center, right)');
    
    // Check for active alignment
    const activeAlignment = advancedPanel.querySelector('.alignment-btn.active');
    this.assert(activeAlignment !== null, 'One alignment is marked active');
    
    // Check responsive toggle
    const responsiveToggle = advancedPanel.querySelector('[class*="responsive"]');
    this.assert(responsiveToggle !== null, 'Responsive visibility toggle exists');
    
    // Check custom CSS inputs
    const textInputs = advancedPanel.querySelectorAll('input[type="text"]');
    this.assert(textInputs.length >= 2, 'CSS classes and ID inputs exist');
    
    return true;
  }

  // ============================================================================
  // COMPONENT EDITOR TESTS
  // ============================================================================

  async testComponentEditors() {
    this.log('\n🔬 Testing Component Editors', 'test');
    
    const store = this.getStore();
    
    // Check if components exist
    const components = store?.components ? Object.keys(store.components) : [];
    if (components.length === 0) {
      this.warn('No components found - skipping component tests');
      return false;
    }
    
    this.log(`Testing with ${components.length} component(s)`);
    
    // Check if component sidebar exists
    const sidebar = document.querySelector('.component-sidebar') || 
                    document.querySelector('[class*="sidebar"]');
    this.assert(sidebar !== null, 'Component sidebar/editor exists');
    
    // Check for component editor tabs (if using tabs)
    const editorTabs = document.querySelectorAll('[class*="editor-tab"]');
    if (editorTabs.length > 0) {
      this.assert(editorTabs.length >= 2, 'Component editor has multiple tabs');
    }
    
    // Check for base panels in component context
    const stylePanels = document.querySelectorAll('.base-style-panel');
    const advancedPanels = document.querySelectorAll('.base-advanced-panel');
    
    this.assert(
      stylePanels.length > 0 || advancedPanels.length > 0,
      'Component editor panels exist'
    );
    
    return true;
  }

  // ============================================================================
  // FUNCTIONAL TESTS
  // ============================================================================

  async testRealTimeUpdates() {
    this.log('\n🔬 Testing Real-Time Updates', 'test');
    
    const store = this.getStore();
    if (!store) {
      this.warn('Cannot test real-time updates without store access');
      return false;
    }
    
    const sections = store.sections || [];
    if (sections.length === 0) {
      this.warn('No sections available for testing');
      return false;
    }
    
    const section = sections[0];
    const sectionElement = document.querySelector(`[data-section-id="${section.section_id}"]`);
    
    if (!sectionElement) {
      this.warn('Section element not found in DOM');
      return false;
    }
    
    // Test background color change
    const originalBgColor = sectionElement.style.backgroundColor;
    this.log('Testing background color update...');
    
    // Simulate update
    if (store.updateSectionSettings) {
      try {
        store.updateSectionSettings(section.section_id, {
          style: {
            background: {
              color: '#ff0000',
              opacity: 100
            }
          }
        });
        
        await this.sleep(500); // Wait for update
        
        const newBgColor = sectionElement.style.backgroundColor;
        this.assert(
          newBgColor !== originalBgColor,
          'Section background color updated in real-time'
        );
      } catch (error) {
        this.warn('Could not test real-time updates: ' + error.message);
      }
    }
    
    return true;
  }

  async testSettingsPersistence() {
    this.log('\n🔬 Testing Settings Persistence', 'test');
    
    const store = this.getStore();
    if (!store) {
      this.warn('Cannot test persistence without store access');
      return false;
    }
    
    const sections = store.sections || [];
    if (sections.length === 0) {
      this.warn('No sections available for testing');
      return false;
    }
    
    const section = sections[0];
    const originalSettings = JSON.parse(JSON.stringify(section.settings || {}));
    
    // Make a change
    const testValue = 'test-class-' + Date.now();
    if (store.updateSectionSettings) {
      store.updateSectionSettings(section.section_id, {
        customClass: testValue
      });
      
      await this.sleep(200);
      
      // Check if persisted
      const updatedSection = store.sections.find(s => s.section_id === section.section_id);
      this.assert(
        updatedSection?.settings?.customClass === testValue,
        'Settings changes persisted in store'
      );
      
      // Check dirty flag
      this.assert(
        store.isDirty === true,
        'Store marked as dirty after changes'
      );
    }
    
    return true;
  }

  async testAccessibility() {
    this.log('\n🔬 Testing Accessibility Features', 'test');
    
    // Check for ARIA labels
    const ariaLabels = document.querySelectorAll('[aria-label]');
    this.assert(ariaLabels.length > 0, 'ARIA labels present for accessibility');
    
    // Check for keyboard navigation
    const focusableElements = document.querySelectorAll(
      'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    this.assert(
      focusableElements.length > 0,
      'Focusable elements available for keyboard navigation'
    );
    
    // Check for tooltips (helpful for screen readers)
    const tooltips = document.querySelectorAll('[title], [data-tooltip]');
    this.assert(tooltips.length > 0, 'Tooltips present for additional context');
    
    return true;
  }

  async testErrorHandling() {
    this.log('\n🔬 Testing Error Handling', 'test');
    
    const store = this.getStore();
    if (!store) {
      this.warn('Cannot test error handling without store access');
      return false;
    }
    
    // Test invalid section ID
    const errorsBefore = this.capturedErrors.length;
    
    try {
      if (store.updateSectionSettings) {
        store.updateSectionSettings('invalid-section-id', {});
        await this.sleep(100);
      }
    } catch (error) {
      // Expected to fail gracefully
    }
    
    // Should not crash the app
    const builderStillWorks = document.querySelector('.media-kit-builder') !== null;
    this.assert(builderStillWorks, 'Builder remains functional after invalid operations');
    
    return true;
  }

  async testResponsiveDesign() {
    this.log('\n🔬 Testing Responsive Design', 'test');
    
    // Check for responsive classes
    const responsiveClasses = document.querySelectorAll('[class*="mobile"], [class*="tablet"], [class*="desktop"]');
    this.assert(responsiveClasses.length > 0, 'Responsive classes present');
    
    // Check media queries in styles
    const styleSheets = Array.from(document.styleSheets);
    let hasMediaQueries = false;
    
    try {
      for (const sheet of styleSheets) {
        const rules = sheet.cssRules || sheet.rules;
        for (const rule of rules) {
          if (rule.type === CSSRule.MEDIA_RULE) {
            hasMediaQueries = true;
            break;
          }
        }
        if (hasMediaQueries) break;
      }
    } catch (error) {
      // Some stylesheets may not be accessible
      this.warn('Could not fully check media queries due to CORS');
    }
    
    this.assert(hasMediaQueries, 'Media queries present for responsive design');
    
    return true;
  }

  // ============================================================================
  // MAIN TEST RUNNER
  // ============================================================================

  async runAllTests() {
    const setupSuccess = await this.setup();
    
    if (!setupSuccess) {
      this.log('Setup failed - cannot continue tests', 'error');
      return await this.teardown();
    }
    
    try {
      // Run all test suites
      await this.testSectionTabs();
      await this.sleep(300);
      
      await this.testSectionContent();
      await this.sleep(300);
      
      await this.testSectionStyle();
      await this.sleep(300);
      
      await this.testSectionAdvanced();
      await this.sleep(300);
      
      await this.testComponentEditors();
      await this.sleep(300);
      
      await this.testRealTimeUpdates();
      await this.sleep(300);
      
      await this.testSettingsPersistence();
      await this.sleep(300);
      
      await this.testAccessibility();
      await this.sleep(300);
      
      await this.testErrorHandling();
      await this.sleep(300);
      
      await this.testResponsiveDesign();
      
    } catch (error) {
      this.log(`Fatal error during tests: ${error.message}`, 'error');
      console.error(error);
    }
    
    return await this.teardown();
  }

  // ============================================================================
  // INTERACTIVE TEST MODE
  // ============================================================================

  async runInteractive() {
    console.clear();
    this.log('═══════════════════════════════════════════════', 'test');
    this.log('🧪 INTERACTIVE TEST MODE', 'test');
    this.log('═══════════════════════════════════════════════', 'test');
    
    console.log('\nAvailable test commands:');
    console.log('  testSuite.testSectionTabs()');
    console.log('  testSuite.testSectionContent()');
    console.log('  testSuite.testSectionStyle()');
    console.log('  testSuite.testSectionAdvanced()');
    console.log('  testSuite.testComponentEditors()');
    console.log('  testSuite.testRealTimeUpdates()');
    console.log('  testSuite.testSettingsPersistence()');
    console.log('  testSuite.testAccessibility()');
    console.log('  testSuite.testErrorHandling()');
    console.log('  testSuite.testResponsiveDesign()');
    console.log('\nOr run all tests:');
    console.log('  await testSuite.runAllTests()');
    console.log('\n');
    
    return this;
  }
}

// ============================================================================
// GLOBAL EXPORT
// ============================================================================

// Create global instance
window.MediaKitTestSuite = MediaKitTestSuite;
window.testSuite = new MediaKitTestSuite();

// Auto-run if ?test=auto in URL
if (window.location.search.includes('test=auto')) {
  console.log('Auto-running tests...');
  setTimeout(() => {
    window.testSuite.runAllTests();
  }, 2000);
} else {
  // Show interactive mode
  console.log('\n');
  console.log('%c═══════════════════════════════════════════════', 'color: #8b5cf6; font-weight: bold');
  console.log('%c🧪 Media Kit Builder Test Suite Loaded', 'color: #8b5cf6; font-weight: bold; font-size: 16px');
  console.log('%c═══════════════════════════════════════════════', 'color: #8b5cf6; font-weight: bold');
  console.log('\n%cRun all tests:', 'color: #3b82f6; font-weight: bold');
  console.log('%c  await testSuite.runAllTests()', 'color: #10b981; font-family: monospace');
  console.log('\n%cOr explore interactive mode:', 'color: #3b82f6; font-weight: bold');
  console.log('%c  testSuite.runInteractive()', 'color: #10b981; font-family: monospace');
  console.log('\n');
}

export default MediaKitTestSuite;
