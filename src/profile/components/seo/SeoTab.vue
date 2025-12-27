<template>
    <div class="seo-tab">
        <!-- Premium Feature Banner (if not premium) -->
        <div v-if="!isPremium" class="premium-banner">
            <div class="premium-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
            </div>
            <div class="premium-content">
                <h3>Premium Feature</h3>
                <p>SEO & Schema Markup is available for Pro and Enterprise users. Upgrade to improve your visibility in search engines and AI answers.</p>
                <a href="/pricing/" class="upgrade-button">Upgrade Now</a>
            </div>
        </div>

        <!-- AEO Score Panel -->
        <div class="panel aeo-panel">
            <div class="panel-header">
                <h2 class="panel-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                    </svg>
                    AEO Score
                </h2>
                <span class="panel-badge">Answer Engine Optimization</span>
            </div>
            <div class="panel-content">
                <div class="aeo-score-display">
                    <div class="score-circle" :class="aeoGradeClass">
                        <span class="score-value">{{ aeoScore }}</span>
                        <span class="score-max">/100</span>
                    </div>
                    <div class="score-details">
                        <h3 class="score-grade">Grade: {{ aeoGrade }}</h3>
                        <p class="score-summary">{{ aeoSummary }}</p>
                    </div>
                </div>

                <!-- Factor Breakdown -->
                <div class="aeo-factors">
                    <h4>Score Breakdown</h4>
                    <div class="factor-list">
                        <div
                            v-for="factor in aeoFactors"
                            :key="factor.id"
                            class="factor-item"
                        >
                            <div class="factor-header">
                                <span class="factor-name">{{ factor.label }}</span>
                                <span class="factor-score">{{ factor.score }}/{{ factor.max }}</span>
                            </div>
                            <div class="factor-bar">
                                <div
                                    class="factor-fill"
                                    :style="{ width: (factor.score / factor.max * 100) + '%' }"
                                    :class="getFactorClass(factor.score, factor.max)"
                                ></div>
                            </div>
                            <p class="factor-description">{{ factor.description }}</p>
                        </div>
                    </div>
                </div>

                <!-- Recommendations -->
                <div v-if="aeoRecommendations.length > 0" class="aeo-recommendations">
                    <h4>Recommendations</h4>
                    <ul class="recommendations-list">
                        <li
                            v-for="(rec, index) in aeoRecommendations"
                            :key="index"
                            class="recommendation-item"
                        >
                            <span class="rec-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="16" x2="12" y2="12"></line>
                                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                </svg>
                            </span>
                            <span class="rec-message">{{ rec.message }}</span>
                            <span class="rec-impact">+{{ rec.impact }} pts</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Schema Markup Panel -->
        <EditablePanel
            title="Schema Markup"
            section-id="schema"
            :is-editing="editingSection === 'schema'"
            :is-saving="isSaving"
            :disabled="!isPremium"
            @edit="startEditing"
            @save="saveSection"
            @cancel="cancelEditing"
        >
            <template #display>
                <div class="schema-status">
                    <div class="status-row">
                        <span class="status-label">Schema Markup</span>
                        <span
                            class="status-badge"
                            :class="{ 'status-enabled': schemaEnabled, 'status-disabled': !schemaEnabled }"
                        >
                            {{ schemaEnabled ? 'Enabled' : 'Disabled' }}
                        </span>
                    </div>
                    <div v-if="schemaEnabled" class="enabled-types">
                        <span class="types-label">Active Schemas:</span>
                        <span
                            v-for="type in enabledSchemaTypes"
                            :key="type"
                            class="type-tag"
                        >
                            {{ formatSchemaType(type) }}
                        </span>
                    </div>
                </div>
            </template>

            <template #edit>
                <div class="schema-settings">
                    <div class="form-group">
                        <label class="toggle-label">
                            <input
                                type="checkbox"
                                v-model="editFields.seo_schema_enabled"
                                class="toggle-input"
                            />
                            <span class="toggle-switch"></span>
                            <span class="toggle-text">Enable Schema Markup</span>
                        </label>
                        <p class="form-hint">Add structured data to help search engines and AI understand your profile</p>
                    </div>

                    <div v-if="editFields.seo_schema_enabled" class="schema-types-section">
                        <label class="form-label">Schema Types</label>
                        <div class="schema-types-grid">
                            <label
                                v-for="type in availableSchemaTypes"
                                :key="type.id"
                                class="schema-type-option"
                            >
                                <input
                                    type="checkbox"
                                    :value="type.id"
                                    v-model="editFields.seo_schema_types"
                                />
                                <span class="type-card">
                                    <span class="type-name">{{ type.label }}</span>
                                    <span class="type-description">{{ type.description }}</span>
                                </span>
                            </label>
                        </div>
                    </div>
                </div>
            </template>
        </EditablePanel>

        <!-- Custom SEO Meta Panel -->
        <EditablePanel
            title="Custom SEO Meta"
            section-id="meta"
            :is-editing="editingSection === 'meta'"
            :is-saving="isSaving"
            :disabled="!isPremium"
            @edit="startEditing"
            @save="saveSection"
            @cancel="cancelEditing"
        >
            <template #display>
                <div class="meta-display">
                    <div class="meta-item">
                        <label class="meta-label">SEO Title</label>
                        <p class="meta-value">{{ store.fields.seo_custom_title || 'Using default (Name - Media Kit)' }}</p>
                    </div>
                    <div class="meta-item">
                        <label class="meta-label">Meta Description</label>
                        <p class="meta-value">{{ store.fields.seo_custom_description || 'Using default (from tagline/bio)' }}</p>
                    </div>
                </div>
            </template>

            <template #edit>
                <div class="form-group">
                    <label class="form-label">Custom SEO Title</label>
                    <input
                        type="text"
                        class="form-input"
                        v-model="editFields.seo_custom_title"
                        placeholder="Leave blank to use default"
                        maxlength="60"
                    />
                    <p class="form-hint">{{ (editFields.seo_custom_title || '').length }}/60 characters</p>
                </div>
                <div class="form-group">
                    <label class="form-label">Custom Meta Description</label>
                    <textarea
                        class="form-textarea"
                        v-model="editFields.seo_custom_description"
                        placeholder="Leave blank to use tagline or biography"
                        rows="3"
                        maxlength="160"
                    ></textarea>
                    <p class="form-hint">{{ (editFields.seo_custom_description || '').length }}/160 characters</p>
                </div>
            </template>
        </EditablePanel>

        <!-- Authority Credentials Panel -->
        <EditablePanel
            title="Authority & Credentials"
            section-id="authority"
            :is-editing="editingSection === 'authority'"
            :is-saving="isSaving"
            @edit="startEditing"
            @save="saveSection"
            @cancel="cancelEditing"
        >
            <template #display>
                <div class="authority-display">
                    <div class="authority-item">
                        <label class="authority-label">Education / Alumni Of</label>
                        <p class="authority-value">{{ store.fields.alumni_of || '—' }}</p>
                    </div>
                    <div class="authority-item">
                        <label class="authority-label">Awards & Recognition</label>
                        <p class="authority-value">{{ store.fields.awards || '—' }}</p>
                    </div>
                    <div class="authority-item">
                        <label class="authority-label">Professional Memberships</label>
                        <p class="authority-value">{{ store.fields.member_of || '—' }}</p>
                    </div>
                    <div class="authority-item">
                        <label class="authority-label">Certifications & Licenses</label>
                        <p class="authority-value">{{ store.fields.certifications || '—' }}</p>
                    </div>
                </div>
            </template>

            <template #edit>
                <div class="form-group">
                    <label class="form-label">Education / Alumni Of</label>
                    <input
                        type="text"
                        class="form-input"
                        v-model="editFields.alumni_of"
                        placeholder="e.g., Harvard Business School, MIT"
                    />
                    <p class="form-hint">Universities, colleges, or notable educational institutions</p>
                </div>
                <div class="form-group">
                    <label class="form-label">Awards & Recognition</label>
                    <textarea
                        class="form-textarea"
                        v-model="editFields.awards"
                        placeholder="e.g., Forbes 30 Under 30, Inc. 500 Fastest Growing"
                        rows="2"
                    ></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Professional Memberships</label>
                    <textarea
                        class="form-textarea"
                        v-model="editFields.member_of"
                        placeholder="e.g., National Speakers Association, ICF"
                        rows="2"
                    ></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Certifications & Licenses</label>
                    <textarea
                        class="form-textarea"
                        v-model="editFields.certifications"
                        placeholder="e.g., CPA, PMP, Board Certified Coach"
                        rows="2"
                    ></textarea>
                </div>
            </template>
        </EditablePanel>

        <!-- Schema Preview Panel -->
        <div v-if="isPremium && schemaEnabled" class="panel schema-preview-panel">
            <div class="panel-header">
                <h2 class="panel-title">Schema Preview</h2>
                <button class="preview-toggle" @click="showSchemaPreview = !showSchemaPreview">
                    {{ showSchemaPreview ? 'Hide' : 'Show' }} JSON-LD
                </button>
            </div>
            <div v-if="showSchemaPreview" class="panel-content">
                <pre class="schema-json"><code>{{ schemaPreviewJson }}</code></pre>
            </div>
            <div class="panel-footer">
                <a
                    href="https://search.google.com/test/rich-results"
                    target="_blank"
                    rel="noopener"
                    class="validate-link"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                    Test with Google Rich Results
                </a>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useProfileStore } from '../../stores/profile.js';
import EditablePanel from '../layout/EditablePanel.vue';

const store = useProfileStore();

// Premium status (would come from API in real implementation)
const isPremium = ref(true); // TODO: Check actual premium status

// AEO Score data
const aeoScore = ref(0);
const aeoGrade = ref('—');
const aeoSummary = ref('Loading...');
const aeoFactors = ref([]);
const aeoRecommendations = ref([]);

// Edit state
const editingSection = ref(null);
const isSaving = ref(false);
const editFields = reactive({});
const showSchemaPreview = ref(false);

// Available schema types
const availableSchemaTypes = [
    { id: 'person', label: 'Person', description: 'Your identity, title, and expertise' },
    { id: 'profilepage', label: 'Profile Page', description: 'Page metadata and structure' },
    { id: 'faq', label: 'FAQ', description: 'Your interview questions as FAQ rich snippets' },
    { id: 'breadcrumb', label: 'Breadcrumb', description: 'Navigation path for search engines' },
];

// Section field mappings
const sectionFields = {
    schema: ['seo_schema_enabled', 'seo_schema_types'],
    meta: ['seo_custom_title', 'seo_custom_description'],
    authority: ['alumni_of', 'awards', 'member_of', 'certifications'],
};

// Computed properties
const schemaEnabled = computed(() => {
    const val = store.fields.seo_schema_enabled;
    return val === true || val === '1' || val === 'true';
});

const enabledSchemaTypes = computed(() => {
    const types = store.fields.seo_schema_types;
    if (Array.isArray(types)) return types;
    if (typeof types === 'string') return types.split(',').filter(Boolean);
    return ['person', 'profilepage']; // defaults
});

const aeoGradeClass = computed(() => {
    if (aeoScore.value >= 80) return 'grade-a';
    if (aeoScore.value >= 60) return 'grade-b';
    if (aeoScore.value >= 40) return 'grade-c';
    return 'grade-d';
});

const schemaPreviewJson = computed(() => {
    // Generate a preview of the schema
    const name = `${store.fields.first_name || ''} ${store.fields.last_name || ''}`.trim() || 'Your Name';
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: name,
        jobTitle: store.fields.guest_title || 'Your Title',
        description: store.fields.tagline || store.fields.authority_hook || 'Your description',
        url: window.location.origin + '/media-kit/' + (store.fields.slug || 'your-slug'),
        knowsAbout: [
            store.fields.topic_1,
            store.fields.topic_2,
            store.fields.topic_3,
        ].filter(Boolean),
    };
    return JSON.stringify(schema, null, 2);
});

// Methods
const formatSchemaType = (type) => {
    const labels = {
        person: 'Person',
        profilepage: 'Profile Page',
        faq: 'FAQ',
        breadcrumb: 'Breadcrumb',
        speakable: 'Speakable',
    };
    return labels[type] || type;
};

const getFactorClass = (score, max) => {
    const pct = (score / max) * 100;
    if (pct >= 80) return 'factor-excellent';
    if (pct >= 60) return 'factor-good';
    if (pct >= 40) return 'factor-fair';
    return 'factor-poor';
};

const startEditing = (sectionId) => {
    editingSection.value = sectionId;

    const fields = sectionFields[sectionId] || [];
    fields.forEach((field) => {
        const value = store.fields[field];
        if (field === 'seo_schema_types') {
            // Ensure array for checkboxes
            editFields[field] = Array.isArray(value) ? [...value] : ['person', 'profilepage'];
        } else if (field === 'seo_schema_enabled') {
            editFields[field] = value === true || value === '1' || value === 'true';
        } else {
            editFields[field] = value || '';
        }
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
            if (editFields[field] !== undefined) {
                let value = editFields[field];
                // Convert boolean to string for seo_schema_enabled
                if (field === 'seo_schema_enabled') {
                    value = value ? '1' : '0';
                }
                store.updateField(field, value);
            }
        });

        const success = await store.saveFields(fields);

        if (success) {
            editingSection.value = null;
            // Refresh AEO score after save
            await loadAeoScore();
        } else {
            const errorMsg = store.lastError || 'Failed to save. Please try again.';
            console.error('Save failed:', errorMsg);
            alert(errorMsg);
        }
    } catch (error) {
        console.error('Save error:', error);
        alert('An error occurred while saving. Please try again.');
    } finally {
        isSaving.value = false;
    }
};

const loadAeoScore = async () => {
    // Fetch AEO score from API
    try {
        const response = await fetch(`/wp-json/gmkb/v2/profile/${store.postId}/aeo-score`, {
            headers: {
                'X-WP-Nonce': store.nonce,
            },
        });

        if (response.ok) {
            const data = await response.json();
            aeoScore.value = data.total_score || 0;
            aeoGrade.value = data.grade || '—';
            aeoSummary.value = data.summary || '';
            aeoFactors.value = Object.values(data.factors || {});
            aeoRecommendations.value = data.recommendations || [];
        } else {
            // Fallback: calculate locally using available data
            calculateLocalAeoScore();
        }
    } catch (error) {
        console.error('Failed to load AEO score:', error);
        // Fallback to local calculation
        calculateLocalAeoScore();
    }
};

const calculateLocalAeoScore = () => {
    // Simple local calculation when API is not available
    let score = 0;
    const factors = [];

    // Entity Clarity (25%)
    let entityScore = 0;
    if (store.fields.first_name && store.fields.last_name) entityScore += 20;
    if (store.fields.guest_title) entityScore += 20;
    if (store.fields.company) entityScore += 15;
    if (store.fields.headshot_primary) entityScore += 20;
    if (store.fields.tagline || store.fields.authority_hook) entityScore += 25;
    factors.push({
        id: 'entity_clarity',
        label: 'Entity Clarity',
        description: 'How clearly AI can identify who you are',
        score: entityScore,
        max: 100,
    });
    score += (entityScore / 100) * 25;

    // Expertise Depth (25%)
    let expertiseScore = 0;
    let topicCount = 0;
    for (let i = 1; i <= 5; i++) {
        if (store.fields[`topic_${i}`]) topicCount++;
    }
    if (topicCount >= 3) expertiseScore += 30;
    else if (topicCount > 0) expertiseScore += topicCount * 10;
    if (store.fields.authority_hook) expertiseScore += 25;
    if (store.fields.impact_intro) expertiseScore += 20;
    if (store.fields.alumni_of || store.fields.awards) expertiseScore += 10;
    factors.push({
        id: 'expertise_depth',
        label: 'Expertise Depth',
        description: 'Demonstrated knowledge and authority signals',
        score: Math.min(expertiseScore, 100),
        max: 100,
    });
    score += (Math.min(expertiseScore, 100) / 100) * 25;

    // Social Validation (20%)
    let socialScore = 0;
    let socialCount = 0;
    const socialFields = ['social_linkedin', 'social_twitter', 'social_instagram', 'social_facebook', 'social_youtube'];
    socialFields.forEach((f) => {
        if (store.fields[f]) socialCount++;
    });
    if (socialCount >= 2) socialScore += 50;
    else if (socialCount === 1) socialScore += 25;
    if (store.fields.social_linkedin) socialScore += 20;
    if (store.fields.website_primary) socialScore += 20;
    factors.push({
        id: 'social_validation',
        label: 'Social Validation',
        description: 'Cross-platform identity verification',
        score: Math.min(socialScore, 100),
        max: 100,
    });
    score += (Math.min(socialScore, 100) / 100) * 20;

    // Content Richness (20%)
    let contentScore = 0;
    const bioLength = (store.fields.biography || '').replace(/<[^>]*>/g, '').length;
    if (bioLength >= 500) contentScore += 30;
    else if (bioLength >= 200) contentScore += 20;
    else if (bioLength > 0) contentScore += 10;
    let questionCount = 0;
    for (let i = 1; i <= 25; i++) {
        if (store.fields[`question_${i}`]) questionCount++;
    }
    if (questionCount >= 5) contentScore += 40;
    else if (questionCount >= 3) contentScore += 25;
    else if (questionCount > 0) contentScore += 10;
    if (store.fields.why_book_you) contentScore += 20;
    factors.push({
        id: 'content_richness',
        label: 'Content Richness',
        description: 'Depth of answerable content',
        score: Math.min(contentScore, 100),
        max: 100,
    });
    score += (Math.min(contentScore, 100) / 100) * 20;

    // Freshness (10%)
    factors.push({
        id: 'freshness',
        label: 'Freshness',
        description: 'How recently the profile was updated',
        score: 75, // Assume recent since they're viewing it
        max: 100,
    });
    score += (75 / 100) * 10;

    aeoScore.value = Math.round(score);
    aeoGrade.value = score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D';
    aeoFactors.value = factors;

    // Generate recommendations
    const recs = [];
    if (!store.fields.social_linkedin) {
        recs.push({ message: 'Add your LinkedIn profile URL', impact: 15 });
    }
    if (topicCount < 3) {
        recs.push({ message: `Add ${3 - topicCount} more expertise topics`, impact: 10 });
    }
    if (questionCount < 5) {
        recs.push({ message: 'Add more interview questions for FAQ schema', impact: 15 });
    }
    if (!store.fields.authority_hook) {
        recs.push({ message: 'Create an authority hook explaining who you help', impact: 20 });
    }
    aeoRecommendations.value = recs.slice(0, 5);

    // Generate summary
    if (score >= 80) {
        aeoSummary.value = 'Excellent! Your profile is highly optimized for AI visibility.';
    } else if (score >= 60) {
        aeoSummary.value = 'Good foundation! Follow the recommendations to improve further.';
    } else {
        aeoSummary.value = 'Your profile needs work to be visible to AI systems.';
    }
};

// Load AEO score on mount
onMounted(() => {
    loadAeoScore();
});
</script>

<style scoped>
.seo-tab {
    /* Uses parent padding */
}

/* Premium Banner */
.premium-banner {
    display: flex;
    gap: 16px;
    padding: 20px;
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    border: 1px solid #f59e0b;
    border-radius: 12px;
    margin-bottom: 24px;
}

.premium-icon {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    background: #f59e0b;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
}

.premium-content h3 {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 600;
    color: #92400e;
}

.premium-content p {
    margin: 0 0 12px 0;
    font-size: 14px;
    color: #a16207;
}

.upgrade-button {
    display: inline-flex;
    padding: 8px 16px;
    background: #f59e0b;
    color: white;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
    transition: background 0.2s;
}

.upgrade-button:hover {
    background: #d97706;
}

/* Panel styles */
.panel {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    margin-bottom: 24px;
    overflow: hidden;
}

.panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
}

.panel-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #0f172a;
}

.panel-badge {
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 4px 8px;
    background: #e0f2fe;
    color: #0369a1;
    border-radius: 4px;
}

.panel-content {
    padding: 20px;
}

.panel-footer {
    padding: 12px 20px;
    background: #f8fafc;
    border-top: 1px solid #e2e8f0;
}

/* AEO Score Display */
.aeo-score-display {
    display: flex;
    align-items: center;
    gap: 24px;
    margin-bottom: 24px;
    padding-bottom: 24px;
    border-bottom: 1px solid #e2e8f0;
}

.score-circle {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #f1f5f9;
    flex-shrink: 0;
}

.score-circle.grade-a {
    background: linear-gradient(135deg, #dcfce7, #bbf7d0);
    border: 3px solid #22c55e;
}

.score-circle.grade-b {
    background: linear-gradient(135deg, #dbeafe, #bfdbfe);
    border: 3px solid #3b82f6;
}

.score-circle.grade-c {
    background: linear-gradient(135deg, #fef3c7, #fde68a);
    border: 3px solid #f59e0b;
}

.score-circle.grade-d {
    background: linear-gradient(135deg, #fee2e2, #fecaca);
    border: 3px solid #ef4444;
}

.score-value {
    font-size: 32px;
    font-weight: 700;
    color: #0f172a;
    line-height: 1;
}

.score-max {
    font-size: 14px;
    color: #64748b;
}

.score-details {
    flex: 1;
}

.score-grade {
    margin: 0 0 8px 0;
    font-size: 18px;
    font-weight: 600;
    color: #0f172a;
}

.score-summary {
    margin: 0;
    font-size: 14px;
    color: #64748b;
    line-height: 1.5;
}

/* AEO Factors */
.aeo-factors h4,
.aeo-recommendations h4 {
    margin: 0 0 16px 0;
    font-size: 14px;
    font-weight: 600;
    color: #334155;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.factor-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.factor-item {
    padding: 12px;
    background: #f8fafc;
    border-radius: 8px;
}

.factor-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
}

.factor-name {
    font-size: 14px;
    font-weight: 500;
    color: #0f172a;
}

.factor-score {
    font-size: 13px;
    font-weight: 600;
    color: #64748b;
}

.factor-bar {
    height: 6px;
    background: #e2e8f0;
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 8px;
}

.factor-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.3s ease;
}

.factor-fill.factor-excellent {
    background: #22c55e;
}

.factor-fill.factor-good {
    background: #3b82f6;
}

.factor-fill.factor-fair {
    background: #f59e0b;
}

.factor-fill.factor-poor {
    background: #ef4444;
}

.factor-description {
    margin: 0;
    font-size: 12px;
    color: #64748b;
}

/* Recommendations */
.aeo-recommendations {
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid #e2e8f0;
}

.recommendations-list {
    list-style: none;
    margin: 0;
    padding: 0;
}

.recommendation-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: #fffbeb;
    border: 1px solid #fde68a;
    border-radius: 8px;
    margin-bottom: 8px;
}

.rec-icon {
    flex-shrink: 0;
    color: #f59e0b;
}

.rec-message {
    flex: 1;
    font-size: 14px;
    color: #92400e;
}

.rec-impact {
    flex-shrink: 0;
    font-size: 12px;
    font-weight: 600;
    color: #22c55e;
    background: #dcfce7;
    padding: 4px 8px;
    border-radius: 4px;
}

/* Schema Status */
.schema-status {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.status-row {
    display: flex;
    align-items: center;
    gap: 12px;
}

.status-label {
    font-size: 14px;
    font-weight: 500;
    color: #334155;
}

.status-badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
}

.status-enabled {
    background: #dcfce7;
    color: #166534;
}

.status-disabled {
    background: #f1f5f9;
    color: #64748b;
}

.enabled-types {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.types-label {
    font-size: 13px;
    color: #64748b;
}

.type-tag {
    padding: 4px 10px;
    background: #e0f2fe;
    color: #0369a1;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
}

/* Schema Settings */
.schema-settings {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.toggle-label {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
}

.toggle-input {
    display: none;
}

.toggle-switch {
    width: 44px;
    height: 24px;
    background: #e2e8f0;
    border-radius: 12px;
    position: relative;
    transition: background 0.2s;
}

.toggle-switch::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: transform 0.2s;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.toggle-input:checked + .toggle-switch {
    background: #14b8a6;
}

.toggle-input:checked + .toggle-switch::after {
    transform: translateX(20px);
}

.toggle-text {
    font-size: 14px;
    font-weight: 500;
    color: #0f172a;
}

.schema-types-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
}

.schema-type-option {
    cursor: pointer;
}

.schema-type-option input {
    display: none;
}

.type-card {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 16px;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    transition: all 0.2s;
}

.schema-type-option input:checked + .type-card {
    border-color: #14b8a6;
    background: #f0fdfa;
}

.type-name {
    font-size: 14px;
    font-weight: 600;
    color: #0f172a;
}

.type-description {
    font-size: 12px;
    color: #64748b;
}

/* Meta Display */
.meta-display {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.meta-item,
.authority-item {
    padding: 12px;
    background: #f8fafc;
    border-radius: 8px;
}

.meta-label,
.authority-label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: #64748b;
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.meta-value,
.authority-value {
    margin: 0;
    font-size: 14px;
    color: #0f172a;
}

/* Authority Display */
.authority-display {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
}

/* Form Elements */
.form-group {
    margin-bottom: 16px;
}

.form-label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #334155;
    margin-bottom: 6px;
}

.form-input,
.form-textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 14px;
    font-family: inherit;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus,
.form-textarea:focus {
    outline: none;
    border-color: #14b8a6;
    box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
}

.form-textarea {
    resize: vertical;
    min-height: 80px;
}

.form-hint {
    margin: 6px 0 0 0;
    font-size: 12px;
    color: #64748b;
}

/* Schema Preview */
.preview-toggle {
    padding: 6px 12px;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    font-size: 13px;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s;
}

.preview-toggle:hover {
    border-color: #14b8a6;
    color: #14b8a6;
}

.schema-json {
    margin: 0;
    padding: 16px;
    background: #1e293b;
    border-radius: 6px;
    overflow-x: auto;
}

.schema-json code {
    font-size: 13px;
    line-height: 1.5;
    color: #e2e8f0;
    font-family: 'Monaco', 'Consolas', monospace;
}

.validate-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #0369a1;
    text-decoration: none;
}

.validate-link:hover {
    text-decoration: underline;
}

/* Responsive */
@media (max-width: 640px) {
    .premium-banner {
        flex-direction: column;
        text-align: center;
    }

    .aeo-score-display {
        flex-direction: column;
        text-align: center;
    }

    .schema-types-grid {
        grid-template-columns: 1fr;
    }

    .authority-display {
        grid-template-columns: 1fr;
    }
}
</style>
