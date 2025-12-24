<template>
    <div class="topic-container" :class="{ expanded: isExpanded, editing: isEditing }">
        <!-- Topic Header -->
        <div class="topic-header" @click="toggleExpanded">
            <div class="topic-title-section">
                <h3 class="topic-title">
                    Topic {{ topic.id }}: {{ topic.title || 'Untitled Topic' }}
                </h3>
            </div>
            <div class="topic-actions">
                <button
                    class="edit-button"
                    @click.stop="handleEditClick"
                    :title="isEditing ? 'Cancel' : 'Edit'"
                >
                    <svg v-if="!isEditing" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                        <path d="m15 5 4 4"/>
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 6 6 18"/>
                        <path d="m6 6 12 12"/>
                    </svg>
                </button>
                <span class="topic-toggle">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="chevron-icon"
                        :class="{ rotated: !isExpanded }"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </span>
            </div>
        </div>

        <!-- Topic Content -->
        <div v-show="isExpanded" class="topic-content">
            <!-- Display Mode -->
            <template v-if="!isEditing">
                <div class="questions-list">
                    <div
                        v-for="(question, index) in topic.questions"
                        :key="index"
                        class="question-item"
                    >
                        <div class="question-header">
                            <div class="question-title">
                                {{ question || `Question ${index + 1}` }}
                            </div>
                        </div>
                    </div>
                    <div v-if="!hasQuestions" class="empty-text">
                        No questions added for this topic yet
                    </div>
                </div>

                <div class="topic-footer">
                    <button
                        class="button secondary-button sm-button"
                        @click="$emit('edit', topic.id)"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;">
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                            <path d="m15 5 4 4"/>
                        </svg>
                        Edit Topic & Questions
                    </button>
                </div>
            </template>

            <!-- Edit Mode -->
            <template v-else>
                <div class="edit-form">
                    <div class="form-group">
                        <label class="form-label">Topic Title</label>
                        <input
                            type="text"
                            class="form-input"
                            :value="localTitle"
                            @input="updateField(`topic_${topic.id}`, $event.target.value)"
                            placeholder="Enter topic title..."
                        />
                    </div>

                    <div class="questions-edit">
                        <h4>Questions</h4>
                        <div
                            v-for="(question, index) in 5"
                            :key="index"
                            class="form-group"
                        >
                            <label class="form-label">Question {{ index + 1 }}</label>
                            <input
                                type="text"
                                class="form-input"
                                :value="getQuestionValue(index)"
                                @input="updateQuestion(index, $event.target.value)"
                                placeholder="Enter a question..."
                            />
                        </div>
                    </div>

                    <div class="edit-actions">
                        <button
                            class="button secondary-button"
                            @click="$emit('cancel')"
                            :disabled="isSaving"
                        >
                            Cancel
                        </button>
                        <button
                            class="button primary-button"
                            @click="$emit('save', topic.id)"
                            :disabled="isSaving"
                        >
                            <span v-if="isSaving" class="spinner"></span>
                            {{ isSaving ? 'Saving...' : 'Save Topic' }}
                        </button>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
    topic: {
        type: Object,
        required: true,
    },
    isEditing: {
        type: Boolean,
        default: false,
    },
    isSaving: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['edit', 'save', 'cancel', 'update']);

// Local state
const isExpanded = ref(false);
const localTitle = ref(props.topic.title);

// Computed
const questionCount = computed(() => {
    return props.topic.questions.filter((q) => q && q.trim()).length;
});

const hasQuestions = computed(() => {
    return props.topic.questions.some((q) => q && q.trim());
});

// Methods
const toggleExpanded = () => {
    if (!props.isEditing) {
        isExpanded.value = !isExpanded.value;
    }
};

const handleEditClick = () => {
    if (props.isEditing) {
        emit('cancel');
    } else {
        isExpanded.value = true;
        emit('edit', props.topic.id);
    }
};

const updateField = (fieldName, value) => {
    if (fieldName === `topic_${props.topic.id}`) {
        localTitle.value = value;
    }
    emit('update', fieldName, value);
};

const getQuestionValue = (index) => {
    return props.topic.questions[index] || '';
};

const updateQuestion = (index, value) => {
    const startQ = (props.topic.id - 1) * 5 + 1;
    const questionNum = startQ + index;
    emit('update', `question_${questionNum}`, value);
};
</script>

<style scoped>
.topic-container {
    margin-bottom: 16px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
    background-color: white;
    transition: all 0.2s ease;
}

.topic-container.editing {
    border-color: #14b8a6;
    box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
}

.topic-header {
    padding: 16px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #f8fafc;
    border-bottom: 1px solid transparent;
    cursor: pointer;
    transition: border-color 0.2s;
}

.topic-container.expanded .topic-header {
    border-bottom-color: #e2e8f0;
}

.topic-title-section {
    display: flex;
    align-items: baseline;
    gap: 12px;
}

.topic-title {
    font-size: 16px;
    font-weight: 600;
    color: #0f172a;
    margin: 0;
}

.topic-questions-count {
    font-size: 13px;
    color: #64748b;
}

.topic-actions {
    display: flex;
    align-items: center;
    gap: 8px;
}

.edit-button {
    background: none;
    border: none;
    cursor: pointer;
    color: #64748b;
    padding: 6px;
    border-radius: 6px;
    transition: all 0.2s ease;
    opacity: 0;
    transform: translateX(8px);
    display: flex;
    align-items: center;
    justify-content: center;
}

.topic-header:hover .edit-button,
.topic-container.editing .edit-button {
    opacity: 1;
    transform: translateX(0);
}

.edit-button:hover {
    background: #e2e8f0;
    color: #0f172a;
}

.topic-container.editing .edit-button {
    color: #ef4444;
}

.topic-container.editing .edit-button:hover {
    background: #fef2f2;
    color: #dc2626;
}

.topic-toggle {
    display: flex;
    align-items: center;
    padding: 4px;
}

.chevron-icon {
    width: 20px;
    height: 20px;
    color: #64748b;
    transition: transform 0.2s ease;
}

.chevron-icon.rotated {
    transform: rotate(-90deg);
}

.topic-content {
    padding: 0;
    animation: slideDown 0.2s ease;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Questions list (display mode) */
.questions-list {
    padding: 12px 20px;
}

.question-item {
    border-bottom: 1px solid #f1f5f9;
    padding: 12px 0;
}

.question-item:last-child {
    border-bottom: none;
}

.question-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.question-title {
    font-size: 14px;
    font-weight: 500;
    color: #334155;
}

.empty-text {
    color: #94a3b8;
    font-style: italic;
    font-size: 14px;
    padding: 12px 0;
}

.topic-footer {
    padding: 12px 20px 20px;
    border-top: 1px solid #f1f5f9;
}

/* Edit form */
.edit-form {
    padding: 20px;
}

.questions-edit {
    margin-top: 24px;
}

.questions-edit h4 {
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 16px 0;
    color: #64748b;
}

.edit-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid #f1f5f9;
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

/* Buttons */
.button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
}

.button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.primary-button {
    background-color: #14b8a6;
    color: white;
}

.primary-button:hover:not(:disabled) {
    background-color: #0d9488;
}

.secondary-button {
    background-color: white;
    color: #64748b;
    border: 1px solid #e2e8f0;
}

.secondary-button:hover:not(:disabled) {
    background-color: #f8fafc;
}

.sm-button {
    padding: 6px 12px;
    font-size: 13px;
}

.spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-right: 6px;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>
