/**
 * Social Component JavaScript
 */
class SocialComponent {
    constructor(element) {
        this.element = element;
        this.socialLinks = [];
        this.platforms = [
            'facebook', 'twitter', 'linkedin', 'instagram', 
            'youtube', 'tiktok', 'pinterest', 'snapchat', 
            'github', 'medium', 'substack', 'threads'
        ];
        this.init();
    }

    init() {
        // Initialize component
        console.log('Social component initialized');
        this.setupEventListeners();
    }

    setupEventListeners() {
        const addButton = this.element.querySelector('.add-social-btn');
        if (addButton) {
            addButton.addEventListener('click', this.handleAddSocial.bind(this));
        }
        
        // Setup delete buttons for existing social links
        const socialLinks = this.element.querySelectorAll('.social-link');
        socialLinks.forEach(link => {
            this.setupSocialLinkEvents(link);
        });
    }
    
    setupSocialLinkEvents(link) {
        // Add delete button dynamically
        if (!link.querySelector('.delete-social-btn')) {
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-social-btn';
            deleteBtn.innerHTML = '×';
            deleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleDeleteSocial(link);
            });
            link.appendChild(deleteBtn);
        }
    }

    handleAddSocial() {
        console.log('Add social link triggered');
        // Implementation for adding a new social link
        // This would typically open a modal with platform selection and URL input
    }
    
    handleDeleteSocial(link) {
        console.log('Delete social link triggered');
        // Implementation for deleting a social link
        if (confirm('Are you sure you want to remove this social link?')) {
            link.remove();
        }
    }
}

// Initialize components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const socialElements = document.querySelectorAll('.social-component');
    socialElements.forEach(element => {
        new SocialComponent(element);
    });
});