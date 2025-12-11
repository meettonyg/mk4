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
import { computed } from 'vue';

export default {
  name: 'TestimonialsRenderer',
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
  setup(props) {
    // Data from component JSON state (single source of truth)
    const title = computed(() => props.data?.title || props.props?.title || 'What People Say');

    // Testimonials from component data
    const testimonials = computed(() => {
      if (props.data?.testimonials && Array.isArray(props.data.testimonials)) {
        return props.data.testimonials;
      }

      // Build from individual testimonial fields
      const testimonialsList = [];
      for (let i = 1; i <= 10; i++) {
        const textKey = `testimonial_${i}_text`;
        const authorKey = `testimonial_${i}_author`;
        const titleKey = `testimonial_${i}_title`;

        const testimonialText = props.data?.[textKey] || props.props?.[textKey];
        if (testimonialText) {
          testimonialsList.push({
            text: testimonialText,
            author: props.data?.[authorKey] || props.props?.[authorKey] || 'Anonymous',
            title: props.data?.[titleKey] || props.props?.[titleKey] || ''
          });
        }
      }

      return testimonialsList;
    });

    return {
      title,
      testimonials
    };
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
