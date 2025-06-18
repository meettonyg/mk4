/**
 * Dynamic Component Loader
 * Fetches component templates from the server with caching for performance
 */

// Template cache and loading promises for performance
const templateCache = new Map();
const loadingPromises = new Map();

/**
 * Render a component by fetching its template from the server
 * @param {string} componentType - The type/slug of the component
 * @param {string} componentId - Unique component instance ID
 * @param {object} props - Component properties
 * @returns {Promise<string>} - The rendered component HTML
 */
export async function renderComponent(componentType, componentId = null, props = {}) {
    console.log(`renderComponent called - Type: ${componentType}, ID: ${componentId}`);
    
    try {
        // Add componentId to props for the template
        const propsWithId = { ...props, componentId };
        
        // First try REST API
        if (guestifyData.restUrl) {
            const response = await fetch(`${guestifyData.restUrl}guestify/v1/render-component`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': guestifyData.restNonce
                },
                body: JSON.stringify({
                    component: componentType,
                    props: propsWithId
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    return wrapComponentWithControls(data.html, componentType, componentId);
                }
            }
        }

        // Fallback to AJAX
        const formData = new FormData();
        formData.append('action', 'guestify_render_component');
        formData.append('component', componentType);
        formData.append('props', JSON.stringify(propsWithId));
        formData.append('nonce', guestifyData.nonce);

        const ajaxResponse = await fetch(guestifyData.ajaxUrl, {
            method: 'POST',
            body: formData
        });

        const ajaxData = await ajaxResponse.json();
        if (ajaxData.success) {
            return wrapComponentWithControls(ajaxData.data.html, componentType, componentId);
        }

        throw new Error('Failed to render component');
    } catch (error) {
        console.error('Error rendering component:', error);
        return '<div class="error-component">Failed to load component</div>';
    }
}

/**
 * Wrap component HTML with editing controls
 * @param {string} html - The component HTML
 * @param {string} componentType - The component type
 * @param {string} componentId - Unique component instance ID
 * @returns {string} - HTML with controls
 */
function wrapComponentWithControls(html, componentType, componentId) {
    // Create a temporary container to parse the HTML
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // Find the main component element
    const componentEl = temp.firstElementChild;
    
    if (componentEl) {
        // Add necessary classes and attributes
        componentEl.classList.add('editable-element');
        componentEl.setAttribute('data-component', componentType);
        componentEl.setAttribute('data-element', componentType);
        componentEl.setAttribute('data-component-type', componentType);
        
        // Add component ID if provided
        if (componentId) {
            componentEl.setAttribute('data-component-id', componentId);
        }
        
        // Only add controls if they don't already exist
        if (!componentEl.querySelector('.element-controls')) {
            const controls = `
                <div class="element-controls">
                    <button class="control-btn" title="Move Up">↑</button>
                    <button class="control-btn" title="Move Down">↓</button>
                    <button class="control-btn" title="Duplicate">⧉</button>
                    <button class="control-btn" title="Delete">×</button>
                </div>
            `;
            
            componentEl.insertAdjacentHTML('afterbegin', controls);
        }
        
        // Make text content editable
        const editableElements = componentEl.querySelectorAll('h1, h2, h3, p, span, div');
        editableElements.forEach(el => {
            if (!el.classList.contains('element-controls') && 
                !el.closest('.element-controls') &&
                el.textContent.trim() && 
                !el.querySelector('*')) {
                el.setAttribute('contenteditable', 'true');
            }
        });
    }
    
    return temp.innerHTML;
}

/**
 * Get component information from the loaded data
 * @param {string} componentType - The component type
 * @returns {object|null} - Component data or null
 */
export function getComponentInfo(componentType) {
    if (!guestifyData.components) return null;
    
    // Check direct match
    if (guestifyData.components[componentType]) {
        return guestifyData.components[componentType];
    }
    
    // Check mapped names
    const mappings = {
        'bio': 'biography',
        'calendar': 'booking-calendar',
        'cta': 'call-to-action',
        'gallery': 'photo-gallery',
        'podcast': 'podcast-player',
        'video': 'video-intro'
    };
    
    const mappedName = mappings[componentType];
    if (mappedName && guestifyData.components[mappedName]) {
        return guestifyData.components[mappedName];
    }
    
    return null;
}

/**
 * Clear template cache
 */
export function clearTemplateCache() {
    templateCache.clear();
    loadingPromises.clear();
}

/**
 * Initialize dynamic component sidebar
 */
export function initializeDynamicComponents() {
    const componentsTab = document.getElementById('components-tab');
    if (!componentsTab || !guestifyData.categories) return;
    
    // Clear existing content
    componentsTab.innerHTML = '';
    
    // Build component sections by category
    Object.entries(guestifyData.categories).forEach(([categoryName, components]) => {
        const section = createComponentSection(categoryName, components);
        componentsTab.appendChild(section);
    });
    
    // Add the "Add Component" button
    const addButton = document.createElement('button');
    addButton.className = 'toolbar__btn add-component-btn';
    addButton.id = 'add-component-btn';
    addButton.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Add Component
    `;
    componentsTab.appendChild(addButton);
    
    // Trigger a custom event to signal that components have been loaded
    document.dispatchEvent(new CustomEvent('componentsLoaded'));
}

/**
 * Create a component section
 * @param {string} categoryName - The category name
 * @param {array} components - Array of components in this category
 * @returns {HTMLElement} - The section element
 */
function createComponentSection(categoryName, components) {
    const section = document.createElement('div');
    section.className = 'sidebar__section';
    
    // Create section title
    const title = document.createElement('div');
    title.className = 'sidebar__section-title';
    title.textContent = getCategoryTitle(categoryName);
    
    if (categoryName === 'premium') {
        const badge = document.createElement('span');
        badge.className = 'premium-badge';
        badge.textContent = 'PRO';
        title.appendChild(badge);
    }
    
    section.appendChild(title);
    
    // Create component grid
    const grid = document.createElement('div');
    grid.className = 'component-grid';
    
    components.forEach(component => {
        const item = createComponentItem(component);
        grid.appendChild(item);
    });
    
    section.appendChild(grid);
    
    // Add upgrade prompt for premium section
    if (categoryName === 'premium') {
        const upgradePrompt = document.createElement('div');
        upgradePrompt.className = 'upgrade-prompt';
        upgradePrompt.innerHTML = `
            <div class="upgrade-prompt__title">Unlock Premium Components</div>
            <div class="upgrade-prompt__text">Get advanced components and unlimited customization.</div>
            <button class="upgrade-prompt__btn">Upgrade to Pro</button>
        `;
        section.appendChild(upgradePrompt);
    }
    
    return section;
}

/**
 * Create a component item
 * @param {object} component - Component data
 * @returns {HTMLElement} - The component item element
 */
function createComponentItem(component) {
    const item = document.createElement('div');
    item.className = 'component-item';
    if (component.isPremium) {
        item.className += ' component-item--premium';
    }
    
    item.draggable = true;
    item.setAttribute('data-component', component.directory);
    
    // Create icon
    const iconDiv = document.createElement('div');
    iconDiv.className = 'component-item__icon';
    iconDiv.innerHTML = getComponentIcon(component.icon || 'box.svg');
    item.appendChild(iconDiv);
    
    // Create name
    const nameDiv = document.createElement('div');
    nameDiv.className = 'component-item__name';
    nameDiv.textContent = component.name;
    item.appendChild(nameDiv);
    
    return item;
}

/**
 * Get category title
 * @param {string} categoryName - The category identifier
 * @returns {string} - The formatted title
 */
function getCategoryTitle(categoryName) {
    const titles = {
        'essential': 'Essential Components',
        'media': 'Media & Content',
        'premium': 'Premium Components'
    };
    
    return titles[categoryName] || categoryName.charAt(0).toUpperCase() + categoryName.slice(1) + ' Components';
}

/**
 * Get component icon SVG
 * @param {string} iconName - The icon file name
 * @returns {string} - SVG markup
 */
function getComponentIcon(iconName) {
    const icons = {
        'user.svg': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
        'file-text.svg': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>',
        'list.svg': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line></svg>',
        'linkedin.svg': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>',
        'bar-chart.svg': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>',
        'arrow-right-circle.svg': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 16 16 12 12 8"></polyline><line x1="8" y1="12" x2="16" y2="12"></line></svg>',
        'grid.svg': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>',
        'message-square.svg': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
        'mail.svg': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>',
        'help-circle.svg': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
        'video.svg': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>',
        'image.svg': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>',
        'calendar.svg': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
        'headphones.svg': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>',
        'mic.svg': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>',
        'box.svg': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>'
    };
    
    return icons[iconName] || icons['box.svg'];
}
