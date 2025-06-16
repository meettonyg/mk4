/**
 * Photo Gallery Component Panel Script
 * Handles the dynamic functionality of the photo gallery design panel
 */

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
    const photosList = document.getElementById('design-photos-list');
    const addPhotoBtn = document.getElementById('add-photo-btn');
    
    if (!photosList || !addPhotoBtn) return;
    
    // Load existing photos
    const existingPhotos = element.querySelectorAll('.photo-item');
    photosList.innerHTML = '';
    
    existingPhotos.forEach((photo, index) => {
        const imgSrc = photo.querySelector('.photo-image')?.getAttribute('src') || '';
        const caption = photo.querySelector('.photo-caption')?.textContent || '';
        
        addPhotoToPanel(imgSrc, caption, index);
    });
    
    // Add photo button handler
    addPhotoBtn.addEventListener('click', function() {
        // This would typically use the WordPress media uploader
        // For now, we'll simulate adding a placeholder photo
        const newIndex = photosList.children.length;
        const placeholderSrc = '/assets/images/placeholder-image.jpg';
        const photoItem = addPhotoToPanel(placeholderSrc, 'New Photo Caption', newIndex);
        
        // Focus the caption input
        const input = photoItem.querySelector('input[type="text"]');
        if (input) {
            input.focus();
            input.select();
        }
        
        // Update component
        updatePhotosInComponent(element);
    });
    
    // Handle layout changes
    const layoutSelect = document.querySelector('[data-property="galleryLayout"]');
    if (layoutSelect) {
        layoutSelect.addEventListener('change', function() {
            const galleryContainer = element.querySelector('.photo-gallery-container');
            if (galleryContainer) {
                galleryContainer.setAttribute('data-layout', this.value);
                
                // Remove old layout classes
                galleryContainer.classList.remove('layout-grid', 'layout-masonry', 'layout-carousel', 'layout-fullwidth');
                
                // Add new layout class
                galleryContainer.classList.add(`layout-${this.value}`);
            }
        });
    }
    
    // Handle columns changes
    const columnsSelect = document.querySelector('[data-property="columns"]');
    if (columnsSelect) {
        columnsSelect.addEventListener('change', function() {
            const galleryGrid = element.querySelector('.photo-gallery-grid');
            if (galleryGrid) {
                galleryGrid.style.gridTemplateColumns = `repeat(${this.value}, 1fr)`;
            }
        });
    }
}

/**
 * Add a photo to the design panel
 * @param {string} src - Photo source URL
 * @param {string} caption - Photo caption
 * @param {number} index - Photo index
 * @returns {HTMLElement} - The photo item element
 */
function addPhotoToPanel(src, caption, index) {
    const photosList = document.getElementById('design-photos-list');
    const photoItem = document.createElement('div');
    photoItem.className = 'photo-editor-item';
    photoItem.innerHTML = `
        <div class="photo-preview">
            <img src="${src}" alt="Photo ${index + 1}" class="photo-thumbnail">
        </div>
        <div class="photo-editor-controls">
            <div class="form-group">
                <label class="form-label">Caption</label>
                <input type="text" class="form-input" value="${escapeHtml(caption)}" data-photo-caption="${index}">
            </div>
            <div class="form-group">
                <button class="change-photo-btn" data-photo-index="${index}">Change Photo</button>
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
    const captionInput = photoItem.querySelector(`[data-photo-caption="${index}"]`);
    if (captionInput) {
        captionInput.addEventListener('input', function() {
            const element = document.querySelector('.editable-element--selected');
            if (element) {
                updatePhotosInComponent(element);
            }
        });
    }
    
    // Change photo button handler
    const changePhotoBtn = photoItem.querySelector('.change-photo-btn');
    if (changePhotoBtn) {
        changePhotoBtn.addEventListener('click', function() {
            // This would typically use the WordPress media uploader
            alert('Photo change functionality would open media browser here');
            
            // Update component after selection
            const element = document.querySelector('.editable-element--selected');
            if (element) {
                updatePhotosInComponent(element);
            }
        });
    }
    
    // Remove button handler
    const removeBtn = photoItem.querySelector('.remove-item-btn');
    removeBtn.addEventListener('click', function() {
        photoItem.remove();
        const element = document.querySelector('.editable-element--selected');
        if (element) {
            updatePhotosInComponent(element);
        }
    });
    
    photosList.appendChild(photoItem);
    
    // Initialize drag-and-drop for photo sorting
    initializePhotoSorting();
    
    return photoItem;
}

/**
 * Initialize drag-and-drop sorting for photos
 */
function initializePhotoSorting() {
    // This would be implemented using a library like SortableJS
    // For now, we'll just log that sorting would be initialized
    console.log('Photo sorting would be initialized here');
}

/**
 * Update photos in the component based on panel inputs
 * @param {HTMLElement} element - The component element
 */
function updatePhotosInComponent(element) {
    const galleryGrid = element.querySelector('.photo-gallery-grid');
    if (!galleryGrid) return;
    
    const photoItems = document.querySelectorAll('.photo-editor-item');
    
    // Clear existing photos
    galleryGrid.innerHTML = '';
    
    // Add photos from panel
    photoItems.forEach((item, index) => {
        const imgSrc = item.querySelector('.photo-thumbnail')?.getAttribute('src') || '';
        const captionInput = item.querySelector(`[data-photo-caption="${index}"]`);
        
        if (imgSrc) {
            const photoDiv = document.createElement('div');
            photoDiv.className = 'photo-item';
            photoDiv.setAttribute('data-index', index);
            
            photoDiv.innerHTML = `
                <div class="photo-wrapper">
                    <img src="${imgSrc}" alt="${captionInput ? captionInput.value : `Photo ${index + 1}`}" class="photo-image">
                    ${captionInput && captionInput.value ? `<div class="photo-caption">${escapeHtml(captionInput.value)}</div>` : ''}
                </div>
            `;
            
            galleryGrid.appendChild(photoDiv);
        }
    });
    
    // Trigger save
    const event = new Event('change', { bubbles: true });
    element.dispatchEvent(event);
}

/**
 * Escape HTML for safe insertion
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
