/**
 * CROSS-BROWSER TESTING: Playwright Configuration
 * Following Gemini's recommendation for comprehensive browser testing
 * 
 * Configures Playwright for Chrome, Firefox, Safari, Edge testing with
 * mobile device emulation and performance monitoring.
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    // Test directory configuration
    testDir: './tests/cross-browser',
    testMatch: ['**/*.spec.js', '**/*.test.js'],
    
    // Global test settings
    timeout: 30000, // 30 seconds per test
    globalTimeout: 1800000, // 30 minutes for entire test suite
    
    // Expect configuration
    expect: {
        timeout: 5000 // 5 seconds for assertions
    },
    
    // Test execution configuration
    fullyParallel: true, // Run tests in parallel
    forbidOnly: !!process.env.CI, // Fail CI if test.only is left in
    retries: process.env.CI ? 2 : 0, // Retry failed tests in CI
    workers: process.env.CI ? 1 : undefined, // Limit workers in CI
    
    // Reporter configuration
    reporter: [
        ['html', { outputFolder: 'test-results/cross-browser-html' }],
        ['json', { outputFile: 'test-results/cross-browser-results.json' }],
        ['junit', { outputFile: 'test-results/cross-browser-junit.xml' }],
        ['list'] // Console output
    ],
    
    // Global test configuration
    use: {
        // Base URL for testing
        baseURL: 'http://localhost:3000',
        
        // Browser context options
        trace: 'on-first-retry', // Capture trace on retry
        screenshot: 'only-on-failure', // Screenshots on failure
        video: 'retain-on-failure', // Videos on failure
        
        // Network and timing
        actionTimeout: 10000, // 10 seconds for actions
        navigationTimeout: 30000, // 30 seconds for navigation
        
        // Viewport and user agent
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true,
        
        // Performance monitoring
        extraHTTPHeaders: {
            'Accept-Language': 'en-US,en;q=0.9'
        }
    },
    
    // Project configuration for different browsers
    projects: [
        // Desktop Chrome
        {
            name: 'chromium',
            use: { 
                ...devices['Desktop Chrome'],
                channel: 'chrome'
            },
            testMatch: [
                '**/browser-compatibility.test.js',
                '**/component-rendering.test.js',
                '**/performance-cross-browser.test.js'
            ]
        },
        
        // Desktop Firefox
        {
            name: 'firefox',
            use: { 
                ...devices['Desktop Firefox']
            },
            testMatch: [
                '**/browser-compatibility.test.js',
                '**/component-rendering.test.js',
                '**/gecko-specific.test.js'
            ]
        },
        
        // Desktop Safari
        {
            name: 'webkit',
            use: { 
                ...devices['Desktop Safari']
            },
            testMatch: [
                '**/browser-compatibility.test.js',
                '**/component-rendering.test.js',
                '**/webkit-specific.test.js'
            ]
        },
        
        // Desktop Edge
        {
            name: 'edge',
            use: { 
                ...devices['Desktop Edge'],
                channel: 'msedge'
            },
            testMatch: [
                '**/browser-compatibility.test.js',
                '**/component-rendering.test.js',
                '**/edge-specific.test.js'
            ]
        },
        
        // Mobile Chrome
        {
            name: 'mobile-chrome',
            use: { 
                ...devices['Pixel 5']
            },
            testMatch: [
                '**/mobile-responsive.test.js',
                '**/touch-interface.test.js'
            ]
        },
        
        // Mobile Safari
        {
            name: 'mobile-safari',
            use: { 
                ...devices['iPhone 12']
            },
            testMatch: [
                '**/mobile-responsive.test.js',
                '**/touch-interface.test.js',
                '**/ios-specific.test.js'
            ]
        },
        
        // Tablet testing
        {
            name: 'tablet',
            use: { 
                ...devices['iPad Pro']
            },
            testMatch: [
                '**/tablet-responsive.test.js',
                '**/touch-interface.test.js'
            ]
        },
        
        // High DPI displays
        {
            name: 'high-dpi',
            use: {
                ...devices['Desktop Chrome'],
                deviceScaleFactor: 2,
                viewport: { width: 1920, height: 1080 }
            },
            testMatch: [
                '**/high-dpi.test.js',
                '**/visual-scaling.test.js'
            ]
        }
    ],
    
    // Web server configuration (if needed)
    webServer: {
        command: 'npm run dev',
        port: 3000,
        reuseExistingServer: !process.env.CI
    },
    
    // Output directories
    outputDir: 'test-results/cross-browser-artifacts',
    
    // Global setup and teardown
    globalSetup: require.resolve('./global-setup.js'),
    globalTeardown: require.resolve('./global-teardown.js')
});

/**
 * BROWSER SUPPORT MATRIX
 * 
 * CHROME (Chromium):
 * - Latest stable + 2 previous versions
 * - V8 JavaScript engine
 * - Blink rendering engine
 * - Best performance characteristics
 * 
 * FIREFOX:
 * - Latest stable + 2 previous versions  
 * - SpiderMonkey JavaScript engine
 * - Gecko rendering engine
 * - Strong privacy features
 * 
 * SAFARI (WebKit):
 * - Latest stable + 2 previous versions
 * - JavaScriptCore engine
 * - WebKit rendering engine
 * - iOS compatibility
 * 
 * EDGE:
 * - Latest stable + 2 previous versions
 * - V8 JavaScript engine (Chromium-based)
 * - Blink rendering engine
 * - Enterprise integration
 */

/**
 * DEVICE TESTING STRATEGY
 * 
 * MOBILE DEVICES:
 * - iPhone 12 (375x812) - iOS Safari
 * - Pixel 5 (393x851) - Android Chrome
 * - Samsung Galaxy S21 (360x800) - Android Chrome
 * 
 * TABLET DEVICES:
 * - iPad Pro (1024x1366) - iPadOS Safari
 * - Surface Pro (1368x912) - Edge/Chrome
 * 
 * DESKTOP DISPLAYS:
 * - 1280x720 (Standard HD)
 * - 1920x1080 (Full HD)
 * - 2560x1440 (2K) with deviceScaleFactor: 2
 * - 3840x2160 (4K) with deviceScaleFactor: 3
 */

/**
 * PERFORMANCE MONITORING CONFIGURATION
 */
export const performanceConfig = {
    // Lighthouse thresholds for cross-browser testing
    lighthouse: {
        performance: 90,
        accessibility: 95,
        bestPractices: 90,
        seo: 85
    },
    
    // Core Web Vitals thresholds
    webVitals: {
        lcp: 2500, // Largest Contentful Paint (ms)
        fid: 100,  // First Input Delay (ms)
        cls: 0.1,  // Cumulative Layout Shift
        fcp: 1800, // First Contentful Paint (ms)
        ttfb: 600  // Time to First Byte (ms)
    },
    
    // Memory usage thresholds
    memory: {
        heapSize: 50 * 1024 * 1024, // 50MB
        domNodes: 1500,
        eventListeners: 500
    }
};

console.log('✅ Playwright cross-browser configuration loaded');
console.log('🌐 Browser projects configured: Chrome, Firefox, Safari, Edge');
console.log('📱 Device projects configured: Mobile, Tablet, High-DPI');
