<template>
  <div 
    ref="masonryContainer"
    class="masonry-grid"
    :style="masonryStyles"
  >
    <div
      v-for="(item, index) in items"
      :key="getItemKey(item, index)"
      class="masonry-item"
      :style="getItemStyle(index)"
    >
      <slot name="item" :item="item" :index="index"></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { useResizeObserver } from '@vueuse/core';

const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  columnWidth: {
    type: Number,
    default: 250
  },
  gap: {
    type: Number,
    default: 20
  },
  itemKey: {
    type: String,
    default: 'url'
  }
});

const masonryContainer = ref(null);
const itemHeights = ref([]);

const masonryStyles = computed(() => ({
  display: 'grid',
  gridTemplateColumns: `repeat(auto-fill, minmax(${props.columnWidth}px, 1fr))`,
  gridAutoRows: '20px',
  gap: `${props.gap}px`,
  width: '100%'
}));

const getItemKey = (item, index) => {
  return item[props.itemKey] || index;
};

const getItemStyle = (index) => {
  const height = itemHeights.value[index] || 100;
  const rowSpan = Math.ceil(height / 20);
  return {
    gridRowEnd: `span ${rowSpan}`
  };
};

const calculateLayout = async () => {
  await nextTick();
  
  if (!masonryContainer.value) return;
  
  const items = masonryContainer.value.querySelectorAll('.masonry-item');
  itemHeights.value = Array.from(items).map(item => item.scrollHeight + props.gap);
};

// Watch for items changes
watch(() => props.items, () => {
  calculateLayout();
}, { deep: true });

// Watch for column width changes
watch(() => props.columnWidth, () => {
  calculateLayout();
});

// Watch for gap changes
watch(() => props.gap, () => {
  calculateLayout();
});

onMounted(() => {
  calculateLayout();
});

// Recalculate on resize
useResizeObserver(masonryContainer, () => {
  calculateLayout();
});

// Expose for parent component to trigger recalculation
defineExpose({
  recalculate: calculateLayout
});
</script>

<style scoped>
.masonry-grid {
  width: 100%;
}

.masonry-item {
  break-inside: avoid;
}
</style>
