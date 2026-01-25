<template>
  <div class="brand-kits-app">
    <!-- Header -->
    <div class="app-header">
      <div class="header-content">
        <h1>Brand Kits</h1>
        <p class="header-description">
          Create and manage your brand kits with colors, fonts, and media assets.
        </p>
      </div>
      <button class="btn btn-primary" @click="createNewBrandKit">
        + New Brand Kit
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="store.isLoading && !store.brandKits.length" class="loading-state">
      <div class="spinner"></div>
      <p>Loading brand kits...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="store.error" class="error-state">
      <p>{{ store.error }}</p>
      <button class="btn btn-secondary" @click="store.clearError">Dismiss</button>
    </div>

    <!-- Brand Kits Grid -->
    <div v-else-if="store.brandKits.length > 0" class="brand-kits-grid">
      <div
        v-for="kit in store.brandKits"
        :key="kit.id"
        class="brand-kit-card"
        @click="openBrandKit(kit.id)"
      >
        <div class="card-preview" :style="getCardStyle(kit)">
          <div class="preview-colors">
            <span class="color-dot" :style="{ backgroundColor: kit.color_primary || '#3b82f6' }"></span>
            <span class="color-dot" :style="{ backgroundColor: kit.color_secondary || '#2563eb' }"></span>
            <span class="color-dot" :style="{ backgroundColor: kit.color_accent || '#f59e0b' }"></span>
          </div>
        </div>
        <div class="card-content">
          <h3 class="card-title">{{ kit.name || 'Untitled Brand Kit' }}</h3>
          <div class="card-meta">
            <span v-if="kit.font_primary" class="meta-font">{{ kit.font_primary }}</span>
            <span class="meta-date">{{ formatDate(kit.modified) }}</span>
          </div>
        </div>
        <div class="card-actions">
          <button class="action-btn edit" @click.stop="openBrandKit(kit.id)" title="Edit">
            Edit
          </button>
          <button class="action-btn delete" @click.stop="confirmDelete(kit)" title="Delete">
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">🎨</div>
      <h2>No Brand Kits Yet</h2>
      <p>Create your first brand kit to define your colors, fonts, and media assets.</p>
      <button class="btn btn-primary" @click="createNewBrandKit">
        + Create Brand Kit
      </button>
    </div>

    <!-- Brand Kit Editor Modal -->
    <Teleport to="body">
      <div v-if="showEditor" class="editor-modal">
        <div class="modal-backdrop" @click="closeEditor"></div>
        <div class="modal-content">
          <BrandKitEditor
            :brand-kit-id="editingBrandKitId"
            :mode="editorMode"
            @close="closeEditor"
            @saved="onEditorSaved"
          />
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div v-if="showDeleteConfirm" class="confirm-modal">
        <div class="modal-backdrop" @click="cancelDelete"></div>
        <div class="confirm-dialog">
          <h3>Delete Brand Kit</h3>
          <p>Are you sure you want to delete "{{ deletingBrandKit?.name || 'Untitled' }}"? This action cannot be undone.</p>
          <div class="confirm-actions">
            <button class="btn btn-secondary" @click="cancelDelete">Cancel</button>
            <button class="btn btn-danger" @click="executeDelete" :disabled="isDeleting">
              {{ isDeleting ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useBrandKitStore } from '../stores/brandKit.js';
import BrandKitEditor from './components/BrandKitEditor.vue';

const props = defineProps({
  initialBrandKitId: {
    type: Number,
    default: null,
  },
});

const store = useBrandKitStore();

// Editor state
const showEditor = ref(false);
const editingBrandKitId = ref(null);
const editorMode = ref('edit');

// Delete confirmation state
const showDeleteConfirm = ref(false);
const deletingBrandKit = ref(null);
const isDeleting = ref(false);

// Methods
const createNewBrandKit = () => {
  editingBrandKitId.value = null;
  editorMode.value = 'create';
  showEditor.value = true;
};

const openBrandKit = async (id) => {
  editingBrandKitId.value = id;
  editorMode.value = 'edit';
  await store.loadBrandKit(id);
  showEditor.value = true;
};

const closeEditor = () => {
  showEditor.value = false;
  editingBrandKitId.value = null;
};

const onEditorSaved = async () => {
  closeEditor();
  await store.loadBrandKits(true);
};

const confirmDelete = (kit) => {
  deletingBrandKit.value = kit;
  showDeleteConfirm.value = true;
};

const cancelDelete = () => {
  showDeleteConfirm.value = false;
  deletingBrandKit.value = null;
};

const executeDelete = async () => {
  if (!deletingBrandKit.value) return;

  isDeleting.value = true;
  try {
    await store.deleteBrandKit(deletingBrandKit.value.id);
    showDeleteConfirm.value = false;
    deletingBrandKit.value = null;
  } catch (err) {
    console.error('Failed to delete brand kit:', err);
  } finally {
    isDeleting.value = false;
  }
};

const getCardStyle = (kit) => {
  return {
    backgroundColor: kit.color_background || '#ffffff',
  };
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Initialize
onMounted(async () => {
  await store.loadBrandKits();

  // If initial brand kit ID provided, open it
  if (props.initialBrandKitId) {
    openBrandKit(props.initialBrandKitId);
  }
});
</script>

<style scoped>
.brand-kits-app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
}

/* Header */
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  gap: 24px;
}

.header-content h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
  color: #111827;
}

.header-description {
  margin: 0;
  font-size: 15px;
  color: #6b7280;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-secondary {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover:not(:disabled) {
  background: #f9fafb;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #dc2626;
}

/* Loading/Error States */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Brand Kits Grid */
.brand-kits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.brand-kit-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.15s;
}

.brand-kit-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.card-preview {
  height: 100px;
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  padding: 12px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.preview-colors {
  display: flex;
  gap: 6px;
}

.color-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-content {
  padding: 16px;
}

.card-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.card-meta {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: #6b7280;
}

.meta-font {
  font-style: italic;
}

.card-actions {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid #f3f4f6;
  background: #f9fafb;
}

.action-btn {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.action-btn.edit {
  background: #dbeafe;
  color: #1d4ed8;
}

.action-btn.edit:hover {
  background: #bfdbfe;
}

.action-btn.delete {
  background: #fee2e2;
  color: #b91c1c;
}

.action-btn.delete:hover {
  background: #fecaca;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: #f9fafb;
  border-radius: 12px;
  border: 2px dashed #e5e7eb;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.empty-state p {
  margin: 0 0 24px 0;
  font-size: 15px;
  color: #6b7280;
}

/* Editor Modal */
.editor-modal {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: relative;
  width: 90%;
  max-width: 1100px;
  height: 85vh;
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

/* Confirm Modal */
.confirm-modal {
  position: fixed;
  inset: 0;
  z-index: 10001;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirm-dialog {
  position: relative;
  width: 90%;
  max-width: 400px;
  background: white;
  border-radius: 12px;
  padding: 24px;
}

.confirm-dialog h3 {
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.confirm-dialog p {
  margin: 0 0 24px 0;
  font-size: 14px;
  color: #6b7280;
}

.confirm-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

/* Responsive */
@media (max-width: 640px) {
  .app-header {
    flex-direction: column;
    align-items: stretch;
  }

  .brand-kits-grid {
    grid-template-columns: 1fr;
  }
}
</style>
