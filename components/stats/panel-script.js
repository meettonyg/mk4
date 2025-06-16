/**
 * Stats Component Panel Script
 * Handles the dynamic functionality of the stats design panel
 */

// Register this component's panel handler
window.componentPanelHandlers = window.componentPanelHandlers || {};
window.componentPanelHandlers['stats'] = function(element) {
    initializeStatsPanel(element);
};

/**
 * Initialize stats panel
 * @param {HTMLElement} element - The stats component element
 */
function initializeStatsPanel(element) {
    const statsList = document.getElementById('design-stats-list');
    const addStatBtn = document.getElementById('add-stat-btn');
    
    if (!statsList || !addStatBtn) return;
    
    // Load existing stats
    const existingStats = element.querySelectorAll('.stat-item');
    statsList.innerHTML = '';
    
    existingStats.forEach((stat, index) => {
        const number = stat.querySelector('.stat-item__number')?.textContent || '';
        const label = stat.querySelector('.stat-item__label')?.textContent || '';
        addStatToPanel(number, label, index);
    });
    
    // Add stat button handler
    addStatBtn.addEventListener('click', function() {
        const newIndex = statsList.children.length;
        const statItem = addStatToPanel('0', 'New Metric', newIndex);
        
        // Focus the first input
        const input = statItem.querySelector('input');
        if (input) {
            input.focus();
            input.select();
        }
        
        // Update component
        updateStatsInComponent(element);
    });
    
    // Handle grid columns change
    const gridSelect = document.querySelector('[data-property="grid_columns"]');
    if (gridSelect) {
        gridSelect.addEventListener('change', function() {
            const statsGrid = element.querySelector('.stats-grid');
            if (statsGrid) {
                statsGrid.style.gridTemplateColumns = `repeat(${this.value}, 1fr)`;
            }
        });
    }
}

/**
 * Add a stat to the design panel
 * @param {string} number - Stat number/value
 * @param {string} label - Stat label
 * @param {number} index - Stat index
 * @returns {HTMLElement} - The stat item element
 */
function addStatToPanel(number, label, index) {
    const statsList = document.getElementById('design-stats-list');
    const statItem = document.createElement('div');
    statItem.className = 'stat-editor-item';
    statItem.innerHTML = `
        <div class="stat-inputs">
            <input type="text" class="form-input" placeholder="Value" value="${escapeHtml(number)}" data-stat-number="${index}">
            <input type="text" class="form-input" placeholder="Label" value="${escapeHtml(label)}" data-stat-label="${index}">
        </div>
        <button class="remove-item-btn" title="Remove stat">×</button>
    `;
    
    // Input handlers
    const inputs = statItem.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            const element = document.querySelector('.editable-element--selected');
            if (element) {
                updateStatsInComponent(element);
            }
        });
    });
    
    // Remove button handler
    const removeBtn = statItem.querySelector('.remove-item-btn');
    removeBtn.addEventListener('click', function() {
        statItem.remove();
        const element = document.querySelector('.editable-element--selected');
        if (element) {
            updateStatsInComponent(element);
        }
    });
    
    statsList.appendChild(statItem);
    return statItem;
}

/**
 * Update stats in the component based on panel inputs
 * @param {HTMLElement} element - The component element
 */
function updateStatsInComponent(element) {
    const statsGrid = element.querySelector('.stats-grid');
    if (!statsGrid) return;
    
    const statItems = document.querySelectorAll('.stat-editor-item');
    
    // Clear existing stats
    statsGrid.innerHTML = '';
    
    // Add stats from panel
    statItems.forEach((item, index) => {
        const numberInput = item.querySelector(`[data-stat-number="${index}"]`);
        const labelInput = item.querySelector(`[data-stat-label="${index}"]`);
        
        if (numberInput && labelInput) {
            const statDiv = document.createElement('div');
            statDiv.className = 'stat-item';
            statDiv.innerHTML = `
                <span class="stat-item__number" contenteditable="true">${escapeHtml(numberInput.value)}</span>
                <div class="stat-item__label" contenteditable="true">${escapeHtml(labelInput.value)}</div>
            `;
            statsGrid.appendChild(statDiv);
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
