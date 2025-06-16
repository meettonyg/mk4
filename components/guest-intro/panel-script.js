/**
 * Guest Intro Component Panel Script
 * Handles the dynamic functionality of the guest intro design panel
 */

// Register this component's panel handler
window.componentPanelHandlers = window.componentPanelHandlers || {};
window.componentPanelHandlers['guest-intro'] = function(element) {
    initializeGuestIntroPanel(element);
};

/**
 * Initialize guest intro panel
 * @param {HTMLElement} element - The guest intro component element
 */
function initializeGuestIntroPanel(element) {
    const topicsList = document.getElementById('design-topics-list');
    const addTopicBtn = document.getElementById('add-topic-btn');
    
    if (!topicsList || !addTopicBtn) return;
    
    // Load existing topics
    const existingTopics = element.querySelectorAll('.topics-list li');
    topicsList.innerHTML = '';
    
    existingTopics.forEach((topic, index) => {
        addTopicToPanel(topic.textContent, index);
    });
    
    // Add topic button handler
    addTopicBtn.addEventListener('click', function() {
        const newIndex = topicsList.children.length;
        const topicItem = addTopicToPanel('New discussion topic', newIndex);
        
        // Focus the input
        const input = topicItem.querySelector('input');
        if (input) {
            input.focus();
            input.select();
        }
        
        // Add to the actual component
        updateTopicsInComponent(element);
    });
}

/**
 * Add a topic to the design panel
 * @param {string} text - Topic text
 * @param {number} index - Topic index
 * @returns {HTMLElement} - The topic item element
 */
function addTopicToPanel(text, index) {
    const topicsList = document.getElementById('design-topics-list');
    const topicItem = document.createElement('div');
    topicItem.className = 'topic-item';
    topicItem.innerHTML = `
        <input type="text" class="form-input" value="${escapeHtml(text)}" data-topic-index="${index}">
        <button class="remove-item-btn" title="Remove topic">×</button>
    `;
    
    // Input handler
    const input = topicItem.querySelector('input');
    input.addEventListener('input', function() {
        const element = document.querySelector('.editable-element--selected');
        if (element) {
            updateTopicsInComponent(element);
        }
    });
    
    // Remove button handler
    const removeBtn = topicItem.querySelector('.remove-item-btn');
    removeBtn.addEventListener('click', function() {
        topicItem.remove();
        const element = document.querySelector('.editable-element--selected');
        if (element) {
            updateTopicsInComponent(element);
        }
    });
    
    topicsList.appendChild(topicItem);
    return topicItem;
}

/**
 * Update topics in the component based on panel inputs
 * @param {HTMLElement} element - The component element
 */
function updateTopicsInComponent(element) {
    const topicsList = element.querySelector('.topics-list');
    if (!topicsList) return;
    
    const panelTopics = document.querySelectorAll('#design-topics-list input');
    
    // Clear existing topics
    topicsList.innerHTML = '';
    
    // Add topics from panel
    panelTopics.forEach(input => {
        if (input.value.trim()) {
            const li = document.createElement('li');
            li.textContent = input.value;
            li.setAttribute('contenteditable', 'true');
            topicsList.appendChild(li);
        }
    });
    
    // Trigger save
    const event = new Event('change', { bubbles: true });
    element.dispatchEvent(event);
}

/**
 * Escape HTML for safe insertion
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
