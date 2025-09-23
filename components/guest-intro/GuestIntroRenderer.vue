<template>
  <div class="gmkb-guest-intro-component" :data-component-id="componentId">
    <div class="intro-container">
      <h2 v-if="title" class="intro-title">{{ title }}</h2>
      
      <div class="intro-content">
        <p v-if="introduction" class="intro-text">{{ introduction }}</p>
        
        <div v-if="highlights && highlights.length" class="intro-highlights">
          <h3>Key Highlights</h3>
          <ul>
            <li v-for="(highlight, index) in highlights" :key="index">
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
  computed: {
    title() {
      return this.data.title || 'Guest Introduction'
    },
    introduction() {
      return this.data.introduction || this.data.guest_intro || 
        'Welcome! I\'m excited to share my expertise and insights with your audience.'
    },
    highlights() {
      if (Array.isArray(this.data.highlights)) {
        return this.data.highlights
      }
      
      const highlightsList = []
      for (let i = 1; i <= 5; i++) {
        if (this.data[`highlight_${i}`]) {
          highlightsList.push(this.data[`highlight_${i}`])
        }
      }
      
      return highlightsList.length ? highlightsList : [
        'Engaging and interactive presentation style',
        'Customized content for your audience',
        'Actionable takeaways and practical insights'
      ]
    },
    availability() {
      return this.data.availability || ''
    },
    travelRequirements() {
      return this.data.travel_requirements || ''
    },
    technicalNeeds() {
      return this.data.technical_needs || ''
    },
    specialRequests() {
      return this.data.special_requests || ''
    }
  }
}
</script>

<style scoped>
.gmkb-guest-intro-component {
  padding: 2rem;
  background: var(--gmkb-color-surface, #fff);
}

.intro-container {
  max-width: 900px;
  margin: 0 auto;
}

.intro-title {
  color: var(--gmkb-color-text, #333);
  font-size: var(--gmkb-font-size-xl, 2rem);
  margin-bottom: 1.5rem;
  text-align: center;
}

.intro-text {
  color: var(--gmkb-color-text, #333);
  font-size: var(--gmkb-font-size-lg, 1.125rem);
  line-height: var(--gmkb-line-height-base, 1.7);
  margin-bottom: 2rem;
  text-align: center;
}

.intro-highlights {
  background: var(--gmkb-color-background, #f8f9fa);
  padding: 1.5rem;
  border-radius: var(--gmkb-border-radius, 8px);
  margin-bottom: 2rem;
}

.intro-highlights h3 {
  color: var(--gmkb-color-primary, #007cba);
  margin-bottom: 1rem;
}

.intro-highlights ul {
  list-style: none;
  padding: 0;
}

.intro-highlights li {
  color: var(--gmkb-color-text, #333);
  padding: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;
}

.intro-highlights li::before {
  content: "→";
  position: absolute;
  left: 0;
  color: var(--gmkb-color-primary, #007cba);
}

.intro-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.detail-item {
  padding: 1rem;
  background: var(--gmkb-color-background, #f8f9fa);
  border-radius: var(--gmkb-border-radius, 8px);
}

.detail-item h4 {
  color: var(--gmkb-color-primary, #007cba);
  margin-bottom: 0.5rem;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-item p {
  color: var(--gmkb-color-text-light, #666);
  line-height: var(--gmkb-line-height-base, 1.6);
}

.intro-special {
  padding: 1.5rem;
  background: linear-gradient(135deg, var(--gmkb-color-primary, #007cba), var(--gmkb-color-secondary, #0056b3));
  color: white;
  border-radius: var(--gmkb-border-radius, 8px);
}

.intro-special h3 {
  margin-bottom: 0.75rem;
}

.intro-special p {
  line-height: var(--gmkb-line-height-base, 1.6);
}

@media (max-width: 768px) {
  .intro-details {
    grid-template-columns: 1fr;
  }
}
</style>
