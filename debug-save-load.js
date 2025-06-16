/**
 * Media Kit Builder Debug Utility
 * Run this code in your browser console to diagnose save/load issues
 */

(function() {
  console.clear();
  console.log('====== MEDIA KIT DEBUG UTILITY ======');
  console.log('Starting comprehensive diagnostics...');
  
  // Debug header with timestamp
  function logHeader(title) {
    console.log(`\n%c${title} ${new Date().toISOString()}`, 'background:#333; color:white; padding:3px 8px; border-radius:3px; font-weight:bold;');
  }
  
  // Step 1: Check global objects
  logHeader('GLOBAL OBJECTS CHECK');
  const globalCheck = {
    stateManager: typeof window.stateManager !== 'undefined',
    componentManager: typeof window.componentManager !== 'undefined',
    historyService: typeof window.historyService !== 'undefined',
    dataBindingEngine: typeof window.dataBindingEngine !== 'undefined',
    
    stateManagerInitialized: window.stateManager && typeof window.stateManager.getState === 'function',
    componentManagerInitialized: window.componentManager && window.componentManager.initialized === true,
    
    // Check if debug objects are available
    gmkbDebug: typeof window.gmkbDebug !== 'undefined',
    guestifyData: typeof window.guestifyData !== 'undefined',
    gmkb_data: typeof window.gmkb_data !== 'undefined',
  };
  
  console.table(globalCheck);
  
  if (!globalCheck.stateManager) {
    console.error('CRITICAL ERROR: stateManager not available globally. This will prevent saving/loading.');
  }
  
  if (!globalCheck.componentManager) {
    console.error('CRITICAL ERROR: componentManager not available globally. This will prevent component rendering.');
  }
  
  // Step 2: Check localStorage
  logHeader('LOCAL STORAGE CHECK');
  const savedData = localStorage.getItem('mediaKitData');
  const lastSavedState = localStorage.getItem('gmkb_last_saved_state');
  
  console.log('mediaKitData exists:', !!savedData);
  console.log('gmkb_last_saved_state exists:', !!lastSavedState);
  
  // Attempt to parse and validate the saved data
  let isValidJSON = false;
  let hasComponents = false;
  let componentCount = 0;
  
  try {
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      isValidJSON = true;
      
      if (parsedData.components && Array.isArray(parsedData.components)) {
        hasComponents = true;
        componentCount = parsedData.components.length;
        
        console.log('Components found in savedData:', componentCount);
        console.log('Component types:', parsedData.components.map(c => c.type).join(', '));
      } else {
        console.error('No components array found in savedData or it is not an array');
      }
    }
  } catch (e) {
    console.error('Error parsing savedData:', e);
  }
  
  console.log('savedData is valid JSON:', isValidJSON);
  console.log('savedData has components array:', hasComponents);
  
  // Step 3: Check component manager status
  logHeader('COMPONENT MANAGER STATUS');
  
  if (window.componentManager) {
    console.log('Component Manager initialized:', window.componentManager.initialized);
    console.log('Component Registry size:', window.componentManager.componentRegistry.size);
    
    if (window.componentManager.componentRegistry.size > 0) {
      console.log('Available component types:', 
        Array.from(window.componentManager.componentRegistry.keys()).join(', '));
    } else {
      console.error('No components registered in componentManager');
    }
    
    console.log('Loaded schemas:', window.componentManager.loadedSchemas.size);
  } else {
    console.error('Component manager not available for inspection');
  }
  
  // Step 4: Check for load errors in the DOM
  logHeader('DOM ERROR CHECK');
  const errorElements = document.querySelectorAll('.error, .error-message, [class*="error"], .gmkb-error-toast');
  
  if (errorElements.length > 0) {
    console.log('Found error elements in the DOM:', errorElements.length);
    errorElements.forEach((el, i) => {
      console.log(`Error element ${i+1}:`, el.textContent, el);
    });
  } else {
    console.log('No error elements found in DOM');
  }
  
  // Step 5: Check components in DOM
  logHeader('DOM COMPONENTS CHECK');
  const componentElements = document.querySelectorAll('[data-component-id]');
  
  console.log('Component elements in DOM:', componentElements.length);
  if (componentElements.length > 0) {
    const componentDetails = Array.from(componentElements).map(el => ({
      id: el.getAttribute('data-component-id'),
      type: el.getAttribute('data-component-type'),
      hasControls: !!el.querySelector('.element-controls')
    }));
    console.table(componentDetails);
  }
  
  // Step 6: Test save functionality
  logHeader('SAVE FUNCTIONALITY TEST');
  console.log('Testing state manager serialization...');
  
  if (window.stateManager && typeof window.stateManager.getSerializableState === 'function') {
    try {
      const state = window.stateManager.getSerializableState();
      console.log('Successfully retrieved serializable state');
      console.log('State has components:', state.components && Array.isArray(state.components));
      console.log('Component count in state:', state.components ? state.components.length : 0);
      
      if (state.components && state.components.length === 0 && componentElements.length > 0) {
        console.error('CRITICAL: DOM has components but state does not');
      }
    } catch (e) {
      console.error('Error getting serializable state:', e);
    }
  } else {
    console.error('getSerializableState() not available on stateManager');
  }
  
  // Step 7: Test manual localStorage saving and loading
  logHeader('MANUAL SAVE/LOAD TEST');
  
  // Create a test save function
  window.testSave = function() {
    if (!window.stateManager) {
      console.error('Cannot test save: stateManager not available');
      return false;
    }
    
    try {
      const state = window.stateManager.getSerializableState();
      localStorage.setItem('mediaKitData_test', JSON.stringify(state));
      console.log('Test save successful');
      return true;
    } catch (e) {
      console.error('Test save failed:', e);
      return false;
    }
  };
  
  // Create a test load function
  window.testLoad = function() {
    if (!window.stateManager) {
      console.error('Cannot test load: stateManager not available');
      return false;
    }
    
    try {
      const savedData = localStorage.getItem('mediaKitData_test');
      if (!savedData) {
        console.error('No test data to load. Run testSave() first.');
        return false;
      }
      
      const state = JSON.parse(savedData);
      window.stateManager.loadSerializedState(state);
      console.log('Test load successful');
      
      // Trigger state change event
      document.dispatchEvent(new CustomEvent('gmkb-state-changed', {
        detail: { state: window.stateManager.getState() }
      }));
      
      return true;
    } catch (e) {
      console.error('Test load failed:', e);
      return false;
    }
  };
  
  console.log('Debug utility functions added to window:');
  console.log('- window.testSave(): Test saving state to localStorage');
  console.log('- window.testLoad(): Test loading state from localStorage');
  
  // Final summary
  logHeader('DIAGNOSTICS SUMMARY');
  
  if (!globalCheck.stateManager || !globalCheck.componentManager) {
    console.error('CRITICAL: Missing required global objects. This will prevent saving/loading.');
  } else if (!globalCheck.stateManagerInitialized || !globalCheck.componentManagerInitialized) {
    console.error('CRITICAL: Required objects exist but are not properly initialized.');
  } else if (!isValidJSON || !hasComponents) {
    console.error('CRITICAL: localStorage data is invalid or missing components.');
  } else if (componentCount === 0 && componentElements.length === 0) {
    console.warn('NOTE: No components found in saved data or DOM. This may be normal for a new media kit.');
  } else if (componentCount > 0 && componentElements.length === 0) {
    console.error('CRITICAL: Components exist in saved data but not in DOM. Rendering is failing.');
  } else if (componentCount === 0 && componentElements.length > 0) {
    console.error('CRITICAL: Components exist in DOM but not in saved data. Saving is failing.');
  }
  
  console.log('====== DIAGNOSTICS COMPLETE ======');
  console.log('Run window.testSave() and window.testLoad() to test saving/loading manually');
})();
