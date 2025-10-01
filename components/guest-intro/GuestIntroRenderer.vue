<template>
  <div class="gmkb-guest-intro-component" :data-component-id="componentId">
    <div class="intro-container">
      <h2 v-if="title" class="intro-title">{{ title }}</h2>
      
      <div class="intro-content">
        <p v-if="displayIntroduction" class="intro-text">{{ displayIntroduction }}</p>
        
        <div v-if="displayHighlights && displayHighlights.length" class="intro-highlights">
          <h3>Key Highlights</h3>
          <ul>
            <li v-for="(highlight, index) in displayHighlights" :key="index">
              {{ highlight }}
            </li>
          </ul>
        </div>
        
        <div class="intro-details">
          <div v-if="availability" class="detail-item">
            <h4>Availability</h4>
            <p>{{ availability }}</p>
          </div>
          
          <div v-if="travelRequirements" class="detail-item">
            <h4>Travel Requirements</h4>
            <p>{{ travelRequirements }}</p>
          </div>
          
          <div v-if="technicalNeeds" class="detail-item">
            <h4>Technical Needs</h4>
            <p>{{ technicalNeeds }}</p>
          </div>
        </div>
        
        <div v-if="specialRequests" class="intro-special">
          <h3>Special Requests</h3>
          <p>{{ specialRequests }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue';
import { useMediaKitStore } from '../../src/stores/mediaKit';
import { usePodsData } from '../../src/composables/usePodsData';

export default {
  name: 'GuestIntroRenderer',
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
    const pods = usePodsData();
    
    // ROOT FIX: Extract only the fields that exist in usePodsData
    const { biography, fullName } = pods;
    
    // ROOT FIX: Access professional fields correctly from the professional object
    const position = computed(() => pods.professional.value?.title || '');
    const company = computed(() => pods.professional.value?.company || '');
    const tagline = computed(() => store.podsData?.tagline || store.podsData?.professional_tagline || '');
    
    // Computed properties
    const title = computed(() => {
      return props.data.title || `Meet ${fullName.value || 'Your Speaker'}`;
    });
    
    const displayIntroduction = computed(() => {
      // ROOT FIX: Use component data first, then Pods data as fallback
      if (props.data.introduction || props.data.guest_intro) {
        return props.data.introduction || props.data.guest_intro;
      }
      
      // Use Pods data to create an introduction
      if (biography.value) {
        // Take first 200 characters of biography as intro
        const shortBio = biography.value.substring(0, 200);
        return shortBio + (biography.value.length > 200 ? '...' : '');
      }
      
      // Construct from other Pods fields
      if (fullName.value && position.value && company.value) {
        return `${fullName.value} is ${position.value} at ${company.value}. ${tagline.value || ''}`;
      }
      
      return 'Welcome! I\'m excited to share my expertise and insights with your audience.';
    });
    
    const displayHighlights = computed(() => {
      if (Array.isArray(props.data.highlights) && props.data.highlights.length > 0) {
        return props.data.highlights;
      }
      
      const highlightsList = [];
      for (let i = 1; i <= 5; i++) {
        if (props.data[`highlight_${i}`]) {
          highlightsList.push(props.data[`highlight_${i}`]);
        }
      }
      
      // ROOT FIX: Generate highlights from Pods data if none provided
      if (highlightsList.length === 0 && (position.value || company.value || tagline.value)) {
        if (position.value) highlightsList.push(`Current ${position.value}`);
        if (company.value) highlightsList.push(`${company.value} team member`);
        if (tagline.value) highlightsList.push(tagline.value);
      }
      
      return highlightsList;
    });
    
    const availability = computed(() => {
      return props.data.availability || '';
    });
    
    const travelRequirements = computed(() => {
      return props.data.travel_requirements || '';
    });
    
    const technicalNeeds = computed(() => {
      return props.data.technical_needs || '';
    });
    
    const specialRequests = computed(() => {
      return props.data.special_requests || '';
    });
    
    // Lifecycle
    onMounted(() => {
      // ROOT FIX: No polling or global checking - use event-driven approach
      if (store.components[props.componentId]) {
        console.log('GuestIntro component mounted:', props.componentId);
        
        // Check if using Pods data
        const usingPodsData = (!props.data.introduction && biography.value) ||
                            (!props.data.highlights && position.value);
        
        // Dispatch mount event
        document.dispatchEvent(new CustomEvent('gmkb:vue-component-mounted', {
          detail: {
            type: 'guest-intro',
            id: props.componentId,
            podsDataUsed: usingPodsData
          }
        }));
      }
    });
    
    return {
      title,
      displayIntroduction,
      displayHighlights,
      availability,
      travelRequirements,
      technicalNeeds,
      specialRequests
    };
  }
};
</script>

<style scoped>
.gmkb-guest-intro-component {
  padding: var(--gmkb-spacing-xl, 2rem);
  background: var(--gmkb-color-surface, #fff);
}

.intro-container {
  max-width: 900px;
  margin: 0 auto;
}

.intro-title {
  color: var(--gmkb-color-text, #333);
  font-family: var(--gmkb-font-heading, 'Inter', system-ui, sans-serif);
  font-size: var(--gmkb-font-size-2xl, 2rem);
  font-weight: var(--gmkb-font-weight-bold, 700);
  line-height: var(--gmkb-line-height-heading, 1.2);
  margin-bottom: var(--gmkb-spacing-lg, 1.5rem);
  text-align: center;
}

.intro-text {
  color: var(--gmkb-color-text, #333);
  font-family: var(--gmkb-font-primary, 'Inter', system-ui, sans-serif);
  font-size: var(--gmkb-font-size-lg, 1.125rem);
  line-height: var(--gmkb-line-height-relaxed, 1.7);
  margin-bottom: var(--gmkb-spacing-xl, 2rem);
  text-align: center;
}

.intro-highlights {
  background: var(--gmkb-color-background, #f8f9fa);
  padding: var(--gmkb-spacing-lg, 1.5rem);
  border-radius: var(--gmkb-border-radius, 8px);
  margin-bottom: var(--gmkb-spacing-xl, 2rem);
}

.intro-highlights h3 {
  color: var(--gmkb-color-primary, #007cba);
  font-family: var(--gmkb-font-heading, 'Inter', system-ui, sans-serif);
  font-size: var(--gmkb-font-size-lg, 1.25rem);
  font-weight: var(--gmkb-font-weight-semibold, 600);
  margin-bottom: var(--gmkb-spacing-md, 1rem);
}

.intro-highlights ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.intro-highlights li {
  color: var(--gmkb-color-text, #333);
  font-family: var(--gmkb-font-primary, 'Inter', system-ui, sans-serif);
  font-size: var(--gmkb-font-size-base, 1rem);
  padding: var(--gmkb-spacing-sm, 0.5rem) 0;
  padding-left: var(--gmkb-spacing-lg, 1.5rem);
  position: relative;
}

.intro-highlights li::before {
  content: "→";
  position: absolute;
  left: 0;
  color: var(--gmkb-color-primary, #007cba);
  font-weight: var(--gmkb-font-weight-bold, 700);
}

.intro-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--gmkb-spacing-lg, 1.5rem);
  margin-bottom: var(--gmkb-spacing-xl, 2rem);
}

.detail-item {
  padding: var(--gmkb-spacing-md, 1rem);
  background: var(--gmkb-color-background, #f8f9fa);
  border-radius: var(--gmkb-border-radius, 8px);
  transition: var(--gmkb-transition, all 0.3s ease);
}

.detail-item:hover {
  box-shadow: var(--gmkb-shadow-sm, 0 2px 4px rgba(0,0,0,0.05));
}

.detail-item h4 {
  color: var(--gmkb-color-primary, #007cba);
  font-family: var(--gmkb-font-heading, 'Inter', system-ui, sans-serif);
  font-size: var(--gmkb-font-size-base, 1rem);
  font-weight: var(--gmkb-font-weight-semibold, 600);
  margin-bottom: var(--gmkb-spacing-sm, 0.5rem);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-item p {
  color: var(--gmkb-color-text-light, #666);
  font-family: var(--gmkb-font-primary, 'Inter', system-ui, sans-serif);
  font-size: var(--gmkb-font-size-base, 1rem);
  line-height: var(--gmkb-line-height-base, 1.6);
  margin: 0;
}

.intro-special {
  padding: var(--gmkb-spacing-lg, 1.5rem);
  background: linear-gradient(135deg, var(--gmkb-color-primary, #007cba), var(--gmkb-color-secondary, #0056b3));
  color: white;
  border-radius: var(--gmkb-border-radius, 8px);
}

.intro-special h3 {
  font-family: var(--gmkb-font-heading, 'Inter', system-ui, sans-serif);
  font-size: var(--gmkb-font-size-lg, 1.25rem);
  font-weight: var(--gmkb-font-weight-semibold, 600);
  margin-bottom: var(--gmkb-spacing-sm, 0.75rem);
}

.intro-special p {
  font-family: var(--gmkb-font-primary, 'Inter', system-ui, sans-serif);
  font-size: var(--gmkb-font-size-base, 1rem);
  line-height: var(--gmkb-line-height-base, 1.6);
  margin: 0;
}

@media (max-width: 768px) {
  .intro-details {
    grid-template-columns: 1fr;
  }
}
</style>
