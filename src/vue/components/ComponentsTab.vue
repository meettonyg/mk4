<template>
  <div id="components-tab" class="tab-content" :class="{ 'tab-content--active': isActive }">
    <!-- Vue-powered Sidebar Components -->
    <SidebarComponents />
    
    <!-- Legacy PHP Content (will be phased out) -->
    <div v-if="showLegacy" class="legacy-components-wrapper">
      <!-- PHP-generated content will render here initially -->
      <slot name="legacy"></slot>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import SidebarComponents from './SidebarComponents.vue';

export default {
  name: 'ComponentsTab',
  
  components: {
    SidebarComponents
  },
  
  props: {
    active: {
      type: Boolean,
      default: true
    }
  },
  
  setup(props) {
    const showLegacy = ref(false); // Set to true to show PHP content during migration
    
    const isActive = computed(() => props.active);
    
    onMounted(() => {
      // Hide legacy PHP components if they exist
      const legacyGrid = document.querySelector('.component-grid');
      if (legacyGrid && !showLegacy.value) {
        legacyGrid.style.display = 'none';
      }
    });
    
    return {
      isActive,
      showLegacy
    };
  }
};
</script>

<style scoped>
.tab-content {
  display: none;
  height: 100%;
  overflow-y: auto;
}

.tab-content--active {
  display: block;
}

.legacy-components-wrapper {
  padding: 20px;
  border-top: 1px solid #334155;
  margin-top: 20px;
}
</style>
