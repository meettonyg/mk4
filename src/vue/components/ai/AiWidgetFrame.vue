<template>
  <div :class="wrapperClass">
    <div
      class="gmkb-ai-widget"
      :class="{ 'gmkb-ai-widget--loading': isLoading }"
    >
      <!-- Header -->
      <div class="gmkb-ai-widget__header">
        <h3 class="gmkb-ai-widget__title">{{ title }}</h3>
        <p v-if="description" class="gmkb-ai-widget__description">
          {{ description }}
        </p>
      </div>

      <!-- Body (Input Area) -->
      <div class="gmkb-ai-widget__body">
        <slot></slot>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="gmkb-ai-widget__error">
        <AiErrorMessage
          :message="error"
          :retryable="true"
          @retry="$emit('retry')"
        />
      </div>

      <!-- Results Area -->
      <div v-if="hasResults" class="gmkb-ai-widget__results">
        <div class="gmkb-ai-results__header">
          <h4 class="gmkb-ai-results__title">Generated Content</h4>
          <slot name="results-actions"></slot>
        </div>
        <slot name="results"></slot>
      </div>

      <!-- Footer -->
      <div class="gmkb-ai-widget__footer">
        <div class="gmkb-ai-widget__footer-left">
          <!-- Usage Meter (standalone only) -->
          <AiUsageMeter
            v-if="mode === 'standalone' && usageRemaining !== null"
            :remaining="usageRemaining"
            :limit="usageLimit"
            :reset-time="resetTime"
          />
        </div>

        <div class="gmkb-ai-widget__footer-actions">
          <slot name="footer">
            <!-- Integrated Mode Actions -->
            <template v-if="mode === 'integrated'">
              <button
                class="gmkb-ai-button gmkb-ai-button--secondary"
                :disabled="isLoading || !hasResults"
                @click="$emit('regenerate')"
              >
                <svg class="gmkb-ai-button__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 4v6h6M23 20v-6h-6"/>
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                </svg>
                Regenerate
              </button>
              <button
                class="gmkb-ai-button gmkb-ai-button--primary"
                :disabled="isLoading || !hasResults"
                @click="$emit('apply')"
              >
                <svg class="gmkb-ai-button__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Apply to {{ targetComponent }}
              </button>
            </template>

            <!-- Standalone Mode Actions -->
            <template v-else>
              <button
                class="gmkb-ai-button gmkb-ai-button--secondary"
                :disabled="!hasResults"
                @click="handleCopy"
              >
                <svg class="gmkb-ai-button__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                {{ copyButtonText }}
              </button>
            </template>
          </slot>
        </div>
      </div>

      <!-- Lead Gen CTA (standalone only) -->
      <AiLeadGenCta
        v-if="mode === 'standalone' && showCta"
        :variant="ctaVariant"
      />
    </div>

    <!-- Copy Success Toast -->
    <div
      class="gmkb-ai-toast"
      :class="{ 'gmkb-ai-toast--visible': showCopyToast }"
    >
      <svg class="gmkb-ai-toast__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      Copied to clipboard!
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import AiErrorMessage from './AiErrorMessage.vue';
import AiUsageMeter from './AiUsageMeter.vue';
import AiLeadGenCta from './AiLeadGenCta.vue';

const props = defineProps({
  /**
   * Widget title
   */
  title: {
    type: String,
    required: true
  },

  /**
   * Optional description below title
   */
  description: {
    type: String,
    default: ''
  },

  /**
   * Mode: 'integrated' (builder) or 'standalone' (free tools)
   */
  mode: {
    type: String,
    default: 'standalone',
    validator: (v) => ['integrated', 'standalone'].includes(v)
  },

  /**
   * Loading state
   */
  isLoading: {
    type: Boolean,
    default: false
  },

  /**
   * Whether results are available
   */
  hasResults: {
    type: Boolean,
    default: false
  },

  /**
   * Error message to display
   */
  error: {
    type: String,
    default: null
  },

  /**
   * Target component name (integrated mode)
   */
  targetComponent: {
    type: String,
    default: 'Media Kit'
  },

  /**
   * Remaining API usage (standalone mode)
   */
  usageRemaining: {
    type: Number,
    default: null
  },

  /**
   * Total usage limit
   */
  usageLimit: {
    type: Number,
    default: 3
  },

  /**
   * Time until usage resets (seconds)
   */
  resetTime: {
    type: Number,
    default: null
  },

  /**
   * Whether to show lead gen CTA
   */
  showCta: {
    type: Boolean,
    default: true
  },

  /**
   * CTA variant: 'default', 'exhausted', 'compact'
   */
  ctaVariant: {
    type: String,
    default: 'default'
  }
});

const emit = defineEmits(['apply', 'regenerate', 'copy', 'retry']);

// Copy state
const showCopyToast = ref(false);
const copyButtonText = ref('Copy to Clipboard');

/**
 * Wrapper class based on mode
 * - standalone: uses gmkb-standalone-scope (full CSS reset for public pages)
 * - integrated: uses gmkb-integrated-scope (lighter styling for builder modal)
 */
const wrapperClass = computed(() => {
  return props.mode === 'standalone' ? 'gmkb-standalone-scope' : 'gmkb-integrated-scope';
});

/**
 * Handle copy button click
 */
const handleCopy = async () => {
  emit('copy');

  // Show success feedback
  copyButtonText.value = 'Copied!';
  showCopyToast.value = true;

  setTimeout(() => {
    copyButtonText.value = 'Copy to Clipboard';
    showCopyToast.value = false;
  }, 2000);
};
</script>

<style>
/* Import integrated mode styles (non-scoped for class-based styling) */
@import '@/styles/ai-integrated.css';
</style>

<style scoped>
/* Component-specific styles that enhance the shared styles */
.gmkb-ai-widget__error {
  padding: 0 24px;
}

.gmkb-ai-widget__footer-left {
  flex: 1;
}

.gmkb-ai-button__icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
</style>
