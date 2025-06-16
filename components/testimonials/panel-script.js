/**
 * Testimonials Component Panel Script
 * Handles the dynamic functionality of the testimonials design panel
 */

// Register this component's panel handler
window.componentPanelHandlers = window.componentPanelHandlers || {};
window.componentPanelHandlers['testimonials'] = function(element) {
    initializeTestimonialsPanel(element);
};

/**
 * Initialize testimonials panel
 * @param {HTMLElement} element - The testimonials component element
 */
function initializeTestimonialsPanel(element) {
    const testimonialsList = document.getElementById('design-testimonials-list');
    const addTestimonialBtn = document.getElementById('add-testimonial-btn');
    
    if (!testimonialsList || !addTestimonialBtn) return;
    
    // Load existing testimonials
    const existingTestimonials = element.querySelectorAll('.testimonial-item');
    testimonialsList.innerHTML = '';
    
    existingTestimonials.forEach((testimonial, index) => {
        const text = testimonial.querySelector('.testimonial-text')?.textContent || '';
        const authorName = testimonial.querySelector('.testimonial-author-name')?.textContent || '';
        const authorTitle = testimonial.querySelector('.testimonial-author-title')?.textContent || '';
        
        addTestimonialToPanel(text, authorName, authorTitle, index);
    });
    
    // Add testimonial button handler
    addTestimonialBtn.addEventListener('click', function() {
        const newIndex = testimonialsList.children.length;
        const testimonialItem = addTestimonialToPanel('', 'New Testimonial', 'Position/Company', newIndex);
        
        // Focus the first input
        const input = testimonialItem.querySelector('textarea');
        if (input) {
            input.focus();
        }
        
        // Update component
        updateTestimonialsInComponent(element);
    });
}

/**
 * Add a testimonial to the design panel
 * @param {string} text - Testimonial text
 * @param {string} authorName - Author name
 * @param {string} authorTitle - Author title/position
 * @param {number} index - Testimonial index
 * @returns {HTMLElement} - The testimonial item element
 */
function addTestimonialToPanel(text, authorName, authorTitle, index) {
    const testimonialsList = document.getElementById('design-testimonials-list');
    const testimonialItem = document.createElement('div');
    testimonialItem.className = 'testimonial-editor-item';
    testimonialItem.innerHTML = `
        <div class="testimonial-editor-content">
            <label class="form-label">Testimonial</label>
            <textarea class="form-input form-textarea" rows="3" data-testimonial-text="${index}">${escapeHtml(text)}</textarea>
            
            <div class="testimonial-author-inputs">
                <div class="form-group">
                    <label class="form-label">Author Name</label>
                    <input type="text" class="form-input" value="${escapeHtml(authorName)}" data-testimonial-author="${index}">
                </div>
                <div class="form-group">
                    <label class="form-label">Author Title/Position</label>
                    <input type="text" class="form-input" value="${escapeHtml(authorTitle)}" data-testimonial-title="${index}">
                </div>
            </div>
            
            <div class="testimonial-image-upload">
                <label class="form-label">Author Image</label>
                <div class="image-upload-control">
                    <button class="upload-image-btn" data-testimonial-index="${index}">Choose Image</button>
                    <span class="selected-image" id="testimonial-image-${index}">No image selected</span>
                </div>
            </div>
        </div>
        <button class="remove-item-btn" title="Remove testimonial">×</button>
    `;
    
    // Input handlers
    const inputs = testimonialItem.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            const element = document.querySelector('.editable-element--selected');
            if (element) {
                updateTestimonialsInComponent(element);
            }
        });
    });
    
    // Image upload handler
    const uploadBtn = testimonialItem.querySelector('.upload-image-btn');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', function() {
            // This would typically use the WordPress media uploader
            // For now, we'll just use a placeholder
            alert('Image upload functionality would open media browser here');
            
            // Update component after selection
            updateTestimonialsInComponent(element);
        });
    }
    
    // Remove button handler
    const removeBtn = testimonialItem.querySelector('.remove-item-btn');
    removeBtn.addEventListener('click', function() {
        testimonialItem.remove();
        const element = document.querySelector('.editable-element--selected');
        if (element) {
            updateTestimonialsInComponent(element);
        }
    });
    
    testimonialsList.appendChild(testimonialItem);
    return testimonialItem;
}

/**
 * Update testimonials in the component based on panel inputs
 * @param {HTMLElement} element - The component element
 */
function updateTestimonialsInComponent(element) {
    const testimonialsGrid = element.querySelector('.testimonials-grid');
    if (!testimonialsGrid) return;
    
    const testimonialItems = document.querySelectorAll('.testimonial-editor-item');
    
    // Clear existing testimonials
    testimonialsGrid.innerHTML = '';
    
    // Add testimonials from panel
    testimonialItems.forEach((item, index) => {
        const textInput = item.querySelector(`[data-testimonial-text="${index}"]`);
        const authorInput = item.querySelector(`[data-testimonial-author="${index}"]`);
        const titleInput = item.querySelector(`[data-testimonial-title="${index}"]`);
        
        if (textInput && authorInput) {
            const testimonialDiv = document.createElement('div');
            testimonialDiv.className = 'testimonial-item';
            testimonialDiv.innerHTML = `
                <div class="testimonial-content">
                    <div class="testimonial-quote-icon">❝</div>
                    <div class="testimonial-text">${escapeHtml(textInput.value)}</div>
                </div>
                <div class="testimonial-author">
                    <div class="testimonial-author-info">
                        <div class="testimonial-author-name">${escapeHtml(authorInput.value)}</div>
                        ${titleInput && titleInput.value ? `<div class="testimonial-author-title">${escapeHtml(titleInput.value)}</div>` : ''}
                    </div>
                </div>
            `;
            testimonialsGrid.appendChild(testimonialDiv);
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
