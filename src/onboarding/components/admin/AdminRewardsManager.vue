<template>
    <div class="rewards-manager">
        <header class="manager-header">
            <h2>Onboarding Rewards</h2>
            <p class="description">Configure rewards that users unlock as they progress through onboarding.</p>
        </header>

        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
            <div class="spinner"></div>
            <p>Loading rewards...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
            <p>{{ error }}</p>
            <button @click="loadRewards" class="button">Retry</button>
        </div>

        <!-- Rewards List -->
        <div v-else class="rewards-list">
            <div
                v-for="(reward, index) in rewards"
                :key="reward.id"
                class="reward-item"
                :class="{ 'is-editing': editingId === reward.id }"
            >
                <!-- View Mode -->
                <template v-if="editingId !== reward.id">
                    <div class="reward-icon">{{ reward.icon || '🎁' }}</div>
                    <div class="reward-details">
                        <h3>{{ reward.title }}</h3>
                        <p class="reward-meta">
                            <span class="threshold">{{ reward.threshold }} points</span>
                            <span v-if="reward.url" class="has-url">Has link</span>
                        </p>
                    </div>
                    <div class="reward-actions">
                        <button @click="startEditing(reward)" class="button button-secondary">
                            Edit
                        </button>
                        <button @click="deleteReward(reward.id)" class="button button-link-delete">
                            Delete
                        </button>
                    </div>
                </template>

                <!-- Edit Mode -->
                <template v-else>
                    <div class="edit-form">
                        <div class="form-row">
                            <label>
                                Icon (emoji)
                                <input
                                    v-model="editForm.icon"
                                    type="text"
                                    class="small-input"
                                    placeholder="🎁"
                                    maxlength="4"
                                />
                            </label>
                            <label class="flex-grow">
                                Title
                                <input
                                    v-model="editForm.title"
                                    type="text"
                                    placeholder="Reward title"
                                />
                            </label>
                        </div>
                        <div class="form-row">
                            <label>
                                Points Threshold
                                <input
                                    v-model.number="editForm.threshold"
                                    type="number"
                                    min="0"
                                    max="100"
                                />
                            </label>
                            <label class="flex-grow">
                                Reward URL (optional)
                                <input
                                    v-model="editForm.url"
                                    type="url"
                                    placeholder="https://..."
                                />
                            </label>
                        </div>
                        <div class="form-actions">
                            <button @click="saveReward" class="button button-primary" :disabled="isSaving">
                                {{ isSaving ? 'Saving...' : 'Save' }}
                            </button>
                            <button @click="cancelEditing" class="button button-secondary">
                                Cancel
                            </button>
                        </div>
                    </div>
                </template>
            </div>

            <!-- Add New Reward -->
            <div class="add-reward">
                <button
                    v-if="!isAdding"
                    @click="startAdding"
                    class="button button-secondary"
                >
                    + Add Reward
                </button>
                <div v-else class="edit-form">
                    <div class="form-row">
                        <label>
                            Icon (emoji)
                            <input
                                v-model="newReward.icon"
                                type="text"
                                class="small-input"
                                placeholder="🎁"
                                maxlength="4"
                            />
                        </label>
                        <label class="flex-grow">
                            Title
                            <input
                                v-model="newReward.title"
                                type="text"
                                placeholder="Reward title"
                            />
                        </label>
                    </div>
                    <div class="form-row">
                        <label>
                            Points Threshold
                            <input
                                v-model.number="newReward.threshold"
                                type="number"
                                min="0"
                                max="100"
                            />
                        </label>
                        <label class="flex-grow">
                            Reward URL (optional)
                            <input
                                v-model="newReward.url"
                                type="url"
                                placeholder="https://..."
                            />
                        </label>
                    </div>
                    <div class="form-actions">
                        <button @click="addReward" class="button button-primary" :disabled="isSaving">
                            {{ isSaving ? 'Adding...' : 'Add Reward' }}
                        </button>
                        <button @click="cancelAdding" class="button button-secondary">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer Actions -->
        <footer class="manager-footer">
            <button @click="resetToDefaults" class="button button-link-delete">
                Reset to Defaults
            </button>
        </footer>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// Configuration
const apiUrl = ref('/wp-json/');
const nonce = ref(null);

// State
const rewards = ref([]);
const isLoading = ref(true);
const isSaving = ref(false);
const error = ref(null);
const editingId = ref(null);
const isAdding = ref(false);

// Forms
const editForm = ref({
    id: null,
    icon: '',
    title: '',
    threshold: 0,
    url: '',
});

const newReward = ref({
    icon: '🎁',
    title: '',
    threshold: 50,
    url: '',
});

// Load rewards from API
const loadRewards = async () => {
    isLoading.value = true;
    error.value = null;

    try {
        const response = await apiRequest('GET', '/admin/rewards');
        if (response.success) {
            rewards.value = response.data?.rewards || [];
        }
    } catch (e) {
        error.value = e.message;
    } finally {
        isLoading.value = false;
    }
};

// Start editing a reward
const startEditing = (reward) => {
    editingId.value = reward.id;
    editForm.value = { ...reward };
};

// Cancel editing
const cancelEditing = () => {
    editingId.value = null;
    editForm.value = { id: null, icon: '', title: '', threshold: 0, url: '' };
};

// Save edited reward
const saveReward = async () => {
    if (!editForm.value.title) {
        alert('Title is required');
        return;
    }

    isSaving.value = true;

    try {
        const response = await apiRequest('PUT', `/admin/rewards/${editForm.value.id}`, editForm.value);
        if (response.success) {
            const index = rewards.value.findIndex((r) => r.id === editForm.value.id);
            if (index !== -1) {
                rewards.value[index] = { ...editForm.value };
            }
            cancelEditing();
        }
    } catch (e) {
        alert('Failed to save: ' + e.message);
    } finally {
        isSaving.value = false;
    }
};

// Start adding new reward
const startAdding = () => {
    isAdding.value = true;
    newReward.value = { icon: '🎁', title: '', threshold: 50, url: '' };
};

// Cancel adding
const cancelAdding = () => {
    isAdding.value = false;
};

// Add new reward
const addReward = async () => {
    if (!newReward.value.title) {
        alert('Title is required');
        return;
    }

    isSaving.value = true;

    try {
        // Generate a unique ID for the new reward
        const newId = `reward_${newReward.value.threshold}_${Date.now()}`;
        const rewardToAdd = { ...newReward.value, id: newId };

        // Send all rewards including the new one
        const allRewards = [...rewards.value, rewardToAdd];
        const response = await apiRequest('POST', '/admin/rewards', { rewards: allRewards });

        if (response.success) {
            rewards.value = response.data?.rewards || allRewards;
            cancelAdding();
        }
    } catch (e) {
        alert('Failed to add: ' + e.message);
    } finally {
        isSaving.value = false;
    }
};

// Delete reward
const deleteReward = async (rewardId) => {
    if (!confirm('Are you sure you want to delete this reward?')) {
        return;
    }

    try {
        const updatedRewards = rewards.value.filter((r) => r.id !== rewardId);
        const response = await apiRequest('POST', '/admin/rewards', { rewards: updatedRewards });
        if (response.success) {
            rewards.value = response.data?.rewards || updatedRewards;
        }
    } catch (e) {
        alert('Failed to delete: ' + e.message);
    }
};

// Reset to defaults
const resetToDefaults = async () => {
    if (!confirm('This will reset all rewards to their default values. Continue?')) {
        return;
    }

    try {
        const response = await apiRequest('POST', '/admin/rewards/reset');
        if (response.success) {
            await loadRewards();
        }
    } catch (e) {
        alert('Failed to reset: ' + e.message);
    }
};

// API request helper
const apiRequest = async (method, endpoint, body = null) => {
    const url = `${apiUrl.value.replace(/\/$/, '')}/gmkb/v2${endpoint}`;

    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
    };

    if (nonce.value) {
        options.headers['X-WP-Nonce'] = nonce.value;
    }

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${response.status}`);
    }

    return response.json();
};

// Initialize
onMounted(() => {
    // Get config from global
    if (window.gmkbAdminData) {
        apiUrl.value = window.gmkbAdminData.apiUrl || '/wp-json/';
        nonce.value = window.gmkbAdminData.nonce;
    } else if (window.wpApiSettings) {
        apiUrl.value = window.wpApiSettings.root || '/wp-json/';
        nonce.value = window.wpApiSettings.nonce;
    }

    loadRewards();
});
</script>

<style scoped>
.rewards-manager {
    max-width: 800px;
    background: white;
    border: 1px solid #c3c4c7;
    border-radius: 4px;
}

.manager-header {
    padding: 16px 20px;
    border-bottom: 1px solid #c3c4c7;
}

.manager-header h2 {
    margin: 0 0 4px 0;
    font-size: 18px;
    color: #1d2327;
}

.manager-header .description {
    margin: 0;
    color: #646970;
    font-size: 13px;
}

/* Loading and Error States */
.loading-state,
.error-state {
    padding: 40px;
    text-align: center;
    color: #646970;
}

.spinner {
    width: 24px;
    height: 24px;
    border: 3px solid #c3c4c7;
    border-top-color: #2271b1;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 12px;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* Rewards List */
.rewards-list {
    padding: 12px;
}

.reward-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    margin-bottom: 8px;
    background: #f9f9f9;
}

.reward-item.is-editing {
    display: block;
    background: white;
    border-color: #2271b1;
}

.reward-icon {
    font-size: 28px;
    width: 40px;
    text-align: center;
}

.reward-details {
    flex: 1;
}

.reward-details h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #1d2327;
}

.reward-meta {
    margin: 4px 0 0;
    font-size: 12px;
    color: #646970;
}

.reward-meta .threshold {
    background: #dcdcde;
    padding: 2px 6px;
    border-radius: 3px;
    margin-right: 8px;
}

.reward-meta .has-url {
    color: #2271b1;
}

.reward-actions {
    display: flex;
    gap: 8px;
}

/* Edit Form */
.edit-form {
    padding: 8px 0;
}

.form-row {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
}

.form-row label {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 13px;
    color: #1d2327;
}

.form-row label.flex-grow {
    flex: 1;
}

.form-row input {
    padding: 6px 8px;
    border: 1px solid #8c8f94;
    border-radius: 4px;
    font-size: 14px;
}

.form-row input.small-input {
    width: 60px;
    text-align: center;
}

.form-actions {
    display: flex;
    gap: 8px;
    padding-top: 8px;
    border-top: 1px solid #e0e0e0;
}

/* Add Reward */
.add-reward {
    padding: 12px;
    border: 1px dashed #c3c4c7;
    border-radius: 4px;
    margin-top: 8px;
}

/* Footer */
.manager-footer {
    padding: 12px 20px;
    border-top: 1px solid #c3c4c7;
    text-align: right;
}

/* WordPress Button Styles */
.button {
    display: inline-flex;
    align-items: center;
    padding: 0 10px;
    min-height: 30px;
    font-size: 13px;
    line-height: 2.15;
    cursor: pointer;
    border-width: 1px;
    border-style: solid;
    border-radius: 3px;
    white-space: nowrap;
    box-sizing: border-box;
    text-decoration: none;
}

.button-primary {
    background: #2271b1;
    border-color: #2271b1;
    color: white;
}

.button-primary:hover {
    background: #135e96;
    border-color: #135e96;
}

.button-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.button-secondary {
    background: #f6f7f7;
    border-color: #2271b1;
    color: #2271b1;
}

.button-secondary:hover {
    background: #f0f0f1;
}

.button-link-delete {
    background: none;
    border: none;
    color: #b32d2e;
    cursor: pointer;
    padding: 0 10px;
}

.button-link-delete:hover {
    color: #a00;
}
</style>
