<template>
  <div class="modern-media-library">
    <!-- Upload Button -->
    <button 
      @click="openUploader" 
      class="upload-button"
      :disabled="isUploading"
    >
      <svg v-if="!isUploading" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
      </svg>
      <span v-if="isUploading">Uploading...</span>
      <span v-else>{{ buttonText }}</span>
    </button>

    <!-- Hidden File Input -->
    <input 
      ref="fileInput"
      type="file"
      :accept="accept"
      :multiple="multiple"
      @change="handleFileSelect"
      style="display: none"
    />

    <!-- Upload Progress -->
    <div v-if="isUploading && uploadProgress > 0" class="upload-progress">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
      </div>
      <span>{{ uploadProgress }}%</span>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  buttonText: {
    type: String,
    default: 'Upload Media'
  },
  accept: {
    type: String,
    default: 'image/*'
  },
  multiple: {
    type: Boolean,
    default: false
  },
  apiUrl: {
    type: String,
    default: '/wp-json/wp/v2/media'
  }
});

const emit = defineEmits(['selected', 'uploaded', 'error']);

// State
const fileInput = ref(null);
const isUploading = ref(false);
const uploadProgress = ref(0);
const error = ref(null);

// Open file uploader
function openUploader() {
  if (fileInput.value) {
    fileInput.value.click();
  }
}

// Handle file selection
async function handleFileSelect(event) {
  const files = event.target.files;
  if (!files || files.length === 0) return;
  
  await uploadFiles(Array.from(files));
}

// Upload files to WordPress
async function uploadFiles(files) {
  isUploading.value = true;
  uploadProgress.value = 0;
  error.value = null;
  
  try {
    const uploaded = [];
    const totalFiles = files.length;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file type
      if (props.accept !== '*' && !file.type.match(props.accept.replace('*', '.*'))) {
        throw new Error(`Invalid file type: ${file.type}`);
      }
      
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      
      // Get REST nonce
      const restNonce = window.gmkbData?.restNonce || '';
      
      // Upload via REST API
      const response = await fetch(props.apiUrl, {
        method: 'POST',
        headers: {
          'X-WP-Nonce': restNonce
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      const attachment = await response.json();
      uploaded.push({
        id: attachment.id,
        url: attachment.source_url,
        alt: attachment.alt_text || '',
        title: attachment.title?.rendered || '',
        caption: attachment.caption?.rendered || '',
        thumbnail: attachment.media_details?.sizes?.thumbnail?.source_url || attachment.source_url
      });
      
      // Update progress
      uploadProgress.value = Math.round(((i + 1) / totalFiles) * 100);
    }
    
    // Emit results
    emit('uploaded', uploaded);
    
    if (props.multiple) {
      emit('selected', uploaded);
    } else {
      emit('selected', uploaded[0]);
    }
    
  } catch (err) {
    error.value = err.message;
    emit('error', err);
  } finally {
    isUploading.value = false;
    uploadProgress.value = 0;
  }
}

// Expose methods
defineExpose({
  openUploader,
  uploadFiles
});
</script>

<style scoped>
.modern-media-library {
  position: relative;
}

.upload-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #2271b1;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.upload-button:hover:not(:disabled) {
  background: #135e96;
}

.upload-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.upload-progress {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: #f0f0f1;
  border-radius: 3px;
  overflow: hidden;
  max-width: 300px;
}

.progress-fill {
  height: 100%;
  background: #2271b1;
  transition: width 0.3s ease;
}

.error-message {
  margin-top: 8px;
  padding: 8px 12px;
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  font-size: 13px;
}
</style>
