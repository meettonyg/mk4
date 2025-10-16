<template>
  <!-- ROOT FIX: Use design system classes -->
  <div class="gmkb-component gmkb-component--hero" :data-component-id="componentId">
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
</template>

<script>
export default {
  name: 'HeroRenderer',
  props: {
    componentId: String,
    // ROOT FIX: Standardized prop names (data contract)
    name: String,
    title: String,
    bio: String,
    imageUrl: String,
    ctaText: String,
    ctaUrl: String
  },
  methods: {
    handleCtaClick() {
      if (this.ctaUrl && this.ctaUrl !== '#') {
        window.location.href = this.ctaUrl;
      }
      this.$emit('cta-click');
    }
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
