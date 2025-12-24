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
                    @edit="startEditingOffers"
                    @save="saveOffersSection"
                    @cancel="cancelOffersEditing"
                >
                    <template #header-action>
                        <a :href="offerGeneratorUrl" target="_blank" class="header-ai-link" title="Generate with AI">
                            <AiSparkleIcon :size="14" />
                        </a>
                    </template>

                    <template #display>
                        <!-- Loading state -->
                        <div v-if="isLoadingLinkedOffers" class="loading-state">
                            <div class="spinner"></div>
                            Loading offers...
                        </div>

                        <!-- Linked offers from managed system -->
                        <ul v-else-if="linkedOffers.length > 0" class="offers-list">
                            <li v-for="offer in linkedOffers" :key="offer.id" class="offer-item managed-offer">
                                <span class="offer-icon"><i class="fas fa-bullseye"></i></span>
                                <span class="offer-text">
                                    <span class="offer-title">{{ offer.title }}</span>
                                    <span v-if="offer.type" class="offer-type-badge">{{ offer.type }}</span>
                                    <span v-if="offer.retail_value" class="offer-value">${{ offer.retail_value }}</span>
                                </span>
                                <a
                                    v-if="offer.cta_url"
                                    :href="offer.cta_url"
                                    target="_blank"
                                    class="offer-link"
                                >
                                    <i class="fas fa-external-link-alt"></i>
                                </a>
                            </li>
                        </ul>

                        <!-- Empty state when no offers linked -->
                        <div v-else class="empty-offers">
                            <p class="empty-text">No offers linked yet. Click edit to add offers.</p>
                        </div>

                        <div class="cta-container">
                            <h3 class="cta-title">Ready to convert listeners?</h3>
                            <p class="cta-description">Create compelling offers that turn listeners into leads</p>
                            <a :href="offerGeneratorUrl" target="_blank" class="ai-cta-button">
                                <AiSparkleIcon :size="16" />
                                Create Offers with AI
                            </a>
                        </div>
                    </template>

                    <template #edit>
                        <!-- Offer Selector -->
                        <div class="offer-selector">
                            <div v-if="isLoadingOffers" class="loading-state">
                                <div class="spinner"></div>
                                Loading available offers...
                            </div>

                            <div v-else-if="availableOffers.length === 0" class="empty-state">
                                <p>No offers found. Create offers first using the AI offer generator.</p>
                                <a :href="offerGeneratorUrl" target="_blank" class="ai-link">
                                    <AiSparkleIcon :size="16" />
                                    Create Offers with AI
                                </a>
                            </div>

                            <div v-else>
                                <div class="search-box">
                                    <input
                                        v-model="searchTerm"
                                        type="text"
                                        placeholder="Search offers..."
                                        class="search-input"
                                    />
                                </div>

                                <div class="offers-checklist">
                                    <label
                                        v-for="offer in filteredOffers"
                                        :key="offer.id"
                                        class="offer-checkbox"
                                        :class="{ 'is-selected': isOfferSelected(offer.id) }"
                                    >
                                        <input
                                            type="checkbox"
                                            :checked="isOfferSelected(offer.id)"
                                            @change="toggleOffer(offer.id)"
                                        />
                                        <span class="offer-info">
                                            <span class="offer-name">{{ offer.title }}</span>
                                            <span class="offer-meta">
                                                <span v-if="offer.type" class="offer-type">{{ offer.type }}</span>
                                                <span v-if="offer.retail_value">${{ offer.retail_value }}</span>
                                            </span>
                                        </span>
                                    </label>
                                </div>

                                <p class="selection-count">
                                    {{ selectedOfferIds.length }} offer{{ selectedOfferIds.length !== 1 ? 's' : '' }} selected
                                </p>
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
import { ref, reactive, computed, onMounted } from 'vue';
import { useProfileStore } from '../../stores/profile.js';
import { useOffers } from '../../../composables/useOffers.js';
import EditablePanel from '../layout/EditablePanel.vue';
import TopicAccordion from './TopicAccordion.vue';
import { AiSparkleIcon } from '../icons';

const store = useProfileStore();
const {
    offers: availableOffers,
    isLoading: isLoadingOffers,
    fetchOffers,
    getProfileOffers,
    updateProfileOffers
} = useOffers();

// URL constants
const OFFER_GENERATOR_BASE_URL = '/app/offers-generator/';

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

// Managed offers state
const linkedOffers = ref([]);
const selectedOfferIds = ref([]);
const searchTerm = ref('');
const isLoadingLinkedOffers = ref(false);

// Section field mappings
const sectionFields = {
    brands: ['my_brands', 'other_brands'],
};

// Filtered available offers based on search
const filteredOffers = computed(() => {
    if (!searchTerm.value) return availableOffers.value;
    const term = searchTerm.value.toLowerCase();
    return availableOffers.value.filter(o =>
        o.title?.toLowerCase().includes(term) ||
        (o.type && o.type.toLowerCase().includes(term))
    );
});

// Check if an offer is selected
const isOfferSelected = (id) => selectedOfferIds.value.includes(id);

// Toggle offer selection
const toggleOffer = (id) => {
    const idx = selectedOfferIds.value.indexOf(id);
    if (idx === -1) {
        selectedOfferIds.value = [...selectedOfferIds.value, id];
    } else {
        selectedOfferIds.value = selectedOfferIds.value.filter(i => i !== id);
    }
};

// Load linked offers for the profile
const loadLinkedOffers = async () => {
    if (!store.postId) return;

    isLoadingLinkedOffers.value = true;
    try {
        const offers = await getProfileOffers(store.postId);
        linkedOffers.value = offers || [];
        selectedOfferIds.value = linkedOffers.value.map(o => o.id);
    } catch (error) {
        console.error('Failed to load linked offers:', error);
        linkedOffers.value = [];
        selectedOfferIds.value = [];
    } finally {
        isLoadingLinkedOffers.value = false;
    }
};

// Save linked offers
const saveLinkedOffers = async () => {
    if (!store.postId) return false;

    try {
        await updateProfileOffers(store.postId, selectedOfferIds.value);
        // Refresh linked offers
        await loadLinkedOffers();
        return true;
    } catch (error) {
        console.error('Failed to save linked offers:', error);
        return false;
    }
};

// Initialize on mount
onMounted(async () => {
    // Fetch available offers and load linked offers in parallel
    // Use status: 'any' to include publish, draft, and private offers
    await Promise.all([
        fetchOffers({ status: 'any', perPage: 100 }),
        loadLinkedOffers(),
    ]);
});

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

// Offers section methods
const startEditingOffers = () => {
    editingSection.value = 'offers';
    // Initialize selection from linked offers
    selectedOfferIds.value = linkedOffers.value.map(o => o.id);
    searchTerm.value = '';
};

const cancelOffersEditing = () => {
    editingSection.value = null;
    // Reset selection to match current linked offers
    selectedOfferIds.value = linkedOffers.value.map(o => o.id);
    searchTerm.value = '';
};

const saveOffersSection = async () => {
    isSaving.value = true;

    try {
        const success = await saveLinkedOffers();

        if (success) {
            editingSection.value = null;
            searchTerm.value = '';
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
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.offer-title {
    font-weight: 500;
}

.offer-type-badge {
    font-size: 11px;
    text-transform: capitalize;
    background-color: #e0f2fe;
    color: #0369a1;
    padding: 2px 6px;
    border-radius: 4px;
}

.offer-value {
    font-size: 12px;
    color: #059669;
    font-weight: 500;
}

.offer-link {
    margin-left: 8px;
    text-decoration: none;
}

/* Empty state */
.empty-offers {
    padding: 16px;
    text-align: center;
    background: #f9fafb;
    border-radius: 8px;
    margin-bottom: 16px;
}

.empty-text {
    margin: 0;
    font-size: 14px;
    color: #6b7280;
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
    margin: 0 0 12px 0;
    font-size: 14px;
    color: #6b7280;
}

/* AI link and AI CTA button styles are in profile.css */

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

/* Offers checklist */
.offers-checklist {
    max-height: 240px;
    overflow-y: auto;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
}

.offer-checkbox {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    cursor: pointer;
    transition: background 0.15s;
    border-bottom: 1px solid #f3f4f6;
}

.offer-checkbox:last-child {
    border-bottom: none;
}

.offer-checkbox:hover {
    background: #f9fafb;
}

.offer-checkbox.is-selected {
    background: #ecfdf5;
}

.offer-checkbox input {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
}

.offer-info {
    flex: 1;
    min-width: 0;
}

.offer-name {
    display: block;
    font-weight: 500;
    color: #111827;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 14px;
}

.offer-meta {
    display: flex;
    gap: 8px;
    font-size: 12px;
    color: #6b7280;
    margin-top: 4px;
}

.offer-type {
    text-transform: capitalize;
}

.selection-count {
    margin: 12px 0 0;
    font-size: 12px;
    color: #6b7280;
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
