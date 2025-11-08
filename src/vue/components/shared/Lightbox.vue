<template>
  <Teleport to="body">
    <Transition name="lightbox-fade">
      <div 
        v-if="isOpen" 
        class="gmkb-lightbox-overlay"
        @click="handleOverlayClick"
        @keydown.esc="close"
        @keydown.left="previous"
        @keydown.right="next"
        tabindex="0"
        ref="overlayRef"
      >
        <!-- Close Button -->
        <button 
          class="gmkb-lightbox-close" 
          @click.stop="close"
          aria-label="Close lightbox"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <!-- Navigation Buttons -->
        <button 
          v-if="items.length > 1"
          class="gmkb-lightbox-nav gmkb-lightbox-nav--prev" 
          @click.stop="previous"
          aria-label="Previous image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        <button 
          v-if="items.length > 1"
          class="gmkb-lightbox-nav gmkb-lightbox-nav--next" 
          @click.stop="next"
          aria-label="Next image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>

        <!-- Image Container -->
        <div class="gmkb-lightbox-content" @click.stop>
          <Transition name="slide" mode="out-in">
            <div :key="currentIndex" class="gmkb-lightbox-image-wrapper">
              <img 
                :src="currentItem.url" 
                :alt="currentItem.alt || currentItem.name || currentItem.caption || `Image ${currentIndex + 1}`"
                class="gmkb-lightbox-image"
                @click.stop
              />
              
              <!-- Caption -->
              <div 
                v-if="currentItem.caption || currentItem.name" 
                class="gmkb-lightbox-caption"
              >
                {{ currentItem.caption || currentItem.name }}
              </div>

              <!-- Counter -->
              <div v-if="items.length > 1" class="gmkb-lightbox-counter">
                {{ currentIndex + 1 }} / {{ items.length }}
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  items: {
    type: Array,
    required: true,
    default: () => []
  },
  initialIndex: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['close']);

const isOpen = ref(false);
const currentIndex = ref(props.initialIndex);
const overlayRef = ref(null);

const currentItem = computed(() => {
  return props.items[currentIndex.value] || {};
});

// Navigation methods
const next = () => {
  if (currentIndex.value < props.items.length - 1) {
    currentIndex.value++;
  } else {
    currentIndex.value = 0; // Loop to first
  }
};

const previous = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  } else {
    currentIndex.value = props.items.length - 1; // Loop to last
  }
};

const close = () => {
  isOpen.value = false;
  emit('close');
  document.body.style.overflow = '';
};

const handleOverlayClick = (event) => {
  // Only close if clicking the overlay itself, not the content
  if (event.target === event.currentTarget) {
    close();
  }
};

// Public method to open lightbox
const open = (index = 0) => {
  if (props.items.length === 0) return;
  
  currentIndex.value = Math.max(0, Math.min(index, props.items.length - 1));
  isOpen.value = true;
  document.body.style.overflow = 'hidden';
  
  // Focus overlay for keyboard navigation
  setTimeout(() => {
    overlayRef.value?.focus();
  }, 100);
};

// Watch for initialIndex changes
watch(() => props.initialIndex, (newIndex) => {
  if (isOpen.value) {
    currentIndex.value = Math.max(0, Math.min(newIndex, props.items.length - 1));
  }
});

// Handle keyboard events
const handleKeydown = (event) => {
  if (!isOpen.value) return;
  
  switch(event.key) {
    case 'Escape':
      close();
      break;
    case 'ArrowLeft':
      previous();
      break;
    case 'ArrowRight':
      next();
      break;
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown);
  document.body.style.overflow = '';
});

// Expose methods to parent
defineExpose({
  open,
  close
});
</script>

<style>
/* Lightbox Overlay */
.gmkb-lightbox-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 999999;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-out;
  outline: none;
}

/* Close Button */
.gmkb-lightbox-close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 1000001;
  backdrop-filter: blur(10px);
}

.gmkb-lightbox-close:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.gmkb-lightbox-close:active {
  transform: scale(0.95);
}

/* Navigation Buttons */
.gmkb-lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 1000001;
  backdrop-filter: blur(10px);
}

.gmkb-lightbox-nav:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-50%) scale(1.1);
}

.gmkb-lightbox-nav:active {
  transform: translateY(-50%) scale(0.95);
}

.gmkb-lightbox-nav--prev {
  left: 20px;
}

.gmkb-lightbox-nav--next {
  right: 20px;
}

/* Content Container */
.gmkb-lightbox-content {
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: default;
  position: relative;
}

.gmkb-lightbox-image-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  max-width: 100%;
  max-height: 100%;
}

/* Image */
.gmkb-lightbox-image {
  max-width: 90vw;
  max-height: 80vh;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

/* Caption */
.gmkb-lightbox-caption {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 12px 24px;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  text-align: center;
  max-width: 600px;
}

/* Counter */
.gmkb-lightbox-counter {
  position: absolute;
  bottom: -48px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 8px 16px;
  border-radius: 20px;
  color: white;
  font-size: 13px;
  font-weight: 500;
}

/* Animations */
.lightbox-fade-enter-active,
.lightbox-fade-leave-active {
  transition: opacity 0.3s ease;
}

.lightbox-fade-enter-from,
.lightbox-fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .gmkb-lightbox-close {
    top: 10px;
    right: 10px;
    width: 40px;
    height: 40px;
  }

  .gmkb-lightbox-nav {
    width: 48px;
    height: 48px;
  }

  .gmkb-lightbox-nav--prev {
    left: 10px;
  }

  .gmkb-lightbox-nav--next {
    right: 10px;
  }

  .gmkb-lightbox-image {
    max-width: 95vw;
    max-height: 70vh;
  }

  .gmkb-lightbox-caption {
    font-size: 12px;
    padding: 8px 16px;
    max-width: 90vw;
  }
}
</style>
