<template>
  <!-- ROOT FIX: Use design system classes -->
  <div class="gmkb-component gmkb-component--cta" :data-component-id="componentId">
    <h2 v-if="title" class="cta-title">{{ title }}</h2>
    <p v-if="description" class="cta-description">{{ description }}</p>
    
    <div class="cta-buttons">
      <a
        v-for="(button, index) in buttons"
        :key="index"
        :href="button.url"
        :class="['cta-button', button.style || 'primary']"
        :target="button.target || '_self'"
      >
        {{ button.text }}
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CallToActionRenderer',
  props: {
    componentId: String,
    // ROOT FIX: Standardized prop names (data contract)
    title: {
      type: String,
      default: 'Ready to Take Action?'
    },
    description: String,
    buttons: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style>
/* ROOT FIX: NO scoped styles
   All styling comes from design-system/components.css:
   - .gmkb-component (base component wrapper)
   - .gmkb-component--cta (cta-specific styles)
   - .cta-title, .cta-description, .cta-buttons, .cta-button
*/
</style>
