# CRITICAL FIX: APIService Not Available Error

## ROOT CAUSE
The error "APIService not available" occurs because:

1. `addComponent()` → `_trackChange()` → `autoSave()` → `save()` is called immediately
2. But `window.gmkbAPI` is only created during `initialize()` 
3. There's a race condition where components are added before initialization completes
4. The `save()` method checks for `window.gmkbAPI` and throws an error if it doesn't exist

## THE FIX

Add APIService import and initialize it in the store's state, not during `initialize()`.

### Step 1: Add Import (Line 6)

```javascript
import { APIService } from '../services/APIService.js';
```

Add this line after the other imports at the top of `src/stores/mediaKit.js`.

### Step 2: Add apiService to State (around line 30)

Find this section:
```javascript
    // CRITICAL: Pods data stored here, fetched ONCE on initialize
    podsData: {},
    
    // Meta state for error tracking and status
    isDirty: false,
```

Add `apiService: null,` right after `podsData: {},`:

```javascript
    // CRITICAL: Pods data stored here, fetched ONCE on initialize
    podsData: {},
    
    // CRITICAL FIX: API Service instance
    apiService: null,
    
    // Meta state for error tracking and status
    isDirty: false,
```

### Step 3: Initialize APIService Early in initialize() (around line 275)

Find this code in the `initialize()` action:
```javascript
      try {
        // P0 FIX #10: Removed eventBus.emit('store:initializing') - state flags are enough
        
        let data;
```

Replace with:
```javascript
      try {
        // CRITICAL FIX: Initialize APIService first if not already created
        if (!this.apiService) {
          this.apiService = new APIService(
            window.gmkbData?.restUrl,
            window.gmkbData?.restNonce,
            this.postId
          );
          
          // Make globally available for debugging
          window.gmkbAPI = this.apiService;
          
          if (window.gmkbData?.debugMode) {
            console.log('✅ APIService initialized in store');
          }
        }
        
        // P0 FIX #10: Removed eventBus.emit('store:initializing') - state flags are enough
        
        let data;
```

### Step 4: Fix the APIService Usage in initialize() (around line 335)

Find this code:
```javascript
        } else if (this.postId) {
          // ROOT FIX: Use APIService with REST URL (not AJAX URL)
          // Get APIService from window or create new instance
          const apiService = window.gmkbAPI || window.GMKB?.apiService || new (await import('../services/APIService.js')).APIService(
            window.gmkbData?.restUrl,     // ← Use REST URL
            window.gmkbData?.restNonce,   // ← Use REST nonce
            this.postId
          );

          // Load data via APIService (uses admin-ajax, not REST)
          data = await apiService.load();
```

Replace with:
```javascript
        } else if (this.postId) {
          // ROOT FIX: Use the APIService we already created
          // No need to create new instance - we have one in state
          
          // Load data via APIService
          data = await this.apiService.load();
```

### Step 5: Fix save() Method (around line 445)

Find this code in the `save()` action:
```javascript
        // OPTION C FIX: Use APIService which calls REST API v2
        const apiService = window.gmkbAPI || window.GMKB?.apiService;
        
        if (!apiService) {
          throw new Error('APIService not available');
        }
        
        const result = await apiService.save(state);
```

Replace with:
```javascript
        // CRITICAL FIX: Ensure APIService exists, create if needed
        if (!this.apiService) {
          console.warn('⚠️ APIService not available, creating new instance...');
          this.apiService = new APIService(
            window.gmkbData?.restUrl,
            window.gmkbData?.restNonce,
            this.postId
          );
          window.gmkbAPI = this.apiService;
        }
        
        // OPTION C FIX: Use APIService which calls REST API v2
        // Use our store's apiService instance
        const result = await this.apiService.save(state);
```

### Step 6: Add Guard to _performAutoSave (around line 1085)

Find this code:
```javascript
    // Actual auto-save implementation
    _performAutoSave: async function() {
      // ROOT FIX: Check if auto-save is enabled
      if (!this.autoSaveEnabled) {
        console.log('⏩ Auto-save disabled, skipping');
        return;
      }
      
      if (this.isDirty && !this.isSaving) {
```

Replace with:
```javascript
    // Actual auto-save implementation
    _performAutoSave: async function() {
      // CRITICAL FIX: Check if store is initialized before auto-saving
      if (!this.isInitialized) {
        if (window.gmkbData?.debugMode) {
          console.log('⏩ Auto-save skipped: Store not initialized yet');
        }
        return;
      }
      
      // ROOT FIX: Check if auto-save is enabled
      if (!this.autoSaveEnabled) {
        console.log('⏩ Auto-save disabled, skipping');
        return;
      }
      
      if (this.isDirty && !this.isSaving) {
```

### Step 7: Fix loadFromAPI() (around line 733)

Find:
```javascript
    async loadFromAPI() {
      if (!this.postId) return;
      
      try {
        const apiService = window.gmkbAPI || window.GMKB?.apiService || new (await import('../services/APIService.js')).APIService(
          window.gmkbData?.restUrl,
          window.gmkbData?.restNonce,
          this.postId
        );

        const data = await apiService.load();
```

Replace with:
```javascript
    async loadFromAPI() {
      if (!this.postId) return;
      
      try {
        // CRITICAL FIX: Use store's apiService instance
        if (!this.apiService) {
          this.apiService = new APIService(
            window.gmkbData?.restUrl,
            window.gmkbData?.restNonce,
            this.postId
          );
          window.gmkbAPI = this.apiService;
        }

        const data = await this.apiService.load();
```

### Step 8: Fix saveToAPI() (around line 760)

Find:
```javascript
    async saveToAPI() {
      if (!this.postId) return;
      
      try {
        this.isSaving = true;
        
        const state = {
          components: this.components,
          sections: this.sections,
          theme: this.theme,
          themeCustomizations: this.themeCustomizations,
          globalSettings: this.globalSettings
        };
        
        const apiService = window.gmkbAPI || window.GMKB?.apiService || new (await import('../services/APIService.js')).APIService(
          window.gmkbData?.restUrl,
          window.gmkbData?.restNonce,
          this.postId
        );

        const result = await apiService.save(state);
```

Replace with:
```javascript
    async saveToAPI() {
      if (!this.postId) return;
      
      try {
        this.isSaving = true;
        
        const state = {
          components: this.components,
          sections: this.sections,
          theme: this.theme,
          themeCustomizations: this.themeCustomizations,
          globalSettings: this.globalSettings
        };
        
        // CRITICAL FIX: Use store's apiService instance
        if (!this.apiService) {
          this.apiService = new APIService(
            window.gmkbData?.restUrl,
            window.gmkbData?.restNonce,
            this.postId
          );
          window.gmkbAPI = this.apiService;
        }

        const result = await this.apiService.save(state);
```

## CHECKLIST VERIFICATION

- [x] **No Polling**: Uses initialization flag check, not polling
- [x] **Event-Driven**: Proper initialization sequence
- [x] **Dependency-Awareness**: Checks `isInitialized` before operations
- [x] **No Global Object Sniffing**: Uses `this.apiService` from state
- [x] **Root Cause Fix**: Addresses missing APIService at initialization
- [x] **Simplicity First**: Simple guards, no complex logic
- [x] **Code Reduction**: Reuses single APIService instance
- [x] **Centralized State**: APIService stored in Pinia state
- [x] **Graceful Failure**: Guards prevent errors before ready
- [x] **Diagnostic Logging**: Clear console logs

## SUMMARY

The root cause was that `APIService` was only created during `initialize()`, but operations like `addComponent()` → `_trackChange()` → `autoSave()` → `save()` could be called before initialization completed.

The fix:
1. Store `apiService` instance in Pinia state
2. Create it early in `initialize()` before any async operations
3. Add guards in `_performAutoSave()` to check `isInitialized`
4. Remove all dynamic creation of APIService - use the one in state
5. Lazy-create APIService if somehow missing (defensive programming)

This follows the principle: **Ensure dependencies exist before allowing operations that need them**.
