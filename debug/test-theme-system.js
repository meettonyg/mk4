/**
 * Quick test for Theme Customizer functionality
 * Run in console to test the theme system
 */

console.group('🎨 Theme System Test');

// Test 1: Check if classes are loaded
console.log('1. ThemeManager class loaded:', typeof window.ThemeManager === 'function' ? '✅' : '❌');
console.log('2. ThemeCustomizer class loaded:', typeof window.ThemeCustomizer === 'function' ? '✅' : '❌');

// Test 2: Check if instances exist
console.log('3. themeManager instance:', window.themeManager ? '✅' : '❌');
console.log('4. themeCustomizer instance:', window.themeCustomizer ? '✅' : '❌');

// Test 3: Try to initialize if needed
if (!window.themeManager && window.ThemeManager) {
    window.themeManager = new window.ThemeManager();
    console.log('5. Created themeManager instance:', '✅');
} else {
    console.log('5. themeManager already exists or class not found');
}

if (!window.themeCustomizer && window.ThemeCustomizer) {
    window.themeCustomizer = new window.ThemeCustomizer();
    console.log('6. Created themeCustomizer instance:', '✅');
} else {
    console.log('6. themeCustomizer already exists or class not found');
}

// Test 4: Check current theme
if (window.themeManager) {
    const currentTheme = window.themeManager.getCurrentTheme();
    console.log('7. Current theme:', currentTheme ? currentTheme.theme_name : 'None');
    console.log('8. Available themes:', window.themeManager.getAvailableThemes().map(t => t.theme_name));
}

// Test 5: Find theme button
const themeButton = document.querySelector('[data-action="theme"], #global-theme-btn, .gmkb-toolbar__button[aria-label*="Theme"]');
console.log('9. Theme button found:', themeButton ? '✅' : '❌');

// Test 6: Try to open theme customizer
if (window.themeCustomizer && window.themeCustomizer.open) {
    console.log('10. Opening theme customizer...');
    window.themeCustomizer.open();
    console.log('    Theme customizer opened:', '✅');
} else {
    console.log('10. Cannot open theme customizer:', '❌');
}

console.groupEnd();

// Quick commands
console.log('\n💡 Quick Commands:');
console.log('- Open theme customizer: window.themeCustomizer.open()');
console.log('- Change theme: window.themeManager.applyTheme("modern_dark")');
console.log('- Debug theme system: debugThemeSystem()');
console.log('- Test theme button: document.querySelector(\'[data-action="theme"]\').click()');
