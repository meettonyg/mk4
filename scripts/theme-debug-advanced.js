// Theme debugging helper - run in console after page loads
(() => {
  console.log('===== THEME ID DEBUGGING =====');
  
  // Step 1: Check raw PHP data
  console.group('1. PHP Data (window.gmkbData.themes)');
  if (window.gmkbData?.themes) {
    window.gmkbData.themes.forEach((theme, i) => {
      console.log(`Theme ${i}:`, {
        id: theme.id,
        name: theme.name,
        fullTheme: theme
      });
    });
  } else {
    console.error('No themes in gmkbData');
  }
  console.groupEnd();
  
  // Step 2: Check Pinia store state
  console.group('2. Pinia Store (themeStore.availableThemes)');
  if (window.themeStore) {
    const themes = window.themeStore.availableThemes;
    if (Array.isArray(themes)) {
      themes.forEach((theme, i) => {
        // Try to access the raw value if it's a Proxy
        const rawTheme = theme;
        console.log(`Store Theme ${i}:`, {
          id: rawTheme.id,
          name: rawTheme.name,
          hasOwnPropertyId: Object.prototype.hasOwnProperty.call(rawTheme, 'id'),
          keys: Object.keys(rawTheme),
          isProxy: util.types.isProxy ? util.types.isProxy(rawTheme) : 'unknown'
        });
      });
    }
  } else {
    console.error('Theme store not initialized');
  }
  console.groupEnd();
  
  // Step 3: Try direct property access
  console.group('3. Direct Property Access Test');
  if (window.themeStore?.availableThemes?.[0]) {
    const firstTheme = window.themeStore.availableThemes[0];
    console.log('Direct access firstTheme.id:', firstTheme.id);
    console.log('Direct access firstTheme["id"]:', firstTheme["id"]);
    console.log('Object.getOwnPropertyDescriptor:', Object.getOwnPropertyDescriptor(firstTheme, 'id'));
    console.log('Object.getOwnPropertyNames:', Object.getOwnPropertyNames(firstTheme));
  }
  console.groupEnd();
  
  console.log('===== END DEBUGGING =====');
})();
