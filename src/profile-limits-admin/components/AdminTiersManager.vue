<template>
    <div class="tiers-manager profile-limits-admin">
        <header class="manager-header">
            <h2>Manage Membership Tiers</h2>
            <p class="description">Configure membership tiers and their associated WP Fusion tags. Users are matched to the highest-priority tier based on their tags.</p>
        </header>

        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
            <div class="spinner"></div>
            <p>Loading tiers...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
            <p>{{ error }}</p>
            <button @click="loadTiers" class="button">Retry</button>
        </div>

        <!-- Tiers List -->
        <div v-else class="tiers-list">
            <div
                v-for="(tier, key) in sortedTiers"
                :key="key"
                class="tier-item"
                :class="{ 'is-editing': editingKey === key, 'is-protected': isProtectedTier(key) }"
            >
                <!-- View Mode -->
                <template v-if="editingKey !== key">
                    <div class="tier-priority">
                        <span class="priority-badge">{{ tier.priority }}</span>
                    </div>
                    <div class="tier-details">
                        <h3>{{ tier.name }}</h3>
                        <div class="tier-meta">
                            <span class="limit-badge" :class="{ 'is-unlimited': tier.profile_limit === -1 }">
                                {{ tier.profile_limit === -1 ? 'Unlimited' : `${tier.profile_limit} profiles` }}
                            </span>
                            <span v-if="tier.tags && tier.tags.length > 0" class="tags-count">
                                {{ tier.tags.length }} tag{{ tier.tags.length !== 1 ? 's' : '' }}
                            </span>
                            <span v-else class="no-tags">No tags (default tier)</span>
                        </div>
                        <div v-if="tier.tags && tier.tags.length > 0" class="tags-list">
                            <span v-for="tag in tier.tags" :key="tag" class="tag">{{ tag }}</span>
                        </div>
                    </div>
                    <div class="tier-actions">
                        <button @click="startEditing(key, tier)" class="button button-secondary">
                            Edit
                        </button>
                        <button
                            v-if="!isProtectedTier(key)"
                            @click="deleteTier(key)"
                            class="button button-link-delete"
                        >
                            Delete
                        </button>
                    </div>
                </template>

                <!-- Edit Mode -->
                <template v-else>
                    <div class="edit-form">
                        <div class="form-row">
                            <label>
                                Tier Name
                                <input
                                    v-model="editForm.name"
                                    type="text"
                                    placeholder="Tier name"
                                />
                            </label>
                            <label class="small-label">
                                Priority
                                <input
                                    v-model.number="editForm.priority"
                                    type="number"
                                    min="0"
                                    max="100"
                                    class="small-input"
                                />
                            </label>
                        </div>
                        <div class="form-row">
                            <label class="small-label">
                                Profile Limit
                                <input
                                    v-model.number="editForm.profile_limit"
                                    type="number"
                                    min="-1"
                                    class="small-input"
                                />
                                <span class="field-hint">-1 = unlimited</span>
                            </label>
                            <label class="small-label">
                                Display Limit
                                <input
                                    v-model.number="editForm.display_limit"
                                    type="number"
                                    min="-1"
                                    class="small-input"
                                />
                                <span class="field-hint">-1 = unlimited</span>
                            </label>
                        </div>
                        <div class="form-row">
                            <label class="full-width">
                                WP Fusion Tags (one per line)
                                <textarea
                                    v-model="editTagsText"
                                    rows="4"
                                    placeholder="mem: guestify tier name&#10;mem: guestify tier name trial"
                                ></textarea>
                                <span class="field-hint">Enter exact tag names as they appear in WP Fusion</span>
                            </label>
                        </div>
                        <div class="form-actions">
                            <button @click="saveTier" class="button button-primary" :disabled="isSaving">
                                {{ isSaving ? 'Saving...' : 'Save Changes' }}
                            </button>
                            <button @click="cancelEditing" class="button button-secondary">
                                Cancel
                            </button>
                        </div>
                    </div>
                </template>
            </div>

            <!-- Add New Tier -->
            <div class="add-tier">
                <button
                    v-if="!isAdding"
                    @click="startAdding"
                    class="button button-secondary"
                >
                    + Add New Tier
                </button>
                <div v-else class="edit-form">
                    <h4>Add New Tier</h4>
                    <div class="form-row">
                        <label>
                            Tier Key (unique identifier)
                            <input
                                v-model="newTierKey"
                                type="text"
                                placeholder="e.g., starter, pro, enterprise"
                                pattern="[a-z0-9_-]+"
                            />
                            <span class="field-hint">Lowercase letters, numbers, underscores, hyphens only</span>
                        </label>
                        <label>
                            Tier Name
                            <input
                                v-model="newTier.name"
                                type="text"
                                placeholder="Display name"
                            />
                        </label>
                    </div>
                    <div class="form-row">
                        <label class="small-label">
                            Priority
                            <input
                                v-model.number="newTier.priority"
                                type="number"
                                min="0"
                                max="100"
                                class="small-input"
                            />
                        </label>
                        <label class="small-label">
                            Profile Limit
                            <input
                                v-model.number="newTier.profile_limit"
                                type="number"
                                min="-1"
                                class="small-input"
                            />
                            <span class="field-hint">-1 = unlimited</span>
                        </label>
                        <label class="small-label">
                            Display Limit
                            <input
                                v-model.number="newTier.display_limit"
                                type="number"
                                min="-1"
                                class="small-input"
                            />
                        </label>
                    </div>
                    <div class="form-row">
                        <label class="full-width">
                            WP Fusion Tags (one per line)
                            <textarea
                                v-model="newTagsText"
                                rows="3"
                                placeholder="mem: guestify tier name"
                            ></textarea>
                        </label>
                    </div>
                    <div class="form-actions">
                        <button @click="addTier" class="button button-primary" :disabled="isSaving">
                            {{ isSaving ? 'Adding...' : 'Add Tier' }}
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
            <span class="footer-info">
                Protected tiers (Unlimited, Free) cannot be deleted
            </span>
        </footer>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

// Configuration
const apiUrl = ref('/wp-json/');
const nonce = ref(null);

// State
const tiers = ref({});
const defaultTiers = ref({});
const isLoading = ref(true);
const isSaving = ref(false);
const error = ref(null);
const editingKey = ref(null);
const isAdding = ref(false);

// Protected tier keys (cannot be deleted)
const protectedTiers = ['unlimited', 'free'];

// Forms
const editForm = ref({
    name: '',
    priority: 0,
    profile_limit: 1,
    display_limit: 1,
    tags: [],
});

const editTagsText = ref('');

const newTierKey = ref('');
const newTier = ref({
    name: '',
    priority: 50,
    profile_limit: 1,
    display_limit: 1,
    tags: [],
});
const newTagsText = ref('');

// Computed
const sortedTiers = computed(() => {
    const entries = Object.entries(tiers.value);
    entries.sort((a, b) => (b[1].priority || 0) - (a[1].priority || 0));
    return Object.fromEntries(entries);
});

// Methods
const isProtectedTier = (key) => protectedTiers.includes(key);

// Load tiers from API
const loadTiers = async () => {
    isLoading.value = true;
    error.value = null;

    try {
        const response = await apiRequest('GET', '/profile-limits/tiers');
        if (response.success) {
            tiers.value = response.tiers || {};
            defaultTiers.value = response.defaults || {};
        }
    } catch (e) {
        error.value = e.message;
    } finally {
        isLoading.value = false;
    }
};

// Start editing a tier
const startEditing = (key, tier) => {
    editingKey.value = key;
    editForm.value = {
        name: tier.name || '',
        priority: tier.priority || 0,
        profile_limit: tier.profile_limit ?? 1,
        display_limit: tier.display_limit ?? tier.profile_limit ?? 1,
        tags: tier.tags || [],
    };
    editTagsText.value = (tier.tags || []).join('\n');
};

// Cancel editing
const cancelEditing = () => {
    editingKey.value = null;
    editForm.value = { name: '', priority: 0, profile_limit: 1, display_limit: 1, tags: [] };
    editTagsText.value = '';
};

// Save edited tier
const saveTier = async () => {
    if (!editForm.value.name) {
        alert('Tier name is required');
        return;
    }

    isSaving.value = true;

    // Parse tags from textarea
    const tags = editTagsText.value
        .split('\n')
        .map(t => t.trim())
        .filter(t => t.length > 0);

    try {
        const tierData = {
            ...editForm.value,
            tags,
        };

        const response = await apiRequest('POST', `/profile-limits/tiers/${editingKey.value}`, tierData);

        if (response.success) {
            tiers.value[editingKey.value] = response.tier;
            cancelEditing();
            // Reload to ensure we have the latest data
            await loadTiers();
        }
    } catch (e) {
        alert('Failed to save: ' + e.message);
    } finally {
        isSaving.value = false;
    }
};

// Start adding new tier
const startAdding = () => {
    isAdding.value = true;
    newTierKey.value = '';
    newTier.value = { name: '', priority: 50, profile_limit: 1, display_limit: 1, tags: [] };
    newTagsText.value = '';
};

// Cancel adding
const cancelAdding = () => {
    isAdding.value = false;
};

// Add new tier
const addTier = async () => {
    const key = newTierKey.value.toLowerCase().replace(/[^a-z0-9_-]/g, '');

    if (!key) {
        alert('Tier key is required');
        return;
    }

    if (!newTier.value.name) {
        alert('Tier name is required');
        return;
    }

    if (tiers.value[key]) {
        alert('A tier with this key already exists');
        return;
    }

    isSaving.value = true;

    // Parse tags from textarea
    const tags = newTagsText.value
        .split('\n')
        .map(t => t.trim())
        .filter(t => t.length > 0);

    try {
        const tierData = {
            ...newTier.value,
            tags,
        };

        const response = await apiRequest('POST', `/profile-limits/tiers/${key}`, tierData);

        if (response.success) {
            tiers.value[key] = response.tier;
            cancelAdding();
            // Reload to ensure we have the latest data
            await loadTiers();
        }
    } catch (e) {
        alert('Failed to add tier: ' + e.message);
    } finally {
        isSaving.value = false;
    }
};

// Delete tier
const deleteTier = async (tierKey) => {
    if (isProtectedTier(tierKey)) {
        alert('This tier cannot be deleted');
        return;
    }

    if (!confirm(`Are you sure you want to delete the "${tiers.value[tierKey]?.name || tierKey}" tier?`)) {
        return;
    }

    try {
        const response = await apiRequest('DELETE', `/profile-limits/tiers/${tierKey}`);
        if (response.success) {
            delete tiers.value[tierKey];
        }
    } catch (e) {
        alert('Failed to delete: ' + e.message);
    }
};

// Reset to defaults
const resetToDefaults = async () => {
    if (!confirm('This will reset all membership tiers to their default values. All custom tiers will be removed. Continue?')) {
        return;
    }

    try {
        const response = await apiRequest('POST', '/profile-limits/reset');
        if (response.success) {
            tiers.value = response.tiers || {};
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
    if (window.gmkbProfileLimitsData) {
        apiUrl.value = window.gmkbProfileLimitsData.apiUrl || '/wp-json/';
        nonce.value = window.gmkbProfileLimitsData.nonce;

        // Pre-load tiers if available
        if (window.gmkbProfileLimitsData.tiers) {
            tiers.value = window.gmkbProfileLimitsData.tiers;
            isLoading.value = false;
        }
        if (window.gmkbProfileLimitsData.defaultTiers) {
            defaultTiers.value = window.gmkbProfileLimitsData.defaultTiers;
        }
    } else if (window.wpApiSettings) {
        apiUrl.value = window.wpApiSettings.root || '/wp-json/';
        nonce.value = window.wpApiSettings.nonce;
    }

    // Load from API if not pre-loaded
    if (Object.keys(tiers.value).length === 0) {
        loadTiers();
    }
});
</script>

<style scoped>
.tiers-manager {
    max-width: 900px;
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

/* Tiers List */
.tiers-list {
    padding: 12px;
}

.tier-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    margin-bottom: 8px;
    background: #f9f9f9;
}

.tier-item.is-editing {
    display: block;
    background: white;
    border-color: #2271b1;
}

.tier-item.is-protected {
    border-left: 3px solid #ED8936;
}

.tier-priority {
    flex-shrink: 0;
}

.priority-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: #f0f0f1;
    border-radius: 50%;
    font-size: 14px;
    font-weight: 600;
    color: #1d2327;
}

.tier-details {
    flex: 1;
    min-width: 0;
}

.tier-details h3 {
    margin: 0 0 6px 0;
    font-size: 15px;
    font-weight: 600;
    color: #1d2327;
}

.tier-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 8px;
    font-size: 13px;
}

.limit-badge {
    background: #dcdcde;
    padding: 2px 8px;
    border-radius: 3px;
    color: #1d2327;
}

.limit-badge.is-unlimited {
    background: #dff0d8;
    color: #3c763d;
}

.tags-count {
    color: #2271b1;
}

.no-tags {
    color: #b32d2e;
    font-style: italic;
}

.tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}

.tag {
    background: #e0e0e0;
    padding: 2px 8px;
    border-radius: 3px;
    font-size: 12px;
    color: #1d2327;
    font-family: monospace;
}

.tier-actions {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex-shrink: 0;
}

/* Edit Form */
.edit-form {
    padding: 8px 0;
}

.edit-form h4 {
    margin: 0 0 12px 0;
    font-size: 14px;
    color: #1d2327;
}

.form-row {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
    flex-wrap: wrap;
}

.form-row label {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 13px;
    color: #1d2327;
    flex: 1;
    min-width: 200px;
}

.form-row label.small-label {
    flex: 0 0 auto;
    min-width: 120px;
}

.form-row label.full-width {
    flex: 1 1 100%;
}

.form-row input,
.form-row textarea {
    padding: 6px 8px;
    border: 1px solid #8c8f94;
    border-radius: 4px;
    font-size: 14px;
}

.form-row input.small-input {
    width: 80px;
    text-align: center;
}

.form-row textarea {
    font-family: monospace;
    font-size: 13px;
    resize: vertical;
}

.field-hint {
    font-size: 11px;
    color: #646970;
    font-style: italic;
}

.form-actions {
    display: flex;
    gap: 8px;
    padding-top: 12px;
    border-top: 1px solid #e0e0e0;
}

/* Add Tier */
.add-tier {
    padding: 16px;
    border: 1px dashed #c3c4c7;
    border-radius: 4px;
    margin-top: 12px;
}

/* Footer */
.manager-footer {
    padding: 12px 20px;
    border-top: 1px solid #c3c4c7;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.footer-info {
    font-size: 12px;
    color: #646970;
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
