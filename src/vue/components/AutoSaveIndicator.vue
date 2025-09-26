<template>
  <div class="autosave-indicator" :class="indicatorClass">
    <svg v-if="isSaving" class="spinner" width="14" height="14" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="60" stroke-dashoffset="20">
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
      </circle>
    </svg>
    <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M9 11l3 3L22 4"></path>
    </svg>
    <span>{{ statusText }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  lastSaved: {
    type: Date,
    default: null
  },
  isSaving: {
    type: Boolean,
    default: false
  }
});

const indicatorClass = computed(() => ({
  'autosave-indicator--saving': props.isSaving,
  'autosave-indicator--saved': !props.isSaving && props.lastSaved
}));

const statusText = computed(() => {
  if (props.isSaving) {
    return 'Saving...';
  }
  if (props.lastSaved) {
    const now = new Date();
    const diff = Math.floor((now - props.lastSaved) / 1000);
    
    if (diff < 5) return 'Saved';
    if (diff < 60) return `Saved ${diff}s ago`;
    if (diff < 3600) return `Saved ${Math.floor(diff / 60)}m ago`;
    return `Saved ${Math.floor(diff / 3600)}h ago`;
  }
  return 'Not saved';
});
</script>

<style scoped>
.autosave-indicator {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 8px 16px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #6b7280;
  z-index: 1000;
}

.autosave-indicator--saving {
  color: #3b82f6;
}

.autosave-indicator--saved {
  color: #10b981;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
