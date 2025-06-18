/**
 * Photo Gallery Component Panel Script
 * Handles the dynamic functionality of the photo gallery design panel
 * Using schema-driven approach with DataBindingEngine
 */

import { dataBindingEngine } from '../../js/services/data-binding-engine.js';
import { stateManager } from '../../js/services/state-manager.js';

// Register this component's panel handler
window.componentPanelHandlers = window.componentPanelHandlers || {};
window.componentPanelHandlers['photo-gallery'] = function(element) {
    initializePhotoGalleryPanel(element);
};

/**
 * Initialize photo gallery panel
 * @param {HTMLElement} element - The photo gallery component element
 */
function initializePhotoGalleryPanel(element) {
    if (!element) return;
    
    const componentId = element.getAttribute('data-component-id');
    if (!componentId) {
        console.error('Component ID not found on element');
        return;
    }
    
    // Create photo editor container if not exists
    let photoEditorContainer = document.getElementById('design-photos-container');
    if (!photoEditorContainer) {
        const formSection = document.createElement('div');
        formSection.className = 'form-section';
        formSection.innerHTML = `
            <h4 class="form-section__title">Photos</h4>
            <div id="design-photos-container">
                <div id="design-photos-list" class="photo-editor-list"></div>
                <button id="add-photo-btn" class="add-photo-btn">Add Photo</button>
            </div>
        `;
        
        // Find where to insert this section (after the content section)
        const contentSection = document.querySelector('.form-section');
        if (contentSection) {
            contentSection.parentNode.insertBefore(formSection, contentSection.nextSibling);
        } else {
            // If no content section found, add to the panel
            const panel = document.querySelector('.element-editor__content');
            if (panel) {
                panel.appendChild(formSection);
            }
        }
        
        photoEditorContainer = document.getElementById('design-photos-container');
    }
    
    const photosList = document.getElementById('design-photos-list');
    const addPhotoBtn = document.getElementById('add-photo-btn');
    
    if (!photosList || !addPhotoBtn) return;
    
    // Clear existing content
    photosList.innerHTML = '';
    
    // Get current photos from state
    const photos = stateManager.getComponentSetting(componentId, 'photos') || [];
    
    // Render photos list in panel
    renderPhotosList(photos, photosList, componentId);
    
    // Add photo button handler
    addPhotoBtn.addEventListener('click', function() {
        // Get current photos
        const currentPhotos = stateManager.getComponentSetting(componentId, 'photos') || [];
        
        // Add new photo
        const newPhoto = {
            src: '/assets/images/placeholder-image.jpg',
            caption: 'New Photo Caption'
        };
        
        const updatedPhotos = [...currentPhotos, newPhoto];
        
        // Update state
        stateManager.updateComponent(componentId, 'photos', updatedPhotos);
        
        // Re-render photos list
        renderPhotosList(updatedPhotos, photosList, componentId);
    });
    
    // Initialize custom binding for photos array
    initializeCustomPhotosBinding(componentId);
}

/**
 * Render photos list in the design panel
 * @param {Array} photos - Array of photo objects
 * @param {HTMLElement} container - Container element
 * @param {string} componentId - Component ID
 */
function renderPhotosList(photos, container, componentId) {
    container.innerHTML = '';
    
    photos.forEach((photo, index) => {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-editor-item';
        photoItem.setAttribute('data-index', index);
        photoItem.innerHTML = `
            <div class="photo-preview">
                <img src="${photo.src}" alt="Photo ${index + 1}" class="photo-thumbnail">
            </div>
            <div class="photo-editor-controls">
                <div class="form-group">
                    <label class="form-label">Caption</label>
                    <input type="text" class="form-input photo-caption-input" value="${escapeHtml(photo.caption)}" data-index="${index}">
                </div>
                <div class="form-group">
                    <button class="change-photo-btn" data-index="${index}">Change Photo</button>
                </div>
            </div>
            <button class="photo-sort-handle" title="Drag to reorder">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
            </button>
            <button class="remove-item-btn" title="Remove photo">×</button>
        `;
        
        // Caption input handler
        const captionInput = photoItem.querySelector('.photo-caption-input');
        if (captionInput) {
            captionInput.addEventListener('input', function() {
                updatePhotoCaption(this.value, index, componentId);
            });
        }
        
        // Change photo button handler
        const changePhotoBtn = photoItem.querySelector('.change-photo-btn');
        if (changePhotoBtn) {
            changePhotoBtn.addEventListener('click', function() {
                // This would typically use the WordPress media uploader
                // For demo purposes, we'll simulate changing to a different placeholder
                const randomNum = Math.floor(Math.random() * 1000);
                const newSrc = `/assets/images/placeholder-image-${randomNum}.jpg`;
                updatePhotoSource(newSrc, index, componentId);
                
                // Update thumbnail in panel
                const thumbnail = photoItem.querySelector('.photo-thumbnail');
                if (thumbnail) {
                    thumbnail.src = newSrc;
                }
                
                // Show notification
                if (window.showToast) {
                    window.showToast('Photo changed successfully', 'success');
                }
            });
        }
        
        // Remove button handler
        const removeBtn = photoItem.querySelector('.remove-item-btn');
        removeBtn.addEventListener('click', function() {
            removePhoto(index, componentId);
            photoItem.remove();
        });
        
        container.appendChild(photoItem);
    });
    
    // Initialize drag-and-drop for photo sorting
    initializePhotoSorting(container, componentId);
}

/**
 * Update photo caption
 * @param {string} caption - New caption
 * @param {number} index - Photo index
 * @param {string} componentId - Component ID
 */
function updatePhotoCaption(caption, index, componentId) {
    const photos = stateManager.getComponentSetting(componentId, 'photos') || [];
    if (photos[index]) {
        photos[index].caption = caption;
        stateManager.updateComponent(componentId, 'photos', photos);
    }
}

/**
 * Update photo source
 * @param {string} src - New source URL
 * @param {number} index - Photo index
 * @param {string} componentId - Component ID
 */
function updatePhotoSource(src, index, componentId) {
    const photos = stateManager.getComponentSetting(componentId, 'photos') || [];
    if (photos[index]) {
        photos[index].src = src;
        stateManager.updateComponent(componentId, 'photos', photos);
    }
}

/**
 * Remove photo
 * @param {number} index - Photo index
 * @param {string} componentId - Component ID
 */
function removePhoto(index, componentId) {
    const photos = stateManager.getComponentSetting(componentId, 'photos') || [];
    const updatedPhotos = photos.filter((_, i) => i !== index);
    stateManager.updateComponent(componentId, 'photos', updatedPhotos);
}

/**
 * Initialize drag-and-drop sorting for photos
 * @param {HTMLElement} container - Photos list container
 * @param {string} componentId - Component ID
 */
function initializePhotoSorting(container, componentId) {
    // This function would implement drag-and-drop functionality
    // For simplicity, we'll just add a placeholder comment
    
    // Example pseudo-code for sorting implementation:
    // const sortable = new Sortable(container, {
    //     handle: '.photo-sort-handle',
    //     onEnd: function(evt) {
    //         const photos = stateManager.getComponentSetting(componentId, 'photos') || [];
    //         const movedItem = photos.splice(evt.oldIndex, 1)[0];
    //         photos.splice(evt.newIndex, 0, movedItem);
    //         stateManager.updateComponent(componentId, 'photos', photos);
    //     }
    // });
    
    console.log('Photo sorting would be initialized here');
}

/**
 * Initialize custom binding for photos array
 * @param {string} componentId - Component ID
 */
function initializeCustomPhotosBinding(componentId) {
    // Subscribe to changes in the photos array
    stateManager.subscribe(componentId, (state) => {
        if (state.photos) {
            updatePhotosInComponent(componentId, state.photos);
        }
    });
}

/**
 * Update photos in the component based on state
 * @param {string} componentId - Component ID
 * @param {Array} photos - Photos array
 */
function updatePhotosInComponent(componentId, photos) {
    const element = document.querySelector(`[data-component-id="${componentId}"]`);
    if (!element) return;
    
    const galleryGrid = element.querySelector('.photo-gallery-grid');
    if (!galleryGrid) return;
    
    // Get caption style and layout settings
    const captionStyle = stateManager.getComponentSetting(componentId, 'caption_style') || 'overlay';
    const layout = stateManager.getComponentSetting(componentId, 'galleryLayout') || 'grid';
    
    // Clear existing photos
    galleryGrid.innerHTML = '';
    
    // Add photos from state
    photos.forEach((photo, index) => {
        if (!photo.src) return;
        
        const photoDiv = document.createElement('div');
        photoDiv.className = 'photo-item';
        photoDiv.setAttribute('data-index', index);
        
        let captionHTML = '';
        if (captionStyle !== 'none' && photo.caption) {
            captionHTML = `<div class="photo-caption">${escapeHtml(photo.caption)}</div>`;
        }
        
        photoDiv.innerHTML = `
            <div class="photo-wrapper">
                <img src="${photo.src}" alt="${escapeHtml(photo.caption || `Photo ${index + 1}`)}" class="photo-image">
                ${captionHTML}
            </div>
        `;
        
        galleryGrid.appendChild(photoDiv);
    });
    
    // Apply columns if grid layout
    if (layout === 'grid') {
        const columns = stateManager.getComponentSetting(componentId, 'columns') || '3';
        galleryGrid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    }
}

/**
 * Escape HTML for safe insertion
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
