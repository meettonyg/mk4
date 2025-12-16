<template>
    <div class="gallery-edit">
        <div class="gallery-grid">
            <div
                v-for="(item, index) in items"
                :key="item.id || index"
                class="gallery-item"
            >
                <img
                    :src="item.sizes?.thumbnail || item.url"
                    :alt="item.alt || altDefault"
                />
                <button
                    type="button"
                    class="gallery-remove-btn"
                    @click="$emit('remove', index)"
                    title="Remove"
                >
                    ✕
                </button>
            </div>
            <div class="gallery-add" @click="$emit('add')">
                <span class="upload-icon">+</span>
                <span class="upload-text">{{ addButtonText }}</span>
            </div>
        </div>
    </div>
    <p v-if="error" class="upload-error">{{ error }}</p>
</template>

<script setup>
defineProps({
    items: {
        type: Array,
        default: () => []
    },
    altDefault: {
        type: String,
        default: 'Image'
    },
    addButtonText: {
        type: String,
        default: 'Add Image'
    },
    error: {
        type: String,
        default: null
    }
});

defineEmits(['add', 'remove']);
</script>

<style scoped>
.gallery-edit {
    padding: 0;
}

.gallery-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}

.gallery-item {
    position: relative;
    width: 100px;
    height: 100px;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
}

.gallery-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.gallery-remove-btn {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 24px;
    height: 24px;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s;
}

.gallery-item:hover .gallery-remove-btn {
    opacity: 1;
}

.gallery-remove-btn:hover {
    background: #dc2626;
}

.gallery-add {
    width: 100px;
    height: 100px;
    border: 2px dashed #cbd5e1;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    cursor: pointer;
    transition: all 0.2s;
    background: #f8fafc;
}

.gallery-add:hover {
    border-color: #14b8a6;
    background: #f0fdfa;
}

.upload-icon {
    font-size: 24px;
    color: #94a3b8;
}

.upload-text {
    font-size: 11px;
    color: #64748b;
}

.upload-error {
    margin-top: 12px;
    padding: 8px 12px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 4px;
    color: #dc2626;
    font-size: 13px;
}
</style>
