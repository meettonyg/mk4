<template>
  <!-- ROOT FIX: Use design system classes -->
  <div class="gmkb-component gmkb-component--hero" :data-component-id="componentId">
    <div class="component-root hero-content">
    <div v-if="imageUrl" class="hero__avatar">
      <img :src="imageUrl" :alt="name || 'Profile Avatar'" />
    </div>
    <h1 v-if="name" class="hero__name">{{ name }}</h1>
    <div v-if="title" class="hero__title">{{ title }}</div>
    <p v-if="bio" class="hero__bio">{{ bio }}</p>
    <div v-if="ctaText" class="hero__cta">
      <button class="btn" @click="handleCtaClick">{{ ctaText }}</button>
    </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'HeroRenderer',
  props: {
    // STANDARD INTERFACE: All components accept the same props structure
    componentId: {
      type: String,
      required: true
    },
    data: {
      type: Object,
      default: () => ({})
    },
    props: {
      type: Object,
      default: () => ({})
    },
    settings: {
      type: Object,
      default: () => ({})
    },
    // Optional editing state
    isEditing: {
      type: Boolean,
      default: false
    },
    isSelected: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { emit }) {
    // Data from component JSON state (single source of truth)
    // ROOT FIX: Support profile pre-population field mappings
    // Profile config provides: title (full name), subtitle, description
    // Renderer expects: name, title, bio, imageUrl, ctaText, ctaUrl

    const data = computed(() => props.data || props.props || {});

    // Name: check 'name' first, fall back to profile's 'title' (composite name)
    const name = computed(() =>
      data.value.name || data.value.title || ''
    );

    // Title: check 'title' first (if name exists), then 'subtitle', then 'professional_title'
    const title = computed(() => {
      // If we have a separate name field, title can be used as-is
      if (data.value.name && data.value.title) {
        return data.value.title;
      }
      // Otherwise, use subtitle from profile pre-population
      return data.value.subtitle || data.value.professional_title || data.value.tagline || '';
    });

    // Bio: check 'bio' first, fall back to profile's 'description'
    const bio = computed(() =>
      data.value.bio || data.value.description || data.value.introduction || ''
    );

    // Image URL: check multiple possible field names
    const imageUrl = computed(() =>
      data.value.imageUrl ||
      data.value.image_url ||
      data.value.profile_photo ||
      data.value.avatar ||
      data.value.photo ||
      ''
    );

    const ctaText = computed(() =>
      data.value.ctaText || data.value.cta_text || data.value.button_text || ''
    );

    const ctaUrl = computed(() =>
      data.value.ctaUrl || data.value.cta_url || data.value.button_url || data.value.booking_url || ''
    );

    // CTA Click handler
    const handleCtaClick = () => {
      if (ctaUrl.value && ctaUrl.value !== '#') {
        window.location.href = ctaUrl.value;
      }
      emit('cta-click');
    };

    return {
      name,
      title,
      bio,
      imageUrl,
      ctaText,
      ctaUrl,
      handleCtaClick
    };
  }
}
</script>

<style>
/* ROOT FIX: NO scoped styles
   All styling comes from design-system/components.css:
   - .gmkb-component (base component wrapper)
   - .gmkb-component--hero (hero-specific styles)
   - .hero__avatar, .hero__name, .hero__title, .hero__bio, .hero__cta
*/
</style>
