<template>
  <div class="gmkb-contact-component" :data-component-id="componentId">
    <div class="contact-container">
      <h2 v-if="title" class="contact-title">{{ title }}</h2>
      <p v-if="description" class="contact-description">{{ description }}</p>
      
      <div class="contact-grid">
        <!-- Email -->
        <div v-if="email" class="contact-item">
          <i class="contact-icon">✉️</i>
          <div>
            <h4>Email</h4>
            <a :href="`mailto:${email}`">{{ email }}</a>
          </div>
        </div>
        
        <!-- Phone -->
        <div v-if="phone" class="contact-item">
          <i class="contact-icon">📱</i>
          <div>
            <h4>Phone</h4>
            <a :href="`tel:${phone}`">{{ phone }}</a>
          </div>
        </div>
        
        <!-- Website -->
        <div v-if="website" class="contact-item">
          <i class="contact-icon">🌐</i>
          <div>
            <h4>Website</h4>
            <a :href="website" target="_blank">{{ displayWebsite }}</a>
          </div>
        </div>
        
        <!-- Address -->
        <div v-if="address" class="contact-item">
          <i class="contact-icon">📍</i>
          <div>
            <h4>Location</h4>
            <p>{{ address }}</p>
          </div>
        </div>
      </div>
      
      <!-- Contact Form -->
      <div v-if="showForm" class="contact-form">
        <h3>Send a Message</h3>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <input 
              v-model="formData.name" 
              type="text" 
              placeholder="Your Name"
              required
            />
          </div>
          <div class="form-group">
            <input 
              v-model="formData.email" 
              type="email" 
              placeholder="Your Email"
              required
            />
          </div>
          <div class="form-group">
            <textarea 
              v-model="formData.message" 
              placeholder="Your Message"
              rows="4"
              required
            ></textarea>
          </div>
          <button type="submit" class="submit-button">
            Send Message
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useMediaKitStore } from '../../src/stores/mediaKit';
import { usePodsData } from '../../src/composables/usePodsData';

export default {
  name: 'ContactRenderer',
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
  setup(props, { emit }) {
    // Store and composables
    const store = useMediaKitStore();
    const { email: podsEmail, phone: podsPhone, website: podsWebsite, location: podsLocation } = usePodsData();
    
    // Form data
    const formData = ref({
      name: '',
      email: '',
      message: ''
    });
    
    // Computed properties with Pods data fallbacks
    const title = computed(() => {
      return props.data.title || 'Get In Touch';
    });
    
    const description = computed(() => {
      return props.data.description || '';
    });
    
    const email = computed(() => {
      // ROOT FIX: Use Pods data as fallback, no global object checking
      return props.data.email || props.data.contact_email || podsEmail.value || '';
    });
    
    const phone = computed(() => {
      return props.data.phone || props.data.contact_phone || podsPhone.value || '';
    });
    
    const website = computed(() => {
      return props.data.website || props.data.contact_website || podsWebsite.value || '';
    });
    
    const address = computed(() => {
      return props.data.address || props.data.contact_address || podsLocation.value || '';
    });
    
    const showForm = computed(() => {
      return props.data.show_form !== false;
    });
    
    const displayWebsite = computed(() => {
      return website.value.replace(/^https?:\/\//, '');
    });
    
    // Methods
    const handleSubmit = () => {
      // ROOT FIX: Use store to handle submission if needed
      const submissionData = {
        ...formData.value,
        componentId: props.componentId,
        recipientEmail: email.value
      };
      
      // Emit event for parent to handle
      emit('contact-submit', submissionData);
      
      // Dispatch event for other systems
      document.dispatchEvent(new CustomEvent('gmkb:contact-form-submit', {
        detail: submissionData
      }));
      
      // Reset form
      formData.value = {
        name: '',
        email: '',
        message: ''
      };
      
      // Show notification via store
      store.showNotification('Message sent successfully!', 'success');
    };
    
    return {
      formData,
      title,
      description,
      email,
      phone,
      website,
      address,
      showForm,
      displayWebsite,
      handleSubmit
    };
  }
};
</script>

<style scoped>
.gmkb-contact-component {
  padding: var(--gmkb-spacing-xl, 2rem);
  background: var(--gmkb-color-surface, #fff);
}

.contact-container {
  max-width: var(--gmkb-container-max-width, 1200px);
  margin: 0 auto;
}

.contact-title {
  text-align: center;
  color: var(--gmkb-color-text, #333);
  font-family: var(--gmkb-font-heading, 'Inter', system-ui, sans-serif);
  font-size: var(--gmkb-font-size-2xl, 2rem);
  font-weight: var(--gmkb-font-weight-bold, 700);
  line-height: var(--gmkb-line-height-heading, 1.2);
  margin-bottom: var(--gmkb-spacing-md, 1rem);
}

.contact-description {
  text-align: center;
  color: var(--gmkb-color-text-light, #666);
  font-family: var(--gmkb-font-primary, 'Inter', system-ui, sans-serif);
  font-size: var(--gmkb-font-size-base, 1rem);
  line-height: var(--gmkb-line-height-base, 1.6);
  margin-bottom: var(--gmkb-spacing-xl, 2rem);
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--gmkb-spacing-xl, 2rem);
  margin-bottom: var(--gmkb-spacing-2xl, 3rem);
}

.contact-item {
  display: flex;
  align-items: flex-start;
  gap: var(--gmkb-spacing-md, 1rem);
}

.contact-icon {
  font-size: var(--gmkb-font-size-xl, 1.5rem);
  margin-top: var(--gmkb-space-1, 0.25rem);
}

.contact-item h4 {
  color: var(--gmkb-color-text, #333);
  font-family: var(--gmkb-font-heading, 'Inter', system-ui, sans-serif);
  font-size: var(--gmkb-font-size-base, 1rem);
  font-weight: var(--gmkb-font-weight-bold, 600);
  margin-bottom: var(--gmkb-space-1, 0.25rem);
}

.contact-item a {
  color: var(--gmkb-color-primary, #007cba);
  text-decoration: none;
}

.contact-item a:hover {
  text-decoration: underline;
}

.contact-form {
  background: var(--gmkb-color-background, #f8f9fa);
  padding: var(--gmkb-spacing-xl, 2rem);
  border-radius: var(--gmkb-border-radius, 8px);
  max-width: 600px;
  margin: 0 auto;
}

.contact-form h3 {
  color: var(--gmkb-color-text, #333);
  font-family: var(--gmkb-font-heading, 'Inter', system-ui, sans-serif);
  font-size: var(--gmkb-font-size-lg, 1.25rem);
  font-weight: var(--gmkb-font-weight-bold, 600);
  margin-bottom: var(--gmkb-spacing-lg, 1.5rem);
}

.form-group {
  margin-bottom: var(--gmkb-spacing-md, 1rem);
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: var(--gmkb-spacing-sm, 0.75rem);
  border: 1px solid var(--gmkb-color-border, #ddd);
  border-radius: var(--gmkb-border-radius-sm, 4px);
  font-family: var(--gmkb-font-primary, 'Inter', system-ui, sans-serif);
  font-size: var(--gmkb-font-size-base, 1rem);
}

.submit-button {
  background: var(--gmkb-color-primary, #007cba);
  color: white;
  border: none;
  padding: var(--gmkb-spacing-sm, 0.75rem) var(--gmkb-spacing-xl, 2rem);
  border-radius: var(--gmkb-border-radius-sm, 4px);
  font-family: var(--gmkb-font-primary, 'Inter', system-ui, sans-serif);
  font-size: var(--gmkb-font-size-base, 1rem);
  font-weight: var(--gmkb-font-weight-medium, 500);
  cursor: pointer;
  transition: var(--gmkb-transition, all 0.3s ease);
}

.submit-button:hover {
  background: var(--gmkb-color-primary-hover, #005a87);
}
</style>
