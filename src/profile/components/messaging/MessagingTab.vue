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
                        <div v-if="hasAnyIntro" class="intro-versions">
                            <div v-if="store.fields.introduction_short" class="intro-version intro-version--short">
                                <div class="intro-version-header">
                                    <span class="intro-version-badge intro-version-badge--short">Short (30-45s)</span>
                                </div>
                                <div class="intro-version-text preserve-lines" v-html="formatWithLineBreaks(store.fields.introduction_short)"></div>
                            </div>
                            <div v-if="store.fields.introduction || store.fields.podcast_intro" class="intro-version intro-version--medium">
                                <div class="intro-version-header">
                                    <span class="intro-version-badge intro-version-badge--medium">Medium (60-90s)</span>
                                </div>
                                <div class="intro-version-text preserve-lines" v-html="formatWithLineBreaks(store.fields.introduction || store.fields.podcast_intro)"></div>
                            </div>
                            <div v-if="store.fields.introduction_long" class="intro-version intro-version--long">
                                <div class="intro-version-header">
                                    <span class="intro-version-badge intro-version-badge--long">Long (2-3 min)</span>
                                </div>
                                <div class="intro-version-text preserve-lines" v-html="formatWithLineBreaks(store.fields.introduction_long)"></div>
                            </div>
                        </div>
                        <div v-else class="empty-text">
                            <p>
                                <span class="info-icon">i</span>
                                Click edit to add your Podcast Intro to make it easy for hosts
                                to book and introduce you on their show.
                            </p>
                        </div>
                    </template>

                    <template #edit>
                        <div class="intro-edit-sections">
                            <div class="form-group">
                                <label class="form-label">
                                    <span class="intro-label-badge">Short</span>
                                    30-45 seconds (50-80 words)
                                </label>
                                <textarea
                                    class="form-input textarea"
                                    v-model="editFields.introduction_short"
                                    rows="3"
                                    placeholder="A punchy intro for fast-paced podcasts..."
                                ></textarea>
                            </div>
                            <div class="form-group">
                                <label class="form-label">
                                    <span class="intro-label-badge intro-label-badge--primary">Medium</span>
                                    60-90 seconds (100-150 words)
                                </label>
                                <textarea
                                    class="form-input textarea"
                                    v-model="editFields.introduction"
                                    rows="4"
                                    placeholder="A balanced intro with credibility..."
                                ></textarea>
                            </div>
                            <div class="form-group">
                                <label class="form-label">
                                    <span class="intro-label-badge">Long</span>
                                    2-3 minutes (200-350 words)
                                </label>
                                <textarea
                                    class="form-input textarea tall"
                                    v-model="editFields.introduction_long"
                                    rows="6"
                                    placeholder="A comprehensive intro for keynotes..."
                                ></textarea>
                            </div>
                        </div>
                    </template>
                </EditablePanel>

                <!-- 6 W's Panel -->
                <EditablePanel
                    title="6 W's"
                    section-id="six-ws"
                    :is-editing="editingSection === 'six-ws'"
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
                        <div class="six-ws-grid">
                            <div class="six-ws-item">
                                <span class="six-ws-label">WHO</span>
                                <span class="six-ws-sublabel">Target Audience</span>
                                <span class="six-ws-value">{{ store.fields.hook_who || '—' }}</span>
                            </div>
                            <div class="six-ws-item">
                                <span class="six-ws-label">WHAT</span>
                                <span class="six-ws-sublabel">Result They Get</span>
                                <span class="six-ws-value">{{ store.fields.hook_what || '—' }}</span>
                            </div>
                            <div class="six-ws-item">
                                <span class="six-ws-label">WHEN</span>
                                <span class="six-ws-sublabel">Situation</span>
                                <span class="six-ws-value">{{ store.fields.hook_when || '—' }}</span>
                            </div>
                            <div class="six-ws-item">
                                <span class="six-ws-label">HOW</span>
                                <span class="six-ws-sublabel">Your Method</span>
                                <span class="six-ws-value">{{ store.fields.hook_how || '—' }}</span>
                            </div>
                            <div class="six-ws-item">
                                <span class="six-ws-label">WHERE</span>
                                <span class="six-ws-sublabel">Your Results</span>
                                <span class="six-ws-value">{{ store.fields.hook_where || '—' }}</span>
                            </div>
                            <div class="six-ws-item">
                                <span class="six-ws-label">WHY</span>
                                <span class="six-ws-sublabel">Your Mission</span>
                                <span class="six-ws-value">{{ store.fields.hook_why || '—' }}</span>
                            </div>
                        </div>
                    </template>

                    <template #edit>
                        <div class="six-ws-edit-grid">
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
                                    placeholder="e.g. Helped 200+ SaaS founders..."
                                />
                            </div>
                            <div class="form-group">
                                <label class="form-label">WHY (your mission/purpose)?</label>
                                <input
                                    type="text"
                                    class="form-input"
                                    v-model="editFields.hook_why"
                                    placeholder="e.g. To make sustainable growth accessible..."
                                />
                            </div>
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
                    <template #header-action>
                        <a :href="authorityHookBuilderUrl" target="_blank" class="header-ai-link" title="Generate with AI">
                            <AiSparkleIcon :size="14" />
                        </a>
                    </template>

                    <template #display>
                        <div class="text-area">
                            <div v-if="store.fields.authority_statement" class="preserve-lines" v-html="formatWithLineBreaks(store.fields.authority_statement)"></div>
                            <div v-else class="empty-text">
                                <p>
                                    <span class="info-icon">i</span>
                                    Your Authority Hook is a positioning statement that establishes your expertise.
                                    Use the AI tool to generate one from your 6 W's.
                                </p>
                            </div>
                        </div>
                    </template>

                    <template #edit>
                        <div class="form-group">
                            <label class="form-label">Authority Hook Statement</label>
                            <textarea
                                class="form-input textarea"
                                v-model="editFields.authority_statement"
                                rows="4"
                                placeholder="I help [WHO] achieve [WHAT] when [WHEN] through [HOW]..."
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
    'guest-intro': ['introduction_short', 'introduction', 'introduction_long'],
    'six-ws': ['hook_who', 'hook_what', 'hook_when', 'hook_how', 'hook_where', 'hook_why'],
    tagline: ['tagline'],
    'authority-hook': ['authority_statement'],
    'impact-intro': ['impact_intro'],
};

// Computed: Check if any intro version exists
const hasAnyIntro = computed(() => {
    return !!(
        store.fields.introduction_short ||
        store.fields.introduction ||
        store.fields.podcast_intro ||
        store.fields.introduction_long
    );
});

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

/* 6 W's Grid Layout */
.six-ws-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
}

@media (max-width: 640px) {
    .six-ws-grid {
        grid-template-columns: 1fr;
    }
}

.six-ws-item {
    display: flex;
    flex-direction: column;
    padding: 12px;
    background: #f8fafc;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
}

.six-ws-label {
    font-size: 12px;
    font-weight: 700;
    color: #14b8a6;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.six-ws-sublabel {
    font-size: 11px;
    color: #94a3b8;
    margin-bottom: 4px;
}

.six-ws-value {
    font-size: 14px;
    color: #334155;
    line-height: 1.4;
}

/* 6 W's Edit Grid */
.six-ws-edit-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
}

@media (max-width: 640px) {
    .six-ws-edit-grid {
        grid-template-columns: 1fr;
    }
}

.six-ws-edit-grid .form-group {
    margin-bottom: 0;
}

/* Guest Intro Versions */
.intro-versions {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.intro-version {
    padding: 16px;
    padding-left: 20px;
    background: #f8fafc;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    border-left: 4px solid #94a3b8;
}

.intro-version--short {
    border-left-color: #10b981;
    background: linear-gradient(to right, #f0fdf4, #f8fafc 20%);
}

.intro-version--medium {
    border-left-color: #3b82f6;
    background: linear-gradient(to right, #eff6ff, #f8fafc 20%);
}

.intro-version--long {
    border-left-color: #8b5cf6;
    background: linear-gradient(to right, #f5f3ff, #f8fafc 20%);
}

.intro-version-header {
    margin-bottom: 8px;
}

.intro-version-badge {
    display: inline-block;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 2px 8px;
    border-radius: 4px;
    background: #e2e8f0;
    color: #64748b;
}

.intro-version-badge--short {
    background: #d1fae5;
    color: #059669;
}

.intro-version-badge--medium {
    background: #dbeafe;
    color: #2563eb;
}

.intro-version-badge--long {
    background: #ede9fe;
    color: #7c3aed;
}

.intro-version-text {
    font-size: 14px;
    line-height: 1.6;
    color: #334155;
}

/* Guest Intro Edit Sections */
.intro-edit-sections {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.intro-label-badge {
    display: inline-block;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    padding: 2px 6px;
    border-radius: 3px;
    background: #e2e8f0;
    color: #64748b;
    margin-right: 8px;
}

.intro-label-badge--primary {
    background: #dbeafe;
    color: #2563eb;
}
</style>
