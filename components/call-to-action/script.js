/**
 * Call to Action Component JavaScript
 */
class CallToActionComponent {
    constructor(element) {
        this.element = element;
        this.init();
    }

    init() {
        // Initialize component
        console.log('Call to Action component initialized');
        this.setupEventListeners();
    }

    setupEventListeners() {
        const editButton = this.element.querySelector('.cta-edit-btn');
        if (editButton) {
            editButton.addEventListener('click', this.handleEdit.bind(this));
        }
        
        // Add edit button for existing CTA
        const ctaContent = this.element.querySelector('.cta-content');
        if (ctaContent && !ctaContent.querySelector('.cta-edit-btn')) {
            const editBtn = document.createElement('button');
            editBtn.className = 'cta-edit-btn cta-content-edit';
            editBtn.textContent = 'Edit';
            editBtn.addEventListener('click', this.handleEdit.bind(this));
            ctaContent.appendChild(editBtn);
        }
    }

    handleEdit() {
        console.log('Edit CTA triggered');
        // Implementation for editing the CTA
        // This would typically open a modal with title, description, button text, and URL inputs
    }
}

// Initialize components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const ctaElements = document.querySelectorAll('.cta-component');
    ctaElements.forEach(element => {
        new CallToActionComponent(element);
    });
});