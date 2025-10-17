<template>
  <!-- V2 ARCHITECTURE: Single root element with component-root class -->
  <!-- ROOT FIX: Removed data-component-id - it's on the wrapper, not here -->
  <div 
    class="component-root booking-calendar-component"
  >
    <h2 v-if="title" class="booking-title">{{ title }}</h2>
    <p v-if="description" class="booking-description">{{ description }}</p>
    
    <!-- Calendar embed based on service -->
    <div v-if="calendarService === 'calendly' && calendarUrl" class="calendar-embed">
      <div 
        class="calendly-inline-widget" 
        :data-url="calendarUrl"
        style="min-width:320px;height:630px;"
      ></div>
    </div>
    
    <!-- Google Calendar embed -->
    <iframe v-else-if="calendarService === 'google' && calendarUrl"
      :src="calendarUrl"
      style="border: 0"
      width="100%"
      height="600"
      frameborder="0"
      scrolling="no"
      title="Google Calendar"
    ></iframe>
    
    <!-- Fallback booking form -->
    <div v-else class="booking-form">
      <form @submit.prevent="handleBookingSubmit">
        <div class="form-group">
          <label for="booking-date">Preferred Date *</label>
          <input 
            id="booking-date"
            v-model="bookingForm.date" 
            type="date" 
            required 
          />
        </div>
        
        <div class="form-group">
          <label for="booking-time">Time *</label>
          <select id="booking-time" v-model="bookingForm.time" required>
            <option value="">Select a time</option>
            <option v-for="time in availableTimes" :key="time" :value="time">
              {{ time }}
            </option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="booking-name">Your Name *</label>
          <input 
            id="booking-name"
            v-model="bookingForm.name" 
            type="text" 
            required 
          />
        </div>
        
        <div class="form-group">
          <label for="booking-email">Email *</label>
          <input 
            id="booking-email"
            v-model="bookingForm.email" 
            type="email" 
            required 
          />
        </div>
        
        <div class="form-group">
          <label for="booking-message">Message</label>
          <textarea 
            id="booking-message"
            v-model="bookingForm.message" 
            rows="3"
            placeholder="Any specific topics or questions you'd like to discuss?"
          ></textarea>
        </div>
        
        <button type="submit" class="submit-button">Request Booking</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useMediaKitStore } from '../../src/stores/mediaKit';
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

const emit = defineEmits(['booking-submit']);

// Store and composables
const store = useMediaKitStore();
const { email: podsEmail, fullName, allData: rawPodsData } = usePodsData();

// Local state
const bookingForm = ref({
  date: '',
  time: '',
  name: '',
  email: '',
  message: ''
});

// Extract data from both data and props for compatibility
const title = computed(() => {
  if (props.data?.title || props.props?.title) {
    return props.data?.title || props.props?.title;
  }
  if (fullName.value) return `Book Time with ${fullName.value}`;
  return 'Book a Meeting';
});

const description = computed(() => props.data?.description || props.props?.description || '');

const calendarService = computed(() => props.data?.calendar_service || props.props?.calendar_service || '');

const calendarUrl = computed(() => {
  // Check component data first
  const url = props.data?.calendar_url || props.data?.calendly_url ||
              props.props?.calendar_url || props.props?.calendly_url;
  if (url) return url;
  
  // Check Pods data for booking URLs
  return rawPodsData.value?.calendly_url || 
         rawPodsData.value?.booking_url || 
         rawPodsData.value?.calendar_link || '';
});

const availableTimes = computed(() => {
  const times = props.data?.available_times || props.props?.available_times;
  if (Array.isArray(times)) {
    return times;
  }
  
  // Check Pods data for availability
  if (rawPodsData.value?.available_times) {
    const podsTimes = rawPodsData.value.available_times;
    if (typeof podsTimes === 'string') {
      return podsTimes.split(',').map(t => t.trim());
    }
    if (Array.isArray(podsTimes)) {
      return podsTimes;
    }
  }
  
  return [
    '9:00 AM', '10:00 AM', '11:00 AM', 
    '2:00 PM', '3:00 PM', '4:00 PM'
  ];
});

const handleBookingSubmit = () => {
  const submissionData = {
    ...bookingForm.value,
    recipientEmail: podsEmail.value || '',
    componentId: props.componentId
  };
  
  // Emit event
  emit('booking-submit', submissionData);
  
  // Dispatch global event
  document.dispatchEvent(new CustomEvent('gmkb:booking-submit', {
    detail: submissionData
  }));
  
  // Reset form
  bookingForm.value = {
    date: '',
    time: '',
    name: '',
    email: '',
    message: ''
  };
  
  // Show notification
  if (store.showNotification) {
    store.showNotification('Booking request sent!', 'success');
  }
};

// Lifecycle
onMounted(() => {
  if (store.components[props.componentId]) {
    document.dispatchEvent(new CustomEvent('gmkb:vue-component-mounted', {
      detail: {
        type: 'booking-calendar',
        id: props.componentId,
        podsDataUsed: !props.data.calendar_url && 
          !!(rawPodsData.value?.calendly_url || rawPodsData.value?.booking_url)
      }
    }));
  }
  
  // Load Calendly script if needed
  if (calendarService.value === 'calendly' && !window.Calendly) {
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    script.id = 'calendly-widget-script';
    document.body.appendChild(script);
  }
});

onUnmounted(() => {
  // Clean up Calendly script if added
  const script = document.getElementById('calendly-widget-script');
  if (script) {
    script.remove();
  }
});
</script>

<style scoped>
/* V2 ARCHITECTURE: Minimal component styles */
/* All visual styles (background, padding, border, etc.) applied via ComponentStyleService */

.booking-calendar-component {
  /* Styles applied via inline styles from ComponentStyleService */
  max-width: 800px;
  margin: 0 auto;
}

.booking-title {
  text-align: center;
  /* font-size and font-weight inherited from component-root */
  margin: 0 0 1rem 0;
  color: inherit;
}

.booking-description {
  text-align: center;
  opacity: 0.8; /* Use opacity instead of fixed color */
  margin: 0 0 2rem 0;
  /* line-height inherited from component-root */
}

.calendar-embed {
  background: var(--card-bg, rgba(248, 250, 252, 0.8));
  padding: 1rem;
  border-radius: var(--component-border-radius, 8px);
}

.booking-form {
  background: var(--card-bg, rgba(248, 250, 252, 0.8));
  padding: 2rem;
  border-radius: var(--component-border-radius, 8px);
  max-width: 500px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  color: inherit;
  margin-bottom: 0.5rem;
  /* font-weight inherited from component-root */
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: var(--component-border-radius, 8px);
  /* font-size inherited from component-root */
  font-family: inherit;
  background: white;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group textarea {
  resize: vertical;
}

.submit-button {
  width: 100%;
  background: var(--primary-color, #3b82f6);
  color: white;
  border: none;
  padding: 1rem;
  border-radius: var(--component-border-radius, 8px);
  /* font-size and font-weight inherited from component-root */
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-button:hover {
  background: var(--primary-hover, #2563eb);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.submit-button:active {
  transform: translateY(0);
}

/* Responsive */
@media (max-width: 768px) {
  .booking-title {
    font-size: 1.5rem;
  }
  
  .booking-form {
    padding: 1.5rem;
  }
}
</style>
