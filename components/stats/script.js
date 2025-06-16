/**
 * Stats Component JavaScript
 */
class StatsComponent {
    constructor(element) {
        this.element = element;
        this.stats = [];
        this.init();
    }

    init() {
        // Initialize component
        console.log('Stats component initialized');
        this.setupEventListeners();
    }

    setupEventListeners() {
        const addButton = this.element.querySelector('.add-stat-btn');
        if (addButton) {
            addButton.addEventListener('click', this.handleAddStat.bind(this));
        }
        
        // Setup edit and delete buttons for existing stats
        const statItems = this.element.querySelectorAll('.stat-item');
        statItems.forEach(item => {
            this.setupStatItemEvents(item);
        });
    }
    
    setupStatItemEvents(item) {
        // Add edit and delete buttons dynamically
        if (!item.querySelector('.stat-actions')) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'stat-actions';
            actionsDiv.innerHTML = `
                <button class="edit-stat-btn">Edit</button>
                <button class="delete-stat-btn">Delete</button>
            `;
            item.appendChild(actionsDiv);
            
            // Add event listeners
            item.querySelector('.edit-stat-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleEditStat(item);
            });
            
            item.querySelector('.delete-stat-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleDeleteStat(item);
            });
        }
    }

    handleAddStat() {
        console.log('Add statistic triggered');
        // Implementation for adding a new statistic
        // This would typically open a modal with value, label, and description inputs
    }
    
    handleEditStat(item) {
        console.log('Edit statistic triggered');
        // Implementation for editing an existing statistic
    }
    
    handleDeleteStat(item) {
        console.log('Delete statistic triggered');
        // Implementation for deleting a statistic
        if (confirm('Are you sure you want to delete this statistic?')) {
            item.remove();
        }
    }
}

// Initialize components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const statsElements = document.querySelectorAll('.stats-component');
    statsElements.forEach(element => {
        new StatsComponent(element);
    });
});