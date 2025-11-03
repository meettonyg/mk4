<template>
  <div class="media-upload-button">
    <button
      type="button"
      @click="triggerUpload"
      :disabled="isUploading"
      class="upload-btn"
    >
      <template v-if="!isUploading">
        <slot name="icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
        </slot>
        <slot>{{ buttonText }}</slot>
      </template>
      <template v-else>
        <span class="uploading-text">{{ uploadingText }}...</span>
      </template>
    </button>
    
    <!-- Hidden file input -->
    <input
      ref="fileInput"
      type="file"
      :accept="accept"
      :multiple="multiple"
      @change="handleFileSelect"
      style="display: none"
    />
    
    <!-- Progress bar (optional) -->
    <div v-if="showProgress && uploadProgress > 0" class="upload-progress">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
      </div>
      <span class="progress-text">{{ uploadProgress }}%</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  buttonText: {
    type: String,
    default: 'Upload File'
  },
  uploadingText: {
    type: String,
    default: 'Uploading'
  },
  accept: {
    type: String,
    default: 'image/*'
  },
  multiple: {
    type: Boolean,
    default: false
  },
  showProgress: {
    type: Boolean,
    default: true
  },
  apiEndpoint: {
    type: String,
    default: '/wp-json/wp/v2/media'
  }
});

const emit = defineEmits(['uploaded', 'error', 'progress']);

// State
const fileInput = ref(null);
const isUploading = ref(false);
const uploadProgress = ref(0);

// Trigger file selection
function triggerUpload() {
  if (fileInput.value && !isUploading.value) {
    fileInput.value.click();
  }
}

// Handle file selection
async function handleFileSelect(event) {
  const files = event.target.files;
  if (!files || files.length === 0) return;
  
  // Reset file input for next selection
  event.target.value = '';
  
  // Upload files
  if (props.multiple) {
    await uploadMultiple(Array.from(files));
  } else {
    await uploadSingle(files[0]);
  }
}

// Upload single file
async function uploadSingle(file) {
  isUploading.value = true;
  uploadProgress.value = 0;
  
  try {
    // Create FormData
    const formData = new FormData();
    formData.append('file', file);
    
    // Get nonce from window.gmkbData
    const nonce = window.gmkbData?.restNonce || '';
    
    // Create XMLHttpRequest for progress tracking
    const xhr = new XMLHttpRequest();
    
    // Track upload progress
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percentComplete = Math.round((e.loaded / e.total) * 100);
        uploadProgress.value = percentComplete;
        emit('progress', percentComplete);
      }
    });
    
    // Create promise for async/await
    const uploadPromise = new Promise((resolve, reject) => {
      xhr.onload = function() {
        if (xhr.status === 200 || xhr.status === 201) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (e) {
            reject(new Error('Invalid server response'));
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      };
      
      xhr.onerror = function() {
        reject(new Error('Network error during upload'));
      };
      
      xhr.ontimeout = function() {
        reject(new Error('Upload timed out'));
      };
    });
    
    // Open connection and set headers
    xhr.open('POST', props.apiEndpoint);
    xhr.setRequestHeader('X-WP-Nonce', nonce);
    xhr.timeout = 60000; // 60 second timeout
    
    // Send the request
    xhr.send(formData);
    
    // Wait for upload to complete
    const response = await uploadPromise;
    
    // Format response
    const attachment = {
      id: response.id,
      url: response.source_url || response.url,
      alt: response.alt_text || '',
      title: response.title?.rendered || response.title || file.name,
      caption: response.caption?.rendered || response.caption || '',
      mime: response.mime_type || file.type,
      size: response.media_details?.filesize || file.size,
      width: response.media_details?.width || null,
      height: response.media_details?.height || null,
      sizes: response.media_details?.sizes || {}
    };
    
    // Emit success
    emit('uploaded', attachment);
    
    // Return for direct usage
    return attachment;
    
  } catch (error) {
    console.error('Upload failed:', error);
    emit('error', error);
    throw error;
    
  } finally {
    isUploading.value = false;
    uploadProgress.value = 0;
  }
}

// Upload multiple files
async function uploadMultiple(files) {
  const results = [];
  
  for (const file of files) {
    try {
      const attachment = await uploadSingle(file);
      results.push(attachment);
    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error);
      // Continue with other files
    }
  }
  
  if (results.length > 0) {
    emit('uploaded', results);
  }
  
  return results;
}

// Expose methods for parent components
defineExpose({
  triggerUpload,
  uploadSingle,
  uploadMultiple
});
</script>

<style scoped>
.media-upload-button {
  display: inline-block;
  position: relative;
}

.upload-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  line-height: 1;
}

.upload-btn:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(59, 130, 246, 0.25);
}

.upload-btn:active:not(:disabled) {
  transform: translateY(0);
}

.upload-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.upload-btn svg {
  flex-shrink: 0;
}

.uploading-text {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.uploading-text::after {
  content: '';
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.upload-progress {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
  max-width: 200px;
}

.progress-fill {
  height: 100%;
  background: #3b82f6;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: #6b7280;
  min-width: 35px;
  text-align: right;
}

/* Dark mode support */
body.dark-mode .upload-btn {
  background: #2563eb;
}

body.dark-mode .upload-btn:hover:not(:disabled) {
  background: #1d4ed8;
}

body.dark-mode .progress-bar {
  background: #374151;
}

body.dark-mode .progress-text {
  color: #9ca3af;
}
</style>
