<template>
  <!-- Use StandardAiTool wrapper for consistent layout -->
  <StandardAiTool
    title="Tagline Generator"
    :subtitle="mode === 'default' ? 'Create memorable taglines that capture your unique value proposition and stick in people\\'s minds.' : ''"
    description="Create memorable taglines that capture your unique value proposition."
    tool-type="tagline"
    target-component="Tagline"
    :mode="mode"
    :is-loading="isGenerating"
    :has-results="hasTaglines"
    :show-results="showResults"
    :can-generate="canGenerate"
    :error="error"
    :show-copy-success="copySuccess"
    :usage-remaining="usageRemaining"
    :reset-time="resetTime"
    generate-button-text="Generate 5 Taglines"
    loading-text="Generating your taglines..."
    generate-hint="We'll create 5 unique taglines based on your value proposition"
    :results-title="'Your Taglines'"
    :results-subtitle="'Select your favorite tagline. Click to choose, then lock it in.'"
    results-header="Selected Tagline"
    @generate="handleStartGeneration"
    @regenerate="handleGenerate"
    @apply="handleApply"
    @copy="handleCopy"
    @retry="handleGenerate"
    @start-over="handleStartOver"
  >
    <!-- FORM SLOT: Tool-specific form fields -->
    <template #form>
      <!-- Basic Information -->
      <div class="gfy-form-section">
        <div class="gfy-form-group">
          <label class="gfy-form-label">Your Name or Brand</label>
          <input
            v-model="name"
            type="text"
            class="gfy-form-input"
            placeholder="e.g., Jane Smith or Acme Coaching"
          />
          <span class="gfy-form-hint">Optional: Personalize your tagline with your name.</span>
        </div>
      </div>

      <!-- Authority Context (using reusable component) -->
      <AuthorityContext
        :show-authority-hook="false"
        :show-impact-intro="false"
        :show-combined="true"
        v-model:combined="authorityHookText"
        combined-title="Your Value Proposition"
        combined-subtitle="What transformation do you provide? Who do you help?"
        combined-label="What You Do"
        :combined-required="true"
        combined-placeholder="e.g., I help entrepreneurs build sustainable businesses through strategic planning and mindset coaching. I work with founders who are stuck at a growth plateau and help them break through to their next level of success."
        combined-hint="Describe your work, who you help, and the results you deliver. The more specific, the better your taglines will be."
        :combined-rows="4"
      />

      <!-- Tone Selection -->
      <div class="gfy-highlight-box gfy-highlight-box--green">
        <div class="gfy-highlight-box__header">
          <span class="gfy-highlight-box__icon">
            <i class="fas fa-palette"></i>
          </span>
          <div>
            <h3 class="gfy-highlight-box__title">Tagline Style</h3>
            <p class="gfy-highlight-box__subtitle">Choose the voice and feel of your taglines.</p>
          </div>
        </div>

        <div class="gfy-form-group">
          <label class="gfy-form-label">Tone</label>
          <select v-model="tone" class="gfy-form-select">
            <option value="professional">Professional</option>
            <option value="conversational">Conversational</option>
            <option value="authoritative">Authoritative</option>
            <option value="friendly">Friendly</option>
          </select>
        </div>
      </div>
    </template>

    <!-- INTEGRATED FORM SLOT: Compact form for widget mode -->
    <template #integrated-form>
      <div class="gmkb-ai-form">
        <div class="gmkb-ai-form-group">
          <label class="gmkb-ai-label">Your Name (Optional)</label>
          <input
            v-model="name"
            type="text"
            class="gmkb-ai-input"
            placeholder="e.g., Jane Smith"
          />
        </div>

        <div class="gmkb-ai-form-group">
          <label class="gmkb-ai-label gmkb-ai-label--required">What You Do</label>
          <textarea
            v-model="authorityHookText"
            class="gmkb-ai-input gmkb-ai-textarea"
            placeholder="e.g., I help entrepreneurs build sustainable businesses through strategic planning and mindset coaching..."
            rows="3"
          ></textarea>
          <span class="gmkb-ai-hint">Describe your work and the transformation you provide.</span>
        </div>

        <AiToneSelector v-model="tone" />

        <AiGenerateButton
          text="Generate 5 Taglines"
          loading-text="Generating taglines..."
          :loading="isGenerating"
          :disabled="!canGenerate"
          full-width
          @click="handleGenerate"
        />
      </div>
    </template>

    <!-- SIDEBAR SLOT: Tagline selection -->
    <template #sidebar>
      <div class="gfy-sidebar-panel">
        <div class="gfy-sidebar-header">
          <h3 class="gfy-sidebar-title">Your Taglines</h3>
        </div>

        <!-- Tagline Slots -->
        <button
          v-for="(tagline, index) in taglines"
          :key="index"
          type="button"
          class="gfy-sidebar-slot"
          :class="{
            'gfy-sidebar-slot--active': selectedIndex === index,
            'gfy-sidebar-slot--locked': lockedIndex === index
          }"
          @click="handleSelectTagline(index)"
        >
          <div class="gfy-sidebar-slot__header">
            <span class="gfy-sidebar-slot__label">Option {{ index + 1 }}</span>
            <i v-if="lockedIndex === index" class="fas fa-lock" style="color: var(--gfy-primary-color);"></i>
            <i v-else-if="selectedIndex === index" class="fas fa-check-circle" style="color: var(--gfy-success-color);"></i>
          </div>
          <div class="gfy-sidebar-slot__text">"{{ tagline }}"</div>
        </button>

        <!-- Locked Summary -->
        <div v-if="lockedIndex !== null" class="gfy-sidebar-summary">
          <i class="fas fa-lock"></i>
          Tagline locked
        </div>
      </div>
    </template>

    <!-- RESULTS SLOT: Selected tagline display -->
    <template #results>
      <!-- Locked State -->
      <div v-if="lockedIndex !== null" class="gfy-locked-content">
        <div class="gfy-locked-content__badge">
          <i class="fas fa-lock"></i>
          LOCKED TAGLINE
        </div>
        <div class="gfy-locked-content__text">
          "{{ taglines[lockedIndex] }}"
        </div>
        <div class="gfy-locked-content__actions">
          <button type="button" class="gfy-btn gfy-btn--outline" @click="handleCopy">
            <i class="fas fa-copy"></i> Copy
          </button>
          <button type="button" class="gfy-btn gfy-btn--ghost" @click="unlockTagline">
            <i class="fas fa-unlock"></i> Unlock & Edit
          </button>
        </div>
      </div>

      <!-- Selected Preview -->
      <template v-else-if="selectedTagline">
        <div class="gfy-selected-content">
          <div class="gfy-selected-content__badge">
            Option {{ selectedIndex + 1 }}
          </div>
          <div class="gfy-selected-content__text">
            "{{ selectedTagline }}"
          </div>
          <div class="gfy-selected-content__actions">
            <button
              type="button"
              class="gfy-btn gfy-btn--primary"
              @click="lockTagline(selectedIndex)"
            >
              <i class="fas fa-lock"></i>
              Lock This Tagline
            </button>
            <button
              type="button"
              class="gfy-btn gfy-btn--outline"
              @click="handleCopy"
            >
              <i class="fas fa-copy"></i> Copy
            </button>
          </div>
        </div>

        <!-- Navigation -->
        <div class="gfy-nav">
          <button
            type="button"
            class="gfy-btn gfy-btn--outline"
            :disabled="selectedIndex <= 0"
            @click="selectPrevious"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Previous
          </button>
          <span class="gfy-nav__count">
            {{ selectedIndex + 1 }} / {{ taglines.length }}
          </span>
          <button
            type="button"
            class="gfy-btn gfy-btn--outline"
            :disabled="selectedIndex >= taglines.length - 1"
            @click="selectNext"
          >
            Next
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </template>

      <!-- Empty State -->
      <div v-else class="gfy-empty-state">
        <i class="fas fa-quote-left"></i>
        <p>Select a tagline from the sidebar to preview it.</p>
      </div>
    </template>

    <!-- FOOTER ACTIONS SLOT -->
    <template #footer-actions>
      <button type="button" class="gfy-btn gfy-btn--outline" @click="handleGenerate">
        <i class="fas fa-sync-alt"></i>
        Regenerate All
      </button>
      <button type="button" class="gfy-btn gfy-btn--ghost" @click="handleStartOver">
        Start Over
      </button>
    </template>

    <!-- INTEGRATED RESULTS SLOT -->
    <template #integrated-results>
      <div v-if="hasTaglines" class="gmkb-ai-taglines">
        <p class="gmkb-ai-taglines__instruction">
          Click a tagline to select it:
        </p>
        <AiResultsDisplay
          :content="taglines"
          format="cards"
          :selected-index="selectedIndex"
          @select="handleSelectTagline"
        />

        <!-- Selected Preview -->
        <div v-if="selectedTagline" class="gmkb-ai-taglines__preview">
          <span class="gmkb-ai-taglines__preview-label">Selected:</span>
          <span class="gmkb-ai-taglines__preview-text">"{{ selectedTagline }}"</span>
        </div>
      </div>
    </template>

    <!-- INTEGRATED ACTIONS SLOT -->
    <template #integrated-actions>
      <div v-if="hasTaglines" class="gmkb-ai-taglines__nav">
        <button
          type="button"
          class="gmkb-ai-button gmkb-ai-button--ghost"
          :disabled="selectedIndex <= 0"
          @click="selectPrevious"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <span class="gmkb-ai-taglines__nav-count">
          {{ selectedIndex + 1 }} / {{ taglines.length }}
        </span>
        <button
          type="button"
          class="gmkb-ai-button gmkb-ai-button--ghost"
          :disabled="selectedIndex >= taglines.length - 1"
          @click="selectNext"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
    </template>
  </StandardAiTool>
</template>

<script setup>
import { ref, computed, onMounted, watch, inject } from 'vue';
import { useAITagline } from '../../src/composables/useAITagline';
import { useAuthorityHook } from '../../src/composables/useAuthorityHook';

// Shared components
import { StandardAiTool, AuthorityContext, EMBEDDED_PROFILE_DATA_KEY } from '../_shared';

// Integrated mode components
import AiToneSelector from '../../src/vue/components/ai/AiToneSelector.vue';
import AiGenerateButton from '../../src/vue/components/ai/AiGenerateButton.vue';
import AiResultsDisplay from '../../src/vue/components/ai/AiResultsDisplay.vue';

const props = defineProps({
  mode: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'integrated', 'embedded'].includes(v)
  },
  componentId: {
    type: String,
    default: null
  },
  intent: {
    type: Object,
    default: null
  },
  profileData: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['applied', 'generated', 'preview-update', 'update:can-generate']);

// Inject profile data from EmbeddedToolWrapper
const injectedProfileData = inject(EMBEDDED_PROFILE_DATA_KEY, ref(null));

// Use composables
const {
  isGenerating,
  error,
  usageRemaining,
  resetTime,
  taglines,
  hasTaglines,
  selectedTagline,
  selectedIndex,
  selectTagline,
  selectNext,
  selectPrevious,
  generate,
  copyToClipboard,
  tone
} = useAITagline();

const { authorityHookSummary, syncFromStore, loadFromProfileData } = useAuthorityHook();

// Local state
const name = ref('');
const authorityHookText = ref('');
const showResults = ref(false);
const lockedIndex = ref(null);
const copySuccess = ref(false);

// Can generate check
const canGenerate = computed(() => authorityHookText.value.trim().length > 0);

// Handle tagline selection
const handleSelectTagline = (index) => {
  selectTagline(index);
};

// Lock a tagline
const lockTagline = (index) => {
  lockedIndex.value = index;
};

// Unlock tagline
const unlockTagline = () => {
  lockedIndex.value = null;
};

// Handle starting generation - transitions to results view
const handleStartGeneration = async () => {
  showResults.value = true;
  await handleGenerate();
};

// Handle generate button click
const handleGenerate = async () => {
  lockedIndex.value = null;

  try {
    const context = props.mode === 'integrated' ? 'builder' : 'public';
    await generate({
      name: name.value,
      authorityHook: authorityHookText.value
    }, context);

    emit('generated', { taglines: taglines.value });
  } catch (err) {
    console.error('[TaglineGenerator] Generation failed:', err);
  }
};

// Handle copy to clipboard
const handleCopy = async () => {
  await copyToClipboard();
  copySuccess.value = true;
  setTimeout(() => { copySuccess.value = false; }, 2000);
};

// Handle apply (integrated mode)
const handleApply = () => {
  emit('applied', {
    componentId: props.componentId,
    tagline: selectedTagline.value,
    allTaglines: taglines.value
  });
};

// Handle start over
const handleStartOver = () => {
  lockedIndex.value = null;
  showResults.value = false;
};

// Populate form fields from profile data
function populateFromProfile(profileData) {
  if (!profileData) return;

  const firstName = profileData.first_name || '';
  const lastName = profileData.last_name || '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ');
  if (fullName && !name.value) name.value = fullName;

  if (profileData.authority_hook && !authorityHookText.value) {
    authorityHookText.value = profileData.authority_hook;
  }

  loadFromProfileData(profileData);
}

// Sync authority hook from store on mount
onMounted(() => {
  syncFromStore();
  if (authorityHookSummary.value) authorityHookText.value = authorityHookSummary.value;
});

// Watch for store changes
watch(authorityHookSummary, (newVal) => {
  if (newVal && !authorityHookText.value) authorityHookText.value = newVal;
});

// Watch for injected profile data from EmbeddedToolWrapper
watch(injectedProfileData, (newData) => {
  if (newData) populateFromProfile(newData);
}, { immediate: true });

// Watch for profileData prop changes
watch(() => props.profileData, (newData) => {
  if (newData && props.mode === 'embedded') populateFromProfile(newData);
}, { immediate: true });

// Current intent for embedded mode
const currentIntent = computed(() => props.intent || null);

// Generate preview text for embedded mode
const embeddedPreviewText = computed(() => {
  if (!name.value) return null;
  return `<strong>Professional tagline</strong> for <strong>${name.value}</strong>`;
});

// Watch for field changes in embedded mode
watch(() => name.value, () => {
  if (props.mode === 'embedded') {
    emit('preview-update', {
      previewHtml: embeddedPreviewText.value,
      fields: { name: name.value }
    });
  }
});

// Emit can-generate status changes
watch(canGenerate, (newValue) => {
  emit('update:can-generate', !!newValue);
}, { immediate: true });

// Expose for parent components
defineExpose({
  handleStartGeneration,
  handleGenerate,
  showResults,
  isGenerating,
  error,
  canGenerate
});
</script>

<style scoped>
/* Tool-specific styles only - base styles inherited from StandardAiTool */

/* Form section styling */
.gfy-form-section {
  margin-bottom: 24px;
}

/* Integrated Mode Styles */
.gmkb-ai-taglines__instruction {
  margin: 0 0 12px 0;
  font-size: 13px;
  color: var(--gmkb-ai-text-secondary, #64748b);
}

.gmkb-ai-taglines__preview {
  margin-top: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #7dd3fc;
  border-radius: 8px;
}

.gmkb-ai-taglines__preview-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #0369a1;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.gmkb-ai-taglines__preview-text {
  font-size: 18px;
  font-weight: 500;
  color: #0c4a6e;
  font-style: italic;
}

.gmkb-ai-taglines__nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.gmkb-ai-taglines__nav-count {
  font-size: 13px;
  color: var(--gmkb-ai-text-secondary, #64748b);
}
</style>
