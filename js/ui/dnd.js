/**
 * @file dnd.js
 * @description Handles all drag and drop functionality for the Media Kit Builder.
 * This includes dragging components from the sidebar to the preview area.
 *
 * ROOT FIX: Converted from ES6 imports to WordPress global namespace approach
 * No more ES6 imports - uses global enhancedComponentManager
 */

// ROOT FIX: Remove ES6 imports - use global namespace
// enhancedComponentManager will be available globally via WordPress enqueue system

let draggedItem = null;

/**
 * ROOT CAUSE FIX: Get available sections for smart targeting
 * @returns {Array} Array of available sections with capacity information
 */
function getAvailableSectionsForTargeting() {
    try {
        if (!window.sectionLayoutManager) {
            return [];
        }
        
        const allSections = window.sectionLayoutManager.getAllSections() || [];
        
        // Filter sections with available capacity and add metadata
        const availableSections = allSections.map(section => {
            const maxComponents = section.layout?.columns || 1;
            const currentComponents = section.components?.length || 0;
            const hasCapacity = currentComponents < maxComponents;
            
            return {
                section_id: section.section_id,
                section_type: section.section_type,
                maxColumns: maxComponents,
                currentComponents: currentComponents,
                hasCapacity: hasCapacity,
                availableColumns: maxComponents - currentComponents,
                priority: hasCapacity ? 1 : 0
            };
        }).sort((a, b) => b.priority - a.priority);
        
        return availableSections;
        
    } catch (error) {
        console.error('DND: Error getting available sections:', error);
        return [];
    }
}

/**
 * ROOT CAUSE FIX: Determine smart section targeting for component
 * @param {Array} availableSections - Available sections with capacity info
 * @param {number} componentIndex - Index of component being added
 * @returns {Object} Section targeting information
 */
function determineSectionTargeting(availableSections, componentIndex = 0) {
    try {
        // If no sections available, return empty targeting
        if (!availableSections || availableSections.length === 0) {
            return {};
        }
        
        // Strategy 1: Find section with available capacity
        const sectionsWithCapacity = availableSections.filter(s => s.hasCapacity);
        
        if (sectionsWithCapacity.length > 0) {
            // Use round-robin distribution for multiple components
            const targetSection = sectionsWithCapacity[componentIndex % sectionsWithCapacity.length];
            
            // Determine target column
            const targetColumn = (targetSection.currentComponents % targetSection.maxColumns) + 1;
            
            return {
                targetSectionId: targetSection.section_id,
                targetColumn: targetColumn
            };
        }
        
        // Strategy 2: Use first section as fallback
        const fallbackSection = availableSections[0];
        
        return {
            targetSectionId: fallbackSection.section_id,
            targetColumn: 1
        };
        
    } catch (error) {
        console.error('DND: Error determining section targeting:', error);
        return {};
    }
}

/**
 * Initializes all drag and drop event listeners.
 */
function initializeDragAndDrop() {
    const componentItems = document.querySelectorAll('.component-item');
    const dropZone = document.getElementById('media-kit-preview');

    // Add drag listeners to all component items in the sidebar
    componentItems.forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
    });

    // Add drop listeners to the main preview area
    if (dropZone) {
        dropZone.addEventListener('dragover', handleDragOver);
        dropZone.addEventListener('dragenter', handleDragEnter);
        dropZone.addEventListener('dragleave', handleDragLeave);
        dropZone.addEventListener('drop', handleDrop);
    }
}

function handleDragStart(e) {
    draggedItem = e.target.closest('.component-item');
    if (draggedItem) {
        // Add a class to give visual feedback
        draggedItem.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'copy';
        // Set the data to be transferred (the component type)
        e.dataTransfer.setData('text/plain', draggedItem.dataset.component);
    }
}

function handleDragEnd() {
    // Clean up visual feedback class
    if (draggedItem) {
        draggedItem.classList.remove('dragging');
    }
    draggedItem = null;
}

function handleDragOver(e) {
    e.preventDefault(); // Necessary to allow for dropping
    e.dataTransfer.dropEffect = 'copy';
}

function handleDragEnter(e) {
    e.preventDefault();
    const previewContainer = e.target.closest('#media-kit-preview');
    if (previewContainer) {
        previewContainer.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    const previewContainer = e.target.closest('#media-kit-preview');
    if (previewContainer) {
        previewContainer.classList.remove('drag-over');
    }
}

/**
 * ROOT CAUSE FIX: Enhanced drop handler with smart section targeting
 */
function handleDrop(e) {
    e.preventDefault();
    const previewContainer = e.target.closest('#media-kit-preview');
    if (previewContainer) {
        previewContainer.classList.remove('drag-over');
    }

    const componentType = e.dataTransfer.getData('text/plain');

    if (componentType) {
        // ROOT FIX: Use global enhancedComponentManager with smart section targeting
        if (window.enhancedComponentManager && window.enhancedComponentManager.addComponent) {
            
            // ROOT CAUSE FIX: Get available sections for smart targeting
            const availableSections = getAvailableSectionsForTargeting();
            const sectionTargeting = determineSectionTargeting(availableSections, 0);
            
            // Add component with section targeting if available
            const componentOptions = {
                ...(sectionTargeting.targetSectionId && {
                    targetSectionId: sectionTargeting.targetSectionId,
                    targetColumn: sectionTargeting.targetColumn
                })
            };
            
            window.enhancedComponentManager.addComponent(componentType, componentOptions);
            
            if (sectionTargeting.targetSectionId) {
                console.log(`✅ DND: Component ${componentType} added to section ${sectionTargeting.targetSectionId} via enhancedComponentManager`);
            } else {
                console.log(`✅ DND: Component ${componentType} added via enhancedComponentManager`);
            }
        } else {
            console.error('❌ DND: enhancedComponentManager not available globally');
        }
    }
}

// ROOT FIX: Expose functions globally instead of ES6 export
window.dragAndDropSystem = {
    initializeDragAndDrop: initializeDragAndDrop,
    handleDragStart: handleDragStart,
    handleDragEnd: handleDragEnd,
    handleDragOver: handleDragOver,
    handleDragEnter: handleDragEnter,
    handleDragLeave: handleDragLeave,
    handleDrop: handleDrop,
    // ROOT CAUSE FIX: Expose section targeting functions
    getAvailableSectionsForTargeting: getAvailableSectionsForTargeting,
    determineSectionTargeting: determineSectionTargeting
};

// ROOT FIX: Auto-initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDragAndDrop);
} else {
    initializeDragAndDrop();
}

console.log('✅ Drag and Drop System: Global namespace setup complete');
