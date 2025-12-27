<template>
  <!-- Standalone Mode: Full two-panel layout -->
  <GeneratorLayout
    v-if="mode === 'standalone'"
    title="Service Packages Generator"
    subtitle="Create tiered service packages that communicate clear value and outcomes"
    intro-text="Generate three professionally-structured service packages (Entry, Signature, and Premium) based on your services and expertise. Each package will be designed to appeal to different client needs and budgets while showcasing the value and transformation you provide."
    generator-type="offers"
    :has-results="hasOffers"
    :is-loading="isGenerating"
  >
    <!-- Left Panel: Form -->
    <template #left>
      <!-- Services Section -->
      <div class="generator__section">
        <h3 class="generator__section-title">Your Services</h3>

        <div class="generator__field">
          <label class="generator__field-label">Services You Offer *</label>
          <textarea
            v-model="services"
            class="generator__field-input generator__field-textarea"
            placeholder="e.g., 1-on-1 coaching, group workshops, keynote speaking, online courses, consulting..."
            rows="4"
          ></textarea>
          <p class="generator__field-helper">
            List the services you want to package and sell.
          </p>
        </div>

        <div class="generator__field">
          <label class="generator__field-label">Your Expertise *</label>
          <textarea
            v-model="authorityHookText"
            class="generator__field-input generator__field-textarea"
            placeholder="e.g., I help entrepreneurs scale their businesses through strategic planning and leadership development..."
            rows="3"
          ></textarea>
          <p class="generator__field-helper">
            Describe what you do and who you help.
          </p>
        </div>
      </div>

      <!-- Generate Button -->
      <div class="generator__actions">
        <button
          type="button"
          class="generator__button generator__button--call-to-action"
          :class="{ 'generator__button--loading': isGenerating }"
          :disabled="!canGenerate || isGenerating"
          @click="handleGenerate"
        >
          <svg v-if="!isGenerating" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          {{ isGenerating ? 'Creating packages...' : 'Generate 3 Packages with AI' }}
        </button>
      </div>

      <!-- Error Display -->
      <div v-if="error" class="generator__error">
        <p>{{ error }}</p>
        <button type="button" class="generator__button generator__button--outline" @click="handleGenerate">
          Try Again
        </button>
      </div>
    </template>

    <!-- Right Panel: Guidance -->
    <template #right>
      <GuidancePanel
        title="Creating Irresistible Service Packages"
        subtitle="Well-structured service packages make it easy for prospects to understand your value and choose the right option for their needs."
        :formula="offersFormula"
        :process-steps="processSteps"
        :examples="examples"
        examples-title="Example Package Descriptions:"
      />
    </template>

    <!-- Results -->
    <template #results>
      <div class="offers-generator__results">
        <div class="offers-generator__results-header">
          <h3>Your Generated Service Packages</h3>
          <p>Three tiered options designed to appeal to different client needs</p>
        </div>

        <!-- Package Cards -->
        <div class="offers-generator__packages-grid">
          <div
            v-for="(pkg, index) in offers"
            :key="index"
            class="offers-generator__package"
            :class="[`offers-generator__package--${pkg.tier || PACKAGE_TIERS[index]?.value || 'entry'}`]"
          >
            <div class="offers-generator__package-header">
              <span class="offers-generator__package-tier">
                {{ pkg.tier || PACKAGE_TIERS[index]?.label || 'Package' }}
              </span>
              <h4 class="offers-generator__package-name">{{ pkg.name }}</h4>
            </div>

            <p class="offers-generator__package-description">{{ pkg.description }}</p>

            <div class="offers-generator__package-section">
              <h5 class="offers-generator__package-section-title">Includes:</h5>
              <ul class="offers-generator__package-deliverables">
                <li
                  v-for="(deliverable, dIndex) in pkg.deliverables"
                  :key="dIndex"
                >
                  {{ deliverable }}
                </li>
              </ul>
            </div>

            <div v-if="pkg.idealClient" class="offers-generator__package-ideal">
              <strong>Ideal for:</strong> {{ pkg.idealClient }}
            </div>
          </div>
        </div>

        <!-- Pricing Note -->
        <div class="offers-generator__note">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <span>Add your own pricing to these packages based on your market positioning.</span>
        </div>

        <!-- Actions -->
        <div class="offers-generator__actions">
          <button
            type="button"
            class="generator__button generator__button--outline"
            @click="handleCopy"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            Copy to Clipboard
          </button>
        </div>
      </div>
    </template>
  </GeneratorLayout>

  <!-- Integrated Mode: Compact widget -->
  <AiWidgetFrame
    v-else-if="mode === 'integrated'"
    title="Service Packages Generator"
    description="Create tiered service packages that communicate clear value and outcomes."
    :mode="mode"
    :is-loading="isGenerating"
    :has-results="hasOffers"
    :error="error"
    :usage-remaining="usageRemaining"
    :reset-time="resetTime"
    target-component="Offers"
    :show-cta="!hasOffers"
    :cta-variant="usageRemaining === 0 ? 'exhausted' : 'default'"
    @apply="handleApply"
    @regenerate="handleGenerate"
    @copy="handleCopy"
    @retry="handleGenerate"
  >
    <!-- Input Form -->
    <div class="gmkb-ai-form">
      <!-- Services Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">Services You Offer</label>
        <textarea
          v-model="services"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="e.g., 1-on-1 coaching, group workshops, keynote speaking, online courses, consulting..."
          rows="3"
        ></textarea>
        <span class="gmkb-ai-hint">
          List the services you want to package and sell.
        </span>
      </div>

      <!-- Authority Hook -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">Your Expertise</label>
        <textarea
          v-model="authorityHookText"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="e.g., I help entrepreneurs scale their businesses through strategic planning and leadership development..."
          rows="2"
        ></textarea>
        <span class="gmkb-ai-hint">
          Describe what you do and who you help.
        </span>
      </div>

      <!-- Generate Button -->
      <AiGenerateButton
        text="Generate 3 Packages"
        loading-text="Creating packages..."
        :loading="isGenerating"
        :disabled="!canGenerate"
        full-width
        @click="handleGenerate"
      />
    </div>

    <!-- Results -->
    <template #results>
      <div v-if="hasOffers" class="gmkb-ai-packages">
        <!-- Package Cards -->
        <div class="gmkb-ai-packages__grid">
          <div
            v-for="(pkg, index) in offers"
            :key="index"
            class="gmkb-ai-package"
            :class="[`gmkb-ai-package--${pkg.tier || PACKAGE_TIERS[index]?.value || 'entry'}`]"
          >
            <div class="gmkb-ai-package__header">
              <span class="gmkb-ai-package__tier">
                {{ pkg.tier || PACKAGE_TIERS[index]?.label || 'Package' }}
              </span>
              <h4 class="gmkb-ai-package__name">{{ pkg.name }}</h4>
            </div>

            <p class="gmkb-ai-package__description">{{ pkg.description }}</p>

            <div class="gmkb-ai-package__section">
              <h5 class="gmkb-ai-package__section-title">Includes:</h5>
              <ul class="gmkb-ai-package__deliverables">
                <li
                  v-for="(deliverable, dIndex) in pkg.deliverables"
                  :key="dIndex"
                >
                  {{ deliverable }}
                </li>
              </ul>
            </div>

            <div v-if="pkg.idealClient" class="gmkb-ai-package__ideal">
              <strong>Ideal for:</strong> {{ pkg.idealClient }}
            </div>
          </div>
        </div>

        <!-- Pricing Note -->
        <div class="gmkb-ai-packages__note">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <span>Add your own pricing to these packages based on your market positioning.</span>
        </div>
      </div>
    </template>
  </AiWidgetFrame>

  <!-- Embedded Mode: Landing page form (simplified, used with EmbeddedToolWrapper) -->
  <div v-else class="gmkb-embedded-form">
    <!-- Simplified 2-field form for landing page -->
    <div class="gmkb-embedded-fields">
      <div class="gmkb-embedded-field">
        <label class="gmkb-embedded-label">Services You Offer</label>
        <input
          v-model="services"
          type="text"
          class="gmkb-embedded-input"
          placeholder="e.g., 1-on-1 coaching, group workshops, keynote speaking"
          @input="handleEmbeddedFieldChange"
        />
      </div>

      <div class="gmkb-embedded-field">
        <label class="gmkb-embedded-label">Your Expertise</label>
        <input
          v-model="authorityHookText"
          type="text"
          class="gmkb-embedded-input"
          placeholder="e.g., I help entrepreneurs scale their businesses through strategic planning"
          @input="handleEmbeddedFieldChange"
        />
      </div>
    </div>

    <!-- Results display for embedded mode -->
    <div v-if="hasOffers" class="gmkb-embedded-result">
      <div class="gmkb-embedded-result__content">
        <div
          v-for="(pkg, index) in offers"
          :key="index"
          class="gmkb-embedded-package"
        >
          <strong>{{ pkg.name }}:</strong> {{ pkg.description }}
        </div>
      </div>
    </div>

    <!-- Error display -->
    <div v-if="error" class="gmkb-embedded-error">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, inject } from 'vue';
import { useAIOffers, PACKAGE_TIERS } from '../../src/composables/useAIOffers';
import { useAuthorityHook } from '../../src/composables/useAuthorityHook';

// Compact widget components (integrated mode)
import AiWidgetFrame from '../../src/vue/components/ai/AiWidgetFrame.vue';
import AiGenerateButton from '../../src/vue/components/ai/AiGenerateButton.vue';

// Full layout components (standalone mode)
import { GeneratorLayout, GuidancePanel, EMBEDDED_PROFILE_DATA_KEY } from '../_shared';

const props = defineProps({
  /**
   * Mode: 'integrated', 'standalone', or 'embedded'
   * - standalone: Full two-panel layout with guidance
   * - integrated: Compact widget for embedding in other components
   * - embedded: Landing page embed with simplified form
   */
  mode: {
    type: String,
    default: 'standalone',
    validator: (v) => ['standalone', 'integrated', 'embedded'].includes(v)
  },

  /**
   * Component ID to apply results to (integrated mode)
   */
  componentId: {
    type: String,
    default: null
  },

  /**
   * Intent object for embedded mode
   * Contains: { id, label, contextHeading, contextDescription, formPlaceholders, formLabels }
   */
  intent: {
    type: Object,
    default: null
  },

  /**
   * Profile data for pre-population (embedded mode)
   * Passed from EmbeddedToolWrapper via scoped slot
   */
  profileData: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['applied', 'generated', 'change', 'preview-update', 'update:can-generate']);

// Use composables
const {
  isGenerating,
  error,
  usageRemaining,
  resetTime,
  offers,
  hasOffers,
  generate,
  copyToClipboard
} = useAIOffers();

const { authorityHookSummary, syncFromStore } = useAuthorityHook();

// Local state
const services = ref('');
const authorityHookText = ref('');

// Inject profile data from EmbeddedToolWrapper (for embedded mode)
const injectedProfileData = inject(EMBEDDED_PROFILE_DATA_KEY, ref(null));

/**
 * Populate form fields from profile data
 */
function populateFromProfile(profileData) {
  if (!profileData) return;

  // Populate services from hook_what or services field
  if (profileData.hook_what && !services.value) {
    services.value = profileData.hook_what;
  }

  // Populate authority hook text
  if (profileData.authority_hook && !authorityHookText.value) {
    authorityHookText.value = profileData.authority_hook;
  }
}

/**
 * Offers formula for guidance panel
 */
const offersFormula = '<span class="generator__highlight">[VALUE PROPOSITION]</span> + <span class="generator__highlight">[TARGET AUDIENCE]</span> + <span class="generator__highlight">[TRANSFORMATION]</span> = Irresistible Offer';

/**
 * Process steps for guidance panel
 */
const processSteps = [
  {
    title: 'Why Structured Packages Matter',
    description: 'Clear, tiered service packages eliminate confusion and decision paralysis. When prospects can easily understand the differences between your offerings and identify which option suits their needs, they\'re more likely to take action. Strategic packaging also positions you as an authority with well-defined solutions rather than someone who does "custom work."'
  },
  {
    title: 'What Makes Packages Convert',
    description: 'Effective service packages clearly articulate the value, outcomes, and transformation—not just the deliverables. Each tier should speak to a different client scenario or budget level, with the middle "Signature" tier positioned as the recommended option. Include specific deliverables, identify the ideal client for each package, and emphasize results over features.'
  },
  {
    title: 'How to Present Your Packages',
    description: 'Display your packages side-by-side to enable easy comparison. Use clear tier labels (Entry, Signature, Premium) and highlight your recommended option. Be specific about what\'s included, who each package is ideal for, and what transformation clients can expect. Add your own pricing based on your market positioning and the value you deliver.'
  }
];

/**
 * Example packages for guidance panel
 */
const examples = [
  {
    title: 'Business Coaching Entry Package:',
    description: '"Clarity Session" - A 90-minute strategic planning session with personalized action plan and 30-day email support. Ideal for entrepreneurs who need direction and a clear next step.'
  },
  {
    title: 'Marketing Consultant Signature Package:',
    description: '"Complete Marketing Accelerator" - 3-month engagement including marketing strategy, campaign implementation, weekly coaching calls, and analytics reporting. Ideal for established businesses ready to scale their customer acquisition.'
  }
];

/**
 * Can generate check
 */
const canGenerate = computed(() => {
  return services.value.trim() && authorityHookText.value.trim();
});

/**
 * Current intent (for embedded mode)
 */
const currentIntent = computed(() => {
  return props.intent || {
    id: 'default',
    label: 'Service Packages',
    formPlaceholders: {
      services: 'e.g., 1-on-1 coaching, group workshops, keynote speaking',
      expertise: 'e.g., I help entrepreneurs scale their businesses through strategic planning'
    },
    formLabels: {
      services: 'Services You Offer',
      expertise: 'Your Expertise'
    }
  };
});

/**
 * Generate preview text for embedded mode
 */
const embeddedPreviewText = computed(() => {
  const servicesVal = services.value || '[SERVICES]';
  const expertiseVal = authorityHookText.value || '[EXPERTISE]';

  if (!services.value && !authorityHookText.value) {
    return null; // Show default preview
  }

  return `Creating tiered service packages for <strong>${servicesVal}</strong> based on expertise: <strong>${expertiseVal}</strong>`;
});

/**
 * Check if embedded form has minimum required fields
 */
const canGenerateEmbedded = computed(() => {
  return services.value?.trim() && authorityHookText.value?.trim();
});

/**
 * Handle generate button click
 */
const handleGenerate = async () => {
  try {
    const context = props.mode === 'integrated' ? 'builder' : 'public';
    await generate({
      services: services.value,
      authorityHook: authorityHookText.value
    }, context);

    emit('generated', {
      offers: offers.value
    });
  } catch (err) {
    console.error('[OffersGenerator] Generation failed:', err);
  }
};

/**
 * Handle copy to clipboard
 */
const handleCopy = async () => {
  await copyToClipboard();
};

/**
 * Handle apply (integrated mode)
 */
const handleApply = () => {
  emit('applied', {
    componentId: props.componentId,
    offers: offers.value
  });
};

/**
 * Handle embedded field change
 */
const handleEmbeddedFieldChange = () => {
  emit('change', {
    services: services.value,
    expertise: authorityHookText.value
  });
};

/**
 * Sync authority hook from store on mount
 */
onMounted(() => {
  syncFromStore();
  if (authorityHookSummary.value) {
    authorityHookText.value = authorityHookSummary.value;
  }
});

/**
 * Watch for store changes
 */
watch(authorityHookSummary, (newVal) => {
  if (newVal && !authorityHookText.value) {
    authorityHookText.value = newVal;
  }
});

/**
 * Watch for injected profile data changes (embedded mode)
 */
watch(
  injectedProfileData,
  (newData) => {
    if (newData && props.mode === 'embedded') {
      populateFromProfile(newData);
    }
  },
  { immediate: true }
);

/**
 * Watch for profileData prop changes (embedded mode with EmbeddedToolWrapper)
 * Pre-populates form fields when profile data is provided
 */
watch(
  () => props.profileData,
  (newData) => {
    if (newData && props.mode === 'embedded') {
      populateFromProfile(newData);
    }
  },
  { immediate: true }
);

/**
 * Watch for field changes in embedded mode and emit preview updates
 */
watch(
  () => [services.value, authorityHookText.value],
  () => {
    if (props.mode === 'embedded') {
      emit('preview-update', {
        previewHtml: embeddedPreviewText.value,
        fields: {
          services: services.value,
          expertise: authorityHookText.value
        }
      });
    }
  },
  { deep: true }
);

/**
 * Emit can-generate status changes to parent (for embedded mode)
 */
watch(canGenerateEmbedded, (newValue) => {
  if (props.mode === 'embedded') {
    emit('update:can-generate', !!newValue);
  }
}, { immediate: true });
</script>

<style scoped>
/* Standalone Mode Styles */
.generator__section {
  margin-bottom: var(--mkcg-space-lg, 30px);
}

.generator__section-title {
  font-size: var(--mkcg-font-size-lg, 18px);
  font-weight: var(--mkcg-font-weight-semibold, 600);
  color: var(--mkcg-text-primary, #2c3e50);
  margin: 0 0 var(--mkcg-space-md, 20px) 0;
}

.generator__actions {
  margin-top: var(--mkcg-space-lg, 30px);
  text-align: center;
}

.generator__error {
  margin-top: var(--mkcg-space-md, 20px);
  padding: var(--mkcg-space-md, 20px);
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: var(--mkcg-radius, 8px);
  text-align: center;
}

.generator__error p {
  color: #991b1b;
  margin: 0 0 var(--mkcg-space-sm, 12px) 0;
}

/* Offers Results */
.offers-generator__results {
  padding: var(--mkcg-space-md, 20px);
}

.offers-generator__results-header {
  margin-bottom: var(--mkcg-space-md, 20px);
}

.offers-generator__results-header h3 {
  margin: 0 0 var(--mkcg-space-xs, 8px) 0;
  font-size: var(--mkcg-font-size-lg, 18px);
  color: var(--mkcg-text-primary, #2c3e50);
}

.offers-generator__results-header p {
  margin: 0;
  color: var(--mkcg-text-secondary, #5a6d7e);
  font-size: var(--mkcg-font-size-sm, 14px);
}

.offers-generator__packages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--mkcg-space-md, 20px);
  margin-bottom: var(--mkcg-space-md, 20px);
}

.offers-generator__package {
  background: var(--mkcg-bg-primary, #ffffff);
  border: 1px solid var(--mkcg-border-light, #e9ecef);
  border-radius: var(--mkcg-radius, 8px);
  padding: var(--mkcg-space-md, 20px);
  display: flex;
  flex-direction: column;
  transition: var(--mkcg-transition-fast, 0.15s ease);
}

.offers-generator__package:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.offers-generator__package--entry {
  border-top: 3px solid #94a3b8;
}

.offers-generator__package--signature {
  border-top: 3px solid var(--mkcg-primary, #1a9bdc);
  box-shadow: 0 4px 12px rgba(26, 155, 220, 0.15);
}

.offers-generator__package--premium {
  border-top: 3px solid #f59e0b;
}

.offers-generator__package-header {
  margin-bottom: var(--mkcg-space-sm, 12px);
}

.offers-generator__package-tier {
  display: inline-block;
  padding: 4px 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-radius: var(--mkcg-radius-sm, 4px);
  margin-bottom: 8px;
}

.offers-generator__package--entry .offers-generator__package-tier {
  color: #475569;
  background: #f1f5f9;
}

.offers-generator__package--signature .offers-generator__package-tier {
  color: var(--mkcg-primary, #1a9bdc);
  background: rgba(26, 155, 220, 0.1);
}

.offers-generator__package--premium .offers-generator__package-tier {
  color: #d97706;
  background: #fef3c7;
}

.offers-generator__package-name {
  margin: 0;
  font-size: var(--mkcg-font-size-md, 16px);
  font-weight: var(--mkcg-font-weight-semibold, 600);
  color: var(--mkcg-text-primary, #2c3e50);
}

.offers-generator__package-description {
  margin: 0 0 var(--mkcg-space-md, 20px) 0;
  font-size: var(--mkcg-font-size-sm, 14px);
  color: var(--mkcg-text-secondary, #5a6d7e);
  line-height: var(--mkcg-line-height-relaxed, 1.6);
}

.offers-generator__package-section {
  flex: 1;
  margin-bottom: var(--mkcg-space-sm, 12px);
}

.offers-generator__package-section-title {
  margin: 0 0 var(--mkcg-space-xs, 8px) 0;
  font-size: 12px;
  font-weight: var(--mkcg-font-weight-semibold, 600);
  color: var(--mkcg-text-secondary, #5a6d7e);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.offers-generator__package-deliverables {
  margin: 0;
  padding: 0 0 0 20px;
  font-size: var(--mkcg-font-size-sm, 14px);
  color: var(--mkcg-text-primary, #2c3e50);
  line-height: var(--mkcg-line-height-relaxed, 1.6);
}

.offers-generator__package-deliverables li {
  margin-bottom: 6px;
}

.offers-generator__package-ideal {
  padding-top: var(--mkcg-space-sm, 12px);
  border-top: 1px solid var(--mkcg-border-light, #e9ecef);
  font-size: var(--mkcg-font-size-sm, 14px);
  color: var(--mkcg-text-secondary, #5a6d7e);
}

.offers-generator__package-ideal strong {
  color: var(--mkcg-text-primary, #2c3e50);
}

.offers-generator__note {
  display: flex;
  align-items: flex-start;
  gap: var(--mkcg-space-xs, 8px);
  padding: var(--mkcg-space-md, 20px);
  background: #fef9f3;
  border: 1px solid #fed7aa;
  border-radius: var(--mkcg-radius, 8px);
  font-size: var(--mkcg-font-size-sm, 14px);
  color: #92400e;
}

.offers-generator__note svg {
  flex-shrink: 0;
  margin-top: 2px;
  color: #f59e0b;
}

.offers-generator__actions {
  margin-top: var(--mkcg-space-md, 20px);
  display: flex;
  gap: var(--mkcg-space-sm, 12px);
}

/* Integrated Mode Styles (kept from original) */
.gmkb-ai-packages__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.gmkb-ai-package {
  background: var(--gmkb-ai-bg, #ffffff);
  border: 1px solid var(--gmkb-ai-border, #e5e7eb);
  border-radius: var(--gmkb-ai-radius-md, 8px);
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.gmkb-ai-package--entry {
  border-top: 3px solid #94a3b8;
}

.gmkb-ai-package--signature {
  border-top: 3px solid var(--gmkb-ai-primary, #6366f1);
  box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.1);
}

.gmkb-ai-package--premium {
  border-top: 3px solid #f59e0b;
}

.gmkb-ai-package__header {
  margin-bottom: 12px;
}

.gmkb-ai-package__tier {
  display: inline-block;
  padding: 2px 8px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-radius: 4px;
  margin-bottom: 4px;
}

.gmkb-ai-package--entry .gmkb-ai-package__tier {
  color: #475569;
  background: #f1f5f9;
}

.gmkb-ai-package--signature .gmkb-ai-package__tier {
  color: var(--gmkb-ai-primary, #6366f1);
  background: rgba(99, 102, 241, 0.1);
}

.gmkb-ai-package--premium .gmkb-ai-package__tier {
  color: #d97706;
  background: #fef3c7;
}

.gmkb-ai-package__name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--gmkb-ai-text, #1f2937);
}

.gmkb-ai-package__description {
  margin: 0 0 12px 0;
  font-size: 13px;
  color: var(--gmkb-ai-text-secondary, #64748b);
  line-height: 1.5;
}

.gmkb-ai-package__section {
  flex: 1;
  margin-bottom: 12px;
}

.gmkb-ai-package__section-title {
  margin: 0 0 8px 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--gmkb-ai-text-secondary, #64748b);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.gmkb-ai-package__deliverables {
  margin: 0;
  padding: 0 0 0 16px;
  font-size: 13px;
  color: var(--gmkb-ai-text, #1f2937);
}

.gmkb-ai-package__deliverables li {
  margin-bottom: 4px;
}

.gmkb-ai-package__ideal {
  padding-top: 12px;
  border-top: 1px solid var(--gmkb-ai-border, #e5e7eb);
  font-size: 12px;
  color: var(--gmkb-ai-text-secondary, #64748b);
}

.gmkb-ai-packages__note {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 16px;
  padding: 12px;
  background: var(--gmkb-ai-bg-tertiary, #f3f4f6);
  border-radius: var(--gmkb-ai-radius-md, 8px);
  font-size: 13px;
  color: var(--gmkb-ai-text-secondary, #64748b);
}

/* Embedded Mode Styles (for landing page) */
.gmkb-embedded-form {
  width: 100%;
}

.gmkb-embedded-fields {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.gmkb-embedded-field {
  display: flex;
  flex-direction: column;
}

.gmkb-embedded-label {
  display: block;
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 8px;
  color: var(--mkcg-text-primary, #0f172a);
}

.gmkb-embedded-input {
  width: 100%;
  padding: 14px;
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-radius: 8px;
  background: var(--mkcg-bg-secondary, #f9fafb);
  box-sizing: border-box;
  font-size: 15px;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.gmkb-embedded-input:focus {
  outline: none;
  border-color: var(--mkcg-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.gmkb-embedded-input::placeholder {
  color: var(--mkcg-text-light, #94a3b8);
}

.gmkb-embedded-result {
  margin-top: 20px;
  padding: 16px;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 1px solid #86efac;
  border-radius: 8px;
}

.gmkb-embedded-result__content {
  font-size: 15px;
  line-height: 1.6;
  color: #166534;
}

.gmkb-embedded-package {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(22, 101, 52, 0.1);
}

.gmkb-embedded-package:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.gmkb-embedded-package strong {
  color: #15803d;
}

.gmkb-embedded-error {
  margin-top: 16px;
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #991b1b;
  font-size: 14px;
}
</style>
