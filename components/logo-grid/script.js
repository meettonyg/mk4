/**
 * Logo Grid Component JavaScript
 */
class LogoGridComponent {
    constructor(element) {
        this.element = element;
        this.logos = [];
        this.init();
    }

    init() {
        // Initialize component
        console.log('Logo Grid component initialized');
        this.setupEventListeners();
    }

    setupEventListeners() {
        const addButton = this.element.querySelector('.add-logo-btn');
        if (addButton) {
            addButton.addEventListener('click', this.handleAddLogo.bind(this));
        }
        
        // Setup edit and delete buttons for existing logos
        const logoItems = this.element.querySelectorAll('.logo-item');
        logoItems.forEach(item => {
            this.setupLogoItemEvents(item);
        });
    }
    
    setupLogoItemEvents(item) {
        // Add edit and delete buttons dynamically
        if (!item.querySelector('.logo-actions')) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'logo-actions';
            actionsDiv.innerHTML = `
                <button class="edit-logo-btn">Edit</button>
                <button class="delete-logo-btn">Delete</button>
            `;
            item.appendChild(actionsDiv);
            
            // Add event listeners
            item.querySelector('.edit-logo-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleEditLogo(item);
            });
            
            item.querySelector('.delete-logo-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleDeleteLogo(item);
            });
        }
    }

    handleAddLogo() {
        console.log('Add logo triggered');
        // Implementation for adding a new logo
        // This would typically open a modal with image upload, name, and URL inputs
    }
    
    handleEditLogo(item) {
        console.log('Edit logo triggered');
        // Implementation for editing an existing logo
    }
    
    handleDeleteLogo(item) {
        console.log('Delete logo triggered');
        // Implementation for deleting a logo
        if (confirm('Are you sure you want to delete this logo?')) {
            item.remove();
        }
    }
}

// Initialize components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const logoGridElements = document.querySelectorAll('.logo-grid-component');
    logoGridElements.forEach(element => {
        new LogoGridComponent(element);
    });
});