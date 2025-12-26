<template>
  <div class="gmkb-tool-embed">
    <!-- Intent Tabs -->
    <div v-if="intents && intents.length > 0" class="gmkb-intent-tabs" role="tablist">
      <button
        v-for="intent in intents"
        :key="intent.id"
        class="gmkb-intent-tab"
        :class="{ active: currentIntentId === intent.id }"
        role="tab"
        :aria-selected="currentIntentId === intent.id"
        @click="selectIntent(intent.id)"
      >
        {{ intent.label }}
      </button>
    </div>

    <!-- Tool Stage (2-column layout) -->
    <div class="gmkb-tool-stage">
      <!-- Left: Context & Form -->
      <div class="tool-context">
        <!-- Dynamic Context Header -->
        <h3 class="tool-context__heading">{{ currentIntent?.contextHeading || defaultHeading }}</h3>
        <p class="tool-context__description">{{ currentIntent?.contextDescription || defaultDescription }}</p>

        <!-- Generator Form Slot -->
        <div class="tool-context__form">
          <slot
            name="form"
            :intent="currentIntent"
            :placeholders="currentIntent?.formPlaceholders || {}"
            :labels="currentIntent?.formLabels || {}"
          ></slot>
        </div>

        <!-- Generate Action -->
        <div class="tool-context__actions">
          <button
            class="gmkb-btn-generate"
            type="button"
            :disabled="isGenerating || !canGenerate"
            @click="$emit('generate')"
          >
            <span v-if="!isGenerating" class="gmkb-btn-icon">✨</span>
            <span v-if="isGenerating" class="gmkb-btn-spinner"></span>
            {{ isGenerating ? generatingText : generateButtonText }}
          </button>
        </div>

        <!-- Rate Limit / Progressive Friction -->
        <p class="tool-context__limit-text">
          {{ rateLimitText }}
          <br />
          <strong>{{ upgradeText }}</strong>
        </p>
      </div>

      <!-- Right: Preview Area -->
      <div class="tool-preview-area">
        <div class="preview-card">
          <!-- Preview Header -->
          <div class="preview-label">{{ previewLabel }}</div>

          <!-- Preview Content Slot -->
          <div class="preview-content">
            <slot name="preview">
              <p class="preview-hook">
                {{ previewContent || defaultPreviewContent }}
              </p>
            </slot>
          </div>

          <!-- Preview Footer / CTA -->
          <p v-if="showSaveCta" class="preview-subtext">
            {{ saveCtaPrefix }}
            <a href="#" @click.prevent="$emit('save-click')">{{ saveCtaLink }}</a>
            {{ saveCtaSuffix }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  /**
   * Array of intent objects for tab navigation
   * Each intent: { id, label, contextHeading, contextDescription, formPlaceholders, formLabels }
   */
  intents: {
    type: Array,
    default: () => []
  },

  /**
   * Default heading when no intent is selected
   */
  defaultHeading: {
    type: String,
    default: 'Create your hook'
  },

  /**
   * Default description when no intent is selected
   */
  defaultDescription: {
    type: String,
    default: 'Fill in the fields below to generate your hook.'
  },

  /**
   * Whether the generator is currently processing
   */
  isGenerating: {
    type: Boolean,
    default: false
  },

  /**
   * Whether the generate button should be enabled
   */
  canGenerate: {
    type: Boolean,
    default: true
  },

  /**
   * Text for the generate button
   */
  generateButtonText: {
    type: String,
    default: 'Generate Authority Hook'
  },

  /**
   * Text shown while generating
   */
  generatingText: {
    type: String,
    default: 'Generating...'
  },

  /**
   * Rate limit messaging
   */
  rateLimitText: {
    type: String,
    default: 'Generate up to 3 hooks per day, no signup required.'
  },

  /**
   * Upgrade prompt text
   */
  upgradeText: {
    type: String,
    default: 'Create a free Guestify account to save and reuse your best hooks.'
  },

  /**
   * Label shown above preview
   */
  previewLabel: {
    type: String,
    default: 'Sample Authority Hook'
  },

  /**
   * Content to show in preview
   */
  previewContent: {
    type: String,
    default: ''
  },

  /**
   * Default preview content when no content is provided
   */
  defaultPreviewContent: {
    type: String,
    default: '"I help [WHO] achieve [WHAT] in [TIMEFRAME] without [PAIN POINT]."'
  },

  /**
   * Whether to show the save CTA in preview
   */
  showSaveCta: {
    type: Boolean,
    default: true
  },

  /**
   * Save CTA prefix text
   */
  saveCtaPrefix: {
    type: String,
    default: 'Happy with this hook?'
  },

  /**
   * Save CTA link text
   */
  saveCtaLink: {
    type: String,
    default: 'Save it to your profile'
  },

  /**
   * Save CTA suffix text
   */
  saveCtaSuffix: {
    type: String,
    default: 'with a free Guestify account.'
  }
});

const emit = defineEmits(['generate', 'save-click', 'intent-change']);

// Current selected intent ID
const currentIntentId = ref(props.intents?.[0]?.id || null);

// Computed current intent object
const currentIntent = computed(() => {
  if (!currentIntentId.value || !props.intents) return null;
  return props.intents.find(i => i.id === currentIntentId.value) || null;
});

/**
 * Select an intent by ID
 */
const selectIntent = (intentId) => {
  currentIntentId.value = intentId;
  emit('intent-change', currentIntent.value);
};

// Watch for intents prop changes to set initial selection
watch(() => props.intents, (newIntents) => {
  if (newIntents?.length && !currentIntentId.value) {
    currentIntentId.value = newIntents[0].id;
  }
}, { immediate: true });
</script>

<style scoped>
/* Tool Embed Container */
.gmkb-tool-embed {
  background: white;
  border-radius: 16px;
  border: 1px solid var(--mkcg-border, #e2e8f0);
  overflow: hidden;
  text-align: left;
  max-width: 960px;
  margin: 0 auto;
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
}

/* Intent Tabs */
.gmkb-intent-tabs {
  display: flex;
  background: var(--mkcg-bg-secondary, #f9fafb);
  border-bottom: 1px solid var(--mkcg-border, #e2e8f0);
}

.gmkb-intent-tab {
  flex: 1;
  padding: 20px;
  text-align: center;
  background: transparent;
  border: none;
  border-right: 1px solid var(--mkcg-border, #e2e8f0);
  cursor: pointer;
  font-weight: 700;
  color: var(--mkcg-text-secondary, #64748b);
  transition: all 0.2s;
  font-size: 15px;
  font-family: inherit;
}

.gmkb-intent-tab:last-child {
  border-right: none;
}

.gmkb-intent-tab:hover {
  background: #f1f5f9;
}

.gmkb-intent-tab.active {
  background: white;
  color: var(--mkcg-primary, #3b82f6);
  border-bottom: 3px solid var(--mkcg-primary, #3b82f6);
  position: relative;
}

/* Tool Stage (2-column) */
.gmkb-tool-stage {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  min-height: 450px;
}

/* Left Column: Context & Form */
.tool-context {
  padding: 40px;
  border-right: 1px solid var(--mkcg-border, #e2e8f0);
}

.tool-context__heading {
  font-size: 26px;
  font-weight: 800;
  margin: 0 0 12px;
  color: var(--mkcg-text-primary, #0f172a);
  line-height: 1.2;
}

.tool-context__description {
  font-size: 16px;
  color: var(--mkcg-text-secondary, #64748b);
  margin: 0 0 32px;
  line-height: 1.5;
}

.tool-context__form {
  margin-bottom: 20px;
}

.tool-context__actions {
  margin-top: 10px;
}

/* Generate Button */
.gmkb-btn-generate {
  width: 100%;
  padding: 16px;
  background: var(--mkcg-primary, #3b82f6);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;
}

.gmkb-btn-generate:hover:not(:disabled) {
  background: var(--mkcg-primary-hover, #2563eb);
}

.gmkb-btn-generate:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.gmkb-btn-icon {
  font-size: 18px;
}

.gmkb-btn-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Rate Limit Text */
.tool-context__limit-text {
  font-size: 13px;
  color: var(--mkcg-text-secondary, #64748b);
  margin-top: 16px;
  background: var(--mkcg-bg-secondary, #f9fafb);
  padding: 10px;
  border-radius: 6px;
  line-height: 1.5;
  text-align: center;
}

/* Right Column: Preview */
.tool-preview-area {
  background: var(--mkcg-bg-secondary, #f9fafb);
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-left: 1px solid white;
}

.preview-card {
  background: white;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  border: 1px solid var(--mkcg-border, #e2e8f0);
  width: 100%;
  box-sizing: border-box;
}

.preview-label {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--mkcg-text-light, #94a3b8);
  margin-bottom: 12px;
  letter-spacing: 0.5px;
}

.preview-content {
  margin-bottom: 24px;
}

.preview-hook {
  font-size: 22px;
  line-height: 1.5;
  color: var(--mkcg-text-primary, #0f172a);
  margin: 0;
  font-weight: 500;
}

.preview-hook :deep(strong) {
  color: var(--mkcg-primary, #3b82f6);
}

.preview-subtext {
  border-top: 1px dashed var(--mkcg-border, #e2e8f0);
  padding-top: 16px;
  font-size: 14px;
  color: var(--mkcg-text-secondary, #64748b);
  margin: 0;
  text-align: center;
}

.preview-subtext a {
  color: var(--mkcg-primary, #3b82f6);
  font-weight: 600;
  text-decoration: none;
}

.preview-subtext a:hover {
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 768px) {
  .gmkb-tool-stage {
    grid-template-columns: 1fr;
  }

  .tool-context {
    border-right: none;
    border-bottom: 1px solid var(--mkcg-border, #e2e8f0);
    padding: 24px;
  }

  .tool-preview-area {
    padding: 24px;
  }

  .gmkb-intent-tabs {
    flex-direction: column;
  }

  .gmkb-intent-tab {
    border-right: none;
    border-bottom: 1px solid var(--mkcg-border, #e2e8f0);
  }

  .gmkb-intent-tab:last-child {
    border-bottom: none;
  }
}
</style>
