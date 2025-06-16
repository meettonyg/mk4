/**
 * Component templates and management
 */

import { selectElement } from '../ui/element-editor.js';
import { renderComponent } from './dynamic-component-loader.js';

/**
 * Add a component to a drop zone
 * @param {string} componentType - The type of component to add
 * @param {HTMLElement} zone - The drop zone to add the component to
 */
export async function addComponentToZone(componentType, zone) {
    try {
        // Show loading state
        zone.classList.add('loading');
        zone.innerHTML = '<div class="loading-spinner">Loading component...</div>';
        
        // Render component dynamically
        const template = await renderComponent(componentType);
        
        zone.classList.remove('drop-zone--empty', 'loading');
        zone.innerHTML = template;
        
        // Make the new element selectable
        const newElement = zone.querySelector('.editable-element');
        if (newElement) {
            newElement.addEventListener('click', function(e) {
                e.stopPropagation();
                selectElement(this);
            });
            
            // Select the newly added element
            selectElement(newElement);
        }
        
        console.log(`Added ${componentType} component`);
    } catch (error) {
        console.error('Error adding component:', error);
        zone.classList.remove('loading');
        zone.innerHTML = '<div class="error-message">Failed to load component</div>';
    }
}

/**
 * Get a component template (deprecated - use renderComponent instead)
 * @param {string} componentType - The type of component to get the template for
 * @returns {string} The component template HTML
 * @deprecated This function is deprecated. Use renderComponent from dynamic-component-loader.js instead.
 */
export function getComponentTemplate(componentType) {
    console.warn('getComponentTemplate is deprecated. Use renderComponent instead.');
    const templates = {
        'hero': `
            <div class="hero editable-element" data-element="hero" data-component="hero">
                <div class="element-controls">
                    <button class="control-btn" title="Move Up">↑</button>
                    <button class="control-btn" title="Duplicate">⧉</button>
                    <button class="control-btn" title="Delete">×</button>
                </div>
                <div class="hero__avatar">
                    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='50' font-size='50' text-anchor='middle' x='50' fill='%2364748b'%3EDJ%3C/text%3E%3C/svg%3E" alt="Profile Avatar">
                </div>
                <h1 class="hero__name" contenteditable="true">New Hero Section</h1>
                <div class="hero__title" contenteditable="true">Your Professional Title</div>
                <p class="hero__bio" contenteditable="true">Briefly introduce yourself and your expertise.</p>
            </div>
        `,
        'bio': `
            <div class="content-section editable-element" data-element="bio" data-component="bio">
                <div class="element-controls">
                    <button class="control-btn" title="Move Up">↑</button>
                    <button class="control-btn" title="Move Down">↓</button>
                    <button class="control-btn" title="Duplicate">⧉</button>
                    <button class="control-btn" title="Delete">×</button>
                </div>
                <h2 class="section-title" contenteditable="true">About Me</h2>
                <p contenteditable="true">Add your full biography and professional background here. This is where you can share your story, expertise, and what makes you unique as a speaker or expert in your field.</p>
            </div>
        `,
        'topics': `
            <div class="content-section editable-element" data-element="topics" data-component="topics">
                <div class="element-controls">
                    <button class="control-btn" title="Move Up">↑</button>
                    <button class="control-btn" title="Move Down">↓</button>
                    <button class="control-btn" title="Duplicate">⧉</button>
                    <button class="control-btn" title="Delete">×</button>
                </div>
                <h2 class="section-title" contenteditable="true">Speaking Topics</h2>
                <div class="topics-grid">
                    <div class="topic-item" contenteditable="true">Topic 1</div>
                    <div class="topic-item" contenteditable="true">Topic 2</div>
                    <div class="topic-item" contenteditable="true">Topic 3</div>
                    <div class="topic-item" contenteditable="true">Topic 4</div>
                </div>
            </div>
        `,
        'social': `
            <div class="social-links editable-element" data-element="social" data-component="social">
                <div class="element-controls">
                    <button class="control-btn" title="Move Up">↑</button>
                    <button class="control-btn" title="Move Down">↓</button>
                    <button class="control-btn" title="Duplicate">⧉</button>
                    <button class="control-btn" title="Delete">×</button>
                </div>
                <a href="#" class="social-link" title="Twitter">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                    </svg>
                </a>
                <a href="#" class="social-link" title="LinkedIn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                        <circle cx="4" cy="4" r="2"/>
                    </svg>
                </a>
                <a href="#" class="social-link" title="Instagram">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                        <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                    </svg>
                </a>
            </div>
        `,
        'stats': `
            <div class="content-section editable-element" data-element="stats" data-component="stats">
                <div class="element-controls">
                    <button class="control-btn" title="Move Up">↑</button>
                    <button class="control-btn" title="Move Down">↓</button>
                    <button class="control-btn" title="Duplicate">⧉</button>
                    <button class="control-btn" title="Delete">×</button>
                </div>
                <h2 class="section-title" contenteditable="true">Key Statistics</h2>
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-item__number" contenteditable="true">1.2M</span>
                        <div class="stat-item__label" contenteditable="true">Followers</div>
                    </div>
                    <div class="stat-item">
                        <span class="stat-item__number" contenteditable="true">150+</span>
                        <div class="stat-item__label" contenteditable="true">Podcast Shows</div>
                    </div>
                    <div class="stat-item">
                        <span class="stat-item__number" contenteditable="true">500K</span>
                        <div class="stat-item__label" contenteditable="true">Downloads</div>
                    </div>
                    <div class="stat-item">
                        <span class="stat-item__number" contenteditable="true">5</span>
                        <div class="stat-item__label" contenteditable="true">Years Experience</div>
                    </div>
                </div>
            </div>
        `,
        'cta': `
            <div class="content-section editable-element" data-element="cta" data-component="cta">
                <div class="element-controls">
                    <button class="control-btn" title="Move Up">↑</button>
                    <button class="control-btn" title="Move Down">↓</button>
                    <button class="control-btn" title="Duplicate">⧉</button>
                    <button class="control-btn" title="Delete">×</button>
                </div>
                <div class="cta">
                    <h2 class="section-title" contenteditable="true">Ready to Connect?</h2>
                    <p contenteditable="true">Let's discuss how we can work together on your next project or podcast.</p>
                    <a href="#" class="cta__button" contenteditable="true">Book a Meeting</a>
                </div>
            </div>
        `,
        'logo-grid': `
            <div class="content-section editable-element" data-element="logo-grid" data-component="logo-grid">
                <div class="element-controls">
                    <button class="control-btn" title="Move Up">↑</button>
                    <button class="control-btn" title="Move Down">↓</button>
                    <button class="control-btn" title="Duplicate">⧉</button>
                    <button class="control-btn" title="Delete">×</button>
                </div>
                <h2 class="section-title" contenteditable="true">Featured On</h2>
                <div class="logo-grid">
                    <div class="logo-item">
                        <div class="logo-placeholder">Click to add logo</div>
                    </div>
                    <div class="logo-item">
                        <div class="logo-placeholder">Click to add logo</div>
                    </div>
                    <div class="logo-item">
                        <div class="logo-placeholder">Click to add logo</div>
                    </div>
                    <div class="logo-item">
                        <div class="logo-placeholder">Click to add logo</div>
                    </div>
                </div>
            </div>
        `,
        'testimonials': `
            <div class="content-section editable-element" data-element="testimonials" data-component="testimonials">
                <div class="element-controls">
                    <button class="control-btn" title="Move Up">↑</button>
                    <button class="control-btn" title="Move Down">↓</button>
                    <button class="control-btn" title="Duplicate">⧉</button>
                    <button class="control-btn" title="Delete">×</button>
                </div>
                <h2 class="section-title" contenteditable="true">What People Say</h2>
                <div class="testimonial">
                    <p class="testimonial__quote" contenteditable="true">"An incredible speaker with deep insights into quantum physics and ancient technology. Highly recommended!"</p>
                    <div class="testimonial__author" contenteditable="true">Sarah Mitchell</div>
                    <div class="testimonial__role" contenteditable="true">Host, The Science Podcast</div>
                </div>
            </div>
        `,
        'contact': `
            <div class="content-section editable-element" data-element="contact" data-component="contact">
                <div class="element-controls">
                    <button class="control-btn" title="Move Up">↑</button>
                    <button class="control-btn" title="Move Down">↓</button>
                    <button class="control-btn" title="Duplicate">⧉</button>
                    <button class="control-btn" title="Delete">×</button>
                </div>
                <h2 class="section-title" contenteditable="true">Contact Information</h2>
                <div class="contact-info">
                    <p contenteditable="true">📧 your.email@example.com</p>
                    <p contenteditable="true">📱 +1 (555) 123-4567</p>
                    <p contenteditable="true">🌐 www.yourwebsite.com</p>
                </div>
            </div>
        `,
        'questions': `
            <div class="content-section editable-element" data-element="questions" data-component="questions">
                <div class="element-controls">
                    <button class="control-btn" title="Move Up">↑</button>
                    <button class="control-btn" title="Move Down">↓</button>
                    <button class="control-btn" title="Duplicate">⧉</button>
                    <button class="control-btn" title="Delete">×</button>
                </div>
                <h2 class="section-title" contenteditable="true">Interview Questions</h2>
                <div class="questions-list">
                    <div class="question-item" contenteditable="true">What inspired you to become an expert in your field?</div>
                    <div class="question-item" contenteditable="true">What's the most common misconception about your industry?</div>
                    <div class="question-item" contenteditable="true">What advice would you give to someone starting out?</div>
                </div>
            </div>
        `
    };
    
    return templates[componentType] || '<div class="content-section"><p>Component template not found</p></div>';
}
