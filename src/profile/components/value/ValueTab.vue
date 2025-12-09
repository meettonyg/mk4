<template>
    <div class="value-tab">
        <div class="grid">
            <!-- Main Content - Topics & Questions -->
            <div class="main-content">
                <div class="panel">
                    <div class="panel-header">
                        <h2 class="panel-title">Topics & Questions</h2>
                    </div>
                    <div class="panel-content">
                        <p class="topics-intro">
                            Define the topics you can discuss and questions you're prepared to answer.
                            This helps podcast hosts understand your expertise.
                        </p>

                        <!-- Topic Accordions -->
                        <TopicAccordion
                            v-for="topic in store.topics"
                            :key="topic.id"
                            :topic="topic"
                            :is-editing="editingTopic === topic.id"
                            :is-saving="isSaving"
                            @edit="startEditingTopic"
                            @save="saveTopic"
                            @cancel="cancelEditing"
                            @update="updateTopicField"
                        />
                    </div>
                </div>
            </div>

            <!-- Sidebar -->
            <div class="sidebar">
                <!-- Offers Panel -->
                <EditablePanel
                    title="Offers"
                    section-id="offers"
                    :is-editing="editingSection === 'offers'"
                    :is-saving="isSaving"
                    @edit="startEditing"
                    @save="saveSection"
                    @cancel="cancelSectionEditing"
                >
                    <template #display>
                        <ul class="offers-list">
                            <li v-for="offer in store.offers" :key="offer.id" class="offer-item">
                                <span class="offer-icon">🎯</span>
                                <span class="offer-text">
                                    {{ offer.text || 'Add your offer here' }}
                                    <a
                                        v-if="offer.link"
                                        :href="offer.link"
                                        target="_blank"
                                        class="offer-link"
                                    >
                                        🔗
                                    </a>
                                </span>
                            </li>
                        </ul>

                        <div class="cta-container">
                            <h3 class="cta-title">Ready to convert listeners?</h3>
                            <p class="cta-description">Create compelling offers that turn listeners into leads</p>
                            <a :href="offerGeneratorUrl" target="_blank" class="button primary-button">
                                Create Offers with AI
                            </a>
                        </div>
                    </template>

                    <template #edit>
                        <div class="offer-edit-group">
                            <h4>Offer 1</h4>
                            <div class="form-group">
                                <label class="form-label">Offer Text</label>
                                <input
                                    type="text"
                                    class="form-input"
                                    v-model="editFields.offer_1"
                                    placeholder="Free consultation, discount code, etc."
                                />
                            </div>
                            <div class="form-group">
                                <label class="form-label">Offer Link</label>
                                <input
                                    type="url"
                                    class="form-input"
                                    v-model="editFields.offer_1_link"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>

                        <div class="offer-edit-group">
                            <h4>Offer 2</h4>
                            <div class="form-group">
                                <label class="form-label">Offer Text</label>
                                <input
                                    type="text"
                                    class="form-input"
                                    v-model="editFields.offer_2"
                                    placeholder="Free consultation, discount code, etc."
                                />
                            </div>
                            <div class="form-group">
                                <label class="form-label">Offer Link</label>
                                <input
                                    type="url"
                                    class="form-input"
                                    v-model="editFields.offer_2_link"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                    </template>
                </EditablePanel>

                <!-- Brands Panel -->
                <EditablePanel
                    title="Highlighted Brands and Voices"
                    section-id="brands"
                    :is-editing="editingSection === 'brands'"
                    :is-saving="isSaving"
                    @edit="startEditing"
                    @save="saveSection"
                    @cancel="cancelSectionEditing"
                >
                    <template #display>
                        <div class="brand-item">
                            <span class="brand-label">My Brand:</span>
                            <span class="brand-value">{{ store.fields.my_brands || '—' }}</span>
                        </div>
                        <div class="brand-item">
                            <span class="brand-label">Other Brands:</span>
                            <span class="brand-value">{{ store.fields.other_brands || '—' }}</span>
                        </div>
                    </template>

                    <template #edit>
                        <div class="form-group">
                            <label class="form-label">My Brand</label>
                            <input
                                type="text"
                                class="form-input"
                                v-model="editFields.my_brands"
                                placeholder="Your personal or company brand..."
                            />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Other Brands</label>
                            <input
                                type="text"
                                class="form-input"
                                v-model="editFields.other_brands"
                                placeholder="Other brands you're associated with..."
                            />
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
import TopicAccordion from './TopicAccordion.vue';

const store = useProfileStore();

// URL constants
const OFFER_GENERATOR_BASE_URL = '/app/offer-generator/';

// Generate offer generator URL with entry parameter
const offerGeneratorUrl = computed(() => {
    const entry = store.postData?.slug;
    if (entry) {
        return `${OFFER_GENERATOR_BASE_URL}?frm_action=edit&entry=${entry}`;
    }
    return OFFER_GENERATOR_BASE_URL;
});

// Edit state
const editingTopic = ref(null);
const editingSection = ref(null);
const isSaving = ref(false);
const editFields = reactive({});
const topicEditFields = reactive({});

// Section field mappings
const sectionFields = {
    offers: ['offer_1', 'offer_1_link', 'offer_2', 'offer_2_link'],
    brands: ['my_brands', 'other_brands'],
};

// Topic methods
const startEditingTopic = (topicId) => {
    editingTopic.value = topicId;

    // Copy current topic and question values
    const topic = store.topics.find((t) => t.id === topicId);
    if (topic) {
        topicEditFields[`topic_${topicId}`] = topic.title;
        const startQ = (topicId - 1) * 5 + 1;
        for (let i = 0; i < 5; i++) {
            topicEditFields[`question_${startQ + i}`] = topic.questions[i] || '';
        }
    }
};

const updateTopicField = (fieldName, value) => {
    topicEditFields[fieldName] = value;
};

const saveTopic = async (topicId) => {
    isSaving.value = true;

    try {
        const fields = [`topic_${topicId}`];
        const startQ = (topicId - 1) * 5 + 1;
        for (let i = 0; i < 5; i++) {
            fields.push(`question_${startQ + i}`);
        }

        // Update store
        fields.forEach((field) => {
            store.updateField(field, topicEditFields[field] || '');
        });

        // Save to server
        const success = await store.saveFields(fields);

        if (success) {
            editingTopic.value = null;
            // Clear topic edit fields
            Object.keys(topicEditFields).forEach((key) => {
                delete topicEditFields[key];
            });
        }
    } finally {
        isSaving.value = false;
    }
};

const cancelEditing = () => {
    editingTopic.value = null;
    Object.keys(topicEditFields).forEach((key) => {
        delete topicEditFields[key];
    });
};

// Section methods
const startEditing = (sectionId) => {
    editingSection.value = sectionId;

    const fields = sectionFields[sectionId] || [];
    fields.forEach((field) => {
        editFields[field] = store.fields[field] || '';
    });
};

const cancelSectionEditing = () => {
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
.value-tab {
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

.panel {
    background-color: white;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    margin-bottom: 24px;
}

.panel-header {
    padding: 16px 20px;
    border-bottom: 1px solid #f1f5f9;
}

.panel-title {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    color: #0f172a;
}

.panel-content {
    padding: 20px;
}

.topics-intro {
    margin-bottom: 24px;
    color: #64748b;
    font-size: 14px;
    line-height: 1.5;
}

/* Offers */
.offers-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.offer-item {
    display: flex;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f1f5f9;
}

.offer-item:last-child {
    border-bottom: none;
}

.offer-icon {
    margin-right: 12px;
    font-size: 16px;
}

.offer-text {
    flex: 1;
    font-size: 14px;
    color: #334155;
}

.offer-link {
    margin-left: 8px;
    text-decoration: none;
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

/* Brands */
.brand-item {
    display: flex;
    align-items: center;
    padding: 8px 0;
}

.brand-label {
    font-size: 14px;
    font-weight: 500;
    color: #0f172a;
    width: 100px;
    flex-shrink: 0;
}

.brand-value {
    font-size: 14px;
    color: #334155;
}

/* Edit groups */
.offer-edit-group {
    margin-bottom: 24px;
    padding-bottom: 24px;
    border-bottom: 1px solid #f1f5f9;
}

.offer-edit-group:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
}

.offer-edit-group h4 {
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 12px 0;
    color: #64748b;
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
</style>
