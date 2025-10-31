<template>
  <!-- ROOT FIX: Use design system classes -->
  <!-- SIMPLIFIED: Biography component displays ONLY biography text -->
  <div class="gmkb-component gmkb-component--biography" :data-component-id="componentId">
    <div class="component-root biography-content">
      <div v-if="biography" class="biography-text" v-html="formattedBio"></div>
      <p v-else class="biography-placeholder">
        Add your full biography and professional background here.
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BiographyRenderer',
  props: {
    componentId: String,
    // SIMPLIFIED: Biography component handles ONLY biography text
    // Name, title, company are handled by Guest-Intro and Hero components
    biography: String
  },
  computed: {
    formattedBio() {
      if (!this.biography) return '';
      // Convert newlines to paragraphs if needed
      if (!this.biography.includes('<p>')) {
        return this.biography.split('\n\n').map(p => `<p>${p}</p>`).join('');
      }
      return this.biography;
    }
  }
}
</script>

<style>
/* ROOT FIX: NO scoped styles
   All styling comes from design-system/components.css:
   - .gmkb-component (base component wrapper)
   - .gmkb-component--biography (biography-specific styles)
   - .biography-content, .biography-name, .biography-title, .biography-text
*/
</style>
