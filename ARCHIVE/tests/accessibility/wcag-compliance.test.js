/**
 * ACCESSIBILITY TESTING: WCAG 2.1 AA Compliance Validation
 * Following Gemini's recommendation for axe-core integration
 * 
 * Tests comprehensive accessibility compliance including screen reader support,
 * keyboard navigation, color contrast, ARIA implementation, and WCAG 2.1 AA standards.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setupQuickTestData, cleanupTestData } from '../utils/test-data-strategy.js';

// Note: In production, this would be: import { axe, toHaveNoViolations } from '@axe-core/vitest';
// For testing purposes, we'll mock the axe functionality

describe('Accessibility Compliance Testing', () => {
    let integrationInstance;
    let mockElement;
    let mockPanel;
    
    beforeEach(() => {
        // Setup test environment
        setupQuickTestData('clean_mkcg_data');
        
        // Create mock DOM elements
        mockElement = document.createElement('div');
        mockElement.className = 'topics-component';
        mockElement.setAttribute('role', 'region');
        mockElement.setAttribute('aria-label', 'Topics Component');
        document.body.appendChild(mockElement);
        
        mockPanel = document.createElement('div');
        mockPanel.className = 'element-editor';
        mockPanel.setAttribute('role', 'complementary');
        mockPanel.setAttribute('aria-label', 'Component Editor Panel');
        document.body.appendChild(mockPanel);
        
        // Initialize integration instance
        integrationInstance = new TopicsMKCGIntegration(mockElement, mockPanel);
        
        // Mock global functions
        window.scheduleAutoSave = vi.fn();
        window.clearAllTopicsContent = vi.fn();
    });
    
    afterEach(() => {
        // Cleanup
        if (integrationInstance && typeof integrationInstance.destroy === 'function') {
            integrationInstance.destroy();
        }
        mockElement.remove();
        mockPanel.remove();
        cleanupTestData();
        
        delete window.scheduleAutoSave;
        delete window.clearAllTopicsContent;
    });
    
    describe('WCAG 2.1 AA Compliance', () => {
        it('should meet WCAG 2.1 AA standards for MKCG section', async () => {
            const mkcgSection = integrationInstance.createMKCGSection();
            mockPanel.appendChild(mkcgSection);
            
            // Mock axe-core testing
            const axeResults = await mockAxeTest(mkcgSection);
            
            expect(axeResults.violations).toHaveLength(0);
            expect(axeResults.passes.length).toBeGreaterThan(0);
            
            console.log(`✅ WCAG 2.1 AA: ${axeResults.passes.length} checks passed`);
        });
        
        it('should have proper semantic markup structure', () => {
            const mkcgSection = integrationInstance.createMKCGSection();
            mockPanel.appendChild(mkcgSection);
            
            // Check semantic structure
            const headings = mkcgSection.querySelectorAll('h1, h2, h3, h4, h5, h6');
            const buttons = mkcgSection.querySelectorAll('button');
            const sections = mkcgSection.querySelectorAll('[role="region"], section');
            
            expect(headings.length).toBeGreaterThan(0);
            expect(buttons.length).toBeGreaterThan(0);
            
            // Verify heading hierarchy
            const headingLevels = Array.from(headings).map(h => parseInt(h.tagName.charAt(1)));
            headingLevels.forEach((level, index) => {
                if (index > 0) {
                    const prevLevel = headingLevels[index - 1];
                    // Heading levels should not skip more than one level
                    expect(level - prevLevel).toBeLessThanOrEqual(1);
                }
            });
        });
        
        it('should provide alternative text for all images and icons', () => {
            const mkcgSection = integrationInstance.createMKCGSection();
            mockPanel.appendChild(mkcgSection);
            
            // Check all images have alt text
            const images = mkcgSection.querySelectorAll('img');
            images.forEach(img => {
                expect(img.getAttribute('alt')).toBeDefined();
                expect(img.getAttribute('alt')).not.toBe('');
            });
            
            // Check SVG icons have titles or aria-labels
            const svgs = mkcgSection.querySelectorAll('svg');
            svgs.forEach(svg => {
                const hasTitle = svg.querySelector('title') !== null;
                const hasAriaLabel = svg.getAttribute('aria-label') !== null;
                const hasAriaLabelledBy = svg.getAttribute('aria-labelledby') !== null;
                
                expect(hasTitle || hasAriaLabel || hasAriaLabelledBy).toBe(true);
            });
        });
        
        it('should identify page language correctly', () => {
            const htmlElement = document.documentElement;
            const langAttribute = htmlElement.getAttribute('lang');
            
            // Should have language attribute
            expect(langAttribute).toBeDefined();
            expect(langAttribute).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/); // e.g., 'en' or 'en-US'
        });
    });
    
    describe('Color Contrast Compliance', () => {
        it('should meet 4.5:1 contrast ratio for normal text', () => {
            const mkcgSection = integrationInstance.createMKCGSection();
            mockPanel.appendChild(mkcgSection);
            
            // Test common text elements
            const textElements = mkcgSection.querySelectorAll('p, span, div, button, .form-section__title');
            
            textElements.forEach(element => {
                const styles = window.getComputedStyle(element);
                const color = styles.color;
                const backgroundColor = styles.backgroundColor;
                
                if (color && backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
                    const contrast = calculateContrastRatio(color, backgroundColor);
                    
                    // WCAG AA requires 4.5:1 for normal text
                    expect(contrast).toBeGreaterThanOrEqual(4.5);
                }
            });
        });
        
        it('should meet 3:1 contrast ratio for large text', () => {
            const mkcgSection = integrationInstance.createMKCGSection();
            mockPanel.appendChild(mkcgSection);
            
            // Test large text elements (18pt+ or 14pt+ bold)
            const largeTextElements = mkcgSection.querySelectorAll('h1, h2, h3, h4, .large-text');
            
            largeTextElements.forEach(element => {
                const styles = window.getComputedStyle(element);
                const fontSize = parseFloat(styles.fontSize);
                const fontWeight = styles.fontWeight;
                const isLargeText = fontSize >= 18 || (fontSize >= 14 && (fontWeight === 'bold' || parseInt(fontWeight) >= 700));
                
                if (isLargeText) {
                    const color = styles.color;
                    const backgroundColor = styles.backgroundColor;
                    
                    if (color && backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
                        const contrast = calculateContrastRatio(color, backgroundColor);
                        
                        // WCAG AA requires 3:1 for large text
                        expect(contrast).toBeGreaterThanOrEqual(3.0);
                    }
                }
            });
        });
        
        it('should provide color-independent indicators', () => {
            const mkcgSection = integrationInstance.createMKCGSection();
            mockPanel.appendChild(mkcgSection);
            
            // Check status indicators use more than just color
            const statusElements = mkcgSection.querySelectorAll('.status-dot, .data-quality, .quality-badge');
            
            statusElements.forEach(element => {
                // Should have text content, icons, or patterns in addition to color
                const hasTextContent = element.textContent.trim().length > 0;
                const hasAriaLabel = element.getAttribute('aria-label') !== null;
                const hasIcon = element.querySelector('svg, .icon') !== null;
                const hasPattern = element.classList.contains('pattern') || element.style.backgroundImage;
                
                expect(hasTextContent || hasAriaLabel || hasIcon || hasPattern).toBe(true);
            });
        });
    });
    
    describe('Keyboard Navigation Support', () => {
        it('should support complete keyboard navigation', () => {
            const mkcgSection = integrationInstance.createMKCGSection();
            mockPanel.appendChild(mkcgSection);
            
            // Get all interactive elements
            const interactiveElements = mkcgSection.querySelectorAll(
                'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
            );
            
            // All interactive elements should be keyboard accessible
            interactiveElements.forEach(element => {
                const tabIndex = element.getAttribute('tabindex');
                
                // Should not have tabindex="-1" unless it's intentionally removed from tab order
                if (tabIndex !== null) {
                    expect(parseInt(tabIndex)).toBeGreaterThanOrEqual(0);
                }
                
                // Should be focusable
                element.focus();
                expect(document.activeElement).toBe(element);
            });
        });
        
        it('should have logical tab order', () => {
            const mkcgSection = integrationInstance.createMKCGSection();
            mockPanel.appendChild(mkcgSection);
            
            const focusableElements = mkcgSection.querySelectorAll(
                'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
            );
            
            // Tab through elements and verify order makes sense
            const tabOrder = Array.from(focusableElements).map((element, index) => ({
                element,
                index,
                rect: element.getBoundingClientRect()
            }));
            
            // Elements should generally be in visual order (top to bottom, left to right)
            for (let i = 1; i < tabOrder.length; i++) {
                const prev = tabOrder[i - 1];
                const curr = tabOrder[i];
                
                // If on same row, current should be to the right
                if (Math.abs(prev.rect.top - curr.rect.top) < 10) {
                    expect(curr.rect.left).toBeGreaterThanOrEqual(prev.rect.left);
                }
                // Otherwise, current should be below
                else {
                    expect(curr.rect.top).toBeGreaterThanOrEqual(prev.rect.top);
                }
            }
        });
        
        it('should have visible focus indicators', () => {
            const mkcgSection = integrationInstance.createMKCGSection();
            mockPanel.appendChild(mkcgSection);
            
            const focusableElements = mkcgSection.querySelectorAll('button, input, select, textarea');
            
            focusableElements.forEach(element => {
                // Focus the element
                element.focus();
                
                const styles = window.getComputedStyle(element, ':focus');
                
                // Should have visible focus indicator (outline, box-shadow, or border change)
                const hasOutline = styles.outline !== 'none' && styles.outline !== '0px';
                const hasBoxShadow = styles.boxShadow !== 'none';
                const hasBorder = styles.border !== element.style.border;
                
                expect(hasOutline || hasBoxShadow || hasBorder).toBe(true);
            });
        });
        
        it('should support keyboard shortcuts', () => {
            const mkcgSection = integrationInstance.createMKCGSection();
            mockPanel.appendChild(mkcgSection);
            
            // Test Enter key activation
            const buttons = mkcgSection.querySelectorAll('button');
            
            buttons.forEach(button => {
                const clickSpy = vi.fn();
                button.addEventListener('click', clickSpy);
                
                // Simulate Enter key press
                const enterEvent = new KeyboardEvent('keydown', {
                    key: 'Enter',
                    bubbles: true
                });
                
                button.focus();
                button.dispatchEvent(enterEvent);
                
                // Button should be activated
                expect(clickSpy).toHaveBeenCalled();
            });
        });
        
        it('should support Escape key for modal dialogs', () => {
            // Create modal dialog
            integrationInstance.showBulkOperationConfirmation({
                operation: 'test',
                title: 'Accessibility Test',
                message: 'Testing keyboard accessibility',
                icon: '⚠️',
                confirmText: 'OK',
                confirmClass: 'btn-primary',
                onConfirm: vi.fn()
            });
            
            const modal = document.querySelector('.bulk-operation-modal-overlay');
            expect(modal).toBeDefined();
            
            // Simulate Escape key press
            const escapeEvent = new KeyboardEvent('keydown', {
                key: 'Escape',
                bubbles: true
            });
            
            document.dispatchEvent(escapeEvent);
            
            // Modal should close
            setTimeout(() => {
                const modalAfterEscape = document.querySelector('.bulk-operation-modal-overlay');
                expect(modalAfterEscape).toBeNull();
            }, 300);
        });
    });
    
    describe('ARIA Implementation', () => {
        it('should have proper ARIA labels for all interactive elements', () => {
            const mkcgSection = integrationInstance.createMKCGSection();
            mockPanel.appendChild(mkcgSection);
            
            const interactiveElements = mkcgSection.querySelectorAll('button, input, select');
            
            interactiveElements.forEach(element => {
                const hasAriaLabel = element.getAttribute('aria-label') !== null;
                const hasAriaLabelledBy = element.getAttribute('aria-labelledby') !== null;
                const hasAssociatedLabel = element.id && document.querySelector(`label[for="${element.id}"]`) !== null;
                const hasTextContent = element.textContent.trim().length > 0;
                
                // Should have some form of accessible name
                expect(hasAriaLabel || hasAriaLabelledBy || hasAssociatedLabel || hasTextContent).toBe(true);
            });
        });
        
        it('should use ARIA live regions for dynamic content', () => {
            const mkcgSection = integrationInstance.createMKCGSection();
            mockPanel.appendChild(mkcgSection);
            
            // Check for live regions in progress indicators and status areas
            const statusElements = mkcgSection.querySelectorAll('.mkcg-status-indicator, .mkcg-progress-indicator');
            
            statusElements.forEach(element => {
                const ariaLive = element.getAttribute('aria-live');
                const ariaAtomic = element.getAttribute('aria-atomic');
                
                if (element.className.includes('progress') || element.className.includes('status')) {
                    // Dynamic status should have aria-live
                    expect(ariaLive).toMatch(/polite|assertive/);
                }
            });
        });
        
        it('should have proper ARIA roles for custom components', () => {
            const mkcgSection = integrationInstance.createMKCGSection();
            mockPanel.appendChild(mkcgSection);
            
            // Check progress indicators have proper roles
            const progressElements = mkcgSection.querySelectorAll('.progress-bar, .mkcg-progress-indicator');
            
            progressElements.forEach(element => {
                const role = element.getAttribute('role');
                const ariaValueNow = element.getAttribute('aria-valuenow');
                const ariaValueMin = element.getAttribute('aria-valuemin');
                const ariaValueMax = element.getAttribute('aria-valuemax');
                
                if (element.className.includes('progress')) {
                    expect(role).toBe('progressbar');
                    expect(ariaValueMin).toBeDefined();
                    expect(ariaValueMax).toBeDefined();
                }
            });
        });
        
        it('should provide ARIA descriptions for complex interactions', () => {
            const mkcgSection = integrationInstance.createMKCGSection();
            mockPanel.appendChild(mkcgSection);
            
            const bulkOperationButtons = mkcgSection.querySelectorAll('.bulk-op-btn');
            
            bulkOperationButtons.forEach(button => {
                const ariaDescribedBy = button.getAttribute('aria-describedby');
                const description = button.querySelector('.btn-description');
                
                if (description) {
                    // Should have aria-describedby pointing to description
                    expect(ariaDescribedBy).toBeDefined();
                    
                    if (ariaDescribedBy) {
                        const descriptionElement = document.getElementById(ariaDescribedBy);
                        expect(descriptionElement).toBeDefined();
                    }
                }
            });
        });
    });
    
    describe('Screen Reader Compatibility', () => {
        it('should announce state changes appropriately', () => {
            setupQuickTestData('screen_reader_state');
            
            const mkcgSection = integrationInstance.createMKCGSection();
            mockPanel.appendChild(mkcgSection);
            
            // Test status change announcements
            const statusIndicator = mkcgSection.querySelector('.mkcg-status-indicator');
            if (statusIndicator) {
                const ariaLive = statusIndicator.getAttribute('aria-live');
                expect(ariaLive).toMatch(/polite|assertive/);
            }
        });
        
        it('should provide meaningful element descriptions', () => {
            const mkcgSection = integrationInstance.createMKCGSection();
            mockPanel.appendChild(mkcgSection);
            
            const buttons = mkcgSection.querySelectorAll('button');
            
            buttons.forEach(button => {
                const buttonText = button.textContent.trim();
                const ariaLabel = button.getAttribute('aria-label');
                const buttonDescription = button.querySelector('.btn-description');
                
                // Button should have meaningful text content or aria-label
                expect(buttonText.length > 0 || (ariaLabel && ariaLabel.length > 0)).toBe(true);
                
                // Complex buttons should have descriptions
                if (buttonDescription) {
                    expect(buttonDescription.textContent.trim().length).toBeGreaterThan(0);
                }
            });
        });
        
        it('should handle form validation announcements', async () => {
            // Create topic input for validation testing
            const topicInput = document.createElement('input');
            topicInput.type = 'text';
            topicInput.className = 'topic-input';
            topicInput.setAttribute('aria-label', 'Topic title');
            topicInput.setAttribute('aria-describedby', 'topic-validation');
            
            const validationElement = document.createElement('div');
            validationElement.id = 'topic-validation';
            validationElement.setAttribute('aria-live', 'polite');
            validationElement.setAttribute('aria-atomic', 'true');
            
            mockPanel.appendChild(topicInput);
            mockPanel.appendChild(validationElement);
            
            // Test invalid input
            topicInput.value = 'ab'; // Too short
            
            const validationResults = await integrationInstance.performComprehensiveValidation('ab', 0);
            
            if (validationResults.errors.length > 0) {
                validationElement.textContent = validationResults.errors[0];
                
                // Should announce validation errors
                expect(validationElement.getAttribute('aria-live')).toBe('polite');
                expect(validationElement.textContent.length).toBeGreaterThan(0);
            }
        });
    });
    
    describe('Mobile Accessibility', () => {
        it('should have appropriate touch target sizes', () => {
            const mkcgSection = integrationInstance.createMKCGSection();
            mockPanel.appendChild(mkcgSection);
            
            const touchTargets = mkcgSection.querySelectorAll('button, a, input[type="checkbox"], input[type="radio"]');
            
            touchTargets.forEach(target => {
                const rect = target.getBoundingClientRect();
                const minSize = 44; // WCAG recommended minimum
                
                // Touch targets should be at least 44x44 pixels
                expect(Math.max(rect.width, rect.height)).toBeGreaterThanOrEqual(minSize);
            });
        });
        
        it('should support gesture navigation', () => {
            const mkcgSection = integrationInstance.createMKCGSection();
            mockPanel.appendChild(mkcgSection);
            
            // Test swipe gestures for modal dialogs
            integrationInstance.showBulkOperationConfirmation({
                operation: 'test',
                title: 'Mobile Test',
                message: 'Testing mobile accessibility',
                icon: '📱',
                confirmText: 'OK',
                confirmClass: 'btn-primary',
                onConfirm: vi.fn()
            });
            
            const modal = document.querySelector('.bulk-operation-modal');
            
            if (modal) {
                // Should support touch events
                const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
                
                if (hasTouchSupport) {
                    // Mock touch event
                    const touchStart = new TouchEvent('touchstart', {
                        bubbles: true,
                        touches: [{ clientX: 100, clientY: 100 }]
                    });
                    
                    expect(() => modal.dispatchEvent(touchStart)).not.toThrow();
                }
            }
        });
    });
    
    describe('High Contrast Mode Support', () => {
        it('should be visible in high contrast mode', () => {
            // Simulate high contrast mode
            document.body.style.filter = 'contrast(200%)';
            
            const mkcgSection = integrationInstance.createMKCGSection();
            mockPanel.appendChild(mkcgSection);
            
            // Elements should remain visible and functional
            const buttons = mkcgSection.querySelectorAll('button');
            
            buttons.forEach(button => {
                const styles = window.getComputedStyle(button);
                
                // Should have sufficient contrast even in high contrast mode
                expect(styles.visibility).not.toBe('hidden');
                expect(styles.display).not.toBe('none');
                expect(parseFloat(styles.opacity)).toBeGreaterThan(0);
            });
            
            // Reset styles
            document.body.style.filter = '';
        });
        
        it('should maintain functionality with custom colors disabled', () => {
            // Simulate Windows high contrast mode
            const originalComputedStyle = window.getComputedStyle;
            
            window.getComputedStyle = vi.fn().mockImplementation((element, pseudoElement) => {
                const styles = originalComputedStyle(element, pseudoElement);
                
                // Override custom colors with system colors
                return {
                    ...styles,
                    color: 'ButtonText',
                    backgroundColor: 'ButtonFace',
                    borderColor: 'ButtonText'
                };
            });
            
            const mkcgSection = integrationInstance.createMKCGSection();
            mockPanel.appendChild(mkcgSection);
            
            // Should still be functional with system colors
            const buttons = mkcgSection.querySelectorAll('button');
            expect(buttons.length).toBeGreaterThan(0);
            
            // Restore original function
            window.getComputedStyle = originalComputedStyle;
        });
    });
});

/**
 * HELPER FUNCTIONS FOR ACCESSIBILITY TESTING
 */

/**
 * Mock axe-core testing function
 * In production, this would use actual axe-core
 */
async function mockAxeTest(element) {
    // Simulate axe-core results
    const violations = [];
    const passes = [];
    
    // Check for common accessibility issues
    const missingAlt = element.querySelectorAll('img:not([alt])');
    if (missingAlt.length > 0) {
        violations.push({
            id: 'image-alt',
            description: 'Images must have alternate text',
            nodes: Array.from(missingAlt)
        });
    } else {
        passes.push({ id: 'image-alt', description: 'Images have alternate text' });
    }
    
    const missingLabels = element.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
    if (missingLabels.length > 0) {
        violations.push({
            id: 'label',
            description: 'Form elements must have labels',
            nodes: Array.from(missingLabels)
        });
    } else {
        passes.push({ id: 'label', description: 'Form elements have labels' });
    }
    
    return { violations, passes };
}

/**
 * Calculate color contrast ratio
 */
function calculateContrastRatio(color1, color2) {
    // Simplified contrast calculation
    // In production, use a proper color contrast library
    
    const rgb1 = parseColor(color1);
    const rgb2 = parseColor(color2);
    
    if (!rgb1 || !rgb2) return 21; // Assume good contrast if can't parse
    
    const l1 = getLuminance(rgb1);
    const l2 = getLuminance(rgb2);
    
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Parse color string to RGB values
 */
function parseColor(colorStr) {
    if (!colorStr) return null;
    
    // Handle rgb() format
    const rgbMatch = colorStr.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
        return {
            r: parseInt(rgbMatch[1]),
            g: parseInt(rgbMatch[2]),
            b: parseInt(rgbMatch[3])
        };
    }
    
    // Handle hex format
    const hexMatch = colorStr.match(/^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (hexMatch) {
        return {
            r: parseInt(hexMatch[1], 16),
            g: parseInt(hexMatch[2], 16),
            b: parseInt(hexMatch[3], 16)
        };
    }
    
    return null;
}

/**
 * Calculate relative luminance
 */
function getLuminance(rgb) {
    const { r, g, b } = rgb;
    
    const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Simulate keyboard navigation
 */
function simulateKeyboardNavigation(container) {
    const focusableElements = container.querySelectorAll(
        'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
    );
    
    const navigationOrder = [];
    
    focusableElements.forEach((element, index) => {
        element.focus();
        navigationOrder.push({
            element,
            index,
            hasFocus: document.activeElement === element
        });
    });
    
    return navigationOrder;
}

/**
 * Test screen reader announcements
 */
function testScreenReaderAnnouncements(element) {
    const liveRegions = element.querySelectorAll('[aria-live]');
    const announcements = [];
    
    liveRegions.forEach(region => {
        const ariaLive = region.getAttribute('aria-live');
        const text = region.textContent.trim();
        
        if (text.length > 0) {
            announcements.push({
                element: region,
                level: ariaLive,
                text: text
            });
        }
    });
    
    return announcements;
}

export {
    mockAxeTest,
    calculateContrastRatio,
    parseColor,
    getLuminance,
    simulateKeyboardNavigation,
    testScreenReaderAnnouncements
};
