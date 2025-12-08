<template>
    <div class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Create New Profile</h2>
                <button class="close-button" @click="$emit('close')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            <div class="modal-body">
                <p class="modal-description">
                    Create a new guest profile to showcase a different area of expertise.
                </p>

                <div class="form-group">
                    <label for="first_name">First Name</label>
                    <input
                        id="first_name"
                        v-model="store.newProfile.first_name"
                        type="text"
                        placeholder="Enter first name"
                        @keyup.enter="handleSubmit"
                    />
                </div>

                <div class="form-group">
                    <label for="last_name">Last Name</label>
                    <input
                        id="last_name"
                        v-model="store.newProfile.last_name"
                        type="text"
                        placeholder="Enter last name"
                        @keyup.enter="handleSubmit"
                    />
                </div>
            </div>

            <div class="modal-footer">
                <button class="cancel-button" @click="$emit('close')" :disabled="store.isCreating">
                    Cancel
                </button>
                <button class="create-button" @click="handleSubmit" :disabled="store.isCreating">
                    <span v-if="store.isCreating">Creating...</span>
                    <span v-else>Create Profile</span>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useProfileListStore } from '../stores/profileList.js';

const store = useProfileListStore();

const emit = defineEmits(['close', 'create']);

const handleSubmit = () => {
    emit('create');
};
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
}

.modal-content {
    background: #ffffff;
    border-radius: 12px;
    width: 100%;
    max-width: 440px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1px solid #e2e8f0;
}

.modal-header h2 {
    font-size: 18px;
    font-weight: 600;
    color: #4A5568;
    margin: 0;
}

.close-button {
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    color: #94a3b8;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s ease;
}

.close-button:hover {
    background: #f1f5f9;
    color: #64748b;
}

.modal-body {
    padding: 24px;
}

.modal-description {
    font-size: 14px;
    color: #64748b;
    margin: 0 0 20px 0;
}

.form-group {
    margin-bottom: 16px;
}

.form-group:last-child {
    margin-bottom: 0;
}

.form-group label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #4A5568;
    margin-bottom: 6px;
}

.form-group input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #cbd6e2;
    border-radius: 6px;
    font-size: 14px;
    color: #4A5568;
    transition: border-color 0.2s ease;
}

.form-group input:focus {
    outline: none;
    border-color: #ED8936;
    box-shadow: 0 0 0 3px rgba(237, 137, 54, 0.1);
}

.form-group input::placeholder {
    color: #94a3b8;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px 24px;
    border-top: 1px solid #e2e8f0;
    background: #f8fafc;
    border-radius: 0 0 12px 12px;
}

.cancel-button {
    padding: 10px 20px;
    border: 1px solid #cbd6e2;
    border-radius: 6px;
    background: #ffffff;
    color: #64748b;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.cancel-button:hover:not(:disabled) {
    background: #f1f5f9;
    border-color: #94a3b8;
}

.cancel-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.create-button {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    background: #ED8936;
    color: #ffffff;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.create-button:hover:not(:disabled) {
    background: #d67326;
}

.create-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
</style>
