<template>
  <div class="gmkb-testimonials-component" :data-component-id="componentId">
    <div class="testimonials-container">
      <h2 v-if="title" class="testimonials-title">{{ title }}</h2>
      <p v-if="description" class="testimonials-description">{{ description }}</p>
      
      <div class="testimonials-carousel">
        <button @click="previousSlide" class="carousel-control prev">‹</button>
        
        <div class="testimonial-slide">
          <div class="testimonial-content">
            <div class="quote-mark">"</div>
            <p class="testimonial-text">{{ currentTestimonial.text }}</p>
            <div class="testimonial-author">
              <img v-if="currentTestimonial.image" 
                   :src="currentTestimonial.image" 
                   :alt="currentTestimonial.author"
                   class="author-image"
              />
              <div>
                <h4 class="author-name">{{ currentTestimonial.author }}</h4>
                <p class="author-title">{{ currentTestimonial.title }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <button @click="nextSlide" class="carousel-control next">›</button>
      </div>
      
      <!-- Dots indicator -->
      <div class="carousel-indicators">
        <button
          v-for="(testimonial, index) in displayTestimonials"
          :key="index"
          @click="currentIndex = index"
          :class="['indicator', { active: currentIndex === index }]"
        ></button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useMediaKitStore } from '../../src/stores/mediaKit';
import { usePodsData } from '../../src/composables/usePodsData';

export default {
  name: 'TestimonialsRenderer',
  props: {
    componentId: {
      type: String,
      required: true
    },
    data: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    // Store and composables
    const store = useMediaKitStore();
    const { rawPodsData } = usePodsData();
    
    // Local state
    const currentIndex = ref(0);
    let interval = null;
    
    // Computed properties
    const title = computed(() => {
      return props.data?.title || 'What People Say';
    });
    
    const description = computed(() => {
      return props.data?.description || '';
    });
    
    const displayTestimonials = computed(() => {
      // Handle various data formats safely
      if (!props.data) {
        return [];
      }
      
      // Handle array format
      if (Array.isArray(props.data.testimonials) && props.data.testimonials.length > 0) {
        return props.data.testimonials;
      }
      
      // Handle object format
      if (props.data.testimonials && typeof props.data.testimonials === 'object' && !Array.isArray(props.data.testimonials)) {
        const testimonialArray = Object.values(props.data.testimonials).filter(Boolean);
        if (testimonialArray.length > 0) {
          return testimonialArray;
        }
      }
      
      // Handle legacy format with separate arrays
      if (props.data.testimonial_text && Array.isArray(props.data.testimonial_text)) {
        return props.data.testimonial_text.map((text, index) => ({
          text: text || '',
          author: props.data.testimonial_authors?.[index] || `Author ${index + 1}`,
          title: props.data.testimonial_roles?.[index] || '',
          image: props.data.testimonial_images?.[index] || ''
        }));
      }
      
      // ROOT FIX: Check for testimonials in Pods data
      const podsTestimonials = [];
      for (let i = 1; i <= 5; i++) {
        const testimonialText = rawPodsData.value?.[`testimonial_${i}_text`];
        const testimonialAuthor = rawPodsData.value?.[`testimonial_${i}_author`];
        
        if (testimonialText) {
          podsTestimonials.push({
            text: testimonialText,
            author: testimonialAuthor || `Client ${i}`,
            title: rawPodsData.value?.[`testimonial_${i}_title`] || '',
            image: rawPodsData.value?.[`testimonial_${i}_image`] || ''
          });
        }
      }
      
      return podsTestimonials.length > 0 ? podsTestimonials : [];
    });
    
    const currentTestimonial = computed(() => {
      // Ensure safe access with bounds checking
      if (!displayTestimonials.value || displayTestimonials.value.length === 0) {
        return {
          text: '',
          author: '',
          title: '',
          image: ''
        };
      }
      
      // Ensure currentIndex is within bounds
      const safeIndex = Math.max(0, Math.min(currentIndex.value, displayTestimonials.value.length - 1));
      const testimonial = displayTestimonials.value[safeIndex];
      
      // Handle both string and object formats
      if (typeof testimonial === 'string') {
        return {
          text: testimonial,
          author: 'Client',
          title: '',
          image: ''
        };
      }
      
      // Ensure all properties exist
      return {
        text: testimonial?.text || '',
        author: testimonial?.author || 'Client',
        title: testimonial?.title || testimonial?.role || '',
        image: testimonial?.image || ''
      };
    });
    
    // Methods
    const nextSlide = () => {
      if (displayTestimonials.value.length > 1) {
        currentIndex.value = (currentIndex.value + 1) % displayTestimonials.value.length;
      }
    };
    
    const previousSlide = () => {
      if (displayTestimonials.value.length > 1) {
        currentIndex.value = currentIndex.value === 0 
          ? displayTestimonials.value.length - 1 
          : currentIndex.value - 1;
      }
    };
    
    // Lifecycle
    onMounted(() => {
      // ROOT FIX: No polling or global checking - use event-driven approach
      if (store.components[props.componentId]) {
        console.log('Testimonials component mounted:', props.componentId);
        
        // Check if using Pods data
        const usingPodsData = displayTestimonials.value.some(testimonial => 
          rawPodsData.value && Object.values(rawPodsData.value).includes(testimonial.text)
        );
        
        // Dispatch mount event
        document.dispatchEvent(new CustomEvent('gmkb:vue-component-mounted', {
          detail: {
            type: 'testimonials',
            id: props.componentId,
            podsDataUsed: usingPodsData
          }
        }));
      }
      
      // Auto-advance carousel if enabled and has testimonials
      if (props.data?.autoplay !== false && displayTestimonials.value.length > 1) {
        const autoplayInterval = props.data?.autoplayInterval || 5000;
        interval = setInterval(() => {
          nextSlide();
        }, autoplayInterval);
      }
    });
    
    onUnmounted(() => {
      if (interval) {
        clearInterval(interval);
      }
    });
    
    return {
      title,
      description,
      displayTestimonials,
      currentTestimonial,
      currentIndex,
      nextSlide,
      previousSlide
    };
  }
};
</script>

<style scoped>
.gmkb-testimonials-component {
  padding: var(--gmkb-spacing-xl, 2rem);
  background: var(--gmkb-color-background, #f8f9fa);
}

.testimonials-container {
  max-width: 900px;
  margin: 0 auto;
}

.testimonials-title {
  text-align: center;
  color: var(--gmkb-color-text, #333);
  font-family: var(--gmkb-font-heading, 'Inter', system-ui, sans-serif);
  font-size: var(--gmkb-font-size-2xl, 2rem);
  font-weight: var(--gmkb-font-weight-bold, 700);
  line-height: var(--gmkb-line-height-heading, 1.2);
  margin-bottom: var(--gmkb-spacing-md, 1rem);
}

.testimonials-description {
  text-align: center;
  color: var(--gmkb-color-text-light, #666);
  font-family: var(--gmkb-font-primary, 'Inter', system-ui, sans-serif);
  font-size: var(--gmkb-font-size-base, 1rem);
  line-height: var(--gmkb-line-height-base, 1.6);
  margin-bottom: var(--gmkb-spacing-xl, 2rem);
}

.testimonials-carousel {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--gmkb-spacing-md, 1rem);
}

.carousel-control {
  background: var(--gmkb-color-surface, #fff);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: var(--gmkb-border-radius-full, 50%);
  font-size: var(--gmkb-font-size-xl, 1.5rem);
  cursor: pointer;
  box-shadow: var(--gmkb-shadow-sm, 0 2px 4px rgba(0,0,0,0.1));
  transition: var(--gmkb-transition, all 0.3s ease);
  color: var(--gmkb-color-text, #333);
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel-control:hover {
  background: var(--gmkb-color-primary, #007cba);
  color: white;
  transform: scale(1.1);
}

.testimonial-slide {
  flex: 1;
  background: var(--gmkb-color-surface, #fff);
  padding: var(--gmkb-spacing-xl, 2rem);
  border-radius: var(--gmkb-border-radius, 8px);
  box-shadow: var(--gmkb-shadow-md, 0 4px 6px rgba(0,0,0,0.1));
}

.quote-mark {
  font-size: var(--gmkb-font-size-3xl, 3rem);
  color: var(--gmkb-color-primary, #007cba);
  line-height: 1;
  margin-bottom: calc(var(--gmkb-space-2, 0.5rem) * -1);
  font-family: Georgia, serif;
}

.testimonial-text {
  color: var(--gmkb-color-text, #333);
  font-family: var(--gmkb-font-primary, 'Inter', system-ui, sans-serif);
  font-size: var(--gmkb-font-size-lg, 1.125rem);
  line-height: var(--gmkb-line-height-relaxed, 1.7);
  margin-bottom: var(--gmkb-spacing-lg, 1.5rem);
  font-style: italic;
  min-height: 80px;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: var(--gmkb-spacing-md, 1rem);
}

.author-image {
  width: 50px;
  height: 50px;
  border-radius: var(--gmkb-border-radius-full, 50%);
  object-fit: cover;
  border: 2px solid var(--gmkb-color-border, #e2e8f0);
}

.author-name {
  color: var(--gmkb-color-text, #333);
  font-family: var(--gmkb-font-heading, 'Inter', system-ui, sans-serif);
  font-size: var(--gmkb-font-size-base, 1rem);
  font-weight: var(--gmkb-font-weight-bold, 600);
  margin: 0 0 var(--gmkb-space-1, 0.25rem);
}

.author-title {
  color: var(--gmkb-color-text-light, #666);
  font-family: var(--gmkb-font-primary, 'Inter', system-ui, sans-serif);
  font-size: var(--gmkb-font-size-sm, 0.9rem);
  line-height: var(--gmkb-line-height-base, 1.4);
  margin: 0;
}

.carousel-indicators {
  display: flex;
  justify-content: center;
  gap: var(--gmkb-space-2, 0.5rem);
  margin-top: var(--gmkb-spacing-lg, 1.5rem);
}

.indicator {
  width: 10px;
  height: 10px;
  border-radius: var(--gmkb-border-radius-full, 50%);
  border: none;
  background: var(--gmkb-color-border, #ddd);
  cursor: pointer;
  transition: var(--gmkb-transition-fast, all 0.15s ease);
  padding: 0;
}

.indicator:hover {
  background: var(--gmkb-color-primary-light, #4a9fd8);
}

.indicator.active {
  background: var(--gmkb-color-primary, #007cba);
  transform: scale(1.2);
}

@media (max-max-width: var(--gmkb-max-width-content, 768px)) {
  .testimonials-carousel {
    flex-direction: column;
  }
  
  .carousel-control {
    display: none;
  }
  
  .testimonial-slide {
    padding: var(--gmkb-spacing-lg, 1.5rem);
  }
}
</style>
