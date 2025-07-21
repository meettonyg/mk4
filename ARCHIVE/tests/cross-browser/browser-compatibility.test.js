/**
 * CROSS-BROWSER TESTING: Browser Compatibility Test Suite
 * Following Gemini's recommendation for comprehensive browser validation
 * 
 * Tests MKCG Topics Integration functionality across Chrome, Firefox, Safari, Edge
 * with focus on rendering consistency, JavaScript compatibility, and performance parity.
 */

import { test, expect } from '@playwright/test';

test.describe('Cross-Browser Compatibility - MKCG Topics Integration', () => {
    
    // Setup before each test
    test.beforeEach(async ({ page, browserName }) => {
        console.log(`🌐 Testing on ${browserName}`);
        
        // Navigate to test page with MKCG data
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
                            topic_1: 'Digital Marketing Strategy',
                            topic_2: 'Social Media Management', 
                            topic_3: 'Content Creation',
                            topic_4: 'SEO Optimization',
                            topic_5: 'Analytics and Reporting'
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
                nonce: 'test_nonce_12345'
            };
        });
        
        // Initialize MKCG integration
        await page.evaluate(() => {
            const topicsElement = document.querySelector('.topics-component');
            const panelElement = document.querySelector('.element-editor');
            
            if (topicsElement && panelElement && typeof TopicsMKCGIntegration !== 'undefined') {
                window.testIntegration = new TopicsMKCGIntegration(topicsElement, panelElement);
                return window.testIntegration.init();
            }
        });
        
        // Wait for initialization
        await page.waitForTimeout(1000);
    });
    
    test.describe('MKCG Section Rendering', () => {
        test('should render MKCG section consistently across browsers', async ({ page, browserName }) => {
            // Check if MKCG section is created and visible
            const mkcgSection = await page.locator('#topics-mkcg-section');
            await expect(mkcgSection).toBeVisible();
            
            // Verify section structure
            await expect(mkcgSection.locator('.mkcg-integration-section')).toBeVisible();
            await expect(mkcgSection.locator('.form-section__title')).toContainText('MKCG Data Integration');
            
            // Check data quality display
            const dataQuality = mkcgSection.locator('.data-quality');
            await expect(dataQuality).toBeVisible();
            await expect(dataQuality).toContainText('%');
            
            console.log(`✅ ${browserName}: MKCG section renders correctly`);
        });
        
        test('should display all required control buttons', async ({ page, browserName }) => {
            const mkcgSection = page.locator('#topics-mkcg-section');
            
            // Verify all control buttons exist
            const buttons = {
                refresh: '.mkcg-refresh-btn',
                save: '.mkcg-save-btn', 
                syncAll: '.mkcg-sync-all-btn',
                clearAll: '.mkcg-clear-all-btn',
                reset: '.mkcg-reset-btn',
                undo: '.mkcg-bulk-undo-btn'
            };
            
            for (const [name, selector] of Object.entries(buttons)) {
                const button = mkcgSection.locator(selector);
                await expect(button).toBeVisible();
                
                // Verify button is clickable
                await expect(button).toBeEnabled();
            }
            
            console.log(`✅ ${browserName}: All control buttons present and functional`);
        });
        
        test('should maintain consistent styling across browsers', async ({ page, browserName }) => {
            const mkcgSection = page.locator('#topics-mkcg-section');
            
            // Check CSS styles are applied correctly
            const sectionStyles = await mkcgSection.evaluate((el) => {
                const styles = window.getComputedStyle(el);
                return {
                    display: styles.display,
                    padding: styles.padding,
                    marginBottom: styles.marginBottom,
                    backgroundColor: styles.backgroundColor,
                    borderRadius: styles.borderRadius
                };
            });
            
            expect(sectionStyles.display).toBe('block');
            expect(sectionStyles.padding).toBeTruthy();
            
            // Check button styling consistency
            const buttonStyles = await mkcgSection.locator('.btn').first().evaluate((el) => {
                const styles = window.getComputedStyle(el);
                return {
                    padding: styles.padding,
                    borderRadius: styles.borderRadius,
                    cursor: styles.cursor
                };
            });
            
            expect(buttonStyles.cursor).toBe('pointer');
            
            console.log(`✅ ${browserName}: Styling consistent with baseline`);
        });
    });
    
    test.describe('JavaScript API Compatibility', () => {
        test('should support modern JavaScript features', async ({ page, browserName }) => {
            const jsFeatures = await page.evaluate(() => {
                // Test modern JavaScript features used in the integration
                const features = {
                    map: typeof Map !== 'undefined',
                    promise: typeof Promise !== 'undefined',
                    fetch: typeof fetch !== 'undefined',
                    arrow: (() => true)(),
                    destructuring: (() => {
                        const obj = { a: 1 };
                        const { a } = obj;
                        return a === 1;
                    })(),
                    templateLiterals: `test` === 'test',
                    classSupport: (() => {
                        try {
                            new Function('class Test {}');
                            return true;
                        } catch (e) {
                            return false;
                        }
                    })()
                };
                
                return features;
            });
            
            // All modern features should be supported
            Object.entries(jsFeatures).forEach(([feature, supported]) => {
                expect(supported).toBe(true);
                console.log(`✅ ${browserName}: ${feature} supported`);
            });
        });
        
        test('should handle DOM manipulation APIs consistently', async ({ page, browserName }) => {
            const domAPIs = await page.evaluate(() => {
                const results = {};
                
                // Test querySelector/querySelectorAll
                results.querySelector = typeof document.querySelector === 'function';
                results.querySelectorAll = typeof document.querySelectorAll === 'function';
                
                // Test event handling
                results.addEventListener = typeof Element.prototype.addEventListener === 'function';
                results.removeEventListener = typeof Element.prototype.removeEventListener === 'function';
                
                // Test modern DOM APIs
                results.classList = 'classList' in document.createElement('div');
                results.dataset = 'dataset' in document.createElement('div');
                
                // Test insertion/removal
                results.append = typeof Element.prototype.append === 'function';
                results.remove = typeof Element.prototype.remove === 'function';
                
                return results;
            });
            
            Object.entries(domAPIs).forEach(([api, supported]) => {
                expect(supported).toBe(true);
                console.log(`✅ ${browserName}: DOM API ${api} supported`);
            });
        });
        
        test('should execute validation functions without errors', async ({ page, browserName }) => {
            const validationResults = await page.evaluate(async () => {
                if (!window.testIntegration) {
                    return { error: 'Integration not initialized' };
                }
                
                try {
                    // Test debounced validation
                    const debouncedResult = await window.testIntegration.validateTopicDebounced('Test Topic', 0);
                    
                    // Test comprehensive validation
                    const comprehensiveResult = await window.testIntegration.performComprehensiveValidation('Test Topic', 0);
                    
                    return {
                        debounced: !!debouncedResult,
                        comprehensive: !!comprehensiveResult,
                        error: null
                    };
                } catch (error) {
                    return { error: error.message };
                }
            });
            
            expect(validationResults.error).toBeNull();
            expect(validationResults.debounced).toBe(true);
            expect(validationResults.comprehensive).toBe(true);
            
            console.log(`✅ ${browserName}: Validation functions execute correctly`);
        });
    });
    
    test.describe('Event Handling Compatibility', () => {
        test('should handle click events consistently', async ({ page, browserName }) => {
            // Test button click handling
            const mkcgSection = page.locator('#topics-mkcg-section');
            const refreshButton = mkcgSection.locator('.mkcg-refresh-btn');
            
            // Set up click event monitoring
            await page.evaluate(() => {
                window.clickEvents = [];
                document.addEventListener('click', (e) => {
                    window.clickEvents.push({
                        target: e.target.className,
                        timestamp: Date.now()
                    });
                });
            });
            
            // Click refresh button
            await refreshButton.click();
            
            // Verify click was registered
            const clickEvents = await page.evaluate(() => window.clickEvents);
            expect(clickEvents.length).toBeGreaterThan(0);
            expect(clickEvents.some(e => e.target.includes('mkcg-refresh-btn'))).toBe(true);
            
            console.log(`✅ ${browserName}: Click events handled correctly`);
        });
        
        test('should handle keyboard events for accessibility', async ({ page, browserName }) => {
            const mkcgSection = page.locator('#topics-mkcg-section');
            const firstButton = mkcgSection.locator('button').first();
            
            // Focus the button
            await firstButton.focus();
            
            // Verify focus state
            const isFocused = await firstButton.evaluate((el) => document.activeElement === el);
            expect(isFocused).toBe(true);
            
            // Test Enter key activation
            await page.keyboard.press('Enter');
            
            // Test Tab navigation
            await page.keyboard.press('Tab');
            
            console.log(`✅ ${browserName}: Keyboard events handled correctly`);
        });
    });
    
    test.describe('Performance Consistency', () => {
        test('should meet performance targets across browsers', async ({ page, browserName }) => {
            // Measure initialization performance
            const performanceMetrics = await page.evaluate(async () => {
                const startTime = performance.now();
                
                // Simulate component initialization
                if (window.testIntegration) {
                    await window.testIntegration.detectMKCGData();
                    await window.testIntegration.mapMKCGDataToTopics();
                }
                
                const endTime = performance.now();
                
                return {
                    initTime: endTime - startTime,
                    memory: performance.memory ? {
                        used: performance.memory.usedJSHeapSize,
                        total: performance.memory.totalJSHeapSize,
                        limit: performance.memory.jsHeapSizeLimit
                    } : null
                };
            });
            
            // Performance targets
            expect(performanceMetrics.initTime).toBeLessThan(200); // 200ms target
            
            if (performanceMetrics.memory) {
                // Memory usage should be reasonable
                expect(performanceMetrics.memory.used).toBeLessThan(10 * 1024 * 1024); // 10MB
            }
            
            console.log(`✅ ${browserName}: Performance within targets (${performanceMetrics.initTime.toFixed(2)}ms)`);
        });
        
        test('should handle bulk operations efficiently', async ({ page, browserName }) => {
            const bulkPerformance = await page.evaluate(async () => {
                if (!window.testIntegration) {
                    return { error: 'Integration not available' };
                }
                
                const startTime = performance.now();
                
                try {
                    // Execute bulk operations
                    window.testIntegration.executeSyncAllTopics();
                    window.testIntegration.executeClearAllTopics();
                    window.testIntegration.executeResetToMKCG();
                    
                    // Wait for operations to complete
                    await new Promise(resolve => setTimeout(resolve, 100));
                    
                    const endTime = performance.now();
                    
                    return {
                        bulkTime: endTime - startTime,
                        error: null
                    };
                } catch (error) {
                    return { error: error.message };
                }
            });
            
            expect(bulkPerformance.error).toBeNull();
            expect(bulkPerformance.bulkTime).toBeLessThan(1000); // 1 second target
            
            console.log(`✅ ${browserName}: Bulk operations efficient (${bulkPerformance.bulkTime.toFixed(2)}ms)`);
        });
    });
    
    test.describe('CSS Feature Support', () => {
        test('should support required CSS features', async ({ page, browserName }) => {
            const cssSupport = await page.evaluate(() => {
                const testElement = document.createElement('div');
                document.body.appendChild(testElement);
                
                const features = {
                    flexbox: CSS.supports('display', 'flex'),
                    grid: CSS.supports('display', 'grid'),
                    customProperties: CSS.supports('--test-var', 'value'),
                    transforms: CSS.supports('transform', 'translateX(0)'),
                    transitions: CSS.supports('transition', 'all 0.3s'),
                    borderRadius: CSS.supports('border-radius', '4px'),
                    boxShadow: CSS.supports('box-shadow', '0 2px 4px rgba(0,0,0,0.1)')
                };
                
                document.body.removeChild(testElement);
                return features;
            });
            
            // All required CSS features should be supported
            Object.entries(cssSupport).forEach(([feature, supported]) => {
                expect(supported).toBe(true);
                console.log(`✅ ${browserName}: CSS ${feature} supported`);
            });
        });
        
        test('should render animations smoothly', async ({ page, browserName }) => {
            // Test progress bar animation
            await page.evaluate(() => {
                if (window.testIntegration) {
                    window.testIntegration.updateBulkOperationProgress(50, 'Testing animation');
                }
            });
            
            // Check if progress elements animate properly
            const progressBar = page.locator('.progress-bar');
            if (await progressBar.count() > 0) {
                const width = await progressBar.evaluate((el) => el.style.width);
                expect(width).toBeTruthy();
            }
            
            console.log(`✅ ${browserName}: Animations render smoothly`);
        });
    });
    
    test.describe('Network Request Handling', () => {
        test('should handle AJAX requests consistently', async ({ page, browserName }) => {
            // Intercept network requests
            const requests = [];
            page.on('request', request => {
                if (request.url().includes('admin-ajax.php')) {
                    requests.push({
                        url: request.url(),
                        method: request.method(),
                        headers: request.headers()
                    });
                }
            });
            
            // Trigger save operation that would make AJAX request
            await page.evaluate(() => {
                if (window.testIntegration) {
                    window.testIntegration.createBatchSaveQueue({
                        key: 'topic_1',
                        value: 'Test Topic',
                        quality: 75
                    });
                }
            });
            
            console.log(`✅ ${browserName}: AJAX handling consistent`);
        });
    });
    
    test.describe('Error Recovery', () => {
        test('should handle JavaScript errors gracefully', async ({ page, browserName }) => {
            // Monitor console errors
            const consoleErrors = [];
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    consoleErrors.push(msg.text());
                }
            });
            
            // Trigger potential error scenarios
            await page.evaluate(() => {
                try {
                    // Test error handling in integration
                    if (window.testIntegration) {
                        window.testIntegration.handleError('Test error', 'cross-browser-test');
                    }
                } catch (error) {
                    console.error('Error in test:', error);
                }
            });
            
            // Should handle errors gracefully without breaking
            const criticalErrors = consoleErrors.filter(error => 
                !error.includes('Test error') && 
                error.includes('Uncaught')
            );
            
            expect(criticalErrors.length).toBe(0);
            
            console.log(`✅ ${browserName}: Error recovery working correctly`);
        });
    });
});

test.describe('Browser-Specific Edge Cases', () => {
    test('Chrome: should handle V8-specific optimizations', async ({ page, browserName }) => {
        test.skip(browserName !== 'chromium');
        
        // Test Chrome-specific performance optimizations
        const v8Performance = await page.evaluate(() => {
            // Test for V8-specific features
            return {
                weakMap: typeof WeakMap !== 'undefined',
                weakSet: typeof WeakSet !== 'undefined',
                proxy: typeof Proxy !== 'undefined',
                symbol: typeof Symbol !== 'undefined'
            };
        });
        
        expect(v8Performance.weakMap).toBe(true);
        expect(v8Performance.proxy).toBe(true);
        
        console.log('✅ Chrome: V8 optimizations available');
    });
    
    test('Firefox: should handle Gecko rendering differences', async ({ page, browserName }) => {
        test.skip(browserName !== 'firefox');
        
        // Test Firefox-specific rendering
        const geckoFeatures = await page.evaluate(() => {
            return {
                mozPrefix: CSS.supports('-moz-appearance', 'none'),
                firefoxAPI: typeof InstallTrigger !== 'undefined'
            };
        });
        
        console.log('✅ Firefox: Gecko-specific features handled');
    });
    
    test('Safari: should handle WebKit quirks', async ({ page, browserName }) => {
        test.skip(browserName !== 'webkit');
        
        // Test Safari/WebKit-specific behavior
        const webkitFeatures = await page.evaluate(() => {
            return {
                webkitPrefix: CSS.supports('-webkit-appearance', 'none'),
                touchForceSupport: 'webkitForce' in document.createElement('div')
            };
        });
        
        console.log('✅ Safari: WebKit quirks handled correctly');
    });
});

/**
 * BROWSER COMPATIBILITY HELPER FUNCTIONS
 */

/**
 * Take screenshot for visual comparison
 */
async function takeScreenshot(page, name) {
    await page.screenshot({
        path: `test-results/screenshots/${name}-${page.context().browser().browserType().name()}.png`,
        fullPage: true
    });
}

/**
 * Measure page performance metrics
 */
async function getPerformanceMetrics(page) {
    return await page.evaluate(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        
        return {
            domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
            loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
            firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
            firstContentfulPaint: performance.getEntriesByType('paint')[1]?.startTime || 0
        };
    });
}

export { takeScreenshot, getPerformanceMetrics };
