/**
 * TEST: URL Sanitization Fix
 * 
 * Run this in the browser console after the app loads
 * to verify URLs are properly sanitized without corruption
 */

// Test the XSS Sanitizer directly
function testSanitizer() {
  console.log('=====================================');
  console.log('🧪 TESTING URL SANITIZATION FIX');
  console.log('=====================================\n');

  const testCases = [
    // URLs that should pass through unchanged
    { value: 'https://example.com', field: 'website', expected: 'https://example.com' },
    { value: 'http://site.com/page', field: '1_website', expected: 'http://site.com/page' },
    { value: '/uploads/image.jpg', field: 'headshot', expected: '/uploads/image.jpg' },
    { value: 'https://linkedin.com/in/user', field: 'linkedin', expected: 'https://linkedin.com/in/user' },
    
    // Text that should be HTML-escaped
    { value: 'John Doe', field: 'first_name', expected: 'John Doe' },
    { value: 'CEO & Founder', field: 'position', expected: 'CEO &amp; Founder' },
    { value: '<script>alert(1)</script>', field: 'company', expected: '&lt;script&gt;alert(1)&lt;/script&gt;' },
    
    // HTML content that should be sanitized
    { value: '<p>Biography text</p>', field: 'biography', expected: '<p>Biography text</p>' },
    { value: '<script>evil</script><p>Good</p>', field: 'bio', expected: '<p>Good</p>' },
    
    // Dangerous URLs that should be blocked
    { value: 'javascript:alert(1)', field: 'url', expected: '' },
    { value: 'data:text/html,<script>alert(1)</script>', field: 'website', expected: '' },
  ];

  const xss = window.GMKB?.services?.xss;
  
  if (!xss) {
    console.error('❌ XSS Sanitizer not found! Make sure the app is loaded.');
    return;
  }

  let passed = 0;
  let failed = 0;

  testCases.forEach((test, index) => {
    console.log(`\nTest ${index + 1}: "${test.value}" (field: ${test.field})`);
    
    // Test type detection
    const detectedType = xss.detectDataType(test.value, test.field);
    console.log(`  Detected type: ${detectedType}`);
    
    // Test sanitization
    const result = xss.sanitizeValue(test.value, test.field);
    const success = result === test.expected;
    
    if (success) {
      console.log(`  ✅ PASSED: "${result}"`);
      passed++;
    } else {
      console.log(`  ❌ FAILED:`);
      console.log(`     Expected: "${test.expected}"`);
      console.log(`     Got: "${result}"`);
      failed++;
    }
  });

  console.log('\n=====================================');
  console.log(`RESULTS: ${passed} passed, ${failed} failed`);
  console.log('=====================================');
  
  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED! URL sanitization is working correctly.');
  } else {
    console.error('⚠️ Some tests failed. Check the sanitizer configuration.');
  }
}

// Test component data sanitization
function testComponentData() {
  console.log('\n=====================================');
  console.log('🧪 TESTING COMPONENT DATA SANITIZATION');
  console.log('=====================================\n');

  const xss = window.GMKB?.services?.xss;
  
  if (!xss) {
    console.error('❌ XSS Sanitizer not found!');
    return;
  }

  const componentData = {
    // URLs that should remain intact
    website: 'https://example.com',
    '1_website': 'https://site.com',
    linkedin: 'https://linkedin.com/in/user',
    headshot: '/uploads/photo.jpg',
    
    // Text that should be escaped
    first_name: 'John',
    last_name: 'Doe & Associates',
    company: '<Corporate> Solutions',
    
    // HTML content
    biography: '<p>Professional <strong>biography</strong></p>',
    
    // Nested data
    photo: {
      url: 'https://cdn.example.com/image.jpg',
      caption: 'Profile <photo>',
      alt: 'John & Jane'
    }
  };

  console.log('Input data:', componentData);
  
  const sanitized = xss.sanitizeComponentData(componentData);
  
  console.log('\nSanitized data:', sanitized);
  
  // Check specific fields
  console.log('\n✅ URL fields preserved:');
  console.log(`  website: ${sanitized.website === componentData.website ? '✓' : '✗'}`);
  console.log(`  linkedin: ${sanitized.linkedin === componentData.linkedin ? '✓' : '✗'}`);
  console.log(`  headshot: ${sanitized.headshot === componentData.headshot ? '✓' : '✗'}`);
  
  console.log('\n✅ Text fields escaped:');
  console.log(`  last_name: "${sanitized.last_name}"`);
  console.log(`  company: "${sanitized.company}"`);
  
  console.log('\n✅ HTML content sanitized:');
  console.log(`  biography: "${sanitized.biography}"`);
  
  console.log('\n✅ Nested data handled:');
  console.log(`  photo.url: ${sanitized.photo.url === componentData.photo.url ? '✓' : '✗'}`);
  console.log(`  photo.caption: "${sanitized.photo.caption}"`);
}

// Run tests
console.log('🚀 Starting URL Sanitization Tests...\n');
testSanitizer();
testComponentData();

// Provide helper for manual testing
console.log('\n📝 For manual testing, use:');
console.log('  GMKB.debugSanitization("https://example.com", "website")');
console.log('  GMKB.debugSanitization("John & Jane", "company")');
