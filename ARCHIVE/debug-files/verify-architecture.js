// Architecture Verification 
console.log('=== ARCHITECTURE VERIFICATION ==='); 
console.log('Vue systems:', !!window.gmkbVue); 
console.log('Legacy systems:', !!window.gmkbLegacy); 
console.log('Bundle loaded:', !!document.querySelector('script[src*="gmkb.iife.js"]')); 
console.log('Legacy scripts:', document.querySelectorAll('script[src*="js-legacy"]').length); 
if (window.gmkbVue && !window.gmkbLegacy) { 
    console.log('✅ ARCHITECTURE CORRECT: Vue-only mode'); 
} else { 
    console.log('❌ ARCHITECTURE ISSUE: Check configuration'); 
} 
