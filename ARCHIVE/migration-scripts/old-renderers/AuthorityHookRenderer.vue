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
  computed: {
    headline() {
      return this.data.headline || this.data.authority_headline || 'Trusted Expert in the Industry'
    },
    subheadline() {
      return this.data.subheadline || this.data.authority_subheadline || ''
    },
    authorityPoints() {
      if (Array.isArray(this.data.authority_points)) {
        return this.data.authority_points
      }
      
      const points = []
      for (let i = 1; i <= 5; i++) {
        if (this.data[`authority_point_${i}`]) {
          points.push(this.data[`authority_point_${i}`])
        }
      }
      
      return points.length ? points : [
        '15+ years of experience',
        'Published author of 3 bestselling books',
        'International speaker in 30+ countries',
        'Featured in Forbes, Inc., and WSJ'
      ]
    },
    credentials() {
      return this.data.credentials || this.data.authority_credentials || ''
    },
    socialProof() {
      return this.data.social_proof || ''
    }
  }
}
</script>

<style scoped>
.gmkb-authority-hook-component {
  padding: 3rem 2rem;
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
  margin: 2rem 0;
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

@media (max-width: 768px) {
  .authority-headline {
    font-size: 2rem;
  }
  
  .authority-points {
    grid-template-columns: 1fr;
  }
}
</style>
