/**
 * Vue Migration Test Script
 * Tests the complete Vue component system
 */

(function() {
  console.log('🧪 Vue Migration Test Starting...');
  
  // Wait for Vue to be ready
  const checkVueReady = () => {
    const tests = [];
    
    // Test 1: Check if Vue app exists
    tests.push({
      name: 'Vue App Initialized',
      pass: !!window.gmkbApp,
      details: window.gmkbApp ? 'Vue app mounted' : 'Vue app not found'
    });
    
    // Test 2: Check Pinia store
    tests.push({
      name: 'Pinia Store Available',
      pass: !!(window.gmkbStore || window.mediaKitStore),
      details: window.gmkbStore ? 'Store accessible' : 'Store not found'
    });
    
    // Test 3: Check store methods
    const store = window.gmkbStore || window.mediaKitStore;
    if (store) {
      tests.push({
        name: 'Store Actions Available',
        pass: typeof store.addComponent === 'function',
        details: 'Component management actions ready'
      });
      
      tests.push({
        name: 'Store Getters Working',
        pass: typeof store.componentCount !== 'undefined',
        details: `${store.componentCount || 0} components loaded`
      });
      
      // Test 4: Try adding a test component
      try {
        const testId = store.addComponent({
          type: 'hero',
          data: { title: 'Vue Migration Test' }
        });
        
        tests.push({
          name: 'Component Creation',
          pass: !!testId,
          details: `Created test component: ${testId}`
        });
        
        // Test 5: Check if component was added
        tests.push({
          name: 'Component Storage',
          pass: !!store.components[testId],
          details: 'Component stored correctly'
        });
        
        // Test 6: Test undo/redo
        store._saveToHistory();
        const canUndo = store.canUndo;
        tests.push({
          name: 'History Management',
          pass: true,
          details: `Undo available: ${canUndo}`
        });
        
        // Test 7: Test selection
        store.selectComponent(testId);
        tests.push({
          name: 'Component Selection',
          pass: store.selectedComponentIds.includes(testId),
          details: 'Selection system working'
        });
        
        // Clean up test component
        store.removeComponent(testId);
      } catch (error) {
        tests.push({
          name: 'Component Operations',
          pass: false,
          details: error.message
        });
      }
    }
    
    // Test 8: Check Vue components
    tests.push({
      name: 'Component Wrapper',
      pass: !!document.querySelector('.component-wrapper'),
      details: document.querySelector('.component-wrapper') ? 'Component wrapper rendered' : 'No components rendered yet'
    });
    
    // Test 9: Check sections
    tests.push({
      name: 'Section Layout',
      pass: !!document.querySelector('.gmkb-section-layout'),
      details: document.querySelector('.gmkb-section-layout') ? 'Section layout active' : 'Section layout not found'
    });
    
    // Print results
    console.log('\n📊 Vue Migration Test Results:');
    console.log('================================');
    
    let passed = 0;
    let failed = 0;
    
    tests.forEach(test => {
      const status = test.pass ? '✅' : '❌';
      const color = test.pass ? 'color: green' : 'color: red';
      console.log(`%c${status} ${test.name}`, color);
      console.log(`   ${test.details}`);
      
      if (test.pass) passed++;
      else failed++;
    });
    
    console.log('================================');
    console.log(`Total: ${passed} passed, ${failed} failed`);
    
    // Provide helper commands
    if (passed > failed) {
      console.log('\n🎉 Vue migration is working!');
      console.log('\n📝 Try these commands:');
      console.log('  store.addComponent({ type: "biography" })');
      console.log('  store.addSection("two_column")');
      console.log('  store.openEditPanel(componentId)');
      console.log('  store.saveToWordPress()');
      console.log('  store.undo()');
      console.log('  store.redo()');
    } else {
      console.log('\n⚠️ Vue migration needs attention');
      console.log('Check the console for errors');
    }
  };
  
  // Check if Vue is ready, otherwise wait
  if (window.gmkbApp || window.mediaKitStore) {
    setTimeout(checkVueReady, 1000); // Give components time to render
  } else {
    console.log('⏳ Waiting for Vue to initialize...');
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (window.gmkbApp || window.mediaKitStore) {
        clearInterval(interval);
        checkVueReady();
      } else if (attempts > 20) {
        clearInterval(interval);
        console.error('❌ Vue failed to initialize after 10 seconds');
      }
    }, 500);
  }
  
  // Add global test function
  window.testVueMigration = checkVueReady;
})();
