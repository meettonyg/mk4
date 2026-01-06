<template>
  <div class="generator__authority-hook">
    <div class="generator__authority-hook-header">
      <span class="generator__authority-hook-icon">&#9733;</span>
      <h3 class="generator__authority-hook-title">Your Authority Hook</h3>
      <span v-if="showBadge" class="generator__badge">AI GENERATED</span>
    </div>

    <div class="generator__authority-hook-content">
      <p v-if="hookText">{{ hookText }}</p>
      <p v-else class="generator__authority-hook-empty">
        <slot name="empty">
          No authority hook defined yet. Click "Edit Authority Hook" to create one.
        </slot>
      </p>
    </div>

    <div class="generator__authority-hook-actions">
      <button
        type="button"
        class="generator__button generator__button--outline"
        @click="toggleBuilder"
        :aria-expanded="isBuilderOpen"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
        </svg>
        {{ isBuilderOpen ? 'Hide Builder' : 'Edit Authority Hook' }}
      </button>
    </div>

    <!-- Builder Panel (expandable) -->
    <transition name="slide">
      <div v-if="isBuilderOpen" class="generator__builder">
        <slot name="builder">
          <!-- Authority Hook Builder Form -->
          <div class="generator__builder-form">
            <div class="generator__field">
              <label class="generator__field-label">WHO do you help?</label>
              <input
                v-model="localComponents.who"
                type="text"
                class="generator__field-input"
                placeholder="e.g., busy executives, entrepreneurs, parents..."
                @input="emitChange"
              />
            </div>

            <div class="generator__field">
              <label class="generator__field-label">WHAT do you help them with?</label>
              <input
                v-model="localComponents.what"
                type="text"
                class="generator__field-input"
                placeholder="e.g., achieve work-life balance, grow their business..."
                @input="emitChange"
              />
            </div>

            <div class="generator__field">
              <label class="generator__field-label">WHEN do they need this?</label>
              <input
                v-model="localComponents.when"
                type="text"
                class="generator__field-input"
                placeholder="e.g., when they're feeling overwhelmed, during transitions..."
                @input="emitChange"
              />
            </div>

            <div class="generator__field">
              <label class="generator__field-label">HOW do you deliver results?</label>
              <input
                v-model="localComponents.how"
                type="text"
                class="generator__field-input"
                placeholder="e.g., through proven frameworks, personalized coaching..."
                @input="emitChange"
              />
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
  background-color: var(--mkcg-bg-secondary, #f9fafb);
  border: 1px solid var(--mkcg-border-light, #e9ecef);
  border-radius: var(--mkcg-radius, 8px);
  padding: var(--mkcg-space-md, 20px);
  margin-bottom: var(--mkcg-space-lg, 30px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.generator__authority-hook-header {
  display: flex;
  align-items: center;
  margin-bottom: var(--mkcg-space-sm, 12px);
}

.generator__authority-hook-icon {
  color: var(--mkcg-primary, #1a9bdc);
  margin-right: var(--mkcg-space-xs, 8px);
  font-size: var(--mkcg-font-size-lg, 18px);
}

.generator__authority-hook-title {
  margin: 0;
  flex-grow: 1;
  font-size: var(--mkcg-font-size-lg, 18px);
  color: var(--mkcg-text-primary, #2c3e50);
  font-weight: var(--mkcg-font-weight-semibold, 600);
}

.generator__badge {
  background-color: #e1f5fe;
  color: #0288d1;
  padding: 4px var(--mkcg-space-xs, 8px);
  border-radius: var(--mkcg-radius-sm, 4px);
  font-size: var(--mkcg-font-size-xs, 12px);
  font-weight: var(--mkcg-font-weight-bold, 700);
}

.generator__authority-hook-content {
  margin-bottom: var(--mkcg-space-md, 20px);
  color: var(--mkcg-primary, #1a9bdc);
  font-weight: var(--mkcg-font-weight-medium, 500);
  font-size: var(--mkcg-font-size-md, 16px);
  line-height: var(--mkcg-line-height-relaxed, 1.6);
}

.generator__authority-hook-content p {
  margin: 0;
}

.generator__authority-hook-empty {
  color: var(--mkcg-text-tertiary, #8a9ba8);
  font-style: italic;
}

.generator__authority-hook-actions {
  display: flex;
  gap: var(--mkcg-space-xs, 8px);
  flex-wrap: wrap;
}

/* Button Styles */
.generator__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--mkcg-space-xs, 8px) var(--mkcg-space-md, 20px);
  border: none;
  border-radius: var(--mkcg-radius-sm, 4px);
  cursor: pointer;
  font-weight: var(--mkcg-font-weight-medium, 500);
  font-size: var(--mkcg-font-size-sm, 14px);
  text-decoration: none;
  transition: all 0.15s ease;
  min-height: 40px;
  font-family: inherit;
  gap: var(--mkcg-space-xs, 8px);
}

.generator__button svg {
  width: 16px;
  height: 16px;
}

.generator__button--outline {
  background: var(--mkcg-bg-primary, #ffffff);
  color: var(--mkcg-primary, #1a9bdc);
  border: 1px solid var(--mkcg-primary, #1a9bdc);
}

.generator__button--outline:hover {
  background-color: #f0f8ff;
}

/* Builder Panel */
.generator__builder {
  margin-top: var(--mkcg-space-md, 20px);
  padding: var(--mkcg-space-md, 20px);
  background-color: var(--mkcg-bg-primary, #ffffff);
  border: 1px solid var(--mkcg-border-light, #e9ecef);
  border-radius: var(--mkcg-radius, 8px);
}

.generator__builder-form {
  display: flex;
  flex-direction: column;
  gap: var(--mkcg-space-md, 20px);
}

/* Form Field Styles */
.generator__field {
  margin-bottom: 0;
}

.generator__field-label {
  display: block;
  font-size: var(--mkcg-font-size-sm, 14px);
  margin: 0 0 var(--mkcg-space-xs, 8px) 0;
  color: var(--mkcg-text-primary, #2c3e50);
  font-weight: var(--mkcg-font-weight-medium, 500);
}

.generator__field-input {
  width: 100%;
  padding: var(--mkcg-space-sm, 12px);
  border: 1px solid var(--mkcg-border-medium, #dce1e5);
  border-radius: var(--mkcg-radius-sm, 4px);
  font-size: var(--mkcg-font-size-md, 16px);
  font-family: inherit;
  transition: all 0.15s ease;
  background-color: var(--mkcg-bg-primary, #ffffff);
  box-sizing: border-box;
}

.generator__field-input:focus {
  border-color: var(--mkcg-primary, #1a9bdc);
  outline: none;
  box-shadow: 0 0 0 2px rgba(26, 155, 220, 0.2);
}

.generator__field-input::placeholder {
  color: var(--mkcg-text-light, #95a5a6);
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
