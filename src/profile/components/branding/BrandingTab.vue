<template>
    <div class="branding-tab">
        <!-- Headshots Panel -->
        <EditablePanel
            title="Headshots"
            section-id="headshots"
            :is-editing="editingSection === 'headshots'"
            :is-saving="isSaving"
            @edit="startEditing"
            @save="saveSection"
            @cancel="cancelEditing"
        >
            <template #display>
                <div class="headshots-grid">
                    <div class="headshot-item">
                        <figure>
                            <img
                                v-if="store.fields.headshot_primary?.url"
                                :src="store.fields.headshot_primary.sizes?.medium || store.fields.headshot_primary.url"
                                :alt="store.fields.headshot_primary.alt || 'Primary Headshot'"
                            />
                            <div v-else class="placeholder-image">
                                <span>📷</span>
                            </div>
                            <figcaption>Primary Headshot</figcaption>
                        </figure>
                    </div>
                    <div class="headshot-item">
                        <figure>
                            <img
                                v-if="store.fields.headshot_vertical?.url"
                                :src="store.fields.headshot_vertical.sizes?.medium || store.fields.headshot_vertical.url"
                                :alt="store.fields.headshot_vertical.alt || 'Vertical Headshot'"
                            />
                            <div v-else class="placeholder-image">
                                <span>📷</span>
                            </div>
                            <figcaption>Vertical Headshot</figcaption>
                        </figure>
                    </div>
                    <div class="headshot-item">
                        <figure>
                            <img
                                v-if="store.fields.headshot_horizontal?.url"
                                :src="store.fields.headshot_horizontal.sizes?.medium || store.fields.headshot_horizontal.url"
                                :alt="store.fields.headshot_horizontal.alt || 'Horizontal Headshot'"
                            />
                            <div v-else class="placeholder-image">
                                <span>📷</span>
                            </div>
                            <figcaption>Horizontal Headshot</figcaption>
                        </figure>
                    </div>
                </div>
            </template>

            <template #edit>
                <p class="edit-note">
                    To change headshots, use the WordPress Media Library.
                    Image uploads will be available in a future update.
                </p>
            </template>
        </EditablePanel>

        <!-- Logos Panel -->
        <EditablePanel
            title="Logos and Graphics"
            section-id="logos"
            :is-editing="editingSection === 'logos'"
            :is-saving="isSaving"
            @edit="startEditing"
            @save="saveSection"
            @cancel="cancelEditing"
        >
            <template #display>
                <div class="logos-grid">
                    <template v-if="store.fields.logos && store.fields.logos.length">
                        <div
                            v-for="logo in store.fields.logos"
                            :key="logo.id"
                            class="logo-item"
                        >
                            <img
                                :src="logo.sizes?.medium || logo.url"
                                :alt="logo.alt || 'Logo'"
                            />
                        </div>
                    </template>
                    <div v-else class="empty-text">
                        <span class="info-icon">ℹ</span>
                        Personalize your one sheet with your own unique branding.
                    </div>
                </div>
            </template>

            <template #edit>
                <p class="edit-note">
                    To change logos, use the WordPress Media Library.
                </p>
            </template>
        </EditablePanel>

        <!-- Brand Colors Panel -->
        <EditablePanel
            title="Brand Colors"
            section-id="colors"
            :is-editing="editingSection === 'colors'"
            :is-saving="isSaving"
            @edit="startEditing"
            @save="saveSection"
            @cancel="cancelEditing"
        >
            <template #display>
                <div class="color-grid">
                    <div
                        v-for="color in colorFields"
                        :key="color.key"
                        class="color-item"
                    >
                        <div
                            class="color-preview"
                            :style="{ backgroundColor: store.fields[color.key] || '#e2e8f0' }"
                        ></div>
                        <div class="color-details">
                            <span class="color-name">{{ color.label }}</span>
                            <span class="color-value">{{ store.fields[color.key] || '—' }}</span>
                        </div>
                    </div>
                </div>
            </template>

            <template #edit>
                <div class="color-edit-grid">
                    <div
                        v-for="color in colorFields"
                        :key="color.key"
                        class="form-group color-form-group"
                    >
                        <label class="form-label">{{ color.label }}</label>
                        <div class="color-input-group">
                            <input
                                type="color"
                                class="color-picker"
                                :value="editFields[color.key] || '#000000'"
                                @input="editFields[color.key] = $event.target.value"
                            />
                            <input
                                type="text"
                                class="form-input color-hex"
                                v-model="editFields[color.key]"
                                placeholder="#000000"
                            />
                        </div>
                    </div>
                </div>
            </template>
        </EditablePanel>

        <!-- Brand Fonts Panel -->
        <EditablePanel
            title="Brand Fonts"
            section-id="fonts"
            :is-editing="editingSection === 'fonts'"
            :is-saving="isSaving"
            @edit="startEditing"
            @save="saveSection"
            @cancel="cancelEditing"
        >
            <template #display>
                <div class="fonts-display">
                    <div class="font-item">
                        <label class="font-label">Primary Font</label>
                        <div class="font-preview" :style="{ fontFamily: store.fields.font_primary || 'inherit' }">
                            {{ store.fields.font_primary || 'Not set' }}
                        </div>
                        <div
                            v-if="store.fields.font_primary"
                            class="font-sample"
                            :style="{ fontFamily: store.fields.font_primary }"
                        >
                            Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz
                        </div>
                    </div>
                    <div class="font-item">
                        <label class="font-label">Secondary Font</label>
                        <div class="font-preview" :style="{ fontFamily: store.fields.font_secondary || 'inherit' }">
                            {{ store.fields.font_secondary || 'Not set' }}
                        </div>
                        <div
                            v-if="store.fields.font_secondary"
                            class="font-sample"
                            :style="{ fontFamily: store.fields.font_secondary }"
                        >
                            Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz
                        </div>
                    </div>
                </div>
            </template>

            <template #edit>
                <div class="form-group">
                    <label class="form-label">Primary Font</label>
                    <select class="form-input" v-model="editFields.font_primary">
                        <option value="">Select a font...</option>
                        <option v-for="font in googleFonts" :key="font" :value="font">
                            {{ font }}
                        </option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Secondary Font</label>
                    <select class="form-input" v-model="editFields.font_secondary">
                        <option value="">Select a font...</option>
                        <option v-for="font in googleFonts" :key="font" :value="font">
                            {{ font }}
                        </option>
                    </select>
                </div>
            </template>
        </EditablePanel>

        <!-- Carousel Images Panel -->
        <EditablePanel
            title="Carousel Images"
            section-id="carousel"
            :is-editing="editingSection === 'carousel'"
            :is-saving="isSaving"
            @edit="startEditing"
            @save="saveSection"
            @cancel="cancelEditing"
        >
            <template #display>
                <div class="carousel-grid">
                    <template v-if="store.fields.carousel_images && store.fields.carousel_images.length">
                        <div
                            v-for="image in store.fields.carousel_images"
                            :key="image.id"
                            class="carousel-item"
                        >
                            <img
                                :src="image.sizes?.thumbnail || image.url"
                                :alt="image.alt || 'Carousel image'"
                            />
                        </div>
                    </template>
                    <div v-else class="empty-text">
                        <span class="info-icon">ℹ</span>
                        Personalize your one sheet with a logo carousel
                    </div>
                </div>
            </template>

            <template #edit>
                <p class="edit-note">
                    To change carousel images, use the WordPress Media Library.
                </p>
            </template>
        </EditablePanel>

        <!-- Media Kit Layout Panel -->
        <div class="panel">
            <div class="panel-header">
                <h2 class="panel-title">Media Kit Layout</h2>
            </div>
            <div class="panel-content">
                <p class="layout-info">
                    <span class="info-icon">ℹ</span>
                    <a :href="layoutSelectorUrl" target="_blank">
                        Personalize your one sheet with your own unique layout.
                    </a>
                </p>
                <p v-if="currentLayout" class="layout-current">
                    Layout: <strong>{{ currentLayout }}</strong>
                </p>
                <p class="layout-action">
                    <a :href="layoutSelectorUrl" target="_blank" class="button secondary-button">
                        Change Layout
                    </a>
                </p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useProfileStore } from '../../stores/profile.js';
import EditablePanel from '../layout/EditablePanel.vue';

const store = useProfileStore();

// Layout selector URL with post ID
const layoutSelectorUrl = computed(() => {
    const postId = store.postId;
    if (postId) {
        return `/app/templates/designs/?pos=${postId}`;
    }
    return '/app/templates/designs/';
});

// Current layout name from taxonomies
const currentLayout = computed(() => {
    const layouts = store.taxonomies?.layout || [];
    if (layouts.length > 0) {
        return layouts[0].name;
    }
    return null;
});

// Edit state
const editingSection = ref(null);
const isSaving = ref(false);
const editFields = reactive({});

// Color fields
const colorFields = [
    { key: 'color_primary', label: 'Primary Color' },
    { key: 'color_accent', label: 'Secondary/Accent Color' },
    { key: 'color_contrasting', label: 'Contrasting Color' },
    { key: 'color_background', label: 'Background Color' },
    { key: 'color_header', label: 'Header Color' },
    { key: 'color_header_accent', label: 'Header Accent' },
    { key: 'color_header_text', label: 'Header Text' },
    { key: 'color_paragraph', label: 'Paragraph Text' },
];

// Popular Google Fonts
const googleFonts = [
    'Amiri',
    'Bonbon',
    'Lato',
    'Montserrat',
    'Open Sans',
    'Oswald',
    'Playfair Display',
    'Poppins',
    'Raleway',
    'Roboto',
    'Roboto Condensed',
    'Roboto Slab',
    'Source Sans Pro',
    'Ubuntu',
];

// Section field mappings
const sectionFields = {
    headshots: ['headshot_primary', 'headshot_vertical', 'headshot_horizontal'],
    logos: ['logos'],
    colors: colorFields.map((c) => c.key),
    fonts: ['font_primary', 'font_secondary'],
    carousel: ['carousel_images'],
};

// Methods
const startEditing = (sectionId) => {
    editingSection.value = sectionId;

    const fields = sectionFields[sectionId] || [];
    fields.forEach((field) => {
        editFields[field] = store.fields[field] || '';
    });
};

const cancelEditing = () => {
    editingSection.value = null;
    Object.keys(editFields).forEach((key) => {
        delete editFields[key];
    });
};

const saveSection = async (sectionId) => {
    isSaving.value = true;

    try {
        const fields = sectionFields[sectionId] || [];

        fields.forEach((field) => {
            if (editFields[field] !== undefined) {
                store.updateField(field, editFields[field]);
            }
        });

        const success = await store.saveFields(fields);

        if (success) {
            editingSection.value = null;
        }
    } finally {
        isSaving.value = false;
    }
};
</script>

<style scoped>
.branding-tab {
    /* Uses parent padding */
}

/* Headshots Grid */
.headshots-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
}

.headshot-item {
    text-align: center;
}

.headshot-item figure {
    margin: 0;
}

.headshot-item img {
    width: 200px;
    height: 200px;
    object-fit: contain;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.headshot-item figcaption {
    margin-top: 8px;
    font-size: 14px;
    color: #64748b;
}

.placeholder-image {
    width: 200px;
    height: 200px;
    background: #f1f5f9;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 48px;
    color: #94a3b8;
}

/* Logos Grid */
.logos-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
}

.logo-item img {
    max-width: 150px;
    max-height: 100px;
    object-fit: contain;
}

/* Color Grid */
.color-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
}

.color-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    background-color: white;
}

.color-preview {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(0, 0, 0, 0.05);
    flex-shrink: 0;
}

.color-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.color-name {
    font-size: 14px;
    font-weight: 500;
    color: #0f172a;
}

.color-value {
    font-size: 13px;
    color: #64748b;
    font-family: monospace;
}

/* Color Edit Grid */
.color-edit-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
}

.color-form-group {
    margin-bottom: 0;
}

.color-input-group {
    display: flex;
    gap: 8px;
}

.color-picker {
    width: 48px;
    height: 38px;
    padding: 2px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    cursor: pointer;
}

.color-hex {
    flex: 1;
    font-family: monospace;
}

/* Fonts Display */
.fonts-display {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.font-item {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
}

.font-label {
    display: block;
    padding: 12px 16px;
    font-size: 14px;
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
    padding: 16px;
    font-size: 14px;
    color: #64748b;
    border-top: 1px solid #f1f5f9;
    white-space: nowrap;
    overflow-x: auto;
}

/* Carousel Grid */
.carousel-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}

.carousel-item img {
    width: 100px;
    height: 75px;
    object-fit: contain;
    border-radius: 4px;
    border: 1px solid #e2e8f0;
}

/* Empty states */
.empty-text {
    color: #64748b;
    font-size: 14px;
}

.info-icon {
    margin-right: 4px;
}

/* Edit note */
.edit-note {
    color: #64748b;
    font-size: 14px;
    font-style: italic;
    margin: 0;
}

/* Form elements */
.form-group {
    margin-bottom: 16px;
}

.form-label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 6px;
    color: #334155;
}

.form-input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 14px;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
    outline: none;
    border-color: #14b8a6;
    box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
}

/* Panel styles (for Media Kit Layout) */
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
}

.panel-title {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    color: #0f172a;
}

.panel-content {
    padding: 20px;
}

/* Layout section styles */
.layout-info {
    margin: 0 0 12px 0;
    font-size: 14px;
    color: #64748b;
}

.layout-info a {
    color: #0284c7;
    text-decoration: none;
}

.layout-info a:hover {
    text-decoration: underline;
}

.layout-current {
    margin: 0 0 16px 0;
    font-size: 14px;
    color: #334155;
}

.layout-action {
    margin: 0;
}

.button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    text-decoration: none;
    border: none;
}

.secondary-button {
    background-color: white;
    color: #64748b;
    border: 1px solid #e2e8f0;
}

.secondary-button:hover {
    background-color: #f8fafc;
}
</style>
