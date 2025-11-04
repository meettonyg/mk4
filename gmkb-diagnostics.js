/**
 * GMKB Diagnostics - Quick system check
 * Run this in browser console to see what's available
 */

(() => {
  console.log('🔍 GMKB SYSTEM DIAGNOSTICS');
  console.log('==========================\n');
  
  // Check GMKB namespace
  if (typeof window.GMKB === 'undefined') {
    console.error('❌ GMKB not found - app not loaded');
    return;
  }
  
  console.log('✅ GMKB namespace found');
  console.table({
    Version: window.GMKB.version,
    Architecture: window.GMKB.architecture,
    Initialization: window.GMKB.initialization
  });
  
  // Check services
  console.log('\n📦 Services:');
  if (window.GMKB.services) {
    const services = Object.keys(window.GMKB.services);
    services.forEach(service => {
      const type = typeof window.GMKB.services[service];
      const hasValue = !!window.GMKB.services[service];
      console.log(`  ${hasValue ? '✅' : '❌'} ${service}: ${type}`);
    });
  } else {
    console.log('  ❌ No services object');
  }
  
  // Check stores
  console.log('\n🗄️ Stores:');
  if (window.GMKB.stores) {
    const stores = Object.keys(window.GMKB.stores);
    stores.forEach(store => {
      const hasValue = !!window.GMKB.stores[store];
      console.log(`  ${hasValue ? '✅' : '❌'} ${store}`);
    });
  } else {
    console.log('  ❌ No stores object');
  }
  
  // Check specific XSS sanitizer
  console.log('\n🛡️ XSS Sanitizer:');
  console.log('  services.xss:', !!window.GMKB?.services?.xss ? '✅ Present' : '❌ Missing');
  console.log('  services.security:', !!window.GMKB?.services?.security ? '✅ Present' : '❌ Missing');
  console.log('  debugSanitization:', typeof window.GMKB?.debugSanitization === 'function' ? '✅ Available' : '❌ Missing');
  console.log('  Side-effect marker:', window.__GMKB_XSS_SANITIZER_LOADED__ ? '✅ Set' : '❌ Not set');
  
  // Check for common issues
  console.log('\n⚠️ Common Issues Check:');
  
  // Check jQuery
  console.log('  jQuery:', typeof jQuery !== 'undefined' ? `✅ v${jQuery.fn.jquery}` : '⚠️ Not loaded');
  
  // Check Vue
  console.log('  Vue app:', window.GMKB?.app ? '✅ Mounted' : '❌ Not mounted');
  
  // Check gmkbData
  console.log('  gmkbData:', typeof window.gmkbData !== 'undefined' ? '✅ Available' : '❌ Missing');
  
  if (window.gmkbData) {
    console.log('\n📊 gmkbData info:');
    console.table({
      'Post ID': window.gmkbData.postId,
      'Post Type': window.gmkbData.postType,
      'Has saved state': !!window.gmkbData.savedState,
      'REST URL': window.gmkbData.restUrl ? '✅' : '❌',
      'REST Nonce': window.gmkbData.restNonce ? '✅' : '❌',
      'Ajax URL': window.gmkbData.ajaxUrl ? '✅' : '❌'
    });
  }
  
  console.log('\n📝 Quick Commands:');
  console.log("  GMKB.stores.mediaKit.components  // View all components");
  console.log("  GMKB.debugSanitization('test', 'field')  // Test sanitizer");
  console.log("  GMKB.help()  // Show available commands");
})();
