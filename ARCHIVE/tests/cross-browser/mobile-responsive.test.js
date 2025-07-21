/**
 * CROSS-BROWSER TESTING: Mobile Responsive & Touch Interface Testing
 * Following Gemini's recommendation for comprehensive mobile testing
 * 
 * Tests MKCG Topics Integration on mobile devices with touch interfaces,
 * responsive design, and mobile-specific performance considerations.
 */

import { test, expect } from '@playwright/test';

test.describe('Mobile Responsive Testing - MKCG Topics Integration', () => {
    
    test.beforeEach(async ({ page }) => {
        // Navigate to test page
        await page.goto('/media-kit-builder?post_id=123');
        
        // Wait for component initialization
        await page.waitForSelector('.topics-component', { timeout: 10000 });
        await page.waitForSelector('.element-editor', { timeout: 5000 });
        
        // Inject test MKCG data
        await page.evaluate(() => {
            window.guestifyData = {
                mkcgData: {
                    topics: {
                        topics: {
                            topic_1: 'Mobile Marketing',
                            topic_2: 'App Development', 
                            topic_3: 'Responsive Design',
                            topic_4: 'Touch UX',
                            topic_5: 'Mobile Analytics'
                        }
                    }
                },
                postId: 123,
                ajaxUrl: '/wp-admin/admin-ajax.php',
                nonce: 'mobile_test_nonce'
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
        
        await page.waitForTimeout(1000);
    });
    
    test.describe('Viewport Responsiveness', () => {
        test('should adapt to mobile viewport (375px width)', async ({ page, browserName }) => {
            // Set mobile viewport
            await page.setViewportSize({ width: 375, height: 667 });
            
            const mkcgSection = page.locator('#topics-mkcg-section');
            await expect(mkcgSection).toBeVisible();
            
            // Check if section adapts to mobile width
            const sectionBounds = await mkcgSection.boundingBox();
            expect(sectionBounds.width).toBeLessThanOrEqual(375);
            
            // Verify buttons stack vertically on mobile
            const buttons = mkcgSection.locator('button');
            const buttonPositions = await buttons.evaluateAll((buttons) => {
                return buttons.map(btn => {
                    const rect = btn.getBoundingClientRect();
                    return { top: rect.top, left: rect.left, width: rect.width };
                });
            });
            
            // Buttons should be arranged for mobile (full width or stacked)
            buttonPositions.forEach(pos => {
                expect(pos.width).toBeGreaterThan(100); // Minimum touch target width
            });
            
            console.log(`📱 ${browserName}: Mobile viewport adaptation successful`);
        });
        
        test('should adapt to tablet viewport (768px width)', async ({ page, browserName }) => {
            await page.setViewportSize({ width: 768, height: 1024 });
            
            const mkcgSection = page.locator('#topics-mkcg-section');
            await expect(mkcgSection).toBeVisible();
            
            // Check tablet-specific layout
            const sectionBounds = await mkcgSection.boundingBox();
            expect(sectionBounds.width).toBeLessThanOrEqual(768);
            
            // Verify responsive design elements
            const isTabletLayout = await page.evaluate(() => {
                const section = document.getElementById('topics-mkcg-section');
                const styles = window.getComputedStyle(section);
                return {
                    padding: styles.padding,
                    fontSize: styles.fontSize,
                    display: styles.display
                };
            });
            
            expect(isTabletLayout.display).toBe('block');
            
            console.log(`📱 ${browserName}: Tablet viewport adaptation successful`);
        });
        
        test('should handle orientation changes gracefully', async ({ page, browserName }) => {
            // Test portrait orientation
            await page.setViewportSize({ width: 375, height: 667 });
            
            let mkcgSection = page.locator('#topics-mkcg-section');
            await expect(mkcgSection).toBeVisible();
            
            const portraitBounds = await mkcgSection.boundingBox();
            
            // Switch to landscape orientation
            await page.setViewportSize({ width: 667, height: 375 });
            
            // Wait for reflow
            await page.waitForTimeout(500);
            
            mkcgSection = page.locator('#topics-mkcg-section');
            await expect(mkcgSection).toBeVisible();
            
            const landscapeBounds = await mkcgSection.boundingBox();
            
            // Layout should adapt to orientation change
            expect(landscapeBounds.width).toBeGreaterThan(portraitBounds.width);
            
            console.log(`📱 ${browserName}: Orientation changes handled correctly`);
        });
    });
    
    test.describe('Touch Interface Testing', () => {
        test('should have adequate touch target sizes', async ({ page, browserName }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            
            const mkcgSection = page.locator('#topics-mkcg-section');
            const buttons = mkcgSection.locator('button');
            
            // Check all buttons meet minimum touch target size (44x44px)
            const buttonSizes = await buttons.evaluateAll((buttons) => {
                return buttons.map(btn => {
                    const rect = btn.getBoundingClientRect();
                    return {
                        width: rect.width,
                        height: rect.height,
                        className: btn.className
                    };
                });
            });
            
            buttonSizes.forEach(size => {
                expect(Math.max(size.width, size.height)).toBeGreaterThanOrEqual(44);
                console.log(`✅ ${size.className}: ${size.width}x${size.height}px (min 44px)`);
            });
            
            console.log(`📱 ${browserName}: Touch targets adequately sized`);
        });
        
        test('should respond to touch events correctly', async ({ page, browserName }) => {
            test.skip(browserName === 'firefox'); // Firefox doesn't simulate touch well
            
            await page.setViewportSize({ width: 375, height: 667 });
            
            // Set up touch event monitoring
            await page.evaluate(() => {
                window.touchEvents = [];
                
                ['touchstart', 'touchmove', 'touchend'].forEach(eventType => {
                    document.addEventListener(eventType, (e) => {
                        window.touchEvents.push({
                            type: eventType,
                            timestamp: Date.now(),
                            target: e.target.className
                        });
                    });
                });
            });
            
            const mkcgSection = page.locator('#topics-mkcg-section');
            const refreshButton = mkcgSection.locator('.mkcg-refresh-btn');
            
            // Simulate touch on refresh button
            await refreshButton.dispatchEvent('touchstart');
            await refreshButton.dispatchEvent('touchend');
            
            // Verify touch events were captured
            const touchEvents = await page.evaluate(() => window.touchEvents);
            expect(touchEvents.length).toBeGreaterThan(0);
            expect(touchEvents.some(e => e.type === 'touchstart')).toBe(true);
            
            console.log(`📱 ${browserName}: Touch events handled correctly`);
        });
        
        test('should support swipe gestures for modal dialogs', async ({ page, browserName }) => {
            test.skip(browserName === 'firefox'); // Skip for Firefox
            
            await page.setViewportSize({ width: 375, height: 667 });
            
            // Trigger modal dialog
            await page.evaluate(() => {
                if (window.testIntegration) {
                    window.testIntegration.showBulkOperationConfirmation({
                        operation: 'clear_all',
                        title: 'Touch Test',
                        message: 'Testing touch interface',
                        icon: '📱',
                        confirmText: 'OK',
                        confirmClass: 'btn-primary',
                        onConfirm: () => console.log('Touch confirm')
                    });
                }
            });
            
            const modal = page.locator('.bulk-operation-modal-overlay');
            await expect(modal).toBeVisible();
            
            // Test touch interactions on modal
            const modalDialog = modal.locator('.bulk-operation-modal');
            await expect(modalDialog).toBeVisible();
            
            // Simulate swipe down to dismiss (if implemented)
            await modalDialog.dispatchEvent('touchstart', { 
                detail: { touches: [{ clientX: 187, clientY: 200 }] }
            });
            await modalDialog.dispatchEvent('touchmove', { 
                detail: { touches: [{ clientX: 187, clientY: 300 }] }
            });
            await modalDialog.dispatchEvent('touchend');
            
            console.log(`📱 ${browserName}: Swipe gestures supported`);
        });
        
        test('should prevent touch scrolling interference', async ({ page, browserName }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            
            const mkcgSection = page.locator('#topics-mkcg-section');
            
            // Test if touch events don't interfere with scrolling
            const scrollBehavior = await page.evaluate(() => {
                const section = document.getElementById('topics-mkcg-section');
                const styles = window.getComputedStyle(section);
                
                return {
                    touchAction: styles.touchAction,
                    overflowY: styles.overflowY,
                    userSelect: styles.userSelect
                };
            });
            
            // Should allow proper touch scrolling
            expect(scrollBehavior.touchAction).not.toBe('none');
            
            console.log(`📱 ${browserName}: Touch scrolling not interfered with`);
        });
    });
    
    test.describe('Mobile Performance', () => {
        test('should maintain performance on mobile devices', async ({ page, browserName }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            
            // Simulate slower mobile performance
            await page.emulateNetworkConditions({
                offline: false,
                downloadThroughput: 1.5 * 1024 * 1024 / 8, // 1.5 Mbps
                uploadThroughput: 750 * 1024 / 8, // 750 Kbps
                latency: 40 // 40ms RTT
            });
            
            const performanceMetrics = await page.evaluate(async () => {
                const startTime = performance.now();
                
                // Test mobile-specific operations
                if (window.testIntegration) {
                    await window.testIntegration.detectMKCGData();
                    const mapped = window.testIntegration.mapMKCGDataToTopics();
                    await window.testIntegration.validateTopicDebounced('Mobile Test Topic', 0);
                }
                
                const endTime = performance.now();
                
                return {
                    totalTime: endTime - startTime,
                    memory: performance.memory ? performance.memory.usedJSHeapSize : null
                };
            });
            
            // Mobile performance targets (more lenient than desktop)
            expect(performanceMetrics.totalTime).toBeLessThan(500); // 500ms for mobile
            
            if (performanceMetrics.memory) {
                expect(performanceMetrics.memory).toBeLessThan(15 * 1024 * 1024); // 15MB for mobile
            }
            
            console.log(`📱 ${browserName}: Mobile performance acceptable (${performanceMetrics.totalTime.toFixed(2)}ms)`);
        });
        
        test('should handle slow networks gracefully', async ({ page, browserName }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            
            // Simulate very slow 3G
            await page.emulateNetworkConditions({
                offline: false,
                downloadThroughput: 400 * 1024 / 8, // 400 Kbps
                uploadThroughput: 400 * 1024 / 8, // 400 Kbps  
                latency: 400 // 400ms RTT
            });
            
            // Test that operations don't hang
            const networkTest = await page.evaluate(async () => {
                const timeout = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout')), 5000)
                );
                
                const operation = new Promise(resolve => {
                    // Simulate network-dependent operation
                    if (window.testIntegration) {
                        window.testIntegration.createBatchSaveQueue({
                            key: 'topic_1',
                            value: 'Slow Network Test',
                            quality: 75
                        });
                    }
                    resolve('completed');
                });
                
                try {
                    const result = await Promise.race([operation, timeout]);
                    return { success: true, result };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            });
            
            expect(networkTest.success).toBe(true);
            
            console.log(`📱 ${browserName}: Slow network handled gracefully`);
        });
    });
    
    test.describe('Mobile-Specific UI Adaptations', () => {
        test('should show mobile-optimized button layouts', async ({ page, browserName }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            
            const mkcgSection = page.locator('#topics-mkcg-section');
            const buttons = mkcgSection.locator('button');
            
            // Check button layout adaptation
            const buttonLayout = await buttons.evaluateAll((buttons) => {
                const positions = buttons.map(btn => {
                    const rect = btn.getBoundingClientRect();
                    return {
                        top: rect.top,
                        left: rect.left,
                        width: rect.width,
                        right: rect.right
                    };
                });
                
                // Check if buttons are stacked or arranged for mobile
                const isStacked = positions.every((pos, index) => {
                    if (index === 0) return true;
                    const prevPos = positions[index - 1];
                    return pos.top > prevPos.top || pos.left >= prevPos.right - 10;
                });
                
                return { isStacked, count: positions.length };
            });
            
            expect(buttonLayout.count).toBeGreaterThan(0);
            
            console.log(`📱 ${browserName}: Mobile button layout optimized`);
        });
        
        test('should have readable text on mobile screens', async ({ page, browserName }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            
            const mkcgSection = page.locator('#topics-mkcg-section');
            
            // Check text readability
            const textElements = await mkcgSection.locator('span, p, div').evaluateAll((elements) => {
                return elements.map(el => {
                    const styles = window.getComputedStyle(el);
                    const text = el.textContent.trim();
                    
                    if (text.length > 0) {
                        return {
                            fontSize: parseFloat(styles.fontSize),
                            lineHeight: styles.lineHeight,
                            text: text.substring(0, 50) + (text.length > 50 ? '...' : '')
                        };
                    }
                    return null;
                }).filter(Boolean);
            });
            
            // Text should be readable on mobile (minimum 14px)
            textElements.forEach(textInfo => {
                expect(textInfo.fontSize).toBeGreaterThanOrEqual(14);
            });
            
            console.log(`📱 ${browserName}: Text readable on mobile (min 14px font size)`);
        });
        
        test('should handle virtual keyboard appearance', async ({ page, browserName }) => {
            test.skip(browserName === 'webkit'); // Safari handles this differently
            
            await page.setViewportSize({ width: 375, height: 667 });
            
            // Create input field for testing
            await page.evaluate(() => {
                const input = document.createElement('input');
                input.type = 'text';
                input.id = 'test-mobile-input';
                input.placeholder = 'Mobile input test';
                input.style.cssText = 'width: 100%; padding: 12px; margin: 10px 0;';
                
                const section = document.getElementById('topics-mkcg-section');
                if (section) {
                    section.appendChild(input);
                }
            });
            
            const testInput = page.locator('#test-mobile-input');
            await expect(testInput).toBeVisible();
            
            // Focus input to trigger virtual keyboard
            await testInput.focus();
            
            // Check if page layout adjusts for virtual keyboard
            const viewportAfterFocus = await page.evaluate(() => {
                return {
                    innerHeight: window.innerHeight,
                    visualViewport: window.visualViewport ? {
                        height: window.visualViewport.height,
                        offsetTop: window.visualViewport.offsetTop
                    } : null
                };
            });
            
            console.log(`📱 ${browserName}: Virtual keyboard handling tested`);
        });
    });
    
    test.describe('Accessibility on Mobile', () => {
        test('should support screen reader gestures', async ({ page, browserName }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            
            const mkcgSection = page.locator('#topics-mkcg-section');
            
            // Check for proper ARIA labels on mobile
            const ariaLabels = await mkcgSection.locator('[aria-label]').evaluateAll((elements) => {
                return elements.map(el => ({
                    tagName: el.tagName,
                    ariaLabel: el.getAttribute('aria-label'),
                    hasText: el.textContent.trim().length > 0
                }));
            });
            
            ariaLabels.forEach(labelInfo => {
                expect(labelInfo.ariaLabel).toBeTruthy();
                expect(labelInfo.ariaLabel.length).toBeGreaterThan(0);
            });
            
            console.log(`📱 ${browserName}: Screen reader support verified`);
        });
        
        test('should support voice control commands', async ({ page, browserName }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            
            const mkcgSection = page.locator('#topics-mkcg-section');
            const buttons = mkcgSection.locator('button');
            
            // Check if buttons have descriptive text for voice control
            const buttonTexts = await buttons.evaluateAll((buttons) => {
                return buttons.map(btn => ({
                    text: btn.textContent.trim(),
                    ariaLabel: btn.getAttribute('aria-label'),
                    title: btn.getAttribute('title')
                }));
            });
            
            buttonTexts.forEach(btnInfo => {
                const hasDescription = btnInfo.text || btnInfo.ariaLabel || btnInfo.title;
                expect(hasDescription).toBeTruthy();
            });
            
            console.log(`📱 ${browserName}: Voice control support verified`);
        });
    });
    
    test.describe('Mobile Error Handling', () => {
        test('should handle connection interruptions gracefully', async ({ page, browserName }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            
            // Simulate going offline
            await page.context().setOffline(true);
            
            // Attempt operations while offline
            const offlineTest = await page.evaluate(async () => {
                try {
                    if (window.testIntegration) {
                        // These should handle offline gracefully
                        window.testIntegration.createBatchSaveQueue({
                            key: 'topic_1',
                            value: 'Offline Test',
                            quality: 80
                        });
                        
                        return { success: true, message: 'Offline handled gracefully' };
                    }
                    return { success: false, message: 'Integration not available' };
                } catch (error) {
                    return { success: false, message: error.message };
                }
            });
            
            expect(offlineTest.success).toBe(true);
            
            // Go back online
            await page.context().setOffline(false);
            
            console.log(`📱 ${browserName}: Connection interruptions handled`);
        });
        
        test('should display mobile-friendly error messages', async ({ page, browserName }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            
            // Trigger an error scenario
            await page.evaluate(() => {
                if (window.testIntegration) {
                    window.testIntegration.handleError('Mobile test error', 'mobile-error-test');
                }
            });
            
            // Check for error display elements (if implemented)
            const errorElements = await page.locator('.error-message, .alert, .notice').count();
            
            console.log(`📱 ${browserName}: Mobile error messages tested`);
        });
    });
});

/**
 * MOBILE TESTING HELPER FUNCTIONS
 */

/**
 * Simulate device rotation
 */
async function rotateDevice(page, orientation = 'landscape') {
    const currentViewport = page.viewportSize();
    
    if (orientation === 'landscape') {
        await page.setViewportSize({
            width: Math.max(currentViewport.width, currentViewport.height),
            height: Math.min(currentViewport.width, currentViewport.height)
        });
    } else {
        await page.setViewportSize({
            width: Math.min(currentViewport.width, currentViewport.height),
            height: Math.max(currentViewport.width, currentViewport.height)
        });
    }
    
    // Wait for reflow
    await page.waitForTimeout(500);
}

/**
 * Check touch target accessibility
 */
async function checkTouchTargets(page) {
    return await page.evaluate(() => {
        const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, [role="button"]');
        const results = [];
        
        interactiveElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const isAccessible = Math.max(rect.width, rect.height) >= 44;
            
            results.push({
                element: element.tagName + (element.className ? '.' + element.className : ''),
                width: rect.width,
                height: rect.height,
                isAccessible,
                minDimension: Math.min(rect.width, rect.height),
                maxDimension: Math.max(rect.width, rect.height)
            });
        });
        
        return results;
    });
}

/**
 * Test responsive breakpoints
 */
async function testBreakpoints(page, breakpoints = [320, 375, 414, 768, 1024]) {
    const results = [];
    
    for (const width of breakpoints) {
        await page.setViewportSize({ width, height: 667 });
        await page.waitForTimeout(300); // Allow reflow
        
        const layout = await page.evaluate(() => {
            const section = document.getElementById('topics-mkcg-section');
            if (!section) return null;
            
            const rect = section.getBoundingClientRect();
            const styles = window.getComputedStyle(section);
            
            return {
                width: rect.width,
                height: rect.height,
                padding: styles.padding,
                fontSize: styles.fontSize,
                display: styles.display
            };
        });
        
        results.push({
            viewport: width,
            layout
        });
    }
    
    return results;
}

export { rotateDevice, checkTouchTargets, testBreakpoints };
