<template>
  <div class="gfy-topics-form">
    <!-- Expertise Field -->
    <div class="gfy-input-group">
      <label class="gfy-label">Your Area of Expertise *</label>
      <textarea
        v-model="expertise"
        class="gfy-textarea"
        rows="2"
        placeholder="e.g. Digital Marketing Strategies"
      ></textarea>
    </div>

    <!-- Authority Hook Builder -->
    <div class="gfy-authority-hook">
      <div class="gfy-authority-hook__header">
        <span class="gfy-authority-hook__icon">&#9733;</span>
        <h3 class="gfy-authority-hook__title">Your Authority Hook</h3>
      </div>

      <!-- Builder Grid -->
      <div class="gfy-builder">
        <div class="gfy-builder__field">
          <label class="gfy-builder__label">WHO do you help?</label>
          <input
            v-model="hookWho"
            type="text"
            class="gfy-builder__input"
            placeholder="e.g. SaaS Founders"
          />
        </div>
        <div class="gfy-builder__field">
          <label class="gfy-builder__label">WHAT is the result?</label>
          <input
            v-model="hookWhat"
            type="text"
            class="gfy-builder__input"
            placeholder="e.g. Increase revenue by 40%"
          />
        </div>
        <div class="gfy-builder__field">
          <label class="gfy-builder__label">WHEN do they need it?</label>
          <input
            v-model="hookWhen"
            type="text"
            class="gfy-builder__input"
            placeholder="e.g. When scaling rapidly"
          />
        </div>
        <div class="gfy-builder__field">
          <label class="gfy-builder__label">HOW do you do it?</label>
          <input
            v-model="hookHow"
            type="text"
            class="gfy-builder__input"
            placeholder="e.g. My proven 90-day system"
          />
        </div>
      </div>

      <!-- Live Preview -->
      <div class="gfy-live-preview">
        "{{ hookPreview }}"
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useAITopics } from '../../src/composables/useAITopics';

const props = defineProps({
  profileData: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:can-generate', 'authority-hook-update']);

// Use composables
const {
  isGenerating,
  error,
  topics,
  hasTopics,
  generate,
  copyToClipboard
} = useAITopics();

// Local state
const expertise = ref('');

// Authority Hook Builder fields
const hookWho = ref('');
const hookWhat = ref('');
const hookWhen = ref('');
const hookHow = ref('');

/**
 * Computed: Live preview of authority hook
 */
const hookPreview = computed(() => {
  const who = hookWho.value || '[WHO]';
  const what = hookWhat.value || '[WHAT]';
  const when = hookWhen.value || '[WHEN]';
  const how = hookHow.value || '[HOW]';
  return `I help ${who} ${what} ${when} through ${how}.`;
});

/**
 * Computed: Generated authority hook summary
 */
const generatedHookSummary = computed(() => {
  if (!hookWho.value && !hookWhat.value) return '';
  let summary = `I help ${hookWho.value || ''} ${hookWhat.value || ''}`;
  if (hookWhen.value) summary += ` ${hookWhen.value}`;
  if (hookHow.value) summary += ` through ${hookHow.value}`;
  return summary.trim() + '.';
});

/**
 * Can generate check
 */
const canGenerate = computed(() => {
  return (expertise.value && expertise.value.trim().length > 0) ||
         (hookWho.value && hookWhat.value);
});

/**
 * Populate from profile data
 */
function populateFromProfile(profileData) {
  if (!profileData) return;
  if (profileData.hook_who) hookWho.value = profileData.hook_who;
  if (profileData.hook_what) hookWhat.value = profileData.hook_what;
  if (profileData.hook_when) hookWhen.value = profileData.hook_when;
  if (profileData.hook_how) hookHow.value = profileData.hook_how;
  if (profileData.expertise) expertise.value = profileData.expertise;
}

/**
 * Handle generate - exposed for parent to call
 */
const handleGenerate = async () => {
  const contextText = expertise.value || generatedHookSummary.value;

  await generate({
    expertise: contextText,
    authorityHook: generatedHookSummary.value,
    count: 10
  });

  return { topics: topics.value };
};

// Watch for canGenerate changes
watch(canGenerate, (newValue) => {
  emit('update:can-generate', !!newValue);
}, { immediate: true });

// Watch authority hook changes
watch(
  [hookWho, hookWhat, hookWhen, hookHow],
  () => {
    emit('authority-hook-update', {
      who: hookWho.value,
      what: hookWhat.value,
      when: hookWhen.value,
      how: hookHow.value,
      summary: generatedHookSummary.value
    });
  }
);

// Watch profile data prop
watch(
  () => props.profileData,
  (newData) => {
    if (newData) populateFromProfile(newData);
  },
  { immediate: true }
);

// Expose for parent
defineExpose({
  handleGenerate,
  topics,
  hasTopics,
  isGenerating,
  error,
  copyToClipboard
});
</script>

<style scoped>
.gfy-topics-form {
  --gfy-primary-color: #2563eb;
  --gfy-primary-light: #eff6ff;
  --gfy-primary-dark: #1d4ed8;
  --gfy-text-primary: #0f172a;
  --gfy-text-secondary: #64748b;
  --gfy-text-muted: #94a3b8;
  --gfy-bg-color: #f8fafc;
  --gfy-white: #ffffff;
  --gfy-border-color: #e2e8f0;
  --gfy-warning-color: #f59e0b;
  --gfy-radius-md: 6px;

  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

/* INPUT STYLES */
.gfy-input-group {
  margin-bottom: 1.5rem;
}

.gfy-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--gfy-text-primary);
}

.gfy-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-md);
  font-family: inherit;
  font-size: 0.95rem;
  background: var(--gfy-white);
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.gfy-textarea:focus {
  outline: none;
  border-color: var(--gfy-primary-color);
  box-shadow: 0 0 0 3px var(--gfy-primary-light);
}

.gfy-textarea::placeholder {
  color: var(--gfy-text-muted);
}

/* AUTHORITY HOOK BLOCK */
.gfy-authority-hook {
  background: var(--gfy-white);
  border: 1px solid var(--gfy-border-color);
  border-left: 4px solid var(--gfy-primary-color);
  padding: 1.5rem;
  border-radius: var(--gfy-radius-md);
}

.gfy-authority-hook__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.gfy-authority-hook__title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--gfy-text-primary);
  margin: 0;
}

.gfy-authority-hook__icon {
  color: var(--gfy-warning-color);
  font-size: 1.2rem;
}

/* BUILDER GRID */
.gfy-builder {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.gfy-builder__field {
  margin-bottom: 0.5rem;
}

.gfy-builder__label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--gfy-text-secondary);
  margin-bottom: 0.4rem;
}

.gfy-builder__input {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-md);
  font-size: 0.9rem;
  background: var(--gfy-bg-color);
  box-sizing: border-box;
  font-family: inherit;
}

.gfy-builder__input:focus {
  outline: none;
  border-color: var(--gfy-primary-color);
  background: var(--gfy-white);
}

.gfy-builder__input::placeholder {
  color: var(--gfy-text-muted);
}

/* LIVE PREVIEW */
.gfy-live-preview {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--gfy-primary-light);
  border-radius: var(--gfy-radius-md);
  border: 1px solid #bfdbfe;
  color: var(--gfy-primary-dark);
  font-size: 0.95rem;
  font-style: italic;
  text-align: center;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .gfy-builder {
    grid-template-columns: 1fr;
  }
}
</style>
