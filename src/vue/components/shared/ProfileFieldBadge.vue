<template>
  <span
    v-if="show"
    class="profile-field-badge"
    :class="{ 'profile-field-badge--compact': compact }"
    :title="title"
  >
    <svg
      v-if="showIcon"
      class="profile-field-badge__icon"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
    <span v-if="showText" class="profile-field-badge__text">{{ text }}</span>
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  /**
   * Whether to show the badge
   */
  show: {
    type: Boolean,
    default: false
  },
  /**
   * Badge text
   */
  text: {
    type: String,
    default: 'from profile'
  },
  /**
   * Tooltip title
   */
  title: {
    type: String,
    default: 'This value was loaded from your profile'
  },
  /**
   * Compact mode - icon only
   */
  compact: {
    type: Boolean,
    default: false
  },
  /**
   * Show icon
   */
  showIcon: {
    type: Boolean,
    default: true
  },
  /**
   * Show text (ignored in compact mode)
   */
  showText: {
    type: Boolean,
    default: true
  }
});

// In compact mode, never show text
const showText = computed(() => props.showText && !props.compact);
</script>

<style scoped>
.profile-field-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 500;
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 4px;
  white-space: nowrap;
  vertical-align: middle;
  cursor: help;
  transition: all 0.2s ease;
}

.profile-field-badge:hover {
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.3);
}

.profile-field-badge--compact {
  padding: 2px 4px;
}

.profile-field-badge__icon {
  flex-shrink: 0;
}

.profile-field-badge__text {
  line-height: 1;
}

/* Dark mode support */
:global(body.dark-mode) .profile-field-badge {
  color: #34d399;
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.25);
}

:global(body.dark-mode) .profile-field-badge:hover {
  background: rgba(16, 185, 129, 0.2);
  border-color: rgba(16, 185, 129, 0.35);
}

/* Inline with label usage */
.profile-field-badge--inline {
  margin-left: 8px;
}
</style>
