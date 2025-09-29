<template>
  <div class="gmkb-biography" :class="classList">
    <div class="biography-content">
      <div class="biography-header" v-if="showHeader">
        <img 
          v-if="avatar" 
          :src="avatar" 
          :alt="name"
          class="biography-avatar"
        />
        <div class="biography-info">
          <h2 class="biography-name">{{ name }}</h2>
          <p v-if="jobTitle" class="biography-title">{{ jobTitle }}</p>
          <p v-if="company" class="biography-company">{{ company }}</p>
        </div>
      </div>
      
      <div class="biography-text" :class="{ 'biography-text--expanded': expanded }">
        <div v-html="formattedBio" class="biography-body"></div>
      </div>
      
      <button 
        v-if="showReadMore && !expanded && isLongBio"
        @click="expanded = true"
        class="biography-toggle btn btn--text"
      >
        Read More
      </button>
      
      <button 
        v-if="showReadMore && expanded && isLongBio"
        @click="expanded = false"
        class="biography-toggle btn btn--text"
      >
        Show Less
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { usePodsData } from '../../composables/usePodsData';

const props = defineProps({
  componentId: String,
  data: {
    type: Object,
    default: () => ({})
  },
  settings: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update', 'remove']);

// OPTIMIZED: No API calls here - just accessing store data
const podsData = usePodsData();

const expanded = ref(false);

const name = computed(() => 
  props.data?.name || podsData.fullName.value || 'Your Name'
);

const jobTitle = computed(() =>
  props.data?.jobTitle || podsData.jobTitle.value || ''
);

const company = computed(() =>
  props.data?.company || podsData.companyName.value || ''
);

const avatar = computed(() =>
  props.data?.avatar || podsData.guestHeadshot.value || ''
);

const biography = computed(() =>
  props.data?.biography || podsData.biography.value || 'Share your story here...'
);

const showHeader = computed(() =>
  props.settings?.showHeader !== false
);

const showReadMore = computed(() =>
  props.settings?.showReadMore !== false
);

const maxLines = computed(() =>
  props.settings?.maxLines || 5
);

// Format biography text (convert line breaks to paragraphs)
const formattedBio = computed(() => {
  const text = biography.value;
  
  // If text contains HTML, return as-is
  if (text.includes('<p>') || text.includes('<br')) {
    return text;
  }
  
  // Convert double line breaks to paragraphs
  const paragraphs = text
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
    .join('');
  
  return paragraphs || `<p>${text}</p>`;
});

const isLongBio = computed(() => {
  // Check if bio is long enough to need read more
  const lines = biography.value.split('\n').length;
  const words = biography.value.split(' ').length;
  return lines > maxLines.value || words > 100;
});

const classList = computed(() => ({
  'biography--centered': props.settings?.alignment === 'center',
  'biography--dark': props.settings?.variant === 'dark',
  'biography--card': props.settings?.style === 'card',
  'biography--minimal': props.settings?.style === 'minimal'
}));
</script>

<style scoped>
.gmkb-biography {
  padding: var(--spacing-xl, 3rem);
  background: var(--color-surface, #ffffff);
  border-radius: var(--radius-md, 8px);
}

.biography-content {
  max-width: var(--max-width, 800px);
  margin: 0 auto;
}

.biography-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.biography-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--color-border, #e2e8f0);
}

.biography-info {
  flex: 1;
}

.biography-name {
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 700;
  color: var(--color-text, #1a1a1a);
  margin: 0 0 0.25rem;
}

.biography-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-primary, #3b82f6);
  margin: 0 0 0.25rem;
}

.biography-company {
  font-size: 1rem;
  color: var(--color-text-light, #666666);
  margin: 0;
}

.biography-text {
  position: relative;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.biography-text:not(.biography-text--expanded) {
  max-height: calc(1.6em * var(--max-lines, 5));
}

.biography-text:not(.biography-text--expanded)::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3em;
  background: linear-gradient(to bottom, transparent, var(--color-surface, #ffffff));
}

.biography-text--expanded {
  max-height: none;
}

.biography-text--expanded::after {
  display: none;
}

.biography-body {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--color-text, #1a1a1a);
}

.biography-body :deep(p) {
  margin: 0 0 1rem;
}

.biography-body :deep(p:last-child) {
  margin-bottom: 0;
}

.biography-toggle {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-primary, #3b82f6);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.biography-toggle:hover {
  color: var(--color-primary-hover, #2563eb);
  text-decoration: underline;
}

/* Style variations */
.biography--card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--color-border, #e2e8f0);
}

.biography--minimal {
  background: transparent;
  padding: var(--spacing-lg, 2rem) 0;
}

/* Dark variant */
.biography--dark {
  background: var(--color-surface-dark, #1a1a1a);
}

.biography--dark .biography-name {
  color: white;
}

.biography--dark .biography-company {
  color: rgba(255, 255, 255, 0.7);
}

.biography--dark .biography-body {
  color: rgba(255, 255, 255, 0.9);
}

.biography--dark .biography-text:not(.biography-text--expanded)::after {
  background: linear-gradient(to bottom, transparent, var(--color-surface-dark, #1a1a1a));
}

.biography--dark .biography-avatar {
  border-color: rgba(255, 255, 255, 0.2);
}

/* Centered variant */
.biography--centered .biography-content {
  text-align: center;
}

.biography--centered .biography-header {
  flex-direction: column;
  text-align: center;
}

/* Responsive */
@media (max-width: 768px) {
  .gmkb-biography {
    padding: 2rem 1.5rem;
  }
  
  .biography-header {
    flex-direction: column;
    text-align: center;
  }
  
  .biography-avatar {
    width: 80px;
    height: 80px;
  }
  
  .biography-name {
    font-size: 1.5rem;
  }
}
</style>
