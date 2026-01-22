<template>
    <div class="pit-table-container">
        <table class="pit-table">
            <thead>
                <tr>
                    <th class="pit-th">Media Kit</th>
                    <th class="pit-th">Status</th>
                    <th class="pit-th">Theme</th>
                    <th class="pit-th">Sections</th>
                    <th class="pit-th">Last Modified</th>
                    <th class="pit-th pit-th-actions">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for="mediakit in mediakits"
                    :key="mediakit.id"
                    class="pit-row"
                >
                    <td class="pit-td pit-td-title">
                        <div class="pit-title-cell">
                            <div class="pit-icon-wrapper">
                                <svg xmlns="http://www.w3.org/2000/svg" class="pit-icon" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="3" y1="9" x2="21" y2="9"></line>
                                    <line x1="9" y1="21" x2="9" y2="9"></line>
                                </svg>
                            </div>
                            <span class="pit-title-text">{{ mediakit.title }}</span>
                        </div>
                    </td>
                    <td class="pit-td pit-td-status">
                        <span class="pit-status-badge" :class="getStatusClass(mediakit.status)">
                            {{ getStatusLabel(mediakit.status) }}
                        </span>
                    </td>
                    <td class="pit-td pit-td-theme">
                        <span class="pit-theme-badge">{{ formatTheme(mediakit.theme) }}</span>
                    </td>
                    <td class="pit-td pit-td-sections">
                        {{ mediakit.section_count }} sections
                    </td>
                    <td class="pit-td pit-td-date">
                        {{ formatDate(mediakit.modified) }}
                    </td>
                    <td class="pit-td pit-td-actions">
                        <div class="pit-actions-group">
                            <a :href="mediakit.editUrl" class="pit-action-btn pit-action-primary">
                                Edit
                            </a>
                            <a
                                v-if="mediakit.status === 'publish'"
                                :href="mediakit.viewUrl"
                                target="_blank"
                                class="pit-action-btn pit-action-secondary"
                            >
                                View
                            </a>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
const props = defineProps({
    mediakits: {
        type: Array,
        required: true,
    },
});

const emit = defineEmits(['delete']);

const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

const getStatusClass = (status) => {
    switch (status) {
        case 'publish':
            return 'pit-status-published';
        case 'draft':
            return 'pit-status-draft';
        case 'private':
            return 'pit-status-private';
        default:
            return 'pit-status-draft';
    }
};

const getStatusLabel = (status) => {
    switch (status) {
        case 'publish':
            return 'Published';
        case 'draft':
            return 'Draft';
        case 'private':
            return 'Private';
        default:
            return 'Draft';
    }
};

const formatTheme = (theme) => {
    if (!theme) return 'Professional Clean';
    return theme
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};
</script>

<style scoped>
.pit-table-container {
    overflow-x: auto;
    background: #fff;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
}

.pit-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
}

.pit-th {
    text-align: left;
    padding: 12px 16px;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    font-weight: 500;
    color: #64748b;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.pit-th-actions {
    text-align: right;
    width: 150px;
}

.pit-row {
    border-bottom: 1px solid #f1f5f9;
    transition: background-color 0.15s ease;
}

.pit-row:hover {
    background-color: #f8fafc;
}

.pit-row:last-child {
    border-bottom: none;
}

.pit-td {
    padding: 14px 16px;
    vertical-align: middle;
    color: #334155;
}

.pit-td-title {
    max-width: 250px;
}

.pit-title-cell {
    display: flex;
    align-items: center;
    gap: 12px;
}

.pit-icon-wrapper {
    background-color: #f1f5f9;
    padding: 8px;
    border-radius: 6px;
    flex-shrink: 0;
}

.pit-icon {
    width: 16px;
    height: 16px;
    color: #516f90;
}

.pit-title-text {
    font-weight: 500;
    color: #334155;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.pit-td-status {
    width: 120px;
}

.pit-status-badge {
    display: inline-block;
    font-size: 11px;
    font-weight: 500;
    padding: 4px 10px;
    border-radius: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.pit-status-published {
    background-color: #dcfce7;
    color: #166534;
}

.pit-status-draft {
    background-color: #fef3c7;
    color: #92400e;
}

.pit-status-private {
    background-color: #f3e8ff;
    color: #7c3aed;
}

.pit-td-theme {
    width: 150px;
}

.pit-theme-badge {
    display: inline-block;
    font-size: 12px;
    color: #64748b;
    background: #f1f5f9;
    padding: 4px 10px;
    border-radius: 4px;
}

.pit-td-sections {
    color: #64748b;
    white-space: nowrap;
}

.pit-td-date {
    color: #64748b;
    white-space: nowrap;
}

.pit-td-actions {
    text-align: right;
}

.pit-actions-group {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
}

.pit-action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 6px 14px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.2s ease;
}

.pit-action-primary {
    background: linear-gradient(135deg, #ED8936, #DD6B20);
    color: white;
}

.pit-action-primary:hover {
    background: linear-gradient(135deg, #DD6B20, #C05621);
    color: white;
    text-decoration: none;
}

.pit-action-secondary {
    background: #f1f5f9;
    color: #475569;
}

.pit-action-secondary:hover {
    background: #e2e8f0;
    color: #334155;
    text-decoration: none;
}

@media (max-width: 768px) {
    .pit-th,
    .pit-td {
        padding: 10px 12px;
    }

    .pit-td-theme,
    .pit-td-sections {
        display: none;
    }

    .pit-th:nth-child(3),
    .pit-th:nth-child(4) {
        display: none;
    }
}
</style>
