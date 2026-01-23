<template>
  <div class="gmkb-component gmkb-component--bookingcalendar" :data-component-id="componentId">
    <div class="booking-container">
      <h2 v-if="title" class="booking-title">{{ title }}</h2>
      <p v-if="description" class="booking-description">{{ description }}</p>
      
      <!-- Placeholder when editing with no calendar URL -->
      <div v-if="showPlaceholders" class="calendar-placeholder">
        <div class="placeholder-icon">
          <i class="fas fa-calendar-alt"></i>
        </div>
        <p class="placeholder-text">Configure your calendar integration</p>
        <p class="placeholder-hint">Add a Calendly or Google Calendar URL to display your booking calendar</p>
      </div>

      <!-- Calendar embed based on service -->
      <div v-else-if="calendarService === 'calendly' && calendarUrl" class="calendar-embed">
        <div 
          class="calendly-inline-widget" 
          :data-url="calendarUrl"
          style="min-width:320px;height:630px;"
        ></div>
      </div>
      
      <!-- Other calendar services -->
      <iframe v-else-if="calendarService === 'google' && calendarUrl"
        :src="calendarUrl"
        style="border: 0"
        width="100%"
        height="600"
        frameborder="0"
        scrolling="no"
      ></iframe>
      
      <!-- Fallback booking form -->
      <div v-else class="booking-form">
        <form @submit.prevent="handleBookingSubmit">
          <div class="form-group">
            <label>Preferred Date</label>
            <input v-model="bookingForm.date" type="date" required />
          </div>
          
          <div class="form-group">
            <label>Time</label>
            <select v-model="bookingForm.time" required>
              <option value="">Select a time</option>
              <option v-for="time in availableTimes" :key="time" :value="time">
                {{ time }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Your Name</label>
            <input v-model="bookingForm.name" type="text" required />
          </div>
          
          <div class="form-group">
            <label>Email</label>
            <input v-model="bookingForm.email" type="email" required />
          </div>
          
          <div class="form-group">
            <label>Message</label>
            <textarea v-model="bookingForm.message" rows="3"></textarea>
          </div>
          
          <button type="submit" class="submit-button">Request Booking</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useMediaKitStore } from '../../src/stores/mediaKit';

export default {
  name: 'BookingCalendarRenderer',
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
    },
    isBuilderMode: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { emit }) {
    // Store
    const store = useMediaKitStore();

    // Local state
    const bookingForm = ref({
      date: '',
      time: '',
      name: '',
      email: '',
      message: ''
    });

    // Data from component JSON state (single source of truth)
    const title = computed(() => {
      return props.data?.title || props.props?.title || 'Book a Meeting';
    });

    const description = computed(() => {
      return props.data?.description || props.props?.description || '';
    });

    const calendarService = computed(() => {
      return props.data?.calendar_service || props.props?.calendar_service || '';
    });

    const calendarUrl = computed(() => {
      return props.data?.calendar_url || props.data?.calendly_url ||
             props.props?.calendar_url || props.props?.calendly_url || '';
    });

    const availableTimes = computed(() => {
      const times = props.data?.available_times || props.props?.available_times;
      if (Array.isArray(times)) {
        return times;
      }

      return [
        '9:00 AM', '10:00 AM', '11:00 AM',
        '2:00 PM', '3:00 PM', '4:00 PM'
      ];
    });

    // Show placeholders when in builder mode with no calendar configured
    const showPlaceholders = computed(() => {
      return !calendarUrl.value && (props.isBuilderMode || props.isEditing || props.isSelected);
    });

    // Methods
    const handleBookingSubmit = () => {
      const submissionData = {
        ...bookingForm.value,
        recipientEmail: props.data?.recipient_email || props.props?.recipient_email || '',
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

      // Show notification via store
      store.showNotification('Booking request sent!', 'success');
    };

    // Lifecycle
    onMounted(() => {
      if (store.components[props.componentId]) {
        console.log('BookingCalendar component mounted:', props.componentId);

        // Dispatch mount event
        document.dispatchEvent(new CustomEvent('gmkb:vue-component-mounted', {
          detail: {
            type: 'booking-calendar',
            id: props.componentId,
            podsDataUsed: false
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

    return {
      bookingForm,
      title,
      description,
      calendarService,
      calendarUrl,
      availableTimes,
      handleBookingSubmit,
      showPlaceholders
    };
  }
};
</script>

<style>
.gmkb-component--bookingcalendar {
  padding: 2rem;
  background: var(--gmkb-color-surface, #fff);
}

.booking-container {
  max-width: 800px;
  margin: 0 auto;
}

.booking-title {
  text-align: center;
  color: var(--gmkb-color-text, #333);
  font-size: var(--gmkb-font-size-xl, 2rem);
  margin-bottom: 1rem;
}

.booking-description {
  text-align: center;
  color: var(--gmkb-color-text-light, #666);
  margin-bottom: 2rem;
}

.calendar-embed {
  background: var(--gmkb-color-background, #f8f9fa);
  padding: 1rem;
  border-radius: var(--gmkb-border-radius, 8px);
}

.booking-form {
  background: var(--gmkb-color-background, #f8f9fa);
  padding: 2rem;
  border-radius: var(--gmkb-border-radius, 8px);
  max-width: 500px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  color: var(--gmkb-color-text, #333);
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--gmkb-color-border, #ddd);
  border-radius: var(--gmkb-border-radius, 4px);
  font-size: 1rem;
}

.submit-button {
  width: 100%;
  background: var(--gmkb-color-primary, #007cba);
  color: white;
  border: none;
  padding: 1rem;
  border-radius: var(--gmkb-border-radius, 4px);
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
}

.submit-button:hover {
  background: var(--gmkb-color-primary-hover, #005a87);
}

/* Placeholder styles */
.calendar-placeholder {
  text-align: center;
  padding: 3rem 2rem;
  background: var(--gmkb-color-background, #f8f9fa);
  border: 2px dashed var(--gmkb-color-border, #cbd5e1);
  border-radius: var(--gmkb-border-radius, 8px);
  opacity: 0.7;
}

.calendar-placeholder .placeholder-icon {
  font-size: 3rem;
  color: var(--gmkb-color-text-muted, #94a3b8);
  margin-bottom: 1rem;
}

.calendar-placeholder .placeholder-text {
  font-size: 1.1rem;
  color: var(--gmkb-color-text, #333);
  margin-bottom: 0.5rem;
}

.calendar-placeholder .placeholder-hint {
  font-size: 0.9rem;
  color: var(--gmkb-color-text-muted, #94a3b8);
  font-style: italic;
}
</style>
