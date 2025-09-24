// Test file to verify Vue component imports are working
import { createApp } from 'vue';

// Try to import our new components
try {
  const ControlsOverlay = await import('./vue/controls/ControlsOverlay.vue');
  console.log('✅ ControlsOverlay imported successfully:', ControlsOverlay);
} catch (error) {
  console.error('❌ Failed to import ControlsOverlay:', error);
}

try {
  const SectionControls = await import('./vue/controls/SectionControls.vue');
  console.log('✅ SectionControls imported successfully:', SectionControls);
} catch (error) {
  console.error('❌ Failed to import SectionControls:', error);
}

try {
  const ComponentControls = await import('./vue/controls/ComponentControls.vue');
  console.log('✅ ComponentControls imported successfully:', ComponentControls);
} catch (error) {
  console.error('❌ Failed to import ComponentControls:', error);
}

console.log('Test complete - check console for import results');
