<template>
  <Teleport to="body">
    <Transition name="crop-fade">
      <div 
        v-if="isOpen" 
        class="gmkb-crop-overlay"
        @click="handleOverlayClick"
        @keydown.esc="cancel"
        tabindex="0"
        ref="overlayRef"
      >
        <div class="gmkb-crop-modal" @click.stop>
          <!-- Header -->
          <div class="gmkb-crop-header">
            <h3>Crop Image</h3>
            <button 
              class="gmkb-crop-close" 
              @click="cancel"
              aria-label="Cancel crop"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- Aspect Ratio Presets -->
          <div class="gmkb-crop-presets">
            <button 
              v-for="preset in aspectRatioPresets" 
              :key="preset.value"
              @click="setAspectRatio(preset.value)"
              :class="{ active: selectedAspectRatio === preset.value }"
              class="preset-btn"
            >
              {{ preset.label }}
            </button>
          </div>

          <!-- Crop Canvas Container -->
          <div class="gmkb-crop-container">
            <canvas 
              ref="canvasRef" 
              class="gmkb-crop-canvas"
              @mousedown="startDrag"
              @mousemove="drag"
              @mouseup="endDrag"
              @mouseleave="endDrag"
              @touchstart="startDrag"
              @touchmove="drag"
              @touchend="endDrag"
            ></canvas>
          </div>

          <!-- Actions -->
          <div class="gmkb-crop-actions">
            <button @click="cancel" class="btn-cancel">
              Cancel
            </button>
            <button @click="applyCrop" class="btn-apply" :disabled="isProcessing">
              {{ isProcessing ? 'Processing...' : 'Apply Crop' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  imageUrl: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['crop', 'cancel']);

const isOpen = ref(false);
const isProcessing = ref(false);
const overlayRef = ref(null);
const canvasRef = ref(null);

const image = ref(null);
const canvasContext = ref(null);

// Crop box state
const cropBox = ref({
  x: 0,
  y: 0,
  width: 200,
  height: 200
});

const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });
const dragType = ref(null);

// Aspect ratio presets
const aspectRatioPresets = [
  { label: 'Free', value: null },
  { label: 'Square', value: 1 },
  { label: '16:9', value: 16/9 },
  { label: '4:3', value: 4/3 },
  { label: '3:2', value: 3/2 }
];

const selectedAspectRatio = ref(null);

// Set aspect ratio
const setAspectRatio = (ratio) => {
  selectedAspectRatio.value = ratio;
  
  if (ratio && canvasRef.value) {
    const currentWidth = cropBox.value.width;
    cropBox.value.height = currentWidth / ratio;
    
    const maxHeight = canvasRef.value.height - cropBox.value.y;
    if (cropBox.value.height > maxHeight) {
      cropBox.value.height = maxHeight;
      cropBox.value.width = cropBox.value.height * ratio;
    }
    
    drawCanvas();
  }
};

// Load and draw image
const loadImage = () => {
  if (!props.imageUrl || !canvasRef.value) return;
  
  const img = new Image();
  img.crossOrigin = 'anonymous';
  
  img.onload = () => {
    image.value = img;
    
    const canvas = canvasRef.value;
    const container = canvas.parentElement;
    const maxWidth = container.clientWidth;
    const maxHeight = container.clientHeight;
    
    let canvasWidth = img.width;
    let canvasHeight = img.height;
    
    if (canvasWidth > maxWidth || canvasHeight > maxHeight) {
      const scale = Math.min(maxWidth / canvasWidth, maxHeight / canvasHeight);
      canvasWidth = canvasWidth * scale;
      canvasHeight = canvasHeight * scale;
    }
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    const cropWidth = canvasWidth * 0.8;
    const cropHeight = canvasHeight * 0.8;
    cropBox.value = {
      x: (canvasWidth - cropWidth) / 2,
      y: (canvasHeight - cropHeight) / 2,
      width: cropWidth,
      height: cropHeight
    };
    
    canvasContext.value = canvas.getContext('2d');
    drawCanvas();
  };
  
  img.onerror = () => {
    console.error('Failed to load image for cropping');
  };
  
  img.src = props.imageUrl;
};

// Draw canvas
const drawCanvas = () => {
  if (!canvasContext.value || !image.value || !canvasRef.value) return;
  
  const ctx = canvasContext.value;
  const canvas = canvasRef.value;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image.value, 0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.clearRect(cropBox.value.x, cropBox.value.y, cropBox.value.width, cropBox.value.height);
  ctx.drawImage(image.value, 0, 0, canvas.width, canvas.height);
  
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 2;
  ctx.strokeRect(cropBox.value.x, cropBox.value.y, cropBox.value.width, cropBox.value.height);
  
  const handleSize = 8;
  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(cropBox.value.x - handleSize/2, cropBox.value.y - handleSize/2, handleSize, handleSize);
  ctx.fillRect(cropBox.value.x + cropBox.value.width - handleSize/2, cropBox.value.y - handleSize/2, handleSize, handleSize);
  ctx.fillRect(cropBox.value.x - handleSize/2, cropBox.value.y + cropBox.value.height - handleSize/2, handleSize, handleSize);
  ctx.fillRect(cropBox.value.x + cropBox.value.width - handleSize/2, cropBox.value.y + cropBox.value.height - handleSize/2, handleSize, handleSize);
};

const getPosition = (e) => {
  const canvas = canvasRef.value;
  const rect = canvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  };
};

const getDragType = (pos) => {
  const handleSize = 12;
  const box = cropBox.value;
  
  if (Math.abs(pos.x - box.x) < handleSize && Math.abs(pos.y - box.y) < handleSize) return 'resize-nw';
  if (Math.abs(pos.x - (box.x + box.width)) < handleSize && Math.abs(pos.y - box.y) < handleSize) return 'resize-ne';
  if (Math.abs(pos.x - box.x) < handleSize && Math.abs(pos.y - (box.y + box.height)) < handleSize) return 'resize-sw';
  if (Math.abs(pos.x - (box.x + box.width)) < handleSize && Math.abs(pos.y - (box.y + box.height)) < handleSize) return 'resize-se';
  
  if (pos.x >= box.x && pos.x <= box.x + box.width && pos.y >= box.y && pos.y <= box.y + box.height) return 'move';
  return null;
};

const startDrag = (e) => {
  e.preventDefault();
  const pos = getPosition(e);
  dragType.value = getDragType(pos);
  if (dragType.value) {
    isDragging.value = true;
    dragStart.value = { x: pos.x, y: pos.y };
  }
};

const drag = (e) => {
  if (!isDragging.value || !dragType.value) return;
  e.preventDefault();
  
  const pos = getPosition(e);
  const dx = pos.x - dragStart.value.x;
  const dy = pos.y - dragStart.value.y;
  const canvas = canvasRef.value;
  const box = cropBox.value;
  
  if (dragType.value === 'move') {
    box.x = Math.max(0, Math.min(canvas.width - box.width, box.x + dx));
    box.y = Math.max(0, Math.min(canvas.height - box.height, box.y + dy));
  } else if (dragType.value === 'resize-se') {
    box.width = Math.max(50, Math.min(canvas.width - box.x, box.width + dx));
    if (selectedAspectRatio.value) {
      box.height = box.width / selectedAspectRatio.value;
    } else {
      box.height = Math.max(50, Math.min(canvas.height - box.y, box.height + dy));
    }
  }
  
  dragStart.value = { x: pos.x, y: pos.y };
  drawCanvas();
};

const endDrag = () => {
  isDragging.value = false;
  dragType.value = null;
};

const applyCrop = async () => {
  if (!image.value || !canvasRef.value || isProcessing.value) return;
  isProcessing.value = true;
  
  try {
    const cropCanvas = document.createElement('canvas');
    const cropCtx = cropCanvas.getContext('2d');
    
    const scaleX = image.value.width / canvasRef.value.width;
    const scaleY = image.value.height / canvasRef.value.height;
    
    const cropWidth = cropBox.value.width * scaleX;
    const cropHeight = cropBox.value.height * scaleY;
    cropCanvas.width = cropWidth;
    cropCanvas.height = cropHeight;
    
    cropCtx.drawImage(
      image.value,
      cropBox.value.x * scaleX,
      cropBox.value.y * scaleY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );
    
    cropCanvas.toBlob((blob) => {
      if (blob) {
        emit('crop', { blob, url: URL.createObjectURL(blob) });
        close();
      }
      isProcessing.value = false;
    }, 'image/jpeg', 0.95);
  } catch (error) {
    console.error('Error cropping image:', error);
    isProcessing.value = false;
  }
};

const cancel = () => {
  emit('cancel');
  close();
};

const close = () => {
  isOpen.value = false;
  image.value = null;
  cropBox.value = { x: 0, y: 0, width: 200, height: 200 };
  selectedAspectRatio.value = null;
};

const handleOverlayClick = (event) => {
  if (event.target === event.currentTarget) cancel();
};

const open = () => {
  isOpen.value = true;
  setTimeout(() => {
    loadImage();
    overlayRef.value?.focus();
  }, 100);
};

watch(() => props.imageUrl, () => {
  if (isOpen.value) loadImage();
});

defineExpose({ open, close });
</script>

<style>
.gmkb-crop-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 999999;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
}

.gmkb-crop-modal {
  background: white;
  border-radius: 12px;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.gmkb-crop-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.gmkb-crop-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.gmkb-crop-close {
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.gmkb-crop-close:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.gmkb-crop-presets {
  display: flex;
  gap: 8px;
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
  overflow-x: auto;
}

.preset-btn {
  padding: 8px 16px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  color: #6b7280;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.preset-btn:hover {
  background: #e5e7eb;
  border-color: #d1d5db;
  color: #374151;
}

.preset-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.gmkb-crop-container {
  padding: 24px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
  background: #f9fafb;
}

.gmkb-crop-canvas {
  max-width: 100%;
  max-height: 100%;
  cursor: crosshair;
  display: block;
}

.gmkb-crop-actions {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  justify-content: flex-end;
}

.btn-cancel,
.btn-apply {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-cancel {
  background: #f3f4f6;
  color: #6b7280;
}

.btn-cancel:hover {
  background: #e5e7eb;
  color: #374151;
}

.btn-apply {
  background: #3b82f6;
  color: white;
}

.btn-apply:hover:not(:disabled) {
  background: #2563eb;
}

.btn-apply:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.crop-fade-enter-active,
.crop-fade-leave-active {
  transition: opacity 0.3s ease;
}

.crop-fade-enter-from,
.crop-fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .gmkb-crop-modal {
    max-width: 95vw;
    max-height: 95vh;
  }
  
  .gmkb-crop-actions {
    flex-direction: column-reverse;
  }
  
  .btn-cancel,
  .btn-apply {
    width: 100%;
  }
}
</style>
