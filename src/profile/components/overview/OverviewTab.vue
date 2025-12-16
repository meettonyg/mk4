<template>
    <div class="overview-tab">
        <div class="grid">
            <!-- Main Content -->
            <div class="main-content">
                <!-- Audience Panel -->
                <EditablePanel
                    title="Audience"
                    section-id="audience"
                    :is-editing="editingSection === 'audience'"
                    :is-saving="isSaving"
                    @edit="startEditing"
                    @save="saveSection"
                    @cancel="cancelEditing"
                >
                    <template #display>
                        <div class="text-area">
                            <h3>Areas of Expertise</h3>
                            <div class="tags-container">
                                <span
                                    v-for="tag in expertiseTags"
                                    :key="tag"
                                    class="tag"
                                >
                                    {{ tag }}
                                </span>
                                <span v-if="!expertiseTags.length" class="empty-text">
                                    No expertise tags added
                                </span>
                            </div>
                        </div>
                        <div class="text-area">
                            <h3>Audiences</h3>
                            <div class="tags-container">
                                <span class="empty-text">
                                    {{ store.fields.hook_who || 'No audience defined' }}
                                </span>
                            </div>
                        </div>
                    </template>

                    <template #edit>
                        <div class="form-group">
                            <label class="form-label">Areas of Expertise (comma separated)</label>
                            <input
                                type="text"
                                class="form-input"
                                v-model="editFields.expertise_tags"
                                placeholder="Marketing, Sales, Leadership..."
                            />
                        </div>
                        <div class="form-group">
                            <label class="form-label">WHO do you help?</label>
                            <input
                                type="text"
                                class="form-input"
                                v-model="editFields.hook_who"
                                placeholder="Describe your target audience..."
                            />
                        </div>
                    </template>
                </EditablePanel>

                <!-- Why Book You Panel -->
                <EditablePanel
                    title="Why Should a Podcast Book You?"
                    section-id="why-book"
                    :is-editing="editingSection === 'why-book'"
                    :is-saving="isSaving"
                    @edit="startEditing"
                    @save="saveSection"
                    @cancel="cancelEditing"
                >
                    <template #display>
                        <div class="text-area">
                            <p v-if="store.fields.why_book_you" v-html="store.fields.why_book_you"></p>
                            <p v-else class="empty-text">
                                <i class="info-icon">ℹ</i>
                                Click the edit button to share what makes you unique
                            </p>
                        </div>
                    </template>

                    <template #edit>
                        <div class="form-group">
                            <label class="form-label">Why should a podcast book you?</label>
                            <textarea
                                class="form-input textarea"
                                v-model="editFields.why_book_you"
                                rows="4"
                                placeholder="Share what makes you a great podcast guest..."
                            ></textarea>
                        </div>
                    </template>
                </EditablePanel>

                <!-- Featured Interviews Panel -->
                <EditablePanel
                    title="Featured Interviews"
                    section-id="interviews"
                    :is-editing="editingSection === 'interviews'"
                    :is-saving="isSaving"
                    @edit="startEditingInterviews"
                    @save="saveInterviewsSection"
                    @cancel="cancelInterviewsEditing"
                >
                    <template #display>
                        <!-- Loading state -->
                        <div v-if="isLoadingFeatured" class="loading-state">
                            <div class="spinner"></div>
                            Loading interviews...
                        </div>

                        <!-- Featured interviews from managed system -->
                        <div v-else-if="featuredInterviews.length > 0" class="featured-interviews-grid">
                            <div
                                v-for="(interview, index) in featuredInterviews"
                                :key="interview.id"
                                class="episode-card"
                            >
                                <!-- Thumbnail -->
                                <div class="episode-thumbnail-wrapper">
                                    <img
                                        v-if="interview.image || interview.image_url"
                                        :src="interview.image || interview.image_url"
                                        :alt="interview.episode_title || interview.title"
                                        class="episode-thumbnail"
                                        loading="lazy"
                                    />
                                    <div v-else class="episode-thumbnail-placeholder">
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" role="img" aria-label="Placeholder for episode thumbnail">
                                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                                            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                                        </svg>
                                    </div>
                                </div>

                                <div class="episode-content">
                                    <!-- Date and Duration Row -->
                                    <div class="episode-meta-row">
                                        <span v-if="interview.publish_date || interview.date" class="episode-date">
                                            {{ formatDate(interview.publish_date || interview.date) }}
                                        </span>
                                        <span v-if="interview.duration" class="episode-duration">
                                            <svg class="duration-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <circle cx="12" cy="12" r="10"/>
                                                <polyline points="12 6 12 12 16 14"/>
                                            </svg>
                                            {{ interview.duration }}
                                        </span>
                                    </div>

                                    <!-- Title -->
                                    <h4 class="episode-title">
                                        {{ interview.episode_title || interview.title }}
                                    </h4>

                                    <!-- Podcast Name -->
                                    <div class="episode-podcast-name">
                                        {{ interview.podcast_name || 'Podcast' }}
                                    </div>

                                    <!-- Description (truncated) -->
                                    <p v-if="interview.description" class="episode-description">
                                        {{ truncateText(interview.description, 120) }}
                                    </p>

                                    <!-- Audio Player -->
                                    <div v-if="interview.audio_url" class="episode-player">
                                        <audio controls preload="none">
                                            <source :src="interview.audio_url" />
                                            Your browser does not support audio.
                                        </audio>
                                    </div>

                                    <!-- Fallback Listen Button (when no audio_url) -->
                                    <a
                                        v-else-if="interview.episode_url"
                                        :href="interview.episode_url"
                                        class="episode-listen-btn"
                                        target="_blank"
                                        rel="noopener"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <polygon points="5 3 19 12 5 21 5 3"/>
                                        </svg>
                                        Listen Now
                                    </a>
                                </div>
                            </div>
                        </div>

                        <!-- Empty state when no interviews featured -->
                        <div v-else class="empty-interviews">
                            <p class="empty-text">No featured interviews yet. Click edit to add interviews.</p>
                        </div>
                    </template>

                    <template #edit>
                        <!-- Interview Selector with Dropdown UI -->
                        <div class="interview-selector">
                            <div v-if="isLoadingInterviews" class="loading-state">
                                <div class="spinner"></div>
                                Loading available interviews...
                            </div>

                            <div v-else>
                                <!-- 1. List of Selected (Featured) Interviews as Cards -->
                                <div v-if="selectedInterviewCards.length > 0" class="selected-interviews-cards mb-4">
                                    <div
                                        v-for="interview in selectedInterviewCards"
                                        :key="interview.id"
                                        class="featured-card"
                                    >
                                        <div class="featured-card-content">
                                            <div class="featured-card-icon">
                                                <span class="dashicon">🎙️</span>
                                            </div>
                                            <div class="featured-card-info">
                                                <div class="featured-card-title">{{ interview.podcast_name || 'Podcast' }}</div>
                                                <div class="featured-card-subtitle">{{ interview.title || interview.episode_title }}</div>
                                            </div>
                                        </div>
                                        <button
                                            @click="removeFromFeatured(interview.id)"
                                            class="featured-card-remove"
                                            title="Remove from featured"
                                            type="button"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>

                                <div v-else class="empty-selection-state">
                                    <p>No interviews selected yet. Use the dropdown below to add interviews.</p>
                                </div>

                                <!-- 2. Dropdown Selector to Add New -->
                                <div class="add-interview-dropdown">
                                    <label class="dropdown-label">Add from Portfolio</label>

                                    <div class="dropdown-row">
                                        <select
                                            v-model="selectedForAdd"
                                            class="form-select"
                                            :disabled="dropdownOptions.length === 0"
                                        >
                                            <option value="" disabled>
                                                {{ dropdownOptions.length === 0 ? 'No interviews available' : 'Select an interview to feature...' }}
                                            </option>
                                            <option
                                                v-for="interview in dropdownOptions"
                                                :key="interview.id"
                                                :value="interview.id"
                                                :disabled="isInterviewSelected(interview.id)"
                                            >
                                                {{ interview.label || (interview.podcast_name + ' - ' + interview.title) }}
                                                {{ isInterviewSelected(interview.id) ? ' (Added)' : '' }}
                                            </option>
                                        </select>

                                        <button
                                            @click="addSelectedToFeatured"
                                            class="btn-add"
                                            :disabled="!selectedForAdd || selectedInterviewIds.length >= 3"
                                            type="button"
                                        >
                                            Add
                                        </button>
                                    </div>

                                    <p class="selection-hint">
                                        {{ selectedInterviewIds.length }} of 3 interviews selected
                                    </p>
                                </div>

                                <!-- Link to add new interviews in Portfolio -->
                                <div class="add-new-interview-section">
                                    <a
                                        href="/wp-admin/admin.php?page=showauthority-appearances"
                                        target="_blank"
                                        class="add-portfolio-link"
                                    >
                                        + Add new interview to Portfolio
                                    </a>
                                </div>
                            </div>
                        </div>
                    </template>
                </EditablePanel>
            </div>

            <!-- Sidebar -->
            <div class="sidebar">
                <!-- Links Panel -->
                <EditablePanel
                    title="Links"
                    section-id="links"
                    :is-editing="editingSection === 'links'"
                    :is-saving="isSaving"
                    @edit="startEditing"
                    @save="saveSection"
                    @cancel="cancelEditing"
                >
                    <template #display>
                        <ul class="links-list">
                            <li
                                v-for="link in activeLinks"
                                :key="link.key"
                                class="link-item"
                            >
                                <span class="link-icon"><i :class="link.icon"></i></span>
                                <a :href="store.socialLinks[link.key]" target="_blank">{{ link.name }}</a>
                            </li>
                            <li v-if="!hasAnyLinks" class="empty-text">
                                No links added yet
                            </li>
                        </ul>

                        <div class="cta-container">
                            <h3 class="cta-title">Ready to reach out to podcasts?</h3>
                            <p class="cta-description">Start pitching your expertise to podcast hosts</p>
                            <a href="/app/interview/board/" target="_blank" class="button primary-button">
                                View Podcasts to Pitch
                            </a>
                        </div>
                    </template>

                    <template #edit>
                        <div class="form-group">
                            <label class="form-label">Facebook</label>
                            <input type="url" class="form-input" v-model="editFields.social_facebook" placeholder="https://facebook.com/..." />
                        </div>
                        <div class="form-group">
                            <label class="form-label">LinkedIn</label>
                            <input type="url" class="form-input" v-model="editFields.social_linkedin" placeholder="https://linkedin.com/in/..." />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Twitter/X</label>
                            <input type="url" class="form-input" v-model="editFields.social_twitter" placeholder="https://twitter.com/..." />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Instagram</label>
                            <input type="url" class="form-input" v-model="editFields.social_instagram" placeholder="https://instagram.com/..." />
                        </div>
                        <div class="form-group">
                            <label class="form-label">YouTube</label>
                            <input type="url" class="form-input" v-model="editFields.social_youtube" placeholder="https://youtube.com/..." />
                        </div>
                        <div class="form-group">
                            <label class="form-label">TikTok</label>
                            <input type="url" class="form-input" v-model="editFields.social_tiktok" placeholder="https://tiktok.com/@..." />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Pinterest</label>
                            <input type="url" class="form-input" v-model="editFields.social_pinterest" placeholder="https://pinterest.com/..." />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Website 1</label>
                            <input type="url" class="form-input" v-model="editFields.website_primary" placeholder="https://..." />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Website 2</label>
                            <input type="url" class="form-input" v-model="editFields.website_secondary" placeholder="https://..." />
                        </div>
                    </template>
                </EditablePanel>

                <!-- Contact Info Panel -->
                <EditablePanel
                    title="Contact Info"
                    section-id="contact"
                    :is-editing="editingSection === 'contact'"
                    :is-saving="isSaving"
                    @edit="startEditing"
                    @save="saveSection"
                    @cancel="cancelEditing"
                >
                    <template #display>
                        <div class="contact-item">
                            <span class="contact-label">Name:</span>
                            <span class="contact-value">{{ store.fullName }}</span>
                        </div>
                        <div class="contact-item" v-if="store.fields.phonetic">
                            <span class="contact-label">Phonetic:</span>
                            <span class="contact-value">{{ store.fields.phonetic }}</span>
                        </div>
                        <div class="contact-item" v-if="store.fields.company">
                            <span class="contact-label">Company:</span>
                            <span class="contact-value">{{ store.fields.company }}</span>
                        </div>
                        <div class="contact-item" v-if="store.fields.phone">
                            <span class="contact-label">Phone:</span>
                            <span class="contact-value">{{ store.fields.phone }}</span>
                        </div>
                        <div class="contact-item" v-if="store.fields.email">
                            <span class="contact-label">Email:</span>
                            <span class="contact-value">{{ store.fields.email }}</span>
                        </div>
                        <div class="contact-item" v-if="store.fields.skype">
                            <span class="contact-label">Skype:</span>
                            <span class="contact-value">{{ store.fields.skype }}</span>
                        </div>
                    </template>

                    <template #edit>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">First Name</label>
                                <input type="text" class="form-input" v-model="editFields.first_name" />
                            </div>
                            <div class="form-group">
                                <label class="form-label">Last Name</label>
                                <input type="text" class="form-input" v-model="editFields.last_name" />
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Phonetic Spelling</label>
                            <input type="text" class="form-input" v-model="editFields.phonetic" placeholder="How to pronounce your name" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Company/Organization</label>
                            <input type="text" class="form-input" v-model="editFields.company" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Phone</label>
                            <input type="tel" class="form-input" v-model="editFields.phone" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Email</label>
                            <input type="email" class="form-input" v-model="editFields.email" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Skype</label>
                            <input type="text" class="form-input" v-model="editFields.skype" />
                        </div>
                    </template>
                </EditablePanel>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue';
import { useProfileStore } from '../../stores/profile.js';
import { useInterviews } from '../../../composables/useInterviews.js';
import EditablePanel from '../layout/EditablePanel.vue';

const store = useProfileStore();
const {
    interviews: availableInterviews,
    isLoading: isLoadingInterviews,
    fetchInterviews,
    getProfileInterviews,
    updateProfileInterviews
} = useInterviews();

// Edit state
const editingSection = ref(null);
const isSaving = ref(false);
const editFields = reactive({});

// Featured interviews state
const featuredInterviews = ref([]);
const selectedInterviewIds = ref([]);
const searchTerm = ref('');
const isLoadingFeatured = ref(false);
const selectedForAdd = ref('');

// Computed
const expertiseTags = computed(() => {
    const tags = store.fields.expertise_tags;
    if (!tags) return [];
    if (Array.isArray(tags)) return tags;
    return tags.split(',').map((t) => t.trim()).filter(Boolean);
});

const hasAnyLinks = computed(() => {
    const links = store.socialLinks;
    return Object.values(links).some((v) => v);
});

// Social link configuration for v-for rendering
const socialLinkConfig = [
    { key: 'facebook', name: 'Facebook', icon: 'fab fa-facebook-f' },
    { key: 'linkedin', name: 'LinkedIn', icon: 'fab fa-linkedin-in' },
    { key: 'twitter', name: 'Twitter', icon: 'fab fa-twitter' },
    { key: 'instagram', name: 'Instagram', icon: 'fab fa-instagram' },
    { key: 'youtube', name: 'YouTube', icon: 'fab fa-youtube' },
    { key: 'tiktok', name: 'TikTok', icon: 'fab fa-tiktok' },
    { key: 'pinterest', name: 'Pinterest', icon: 'fab fa-pinterest-p' },
    { key: 'website1', name: 'Website', icon: 'fas fa-globe' },
    { key: 'website2', name: 'Website 2', icon: 'fas fa-globe' }
];

const activeLinks = computed(() => {
    return socialLinkConfig.filter(link => store.socialLinks[link.key]);
});

// Filtered available interviews based on search
const filteredInterviews = computed(() => {
    if (!searchTerm.value) return availableInterviews.value;
    const term = searchTerm.value.toLowerCase();
    return availableInterviews.value.filter(i =>
        i.title?.toLowerCase().includes(term) ||
        i.podcast_name?.toLowerCase().includes(term)
    );
});

// Hydrate selected IDs into full interview objects for card display
const selectedInterviewCards = computed(() => {
    return selectedInterviewIds.value
        .map(id => availableInterviews.value.find(i => i.id === id))
        .filter(Boolean);
});

// Dropdown options - all interviews available for selection
const dropdownOptions = computed(() => {
    return availableInterviews.value;
});

// Check if an interview is selected
const isInterviewSelected = (id) => selectedInterviewIds.value.includes(id);

// Add from dropdown
// FIX: Removed alert() - button is now disabled when limit reached for better UX
const addSelectedToFeatured = () => {
    if (!selectedForAdd.value || selectedInterviewIds.value.length >= 3) {
        return;
    }
    if (!isInterviewSelected(selectedForAdd.value)) {
        selectedInterviewIds.value = [...selectedInterviewIds.value, selectedForAdd.value];
    }
    selectedForAdd.value = '';
};

// Remove from featured
const removeFromFeatured = (idToRemove) => {
    selectedInterviewIds.value = selectedInterviewIds.value.filter(id => id !== idToRemove);
};

// Toggle interview selection (kept for backward compatibility)
const toggleInterview = (id) => {
    const idx = selectedInterviewIds.value.indexOf(id);
    if (idx === -1) {
        selectedInterviewIds.value = [...selectedInterviewIds.value, id];
    } else {
        selectedInterviewIds.value = selectedInterviewIds.value.filter(i => i !== id);
    }
};

// Load featured interviews for the profile
const loadFeaturedInterviews = async () => {
    if (!store.postId) return;

    isLoadingFeatured.value = true;
    try {
        const interviews = await getProfileInterviews(store.postId);
        featuredInterviews.value = interviews || [];
        selectedInterviewIds.value = featuredInterviews.value.map(i => i.id);
    } catch (error) {
        console.error('Failed to load featured interviews:', error);
        featuredInterviews.value = [];
        selectedInterviewIds.value = [];
    } finally {
        isLoadingFeatured.value = false;
    }
};

// Save featured interviews
const saveFeaturedInterviews = async () => {
    if (!store.postId) return false;

    try {
        await updateProfileInterviews(store.postId, selectedInterviewIds.value);
        // Refresh featured interviews
        await loadFeaturedInterviews();
        return true;
    } catch (error) {
        console.error('Failed to save featured interviews:', error);
        return false;
    }
};

// Initialize on mount
onMounted(async () => {
    // Fetch available interviews and load featured interviews in parallel
    await Promise.all([
        fetchInterviews({ status: 'publish', perPage: 100 }),
        loadFeaturedInterviews(),
    ]);
});

// Section field mappings
const sectionFields = {
    audience: ['expertise_tags', 'hook_who'],
    'why-book': ['why_book_you'],
    links: [
        'social_facebook', 'social_twitter', 'social_instagram',
        'social_linkedin', 'social_youtube', 'social_pinterest',
        'social_tiktok', 'website_primary', 'website_secondary',
    ],
    contact: [
        'first_name', 'last_name', 'phonetic', 'company',
        'phone', 'email', 'skype',
    ],
};

// Methods
const startEditing = (sectionId) => {
    editingSection.value = sectionId;

    // Copy current values to edit fields
    const fields = sectionFields[sectionId] || [];
    fields.forEach((field) => {
        editFields[field] = store.fields[field] || '';
    });
};

const cancelEditing = () => {
    editingSection.value = null;
    // Clear edit fields
    Object.keys(editFields).forEach((key) => {
        delete editFields[key];
    });
};

const saveSection = async (sectionId) => {
    isSaving.value = true;

    try {
        const fields = sectionFields[sectionId] || [];

        // Update store
        fields.forEach((field) => {
            store.updateField(field, editFields[field]);
        });

        // Save to server
        const success = await store.saveFields(fields);

        if (success) {
            editingSection.value = null;
        }
    } finally {
        isSaving.value = false;
    }
};

// Interviews section methods
const startEditingInterviews = () => {
    editingSection.value = 'interviews';
    // Initialize selection from featured interviews
    selectedInterviewIds.value = featuredInterviews.value.map(i => i.id);
    searchTerm.value = '';
    selectedForAdd.value = '';
};

const cancelInterviewsEditing = () => {
    editingSection.value = null;
    // Reset selection to match current featured interviews
    selectedInterviewIds.value = featuredInterviews.value.map(i => i.id);
    searchTerm.value = '';
    selectedForAdd.value = '';
};

const saveInterviewsSection = async () => {
    isSaving.value = true;

    try {
        const success = await saveFeaturedInterviews();

        if (success) {
            editingSection.value = null;
            searchTerm.value = '';
            showAddForm.value = false;
        }
    } finally {
        isSaving.value = false;
    }
};

// Helper functions for interview display
const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
};

const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
};
</script>

<style scoped>
.overview-tab {
    /* Uses parent padding */
}

.grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
}

@media (min-width: 768px) {
    .grid {
        grid-template-columns: 2fr 1fr;
    }
}

.main-content,
.sidebar {
    display: flex;
    flex-direction: column;
}

/* Text areas */
.text-area {
    margin-bottom: 20px;
}

.text-area:last-child {
    margin-bottom: 0;
}

.text-area h3 {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #334155;
}

.text-area p {
    font-size: 14px;
    line-height: 1.6;
    color: #334155;
    margin: 0;
}

/* Tags */
.tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.tag {
    background-color: #f1f5f9;
    color: #64748b;
    font-size: 14px;
    padding: 6px 12px;
    border-radius: 6px;
}

/* Empty states */
.empty-text {
    color: #94a3b8;
    font-style: italic;
    font-size: 14px;
}

.info-icon {
    margin-right: 4px;
}

/* Links list */
.links-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.link-item {
    display: flex;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #f1f5f9;
}

.link-item:last-child {
    border-bottom: none;
}

.link-icon {
    margin-right: 12px;
    font-size: 16px;
    width: 20px;
    color: #64748b;
}

.link-item a {
    color: #0284c7;
    text-decoration: none;
}

.link-item a:hover {
    text-decoration: underline;
}

/* Contact items */
.contact-item {
    display: flex;
    align-items: center;
    padding: 8px 0;
}

.contact-label {
    font-size: 14px;
    font-weight: 500;
    color: #0f172a;
    width: 100px;
    flex-shrink: 0;
}

.contact-value {
    font-size: 14px;
    color: #334155;
}

/* Interviews */
.interviews-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.interview-item {
    padding: 16px 0;
    border-bottom: 1px solid #f1f5f9;
}

.interview-item:last-child {
    border-bottom: none;
}

.interview-meta {
    margin-bottom: 8px;
}

.podcast-name {
    font-weight: 600;
    color: #0f172a;
    margin-right: 8px;
}

.episode-title {
    color: #64748b;
}

.episode-title a {
    color: #0284c7;
    text-decoration: none;
}

.interview-link {
    font-size: 13px;
    color: #14b8a6;
    text-decoration: none;
}

.interview-link:hover {
    text-decoration: underline;
}

/* Empty interviews state */
.empty-interviews {
    padding: 16px;
    text-align: center;
    background: #f9fafb;
    border-radius: 8px;
}

/* Loading state */
.loading-state {
    padding: 24px;
    text-align: center;
    color: #6b7280;
}

.spinner {
    width: 24px;
    height: 24px;
    border: 2px solid #e5e7eb;
    border-top-color: #14b8a6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 8px;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* Empty state for selector */
.empty-state {
    padding: 20px;
    text-align: center;
    background: #f9fafb;
    border-radius: 8px;
}

.empty-state p {
    margin: 0;
    font-size: 14px;
    color: #6b7280;
}

/* Selected Interviews Cards (Dropdown UI) */
.selected-interviews-cards {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
}

.featured-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;
}

.featured-card:hover {
    border-color: #14b8a6;
    box-shadow: 0 2px 6px rgba(20, 184, 166, 0.1);
}

.featured-card-content {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-width: 0;
}

.featured-card-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f0fdfa;
    border-radius: 8px;
    font-size: 18px;
    flex-shrink: 0;
}

.featured-card-info {
    flex: 1;
    min-width: 0;
}

.featured-card-title {
    font-weight: 600;
    color: #0f172a;
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.featured-card-subtitle {
    font-size: 13px;
    color: #64748b;
    margin-top: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.featured-card-remove {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.15s;
    font-size: 14px;
    flex-shrink: 0;
}

.featured-card-remove:hover {
    background: #fef2f2;
    color: #ef4444;
}

.empty-selection-state {
    padding: 20px;
    text-align: center;
    background: #f9fafb;
    border: 2px dashed #e2e8f0;
    border-radius: 8px;
    margin-bottom: 16px;
}

.empty-selection-state p {
    margin: 0;
    color: #64748b;
    font-size: 14px;
}

/* Dropdown Selector */
.add-interview-dropdown {
    background: #f8fafc;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 16px;
}

.dropdown-label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    color: #64748b;
    margin-bottom: 8px;
    letter-spacing: 0.5px;
}

.dropdown-row {
    display: flex;
    gap: 8px;
}

.form-select {
    flex: 1;
    padding: 10px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 14px;
    background: white;
    color: #334155;
    cursor: pointer;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.form-select:focus {
    outline: none;
    border-color: #14b8a6;
    box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
}

.form-select:disabled {
    background: #f1f5f9;
    color: #94a3b8;
    cursor: not-allowed;
}

.btn-add {
    padding: 10px 20px;
    background: #14b8a6;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.2s;
}

.btn-add:hover {
    background: #0d9488;
}

.btn-add:disabled {
    background: #94a3b8;
    cursor: not-allowed;
}

.selection-hint {
    margin: 8px 0 0;
    font-size: 12px;
    color: #64748b;
}

.mb-4 {
    margin-bottom: 16px;
}

/* Add new interview section */
.add-new-interview-section {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #e2e8f0;
    text-align: center;
}

.add-portfolio-link {
    display: inline-block;
    padding: 10px 16px;
    color: #14b8a6;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    border: 1px dashed #14b8a6;
    border-radius: 6px;
    transition: all 0.2s;
}

.add-portfolio-link:hover {
    background: #f0fdfa;
    border-style: solid;
}

/* Add interview section */
.add-interview-section {
    margin-bottom: 20px;
}

.add-interview-btn {
    width: 100%;
    padding: 12px;
    border: 2px dashed #e2e8f0;
    border-radius: 8px;
    background: transparent;
    color: #14b8a6;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.add-interview-btn:hover {
    border-color: #14b8a6;
    background: #f0fdfa;
}

.add-interview-form {
    padding: 16px;
    background: #f8fafc;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
}

.add-interview-form h4 {
    margin: 0 0 16px 0;
    font-size: 14px;
    font-weight: 600;
    color: #334155;
}

.form-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    margin-top: 16px;
}

.btn-secondary {
    padding: 8px 16px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    background: white;
    color: #64748b;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
}

.btn-secondary:hover {
    background: #f8fafc;
}

.btn-primary {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    background: #14b8a6;
    color: white;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
}

.btn-primary:hover {
    background: #0d9488;
}

.btn-primary:disabled {
    background: #94a3b8;
    cursor: not-allowed;
}

/* Select interviews section */
.select-interviews-section {
    margin-top: 16px;
}

.select-interviews-section h4 {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: #334155;
}

/* Search box */
.search-box {
    margin-bottom: 12px;
}

.search-input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 14px;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.search-input:focus {
    outline: none;
    border-color: #14b8a6;
    box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
}

/* Interviews checklist */
.interviews-checklist {
    max-height: 240px;
    overflow-y: auto;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
}

.interview-checkbox {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    cursor: pointer;
    transition: background 0.15s;
    border-bottom: 1px solid #f3f4f6;
}

.interview-checkbox:last-child {
    border-bottom: none;
}

.interview-checkbox:hover {
    background: #f9fafb;
}

.interview-checkbox.is-selected {
    background: #ecfdf5;
}

.interview-checkbox input {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
}

.interview-info {
    flex: 1;
    min-width: 0;
}

.interview-name {
    display: block;
    font-weight: 500;
    color: #111827;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 14px;
}

.interview-podcast {
    display: block;
    font-size: 12px;
    color: #6b7280;
    margin-top: 2px;
}

.selection-count {
    margin: 12px 0 0;
    font-size: 12px;
    color: #6b7280;
}

/* Edit groups */
.interview-edit-group {
    margin-bottom: 24px;
    padding-bottom: 24px;
    border-bottom: 1px solid #f1f5f9;
}

.interview-edit-group:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
}

.interview-edit-group h4 {
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 12px 0;
    color: #64748b;
}

/* Form elements */
.form-group {
    margin-bottom: 16px;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
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

.textarea {
    min-height: 100px;
    resize: vertical;
}

/* CTA Container */
.cta-container {
    margin-top: 20px;
    padding: 20px;
    text-align: center;
    background-color: #f8fafc;
    border-radius: 8px;
}

.cta-title {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 8px 0;
    color: #0f172a;
}

.cta-description {
    font-size: 14px;
    color: #64748b;
    margin: 0 0 16px 0;
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

.primary-button {
    background-color: #14b8a6;
    color: white;
}

.primary-button:hover {
    background-color: #0d9488;
}

/* Featured Interviews Media Player Styles */
.featured-interviews-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.episode-card {
    display: flex;
    gap: 16px;
    padding: 16px;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    transition: box-shadow 0.2s, border-color 0.2s;
}

.episode-card:hover {
    border-color: #14b8a6;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.episode-thumbnail-wrapper {
    flex-shrink: 0;
    width: 80px;
    height: 80px;
}

.episode-thumbnail {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
}

.episode-thumbnail-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
    border-radius: 8px;
    color: #9ca3af;
}

.episode-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
}

.episode-meta-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
}

.episode-date {
    font-size: 13px;
    color: #14b8a6;
    font-weight: 500;
}

.episode-duration {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: #6b7280;
}

.duration-icon {
    opacity: 0.7;
}

.episode-title {
    margin: 0 0 4px 0;
    font-size: 16px;
    font-weight: 600;
    color: #0f172a;
    line-height: 1.4;
}

.episode-podcast-name {
    font-size: 14px;
    color: #64748b;
    margin-bottom: 8px;
}

.episode-description {
    font-size: 14px;
    color: #4b5563;
    line-height: 1.5;
    margin: 0 0 12px 0;
}

.episode-player {
    margin-top: auto;
}

.episode-player audio {
    width: 100%;
    height: 40px;
    border-radius: 20px;
}

.episode-listen-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 20px;
    background: #14b8a6;
    color: #fff;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 500;
    font-size: 14px;
    transition: background 0.2s, transform 0.2s;
    margin-top: auto;
    width: fit-content;
}

.episode-listen-btn:hover {
    background: #0d9488;
    transform: translateY(-1px);
}

/* Responsive: Stack on small screens */
@media (max-width: 480px) {
    .episode-card {
        flex-direction: column;
    }

    .episode-thumbnail-wrapper {
        width: 100%;
        height: 160px;
    }
}
</style>
