<template>
  <!-- ROOT FIX: Use design system classes -->
  <div class="gmkb-component gmkb-component--biography" :data-component-id="componentId">
    <div class="component-root biography-content">
      <h2 v-if="name" class="biography-name">{{ name }}</h2>
      <p v-if="title" class="biography-title">{{ title }}</p>
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
    // ROOT FIX: Standardized prop names (data contract)
    name: String,
    title: String,
    biography: String,
    company: String
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
