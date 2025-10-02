<template>
  <div class="loading-screen">
    <div class="loading-screen__content">
      <div class="loading-screen__spinner"></div>
      <h2 class="loading-screen__title">{{ title }}</h2>
      <p class="loading-screen__message">{{ message }}</p>

      <!-- Show retry info if retrying -->
      <div v-if="retryAttempt > 0" class="loading-screen__retry">
        <p>Attempt {{ retryAttempt }} of {{ maxRetries }}</p>
        <p class="loading-screen__retry-detail">{{ retryMessage }}</p>
      </div>

      <!-- Progress bar if available -->
      <div v-if="progress > 0" class="loading-screen__progress">
        <div class="loading-screen__progress-bar" :style="{ width: progress + '%' }"></div>
      </div>

      <!-- Action buttons if needed -->
      <div v-if="showReload" class="loading-screen__actions">
        <button @click="handleReload" class="loading-screen__button">
          Reload Page
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: 'Loading Media Kit Builder'
  },
  message: {
    type: String,
    default: 'Please wait while we load your media kit...'
  },
  progress: {
    type: Number,
    default: 0
  },
  showReload: {
    type: Boolean,
    default: false
  }
});

const retryAttempt = ref(0);
const maxRetries = ref(3);
const retryMessage = ref('');

// Listen for retry events
const handleRetry = (event) => {
  retryAttempt.value = event.detail.attempt;
  maxRetries.value = event.detail.max;
  retryMessage.value = event.detail.error || 'Retrying...';
};

const handleReload = () => {
  location.reload();
};

onMounted(() => {
  document.addEventListener('gmkb:load-retry', handleRetry);
});

onUnmounted(() => {
  document.removeEventListener('gmkb:load-retry', handleRetry);
});
</script>

<style scoped>
.loading-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.loading-screen__content {
  text-align: center;
  color: white;
  max-width: 500px;
  padding: 40px;
}

.loading-screen__spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 30px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-screen__title {
  font-size: 28px;
  margin: 0 0 12px;
  font-weight: 600;
}

.loading-screen__message {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
}

.loading-screen__retry {
  margin-top: 20px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-size: 14px;
}

.loading-screen__retry p {
  margin: 0 0 8px;
}

.loading-screen__retry-detail {
  margin-top: 8px;
  font-size: 13px;
  opacity: 0.8;
}

.loading-screen__progress {
  margin-top: 24px;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
}

.loading-screen__progress-bar {
  height: 100%;
  background: white;
  transition: width 0.3s ease;
}

.loading-screen__actions {
  margin-top: 24px;
}

.loading-screen__button {
  padding: 12px 24px;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.loading-screen__button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.loading-screen__button:active {
  transform: translateY(0);
}
</style>
