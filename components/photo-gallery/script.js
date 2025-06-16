/**
 * Photo Gallery Component JavaScript
 */
class PhotoGalleryComponent {
    constructor(element) {
        this.element = element;
        this.photos = [];
        this.currentIndex = 0;
        this.init();
    }

    init() {
        // Initialize component
        console.log('Photo Gallery component initialized');
        this.setupEventListeners();
    }

    setupEventListeners() {
        const addButton = this.element.querySelector('.add-photo-btn');
        if (addButton) {
            addButton.addEventListener('click', this.handleAddPhoto.bind(this));
        }
        
        // Setup photo item events
        const photoItems = this.element.querySelectorAll('.photo-item');
        photoItems.forEach(item => {
            this.setupPhotoItemEvents(item);
        });
        
        // Setup lightbox events
        this.setupLightboxEvents();
    }
    
    setupPhotoItemEvents(item) {
        // Open lightbox on click
        item.addEventListener('click', () => {
            this.openLightbox(parseInt(item.dataset.index));
        });
        
        // Add edit and delete buttons dynamically
        if (!item.querySelector('.photo-actions')) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'photo-actions';
            actionsDiv.innerHTML = `
                <button class="edit-photo-btn">Edit</button>
                <button class="delete-photo-btn">Delete</button>
            `;
            item.appendChild(actionsDiv);
            
            // Add event listeners
            item.querySelector('.edit-photo-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleEditPhoto(item);
            });
            
            item.querySelector('.delete-photo-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleDeletePhoto(item);
            });
        }
    }
    
    setupLightboxEvents() {
        const lightbox = this.element.querySelector('.photo-lightbox');
        if (!lightbox) return;
        
        const closeBtn = lightbox.querySelector('.lightbox-close');
        const prevBtn = lightbox.querySelector('.lightbox-prev');
        const nextBtn = lightbox.querySelector('.lightbox-next');
        
        closeBtn.addEventListener('click', this.closeLightbox.bind(this));
        prevBtn.addEventListener('click', this.showPrevPhoto.bind(this));
        nextBtn.addEventListener('click', this.showNextPhoto.bind(this));
        
        // Close on background click
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                this.closeLightbox();
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;
            
            if (e.key === 'Escape') {
                this.closeLightbox();
            } else if (e.key === 'ArrowLeft') {
                this.showPrevPhoto();
            } else if (e.key === 'ArrowRight') {
                this.showNextPhoto();
            }
        });
    }
    
    openLightbox(index) {
        const lightbox = this.element.querySelector('.photo-lightbox');
        const photoItems = this.element.querySelectorAll('.photo-item');
        
        if (!lightbox || photoItems.length === 0) return;
        
        this.currentIndex = index;
        this.updateLightboxContent();
        
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
    
    closeLightbox() {
        const lightbox = this.element.querySelector('.photo-lightbox');
        lightbox.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }
    
    showPrevPhoto() {
        const photoItems = this.element.querySelectorAll('.photo-item');
        
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = photoItems.length - 1;
        }
        
        this.updateLightboxContent();
    }
    
    showNextPhoto() {
        const photoItems = this.element.querySelectorAll('.photo-item');
        
        this.currentIndex++;
        if (this.currentIndex >= photoItems.length) {
            this.currentIndex = 0;
        }
        
        this.updateLightboxContent();
    }
    
    updateLightboxContent() {
        const lightbox = this.element.querySelector('.photo-lightbox');
        const photoItems = this.element.querySelectorAll('.photo-item');
        
        if (!lightbox || photoItems.length === 0) return;
        
        const currentPhoto = photoItems[this.currentIndex];
        const img = currentPhoto.querySelector('img');
        const caption = currentPhoto.querySelector('.photo-caption');
        
        const lightboxImg = lightbox.querySelector('.lightbox-image');
        const lightboxCaption = lightbox.querySelector('.lightbox-caption');
        
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        
        if (caption) {
            lightboxCaption.textContent = caption.textContent;
            lightboxCaption.style.display = 'block';
        } else {
            lightboxCaption.textContent = '';
            lightboxCaption.style.display = 'none';
        }
    }

    handleAddPhoto() {
        console.log('Add photo triggered');
        // Implementation for adding a new photo
        // This would typically open a modal with image upload and caption input
    }
    
    handleEditPhoto(item) {
        console.log('Edit photo triggered');
        // Implementation for editing an existing photo
        // Prevent opening the lightbox
        event.stopPropagation();
    }
    
    handleDeletePhoto(item) {
        console.log('Delete photo triggered');
        // Implementation for deleting a photo
        // Prevent opening the lightbox
        event.stopPropagation();
        
        if (confirm('Are you sure you want to delete this photo?')) {
            item.remove();
        }
    }
}

// Initialize components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const photoGalleryElements = document.querySelectorAll('.photo-gallery-component');
    photoGalleryElements.forEach(element => {
        new PhotoGalleryComponent(element);
    });
});