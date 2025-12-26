<template>
  <AiWidgetFrame
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
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useAIOffers, PACKAGE_TIERS } from '@composables/useAIOffers';
import { useAuthorityHook } from '@composables/useAuthorityHook';
import AiWidgetFrame from '@ai/AiWidgetFrame.vue';
import AiGenerateButton from '@ai/AiGenerateButton.vue';

const props = defineProps({
  /**
   * Mode: 'integrated' or 'standalone'
   */
  mode: {
    type: String,
    default: 'standalone'
  },

  /**
   * Component ID to apply results to (integrated mode)
   */
  componentId: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['applied', 'generated']);

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

/**
 * Can generate check
 */
const canGenerate = computed(() => {
  return services.value.trim() && authorityHookText.value.trim();
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
</script>

<style scoped>
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
</style>
