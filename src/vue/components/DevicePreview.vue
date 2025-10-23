<template>
  <div class="device-preview">
    <button 
      v-for="device in devices" 
      :key="device.value"
      :class="['device-preview__btn', { 'device-preview__btn--active': currentDevice === device.value }]"
      @click="setDevice(device.value)"
      :title="`Preview as ${device.label} (${device.width}px)`"
    >
      <span class="device-icon" v-html="device.icon"></span>
      <span class="device-label">{{ device.label }}</span>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';

const devices = [
  { 
    value: 'desktop', 
    label: 'Desktop', 
    width: '100%',
    maxWidth: null,
    icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>'
  },
  { 
    value: 'tablet', 
    label: 'Tablet', 
    width: '768px',
    maxWidth: '768px',
    icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="18" r="1"/></svg>'
  },
  { 
    value: 'mobile', 
    label: 'Mobile', 
    width: '375px',
    maxWidth: '375px',
    icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="7" y="2" width="10" height="20" rx="2"/><circle cx="12" cy="18" r="1"/></svg>'
  }
];

const currentDevice = ref('desktop');

const setDevice = (device) => {
  currentDevice.value = device;
  const deviceData = devices.find(d => d.value === device);
  
  if (!deviceData) {
    console.warn('Device data not found for:', device);
    return;
  }
  
  // ROOT FIX: Target the correct elements from the template
  const previewArea = document.getElementById('media-kit-preview');
  const mainContent = document.getElementById('gmkb-main-content');
  
  if (!previewArea) {
    console.warn('Preview area (#media-kit-preview) not found');
    return;
  }
  
  // Remove all device classes - FIX: Use correct class names
  previewArea.classList.remove('device-desktop', 'device-tablet', 'device-mobile');
  previewArea.classList.remove('gmkb-device--desktop', 'gmkb-device--tablet', 'gmkb-device--mobile');
  if (mainContent) {
    mainContent.classList.remove('device-desktop', 'device-tablet', 'device-mobile');
    mainContent.classList.remove('gmkb-device--desktop', 'gmkb-device--tablet', 'gmkb-device--mobile');
  }
  
  // Add current device class - Use BOTH naming conventions
  previewArea.classList.add(`device-${device}`);
  previewArea.classList.add(`gmkb-device--${device}`);
  if (mainContent) {
    mainContent.classList.add(`device-${device}`);
    mainContent.classList.add(`gmkb-device--${device}`);
  }
  
  // Apply width constraints to preview area
  if (deviceData.maxWidth) {
    previewArea.style.maxWidth = deviceData.maxWidth;
    previewArea.style.margin = '0 auto';
    previewArea.style.boxShadow = '0 0 20px rgba(0,0,0,0.1)';
    previewArea.style.transition = 'all 0.3s ease';
  } else {
    previewArea.style.maxWidth = '';
    previewArea.style.margin = '';
    previewArea.style.boxShadow = '';
  }
  
  // ROOT FIX: Override inline styles for ALL layout elements
  const overrideLayoutStyles = () => {
    // Find ALL elements that might be layouts
    const layouts = previewArea.querySelectorAll(
      '.layout-two-column, .layout-three-column, .layout-main-sidebar, .layout-sidebar-main, ' +
      '[class*="layout-two-column"], [class*="layout-three-column"], ' +
      '.gmkb-section__content'
    );
    
    if (device === 'mobile') {
      layouts.forEach(layout => {
        // Check if this is a two-column or three-column layout
        if (layout.className.includes('two-column') || 
            layout.className.includes('three-column') ||
            layout.className.includes('main-sidebar') ||
            layout.className.includes('sidebar-main')) {
          // Force single column
          layout.style.display = 'grid';
          layout.style.gridTemplateColumns = '1fr';
          layout.style.gap = '2rem';
          console.log('📱 Forced mobile layout on:', layout.className);
        }
      });
    } else if (device === 'tablet') {
      layouts.forEach(layout => {
        if (layout.className.includes('three-column')) {
          layout.style.display = 'grid';
          layout.style.gridTemplateColumns = 'repeat(2, 1fr)';
          layout.style.gap = '2rem';
        } else if (layout.className.includes('two-column') || 
                   layout.className.includes('main-sidebar') ||
                   layout.className.includes('sidebar-main')) {
          // Reset two-column layouts
          layout.style.display = '';
          layout.style.gridTemplateColumns = '';
          layout.style.gap = '';
        }
      });
    } else {
      // Desktop - remove all inline overrides
      layouts.forEach(layout => {
        layout.style.display = '';
        layout.style.gridTemplateColumns = '';
        layout.style.gap = '';
      });
    }
  };
  
  // Apply immediately
  overrideLayoutStyles();
  
  // Also apply after delays to override any async recalculations
  setTimeout(overrideLayoutStyles, 100);
  setTimeout(overrideLayoutStyles, 300);
  setTimeout(overrideLayoutStyles, 500);
  
  // Watch for changes and reapply (handles dynamic recalculations)
  if (device !== 'desktop') {
    // Set up observer to maintain our overrides
    if (window.devicePreviewObserver) {
      window.devicePreviewObserver.disconnect();
    }
    
    window.devicePreviewObserver = new MutationObserver((mutations) => {
      // Only reapply if styles were changed
      let needsOverride = false;
      mutations.forEach(m => {
        if (m.attributeName === 'style' && m.target.style.gridTemplateColumns !== '1fr') {
          needsOverride = true;
        }
      });
      if (needsOverride) {
        overrideLayoutStyles();
      }
    });
    
    // Observe ALL potential layout elements
    const allLayouts = previewArea.querySelectorAll('[class*="layout"], .gmkb-section__content');
    allLayouts.forEach(layout => {
      window.devicePreviewObserver.observe(layout, {
        attributes: true,
        attributeFilter: ['style']
      });
    });
    
    console.log(`✅ Monitoring ${allLayouts.length} layout elements for changes`);
  } else if (window.devicePreviewObserver) {
    // Clean up observer on desktop
    window.devicePreviewObserver.disconnect();
    window.devicePreviewObserver = null;
  }
  
  // Dispatch event for other components
  document.dispatchEvent(new CustomEvent('gmkb:device-changed', {
    detail: { device, width: deviceData.width, maxWidth: deviceData.maxWidth }
  }));
  
  console.log(`📱 Device preview changed to: ${device} (${deviceData.width})`);
};

// Initialize on mount
onMounted(() => {
  // ROOT FIX: Wait for DOM to be ready before applying device styles
  // The preview area might not be mounted yet if Teleport hasn't completed
  const initializeDevice = () => {
    const previewArea = document.getElementById('media-kit-preview');
    if (previewArea) {
      setDevice('desktop');
      console.log('✅ Device Preview component mounted and initialized');
    } else {
      console.warn('Preview area not ready, retrying in 100ms...');
      setTimeout(initializeDevice, 100);
    }
  };
  
  initializeDevice();
});

// ROOT FIX: Store handler reference for proper cleanup
let keyboardHandler = null;

// Setup keyboard shortcuts
keyboardHandler = (e) => {
  if (e.ctrlKey || e.metaKey) {
    if (e.key === '1') {
      e.preventDefault();
      setDevice('desktop');
    } else if (e.key === '2') {
      e.preventDefault();
      setDevice('tablet');
    } else if (e.key === '3') {
      e.preventDefault();
      setDevice('mobile');
    }
  }
};

// ROOT FIX: Add keyboard handler in onMounted
onMounted(() => {
  document.addEventListener('keydown', keyboardHandler);
  console.log('✅ Device preview keyboard shortcuts enabled');
});

// ROOT FIX: Proper cleanup in onUnmounted
onUnmounted(() => {
  if (keyboardHandler) {
    document.removeEventListener('keydown', keyboardHandler);
    console.log('✅ Device preview keyboard shortcuts cleaned up');
  }
});
</script>

<style scoped>
.device-preview {
  display: flex;
  gap: 4px;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 8px;
  padding: 4px;
}

.device-preview__btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  transition: all 0.2s ease;
  position: relative;
}

.device-preview__btn:hover {
  background: rgba(59, 130, 246, 0.08);
  color: #3b82f6;
}

.device-preview__btn--active {
  background: #ffffff;
  color: #1e293b;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.device-icon {
  display: flex;
  align-items: center;
}

.device-icon :deep(svg) {
  display: block;
}

.device-label {
  font-size: 13px;
  font-weight: 500;
}

/* Responsive - hide labels on small screens */
@media (max-width: 768px) {
  .device-label {
    display: none;
  }
  
  .device-preview__btn {
    padding: 8px 12px;
  }
}
</style>
