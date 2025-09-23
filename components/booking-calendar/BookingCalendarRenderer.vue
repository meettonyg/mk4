<template>
  <div class="gmkb-booking-calendar-component" :data-component-id="componentId">
    <div class="booking-container">
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
export default {
  name: 'BookingCalendarRenderer',
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
  data() {
    return {
      bookingForm: {
        date: '',
        time: '',
        name: '',
        email: '',
        message: ''
      }
    }
  },
  computed: {
    title() {
      return this.data.title || 'Book a Meeting'
    },
    description() {
      return this.data.description || ''
    },
    calendarService() {
      return this.data.calendar_service || ''
    },
    calendarUrl() {
      return this.data.calendar_url || this.data.calendly_url || ''
    },
    availableTimes() {
      return this.data.available_times || [
        '9:00 AM', '10:00 AM', '11:00 AM', 
        '2:00 PM', '3:00 PM', '4:00 PM'
      ]
    }
  },
  methods: {
    handleBookingSubmit() {
      this.$emit('booking-submit', this.bookingForm)
      // Reset form
      this.bookingForm = {
        date: '',
        time: '',
        name: '',
        email: '',
        message: ''
      }
      alert('Booking request sent!')
    }
  },
  mounted() {
    // Load Calendly script if needed
    if (this.calendarService === 'calendly' && !window.Calendly) {
      const script = document.createElement('script')
      script.src = 'https://assets.calendly.com/assets/external/widget.js'
      script.async = true
      document.body.appendChild(script)
    }
  }
}
</script>

<style scoped>
.gmkb-booking-calendar-component {
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
</style>
