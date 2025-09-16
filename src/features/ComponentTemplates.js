/**
 * Component Templates System
 * Pre-built component configurations for quick setup
 * 
 * ARCHITECTURE COMPLIANT:
 * ✅ Self-contained templates
 * ✅ Works with existing components
 * ✅ Event-driven
 * ✅ Simple and extensible
 */

export class ComponentTemplates {
    constructor() {
        this.templates = this.loadTemplates();
        this.categories = this.organizeByCategory();
    }
    
    loadTemplates() {
        return {
            // HERO TEMPLATES
            'hero-minimal': {
                id: 'hero-minimal',
                name: 'Minimal Hero',
                category: 'hero',
                component: 'hero',
                thumbnail: '/assets/templates/hero-minimal.jpg',
                description: 'Clean, minimal hero with centered text',
                data: {
                    title: 'Your Name Here',
                    subtitle: 'Professional Title',
                    alignment: 'center',
                    ctaText: '',
                    backgroundColor: 'transparent'
                }
            },
            
            'hero-cta': {
                id: 'hero-cta',
                name: 'Hero with CTA',
                category: 'hero',
                component: 'hero',
                thumbnail: '/assets/templates/hero-cta.jpg',
                description: 'Hero section with call-to-action button',
                data: {
                    title: 'Welcome to My Media Kit',
                    subtitle: 'Discover how I can help your audience',
                    ctaText: 'Book Me Now',
                    ctaUrl: '#contact',
                    alignment: 'center'
                }
            },
            
            'hero-speaker': {
                id: 'hero-speaker',
                name: 'Speaker Hero',
                category: 'hero',
                component: 'hero',
                thumbnail: '/assets/templates/hero-speaker.jpg',
                description: 'Perfect for keynote speakers',
                data: {
                    title: 'Keynote Speaker & Author',
                    subtitle: 'Inspiring audiences worldwide with transformative insights',
                    ctaText: 'Check Availability',
                    ctaUrl: '#booking',
                    backgroundImage: '/assets/stage-background.jpg',
                    alignment: 'left'
                }
            },
            
            // BIOGRAPHY TEMPLATES
            'bio-short': {
                id: 'bio-short',
                name: 'Short Bio',
                category: 'biography',
                component: 'biography',
                description: 'Concise professional biography',
                data: {
                    title: 'About Me',
                    biography: 'A brief 2-3 sentence overview of your professional background and expertise. Perfect for quick introductions.',
                    showTitle: true,
                    fontSize: 'medium'
                }
            },
            
            'bio-detailed': {
                id: 'bio-detailed',
                name: 'Detailed Biography',
                category: 'biography',
                component: 'biography',
                description: 'Comprehensive professional story',
                data: {
                    title: 'My Story',
                    biography: `First paragraph: Your professional journey and how you got started.

Second paragraph: Major achievements and milestones in your career.

Third paragraph: Current focus and what drives your passion.

Fourth paragraph: Personal touch - hobbies, values, or fun facts that make you relatable.`,
                    showTitle: true,
                    fontSize: 'medium',
                    preserveLineBreaks: true
                }
            },
            
            // TOPICS TEMPLATES
            'topics-speaker': {
                id: 'topics-speaker',
                name: 'Speaker Topics',
                category: 'topics',
                component: 'topics',
                description: 'Professional speaking topics',
                data: {
                    title: 'Speaking Topics',
                    topics: [
                        'Leadership in the Digital Age',
                        'Innovation and Disruption',
                        'Building High-Performance Teams',
                        'The Future of Work',
                        'Personal Branding Strategies'
                    ],
                    displayStyle: 'cards'
                }
            },
            
            'topics-expertise': {
                id: 'topics-expertise',
                name: 'Areas of Expertise',
                category: 'topics',
                component: 'topics',
                description: 'Professional expertise areas',
                data: {
                    title: 'Areas of Expertise',
                    topics: [
                        'Strategic Planning',
                        'Digital Transformation',
                        'Change Management',
                        'Executive Coaching'
                    ],
                    displayStyle: 'list'
                }
            },
            
            // CONTACT TEMPLATES
            'contact-simple': {
                id: 'contact-simple',
                name: 'Simple Contact',
                category: 'contact',
                component: 'contact',
                description: 'Basic contact information',
                data: {
                    title: 'Get in Touch',
                    email: 'your.email@example.com',
                    phone: '+1 (555) 123-4567',
                    showSocial: false
                }
            },
            
            'contact-full': {
                id: 'contact-full',
                name: 'Full Contact',
                category: 'contact',
                component: 'contact',
                description: 'Complete contact with social links',
                data: {
                    title: 'Connect With Me',
                    email: 'your.email@example.com',
                    phone: '+1 (555) 123-4567',
                    website: 'www.yourwebsite.com',
                    linkedin: 'linkedin.com/in/yourprofile',
                    twitter: '@yourhandle',
                    showSocial: true
                }
            },
            
            // CTA TEMPLATES
            'cta-booking': {
                id: 'cta-booking',
                name: 'Booking CTA',
                category: 'call-to-action',
                component: 'call-to-action',
                description: 'Encourage event bookings',
                data: {
                    title: 'Ready to Transform Your Event?',
                    description: "Let's discuss how I can bring value to your audience.",
                    buttonText: 'Check Availability',
                    buttonUrl: '#booking',
                    style: 'centered'
                }
            },
            
            'cta-download': {
                id: 'cta-download',
                name: 'Download CTA',
                category: 'call-to-action',
                component: 'call-to-action',
                description: 'Offer a resource download',
                data: {
                    title: 'Free Resource',
                    description: 'Download my latest whitepaper on industry trends.',
                    buttonText: 'Download Now',
                    buttonUrl: '/downloads/whitepaper.pdf',
                    style: 'boxed'
                }
            },
            
            // TESTIMONIAL TEMPLATES
            'testimonials-single': {
                id: 'testimonials-single',
                name: 'Single Testimonial',
                category: 'testimonials',
                component: 'testimonials',
                description: 'Featured testimonial',
                data: {
                    title: 'What People Say',
                    testimonials: [
                        {
                            text: 'An incredible speaker who captivated our audience from start to finish. Highly recommended!',
                            author: 'Jane Smith',
                            role: 'Event Director',
                            company: 'Tech Conference 2024'
                        }
                    ],
                    displayStyle: 'featured'
                }
            },
            
            'testimonials-grid': {
                id: 'testimonials-grid',
                name: 'Testimonial Grid',
                category: 'testimonials',
                component: 'testimonials',
                description: 'Multiple testimonials in grid',
                data: {
                    title: 'Client Testimonials',
                    testimonials: [
                        {
                            text: 'Transformed our company culture with actionable insights.',
                            author: 'John Doe',
                            role: 'CEO',
                            company: 'Tech Corp'
                        },
                        {
                            text: 'The best keynote speaker we\'ve ever had at our conference.',
                            author: 'Sarah Johnson',
                            role: 'Event Manager',
                            company: 'Innovation Summit'
                        },
                        {
                            text: 'Practical advice that we implemented immediately.',
                            author: 'Mike Chen',
                            role: 'VP Operations',
                            company: 'Growth Co'
                        }
                    ],
                    displayStyle: 'grid'
                }
            },
            
            // COMPLETE MEDIA KIT TEMPLATES (Multiple Components)
            'kit-speaker': {
                id: 'kit-speaker',
                name: 'Professional Speaker Kit',
                category: 'complete-kit',
                description: 'Complete media kit for speakers',
                components: [
                    {
                        template: 'hero-speaker',
                        order: 0
                    },
                    {
                        template: 'bio-detailed',
                        order: 1
                    },
                    {
                        template: 'topics-speaker',
                        order: 2
                    },
                    {
                        template: 'testimonials-grid',
                        order: 3
                    },
                    {
                        template: 'cta-booking',
                        order: 4
                    },
                    {
                        template: 'contact-full',
                        order: 5
                    }
                ]
            },
            
            'kit-consultant': {
                id: 'kit-consultant',
                name: 'Consultant Media Kit',
                category: 'complete-kit',
                description: 'Professional kit for consultants',
                components: [
                    {
                        template: 'hero-minimal',
                        order: 0
                    },
                    {
                        template: 'bio-short',
                        order: 1
                    },
                    {
                        template: 'topics-expertise',
                        order: 2
                    },
                    {
                        template: 'testimonials-single',
                        order: 3
                    },
                    {
                        template: 'cta-download',
                        order: 4
                    },
                    {
                        template: 'contact-simple',
                        order: 5
                    }
                ]
            }
        };
    }
    
    organizeByCategory() {
        const categories = {};
        
        Object.values(this.templates).forEach(template => {
            const category = template.category || 'other';
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(template);
        });
        
        return categories;
    }
    
    getTemplate(id) {
        return this.templates[id];
    }
    
    getTemplatesByCategory(category) {
        return this.categories[category] || [];
    }
    
    getTemplatesForComponent(componentType) {
        return Object.values(this.templates).filter(
            template => template.component === componentType
        );
    }
    
    getAllCategories() {
        return Object.keys(this.categories);
    }
    
    applyTemplate(templateId, stateManager) {
        const template = this.getTemplate(templateId);
        if (!template) {
            console.error(`Template ${templateId} not found`);
            return null;
        }
        
        // Check if it's a complete kit or single component
        if (template.category === 'complete-kit') {
            return this.applyKitTemplate(template, stateManager);
        } else {
            return this.applyComponentTemplate(template, stateManager);
        }
    }
    
    applyComponentTemplate(template, stateManager) {
        const componentId = `${template.component}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const component = {
            id: componentId,
            type: template.component,
            data: { ...template.data },
            props: { ...template.data },
            template: template.id
        };
        
        // Add component to state
        stateManager.addComponent(component);
        
        console.log(`✅ Applied template: ${template.name}`);
        
        return componentId;
    }
    
    applyKitTemplate(kitTemplate, stateManager) {
        const addedComponents = [];
        
        // Clear existing components if requested
        if (confirm('This will replace all existing components. Continue?')) {
            stateManager.dispatch({ type: 'CLEAR_ALL_COMPONENTS' });
        } else {
            return null;
        }
        
        // Add each component from the kit
        kitTemplate.components.forEach(item => {
            const template = this.getTemplate(item.template);
            if (template) {
                const componentId = this.applyComponentTemplate(template, stateManager);
                addedComponents.push(componentId);
            }
        });
        
        console.log(`✅ Applied complete kit: ${kitTemplate.name}`);
        
        return addedComponents;
    }
    
    // Save custom template
    saveCustomTemplate(name, description, components, stateManager) {
        const customId = `custom_${Date.now()}`;
        
        const customTemplate = {
            id: customId,
            name: name,
            category: 'custom',
            description: description,
            components: components.map((comp, index) => ({
                type: comp.type,
                data: comp.data || comp.props,
                order: index
            }))
        };
        
        // Save to localStorage
        const savedTemplates = JSON.parse(localStorage.getItem('gmkb_custom_templates') || '{}');
        savedTemplates[customId] = customTemplate;
        localStorage.setItem('gmkb_custom_templates', JSON.stringify(savedTemplates));
        
        // Add to current templates
        this.templates[customId] = customTemplate;
        
        // Re-organize categories
        this.categories = this.organizeByCategory();
        
        console.log(`✅ Saved custom template: ${name}`);
        
        return customId;
    }
    
    loadCustomTemplates() {
        const savedTemplates = JSON.parse(localStorage.getItem('gmkb_custom_templates') || '{}');
        
        Object.entries(savedTemplates).forEach(([id, template]) => {
            this.templates[id] = template;
        });
        
        // Re-organize categories
        this.categories = this.organizeByCategory();
        
        console.log(`✅ Loaded ${Object.keys(savedTemplates).length} custom templates`);
    }
    
    deleteCustomTemplate(templateId) {
        if (!templateId.startsWith('custom_')) {
            console.error('Can only delete custom templates');
            return false;
        }
        
        // Remove from templates
        delete this.templates[templateId];
        
        // Remove from localStorage
        const savedTemplates = JSON.parse(localStorage.getItem('gmkb_custom_templates') || '{}');
        delete savedTemplates[templateId];
        localStorage.setItem('gmkb_custom_templates', JSON.stringify(savedTemplates));
        
        // Re-organize categories
        this.categories = this.organizeByCategory();
        
        console.log(`✅ Deleted template: ${templateId}`);
        
        return true;
    }
}

export default ComponentTemplates;
