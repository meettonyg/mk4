<template>
  <div
    class="blank-canvas-card"
    @click="$emit('select')"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <div class="card-content">
      <div class="icon-wrapper" :class="{ hovered: isHovered }">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </div>
      <h3>Blank Canvas</h3>
      <p>Start from scratch with an empty media kit</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

defineEmits(['select']);

const isHovered = ref(false);
</script>

<style scoped>
.blank-canvas-card {
  background: white;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 280px;
}

.blank-canvas-card:hover {
  border-color: #3b82f6;
  background: #f0f7ff;
  transform: translateY(-2px);
}

.card-content {
  text-align: center;
  padding: 2rem;
}

.icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  transition: all 0.2s ease;
  color: #9ca3af;
}

.icon-wrapper.hovered {
  background: #3b82f6;
  color: white;
  transform: scale(1.05);
}

h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.375rem;
}

p {
  font-size: 0.8125rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
}
</style>
