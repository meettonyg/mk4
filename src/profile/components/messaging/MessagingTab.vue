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
                                    <span class="info-icon">ℹ</span>
                                    Your biography demonstrates your value to podcast hosts through your expertise,
                                    stories and results that you share.
                                </p>
                                <p>
                                    <a :href="biographyGeneratorUrl" target="_blank">
                                        🤖 Create your Podcast Biography with AI
                                    </a>
                                </p>
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
                                    <span class="info-icon">ℹ</span>
                                    Click edit to add your Podcast Intro to make it easy for hosts
                                    to book and introduce you on their show.
                                </p>
                                <p>
                                    <a href="/app/message-builder/message-builder-ai/#intro" target="_blank">
                                        🤖 Create your Podcast Intro with AI
                                    </a>
                                </p>
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
                                <p>
                                    <a :href="authorityHookBuilderUrl" target="_blank">
                                        🤖 Create your Authority Hook with AI
                                    </a>
                                </p>
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
                                <p>
                                    <a :href="impactIntroBuilderUrl" target="_blank">
                                        🤖 Create your Impact Intro with AI
                                    </a>
                                </p>
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

// URL constants for AI tools
const BIOGRAPHY_GENERATOR_BASE_URL = '/app/biography-generator/';
const AUTHORITY_HOOK_BUILDER_URL = '/tools/authority-hook-builder/tool/';
const IMPACT_INTRO_BUILDER_URL = '/tools/impact-intro-builder/tool/';

// Generate dynamic URLs with entry parameter
const biographyGeneratorUrl = computed(() => {
    const entry = store.postData?.slug;
    if (entry) {
        return `${BIOGRAPHY_GENERATOR_BASE_URL}?frm_action=edit&entry=${entry}`;
    }
    return BIOGRAPHY_GENERATOR_BASE_URL;
});

const authorityHookBuilderUrl = computed(() => {
    return AUTHORITY_HOOK_BUILDER_URL;
});

const impactIntroBuilderUrl = computed(() => {
    return IMPACT_INTRO_BUILDER_URL;
});

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
    margin-right: 4px;
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
