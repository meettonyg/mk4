/**
 * Guest Intro Component JavaScript
 * Handles interactive features for the guest introduction component
 */

(function() {
    'use strict';
    
    // Initialize when the component is loaded
    function initGuestIntro() {
        const guestIntros = document.querySelectorAll('.guest-intro-component');
        
        guestIntros.forEach(intro => {
            // Add click handlers for editing topics
            const topicsList = intro.querySelector('.topics-list');
            if (topicsList) {
                setupTopicsEditing(topicsList);
            }
            
            // Make editable fields more user-friendly
            setupInlineEditing(intro);
        });
    }
    
    /**
     * Setup inline editing for component fields
     */
    function setupInlineEditing(component) {
        // Make key fields editable
        const editableFields = [
            '.guest-name',
            '.guest-title', 
            '.guest-tagline',
            '.intro-description p',
            '.topics-list li'
        ];
        
        editableFields.forEach(selector => {
            const elements = component.querySelectorAll(selector);
            elements.forEach(el => {
                if (!el.hasAttribute('contenteditable')) {
                    el.setAttribute('contenteditable', 'true');
                    el.setAttribute('data-placeholder', el.textContent);
                    
                    // Handle empty state
                    el.addEventListener('blur', function() {
                        if (this.textContent.trim() === '') {
                            this.textContent = this.getAttribute('data-placeholder');
                        }
                    });
                    
                    // Select all text on focus for easier editing
                    el.addEventListener('focus', function() {
                        if (this.textContent === this.getAttribute('data-placeholder')) {
                            // Select all text
                            const range = document.createRange();
                            range.selectNodeContents(this);
                            const selection = window.getSelection();
                            selection.removeAllRanges();
                            selection.addRange(range);
                        }
                    });
                }
            });
        });
    }
    
    /**
     * Setup topics list editing
     */
    function setupTopicsEditing(topicsList) {
        // Add button to add new topics
        const addButton = document.createElement('button');
        addButton.className = 'add-topic-btn';
        addButton.textContent = '+ Add Topic';
        addButton.style.cssText = 'margin-top: 10px; padding: 5px 15px; background: #0ea5e9; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;';
        
        addButton.addEventListener('click', function() {
            const newTopic = document.createElement('li');
            newTopic.setAttribute('contenteditable', 'true');
            newTopic.textContent = 'New discussion topic';
            topicsList.appendChild(newTopic);
            
            // Focus the new item
            newTopic.focus();
            
            // Select all text
            const range = document.createRange();
            range.selectNodeContents(newTopic);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        });
        
        // Insert button after the list
        if (!topicsList.nextElementSibling || !topicsList.nextElementSibling.classList.contains('add-topic-btn')) {
            topicsList.parentNode.insertBefore(addButton, topicsList.nextSibling);
        }
        
        // Allow topics to be deleted with Delete key when empty
        topicsList.addEventListener('keydown', function(e) {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                const target = e.target;
                if (target.tagName === 'LI' && target.textContent.trim() === '') {
                    e.preventDefault();
                    const nextItem = target.nextElementSibling || target.previousElementSibling;
                    target.remove();
                    if (nextItem && nextItem.tagName === 'LI') {
                        nextItem.focus();
                    }
                }
            }
        });
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGuestIntro);
    } else {
        initGuestIntro();
    }
    
    // Re-initialize when new components are added dynamically
    document.addEventListener('componentAdded', function(e) {
        if (e.detail && e.detail.type === 'guest-intro') {
            setTimeout(initGuestIntro, 100);
        }
    });
    
})();
