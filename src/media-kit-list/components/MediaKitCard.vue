<template>
    <div class="gmkb-card gmkb-media-kit-card">
        <div class="gmkb-card-content">
            <!-- Header -->
            <div class="gmkb-card-header">
                <div class="gmkb-title-wrapper">
                    <div class="gmkb-icon-wrapper">
                        <svg xmlns="http://www.w3.org/2000/svg" class="gmkb-icon" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="3" y1="9" x2="21" y2="9"></line>
                            <line x1="9" y1="21" x2="9" y2="9"></line>
                        </svg>
                    </div>
                    <h3 class="gmkb-card-title">{{ mediakit.title }}</h3>
                </div>
                <div class="gmkb-card-meta">
                    <span class="gmkb-status-badge" :class="statusClass">{{ statusLabel }}</span>
                </div>
            </div>

            <!-- Info Row -->
            <div class="gmkb-card-info">
                <span class="gmkb-info-item">
                    <svg xmlns="http://www.w3.org/2000/svg" class="gmkb-info-icon" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="7" height="7"></rect>
                        <rect x="14" y="3" width="7" height="7"></rect>
                        <rect x="14" y="14" width="7" height="7"></rect>
                        <rect x="3" y="14" width="7" height="7"></rect>
                    </svg>
                    {{ mediakit.section_count }} sections
                </span>
                <span class="gmkb-info-item">
                    <svg xmlns="http://www.w3.org/2000/svg" class="gmkb-info-icon" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    {{ formattedDate }}
                </span>
            </div>

            <!-- Theme Badge -->
            <div class="gmkb-theme-row">
                <span class="gmkb-theme-badge">{{ themeLabel }}</span>
            </div>

            <!-- Footer -->
            <div class="gmkb-card-footer">
                <a :href="mediakit.editUrl" class="gmkb-edit-button">
                    Edit
                    <svg xmlns="http://www.w3.org/2000/svg" class="gmkb-button-icon" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </a>
                <a v-if="mediakit.status === 'publish'" :href="mediakit.viewUrl" target="_blank" class="gmkb-view-button">
                    View
                    <svg xmlns="http://www.w3.org/2000/svg" class="gmkb-button-icon" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                </a>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    mediakit: {
        type: Object,
        required: true,
    },
});

const emit = defineEmits(['delete']);

// Format date
const formattedDate = computed(() => {
    if (!props.mediakit.modified) return '';
    const date = new Date(props.mediakit.modified);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
});

// Status class and label
const statusClass = computed(() => {
    switch (props.mediakit.status) {
        case 'publish':
            return 'status-published';
        case 'draft':
            return 'status-draft';
        case 'private':
            return 'status-private';
        default:
            return 'status-draft';
    }
});

const statusLabel = computed(() => {
    switch (props.mediakit.status) {
        case 'publish':
            return 'Published';
        case 'draft':
            return 'Draft';
        case 'private':
            return 'Private';
        default:
            return 'Draft';
    }
});

// Theme label
const themeLabel = computed(() => {
    const theme = props.mediakit.theme || 'professional_clean';
    // Convert snake_case to Title Case
    return theme
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
});
</script>

<style scoped>
.gmkb-media-kit-card {
    flex: 1 0 calc(33.333% - 20px);
    max-width: calc(33.333% - 20px);
    margin: 10px;
    min-width: 280px;
    background-color: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    transition: all 0.2s ease;
}

.gmkb-media-kit-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    border-color: #cbd5e1;
}

.gmkb-card-content {
    padding: 16px;
    display: flex;
    flex-direction: column;
    height: 100%;
}

.gmkb-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
}

.gmkb-title-wrapper {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
}

.gmkb-icon-wrapper {
    background-color: #f1f5f9;
    padding: 8px;
    border-radius: 6px;
    margin-right: 12px;
    flex-shrink: 0;
}

.gmkb-icon {
    width: 16px;
    height: 16px;
    color: #516f90;
}

.gmkb-card-title {
    font-size: 15px;
    font-weight: 500;
    color: #334155;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.gmkb-card-meta {
    flex-shrink: 0;
    margin-left: 8px;
}

.gmkb-status-badge {
    display: inline-block;
    font-size: 11px;
    font-weight: 500;
    padding: 3px 8px;
    border-radius: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.status-published {
    background-color: #dcfce7;
    color: #166534;
}

.status-draft {
    background-color: #fef3c7;
    color: #92400e;
}

.status-private {
    background-color: #f3e8ff;
    color: #7c3aed;
}

.gmkb-card-info {
    display: flex;
    gap: 16px;
    margin-bottom: 12px;
}

.gmkb-info-item {
    display: flex;
    align-items: center;
    font-size: 13px;
    color: #64748b;
}

.gmkb-info-icon {
    width: 14px;
    height: 14px;
    margin-right: 4px;
    color: #94a3b8;
}

.gmkb-theme-row {
    margin-bottom: 12px;
}

.gmkb-theme-badge {
    display: inline-block;
    font-size: 12px;
    color: #64748b;
    background: #f1f5f9;
    padding: 4px 10px;
    border-radius: 4px;
}

.gmkb-card-footer {
    margin-top: auto;
    padding-top: 12px;
    border-top: 1px solid #f1f5f9;
    display: flex;
    gap: 12px;
}

.gmkb-edit-button,
.gmkb-view-button {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 500;
    text-decoration: none;
    padding: 6px 12px;
    border-radius: 6px;
    transition: all 0.2s ease;
}

.gmkb-edit-button {
    background: linear-gradient(135deg, #ED8936, #DD6B20);
    color: white;
    flex: 1;
}

.gmkb-edit-button:hover {
    background: linear-gradient(135deg, #DD6B20, #C05621);
    color: white;
    text-decoration: none;
}

.gmkb-view-button {
    background: #f1f5f9;
    color: #475569;
}

.gmkb-view-button:hover {
    background: #e2e8f0;
    color: #334155;
    text-decoration: none;
}

.gmkb-button-icon {
    margin-left: 4px;
    width: 14px;
    height: 14px;
}

/* Responsive */
@media (max-width: 1024px) {
    .gmkb-media-kit-card {
        flex: 1 0 calc(50% - 20px);
        max-width: calc(50% - 20px);
    }
}

@media (max-width: 768px) {
    .gmkb-media-kit-card {
        flex: 1 0 calc(100% - 20px);
        max-width: calc(100% - 20px);
    }
}
</style>
