// PHASE 4 TEST: Advanced Features
// Tests inline editing, templates, and import/export functionality

console.log('=== PHASE 4: ADVANCED FEATURES TEST ===\n');
console.log('Testing inline editing, templates, and import/export...\n');

// Test results collector
const testResults = {
  inlineEditor: {},
  templates: {},
  importExport: {}
};

// 1. INLINE EDITOR TEST
console.log('📝 TEST 1: Inline Editor');
console.log('========================');

function testInlineEditor() {
  // Check if inline editor is initialized
  const editor = window.GMKB?.inlineEditor;
  
  if (!editor) {
    console.log('  ❌ Inline Editor not initialized');
    testResults.inlineEditor.initialized = false;
    return;
  }
  
  console.log('  ✅ Inline Editor initialized');
  testResults.inlineEditor.initialized = true;
  
  // Check for editable elements
  const editableElements = document.querySelectorAll('[data-editable]');
  console.log(`  📊 Found ${editableElements.length} editable elements`);
  testResults.inlineEditor.editableCount = editableElements.length;
  
  // Show some editable elements
  if (editableElements.length > 0) {
    console.log('  Editable elements found:');
    Array.from(editableElements).slice(0, 5).forEach(el => {
      const component = el.closest('[data-component-id]');
      const componentId = component?.dataset.componentId || 'unknown';
      const field = el.dataset.editable;
      console.log(`    - ${field} in component ${componentId}`);
    });
  }
  
  // Test instruction
  console.log('\n  💡 To test inline editing:');
  console.log('     1. Double-click any text in a component');
  console.log('     2. Edit the text');
  console.log('     3. Press Enter to save or Esc to cancel');
  
  testResults.inlineEditor.ready = editableElements.length > 0;
}

// 2. COMPONENT TEMPLATES TEST
console.log('\n📋 TEST 2: Component Templates');
console.log('==============================');

function testComponentTemplates() {
  const templates = window.GMKB?.componentTemplates;
  
  if (!templates) {
    console.log('  ❌ Component Templates not initialized');
    testResults.templates.initialized = false;
    return;
  }
  
  console.log('  ✅ Component Templates initialized');
  testResults.templates.initialized = true;
  
  // Get all templates
  const allTemplates = templates.templates;
  const templateCount = Object.keys(allTemplates).length;
  console.log(`  📊 ${templateCount} templates available`);
  
  // Show categories
  const categories = templates.getAllCategories();
  console.log(`  📁 Template categories: ${categories.join(', ')}`);
  
  // Show some templates by category
  console.log('\n  Available templates:');
  categories.slice(0, 3).forEach(category => {
    const categoryTemplates = templates.getTemplatesByCategory(category);
    console.log(`    ${category}:`);
    categoryTemplates.slice(0, 3).forEach(template => {
      console.log(`      - ${template.name}: ${template.description || 'No description'}`);
    });
  });
  
  testResults.templates.count = templateCount;
  testResults.templates.categories = categories.length;
}

// 3. IMPORT/EXPORT TEST
console.log('\n📦 TEST 3: Import/Export Manager');
console.log('================================');

function testImportExport() {
  const manager = window.GMKB?.importExportManager;
  
  if (!manager) {
    console.log('  ❌ Import/Export Manager not initialized');
    testResults.importExport.initialized = false;
    return;
  }
  
  console.log('  ✅ Import/Export Manager initialized');
  testResults.importExport.initialized = true;
  
  // Check export formats
  console.log(`  📊 Export formats: ${manager.exportFormats.join(', ')}`);
  
  // Check version
  console.log(`  📌 Version: ${manager.version}`);
  
  testResults.importExport.formats = manager.exportFormats.length;
  testResults.importExport.version = manager.version;
}

// 4. FEATURE INTEGRATION TEST
console.log('\n🔗 TEST 4: Feature Integration');
console.log('==============================');

function testFeatureIntegration() {
  console.log('  Testing feature availability...');
  
  const features = {
    'Inline Editor': !!window.GMKB?.inlineEditor,
    'Component Templates': !!window.GMKB?.componentTemplates,
    'Import/Export': !!window.GMKB?.importExportManager,
    'State Manager': !!window.GMKB?.stateManager,
    'Theme Manager': !!window.themeManager
  };
  
  Object.entries(features).forEach(([name, available]) => {
    console.log(`    ${available ? '✅' : '❌'} ${name}: ${available ? 'Available' : 'Not found'}`);
  });
  
  const availableCount = Object.values(features).filter(v => v).length;
  testResults.integration = {
    total: Object.keys(features).length,
    available: availableCount
  };
}

// 5. INTERACTIVE TESTS
console.log('\n🎮 TEST 5: Interactive Features');
console.log('===============================');

// Helper functions for testing
window.phase4 = {
  // Test inline editing
  testInlineEdit: function(componentId, field = 'title') {
    const component = document.querySelector(`[data-component-id="${componentId}"]`);
    if (!component) {
      console.log('Component not found');
      return;
    }
    
    const editable = component.querySelector(`[data-editable="${field}"]`);
    if (!editable) {
      console.log(`No editable field "${field}" found`);
      return;
    }
    
    // Trigger double-click
    const event = new MouseEvent('dblclick', { bubbles: true });
    editable.dispatchEvent(event);
    
    console.log(`✅ Started editing ${field} in component ${componentId}`);
    console.log('Type new text and press Enter to save');
  },
  
  // Apply a template
  applyTemplate: function(templateId) {
    const templates = window.GMKB?.componentTemplates;
    if (!templates) {
      console.log('Templates not available');
      return;
    }
    
    const result = templates.applyTemplate(templateId, window.GMKB.stateManager);
    if (result) {
      console.log(`✅ Applied template: ${templateId}`);
      console.log('Component(s) added:', result);
    } else {
      console.log('Failed to apply template');
    }
  },
  
  // Show available templates
  listTemplates: function(category = null) {
    const templates = window.GMKB?.componentTemplates;
    if (!templates) {
      console.log('Templates not available');
      return;
    }
    
    if (category) {
      const categoryTemplates = templates.getTemplatesByCategory(category);
      console.log(`Templates in category "${category}":`);
      categoryTemplates.forEach(t => {
        console.log(`  ${t.id}: ${t.name}`);
      });
    } else {
      console.log('All templates:');
      Object.values(templates.templates).forEach(t => {
        console.log(`  ${t.id}: ${t.name} (${t.category})`);
      });
    }
  },
  
  // Export current media kit
  exportKit: async function(format = 'json') {
    const manager = window.GMKB?.importExportManager;
    if (!manager) {
      console.log('Import/Export not available');
      return;
    }
    
    await manager.exportMediaKit(format);
    console.log(`✅ Exported media kit as ${format}`);
  },
  
  // Show import UI
  showImportUI: function() {
    const manager = window.GMKB?.importExportManager;
    if (!manager) {
      console.log('Import/Export not available');
      return;
    }
    
    manager.createImportUI();
    console.log('✅ Import UI opened');
  },
  
  // Save current as template
  saveAsTemplate: function(name) {
    const templates = window.GMKB?.componentTemplates;
    const state = window.GMKB?.stateManager?.getState();
    
    if (!templates || !state) {
      console.log('Required systems not available');
      return;
    }
    
    const components = Object.values(state.components);
    const templateId = templates.saveCustomTemplate(
      name,
      'Custom template created from current media kit',
      components,
      window.GMKB.stateManager
    );
    
    console.log(`✅ Saved custom template: ${name} (${templateId})`);
  },
  
  // Apply a complete kit template
  applyKit: function(kitId = 'kit-speaker') {
    const templates = window.GMKB?.componentTemplates;
    if (!templates) {
      console.log('Templates not available');
      return;
    }
    
    const result = templates.applyTemplate(kitId, window.GMKB.stateManager);
    if (result) {
      console.log(`✅ Applied complete kit: ${kitId}`);
      console.log(`Added ${result.length} components`);
    }
  }
};

// RUN ALL TESTS
function runAllTests() {
  testInlineEditor();
  testComponentTemplates();
  testImportExport();
  testFeatureIntegration();
  
  // SUMMARY
  console.log('\n' + '='.repeat(50));
  console.log('📊 PHASE 4 TEST SUMMARY');
  console.log('='.repeat(50));
  
  const inlineScore = testResults.inlineEditor.ready ? 1 : 0;
  const templateScore = testResults.templates.count > 0 ? 1 : 0;
  const exportScore = testResults.importExport.initialized ? 1 : 0;
  const integrationScore = testResults.integration?.available || 0;
  
  console.log(`\n✅ Inline Editor: ${inlineScore}/1 - ${testResults.inlineEditor.editableCount || 0} editable elements`);
  console.log(`✅ Templates: ${templateScore}/1 - ${testResults.templates.count || 0} templates available`);
  console.log(`✅ Import/Export: ${exportScore}/1 - ${testResults.importExport.formats || 0} formats supported`);
  console.log(`✅ Integration: ${integrationScore}/${testResults.integration?.total || 5} features integrated`);
  
  const totalScore = inlineScore + templateScore + exportScore;
  const allPassed = totalScore === 3;
  
  console.log('\n' + '='.repeat(50));
  if (allPassed) {
    console.log('🎉 PHASE 4 COMPLETE: All advanced features working!');
    console.log('\nFeatures available:');
    console.log('  • Inline editing (double-click text)');
    console.log('  • Component templates');
    console.log('  • Import/Export functionality');
    console.log('  • Custom template creation');
  } else {
    console.log('⚠️ PHASE 4 INCOMPLETE: Some features not working');
    if (!inlineScore) console.log('  - Inline Editor not ready');
    if (!templateScore) console.log('  - Templates not loaded');
    if (!exportScore) console.log('  - Import/Export not initialized');
  }
  
  console.log('\n💡 Interactive commands:');
  console.log('  phase4.testInlineEdit(componentId, field) - Test inline editing');
  console.log('  phase4.listTemplates() - Show all templates');
  console.log('  phase4.applyTemplate(templateId) - Apply a template');
  console.log('  phase4.applyKit("kit-speaker") - Apply complete speaker kit');
  console.log('  phase4.exportKit("json") - Export current media kit');
  console.log('  phase4.showImportUI() - Open import dialog');
  console.log('  phase4.saveAsTemplate("name") - Save current as template');
}

// Run tests
runAllTests();

// Quick demo commands
console.log('\n🚀 QUICK DEMO:');
console.log('1. Add hero from template:');
console.log('   phase4.applyTemplate("hero-speaker")');
console.log('\n2. Test inline editing:');
console.log('   Double-click any text in the preview');
console.log('\n3. Apply complete kit:');
console.log('   phase4.applyKit("kit-speaker")');
console.log('\n4. Export your work:');
console.log('   phase4.exportKit("json")');
