/**
 * Biography Component JavaScript
 */
class BiographyComponent {
    constructor(element) {
        this.element = element;
        this.init();
    }

    init() {
        // Initialize component
        console.log('Biography component initialized');
        this.setupEventListeners();
    }

    setupEventListeners() {
        const placeholder = this.element.querySelector('.biography-placeholder');
        if (placeholder) {
            placeholder.addEventListener('click', this.handleEdit.bind(this));
        }
        
        // Add edit button for existing content
        const content = this.element.querySelector('.biography-content');
        if (content) {
            content.addEventListener('dblclick', this.handleEdit.bind(this));
        }
    }

    handleEdit() {
        // Content editing functionality
        console.log('Biography edit triggered');
        // Implementation will depend on your content editing system
    }
}

// Initialize components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const biographyElements = document.querySelectorAll('.biography-component');
    biographyElements.forEach(element => {
        new BiographyComponent(element);
    });
});