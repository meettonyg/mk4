<template>
  <!-- V2 ARCHITECTURE: Single root element with component-root class -->
  <!-- ROOT FIX: Removed data-component-id - it's on the wrapper, not here -->
  <div 
    class="component-root guest-intro-component"
    :class="[`layout-${layout}`, { 'has-tagline': tagline }]"
  >
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

<script setup>
import { computed } from 'vue';

const props = defineProps({
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
  isEditing: {
    type: Boolean,
    default: false
  },
  isSelected: {
    type: Boolean,
    default: false
  }
});

// Extract data from both data and props for compatibility
const fullName = computed(() => props.data?.full_name || props.props?.full_name || props.data?.fullName || props.props?.fullName || '');
const firstName = computed(() => props.data?.first_name || props.props?.first_name || props.data?.firstName || props.props?.firstName || '');
const lastName = computed(() => props.data?.last_name || props.props?.last_name || props.data?.lastName || props.props?.lastName || '');
const guestTitle = computed(() => props.data?.guest_title || props.props?.guest_title || props.data?.title || props.props?.title || '');
const company = computed(() => props.data?.company || props.props?.company || '');
const introduction = computed(() => props.data?.introduction || props.props?.introduction || '');
const tagline = computed(() => props.data?.tagline || props.props?.tagline || '');
const layout = computed(() => props.data?.layout || props.props?.layout || 'centered');

// Computed display name
const displayName = computed(() => {
  if (fullName.value) {
    return fullName.value;
  }
  const parts = [];
  if (firstName.value) parts.push(firstName.value);
  if (lastName.value) parts.push(lastName.value);
  return parts.join(' ') || 'Guest Name';
});

// Computed display title
const displayTitle = computed(() => guestTitle.value || '');
</script>

<style scoped>
/* V2 ARCHITECTURE: Minimal component styles */
/* All visual styles (background, padding, border, etc.) applied via ComponentStyleService */

.guest-intro-component {
  /* Styles applied via inline styles from ComponentStyleService */
}

/* Layout: Centered */
.guest-intro-component.layout-centered .guest-intro-content {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

/* Layout: Left-aligned */
.guest-intro-component.layout-left-aligned .guest-intro-content {
  text-align: left;
  max-width: 900px;
}

/* Layout: Card */
.guest-intro-component.layout-card {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
}

.guest-intro-component.layout-card .guest-intro-content {
  padding: 1rem;
}

/* Name styling */
.guest-name {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
  color: inherit;
}

/* Title line */
.guest-title-line {
  display: flex;
  gap: 0.5rem;
  font-size: 1.25rem;
  color: #666666;
  margin-bottom: 1rem;
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
  padding-left: 0.5rem;
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
  margin: 1rem 0;
  padding: 1rem;
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.tagline-text {
  position: relative;
  display: inline-block;
  font-size: 1.25rem;
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
  margin-top: 1.5rem;
}

.guest-introduction p {
  font-size: 1rem;
  line-height: 1.6;
  color: inherit;
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .guest-name {
    font-size: 1.7rem;
  }
  
  .guest-title-line {
    font-size: 1rem;
  }
  
  .guest-tagline {
    padding: 0.5rem;
  }
  
  .tagline-text {
    font-size: 1rem;
  }
}
</style>
