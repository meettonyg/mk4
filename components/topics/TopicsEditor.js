/**
 * Topics Component Editor
 * PHASE 2: Custom editor for Topics component
 * 
 * Handles the specific needs of Topics list editing
 * Follows checklist: Component-specific logic isolated from core
 * 
 * @version 2.0.0-phase2
 */

class TopicsEditor extends BaseComponentEditor {
    render() {
        // Topics are already in the data passed to the constructor
        // The component system has already loaded them from Pods
        const topics = this.data.topics || [];
        
        // Create the editor HTML
        let html = `
            <div class="topics-content-editor">
                <div class="editor-header">
                    <h4>Speaking Topics</h4>
                    <p>Manage your speaking topics list</p>
                </div>
                <div class="topics-list" id="topics-editor-list">
        `;
        
        // Add existing topics
        if (topics.length > 0) {
            topics.forEach((topic, index) => {
                const topicText = typeof topic === 'string' ? topic : (topic.title || topic.text || '');
                html += this.createTopicRow(topicText, index);
            });
        } else {
            html += '<p class="no-topics-msg">No topics yet. Click "Add Topic" to start.</p>';
        }
        
        html += `
                </div>
                <button type="button" class="btn btn--primary" id="add-topic-btn">
                    + Add Topic
                </button>
            </div>
        `;
        
        this.container.innerHTML = html;
        this.attachEventListeners();
    }
    
    createTopicRow(text, index) {
        return `
            <div class="topic-row" data-index="${index}">
                <input type="text" 
                       class="topic-input" 
                       value="${text.replace(/"/g, '&quot;')}"
                       data-index="${index}"
                       placeholder="Enter topic ${index + 1}">
                <button type="button" class="btn-remove" data-index="${index}">×</button>
            </div>
        `;
    }
    
    attachEventListeners() {
        const listEl = this.container.querySelector('#topics-editor-list');
        const addBtn = this.container.querySelector('#add-topic-btn');
        
        // Add topic button
        if (addBtn) {
            addBtn.addEventListener('click', () => this.addTopic());
        }
        
        // Topic input changes
        listEl.addEventListener('input', (e) => {
            if (e.target.classList.contains('topic-input')) {
                this.updateTopics();
            }
        });
        
        // Remove topic buttons
        listEl.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-remove')) {
                this.removeTopic(parseInt(e.target.dataset.index));
            }
        });
    }
    
    addTopic() {
        const listEl = this.container.querySelector('#topics-editor-list');
        
        // Remove "no topics" message if present
        const noTopicsMsg = listEl.querySelector('.no-topics-msg');
        if (noTopicsMsg) {
            noTopicsMsg.remove();
        }
        
        // Add new topic row
        const newIndex = listEl.querySelectorAll('.topic-row').length;
        const newRow = document.createElement('div');
        newRow.innerHTML = this.createTopicRow('', newIndex);
        listEl.appendChild(newRow.firstElementChild);
        
        // Focus the new input
        const newInput = listEl.querySelector(`[data-index="${newIndex}"]`);
        if (newInput) {
            newInput.focus();
        }
        
        this.updateTopics();
    }
    
    removeTopic(index) {
        const listEl = this.container.querySelector('#topics-editor-list');
        const rowToRemove = listEl.querySelector(`.topic-row[data-index="${index}"]`);
        
        if (rowToRemove) {
            rowToRemove.remove();
            
            // Re-index remaining topics
            const remainingRows = listEl.querySelectorAll('.topic-row');
            remainingRows.forEach((row, newIndex) => {
                row.dataset.index = newIndex;
                const input = row.querySelector('.topic-input');
                if (input) {
                    input.dataset.index = newIndex;
                    input.placeholder = `Enter topic ${newIndex + 1}`;
                }
                const removeBtn = row.querySelector('.btn-remove');
                if (removeBtn) {
                    removeBtn.dataset.index = newIndex;
                }
            });
            
            // Show "no topics" message if all removed
            if (remainingRows.length === 0) {
                listEl.innerHTML = '<p class="no-topics-msg">No topics yet. Click "Add Topic" to start.</p>';
            }
            
            this.updateTopics();
        }
    }
    
    updateTopics() {
        const inputs = this.container.querySelectorAll('.topic-input');
        const topics = Array.from(inputs)
            .map(input => input.value.trim())
            .filter(text => text.length > 0);
        
        // Update the data through the base class method
        // This will trigger the onUpdate callback which handles persistence
        this.updateData({ topics });
    }
}

// Register this editor with the registry
if (window.componentEditorRegistry) {
    window.componentEditorRegistry.register('topics', TopicsEditor);
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TopicsEditor;
}
