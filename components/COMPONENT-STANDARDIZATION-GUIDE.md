# Vue Component Standardization Template

## Standard Component Structure (Vue 3 Composition API with Pinia)

```vue
<template>
  <div 
    class="gmkb-[component-name]-component" 
    :data-component-id="componentId"
  >
    <!-- Component content here -->
    <!-- Use computed properties for display values -->
    <h2 v-if="displayTitle">{{ displayTitle }}</h2>
    <p v-if="displayContent">{{ displayContent }}</p>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useMediaKitStore } from '../../src/stores/mediaKit';
import { usePodsData } from '../../src/composables/usePodsData';

export default {
  name: '[ComponentName]Component',
  
  props: {
    componentId: {
      type: String,
      required: true
    },
    data: {
      type: Object,
      default: () => ({})
    },
    settings: {
      type: Object,
      default: () => ({})
    }
  },
  
  setup(props, { emit }) {
    // Store and composables - ROOT FIX: No global object checking
    const store = useMediaKitStore();
    const { 
      firstName, 
      lastName, 
      biography, 
      email,
      // ... other pods fields as needed
    } = usePodsData();
    
    // Local state
    const isEditing = ref(false);
    const localData = ref({ ...props.data });
    
    // Computed properties with Pods data fallbacks
    const displayTitle = computed(() => {
      // Use component data first, then Pods data as fallback
      return props.data.title || localData.value.title || '[Default Title]';
    });
    
    const displayContent = computed(() => {
      // Use component data first, then Pods data as fallback
      return props.data.content || localData.value.content || biography.value || '';
    });
    
    // Methods
    const updateComponent = () => {
      // ROOT FIX: Use Pinia store directly, no global object checking
      store.updateComponent(props.componentId, {
        data: localData.value,
        props: localData.value
      });
      
      // Also emit event for other systems if needed
      document.dispatchEvent(new CustomEvent('gmkb:component-updated', {
        detail: {
          componentId: props.componentId,
          updates: localData.value
        }
      }));
    };
    
    const saveChanges = () => {
      updateComponent();
      isEditing.value = false;
      
      // Show notification
      store.showNotification('Changes saved', 'success');
    };
    
    // Lifecycle hooks
    onMounted(() => {
      // ROOT FIX: No polling or checking for global objects
      // Just dispatch mount event if needed
      if (store.components[props.componentId]) {
        document.dispatchEvent(new CustomEvent('gmkb:vue-component-mounted', {
          detail: {
            type: '[component-type]',
            id: props.componentId,
            podsDataUsed: !props.data.content && biography.value
          }
        }));
      }
    });
    
    onUnmounted(() => {
      // Clean up any event listeners
    });
    
    return {
      // State
      isEditing,
      localData,
      
      // Computed
      displayTitle,
      displayContent,
      
      // Methods
      updateComponent,
      saveChanges
    };
  }
};
</script>

<style scoped>
.gmkb-[component-name]-component {
  /* Use CSS variables for theming */
  padding: var(--gmkb-spacing-lg, 2rem);
  background: var(--gmkb-color-surface, #ffffff);
  border-radius: var(--gmkb-border-radius, 8px);
  transition: var(--gmkb-transition, all 0.3s ease);
}

/* Rest of component styles */
</style>
```

## Key Principles for Component Updates

### 1. **No Polling or Global Object Checking** ✅
```javascript
// ❌ BAD - Polling for global objects
const checkForStore = setInterval(() => {
  if (window.GMKB?.stateManager) {
    // do something
  }
}, 100);

// ✅ GOOD - Direct store import
import { useMediaKitStore } from '../../src/stores/mediaKit';
const store = useMediaKitStore();
```

### 2. **Use Pinia Store Directly** ✅
```javascript
// ❌ BAD - Using window objects
if (window.GMKB?.stateManager) {
  window.GMKB.stateManager.updateComponent(id, data);
}

// ✅ GOOD - Direct store method
store.updateComponent(props.componentId, {
  data: updates,
  props: updates
});
```

### 3. **Pods Data via Composable** ✅
```javascript
// ❌ BAD - Direct window access
const podsData = window.gmkbData?.pods_data || {};

// ✅ GOOD - Use composable
const { biography, firstName, lastName } = usePodsData();
```

### 4. **Event-Driven Communication** ✅
```javascript
// Dispatch events for other systems
document.dispatchEvent(new CustomEvent('gmkb:component-updated', {
  detail: { componentId, updates }
}));

// Listen for events
onMounted(() => {
  document.addEventListener('gmkb:some-event', handleEvent);
});

onUnmounted(() => {
  document.removeEventListener('gmkb:some-event', handleEvent);
});
```

### 5. **Data Flow Priority** ✅
1. Component props/data (user-edited values)
2. Pods data (from WordPress)
3. Default values

```javascript
const displayValue = computed(() => {
  return props.data.value || podsValue.value || 'Default';
});
```

## Migration Checklist for Each Component

- [ ] Convert from Options API to Composition API
- [ ] Import and use `useMediaKitStore` directly
- [ ] Import and use `usePodsData` composable
- [ ] Remove all `window.` references
- [ ] Remove any polling/setTimeout/setInterval
- [ ] Add proper TypeScript types (if using TS)
- [ ] Use CSS variables for theming
- [ ] Add proper event emissions
- [ ] Test with Pinia DevTools

## Components to Update

### Simple Components (Day 1)
- [x] Contact → ContactRenderer.vue ✅
- [ ] Social → SocialRenderer.vue
- [ ] Stats → StatsRenderer.vue
- [ ] Logo Grid → LogoGridRenderer.vue

### Data-Bound Components (Day 2-3)
- [x] Hero → Hero.vue ✅
- [x] Biography → Biography.vue ✅
- [ ] Topics → TopicsRenderer.vue
- [ ] Questions → QuestionsRenderer.vue

### Complex Components (Day 3-4)
- [ ] Authority Hook → AuthorityHookRenderer.vue
- [ ] Guest Intro → GuestIntroRenderer.vue
- [ ] Testimonials → TestimonialsRenderer.vue
- [ ] Gallery → PhotoGalleryRenderer.vue
- [ ] Video → VideoIntroRenderer.vue
- [ ] Podcast → PodcastPlayerRenderer.vue
- [ ] CTA → CallToActionRenderer.vue
- [ ] Booking → BookingCalendarRenderer.vue

## Testing Each Component

After updating each component:

1. **Check Console** - No errors or warnings
2. **Check Pinia DevTools** - Component updates reflect in store
3. **Check Network Tab** - No unnecessary API calls
4. **Test Pods Data** - Component uses Pods data when available
5. **Test Updates** - Changes save correctly to store
6. **Test Events** - Events dispatch and are received properly

## Common Issues and Fixes

### Issue: Component not updating when store changes
**Fix:** Ensure computed properties are used for reactive data

### Issue: Pods data not showing
**Fix:** Check that store.initialize() has been called and podsData is populated

### Issue: Save not working
**Fix:** Ensure store.updateComponent() is called with correct structure

### Issue: Events not firing
**Fix:** Check event names match and listeners are properly set up/cleaned up
