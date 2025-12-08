<template>
    <div class="profile-header">
        <div class="profile-title-row">
            <div class="profile-title-section">
                <div class="profile-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="20" x2="18" y2="10"></line>
                        <line x1="12" y1="20" x2="12" y2="4"></line>
                        <line x1="6" y1="20" x2="6" y2="14"></line>
                    </svg>
                </div>
                <div class="profile-title-info">
                    <h1>{{ fullName }}</h1>
                    <div class="profile-date">
                        Created on {{ formattedDate }}
                    </div>
                </div>
            </div>

            <div class="profile-actions">
                <button class="button secondary-button" @click="$emit('edit')">
                    <svg xmlns="http://www.w3.org/2000/svg" class="button-icon" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Edit Profile
                </button>

                <a
                    v-if="mediaKitUrl"
                    :href="mediaKitUrl"
                    target="_blank"
                    class="button primary-button"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="button-icon" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    View Media Kit
                </a>
            </div>
        </div>

        <div class="profile-status">
            <div class="status-item">
                <svg xmlns="http://www.w3.org/2000/svg" class="status-icon" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span class="status-text">
                    Pitches Sent: <span class="status-value">{{ pitchesSent || '—' }}</span>
                </span>
            </div>

            <div class="status-item">
                <svg xmlns="http://www.w3.org/2000/svg" class="status-icon" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
                <span class="status-text">
                    Response Rate: <span class="status-value">{{ responseRate || '—' }}</span>
                </span>
            </div>

            <div class="status-item">
                <svg xmlns="http://www.w3.org/2000/svg" class="status-icon" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span class="status-text">
                    Last Updated: <span class="status-value">{{ lastUpdated }}</span>
                </span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    postData: {
        type: Object,
        default: () => ({}),
    },
    fullName: {
        type: String,
        default: 'Unnamed Profile',
    },
    pitchesSent: {
        type: [Number, String],
        default: null,
    },
    responseRate: {
        type: [Number, String],
        default: null,
    },
});

defineEmits(['edit']);

const formattedDate = computed(() => {
    if (!props.postData?.created) return '';
    const date = new Date(props.postData.created);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
});

const lastUpdated = computed(() => {
    if (!props.postData?.modified) return 'Unknown';
    const date = new Date(props.postData.modified);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
});

const mediaKitUrl = computed(() => {
    return props.postData?.permalink || null;
});
</script>

<style scoped>
.profile-header {
    background-color: white;
    border-radius: 8px 8px 0 0;
    border: 1px solid #e2e8f0;
    padding: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    margin-bottom: 0;
}

.profile-title-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
    flex-wrap: wrap;
    gap: 16px;
}

.profile-title-section {
    display: flex;
    align-items: center;
}

.profile-icon {
    background-color: #f1f5f9;
    padding: 12px;
    border-radius: 8px;
    margin-right: 16px;
}

.profile-icon svg {
    width: 24px;
    height: 24px;
    color: #0284c7;
}

.profile-title-info h1 {
    font-size: 24px;
    font-weight: 600;
    margin: 0 0 4px 0;
    color: #0f172a;
}

.profile-date {
    font-size: 14px;
    color: #64748b;
}

.profile-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
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
    transition: all 0.2s ease;
    text-decoration: none;
    border: none;
}

.primary-button {
    background-color: #14b8a6;
    color: white;
}

.primary-button:hover {
    background-color: #0d9488;
}

.secondary-button {
    background-color: white;
    color: #64748b;
    border: 1px solid #e2e8f0;
}

.secondary-button:hover {
    background-color: #f8fafc;
}

.button-icon {
    width: 16px;
    height: 16px;
    margin-right: 8px;
}

.profile-status {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
}

.status-item {
    display: flex;
    align-items: center;
}

.status-icon {
    width: 20px;
    height: 20px;
    margin-right: 8px;
    color: #64748b;
}

.status-text {
    font-size: 14px;
    color: #64748b;
}

.status-value {
    font-weight: 500;
    color: #0f172a;
    margin-left: 4px;
}

@media (max-width: 640px) {
    .profile-title-row {
        flex-direction: column;
    }

    .profile-actions {
        width: 100%;
    }

    .button {
        flex: 1;
        justify-content: center;
    }
}
</style>
