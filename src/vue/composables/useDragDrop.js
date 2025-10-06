/**
 * Drag and Drop Composable
 * 
 * ROOT FIX: Extracts drag-drop logic from components
 * Provides reusable drag-drop functionality
 * 
 * @package GMKB
 * @version 2.0.0
 */

import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useMediaKitStore } from '../stores/mediaKit';
import { useUIStore } from '../stores/ui';

export function useDragDrop(options = {}) {
    const mediaKitStore = useMediaKitStore();
    const uiStore = useUIStore();
    
    // Options with defaults
    const {
        onDragStart = null,
        onDragEnd = null,
        onDrop = null,
        allowedTypes = null,
        dropEffect = 'move'
    } = options;
    
    // Local state
    const isDraggingOver = ref(false);
    const dragCounter = ref(0); // For nested drag events
    
    // Computed states
    const isDragging = computed(() => uiStore.isDragging);
    const draggedItem = computed(() => ({
        id: uiStore.draggedComponentId,
        type: uiStore.draggedComponentType
    }));
    
    /**
     * Make an element draggable
     */
    function makeDraggable(element, data) {
        if (!element) return;
        
        element.draggable = true;
        
        // Set drag data
        element.dataset.dragId = data.id || '';
        element.dataset.dragType = data.type || '';
        
        // Add drag start handler
        const handleDragStart = (e) => {
            e.dataTransfer.effectAllowed = dropEffect;
            e.dataTransfer.setData('text/plain', JSON.stringify(data));
            
            // Update UI store
            uiStore.startDrag(data.id, data.type);
            
            // Add dragging class
            element.classList.add('dragging');
            
            // Custom callback
            if (onDragStart) {
                onDragStart(data, e);
            }
            
            // Dispatch event
            document.dispatchEvent(new CustomEvent('gmkb:drag-start', {
                detail: { data, element }
            }));
        };
        
        // Add drag end handler
        const handleDragEnd = (e) => {
            // Update UI store
            uiStore.endDrag();
            
            // Remove dragging class
            element.classList.remove('dragging');
            
            // Custom callback
            if (onDragEnd) {
                onDragEnd(data, e);
            }
            
            // Dispatch event
            document.dispatchEvent(new CustomEvent('gmkb:drag-end', {
                detail: { data, element }
            }));
        };
        
        // Attach handlers
        element.addEventListener('dragstart', handleDragStart);
        element.addEventListener('dragend', handleDragEnd);
        
        // Return cleanup function
        return () => {
            element.removeEventListener('dragstart', handleDragStart);
            element.removeEventListener('dragend', handleDragEnd);
        };
    }
    
    /**
     * Make an element a drop zone
     */
    function makeDropZone(element, dropData) {
        if (!element) return;
        
        // Add drop zone data
        element.dataset.dropId = dropData.id || '';
        element.dataset.dropType = dropData.type || '';
        
        // Drag over handler
        const handleDragOver = (e) => {
            e.preventDefault(); // Allow drop
            
            // Check if type is allowed
            if (allowedTypes && uiStore.draggedComponentType) {
                if (!allowedTypes.includes(uiStore.draggedComponentType)) {
                    e.dataTransfer.dropEffect = 'none';
                    return;
                }
            }
            
            e.dataTransfer.dropEffect = dropEffect;
            
            // Update drop target in store
            uiStore.updateDropTarget(dropData.id, calculateDropPosition(e, element));
        };
        
        // Drag enter handler
        const handleDragEnter = (e) => {
            e.preventDefault();
            
            dragCounter.value++;
            
            if (dragCounter.value === 1) {
                isDraggingOver.value = true;
                element.classList.add('drag-over');
                
                // Dispatch event
                document.dispatchEvent(new CustomEvent('gmkb:drag-enter', {
                    detail: { dropData, element }
                }));
            }
        };
        
        // Drag leave handler
        const handleDragLeave = (e) => {
            dragCounter.value--;
            
            if (dragCounter.value === 0) {
                isDraggingOver.value = false;
                element.classList.remove('drag-over');
                
                // Clear drop target
                uiStore.updateDropTarget(null);
                
                // Dispatch event
                document.dispatchEvent(new CustomEvent('gmkb:drag-leave', {
                    detail: { dropData, element }
                }));
            }
        };
        
        // Drop handler
        const handleDrop = (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Reset counter and state
            dragCounter.value = 0;
            isDraggingOver.value = false;
            element.classList.remove('drag-over');
            
            // Get drag data
            let dragData;
            try {
                dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
            } catch (err) {
                console.error('Failed to parse drag data:', err);
                return;
            }
            
            // Calculate drop position
            const position = calculateDropPosition(e, element);
            
            // Handle the drop
            const dropResult = {
                dragData,
                dropData,
                position,
                element
            };
            
            // Custom callback
            if (onDrop) {
                onDrop(dropResult);
            }
            
            // Default drop handling
            handleDefaultDrop(dropResult);
            
            // Clear drop target
            uiStore.updateDropTarget(null);
            
            // Dispatch event
            document.dispatchEvent(new CustomEvent('gmkb:drop', {
                detail: dropResult
            }));
        };
        
        // Attach handlers
        element.addEventListener('dragover', handleDragOver);
        element.addEventListener('dragenter', handleDragEnter);
        element.addEventListener('dragleave', handleDragLeave);
        element.addEventListener('drop', handleDrop);
        
        // Return cleanup function
        return () => {
            element.removeEventListener('dragover', handleDragOver);
            element.removeEventListener('dragenter', handleDragEnter);
            element.removeEventListener('dragleave', handleDragLeave);
            element.removeEventListener('drop', handleDrop);
        };
    }
    
    /**
     * Calculate drop position based on mouse position
     */
    function calculateDropPosition(e, element) {
        const rect = element.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const height = rect.height;
        
        // Determine if drop is before, after, or inside
        if (y < height * 0.25) {
            return 'before';
        } else if (y > height * 0.75) {
            return 'after';
        } else {
            return 'inside';
        }
    }
    
    /**
     * Default drop handling
     */
    function handleDefaultDrop(dropResult) {
        const { dragData, dropData, position } = dropResult;
        
        // Handle component drop
        if (dragData.type && !dragData.id) {
            // New component from library
            const componentData = {
                type: dragData.type,
                data: dragData.data || {},
                sectionId: dropData.sectionId,
                column: dropData.column
            };
            
            const componentId = mediaKitStore.addComponent(componentData);
            
            if (componentId) {
                // Select the new component
                uiStore.selectComponent(componentId);
            }
        } else if (dragData.id) {
            // Existing component being moved
            if (dropData.sectionId) {
                mediaKitStore.moveComponentToSection(
                    dragData.id,
                    dropData.sectionId,
                    dropData.column || 1
                );
            }
        }
    }
    
    /**
     * Setup keyboard shortcuts for drag operations
     */
    function setupKeyboardShortcuts() {
        const handleKeyDown = (e) => {
            // ESC to cancel drag
            if (e.key === 'Escape' && uiStore.isDragging) {
                uiStore.endDrag();
            }
        };
        
        document.addEventListener('keydown', handleKeyDown);
        
        // Return cleanup function
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }
    
    /**
     * Get drop zone info
     */
    function getDropZoneInfo(element) {
        if (!element) return null;
        
        return {
            id: element.dataset.dropId,
            type: element.dataset.dropType,
            element,
            isDraggingOver: isDraggingOver.value
        };
    }
    
    /**
     * Check if item can be dropped
     */
    function canDrop(dragType, dropType) {
        // No allowed types means all are allowed
        if (!allowedTypes || allowedTypes.length === 0) {
            return true;
        }
        
        return allowedTypes.includes(dragType);
    }
    
    // Auto cleanup on unmount
    const cleanupFunctions = [];
    
    onUnmounted(() => {
        cleanupFunctions.forEach(cleanup => cleanup());
        cleanupFunctions.length = 0;
    });
    
    return {
        // State
        isDragging,
        isDraggingOver,
        draggedItem,
        
        // Methods
        makeDraggable,
        makeDropZone,
        canDrop,
        getDropZoneInfo,
        setupKeyboardShortcuts,
        
        // Store cleanup functions
        addCleanup(fn) {
            cleanupFunctions.push(fn);
        }
    };
}

/**
 * Directive for making elements draggable
 */
export const vDraggable = {
    mounted(el, binding) {
        const { makeDraggable } = useDragDrop();
        el._dragCleanup = makeDraggable(el, binding.value);
    },
    
    unmounted(el) {
        if (el._dragCleanup) {
            el._dragCleanup();
            delete el._dragCleanup;
        }
    }
};

/**
 * Directive for making elements drop zones
 */
export const vDropZone = {
    mounted(el, binding) {
        const { makeDropZone } = useDragDrop();
        el._dropCleanup = makeDropZone(el, binding.value);
    },
    
    unmounted(el) {
        if (el._dropCleanup) {
            el._dropCleanup();
            delete el._dropCleanup;
        }
    }
};
