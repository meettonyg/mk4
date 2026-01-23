<template>
  <!-- ROOT FIX: Use design system classes -->
  <div class="gmkb-component gmkb-component--contact" :data-component-id="componentId">
    <div class="component-root contact-info">
      <!-- Placeholder items when editing with no data configured -->
      <template v-if="showPlaceholders">
        <div class="contact-item contact-item--placeholder" title="Click to configure email">
          <i class="fas fa-envelope"></i>
          <span>your@email.com</span>
        </div>
        <div class="contact-item contact-item--placeholder" title="Click to configure phone">
          <i class="fas fa-phone"></i>
          <span>+1 (555) 123-4567</span>
        </div>
      </template>

      <!-- Actual contact items when data exists -->
      <template v-else>
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
      </template>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';

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
    // Data from component JSON state (single source of truth)
    const email = computed(() => props.data?.email || props.props?.email || '');
    const phone = computed(() => props.data?.phone || props.props?.phone || '');
    const skype = computed(() => props.data?.skype || props.props?.skype || '');
    const location = computed(() => props.data?.location || props.props?.location || '');

    // Check if any contact data exists
    const hasContactData = computed(() => {
      return email.value || phone.value || skype.value || location.value;
    });

    // Show placeholders when editing with no data configured
    const showPlaceholders = computed(() => {
      return !hasContactData.value && (props.isEditing || props.isSelected);
    });

    return {
      email,
      phone,
      skype,
      location,
      showPlaceholders
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
