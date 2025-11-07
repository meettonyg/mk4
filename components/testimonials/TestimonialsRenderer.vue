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
import { usePodsData } from '../../src/composables/usePodsData';

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
    // COMPOSITION API: Access Pods data via composable
    const podsData = usePodsData();
    
    // TITLE: Component data > default
    const title = computed(() => {
      return props.data?.title || 'What People Say';
    });
    
    // TESTIMONIALS: Priority is component data > Pods fallback > empty array
    const testimonials = computed(() => {
      // Priority 1: Component data (user customization)
      if (props.data?.testimonials && Array.isArray(props.data.testimonials)) {
        return props.data.testimonials;
      }
      
      // Priority 2: Pods data (from database)
      // Extract testimonials from Pods rawPodsData
      if (podsData.rawPodsData?.value) {
        const testimonialsArray = [];
        const rawData = podsData.rawPodsData.value;
        
        // Extract testimonials 1-10
        for (let i = 1; i <= 10; i++) {
          const textKey = `testimonial_${i}_text`;
          const authorKey = `testimonial_${i}_author`;
          const titleKey = `testimonial_${i}_title`;
          
          if (rawData[textKey] && rawData[textKey].trim()) {
            testimonialsArray.push({
              text: rawData[textKey],
              author: rawData[authorKey] || 'Anonymous',
              title: rawData[titleKey] || ''
            });
          }
        }
        
        if (testimonialsArray.length > 0) {
          return testimonialsArray;
        }
      }
      
      // Priority 3: Empty array (will show no testimonials)
      return [];
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
