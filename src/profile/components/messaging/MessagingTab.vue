<template>
    <div class="messaging-tab">
        <div class="grid">
            <!-- Main Content -->
            <div class="main-content">
                <!-- Biography Panel -->
                <EditablePanel
                    title="Biography"
                    section-id="biography"
                    :is-editing="editingSection === 'biography'"
                    :is-saving="isSaving"
                    @edit="startEditing"
                    @save="saveSection"
                    @cancel="cancelEditing"
                >
                    <template #display>
                        <div class="text-area">
                            <div v-if="store.fields.biography" v-html="store.fields.biography"></div>
                            <div v-else class="empty-text">
                                <p>
                                    <span class="info-icon">i</span>
                                    Your biography demonstrates your value to podcast hosts through your expertise,
                                    stories and results that you share.
                                </p>
                                <a :href="biographyGeneratorUrl" target="_blank" class="ai-link">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
                                        <path d="M20 3v4"/>
                                        <path d="M22 5h-4"/>
                                        <path d="M4 17v2"/>
                                        <path d="M5 18H3"/>
                                    </svg>
                                    Create your Podcast Biography with AI
                                </a>
                            </div>
                        </div>
                    </template>

                    <template #edit>
                        <div class="form-group">
                            <label class="form-label">
                                Biography (300-500 words, written in third person)
                            </label>
                            <textarea
                                class="form-input textarea tall"
                                v-model="editFields.biography"
                                rows="10"
                                placeholder="Write your biography in third person..."
                            ></textarea>
                        </div>
                    </template>
                </EditablePanel>

                <!-- Guest Intro Panel -->
                <EditablePanel
                    title="Guest Intro"
                    section-id="guest-intro"
                    :is-editing="editingSection === 'guest-intro'"
                    :is-saving="isSaving"
                    @edit="startEditing"
                    @save="saveSection"
                    @cancel="cancelEditing"
                >
                    <template #display>
                        <div class="text-area">
                            <div v-if="store.fields.podcast_intro" v-html="store.fields.podcast_intro"></div>
                            <div v-else class="empty-text">
                                <p>
                                    <span class="info-icon">i</span>
                                    Click edit to add your Podcast Intro to make it easy for hosts
                                    to book and introduce you on their show.
                                </p>
                                <a :href="guestIntroGeneratorUrl" target="_blank" class="ai-link">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
                                        <path d="M20 3v4"/>
                                        <path d="M22 5h-4"/>
                                        <path d="M4 17v2"/>
                                        <path d="M5 18H3"/>
                                    </svg>
                                    Create your Podcast Intro with AI
                                </a>
                            </div>
                        </div>
                    </template>

                    <template #edit>
                        <div class="form-group">
                            <label class="form-label">
                                Podcast Intro (short bio, less than 50 words)
                            </label>
                            <textarea
                                class="form-input textarea"
                                v-model="editFields.podcast_intro"
                                rows="4"
                                placeholder="A brief introduction for podcast hosts..."
                            ></textarea>
                        </div>
                    </template>
                </EditablePanel>
            </div>

            <!-- Sidebar -->
            <div class="sidebar">
                <!-- Tagline Panel -->
                <EditablePanel
                    title="Tagline"
                    section-id="tagline"
                    :is-editing="editingSection === 'tagline'"
                    :is-saving="isSaving"
                    @edit="startEditing"
                    @save="saveSection"
                    @cancel="cancelEditing"
                >
                    <template #display>
                        <div class="text-area">
                            <p>{{ store.fields.tagline || '—' }}</p>
                        </div>
                    </template>

                    <template #edit>
                        <div class="form-group">
                            <label class="form-label">Your Tagline</label>
                            <input
                                type="text"
                                class="form-input"
                                v-model="editFields.tagline"
                                placeholder="A memorable tagline..."
                            />
                        </div>
                    </template>
                </EditablePanel>

                <!-- Authority Hook Panel -->
                <EditablePanel
                    title="Authority Hook"
                    section-id="authority-hook"
                    :is-editing="editingSection === 'authority-hook'"
                    :is-saving="isSaving"
                    @edit="startEditing"
                    @save="saveSection"
                    @cancel="cancelEditing"
                >
                    <template #display>
                        <div class="text-area">
                            <div v-if="store.fields.authority_hook" v-html="store.fields.authority_hook"></div>
                            <div v-else class="empty-text">
                                <p>No authority hook defined</p>
                                <a :href="authorityHookBuilderUrl" target="_blank" class="ai-link">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
                                        <path d="M20 3v4"/>
                                        <path d="M22 5h-4"/>
                                        <path d="M4 17v2"/>
                                        <path d="M5 18H3"/>
                                    </svg>
                                    Create your Authority Hook with AI
                                </a>
                            </div>
                        </div>
                    </template>

                    <template #edit>
                        <div class="form-group">
                            <label class="form-label">Authority Hook</label>
                            <textarea
                                class="form-input textarea"
                                v-model="editFields.authority_hook"
                                rows="4"
                                placeholder="I help [audience] achieve [result] when they need [timing] through [method]..."
                            ></textarea>
                        </div>
                    </template>
                </EditablePanel>

                <!-- Impact Intro Panel -->
                <EditablePanel
                    title="Impact Intro"
                    section-id="impact-intro"
                    :is-editing="editingSection === 'impact-intro'"
                    :is-saving="isSaving"
                    @edit="startEditing"
                    @save="saveSection"
                    @cancel="cancelEditing"
                >
                    <template #display>
                        <div class="text-area">
                            <div v-if="store.fields.impact_intro" v-html="store.fields.impact_intro"></div>
                            <div v-else class="empty-text">
                                <p>No impact intro defined</p>
                                <a :href="impactIntroBuilderUrl" target="_blank" class="ai-link">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
                                        <path d="M20 3v4"/>
                                        <path d="M22 5h-4"/>
                                        <path d="M4 17v2"/>
                                        <path d="M5 18H3"/>
                                    </svg>
                                    Create your Impact Intro with AI
                                </a>
                            </div>
                        </div>
                    </template>

                    <template #edit>
                        <div class="form-group">
                            <label class="form-label">Impact Intro</label>
                            <textarea
                                class="form-input textarea"
                                v-model="editFields.impact_intro"
                                rows="4"
                                placeholder="Describe the impact you create..."
                            ></textarea>
                        </div>
                    </template>
                </EditablePanel>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useProfileStore } from '../../stores/profile.js';
import EditablePanel from '../layout/EditablePanel.vue';

const store = useProfileStore();

// URL constants
const BIOGRAPHY_GENERATOR_BASE_URL = '/app/biography-generator/';
const GUEST_INTRO_GENERATOR_BASE_URL = '/app/guest-intro-generator/';
const AUTHORITY_HOOK_BUILDER_BASE_URL = '/app/authority-hook-builder/';
const IMPACT_INTRO_BUILDER_BASE_URL = '/app/impact-intro-builder/';

// Generate dynamic URLs with entry parameter
const buildToolUrl = (baseUrl) => {
    const entry = store.postData?.slug;
    if (entry) {
        return `${baseUrl}?frm_action=edit&entry=${entry}`;
    }
    return baseUrl;
};

const biographyGeneratorUrl = computed(() => buildToolUrl(BIOGRAPHY_GENERATOR_BASE_URL));
const guestIntroGeneratorUrl = computed(() => buildToolUrl(GUEST_INTRO_GENERATOR_BASE_URL));
const authorityHookBuilderUrl = computed(() => buildToolUrl(AUTHORITY_HOOK_BUILDER_BASE_URL));
const impactIntroBuilderUrl = computed(() => buildToolUrl(IMPACT_INTRO_BUILDER_BASE_URL));

// Edit state
const editingSection = ref(null);
const isSaving = ref(false);
const editFields = reactive({});

// Section field mappings
const sectionFields = {
    biography: ['biography'],
    'guest-intro': ['podcast_intro'],
    tagline: ['tagline'],
    'authority-hook': ['authority_hook'],
    'impact-intro': ['impact_intro'],
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
            store.updateField(field, editFields[field]);
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
.messaging-tab {
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
    font-size: 14px;
    line-height: 1.6;
    color: #334155;
}

.text-area p {
    margin: 0 0 12px 0;
}

.text-area p:last-child {
    margin-bottom: 0;
}

/* Empty states */
.empty-text {
    color: #64748b;
}

.empty-text p {
    margin: 0 0 12px 0;
}

.empty-text a {
    color: #0284c7;
    text-decoration: none;
}

.empty-text a:hover {
    text-decoration: underline;
}

.info-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #e2e8f0;
    color: #64748b;
    font-size: 11px;
    font-weight: 600;
    font-style: normal;
    margin-right: 6px;
}

/* AI Link styling */
.ai-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    background: linear-gradient(135deg, #f0f9ff 0%, #faf5ff 100%);
    border: 1px solid #e0e7ff;
    border-radius: 8px;
    color: #6366f1;
    font-size: 13px;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.2s ease;
    margin-top: 4px;
}

.ai-link:hover {
    background: linear-gradient(135deg, #e0f2fe 0%, #f3e8ff 100%);
    border-color: #c7d2fe;
    color: #4f46e5;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.15);
    text-decoration: none;
}

.ai-link svg {
    flex-shrink: 0;
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

.textarea {
    min-height: 100px;
    resize: vertical;
    font-family: inherit;
}

.textarea.tall {
    min-height: 200px;
}
</style>
