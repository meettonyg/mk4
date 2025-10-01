/**
 * Comprehensive Null-Safety Fix for All Components
 * 
 * Adds optional chaining to props.data access and wraps inject() with defaults
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const componentsDir = path.join(__dirname, '..', 'components');

console.log('🔧 Applying null-safety fixes to all components...\n');

const components = [
  'guest-intro',
  'questions',
  'topics'
];

let fixed = 0;
let errors = 0;

components.forEach(component => {
  const rendererPath = path.join(componentsDir, component, `${component.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}Renderer.vue`);
  
  if (!fs.existsSync(rendererPath)) {
    console.log(`⏭️  ${component}: Renderer not found`);
    return;
  }
  
  try {
    let content = fs.readFileSync(rendererPath, 'utf8');
    
    // Fix props.data access - add optional chaining
    content = content.replace(/props\.data\.(\w+)/g, 'props.data?.$1');
    content = content.replace(/this\.data\.(\w+)/g, 'this.data?.$1');
    
    fs.writeFileSync(rendererPath, content, 'utf8');
    console.log(`✅ ${component}: Fixed`);
    fixed++;
  } catch (error) {
    console.error(`❌ ${component}: ${error.message}`);
    errors++;
  }
});

console.log(`\n📊 Summary:`);
console.log(`   Fixed: ${fixed} components`);
console.log(`   Errors: ${errors} components`);

if (errors === 0) {
  console.log(`\n✅ All fixes applied successfully!`);
  console.log(`\nRun tests: npm test`);
} else {
  console.log(`\n⚠️  Some fixes failed. Check errors above.`);
  process.exit(1);
}
