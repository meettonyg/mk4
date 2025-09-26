#!/usr/bin/env node

/**
 * CSS Variable Compliance Checker
 * Verifies that all Vue components are using CSS variables instead of hardcoded styles
 */

const fs = require('fs');
const path = require('path');

// Components to check
const components = [
  'hero', 'biography', 'topics', 'contact', 'social', 'testimonials',
  'call-to-action', 'questions', 'stats', 'video-intro', 'photo-gallery',
  'podcast-player', 'booking-calendar', 'authority-hook', 'guest-intro', 'logo-grid'
];

// Patterns to check for hardcoded values
const hardcodedPatterns = {
  colors: /#(?:[0-9a-fA-F]{3}){1,2}(?![0-9a-fA-F])/g,  // Hex colors
  rgb: /rgb\([^)]+\)/g,                                 // RGB colors
  rgba: /rgba\([^)]+\)/g,                              // RGBA colors
  fonts: /font-family:\s*['"](?!var)[^'"]+['"]/g,     // Font families not using var
  spacing: /(?:padding|margin):\s*\d+px/g,            // Fixed spacing
};

// Allowed exceptions (e.g., white, transparent, inherit)
const allowedValues = [
  'white', 'transparent', 'inherit', 'none', 'auto', 'currentColor',
  '0', '0px', '100%', '50%', 'rgba(0, 0, 0, 0)', 'rgba(255, 255, 255, 0)'
];

function checkComponent(componentName) {
  const filePath = path.join(__dirname, '..', 'components', componentName, `${componentName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}Renderer.vue`);
  
  if (!fs.existsSync(filePath)) {
    return { 
      component: componentName, 
      status: 'NOT_FOUND', 
      issues: [] 
    };
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const styleMatch = content.match(/<style[^>]*>([\s\S]*?)<\/style>/);
  
  if (!styleMatch) {
    return { 
      component: componentName, 
      status: 'NO_STYLES', 
      issues: [] 
    };
  }
  
  const styles = styleMatch[1];
  const issues = [];
  
  // Check for hardcoded colors
  const hexColors = styles.match(hardcodedPatterns.colors) || [];
  hexColors.forEach(color => {
    if (!isAllowedException(color)) {
      issues.push({ type: 'HEX_COLOR', value: color });
    }
  });
  
  // Check for RGB/RGBA
  const rgbColors = styles.match(hardcodedPatterns.rgb) || [];
  const rgbaColors = styles.match(hardcodedPatterns.rgba) || [];
  [...rgbColors, ...rgbaColors].forEach(color => {
    if (!isAllowedException(color)) {
      issues.push({ type: 'RGB_COLOR', value: color });
    }
  });
  
  // Check for CSS variables usage
  const hasVarUsage = styles.includes('var(--gmkb-');
  
  return {
    component: componentName,
    status: issues.length === 0 ? 'COMPLIANT' : 'NON_COMPLIANT',
    hasVarUsage,
    issues
  };
}

function isAllowedException(value) {
  const normalizedValue = value.toLowerCase().trim();
  return allowedValues.some(allowed => normalizedValue.includes(allowed));
}

// Main execution
console.log('🔍 CSS Variable Compliance Check\n');
console.log('=' .repeat(60));

const results = components.map(checkComponent);

// Summary
const compliant = results.filter(r => r.status === 'COMPLIANT');
const nonCompliant = results.filter(r => r.status === 'NON_COMPLIANT');
const notFound = results.filter(r => r.status === 'NOT_FOUND');

console.log('\n📊 Summary:');
console.log(`✅ Compliant: ${compliant.length}/${components.length}`);
console.log(`❌ Non-compliant: ${nonCompliant.length}/${components.length}`);
console.log(`❓ Not found: ${notFound.length}/${components.length}`);

// Detailed results
if (nonCompliant.length > 0) {
  console.log('\n⚠️ Components with issues:');
  nonCompliant.forEach(result => {
    console.log(`\n  ${result.component}:`);
    result.issues.forEach(issue => {
      console.log(`    - ${issue.type}: ${issue.value}`);
    });
  });
}

if (compliant.length > 0) {
  console.log('\n✅ Compliant components:');
  compliant.forEach(result => {
    console.log(`  - ${result.component} ${result.hasVarUsage ? '(uses CSS vars)' : ''}`);
  });
}

// Exit with appropriate code
process.exit(nonCompliant.length > 0 ? 1 : 0);
