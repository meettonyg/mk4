<template>
  <!-- Integrated Mode: Compact widget for Media Kit Builder -->
  <AiWidgetFrame
    v-if="mode === 'integrated'"
    :title="title"
    :description="description"
    :mode="mode"
    :is-loading="isLoading"
    :has-results="hasResults"
    :error="error"
    :usage-remaining="usageRemaining"
    :reset-time="resetTime"
    :target-component="targetComponent"
    :show-cta="!hasResults"
    :cta-variant="usageRemaining === 0 ? 'exhausted' : 'default'"
    @apply="$emit('apply')"
    @regenerate="$emit('regenerate')"
    @copy="$emit('copy')"
    @retry="$emit('retry')"
  >
    <!-- Form Slot -->
    <slot name="integrated-form"></slot>

    <!-- Results Slot -->
    <template #results>
      <slot name="integrated-results"></slot>
    </template>

    <!-- Results Actions Slot -->
    <template #results-actions>
      <slot name="integrated-actions"></slot>
    </template>
  </AiWidgetFrame>

  <!-- Default/Standalone Mode: Full Tool Experience -->
  <div v-else :class="['gfy-tool', `gfy-tool--${toolType}`]">
    <!-- Phase 1: Input Form -->
    <div v-if="!showResults" class="gfy-tool__form-phase">
      <!-- Hero Section (only show in default mode, not embedded) -->
      <div v-if="mode === 'default'" class="gfy-tool__hero">
        <h1 class="gfy-tool__title">{{ title }}</h1>
        <p v-if="subtitle" class="gfy-tool__subtitle">{{ subtitle }}</p>
      </div>

      <!-- Form Container -->
      <div class="gfy-tool__form-container" :class="{ 'gfy-tool__form-container--embedded': mode === 'embedded' }">
        <!-- Form Content Slot -->
        <slot name="form"></slot>

        <!-- Generate Button (only show in default mode) -->
        <div v-if="mode === 'default'" class="gfy-tool__actions">
          <button
            type="button"
            class="gfy-btn gfy-btn--primary gfy-btn--large gfy-btn--generate"
            :disabled="!canGenerate || isLoading"
            @click="$emit('generate')"
          >
            <i v-if="!isLoading" class="fas fa-magic"></i>
            <span v-if="isLoading" class="gfy-spinner"></span>
            {{ isLoading ? loadingText : generateButtonText }}
          </button>
          <p v-if="generateHint" class="gfy-tool__actions-hint">{{ generateHint }}</p>
        </div>

        <!-- Error Display -->
        <div v-if="error" class="gfy-error-box">
          <i class="fas fa-exclamation-circle"></i>
          <p>{{ error }}</p>
          <button type="button" class="gfy-btn gfy-btn--outline" @click="$emit('retry')">
            Try Again
          </button>
        </div>
      </div>
    </div>

    <!-- Phase 2: Results Dashboard -->
    <div v-else class="gfy-tool__results-phase">
      <!-- Results Hero -->
      <div class="gfy-tool__hero gfy-tool__hero--compact">
        <h1 class="gfy-tool__title">{{ resultsTitle || title }}</h1>
        <p v-if="resultsSubtitle" class="gfy-tool__subtitle">{{ resultsSubtitle }}</p>
      </div>

      <div class="gfy-tool__results-container">
        <div class="gfy-tool__results-layout">
          <!-- SIDEBAR -->
          <aside v-if="$slots.sidebar" class="gfy-tool__sidebar">
            <slot name="sidebar"></slot>
          </aside>

          <!-- MAIN CONTENT -->
          <main class="gfy-tool__main" :class="{ 'gfy-tool__main--full': !$slots.sidebar }">
            <!-- Results Header -->
            <div v-if="resultsHeader" class="gfy-tool__results-header">
              <h3 class="gfy-tool__results-title">
                <slot name="results-title">{{ resultsHeader }}</slot>
              </h3>
              <slot name="results-count"></slot>
            </div>

            <!-- Loading State -->
            <div v-if="isLoading" class="gfy-loading-state">
              <div class="gfy-loading-spinner"></div>
              <p>{{ loadingText }}</p>
            </div>

            <!-- Results Content -->
            <template v-else>
              <slot name="results"></slot>
            </template>

            <!-- Footer Actions -->
            <div class="gfy-tool__footer">
              <slot name="footer-actions">
                <button type="button" class="gfy-btn gfy-btn--outline" @click="$emit('regenerate')">
                  <i class="fas fa-sync-alt"></i>
                  Regenerate
                </button>
                <button type="button" class="gfy-btn gfy-btn--ghost" @click="$emit('start-over')">
                  Start Over
                </button>
              </slot>
            </div>

            <!-- Copy Success Toast -->
            <div v-if="showCopySuccess" class="gfy-copy-success">
              <i class="fas fa-check-circle"></i>
              Copied to clipboard!
            </div>
          </main>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import AiWidgetFrame from '../../src/vue/components/ai/AiWidgetFrame.vue';

const props = defineProps({
  // Tool Identity
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  toolType: {
    type: String,
    default: 'generic'
  },
  targetComponent: {
    type: String,
    default: ''
  },

  // Mode
  mode: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'integrated', 'embedded'].includes(v)
  },

  // State
  isLoading: {
    type: Boolean,
    default: false
  },
  hasResults: {
    type: Boolean,
    default: false
  },
  showResults: {
    type: Boolean,
    default: false
  },
  canGenerate: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  showCopySuccess: {
    type: Boolean,
    default: false
  },

  // Usage Limits (for integrated mode)
  usageRemaining: {
    type: Number,
    default: null
  },
  resetTime: {
    type: String,
    default: null
  },

  // Button Text
  generateButtonText: {
    type: String,
    default: 'Generate with AI'
  },
  loadingText: {
    type: String,
    default: 'Generating...'
  },
  generateHint: {
    type: String,
    default: ''
  },

  // Results Phase
  resultsTitle: {
    type: String,
    default: ''
  },
  resultsSubtitle: {
    type: String,
    default: ''
  },
  resultsHeader: {
    type: String,
    default: ''
  }
});

const emit = defineEmits([
  'generate',
  'regenerate',
  'apply',
  'copy',
  'retry',
  'start-over'
]);
</script>

<style>
/* ============================================
   STANDARD AI TOOL - UNIFIED DESIGN SYSTEM
   All tools inherit these base styles
   ============================================ */

/* Design Tokens */
.gfy-tool {
  --gfy-primary-color: #2563eb;
  --gfy-primary-light: #eff6ff;
  --gfy-primary-dark: #1d4ed8;
  --gfy-success-color: #10b981;
  --gfy-success-light: #d1fae5;
  --gfy-warning-color: #f59e0b;
  --gfy-warning-light: #fef3c7;
  --gfy-error-color: #dc2626;
  --gfy-error-light: #fef2f2;
  --gfy-text-primary: #0f172a;
  --gfy-text-secondary: #64748b;
  --gfy-text-muted: #94a3b8;
  --gfy-bg-color: #f8fafc;
  --gfy-white: #ffffff;
  --gfy-border-color: #e2e8f0;
  --gfy-radius-sm: 6px;
  --gfy-radius-md: 8px;
  --gfy-radius-lg: 12px;
  --gfy-radius-xl: 16px;
  --gfy-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --gfy-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --gfy-shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 20px;
}

/* ============================================
   HERO SECTION
   ============================================ */
.gfy-tool__hero {
  text-align: center;
  margin-bottom: 40px;
}

.gfy-tool__hero--compact {
  margin-bottom: 30px;
}

.gfy-tool__title {
  font-size: 36px;
  font-weight: 800;
  margin: 0 0 10px 0;
  background: linear-gradient(to right, #0f172a, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.gfy-tool__subtitle {
  color: var(--gfy-text-secondary);
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

/* ============================================
   FORM CONTAINER
   ============================================ */
.gfy-tool__form-container {
  background: var(--gfy-white);
  border-radius: var(--gfy-radius-xl);
  border: 1px solid var(--gfy-border-color);
  box-shadow: var(--gfy-shadow-lg);
  padding: 40px;
}

.gfy-tool__form-container--embedded {
  background: transparent;
  border: none;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
}

/* ============================================
   HIGHLIGHT BOXES (for form sections)
   ============================================ */
.gfy-highlight-box {
  background: var(--gfy-white);
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-lg);
  padding: 24px;
  margin-bottom: 24px;
}

.gfy-highlight-box--blue {
  border-left: 4px solid var(--gfy-primary-color);
  background: linear-gradient(to right, var(--gfy-primary-light), var(--gfy-white));
}

.gfy-highlight-box--green {
  border-left: 4px solid var(--gfy-success-color);
  background: linear-gradient(to right, var(--gfy-success-light), var(--gfy-white));
}

.gfy-highlight-box--yellow {
  border-left: 4px solid var(--gfy-warning-color);
  background: linear-gradient(to right, var(--gfy-warning-light), var(--gfy-white));
}

.gfy-highlight-box__header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 20px;
}

.gfy-highlight-box__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: var(--gfy-primary-color);
  color: var(--gfy-white);
  border-radius: var(--gfy-radius-md);
  flex-shrink: 0;
}

.gfy-highlight-box--green .gfy-highlight-box__icon {
  background: var(--gfy-success-color);
}

.gfy-highlight-box--yellow .gfy-highlight-box__icon {
  background: var(--gfy-warning-color);
}

.gfy-highlight-box__title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--gfy-text-primary);
  margin: 0 0 4px 0;
}

.gfy-highlight-box__subtitle {
  font-size: 0.9rem;
  color: var(--gfy-text-secondary);
  margin: 0;
}

/* ============================================
   FORM ELEMENTS
   ============================================ */
.gfy-form-group {
  margin-bottom: 16px;
}

.gfy-form-group:last-child {
  margin-bottom: 0;
}

.gfy-form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--gfy-text-primary);
  margin-bottom: 8px;
}

.gfy-form-label--required::after {
  content: ' *';
  color: var(--gfy-error-color);
}

.gfy-form-label__optional {
  font-size: 11px;
  font-weight: 500;
  color: var(--gfy-text-muted);
  background: var(--gfy-border-color);
  padding: 2px 8px;
  border-radius: 4px;
}

.gfy-form-input,
.gfy-form-textarea,
.gfy-form-select {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-md);
  font-family: inherit;
  font-size: 0.95rem;
  background: var(--gfy-white);
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.gfy-form-textarea {
  resize: vertical;
  min-height: 80px;
}

.gfy-form-input:focus,
.gfy-form-textarea:focus,
.gfy-form-select:focus {
  outline: none;
  border-color: var(--gfy-primary-color);
  box-shadow: 0 0 0 3px var(--gfy-primary-light);
}

.gfy-form-input::placeholder,
.gfy-form-textarea::placeholder {
  color: var(--gfy-text-muted);
}

.gfy-form-hint {
  display: block;
  font-size: 0.8rem;
  color: var(--gfy-text-muted);
  margin-top: 6px;
  font-style: italic;
}

.gfy-form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (min-width: 640px) {
  .gfy-form-grid--2col {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* ============================================
   LIVE PREVIEW
   ============================================ */
.gfy-live-preview {
  margin-top: 16px;
  padding: 14px 18px;
  background: var(--gfy-primary-light);
  border: 1px solid #bfdbfe;
  border-radius: var(--gfy-radius-md);
  font-size: 0.95rem;
  font-style: italic;
  color: var(--gfy-primary-dark);
}

.gfy-live-preview__label {
  font-weight: 600;
  font-style: normal;
  margin-right: 4px;
}

/* ============================================
   FORM ACTIONS
   ============================================ */
.gfy-tool__actions {
  text-align: center;
  padding-top: 24px;
  margin-top: 24px;
  border-top: 1px solid var(--gfy-border-color);
}

.gfy-tool__actions-hint {
  font-size: 0.85rem;
  color: var(--gfy-text-muted);
  margin-top: 12px;
}

/* ============================================
   BUTTONS
   ============================================ */
.gfy-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: inherit;
  border-radius: var(--gfy-radius-md);
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1px solid transparent;
  white-space: nowrap;
}

.gfy-btn--primary {
  background: var(--gfy-primary-color);
  color: var(--gfy-white);
}

.gfy-btn--primary:hover:not(:disabled) {
  background: var(--gfy-primary-dark);
}

.gfy-btn--primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.gfy-btn--outline {
  background: var(--gfy-white);
  border-color: var(--gfy-border-color);
  color: var(--gfy-text-secondary);
}

.gfy-btn--outline:hover:not(:disabled) {
  border-color: var(--gfy-primary-color);
  color: var(--gfy-primary-color);
  background: var(--gfy-primary-light);
}

.gfy-btn--ghost {
  background: transparent;
  color: var(--gfy-text-secondary);
  border: none;
}

.gfy-btn--ghost:hover:not(:disabled) {
  color: var(--gfy-text-primary);
}

.gfy-btn--large {
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
}

.gfy-btn--sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
}

.gfy-btn--generate {
  padding: 16px 32px;
  font-size: 1.1rem;
  border-radius: 10px;
}

/* ============================================
   SPINNER
   ============================================ */
.gfy-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: gfy-spin 0.8s linear infinite;
}

@keyframes gfy-spin {
  to { transform: rotate(360deg); }
}

/* ============================================
   ERROR BOX
   ============================================ */
.gfy-error-box {
  margin-top: 24px;
  padding: 20px;
  background: var(--gfy-error-light);
  border: 1px solid #fecaca;
  border-radius: var(--gfy-radius-md);
  text-align: center;
  color: #991b1b;
}

.gfy-error-box i {
  font-size: 24px;
  margin-bottom: 8px;
  display: block;
}

.gfy-error-box p {
  margin: 0 0 12px 0;
}

/* ============================================
   RESULTS CONTAINER
   ============================================ */
.gfy-tool__results-container {
  background: var(--gfy-white);
  border-radius: var(--gfy-radius-xl);
  border: 1px solid var(--gfy-border-color);
  box-shadow: var(--gfy-shadow-lg);
  overflow: hidden;
}

.gfy-tool__results-layout {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 40px;
}

@media (min-width: 900px) {
  .gfy-tool__results-layout {
    flex-direction: row;
    align-items: flex-start;
  }
}

/* ============================================
   SIDEBAR
   ============================================ */
.gfy-tool__sidebar {
  flex: 0 0 320px;
}

@media (min-width: 900px) {
  .gfy-tool__sidebar {
    position: sticky;
    top: 1rem;
  }
}

.gfy-sidebar-panel {
  background: var(--gfy-bg-color);
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-lg);
  padding: 1.25rem;
}

.gfy-sidebar-header {
  margin-bottom: 1rem;
}

.gfy-sidebar-title {
  font-size: 0.875rem;
  text-transform: uppercase;
  font-weight: 700;
  color: var(--gfy-text-secondary);
  margin: 0;
}

/* Sidebar Slots */
.gfy-sidebar-slot {
  display: block;
  width: 100%;
  padding: 1rem;
  background: var(--gfy-white);
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-md);
  margin-bottom: 0.75rem;
  transition: all 0.2s;
  cursor: pointer;
  text-align: left;
}

.gfy-sidebar-slot:hover {
  border-color: var(--gfy-primary-color);
}

.gfy-sidebar-slot--active {
  border-color: var(--gfy-primary-color);
  box-shadow: 0 0 0 2px var(--gfy-primary-color);
}

.gfy-sidebar-slot--locked {
  background: var(--gfy-primary-light);
  border-color: var(--gfy-primary-color);
}

.gfy-sidebar-slot__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.gfy-sidebar-slot__label {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--gfy-text-secondary);
}

.gfy-sidebar-slot--active .gfy-sidebar-slot__label,
.gfy-sidebar-slot--locked .gfy-sidebar-slot__label {
  color: var(--gfy-primary-color);
}

.gfy-sidebar-slot__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 8px;
  font-size: 11px;
  font-weight: 700;
  color: var(--gfy-white);
  background: var(--gfy-primary-color);
  border-radius: 12px;
}

.gfy-sidebar-slot__preview {
  font-size: 11px;
  line-height: 1.4;
  color: var(--gfy-text-muted);
}

.gfy-sidebar-slot__text {
  font-size: 13px;
  line-height: 1.4;
  color: var(--gfy-text-primary);
}

.gfy-sidebar-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: var(--gfy-primary-light);
  border-radius: var(--gfy-radius-md);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--gfy-primary-color);
  margin-top: 12px;
}

/* ============================================
   MAIN CONTENT
   ============================================ */
.gfy-tool__main {
  flex: 1;
  min-width: 0;
}

.gfy-tool__main--full {
  max-width: 100%;
}

.gfy-tool__results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--gfy-border-color);
}

.gfy-tool__results-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

/* ============================================
   LOADING STATE
   ============================================ */
.gfy-loading-state {
  text-align: center;
  padding: 60px 40px;
  color: var(--gfy-text-secondary);
}

.gfy-loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid var(--gfy-border-color);
  border-radius: 50%;
  border-top-color: var(--gfy-primary-color);
  animation: gfy-spin 1s linear infinite;
  margin: 0 auto 16px;
}

/* ============================================
   EMPTY STATE
   ============================================ */
.gfy-empty-state {
  text-align: center;
  padding: 60px 40px;
  color: var(--gfy-text-secondary);
}

.gfy-empty-state i {
  font-size: 48px;
  color: var(--gfy-text-muted);
  margin-bottom: 16px;
  display: block;
}

/* ============================================
   FOOTER
   ============================================ */
.gfy-tool__footer {
  margin-top: 2rem;
  border-top: 1px solid var(--gfy-border-color);
  padding-top: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

/* ============================================
   COPY SUCCESS TOAST
   ============================================ */
.gfy-copy-success {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--gfy-success-light);
  color: #047857;
  border-radius: var(--gfy-radius-md);
  font-weight: 600;
  margin-top: 16px;
}

/* ============================================
   RESULT CARDS
   ============================================ */
.gfy-result-card {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: var(--gfy-white);
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-md);
  transition: border-color 0.2s;
  margin-bottom: 1rem;
}

.gfy-result-card:hover {
  border-color: var(--gfy-primary-color);
}

.gfy-result-card:last-child {
  margin-bottom: 0;
}

.gfy-result-card__number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  background: var(--gfy-primary-light);
  color: var(--gfy-primary-color);
  border-radius: 50%;
  font-size: 13px;
  font-weight: 700;
}

.gfy-result-card__content {
  flex: 1;
}

.gfy-result-card__text {
  font-size: 15px;
  line-height: 1.6;
  color: var(--gfy-text-primary);
  margin: 0 0 12px 0;
}

.gfy-result-card__actions {
  display: flex;
  gap: 8px;
}

/* ============================================
   LOCKED CONTENT DISPLAY
   ============================================ */
.gfy-locked-content {
  background: var(--gfy-primary-light);
  border: 2px solid var(--gfy-primary-color);
  border-radius: var(--gfy-radius-lg);
  padding: 32px;
  text-align: center;
}

.gfy-locked-content__badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--gfy-primary-color);
  background: var(--gfy-white);
  padding: 4px 12px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.gfy-locked-content__text {
  font-size: 1.5rem;
  font-weight: 600;
  font-style: italic;
  color: var(--gfy-text-primary);
  margin-bottom: 24px;
  line-height: 1.4;
}

.gfy-locked-content__actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

/* ============================================
   SELECTED CONTENT DISPLAY
   ============================================ */
.gfy-selected-content {
  background: var(--gfy-white);
  border: 2px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-lg);
  padding: 32px;
  text-align: center;
  margin-bottom: 24px;
}

.gfy-selected-content__badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--gfy-primary-color);
  background: var(--gfy-primary-light);
  padding: 4px 12px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.gfy-selected-content__text {
  font-size: 1.5rem;
  font-weight: 600;
  font-style: italic;
  color: var(--gfy-text-primary);
  margin-bottom: 24px;
  line-height: 1.4;
}

.gfy-selected-content__actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

/* ============================================
   NAVIGATION
   ============================================ */
.gfy-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 16px 0;
  border-top: 1px solid var(--gfy-border-color);
}

.gfy-nav__count {
  font-size: 0.875rem;
  color: var(--gfy-text-muted);
  font-weight: 500;
}
</style>
