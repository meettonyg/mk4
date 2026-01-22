<template>
    <div class="pit-table-container">
        <table class="pit-table">
            <thead>
                <tr>
                    <th class="pit-th">Profile</th>
                    <th class="pit-th">Tagline</th>
                    <th class="pit-th">Completeness</th>
                    <th class="pit-th">Last Modified</th>
                    <th class="pit-th pit-th-actions">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for="profile in profiles"
                    :key="profile.id"
                    class="pit-row"
                >
                    <td class="pit-td pit-td-title">
                        <div class="pit-title-cell">
                            <div class="pit-icon-wrapper">
                                <svg xmlns="http://www.w3.org/2000/svg" class="pit-icon" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                            </div>
                            <span class="pit-title-text">{{ profile.title }}</span>
                        </div>
                    </td>
                    <td class="pit-td pit-td-tagline">
                        <span v-if="profile.tagline" class="pit-tagline-text">{{ profile.tagline }}</span>
                        <span v-else class="pit-empty-text">—</span>
                    </td>
                    <td class="pit-td pit-td-progress">
                        <div class="pit-progress-wrapper">
                            <div class="pit-progress-bar">
                                <div
                                    class="pit-progress-fill"
                                    :style="{ width: profile.completeness + '%' }"
                                ></div>
                            </div>
                            <span class="pit-progress-text">{{ profile.completeness }}%</span>
                        </div>
                    </td>
                    <td class="pit-td pit-td-date">
                        {{ formatDate(profile.modified) }}
                    </td>
                    <td class="pit-td pit-td-actions">
                        <a :href="profile.editUrl" class="pit-action-btn pit-action-primary">
                            View
                        </a>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
const props = defineProps({
    profiles: {
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
    width: 100px;
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

.pit-td-tagline {
    max-width: 300px;
}

.pit-tagline-text {
    color: #64748b;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: block;
}

.pit-empty-text {
    color: #94a3b8;
}

.pit-td-progress {
    width: 150px;
}

.pit-progress-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
}

.pit-progress-bar {
    flex: 1;
    height: 6px;
    background-color: #f1f5f9;
    border-radius: 3px;
    overflow: hidden;
    min-width: 60px;
}

.pit-progress-fill {
    height: 100%;
    border-radius: 3px;
    background: linear-gradient(to right, #ED8936, #1B365D);
    transition: width 0.3s ease;
}

.pit-progress-text {
    font-size: 13px;
    color: #64748b;
    flex-shrink: 0;
    min-width: 35px;
    text-align: right;
}

.pit-td-date {
    color: #64748b;
    white-space: nowrap;
}

.pit-td-actions {
    text-align: right;
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

@media (max-width: 768px) {
    .pit-th,
    .pit-td {
        padding: 10px 12px;
    }

    .pit-td-tagline {
        display: none;
    }

    .pit-th:nth-child(2) {
        display: none;
    }
}
</style>
