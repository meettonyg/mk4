<template>
  <div class="gmkb-authority-hook-component" :data-component-id="componentId">
    <div class="authority-container">
      <div class="authority-content">
        <h2 v-if="headline" class="authority-headline">{{ headline }}</h2>
        <p v-if="subheadline" class="authority-subheadline">{{ subheadline }}</p>
        
        <div class="authority-points">
          <div v-for="(point, index) in authorityPoints" :key="index" class="authority-point">
            <span class="point-icon">✓</span>
            <span class="point-text">{{ point }}</span>
          </div>
        </div>
        
        <div v-if="credentials" class="authority-credentials">
          <h3>Credentials</h3>
          <p>{{ credentials }}</p>
        </div>
        
        <div v-if="socialProof" class="authority-social-proof">
          <h3>Social Proof</h3>
          <p>{{ socialProof }}</p>
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
  name: 'AuthorityHookRenderer',
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
    const { position, company, stats, fullName } = usePodsData();
    
    // Computed properties
    // PHASE 2 FIX: Add null safety with optional chaining
    const headline = computed(() => {
      if (props.data?.headline || props.data?.authority_headline) {
        return props.data.headline || props.data.authority_headline;
      }
      // ROOT FIX: Use Pods data as fallback
      if (fullName.value && position.value) {
        return `${fullName.value}: Trusted ${position.value}`;
      }
      return 'Trusted Expert in the Industry';
    });
    
    const subheadline = computed(() => {
      if (props.data?.subheadline || props.data?.authority_subheadline) {
        return props.data.subheadline || props.data.authority_subheadline;
      }
      // ROOT FIX: Use Pods data as fallback
      if (company.value) {
        return `Leading innovation at ${company.value}`;
      }
      return '';
    });
    
    const authorityPoints = computed(() => {
      if (Array.isArray(props.data?.authority_points)) {
        return props.data.authority_points;
      }
      
      const points = [];
      for (let i = 1; i <= 5; i++) {
        if (props.data?.[`authority_point_${i}`]) {
          points.push(props.data[`authority_point_${i}`]);
        }
      }
      
      // ROOT FIX: Generate from Pods stats if available
      if (points.length === 0 && stats.value) {
        if (stats.value.downloads) points.push(`${stats.value.downloads}+ podcast downloads`);
        if (stats.value.episodes) points.push(`${stats.value.episodes}+ episodes recorded`);
        if (stats.value.followers) points.push(`${stats.value.followers}+ social media followers`);
        if (stats.value.subscribers) points.push(`${stats.value.subscribers}+ email subscribers`);
      }
      
      return points.length ? points : [];
    });
    
    const credentials = computed(() => {
      return props.data?.credentials || props.data?.authority_credentials || '';
    });
    
    const socialProof = computed(() => {
      return props.data?.social_proof || '';
    });
    
    // Lifecycle
    onMounted(() => {
      // ROOT FIX: No polling or global checking - use event-driven approach
      if (store.components[props.componentId]) {
        console.log('AuthorityHook component mounted:', props.componentId);
        
        // Check if using Pods data
        const usingPodsData = (!props.data.headline && fullName.value) ||
                            (!props.data.authority_points && stats.value);
        
        // Dispatch mount event
        document.dispatchEvent(new CustomEvent('gmkb:vue-component-mounted', {
          detail: {
            type: 'authority-hook',
            id: props.componentId,
            podsDataUsed: usingPodsData
          }
        }));
      }
    });
    
    return {
      headline,
      subheadline,
      authorityPoints,
      credentials,
      socialProof
    };
  }
};
</script>

<style scoped>
.gmkb-authority-hook-component {
  padding: var(--gmkb-spacing-xxl, 3rem) 2rem;
  background: linear-gradient(135deg, var(--gmkb-color-primary, #007cba), var(--gmkb-color-secondary, #0056b3));
  color: white;
}

.authority-container {
  max-width: 900px;
  margin: 0 auto;
}

.authority-content {
  text-align: center;
}

.authority-headline {
  font-size: var(--gmkb-font-size-xl, 2.5rem);
  margin-bottom: 1rem;
  font-weight: 700;
}

.authority-subheadline {
  font-size: var(--gmkb-font-size-lg, 1.25rem);
  margin-bottom: 2rem;
  opacity: 0.95;
}

.authority-points {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: var(--gmkb-spacing-xl, 2rem) 0;
  text-align: left;
}

.authority-point {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: var(--gmkb-border-radius, 8px);
  backdrop-filter: blur(10px);
}

.point-icon {
  font-size: 1.5rem;
  color: #4ade80;
  flex-shrink: 0;
}

.point-text {
  line-height: var(--gmkb-line-height-base, 1.6);
}

.authority-credentials,
.authority-social-proof {
  margin-top: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--gmkb-border-radius, 8px);
  backdrop-filter: blur(10px);
}

.authority-credentials h3,
.authority-social-proof h3 {
  margin-bottom: 0.75rem;
  font-size: var(--gmkb-font-size-lg, 1.25rem);
}

.authority-credentials p,
.authority-social-proof p {
  line-height: var(--gmkb-line-height-base, 1.6);
}

@media (max-max-width: var(--gmkb-max-width-content, 768px)) {
  .authority-headline {
    font-size: 2rem;
  }
  
  .authority-points {
    grid-template-columns: 1fr;
  }
}
</style>
