// Test script to verify theme data integrity
// Run this in the browser console after the page loads

console.log('=== THEME DEBUGGING ===');

// Check raw PHP data
console.group('1. Raw PHP data from window.gmkbData');
if (window.gmkbData && window.gmkbData.themes) {
    console.log('Number of themes:', window.gmkbData.themes.length);
    window.gmkbData.themes.forEach((theme, index) => {
        console.log(`Theme ${index}:`, {
            id: theme.id,
            name: theme.name,
            hasId: !!theme.id,
            idType: typeof theme.id
        });
    });
} else {
    console.error('No themes in gmkbData!');
}
console.groupEnd();

// Check Pinia store
console.group('2. Theme Store State');
if (window.themeStore) {
    console.log('Active theme ID:', window.themeStore.activeThemeId);
    console.log('Available themes:', window.themeStore.availableThemes.length);
    window.themeStore.availableThemes.forEach((theme, index) => {
        console.log(`Store Theme ${index}:`, {
            id: theme.id,
            name: theme.name,
            hasId: !!theme.id,
            idType: typeof theme.id
        });
    });
} else {
    console.error('Theme store not available!');
}
console.groupEnd();

// Check active theme comparison
console.group('3. Active Theme Check');
if (window.themeStore) {
    const activeId = window.themeStore.activeThemeId;
    window.themeStore.availableThemes.forEach((theme) => {
        console.log(`${theme.name}: "${activeId}" === "${theme.id}"`, activeId === theme.id);
    });
}
console.groupEnd();

console.log('=== END THEME DEBUGGING ===');
