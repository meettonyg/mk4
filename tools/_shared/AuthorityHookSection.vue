<template>
  <div class="generator__authority-hook" :class="{ 'is-complete': isComplete }">
    <div class="generator__authority-hook-header">
      <span class="generator__authority-hook-icon">★</span>
      <h3 class="generator__authority-hook-title">Your Authority Hook</h3>
      <!-- Progress indicator -->
      <div class="generator__authority-hook-progress">
        <span class="generator__authority-hook-progress-text">{{ filledFieldsCount }}/4</span>
        <div class="generator__authority-hook-progress-bar">
          <div
            class="generator__authority-hook-progress-fill"
            :style="{ width: `${(filledFieldsCount / 4) * 100}%` }"
          ></div>
        </div>
      </div>
    </div>

    <div class="generator__authority-hook-content">
      <!-- Show generated hook preview if we have content -->
      <p v-if="hookText || generatedPreview" class="generator__authority-hook-preview">
        {{ hookText || generatedPreview }}
      </p>
      <div v-else class="generator__authority-hook-empty">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 16v-4M12 8h.01"></path>
        </svg>
        <span>Complete the fields below to build your authority hook - this helps generate better topics!</span>
      </div>
    </div>

    <div class="generator__authority-hook-actions">
      <button
        type="button"
        class="generator__button generator__button--outline"
        @click="toggleBuilder"
        :aria-expanded="isBuilderOpen"
      >
        <svg v-if="!isBuilderOpen" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
        {{ isBuilderOpen ? 'Hide Builder' : 'Edit Authority Hook' }}
      </button>
      <span v-if="isComplete" class="generator__authority-hook-complete-badge">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" stroke-width="2" fill="none"></polyline>
        </svg>
        Ready to generate!
      </span>
    </div>

    <!-- Builder Panel (expandable) -->
    <transition name="slide">
      <div v-if="isBuilderOpen" class="generator__builder">
        <slot name="builder">
          <!-- Authority Hook Builder Form -->
          <div class="generator__builder-form">
            <div class="generator__field" :class="{ 'is-filled': localComponents.who }">
              <label class="generator__field-label">
                <span class="generator__field-label-text">WHO do you help?</span>
                <svg v-if="localComponents.who" class="generator__field-check" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
              </label>
              <input
                v-model="localComponents.who"
                type="text"
                class="generator__field-input"
                placeholder="e.g., SaaS founders, busy executives, entrepreneurs..."
                @input="emitChange"
              />
            </div>

            <div class="generator__field" :class="{ 'is-filled': localComponents.what }">
              <label class="generator__field-label">
                <span class="generator__field-label-text">WHAT do you help them achieve?</span>
                <svg v-if="localComponents.what" class="generator__field-check" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
              </label>
              <input
                v-model="localComponents.what"
                type="text"
                class="generator__field-input"
                placeholder="e.g., increase revenue by 40%, achieve work-life balance..."
                @input="emitChange"
              />
            </div>

            <div class="generator__field" :class="{ 'is-filled': localComponents.when }">
              <label class="generator__field-label">
                <span class="generator__field-label-text">WHEN do they need this most?</span>
                <svg v-if="localComponents.when" class="generator__field-check" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
              </label>
              <input
                v-model="localComponents.when"
                type="text"
                class="generator__field-input"
                placeholder="e.g., when they're scaling rapidly, during transitions..."
                @input="emitChange"
              />
            </div>

            <div class="generator__field" :class="{ 'is-filled': localComponents.how }">
              <label class="generator__field-label">
                <span class="generator__field-label-text">HOW do you deliver results?</span>
                <svg v-if="localComponents.how" class="generator__field-check" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
              </label>
              <input
                v-model="localComponents.how"
                type="text"
                class="generator__field-input"
                placeholder="e.g., through my proven 90-day system, personalized coaching..."
                @input="emitChange"
              />
            </div>

            <!-- Live Preview -->
            <div v-if="generatedPreview" class="generator__builder-preview">
              <div class="generator__builder-preview-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                Preview
              </div>
              <p class="generator__builder-preview-text">{{ generatedPreview }}</p>
            </div>
          </div>
        </slot>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';

const props = defineProps({
  /**
   * Complete authority hook text to display
   */
  hookText: {
    type: String,
    default: ''
  },

  /**
   * Authority hook components (who, what, when, how)
   */
  components: {
    type: Object,
    default: () => ({
      who: '',
      what: '',
      when: '',
      how: ''
    })
  },

  /**
   * Whether to show the AI GENERATED badge
   */
  showBadge: {
    type: Boolean,
    default: true
  },

  /**
   * Initial builder open state
   */
  initiallyOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:components', 'toggle']);

// Local state
const isBuilderOpen = ref(props.initiallyOpen);

const localComponents = reactive({
  who: props.components.who || '',
  what: props.components.what || '',
  when: props.components.when || '',
  how: props.components.how || ''
});

// Watch for external component changes
watch(() => props.components, (newVal) => {
  localComponents.who = newVal.who || '';
  localComponents.what = newVal.what || '';
  localComponents.when = newVal.when || '';
  localComponents.how = newVal.how || '';
}, { deep: true });

/**
 * Count of filled fields
 */
const filledFieldsCount = computed(() => {
  let count = 0;
  if (localComponents.who?.trim()) count++;
  if (localComponents.what?.trim()) count++;
  if (localComponents.when?.trim()) count++;
  if (localComponents.how?.trim()) count++;
  return count;
});

/**
 * Whether all fields are complete
 */
const isComplete = computed(() => filledFieldsCount.value === 4);

/**
 * Generate a preview of the authority hook from components
 */
const generatedPreview = computed(() => {
  const { who, what, when, how } = localComponents;

  // Only show preview if at least who and what are filled
  if (!who?.trim() || !what?.trim()) return '';

  let preview = `I help ${who.trim()} ${what.trim()}`;

  if (when?.trim()) {
    preview += ` ${when.trim()}`;
  }

  if (how?.trim()) {
    preview += ` ${how.trim()}`;
  }

  return preview + '.';
});

/**
 * Toggle the builder panel visibility
 */
const toggleBuilder = () => {
  isBuilderOpen.value = !isBuilderOpen.value;
  emit('toggle', isBuilderOpen.value);
};

/**
 * Emit component changes
 */
const emitChange = () => {
  emit('update:components', { ...localComponents });
};
</script>

<style scoped>
/* Authority Hook Container */
.generator__authority-hook {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border: 1px solid var(--mkcg-border-light, #e2e8f0);
  border-radius: var(--mkcg-radius-lg, 12px);
  padding: var(--mkcg-space-lg, 24px);
  margin-bottom: var(--mkcg-space-lg, 30px);
  transition: all 0.3s ease;
}

.generator__authority-hook.is-complete {
  border-color: #10b981;
  background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
}

.generator__authority-hook-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: var(--mkcg-space-md, 16px);
}

.generator__authority-hook-icon {
  color: var(--mkcg-primary, #1a9bdc);
  font-size: 20px;
}

.generator__authority-hook.is-complete .generator__authority-hook-icon {
  color: #10b981;
}

.generator__authority-hook-title {
  margin: 0;
  flex-grow: 1;
  font-size: var(--mkcg-font-size-lg, 18px);
  color: var(--mkcg-text-primary, #1e293b);
  font-weight: var(--mkcg-font-weight-semibold, 600);
}

/* Progress Indicator */
.generator__authority-hook-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.generator__authority-hook-progress-text {
  font-size: 12px;
  font-weight: 600;
  color: var(--mkcg-text-secondary, #64748b);
  min-width: 28px;
}

.generator__authority-hook-progress-bar {
  width: 60px;
  height: 6px;
  background: var(--mkcg-bg-tertiary, #e2e8f0);
  border-radius: 3px;
  overflow: hidden;
}

.generator__authority-hook-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #1a9bdc);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.generator__authority-hook.is-complete .generator__authority-hook-progress-fill {
  background: linear-gradient(90deg, #10b981, #059669);
}

/* Content Area */
.generator__authority-hook-content {
  margin-bottom: var(--mkcg-space-md, 16px);
}

.generator__authority-hook-preview {
  margin: 0;
  color: var(--mkcg-primary, #1a9bdc);
  font-weight: var(--mkcg-font-weight-medium, 500);
  font-size: var(--mkcg-font-size-md, 16px);
  line-height: var(--mkcg-line-height-relaxed, 1.6);
  padding: 12px 16px;
  background: white;
  border-radius: 8px;
  border-left: 3px solid var(--mkcg-primary, #1a9bdc);
}

.generator__authority-hook.is-complete .generator__authority-hook-preview {
  border-left-color: #10b981;
  color: #047857;
}

.generator__authority-hook-empty {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  color: var(--mkcg-text-tertiary, #94a3b8);
  font-size: 14px;
  line-height: 1.5;
  padding: 12px 16px;
  background: white;
  border-radius: 8px;
  border: 1px dashed var(--mkcg-border, #cbd5e1);
}

.generator__authority-hook-empty svg {
  flex-shrink: 0;
  margin-top: 2px;
  color: #94a3b8;
}

/* Actions */
.generator__authority-hook-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.generator__authority-hook-complete-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  font-size: 12px;
  font-weight: 600;
  border-radius: 20px;
}

/* Button Styles */
.generator__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  text-decoration: none;
  transition: all 0.15s ease;
  font-family: inherit;
  gap: 8px;
}

.generator__button svg {
  width: 16px;
  height: 16px;
}

.generator__button--outline {
  background: white;
  color: var(--mkcg-primary, #1a9bdc);
  border: 1px solid var(--mkcg-primary, #1a9bdc);
}

.generator__button--outline:hover {
  background: var(--mkcg-primary, #1a9bdc);
  color: white;
}

/* Builder Panel */
.generator__builder {
  margin-top: var(--mkcg-space-md, 20px);
  padding: var(--mkcg-space-lg, 24px);
  background: white;
  border: 1px solid var(--mkcg-border-light, #e2e8f0);
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.generator__builder-form {
  display: flex;
  flex-direction: column;
  gap: var(--mkcg-space-lg, 20px);
}

/* Form Field Styles */
.generator__field {
  position: relative;
}

.generator__field.is-filled .generator__field-input {
  border-color: #10b981;
  background: #f0fdf4;
}

.generator__field-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  margin: 0 0 8px 0;
  color: var(--mkcg-text-primary, #1e293b);
  font-weight: 600;
}

.generator__field-label-text {
  flex: 1;
}

.generator__field-check {
  color: #10b981;
  flex-shrink: 0;
}

.generator__field-input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid var(--mkcg-border, #e2e8f0);
  border-radius: 8px;
  font-size: 15px;
  font-family: inherit;
  transition: all 0.15s ease;
  background: white;
  box-sizing: border-box;
}

.generator__field-input:focus {
  border-color: var(--mkcg-primary, #1a9bdc);
  outline: none;
  box-shadow: 0 0 0 3px rgba(26, 155, 220, 0.15);
}

.generator__field-input::placeholder {
  color: #94a3b8;
}

/* Builder Preview */
.generator__builder-preview {
  margin-top: 8px;
  padding: 16px;
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  border-radius: 8px;
  border: 1px solid #bae6fd;
}

.generator__builder-preview-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #0369a1;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.generator__builder-preview-text {
  margin: 0;
  font-size: 15px;
  color: #0c4a6e;
  line-height: 1.6;
  font-weight: 500;
}

/* Slide transition */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
