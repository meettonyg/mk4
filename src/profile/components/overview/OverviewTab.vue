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

                <!-- Noteworthy Interviews Panel -->
                <EditablePanel
                    title="Noteworthy Interviews"
                    section-id="interviews"
                    :is-editing="editingSection === 'interviews'"
                    :is-saving="isSaving"
                    @edit="startEditing"
                    @save="saveSection"
                    @cancel="cancelEditing"
                >
                    <template #display>
                        <ul class="interviews-list">
                            <li
                                v-for="interview in store.interviews"
                                :key="interview.id"
                                class="interview-item"
                            >
                                <div class="interview-details">
                                    <div class="interview-meta">
                                        <span class="podcast-name">Podcast {{ interview.id }}</span>
                                        <span class="episode-title">
                                            <a
                                                v-if="interview.link"
                                                :href="interview.link"
                                                target="_blank"
                                            >
                                                {{ interview.title || 'Episode Title' }}
                                            </a>
                                            <span v-else>{{ interview.title || '—' }}</span>
                                        </span>
                                    </div>
                                    <a
                                        v-if="interview.link"
                                        :href="interview.link"
                                        class="interview-link"
                                        target="_blank"
                                    >
                                        Listen Here →
                                    </a>
                                </div>
                            </li>
                        </ul>
                    </template>

                    <template #edit>
                        <div v-for="i in 3" :key="i" class="interview-edit-group">
                            <h4>Interview {{ i }}</h4>
                            <div class="form-group">
                                <label class="form-label">Episode Title</label>
                                <input
                                    type="text"
                                    class="form-input"
                                    v-model="editFields[`episode_${i}_title`]"
                                    placeholder="Episode title..."
                                />
                            </div>
                            <div class="form-group">
                                <label class="form-label">Episode Link</label>
                                <input
                                    type="url"
                                    class="form-input"
                                    v-model="editFields[`episode_${i}_link`]"
                                    placeholder="https://..."
                                />
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
                            <li v-if="store.socialLinks.facebook" class="link-item">
                                <span class="link-icon">📘</span>
                                <a :href="store.socialLinks.facebook" target="_blank">Facebook</a>
                            </li>
                            <li v-if="store.socialLinks.linkedin" class="link-item">
                                <span class="link-icon">💼</span>
                                <a :href="store.socialLinks.linkedin" target="_blank">LinkedIn</a>
                            </li>
                            <li v-if="store.socialLinks.twitter" class="link-item">
                                <span class="link-icon">🐦</span>
                                <a :href="store.socialLinks.twitter" target="_blank">Twitter</a>
                            </li>
                            <li v-if="store.socialLinks.instagram" class="link-item">
                                <span class="link-icon">📷</span>
                                <a :href="store.socialLinks.instagram" target="_blank">Instagram</a>
                            </li>
                            <li v-if="store.socialLinks.youtube" class="link-item">
                                <span class="link-icon">🎬</span>
                                <a :href="store.socialLinks.youtube" target="_blank">YouTube</a>
                            </li>
                            <li v-if="store.socialLinks.tiktok" class="link-item">
                                <span class="link-icon">🎵</span>
                                <a :href="store.socialLinks.tiktok" target="_blank">TikTok</a>
                            </li>
                            <li v-if="store.socialLinks.pinterest" class="link-item">
                                <span class="link-icon">📌</span>
                                <a :href="store.socialLinks.pinterest" target="_blank">Pinterest</a>
                            </li>
                            <li v-if="store.socialLinks.website1" class="link-item">
                                <span class="link-icon">🔗</span>
                                <a :href="store.socialLinks.website1" target="_blank">Website</a>
                            </li>
                            <li v-if="store.socialLinks.website2" class="link-item">
                                <span class="link-icon">🔗</span>
                                <a :href="store.socialLinks.website2" target="_blank">Website 2</a>
                            </li>
                            <li v-if="!hasAnyLinks" class="empty-text">
                                No links added yet
                            </li>
                        </ul>
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
import { ref, computed, reactive, watch } from 'vue';
import { useProfileStore } from '../../stores/profile.js';
import EditablePanel from '../layout/EditablePanel.vue';

const store = useProfileStore();

// Edit state
const editingSection = ref(null);
const isSaving = ref(false);
const editFields = reactive({});

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

// Section field mappings
const sectionFields = {
    audience: ['expertise_tags', 'hook_who'],
    'why-book': ['why_book_you'],
    interviews: [
        'episode_1_title', 'episode_1_link',
        'episode_2_title', 'episode_2_link',
        'episode_3_title', 'episode_3_link',
    ],
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
</style>
