<template>
  <div class="authority-hook-builder">
    <div class="authority-hook-builder__header">
      <span class="authority-hook-builder__icon">★</span>
      <h4 class="authority-hook-builder__title">{{ title }}</h4>
    </div>

    <div class="authority-hook-builder__grid">
      <div class="authority-hook-builder__field">
        <label class="authority-hook-builder__label">WHO DO YOU HELP?</label>
        <input
          :value="modelValue.who"
          type="text"
          class="authority-hook-builder__input"
          :class="{ 'authority-hook-builder__input--prefilled': isFieldPrefilled('who') }"
          :placeholder="placeholders.who"
          @input="updateField('who', $event.target.value)"
        />
      </div>
      <div class="authority-hook-builder__field">
        <label class="authority-hook-builder__label">WHAT IS THE RESULT?</label>
        <input
          :value="modelValue.what"
          type="text"
          class="authority-hook-builder__input"
          :class="{ 'authority-hook-builder__input--prefilled': isFieldPrefilled('what') }"
          :placeholder="placeholders.what"
          @input="updateField('what', $event.target.value)"
        />
      </div>
      <div class="authority-hook-builder__field">
        <label class="authority-hook-builder__label">WHEN DO THEY NEED IT?</label>
        <input
          :value="modelValue.when"
          type="text"
          class="authority-hook-builder__input"
          :class="{ 'authority-hook-builder__input--prefilled': isFieldPrefilled('when') }"
          :placeholder="placeholders.when"
          @input="updateField('when', $event.target.value)"
        />
      </div>
      <div class="authority-hook-builder__field">
        <label class="authority-hook-builder__label">HOW DO YOU DO IT?</label>
        <input
          :value="modelValue.how"
          type="text"
          class="authority-hook-builder__input"
          :class="{ 'authority-hook-builder__input--prefilled': isFieldPrefilled('how') }"
          :placeholder="placeholders.how"
          @input="updateField('how', $event.target.value)"
        />
      </div>
    </div>

    <!-- Live Preview -->
    <div v-if="previewText" class="authority-hook-builder__preview">
      "{{ previewText }}"
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  /**
   * v-model for the authority hook fields (who, what, when, how)
   */
  modelValue: {
    type: Object,
    default: () => ({
      who: '',
      what: '',
      when: '',
      how: ''
    })
  },

  /**
   * Title for the section
   */
  title: {
    type: String,
    default: 'Personalize Your Questions'
  },

  /**
   * Placeholder text for each field
   */
  placeholders: {
    type: Object,
    default: () => ({
      who: 'e.g. SaaS Founders',
      what: 'e.g. Increase revenue by 40%',
      when: 'e.g. When scaling rapidly',
      how: 'e.g. My proven 90-day system'
    })
  },

  /**
   * Set of field names that were prefilled from profile
   */
  prefilledFields: {
    type: Set,
    default: () => new Set()
  }
});

/**
 * Check if a field is prefilled
 */
const isFieldPrefilled = (field) => {
  return props.prefilledFields.has(field);
};

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
  const { who, what, when, how } = props.modelValue;
  if (!who && !what) return '';

  let preview = 'I help';
  if (who) preview += ` ${who}`;
  if (what) preview += ` ${what}`;
  if (when) preview += ` ${when}`;
  if (how) preview += ` through ${how}`;

  return preview + '.';
});
</script>

<style scoped>
.authority-hook-builder {
  background: #fff;
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-left: 4px solid var(--mkcg-primary, #3b82f6);
  padding: 1.5rem;
  border-radius: 8px;
}

.authority-hook-builder__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

.authority-hook-builder__icon {
  color: #f59e0b;
  font-size: 16px;
}

.authority-hook-builder__title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  color: var(--mkcg-text-primary, #0f172a);
}

.authority-hook-builder__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

@media (max-width: 768px) {
  .authority-hook-builder__grid {
    grid-template-columns: 1fr;
  }
}

.authority-hook-builder__field {
  display: flex;
  flex-direction: column;
}

.authority-hook-builder__label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--mkcg-text-secondary, #64748b);
  margin-bottom: 6px;
  letter-spacing: 0.3px;
}

.authority-hook-builder__input {
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

.authority-hook-builder__input:focus {
  outline: none;
  border-color: var(--mkcg-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.authority-hook-builder__input::placeholder {
  color: var(--mkcg-text-light, #94a3b8);
}

.authority-hook-builder__input--prefilled {
  background-color: #f0f9ff;
  border-color: #7dd3fc;
}

.authority-hook-builder__input--prefilled:focus {
  border-color: var(--mkcg-primary, #3b82f6);
  background-color: #fff;
}

.authority-hook-builder__preview {
  margin-top: 1.5rem;
  padding: 1.25rem;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 8px;
  border: 1px solid #bfdbfe;
  color: var(--mkcg-primary-hover, #2563eb);
  font-size: 0.95rem;
  font-style: italic;
  text-align: center;
  line-height: 1.5;
}
</style>
