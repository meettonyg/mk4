/**
 * Topics Component JavaScript
 */
class TopicsComponent {
    constructor(element) {
        this.element = element;
        this.topics = [];
        this.init();
    }

    init() {
        // Initialize component
        console.log('Topics component initialized');
        this.setupEventListeners();
    }

    setupEventListeners() {
        const addButton = this.element.querySelector('.add-topic-btn');
        if (addButton) {
            addButton.addEventListener('click', this.handleAddTopic.bind(this));
        }
        
        // Setup edit and delete buttons for existing topics
        const topicItems = this.element.querySelectorAll('.topic-item');
        topicItems.forEach(item => {
            this.setupTopicItemEvents(item);
        });
    }
    
    setupTopicItemEvents(item) {
        // Add edit and delete buttons dynamically
        if (!item.querySelector('.topic-actions')) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'topic-actions';
            actionsDiv.innerHTML = `
                <button class="edit-topic-btn">Edit</button>
                <button class="delete-topic-btn">Delete</button>
            `;
            item.appendChild(actionsDiv);
            
            // Add event listeners
            item.querySelector('.edit-topic-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleEditTopic(item);
            });
            
            item.querySelector('.delete-topic-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleDeleteTopic(item);
            });
        }
    }

    handleAddTopic() {
        console.log('Add topic triggered');
        // Implementation for adding a new topic
        // This would typically open a modal or form
    }
    
    handleEditTopic(item) {
        console.log('Edit topic triggered');
        // Implementation for editing an existing topic
    }
    
    handleDeleteTopic(item) {
        console.log('Delete topic triggered');
        // Implementation for deleting a topic
        if (confirm('Are you sure you want to delete this topic?')) {
            item.remove();
        }
    }
}

// Initialize components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const topicsElements = document.querySelectorAll('.topics-component');
    topicsElements.forEach(element => {
        new TopicsComponent(element);
    });
});