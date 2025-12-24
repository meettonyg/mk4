<template>
    <div class="panel" :class="{ editing: isEditing }">
        <div class="panel-header">
            <h2 class="panel-title">{{ title }}</h2>
            <button
                class="edit-button"
                @click="toggleEdit"
                :title="isEditing ? 'Cancel editing' : 'Edit'"
            >
                <CloseIcon v-if="isEditing" :size="16" />
                <EditIcon v-else :size="16" />
            </button>
        </div>

        <div class="panel-content">
            <!-- Display Mode -->
            <div v-if="!isEditing" class="display-content">
                <slot name="display" />
            </div>

            <!-- Edit Mode -->
            <div v-else class="edit-content">
                <slot name="edit" />

                <div class="panel-actions">
                    <button
                        class="button secondary-button"
                        @click="handleCancel"
                        :disabled="isSaving"
                    >
                        Cancel
                    </button>
                    <button
                        class="button primary-button"
                        @click="handleSave"
                        :disabled="isSaving"
                    >
                        <span v-if="isSaving" class="spinner"></span>
                        {{ isSaving ? 'Saving...' : 'Save' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { EditIcon, CloseIcon } from '../icons';

const props = defineProps({
    title: {
        type: String,
        required: true,
    },
    sectionId: {
        type: String,
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

const emit = defineEmits(['edit', 'save', 'cancel']);

const toggleEdit = () => {
    if (props.isEditing) {
        emit('cancel');
    } else {
        emit('edit', props.sectionId);
    }
};

const handleSave = () => {
    emit('save', props.sectionId);
};

const handleCancel = () => {
    emit('cancel');
};
</script>

<style scoped>
.panel {
    background-color: white;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    margin-bottom: 24px;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.panel.editing {
    border-color: #14b8a6;
    box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
}

.panel-header {
    padding: 16px 20px;
    border-bottom: 1px solid #f1f5f9;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.panel-title {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    color: #0f172a;
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

.panel-header:hover .edit-button,
.panel.editing .edit-button {
    opacity: 1;
    transform: translateX(0);
}

.edit-button:hover {
    background: #f1f5f9;
    color: #0f172a;
}

.panel.editing .edit-button {
    color: #ef4444;
}

.panel.editing .edit-button:hover {
    background: #fef2f2;
    color: #dc2626;
}

.panel-content {
    padding: 20px;
}

.display-content {
    min-height: 40px;
}

.edit-content {
    animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

.panel-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid #f1f5f9;
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
