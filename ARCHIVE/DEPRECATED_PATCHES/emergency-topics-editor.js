/**
 * Emergency Topics Editor Loader
 * Loads a working version of the Topics editor immediately
 */

(function() {
    'use strict';
    
    console.log('🚨 Emergency Topics Editor Loader starting...');
    
    // Define the working Topics editor class directly
    class TopicsEditor {
        constructor(containerEl, componentId, initialData, onUpdate) {
            this.container = containerEl;
            this.componentId = componentId;
            this.componentType = 'topics';
            this.data = initialData || {};
            this.onUpdate = onUpdate;
            this.listeners = [];
            this._skipDOMUpdate = false;
            this._syncInProgress = false;
            
            console.log('Topics editor constructed for', componentId);
        }
        
        async render() {
            const topics = this.data.topics || [];
            console.log(`Rendering ${topics.length} topics`);
            
            let html = `
                <div class="topics-content-editor">
                    <div class="editor-header">
                        <h4>Speaking Topics</h4>
                        <p>Manage your speaking topics list</p>
                    </div>
                    <div class="topics-list" id="topics-editor-list">
            `;
            
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
            return Promise.resolve();
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
        
        addEventListener(element, event, handler) {
            if (!element) return;
            element.addEventListener(event, handler);
            this.listeners.push({ element, event, handler });
        }
        
        attachEventListeners() {
            const listEl = this.container.querySelector('#topics-editor-list');
            const addBtn = this.container.querySelector('#add-topic-btn');
            
            this.addEventListener(this.container, 'click', (e) => {
                e.stopPropagation();
            });
            
            if (addBtn) {
                this.addEventListener(addBtn, 'click', (e) => {
                    e.stopPropagation();
                    this.addTopic();
                });
            }
            
            if (listEl) {
                this.addEventListener(listEl, 'input', (e) => {
                    if (e.target.classList.contains('topic-input')) {
                        e.stopPropagation();
                        this.updateTopics();
                    }
                });
                
                this.addEventListener(listEl, 'click', (e) => {
                    if (e.target.classList.contains('btn-remove')) {
                        e.stopPropagation();
                        e.preventDefault();
                        this.removeTopic(parseInt(e.target.dataset.index));
                    }
                });
            }
        }
        
        addTopic() {
            const listEl = this.container.querySelector('#topics-editor-list');
            const noTopicsMsg = listEl.querySelector('.no-topics-msg');
            if (noTopicsMsg) {
                noTopicsMsg.remove();
            }
            
            const newIndex = listEl.querySelectorAll('.topic-row').length;
            const newRow = document.createElement('div');
            newRow.innerHTML = this.createTopicRow('', newIndex);
            listEl.appendChild(newRow.firstElementChild);
            
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
            
            this.data.topics = topics;
            
            if (this.onUpdate && !this._skipDOMUpdate) {
                this.onUpdate(this.componentId, { topics });
            }
            
            // Emit data change event for sync
            document.dispatchEvent(new CustomEvent('component:data-changed', {
                detail: {
                    componentId: this.componentId,
                    newData: { topics }
                }
            }));
            
            console.log(`Updated ${topics.length} topics for ${this.componentId}`);
        }
        
        async performRender() {
            return this.render();
        }
        
        destroy() {
            this.listeners.forEach(({ element, event, handler }) => {
                element.removeEventListener(event, handler);
            });
            this.listeners = [];
            
            if (this.container) {
                this.container.innerHTML = '';
            }
            
            console.log(`Topics editor ${this.componentId} destroyed`);
        }
    }
    
    // Register globally
    window.TopicsEditor = TopicsEditor;
    
    // Register with editor registry
    if (window.componentEditorRegistry) {
        window.componentEditorRegistry.register('topics', TopicsEditor);
        console.log('✅ Emergency: Topics editor registered with componentEditorRegistry');
    }
    
    // Retry registration after a delay if needed
    setTimeout(() => {
        if (window.componentEditorRegistry && !window.componentEditorRegistry.hasEditor('topics')) {
            window.componentEditorRegistry.register('topics', window.TopicsEditor);
            console.log('✅ Emergency: Topics editor registered after delay');
        }
    }, 1000);
    
    console.log('✅ Emergency Topics Editor Loader complete');
    
})();
