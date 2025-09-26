/**
 * Vue Composable for Keyboard Shortcuts
 * Handles undo/redo keyboard shortcuts in Vue components
 * 
 * @version 1.0.0
 */

import { onMounted, onUnmounted } from 'vue';
import { useMediaKitStore } from '@/stores/mediaKit';

export function useKeyboardShortcuts() {
    const store = useMediaKitStore();
    
    const handleKeydown = (event) => {
        // Skip if user is typing in an input field
        if (event.target.matches('input, textarea, select, [contenteditable="true"]')) {
            return;
        }
        
        // Check for undo (Ctrl/Cmd + Z)
        if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
            event.preventDefault();
            store.undo();
        }
        // Check for redo (Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y)
        else if (((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'z') ||
                 ((event.ctrlKey || event.metaKey) && event.key === 'y')) {
            event.preventDefault();
            store.redo();
        }
        // Save (Ctrl/Cmd + S)
        else if ((event.ctrlKey || event.metaKey) && event.key === 's') {
            event.preventDefault();
            store.saveToWordPress();
        }
        // Delete selected component
        else if (event.key === 'Delete' && store.selectedComponentId) {
            event.preventDefault();
            store.removeComponent(store.selectedComponentId);
        }
        // Duplicate component (Ctrl/Cmd + D)
        else if ((event.ctrlKey || event.metaKey) && event.key === 'd' && store.selectedComponentId) {
            event.preventDefault();
            store.duplicateComponent(store.selectedComponentId);
        }
    };
    
    onMounted(() => {
        document.addEventListener('keydown', handleKeydown);
    });
    
    onUnmounted(() => {
        document.removeEventListener('keydown', handleKeydown);
    });
    
    return {
        // Expose methods if needed by components
        undo: () => store.undo(),
        redo: () => store.redo(),
        canUndo: () => store.canUndo(),
        canRedo: () => store.canRedo()
    };
}
