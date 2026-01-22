<template>
    <div class="guestify-profile-card">
        <div class="guestify-card-content">
            <!-- Header -->
            <div class="guestify-card-header">
                <div class="guestify-title-wrapper">
                    <div class="guestify-icon-wrapper" :class="{ 'has-custom-icon': profile.icon }">
                        <i v-if="profile.icon" :class="profile.icon" class="guestify-custom-icon"></i>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" class="guestify-icon" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                    </div>
                    <h3 class="guestify-card-title">{{ profile.title }}</h3>
                </div>
                <span class="guestify-card-date">{{ formattedDate }}</span>
            </div>

            <!-- Tagline (if available) -->
            <p v-if="profile.tagline" class="guestify-card-tagline">{{ profile.tagline }}</p>

            <!-- Progress Bar -->
            <div class="guestify-progress-container">
                <div class="guestify-progress-bar">
                    <div
                        class="guestify-progress-fill"
                        :style="{ width: profile.completeness + '%' }"
                    ></div>
                </div>
                <div class="guestify-progress-labels">
                    <span>Profile Completeness</span>
                    <span>{{ profile.completeness }}%</span>
                </div>
            </div>

            <!-- Footer -->
            <div class="guestify-card-footer">
                <a :href="profile.editUrl" class="guestify-view-button">
                    View Profile
                    <svg xmlns="http://www.w3.org/2000/svg" class="guestify-button-icon" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </a>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    profile: {
        type: Object,
        required: true,
    },
});

const emit = defineEmits(['delete']);

// Format date
const formattedDate = computed(() => {
    if (!props.profile.modified) return '';
    const date = new Date(props.profile.modified);
    return date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
    });
});
</script>

<style scoped>
.guestify-profile-card {
    flex: 1 0 calc(33.333% - 20px);
    max-width: calc(33.333% - 20px);
    margin: 10px;
    min-width: 280px;
    background-color: #ffffff;
    border: 1px solid #cbd6e2;
    border-radius: 8px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;
}

.guestify-profile-card:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.guestify-card-content {
    padding: 16px;
    display: flex;
    flex-direction: column;
    height: 100%;
}

.guestify-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
}

.guestify-title-wrapper {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
}

.guestify-icon-wrapper {
    background-color: #f1f5f9;
    padding: 8px;
    border-radius: 6px;
    margin-right: 12px;
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.guestify-icon-wrapper.has-custom-icon {
    background: linear-gradient(135deg, #fff8f0, #fff);
    border: 1px solid #ED8936;
}

.guestify-icon {
    width: 16px;
    height: 16px;
    color: #516f90;
}

.guestify-custom-icon {
    font-size: 16px;
    color: #ED8936;
}

.guestify-card-title {
    font-size: 15px;
    font-weight: 500;
    color: #4A5568;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.guestify-card-date {
    font-size: 12px;
    color: #94a3b8;
    flex-shrink: 0;
    margin-left: 8px;
}

.guestify-card-tagline {
    font-size: 13px;
    color: #64748b;
    margin: 0 0 12px 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.guestify-progress-container {
    margin-top: auto;
    margin-bottom: 4px;
}

.guestify-progress-bar {
    width: 100%;
    height: 8px;
    background-color: #f1f5f9;
    border-radius: 4px;
    overflow: hidden;
}

.guestify-progress-fill {
    height: 100%;
    border-radius: 4px;
    background: linear-gradient(to right, #ED8936, #1B365D);
    transition: width 0.3s ease;
}

.guestify-progress-labels {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #94a3b8;
    margin-top: 4px;
}

.guestify-card-footer {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #f1f5f9;
}

.guestify-view-button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ED8936;
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
    padding: 4px 0;
    transition: color 0.2s ease;
}

.guestify-view-button:hover {
    color: #d67326;
}

.guestify-button-icon {
    margin-left: 4px;
    width: 16px;
    height: 16px;
}

/* Responsive */
@media (max-width: 1024px) {
    .guestify-profile-card {
        flex: 1 0 calc(50% - 20px);
        max-width: calc(50% - 20px);
    }
}

@media (max-width: 768px) {
    .guestify-profile-card {
        flex: 1 0 calc(100% - 20px);
        max-width: calc(100% - 20px);
    }
}
</style>
