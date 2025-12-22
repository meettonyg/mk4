<template>
  <component
    v-if="iconComponent"
    :is="iconComponent"
    :class="['gmkb-icon', sizeClass, props.class]"
    :aria-hidden="!ariaLabel"
    :aria-label="ariaLabel"
  />
  <span v-else class="gmkb-icon gmkb-icon--placeholder" :class="sizeClass">
    <!-- Fallback placeholder -->
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10" />
    </svg>
  </span>
</template>

<script setup>
import { computed, shallowRef, watchEffect } from 'vue';
import * as SolidIcons from '@heroicons/vue/24/solid';
import * as OutlineIcons from '@heroicons/vue/24/outline';

const props = defineProps({
  /**
   * The icon name (e.g., 'ChatBubbleBottomCenterTextIcon')
   */
  name: {
    type: String,
    required: true,
  },

  /**
   * Icon variant: 'solid' or 'outline'
   */
  variant: {
    type: String,
    default: 'outline',
    validator: (value) => ['solid', 'outline'].includes(value),
  },

  /**
   * Icon size: 'sm' (16px), 'md' (20px), 'lg' (24px), 'xl' (32px)
   */
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value),
  },

  /**
   * Additional CSS classes
   */
  class: {
    type: String,
    default: '',
  },

  /**
   * Aria label for accessibility (if icon has meaning)
   */
  ariaLabel: {
    type: String,
    default: null,
  },
});

/**
 * Computed size class
 */
const sizeClass = computed(() => `gmkb-icon--${props.size}`);

/**
 * The resolved icon component
 */
const iconComponent = shallowRef(null);

/**
 * Watch for icon name changes and resolve the component
 */
watchEffect(() => {
  const iconSet = props.variant === 'solid' ? SolidIcons : OutlineIcons;
  const icon = iconSet[props.name];

  if (icon) {
    iconComponent.value = icon;
  } else {
    console.warn(`[IconRenderer] Icon not found: ${props.name} (${props.variant})`);
    iconComponent.value = null;
  }
});
</script>

<style scoped>
.gmkb-icon {
  display: inline-block;
  flex-shrink: 0;
  color: currentColor;
}

.gmkb-icon--sm {
  width: 16px;
  height: 16px;
}

.gmkb-icon--md {
  width: 20px;
  height: 20px;
}

.gmkb-icon--lg {
  width: 24px;
  height: 24px;
}

.gmkb-icon--xl {
  width: 32px;
  height: 32px;
}

.gmkb-icon--placeholder svg {
  width: 100%;
  height: 100%;
}
</style>
