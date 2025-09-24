/**
 * Test Component Controls
 * Debug script to verify component edit and duplicate controls are working
 */

// Add test commands to console
window.testComponentControls = {
  // Test edit button
  testEdit: (componentId) => {
    if (!componentId) {
      const store = window.gmkbStore || window.mediaKitStore;
      const firstComponentId = store?.components ? Object.keys(store.components)[0] : null;
      if (!firstComponentId) {
        console.error('No components found to test');
        return;
      }
      componentId = firstComponentId;
    }
    
    console.log('Testing edit for component:', componentId);
    
    // Simulate the Vue component dispatching the edit event
    document.dispatchEvent(new CustomEvent('gmkb:component-edit-requested', {
      detail: { componentId }
    }));
  },
  
  // Test duplicate button
  testDuplicate: (componentId) => {
    if (!componentId) {
      const store = window.gmkbStore || window.mediaKitStore;
      const firstComponentId = store?.components ? Object.keys(store.components)[0] : null;
      if (!firstComponentId) {
        console.error('No components found to test');
        return;
      }
      componentId = firstComponentId;
    }
    
    console.log('Testing duplicate for component:', componentId);
    
    // Call the store method directly (as Vue component does)
    const store = window.gmkbStore || window.mediaKitStore;
    if (store && store.duplicateComponent) {
      const newId = store.duplicateComponent(componentId);
      console.log('Duplicated component, new ID:', newId);
      
      // Dispatch the event for feedback
      document.dispatchEvent(new CustomEvent('gmkb:component-duplicated', {
        detail: { originalId: componentId, newId }
      }));
    }
  },
  
  // Test move controls
  testMove: (componentId, direction = 'up') => {
    if (!componentId) {
      const store = window.gmkbStore || window.mediaKitStore;
      const firstComponentId = store?.components ? Object.keys(store.components)[0] : null;
      if (!firstComponentId) {
        console.error('No components found to test');
        return;
      }
      componentId = firstComponentId;
    }
    
    console.log(`Testing move ${direction} for component:`, componentId);
    
    // Simulate the Vue component dispatching the move event
    const eventName = direction === 'up' ? 'gmkb:component-move-up-requested' : 'gmkb:component-move-down-requested';
    document.dispatchEvent(new CustomEvent(eventName, {
      detail: { componentId }
    }));
  },
  
  // Test all controls
  testAll: () => {
    const store = window.gmkbStore || window.mediaKitStore;
    const componentIds = store?.components ? Object.keys(store.components) : [];
    
    if (componentIds.length === 0) {
      console.error('No components found to test');
      return;
    }
    
    console.log('Testing controls for', componentIds.length, 'components');
    
    // Test first component
    const firstId = componentIds[0];
    console.log('\n--- Testing component:', firstId, '---');
    
    // Test edit
    console.log('1. Testing edit...');
    window.testComponentControls.testEdit(firstId);
    
    // Test duplicate after a delay
    setTimeout(() => {
      console.log('2. Testing duplicate...');
      window.testComponentControls.testDuplicate(firstId);
      
      // Test move after another delay
      setTimeout(() => {
        console.log('3. Testing move up...');
        window.testComponentControls.testMove(firstId, 'up');
        
        setTimeout(() => {
          console.log('4. Testing move down...');
          window.testComponentControls.testMove(firstId, 'down');
          
          console.log('\n✅ All tests completed. Check UI for results.');
        }, 1000);
      }, 1000);
    }, 1000);
  },
  
  // Check event listeners
  checkEventListeners: () => {
    const events = [
      'gmkb:component-edit-requested',
      'gmkb:component-move-up-requested', 
      'gmkb:component-move-down-requested',
      'gmkb:component-duplicated',
      'gmkb:component-delete-requested',
      'gmkb:component-action'
    ];
    
    console.log('Checking event listeners...\n');
    
    events.forEach(eventName => {
      // Create a test event
      const testHandler = (e) => {
        console.log(`✅ ${eventName} - Listener active`);
        document.removeEventListener(eventName, testHandler);
      };
      
      document.addEventListener(eventName, testHandler);
      document.dispatchEvent(new CustomEvent(eventName, { detail: { test: true } }));
    });
  }
};

// Log available commands
console.log(`
🧪 Component Control Test Commands:

testComponentControls.testEdit()      - Test edit button functionality
testComponentControls.testDuplicate()  - Test duplicate button
testComponentControls.testMove()       - Test move up/down buttons
testComponentControls.testAll()        - Run all tests in sequence
testComponentControls.checkEventListeners() - Verify event listeners are active

Pass a component ID to test specific component:
testComponentControls.testEdit('comp_123')
`);

// Run initial check
console.log('Running initial event listener check...');
window.testComponentControls.checkEventListeners();
