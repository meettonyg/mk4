import { glob } from 'glob';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('='.repeat(60));
console.log('GLOB PATTERN TESTING');
console.log('='.repeat(60));
console.log('');

// Test different patterns
const patterns = [
  'components/*/*Renderer.vue',
  'components/**/*Renderer.vue',
  'components/**/ProfilePhotoRenderer.vue'
];

patterns.forEach(pattern => {
  const fullPattern = path.join(__dirname, pattern);
  const normalizedPattern = pattern.replace(/\\/g, '/'); // Force forward slashes
  
  console.log(`Testing: ${pattern}`);
  console.log(`  Full path: ${fullPattern}`);
  console.log(`  Normalized: ${normalizedPattern}`);
  
  // Try with path.join (OS-specific)
  let files = glob.sync(fullPattern);
  console.log(`  Found (OS-specific): ${files.length} files`);
  
  // Try with forward slashes
  files = glob.sync(path.join(__dirname, normalizedPattern));
  console.log(`  Found (normalized): ${files.length} files`);
  
  if (files.length > 0) {
    console.log(`  Sample files:`);
    files.slice(0, 3).forEach(f => {
      console.log(`    - ${path.relative(__dirname, f)}`);
    });
  }
  console.log('');
});

// Direct check
console.log('Direct file check:');
const profilePhotoPath = path.join(__dirname, 'components/profile-photo/ProfilePhotoRenderer.vue');
const fs = await import('fs');
const exists = fs.existsSync(profilePhotoPath);
console.log(`  ${profilePhotoPath}`);
console.log(`  Exists: ${exists}`);

if (exists) {
  const stats = fs.statSync(profilePhotoPath);
  console.log(`  Size: ${stats.size} bytes`);
  console.log(`  Modified: ${stats.mtime}`);
}
