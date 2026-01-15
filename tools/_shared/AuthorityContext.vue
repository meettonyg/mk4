<template>
  <div class="gfy-authority-context">
    <!-- 4-Field Authority Hook -->
    <div v-if="showAuthorityHook" class="gfy-highlight-box gfy-highlight-box--blue">
      <div class="gfy-highlight-box__header">
        <span class="gfy-highlight-box__icon">
          <i class="fas fa-bullhorn"></i>
        </span>
        <div>
          <h3 class="gfy-highlight-box__title">{{ authorityTitle }}</h3>
          <p class="gfy-highlight-box__subtitle">{{ authoritySubtitle }}</p>
        </div>
      </div>

      <!-- WHO: Who do you help? -->
      <div v-if="showWho" class="gfy-form-group">
        <label class="gfy-form-label" :class="{ 'gfy-form-label--required': whoRequired }">
          Who do you help?
        </label>
        <input
          :value="who"
          type="text"
          class="gfy-form-input"
          :placeholder="whoPlaceholder"
          @input="$emit('update:who', $event.target.value)"
        />
        <span class="gfy-form-hint">{{ whoHint }}</span>
      </div>

      <!-- WHAT: What do you do? -->
      <div v-if="showWhat" class="gfy-form-group">
        <label class="gfy-form-label" :class="{ 'gfy-form-label--required': whatRequired }">
          What do you do?
        </label>
        <textarea
          :value="what"
          class="gfy-form-textarea"
          :placeholder="whatPlaceholder"
          rows="3"
          @input="$emit('update:what', $event.target.value)"
        ></textarea>
        <span class="gfy-form-hint">{{ whatHint }}</span>
      </div>

      <!-- WHEN: When/context -->
      <div v-if="showWhen" class="gfy-form-group">
        <label class="gfy-form-label">
          Context/Situation
          <span class="gfy-form-label__optional">Optional</span>
        </label>
        <input
          :value="when"
          type="text"
          class="gfy-form-input"
          :placeholder="whenPlaceholder"
          @input="$emit('update:when', $event.target.value)"
        />
        <span class="gfy-form-hint">{{ whenHint }}</span>
      </div>

      <!-- HOW: How do you do it? -->
      <div v-if="showHow" class="gfy-form-group">
        <label class="gfy-form-label">
          How do you achieve results?
          <span class="gfy-form-label__optional">Optional</span>
        </label>
        <textarea
          :value="how"
          class="gfy-form-textarea"
          :placeholder="howPlaceholder"
          rows="2"
          @input="$emit('update:how', $event.target.value)"
        ></textarea>
        <span class="gfy-form-hint">{{ howHint }}</span>
      </div>

      <!-- Authority Hook Preview -->
      <div v-if="authorityPreview" class="gfy-live-preview">
        <span class="gfy-live-preview__label">Authority Hook:</span>
        {{ authorityPreview }}
      </div>
    </div>

    <!-- 2-Field Impact Intro -->
    <div v-if="showImpactIntro" class="gfy-highlight-box gfy-highlight-box--green">
      <div class="gfy-highlight-box__header">
        <span class="gfy-highlight-box__icon">
          <i class="fas fa-chart-line"></i>
        </span>
        <div>
          <h3 class="gfy-highlight-box__title">{{ impactTitle }}</h3>
          <p class="gfy-highlight-box__subtitle">{{ impactSubtitle }}</p>
        </div>
      </div>

      <!-- WHERE: Where do you create impact? -->
      <div v-if="showWhere" class="gfy-form-group">
        <label class="gfy-form-label">
          Where do you create impact?
          <span class="gfy-form-label__optional">Optional</span>
        </label>
        <input
          :value="where"
          type="text"
          class="gfy-form-input"
          :placeholder="wherePlaceholder"
          @input="$emit('update:where', $event.target.value)"
        />
        <span class="gfy-form-hint">{{ whereHint }}</span>
      </div>

      <!-- WHY: Why does it matter? -->
      <div v-if="showWhy" class="gfy-form-group">
        <label class="gfy-form-label">
          Why does this matter?
          <span class="gfy-form-label__optional">Optional</span>
        </label>
        <textarea
          :value="why"
          class="gfy-form-textarea"
          :placeholder="whyPlaceholder"
          rows="2"
          @input="$emit('update:why', $event.target.value)"
        ></textarea>
        <span class="gfy-form-hint">{{ whyHint }}</span>
      </div>
    </div>

    <!-- Combined Full Authority Hook Textarea (simplified mode) -->
    <div v-if="showCombined" class="gfy-highlight-box gfy-highlight-box--blue">
      <div class="gfy-highlight-box__header">
        <span class="gfy-highlight-box__icon">
          <i class="fas fa-bullhorn"></i>
        </span>
        <div>
          <h3 class="gfy-highlight-box__title">{{ combinedTitle }}</h3>
          <p class="gfy-highlight-box__subtitle">{{ combinedSubtitle }}</p>
        </div>
      </div>

      <div class="gfy-form-group">
        <label class="gfy-form-label" :class="{ 'gfy-form-label--required': combinedRequired }">
          {{ combinedLabel }}
        </label>
        <textarea
          :value="combined"
          class="gfy-form-textarea"
          :placeholder="combinedPlaceholder"
          :rows="combinedRows"
          @input="$emit('update:combined', $event.target.value)"
        ></textarea>
        <span class="gfy-form-hint">{{ combinedHint }}</span>
      </div>

      <!-- Combined Preview -->
      <div v-if="combined && combined.trim()" class="gfy-live-preview">
        <span class="gfy-live-preview__label">Preview:</span>
        {{ combinedPreviewText }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  // Mode
  variant: {
    type: String,
    default: 'full', // 'full' | 'compact' | 'combined'
    validator: (v) => ['full', 'compact', 'combined'].includes(v)
  },

  // Authority Hook Fields (4-field)
  showAuthorityHook: {
    type: Boolean,
    default: true
  },
  authorityTitle: {
    type: String,
    default: 'Your Authority Hook'
  },
  authoritySubtitle: {
    type: String,
    default: 'Define who you help and what transformation you provide.'
  },

  // WHO field
  showWho: {
    type: Boolean,
    default: true
  },
  who: {
    type: String,
    default: ''
  },
  whoRequired: {
    type: Boolean,
    default: false
  },
  whoPlaceholder: {
    type: String,
    default: 'e.g., Entrepreneurs, executives, small business owners...'
  },
  whoHint: {
    type: String,
    default: 'Describe your ideal client or audience.'
  },

  // WHAT field
  showWhat: {
    type: Boolean,
    default: true
  },
  what: {
    type: String,
    default: ''
  },
  whatRequired: {
    type: Boolean,
    default: true
  },
  whatPlaceholder: {
    type: String,
    default: 'e.g., Build sustainable businesses, develop leadership skills...'
  },
  whatHint: {
    type: String,
    default: 'Describe the transformation or results you deliver.'
  },

  // WHEN field
  showWhen: {
    type: Boolean,
    default: false
  },
  when: {
    type: String,
    default: ''
  },
  whenPlaceholder: {
    type: String,
    default: 'e.g., During major transitions, at growth plateaus...'
  },
  whenHint: {
    type: String,
    default: 'When do people typically need your help?'
  },

  // HOW field
  showHow: {
    type: Boolean,
    default: false
  },
  how: {
    type: String,
    default: ''
  },
  howPlaceholder: {
    type: String,
    default: 'e.g., Through strategic coaching, proven frameworks...'
  },
  howHint: {
    type: String,
    default: 'What methods or approaches do you use?'
  },

  // Impact Intro Fields (2-field)
  showImpactIntro: {
    type: Boolean,
    default: false
  },
  impactTitle: {
    type: String,
    default: 'Your Impact'
  },
  impactSubtitle: {
    type: String,
    default: 'Define where and why your work matters.'
  },

  // WHERE field
  showWhere: {
    type: Boolean,
    default: true
  },
  where: {
    type: String,
    default: ''
  },
  wherePlaceholder: {
    type: String,
    default: 'e.g., Fortune 500 companies, startups, non-profits...'
  },
  whereHint: {
    type: String,
    default: 'Where have you created the most impact?'
  },

  // WHY field
  showWhy: {
    type: Boolean,
    default: true
  },
  why: {
    type: String,
    default: ''
  },
  whyPlaceholder: {
    type: String,
    default: 'e.g., Because sustainable growth matters more than quick wins...'
  },
  whyHint: {
    type: String,
    default: 'Why is this work important to you and your clients?'
  },

  // Combined Mode (single textarea)
  showCombined: {
    type: Boolean,
    default: false
  },
  combined: {
    type: String,
    default: ''
  },
  combinedRequired: {
    type: Boolean,
    default: true
  },
  combinedTitle: {
    type: String,
    default: 'Your Background'
  },
  combinedSubtitle: {
    type: String,
    default: 'Tell us about your expertise and what you do.'
  },
  combinedLabel: {
    type: String,
    default: 'Authority Hook'
  },
  combinedPlaceholder: {
    type: String,
    default: 'e.g., I help entrepreneurs build sustainable businesses through strategic planning and mindset coaching...'
  },
  combinedHint: {
    type: String,
    default: 'Describe who you help, what you do, and the transformation you provide.'
  },
  combinedRows: {
    type: Number,
    default: 4
  }
});

const emit = defineEmits([
  'update:who',
  'update:what',
  'update:when',
  'update:how',
  'update:where',
  'update:why',
  'update:combined'
]);

// Computed preview for full authority hook
const authorityPreview = computed(() => {
  const parts = [];
  if (props.who) parts.push(`I help ${props.who}`);
  if (props.what) parts.push(props.what);
  if (parts.length === 0) return '';
  return parts.join(' ').substring(0, 150) + (parts.join(' ').length > 150 ? '...' : '');
});

// Computed preview for combined mode
const combinedPreviewText = computed(() => {
  const text = props.combined?.trim() || '';
  if (text.length <= 100) return text;
  return text.substring(0, 100) + '...';
});
</script>

<style scoped>
/* Component inherits all gfy- styles from StandardAiTool */
.gfy-authority-context {
  /* Container for authority context fields */
}
</style>
