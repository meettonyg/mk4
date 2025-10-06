<template>
  <div class="gmkb-guest-intro" :class="[`layout-${layout}`, { 'has-tagline': tagline }]">
    <div class="guest-intro-content">
      <h2 class="guest-name">{{ displayName }}</h2>
      
      <div v-if="displayTitle" class="guest-title-line">
        <span class="guest-title">{{ displayTitle }}</span>
        <span v-if="company" class="guest-company">{{ company }}</span>
      </div>
      
      <div v-if="tagline" class="guest-tagline">
        <span class="tagline-text">{{ tagline }}</span>
      </div>
      
      <div v-if="introduction" class="guest-introduction">
        <p>{{ introduction }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GuestIntro',
  props: {
    // Name fields
    full_name: {
      type: String,
      default: ''
    },
    first_name: {
      type: String,
      default: ''
    },
    last_name: {
      type: String,
      default: ''
    },
    // Professional info
    guest_title: {
      type: String,
      default: ''
    },
    company: {
      type: String,
      default: ''
    },
    // Content
    introduction: {
      type: String,
      default: ''
    },
    tagline: {
      type: String,
      default: ''
    },
    // Display options
    layout: {
      type: String,
      default: 'centered',
      validator: value => ['centered', 'left-aligned', 'card'].includes(value)
    }
  },
  computed: {
    displayName() {
      // Use full_name if available, otherwise combine first and last
      if (this.full_name) {
        return this.full_name;
      }
      const parts = [];
      if (this.first_name) parts.push(this.first_name);
      if (this.last_name) parts.push(this.last_name);
      return parts.join(' ') || 'Guest Name';
    },
    displayTitle() {
      return this.guest_title || '';
    }
  },
  mounted() {
    // Auto-load from Pods data if available and props are empty
    if (window.gmkbData?.pods_data && !this.full_name && !this.first_name) {
      this.loadFromPodsData();
    }
  },
  methods: {
    loadFromPodsData() {
      const pods = window.gmkbData.pods_data;
      if (!pods) return;
      
      // Emit updates to parent to maintain props flow
      const updates = {};
      
      if (pods.full_name) updates.full_name = pods.full_name;
      if (pods.first_name) updates.first_name = pods.first_name;
      if (pods.last_name) updates.last_name = pods.last_name;
      if (pods.guest_title) updates.guest_title = pods.guest_title;
      if (pods.company) updates.company = pods.company;
      if (pods.introduction) updates.introduction = pods.introduction;
      if (pods.tagline) updates.tagline = pods.tagline;
      
      this.$emit('update:modelValue', updates);
    }
  }
};
</script>

<style scoped>
.gmkb-guest-intro {
  padding: var(--gmkb-spacing-xl, 2rem);
  background: var(--gmkb-color-surface, #ffffff);
  border-radius: var(--gmkb-border-radius, 8px);
  margin: var(--gmkb-spacing-lg, 1.5rem) 0;
}

/* Layout: Centered */
.gmkb-guest-intro.layout-centered .guest-intro-content {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

/* Layout: Left-aligned */
.gmkb-guest-intro.layout-left-aligned .guest-intro-content {
  text-align: left;
  max-width: 900px;
}

/* Layout: Card */
.gmkb-guest-intro.layout-card {
  box-shadow: var(--gmkb-shadow-md, 0 4px 6px rgba(0, 0, 0, 0.1));
  border: 1px solid var(--gmkb-color-border, #e0e0e0);
}

.gmkb-guest-intro.layout-card .guest-intro-content {
  padding: var(--gmkb-spacing-md, 1rem);
}

/* Name styling */
.guest-name {
  font-family: var(--gmkb-font-heading, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
  font-size: var(--gmkb-font-size-xl, 2rem);
  font-weight: 700;
  color: var(--gmkb-color-text, #333333);
  margin: 0 0 var(--gmkb-spacing-sm, 0.5rem) 0;
  line-height: var(--gmkb-line-height-heading, 1.2);
}

/* Title line */
.guest-title-line {
  display: flex;
  gap: var(--gmkb-spacing-sm, 0.5rem);
  font-size: var(--gmkb-font-size-lg, 1.25rem);
  color: var(--gmkb-color-text-light, #666666);
  margin-bottom: var(--gmkb-spacing-md, 1rem);
  flex-wrap: wrap;
}

.layout-centered .guest-title-line {
  justify-content: center;
}

.guest-title {
  font-weight: 500;
}

.guest-company {
  position: relative;
  padding-left: var(--gmkb-spacing-sm, 0.5rem);
}

.guest-company::before {
  content: "\00B7";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
}

/* Tagline styling */
.guest-tagline {
  margin: var(--gmkb-spacing-md, 1rem) 0;
  padding: var(--gmkb-spacing-md, 1rem);
  background: linear-gradient(135deg, 
    var(--gmkb-color-primary, #007bff) 0%, 
    var(--gmkb-color-primary-hover, #0056b3) 100%);
  border-radius: var(--gmkb-border-radius, 8px);
  position: relative;
  overflow: hidden;
}

.tagline-text {
  position: relative;
  display: inline-block;
  font-size: var(--gmkb-font-size-lg, 1.25rem);
  font-weight: 600;
  color: white;
  font-style: italic;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.guest-tagline::before {
  content: "\201C";
  position: absolute;
  top: -10px;
  left: 10px;
  font-size: 4rem;
  opacity: 0.2;
  color: white;
  font-family: Georgia, serif;
}

/* Introduction text */
.guest-introduction {
  margin-top: var(--gmkb-spacing-lg, 1.5rem);
}

.guest-introduction p {
  font-family: var(--gmkb-font-primary, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
  font-size: var(--gmkb-font-size-base, 1rem);
  line-height: var(--gmkb-line-height-base, 1.6);
  color: var(--gmkb-color-text, #333333);
  margin: 0;
}

/* Responsive */
@media (max-max-width: var(--gmkb-max-width-content, 768px)) {
  .gmkb-guest-intro {
    padding: var(--gmkb-spacing-md, 1rem);
  }
  
  .guest-name {
    font-size: calc(var(--gmkb-font-size-xl, 2rem) * 0.85);
  }
  
  .guest-title-line {
    font-size: var(--gmkb-font-size-base, 1rem);
  }
  
  .guest-tagline {
    padding: var(--gmkb-spacing-sm, 0.5rem);
  }
  
  .tagline-text {
    font-size: var(--gmkb-font-size-base, 1rem);
  }
}
</style>
