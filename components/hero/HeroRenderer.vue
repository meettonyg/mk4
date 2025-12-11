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
    const name = computed(() => props.data?.name || props.props?.name || '');

    const title = computed(() => props.data?.title || props.props?.title || '');

    const bio = computed(() => props.data?.bio || props.props?.bio || '');

    const imageUrl = computed(() => props.data?.imageUrl || props.props?.imageUrl || '');

    const ctaText = computed(() => props.data?.ctaText || props.props?.ctaText || '');

    const ctaUrl = computed(() => props.data?.ctaUrl || props.props?.ctaUrl || '');

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
