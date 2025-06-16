/**
 * Testimonials Component JavaScript
 */
class TestimonialsComponent {
    constructor(element) {
        this.element = element;
        this.testimonials = [];
        this.init();
    }

    init() {
        // Initialize component
        console.log('Testimonials component initialized');
        this.setupEventListeners();
    }

    setupEventListeners() {
        const addButton = this.element.querySelector('.add-testimonial-btn');
        if (addButton) {
            addButton.addEventListener('click', this.handleAddTestimonial.bind(this));
        }
        
        // Setup edit and delete buttons for existing testimonials
        const testimonialItems = this.element.querySelectorAll('.testimonial-item');
        testimonialItems.forEach(item => {
            this.setupTestimonialItemEvents(item);
        });
    }
    
    setupTestimonialItemEvents(item) {
        // Add edit and delete buttons dynamically
        if (!item.querySelector('.testimonial-actions')) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'testimonial-actions';
            actionsDiv.innerHTML = `
                <button class="edit-testimonial-btn">Edit</button>
                <button class="delete-testimonial-btn">Delete</button>
            `;
            item.appendChild(actionsDiv);
            
            // Add event listeners
            item.querySelector('.edit-testimonial-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleEditTestimonial(item);
            });
            
            item.querySelector('.delete-testimonial-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleDeleteTestimonial(item);
            });
        }
    }

    handleAddTestimonial() {
        console.log('Add testimonial triggered');
        // Implementation for adding a new testimonial
        // This would typically open a modal with text, author name, title, and image inputs
    }
    
    handleEditTestimonial(item) {
        console.log('Edit testimonial triggered');
        // Implementation for editing an existing testimonial
    }
    
    handleDeleteTestimonial(item) {
        console.log('Delete testimonial triggered');
        // Implementation for deleting a testimonial
        if (confirm('Are you sure you want to delete this testimonial?')) {
            item.remove();
        }
    }
}

// Initialize components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const testimonialsElements = document.querySelectorAll('.testimonials-component');
    testimonialsElements.forEach(element => {
        new TestimonialsComponent(element);
    });
});