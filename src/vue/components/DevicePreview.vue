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
import { ref, onMounted, watch } from 'vue';

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
  
  if (!deviceData) return;
  
  // Apply to main content area
  const mainContent = document.querySelector('.gmkb-main-content');
  const previewArea = document.querySelector('.media-kit-preview');
  
  if (mainContent) {
    // Remove all device classes
    mainContent.classList.remove('device-desktop', 'device-tablet', 'device-mobile');
    // Add current device class
    mainContent.classList.add(`device-${device}`);
    
    // Apply width constraints
    if (deviceData.maxWidth) {
      mainContent.style.maxWidth = deviceData.maxWidth;
      mainContent.style.margin = '0 auto';
      mainContent.style.boxShadow = '0 0 20px rgba(0,0,0,0.1)';
    } else {
      mainContent.style.maxWidth = '';
      mainContent.style.margin = '';
      mainContent.style.boxShadow = '';
    }
  }
  
  if (previewArea) {
    previewArea.classList.remove('device-desktop', 'device-tablet', 'device-mobile');
    previewArea.classList.add(`device-${device}`);
  }
  
  // Dispatch event for other components
  document.dispatchEvent(new CustomEvent('gmkb:device-changed', {
    detail: { device, width: deviceData.width }
  }));
  
  console.log(`📱 Device preview changed to: ${device} (${deviceData.width})`);
};

// Initialize on mount
onMounted(() => {
  setDevice('desktop');
  console.log('✅ Device Preview component mounted');
});

// Keyboard shortcuts
onMounted(() => {
  const handleKeyboard = (e) => {
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
  
  document.addEventListener('keydown', handleKeyboard);
  
  return () => {
    document.removeEventListener('keydown', handleKeyboard);
  };
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
