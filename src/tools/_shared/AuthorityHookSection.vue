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
.generator__authority-hook-empty {
  color: var(--mkcg-text-tertiary, #8a9ba8);
  font-style: italic;
}

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
