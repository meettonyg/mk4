<template>
  <!-- Always use the new SidebarTabs - render directly into #gmkb-sidebar -->
  <Teleport to="#gmkb-sidebar" v-if="mounted">
    <SidebarTabs />
  </Teleport>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import SidebarTabs from './sidebar/SidebarTabs.vue';

const mounted = ref(false);

onMounted(async () => {
  // Wait for DOM to be ready
  await nextTick();
  
  const sidebarElement = document.getElementById('gmkb-sidebar');
  
  if (sidebarElement) {
    // Clear any existing content
    sidebarElement.innerHTML = '';
    mounted.value = true;
    console.log('✅ SidebarTabs will render into #gmkb-sidebar');
  } else {
    console.error('❌ #gmkb-sidebar mount point not found!');
  }
});
</script>
