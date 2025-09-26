<template>
  <div class="error-state">
    <div class="error-state__icon">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    </div>
    <h3 class="error-state__title">Something went wrong</h3>
    <p class="error-state__message">{{ message || 'Failed to load media kit data' }}</p>
    <button class="error-state__retry-btn" @click="$emit('retry')">
      Try Again
    </button>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    default: ''
  }
});

defineEmits(['retry']);
</script>

<style scoped>
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.error-state__icon {
  margin-bottom: 24px;
  color: #ef4444;
}

.error-state__title {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 600;
  color: #111827;
}

.error-state__message {
  margin: 0 0 24px;
  font-size: 14px;
  color: #6b7280;
  max-width: 400px;
}

.error-state__retry-btn {
  padding: 10px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.error-state__retry-btn:hover {
  background: #2563eb;
}
</style>
