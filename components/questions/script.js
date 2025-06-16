/**
 * Questions Component JavaScript
 */
class QuestionsComponent {
    constructor(element) {
        this.element = element;
        this.questions = [];
        this.activeIndex = null;
        this.init();
    }

    init() {
        // Initialize component
        console.log('Questions component initialized');
        this.setupEventListeners();
    }

    setupEventListeners() {
        const addButton = this.element.querySelector('.add-question-btn');
        if (addButton) {
            addButton.addEventListener('click', this.handleAddQuestion.bind(this));
        }
        
        // Setup accordion functionality and edit/delete buttons
        const questionItems = this.element.querySelectorAll('.question-item');
        questionItems.forEach(item => {
            this.setupQuestionItemEvents(item);
        });
    }
    
    setupQuestionItemEvents(item) {
        // Add accordion functionality
        const header = item.querySelector('.question-header');
        if (header) {
            header.addEventListener('click', () => {
                this.toggleQuestion(item);
            });
        }
        
        // Add edit and delete buttons dynamically
        if (!item.querySelector('.question-actions')) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'question-actions';
            actionsDiv.innerHTML = `
                <button class="edit-question-btn">Edit</button>
                <button class="delete-question-btn">Delete</button>
            `;
            item.appendChild(actionsDiv);
            
            // Add event listeners
            item.querySelector('.edit-question-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleEditQuestion(item);
            });
            
            item.querySelector('.delete-question-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleDeleteQuestion(item);
            });
        }
    }
    
    toggleQuestion(item) {
        // Toggle the active state of the question
        const isActive = item.classList.contains('active');
        
        // Close all questions first
        const allQuestions = this.element.querySelectorAll('.question-item');
        allQuestions.forEach(q => {
            q.classList.remove('active');
        });
        
        // If the clicked question wasn't active, open it
        if (!isActive) {
            item.classList.add('active');
            this.activeIndex = parseInt(item.dataset.index);
        } else {
            this.activeIndex = null;
        }
    }

    handleAddQuestion() {
        console.log('Add question triggered');
        // Implementation for adding a new question
        // This would typically open a modal with question and answer inputs
    }
    
    handleEditQuestion(item) {
        console.log('Edit question triggered');
        // Implementation for editing an existing question
        // Prevent the accordion from toggling
        event.stopPropagation();
    }
    
    handleDeleteQuestion(item) {
        console.log('Delete question triggered');
        // Implementation for deleting a question
        // Prevent the accordion from toggling
        event.stopPropagation();
        
        if (confirm('Are you sure you want to delete this question?')) {
            item.remove();
        }
    }
}

// Initialize components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const questionsElements = document.querySelectorAll('.questions-component');
    questionsElements.forEach(element => {
        new QuestionsComponent(element);
    });
});