<template>
  <!-- This component is rendered into the sidebar via teleport -->
  <Teleport to="#gmkb-sidebar" v-if="sidebarMountPoint">
    <SidebarTabs />
  </Teleport>
  
  <!-- Fallback to old mount point if new sidebar doesn't exist -->
  <Teleport to="#vue-component-list" v-else-if="componentListMountPoint">
    <ComponentList />
  </Teleport>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import SidebarTabs from './sidebar/SidebarTabs.vue';
import ComponentList from './sidebar/ComponentList.vue';

const sidebarMountPoint = ref(false);
const componentListMountPoint = ref(false);

onMounted(() => {
  // Check for new sidebar mount point first
  const newSidebar = document.getElementById('gmkb-sidebar');
  if (newSidebar) {
    sidebarMountPoint.value = true;
    console.log('✅ New sidebar mount point found');
    console.log('Sidebar element:', newSidebar);
    console.log('Sidebar visible:', window.getComputedStyle(newSidebar).display !== 'none');
  } else {
    // Fallback to old mount point
    const oldMountPoint = document.getElementById('vue-component-list');
    if (oldMountPoint) {
      componentListMountPoint.value = true;
      console.log('✅ Using legacy component list mount point');
    } else {
      console.warn('⚠️ No sidebar mount points found');
    }
  }
});
</script>
