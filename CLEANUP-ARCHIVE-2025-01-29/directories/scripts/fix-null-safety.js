/**
 * Fix Component Null-Safety Issues
 * 
 * This script adds null-safe access to props.data in all components
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const componentsDir = path.join(__dirname, '..', 'components');

const fixes = [
  {
    component: 'biography',
    file: 'BiographyRenderer.vue',
    fixes: [
      {
        search: "return this.data.image_url || this.data.photo || ''",
        replace: "return this.data?.image_url || this.data?.photo || ''"
      }
    ]
  },
  {
    component: 'guest-intro',
    file: 'GuestIntroRenderer.vue',
    fixes: [
      {
        search: "return props.data.title || `Meet ${fullName.value || 'Your Speaker'}`;",
        replace: "return props.data?.title || `Meet ${fullName.value || 'Your Speaker'}`;"
      }
    ]
  },
  {
    component: 'questions',
    file: 'QuestionsRenderer.vue',
    fixes: [
      {
        search: "return props.data.title || 'Frequently Asked Questions';",
        replace: "return props.data?.title || 'Frequently Asked Questions';"
      }
    ]
  },
  {
    component: 'topics',
    file: 'TopicsRenderer.vue',
    fixes: [
      {
        search: "return props.data.title || 'Speaking Topics';",
        replace: "return props.data?.title || 'Speaking Topics';"
      }
    ]
  }
];

console.log('🔧 Fixing null-safety issues in components...\n');

let fixed = 0;
let errors = 0;

fixes.forEach(({ component, file, fixes: componentFixes }) => {
  const filePath = path.join(componentsDir, component, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⏭️  ${component}/${file}: File not found, skipping`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  componentFixes.forEach(({ search, replace }) => {
    if (content.includes(search)) {
      content = content.replace(search, replace);
      changed = true;
    }
  });
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${component}/${file}: Fixed`);
    fixed++;
  } else {
    console.log(`⏭️  ${component}/${file}: No changes needed`);
  }
});

console.log(`\n📊 Summary:`);
console.log(`   Fixed: ${fixed} files`);
console.log(`   Errors: ${errors} files`);
console.log(`\n✅ Null-safety fixes complete!`);
console.log(`\nRun tests again: npm test`);
