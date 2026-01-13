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
                    <template #header-action>
                        <a :href="biographyGeneratorUrl" target="_blank" class="header-ai-link" title="Generate with AI">
                            <AiSparkleIcon :size="14" />
                        </a>
                    </template>

                    <template #display>
                        <div class="text-area">
                            <div v-if="store.fields.biography" class="preserve-lines" v-html="formatWithLineBreaks(store.fields.biography)"></div>
                            <div v-else class="empty-text">
                                <p>
                                    <span class="info-icon">i</span>
                                    Your biography demonstrates your value to podcast hosts through your expertise,
                                    stories and results that you share.
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
                    <template #header-action>
                        <a :href="guestIntroGeneratorUrl" target="_blank" class="header-ai-link" title="Generate with AI">
                            <AiSparkleIcon :size="14" />
                        </a>
                    </template>

                    <template #display>
                        <div class="text-area">
                            <div v-if="store.fields.podcast_intro" class="preserve-lines" v-html="formatWithLineBreaks(store.fields.podcast_intro)"></div>
                            <div v-else class="empty-text">
                                <p>
                                    <span class="info-icon">i</span>
                                    Click edit to add your Podcast Intro to make it easy for hosts
                                    to book and introduce you on their show.
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
                    <template #header-action>
                        <a :href="taglineGeneratorUrl" target="_blank" class="header-ai-link" title="Generate with AI">
                            <AiSparkleIcon :size="14" />
                        </a>
                    </template>

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

                <!-- Authority Hook (6 W's) Panel -->
                <EditablePanel
                    title="Authority Hook (6 W's)"
                    section-id="authority-hook"
                    :is-editing="editingSection === 'authority-hook'"
                    :is-saving="isSaving"
                    @edit="startEditing"
                    @save="saveSection"
                    @cancel="cancelEditing"
                >
                    <template #header-action>
                        <a :href="authorityHookBuilderUrl" target="_blank" class="header-ai-link" title="Generate with AI">
                            <AiSparkleIcon :size="14" />
                        </a>
                    </template>

                    <template #display>
                        <div class="hook-fields">
                            <div class="hook-field">
                                <span class="hook-label">WHO (Target):</span>
                                <span class="hook-value">{{ store.fields.hook_who || '—' }}</span>
                            </div>
                            <div class="hook-field">
                                <span class="hook-label">WHAT (Result):</span>
                                <span class="hook-value">{{ store.fields.hook_what || '—' }}</span>
                            </div>
                            <div class="hook-field">
                                <span class="hook-label">WHEN (Situation):</span>
                                <span class="hook-value">{{ store.fields.hook_when || '—' }}</span>
                            </div>
                            <div class="hook-field">
                                <span class="hook-label">HOW (Method):</span>
                                <span class="hook-value">{{ store.fields.hook_how || '—' }}</span>
                            </div>
                            <div class="hook-field">
                                <span class="hook-label">WHERE (Results):</span>
                                <span class="hook-value">{{ store.fields.hook_where || '—' }}</span>
                            </div>
                            <div class="hook-field">
                                <span class="hook-label">WHY (Mission):</span>
                                <span class="hook-value">{{ store.fields.hook_why || '—' }}</span>
                            </div>
                        </div>
                    </template>

                    <template #edit>
                        <div class="form-group">
                            <label class="form-label">WHO do you help?</label>
                            <input
                                type="text"
                                class="form-input"
                                v-model="editFields.hook_who"
                                placeholder="e.g. SaaS founders, busy entrepreneurs..."
                            />
                        </div>
                        <div class="form-group">
                            <label class="form-label">WHAT result do they get?</label>
                            <input
                                type="text"
                                class="form-input"
                                v-model="editFields.hook_what"
                                placeholder="e.g. Scale to $1M ARR, double their client base..."
                            />
                        </div>
                        <div class="form-group">
                            <label class="form-label">WHEN (in what situation)?</label>
                            <input
                                type="text"
                                class="form-input"
                                v-model="editFields.hook_when"
                                placeholder="e.g. When stuck at a growth plateau..."
                            />
                        </div>
                        <div class="form-group">
                            <label class="form-label">HOW (your unique method)?</label>
                            <input
                                type="text"
                                class="form-input"
                                v-model="editFields.hook_how"
                                placeholder="e.g. Through AI-driven marketing systems..."
                            />
                        </div>
                        <div class="form-group">
                            <label class="form-label">WHERE (your results/credentials)?</label>
                            <input
                                type="text"
                                class="form-input"
                                v-model="editFields.hook_where"
                                placeholder="e.g. Helped 200+ SaaS founders, grew businesses to $10M..."
                            />
                        </div>
                        <div class="form-group">
                            <label class="form-label">WHY (your mission/purpose)?</label>
                            <input
                                type="text"
                                class="form-input"
                                v-model="editFields.hook_why"
                                placeholder="e.g. To make sustainable growth accessible to all..."
                            />
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
                    <template #header-action>
                        <a :href="impactIntroBuilderUrl" target="_blank" class="header-ai-link" title="Generate with AI">
                            <AiSparkleIcon :size="14" />
                        </a>
                    </template>

                    <template #display>
                        <div class="text-area">
                            <div v-if="store.fields.impact_intro" class="preserve-lines" v-html="formatWithLineBreaks(store.fields.impact_intro)"></div>
                            <div v-else class="empty-text">
                                <p>No impact intro defined</p>
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
import { AiSparkleIcon } from '../icons';
import { toolModules } from '../../../../tools/index.js';

const store = useProfileStore();

/**
 * Get tool URL from tool meta using apiType
 * Tool URLs are derived from each tool's slug in meta.json for tool independence
 * @param {string} apiType - The tool's API type (e.g., 'biography', 'tagline')
 * @returns {string} The tool's base URL
 */
const getToolBaseUrl = (apiType) => {
    for (const [, module] of Object.entries(toolModules)) {
        if (module.meta?.apiType === apiType && module.meta?.slug) {
            return `/tools/${module.meta.slug}/`;
        }
    }
    // Fallback to apiType-based URL if not found
    return `/tools/${apiType.replace(/_/g, '-')}/`;
};

// Generate dynamic URLs with entry parameter
const buildToolUrl = (apiType) => {
    const baseUrl = getToolBaseUrl(apiType);
    const entry = store.postData?.slug;
    if (entry) {
        return `${baseUrl}?frm_action=edit&entry=${entry}`;
    }
    return baseUrl;
};

// Computed URLs using tool-defined slugs from meta.json
const biographyGeneratorUrl = computed(() => buildToolUrl('biography'));
const guestIntroGeneratorUrl = computed(() => buildToolUrl('guest_intro'));
const taglineGeneratorUrl = computed(() => buildToolUrl('tagline'));
const authorityHookBuilderUrl = computed(() => buildToolUrl('authority_hook'));
const impactIntroBuilderUrl = computed(() => buildToolUrl('impact_intro'));

// Helper to preserve line breaks in text
const formatWithLineBreaks = (text) => {
    if (!text) return '';
    // If text already has HTML tags (like <p>), return as-is
    if (/<[^>]+>/.test(text)) return text;
    // Convert double newlines to paragraph breaks, single newlines to <br>
    const paragraphs = text
        .split(/\n\n+/)
        .map(para => para.trim().replace(/\n/g, '<br>'))
        .filter(para => para);
    return '<p>' + paragraphs.join('</p><p>') + '</p>';
};

// Edit state
const editingSection = ref(null);
const isSaving = ref(false);
const editFields = reactive({});

// Section field mappings
const sectionFields = {
    biography: ['biography'],
    'guest-intro': ['podcast_intro'],
    tagline: ['tagline'],
    'authority-hook': ['hook_who', 'hook_what', 'hook_when', 'hook_how', 'hook_where', 'hook_why'],
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

/* Header AI link */
.header-ai-link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    color: #8b5cf6;
    background: linear-gradient(135deg, #f5f3ff 0%, #fdf4ff 100%);
    border: 1px solid #e9d5ff;
    transition: all 0.2s ease;
}

.header-ai-link:hover {
    background: linear-gradient(135deg, #ede9fe 0%, #fae8ff 100%);
    border-color: #d8b4fe;
    transform: scale(1.05);
}

/* Preserve line breaks in text content */
.preserve-lines {
    line-height: 1.6;
}

.preserve-lines p {
    margin: 0 0 1em 0;
}

.preserve-lines p:last-child {
    margin-bottom: 0;
}

/* Info icon and AI link styles are in profile.css */

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

/* Hook fields styling */
.hook-fields {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.hook-field {
    display: flex;
    gap: 8px;
    font-size: 14px;
    line-height: 1.5;
}

.hook-label {
    font-weight: 600;
    color: #64748b;
    min-width: 140px;
    flex-shrink: 0;
}

.hook-value {
    color: #334155;
}
</style>
