<template>
  <!-- Always use the new SidebarTabs - render directly into #gmkb-sidebar -->
  <Teleport to="#gmkb-sidebar" v-if="mounted">
    <SidebarTabs />
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import { useUIStore } from '../../stores/ui';
import SidebarTabs from './sidebar/SidebarTabs.vue';

const mounted = ref(false);
const uiStore = useUIStore();

// Watch for sidebar collapse state and update the parent element
watch(
  () => uiStore.sidebarCollapsed,
  (collapsed) => {
    const sidebarElement = document.getElementById('gmkb-sidebar');
    if (sidebarElement) {
      if (collapsed) {
        sidebarElement.classList.add('sidebar-collapsed');
      } else {
        sidebarElement.classList.remove('sidebar-collapsed');
      }
    }
  }
);

onMounted(async () => {
  // Wait for DOM to be ready
  await nextTick();
  
  const sidebarElement = document.getElementById('gmkb-sidebar');
  
  if (sidebarElement) {
    // Clear any existing content
    sidebarElement.innerHTML = '';
    
    // Apply initial collapsed state
    if (uiStore.sidebarCollapsed) {
      sidebarElement.classList.add('sidebar-collapsed');
    }
    
    mounted.value = true;
    console.log('✅ SidebarTabs will render into #gmkb-sidebar');
  } else {
    console.error('❌ #gmkb-sidebar mount point not found!');
  }
});

onBeforeUnmount(() => {
  // Clean up class when component unmounts
  const sidebarElement = document.getElementById('gmkb-sidebar');
  if (sidebarElement) {
    sidebarElement.classList.remove('sidebar-collapsed');
  }
});
</script>
