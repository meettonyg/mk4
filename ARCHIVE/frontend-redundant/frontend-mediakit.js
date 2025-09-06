/**
 * Frontend Media Kit Display JavaScript
 * 
 * Minimal JavaScript for interactive elements on the frontend
 * No editing functionality - just display enhancements
 * 
 * @version 1.0.0
 * @package GMKB/Frontend
 */

(function() {
    'use strict';
    
    /**
     * Frontend Media Kit Handler
     */
    class GMKBFrontendDisplay {
        constructor() {
            this.mediaKitContainer = null;
            this.components = [];
            this.init();
        }
        
        /**
         * Initialize frontend display
         */
        init() {
            // Wait for DOM ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.onDOMReady());
            } else {
                this.onDOMReady();
            }
        }
        
        /**
         * Handle DOM ready
         */
        onDOMReady() {
            // Find media kit container
            this.mediaKitContainer = document.querySelector('.gmkb-media-kit-container');
            
            if (!this.mediaKitContainer) {
                console.warn('GMKB Frontend: No media kit container found');
                return;
            }
            
            // Get all components
            this.components = this.mediaKitContainer.querySelectorAll('.gmkb-component');
            
            // Initialize features
            this.initLazyLoading();
            this.initSmoothScrolling();
            this.initAnimations();
            this.initInteractiveElements();
            
            // Apply theme if saved
            this.applyTheme();
            
            console.log('GMKB Frontend: Initialized with ' + this.components.length + ' components');
        }
        
        /**
         * Initialize lazy loading for images
         */
        initLazyLoading() {
            if ('IntersectionObserver' in window) {
                const images = this.mediaKitContainer.querySelectorAll('img[data-src]');
                
                const imageObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            img.src = img.dataset.src;
                            img.classList.add('loaded');
                            observer.unobserve(img);
                        }
                    });
                });
                
                images.forEach(img => imageObserver.observe(img));
            }
        }
        
        /**
         * Initialize smooth scrolling for anchor links
         */
        initSmoothScrolling() {
            const links = this.mediaKitContainer.querySelectorAll('a[href^="#"]');
            
            links.forEach(link => {
                link.addEventListener('click', (e) => {
                    const targetId = link.getAttribute('href').slice(1);
                    const targetElement = document.getElementById(targetId);
                    
                    if (targetElement) {
                        e.preventDefault();
                        targetElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                });
            });
        }
        
        /**
         * Initialize scroll animations
         */
        initAnimations() {
            if ('IntersectionObserver' in window) {
                const animatedElements = this.mediaKitContainer.querySelectorAll('[data-animate]');
                
                const animationObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const element = entry.target;
                            const animation = element.dataset.animate || 'fade-in';
                            element.classList.add('animated', animation);
                        }
                    });
                }, {
                    threshold: 0.1
                });
                
                animatedElements.forEach(el => animationObserver.observe(el));
            }
        }
        
        /**
         * Initialize interactive elements
         */
        initInteractiveElements() {
            // Expandable biography sections
            this.initExpandableSections();
            
            // Topic hover effects
            this.initTopicInteractions();
            
            // Social link tracking
            this.initSocialTracking();
            
            // Contact form if present
            this.initContactForm();
        }
        
        /**
         * Initialize expandable biography sections
         */
        initExpandableSections() {
            const biographies = this.mediaKitContainer.querySelectorAll('.gmkb-component--biography');
            
            biographies.forEach(bio => {
                const longBio = bio.querySelector('.bio-long');
                const shortBio = bio.querySelector('.bio-short');
                
                if (longBio && shortBio) {
                    // Check if long bio is longer than threshold
                    if (longBio.textContent.length > 500) {
                        // Create read more button
                        const readMoreBtn = document.createElement('button');
                        readMoreBtn.className = 'gmkb-read-more';
                        readMoreBtn.textContent = 'Read More';
                        readMoreBtn.setAttribute('aria-expanded', 'false');
                        
                        // Initially hide long bio
                        longBio.style.display = 'none';
                        
                        // Insert button after short bio
                        shortBio.insertAdjacentElement('afterend', readMoreBtn);
                        
                        // Handle click
                        readMoreBtn.addEventListener('click', () => {
                            const isExpanded = readMoreBtn.getAttribute('aria-expanded') === 'true';
                            
                            if (isExpanded) {
                                longBio.style.display = 'none';
                                readMoreBtn.textContent = 'Read More';
                                readMoreBtn.setAttribute('aria-expanded', 'false');
                            } else {
                                longBio.style.display = 'block';
                                readMoreBtn.textContent = 'Read Less';
                                readMoreBtn.setAttribute('aria-expanded', 'true');
                            }
                        });
                    }
                }
            });
        }
        
        /**
         * Initialize topic interactions
         */
        initTopicInteractions() {
            const topicItems = this.mediaKitContainer.querySelectorAll('.topic-item');
            
            topicItems.forEach(topic => {
                // Add keyboard accessibility
                topic.setAttribute('tabindex', '0');
                
                // Handle keyboard interaction
                topic.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        topic.click();
                    }
                });
                
                // Optional: Add click handler for modal or expansion
                topic.addEventListener('click', () => {
                    // Could open a modal with more details
                    const title = topic.querySelector('.topic-title');
                    const description = topic.querySelector('.topic-description');
                    
                    if (title && description) {
                        // For now, just log
                        console.log('Topic clicked:', title.textContent);
                    }
                });
            });
        }
        
        /**
         * Initialize social link tracking
         */
        initSocialTracking() {
            const socialLinks = this.mediaKitContainer.querySelectorAll('.social-link');
            
            socialLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    const platform = link.dataset.platform || link.textContent;
                    
                    // Track with Google Analytics if available
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'social_click', {
                            'event_category': 'engagement',
                            'event_label': platform
                        });
                    }
                    
                    // Track with custom analytics
                    if (window.gmkbFrontend && window.gmkbFrontend.trackEvent) {
                        window.gmkbFrontend.trackEvent('social_click', { platform });
                    }
                });
            });
        }
        
        /**
         * Initialize contact form if present
         */
        initContactForm() {
            const contactForm = this.mediaKitContainer.querySelector('.gmkb-contact-form');
            
            if (contactForm) {
                contactForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    
                    // Get form data
                    const formData = new FormData(contactForm);
                    
                    // Show loading state
                    const submitBtn = contactForm.querySelector('[type="submit"]');
                    if (submitBtn) {
                        submitBtn.disabled = true;
                        submitBtn.textContent = 'Sending...';
                    }
                    
                    // Send via AJAX
                    fetch(window.gmkbFrontend.ajaxUrl, {
                        method: 'POST',
                        body: formData
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            // Show success message
                            this.showMessage('Thank you for your message!', 'success');
                            contactForm.reset();
                        } else {
                            // Show error message
                            this.showMessage('Sorry, there was an error. Please try again.', 'error');
                        }
                    })
                    .catch(error => {
                        console.error('Form submission error:', error);
                        this.showMessage('Sorry, there was an error. Please try again.', 'error');
                    })
                    .finally(() => {
                        if (submitBtn) {
                            submitBtn.disabled = false;
                            submitBtn.textContent = 'Send Message';
                        }
                    });
                });
            }
        }
        
        /**
         * Apply saved theme
         */
        applyTheme() {
            // Check if theme is specified
            const savedTheme = localStorage.getItem('gmkb_theme');
            
            if (savedTheme) {
                document.documentElement.setAttribute('data-gmkb-theme', savedTheme);
            }
            
            // Check for theme in media kit data
            if (window.gmkbFrontend && window.gmkbFrontend.theme) {
                document.documentElement.setAttribute('data-gmkb-theme', window.gmkbFrontend.theme);
            }
        }
        
        /**
         * Show message to user
         */
        showMessage(message, type = 'info') {
            // Create message element
            const messageEl = document.createElement('div');
            messageEl.className = `gmkb-message gmkb-message--${type}`;
            messageEl.textContent = message;
            
            // Add to container
            this.mediaKitContainer.insertAdjacentElement('afterbegin', messageEl);
            
            // Auto remove after 5 seconds
            setTimeout(() => {
                messageEl.style.opacity = '0';
                setTimeout(() => messageEl.remove(), 300);
            }, 5000);
        }
        
        /**
         * Handle print media
         */
        handlePrint() {
            window.addEventListener('beforeprint', () => {
                // Expand all collapsed sections
                const expandButtons = this.mediaKitContainer.querySelectorAll('.gmkb-read-more[aria-expanded="false"]');
                expandButtons.forEach(btn => btn.click());
                
                // Add print class
                document.body.classList.add('gmkb-printing');
            });
            
            window.addEventListener('afterprint', () => {
                // Remove print class
                document.body.classList.remove('gmkb-printing');
            });
        }
    }
    
    // Initialize when ready
    new GMKBFrontendDisplay();
    
    // Expose API for external use
    window.GMKBFrontend = window.GMKBFrontend || {};
    window.GMKBFrontend.Display = GMKBFrontendDisplay;
    
})();

/**
 * Animation CSS (inject if not present)
 */
(function() {
    'use strict';
    
    // Check if animation styles exist
    if (!document.querySelector('#gmkb-frontend-animations')) {
        const style = document.createElement('style');
        style.id = 'gmkb-frontend-animations';
        style.textContent = `
            /* Fade In Animation */
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .animated.fade-in {
                animation: fadeIn 0.6s ease-out forwards;
            }
            
            /* Slide In Animations */
            @keyframes slideInLeft {
                from { opacity: 0; transform: translateX(-50px); }
                to { opacity: 1; transform: translateX(0); }
            }
            
            @keyframes slideInRight {
                from { opacity: 0; transform: translateX(50px); }
                to { opacity: 1; transform: translateX(0); }
            }
            
            .animated.slide-in-left {
                animation: slideInLeft 0.6s ease-out forwards;
            }
            
            .animated.slide-in-right {
                animation: slideInRight 0.6s ease-out forwards;
            }
            
            /* Scale In Animation */
            @keyframes scaleIn {
                from { opacity: 0; transform: scale(0.9); }
                to { opacity: 1; transform: scale(1); }
            }
            
            .animated.scale-in {
                animation: scaleIn 0.5s ease-out forwards;
            }
            
            /* Read More Button Styles */
            .gmkb-read-more {
                margin-top: 16px;
                padding: 8px 20px;
                background: var(--gmkb-color-primary, #295cff);
                color: white;
                border: none;
                border-radius: var(--gmkb-border-radius, 8px);
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .gmkb-read-more:hover {
                background: var(--gmkb-color-accent, #295cff);
                transform: translateY(-2px);
            }
            
            /* Message Styles */
            .gmkb-message {
                padding: 16px 24px;
                margin-bottom: 20px;
                border-radius: var(--gmkb-border-radius, 8px);
                font-size: 16px;
                font-weight: 500;
                transition: opacity 0.3s ease;
            }
            
            .gmkb-message--success {
                background: #10b981;
                color: white;
            }
            
            .gmkb-message--error {
                background: #ef4444;
                color: white;
            }
            
            .gmkb-message--info {
                background: #3b82f6;
                color: white;
            }
            
            /* Print Styles */
            .gmkb-printing .gmkb-read-more {
                display: none;
            }
            
            /* Image Loading */
            img.loaded {
                animation: fadeIn 0.5s ease-out;
            }
        `;
        document.head.appendChild(style);
    }
})();
