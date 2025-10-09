/**
 * VERIFICATION SCRIPT: Component Reference Normalization
 * 
 * Run this in the browser console to verify the fix is working
 * 
 * Usage:
 * 1. Open Media Kit Builder in browser
 * 2. Open browser console (F12)
 * 3. Paste this script and run
 */

console.log('🔍 Starting Component Reference Normalization Verification...\n');

// Get the media kit store
const store = window.mediaKitStore || window.$pinia?.state?.value?.mediaKit;

if (!store) {
  console.error('❌ Store not found! Make sure Media Kit Builder is loaded.');
} else {
  console.log('✅ Store found\n');
  
  // Check 1: Validate all section component references are strings
  console.log('📋 Check 1: Section Component References');
  let invalidRefs = 0;
  let totalRefs = 0;
  
  store.sections.forEach((section, idx) => {
    console.log(`\nSection ${idx} (${section.section_id}):`);
    
    // Check full-width sections
    if (section.components && Array.isArray(section.components)) {
      console.log(`  - ${section.components.length} components in full-width layout`);
      section.components.forEach((compRef, i) => {
        totalRefs++;
        if (typeof compRef !== 'string') {
          invalidRefs++;
          console.error(`  ❌ Component ${i}: Invalid type (${typeof compRef})`, compRef);
        } else if (!compRef) {
          invalidRefs++;
          console.error(`  ❌ Component ${i}: Empty/null reference`);
        } else {
          console.log(`  ✅ Component ${i}: "${compRef}"`);
        }
      });
    }
    
    // Check multi-column sections
    if (section.columns) {
      Object.entries(section.columns).forEach(([col, components]) => {
        if (Array.isArray(components) && components.length > 0) {
          console.log(`  - ${components.length} components in column ${col}`);
          components.forEach((compRef, i) => {
            totalRefs++;
            if (typeof compRef !== 'string') {
              invalidRefs++;
              console.error(`  ❌ Column ${col}, Component ${i}: Invalid type (${typeof compRef})`, compRef);
            } else if (!compRef) {
              invalidRefs++;
              console.error(`  ❌ Column ${col}, Component ${i}: Empty/null reference`);
            } else {
              console.log(`  ✅ Column ${col}, Component ${i}: "${compRef}"`);
            }
          });
        }
      });
    }
  });
  
  console.log(`\n📊 References Summary:`);
  console.log(`  - Total references: ${totalRefs}`);
  console.log(`  - Valid references: ${totalRefs - invalidRefs}`);
  console.log(`  - Invalid references: ${invalidRefs}`);
  
  if (invalidRefs === 0) {
    console.log('\n✅ All component references are properly normalized!\n');
  } else {
    console.error(`\n❌ Found ${invalidRefs} invalid references that need fixing!\n`);
  }
  
  // Check 2: Validate all components have required properties
  console.log('📋 Check 2: Component Structure Validation');
  let invalidComponents = 0;
  let totalComponents = Object.keys(store.components).length;
  
  Object.entries(store.components).forEach(([id, comp]) => {
    if (!comp) {
      invalidComponents++;
      console.error(`❌ Component ${id}: Component is null/undefined`);
    } else if (!comp.type) {
      invalidComponents++;
      console.error(`❌ Component ${id}: Missing type property`, comp);
    } else if (!comp.id || comp.id !== id) {
      console.warn(`⚠️ Component ${id}: ID mismatch (id: ${comp.id})`);
    } else {
      // Valid component
      console.log(`✅ Component ${id}: type="${comp.type}"`);
    }
  });
  
  console.log(`\n📊 Components Summary:`);
  console.log(`  - Total components: ${totalComponents}`);
  console.log(`  - Valid components: ${totalComponents - invalidComponents}`);
  console.log(`  - Invalid components: ${invalidComponents}`);
  
  if (invalidComponents === 0) {
    console.log('\n✅ All components are valid!\n');
  } else {
    console.error(`\n❌ Found ${invalidComponents} invalid components!\n`);
  }
  
  // Check 3: Cross-reference sections and components
  console.log('📋 Check 3: Cross-Reference Validation');
  let orphanedRefs = [];
  let missingComponents = [];
  
  store.sections.forEach((section, idx) => {
    // Check full-width
    if (section.components) {
      section.components.forEach(compId => {
        if (!store.components[compId]) {
          missingComponents.push({ section: idx, compId });
          console.error(`❌ Section ${idx} references non-existent component: ${compId}`);
        }
      });
    }
    
    // Check columns
    if (section.columns) {
      Object.entries(section.columns).forEach(([col, components]) => {
        components.forEach(compId => {
          if (!store.components[compId]) {
            missingComponents.push({ section: idx, column: col, compId });
            console.error(`❌ Section ${idx} col ${col} references non-existent component: ${compId}`);
          }
        });
      });
    }
  });
  
  // Check for orphaned components
  const referencedComponents = new Set();
  store.sections.forEach(section => {
    if (section.components) {
      section.components.forEach(id => referencedComponents.add(id));
    }
    if (section.columns) {
      Object.values(section.columns).forEach(col => {
        col.forEach(id => referencedComponents.add(id));
      });
    }
  });
  
  Object.keys(store.components).forEach(compId => {
    if (!referencedComponents.has(compId)) {
      orphanedRefs.push(compId);
      console.warn(`⚠️ Component ${compId} is not referenced in any section (orphaned)`);
    }
  });
  
  console.log(`\n📊 Cross-Reference Summary:`);
  console.log(`  - Missing component references: ${missingComponents.length}`);
  console.log(`  - Orphaned components: ${orphanedRefs.length}`);
  
  if (missingComponents.length === 0 && orphanedRefs.length === 0) {
    console.log('\n✅ All cross-references are valid!\n');
  }
  
  // Final verdict
  console.log('═══════════════════════════════════════════');
  if (invalidRefs === 0 && invalidComponents === 0 && missingComponents.length === 0) {
    console.log('✅✅✅ ALL CHECKS PASSED! ✅✅✅');
    console.log('The component reference normalization is working correctly.');
  } else {
    console.error('❌ SOME CHECKS FAILED');
    console.error('Please review the errors above and fix the issues.');
  }
  console.log('═══════════════════════════════════════════\n');
}

// Export verification results for automated testing
window.gmkbVerification = {
  timestamp: new Date().toISOString(),
  store: !!store,
  invalidRefs: invalidRefs || 0,
  invalidComponents: invalidComponents || 0,
  missingComponents: missingComponents?.length || 0,
  orphanedComponents: orphanedRefs?.length || 0,
  passed: (invalidRefs === 0 && invalidComponents === 0 && missingComponents?.length === 0)
};

console.log('💾 Results saved to window.gmkbVerification');
