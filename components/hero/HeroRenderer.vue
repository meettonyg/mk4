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

    // Helper function to find first available value from multiple field names
    const findValue = (keys) => {
      for (const key of keys) {
        const value = data.value[key];
        if (value !== undefined && value !== null && value !== '') return value;
      }
      return '';
    };

    // Name: check 'name' first, fall back to profile's 'title' (composite name)
    const name = computed(() => findValue(['name', 'title']));

    // Title: check 'title' first (if name exists), then 'subtitle', then 'professional_title'
    const title = computed(() => {
      // If we have a separate name field, title can be used as-is
      if (data.value.name && data.value.title) {
        return data.value.title;
      }
      // Otherwise, use subtitle from profile pre-population
      return findValue(['subtitle', 'professional_title', 'tagline']);
    });

    // Bio: check 'bio' first, fall back to profile's 'description'
    const bio = computed(() => findValue(['bio', 'description', 'introduction']));

    // Image URL: check multiple possible field names
    const imageUrl = computed(() => findValue(['imageUrl', 'image_url', 'profile_photo', 'avatar', 'photo']));

    const ctaText = computed(() => findValue(['ctaText', 'cta_text', 'button_text']));

    const ctaUrl = computed(() => findValue(['ctaUrl', 'cta_url', 'button_url', 'booking_url']));

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
