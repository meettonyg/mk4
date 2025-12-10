<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="gmkb-ai-modal gmkb-ai-modal--open"
        @click.self="handleBackdropClick"
      >
        <div class="gmkb-ai-modal__container" :style="containerStyle">
          <!-- Header -->
          <div class="gmkb-ai-modal__header">
            <h3 class="gmkb-ai-modal__title">
              <slot name="title">{{ title }}</slot>
            </h3>
            <button
              type="button"
              class="gmkb-ai-modal__close"
              @click="close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="gmkb-ai-modal__body">
            <slot></slot>
          </div>

          <!-- Footer (optional) -->
          <div v-if="$slots.footer" class="gmkb-ai-modal__footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  /**
   * Modal visibility (v-model)
   */
  modelValue: {
    type: Boolean,
    default: false
  },

  /**
   * Modal title
   */
  title: {
    type: String,
    default: 'AI Generator'
  },

  /**
   * Modal width
   */
  width: {
    type: String,
    default: '600px'
  },

  /**
   * Max height of modal body
   */
  maxHeight: {
    type: String,
    default: 'calc(90vh - 140px)'
  },

  /**
   * Whether clicking backdrop closes modal
   */
  closeOnBackdrop: {
    type: Boolean,
    default: true
  },

  /**
   * Whether pressing Escape closes modal
   */
  closeOnEscape: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:modelValue', 'close']);

/**
 * Container inline styles
 */
const containerStyle = computed(() => ({
  maxWidth: props.width,
  '--modal-body-max-height': props.maxHeight
}));

/**
 * Close the modal
 */
const close = () => {
  emit('update:modelValue', false);
  emit('close');
};

/**
 * Handle backdrop click
 */
const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    close();
  }
};

/**
 * Handle Escape key
 */
const handleKeydown = (event) => {
  if (event.key === 'Escape' && props.closeOnEscape && props.modelValue) {
    close();
  }
};

/**
 * Prevent body scroll when modal is open
 */
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
  document.body.style.overflow = '';
});
</script>

<style scoped>
.gmkb-ai-modal {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1000;
}

.gmkb-ai-modal__container {
  width: 100%;
  background: var(--gmkb-ai-bg, #ffffff);
  border-radius: var(--gmkb-ai-radius-lg, 12px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

body.dark-mode .gmkb-ai-modal__container {
  background: #1e293b;
}

.gmkb-ai-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid var(--gmkb-ai-border, #e5e7eb);
}

body.dark-mode .gmkb-ai-modal__header {
  border-bottom-color: #334155;
}

.gmkb-ai-modal__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--gmkb-ai-text, #1f2937);
}

body.dark-mode .gmkb-ai-modal__title {
  color: #f1f5f9;
}

.gmkb-ai-modal__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  color: var(--gmkb-ai-text-secondary, #64748b);
  background: transparent;
  border: none;
  border-radius: var(--gmkb-ai-radius-md, 8px);
  cursor: pointer;
  transition: all 0.15s ease;
}

.gmkb-ai-modal__close:hover {
  color: var(--gmkb-ai-text, #1f2937);
  background: var(--gmkb-ai-bg-tertiary, #f3f4f6);
}

body.dark-mode .gmkb-ai-modal__close:hover {
  color: #f1f5f9;
  background: #334155;
}

.gmkb-ai-modal__body {
  padding: 24px;
  overflow-y: auto;
  max-height: var(--modal-body-max-height, calc(90vh - 140px));
}

.gmkb-ai-modal__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--gmkb-ai-border, #e5e7eb);
  background: var(--gmkb-ai-bg-secondary, #f8fafc);
}

body.dark-mode .gmkb-ai-modal__footer {
  border-top-color: #334155;
  background: #0f172a;
}

/* Transition animations */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .gmkb-ai-modal__container,
.modal-leave-active .gmkb-ai-modal__container {
  transition: transform 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .gmkb-ai-modal__container,
.modal-leave-to .gmkb-ai-modal__container {
  transform: scale(0.95);
}
</style>
