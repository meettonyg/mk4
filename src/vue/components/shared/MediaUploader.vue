<template>
  <div class="gmkb-media-uploader">
    <button
      v-if="!showGallery"
      type="button"
      class="gmkb-media-uploader__trigger"
      @click="openGallery"
    >
      <slot name="trigger">
        <i class="fa fa-image"></i>
        {{ label }}
      </slot>
    </button>

    <Teleport to="body">
      <div v-if="showGallery" class="gmkb-media-uploader__overlay" @click="closeGallery">
        <div class="gmkb-media-uploader__modal" @click.stop>
          <div class="gmkb-media-uploader__tabs">
            <button
              type="button"
              class="gmkb-media-uploader__tab"
              :class="{ 'gmkb-media-uploader__tab--active': activeTab === 'upload' }"
              @click="activeTab = 'upload'"
            >
              <i class="fa fa-upload"></i>
              Upload Files
            </button>
            <button
              type="button"
              class="gmkb-media-uploader__tab"
              :class="{ 'gmkb-media-uploader__tab--active': activeTab === 'gallery' }"
              @click="activeTab = 'gallery'"
            >
              <i class="fa fa-images"></i>
              Media Library
            </button>
          </div>

          <div v-if="activeTab === 'upload'" class="gmkb-media-uploader__content">
            <div
              class="gmkb-media-uploader__dropzone"
              :class="{
                'gmkb-media-uploader__dropzone--dragover': isDragging,
                'gmkb-media-uploader__dropzone--uploading': uploading
              }"
              @dragenter.prevent="handleDragEnter"
              @dragover.prevent="handleDragOver"
              @dragleave.prevent="handleDragLeave"
              @drop.prevent="handleDrop"
              @click="triggerFileInput"
            >
              <input
                ref="fileInput"
                type="file"
                :accept="acceptedTypes.join(',')"
                :multiple="multiple"
                style="display: none"
                @change="handleFileSelect"
              />

              <div v-if="!uploading" class="gmkb-media-uploader__dropzone-content">
                <i class="fa fa-cloud-upload-alt"></i>
                <h3>Drag & Drop Files Here</h3>
                <p>or click to browse</p>
                <p class="gmkb-media-uploader__dropzone-hint">
                  Accepts: {{ acceptedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ') }}
                  <br />
                  Max size: {{ maxSizeMB }}MB {{ multiple ? '• Multiple files allowed' : '' }}
                </p>
              </div>

              <div v-else class="gmkb-media-uploader__upload-status">
                <div class="gmkb-media-uploader__spinner"></div>
                <h3>Uploading...</h3>
                <div class="gmkb-media-uploader__progress-bar">
                  <div
                    class="gmkb-media-uploader__progress-fill"
                    :style="{ width: `${uploadProgress}%` }"
                  ></div>
                </div>
                <p>{{ uploadProgress }}% complete</p>
              </div>
            </div>

            <div v-if="uploadError" class="gmkb-media-uploader__error">
              <i class="fa fa-exclamation-triangle"></i>
              {{ uploadError }}
            </div>

            <div v-if="uploadedFiles.length > 0" class="gmkb-media-uploader__recent">
              <h4>Recently Uploaded</h4>
              <div class="gmkb-media-uploader__recent-grid">
                <div
                  v-for="file in uploadedFiles"
                  :key="file.id"
                  class="gmkb-media-uploader__recent-item"
                  @click="selectUploadedFile(file)"
                >
                  <img :src="file.thumbnail || file.url" :alt="file.title" />
                  <p>{{ file.title }}</p>
                  <i class="fa fa-check-circle"></i>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="activeTab === 'gallery'" class="gmkb-media-uploader__content">
            <MediaGallery
              :multiple="multiple"
              :selected-ids="selectedIds"
              :allowed-types="acceptedTypes"
              @select="handleGallerySelect"
              @close="closeGallery"
            />
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useMediaUpload } from '@/composables/useMediaUpload';
import MediaGallery from './MediaGallery.vue';

const props = defineProps({
  label: {
    type: String,
    default: 'Select Image'
  },
  multiple: {
    type: Boolean,
    default: false
  },
  acceptedTypes: {
    type: Array,
    default: () => ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  },
  maxSize: {
    type: Number,
    default: 10 * 1024 * 1024
  },
  selectedIds: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['select']);

const {
  uploading,
  uploadProgress,
  uploadError,
  uploadedFiles,
  uploadFiles
} = useMediaUpload();

const showGallery = ref(false);
const activeTab = ref('upload');
const isDragging = ref(false);
const dragCounter = ref(0);
const fileInput = ref(null);

const maxSizeMB = computed(() => Math.round(props.maxSize / 1024 / 1024));

function openGallery() {
  showGallery.value = true;
  activeTab.value = 'upload';
}

function closeGallery() {
  showGallery.value = false;
  isDragging.value = false;
  dragCounter.value = 0;
}

function triggerFileInput() {
  if (!uploading.value && fileInput.value) {
    fileInput.value.click();
  }
}

async function handleFileSelect(event) {
  const files = event.target.files;
  if (files && files.length > 0) {
    await processFiles(files);
  }
  
  if (fileInput.value) {
    fileInput.value.value = '';
  }
}

function handleDragEnter(event) {
  dragCounter.value++;
  isDragging.value = true;
}

function handleDragOver(event) {
  event.dataTransfer.dropEffect = 'copy';
}

function handleDragLeave(event) {
  dragCounter.value--;
  if (dragCounter.value === 0) {
    isDragging.value = false;
  }
}

async function handleDrop(event) {
  dragCounter.value = 0;
  isDragging.value = false;

  const files = event.dataTransfer.files;
  if (files && files.length > 0) {
    await processFiles(files);
  }
}

async function processFiles(files) {
  try {
    const uploaded = await uploadFiles(files, {
      multiple: props.multiple,
      allowedTypes: props.acceptedTypes,
      maxSize: props.maxSize
    });

    console.log(`✅ Successfully uploaded ${uploaded.length} file(s)`);

    if (!props.multiple && uploaded.length > 0) {
      emit('select', uploaded[0]);
      closeGallery();
    }
  } catch (error) {
    console.error('Upload failed:', error);
  }
}

function selectUploadedFile(file) {
  emit('select', file);
  if (!props.multiple) {
    closeGallery();
  }
}

function handleGallerySelect(selected) {
  emit('select', selected);
  closeGallery();
}

defineExpose({
  openGallery,
  closeGallery
});
</script>

<style scoped>
.gmkb-media-uploader__trigger {
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.gmkb-media-uploader__trigger:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.gmkb-media-uploader__overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.gmkb-media-uploader__modal {
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.gmkb-media-uploader__tabs {
  display: flex;
  border-bottom: 2px solid #e0e0e0;
}

.gmkb-media-uploader__tab {
  flex: 1;
  padding: 15px 20px;
  background: #f9f9f9;
  border: none;
  border-bottom: 3px solid transparent;
  font-size: 15px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.gmkb-media-uploader__tab:hover {
  background: #f0f0f0;
  color: #333;
}

.gmkb-media-uploader__tab--active {
  background: #fff;
  color: #667eea;
  border-bottom-color: #667eea;
}

.gmkb-media-uploader__content {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
}

.gmkb-media-uploader__dropzone {
  border: 3px dashed #ddd;
  border-radius: 12px;
  padding: 60px 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
}

.gmkb-media-uploader__dropzone:hover {
  border-color: #667eea;
  background: #f5f7ff;
}

.gmkb-media-uploader__dropzone--dragover {
  border-color: #667eea;
  background: #f0f4ff;
  transform: scale(1.02);
}

.gmkb-media-uploader__dropzone--uploading {
  border-style: solid;
  border-color: #667eea;
  background: #f9f9f9;
  cursor: not-allowed;
}

.gmkb-media-uploader__dropzone-content i {
  font-size: 64px;
  color: #667eea;
  margin-bottom: 20px;
  display: block;
}

.gmkb-media-uploader__dropzone-content h3 {
  margin: 0 0 10px 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.gmkb-media-uploader__dropzone-content p {
  margin: 0;
  font-size: 16px;
  color: #666;
}

.gmkb-media-uploader__dropzone-hint {
  margin-top: 20px !important;
  font-size: 13px !important;
  color: #999 !important;
}

.gmkb-media-uploader__upload-status {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.gmkb-media-uploader__spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.gmkb-media-uploader__upload-status h3 {
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.gmkb-media-uploader__progress-bar {
  width: 100%;
  max-width: 400px;
  height: 12px;
  background: #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 10px;
}

.gmkb-media-uploader__progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.gmkb-media-uploader__upload-status p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.gmkb-media-uploader__error {
  margin-top: 20px;
  padding: 15px 20px;
  background: #fee;
  color: #c33;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.gmkb-media-uploader__recent {
  margin-top: 30px;
  padding-top: 30px;
  border-top: 2px solid #e0e0e0;
}

.gmkb-media-uploader__recent h4 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.gmkb-media-uploader__recent-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
}

.gmkb-media-uploader__recent-item {
  position: relative;
  background: #f9f9f9;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
}

.gmkb-media-uploader__recent-item:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.gmkb-media-uploader__recent-item img {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.gmkb-media-uploader__recent-item p {
  margin: 0;
  padding: 8px;
  font-size: 12px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gmkb-media-uploader__recent-item i {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 20px;
  color: #4caf50;
  background: #fff;
  border-radius: 50%;
}

@media (max-width: 768px) {
  .gmkb-media-uploader__modal {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }

  .gmkb-media-uploader__content {
    padding: 20px;
  }

  .gmkb-media-uploader__dropzone {
    padding: 40px 20px;
  }

  .gmkb-media-uploader__recent-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}
</style>
