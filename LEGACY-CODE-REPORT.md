# Legacy Code Detection Report

Generated: 2025-11-03 09:03:23

## Summary

Total Issues Found: 183

### By Severity

- HIGH: 22
- MEDIUM: 156
- LOW: 5

### By Category

- Hardcoded Component Map: 1
- Polling Pattern: 22
- Global Object Sniffing: 147
- Duplicate Logic: 5
- Deprecated Pattern: 8

---

## Findings

### HIGH Priority Issues

**[Polling Pattern]** \src\composables\useCleanup.js

- Line: 33
- Code: `* @param {number} id - Interval ID from setInterval`
- Reason: setInterval detected - should use event-driven approach

**[Polling Pattern]** \src\composables\useCleanup.js

- Line: 37
- Code: `const id = setInterval(callback, delay);`
- Reason: setInterval detected - should use event-driven approach

**[Polling Pattern]** \src\DEPRECATED\EventBus.js

- Line: 192
- Code: `timeoutId = setTimeout(() => {`
- Reason: Potential polling pattern - should use event-driven approach

**[Polling Pattern]** \src\main.js

- Line: 392
- Code: `setTimeout(() => {`
- Reason: Potential polling pattern - should use event-driven approach

**[Polling Pattern]** \src\main.js

- Line: 552
- Code: `setTimeout(initialize, 0);`
- Reason: Potential polling pattern - should use event-driven approach

**[Polling Pattern]** \src\services\Analytics.js

- Line: 233
- Code: `this.flushTimer = setInterval(() => {`
- Reason: setInterval detected - should use event-driven approach

**[Polling Pattern]** \src\services\PerformanceMonitor.js

- Line: 86
- Code: `setInterval(() => {`
- Reason: setInterval detected - should use event-driven approach

**[Polling Pattern]** \src\services\SystemReadiness.js

- Line: 130
- Code: `const timeoutId = setTimeout(() => {`
- Reason: Potential polling pattern - should use event-driven approach

**[Polling Pattern]** \src\services\SystemReadiness.js

- Line: 102
- Code: `const timeoutId = setTimeout(() => {`
- Reason: Potential polling pattern - should use event-driven approach

**[Polling Pattern]** \src\stores\mediaKit.js

- Line: 1682
- Code: `const retryTimeout = setTimeout(() => {`
- Reason: Potential polling pattern - should use event-driven approach

**[Polling Pattern]** \src\stores\mediaKit.js

- Line: 486
- Code: `setTimeout(() => {`
- Reason: Potential polling pattern - should use event-driven approach

**[Polling Pattern]** \src\utils\debounce.js

- Line: 43
- Code: `timeout = setTimeout(later, wait);`
- Reason: Potential polling pattern - should use event-driven approach

**[Polling Pattern]** \src\utils\optimized.js

- Line: 105
- Code: `timeout = setTimeout(timerExpired, wait);`
- Reason: Potential polling pattern - should use event-driven approach

**[Polling Pattern]** \src\utils\optimized.js

- Line: 110
- Code: `timeout = setTimeout(timerExpired, wait);`
- Reason: Potential polling pattern - should use event-driven approach

**[Polling Pattern]** \src\utils\optimized.js

- Line: 38
- Code: `timeout = setTimeout(timerExpired, wait);`
- Reason: Potential polling pattern - should use event-driven approach

**[Polling Pattern]** \src\utils\optimized.js

- Line: 67
- Code: `timeout = setTimeout(timerExpired, remainingWait(time));`
- Reason: Potential polling pattern - should use event-driven approach

**[Polling Pattern]** \src\utils\retry.js

- Line: 100
- Code: `await new Promise(resolve => setTimeout(resolve, waitTime));`
- Reason: Potential polling pattern - should use event-driven approach

**[Polling Pattern]** \src\utils\retry.js

- Line: 48
- Code: `await new Promise(resolve => setTimeout(resolve, waitTime));`
- Reason: Potential polling pattern - should use event-driven approach

**[Polling Pattern]** \src\utils\smartAutoSave.js

- Line: 251
- Code: `setTimeout(() => {`
- Reason: Potential polling pattern - should use event-driven approach

**[Polling Pattern]** \src\vue\components\ComponentRenderer.vue

- Line: 190
- Code: `const timeout = setTimeout(() => {`
- Reason: Potential polling pattern - should use event-driven approach

**[Polling Pattern]** \src\vue\components\DevicePreview.vue

- Line: 126
- Code: `setTimeout(initializeDevice, 100);`
- Reason: Potential polling pattern - should use event-driven approach

**[Polling Pattern]** \src\vue\components\ThemeCustomizer.vue

- Line: 245
- Code: `setTimeout(detectScrollableContent, 50);`
- Reason: Potential polling pattern - should use event-driven approach

### MEDIUM Priority Issues

**[Deprecated Pattern]** \src\composables\usePodsFieldUpdate.js

- Line: 63
- Code: `const endpoint = `${window.gmkbApiSettings.apiUrl}/pods/${postId}/field/${fieldName}`;`
- Reason: jQuery AJAX - use modern alternatives

**[Deprecated Pattern]** \src\services\ChunkedExportService.js

- Line: 433
- Code: `filename = `${postTitle}-export-${date}.json`;`
- Reason: jQuery AJAX - use modern alternatives

**[Deprecated Pattern]** \src\services\ExportService.js

- Line: 195
- Code: `const shortcode = `[guestify_media_kit id="${postId}"]`;`
- Reason: jQuery AJAX - use modern alternatives

**[Deprecated Pattern]** \src\services\StorageService.js

- Line: 364
- Code: `this.remove(`backup_${postId}`);`
- Reason: jQuery AJAX - use modern alternatives

**[Deprecated Pattern]** \src\services\StorageService.js

- Line: 378
- Code: `return this.remove(`backup_${postId}`);`
- Reason: jQuery AJAX - use modern alternatives

**[Deprecated Pattern]** \src\services\StorageService.js

- Line: 343
- Code: `return this.set(`backup_${postId}`, backup);`
- Reason: jQuery AJAX - use modern alternatives

**[Deprecated Pattern]** \src\services\StorageService.js

- Line: 354
- Code: `const backup = this.get(`backup_${postId}`);`
- Reason: jQuery AJAX - use modern alternatives

**[Deprecated Pattern]** \src\vue\components\MediaKitToolbarComplete.vue

- Line: 224
- Code: `return `${window.location.origin}/?mkcg_id=${postId}``
- Reason: jQuery AJAX - use modern alternatives

**[Global Object Sniffing]** \src\composables\useExportImport.js

- Line: 320
- Code: `if (window.gmkbData?.showNotifications) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\composables\useExportImport.js

- Line: 312
- Code: `if (window.gmkbData?.showNotifications) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\composables\useExportImport.js

- Line: 358
- Code: `if (window.gmkbData?.showNotifications) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\composables\useExportImport.js

- Line: 397
- Code: `if (window.gmkbData?.showNotifications) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\composables\useExportImport.js

- Line: 387
- Code: `if (window.gmkbData?.showNotifications) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\composables\useExportImport.js

- Line: 365
- Code: `if (window.gmkbData?.showNotifications) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\composables\useExportImport.js

- Line: 156
- Code: `if (window.gmkbData?.showNotifications) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\composables\useExportImport.js

- Line: 164
- Code: `if (window.gmkbData?.showNotifications) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\composables\useMediaQuery.js

- Line: 125
- Code: `if (window.screen?.orientation) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\composables\useMediaQuery.js

- Line: 131
- Code: `if (window.screen?.orientation) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\composables\usePodsFieldUpdate.js

- Line: 145
- Code: `if (window.gmkbDebug) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\composables\usePodsFieldUpdate.js

- Line: 137
- Code: `if (window.gmkbDebug) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\composables\usePodsFieldUpdate.js

- Line: 105
- Code: `if (window.gmkbDebug) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\composables\usePodsFieldUpdate.js

- Line: 157
- Code: `if (window.gmkbDebug) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\composables\usePodsFieldUpdate.js

- Line: 198
- Code: `if (window.gmkbDebug) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\composables\usePodsFieldUpdate.js

- Line: 185
- Code: `if (window.gmkbDebug) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\composables\usePodsFieldUpdate.js

- Line: 206
- Code: `if (window.gmkbDebug) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\composables\usePodsFieldUpdate.js

- Line: 65
- Code: `if (window.gmkbDebug) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\composables\usePodsFieldUpdate.js

- Line: 48
- Code: `if (window.gmkbDebug) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\composables\usePodsFieldUpdate.js

- Line: 119
- Code: `if (window.gmkbDebug) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\composables\usePodsFieldUpdate.js

- Line: 92
- Code: `if (window.gmkbDebug) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\composables\usePodsFieldUpdate.js

- Line: 81
- Code: `if (window.gmkbDebug) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\core\PodsDataIntegration.js

- Line: 41
- Code: `if (window.gmkbComponentRegistry) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\core\PodsDataIntegration.js

- Line: 33
- Code: `if (window.gmkbComponentConfigs && window.gmkbComponentConfigs[componentType]) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\DEPRECATED\EventBus.js

- Line: 222
- Code: `if (typeof window !== 'undefined' && (process.env.NODE_ENV === 'development' || window.gmkbData?.debugMode)) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\global-commands.js

- Line: 222
- Code: `if (window.stateManager || window.GMKB) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\main.js

- Line: 337
- Code: `if (window.gmkbData?.userId) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\main.js

- Line: 196
- Code: `if (window.gmkbData?.debugMode) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\main.js

- Line: 232
- Code: `if (typeof window.showToast === 'function') {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\main.js

- Line: 240
- Code: `if (window.gmkbData?.environment === 'production' && window.gmkbAnalytics) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\main.js

- Line: 315
- Code: `if (window.gmkbData?.debugMode) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\main.js

- Line: 537
- Code: `if (window.gmkbData?.environment === 'production') {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\main.js

- Line: 512
- Code: `if (window.GMKB) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\main.js

- Line: 415
- Code: `if (window.GMKB) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\main.js

- Line: 153
- Code: `if (window.gmkbData?.savedState) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\services\APIService.js

- Line: 536
- Code: `if (window.gmkbData?.debugMode) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\services\APIService.js

- Line: 573
- Code: `if (window.gmkbData?.debugMode) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\services\APIService.js

- Line: 147
- Code: `if (window.gmkbData.postId) return window.gmkbData.postId;`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\services\APIService.js

- Line: 192
- Code: `if (window.gmkbData?.debugMode) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\services\APIService.js

- Line: 274
- Code: `if (window.gmkbData?.debugMode) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\services\APIService.js

- Line: 46
- Code: `if (window.gmkbData?.debugMode) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\services\APIService.js

- Line: 148
- Code: `if (window.gmkbData.post_id) return window.gmkbData.post_id;`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\services\APIService.js

- Line: 113
- Code: `if (window.gmkbData?.debugMode) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\services\APIService.js

- Line: 134
- Code: `if (window.gmkbData?.debugMode) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\services\APIService.js

- Line: 146
- Code: `if (window.gmkbData) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\services\APIService.js

- Line: 447
- Code: `if (!options.silent && window.gmkbData?.debugMode) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\services\APIService.js

- Line: 380
- Code: `if (window.gmkbData?.debugMode) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\services\ComponentDeprecationManager.js

- Line: 49
- Code: `if (window.gmkbData?.debugMode) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\services\ComponentDeprecationManager.js

- Line: 35
- Code: `if (window.gmkbData?.debugMode) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\services\ComponentStyleService.js

- Line: 130
- Code: `if (window.gmkbData?.debugMode) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\services\ComponentStyleService.js

- Line: 240
- Code: `if (window.gmkbData?.debugMode) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\services\ComponentStyleService.js

- Line: 258
- Code: `if (window.gmkbData?.debugMode) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\services\ComponentStyleService.js

- Line: 793
- Code: `if (!window.GMKB) window.GMKB = {};`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\services\ComponentStyleService.js

- Line: 495
- Code: `if (window.gmkbData?.debugMode) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\services\ComponentStyleService.js

- Line: 794
- Code: `if (!window.GMKB.services) window.GMKB.services = {};`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\services\ComponentStyleService.js

- Line: 266
- Code: `if (window.gmkbData?.debugMode) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\services\ConsoleAPI.js

- Line: 23
- Code: `if (!window.GMKB) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\services\DataValidator.js

- Line: 77
- Code: `} else if (window.gmkbData?.debugMode) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\services\DataValidator.js

- Line: 72
- Code: `if (window.gmkbComponentRegistry) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\services\DataValidator.js

- Line: 46
- Code: `if (!window.gmkbData.restUrl.startsWith('http') && !window.gmkbData.restUrl.startsWith('/')) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\services\DataValidator.js

- Line: 18
- Code: `if (typeof window.gmkbData === 'undefined') {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\services\DataValidator.js

- Line: 41
- Code: `if (typeof window.gmkbData.postId !== 'number') {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\services\DataValidator.js

- Line: 73
- Code: `if (!window.gmkbComponentRegistry.has(component.type)) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\services\DOMHandlers.js

- Line: 46
- Code: `if (window.openComponentLibrary) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\services\DOMHandlers.js

- Line: 27
- Code: `if (window.openComponentLibrary) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\services\ImportExportService.js

- Line: 24
- Code: `if (window.GMKB) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\services\LazyLoader.js

- Line: 59
- Code: `if (window.gmkbComponentRegistry) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\services\NonceManager.js

- Line: 83
- Code: `if (window.gmkbData) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\services\PerformanceMonitor.js

- Line: 174
- Code: `if (!window.performance) return;`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\services\StorageService.js

- Line: 127
- Code: `if (window.gmkbData?.debugMode) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\services\StorageService.js

- Line: 74
- Code: `if (window.gmkbData?.debugMode) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\services\StorageService.js

- Line: 153
- Code: `if (window.gmkbData?.debugMode) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\services\SystemReadiness.js

- Line: 186
- Code: `if (typeof window !== 'undefined' && (process.env.NODE_ENV === 'development' || window.gmkbData?.debugMode)) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\services\ToastService.js

- Line: 382
- Code: `if (!window._originalAlert) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\services\UnifiedComponentRegistry.js

- Line: 267
- Code: `if (window.gmkbData?.debugMode) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\services\UnifiedComponentRegistry.js

- Line: 251
- Code: `if (window.gmkbData?.debugMode) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\services\UnifiedComponentRegistry.js

- Line: 277
- Code: `if (window.gmkbData?.debugMode) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\services\UnifiedComponentRegistry.js

- Line: 243
- Code: `if (window.gmkbData?.debugMode) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\stores\mediaKit.js

- Line: 1860
- Code: `if (window.gmkbData?.debugMode) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\stores\mediaKit.js

- Line: 1661
- Code: `if (window.gmkbData?.debugMode) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\stores\mediaKit.js

- Line: 944
- Code: `if (window.gmkbData?.debugMode) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\stores\mediaKit.js

- Line: 2497
- Code: `if (window.gmkbData?.debugMode) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\stores\mediaKit.js

- Line: 73
- Code: `if (window.gmkbData?.postId) return window.gmkbData.postId;`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\stores\mediaKit.js

- Line: 75
- Code: `if (window.gmkbData?.mkcg_id) return window.gmkbData.mkcg_id;`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\stores\mediaKit.js

- Line: 74
- Code: `if (window.gmkbData?.post_id) return window.gmkbData.post_id;`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\stores\mediaKit.js

- Line: 779
- Code: `if (window.stylePresets) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\stores\mediaKit.js

- Line: 803
- Code: `if (window.gmkbData?.debugMode) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\stores\mediaKit.js

- Line: 809
- Code: `if (!validation.valid && window.gmkbData?.debugMode) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\stores\mediaKit.js

- Line: 727
- Code: `if (window.GMKB?.services?.security) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\stores\mediaKit.js

- Line: 333
- Code: `if (window.gmkbData?.debugMode) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\stores\mediaKit.js

- Line: 358
- Code: `if (window.podsDataIntegration || window.gmkbPodsIntegration) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\stores\mediaKit.js

- Line: 441
- Code: `if (window.podsDataIntegration || window.gmkbPodsIntegration) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\stores\mediaKit.js

- Line: 814
- Code: `if (window.podsDataIntegration || window.gmkbPodsIntegration) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\stores\mediaKit.js

- Line: 937
- Code: `if (window.gmkbData?.debugMode) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\stores\mediaKit.js

- Line: 928
- Code: `if (window.gmkbData?.debugMode) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\stores\mediaKit.js

- Line: 876
- Code: `if (window.GMKB?.services?.security) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\stores\theme.js

- Line: 854
- Code: `if (window.gmkbData?.isDevelopment) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\stores\theme.js

- Line: 847
- Code: `if (window.gmkbData?.isDevelopment) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\stores\theme.js

- Line: 252
- Code: `if (window.gmkbData && window.gmkbData.themes && Array.isArray(window.gmkbData.themes)) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\stores\theme.js

- Line: 836
- Code: `if (window.gmkbData?.isDevelopment) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\stores\theme.js

- Line: 909
- Code: `if (window.gmkbData?.isDevelopment) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\stores\theme.js

- Line: 887
- Code: `if (window.gmkbData?.isDevelopment) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\stores\theme.js

- Line: 883
- Code: `if (window.gmkbData?.isDevelopment) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\stores\versions.js

- Line: 149
- Code: `if (window.gmkbData?.showNotifications) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\stores\versions.js

- Line: 90
- Code: `if (window.gmkbData?.postId) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\stores\versions.js

- Line: 79
- Code: `if (window.gmkbData?.postId) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\stores\versions.js

- Line: 364
- Code: `if (!window.gmkbData?.postId) return;`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\stores\versions.js

- Line: 390
- Code: `if (!window.gmkbData?.postId) return;`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\stores\versions.js

- Line: 278
- Code: `if (window.gmkbData?.postId) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\stores\versions.js

- Line: 333
- Code: `if (!window.gmkbData?.postId) return;`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\utils\logger.js

- Line: 10
- Code: `if (window.gmkbData?.debugMode) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\utils\test-suite.js

- Line: 86
- Code: `if (window.__VUE_DEVTOOLS_GLOBAL_HOOK__?.store) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\utils\test-suite.js

- Line: 103
- Code: `if (window.uiStore) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\utils\test-suite.js

- Line: 81
- Code: `if (window.mediaKitStore) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\vue\components\ComponentLibraryNew.vue

- Line: 348
- Code: `if (window.gmkbData?.debugMode) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\vue\components\ComponentLibraryNew.vue

- Line: 306
- Code: `if (window.confirm('This is a premium component. Would you like to upgrade to Pro?')) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\vue\components\DevicePreview.vue

- Line: 102
- Code: `if (window.devicePreviewObserver) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\vue\components\edit-forms\GenericEditForm.vue

- Line: 209
- Code: `if (window.wp && window.wp.media) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\vue\components\ErrorBoundary.vue

- Line: 97
- Code: `if (window.gmkbAnalytics?.track) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\vue\components\MediaKitApp.vue

- Line: 153
- Code: `if (podsFieldCount > 0 && window.gmkbData?.debugMode) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\vue\components\panels\SaveThemePanel.vue

- Line: 231
- Code: `if (window.showToast) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\vue\components\panels\SaveThemePanel.vue

- Line: 226
- Code: `if (window.showToast) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\vue\components\panels\SaveThemePanel.vue

- Line: 203
- Code: `if (window.showToast) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\vue\components\panels\SaveThemePanel.vue

- Line: 198
- Code: `if (window.showToast) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\vue\components\panels\ThemesPanel.vue

- Line: 155
- Code: `if (window.showToast) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\vue\components\panels\ThemesPanel.vue

- Line: 150
- Code: `if (window.showToast) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\vue\components\sections\Section.vue

- Line: 206
- Code: `if (window.showToast) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\vue\components\sidebar\editors\mixins\editorCommon.js

- Line: 93
- Code: `if (window.GMKB?.services?.componentStyle) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\vue\components\sidebar\editors\mixins\editorCommon.js

- Line: 63
- Code: `if (window.GMKB?.services?.componentStyle) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\vue\components\sidebar\editors\mixins\editorCommon.js

- Line: 112
- Code: `if (window.GMKB?.services?.componentStyle) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\vue\components\SidebarComponents.vue

- Line: 137
- Code: `if (window.showToast) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\vue\components\SidebarComponents.vue

- Line: 163
- Code: `} else if (window.openComponentLibrary) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\vue\components\ThemeCustomizer.vue

- Line: 218
- Code: `if (window.gmkbData?.debugMode) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\vue\components\ThemeCustomizer.vue

- Line: 294
- Code: `if (window.gmkbData?.debugMode) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\vue\components\ThemeCustomizer.vue

- Line: 282
- Code: `if (window.gmkbData?.debugMode) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\vue\components\ThemeCustomizer.vue

- Line: 266
- Code: `if (window.showToast) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\vue\components\ThemeSwitcher.vue

- Line: 148
- Code: `if (window.showToast) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\vue\components\ui\ComponentResetButton.vue

- Line: 62
- Code: `if (typeof window.showToast === 'function') {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\vue\components\ui\ComponentResetButton.vue

- Line: 67
- Code: `if (typeof window.showToast === 'function') {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\vue\components\ui\GlobalResetModal.vue

- Line: 65
- Code: `if (typeof window.showToast === 'function') {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\vue\components\ui\SectionResetButton.vue

- Line: 40
- Code: `if (success && typeof window.showToast === 'function') {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\vue\components\ui\SectionResetButton.vue

- Line: 66
- Code: `if (success && typeof window.showToast === 'function') {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\vue\composables\usePerformance.js

- Line: 43
- Code: `}\n\n/**\n * Lazy Loading Composable\n * Delay loading of heavy components until they're needed\n */\nexport function useLazyLoading(threshold = 0.1) {\n    const observer = ref(null);\n    const isVisible = ref(false);\n    const targetRef = ref(null);\n    \n    onMounted(() => {\n        if (window.IntersectionObserver && targetRef.value) {\n            observer.value = new IntersectionObserver(\n                ([entry]) => {\n                    if (entry.isIntersecting) {\n                        isVisible.value = true;\n                        // Stop observing once visible\n                        observer.value?.unobserve(targetRef.value);\n                    }\n                },\n                { threshold }\n            );\n            \n            observer.value.observe(targetRef.value);\n        } else {\n            // Fallback: immediately visible\n            isVisible.value = true;\n        }\n    });\n    \n    onUnmounted(() => {\n        if (observer.value && targetRef.value) {\n            observer.value.unobserve(targetRef.value);\n        }\n    });\n    \n    return {\n        targetRef,\n        isVisible\n    };\n}\n\n/**\n * Performance Monitoring Composable\n * Track component render times and performance metrics\n */\nexport function usePerformanceMonitoring(componentName) {\n    const renderStartTime = ref(0);\n    const renderTimes = ref([]);\n    const isMonitoring = ref(false);\n    \n    const startRender = () => {\n        if (!window.performance) return;\n        renderStartTime.value = performance.now();\n        isMonitoring.value = true;\n    };\n    \n    const endRender = () => {\n        if (!window.performance || !isMonitoring.value) return;\n        \n        const endTime = performance.now();\n        const renderTime = endTime - renderStartTime.value;\n        \n        renderTimes.value.push({\n            component: componentName,\n            time: renderTime,\n            timestamp: Date.now()\n        });\n        \n        // Keep only last 100 measurements\n        if (renderTimes.value.length > 100) {\n            renderTimes.value.shift();\n        }\n        \n        isMonitoring.value = false;\n        \n        // Warn about slow renders\n        if (renderTime > 16.67) { // > 1 frame at 60fps\n            console.warn(`âš ï¸ Slow render: ${componentName} took ${renderTime.toFixed(2)}ms`);\n        }\n    };\n    \n    const averageRenderTime = computed(() => {\n        if (renderTimes.value.length === 0) return 0;\n        const sum = renderTimes.value.reduce((acc, item) => acc + item.time, 0);\n        return sum / renderTimes.value.length;\n    });\n    \n    const getPerformanceReport = () => {\n        return {\n            component: componentName,\n            totalRenders: renderTimes.value.length,\n            averageTime: averageRenderTime.value,\n            slowRenders: renderTimes.value.filter(r => r.time > 16.67).length,\n            recentRenders: renderTimes.value.slice(-10)\n        };\n    };\n    \n    return {\n        startRender,\n        endRender,\n        averageRenderTime,\n        getPerformanceReport\n    };\n}\n\n/**\n * Debounced Reactive Composable\n * Debounce reactive updates to prevent excessive re-renders\n */\nexport function useDebouncedRef(initialValue, delay = 300) {\n    const immediate = ref(initialValue);\n    const debounced = ref(initialValue);\n    const timeoutId = ref(null);\n    \n    const updateDebounced = (newValue) => {\n        immediate.value = newValue;\n        \n        if (timeoutId.value) {\n            clearTimeout(timeoutId.value);\n        }\n        \n        timeoutId.value = setTimeout(() => {\n            debounced.value = newValue;\n        }, delay);\n    };\n    \n    onUnmounted(() => {\n        if (timeoutId.value) {\n            clearTimeout(timeoutId.value);\n        }\n    });\n    \n    return {\n        immediate,\n        debounced,\n        update: updateDebounced\n    };\n}\n\n/**\n * Component Cache Composable\n * Cache expensive component calculations\n */\nexport function useComponentCache(maxSize = 50) {\n    const cache = ref(new Map());\n    \n    const get = (key) => {\n        const item = cache.value.get(key);\n        if (item) {\n            // Move to end (LRU)\n            cache.value.delete(key);\n            cache.value.set(key, item);\n            return item;\n        }\n        return null;\n    };\n    \n    const set = (key, value) => {\n        // Remove oldest if at capacity\n        if (cache.value.size >= maxSize) {\n            const firstKey = cache.value.keys().next().value;\n            cache.value.delete(firstKey);\n        }\n        \n        cache.value.set(key, value);\n    };\n    \n    const clear = () => {\n        cache.value.clear();\n    };\n    \n    const has = (key) => {\n        return cache.value.has(key);\n    };\n    \n    return {\n        get,\n        set,\n        clear,\n        has,\n        size: computed(() => cache.value.size)\n    };\n}\n\n/**\n * Image Lazy Loading with Intersection Observer\n */\nexport function useImageLazyLoading() {\n    const imageRefs = ref([]);\n    const observer = ref(null);\n    \n    const addImage = (imgRef) => {\n        if (imgRef && !imageRefs.value.includes(imgRef)) {\n            imageRefs.value.push(imgRef);\n            observer.value?.observe(imgRef);\n        }\n    };\n    \n    const removeImage = (imgRef) => {\n        const index = imageRefs.value.indexOf(imgRef);\n        if (index > -1) {\n            imageRefs.value.splice(index, 1);\n            observer.value?.unobserve(imgRef);\n        }\n    };\n    \n    onMounted(() => {\n        if (window.IntersectionObserver) {\n            observer.value = new IntersectionObserver(\n                (entries) => {\n                    entries.forEach((entry) => {\n                        if (entry.isIntersecting) {\n                            const img = entry.target;\n                            const dataSrc = img.getAttribute('data-src');\n                            \n                            if (dataSrc) {\n                                img.src = dataSrc;\n                                img.removeAttribute('data-src');\n                                img.classList.remove('lazy');\n                                img.classList.add('loaded');\n                            }\n                            \n                            observer.value?.unobserve(img);\n                        }\n                    });\n                },\n                { threshold: 0.1 }\n            );\n        }\n    });\n    \n    onUnmounted(() => {\n        if (observer.value) {\n            imageRefs.value.forEach(img => observer.value?.unobserve(img));\n        }\n    });\n    \n    return {\n        addImage,\n        removeImage\n    };\n}\n\n/**\n * Bundle Size Analyzer\n * Development tool to analyze component bundle sizes\n */\nexport function analyzeBundleSize() {\n    if (process.env.NODE_ENV !== 'development') return;\n    \n    const componentSizes = new Map();\n    \n    const measureComponent = async (componentName, loadFunction) => {\n        const startTime = performance.now();\n        const startMemory = performance.memory?.usedJSHeapSize || 0;\n        \n        const component = await loadFunction();\n        \n        const endTime = performance.now();\n        const endMemory = performance.memory?.usedJSHeapSize || 0;\n        \n        const metrics = {\n            loadTime: endTime - startTime,\n            memoryDelta: endMemory - startMemory,\n            component\n        };\n        \n        componentSizes.set(componentName, metrics);\n        \n        console.log(`ðŸ“¦ ${componentName}: ${metrics.loadTime.toFixed(2)}ms load, ${(metrics.memoryDelta / 1024).toFixed(2)}KB memory`);\n        \n        return component;\n    };\n    \n    const getReport = () => {\n        const report = Array.from(componentSizes.entries()).map(([name, metrics]) => ({\n            name,\n            loadTime: metrics.loadTime,\n            memoryUsage: metrics.memoryDelta\n        }));\n        \n        report.sort((a, b) => b.loadTime - a.loadTime);\n        \n        console.table(report);\n        return report;\n    };\n    \n    return {\n        measureComponent,\n        getReport\n    };\n}\n\n/**\n * Global Performance Monitor\n * Singleton to track overall application performance\n */\nclass GlobalPerformanceMonitor {\n    constructor() {\n        this.metrics = {\n            componentRenders: [],\n            storeUpdates: [],\n            apiCalls: [],\n            memoryUsage: []\n        };\n        \n        this.isMonitoring = false;\n        this.intervalId = null;\n    }\n    \n    start() {\n        if (this.isMonitoring) return;\n        \n        this.isMonitoring = true;\n        console.log('ðŸš€ Performance monitoring started');\n        \n        // Memory monitoring\n        this.intervalId = setInterval(() => {\n            if (performance.memory) {\n                this.metrics.memoryUsage.push({\n                    timestamp: Date.now(),\n                    used: performance.memory.usedJSHeapSize,\n                    total: performance.memory.totalJSHeapSize,\n                    limit: performance.memory.jsHeapSizeLimit\n                });\n                \n                // Keep only last 100 measurements\n                if (this.metrics.memoryUsage.length > 100) {\n                    this.metrics.memoryUsage.shift();\n                }\n            }\n        }, 5000); // Every 5 seconds\n    }\n    \n    stop() {\n        this.isMonitoring = false;\n        if (this.intervalId) {\n            clearInterval(this.intervalId);\n        }\n        console.log('â¹ï¸ Performance monitoring stopped');\n    }\n    \n    recordRender(componentName, time) {\n        this.metrics.componentRenders.push({\n            component: componentName,\n            time,\n            timestamp: Date.now()\n        });\n        \n        // Keep only last 1000 renders\n        if (this.metrics.componentRenders.length > 1000) {\n            this.metrics.componentRenders.shift();\n        }\n    }\n    \n    recordStoreUpdate(action, time) {\n        this.metrics.storeUpdates.push({\n            action,\n            time,\n            timestamp: Date.now()\n        });\n        \n        if (this.metrics.storeUpdates.length > 500) {\n            this.metrics.storeUpdates.shift();\n        }\n    }\n    \n    recordApiCall(endpoint, time, success = true) {\n        this.metrics.apiCalls.push({\n            endpoint,\n            time,\n            success,\n            timestamp: Date.now()\n        });\n        \n        if (this.metrics.apiCalls.length > 200) {\n            this.metrics.apiCalls.shift();\n        }\n    }\n    \n    getReport() {\n        const now = Date.now();\n        const last5Minutes = now - (5 * 60 * 1000);\n        \n        const recentRenders = this.metrics.componentRenders.filter(r => r.timestamp > last5Minutes);\n        const recentUpdates = this.metrics.storeUpdates.filter(u => u.timestamp > last5Minutes);\n        const recentApiCalls = this.metrics.apiCalls.filter(a => a.timestamp > last5Minutes);\n        \n        const report = {\n            summary: {\n                totalRenders: this.metrics.componentRenders.length,\n                totalStoreUpdates: this.metrics.storeUpdates.length,\n                totalApiCalls: this.metrics.apiCalls.length,\n                currentMemory: performance.memory ? (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2) + 'MB' : 'N/A'\n            },\n            recent: {\n                renders: recentRenders.length,\n                storeUpdates: recentUpdates.length,\n                apiCalls: recentApiCalls.length,\n                averageRenderTime: recentRenders.length > 0 \n                    ? (recentRenders.reduce((sum, r) => sum + r.time, 0) / recentRenders.length).toFixed(2)\n                    : 0\n            },\n            slowComponents: recentRenders\n                .filter(r => r.time > 16.67)\n                .reduce((acc, r) => {\n                    acc[r.component] = (acc[r.component] || 0) + 1;\n                    return acc;\n                }, {}),\n            memoryTrend: this.metrics.memoryUsage.slice(-10)\n        };\n        \n        return report;\n    }\n    \n    logReport() {\n        const report = this.getReport();\n        console.group('ðŸ“Š Performance Report');\n        console.table(report.summary);\n        console.table(report.recent);\n        if (Object.keys(report.slowComponents).length > 0) {\n            console.warn('Slow components detected:', report.slowComponents);\n        }\n        console.groupEnd();\n    }\n}\n\n// Export singleton instance\nexport const performanceMonitor = new GlobalPerformanceMonitor();\n\n// Auto-start in development\nif (process.env.NODE_ENV === 'development') {\n    performanceMonitor.start();\n}\n\n// Expose to window for debugging\nif (typeof window !== 'undefined') {\n    window.gmkbPerformance = performanceMonitor;\n}\n\nexport default {\n    useVirtualScrolling,\n    useLazyLoading,\n    usePerformanceMonitoring,\n    useDebouncedRef,\n    useComponentCache,\n    useImageLazyLoading,\n    analyzeBundleSize,\n    performanceMonitor\n};`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\vue\services\componentDiscovery.js

- Line: 43
- Code: `if (window.gmkbData?.components) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\vue\services\componentDiscovery.js

- Line: 215
- Code: `if (window.gmkbData?.debugMode) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\vue\services\componentDiscovery.js

- Line: 222
- Code: `if (window.vueComponentDiscovery) {`
- Reason: Checking for global object existence - should use events or imports

**[Global Object Sniffing]** \src\vue\services\ComponentDiscoveryService.js

- Line: 28
- Code: `if (window.gmkbData?.debugMode) {`
- Reason: Checking for global object existence - should use events or imports

**[Hardcoded Component Map]** \src\vue\services\ComponentDiscoveryService.js

- Line: 0
- Code: `4 defineAsyncComponent calls`
- Reason: Multiple hardcoded components - consider using registry

### LOW Priority Issues

**[Duplicate Logic]** \src\vue\components\ARCHIVED\BuilderToolbar.vue

- Line: 203
- Code: `localStorage.setItem('gmkb-dark-mode', newValue ? 'true' : 'false')`
- Reason: Direct localStorage access - should use StorageService

**[Duplicate Logic]** \src\vue\components\ARCHIVED\BuilderToolbar.vue

- Line: 208
- Code: `const savedMode = localStorage.getItem('gmkb-dark-mode')`
- Reason: Direct localStorage access - should use StorageService

**[Duplicate Logic]** \src\vue\components\ThemeProvider.vue

- Line: 186
- Code: `styleEl = document.createElement('style');`
- Reason: Manual style injection - should use ComponentStyleService

**[Duplicate Logic]** \src\vue\components\ThemeProvider.vue

- Line: 172
- Code: `styleEl = document.createElement('style');`
- Reason: Manual style injection - should use ComponentStyleService

**[Duplicate Logic]** \src\vue\composables\useTheme.js

- Line: 163
- Code: `styleEl = document.createElement('style');`
- Reason: Manual style injection - should use ComponentStyleService
