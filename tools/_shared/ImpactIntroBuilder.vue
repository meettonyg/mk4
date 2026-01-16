<template>
  <div class="impact-intro-builder">
    <div class="impact-intro-builder__header">
      <span class="impact-intro-builder__icon">🎯</span>
      <h4 class="impact-intro-builder__title">{{ title }}</h4>
    </div>

    <div class="impact-intro-builder__fields">
      <div class="impact-intro-builder__field">
        <label class="impact-intro-builder__label">WHERE IS YOUR AUTHORITY? (PROOF)</label>
        <input
          :value="modelValue.where"
          type="text"
          class="impact-intro-builder__input"
          :placeholder="placeholders.where"
          @input="updateField('where', $event.target.value)"
        />
      </div>
      <div class="impact-intro-builder__field">
        <label class="impact-intro-builder__label">WHY IS THIS YOUR MISSION?</label>
        <input
          :value="modelValue.why"
          type="text"
          class="impact-intro-builder__input"
          :placeholder="placeholders.why"
          @input="updateField('why', $event.target.value)"
        />
      </div>
    </div>

    <!-- Live Preview (optional) -->
    <div v-if="showPreview && previewText" class="impact-intro-builder__preview">
      "{{ previewText }}"
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  /**
   * v-model for the impact intro fields (where, why)
   */
  modelValue: {
    type: Object,
    default: () => ({
      where: '',
      why: ''
    })
  },

  /**
   * Title for the section
   */
  title: {
    type: String,
    default: 'Your Impact Intro'
  },

  /**
   * Placeholder text for each field
   */
  placeholders: {
    type: Object,
    default: () => ({
      where: 'e.g. Helped 200+ startups achieve milestones',
      why: 'e.g. Democratize elite growth strategies'
    })
  },

  /**
   * Whether to show the preview
   */
  showPreview: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue']);

/**
 * Update a single field and emit the full object
 */
const updateField = (field, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value
  });
};

/**
 * Generate preview text from components
 */
const previewText = computed(() => {
  const { where, why } = props.modelValue;
  if (!where && !why) return '';

  let parts = [];
  if (where) parts.push(where);
  if (why) parts.push(`because ${why}`);

  return parts.join(' ');
});
</script>

<style scoped>
.impact-intro-builder {
  background: #fff;
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-left: 4px solid #10b981;
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.impact-intro-builder__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

.impact-intro-builder__icon {
  font-size: 16px;
}

.impact-intro-builder__title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  color: var(--mkcg-text-primary, #0f172a);
}

.impact-intro-builder__fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.impact-intro-builder__field {
  display: flex;
  flex-direction: column;
}

.impact-intro-builder__label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--mkcg-text-secondary, #64748b);
  margin-bottom: 6px;
  letter-spacing: 0.3px;
}

.impact-intro-builder__input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-radius: 6px;
  font-size: 14px;
  background: #fff;
  font-family: inherit;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.impact-intro-builder__input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.impact-intro-builder__input::placeholder {
  color: var(--mkcg-text-light, #94a3b8);
}

.impact-intro-builder__preview {
  margin-top: 1.5rem;
  padding: 1.25rem;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 8px;
  border: 1px solid #a7f3d0;
  color: #047857;
  font-size: 0.95rem;
  font-style: italic;
  text-align: center;
  line-height: 1.5;
}
</style>
