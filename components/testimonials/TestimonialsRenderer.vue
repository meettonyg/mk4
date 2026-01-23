<template>
  <!-- ROOT FIX: Use design system classes -->
  <div class="gmkb-component gmkb-component--testimonials" :data-component-id="componentId">
    <div class="component-root testimonials-content">
    <h2 v-if="title" class="section-title">{{ title }}</h2>
    
    <div class="testimonials-grid">
      <!-- Placeholder testimonials when editing with no data -->
      <template v-if="showPlaceholders">
        <div
          v-for="(testimonial, index) in placeholderTestimonials"
          :key="index"
          class="testimonial-item testimonial-item--placeholder"
        >
          <div class="testimonial-quote">"{{ testimonial.text }}"</div>
          <div class="testimonial-author">
            <div class="author-name">{{ testimonial.author }}</div>
            <div class="author-title">{{ testimonial.title }}</div>
          </div>
        </div>
      </template>

      <!-- Actual testimonials when data exists -->
      <template v-else>
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
      </template>
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
    },
    isBuilderMode: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    // Data from component JSON state (single source of truth)
    const title = computed(() => props.data?.title || props.props?.title || 'What People Say');

    // Testimonials from component data
    // ROOT FIX: Support multiple data formats from profile pre-population
    const testimonials = computed(() => {
      const data = props.data || props.props || {};

      // 1. Check for pre-built testimonials array of objects
      if (data.testimonials && Array.isArray(data.testimonials) && data.testimonials.length > 0) {
        // If first item is an object with text property, use as-is
        if (typeof data.testimonials[0] === 'object' && data.testimonials[0].text) {
          return data.testimonials;
        }
      }

      // 2. Check for separate arrays format (from profile pre-population)
      // Profile config provides: testimonials[], testimonial_authors[], testimonial_roles[]
      const textsArray = data.testimonials || [];
      const authorsArray = data.testimonial_authors || [];
      const rolesArray = data.testimonial_roles || [];

      if (Array.isArray(textsArray) && textsArray.length > 0 && typeof textsArray[0] === 'string') {
        const combinedList = [];
        textsArray.forEach((text, index) => {
          if (text && text.trim()) {
            combinedList.push({
              text: text,
              author: authorsArray[index] || 'Anonymous',
              title: rolesArray[index] || ''
            });
          }
        });
        if (combinedList.length > 0) {
          return combinedList;
        }
      }

      // 3. Build from individual testimonial fields (legacy format)
      const testimonialsList = [];
      for (let i = 1; i <= 10; i++) {
        const textKey = `testimonial_${i}_text`;
        const authorKey = `testimonial_${i}_author`;
        const titleKey = `testimonial_${i}_title`;

        const testimonialText = data[textKey];
        if (testimonialText) {
          testimonialsList.push({
            text: testimonialText,
            author: data[authorKey] || 'Anonymous',
            title: data[titleKey] || ''
          });
        }
      }

      return testimonialsList;
    });

    // Show placeholders when in builder mode with no testimonials
    const showPlaceholders = computed(() => {
      return testimonials.value.length === 0 && (props.isBuilderMode || props.isEditing || props.isSelected);
    });

    // Placeholder testimonials
    const placeholderTestimonials = [
      { text: 'Add a testimonial from a satisfied client or colleague', author: 'Client Name', title: 'Company/Role' },
      { text: 'Share what others say about working with you', author: 'Another Client', title: 'Their Position' }
    ];

    return {
      title,
      testimonials,
      showPlaceholders,
      placeholderTestimonials
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
