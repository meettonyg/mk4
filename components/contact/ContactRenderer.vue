<template>
  <!-- ROOT FIX: Use design system classes -->
  <div class="gmkb-component gmkb-component--contact" :data-component-id="componentId">
    <div class="component-root contact-info">
      <!-- Email -->
      <div v-if="email" class="contact-item">
        <i class="fas fa-envelope"></i>
        <a :href="`mailto:${email}`">{{ email }}</a>
      </div>
      
      <!-- Phone -->
      <div v-if="phone" class="contact-item">
        <i class="fas fa-phone"></i>
        <a :href="`tel:${phone}`">{{ phone }}</a>
      </div>
      
      <!-- Skype -->
      <div v-if="skype" class="contact-item">
        <i class="fab fa-skype"></i>
        <a :href="`skype:${skype}?chat`">{{ skype }}</a>
      </div>
      
      <!-- Location -->
      <div v-if="location" class="contact-item">
        <i class="fas fa-map-marker-alt"></i>
        <span>{{ location }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { usePodsData } from '../../src/composables/usePodsData';

export default {
  name: 'ContactRenderer',
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
    }
  },
  setup(props) {
    // COMPOSITION API: Access Pods data via composable
    const podsData = usePodsData();
    
    // EMAIL: Priority is component data > Pods email > empty
    const email = computed(() => {
      if (props.data?.email) return props.data.email;
      if (podsData.email?.value) return podsData.email.value;
      return '';
    });
    
    // PHONE: Priority is component data > Pods phone > empty
    const phone = computed(() => {
      if (props.data?.phone) return props.data.phone;
      if (podsData.rawPodsData?.value?.phone) return podsData.rawPodsData.value.phone;
      return '';
    });
    
    // SKYPE: Priority is component data > Pods skype > empty
    const skype = computed(() => {
      if (props.data?.skype) return props.data.skype;
      if (podsData.rawPodsData?.value?.skype) return podsData.rawPodsData.value.skype;
      return '';
    });
    
    // LOCATION: Priority is component data > Pods location > empty
    const location = computed(() => {
      if (props.data?.location) return props.data.location;
      if (podsData.rawPodsData?.value?.location) return podsData.rawPodsData.value.location;
      return '';
    });
    
    return {
      email,
      phone,
      skype,
      location
    };
  }
}
</script>

<style>
/* ROOT FIX: NO scoped styles
   All styling comes from design-system/components.css:
   - .gmkb-component (base component wrapper)
   - .gmkb-component--contact (contact-specific styles)
   - .contact-info, .contact-item
*/
</style>
