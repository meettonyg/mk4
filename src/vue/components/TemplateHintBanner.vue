<template>
  <Transition name="slide-down">
    <div v-if="isVisible" class="gmkb-hint-banner">
      <div class="gmkb-hint-banner__content">
        <div class="gmkb-hint-banner__icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </div>
        <div class="gmkb-hint-banner__text">
          <strong>This template includes sample content.</strong>
          <span v-if="isLoggedIn">
            Click <button class="gmkb-hint-banner__link" @click="$emit('select-profile')">Profile</button> to use your real data, or edit the placeholders directly.
          </span>
          <span v-else>
            Edit the [placeholder] text directly, or log in to use your profile data.
          </span>
        </div>
      </div>
      <button class="gmkb-hint-banner__dismiss" @click="dismiss" aria-label="Dismiss">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue';

defineProps({
  isLoggedIn: {
    type: Boolean,
    default: false
  }
});

defineEmits(['select-profile', 'dismiss']);

const isVisible = ref(true);
const STORAGE_KEY = 'gmkb_hint_banner_dismissed';

onMounted(() => {
  // Check if user previously dismissed the banner
  const dismissed = localStorage.getItem(STORAGE_KEY);
  if (dismissed === 'true') {
    isVisible.value = false;
  }
});

function dismiss() {
  isVisible.value = false;
  localStorage.setItem(STORAGE_KEY, 'true');
}
</script>

<style>
.gmkb-hint-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-bottom: 1px solid #f59e0b;
  color: #92400e;
}

.gmkb-hint-banner__content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.gmkb-hint-banner__icon {
  flex-shrink: 0;
  color: #d97706;
}

.gmkb-hint-banner__text {
  font-size: 14px;
  line-height: 1.5;
}

.gmkb-hint-banner__text strong {
  font-weight: 600;
  color: #78350f;
}

.gmkb-hint-banner__link {
  background: none;
  border: none;
  padding: 0;
  color: #d97706;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  font-size: inherit;
}

.gmkb-hint-banner__link:hover {
  color: #b45309;
}

.gmkb-hint-banner__dismiss {
  flex-shrink: 0;
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #92400e;
  border-radius: 4px;
  transition: all 0.15s;
}

.gmkb-hint-banner__dismiss:hover {
  background: rgba(146, 64, 14, 0.1);
  color: #78350f;
}

/* Dark mode */
body.dark-mode .gmkb-hint-banner {
  background: linear-gradient(135deg, #422006 0%, #451a03 100%);
  border-bottom-color: #78350f;
  color: #fcd34d;
}

body.dark-mode .gmkb-hint-banner__text strong {
  color: #fef3c7;
}

body.dark-mode .gmkb-hint-banner__icon {
  color: #fbbf24;
}

body.dark-mode .gmkb-hint-banner__link {
  color: #fbbf24;
}

body.dark-mode .gmkb-hint-banner__link:hover {
  color: #fcd34d;
}

body.dark-mode .gmkb-hint-banner__dismiss {
  color: #fcd34d;
}

body.dark-mode .gmkb-hint-banner__dismiss:hover {
  background: rgba(252, 211, 77, 0.1);
  color: #fef3c7;
}

/* Slide animation */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}
</style>
