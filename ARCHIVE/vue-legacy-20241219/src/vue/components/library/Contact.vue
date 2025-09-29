<template>
  <div class="gmkb-contact" :class="classList">
    <div class="contact-content">
      <h2 v-if="title" class="contact-title">{{ title }}</h2>
      <p v-if="description" class="contact-description">{{ description }}</p>
      
      <div class="contact-info">
        <div v-if="email" class="contact-item">
          <svg class="contact-icon" viewBox="0 0 24 24" width="20" height="20">
            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="currentColor" fill="none" stroke-width="2"/>
          </svg>
          <a :href="`mailto:${email}`" class="contact-link">{{ email }}</a>
        </div>
        
        <div v-if="phone" class="contact-item">
          <svg class="contact-icon" viewBox="0 0 24 24" width="20" height="20">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" stroke="currentColor" fill="none" stroke-width="2"/>
          </svg>
          <a :href="`tel:${phone}`" class="contact-link">{{ phone }}</a>
        </div>
        
        <div v-if="website" class="contact-item">
          <svg class="contact-icon" viewBox="0 0 24 24" width="20" height="20">
            <circle cx="12" cy="12" r="10" stroke="currentColor" fill="none" stroke-width="2"/>
            <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke="currentColor" fill="none" stroke-width="2"/>
          </svg>
          <a :href="website" target="_blank" rel="noopener" class="contact-link">{{ displayWebsite }}</a>
        </div>
        
        <div v-if="address" class="contact-item">
          <svg class="contact-icon" viewBox="0 0 24 24" width="20" height="20">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0zM12 7v6" stroke="currentColor" fill="none" stroke-width="2"/>
            <circle cx="12" cy="10" r="3" stroke="currentColor" fill="none" stroke-width="2"/>
          </svg>
          <span class="contact-text">{{ address }}</span>
        </div>
      </div>
      
      <div v-if="ctaText && ctaUrl" class="contact-cta">
        <a :href="ctaUrl" class="btn btn--primary">{{ ctaText }}</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
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

const title = computed(() => 
  props.data?.title || 'Get in Touch'
);

const description = computed(() =>
  props.data?.description || "Let's connect and explore opportunities together"
);

const email = computed(() => 
  props.data?.email || podsData.email.value
);

const phone = computed(() =>
  props.data?.phone || podsData.phone.value
);

const website = computed(() =>
  props.data?.website || podsData.website.value
);

const address = computed(() =>
  props.data?.address || ''
);

const ctaText = computed(() =>
  props.data?.ctaText || 'Book a Call'
);

const ctaUrl = computed(() =>
  props.data?.ctaUrl || ''
);

const displayWebsite = computed(() => {
  const url = website.value;
  if (!url) return '';
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
});

const classList = computed(() => ({
  'contact--centered': props.settings?.alignment === 'center',
  'contact--dark': props.settings?.variant === 'dark'
}));
</script>

<style scoped>
.gmkb-contact {
  padding: var(--spacing-xl, 3rem);
  background: var(--color-surface, #ffffff);
  border-radius: var(--radius-md, 8px);
}

.contact-content {
  max-width: var(--max-width, 800px);
  margin: 0 auto;
}

.contact-title {
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 700;
  color: var(--color-text, #1a1a1a);
  margin: 0 0 1rem;
}

.contact-description {
  font-size: 1.125rem;
  color: var(--color-text-light, #666666);
  margin: 0 0 2rem;
  line-height: 1.6;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.contact-icon {
  color: var(--color-primary, #3b82f6);
  flex-shrink: 0;
}

.contact-link {
  color: var(--color-text, #1a1a1a);
  text-decoration: none;
  font-size: 1rem;
  transition: color 0.3s ease;
}

.contact-link:hover {
  color: var(--color-primary, #3b82f6);
}

.contact-text {
  color: var(--color-text, #1a1a1a);
  font-size: 1rem;
}

.contact-cta {
  margin-top: 2rem;
}

.btn {
  display: inline-block;
  padding: 12px 32px;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  border-radius: var(--radius-sm, 6px);
  transition: all 0.3s ease;
  cursor: pointer;
}

.btn--primary {
  background-color: var(--color-primary, #3b82f6);
  color: white;
  border: none;
}

.btn--primary:hover {
  background-color: var(--color-primary-hover, #2563eb);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

/* Dark variant */
.contact--dark {
  background: var(--color-surface-dark, #1a1a1a);
}

.contact--dark .contact-title,
.contact--dark .contact-link,
.contact--dark .contact-text {
  color: white;
}

.contact--dark .contact-description {
  color: rgba(255, 255, 255, 0.8);
}

/* Centered variant */
.contact--centered .contact-content {
  text-align: center;
}

.contact--centered .contact-info {
  align-items: center;
}

/* Responsive */
@media (max-width: 768px) {
  .gmkb-contact {
    padding: 2rem 1.5rem;
  }
  
  .contact-title {
    font-size: 1.5rem;
  }
}
</style>
