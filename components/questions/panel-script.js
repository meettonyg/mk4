/**
 * Questions Component Panel Script
 * Handles the dynamic functionality of the questions design panel
 */

// Register this component's panel handler
window.componentPanelHandlers = window.componentPanelHandlers || {};
window.componentPanelHandlers['questions'] = function(element, schema) {
    initializeQuestionsPanel(element, schema);
};

/**
 * Initialize questions panel
 * @param {HTMLElement} element - The questions component element
 * @param {Object} schema - Component schema (optional)
 */
function initializeQuestionsPanel(element, schema) {
    // Log schema if available
    if (schema) {
        console.log('Questions component schema:', schema);
    }
    
    // Setup questions list
    setupQuestionsList(element);
    
    // Handle display style change
    const displayStyleSelect = document.querySelector('[data-property="displayStyle"]');
    if (displayStyleSelect) {
        // Get initial value
        const currentStyle = element.getAttribute('data-display-style') || 'accordion';
        displayStyleSelect.value = currentStyle;
        
        // Add change listener
        displayStyleSelect.addEventListener('change', function() {
            // Update data attribute
            element.setAttribute('data-display-style', this.value);
            
            // Update classes
            element.classList.remove('display--accordion', 'display--toggle', 'display--grid', 'display--cards');
            element.classList.add('display--' + this.value);
            
            // Show/hide columns option based on display style
            const columnsGroup = document.querySelector('[data-property="columns"]').closest('.form-group');
            if (columnsGroup) {
                columnsGroup.style.display = (this.value === 'grid' || this.value === 'cards') ? 'block' : 'none';
            }
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
        
        // Trigger change event to ensure proper initial state
        displayStyleSelect.dispatchEvent(new Event('change'));
    }
    
    // Handle columns change
    const columnsSelect = document.querySelector('[data-property="columns"]');
    if (columnsSelect) {
        // Get initial value
        const currentColumns = element.getAttribute('data-columns') || '2';
        columnsSelect.value = currentColumns;
        
        // Add change listener
        columnsSelect.addEventListener('change', function() {
            // Update data attribute
            element.setAttribute('data-columns', this.value);
            
            // Update grid style
            const questionsContainer = element.querySelector('.questions-container');
            if (questionsContainer) {
                questionsContainer.style.gridTemplateColumns = `repeat(${this.value}, 1fr)`;
            }
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
    }
    
    // Handle style change
    const styleSelect = document.querySelector('[data-property="style"]');
    if (styleSelect) {
        // Get initial value
        const currentStyle = element.getAttribute('data-style') || 'default';
        styleSelect.value = currentStyle;
        
        // Add change listener
        styleSelect.addEventListener('change', function() {
            // Update data attribute
            element.setAttribute('data-style', this.value);
            
            // Update classes
            element.classList.remove('style--default', 'style--minimal', 'style--bordered', 'style--separated');
            element.classList.add('style--' + this.value);
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
    }
    
    // Handle question font size change
    const fontSizeSelect = document.querySelector('[data-property="questionFontSize"]');
    if (fontSizeSelect) {
        // Get initial value
        const currentSize = element.getAttribute('data-question-font-size') || 'medium';
        fontSizeSelect.value = currentSize;
        
        // Add change listener
        fontSizeSelect.addEventListener('change', function() {
            // Update data attribute
            element.setAttribute('data-question-font-size', this.value);
            
            // Update classes
            element.classList.remove('question-size--small', 'question-size--medium', 'question-size--large');
            element.classList.add('question-size--' + this.value);
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
    }
    
    // Handle icon style change
    const iconStyleSelect = document.querySelector('[data-property="iconStyle"]');
    if (iconStyleSelect) {
        // Get initial value
        const currentIcon = element.getAttribute('data-icon-style') || 'plus-minus';
        iconStyleSelect.value = currentIcon;
        
        // Add change listener
        iconStyleSelect.addEventListener('change', function() {
            // Update data attribute
            element.setAttribute('data-icon-style', this.value);
            
            // Update classes
            element.classList.remove('icon--plus-minus', 'icon--arrow', 'icon--chevron', 'icon--none');
            element.classList.add('icon--' + this.value);
            
            // Update icons
            updateQuestionIcons(element, this.value);
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
    }
    
    // Handle animation style change
    const animationStyleSelect = document.querySelector('[data-property="animationStyle"]');
    if (animationStyleSelect) {
        // Get initial value
        const currentAnimation = element.getAttribute('data-animation-style') || 'slide';
        animationStyleSelect.value = currentAnimation;
        
        // Add change listener
        animationStyleSelect.addEventListener('change', function() {
            // Update data attribute
            element.setAttribute('data-animation-style', this.value);
            
            // Update classes
            element.classList.remove('animation--slide', 'animation--fade', 'animation--none');
            element.classList.add('animation--' + this.value);
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
    }
    
    // Handle animation speed change
    const animationSpeedSelect = document.querySelector('[data-property="animationSpeed"]');
    if (animationSpeedSelect) {
        // Get initial value
        const currentSpeed = element.getAttribute('data-animation-speed') || 'medium';
        animationSpeedSelect.value = currentSpeed;
        
        // Add change listener
        animationSpeedSelect.addEventListener('change', function() {
            // Update data attribute
            element.setAttribute('data-animation-speed', this.value);
            
            // Update classes
            element.classList.remove('speed--fast', 'speed--medium', 'speed--slow');
            element.classList.add('speed--' + this.value);
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
    }
    
    // Handle expand first question toggle
    const expandFirstCheckbox = document.querySelector('[data-property="expandFirstQuestion"]');
    if (expandFirstCheckbox) {
        // Get initial state
        expandFirstCheckbox.checked = element.hasAttribute('data-expand-first');
        
        // Add change listener
        expandFirstCheckbox.addEventListener('change', function() {
            if (this.checked) {
                element.setAttribute('data-expand-first', 'true');
                
                // Expand first question
                const firstQuestion = element.querySelector('.question-item');
                if (firstQuestion) {
                    firstQuestion.classList.add('expanded');
                    const answer = firstQuestion.querySelector('.question-answer');
                    if (answer) {
                        answer.style.display = 'block';
                    }
                }
            } else {
                element.removeAttribute('data-expand-first');
                
                // Collapse first question if multiple not allowed
                if (!element.hasAttribute('data-allow-multiple')) {
                    const firstQuestion = element.querySelector('.question-item');
                    if (firstQuestion) {
                        firstQuestion.classList.remove('expanded');
                        const answer = firstQuestion.querySelector('.question-answer');
                        if (answer) {
                            answer.style.display = 'none';
                        }
                    }
                }
            }
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
    }
    
    // Handle allow multiple open toggle
    const allowMultipleCheckbox = document.querySelector('[data-property="allowMultipleOpen"]');
    if (allowMultipleCheckbox) {
        // Get initial state
        allowMultipleCheckbox.checked = element.hasAttribute('data-allow-multiple');
        
        // Add change listener
        allowMultipleCheckbox.addEventListener('change', function() {
            if (this.checked) {
                element.setAttribute('data-allow-multiple', 'true');
            } else {
                element.removeAttribute('data-allow-multiple');
                
                // Close all questions except the first if expand first is checked
                const questions = element.querySelectorAll('.question-item');
                const expandFirst = element.hasAttribute('data-expand-first');
                
                questions.forEach((question, index) => {
                    if (expandFirst && index === 0) return;
                    
                    question.classList.remove('expanded');
                    const answer = question.querySelector('.question-answer');
                    if (answer) {
                        answer.style.display = 'none';
                    }
                });
            }
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
    }
    
    // Setup accent color picker
    setupColorPicker('accentColor', element, function(color) {
        element.style.setProperty('--questions-accent-color', color);
        
        // Apply to question headers
        const questionHeaders = element.querySelectorAll('.question-header');
        questionHeaders.forEach(header => {
            header.style.borderColor = color;
        });
        
        // Apply to icons
        const icons = element.querySelectorAll('.question-icon');
        icons.forEach(icon => {
            icon.style.color = color;
        });
    });
    
    // Setup text content updaters
    setupTextContentUpdater('title', '.questions-section-title', element);
    setupTextContentUpdater('description', '.questions-section-description', element);
}

/**
 * Setup questions list functionality
 * @param {HTMLElement} element - The component element
 */
function setupQuestionsList(element) {
    const questionsList = document.getElementById('design-questions-list');
    const addQuestionBtn = document.getElementById('add-question-btn');
    
    if (!questionsList || !addQuestionBtn) return;
    
    // Load existing questions
    const existingQuestions = element.querySelectorAll('.question-item');
    questionsList.innerHTML = '';
    
    existingQuestions.forEach((question, index) => {
        const questionText = question.querySelector('.question-text')?.textContent || '';
        const answerText = question.querySelector('.question-answer')?.textContent || '';
        
        addQuestionToPanel(questionText, answerText, index);
    });
    
    // Add question button handler
    addQuestionBtn.addEventListener('click', function() {
        const newIndex = questionsList.children.length;
        const questionItem = addQuestionToPanel('New Question', 'Answer to the new question goes here...', newIndex);
        
        // Focus the question input
        const input = questionItem.querySelector('input');
        if (input) {
            input.focus();
            input.select();
        }
        
        // Update component
        updateQuestionsInComponent(element);
    });
}

/**
 * Add a question to the design panel
 * @param {string} question - Question text
 * @param {string} answer - Answer text
 * @param {number} index - Question index
 * @returns {HTMLElement} - The question item element
 */
function addQuestionToPanel(question, answer, index) {
    const questionsList = document.getElementById('design-questions-list');
    const questionItem = document.createElement('div');
    questionItem.className = 'question-editor-item';
    questionItem.innerHTML = `
        <div class="question-editor-header">
            <div class="question-number">#${index + 1}</div>
            <button class="remove-item-btn" title="Remove question">×</button>
        </div>
        <div class="form-group">
            <label class="form-label">Question</label>
            <input type="text" class="form-input" value="${escapeHtml(question)}" data-question="${index}">
        </div>
        <div class="form-group">
            <label class="form-label">Answer</label>
            <textarea class="form-input form-textarea" rows="3" data-answer="${index}">${escapeHtml(answer)}</textarea>
        </div>
    `;
    
    // Input handlers
    const inputs = questionItem.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            updateQuestionsInComponent(document.querySelector('.editable-element--selected'));
        });
    });
    
    // Remove button handler
    const removeBtn = questionItem.querySelector('.remove-item-btn');
    removeBtn.addEventListener('click', function() {
        questionItem.remove();
        updateQuestionsInComponent(document.querySelector('.editable-element--selected'));
        
        // Renumber questions
        const items = document.querySelectorAll('.question-editor-item');
        items.forEach((item, idx) => {
            const numberEl = item.querySelector('.question-number');
            if (numberEl) {
                numberEl.textContent = `#${idx + 1}`;
            }
        });
    });
    
    questionsList.appendChild(questionItem);
    return questionItem;
}

/**
 * Update questions in the component based on panel inputs
 * @param {HTMLElement} element - The component element
 */
function updateQuestionsInComponent(element) {
    if (!element) return;
    
    const questionsContainer = element.querySelector('.questions-container');
    if (!questionsContainer) return;
    
    const questionItems = document.querySelectorAll('.question-editor-item');
    
    // Clear existing questions
    questionsContainer.innerHTML = '';
    
    // Add questions from panel
    questionItems.forEach((item, index) => {
        const questionInput = item.querySelector(`[data-question="${index}"]`);
        const answerInput = item.querySelector(`[data-answer="${index}"]`);
        
        if (questionInput && answerInput) {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'question-item';
            
            // Get current icon style
            const iconStyle = element.getAttribute('data-icon-style') || 'plus-minus';
            const iconHtml = getIconHtml(iconStyle);
            
            questionDiv.innerHTML = `
                <div class="question-header">
                    <h3 class="question-text" contenteditable="true">${escapeHtml(questionInput.value)}</h3>
                    <div class="question-icon">${iconHtml}</div>
                </div>
                <div class="question-answer" contenteditable="true" style="display: none;">
                    ${escapeHtml(answerInput.value)}
                </div>
            `;
            
            // Add click handler to question header
            const header = questionDiv.querySelector('.question-header');
            header.addEventListener('click', function() {
                const isExpanded = questionDiv.classList.contains('expanded');
                const answer = questionDiv.querySelector('.question-answer');
                
                // Check if multiple open questions are allowed
                const allowMultiple = element.hasAttribute('data-allow-multiple');
                
                if (!allowMultiple) {
                    // Close all other questions
                    const allQuestions = element.querySelectorAll('.question-item');
                    allQuestions.forEach(q => {
                        if (q !== questionDiv) {
                            q.classList.remove('expanded');
                            const a = q.querySelector('.question-answer');
                            if (a) a.style.display = 'none';
                        }
                    });
                }
                
                // Toggle current question
                if (isExpanded) {
                    questionDiv.classList.remove('expanded');
                    if (answer) answer.style.display = 'none';
                } else {
                    questionDiv.classList.add('expanded');
                    if (answer) answer.style.display = 'block';
                }
            });
            
            questionsContainer.appendChild(questionDiv);
        }
    });
    
    // Apply "expand first question" if set
    if (element.hasAttribute('data-expand-first')) {
        const firstQuestion = questionsContainer.querySelector('.question-item');
        if (firstQuestion) {
            firstQuestion.classList.add('expanded');
            const answer = firstQuestion.querySelector('.question-answer');
            if (answer) {
                answer.style.display = 'block';
            }
        }
    }
    
    // Trigger save
    const event = new Event('change', { bubbles: true });
    element.dispatchEvent(event);
}

/**
 * Update question icons based on icon style
 * @param {HTMLElement} element - The component element
 * @param {string} iconStyle - The icon style
 */
function updateQuestionIcons(element, iconStyle) {
    const icons = element.querySelectorAll('.question-icon');
    const iconHtml = getIconHtml(iconStyle);
    
    icons.forEach(icon => {
        icon.innerHTML = iconHtml;
    });
}

/**
 * Get icon HTML based on icon style
 * @param {string} iconStyle - The icon style
 * @returns {string} - The icon HTML
 */
function getIconHtml(iconStyle) {
    switch (iconStyle) {
        case 'plus-minus':
            return `
                <svg class="icon-plus" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <svg class="icon-minus" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            `;
        case 'arrow':
            return `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            `;
        case 'chevron':
            return `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            `;
        case 'none':
            return '';
        default:
            return '';
    }
}

/**
 * Setup text content updater
 * @param {string} property - The property name
 * @param {string} selector - The element selector
 * @param {HTMLElement} component - The component element
 */
function setupTextContentUpdater(property, selector, component) {
    const input = document.querySelector(`[data-property="${property}"]`);
    if (!input) return;
    
    // Get initial value
    const element = component.querySelector(selector);
    if (element) {
        input.value = element.textContent.trim();
    }
    
    // Add input listener
    input.addEventListener('input', function() {
        const element = component.querySelector(selector);
        if (element) {
            element.textContent = this.value;
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            component.dispatchEvent(event);
        }
    });
}

/**
 * Setup a color picker
 * @param {string} property - The property name
 * @param {HTMLElement} element - The component element
 * @param {Function} applyCallback - Callback to apply the color
 */
function setupColorPicker(property, element, applyCallback) {
    const colorInput = document.querySelector(`[data-property="${property}"]`);
    const textInput = colorInput?.nextElementSibling;
    
    if (!colorInput || !textInput) return;
    
    // Get current color if available
    const currentColor = getComputedStyle(element).getPropertyValue('--questions-accent-color');
    if (currentColor && currentColor !== '') {
        const hex = rgbToHex(currentColor);
        colorInput.value = hex;
        textInput.value = hex;
    }
    
    // Sync color and text inputs
    colorInput.addEventListener('input', function() {
        textInput.value = this.value;
        if (applyCallback) {
            applyCallback(this.value);
        }
        
        // Trigger save
        const event = new Event('change', { bubbles: true });
        element.dispatchEvent(event);
    });
    
    textInput.addEventListener('input', function() {
        // Validate hex color
        if (/^#[0-9A-F]{6}$/i.test(this.value)) {
            colorInput.value = this.value;
            if (applyCallback) {
                applyCallback(this.value);
            }
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        }
    });
}

/**
 * Convert RGB to HEX color
 * @param {string} rgb - RGB color string
 * @returns {string} - HEX color string
 */
function rgbToHex(rgb) {
    // If already a hex color, return as is
    if (rgb.startsWith('#')) {
        return rgb;
    }
    
    // Extract RGB values
    const rgbMatch = rgb.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
    if (!rgbMatch) return '#4f46e5'; // Default color
    
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
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
