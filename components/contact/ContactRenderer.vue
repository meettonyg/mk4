<template>
  <!-- ROOT FIX: Use design system classes -->
  <div class="gmkb-component gmkb-component--contact" :data-component-id="componentId">
    <div class="contact-info">
      <!-- Email -->
      <div v-if="email" class="contact-item">
        <i class="fas fa-envelope"></i>
        <a :href="`mailto:${email}`">{{ email }}</a>
      </div>
      
      <!-- Phone -->
      <div v-if="phone" class="contact-item">
        <i class="fas fa-phone"></i>
        <a :href="`tel:${phone}`">{{ phone }}</a>
      </div>
      
      <!-- Website -->
      <div v-if="website" class="contact-item">
        <i class="fas fa-globe"></i>
        <a :href="website" target="_blank" rel="noopener noreferrer">{{ displayWebsite }}</a>
      </div>
      
      <!-- Location -->
      <div v-if="location" class="contact-item">
        <i class="fas fa-map-marker-alt"></i>
        <span>{{ location }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ContactRenderer',
  props: {
    componentId: String,
    // ROOT FIX: Standardized prop names (data contract)
    email: String,
    phone: String,
    website: String,
    location: String
  },
  computed: {
    displayWebsite() {
      if (!this.website) return '';
      return this.website.replace(/^https?:\/\//, '');
    }
  }
}
</script>

<style>
/* ROOT FIX: NO scoped styles
   All styling comes from design-system/components.css:
   - .gmkb-component (base component wrapper)
   - .gmkb-component--contact (contact-specific styles)
   - .contact-info, .contact-item
*/
</style>
