/**
 * Contact Component JavaScript
 */
class ContactComponent {
    constructor(element) {
        this.element = element;
        this.contactType = null;
        this.init();
    }

    init() {
        // Initialize component
        console.log('Contact component initialized');
        this.setupEventListeners();
    }

    setupEventListeners() {
        const typeBtns = this.element.querySelectorAll('.contact-type-btn');
        typeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleContactTypeSelection(e.target.dataset.type);
            });
        });
        
        // Set up form validation if contact form exists
        const contactForm = this.element.querySelector('.contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', this.handleFormSubmit.bind(this));
        }
        
        // Add edit button if contact info or form is set up
        const contactInfo = this.element.querySelector('.contact-info');
        const contactFormEl = this.element.querySelector('.contact-form');
        
        if ((contactInfo || contactFormEl) && !this.element.querySelector('.contact-edit-btn')) {
            const editBtn = document.createElement('button');
            editBtn.className = 'contact-edit-btn';
            editBtn.textContent = 'Edit';
            editBtn.addEventListener('click', this.handleEdit.bind(this));
            this.element.appendChild(editBtn);
        }
    }

    handleContactTypeSelection(type) {
        console.log(`Contact type selected: ${type}`);
        this.contactType = type;
        
        // Implementation for setting up contact form or contact info based on selection
        // This would typically store the selection and open the appropriate editor
    }
    
    handleFormSubmit(e) {
        e.preventDefault();
        console.log('Form submitted');
        
        // Form validation and submission logic
        // In a real implementation, this would handle form validation and AJAX submission
        
        // Show a success message
        alert('Thank you for your message! We will get back to you soon.');
        e.target.reset();
    }
    
    handleEdit() {
        console.log('Edit contact information triggered');
        // Implementation for editing contact information or form settings
    }
}

// Initialize components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const contactElements = document.querySelectorAll('.contact-component');
    contactElements.forEach(element => {
        new ContactComponent(element);
    });
});