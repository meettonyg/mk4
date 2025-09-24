/**
 * Test Vue Integration
 * Run this after npm install to verify Vue is working
 */

import { createApp } from 'vue';
import { createPinia } from 'pinia';

console.log('Testing Vue 3 integration...');

try {
  // Test Vue
  const app = createApp({
    template: '<div>Vue is working!</div>'
  });
  
  console.log('✅ Vue 3 imported successfully');
  
  // Test Pinia
  const pinia = createPinia();
  app.use(pinia);
  
  console.log('✅ Pinia imported successfully');
  
  console.log('\n🎉 All Vue dependencies are working correctly!');
  console.log('You can now run: npm run build');
  
} catch (error) {
  console.error('❌ Error testing Vue integration:', error);
  console.log('\nPlease run: npm install');
}
