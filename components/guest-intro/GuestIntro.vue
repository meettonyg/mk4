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
import { usePodsData } from '../../src/composables/usePodsData';

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

// PHASE 1 ARCHITECTURAL FIX: Self-contained data loading
// Component loads own data via usePodsData() composable
const { 
  firstName: podsFirstName,
  lastName: podsLastName,
  fullName: podsFullName,
  position: podsPosition,
  company: podsCompany
} = usePodsData();

// Extract data from both data and props for compatibility with Pods fallback
// Name fields with Pods fallback
const fullName = computed(() => {
  const savedFullName = props.data?.full_name || props.props?.full_name || props.data?.fullName || props.props?.fullName;
  if (savedFullName) return savedFullName;
  if (podsFullName.value) return podsFullName.value;
  return '';
});

const firstName = computed(() => {
  const savedFirstName = props.data?.first_name || props.props?.first_name || props.data?.firstName || props.props?.firstName;
  if (savedFirstName) return savedFirstName;
  if (podsFirstName.value) return podsFirstName.value;
  return '';
});

const lastName = computed(() => {
  const savedLastName = props.data?.last_name || props.props?.last_name || props.data?.lastName || props.props?.lastName;
  if (savedLastName) return savedLastName;
  if (podsLastName.value) return podsLastName.value;
  return '';
});

const guestTitle = computed(() => {
  const savedTitle = props.data?.guest_title || props.props?.guest_title || props.data?.title || props.props?.title;
  if (savedTitle) return savedTitle;
  if (podsPosition.value) return podsPosition.value;
  return '';
});

const company = computed(() => {
  const savedCompany = props.data?.company || props.props?.company;
  if (savedCompany) return savedCompany;
  if (podsCompany.value) return podsCompany.value;
  return '';
});
const introduction = computed(() => props.data?.introduction || props.props?.introduction || '');
const tagline = computed(() => props.data?.tagline || props.props?.tagline || '');
const layout = computed(() => props.data?.layout || props.props?.layout || 'centered');

// Computed display name with Pods fallback
const displayName = computed(() => {
  // 1. Try component saved full name
  if (fullName.value) {
    return fullName.value;
  }
  
  // 2. Try constructing from component first/last name
  const parts = [];
  if (firstName.value) parts.push(firstName.value);
  if (lastName.value) parts.push(lastName.value);
  if (parts.length > 0) return parts.join(' ');
  
  // 3. FALLBACK: Use Pods full name
  if (podsFullName.value) return podsFullName.value;
  
  // 4. FALLBACK: Construct from Pods first/last name
  const podsParts = [];
  if (podsFirstName.value) podsParts.push(podsFirstName.value);
  if (podsLastName.value) podsParts.push(podsLastName.value);
  if (podsParts.length > 0) return podsParts.join(' ');
  
  // 5. Default fallback
  return 'Guest Name';
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
  /* font-size and font-weight inherited from component-root */
  margin: 0 0 0.5rem 0;
  /* line-height inherited from component-root */
  color: inherit;
}

/* Title line */
.guest-title-line {
  display: flex;
  gap: 0.5rem;
  /* font-size inherited from component-root */
  opacity: 0.8; /* Use opacity instead of fixed color */
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
  background: var(--primary-gradient, linear-gradient(135deg, #3b82f6 0%, #2563eb 100%));
  border-radius: var(--component-border-radius, 8px);
  position: relative;
  overflow: hidden;
}

.tagline-text {
  position: relative;
  display: inline-block;
  /* font-size and font-weight inherited from component-root */
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
  /* font-size and line-height inherited from component-root */
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
