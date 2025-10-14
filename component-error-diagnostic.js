/**
 * Component Error Diagnostic
 * 
 * This wraps each component render in a try-catch to identify
 * which specific component is causing the .value error
 */

// Save original console.error
const originalError = console.error;
let errorCaughtInComponent = null;

// Override console.error to catch Vue errors
console.error = function(...args) {
  const errorMsg = args[0];
  
  if (typeof errorMsg === 'string' && errorMsg.includes('Cannot read properties of undefined')) {
    // Try to extract component info from stack trace
    const stack = new Error().stack;
    errorCaughtInComponent = {
      message: errorMsg,
      stack: stack,
      timestamp: Date.now()
    };
    
    console.log('🚨 CAUGHT ERROR!', errorCaughtInComponent);
  }
  
  // Call original
  originalError.apply(console, args);
};

// Monitor component wrapper renders
let renderAttempts = [];

const observer = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if (node.nodeType === 1 && node.hasAttribute && node.hasAttribute('data-component-id')) {
        const id = node.getAttribute('data-component-id');
        const comp = window.gmkbData?.savedState?.components?.[id];
        
        renderAttempts.push({
          id,
          type: comp?.type,
          timestamp: Date.now(),
          success: true
        });
        
        console.log(`✅ Rendered: ${id} (${comp?.type})`);
      }
    });
  });
});

// Start observing
const previewContainer = document.querySelector('.gmkb-preview-container') || document.body;
observer.observe(previewContainer, {
  childList: true,
  subtree: true
});

console.log('👀 Watching for component renders...');
console.log('Press Ctrl+Shift+R to reload and watch');

// After 5 seconds, show what we caught
setTimeout(() => {
  console.log('\n📊 DIAGNOSTIC REPORT:');
  console.log('='.repeat(50));
  console.log('Render attempts:', renderAttempts.length);
  console.log('Last 5 renders:', renderAttempts.slice(-5));
  
  if (errorCaughtInComponent) {
    console.error('\n🚨 ERROR CAUGHT:');
    console.error(errorCaughtInComponent);
    
    // Try to identify which component
    const lastRenders = renderAttempts.slice(-3);
    console.log('\n🔍 Components rendered just before error:');
    lastRenders.forEach(r => console.log(`  - ${r.id}: ${r.type}`));
    console.log('\n💡 The error likely occurred in one of these components ^');
  } else {
    console.log('\n✅ No error caught in this window');
  }
  
  console.log('='.repeat(50));
  
  observer.disconnect();
}, 5000);
