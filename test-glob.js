import { glob } from 'glob';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Test the exact glob pattern used in UnifiedComponentRegistry
const pattern = path.join(__dirname, 'components/*/*Renderer.vue');

console.log('Testing glob pattern:', pattern);
console.log('');

const files = glob.sync(pattern);

console.log(`Found ${files.length} Renderer.vue files:`);
files.forEach((file, index) => {
  const componentName = path.basename(path.dirname(file));
  console.log(`${index + 1}. ${componentName} -> ${path.basename(file)}`);
});

console.log('');
console.log('Looking specifically for profile-photo...');
const profilePhotoFile = files.find(f => f.includes('profile-photo'));
if (profilePhotoFile) {
  console.log('✅ FOUND:', profilePhotoFile);
} else {
  console.log('❌ NOT FOUND');
}
