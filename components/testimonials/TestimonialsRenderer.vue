<template>
  <!-- ROOT FIX: Use design system classes -->
  <div class="gmkb-component gmkb-component--testimonials" :data-component-id="componentId">
    <div class="component-root testimonials-content">
    <h2 v-if="title" class="section-title">{{ title }}</h2>
    
    <div class="testimonials-grid">
      <div
        v-for="(testimonial, index) in testimonials"
        :key="index"
        class="testimonial-item"
      >
        <div class="testimonial-quote">"{{ testimonial.text }}"</div>
        <div class="testimonial-author">
          <div class="author-name">{{ testimonial.author }}</div>
          <div v-if="testimonial.title" class="author-title">{{ testimonial.title }}</div>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TestimonialsRenderer',
  props: {
    componentId: String,
    // ROOT FIX: Standardized prop names (data contract)
    title: {
      type: String,
      default: 'What People Say'
    },
    testimonials: {
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
   - .gmkb-component--testimonials (testimonials-specific styles)
   - .testimonials-grid, .testimonial-item, .testimonial-quote, .testimonial-author
*/
</style>
