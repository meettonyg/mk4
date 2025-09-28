<template>
  <div class="gmkb-loading-screen">
    <div class="loading-container">
      <div class="loading-logo">
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <rect width="60" height="60" rx="12" fill="var(--color-primary, #1a73e8)" fill-opacity="0.1"/>
          <path d="M30 15L40 25L30 35L20 25L30 15Z" fill="var(--color-primary, #1a73e8)"/>
        </svg>
      </div>
      
      <h2 class="loading-title">Loading Media Kit Builder</h2>
      <p class="loading-message">{{ message }}</p>
      
      <div class="loading-progress">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
        </div>
        <span class="progress-text">{{ progress }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  progress: {
    type: Number,
    default: 0,
    validator: (value) => value >= 0 && value <= 100
  }
});

const message = computed(() => {
  if (props.progress < 25) return 'Initializing...';
  if (props.progress < 50) return 'Loading components...';
  if (props.progress < 75) return 'Fetching data...';
  if (props.progress < 100) return 'Applying theme...';
  return 'Almost ready...';
});
</script>

<style scoped>
.gmkb-loading-screen {
  position: fixed;
  inset: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.loading-container {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 90%;
}

.loading-logo {
  margin-bottom: 1.5rem;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.loading-title {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
}

.loading-message {
  margin: 0 0 1.5rem;
  color: #666;
  font-size: 0.875rem;
}

.loading-progress {
  position: relative;
}

.progress-bar {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  transition: width 0.3s ease-out;
}

.progress-text {
  font-size: 0.75rem;
  color: #666;
  font-weight: 600;
}
</style>
