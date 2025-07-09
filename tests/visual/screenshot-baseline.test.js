/**
 * VISUAL REGRESSION TESTING: Screenshot Baseline & Comparison Framework
 * Following Gemini's recommendation for comprehensive visual testing
 * 
 * Tests visual consistency of MKCG Topics Integration across browsers,
 * states, and responsive breakpoints with pixel-perfect comparisons.
 */

import { test, expect } from '@playwright/test';

test.describe('Visual Regression Testing - MKCG Topics Integration', () => {
    
    test.beforeEach(async ({ page }) => {
        // Navigate to test page
        await page.goto('/media-kit-builder?post_id=123');
        
        // Wait for component initialization
        await page.waitForSelector('.topics-component', { timeout: 10000 });
        await page.waitForSelector('.element-editor', { timeout: 5000 });
        
        // Inject consistent test MKCG data for visual testing
        await page.evaluate(() => {
            window.guestifyData = {
                mkcgData: {
                    topics: {
                        topics: {
                            topic_1: 'Visual Test Topic One',
                            topic_2: 'Visual Test Topic Two', 
                            topic_3: 'Visual Test Topic Three',
                            topic_4: 'Visual Test Topic Four',
                            topic_5: 'Visual Test Topic Five'
                        },
                        meta: {
                            generated_date: '2024-01-15T10:30:00Z',
                            quality_score: 85,
                            data_source: 'ai_generated'
                        }
                    }
                },
                postId: 123,
                ajaxUrl: '/wp-admin/admin-ajax.php',
                nonce: 'visual_test_nonce'
            };
        });
        
        // Initialize integration
        await page.evaluate(() => {
            const topicsElement = document.querySelector('.topics-component');
            const panelElement = document.querySelector('.element-editor');
            
            if (topicsElement && panelElement && typeof TopicsMKCGIntegration !== 'undefined') {
                window.testIntegration = new TopicsMKCGIntegration(topicsElement, panelElement);
                return window.testIntegration.init();
            }
        });
        
        // Wait for stable layout
        await page.waitForTimeout(2000);
        
        // Disable animations for consistent screenshots
        await page.addStyleTag({
            content: `
                *, *::before, *::after {
                    animation-duration: 0s !important;
                    animation-delay: 0s !important;
                    transition-duration: 0s !important;
                    transition-delay: 0s !important;
                }
            `
        });
    });
    
    test.describe('Component State Screenshots', () => {
        test('should capture MKCG section default state', async ({ page, browserName }) => {
            const mkcgSection = page.locator('#topics-mkcg-section');
            await expect(mkcgSection).toBeVisible();
            
            // Ensure consistent state
            await page.evaluate(() => {
                if (window.testIntegration) {
                    window.testIntegration.updateDataQualityDisplay();
                }
            });
            
            // Take screenshot of MKCG section
            await expect(mkcgSection).toHaveScreenshot(`mkcg-section-default-${browserName}.png`, {
                threshold: 0.2, // Allow 20% difference
                animations: 'disabled'
            });
            
            console.log(`📸 ${browserName}: MKCG section default state captured`);
        });
        
        test('should capture progress indicator states', async ({ page, browserName }) => {
            // Create progress indicator
            await page.evaluate(() => {
                if (window.testIntegration) {
                    window.testIntegration.updateBulkOperationProgress(0, 'Starting operation...');
                }
            });
            
            const progressIndicator = page.locator('.mkcg-progress-indicator');
            
            if (await progressIndicator.count() > 0) {
                // Test different progress states
                const progressStates = [0, 25, 50, 75, 100];
                
                for (const progress of progressStates) {
                    await page.evaluate((prog) => {
                        if (window.testIntegration) {
                            window.testIntegration.updateBulkOperationProgress(prog, `Progress: ${prog}%`);
                        }
                    }, progress);
                    
                    await page.waitForTimeout(500);
                    
                    await expect(progressIndicator).toHaveScreenshot(`progress-${progress}-percent-${browserName}.png`, {
                        threshold: 0.3,
                        animations: 'disabled'
                    });
                }
            }
            
            console.log(`📸 ${browserName}: Progress indicator states captured`);
        });
        
        test('should capture modal dialog states', async ({ page, browserName }) => {
            // Trigger modal dialog
            await page.evaluate(() => {
                if (window.testIntegration) {
                    window.testIntegration.showBulkOperationConfirmation({
                        operation: 'clear_all',
                        title: 'Visual Test Confirmation',
                        message: 'This is a visual regression test for modal dialogs.',
                        icon: '⚠️',
                        confirmText: 'Confirm Action',
                        confirmClass: 'btn-primary',
                        onConfirm: () => {}
                    });
                }
            });
            
            const modal = page.locator('.bulk-operation-modal-overlay');
            await expect(modal).toBeVisible();
            
            // Capture modal dialog
            await expect(modal).toHaveScreenshot(`modal-dialog-${browserName}.png`, {
                threshold: 0.2,
                animations: 'disabled'
            });
            
            // Capture just the modal content
            const modalContent = modal.locator('.bulk-operation-modal');
            await expect(modalContent).toHaveScreenshot(`modal-content-${browserName}.png`, {
                threshold: 0.2,
                animations: 'disabled'
            });
            
            // Close modal for cleanup
            const cancelButton = modal.locator('.btn-secondary');
            if (await cancelButton.count() > 0) {
                await cancelButton.click();
            }
            
            console.log(`📸 ${browserName}: Modal dialog states captured`);
        });
        
        test('should capture validation error states', async ({ page, browserName }) => {
            // Create validation error scenario
            const validationResult = await page.evaluate(async () => {
                if (window.testIntegration) {
                    // Test with invalid topic to trigger validation errors
                    return await window.testIntegration.performComprehensiveValidation('', 0);
                }
                return null;
            });
            
            if (validationResult) {
                // Update UI with validation feedback
                await page.evaluate((result) => {
                    if (window.testIntegration && result.errors.length > 0) {
                        window.testIntegration.updateValidationFeedback(0, {
                            errors: result.errors,
                            warnings: result.warnings,
                            quality: result.quality
                        });
                    }
                }, validationResult);
                
                // Wait for validation UI to update
                await page.waitForTimeout(1000);
                
                const mkcgSection = page.locator('#topics-mkcg-section');
                await expect(mkcgSection).toHaveScreenshot(`validation-errors-${browserName}.png`, {
                    threshold: 0.3,
                    animations: 'disabled'
                });
            }
            
            console.log(`📸 ${browserName}: Validation error states captured`);
        });
        
        test('should capture quality indicator states', async ({ page, browserName }) => {
            // Test different quality scores
            const qualityScores = [100, 85, 60, 35, 10];
            
            for (const score of qualityScores) {
                await page.evaluate((quality) => {
                    if (window.testIntegration) {
                        // Update quality display
                        const qualityElement = document.querySelector('.data-quality');
                        if (qualityElement) {
                            qualityElement.textContent = `${quality}%`;
                            qualityElement.className = `data-quality quality-${quality >= 80 ? 'excellent' : quality >= 60 ? 'good' : quality >= 40 ? 'fair' : 'poor'}`;
                        }
                    }
                }, score);
                
                await page.waitForTimeout(300);
                
                const qualityIndicator = page.locator('.data-quality');
                if (await qualityIndicator.count() > 0) {
                    await expect(qualityIndicator).toHaveScreenshot(`quality-${score}-percent-${browserName}.png`, {
                        threshold: 0.2,
                        animations: 'disabled'
                    });
                }
            }
            
            console.log(`📸 ${browserName}: Quality indicator states captured`);
        });
    });
    
    test.describe('Responsive Design Screenshots', () => {
        const breakpoints = [
            { name: 'mobile', width: 375, height: 667 },
            { name: 'tablet', width: 768, height: 1024 },
            { name: 'desktop', width: 1280, height: 720 },
            { name: 'large', width: 1920, height: 1080 }
        ];
        
        breakpoints.forEach(({ name, width, height }) => {
            test(`should capture ${name} layout (${width}x${height})`, async ({ page, browserName }) => {
                await page.setViewportSize({ width, height });
                await page.waitForTimeout(1000); // Allow reflow
                
                const mkcgSection = page.locator('#topics-mkcg-section');
                await expect(mkcgSection).toBeVisible();
                
                // Capture full section at this breakpoint
                await expect(mkcgSection).toHaveScreenshot(`responsive-${name}-${width}x${height}-${browserName}.png`, {
                    threshold: 0.3,
                    animations: 'disabled'
                });
                
                // Capture button layout specifically for mobile/tablet
                if (name === 'mobile' || name === 'tablet') {
                    const buttonContainer = mkcgSection.locator('.mkcg-controls');
                    if (await buttonContainer.count() > 0) {
                        await expect(buttonContainer).toHaveScreenshot(`buttons-${name}-${browserName}.png`, {
                            threshold: 0.3,
                            animations: 'disabled'
                        });
                    }
                }
                
                console.log(`📸 ${browserName}: ${name} layout (${width}x${height}) captured`);
            });
        });
    });
    
    test.describe('Theme and Color Scheme Screenshots', () => {
        test('should capture light theme appearance', async ({ page, browserName }) => {
            // Ensure light theme
            await page.evaluate(() => {
                document.documentElement.setAttribute('data-theme', 'light');
                document.body.classList.remove('dark-theme');
                document.body.classList.add('light-theme');
            });
            
            await page.waitForTimeout(500);
            
            const mkcgSection = page.locator('#topics-mkcg-section');
            await expect(mkcgSection).toHaveScreenshot(`theme-light-${browserName}.png`, {
                threshold: 0.2,
                animations: 'disabled'
            });
            
            console.log(`📸 ${browserName}: Light theme captured`);
        });
        
        test('should capture dark theme appearance', async ({ page, browserName }) => {
            // Apply dark theme
            await page.evaluate(() => {
                document.documentElement.setAttribute('data-theme', 'dark');
                document.body.classList.remove('light-theme');
                document.body.classList.add('dark-theme');
            });
            
            await page.waitForTimeout(500);
            
            const mkcgSection = page.locator('#topics-mkcg-section');
            await expect(mkcgSection).toHaveScreenshot(`theme-dark-${browserName}.png`, {
                threshold: 0.2,
                animations: 'disabled'
            });
            
            console.log(`📸 ${browserName}: Dark theme captured`);
        });
        
        test('should capture high contrast mode', async ({ page, browserName }) => {
            // Apply high contrast styles
            await page.addStyleTag({
                content: `
                    .mkcg-integration-section {
                        background: #000000 !important;
                        color: #ffffff !important;
                        border: 2px solid #ffffff !important;
                    }
                    .btn {
                        background: #ffffff !important;
                        color: #000000 !important;
                        border: 2px solid #ffffff !important;
                    }
                    .data-quality {
                        background: #ffff00 !important;
                        color: #000000 !important;
                    }
                `
            });
            
            await page.waitForTimeout(500);
            
            const mkcgSection = page.locator('#topics-mkcg-section');
            await expect(mkcgSection).toHaveScreenshot(`theme-high-contrast-${browserName}.png`, {
                threshold: 0.3,
                animations: 'disabled'
            });
            
            console.log(`📸 ${browserName}: High contrast mode captured`);
        });
    });
    
    test.describe('Interactive State Screenshots', () => {
        test('should capture button hover states', async ({ page, browserName }) => {
            const mkcgSection = page.locator('#topics-mkcg-section');
            const buttons = mkcgSection.locator('button');
            
            const buttonCount = await buttons.count();
            
            for (let i = 0; i < Math.min(buttonCount, 3); i++) {
                const button = buttons.nth(i);
                
                // Hover over button
                await button.hover();
                await page.waitForTimeout(300);
                
                const buttonClass = await button.getAttribute('class');
                const buttonName = buttonClass?.split(' ').find(cls => cls.includes('mkcg-')) || `button-${i}`;
                
                await expect(button).toHaveScreenshot(`${buttonName}-hover-${browserName}.png`, {
                    threshold: 0.2,
                    animations: 'disabled'
                });
            }
            
            console.log(`📸 ${browserName}: Button hover states captured`);
        });
        
        test('should capture focus states', async ({ page, browserName }) => {
            const mkcgSection = page.locator('#topics-mkcg-section');
            const focusableElements = mkcgSection.locator('button, input, select');
            
            const elementCount = await focusableElements.count();
            
            for (let i = 0; i < Math.min(elementCount, 3); i++) {
                const element = focusableElements.nth(i);
                
                // Focus element
                await element.focus();
                await page.waitForTimeout(300);
                
                const tagName = await element.evaluate(el => el.tagName.toLowerCase());
                const className = await element.getAttribute('class');
                const elementName = className?.split(' ').find(cls => cls.includes('mkcg-')) || `${tagName}-${i}`;
                
                await expect(element).toHaveScreenshot(`${elementName}-focus-${browserName}.png`, {
                    threshold: 0.2,
                    animations: 'disabled'
                });
            }
            
            console.log(`📸 ${browserName}: Focus states captured`);
        });
        
        test('should capture disabled states', async ({ page, browserName }) => {
            // Disable some buttons
            await page.evaluate(() => {
                const buttons = document.querySelectorAll('#topics-mkcg-section button');
                buttons.forEach((btn, index) => {
                    if (index % 2 === 0) {
                        btn.disabled = true;
                        btn.classList.add('disabled');
                    }
                });
            });
            
            await page.waitForTimeout(500);
            
            const mkcgSection = page.locator('#topics-mkcg-section');
            await expect(mkcgSection).toHaveScreenshot(`disabled-states-${browserName}.png`, {
                threshold: 0.2,
                animations: 'disabled'
            });
            
            console.log(`📸 ${browserName}: Disabled states captured`);
        });
    });
    
    test.describe('Cross-Browser Visual Consistency', () => {
        test('should maintain visual consistency across browsers', async ({ page, browserName }) => {
            // Capture the same view across all browsers for comparison
            const mkcgSection = page.locator('#topics-mkcg-section');
            await expect(mkcgSection).toBeVisible();
            
            // Standardized screenshot for cross-browser comparison
            await expect(mkcgSection).toHaveScreenshot(`cross-browser-baseline-${browserName}.png`, {
                threshold: 0.1, // Stricter threshold for consistency check
                animations: 'disabled',
                fullPage: false
            });
            
            // Also capture the full page context
            await expect(page).toHaveScreenshot(`full-page-baseline-${browserName}.png`, {
                threshold: 0.2,
                animations: 'disabled',
                fullPage: true
            });
            
            console.log(`📸 ${browserName}: Cross-browser baseline captured`);
        });
        
        test('should have consistent typography rendering', async ({ page, browserName }) => {
            // Focus on text rendering
            const textElements = page.locator('#topics-mkcg-section .form-section__title, #topics-mkcg-section .data-quality, #topics-mkcg-section button');
            
            const textContainer = page.locator('#topics-mkcg-section');
            await expect(textContainer).toHaveScreenshot(`typography-${browserName}.png`, {
                threshold: 0.15,
                animations: 'disabled'
            });
            
            console.log(`📸 ${browserName}: Typography consistency captured`);
        });
    });
    
    test.describe('Edge Case Visual States', () => {
        test('should capture empty state appearance', async ({ page, browserName }) => {
            // Create empty state scenario
            await page.evaluate(() => {
                // Remove MKCG data
                window.guestifyData = {
                    mkcgData: null,
                    postId: 123
                };
                
                // Reinitialize to show empty state
                if (window.testIntegration) {
                    window.testIntegration.mkcgData = null;
                    window.testIntegration.updateDataQualityDisplay();
                }
            });
            
            await page.waitForTimeout(1000);
            
            const mkcgSection = page.locator('#topics-mkcg-section');
            if (await mkcgSection.count() > 0) {
                await expect(mkcgSection).toHaveScreenshot(`empty-state-${browserName}.png`, {
                    threshold: 0.3,
                    animations: 'disabled'
                });
            }
            
            console.log(`📸 ${browserName}: Empty state captured`);
        });
        
        test('should capture loading state appearance', async ({ page, browserName }) => {
            // Create loading state
            await page.evaluate(() => {
                if (window.testIntegration) {
                    window.testIntegration.showLoadingState('Loading MKCG data...');
                }
            });
            
            await page.waitForTimeout(500);
            
            const loadingIndicator = page.locator('.loading-indicator, .mkcg-loading');
            if (await loadingIndicator.count() > 0) {
                await expect(loadingIndicator).toHaveScreenshot(`loading-state-${browserName}.png`, {
                    threshold: 0.2,
                    animations: 'disabled'
                });
            }
            
            console.log(`📸 ${browserName}: Loading state captured`);
        });
        
        test('should capture error state appearance', async ({ page, browserName }) => {
            // Create error state
            await page.evaluate(() => {
                if (window.testIntegration) {
                    window.testIntegration.handleError('Visual test error', 'visual-regression-test');
                }
            });
            
            await page.waitForTimeout(1000);
            
            const mkcgSection = page.locator('#topics-mkcg-section');
            await expect(mkcgSection).toHaveScreenshot(`error-state-${browserName}.png`, {
                threshold: 0.3,
                animations: 'disabled'
            });
            
            console.log(`📸 ${browserName}: Error state captured`);
        });
    });
});

test.describe('Visual Regression Analysis', () => {
    test('should analyze visual differences across browsers', async ({ page, browserName }) => {
        // This test would run after all browser screenshots are captured
        // to analyze differences and generate a comparison report
        
        const mkcgSection = page.locator('#topics-mkcg-section');
        await expect(mkcgSection).toBeVisible();
        
        // Capture metadata about the rendering
        const renderingInfo = await page.evaluate(() => {
            const section = document.getElementById('topics-mkcg-section');
            if (!section) return null;
            
            const rect = section.getBoundingClientRect();
            const styles = window.getComputedStyle(section);
            
            return {
                dimensions: {
                    width: rect.width,
                    height: rect.height
                },
                styles: {
                    backgroundColor: styles.backgroundColor,
                    padding: styles.padding,
                    borderRadius: styles.borderRadius,
                    fontFamily: styles.fontFamily
                },
                browser: navigator.userAgent,
                timestamp: new Date().toISOString()
            };
        });
        
        console.log(`📊 ${browserName}: Rendering analysis:`, JSON.stringify(renderingInfo, null, 2));
        
        // Store rendering info for comparison (in a real implementation)
        await page.evaluate((info) => {
            window.visualRegressionData = window.visualRegressionData || {};
            window.visualRegressionData[info.browser] = info;
        }, renderingInfo);
    });
});

/**
 * VISUAL TESTING HELPER FUNCTIONS
 */

/**
 * Wait for stable layout (no layout thrashing)
 */
async function waitForStableLayout(page, timeout = 3000) {
    let lastHeight = 0;
    let stableCount = 0;
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
        const currentHeight = await page.evaluate(() => document.body.scrollHeight);
        
        if (currentHeight === lastHeight) {
            stableCount++;
            if (stableCount >= 3) break; // Stable for 3 checks
        } else {
            stableCount = 0;
            lastHeight = currentHeight;
        }
        
        await page.waitForTimeout(100);
    }
}

/**
 * Set consistent fonts for cross-browser testing
 */
async function setConsistentFonts(page) {
    await page.addStyleTag({
        content: `
            * {
                font-family: 'Arial', sans-serif !important;
            }
        `
    });
}

/**
 * Remove dynamic content for consistent screenshots
 */
async function removeDynamicContent(page) {
    await page.evaluate(() => {
        // Remove timestamps and dynamic IDs
        document.querySelectorAll('[id*="timestamp"], [class*="timestamp"]').forEach(el => {
            el.textContent = 'TIMESTAMP_REMOVED';
        });
        
        // Remove random IDs
        document.querySelectorAll('[id]').forEach(el => {
            if (el.id.match(/\d{13,}/)) { // Timestamp-like IDs
                el.id = 'stable-id';
            }
        });
    });
}

export { waitForStableLayout, setConsistentFonts, removeDynamicContent };
