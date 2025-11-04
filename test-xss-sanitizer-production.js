/**
 * Production Test for XSS Sanitizer
 * Run this in the browser console after the app loads
 */

console.log('=====================================');
console.log('🧪 XSS SANITIZER PRODUCTION TEST');
console.log('=====================================\n');

// Step 1: Check if GMKB namespace exists
if (typeof window.GMKB === 'undefined') {
  console.error('❌ GMKB namespace not found! App may not be loaded.');
  console.log('Please wait for the app to fully load and try again.');
} else {
  console.log('✅ GMKB namespace exists');
  console.log('   Version:', window.GMKB.version);
  console.log('   Initialization:', window.GMKB.initialization);
}

// Step 2: Check for XSS sanitizer
if (window.GMKB?.services?.xss) {
  console.log('✅ XSS Sanitizer is available at GMKB.services.xss');
  
  // Check methods
  const methods = ['sanitizeText', 'sanitizeURL', 'sanitizeHTML', 'detectDataType', 'sanitizeValue'];
  let allMethodsPresent = true;
  
  methods.forEach(method => {
    if (typeof window.GMKB.services.xss[method] === 'function') {
      console.log(`   ✅ ${method}() method exists`);
    } else {
      console.log(`   ❌ ${method}() method missing`);
      allMethodsPresent = false;
    }
  });
  
  if (allMethodsPresent) {
    console.log('\n✅ All sanitization methods are available');
  }
} else {
  console.error('❌ XSS Sanitizer NOT FOUND at GMKB.services.xss');
  console.log('\nDebugging info:');
  console.log('- GMKB.services:', window.GMKB?.services);
  console.log('- Keys in services:', window.GMKB?.services ? Object.keys(window.GMKB.services) : 'N/A');
}

// Step 3: Check for debug command
if (typeof window.GMKB?.debugSanitization === 'function') {
  console.log('✅ Debug command available: GMKB.debugSanitization()');
} else {
  console.error('❌ Debug command NOT FOUND');
}

// Step 4: Check for side-effect marker
if (window.__GMKB_XSS_SANITIZER_LOADED__) {
  console.log('✅ XSS Sanitizer side-effect marker present');
} else {
  console.log('⚠️  Side-effect marker not found (may be minified)');
}

console.log('\n=====================================');
console.log('FUNCTIONAL TESTS');
console.log('=====================================\n');

// Only run functional tests if XSS sanitizer is available
if (window.GMKB?.services?.xss) {
  const xss = window.GMKB.services.xss;
  
  // Test cases
  const tests = [
    {
      name: 'URL Detection',
      field: 'website',
      value: 'https://example.com',
      expectedType: 'url',
      expectedSanitized: 'https://example.com'
    },
    {
      name: 'Pods URL Field',
      field: '1_website',
      value: 'https://site.com',
      expectedType: 'url',
      expectedSanitized: 'https://site.com'
    },
    {
      name: 'Text Escaping',
      field: 'position',
      value: 'CEO & Founder',
      expectedType: 'text',
      expectedSanitized: 'CEO &amp; Founder'
    },
    {
      name: 'XSS Prevention',
      field: 'company',
      value: '<script>alert(1)</script>',
      expectedType: 'text',
      expectedSanitized: '&lt;script&gt;alert(1)&lt;/script&gt;'
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  tests.forEach(test => {
    console.log(`Testing: ${test.name}`);
    
    // Test type detection
    const detectedType = xss.detectDataType(test.value, test.field);
    const typeCorrect = detectedType === test.expectedType;
    
    // Test sanitization
    const sanitized = xss.sanitizeValue(test.value, test.field);
    const sanitizeCorrect = sanitized === test.expectedSanitized;
    
    if (typeCorrect && sanitizeCorrect) {
      console.log(`  ✅ PASSED`);
      console.log(`     Type: ${detectedType} (correct)`);
      console.log(`     Result: ${sanitized}`);
      passed++;
    } else {
      console.log(`  ❌ FAILED`);
      if (!typeCorrect) {
        console.log(`     Type: ${detectedType} (expected: ${test.expectedType})`);
      }
      if (!sanitizeCorrect) {
        console.log(`     Result: ${sanitized}`);
        console.log(`     Expected: ${test.expectedSanitized}`);
      }
      failed++;
    }
  });
  
  console.log('\n=====================================');
  console.log(`RESULTS: ${passed} passed, ${failed} failed`);
  console.log('=====================================');
  
  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('The XSS sanitizer is working correctly in production.');
  } else {
    console.log('⚠️  Some tests failed. Check the field type mappings.');
  }
} else {
  console.log('⚠️  Cannot run functional tests - XSS sanitizer not available');
}

console.log('\n📝 Manual testing commands:');
console.log("GMKB.debugSanitization('https://example.com', 'website')");
console.log("GMKB.debugSanitization('CEO & Founder', 'position')");
console.log("GMKB.debugSanitization('<p>Hello</p>', 'biography')");
