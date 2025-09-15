/**
 * @file renderer.js
 * @description Questions Component Self-Registering Renderer
 * 
 * ARCHITECTURE: Self-contained component with self-registration
 */

(function() {
    'use strict';
    
    const COMPONENT_TYPE = 'questions';
    
    const schema = {
        dataBindings: {
            title: 'questions_title',
            questions: 'interview_questions',
            faqs: 'frequently_asked_questions'
        },
        layouts: ['default', 'accordion', 'numbered', 'cards'],
        defaults: {
            title: 'Interview Questions',
            questions: [],
            layout: 'default',
            showNumbers: true,
            expandable: false
        },
        validation: {
            required: [],
            maxQuestions: 20
        }
    };
    
    function renderComponent(data, options = {}) {
        try {
            const title = data.title || schema.defaults.title;
            const layout = options.layout || schema.defaults.layout;
            const showNumbers = options.showNumbers !== undefined ? options.showNumbers : schema.defaults.showNumbers;
            const expandable = options.expandable !== undefined ? options.expandable : schema.defaults.expandable;
            
            // Process questions from various sources
            let questions = [];
            if (Array.isArray(data.questions)) {
                questions = data.questions;
            } else if (Array.isArray(data.faqs)) {
                questions = data.faqs;
            } else {
                // Check for individual question fields
                for (let i = 1; i <= 10; i++) {
                    if (data[`question_${i}`]) {
                        questions.push({
                            question: data[`question_${i}`],
                            answer: data[`answer_${i}`] || ''
                        });
                    }
                }
            }
            
            let html = `<div class="gmkb-questions gmkb-questions--${layout} gmkb-component--self-registered">`;
            
            html += `<h3 class="gmkb-questions__title">${escapeHtml(title)}</h3>`;
            
            if (window.gmkbData?.debugMode) {
                html += `<div class="gmkb-component__phase2-badge">[SELF-REGISTERED - QUESTIONS]</div>`;
            }
            
            if (questions.length > 0) {
                if (layout === 'accordion' && expandable) {
                    html += '<div class="gmkb-questions__accordion">';
                    questions.forEach((q, index) => {
                        const question = typeof q === 'string' ? q : (q.question || q.text || '');
                        const answer = typeof q === 'object' ? (q.answer || '') : '';
                        const num = showNumbers ? `${index + 1}. ` : '';
                        
                        html += `<div class="gmkb-questions__accordion-item">
                            <button class="gmkb-questions__accordion-trigger">
                                ${num}${escapeHtml(question)}
                                <span class="gmkb-questions__accordion-icon">▼</span>
                            </button>`;
                        if (answer) {
                            html += `<div class="gmkb-questions__accordion-content">
                                <p>${escapeHtml(answer)}</p>
                            </div>`;
                        }
                        html += '</div>';
                    });
                    html += '</div>';
                } else if (layout === 'cards') {
                    html += '<div class="gmkb-questions__cards">';
                    questions.forEach((q, index) => {
                        const question = typeof q === 'string' ? q : (q.question || q.text || '');
                        const answer = typeof q === 'object' ? (q.answer || '') : '';
                        const num = showNumbers ? `${index + 1}. ` : '';
                        
                        html += `<div class="gmkb-questions__card">
                            <h4 class="gmkb-questions__card-question">${num}${escapeHtml(question)}</h4>`;
                        if (answer) {
                            html += `<p class="gmkb-questions__card-answer">${escapeHtml(answer)}</p>`;
                        }
                        html += '</div>';
                    });
                    html += '</div>';
                } else if (layout === 'numbered' || showNumbers) {
                    html += '<ol class="gmkb-questions__list gmkb-questions__list--numbered">';
                    questions.forEach(q => {
                        const question = typeof q === 'string' ? q : (q.question || q.text || '');
                        const answer = typeof q === 'object' ? (q.answer || '') : '';
                        
                        html += `<li class="gmkb-questions__item">
                            <span class="gmkb-questions__text">${escapeHtml(question)}</span>`;
                        if (answer) {
                            html += `<p class="gmkb-questions__answer">${escapeHtml(answer)}</p>`;
                        }
                        html += '</li>';
                    });
                    html += '</ol>';
                } else {
                    // Default layout
                    html += '<ul class="gmkb-questions__list">';
                    questions.forEach(q => {
                        const question = typeof q === 'string' ? q : (q.question || q.text || '');
                        const answer = typeof q === 'object' ? (q.answer || '') : '';
                        
                        html += `<li class="gmkb-questions__item">
                            <span class="gmkb-questions__text">${escapeHtml(question)}</span>`;
                        if (answer) {
                            html += `<p class="gmkb-questions__answer">${escapeHtml(answer)}</p>`;
                        }
                        html += '</li>';
                    });
                    html += '</ul>';
                }
            } else {
                html += '<p class="gmkb-questions__empty">No questions configured yet.</p>';
            }
            
            html += '</div>';
            return html;
            
        } catch (error) {
            console.error(`Error rendering ${COMPONENT_TYPE}:`, error);
            return `<div class="gmkb-component gmkb-component--error">
                <h3>⚠️ Error Rendering Questions</h3>
                <p>${escapeHtml(error.message)}</p>
            </div>`;
        }
    }
    
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = String(text);
        return div.innerHTML;
    }
    
    // ROOT FIX: Event-driven registration - no polling
    function registerComponent() {
        if (window.GMKBComponentRegistry && typeof window.GMKBComponentRegistry.register === 'function') {
            // Register with proper component object structure
            const success = window.GMKBComponentRegistry.register(COMPONENT_TYPE, {
                renderer: renderComponent,
                schema: schema,
                type: COMPONENT_TYPE
            });
            if (success && window.gmkbData?.debugMode) {
                console.log(`✅ Questions component registered successfully`);
            }
        }
    }
    
    // Try immediate registration if registry exists
    if (window.GMKBComponentRegistry) {
        registerComponent();
    } else {
        // Listen for registry ready event - EVENT-DRIVEN, no polling
        document.addEventListener('gmkb:component-registry-ready', registerComponent);
    }
})();