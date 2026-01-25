<template>
    <div class="branding-tab">
        <!-- Brand Kit Selection Panel -->
        <div class="panel brand-kit-panel">
            <div class="panel-header">
                <h2 class="panel-title">Brand Kit</h2>
                <p class="panel-description">
                    Select or create a brand kit to define your colors, fonts, and media assets.
                </p>
            </div>
            <div class="panel-content">
                <BrandKitSelector
                    v-model="selectedBrandKitId"
                    @change="onBrandKitChange"
                />
            </div>
        </div>

        <!-- Brand Kit Preview (when a brand kit is selected) -->
        <template v-if="selectedBrandKit">
            <!-- Colors Preview -->
            <div class="panel">
                <div class="panel-header">
                    <h2 class="panel-title">Brand Colors</h2>
                    <button class="edit-link" @click="openEditor('colors')">
                        Edit in Brand Kit
                    </button>
                </div>
                <div class="panel-content">
                    <div class="color-grid">
                        <div
                            v-for="color in colorFields"
                            :key="color.key"
                            class="color-item"
                        >
                            <div
                                class="color-preview"
                                :style="{ backgroundColor: selectedBrandKit[color.key] || '#e2e8f0' }"
                            ></div>
                            <div class="color-details">
                                <span class="color-name">{{ color.label }}</span>
                                <span class="color-value">{{ selectedBrandKit[color.key] || '—' }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Fonts Preview -->
            <div class="panel">
                <div class="panel-header">
                    <h2 class="panel-title">Brand Fonts</h2>
                    <button class="edit-link" @click="openEditor('fonts')">
                        Edit in Brand Kit
                    </button>
                </div>
                <div class="panel-content">
                    <div class="fonts-display">
                        <div class="font-item">
                            <label class="font-label">Primary Font</label>
                            <div class="font-preview" :style="{ fontFamily: selectedBrandKit.font_primary || 'inherit' }">
                                {{ selectedBrandKit.font_primary || 'Not set' }}
                            </div>
                            <div
                                v-if="selectedBrandKit.font_primary"
                                class="font-sample"
                                :style="{ fontFamily: selectedBrandKit.font_primary }"
                            >
                                Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz
                            </div>
                        </div>
                        <div class="font-item">
                            <label class="font-label">Heading Font</label>
                            <div class="font-preview" :style="{ fontFamily: selectedBrandKit.font_heading || 'inherit' }">
                                {{ selectedBrandKit.font_heading || 'Not set' }}
                            </div>
                            <div
                                v-if="selectedBrandKit.font_heading"
                                class="font-sample"
                                :style="{ fontFamily: selectedBrandKit.font_heading }"
                            >
                                Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Media Preview -->
            <div class="panel">
                <div class="panel-header">
                    <h2 class="panel-title">Brand Media</h2>
                    <button class="edit-link" @click="openEditor('media')">
                        Edit in Brand Kit
                    </button>
                </div>
                <div class="panel-content">
                    <!-- Headshots -->
                    <div v-if="brandKitHeadshots.length" class="media-section">
                        <h4 class="media-section-title">Headshots</h4>
                        <div class="media-grid">
                            <div
                                v-for="headshot in brandKitHeadshots"
                                :key="headshot.id"
                                class="media-item"
                                :class="{ 'is-primary': headshot.is_primary }"
                            >
                                <img
                                    :src="headshot.sizes?.medium || headshot.url"
                                    :alt="headshot.label || 'Headshot'"
                                />
                                <span v-if="headshot.is_primary" class="primary-badge">Primary</span>
                            </div>
                        </div>
                    </div>

                    <!-- Logos -->
                    <div v-if="brandKitLogos.length" class="media-section">
                        <h4 class="media-section-title">Logos</h4>
                        <div class="media-grid logos-grid">
                            <div
                                v-for="logo in brandKitLogos"
                                :key="logo.id"
                                class="media-item logo-item"
                                :class="{ 'is-primary': logo.is_primary }"
                            >
                                <img
                                    :src="logo.sizes?.medium || logo.url"
                                    :alt="logo.label || 'Logo'"
                                />
                                <span v-if="logo.is_primary" class="primary-badge">Primary</span>
                            </div>
                        </div>
                    </div>

                    <!-- Photos -->
                    <div v-if="brandKitPhotos.length" class="media-section">
                        <h4 class="media-section-title">Photos</h4>
                        <div class="media-grid">
                            <div
                                v-for="photo in brandKitPhotos"
                                :key="photo.id"
                                class="media-item"
                            >
                                <img
                                    :src="photo.sizes?.thumbnail || photo.url"
                                    :alt="photo.label || 'Photo'"
                                />
                            </div>
                        </div>
                    </div>

                    <!-- Empty state -->
                    <div v-if="!hasAnyMedia" class="empty-media">
                        <span class="info-icon">i</span>
                        No media assets in this brand kit. Click "Edit in Brand Kit" to add headshots, logos, and photos.
                    </div>
                </div>
            </div>
        </template>

        <!-- No Brand Kit Selected -->
        <div v-else class="panel empty-brand-kit">
            <div class="panel-content">
                <div class="empty-state">
                    <div class="empty-icon">🎨</div>
                    <h3>No Brand Kit Selected</h3>
                    <p>Select a brand kit above to manage your brand colors, fonts, and media assets.</p>
                </div>
            </div>
        </div>

        <!-- Brand Kit Editor Modal -->
        <Teleport to="body">
            <div v-if="showEditor" class="editor-modal">
                <div class="modal-backdrop" @click="closeEditor"></div>
                <div class="modal-content">
                    <BrandKitEditor
                        :brand-kit-id="selectedBrandKitId"
                        mode="edit"
                        :initial-tab="editorInitialTab"
                        @close="closeEditor"
                        @saved="onEditorSaved"
                    />
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useProfileStore } from '../../stores/profile.js';
import { useBrandKitStore } from '../../../stores/brandKit.js';
import BrandKitSelector from '../../../brand-kits/components/BrandKitSelector.vue';
import BrandKitEditor from '../../../brand-kits/components/BrandKitEditor.vue';

const profileStore = useProfileStore();
const brandKitStore = useBrandKitStore();

// Brand kit selection
const selectedBrandKitId = ref(null);
const showEditor = ref(false);
const editorInitialTab = ref('colors');

// Color field definitions (matching new Brand Kit schema)
const colorFields = [
    { key: 'color_primary', label: 'Primary Color' },
    { key: 'color_secondary', label: 'Secondary Color' },
    { key: 'color_accent', label: 'Accent Color' },
    { key: 'color_background', label: 'Background Color' },
    { key: 'color_surface', label: 'Surface Color' },
    { key: 'color_text', label: 'Text Color' },
    { key: 'color_text_muted', label: 'Muted Text' },
    { key: 'color_link', label: 'Link Color' },
];

// Selected brand kit data
const selectedBrandKit = computed(() => {
    if (!selectedBrandKitId.value) return null;
    return brandKitStore.getBrandKitById(selectedBrandKitId.value);
});

// Media from brand kit
const brandKitHeadshots = computed(() => {
    if (!selectedBrandKit.value?.media) return [];
    return selectedBrandKit.value.media.filter(m => m.category === 'headshot');
});

const brandKitLogos = computed(() => {
    if (!selectedBrandKit.value?.media) return [];
    return selectedBrandKit.value.media.filter(m => m.category === 'logo');
});

const brandKitPhotos = computed(() => {
    if (!selectedBrandKit.value?.media) return [];
    return selectedBrandKit.value.media.filter(m => m.category === 'photo');
});

const hasAnyMedia = computed(() => {
    return brandKitHeadshots.value.length > 0 ||
           brandKitLogos.value.length > 0 ||
           brandKitPhotos.value.length > 0;
});

// Methods
const onBrandKitChange = async (brandKitId) => {
    // Save brand_kit_id to profile
    profileStore.updateField('brand_kit_id', brandKitId);
    await profileStore.saveFields(['brand_kit_id']);

    // Load full brand kit data if not already loaded
    if (brandKitId) {
        await brandKitStore.loadBrandKit(brandKitId);
    }
};

const openEditor = (tab) => {
    editorInitialTab.value = tab;
    showEditor.value = true;
};

const closeEditor = () => {
    showEditor.value = false;
};

const onEditorSaved = async () => {
    closeEditor();
    // Refresh brand kit data
    if (selectedBrandKitId.value) {
        await brandKitStore.loadBrandKit(selectedBrandKitId.value);
        await brandKitStore.loadBrandKits(true);
    }
};

// Initialize
onMounted(async () => {
    await brandKitStore.loadBrandKits();

    // Load existing brand_kit_id from profile
    if (profileStore.fields.brand_kit_id) {
        selectedBrandKitId.value = profileStore.fields.brand_kit_id;
        await brandKitStore.loadBrandKit(selectedBrandKitId.value);
    }
});

// Watch for external changes to brand_kit_id
watch(
    () => profileStore.fields.brand_kit_id,
    (newValue) => {
        if (newValue !== selectedBrandKitId.value) {
            selectedBrandKitId.value = newValue;
        }
    }
);
</script>

<style scoped>
.branding-tab {
    /* Uses parent padding */
}

/* Panel styles */
.panel {
    background-color: white;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    margin-bottom: 24px;
}

.panel-header {
    padding: 16px 20px;
    border-bottom: 1px solid #f1f5f9;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
}

.panel-title {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    color: #0f172a;
}

.panel-description {
    margin: 4px 0 0 0;
    font-size: 14px;
    color: #64748b;
    flex-basis: 100%;
}

.panel-content {
    padding: 20px;
}

/* Brand Kit Panel */
.brand-kit-panel .panel-header {
    flex-direction: column;
    align-items: flex-start;
}

/* Edit Link */
.edit-link {
    background: none;
    border: none;
    color: #3b82f6;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: background-color 0.2s;
}

.edit-link:hover {
    background-color: #eff6ff;
}

/* Color Grid */
.color-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
}

.color-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    background-color: white;
}

.color-preview {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(0, 0, 0, 0.05);
    flex-shrink: 0;
}

.color-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.color-name {
    font-size: 13px;
    font-weight: 500;
    color: #0f172a;
}

.color-value {
    font-size: 12px;
    color: #64748b;
    font-family: monospace;
}

/* Fonts Display */
.fonts-display {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.font-item {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
}

.font-label {
    display: block;
    padding: 10px 16px;
    font-size: 13px;
    font-weight: 500;
    background-color: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    color: #334155;
}

.font-preview {
    padding: 16px;
    font-size: 18px;
    color: #0f172a;
}

.font-sample {
    padding: 12px 16px;
    font-size: 14px;
    color: #64748b;
    border-top: 1px solid #f1f5f9;
    background: #fafafa;
    white-space: nowrap;
    overflow-x: auto;
}

/* Media Sections */
.media-section {
    margin-bottom: 24px;
}

.media-section:last-child {
    margin-bottom: 0;
}

.media-section-title {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: #334155;
}

.media-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}

.media-item {
    position: relative;
    width: 120px;
    height: 120px;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
}

.media-item.is-primary {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.media-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.logos-grid .media-item {
    background: #f8fafc;
}

.logos-grid .media-item img {
    object-fit: contain;
    padding: 8px;
}

.logo-item {
    width: 150px;
    height: 100px;
}

.primary-badge {
    position: absolute;
    bottom: 4px;
    left: 4px;
    background: #3b82f6;
    color: white;
    font-size: 10px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 4px;
}

.empty-media {
    color: #64748b;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.info-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    background: #e2e8f0;
    border-radius: 50%;
    font-size: 11px;
    font-weight: 600;
    color: #64748b;
}

/* Empty State */
.empty-brand-kit .panel-content {
    padding: 40px 20px;
}

.empty-state {
    text-align: center;
}

.empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
}

.empty-state h3 {
    margin: 0 0 8px 0;
    font-size: 18px;
    color: #0f172a;
}

.empty-state p {
    margin: 0;
    color: #64748b;
    font-size: 14px;
}

/* Buttons */
.btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 16px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-primary {
    background: #3b82f6;
    color: white;
}

.btn-primary:hover {
    background: #2563eb;
}

/* Editor Modal */
.editor-modal {
    position: fixed;
    inset: 0;
    z-index: 1000;
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
    max-width: 1200px;
    height: 90vh;
    background: white;
    border-radius: 16px;
    overflow: hidden;
}
</style>
