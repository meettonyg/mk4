/**
 * Debug script to trace template library loading issue
 */

console.log('=== Debugging Template Library 404 ===\n');

// Check all script tags
const scripts = document.querySelectorAll('script');
scripts.forEach(script => {
    if (script.src && script.src.includes('template-library')) {
        console.log('Found script tag loading template-library:', script.src);
    }
});

// Check if template library is already loaded
console.log('\nChecking if template library module exists:');
console.log('window.templateLibrary:', typeof window.templateLibrary);

// Check dynamic imports by intercepting them
const originalImport = window.import || ((url) => import(url));
window.import = function(url) {
    if (url.includes('template-library')) {
        console.log('Dynamic import detected for template-library:', url);
        console.trace('Import stack trace:');
    }
    return originalImport.call(this, url);
};

// Check fetch requests
const originalFetch = window.fetch;
window.fetch = function(url, ...args) {
    if (typeof url === 'string' && url.includes('template-library')) {
        console.log('Fetch request for template-library:', url);
        console.trace('Fetch stack trace:');
    }
    return originalFetch.call(this, url, ...args);
};

// Check XMLHttpRequest
const originalOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url, ...args) {
    if (typeof url === 'string' && url.includes('template-library')) {
        console.log('XHR request for template-library:', url);
        console.trace('XHR stack trace:');
    }
    return originalOpen.call(this, method, url, ...args);
};

console.log('\nMonitoring network requests for template-library...');
console.log('Try clicking the "Load Template" button or triggering template library loading.\n');