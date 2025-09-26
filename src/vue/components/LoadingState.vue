<template>
  <div class="loading-state">
    <div class="loading-state__spinner">
      <svg class="spinner" viewBox="0 0 50 50">
        <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="4"></circle>
      </svg>
    </div>
    <h3 class="loading-state__title">Loading Your Media Kit</h3>
    <p class="loading-state__message">Fetching components and settings...</p>
  </div>
</template>

<script setup>
// Simple loading state component
</script>

<style scoped>
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.loading-state__spinner {
  margin-bottom: 24px;
}

.spinner {
  animation: rotate 2s linear infinite;
  width: 50px;
  height: 50px;
}

.path {
  stroke: var(--gmkb-primary, #3b82f6);
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}

.loading-state__title {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 600;
  color: var(--gmkb-text-primary, #111827);
}

.loading-state__message {
  margin: 0;
  font-size: 14px;
  color: var(--gmkb-text-secondary, #6b7280);
}
</style>
