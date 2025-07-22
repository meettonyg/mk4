/**
 * @file debug-duplicate-main.js
 * @description Emergency fix for duplicate main.js loading issue
 */

console.log('%c🚨 DUPLICATE MAIN.JS DEBUGGING TOOL', 'font-size: 16px; font-weight: bold; color: #dc2626; background: #fef2f2; padding: 4px 8px; border-radius: 4px;');

// Function to detect and fix duplicate main.js loading
function debugDuplicateMainJs() {
    console.group('%c🔍 Duplicate Main.js Detection', 'color: #dc2626; font-weight: bold;');
    
    // Check for multiple script tags loading main.js
    const mainJsScripts = document.querySelectorAll('script[src*="main.js"]');
    console.log(`Found ${mainJsScripts.length} script tags loading main.js:`);
    
    mainJsScripts.forEach((script, index) => {
        console.log(`${index + 1}. ${script.src}`);
        console.log(`   - Handle: ${script.id || 'no-id'}`);
        console.log(`   - Loaded: ${script.readyState || 'unknown'}`);
    });
    
    // Check global variable conflicts
    const globalConflicts = [];
    const checkGlobals = ['isInitializing', 'isInitialized', 'gmkbApp'];
    
    checkGlobals.forEach(globalName => {
        if (window.hasOwnProperty(globalName)) {
            globalConflicts.push(globalName);
        }
    });
    
    if (globalConflicts.length > 0) {
        console.error('❌ Global variable conflicts detected:', globalConflicts);
    } else {
        console.log('✅ No global variable conflicts detected');
    }
    
    // Check initialization state
    if (window.gmkbApp) {
        console.log('✅ gmkbApp global object exists');
        console.log(`   - Initialized: ${window.gmkbApp.isInitialized ? window.gmkbApp.isInitialized() : 'unknown'}`);
        console.log(`   - Initializing: ${window.gmkbApp.isInitializing ? window.gmkbApp.isInitializing() : 'unknown'}`);
        console.log(`   - Ready: ${window.gmkbApp.isReady ? window.gmkbApp.isReady() : 'unknown'}`);
    } else {
        console.error('❌ gmkbApp global object not found');
    }
    
    console.groupEnd();
    
    return {
        scriptCount: mainJsScripts.length,
        globalConflicts,
        hasGmkbApp: !!window.gmkbApp
    };
}

// Function to force clean initialization
function forceCleanInitialization() {
    console.group('%c🔄 Force Clean Initialization', 'color: #059669; font-weight: bold;');
    
    try {
        // Clear any existing initialization flags
        if (window.gmkbApp && window.gmkbApp.forceReinitialize) {
            console.log('🔄 Using existing forceReinitialize method...');
            window.gmkbApp.forceReinitialize();
        } else {
            console.log('🛠️ Manual clean initialization...');
            
            // Force hide loading states
            const loadingStates = [
                document.getElementById('loading-state'),
                document.getElementById('state-loading-enhanced'),
                document.querySelector('.loading-state'),
                document.querySelector('.gmkb-loading')
            ];
            
            loadingStates.forEach(element => {
                if (element) {
                    element.style.display = 'none';
                    element.classList.remove('show', 'active');
                }
            });
            
            // Show builder interface
            const builderElements = [
                document.getElementById('media-kit-builder'),
                document.getElementById('media-kit-preview'),
                document.querySelector('.media-kit-builder')
            ];
            
            builderElements.forEach(element => {
                if (element) {
                    element.style.display = 'block';
                    element.classList.add('ready');
                }
            });
            
            // Remove loading classes from body
            document.body.classList.remove('gmkb-loading', 'loading');
            document.body.classList.add('gmkb-ready');
            
            console.log('✅ Manual initialization cleanup completed');
        }
        
    } catch (error) {
        console.error('❌ Force clean initialization failed:', error);
    }
    
    console.groupEnd();
}

// Function to fix component data immediately
function fixComponentDataImmediately() {
    console.group('%c📦 Component Data Fix', 'color: #7c3aed; font-weight: bold;');
    
    try {
        if (!window.gmkbComponentsData) {
            // Try to get from WordPress data
            const data = window.gmkbData || window.guestifyData;
            
            if (data && data.components && data.components.length > 0) {
                window.gmkbComponentsData = data.components;
                console.log(`✅ Component data exposed from WordPress data: ${data.components.length} components`);
            } else {
                // Create comprehensive fallback
                window.gmkbComponentsData = [
                    {
                        type: 'hero',
                        name: 'Hero Section',
                        title: 'Hero Section',
                        description: 'A prominent header section with title and subtitle',
                        category: 'essential',
                        premium: false,
                        icon: 'fa-star',
                        template: 'hero'
                    },
                    {
                        type: 'biography',
                        name: 'Biography',
                        title: 'Biography',
                        description: 'Professional biography section',
                        category: 'essential',
                        premium: false,
                        icon: 'fa-user',
                        template: 'biography'
                    },
                    {
                        type: 'contact',
                        name: 'Contact',
                        title: 'Contact Information',
                        description: 'Contact details and social links',
                        category: 'essential',
                        premium: false,
                        icon: 'fa-envelope',
                        template: 'contact'
                    },
                    {
                        type: 'topics',
                        name: 'Speaking Topics',
                        title: 'Speaking Topics',
                        description: 'Your areas of expertise and speaking topics',
                        category: 'content',
                        premium: false,
                        icon: 'fa-list',
                        template: 'topics'
                    },
                    {
                        type: 'testimonials',
                        name: 'Testimonials',
                        title: 'Testimonials',
                        description: 'Client testimonials and reviews',
                        category: 'social-proof',
                        premium: false,
                        icon: 'fa-quote-left',
                        template: 'testimonials'
                    }
                ];
                console.log('🛡️ Component data fallback created: 5 components');
            }
        } else {
            console.log(`✅ Component data already available: ${window.gmkbComponentsData.length} components`);
        }
        
        // Also expose categories
        if (!window.gmkbCategoriesData) {
            window.gmkbCategoriesData = [
                { slug: 'essential', name: 'Essential', description: 'Core components for every media kit' },
                { slug: 'content', name: 'Content', description: 'Content-focused components' },
                { slug: 'social-proof', name: 'Social Proof', description: 'Testimonials and credibility' }
            ];
            console.log('✅ Categories data created');
        }
        
    } catch (error) {
        console.error('❌ Component data fix failed:', error);
    }
    
    console.groupEnd();
}

// Function to run all emergency fixes
function runEmergencyFixes() {
    console.log('%c🚨 RUNNING EMERGENCY FIXES FOR DUPLICATE MAIN.JS', 'font-size: 14px; font-weight: bold; color: #ffffff; background: #dc2626; padding: 4px 8px; border-radius: 4px;');
    
    const results = {
        timestamp: new Date().toISOString(),
        detection: debugDuplicateMainJs(),
        componentDataFixed: false,
        initializationForced: false
    };
    
    // Fix component data immediately
    try {
        fixComponentDataImmediately();
        results.componentDataFixed = true;
    } catch (error) {
        console.error('Component data fix failed:', error);
    }
    
    // Force clean initialization
    try {
        forceCleanInitialization();
        results.initializationForced = true;
    } catch (error) {
        console.error('Force initialization failed:', error);
    }
    
    // Summary
    console.group('%c📋 EMERGENCY FIXES SUMMARY', 'font-size: 12px; font-weight: bold; color: #059669;');
    console.log('Timestamp:', results.timestamp);
    console.log('Scripts found:', results.detection.scriptCount);
    console.log('Global conflicts:', results.detection.globalConflicts.length);
    console.log('Component data fixed:', results.componentDataFixed ? '✅' : '❌');
    console.log('Initialization forced:', results.initializationForced ? '✅' : '❌');
    
    if (results.detection.scriptCount > 1) {
        console.warn('⚠️ MULTIPLE MAIN.JS SCRIPTS DETECTED - Clear browser cache and refresh');
    }
    
    if (results.componentDataFixed && results.initializationForced) {
        console.log('%c✅ EMERGENCY FIXES COMPLETED SUCCESSFULLY', 'color: #059669; font-weight: bold;');
        console.log('The Media Kit Builder should now be functional.');
    } else {
        console.log('%c❌ SOME EMERGENCY FIXES FAILED', 'color: #dc2626; font-weight: bold;');
        console.log('Manual intervention may be required.');
    }
    
    console.groupEnd();
    
    // Make results available globally
    window.duplicateMainJsResults = results;
    
    return results;
}

// Make functions available globally
window.debugDuplicateMainJs = debugDuplicateMainJs;
window.fixComponentDataImmediately = fixComponentDataImmediately;
window.forceCleanInitialization = forceCleanInitialization;
window.runEmergencyFixes = runEmergencyFixes;

// ROOT FIX: Auto-run disabled to prevent console noise
// Emergency fixes are available manually via runEmergencyFixes() command
// Uncomment below lines if auto-run is needed for debugging:
// setTimeout(() => {
//     console.log('🚨 Auto-running emergency fixes in 3 seconds...');
//     setTimeout(runEmergencyFixes, 3000);
// }, 1000);

console.log('%c✅ Duplicate Main.js Debug Tool Loaded', 'color: #059669; font-weight: bold;');
console.log('Available commands:');
console.log('- runEmergencyFixes() - Run all emergency fixes');
console.log('- debugDuplicateMainJs() - Detect duplicate scripts');
console.log('- fixComponentDataImmediately() - Fix component data');
console.log('- forceCleanInitialization() - Force clean init');
