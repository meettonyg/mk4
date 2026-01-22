<template>
    <div class="icon-picker">
        <!-- Current Icon Display (only shown in standalone mode) -->
        <div v-if="!isControlled" class="current-icon-wrapper" @click="openModal">
            <div class="current-icon" :class="{ 'has-icon': modelValue }">
                <i v-if="modelValue" :class="modelValue"></i>
                <span v-else class="placeholder-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="16"></line>
                        <line x1="8" y1="12" x2="16" y2="12"></line>
                    </svg>
                </span>
            </div>
            <span class="icon-label">{{ modelValue ? 'Change Icon' : 'Select Icon' }}</span>
        </div>

        <!-- Modal -->
        <Teleport to="body">
            <div v-if="isModalOpen" class="icon-picker-modal-overlay" @click.self="closeModal">
                <div class="icon-picker-modal">
                    <div class="modal-header">
                        <h3>Select Profile Icon</h3>
                        <button class="close-btn" @click="closeModal">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>

                    <div class="modal-body">
                        <!-- Search -->
                        <div class="search-wrapper">
                            <svg xmlns="http://www.w3.org/2000/svg" class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                            <input
                                type="text"
                                v-model="searchQuery"
                                placeholder="Search icons..."
                                class="search-input"
                                ref="searchInput"
                            />
                        </div>

                        <!-- Categories -->
                        <div class="categories">
                            <button
                                v-for="cat in categories"
                                :key="cat.id"
                                class="category-btn"
                                :class="{ active: selectedCategory === cat.id }"
                                @click="selectedCategory = cat.id"
                            >
                                {{ cat.name }}
                            </button>
                        </div>

                        <!-- Icons Grid -->
                        <div class="icons-grid">
                            <button
                                v-for="icon in filteredIcons"
                                :key="icon.class"
                                class="icon-btn"
                                :class="{ selected: tempSelection === icon.class }"
                                @click="selectIcon(icon.class)"
                                :title="icon.name"
                            >
                                <i :class="icon.class"></i>
                            </button>
                            <div v-if="filteredIcons.length === 0" class="no-results">
                                No icons found matching "{{ searchQuery }}"
                            </div>
                        </div>
                    </div>

                    <div class="modal-footer">
                        <button class="btn btn-secondary" @click="closeModal">Cancel</button>
                        <button
                            v-if="modelValue"
                            class="btn btn-danger-outline"
                            @click="removeIcon"
                        >
                            Remove Icon
                        </button>
                        <button
                            class="btn btn-primary"
                            :disabled="!tempSelection"
                            @click="confirmSelection"
                        >
                            Select Icon
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue';

const props = defineProps({
    modelValue: {
        type: String,
        default: '',
    },
    isOpen: {
        type: Boolean,
        default: null, // null means standalone mode, true/false means controlled mode
    },
});

const emit = defineEmits(['update:modelValue', 'close']);

// Check if we're in controlled mode (parent passes isOpen prop)
const isControlled = computed(() => props.isOpen !== null);

// Internal modal state (for standalone mode)
const internalOpen = ref(false);

// Computed modal open state - use prop if controlled, internal state if standalone
const isModalOpen = computed(() => {
    return isControlled.value ? props.isOpen : internalOpen.value;
});

// Watch for external open state changes to reset form
watch(() => props.isOpen, (newVal) => {
    if (newVal) {
        resetForm();
    }
});

const searchQuery = ref('');
const selectedCategory = ref('all');
const tempSelection = ref('');
const searchInput = ref(null);

const resetForm = () => {
    tempSelection.value = props.modelValue || '';
    searchQuery.value = '';
    selectedCategory.value = 'all';
    nextTick(() => {
        if (searchInput.value) {
            searchInput.value.focus();
        }
    });
};

// Icon categories and data
const categories = [
    { id: 'all', name: 'All' },
    { id: 'business', name: 'Business' },
    { id: 'communication', name: 'Communication' },
    { id: 'media', name: 'Media' },
    { id: 'people', name: 'People' },
    { id: 'objects', name: 'Objects' },
    { id: 'charts', name: 'Charts' },
];

// Curated icon list (Font Awesome 6 solid and regular icons)
const icons = [
    // Business
    { class: 'fa-solid fa-briefcase', name: 'Briefcase', category: 'business' },
    { class: 'fa-solid fa-building', name: 'Building', category: 'business' },
    { class: 'fa-solid fa-landmark', name: 'Landmark', category: 'business' },
    { class: 'fa-solid fa-handshake', name: 'Handshake', category: 'business' },
    { class: 'fa-solid fa-chart-line', name: 'Chart Line', category: 'business' },
    { class: 'fa-solid fa-chart-pie', name: 'Chart Pie', category: 'business' },
    { class: 'fa-solid fa-coins', name: 'Coins', category: 'business' },
    { class: 'fa-solid fa-wallet', name: 'Wallet', category: 'business' },
    { class: 'fa-solid fa-piggy-bank', name: 'Piggy Bank', category: 'business' },
    { class: 'fa-solid fa-sack-dollar', name: 'Money Bag', category: 'business' },
    { class: 'fa-solid fa-scale-balanced', name: 'Scale', category: 'business' },
    { class: 'fa-solid fa-gavel', name: 'Gavel', category: 'business' },
    { class: 'fa-solid fa-file-contract', name: 'Contract', category: 'business' },
    { class: 'fa-solid fa-receipt', name: 'Receipt', category: 'business' },

    // Communication
    { class: 'fa-solid fa-microphone', name: 'Microphone', category: 'communication' },
    { class: 'fa-solid fa-microphone-lines', name: 'Microphone Lines', category: 'communication' },
    { class: 'fa-solid fa-podcast', name: 'Podcast', category: 'communication' },
    { class: 'fa-solid fa-headphones', name: 'Headphones', category: 'communication' },
    { class: 'fa-solid fa-comments', name: 'Comments', category: 'communication' },
    { class: 'fa-solid fa-comment-dots', name: 'Comment Dots', category: 'communication' },
    { class: 'fa-solid fa-message', name: 'Message', category: 'communication' },
    { class: 'fa-solid fa-bullhorn', name: 'Bullhorn', category: 'communication' },
    { class: 'fa-solid fa-phone', name: 'Phone', category: 'communication' },
    { class: 'fa-solid fa-video', name: 'Video', category: 'communication' },
    { class: 'fa-solid fa-envelope', name: 'Envelope', category: 'communication' },
    { class: 'fa-solid fa-paper-plane', name: 'Paper Plane', category: 'communication' },
    { class: 'fa-solid fa-rss', name: 'RSS', category: 'communication' },
    { class: 'fa-solid fa-tower-broadcast', name: 'Broadcast', category: 'communication' },

    // Media
    { class: 'fa-solid fa-camera', name: 'Camera', category: 'media' },
    { class: 'fa-solid fa-film', name: 'Film', category: 'media' },
    { class: 'fa-solid fa-clapperboard', name: 'Clapperboard', category: 'media' },
    { class: 'fa-solid fa-play', name: 'Play', category: 'media' },
    { class: 'fa-solid fa-circle-play', name: 'Play Circle', category: 'media' },
    { class: 'fa-solid fa-music', name: 'Music', category: 'media' },
    { class: 'fa-solid fa-guitar', name: 'Guitar', category: 'media' },
    { class: 'fa-solid fa-radio', name: 'Radio', category: 'media' },
    { class: 'fa-solid fa-tv', name: 'TV', category: 'media' },
    { class: 'fa-solid fa-newspaper', name: 'Newspaper', category: 'media' },
    { class: 'fa-solid fa-book', name: 'Book', category: 'media' },
    { class: 'fa-solid fa-book-open', name: 'Book Open', category: 'media' },
    { class: 'fa-solid fa-pen', name: 'Pen', category: 'media' },
    { class: 'fa-solid fa-pen-fancy', name: 'Pen Fancy', category: 'media' },

    // People
    { class: 'fa-solid fa-user', name: 'User', category: 'people' },
    { class: 'fa-solid fa-user-tie', name: 'User Tie', category: 'people' },
    { class: 'fa-solid fa-user-graduate', name: 'Graduate', category: 'people' },
    { class: 'fa-solid fa-user-doctor', name: 'Doctor', category: 'people' },
    { class: 'fa-solid fa-users', name: 'Users', category: 'people' },
    { class: 'fa-solid fa-people-group', name: 'People Group', category: 'people' },
    { class: 'fa-solid fa-person-chalkboard', name: 'Presenter', category: 'people' },
    { class: 'fa-solid fa-chalkboard-user', name: 'Teacher', category: 'people' },
    { class: 'fa-solid fa-hands-holding', name: 'Hands Holding', category: 'people' },
    { class: 'fa-solid fa-hand-holding-heart', name: 'Holding Heart', category: 'people' },
    { class: 'fa-solid fa-children', name: 'Children', category: 'people' },
    { class: 'fa-solid fa-person-running', name: 'Running', category: 'people' },
    { class: 'fa-solid fa-dumbbell', name: 'Dumbbell', category: 'people' },
    { class: 'fa-solid fa-heart-pulse', name: 'Health', category: 'people' },

    // Objects
    { class: 'fa-solid fa-lightbulb', name: 'Lightbulb', category: 'objects' },
    { class: 'fa-solid fa-rocket', name: 'Rocket', category: 'objects' },
    { class: 'fa-solid fa-star', name: 'Star', category: 'objects' },
    { class: 'fa-solid fa-award', name: 'Award', category: 'objects' },
    { class: 'fa-solid fa-trophy', name: 'Trophy', category: 'objects' },
    { class: 'fa-solid fa-medal', name: 'Medal', category: 'objects' },
    { class: 'fa-solid fa-crown', name: 'Crown', category: 'objects' },
    { class: 'fa-solid fa-gem', name: 'Gem', category: 'objects' },
    { class: 'fa-solid fa-key', name: 'Key', category: 'objects' },
    { class: 'fa-solid fa-lock', name: 'Lock', category: 'objects' },
    { class: 'fa-solid fa-shield', name: 'Shield', category: 'objects' },
    { class: 'fa-solid fa-globe', name: 'Globe', category: 'objects' },
    { class: 'fa-solid fa-earth-americas', name: 'Earth', category: 'objects' },
    { class: 'fa-solid fa-compass', name: 'Compass', category: 'objects' },
    { class: 'fa-solid fa-magnifying-glass', name: 'Search', category: 'objects' },
    { class: 'fa-solid fa-laptop', name: 'Laptop', category: 'objects' },
    { class: 'fa-solid fa-desktop', name: 'Desktop', category: 'objects' },
    { class: 'fa-solid fa-mobile', name: 'Mobile', category: 'objects' },
    { class: 'fa-solid fa-code', name: 'Code', category: 'objects' },
    { class: 'fa-solid fa-database', name: 'Database', category: 'objects' },
    { class: 'fa-solid fa-cloud', name: 'Cloud', category: 'objects' },
    { class: 'fa-solid fa-gear', name: 'Gear', category: 'objects' },
    { class: 'fa-solid fa-wrench', name: 'Wrench', category: 'objects' },
    { class: 'fa-solid fa-hammer', name: 'Hammer', category: 'objects' },
    { class: 'fa-solid fa-house', name: 'House', category: 'objects' },
    { class: 'fa-solid fa-tree', name: 'Tree', category: 'objects' },
    { class: 'fa-solid fa-leaf', name: 'Leaf', category: 'objects' },
    { class: 'fa-solid fa-seedling', name: 'Seedling', category: 'objects' },
    { class: 'fa-solid fa-sun', name: 'Sun', category: 'objects' },
    { class: 'fa-solid fa-moon', name: 'Moon', category: 'objects' },
    { class: 'fa-solid fa-bolt', name: 'Bolt', category: 'objects' },
    { class: 'fa-solid fa-fire', name: 'Fire', category: 'objects' },
    { class: 'fa-solid fa-heart', name: 'Heart', category: 'objects' },
    { class: 'fa-solid fa-brain', name: 'Brain', category: 'objects' },
    { class: 'fa-solid fa-graduation-cap', name: 'Graduation Cap', category: 'objects' },
    { class: 'fa-solid fa-utensils', name: 'Utensils', category: 'objects' },
    { class: 'fa-solid fa-mug-hot', name: 'Coffee', category: 'objects' },
    { class: 'fa-solid fa-wine-glass', name: 'Wine', category: 'objects' },
    { class: 'fa-solid fa-plane', name: 'Plane', category: 'objects' },
    { class: 'fa-solid fa-car', name: 'Car', category: 'objects' },
    { class: 'fa-solid fa-bicycle', name: 'Bicycle', category: 'objects' },

    // Charts
    { class: 'fa-solid fa-chart-simple', name: 'Chart Simple', category: 'charts' },
    { class: 'fa-solid fa-chart-bar', name: 'Chart Bar', category: 'charts' },
    { class: 'fa-solid fa-chart-column', name: 'Chart Column', category: 'charts' },
    { class: 'fa-solid fa-chart-area', name: 'Chart Area', category: 'charts' },
    { class: 'fa-solid fa-chart-gantt', name: 'Gantt Chart', category: 'charts' },
    { class: 'fa-solid fa-diagram-project', name: 'Project Diagram', category: 'charts' },
    { class: 'fa-solid fa-sitemap', name: 'Sitemap', category: 'charts' },
    { class: 'fa-solid fa-network-wired', name: 'Network', category: 'charts' },
    { class: 'fa-solid fa-arrows-spin', name: 'Cycle', category: 'charts' },
    { class: 'fa-solid fa-circle-nodes', name: 'Nodes', category: 'charts' },
];

// Computed
const filteredIcons = computed(() => {
    let result = icons;

    // Filter by category
    if (selectedCategory.value !== 'all') {
        result = result.filter(icon => icon.category === selectedCategory.value);
    }

    // Filter by search
    if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(icon =>
            icon.name.toLowerCase().includes(query) ||
            icon.class.toLowerCase().includes(query)
        );
    }

    return result;
});

// Methods
const openModal = () => {
    if (!isControlled.value) {
        internalOpen.value = true;
    }
    resetForm();
};

const closeModal = () => {
    if (isControlled.value) {
        emit('close');
    } else {
        internalOpen.value = false;
    }
    tempSelection.value = '';
};

const selectIcon = (iconClass) => {
    tempSelection.value = iconClass;
};

const confirmSelection = () => {
    if (tempSelection.value) {
        emit('update:modelValue', tempSelection.value);
        closeModal();
    }
};

const removeIcon = () => {
    emit('update:modelValue', '');
    closeModal();
};
</script>

<style scoped>
.icon-picker {
    display: inline-block;
}

.current-icon-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    padding: 12px;
    border: 2px dashed #e2e8f0;
    border-radius: 12px;
    transition: all 0.2s ease;
    background: #f8fafc;
}

.current-icon-wrapper:hover {
    border-color: #ED8936;
    background: #fffbf5;
}

.current-icon {
    width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    border-radius: 50%;
    border: 2px solid #e2e8f0;
    transition: all 0.2s ease;
}

.current-icon.has-icon {
    border-color: #ED8936;
    background: linear-gradient(135deg, #fff8f0, #fff);
}

.current-icon i {
    font-size: 28px;
    color: #ED8936;
}

.placeholder-icon svg {
    width: 24px;
    height: 24px;
    color: #94a3b8;
}

.icon-label {
    font-size: 13px;
    color: #64748b;
    font-weight: 500;
}

/* Modal */
.icon-picker-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100000;
    padding: 20px;
}

.icon-picker-modal {
    background: #fff;
    border-radius: 12px;
    width: 100%;
    max-width: 600px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
    font-size: 18px;
    font-weight: 600;
    color: #334155;
    margin: 0;
}

.close-btn {
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    color: #64748b;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s ease;
}

.close-btn:hover {
    background: #f1f5f9;
    color: #334155;
}

.close-btn svg {
    width: 20px;
    height: 20px;
}

.modal-body {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding: 16px 20px;
}

.search-wrapper {
    position: relative;
    margin-bottom: 12px;
}

.search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    color: #94a3b8;
    pointer-events: none;
}

.search-input {
    width: 100%;
    padding: 10px 12px 10px 40px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
    color: #334155;
    transition: all 0.2s ease;
}

.search-input:focus {
    outline: none;
    border-color: #ED8936;
    box-shadow: 0 0 0 3px rgba(237, 137, 54, 0.1);
}

.categories {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f1f5f9;
}

.category-btn {
    padding: 6px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 20px;
    background: #fff;
    color: #64748b;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.category-btn:hover {
    border-color: #ED8936;
    color: #ED8936;
}

.category-btn.active {
    background: #ED8936;
    border-color: #ED8936;
    color: #fff;
}

.icons-grid {
    flex: 1;
    overflow-y: auto;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(56px, 1fr));
    gap: 8px;
    padding: 4px;
}

.icon-btn {
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid transparent;
    border-radius: 8px;
    background: #f8fafc;
    cursor: pointer;
    transition: all 0.15s ease;
}

.icon-btn i {
    font-size: 20px;
    color: #475569;
    transition: all 0.15s ease;
}

.icon-btn:hover {
    background: #fff;
    border-color: #ED8936;
}

.icon-btn:hover i {
    color: #ED8936;
    transform: scale(1.1);
}

.icon-btn.selected {
    background: #fff8f0;
    border-color: #ED8936;
}

.icon-btn.selected i {
    color: #ED8936;
}

.no-results {
    grid-column: 1 / -1;
    text-align: center;
    padding: 40px 20px;
    color: #64748b;
    font-size: 14px;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 16px 20px;
    border-top: 1px solid #e2e8f0;
}

.btn {
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
}

.btn-secondary {
    background: #f1f5f9;
    color: #475569;
}

.btn-secondary:hover {
    background: #e2e8f0;
}

.btn-primary {
    background: linear-gradient(135deg, #ED8936, #DD6B20);
    color: #fff;
}

.btn-primary:hover:not(:disabled) {
    background: linear-gradient(135deg, #DD6B20, #C05621);
}

.btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-danger-outline {
    background: transparent;
    border: 1px solid #ef4444;
    color: #ef4444;
}

.btn-danger-outline:hover {
    background: #fef2f2;
}
</style>
