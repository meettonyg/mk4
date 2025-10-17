#!/usr/bin/env node

/**
 * HTML Structure Audit Script
 * Checks all component renderers for correct HTML structure
 * 
 * Required structure:
 * <div class="gmkb-component" data-component-id="...">
 *   <div class="component-root [type]-content">
 *     <!-- Component content -->
 *   </div>
 * </div>
 */

const fs = require('fs');
const path = require('path');

const COMPONENTS = [
  'biography', 'hero', 'topics', 'contact', 'social', 'stats',
  'testimonials', 'questions', 'photo-gallery', 'video-intro',
  'podcast-player', 'logo-grid', 'call-to-action', 'booking-calendar',
  'guest-intro', 'topics-questions'
];

const COMPONENTS_DIR = path.join(__dirname, '../components');

console.log('🔍 HTML Structure Audit\n');
console.log('Checking all component renderers for proper HTML structure...\n');

let passCount = 0;
let failCount = 0;
const failedComponents = [];

COMPONENTS.forEach(comp => {
  const componentName = comp.split('-').map(w => 
    w.charAt(0).toUpperCase() + w.slice(1)
  ).join('');
  
  const filename = `${componentName}Renderer.vue`;
  const filepath = path.join(COMPONENTS_DIR, comp, filename);
  
  if (!fs.existsSync(filepath)) {
    console.log(`⚠️  ${comp}: File not found at ${filepath}`);
    failCount++;
    failedComponents.push({ name: comp, reason: 'File not found' });
    return;
  }
  
  const content = fs.readFileSync(filepath, 'utf8');
  
  const checks = {
    hasComponentRoot: content.includes('component-root'),
    hasDataComponentId: content.includes('data-component-id'),
    hasGmkbComponent: content.includes('gmkb-component')
  };
  
  const allPass = Object.values(checks).every(v => v);
  
  if (allPass) {
    console.log(`✅ ${comp}`);
    passCount++;
  } else {
    console.log(`❌ ${comp}`);
    const issues = [];
    if (!checks.hasComponentRoot) {
      console.log(`   Missing: .component-root`);
      issues.push('.component-root');
    }
    if (!checks.hasDataComponentId) {
      console.log(`   Missing: data-component-id`);
      issues.push('data-component-id');
    }
    if (!checks.hasGmkbComponent) {
      console.log(`   Missing: .gmkb-component`);
      issues.push('.gmkb-component');
    }
    failCount++;
    failedComponents.push({ name: comp, issues });
  }
});

console.log(`\n${'='.repeat(60)}`);
console.log(`📊 Results: ${passCount} passed, ${failCount} failed`);
console.log(`${'='.repeat(60)}\n`);

if (failCount > 0) {
  console.log('⚠️  Components that need HTML structure fixes:\n');
  failedComponents.forEach(({ name, issues, reason }) => {
    console.log(`  • ${name}`);
    if (reason) {
      console.log(`    Reason: ${reason}`);
    } else if (issues) {
      console.log(`    Missing: ${issues.join(', ')}`);
    }
  });
  console.log('\n');
  process.exit(1);
} else {
  console.log('✅ All components have correct HTML structure!');
  process.exit(0);
}
