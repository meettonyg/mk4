<template>
  <div class="component-wrapper" :data-component-id="componentId">
    <CompanyLogoRenderer 
      :component-id="componentId" 
      :data="componentData"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useMediaKitStore } from '../../src/stores/mediaKit';
import CompanyLogoRenderer from './CompanyLogoRenderer.vue';

const props = defineProps({
  componentId: {
    type: String,
    required: true
  }
});

const store = useMediaKitStore();

const componentData = computed(() => {
  const component = store.components[props.componentId];
  return component?.data || {};
});
</script>

<style scoped>
.component-wrapper {
  width: 100%;
}
</style>
